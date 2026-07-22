import {useMemo,useState} from "react";
import {useParams} from "react-router-dom";
import {activate,validateActivation} from "./tapInstaService";
import {formatDateTime,instagramUrl,normalizeActivationCode,normalizeInstagramUsername,validActivationCode,validInstagram} from "./tapInstaUtils";
import "./tapinsta.css";

export default function TapInstaAtivacao(){
  const {publicCode}=useParams();
  const [step,setStep]=useState("code"),[activationCode,setActivationCode]=useState(""),[instagramInput,setInstagramInput]=useState("");
  const [record,setRecord]=useState(null),[saved,setSaved]=useState(null),[loading,setLoading]=useState(false),[message,setMessage]=useState("");
  const username=useMemo(()=>normalizeInstagramUsername(instagramInput),[instagramInput]);

  async function validate(e){
    e.preventDefault();setMessage("");
    if(!validActivationCode(activationCode)){setMessage("Digite corretamente as quatro letras do código.");return;}
    setLoading(true);
    try{
      const r=await validateActivation(publicCode,activationCode);
      if(!r){setMessage("Código inválido ou temporariamente indisponível.");return;}
      if(r.locked_until){setMessage(`Muitas tentativas. Tente novamente após ${formatDateTime(r.locked_until)}.`);return;}
      if(!r.can_edit){setRecord(r);setStep("closed");return;}
      setRecord(r);setInstagramInput(r.instagram_username||"");setStep("instagram");
    }catch(err){console.error(err);setMessage("Não foi possível validar o código agora.");}
    finally{setLoading(false);}
  }

  function preview(e){e.preventDefault();setMessage("");if(!validInstagram(username)){setMessage("Digite um @ ou link válido do Instagram.");return;}setStep("preview");}
  const openInstagram=()=>window.open(instagramUrl(username),"_blank","noopener,noreferrer");

  async function confirm(){
    setLoading(true);setMessage("");
    try{const r=await activate({publicCode,activationCode,instagramUsername:username});setSaved(r);setStep("success");}
    catch(err){console.error(err);const t=String(err?.message||"");if(t.includes("EDIT_WINDOW_CLOSED"))setStep("closed");else if(t.includes("ACTIVATION_TEMPORARILY_LOCKED"))setMessage("Muitas tentativas. Aguarde 15 minutos.");else setMessage("Não foi possível ativar o TAP INSTA.");}
    finally{setLoading(false);}
  }

  return <main className="ti-page"><section className="ti-card">
    <div className="ti-logo" aria-hidden="true"><span/></div>
    <p className="ti-eyebrow">TAP INSTA</p><h1>Seu Instagram em uma aproximação.</h1>

    {step==="code"&&<form onSubmit={validate}><p>Digite o código de ativação que está dentro da embalagem.</p>
      <label>Código de ativação</label><input className="ti-code" value={activationCode} onChange={e=>setActivationCode(normalizeActivationCode(e.target.value))} maxLength={4} placeholder="ABXP" autoFocus/>
      <button className="ti-primary" disabled={loading}>{loading?"Verificando...":"Continuar"}</button></form>}

    {step==="instagram"&&<form onSubmit={preview}><p>Digite seu @ ou cole o link do seu Instagram.</p>
      {record?.item_status==="active"&&record?.editable_until&&<div className="ti-notice">Você pode corrigir este perfil até <strong>{formatDateTime(record.editable_until)}</strong>.</div>}
      <label>Instagram</label><input value={instagramInput} onChange={e=>setInstagramInput(e.target.value)} placeholder="@seuinstagram" autoFocus/>
      <button className="ti-primary">Ver preview</button></form>}

    {step==="preview"&&<div><p>Confira com atenção. Depois de ativar, você terá 3 dias para corrigir. Após esse prazo, o cadastro será definitivo.</p>
      <div className="ti-preview"><span>Seu TAP INSTA abrirá:</span><strong>@{username}</strong></div>
      <button className="ti-secondary" onClick={openInstagram}>Abrir e conferir perfil</button>
      <button className="ti-primary" onClick={confirm} disabled={loading}>{loading?"Salvando...":record?.item_status==="active"?"Salvar correção":"Ativar TAP INSTA"}</button>
      <button className="ti-link" onClick={()=>setStep("instagram")}>Corrigir</button></div>}

    {step==="success"&&<div><h2>TAP INSTA ativado!</h2><p>Agora teste com outro celular e, depois, cole somente na parte externa da capinha.</p>
      {saved?.editable_until&&<div className="ti-notice">Você poderá corrigir este Instagram até <strong>{formatDateTime(saved.editable_until)}</strong>.</div>}
      <button className="ti-primary" onClick={openInstagram}>Abrir meu Instagram</button></div>}

    {step==="closed"&&<div><h2>Cadastro definitivo</h2><p>O período de correção terminou. Este Instagram não pode mais ser alterado.</p>
      {record?.instagram_username&&<button className="ti-primary" onClick={()=>window.open(instagramUrl(record.instagram_username),"_blank","noopener,noreferrer")}>Abrir Instagram</button>}</div>}

    {message&&<p className="ti-error">{message}</p>}<p className="ti-footer">Ative e teste antes de colar.</p>
  </section></main>;
}
