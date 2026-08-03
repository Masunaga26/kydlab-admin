import {useEffect,useMemo,useRef,useState} from "react";
import {jsPDF} from "jspdf";
import QRCode from "qrcode";
import {createWorker} from "tesseract.js";
import {createBatch,discardItem,findItemByActivation,listBatches,listItems} from "./tapInstaService";
import {activationUrl,formatDateTime,nfcUrl,normalizeActivationCode,validActivationCode} from "./tapInstaUtils";
import {downloadQr,exportProductionXls,exportXlsx,sortProductionItems} from "./tapInstaExport";
import "./tapinsta.css";

const A3_QUANTITY=609;
const A3_COLUMNS=21;
const A3_ROWS=29;
const A3_CELL_WIDTH=20;
const A3_CELL_HEIGHT=10;
const NFC_LOG_KEY="tapinsta_nfc_write_log_v1";

function pad(value){return String(value).padStart(2,"0");}
function createA3BatchCode(){
  const now=new Date();
  return ["INSTA-A3",`${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`,`${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`].join("-");
}

function downloadActivationA3(items,batchCode){
  const ordered=sortProductionItems(items);
  if(ordered.length!==A3_QUANTITY)throw new Error(`O lote precisa ter exatamente ${A3_QUANTITY} unidades para preencher a folha A3.`);

  const doc=new jsPDF({orientation:"landscape",unit:"mm",format:"a3",compress:true});
  const pageWidth=420,pageHeight=297;
  const marginX=(pageWidth-(A3_COLUMNS*A3_CELL_WIDTH))/2;
  const marginY=(pageHeight-(A3_ROWS*A3_CELL_HEIGHT))/2;

  doc.setDrawColor(0);doc.setTextColor(0);doc.setLineWidth(0.12);doc.setFont("helvetica","bold");doc.setFontSize(10);

  ordered.forEach((item,index)=>{
    const column=index%A3_COLUMNS;
    const row=Math.floor(index/A3_COLUMNS);
    const x=marginX+(column*A3_CELL_WIDTH);
    const y=marginY+(row*A3_CELL_HEIGHT);
    doc.rect(x,y,A3_CELL_WIDTH,A3_CELL_HEIGHT);
    doc.text(String(item.activation_code||""),x+(A3_CELL_WIDTH/2),y+(A3_CELL_HEIGHT/2)+1.4,{align:"center"});
  });

  doc.save(`TAP-INSTA-${batchCode}-ATIVACAO-A3.pdf`);
}

function loadNfcLogs(){
  try{return JSON.parse(localStorage.getItem(NFC_LOG_KEY)||"[]")}catch{return []}
}

function saveNfcLog(entry){
  const logs=loadNfcLogs();
  logs.unshift(entry);
  localStorage.setItem(NFC_LOG_KEY,JSON.stringify(logs.slice(0,5000)));
  return logs.slice(0,5000);
}

function decodeNdefRecord(record){
  try{
    if(record?.recordType==="url"&&record.data){
      return new TextDecoder(record.encoding||"utf-8").decode(record.data);
    }
    if(record?.recordType==="text"&&record.data){
      return new TextDecoder(record.encoding||"utf-8").decode(record.data);
    }
  }catch{}
  return "";
}

function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}

