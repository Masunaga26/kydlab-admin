import {useEffect,useMemo,useState} from "react";
import QRCode from "qrcode";
import {createBatch,discardItem,listBatches,listItems} from "./tapInstaService";
import {activationUrl,formatDateTime,nfcUrl} from "./tapInstaUtils";
import {downloadQr,exportXlsx} from "./tapInstaExport";
import "./tapinsta.css";

export default function TapInstaAdmin(){
  const [batches,setBatches]=useState([]),[items,setItems]=useState([]),[batchId,setBatchId]=useState("");
  const [quantity,setQuantity]=useState(10),[batchCode,setBatchCode]=useState(""),[search,setSearch]=useState("");
  const [current,setCurrent]=useState(0),[qr,setQr]=useState(""),[loading,setLoading]=useState(false),[message,setMessage]=useState("");
  const item=items[current]||null;
  const sum=useMemo(()=>({total:items.length,available:items.filter(i=>i.item_status==="available").length,active:items.filter(i=>i.item_status==="active").length,discarded:items.filter(i=>i.item_status==="discarded").length}),[items]);

  async function loadBatches(){try{setBatches(await listBatches())}catch(e){console.error(e);setMessage("Erro ao carregar lotes.")}}
  async function load(custom=search){setLoading(true);try{setItems(await listItems(batchId||null,custom));setCurrent(0)}catch(e){console.error(e);setMessage("Erro ao carregar unidades.")}finally{setLoading(false)}}
  useEffect(()=>{loadBatches()},[]);
  useEffect(()=>{load()},[batchId]);
  useEffect(()=>{if(!item){setQr("");return}QRCode.toDataURL(activationUrl(item.public_code),{width:320,margin:2}).then(setQr).catch(()=>setQr(""))},[item]);

  async function create(e){e.preventDefault();setLoading(true);setMessage("");try{const rows=await createBatch(quantity,batchCode);await loadBatches();setBatchCode("");setBatchId(rows[0]?.batch_id||"");setMessage(`Lote criado com ${rows.length} unidades.`)}catch(err){console.error(err);setMessage(`Erro ao criar lote: ${err?.message||"erro desconhecido"}`)}finally{setLoading(false)}}
  async function copy(){await navigator.clipboard.writeText(nfcUrl(item.public_code));setMessage("URL NFC copiada.")}
  async function discard(i){if(!confirm(`Descartar a unidade ${i.unit_number}?`))return;try{await discardItem(i.id);await load();await loadBatches();setMessage("Unidade descartada.")}catch(e){console.error(e);setMessage("Erro ao descartar unidade.")}}

  return <div className="ti-admin"><div className="ti-shell">
    <header className="ti-admin-header"><div><p className="ti-eyebrow">ADMIN KYD LAB</p><h1>TAP INSTA</h1><p>Geração de códigos, URLs, QR Codes e planilha de produção.</p></div><button className="ti-secondary" onClick={()=>location.href="/admin"}>Voltar ao Admin</button></header>

    <div className="ti-admin-grid">
      <section className="ti-panel"><h2>Criar lote</h2><form onSubmit={create}>
        <label>Nome do lote</label><input value={batchCode} onChange={e=>setBatchCode(e.target.value.toUpperCase().replace(/\s+/g,""))} placeholder="Automático"/>
        <label>Quantidade</label><input type="number" min="1" max="5000" value={quantity} onChange={e=>setQuantity(e.target.value)}/>
        <button className="ti-primary" disabled={loading}>{loading?"Gerando...":"Gerar lote"}</button></form></section>

      <section className="ti-panel"><h2>Consultar</h2>
        <label>Lote</label><select value={batchId} onChange={e=>setBatchId(e.target.value)}><option value="">Todos os lotes</option>{batches.map(b=><option key={b.id} value={b.id}>{b.batch_code} — {b.quantity}</option>)}</select>
        <label>Busca</label><div className="ti-search"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Código, Instagram, lote ou unidade"/><button className="ti-secondary" onClick={()=>load()}>Buscar</button></div>
        <button className="ti-secondary ti-full" disabled={!items.length} onClick={()=>exportXlsx(items,`${batches.find(b=>b.id===batchId)?.batch_code||"TAP_INSTA"}.xlsx`)}>Exportar XLSX</button></section>
    </div>

    <div className="ti-stats">{Object.entries(sum).map(([k,v])=><div key={k}><strong>{v}</strong><span>{{total:"Total",available:"Disponíveis",active:"Ativos",discarded:"Descartados"}[k]}</span></div>)}</div>

    {item&&<section className="ti-panel">
      <div className="ti-row"><div><p className="ti-eyebrow">MODO DE GRAVAÇÃO</p><h2>Unidade {current+1} de {items.length}</h2></div><strong className="ti-unit">{String(item.unit_number).padStart(3,"0")}</strong></div>
      <div className="ti-production"><div>
        <div className="ti-dark"><span>URL para gravar no NFC</span><code>{nfcUrl(item.public_code)}</code></div>
        <div className="ti-pair"><div><span>Código público</span><strong>{item.public_code}</strong></div><div><span>Código de ativação</span><strong>{item.activation_code}</strong></div></div>
        <div className="ti-row"><button className="ti-secondary" onClick={copy}>Copiar URL NFC</button><button className="ti-secondary" onClick={()=>downloadQr(item)}>Baixar QR da embalagem</button></div>
      </div><div className="ti-qr">{qr&&<img src={qr} alt="QR de ativação"/>}<span>{activationUrl(item.public_code)}</span></div></div>
      <div className="ti-row"><button className="ti-secondary" disabled={current===0} onClick={()=>setCurrent(Math.max(0,current-1))}>Anterior</button><button className="ti-primary" disabled={current>=items.length-1} onClick={()=>setCurrent(Math.min(items.length-1,current+1))}>Próxima unidade</button></div>
    </section>}

    <section className="ti-panel"><h2>Unidades</h2>{loading?<p>Carregando...</p>:<div className="ti-table-wrap"><table><thead><tr><th>Lote</th><th>Unidade</th><th>Público</th><th>Ativação</th><th>Status</th><th>Instagram</th><th>Editável até</th><th>Ações</th></tr></thead><tbody>{items.map((i,idx)=><tr key={i.id}><td>{i.batch_code}</td><td>{String(i.unit_number).padStart(3,"0")}</td><td>{i.public_code}</td><td>{i.activation_code}</td><td>{i.item_status}</td><td>{i.instagram_username||"-"}</td><td>{formatDateTime(i.editable_until)}</td><td><button onClick={()=>setCurrent(idx)}>Abrir</button>{i.item_status==="available"&&<button onClick={()=>discard(i)}>Descartar</button>}</td></tr>)}</tbody></table></div>}</section>
    {message&&<div className="ti-message">{message}</div>}
  </div></div>
}
