import { useEffect, useMemo, useState } from "react";
import { Palette } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ProEmpresaPagina, { buildCompanyStrategy } from "./ProEmpresaPagina";
import {
  ativarTesteProfissionalEmpresaPro,
  atualizarAberturaEmpresaPro,
  atualizarEmpresaPro,
  codigoAdminProValido,
  getCompanyDashboardPro,
  limparCodigoPro,
  obterAcessoAdminPro,
  salvarAcessoAdminPro,
  uploadImagemPro,
} from "../../lib/tappro";

const GOALS = [
  ["auto","Automático"],["whatsapp","Gerar contatos"],["instagram","Ganhar seguidores"],
  ["google_review","Receber avaliações"],["maps","Levar clientes ao local"],["information","Divulgar informações"],
];

const THEMES = [
  ["classic","Clássica","Elegante, sólida e tradicional.","linear-gradient(135deg,#201d18,#8a641f)"],
  ["modern","Moderna","Atual, limpa e equilibrada.","linear-gradient(135deg,#111827,#64748b)"],
  ["futuristic","Futurista","Tecnológica, marcante e ousada.","linear-gradient(135deg,#09090b,#6d28d9)"],
  ["minimalist","Minimalista","Leve, clara e focada no essencial.","linear-gradient(135deg,#f8fafc,#cbd5e1)"],
];

const initial = {
  display_name:"",description:"",logo_url:"",primary_goal:"auto",page_template:"modern",
  opening_mode:"page",direct_target_title:"",direct_target_url:"",
  whatsapp:"",whatsapp_message:"",show_whatsapp:true,
  phone:"",show_phone:false,instagram:"",show_instagram:false,
  google_review_url:"",show_google_review:false,pix_key:"",show_pix:false,
  wifi_ssid:"",wifi_password:"",show_wifi:false,
  business_hours:"",show_business_hours:false,
  address_postal_code:"",address_street:"",address_number:"",
  address_complement:"",address_neighborhood:"",address_city:"",
  address_state:"",maps_url:"",show_maps:false,
  show_save_contact:true,show_share_page:true,
};

const input={width:"100%",minHeight:48,padding:"12px 13px",borderRadius:12,border:"1px solid #d1d5db",boxSizing:"border-box",fontSize:15};
const card={marginTop:18,padding:22,borderRadius:22,background:"#fff",border:"1px solid #e5e7eb",boxShadow:"0 12px 30px rgba(0,0,0,.06)"};
function digits(v){return String(v||"").replace(/\D/g,"");}