export default function TapInstaAdmin(){
  const [batches,setBatches]=useState([]),[items,setItems]=useState([]),[batchId,setBatchId]=useState("");
  const [quantity,setQuantity]=useState(10),[batchCode,setBatchCode]=useState(""),[search,setSearch]=useState("");
  const [current,setCurrent]=useState(0),[qr,setQr]=useState(""),[loading,setLoading]=useState(false),[generatingA3,setGeneratingA3]=useState(false),[message,setMessage]=useState("");

  const [activationInput,setActivationInput]=useState("");
  const [scannerItem,setScannerItem]=useState(null);
  const [scannerStatus,setScannerStatus]=useState("idle");
  const [scannerMessage,setScannerMessage]=useState("Leia ou digite o código de ativação.");
  const [cameraOpen,setCameraOpen]=useState(false);
  const [ocrBusy,setOcrBusy]=useState(false);
  const [nfcBusy,setNfcBusy]=useState(false);
  const [operator,setOperator]=useState(()=>localStorage.getItem("tapinsta_operator")||"Fábio");
  const [nfcLogs,setNfcLogs]=useState(()=>loadNfcLogs());

  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const streamRef=useRef(null);
  const workerRef=useRef(null);
  const ocrTimerRef=useRef(null);
  const lastReadsRef=useRef([]);

  const item=items[current]||null;
  const selectedBatch=batches.find(b=>b.id===batchId)||null;
  const sum=useMemo(()=>({total:items.length,available:items.filter(i=>i.item_status==="available").length,active:items.filter(i=>i.item_status==="active").length,discarded:items.filter(i=>i.item_status==="discarded").length}),[items]);
  const webNfcAvailable=typeof window!=="undefined"&&"NDEFReader" in window;
  const scannerUrl=scannerItem?nfcUrl(scannerItem.public_code):"";

  async function loadBatches(){try{setBatches(await listBatches())}catch(e){console.error(e);setMessage("Erro ao carregar lotes.")}}
  async function load(custom=search){setLoading(true);try{setItems(await listItems(batchId||null,custom));setCurrent(0)}catch(e){console.error(e);setMessage("Erro ao carregar unidades.")}finally{setLoading(false)}}

  useEffect(()=>{loadBatches()},[]);
  useEffect(()=>{load()},[batchId]);
  useEffect(()=>{if(!item){setQr("");return}QRCode.toDataURL(activationUrl(item.public_code),{width:320,margin:2}).then(setQr).catch(()=>setQr(""))},[item]);
  useEffect(()=>()=>stopCamera(),[]);

  async function create(e){
    e.preventDefault();setLoading(true);setMessage("");
    try{const rows=await createBatch(quantity,batchCode);await loadBatches();setBatchCode("");setBatchId(rows[0]?.batch_id||"");setMessage(`Lote criado com ${rows.length} unidades.`)}
    catch(err){console.error(err);setMessage(`Erro ao criar lote: ${err?.message||"erro desconhecido"}`)}
    finally{setLoading(false)}
  }

  async function createA3Production(){
    const automaticBatchCode=createA3BatchCode();
    const confirmed=confirm(`Gerar o lote ${automaticBatchCode} com ${A3_QUANTITY} códigos novos e baixar a folha A3?\n\nA folha terá ${A3_COLUMNS} colunas × ${A3_ROWS} linhas, com quadros de 20 × 10 mm.`);
    if(!confirmed)return;

    setGeneratingA3(true);setMessage("");
    try{
      const rows=await createBatch(A3_QUANTITY,automaticBatchCode);
      const ordered=sortProductionItems(rows);
      if(ordered.length!==A3_QUANTITY)throw new Error(`O sistema criou ${ordered.length} unidades, mas eram esperadas ${A3_QUANTITY}. O PDF não foi gerado.`);

      const newBatchId=ordered[0]?.batch_id||"";
      setItems(ordered);setCurrent(0);setSearch("");setBatchId(newBatchId);
      await loadBatches();
      downloadActivationA3(ordered,automaticBatchCode);
      setMessage(`Lote ${automaticBatchCode} criado com ${A3_QUANTITY} códigos e folha A3 baixada.`);
    }catch(err){console.error(err);setMessage(`Erro ao gerar produção A3: ${err?.message||"erro desconhecido"}`)}
    finally{setGeneratingA3(false)}
  }

  function downloadProductionSpreadsheet(){
    if(!batchId||!items.length){setMessage("Abra um lote para baixar o XLS de produção.");return;}
    const code=selectedBatch?.batch_code||items[0]?.batch_code||"TAP_INSTA";
    exportProductionXls(items,`${code}-PRODUCAO.xls`);
    setMessage(`XLS de produção do lote ${code} baixado.`);
  }

  async function copy(){await navigator.clipboard.writeText(nfcUrl(item.public_code));setMessage("URL NFC copiada.")}
  async function discard(i){if(!confirm(`Descartar a unidade ${i.unit_number}?`))return;try{await discardItem(i.id);await load();await loadBatches();setMessage("Unidade descartada.")}catch(e){console.error(e);setMessage("Erro ao descartar unidade.")}}

  async function resolveActivation(rawCode){
    const code=normalizeActivationCode(rawCode);
    setActivationInput(code);
    if(!validActivationCode(code)){
      setScannerItem(null);setScannerStatus("error");setScannerMessage("Use exatamente quatro letras válidas.");return null;
    }

    setScannerStatus("searching");setScannerMessage(`Buscando ${code}...`);
    try{
      const local=items.find(i=>normalizeActivationCode(i.activation_code)===code);
      const found=local||await findItemByActivation(code);
      if(!found)throw new Error("Código não encontrado.");
      if(found.item_status==="discarded")throw new Error("Esta unidade está descartada.");
      setScannerItem(found);setScannerStatus("ready");setScannerMessage("Código localizado. Aproxime o NFC para gravar.");
      stopCamera();
      return found;
    }catch(err){
      setScannerItem(null);setScannerStatus("error");setScannerMessage(err?.message||"Código não encontrado.");
      return null;
    }
  }

  async function useCurrentItem(){
    if(!item)return;
    setActivationInput(normalizeActivationCode(item.activation_code));
    setScannerItem(item);
    setScannerStatus("ready");
    setScannerMessage("Unidade atual carregada. Aproxime o NFC para gravar.");
    stopCamera();
  }

  async function startCamera(){
    if(!navigator.mediaDevices?.getUserMedia){
      setScannerStatus("error");setScannerMessage("A câmera não está disponível neste navegador.");return;
    }
    try{
      setCameraOpen(true);setScannerStatus("camera");setScannerMessage("Centralize as quatro letras dentro do quadro.");
      streamRef.current=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false});
      await wait(50);
      if(videoRef.current){
        videoRef.current.srcObject=streamRef.current;
        await videoRef.current.play();
      }
      if(!workerRef.current){
        setOcrBusy(true);
        const worker=await createWorker("eng");
        await worker.setParameters({
          tessedit_char_whitelist:"ABCDEFGHJKLMNPQRSTUVWXYZ",
          tessedit_pageseg_mode:"7"
        });
        workerRef.current=worker;
        setOcrBusy(false);
      }
      scheduleOcr();
    }catch(err){
      console.error(err);
      stopCamera();
      setScannerStatus("error");
      setScannerMessage("Não foi possível abrir a câmera. Autorize o acesso ou digite o código.");
    }
  }

  function stopCamera(){
    if(ocrTimerRef.current){clearTimeout(ocrTimerRef.current);ocrTimerRef.current=null}
    if(streamRef.current){streamRef.current.getTracks().forEach(track=>track.stop());streamRef.current=null}
    if(videoRef.current)videoRef.current.srcObject=null;
    setCameraOpen(false);
    setOcrBusy(false);
    lastReadsRef.current=[];
  }

  function scheduleOcr(){
    if(ocrTimerRef.current)clearTimeout(ocrTimerRef.current);
    ocrTimerRef.current=setTimeout(runOcrFrame,650);
  }

  async function runOcrFrame(){
    if(!streamRef.current||!videoRef.current||!canvasRef.current||!workerRef.current)return;
    const video=videoRef.current;
    if(video.readyState<2){scheduleOcr();return}

    const canvas=canvasRef.current;
    const vw=video.videoWidth||1280, vh=video.videoHeight||720;
    const cropW=Math.round(vw*.62), cropH=Math.round(vh*.28);
    const sx=Math.round((vw-cropW)/2), sy=Math.round((vh-cropH)/2);
    canvas.width=900;canvas.height=260;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    ctx.drawImage(video,sx,sy,cropW,cropH,0,0,canvas.width,canvas.height);

    try{
      setOcrBusy(true);
      const {data}=await workerRef.current.recognize(canvas);
      const code=normalizeActivationCode(data?.text||"");
      if(validActivationCode(code)){
        const reads=[...lastReadsRef.current,code].slice(-3);
        lastReadsRef.current=reads;
        setActivationInput(code);
        setScannerMessage(`Lendo: ${code}`);
        if(reads.length===3&&reads.every(v=>v===code)){
          await resolveActivation(code);
          return;
        }
      }else{
        lastReadsRef.current=[];
      }
    }catch(err){console.error(err)}
    finally{setOcrBusy(false)}
    if(streamRef.current)scheduleOcr();
  }

  function addLog(result,extra={}){
    const now=new Date().toISOString();
    const entry={
      id:crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,
      product:"tap_insta",
      activationCode:scannerItem?.activation_code||activationInput,
      publicCode:scannerItem?.public_code||"",
      expectedUrl:scannerUrl,
      readUrl:extra.readUrl||"",
      result,
      operator:operator.trim()||"Não informado",
      attempts:Number(extra.attempts||1),
      error:extra.error||"",
      createdAt:now,
      verifiedAt:result==="verified"?now:null
    };
    localStorage.setItem("tapinsta_operator",entry.operator);
    setNfcLogs(saveNfcLog(entry));
  }

  async function verifyWrittenUrl(expectedUrl,timeoutMs=15000){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const reader=new NDEFReader();
      await reader.scan({signal:controller.signal});
      return await new Promise((resolve,reject)=>{
        reader.onreading=event=>{
          const values=[...event.message.records].map(decodeNdefRecord).filter(Boolean);
          const found=values.find(v=>v===expectedUrl)||values[0]||"";
          clearTimeout(timer);
          controller.abort();
          found===expectedUrl?resolve(found):reject(new Error(`A tag retornou ${found||"um conteúdo não reconhecido"}.`));
        };
        reader.onreadingerror=()=>reject(new Error("A tag foi detectada, mas não pôde ser lida."));
      });
    }finally{clearTimeout(timer)}
  }

  async function writeNfc(){
    if(!scannerItem||!scannerUrl){setScannerStatus("error");setScannerMessage("Localize primeiro um código de ativação.");return}
    if(!webNfcAvailable){setScannerStatus("error");setScannerMessage("Web NFC não está disponível. Use Chrome no Android com NFC ativo.");return}
    if(nfcBusy)return;

    setNfcBusy(true);setScannerStatus("writing");setScannerMessage("Aproxime e mantenha a peça na área NFC do celular.");
    try{
      const writer=new NDEFReader();
      await writer.write({records:[{recordType:"url",data:scannerUrl}]});
      setScannerStatus("verifying");
      setScannerMessage("URL gravada. Mantenha a peça próxima para a conferência.");
      const readUrl=await verifyWrittenUrl(scannerUrl);
      addLog("verified",{readUrl});
      setScannerStatus("success");
      setScannerMessage("NFC gravado e conferido. Retire a peça e leia o próximo código.");
      if(navigator.vibrate)navigator.vibrate([120,70,180]);
      try{
        const audio=new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAP//");
        audio.play().catch(()=>{});
      }catch{}
    }catch(err){
      console.error(err);
      addLog("error",{error:err?.message||"Falha de gravação"});
      setScannerStatus("error");
      setScannerMessage(err?.name==="NotAllowedError"?"Permissão NFC negada. Toque novamente e autorize.":err?.message||"Não foi possível gravar ou verificar a tag.");
    }finally{setNfcBusy(false)}
  }

  function resetScanner(){
    setScannerItem(null);setActivationInput("");setScannerStatus("idle");setScannerMessage("Leia ou digite o código de ativação.");
  }

  function exportNfcLog(){
    if(!nfcLogs.length){setMessage("Ainda não há registros de gravação.");return}
    const headers=["data","operador","resultado","codigo_ativacao","codigo_publico","url_esperada","url_lida","tentativas","erro"];
    const esc=v=>`"${String(v??"").replace(/"/g,'""')}"`;
    const rows=nfcLogs.map(l=>[l.createdAt,l.operator,l.result,l.activationCode,l.publicCode,l.expectedUrl,l.readUrl,l.attempts,l.error].map(esc).join(";"));
    const blob=new Blob(["\ufeff"+[headers.join(";"),...rows].join("\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`TAP-INSTA-GRAVACOES-${new Date().toISOString().slice(0,10)}.csv`;a.click();
    URL.revokeObjectURL(url);
  }

  return <div className="ti-admin"><div className="ti-shell">
    <header className="ti-admin-header"><div><p className="ti-eyebrow">ADMIN KYD LAB</p><h1>TAP INSTA</h1><p>Geração de códigos, URLs, QR Codes e planilha de produção.</p></div><button className="ti-secondary" onClick={()=>location.href="/admin"}>Voltar ao Admin</button></header>

    <section className="ti-panel"><h2>Produção A3</h2><p>Cria automaticamente 609 códigos novos e baixa a folha A3 apenas com os códigos de ativação, em quadros de 20 × 10 mm.</p>
      <button className="ti-primary ti-full" disabled={generatingA3||loading} onClick={createA3Production}>{generatingA3?"Gerando 609 códigos...":"Gerar lote novo + baixar A3"}</button>
      <button className="ti-secondary ti-full" disabled={!batchId||!items.length||generatingA3} onClick={downloadProductionSpreadsheet}>Baixar XLS de Produção</button>
    </section>

    <section className={`ti-panel ti-nfc-panel ti-nfc-${scannerStatus}`}>
      <div className="ti-row ti-nfc-head">
        <div><p className="ti-eyebrow">GRAVADOR NFC</p><h2>TAP INSTA</h2><p>Leia as quatro letras, localize a URL e grave a peça.</p></div>
        <div className="ti-nfc-support"><strong>{webNfcAvailable?"NFC disponível":"NFC indisponível"}</strong><span>{webNfcAvailable?"Chrome Android detectado":"Abra no Chrome de um Android com NFC"}</span></div>
      </div>

      <div className="ti-operator"><label>Operador</label><input value={operator} onChange={e=>setOperator(e.target.value)} placeholder="Nome do operador"/></div>

      <div className="ti-scanner-grid">
        <div>
          <label>Código de ativação</label>
          <div className="ti-code-entry">
            <input className="ti-code" value={activationInput} maxLength={4} autoCapitalize="characters" onChange={e=>setActivationInput(normalizeActivationCode(e.target.value))} onKeyDown={e=>{if(e.key==="Enter")resolveActivation(activationInput)}} placeholder="ABCD"/>
            <button className="ti-primary" disabled={!validActivationCode(activationInput)||scannerStatus==="searching"} onClick={()=>resolveActivation(activationInput)}>Localizar</button>
          </div>
          <div className="ti-row ti-scanner-actions">
            <button className="ti-secondary" onClick={cameraOpen?stopCamera:startCamera}>{cameraOpen?"Fechar câmera":"Ler com a câmera"}</button>
            <button className="ti-secondary" disabled={!item} onClick={useCurrentItem}>Usar unidade atual</button>
          </div>

          {cameraOpen&&<div className="ti-camera">
            <video ref={videoRef} playsInline muted/>
            <div className="ti-camera-guide"><span>4 LETRAS</span></div>
            <canvas ref={canvasRef} hidden/>
            <small>{ocrBusy?"Analisando imagem...":"Mantenha o código centralizado e imóvel."}</small>
          </div>}
        </div>

        <div className="ti-nfc-card">
          <span className="ti-nfc-label">UNIDADE LOCALIZADA</span>
          {scannerItem?<><strong className="ti-nfc-code">{scannerItem.activation_code}</strong>
            <div className="ti-nfc-data"><span>Código público</span><b>{scannerItem.public_code}</b></div>
            <div className="ti-nfc-data"><span>URL NFC</span><code>{scannerUrl}</code></div>
          </>:<div className="ti-nfc-empty">Nenhuma unidade selecionada.</div>}
          <div className={`ti-nfc-status ti-status-${scannerStatus}`}>{scannerMessage}</div>
          <button className="ti-primary ti-write-button" disabled={!scannerItem||nfcBusy||!webNfcAvailable} onClick={writeNfc}>{nfcBusy?"Processando NFC...":"Gravar e verificar NFC"}</button>
          <button className="ti-link" disabled={nfcBusy} onClick={resetScanner}>Limpar e ler próxima peça</button>
        </div>
      </div>

      <div className="ti-nfc-history-head"><div><strong>Histórico local</strong><span>{nfcLogs.filter(l=>l.result==="verified").length} verificadas · {nfcLogs.filter(l=>l.result==="error").length} erros</span></div><button className="ti-secondary" onClick={exportNfcLog}>Exportar CSV</button></div>
      {nfcLogs.length>0&&<div className="ti-nfc-last"><span>Última operação</span><strong>{nfcLogs[0].activationCode} — {nfcLogs[0].result==="verified"?"VERIFICADA":"ERRO"}</strong><small>{formatDateTime(nfcLogs[0].createdAt)} · {nfcLogs[0].operator}</small></div>}
    </section>

    <div className="ti-admin-grid">
      <section className="ti-panel"><h2>Criar lote</h2><form onSubmit={create}>
        <label>Nome do lote</label><input value={batchCode} onChange={e=>setBatchCode(e.target.value.toUpperCase().replace(/\s+/g,""))} placeholder="Automático"/>
        <label>Quantidade</label><input type="number" min="1" max="5000" value={quantity} onChange={e=>setQuantity(e.target.value)}/>
        <button className="ti-primary" disabled={loading||generatingA3}>{loading?"Gerando...":"Gerar lote"}</button></form></section>

      <section className="ti-panel"><h2>Consultar</h2>
        <label>Lote</label><select value={batchId} onChange={e=>setBatchId(e.target.value)}><option value="">Todos os lotes</option>{batches.map(b=><option key={b.id} value={b.id}>{b.batch_code} — {b.quantity}</option>)}</select>
        <label>Busca</label><div className="ti-search"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Código, Instagram, lote ou unidade"/><button className="ti-secondary" onClick={()=>load()}>Buscar</button></div>
        <button className="ti-secondary ti-full" disabled={!items.length} onClick={()=>exportXlsx(items,`${selectedBatch?.batch_code||"TAP_INSTA"}.xlsx`)}>Exportar XLSX completo</button></section>
    </div>

    <div className="ti-stats">{Object.entries(sum).map(([k,v])=><div key={k}><strong>{v}</strong><span>{{total:"Total",available:"Disponíveis",active:"Ativos",discarded:"Descartados"}[k]}</span></div>)}</div>

    {item&&<section className="ti-panel"><div className="ti-row"><div><p className="ti-eyebrow">MODO DE GRAVAÇÃO MANUAL</p><h2>Unidade {current+1} de {items.length}</h2></div><strong className="ti-unit">{String(item.unit_number).padStart(3,"0")}</strong></div>
      <div className="ti-production"><div><div className="ti-dark"><span>URL para gravar no NFC</span><code>{nfcUrl(item.public_code)}</code></div><div className="ti-pair"><div><span>Código público</span><strong>{item.public_code}</strong></div><div><span>Código de ativação</span><strong>{item.activation_code}</strong></div></div><div className="ti-row"><button className="ti-secondary" onClick={copy}>Copiar URL NFC</button><button className="ti-secondary" onClick={()=>downloadQr(item)}>Baixar QR da embalagem</button></div></div><div className="ti-qr">{qr&&<img src={qr} alt="QR de ativação"/>}<span>{activationUrl(item.public_code)}</span></div></div>
      <div className="ti-row"><button className="ti-secondary" disabled={current===0} onClick={()=>setCurrent(Math.max(0,current-1))}>Anterior</button><button className="ti-primary" disabled={current>=items.length-1} onClick={()=>setCurrent(Math.min(items.length-1,current+1))}>Próxima unidade</button></div></section>}

    <section className="ti-panel"><h2>Unidades</h2>{loading?<p>Carregando...</p>:<div className="ti-table-wrap"><table><thead><tr><th>Lote</th><th>Unidade</th><th>Público</th><th>Ativação</th><th>Status</th><th>Instagram</th><th>Editável até</th><th>Ações</th></tr></thead><tbody>{items.map((i,idx)=><tr key={i.id}><td>{i.batch_code}</td><td>{String(i.unit_number).padStart(3,"0")}</td><td>{i.public_code}</td><td>{i.activation_code}</td><td>{i.item_status}</td><td>{i.instagram_username||"-"}</td><td>{formatDateTime(i.editable_until)}</td><td><button onClick={()=>setCurrent(idx)}>Abrir</button>{i.item_status==="available"&&<button onClick={()=>discard(i)}>Descartar</button>}</td></tr>)}</tbody></table></div>}</section>
    {message&&<div className="ti-message">{message}</div>}
  </div></div>
}