function StylePreview({ type, selected }) {
  const palettes = {
    classic: {
      frame: "#fffaf0",
      hero: "linear-gradient(135deg,#241f19,#8a641f)",
      accent: "#a57424",
      line: "#e7dcc8",
      text: "#241f19",
    },
    modern: {
      frame: "#ffffff",
      hero: "linear-gradient(135deg,#111827,#475569)",
      accent: "#2563eb",
      line: "#e2e8f0",
      text: "#0f172a",
    },
    futuristic: {
      frame: "#111116",
      hero: "linear-gradient(135deg,#09090b,#312e81 55%,#6d28d9)",
      accent: "#8b5cf6",
      line: "#2b2b35",
      text: "#f8fafc",
    },
    minimalist: {
      frame: "#ffffff",
      hero: "#ffffff",
      accent: "#111827",
      line: "#e5e7eb",
      text: "#111827",
    },
  };

  const p = palettes[type] || palettes.modern;

  const shell = {
    width: "100%",
    height: 148,
    padding: 10,
    borderRadius: 15,
    background: p.frame,
    border: `1px solid ${selected ? p.accent : p.line}`,
    boxSizing: "border-box",
    overflow: "hidden",
  };

  if (type === "classic") {
    return (
      <div style={shell}>
        <div style={{ height: 47, borderRadius: 11, background: p.hero }} />
        <div style={{ width: 40, height: 40, margin: "-18px auto 8px", borderRadius: 12, background: "#ffffff", border: `1px solid ${p.line}` }} />
        <div style={{ width: "56%", height: 7, margin: "0 auto 8px", borderRadius: 999, background: p.text, opacity: .9 }} />
        <div style={{ width: "82%", height: 20, margin: "0 auto 7px", borderRadius: 8, background: p.accent, opacity: .9 }} />
        <div style={{ display: "grid", gap: 5 }}>
          <div style={{ height: 12, borderRadius: 6, border: `1px solid ${p.line}`, background: "#ffffff" }} />
          <div style={{ height: 12, borderRadius: 6, border: `1px solid ${p.line}`, background: "#ffffff" }} />
        </div>
      </div>
    );
  }

  if (type === "futuristic") {
    return (
      <div style={shell}>
        <div style={{ height: 52, borderRadius: 11, background: p.hero, boxShadow: "0 0 20px rgba(139,92,246,.25)" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 6, marginTop: 7 }}>
          <div style={{ height: 39, borderRadius: 9, background: "linear-gradient(135deg,#312e81,#6d28d9)" }} />
          <div style={{ height: 39, borderRadius: 9, border: `1px solid ${p.line}`, background: "#18181f" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 6, marginTop: 6 }}>
          <div style={{ height: 30, borderRadius: 9, border: `1px solid ${p.line}`, background: "#18181f" }} />
          <div style={{ height: 30, borderRadius: 9, border: `1px solid ${p.line}`, background: "#18181f" }} />
        </div>
      </div>
    );
  }

  if (type === "minimalist") {
    return (
      <div style={shell}>
        <div style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${p.line}` }} />
        <div style={{ width: "58%", height: 8, marginTop: 10, borderRadius: 999, background: p.text }} />
        <div style={{ width: "86%", height: 5, marginTop: 7, borderRadius: 999, background: p.line }} />
        <div style={{ width: "72%", height: 5, marginTop: 5, borderRadius: 999, background: p.line }} />
        <div style={{ height: 28, marginTop: 12, borderRadius: 0, borderTop: `1px solid ${p.line}`, borderBottom: `1px solid ${p.line}` }} />
        <div style={{ height: 28, borderBottom: `1px solid ${p.line}` }} />
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={{ height: 49, borderRadius: 11, background: p.hero }} />
      <div style={{ height: 31, marginTop: 7, borderRadius: 10, background: p.accent }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 7 }}>
        <div style={{ height: 33, borderRadius: 9, border: `1px solid ${p.line}`, background: "#f8fafc" }} />
        <div style={{ height: 33, borderRadius: 9, border: `1px solid ${p.line}`, background: "#f8fafc" }} />
      </div>
    </div>
  );
}

export default function ProEmpresaPainel(){
  const {accessCode}=useParams();
  const navigate=useNavigate();
  const cleanCode=limparCodigoPro(accessCode);

  const [loading,setLoading]=useState(true);
  const [dados,setDados]=useState(null);
  const [form,setForm]=useState(initial);
  const [top3,setTop3]=useState([]);
  const [logoFile,setLogoFile]=useState(null);
  const [logoPreview,setLogoPreview]=useState("");
  const [erro,setErro]=useState("");
  const [sucesso,setSucesso]=useState("");
  const [salvando,setSalvando]=useState(false);
  const [ativandoTeste,setAtivandoTeste]=useState(false);
  const [previewMode,setPreviewMode]=useState(false);
  const [savedSnapshot,setSavedSnapshot]=useState("");

  useEffect(()=>{(async()=>{
    if(!codigoAdminProValido(cleanCode)){setErro("Código administrativo inválido.");setLoading(false);return;}
    const {data,error}=await getCompanyDashboardPro(cleanCode);
    if(error||!data?.found){setErro("Painel da empresa não encontrado.");setLoading(false);return;}
    if(obterAcessoAdminPro()!==cleanCode) salvarAcessoAdminPro(cleanCode);
    setDados(data);
    const next={...initial};
    Object.keys(next).forEach(key=>{if(data[key]!==undefined&&data[key]!==null) next[key]=data[key];});
    const loadedTop3=(data.top3||[])
      .sort((a,b)=>a.featured_position-b.featured_position)
      .map(item=>item.module_code);

    setForm(next);
    setLogoPreview(data.logo_url||"");
    setTop3(loadedTop3);
    setSavedSnapshot(JSON.stringify({
      form:next,
      top3:loadedTop3,
      logoPending:false,
    }));
    setLoading(false);
  })()},[cleanCode]);

  const strategyText=useMemo(()=>{
    const map={
      auto:"O TAP PRO usa a melhor ação disponível.",
      whatsapp:"A página conduz o visitante para o WhatsApp.",
      instagram:"A página conduz o visitante para o Instagram.",
      google_review:"A página conduz o visitante para avaliar no Google.",
      maps:"A página conduz o visitante para abrir a rota.",
      information:"A página apresenta contatos e informações de forma equilibrada.",
    };
    return map[form.primary_goal]||map.auto;
  },[form.primary_goal]);

  const currentSnapshot=useMemo(()=>JSON.stringify({
    form,
    top3,
    logoPending:Boolean(logoFile),
  }),[form,top3,logoFile]);

  const hasChanges=Boolean(savedSnapshot&&currentSnapshot!==savedSnapshot);

  const subscriptionStatus=String(
    dados?.subscription_status||""
  ).trim().toLowerCase();

  const graceEndsAt=
    dados?.current_period_ends_at||
    null;

  const isPastDue=
    subscriptionStatus==="past_due";

  const isPastDueWithinGrace=
    isPastDue &&
    Boolean(
      graceEndsAt &&
      new Date(graceEndsAt)>new Date()
    );

  const professionalEnabled=Boolean(
    dados?.professional_enabled||
    isPastDueWithinGrace
  );

  const isTrial=
    subscriptionStatus==="trial";

  const trialDaysRemaining=
    dados?.trial_days_remaining;

  const graceDaysRemaining=
    isPastDueWithinGrace
      ? Math.max(
          0,
          Math.ceil(
            (
              new Date(graceEndsAt).getTime()-
              Date.now()
            )/
            86400000
          )
        )
      : null;

  useEffect(()=>{
    function warnBeforeUnload(event){
      if(!hasChanges)return;
      event.preventDefault();
      event.returnValue="";
    }

    window.addEventListener("beforeunload",warnBeforeUnload);
    return()=>window.removeEventListener("beforeunload",warnBeforeUnload);
  },[hasChanges]);

  function change(e){
    const{name,value,type,checked}=e.target;

    setForm(current=>({
      ...current,
      [name]:type==="checkbox"?checked:value
    }));

    const highlightByToggle={
      show_whatsapp:"whatsapp",
      show_instagram:"instagram",
      show_google_review:"google_review",
      show_maps:"maps",
      show_phone:"phone",
      show_wifi:"wifi",
      show_pix:"pix",
      show_business_hours:"business_hours",
    };

    const moduleCode=highlightByToggle[name];

    if(type==="checkbox"&&!checked&&moduleCode){
      setTop3(current=>current.filter(item=>item!==moduleCode));
    }
  }
  function toggle(code){setTop3(current=>current.includes(code)?current.filter(item=>item!==code):current.length>=3?current:[...current,code]);}
  function logo(e){const file=e.target.files?.[0];if(!file)return;setLogoFile(file);setLogoPreview(URL.createObjectURL(file));}

  function validarFormulario(){
    if(!form.display_name.trim()) return "Informe o nome da empresa.";
    if(digits(form.whatsapp).length<10) return "Informe um WhatsApp válido.";
    if(
      professionalEnabled &&
      form.opening_mode==="direct" &&
      !String(form.direct_target_url||"").trim()
    ) return "Informe o link do destino direto.";
    return "";
  }

  function montarEnderecoAtual(){
    return [
      form.address_street,
      form.address_number,
      form.address_neighborhood,
      form.address_city,
      form.address_state,
      form.address_postal_code,
    ].map(item=>String(item||"").trim()).filter(Boolean).join(", ");
  }

  function montarMapsPreview(){
    const manual=String(form.maps_url||"").trim();
    if(manual) return manual;
    const address=montarEnderecoAtual();
    if(!address) return "";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  function montarDadosPreview(){
    const baseUrl=window.location.origin.replace(/\/+$/,"");
    const previewData={
      ...dados,
      ...form,
      logo_url:logoPreview||form.logo_url||"",
      whatsapp:digits(form.whatsapp),
      phone:digits(form.phone),
      business_address:montarEnderecoAtual(),
      maps_url:montarMapsPreview(),
      top3:top3.map((module_code,index)=>({
        module_code,
        featured_position:index+1,
      })),
      public_url:`${baseUrl}/pro/empresa/${dados.piece_code}`,
    };

    return {
      ...previewData,
      strategy:buildCompanyStrategy(previewData),
    };
  }

  async function persistir({publicar=false}={}){
    const validation=validarFormulario();

    if(validation){
      setErro(validation);
      setPreviewMode(false);
      window.scrollTo({top:0,behavior:"smooth"});
      return false;
    }

    setErro("");
    setSucesso("");
    setSalvando(true);

    let logoUrl=form.logo_url;

    if(logoFile){
      const result=await uploadImagemPro(cleanCode,logoFile,"logo");

      if(result.error){
        setErro("Não foi possível salvar o logo.");
        setSalvando(false);
        return false;
      }

      logoUrl=result.url||logoUrl;
    }

    const payload={
      ...form,
      logo_url:logoUrl,
      whatsapp:digits(form.whatsapp),
      phone:digits(form.phone),
    };

    const {data,error}=await atualizarEmpresaPro(cleanCode,payload,top3);

    if(error){
      setErro(error.message||"Não foi possível salvar.");
      setSalvando(false);
      return false;
    }

    if(professionalEnabled){
      const openingResult=await atualizarAberturaEmpresaPro(
        cleanCode,
        {
          openingMode:form.opening_mode,
          directTargetTitle:form.direct_target_title,
          directTargetUrl:form.direct_target_url,
        }
      );

      if(openingResult.error){
        setErro(
          openingResult.error.message||
          "Não foi possível salvar o destino de abertura."
        );
        setSalvando(false);
        return false;
      }
    }

    setDados(current=>({
      ...current,
      ...payload,
      top3:data?.top3||top3.map((module_code,index)=>({
        module_code,
        featured_position:index+1,
      })),
    }));

    const savedForm={...form,logo_url:logoUrl};

    setForm(savedForm);
    setLogoPreview(logoUrl);
    setLogoFile(null);
    setSavedSnapshot(JSON.stringify({
      form:savedForm,
      top3,
      logoPending:false,
    }));
    setSalvando(false);

    if(publicar){
      navigate(`/pro/empresa/${dados.piece_code}?edit=${encodeURIComponent(cleanCode)}`);
      return true;
    }

    setSucesso("Alterações salvas.");
    setPreviewMode(false);
    window.scrollTo({top:0,behavior:"smooth"});
    return true;
  }

  async function ativarTesteProfissional(){
    setErro("");
    setSucesso("");
    setAtivandoTeste(true);

    const {data,error}=await ativarTesteProfissionalEmpresaPro(cleanCode);

    if(error){
      setErro(
        error.message||
        "Não foi possível ativar o teste grátis."
      );
      setAtivandoTeste(false);
      window.scrollTo({top:0,behavior:"smooth"});
      return;
    }

    setDados(current=>({
      ...current,
      plan_code:data?.plan_code||"professional",
      subscription_status:data?.subscription_status||"trial",
      professional_enabled:true,
      trial_started_at:data?.trial_started_at||null,
      trial_ends_at:data?.trial_ends_at||null,
      trial_days_remaining:data?.trial_days_remaining??30,
    }));

    setAtivandoTeste(false);
    setSucesso("Plano Profissional liberado por 30 dias. Seu visual atual foi mantido.");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  async function save(e){
    e.preventDefault();
    await persistir();
  }

  function abrirPreview(){
    const validation=validarFormulario();

    if(validation){
      setErro(validation);
      window.scrollTo({top:0,behavior:"smooth"});
      return;
    }

    setErro("");
    setPreviewMode(true);
    window.scrollTo({top:0,behavior:"instant"});
  }

  if(loading)return <Shell><h1>TAP PRO</h1><p>Carregando painel...</p></Shell>;
  if(erro&&!dados)return <Shell><h1>TAP PRO</h1><p>{erro}</p></Shell>;

  if(previewMode){
    return (
      <ProEmpresaPagina
        data={montarDadosPreview()}
        preview
        onBack={()=>setPreviewMode(false)}
        onPublish={()=>persistir({publicar:true})}
        publishing={salvando}
      />
    );
  }

  return (
    <main
      style={{
        minHeight:"100vh",
        padding:"22px 14px 120px",
        background:"#f3f1ec",
        fontFamily:"Inter,Arial,sans-serif",
        color:"#111827",
      }}
    >
      <style>{`
        .tap-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .tap-choices{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .tap-goals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .tap-actions{columns:2 360px;column-gap:14px}
        .tap-action-card{break-inside:avoid;margin:0 0 14px;width:100%;display:inline-block;box-sizing:border-box}
        .tap-topbar{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}
        @media(max-width:760px){
          .tap-grid,.tap-choices,.tap-goals{grid-template-columns:1fr}
          .tap-actions{columns:1}
          .tap-topbar{grid-template-columns:1fr}
        }
      `}</style>

      <section style={{maxWidth:940,margin:"0 auto"}}>
        <header
          style={{
            padding:"24px",
            borderRadius:24,
            background:"#111827",
            color:"#fff",
            boxShadow:"0 18px 46px rgba(17,24,39,.18)",
          }}
        >
          <div className="tap-topbar">
            <div style={{display:"flex",alignItems:"center",gap:16,minWidth:0}}>
              <div
                style={{
                  width:64,
                  height:64,
                  flex:"0 0 auto",
                  borderRadius:18,
                  background:"#fff",
                  display:"grid",
                  placeItems:"center",
                  overflow:"hidden",
                  border:"1px solid rgba(255,255,255,.18)",
                }}
              >
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" style={{width:"88%",height:"88%",objectFit:"contain"}}/>
                  : <strong style={{color:"#111827",fontSize:20}}>TP</strong>}
              </div>

              <div style={{minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>
                  <span
                    style={{
                      padding:"5px 9px",
                      borderRadius:999,
                      background:"rgba(214,181,108,.16)",
                      color:"#efd18c",
                      fontSize:11,
                      fontWeight:900,
                      textTransform:"uppercase",
                      letterSpacing:".6px",
                    }}
                  >
                    {professionalEnabled?"Plano Profissional":"Plano Essencial"}
                  </span>

                  {!professionalEnabled&&(
                    <span
                      style={{
                        color:"#cbd5e1",
                        fontSize:11,
                        fontWeight:800,
                      }}
                    >
                      <s>R$ 39/mês</s> · Incluído
                    </span>
                  )}

                  {professionalEnabled&&(
                    <span
                      style={{
                        color:isPastDue?"#fdba74":"#cbd5e1",
                        fontSize:11,
                        fontWeight:800,
                      }}
                    >
                      {isTrial
                        ? `Teste grátis${Number.isFinite(trialDaysRemaining)?` · ${trialDaysRemaining} dias restantes`:""}`
                        :isPastDueWithinGrace
                        ? `Pagamento pendente · ${graceDaysRemaining} dias de tolerância`
                        :"R$ 59/mês"}
                    </span>
                  )}

                  <span
                    style={{
                      padding:"5px 9px",
                      borderRadius:999,
                      background:hasChanges?"rgba(251,191,36,.15)":"rgba(34,197,94,.15)",
                      color:hasChanges?"#fcd34d":"#86efac",
                      fontSize:11,
                      fontWeight:900,
                    }}
                  >
                    {hasChanges?"Alterações pendentes":"Página atualizada"}
                  </span>
                </div>

                <h1
                  style={{
                    margin:"10px 0 0",
                    fontSize:"clamp(25px,5vw,34px)",
                    lineHeight:1.1,
                    overflow:"hidden",
                    textOverflow:"ellipsis",
                  }}
                >
                  {form.display_name||"Sua empresa"}
                </h1>

                <p style={{margin:"8px 0 0",color:"#cbd5e1",lineHeight:1.5}}>
                  Edite sua página, visualize o resultado e publique somente quando aprovar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={abrirPreview}
              disabled={salvando}
              style={{
                minHeight:50,
                padding:"0 18px",
                borderRadius:14,
                border:"1px solid rgba(255,255,255,.22)",
                background:"#fff",
                color:"#111827",
                fontWeight:900,
                cursor:salvando?"not-allowed":"pointer",
              }}
            >
              Pré-visualizar
            </button>
          </div>
        </header>

        {erro&&(
          <div style={{...card,background:"#fee2e2",color:"#991b1b",border:"1px solid #fecaca"}}>
            {erro}
          </div>
        )}

        {sucesso&&(
          <div style={{...card,background:"#dcfce7",color:"#166534",border:"1px solid #bbf7d0"}}>
            {sucesso}
          </div>
        )}

        {isPastDueWithinGrace&&(
          <div
            style={{
              ...card,
              background:"#fff7ed",
              color:"#9a3412",
              border:"1px solid #fed7aa",
            }}
          >
            <div
              style={{
                display:"grid",
                gridTemplateColumns:"1fr auto",
                gap:16,
                alignItems:"center",
              }}
            >
              <div>
                <strong
                  style={{
                    display:"block",
                    fontSize:17,
                  }}
                >
                  Pagamento pendente
                </strong>

                <p
                  style={{
                    margin:"6px 0 0",
                    lineHeight:1.5,
                  }}
                >
                  O Plano Profissional continua disponível por mais{" "}
                  {graceDaysRemaining}{" "}
                  {graceDaysRemaining===1?"dia":"dias"}.
                  Regularize a assinatura para evitar a volta ao Plano Essencial.
                </p>
              </div>

              <button
                type="button"
                onClick={()=>
                  navigate(
                    `/pro/empresa/profissional/${cleanCode}`
                  )
                }
                style={{
                  minHeight:46,
                  padding:"0 16px",
                  borderRadius:13,
                  border:"1px solid #c2410c",
                  background:"#c2410c",
                  color:"#ffffff",
                  fontWeight:900,
                  cursor:"pointer",
                  whiteSpace:"nowrap",
                }}
              >
                Regularizar assinatura
              </button>
            </div>
          </div>
        )}

        <form onSubmit={save}>

          <section style={card}>
            <SectionTitle
              kicker="1. Identidade"
              title="Como sua empresa aparece"
              description="Use uma identificação simples e fácil de reconhecer."
            />

            <div style={{display:"grid",gridTemplateColumns:"150px 1fr",gap:20,alignItems:"start"}}>
              <div>
                <div
                  style={{
                    height:116,
                    borderRadius:18,
                    background:"#f8fafc",
                    border:"1px dashed #cbd5e1",
                    display:"grid",
                    placeItems:"center",
                    overflow:"hidden",
                  }}
                >
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo" style={{width:"88%",height:"88%",objectFit:"contain"}}/>
                    : <span style={{color:"#94a3b8",fontWeight:800}}>Sem logo</span>}
                </div>

                <label
                  style={{
                    display:"block",
                    marginTop:10,
                    padding:"11px 12px",
                    borderRadius:12,
                    background:"#fffaf0",
                    border:"1px solid #e6d7b8",
                    color:"#8a641f",
                    fontWeight:900,
                    textAlign:"center",
                    cursor:"pointer",
                  }}
                >
                  Trocar logo
                  <input type="file" accept="image/*" onChange={logo} style={{display:"none"}}/>
                </label>
              </div>

              <div>
                <div className="tap-grid">
                  <Field label="Nome da empresa" name="display_name" value={form.display_name} onChange={change}/>
                  <Field label="WhatsApp principal" name="whatsapp" value={form.whatsapp} onChange={change}/>
                </div>

                <label style={{display:"block",fontWeight:800,marginTop:16}}>Descrição curta</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={change}
                  placeholder="Explique em uma frase o que sua empresa oferece."
                  style={{...input,minHeight:96,marginTop:7,resize:"vertical"}}
                />
              </div>
            </div>
          </section>

          <section style={card}>
            <SectionTitle
              kicker="2. Objetivo"
              title="O que esta página deve gerar?"
              description="O objetivo escolhido define a chamada principal da página."
            />

            <div className="tap-goals">
              {GOALS.map(([value,label])=>{
                const selected=form.primary_goal===value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={()=>setForm(current=>({...current,primary_goal:value}))}
                    style={{
                      minHeight:74,
                      padding:14,
                      borderRadius:15,
                      border:selected?"2px solid #b8892f":"1px solid #d1d5db",
                      background:selected?"#fffaf0":"#fff",
                      color:"#111827",
                      textAlign:"left",
                      cursor:"pointer",
                    }}
                  >
                    <strong style={{display:"block"}}>{label}</strong>
                    {selected&&(
                      <small style={{display:"block",marginTop:6,color:"#8a641f",fontWeight:800}}>
                        Objetivo selecionado
                      </small>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop:14,
                padding:14,
                borderRadius:13,
                background:"#f8fafc",
                border:"1px solid #e2e8f0",
                color:"#475569",
                lineHeight:1.5,
              }}
            >
              {strategyText}
            </div>
          </section>

          <section style={card}>
            <SectionTitle
              kicker="3. Ações e destaques"
              title="Escolha o que o visitante pode fazer"
              description="Ative as funções úteis e marque até 3 delas como destaque principal."
              aside={`${top3.length}/3 destaques`}
            />

            <div className="tap-actions">
              <ActionCard title="WhatsApp" checked={form.show_whatsapp} name="show_whatsapp" onChange={change} code="whatsapp" top3={top3} onToggleHighlight={toggle}>
                {form.show_whatsapp&&(
                  <Field
                    label="Mensagem inicial"
                    name="whatsapp_message"
                    value={form.whatsapp_message}
                    onChange={change}
                    placeholder="Olá! Recebi seu contato pela página..."
                  />
                )}
              </ActionCard>

              <ActionCard title="Instagram" checked={form.show_instagram} name="show_instagram" onChange={change} code="instagram" top3={top3} onToggleHighlight={toggle}>
                {form.show_instagram&&(
                  <Field label="Usuário ou link" name="instagram" value={form.instagram} onChange={change} placeholder="@suaempresa"/>
                )}
              </ActionCard>

              <ActionCard title="Avaliação no Google" checked={form.show_google_review} name="show_google_review" onChange={change} code="google_review" top3={top3} onToggleHighlight={toggle}>
                {form.show_google_review&&(
                  <Field label="Link de avaliação" name="google_review_url" value={form.google_review_url} onChange={change}/>
                )}
              </ActionCard>

              <ActionCard title="Ligar agora" checked={form.show_phone} name="show_phone" onChange={change} code="phone" top3={top3} onToggleHighlight={toggle}>
                {form.show_phone&&(
                  <Field
                    label="Telefone"
                    name="phone"
                    value={form.phone}
                    onChange={change}
                    placeholder="Se ficar vazio, usa o WhatsApp"
                  />
                )}
              </ActionCard>

              <ActionCard title="Pix" checked={form.show_pix} name="show_pix" onChange={change} code="pix" top3={top3} onToggleHighlight={toggle}>
                {form.show_pix&&(
                  <Field label="Chave Pix" name="pix_key" value={form.pix_key} onChange={change}/>
                )}
              </ActionCard>

              <ActionCard title="Wi-Fi" checked={form.show_wifi} name="show_wifi" onChange={change} code="wifi" top3={top3} onToggleHighlight={toggle}>
                {form.show_wifi&&(
                  <div style={{display:"grid",gap:12}}>
                    <Field label="Nome da rede" name="wifi_ssid" value={form.wifi_ssid} onChange={change}/>
                    <Field label="Senha" name="wifi_password" value={form.wifi_password} onChange={change}/>
                    <small style={{color:"#64748b",lineHeight:1.45}}>
                      A senha fica oculta na página e é copiada ao tocar no botão.
                    </small>
                  </div>
                )}
              </ActionCard>

              <ActionCard title="Horário de atendimento" checked={form.show_business_hours} name="show_business_hours" onChange={change} code="business_hours" top3={top3} onToggleHighlight={toggle}>
                {form.show_business_hours&&(
                  <Field label="Horário" name="business_hours" value={form.business_hours} onChange={change} placeholder="Seg. a sex., 8h às 18h"/>
                )}
              </ActionCard>

              <ActionCard title="Localização" checked={form.show_maps} name="show_maps" onChange={change} code="maps" top3={top3} onToggleHighlight={toggle}>
                {form.show_maps&&(
                  <p style={{margin:0,color:"#64748b",fontSize:13,lineHeight:1.45}}>
                    Complete o endereço na seção de localização abaixo.
                  </p>
                )}
              </ActionCard>
            </div>

            <div
              style={{
                marginTop:16,
                paddingTop:16,
                borderTop:"1px solid #e5e7eb",
                display:"grid",
                gridTemplateColumns:"1fr 1fr",
                gap:12,
              }}
            >
              <Toggle label="Permitir salvar contato" name="show_save_contact" checked={form.show_save_contact} onChange={change}/>
              <Toggle label="Permitir compartilhar página" name="show_share_page" checked={form.show_share_page} onChange={change}/>
            </div>
          </section>

          <section style={card}>
            <SectionTitle
              kicker="4. Localização"
              title="Endereço da empresa"
              description="O TAP PRO cria automaticamente o botão “Como chegar”."
            />

            <div className="tap-grid">
              <Field label="CEP" name="address_postal_code" value={form.address_postal_code} onChange={change}/>
              <Field label="Rua ou avenida" name="address_street" value={form.address_street} onChange={change}/>
              <Field label="Número" name="address_number" value={form.address_number} onChange={change}/>
              <Field label="Complemento" name="address_complement" value={form.address_complement} onChange={change}/>
              <Field label="Bairro" name="address_neighborhood" value={form.address_neighborhood} onChange={change}/>
              <Field label="Cidade" name="address_city" value={form.address_city} onChange={change}/>
              <Field label="Estado" name="address_state" value={form.address_state} onChange={change}/>
            </div>

            <details style={{marginTop:16}}>
              <summary style={{cursor:"pointer",fontWeight:850,color:"#475569"}}>
                Usar link manual do Google Maps
              </summary>
              <div style={{marginTop:12}}>
                <Field label="Link manual (opcional)" name="maps_url" value={form.maps_url} onChange={change}/>
              </div>
            </details>
          </section>

          <section style={card}>
            <SectionTitle
              kicker="5. Aparência"
              title="Escolha o estilo da página"
              description="Os estilos já funcionam e poderão ser refinados em uma próxima etapa."
              icon={<Palette size={21}/>}
            />

            <div className="tap-choices">
              {THEMES.map(([code,name,description])=>{
                const selected=form.page_template===code;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={()=>setForm(current=>({...current,page_template:code}))}
                    style={{
                      padding:12,
                      borderRadius:16,
                      textAlign:"left",
                      cursor:"pointer",
                      color:"#111827",
                      border:selected?"2px solid #b8892f":"1px solid #d1d5db",
                      background:selected?"#fffaf0":"#fff",
                    }}
                  >
                    <StylePreview type={code} selected={selected}/>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}>
                      <strong>{name}</strong>
                      {selected&&(
                        <span
                          style={{
                            marginLeft:"auto",
                            padding:"4px 8px",
                            borderRadius:999,
                            background:"#b8892f",
                            color:"#fff",
                            fontSize:11,
                            fontWeight:900,
                          }}
                        >
                          Selecionado
                        </span>
                      )}
                    </div>
                    <small style={{display:"block",marginTop:5,color:"#6b7280",lineHeight:1.4}}>
                      {description}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            style={{
              ...card,
              padding:20,
              background:"linear-gradient(145deg,#111827,#1e1b4b)",
              color:"#ffffff",
              border:"1px solid #312e81",
              boxShadow:"0 14px 34px rgba(17,24,39,.16)",
            }}
          >
            <div
              style={{
                display:"grid",
                gridTemplateColumns:"1fr auto",
                gap:18,
                alignItems:"center",
              }}
            >
              <div>
                <p
                  style={{
                    margin:"0 0 6px",
                    color:"#c4b5fd",
                    fontWeight:900,
                    fontSize:11,
                    textTransform:"uppercase",
                    letterSpacing:".7px",
                  }}
                >
                  Plano Profissional
                </p>

                <h2 style={{margin:0,fontSize:22}}>
                  Conecta tudo o que move seu negócio
                </h2>

                <p
                  style={{
                    margin:"8px 0 0",
                    color:"#d1d5db",
                    lineHeight:1.55,
                  }}
                >
                  Campanhas, aplicativos, cardápios, catálogos,
                  destinos diretos e recursos avançados em um ambiente próprio.
                </p>

                <div
                  style={{
                    display:"flex",
                    gap:10,
                    alignItems:"center",
                    flexWrap:"wrap",
                    marginTop:13,
                  }}
                >
                  <strong style={{fontSize:20}}>R$ 59/mês</strong>

                  <span
                    style={{
                      padding:"5px 9px",
                      borderRadius:999,
                      background:"rgba(255,255,255,.10)",
                      border:"1px solid rgba(255,255,255,.16)",
                      color:"#ffffff",
                      fontSize:12,
                      fontWeight:850,
                    }}
                  >
                    30 dias grátis
                  </span>

                  {professionalEnabled&&(
                    <span
                      style={{
                        padding:"5px 9px",
                        borderRadius:999,
                        background:isPastDue
                          ?"rgba(249,115,22,.18)"
                          :"rgba(34,197,94,.16)",
                        color:isPastDue
                          ?"#fdba74"
                          :"#86efac",
                        fontSize:12,
                        fontWeight:850,
                      }}
                    >
                      {isTrial
                        ? `Teste ativo${Number.isFinite(trialDaysRemaining)?` · ${trialDaysRemaining} dias restantes`:""}`
                        :isPastDueWithinGrace
                        ? `Pagamento pendente · ${graceDaysRemaining} dias`
                        :"Plano ativo"}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={()=>{
                  if(professionalEnabled){
                    navigate(`/pro/empresa/profissional/${cleanCode}`);
                    return;
                  }

                  ativarTesteProfissional();
                }}
                disabled={ativandoTeste}
                style={{
                  minHeight:50,
                  padding:"0 18px",
                  borderRadius:14,
                  border:"1px solid rgba(255,255,255,.20)",
                  background:"#ffffff",
                  color:"#111827",
                  fontWeight:900,
                  cursor:ativandoTeste?"not-allowed":"pointer",
                  whiteSpace:"nowrap",
                }}
              >
                {ativandoTeste
                  ?"Ativando..."
                  :professionalEnabled
                  ?"Abrir painel Profissional"
                  :"Testar 30 dias grátis"}
              </button>
            </div>
          </section>

        </form>
      </section>

      <div
        style={{
          position:"fixed",
          left:0,
          right:0,
          bottom:0,
          zIndex:40,
          padding:"10px 14px",
          background:"rgba(255,255,255,.96)",
          borderTop:"1px solid #e5e7eb",
          backdropFilter:"blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth:940,
            margin:"0 auto",
            display:"grid",
            gridTemplateColumns:"1fr auto auto",
            gap:10,
            alignItems:"center",
          }}
        >
          <div style={{minWidth:0}}>
            <strong style={{display:"block",fontSize:13}}>
              {hasChanges?"Alterações ainda não publicadas":"Tudo atualizado"}
            </strong>
            <small style={{color:"#6b7280"}}>
              {hasChanges?"Use o preview antes de salvar.":"Sua página está com a última versão salva."}
            </small>
          </div>

          <button
            type="button"
            onClick={abrirPreview}
            disabled={salvando}
            style={{
              minHeight:48,
              padding:"0 16px",
              borderRadius:13,
              border:"1px solid #b8892f",
              background:"#fffaf0",
              color:"#8a641f",
              fontWeight:900,
              cursor:salvando?"not-allowed":"pointer",
            }}
          >
            Pré-visualizar
          </button>

          <button
            type="button"
            onClick={()=>persistir()}
            disabled={salvando||!hasChanges}
            style={{
              minHeight:48,
              padding:"0 18px",
              border:0,
              borderRadius:13,
              background:salvando||!hasChanges?"#9ca3af":"#111827",
              color:"#fff",
              fontWeight:900,
              cursor:salvando||!hasChanges?"not-allowed":"pointer",
            }}
          >
            {salvando?"Salvando...":"Salvar alterações"}
          </button>
        </div>
      </div>
    </main>
  );

}

function SectionTitle({kicker,title,description,aside,icon}){
  return (
    <div style={{marginBottom:18,display:"flex",justifyContent:"space-between",gap:16,alignItems:"start"}}>
      <div>
        <p style={{margin:"0 0 5px",fontSize:11,fontWeight:900,color:"#8a641f",textTransform:"uppercase",letterSpacing:".6px"}}>
          {kicker}
        </p>
        <h2 style={{margin:0,display:"flex",alignItems:"center",gap:8,fontSize:22,color:"inherit"}}>
          {icon}{title}
        </h2>
        {description&&(
          <p style={{margin:"7px 0 0",color:"inherit",opacity:.72,lineHeight:1.5}}>
            {description}
          </p>
        )}
      </div>

      {aside&&(
        <span style={{
          flex:"0 0 auto",
          padding:"7px 10px",
          borderRadius:999,
          background:"#f8fafc",
          border:"1px solid #e2e8f0",
          color:"#475569",
          fontSize:12,
          fontWeight:900,
        }}>
          {aside}
        </span>
      )}
    </div>
  );
}

function ActionCard({
  title,
  checked,
  name,
  onChange,
  children,
  code,
  top3,
  onToggleHighlight,
}){
  const position=top3.indexOf(code);
  const highlighted=position>=0;
  const limitReached=!highlighted&&top3.length>=3;

  return (
    <section
      className="tap-action-card"
      style={{
        padding:16,
        borderRadius:17,
        border:checked
          ? highlighted
            ? "2px solid #b8892f"
            : "1px solid #d6b56c"
          : "1px solid #e5e7eb",
        background:checked?"#fffdf7":"#ffffff",
        boxSizing:"border-box",
        overflow:"hidden",
      }}
    >
      <div
        style={{
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          gap:14,
        }}
      >
        <div style={{minWidth:0}}>
          <strong
            style={{
              display:"block",
              fontSize:15,
              lineHeight:1.25,
              overflowWrap:"anywhere",
            }}
          >
            {title}
          </strong>

          <small
            style={{
              display:"block",
              marginTop:4,
              color:"#64748b",
              lineHeight:1.4,
            }}
          >
            {checked?"Função ativa":"Função desativada"}
          </small>
        </div>

        <Toggle
          label=""
          name={name}
          checked={checked}
          onChange={onChange}
          compact
        />
      </div>

      {checked&&children&&(
        <div
          style={{
            marginTop:14,
            paddingTop:14,
            borderTop:"1px solid #ece7dc",
          }}
        >
          {children}
        </div>
      )}

      {checked&&(
        <div
          style={{
            marginTop:14,
            paddingTop:14,
            borderTop:"1px solid #ece7dc",
          }}
        >
          <div
            style={{
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
              gap:12,
              flexWrap:"wrap",
            }}
          >
            <div style={{minWidth:0,flex:"1 1 180px"}}>
              <strong
                style={{
                  display:"block",
                  fontSize:13.5,
                  lineHeight:1.3,
                }}
              >
                {highlighted?`Destaque ${position+1}`:"Adicionar aos destaques"}
              </strong>

              <small
                style={{
                  display:"block",
                  marginTop:3,
                  color:"#64748b",
                  lineHeight:1.4,
                }}
              >
                {highlighted
                  ?"Esta ação aparece entre as principais."
                  :limitReached
                  ?"O limite de 3 destaques foi atingido."
                  :"Esta ação ganhará mais visibilidade na página."}
              </small>
            </div>

            <button
              type="button"
              onClick={()=>onToggleHighlight(code)}
              disabled={limitReached}
              style={{
                flex:"0 0 auto",
                minWidth:112,
                minHeight:40,
                padding:"0 14px",
                borderRadius:11,
                border:highlighted?"1px solid #b8892f":"1px solid #d1d5db",
                background:highlighted?"#fff3d6":"#ffffff",
                color:limitReached?"#9ca3af":"#7c5718",
                fontWeight:850,
                cursor:limitReached?"not-allowed":"pointer",
                opacity:limitReached?.62:1,
                whiteSpace:"nowrap",
              }}
            >
              {highlighted?"Remover":"Adicionar"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({label,...props}){
  return (
    <div>
      <label style={{display:"block",marginBottom:7,fontWeight:800}}>{label}</label>
      <input {...props} style={input}/>
    </div>
  );
}

function Toggle({label,compact=false,...props}){
  const checked=Boolean(props.checked);

  return (
    <label
      style={{
        display:"inline-flex",
        alignItems:"center",
        gap:10,
        fontWeight:800,
        minHeight:30,
        cursor:"pointer",
        flexShrink:0,
      }}
    >
      <input
        type="checkbox"
        {...props}
        style={{
          position:"absolute",
          opacity:0,
          pointerEvents:"none",
        }}
      />

      <span
        aria-hidden="true"
        style={{
          width:compact?46:48,
          height:compact?26:28,
          padding:3,
          borderRadius:999,
          background:checked?"#111827":"#d1d5db",
          display:"inline-flex",
          alignItems:"center",
          justifyContent:checked?"flex-end":"flex-start",
          transition:"all .18s ease",
          boxSizing:"border-box",
          boxShadow:"inset 0 0 0 1px rgba(0,0,0,.05)",
        }}
      >
        <span
          style={{
            width:compact?20:22,
            height:compact?20:22,
            borderRadius:"50%",
            background:"#ffffff",
            boxShadow:"0 1px 4px rgba(0,0,0,.25)",
          }}
        />
      </span>

      {label&&<span style={{lineHeight:1.3}}>{label}</span>}
    </label>
  );
}

function Shell({children}){
  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f5f2ec"}}>
      <section style={{padding:28,borderRadius:20,background:"#fff",textAlign:"center"}}>
        {children}
      </section>
    </main>
  );
}