import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Link2,
  Megaphone,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  alterarStatusCampanhaProfissionalEmpresaPro,
  alterarStatusProgramacaoProfissionalEmpresaPro,
  atualizarAberturaEmpresaPro,
  atualizarVisualProfissionalEmpresaPro,
  codigoAdminProValido,
  excluirCampanhaProfissionalEmpresaPro,
  excluirConexaoProfissionalEmpresaPro,
  excluirProgramacaoProfissionalEmpresaPro,
  getCompanyDashboardPro,
  getMetricasEmpresaProfissionalPro,
  getResumoCobrancaEmpresaProfissionalPro,
  iniciarCheckoutMensalEmpresaPro,
  criarPixAnualEmpresaPro,
  limparCodigoPro,
  obterAcessoAdminPro,
  salvarAcessoAdminPro,
  salvarCampanhaProfissionalEmpresaPro,
  salvarConexaoProfissionalEmpresaPro,
  salvarProgramacaoProfissionalEmpresaPro,
} from "../../lib/tappro";

const CONNECTION_TYPES = [
  ["menu","Cardápio"],
  ["catalog","Catálogo"],
  ["app","Aplicativo"],
  ["pdf","PDF"],
  ["ifood","iFood"],
  ["scheduling","Agendamento"],
  ["form","Formulário"],
  ["website","Site"],
  ["store","Loja online"],
  ["payment","Pagamento"],
  ["custom","Outro link"],
];

const input = {
  width:"100%",
  minHeight:48,
  padding:"12px 13px",
  borderRadius:12,
  border:"1px solid #d1d5db",
  boxSizing:"border-box",
  fontSize:15,
};

const card = {
  padding:22,
  borderRadius:22,
  background:"#ffffff",
  border:"1px solid #e5e7eb",
  boxShadow:"0 12px 30px rgba(0,0,0,.06)",
};

const emptyConnection = {
  link_type:"menu",
  title:"",
  description:"",
  url:"",
  is_active:true,
  show_on_page:true,
  is_featured:false,
  display_order:0,
};


const emptyCampaign = {
  name:"",
  description:"",
  destination_type:"saved_link",
  destination_link_id:"",
  destination_url:"",
  starts_at:"",
  ends_at:"",
  after_end_mode:"page",
  after_end_link_id:"",
  after_end_url:"",
  status:"draft",
  is_active:false,
};


const WEEK_DAYS = [
  [1,"Seg"],
  [2,"Ter"],
  [3,"Qua"],
  [4,"Qui"],
  [5,"Sex"],
  [6,"Sáb"],
  [0,"Dom"],
];


const PREMIUM_THEMES = [
  {
    code:"parametric",
    name:"Parametric",
    description:"Tecnológico, fluido e exclusivo.",
    preview:"linear-gradient(135deg,#07070a,#312e81 55%,#7c3aed)",
  },
  {
    code:"bento_premium",
    name:"Bento Premium",
    description:"Moderno, modular e comercial.",
    preview:"linear-gradient(135deg,#111827,#475569)",
  },
  {
    code:"minimal_brand",
    name:"Minimal Brand",
    description:"Sofisticado, leve e centrado na marca.",
    preview:"linear-gradient(135deg,#ffffff,#e5e7eb)",
  },
];

const emptySchedule = {
  name:"",
  days_of_week:[1,2,3,4,5],
  start_time:"09:00",
  end_time:"18:00",
  destination_type:"saved_link",
  destination_link_id:"",
  destination_url:"",
  priority:100,
  is_active:true,
};

function normalizarUrl(value){
  const raw=String(value||"").trim();
  if(!raw)return "";
  return /^https?:\/\//i.test(raw)?raw:`https://${raw}`;
}

export default function ProEmpresaProfissionalPainel(){
  const {accessCode}=useParams();
  const navigate=useNavigate();
  const cleanCode=limparCodigoPro(accessCode);

  const [loading,setLoading]=useState(true);
  const [dados,setDados]=useState(null);
  const [form,setForm]=useState({
    opening_mode:"page",
    direct_target_title:"",
    direct_target_url:"",
  });
  const [links,setLinks]=useState([]);
  const [campaigns,setCampaigns]=useState([]);
  const [scheduleRules,setScheduleRules]=useState([]);
  const [connectionForm,setConnectionForm]=useState(emptyConnection);
  const [campaignForm,setCampaignForm]=useState(emptyCampaign);
  const [scheduleForm,setScheduleForm]=useState(emptySchedule);
  const [editingLinkId,setEditingLinkId]=useState(null);
  const [editingCampaignId,setEditingCampaignId]=useState(null);
  const [editingScheduleId,setEditingScheduleId]=useState(null);
  const [showConnectionForm,setShowConnectionForm]=useState(false);
  const [showCampaignForm,setShowCampaignForm]=useState(false);
  const [showScheduleForm,setShowScheduleForm]=useState(false);
  const [erro,setErro]=useState("");
  const [sucesso,setSucesso]=useState("");
  const [salvando,setSalvando]=useState(false);
  const [salvandoConexao,setSalvandoConexao]=useState(false);
  const [salvandoCampanha,setSalvandoCampanha]=useState(false);
  const [salvandoProgramacao,setSalvandoProgramacao]=useState(false);
  const [excluindoId,setExcluindoId]=useState(null);
  const [excluindoCampanhaId,setExcluindoCampanhaId]=useState(null);
  const [alterandoCampanhaId,setAlterandoCampanhaId]=useState(null);
  const [excluindoProgramacaoId,setExcluindoProgramacaoId]=useState(null);
  const [alterandoProgramacaoId,setAlterandoProgramacaoId]=useState(null);
  const [visualSelecionado,setVisualSelecionado]=useState("");
  const [salvandoVisual,setSalvandoVisual]=useState(false);
  const [metricas,setMetricas]=useState(null);
  const [periodoMetricas,setPeriodoMetricas]=useState(30);
  const [carregandoMetricas,setCarregandoMetricas]=useState(false);
  const [resumoCobranca,setResumoCobranca]=useState(null);
  const [emailPagamento,setEmailPagamento]=useState("");
  const [processandoPagamento,setProcessandoPagamento]=useState("");
  const [pixAnual,setPixAnual]=useState(null);
  const [copiouPix,setCopiouPix]=useState(false);
  const [erroEmailPagamento,setErroEmailPagamento]=useState("");
  const emailPagamentoRef=useRef(null);

  useEffect(()=>{
    (async()=>{
      if(!codigoAdminProValido(cleanCode)){
        setErro("Código administrativo inválido.");
        setLoading(false);
        return;
      }

      const {data,error}=await getCompanyDashboardPro(cleanCode);

      if(error||!data?.found){
        setErro("Painel profissional não encontrado.");
        setLoading(false);
        return;
      }

      if(obterAcessoAdminPro()!==cleanCode){
        salvarAcessoAdminPro(cleanCode);
      }

      if(!data.professional_enabled){
        navigate(`/pro/empresa/painel/${cleanCode}`,{replace:true});
        return;
      }

      setDados(data);
      setForm({
        opening_mode:data.opening_mode||"page",
        direct_target_title:data.direct_target_title||"",
        direct_target_url:data.direct_target_url||"",
      });
      setLinks(
        Array.isArray(data.professional_links)
          ? data.professional_links
          : []
      );
      setCampaigns(
        Array.isArray(data.professional_campaigns)
          ? data.professional_campaigns
          : []
      );
      setScheduleRules(
        Array.isArray(data.professional_schedule_rules)
          ? data.professional_schedule_rules
          : []
      );
      setVisualSelecionado(data.page_template||"modern");
      setLoading(false);

      const metricsResult=
        await getMetricasEmpresaProfissionalPro(
          cleanCode,
          30
        );

      if(!metricsResult.error){
        setMetricas(metricsResult.data||null);
      }

      const billingResult=
        await getResumoCobrancaEmpresaProfissionalPro(
          cleanCode
        );

      if(!billingResult.error){
        setResumoCobranca(
          billingResult.data||null
        );
      }
    })();
  },[cleanCode,navigate]);

  const trialText=useMemo(()=>{
    if(dados?.subscription_status!=="trial")return "Plano ativo";
    const days=dados?.trial_days_remaining;
    return Number.isFinite(days)
      ? `${days} dias restantes no teste`
      : "Teste grátis ativo";
  },[dados]);


  const billingState=useMemo(()=>{
    const status=String(
      resumoCobranca?.subscription_status||
      dados?.subscription_status||
      ""
    )
      .trim()
      .toLowerCase()
      .replace("canceled","cancelled");

    if(status==="trial"){
      return {
        status,
        canPurchase:false,
        title:"Período gratuito já ativo",
        message:"Sua empresa já está usando os 30 dias grátis. Uma nova assinatura ou um novo Pix anual não pode ser gerado agora.",
      };
    }

    if(status==="active"){
      return {
        status,
        canPurchase:false,
        title:"Plano Profissional já ativo",
        message:"Seu plano atual está vigente. Não é necessário e não é permitido gerar outra cobrança.",
      };
    }

    if(status==="past_due"){
      return {
        status,
        canPurchase:false,
        title:"Regularização necessária",
        message:"Existe uma pendência na assinatura atual. Regularize o pagamento existente em vez de iniciar uma nova contratação.",
      };
    }

    const professionalEnabled=
      Boolean(
        resumoCobranca?.professional_enabled
      );

    if(
      professionalEnabled&&
      !["essential","cancelled"].includes(status)
    ){
      return {
        status,
        canPurchase:false,
        title:"Plano Profissional já liberado",
        message:"Os recursos profissionais já estão ativos para esta empresa. Uma nova cobrança foi bloqueada por segurança.",
      };
    }

    return {
      status:status||"essential",
      canPurchase:
        !status||
        ["essential","cancelled"].includes(status),
      title:"",
      message:"",
    };
  },[
    resumoCobranca,
    dados,
  ]);

  function change(event){
    const {name,value}=event.target;
    setForm(current=>({...current,[name]:value}));
  }

  function changeConnection(event){
    const {name,value,type,checked}=event.target;
    setConnectionForm(current=>({
      ...current,
      [name]:type==="checkbox"?checked:value,
    }));
  }

  function novaConexao(){
    setEditingLinkId(null);
    setConnectionForm({
      ...emptyConnection,
      display_order:links.length,
    });
    setShowConnectionForm(true);
    setErro("");
    setSucesso("");
  }

  function editarConexao(link){
    setEditingLinkId(link.id);
    setConnectionForm({
      link_type:link.link_type||"custom",
      title:link.title||"",
      description:link.description||"",
      url:link.url||"",
      is_active:link.is_active!==false,
      show_on_page:link.show_on_page!==false,
      is_featured:Boolean(link.is_featured),
      display_order:Number(link.display_order)||0,
    });
    setShowConnectionForm(true);
    setErro("");
    setSucesso("");
  }

  function cancelarEdicaoConexao(){
    setEditingLinkId(null);
    setConnectionForm(emptyConnection);
    setShowConnectionForm(false);
  }

  async function salvarDestino(){
    setErro("");
    setSucesso("");

    if(
      form.opening_mode==="direct" &&
      !String(form.direct_target_url||"").trim()
    ){
      setErro("Informe o link do destino direto.");
      return;
    }

    setSalvando(true);

    const {data,error}=await atualizarAberturaEmpresaPro(
      cleanCode,
      {
        openingMode:form.opening_mode,
        directTargetTitle:form.direct_target_title,
        directTargetUrl:form.direct_target_url,
      }
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível salvar a configuração."
      );
      setSalvando(false);
      return;
    }

    setDados(current=>({...current,...data}));
    setSucesso("Destino salvo.");
    setSalvando(false);
  }

  async function salvarConexao(){
    setErro("");
    setSucesso("");

    if(!String(connectionForm.title||"").trim()){
      setErro("Informe o nome da conexão.");
      return;
    }

    if(!String(connectionForm.url||"").trim()){
      setErro("Informe o link da conexão.");
      return;
    }

    setSalvandoConexao(true);

    const {data,error}=await salvarConexaoProfissionalEmpresaPro(
      cleanCode,
      connectionForm,
      editingLinkId
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível salvar a conexão."
      );
      setSalvandoConexao(false);
      return;
    }

    const saved=data?.link;

    setLinks(current=>{
      if(editingLinkId){
        return current
          .map(item=>item.id===editingLinkId?saved:item)
          .sort((a,b)=>(a.display_order||0)-(b.display_order||0));
      }

      return [...current,saved]
        .sort((a,b)=>(a.display_order||0)-(b.display_order||0));
    });

    cancelarEdicaoConexao();
    setSucesso(
      editingLinkId
        ?"Conexão atualizada."
        :"Conexão adicionada."
    );
    setSalvandoConexao(false);
  }

  async function excluirConexao(link){
    const confirmed=window.confirm(
      `Excluir a conexão "${link.title}"?`
    );

    if(!confirmed)return;

    setErro("");
    setSucesso("");
    setExcluindoId(link.id);

    const {error}=await excluirConexaoProfissionalEmpresaPro(
      cleanCode,
      link.id
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível excluir a conexão."
      );
      setExcluindoId(null);
      return;
    }

    setLinks(current=>current.filter(item=>item.id!==link.id));
    setSucesso("Conexão excluída.");
    setExcluindoId(null);
  }


  function changeCampaign(event){
    const {name,value,type,checked}=event.target;
    setCampaignForm(current=>({
      ...current,
      [name]:type==="checkbox"?checked:value,
    }));
  }

  function novaCampanha(){
    setEditingCampaignId(null);
    setCampaignForm({
      ...emptyCampaign,
      destination_link_id:
        links.find(link=>link.is_active)?.id||"",
    });
    setShowCampaignForm(true);
    setErro("");
    setSucesso("");
  }

  function editarCampanha(campaign){
    setEditingCampaignId(campaign.id);
    setCampaignForm({
      name:campaign.name||"",
      description:campaign.description||"",
      destination_type:campaign.destination_type||"saved_link",
      destination_link_id:campaign.destination_link_id||"",
      destination_url:campaign.destination_url||"",
      starts_at:campaign.starts_at
        ? String(campaign.starts_at).slice(0,16)
        : "",
      ends_at:campaign.ends_at
        ? String(campaign.ends_at).slice(0,16)
        : "",
      after_end_mode:campaign.after_end_mode||"page",
      after_end_link_id:campaign.after_end_link_id||"",
      after_end_url:campaign.after_end_url||"",
      status:campaign.status||"draft",
      is_active:Boolean(campaign.is_active),
    });
    setShowCampaignForm(true);
    setErro("");
    setSucesso("");
  }

  function cancelarEdicaoCampanha(){
    setEditingCampaignId(null);
    setCampaignForm(emptyCampaign);
    setShowCampaignForm(false);
  }

  async function salvarCampanha(){
    setErro("");
    setSucesso("");

    if(!String(campaignForm.name||"").trim()){
      setErro("Informe o nome da campanha.");
      return;
    }

    if(
      campaignForm.destination_type==="saved_link" &&
      !campaignForm.destination_link_id
    ){
      setErro("Escolha uma conexão para a campanha.");
      return;
    }

    if(
      campaignForm.destination_type==="url" &&
      !String(campaignForm.destination_url||"").trim()
    ){
      setErro("Informe o link da campanha.");
      return;
    }

    setSalvandoCampanha(true);

    const {data,error}=await salvarCampanhaProfissionalEmpresaPro(
      cleanCode,
      {
        ...campaignForm,
        starts_at:campaignForm.starts_at
          ? new Date(campaignForm.starts_at).toISOString()
          : null,
        ends_at:campaignForm.ends_at
          ? new Date(campaignForm.ends_at).toISOString()
          : null,
      },
      editingCampaignId
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível salvar a campanha."
      );
      setSalvandoCampanha(false);
      return;
    }

    const saved=data?.campaign;

    setCampaigns(current=>{
      const withoutOtherActive=saved?.is_active
        ? current.map(item=>({
            ...item,
            is_active:item.id===saved.id,
            status:
              item.id!==saved.id &&
              ["active","scheduled"].includes(item.status)
                ?"paused"
                :item.status,
          }))
        :current;

      if(editingCampaignId){
        return withoutOtherActive.map(item=>
          item.id===editingCampaignId?saved:item
        );
      }

      return [saved,...withoutOtherActive];
    });

    if(data?.opening_mode){
      setForm(current=>({
        ...current,
        opening_mode:data.opening_mode,
      }));
    }

    cancelarEdicaoCampanha();
    setSucesso(
      editingCampaignId
        ?"Campanha atualizada."
        :"Campanha criada."
    );
    setSalvandoCampanha(false);
  }

  async function alterarCampanha(campaign,isActive){
    setErro("");
    setSucesso("");
    setAlterandoCampanhaId(campaign.id);

    const {data,error}=await alterarStatusCampanhaProfissionalEmpresaPro(
      cleanCode,
      campaign.id,
      isActive
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível alterar a campanha."
      );
      setAlterandoCampanhaId(null);
      return;
    }

    const updated=data?.campaign;

    setCampaigns(current=>current.map(item=>{
      if(updated?.is_active&&item.id!==updated.id){
        return {
          ...item,
          is_active:false,
          status:["active","scheduled"].includes(item.status)
            ?"paused"
            :item.status,
        };
      }

      return item.id===updated.id?updated:item;
    }));

    if(data?.opening_mode){
      setForm(current=>({
        ...current,
        opening_mode:data.opening_mode,
      }));
    }

    setSucesso(
      isActive
        ?"Campanha ativada."
        :"Campanha pausada."
    );
    setAlterandoCampanhaId(null);
  }

  async function excluirCampanha(campaign){
    const confirmed=window.confirm(
      `Excluir a campanha "${campaign.name}"?`
    );

    if(!confirmed)return;

    setErro("");
    setSucesso("");
    setExcluindoCampanhaId(campaign.id);

    const {data,error}=await excluirCampanhaProfissionalEmpresaPro(
      cleanCode,
      campaign.id
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível excluir a campanha."
      );
      setExcluindoCampanhaId(null);
      return;
    }

    setCampaigns(current=>current.filter(item=>item.id!==campaign.id));

    if(data?.opening_mode){
      setForm(current=>({
        ...current,
        opening_mode:data.opening_mode,
      }));
    }

    setSucesso("Campanha excluída.");
    setExcluindoCampanhaId(null);
  }


  function changeSchedule(event){
    const {name,value,type,checked}=event.target;
    setScheduleForm(current=>({
      ...current,
      [name]:type==="checkbox"?checked:value,
    }));
  }

  function toggleScheduleDay(day){
    setScheduleForm(current=>{
      const exists=current.days_of_week.includes(day);
      return {
        ...current,
        days_of_week:exists
          ? current.days_of_week.filter(item=>item!==day)
          : [...current.days_of_week,day],
      };
    });
  }

  function novaProgramacao(){
    setEditingScheduleId(null);
    setScheduleForm({
      ...emptySchedule,
      destination_link_id:
        links.find(link=>link.is_active)?.id||"",
    });
    setShowScheduleForm(true);
    setErro("");
    setSucesso("");
  }

  function editarProgramacao(rule){
    setEditingScheduleId(rule.id);
    setScheduleForm({
      name:rule.name||"",
      days_of_week:Array.isArray(rule.days_of_week)
        ? rule.days_of_week.map(Number)
        : [],
      start_time:String(rule.start_time||"09:00").slice(0,5),
      end_time:String(rule.end_time||"18:00").slice(0,5),
      destination_type:rule.destination_type||"saved_link",
      destination_link_id:rule.destination_link_id||"",
      destination_url:rule.destination_url||"",
      priority:Number(rule.priority)||100,
      is_active:rule.is_active!==false,
    });
    setShowScheduleForm(true);
    setErro("");
    setSucesso("");
  }

  function cancelarEdicaoProgramacao(){
    setEditingScheduleId(null);
    setScheduleForm(emptySchedule);
    setShowScheduleForm(false);
  }

  async function salvarProgramacao(){
    setErro("");
    setSucesso("");

    if(!String(scheduleForm.name||"").trim()){
      setErro("Informe o nome da programação.");
      return;
    }

    if(!scheduleForm.days_of_week.length){
      setErro("Escolha pelo menos um dia da semana.");
      return;
    }

    if(!scheduleForm.start_time||!scheduleForm.end_time){
      setErro("Informe o horário de início e término.");
      return;
    }

    if(
      scheduleForm.destination_type==="saved_link" &&
      !scheduleForm.destination_link_id
    ){
      setErro("Escolha uma conexão.");
      return;
    }

    if(
      scheduleForm.destination_type==="url" &&
      !String(scheduleForm.destination_url||"").trim()
    ){
      setErro("Informe o link do destino.");
      return;
    }

    setSalvandoProgramacao(true);

    const {data,error}=await salvarProgramacaoProfissionalEmpresaPro(
      cleanCode,
      scheduleForm,
      editingScheduleId
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível salvar a programação."
      );
      setSalvandoProgramacao(false);
      return;
    }

    const saved=data?.rule;

    setScheduleRules(current=>{
      if(editingScheduleId){
        return current.map(item=>
          item.id===editingScheduleId?saved:item
        );
      }
      return [saved,...current];
    });

    if(data?.opening_mode){
      setForm(current=>({
        ...current,
        opening_mode:data.opening_mode,
      }));
    }

    cancelarEdicaoProgramacao();
    setSucesso(
      editingScheduleId
        ?"Programação atualizada."
        :"Programação criada."
    );
    setSalvandoProgramacao(false);
  }

  async function alterarProgramacao(rule,isActive){
    setErro("");
    setSucesso("");
    setAlterandoProgramacaoId(rule.id);

    const {data,error}=await alterarStatusProgramacaoProfissionalEmpresaPro(
      cleanCode,
      rule.id,
      isActive
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível alterar a programação."
      );
      setAlterandoProgramacaoId(null);
      return;
    }

    const updated=data?.rule;

    setScheduleRules(current=>current.map(item=>
      item.id===updated.id?updated:item
    ));

    if(data?.opening_mode){
      setForm(current=>({
        ...current,
        opening_mode:data.opening_mode,
      }));
    }

    setSucesso(
      isActive
        ?"Programação ativada."
        :"Programação pausada."
    );
    setAlterandoProgramacaoId(null);
  }

  async function excluirProgramacao(rule){
    const confirmed=window.confirm(
      `Excluir a programação "${rule.name}"?`
    );

    if(!confirmed)return;

    setErro("");
    setSucesso("");
    setExcluindoProgramacaoId(rule.id);

    const {data,error}=await excluirProgramacaoProfissionalEmpresaPro(
      cleanCode,
      rule.id
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível excluir a programação."
      );
      setExcluindoProgramacaoId(null);
      return;
    }

    setScheduleRules(current=>current.filter(item=>item.id!==rule.id));

    if(data?.opening_mode){
      setForm(current=>({
        ...current,
        opening_mode:data.opening_mode,
      }));
    }

    setSucesso("Programação excluída.");
    setExcluindoProgramacaoId(null);
  }


  async function salvarVisual(){
    setErro("");
    setSucesso("");

    if(!visualSelecionado){
      setErro("Escolha um visual.");
      return;
    }

    setSalvandoVisual(true);

    const {data,error}=await atualizarVisualProfissionalEmpresaPro(
      cleanCode,
      visualSelecionado
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível salvar o visual."
      );
      setSalvandoVisual(false);
      return;
    }

    setDados(current=>({
      ...current,
      page_template:data?.page_template||visualSelecionado,
    }));
    setSucesso("Visual da página atualizado.");
    setSalvandoVisual(false);
  }


  async function carregarMetricas(days=periodoMetricas){
    setCarregandoMetricas(true);
    setErro("");

    const {data,error}=await getMetricasEmpresaProfissionalPro(
      cleanCode,
      days
    );

    if(error){
      setErro(
        error.message||
        "Não foi possível carregar as métricas."
      );
      setCarregandoMetricas(false);
      return;
    }

    setMetricas(data||null);
    setPeriodoMetricas(days);
    setCarregandoMetricas(false);
  }

  function nomeMetrica(code){
    const map={
      whatsapp:"WhatsApp",
      instagram:"Instagram",
      google_review:"Avaliação no Google",
      maps:"Como chegar",
      phone:"Ligar",
      wifi:"Wi-Fi",
      pix:"Pix",
      share:"Compartilhamento",
      save_contact:"Salvar contato",
      professional_link_click:"Conexão profissional",
    };

    return map[code]||code||"Sem dados";
  }


  function emailPagamentoValido(){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(emailPagamento||"").trim()
    );
  }

  function avisarEmailPagamento(){
    const message=
      String(emailPagamento||"").trim()
        ?"Confira o e-mail informado antes de continuar."
        :"Digite seu e-mail para escolher uma forma de pagamento.";

    setErroEmailPagamento(message);

    requestAnimationFrame(()=>{
      emailPagamentoRef.current?.focus();
      emailPagamentoRef.current?.scrollIntoView({
        behavior:"smooth",
        block:"center",
      });
    });
  }

  async function iniciarMensal(){
    setErro("");
    setSucesso("");

    if(!billingState.canPurchase){
      setErro(
        billingState.message||
        "Uma nova contratação foi bloqueada por segurança."
      );
      return;
    }

    if(!emailPagamentoValido()){
      avisarEmailPagamento();
      return;
    }

    setErroEmailPagamento("");

    setProcessandoPagamento("monthly");

    const {data,error}=
      await iniciarCheckoutMensalEmpresaPro(
        cleanCode,
        emailPagamento
      );

    if(error||!data?.checkoutUrl){
      setErro(
        error?.message||
        "Não foi possível abrir o checkout mensal."
      );
      setProcessandoPagamento("");
      return;
    }

    try{
      window.localStorage.setItem(
        "tappro_subscription_return_access_code",
        cleanCode
      );

      window.localStorage.setItem(
        "tappro_subscription_return_payer_email",
        String(emailPagamento||"")
          .trim()
          .toLowerCase()
      );
    }catch{
      // O retorno ainda funciona pelo botão manual.
    }

    window.location.href=
      data.checkoutUrl;
  }

  async function iniciarAnual(){
    setErro("");
    setSucesso("");
    setPixAnual(null);
    setCopiouPix(false);

    if(!billingState.canPurchase){
      setErro(
        billingState.message||
        "Uma nova contratação foi bloqueada por segurança."
      );
      return;
    }

    if(!emailPagamentoValido()){
      avisarEmailPagamento();
      return;
    }

    setErroEmailPagamento("");

    setProcessandoPagamento("annual");

    const {data,error}=
      await criarPixAnualEmpresaPro(
        cleanCode,
        emailPagamento
      );

    if(error||!data?.qrCode){
      setErro(
        error?.message||
        "Não foi possível gerar o Pix anual."
      );
      setProcessandoPagamento("");
      return;
    }

    setPixAnual(data);
    setProcessandoPagamento("");
  }

  async function copiarCodigoPix(){
    const code=
      pixAnual?.qrCode||"";

    if(!code){
      return;
    }

    try{
      await navigator.clipboard.writeText(
        code
      );
      setCopiouPix(true);
      setTimeout(
        ()=>setCopiouPix(false),
        2500
      );
    }catch{
      setErro(
        "Não foi possível copiar automaticamente. Selecione o código manualmente."
      );
    }
  }

  if(loading){
    return <Tela><h1>TAP PRO</h1><p>Carregando painel profissional...</p></Tela>;
  }

  if(erro&&!dados){
    return <Tela><h1>TAP PRO</h1><p>{erro}</p></Tela>;
  }

  return (
    <main
      style={{
        minHeight:"100vh",
        padding:"22px 14px 90px",
        background:"#f3f1ec",
        fontFamily:"Inter,Arial,sans-serif",
        color:"#111827",
      }}
    >
      <style>{`
        .pro-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .pro-link-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
        @media(max-width:760px){
          .pro-grid,.pro-link-grid{grid-template-columns:1fr}
        }
      `}</style>

      <section style={{maxWidth:980,margin:"0 auto"}}>
        <header
          style={{
            padding:24,
            borderRadius:24,
            background:"linear-gradient(145deg,#111827,#1e1b4b)",
            color:"#ffffff",
            boxShadow:"0 18px 46px rgba(17,24,39,.20)",
          }}
        >
          <button
            type="button"
            onClick={()=>navigate(`/pro/empresa/painel/${cleanCode}`)}
            style={{
              minHeight:40,
              padding:"0 12px",
              borderRadius:11,
              border:"1px solid rgba(255,255,255,.18)",
              background:"rgba(255,255,255,.08)",
              color:"#ffffff",
              fontWeight:850,
              cursor:"pointer",
            }}
          >
            <ArrowLeft size={17} style={{verticalAlign:"middle",marginRight:7}}/>
            Voltar ao Essencial
          </button>

          <div style={{marginTop:20}}>
            <p style={{margin:"0 0 7px",color:"#c4b5fd",fontWeight:900,fontSize:11,textTransform:"uppercase",letterSpacing:".8px"}}>
              TAP PRO PROFISSIONAL
            </p>

            <h1 style={{margin:0,fontSize:"clamp(28px,6vw,40px)",lineHeight:1.08}}>
              Conecta tudo o que move seu negócio
            </h1>

            <p style={{margin:"10px 0 0",color:"#d1d5db",lineHeight:1.55}}>
              {dados?.display_name||"Sua empresa"} · {trialText}
            </p>
          </div>
        </header>

        {erro&&(
          <div style={{...card,marginTop:18,background:"#fee2e2",color:"#991b1b",border:"1px solid #fecaca"}}>
            {erro}
          </div>
        )}

        {sucesso&&(
          <div style={{...card,marginTop:18,background:"#dcfce7",color:"#166534",border:"1px solid #bbf7d0"}}>
            {sucesso}
          </div>
        )}

        <section style={{...card,marginTop:18}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"start",flexWrap:"wrap"}}>
            <div>
              <p style={{margin:"0 0 6px",fontSize:11,fontWeight:900,color:"#6d28d9",textTransform:"uppercase"}}>
                Biblioteca de conexões
              </p>
              <h2 style={{margin:0}}>Conecte tudo o que sua empresa já usa</h2>
              <p style={{margin:"8px 0 0",color:"#64748b",lineHeight:1.55}}>
                Cadastre uma vez e reutilize em sua página, no destino direto, em campanhas e na programação por horário.
              </p>
            </div>

            <button
              type="button"
              onClick={novaConexao}
              style={{
                minHeight:46,
                padding:"0 15px",
                borderRadius:12,
                border:0,
                background:"#6d28d9",
                color:"#ffffff",
                fontWeight:900,
                cursor:"pointer",
              }}
            >
              <Plus size={18} style={{verticalAlign:"middle",marginRight:7}}/>
              Nova conexão
            </button>
          </div>

          {showConnectionForm&&(
            <div style={{marginTop:18,padding:18,borderRadius:17,background:"#f8fafc",border:"1px solid #e2e8f0"}}>
              <div className="pro-grid">
                <div>
                  <label style={{display:"block",marginBottom:7,fontWeight:800}}>Tipo</label>
                  <select
                    name="link_type"
                    value={connectionForm.link_type}
                    onChange={changeConnection}
                    style={input}
                  >
                    {CONNECTION_TYPES.map(([value,label])=>(
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <Field
                  label="Nome da conexão"
                  name="title"
                  value={connectionForm.title}
                  onChange={changeConnection}
                  placeholder="Ex.: Cardápio completo"
                />

                <Field
                  label="Link"
                  name="url"
                  value={connectionForm.url}
                  onChange={changeConnection}
                  placeholder="https://..."
                />

                <Field
                  label="Descrição opcional"
                  name="description"
                  value={connectionForm.description}
                  onChange={changeConnection}
                  placeholder="Ex.: Veja todos os pratos e preços"
                />
              </div>

              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:16}}>
                <Check
                  label="Mostrar na página"
                  name="show_on_page"
                  checked={connectionForm.show_on_page}
                  onChange={changeConnection}
                />
                <Check
                  label="Destacar conexão"
                  name="is_featured"
                  checked={connectionForm.is_featured}
                  onChange={changeConnection}
                />
                <Check
                  label="Conexão ativa"
                  name="is_active"
                  checked={connectionForm.is_active}
                  onChange={changeConnection}
                />
              </div>

              <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap",marginTop:18}}>
                <button
                  type="button"
                  onClick={()=>{
                    const url=normalizarUrl(connectionForm.url);
                    if(!url){
                      setErro("Informe o link antes de testar.");
                      return;
                    }
                    window.open(url,"_blank","noopener,noreferrer");
                  }}
                  style={secondaryButton}
                >
                  <ExternalLink size={17} style={{verticalAlign:"middle",marginRight:7}}/>
                  Testar link
                </button>

                <button type="button" onClick={cancelarEdicaoConexao} style={secondaryButton}>
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={salvarConexao}
                  disabled={salvandoConexao}
                  style={{
                    ...primaryButton,
                    background:salvandoConexao?"#9ca3af":"#111827",
                    cursor:salvandoConexao?"not-allowed":"pointer",
                  }}
                >
                  {salvandoConexao
                    ?"Salvando..."
                    :editingLinkId
                    ?"Salvar alterações"
                    :"Adicionar conexão"}
                </button>
              </div>
            </div>
          )}

          {links.length===0?(
            <div style={{marginTop:18,padding:22,borderRadius:17,border:"1px dashed #cbd5e1",textAlign:"center",color:"#64748b"}}>
              Nenhuma conexão cadastrada ainda.
            </div>
          ):(
            <div className="pro-link-grid" style={{marginTop:18}}>
              {links.map(link=>(
                <article
                  key={link.id}
                  style={{
                    padding:17,
                    borderRadius:16,
                    border:link.is_featured?"2px solid #8b5cf6":"1px solid #e2e8f0",
                    background:link.is_active?"#ffffff":"#f8fafc",
                    opacity:link.is_active?1:.68,
                  }}
                >
                  <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"start"}}>
                    <div>
                      <span style={{display:"inline-block",padding:"4px 8px",borderRadius:999,background:"#ede9fe",color:"#6d28d9",fontSize:11,fontWeight:900,textTransform:"uppercase"}}>
                        {CONNECTION_TYPES.find(item=>item[0]===link.link_type)?.[1]||"Outro link"}
                      </span>
                      <h3 style={{margin:"10px 0 0",fontSize:17}}>{link.title}</h3>
                    </div>
                    {link.is_featured&&(
                      <span style={{color:"#6d28d9",fontSize:12,fontWeight:900}}>Destaque</span>
                    )}
                  </div>

                  {link.description&&(
                    <p style={{margin:"8px 0 0",color:"#64748b",fontSize:13.5,lineHeight:1.5}}>
                      {link.description}
                    </p>
                  )}

                  <p style={{margin:"10px 0 0",color:"#475569",fontSize:12.5,wordBreak:"break-all"}}>
                    {link.url}
                  </p>

                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>
                    <button
                      type="button"
                      onClick={()=>window.open(normalizarUrl(link.url),"_blank","noopener,noreferrer")}
                      style={smallButton}
                    >
                      <ExternalLink size={15}/>
                      Abrir
                    </button>

                    <button type="button" onClick={()=>editarConexao(link)} style={smallButton}>
                      <Pencil size={15}/>
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={()=>excluirConexao(link)}
                      disabled={excluindoId===link.id}
                      style={{
                        ...smallButton,
                        color:"#b91c1c",
                        cursor:excluindoId===link.id?"not-allowed":"pointer",
                      }}
                    >
                      <Trash2 size={15}/>
                      {excluindoId===link.id?"Excluindo":"Excluir"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={{...card,marginTop:18}}>
          <p style={{margin:"0 0 6px",fontSize:11,fontWeight:900,color:"#6d28d9",textTransform:"uppercase"}}>
            Experiência do cliente
          </p>
          <h2 style={{margin:0}}>Como você quer receber seus clientes?</h2>
          <p style={{margin:"8px 0 0",color:"#64748b",lineHeight:1.55}}>
            Escolha se o cliente deve conhecer sua página completa ou ir direto para uma conexão específica.
          </p>

          <div className="pro-grid" style={{marginTop:18}}>
            <Choice
              selected={form.opening_mode==="page"}
              title="Mostrar minha página TAP PRO"
              description="Apresenta contatos, destaques, informações e todas as conexões da empresa."
              onClick={()=>setForm(current=>({...current,opening_mode:"page"}))}
            />

            <Choice
              selected={form.opening_mode==="direct"}
              title="Levar direto a um destino"
              description="Abre imediatamente uma promoção, cardápio, catálogo, aplicativo ou outro conteúdo."
              onClick={()=>setForm(current=>({...current,opening_mode:"direct"}))}
            />
          </div>

          {form.opening_mode==="direct"&&(
            <div style={{marginTop:16,padding:18,borderRadius:17,background:"#f8fafc",border:"1px solid #e2e8f0"}}>
              <div>
                <label style={{display:"block",marginBottom:7,fontWeight:800}}>
                  Escolha um destino salvo
                </label>
                <select
                  value={
                    links.some(link=>link.url===form.direct_target_url)
                      ? form.direct_target_url
                      : ""
                  }
                  onChange={(event)=>{
                    const selected=links.find(link=>link.url===event.target.value);
                    if(!selected)return;
                    setForm(current=>({
                      ...current,
                      direct_target_title:selected.title||"",
                      direct_target_url:selected.url||"",
                    }));
                  }}
                  style={input}
                >
                  <option value="">Selecione uma conexão</option>
                  {links
                    .filter(link=>link.is_active)
                    .map(link=>(
                      <option key={link.id} value={link.url}>
                        {link.title}
                      </option>
                    ))}
                </select>

                {links.length===0&&(
                  <small style={{display:"block",marginTop:8,color:"#64748b",lineHeight:1.45}}>
                    Cadastre primeiro uma conexão na biblioteca acima.
                  </small>
                )}
              </div>

              <details style={{marginTop:14}}>
                <summary style={{cursor:"pointer",fontWeight:850,color:"#475569"}}>
                  Usar outro link
                </summary>

                <div className="pro-grid" style={{marginTop:14}}>
                  <Field
                    label="Nome do destino"
                    name="direct_target_title"
                    value={form.direct_target_title}
                    onChange={change}
                    placeholder="Ex.: Promoção de julho"
                  />
                  <Field
                    label="Link do destino"
                    name="direct_target_url"
                    value={form.direct_target_url}
                    onChange={change}
                    placeholder="https://..."
                  />
                </div>
              </details>

              <button
                type="button"
                onClick={()=>{
                  const url=normalizarUrl(form.direct_target_url);
                  if(!url){
                    setErro("Escolha uma conexão ou informe um link antes de testar.");
                    return;
                  }
                  window.open(url,"_blank","noopener,noreferrer");
                }}
                style={{
                  minHeight:44,
                  marginTop:14,
                  padding:"0 14px",
                  borderRadius:11,
                  border:"1px solid #cbd5e1",
                  background:"#ffffff",
                  color:"#111827",
                  fontWeight:850,
                  cursor:"pointer",
                }}
              >
                <ExternalLink size={17} style={{verticalAlign:"middle",marginRight:7}}/>
                Testar destino
              </button>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"flex-end",marginTop:18}}>
            <button
              type="button"
              onClick={salvarDestino}
              disabled={salvando}
              style={{
                minHeight:50,
                padding:"0 18px",
                border:0,
                borderRadius:13,
                background:salvando?"#9ca3af":"#111827",
                color:"#ffffff",
                fontWeight:900,
                cursor:salvando?"not-allowed":"pointer",
              }}
            >
              {salvando?"Salvando...":"Salvar destino"}
            </button>
          </div>
        </section>

        <section style={{...card,marginTop:18}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"start",flexWrap:"wrap"}}>
            <div>
              <p style={{margin:"0 0 6px",fontSize:11,fontWeight:900,color:"#6d28d9",textTransform:"uppercase"}}>
                Campanha instantânea
              </p>
              <h2 style={{margin:0}}>Direcione a atenção para o que importa agora</h2>
              <p style={{margin:"8px 0 0",color:"#64748b",lineHeight:1.55}}>
                Ative uma promoção, evento, lançamento ou conteúdo por um período definido.
              </p>
            </div>

            <button
              type="button"
              onClick={novaCampanha}
              style={{
                minHeight:46,
                padding:"0 15px",
                borderRadius:12,
                border:0,
                background:"#6d28d9",
                color:"#ffffff",
                fontWeight:900,
                cursor:"pointer",
              }}
            >
              <Plus size={18} style={{verticalAlign:"middle",marginRight:7}}/>
              Nova campanha
            </button>
          </div>

          {showCampaignForm&&(
            <div style={{marginTop:18,padding:18,borderRadius:17,background:"#f8fafc",border:"1px solid #e2e8f0"}}>
              <div className="pro-grid">
                <Field
                  label="Nome da campanha"
                  name="name"
                  value={campaignForm.name}
                  onChange={changeCampaign}
                  placeholder="Ex.: Promoção de inverno"
                />

                <Field
                  label="Descrição opcional"
                  name="description"
                  value={campaignForm.description}
                  onChange={changeCampaign}
                  placeholder="Ex.: Ofertas válidas por tempo limitado"
                />

                <div>
                  <label style={{display:"block",marginBottom:7,fontWeight:800}}>
                    Destino da campanha
                  </label>
                  <select
                    name="destination_type"
                    value={campaignForm.destination_type}
                    onChange={changeCampaign}
                    style={input}
                  >
                    <option value="saved_link">Conexão salva</option>
                    <option value="url">Outro link</option>
                    <option value="page">Página TAP PRO</option>
                  </select>
                </div>

                {campaignForm.destination_type==="saved_link"&&(
                  <div>
                    <label style={{display:"block",marginBottom:7,fontWeight:800}}>
                      Escolha a conexão
                    </label>
                    <select
                      name="destination_link_id"
                      value={campaignForm.destination_link_id}
                      onChange={changeCampaign}
                      style={input}
                    >
                      <option value="">Selecione</option>
                      {links
                        .filter(link=>link.is_active)
                        .map(link=>(
                          <option key={link.id} value={link.id}>
                            {link.title}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {campaignForm.destination_type==="url"&&(
                  <Field
                    label="Link da campanha"
                    name="destination_url"
                    value={campaignForm.destination_url}
                    onChange={changeCampaign}
                    placeholder="https://..."
                  />
                )}

                <Field
                  label="Início opcional"
                  type="datetime-local"
                  name="starts_at"
                  value={campaignForm.starts_at}
                  onChange={changeCampaign}
                />

                <Field
                  label="Encerramento opcional"
                  type="datetime-local"
                  name="ends_at"
                  value={campaignForm.ends_at}
                  onChange={changeCampaign}
                />

                <div>
                  <label style={{display:"block",marginBottom:7,fontWeight:800}}>
                    Quando terminar
                  </label>
                  <select
                    name="after_end_mode"
                    value={campaignForm.after_end_mode}
                    onChange={changeCampaign}
                    style={input}
                  >
                    <option value="page">Voltar para a página TAP PRO</option>
                    <option value="saved_link">Abrir outra conexão</option>
                    <option value="url">Abrir outro link</option>
                    <option value="none">Nenhuma ação definida</option>
                  </select>
                  <small style={{display:"block",marginTop:7,color:"#64748b",lineHeight:1.45}}>
                    Isso evita deixar uma promoção vencida no ar. O TAP PRO troca o destino automaticamente quando a campanha terminar.
                  </small>
                </div>

                {campaignForm.after_end_mode==="saved_link"&&(
                  <div>
                    <label style={{display:"block",marginBottom:7,fontWeight:800}}>
                      Conexão após o encerramento
                    </label>
                    <select
                      name="after_end_link_id"
                      value={campaignForm.after_end_link_id}
                      onChange={changeCampaign}
                      style={input}
                    >
                      <option value="">Selecione</option>
                      {links
                        .filter(link=>link.is_active)
                        .map(link=>(
                          <option key={link.id} value={link.id}>
                            {link.title}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {campaignForm.after_end_mode==="url"&&(
                  <Field
                    label="Link após o encerramento"
                    name="after_end_url"
                    value={campaignForm.after_end_url}
                    onChange={changeCampaign}
                    placeholder="https://..."
                  />
                )}
              </div>

              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:16}}>
                <Check
                  label="Ativar ao salvar"
                  name="is_active"
                  checked={campaignForm.is_active}
                  onChange={changeCampaign}
                />
              </div>

              <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap",marginTop:18}}>
                <button
                  type="button"
                  onClick={cancelarEdicaoCampanha}
                  style={secondaryButton}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={salvarCampanha}
                  disabled={salvandoCampanha}
                  style={{
                    ...primaryButton,
                    background:salvandoCampanha?"#9ca3af":"#111827",
                    cursor:salvandoCampanha?"not-allowed":"pointer",
                  }}
                >
                  {salvandoCampanha
                    ?"Salvando..."
                    :editingCampaignId
                    ?"Salvar alterações"
                    :"Criar campanha"}
                </button>
              </div>
            </div>
          )}

          {campaigns.length===0?(
            <div style={{marginTop:18,padding:22,borderRadius:17,border:"1px dashed #cbd5e1",textAlign:"center",color:"#64748b"}}>
              Nenhuma campanha criada ainda.
            </div>
          ):(
            <div className="pro-link-grid" style={{marginTop:18}}>
              {campaigns.map(campaign=>{
                const destinationLink=links.find(link=>link.id===campaign.destination_link_id);
                const destinationLabel=
                  campaign.destination_type==="page"
                    ?"Página TAP PRO"
                    :campaign.destination_type==="saved_link"
                    ?destinationLink?.title||"Conexão salva"
                    :campaign.destination_url||"Outro link";

                return (
                  <article
                    key={campaign.id}
                    style={{
                      padding:17,
                      borderRadius:16,
                      border:campaign.is_active?"2px solid #8b5cf6":"1px solid #e2e8f0",
                      background:campaign.is_active?"#f5f3ff":"#ffffff",
                    }}
                  >
                    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"start"}}>
                      <div>
                        <span style={{display:"inline-block",padding:"4px 8px",borderRadius:999,background:campaign.is_active?"#6d28d9":"#e2e8f0",color:campaign.is_active?"#ffffff":"#475569",fontSize:11,fontWeight:900,textTransform:"uppercase"}}>
                          {campaign.is_active?"Campanha ativa":campaign.status||"Rascunho"}
                        </span>
                        <h3 style={{margin:"10px 0 0",fontSize:17}}>{campaign.name}</h3>
                      </div>
                    </div>

                    {campaign.description&&(
                      <p style={{margin:"8px 0 0",color:"#64748b",fontSize:13.5,lineHeight:1.5}}>
                        {campaign.description}
                      </p>
                    )}

                    <p style={{margin:"10px 0 0",color:"#475569",fontSize:13}}>
                      Destino: <strong>{destinationLabel}</strong>
                    </p>

                    {(campaign.starts_at||campaign.ends_at)&&(
                      <p style={{margin:"7px 0 0",color:"#64748b",fontSize:12.5,lineHeight:1.45}}>
                        {campaign.starts_at
                          ?`Início: ${new Date(campaign.starts_at).toLocaleString("pt-BR")}`
                          :"Início imediato"}
                        <br/>
                        {campaign.ends_at
                          ?`Fim: ${new Date(campaign.ends_at).toLocaleString("pt-BR")}`
                          :"Sem data de encerramento"}
                      </p>
                    )}

                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>
                      <button
                        type="button"
                        onClick={()=>alterarCampanha(campaign,!campaign.is_active)}
                        disabled={alterandoCampanhaId===campaign.id}
                        style={{
                          ...smallButton,
                          color:campaign.is_active?"#b45309":"#166534",
                          cursor:alterandoCampanhaId===campaign.id?"not-allowed":"pointer",
                        }}
                      >
                        {campaign.is_active?"Pausar":"Ativar"}
                      </button>

                      <button
                        type="button"
                        onClick={()=>editarCampanha(campaign)}
                        style={smallButton}
                      >
                        <Pencil size={15}/>
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={()=>excluirCampanha(campaign)}
                        disabled={excluindoCampanhaId===campaign.id}
                        style={{
                          ...smallButton,
                          color:"#b91c1c",
                          cursor:excluindoCampanhaId===campaign.id?"not-allowed":"pointer",
                        }}
                      >
                        <Trash2 size={15}/>
                        {excluindoCampanhaId===campaign.id?"Excluindo":"Excluir"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section style={{...card,marginTop:18}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"start",flexWrap:"wrap"}}>
            <div>
              <p style={{margin:"0 0 6px",fontSize:11,fontWeight:900,color:"#6d28d9",textTransform:"uppercase"}}>
                Programação por horário
              </p>
              <h2 style={{margin:0}}>Mostre o destino certo em cada momento</h2>
              <p style={{margin:"8px 0 0",color:"#64748b",lineHeight:1.55}}>
                Escolha dias, horários e o conteúdo que deve abrir automaticamente.
              </p>
            </div>

            <button
              type="button"
              onClick={novaProgramacao}
              style={{
                minHeight:46,
                padding:"0 15px",
                borderRadius:12,
                border:0,
                background:"#6d28d9",
                color:"#ffffff",
                fontWeight:900,
                cursor:"pointer",
              }}
            >
              <Plus size={18} style={{verticalAlign:"middle",marginRight:7}}/>
              Nova programação
            </button>
          </div>

          {showScheduleForm&&(
            <div style={{marginTop:18,padding:18,borderRadius:17,background:"#f8fafc",border:"1px solid #e2e8f0"}}>
              <div className="pro-grid">
                <Field
                  label="Nome da programação"
                  name="name"
                  value={scheduleForm.name}
                  onChange={changeSchedule}
                  placeholder="Ex.: Cardápio do almoço"
                />

                <div>
                  <label style={{display:"block",marginBottom:7,fontWeight:800}}>
                    Destino
                  </label>
                  <select
                    name="destination_type"
                    value={scheduleForm.destination_type}
                    onChange={changeSchedule}
                    style={input}
                  >
                    <option value="saved_link">Conexão salva</option>
                    <option value="url">Outro link</option>
                    <option value="page">Página TAP PRO</option>
                  </select>
                </div>

                {scheduleForm.destination_type==="saved_link"&&(
                  <div>
                    <label style={{display:"block",marginBottom:7,fontWeight:800}}>
                      Escolha a conexão
                    </label>
                    <select
                      name="destination_link_id"
                      value={scheduleForm.destination_link_id}
                      onChange={changeSchedule}
                      style={input}
                    >
                      <option value="">Selecione</option>
                      {links
                        .filter(link=>link.is_active)
                        .map(link=>(
                          <option key={link.id} value={link.id}>
                            {link.title}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {scheduleForm.destination_type==="url"&&(
                  <Field
                    label="Link do destino"
                    name="destination_url"
                    value={scheduleForm.destination_url}
                    onChange={changeSchedule}
                    placeholder="https://..."
                  />
                )}

                <Field
                  label="Início"
                  type="time"
                  name="start_time"
                  value={scheduleForm.start_time}
                  onChange={changeSchedule}
                />

                <Field
                  label="Término"
                  type="time"
                  name="end_time"
                  value={scheduleForm.end_time}
                  onChange={changeSchedule}
                />
              </div>

              <div style={{marginTop:16}}>
                <label style={{display:"block",marginBottom:9,fontWeight:800}}>
                  Dias da semana
                </label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {WEEK_DAYS.map(([value,label])=>{
                    const selected=scheduleForm.days_of_week.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={()=>toggleScheduleDay(value)}
                        style={{
                          minWidth:48,
                          minHeight:40,
                          padding:"0 10px",
                          borderRadius:10,
                          border:selected?"2px solid #6d28d9":"1px solid #d1d5db",
                          background:selected?"#f5f3ff":"#ffffff",
                          color:"#111827",
                          fontWeight:850,
                          cursor:"pointer",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:16}}>
                <Check
                  label="Programação ativa"
                  name="is_active"
                  checked={scheduleForm.is_active}
                  onChange={changeSchedule}
                />
              </div>

              <small style={{display:"block",marginTop:12,color:"#64748b",lineHeight:1.45}}>
                Fora dos horários programados, o TAP PRO abre a página normal. Campanhas ativas têm prioridade sobre a programação por horário.
              </small>

              <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap",marginTop:18}}>
                <button
                  type="button"
                  onClick={cancelarEdicaoProgramacao}
                  style={secondaryButton}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={salvarProgramacao}
                  disabled={salvandoProgramacao}
                  style={{
                    ...primaryButton,
                    background:salvandoProgramacao?"#9ca3af":"#111827",
                    cursor:salvandoProgramacao?"not-allowed":"pointer",
                  }}
                >
                  {salvandoProgramacao
                    ?"Salvando..."
                    :editingScheduleId
                    ?"Salvar alterações"
                    :"Criar programação"}
                </button>
              </div>
            </div>
          )}

          {scheduleRules.length===0?(
            <div style={{marginTop:18,padding:22,borderRadius:17,border:"1px dashed #cbd5e1",textAlign:"center",color:"#64748b"}}>
              Nenhuma programação criada ainda.
            </div>
          ):(
            <div className="pro-link-grid" style={{marginTop:18}}>
              {scheduleRules.map(rule=>{
                const destinationLink=links.find(link=>link.id===rule.destination_link_id);
                const destinationLabel=
                  rule.destination_type==="page"
                    ?"Página TAP PRO"
                    :rule.destination_type==="saved_link"
                    ?destinationLink?.title||"Conexão salva"
                    :rule.destination_url||"Outro link";

                const days=(rule.days_of_week||[])
                  .map(day=>WEEK_DAYS.find(item=>item[0]===Number(day))?.[1])
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article
                    key={rule.id}
                    style={{
                      padding:17,
                      borderRadius:16,
                      border:rule.is_active?"2px solid #8b5cf6":"1px solid #e2e8f0",
                      background:rule.is_active?"#f5f3ff":"#ffffff",
                    }}
                  >
                    <span style={{display:"inline-block",padding:"4px 8px",borderRadius:999,background:rule.is_active?"#6d28d9":"#e2e8f0",color:rule.is_active?"#ffffff":"#475569",fontSize:11,fontWeight:900,textTransform:"uppercase"}}>
                      {rule.is_active?"Ativa":"Pausada"}
                    </span>

                    <h3 style={{margin:"10px 0 0",fontSize:17}}>{rule.name}</h3>

                    <p style={{margin:"9px 0 0",color:"#475569",fontSize:13.5,lineHeight:1.5}}>
                      <strong>{days}</strong><br/>
                      {String(rule.start_time||"").slice(0,5)} até {String(rule.end_time||"").slice(0,5)}
                    </p>

                    <p style={{margin:"8px 0 0",color:"#64748b",fontSize:13}}>
                      Destino: <strong>{destinationLabel}</strong>
                    </p>

                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>
                      <button
                        type="button"
                        onClick={()=>alterarProgramacao(rule,!rule.is_active)}
                        disabled={alterandoProgramacaoId===rule.id}
                        style={{
                          ...smallButton,
                          color:rule.is_active?"#b45309":"#166534",
                          cursor:alterandoProgramacaoId===rule.id?"not-allowed":"pointer",
                        }}
                      >
                        {rule.is_active?"Pausar":"Ativar"}
                      </button>

                      <button
                        type="button"
                        onClick={()=>editarProgramacao(rule)}
                        style={smallButton}
                      >
                        <Pencil size={15}/>
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={()=>excluirProgramacao(rule)}
                        disabled={excluindoProgramacaoId===rule.id}
                        style={{
                          ...smallButton,
                          color:"#b91c1c",
                          cursor:excluindoProgramacaoId===rule.id?"not-allowed":"pointer",
                        }}
                      >
                        <Trash2 size={15}/>
                        {excluindoProgramacaoId===rule.id?"Excluindo":"Excluir"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section style={{...card,marginTop:18}}>
          <p style={{margin:"0 0 6px",fontSize:11,fontWeight:900,color:"#6d28d9",textTransform:"uppercase"}}>
            Plano Profissional
          </p>
          <h2 style={{margin:0}}>
            Escolha a melhor forma de pagamento
          </h2>
          <p style={{margin:"8px 0 0",color:"#64748b",lineHeight:1.55}}>
            Mensal no cartão com 30 dias grátis ou anual no Pix com economia de R$ 208.
          </p>

          {resumoCobranca?.professional_enabled&&(
            <div style={{marginTop:16,padding:14,borderRadius:14,background:"#ecfdf5",border:"1px solid #a7f3d0",color:"#065f46"}}>
              <strong>Plano Profissional ativo</strong>
              <div style={{marginTop:5,fontSize:13}}>
                {resumoCobranca.billing_cycle==="annual"
                  ?`Anual vigente${resumoCobranca.annual_days_remaining!=null?` por mais ${resumoCobranca.annual_days_remaining} dias`:""}.`
                  :resumoCobranca.subscription_status==="trial"
                  ?`Período gratuito${resumoCobranca.trial_days_remaining!=null?` por mais ${resumoCobranca.trial_days_remaining} dias`:""}.`
                  :"Assinatura mensal ativa."}
              </div>
            </div>
          )}


          {!billingState.canPurchase&&(
            <div
              style={{
                marginTop:14,
                padding:16,
                borderRadius:14,
                background:
                  billingState.status==="past_due"
                    ?"#fff7ed"
                    :"#f8fafc",
                border:
                  billingState.status==="past_due"
                    ?"1px solid #fdba74"
                    :"1px solid #cbd5e1",
                color:
                  billingState.status==="past_due"
                    ?"#9a3412"
                    :"#334155",
              }}
            >
              <strong>
                {billingState.title}
              </strong>
              <div style={{marginTop:6,fontSize:13.5,lineHeight:1.5}}>
                {billingState.message}
              </div>
            </div>
          )}

          <label style={{display:"block",marginTop:18,fontWeight:850}}>
            E-mail para o pagamento
          </label>
          <input
            ref={emailPagamentoRef}
            type="email"
            disabled={!billingState.canPurchase}
            value={emailPagamento}
            onChange={event=>{
              setEmailPagamento(event.target.value);
              if(erroEmailPagamento){
                setErroEmailPagamento("");
              }
            }}
            placeholder="Digite seu e-mail"
            aria-invalid={Boolean(erroEmailPagamento)}
            style={{
              width:"100%",
              minHeight:48,
              marginTop:7,
              padding:"0 14px",
              borderRadius:12,
              border:erroEmailPagamento
                ?"2px solid #dc2626"
                :"1px solid #cbd5e1",
              background:!billingState.canPurchase
                ?"#f1f5f9"
                :erroEmailPagamento
                ?"#fff7f7"
                :"#ffffff",
              color:!billingState.canPurchase
                ?"#64748b"
                :"#111827",
              cursor:!billingState.canPurchase
                ?"not-allowed"
                :"text",
              fontSize:15,
              boxSizing:"border-box",
              outline:"none",
            }}
          />

          {erroEmailPagamento&&(
            <div
              role="alert"
              style={{
                marginTop:8,
                padding:"10px 12px",
                borderRadius:10,
                background:"#fef2f2",
                border:"1px solid #fecaca",
                color:"#b91c1c",
                fontSize:13,
                fontWeight:800,
                lineHeight:1.4,
              }}
            >
              {erroEmailPagamento}
            </div>
          )}

          <small style={{display:"block",marginTop:6,color:"#64748b"}}>
            Preencha o e-mail antes de escolher mensal ou anual.
          </small>

          <div className="pro-grid" style={{marginTop:18}}>
            <article style={{padding:20,borderRadius:18,border:"1px solid #dbe3ec",background:"#ffffff"}}>
              <span style={{display:"inline-block",padding:"5px 9px",borderRadius:999,background:"#ede9fe",color:"#6d28d9",fontSize:11,fontWeight:900}}>
                30 DIAS GRÁTIS
              </span>
              <h3 style={{margin:"14px 0 0",fontSize:22}}>
                Mensal no cartão
              </h3>
              <div style={{marginTop:10}}>
                <strong style={{fontSize:34,lineHeight:1}}>
                  R$ 59
                </strong>
                <span style={{color:"#64748b"}}>/mês</span>
              </div>
              <p style={{margin:"12px 0 0",color:"#64748b",lineHeight:1.55}}>
                Cobrança recorrente após o período gratuito. Renovação automática.
              </p>
              <button
                type="button"
                onClick={iniciarMensal}
                disabled={
                  !billingState.canPurchase||
                  Boolean(processandoPagamento)
                }
                style={{
                  ...primaryButton,
                  width:"100%",
                  marginTop:17,
                  background:
                    !billingState.canPurchase||
                    processandoPagamento
                      ?"#9ca3af"
                      :"#111827",
                  cursor:
                    !billingState.canPurchase||
                    processandoPagamento
                      ?"not-allowed"
                      :"pointer",
                }}
              >
                {!billingState.canPurchase
                  ?"Contratação indisponível"
                  :processandoPagamento==="monthly"
                  ?"Abrindo checkout..."
                  :"Começar 30 dias grátis"}
              </button>
            </article>

            <article style={{padding:20,borderRadius:18,border:"2px solid #6d28d9",background:"#f5f3ff",position:"relative"}}>
              <span style={{display:"inline-block",padding:"5px 9px",borderRadius:999,background:"#6d28d9",color:"#ffffff",fontSize:11,fontWeight:900}}>
                MELHOR ECONOMIA
              </span>
              <h3 style={{margin:"14px 0 0",fontSize:22}}>
                Anual no Pix
              </h3>
              <div style={{marginTop:10}}>
                <strong style={{fontSize:34,lineHeight:1}}>
                  R$ 500
                </strong>
                <span style={{color:"#64748b"}}>/12 meses</span>
              </div>
              <p style={{margin:"12px 0 0",color:"#64748b",lineHeight:1.55}}>
                Pagamento único. Sem renovação automática. Economize R$ 208.
              </p>
              <button
                type="button"
                onClick={iniciarAnual}
                disabled={
                  !billingState.canPurchase||
                  Boolean(processandoPagamento)
                }
                style={{
                  ...primaryButton,
                  width:"100%",
                  marginTop:17,
                  background:
                    !billingState.canPurchase||
                    processandoPagamento
                      ?"#9ca3af"
                      :"#6d28d9",
                  cursor:
                    !billingState.canPurchase||
                    processandoPagamento
                      ?"not-allowed"
                      :"pointer",
                }}
              >
                {!billingState.canPurchase
                  ?"Contratação indisponível"
                  :processandoPagamento==="annual"
                  ?"Gerando Pix..."
                  :"Pagar R$ 500 no Pix"}
              </button>
            </article>
          </div>

          {pixAnual&&(
            <div style={{marginTop:20,padding:20,borderRadius:18,background:"#111827",color:"#ffffff"}}>
              <p style={{margin:0,fontSize:11,fontWeight:900,color:"#c4b5fd",textTransform:"uppercase"}}>
                Pix anual gerado
              </p>
              <h3 style={{margin:"7px 0 0",fontSize:23}}>
                Escaneie ou copie o código
              </h3>

              {pixAnual.qrCodeBase64&&(
                <div style={{display:"flex",justifyContent:"center",marginTop:18}}>
                  <img
                    src={`data:image/png;base64,${pixAnual.qrCodeBase64}`}
                    alt="QR Code Pix anual"
                    style={{
                      width:220,
                      maxWidth:"100%",
                      padding:10,
                      borderRadius:14,
                      background:"#ffffff",
                    }}
                  />
                </div>
              )}

              <textarea
                readOnly
                value={pixAnual.qrCode||""}
                style={{
                  width:"100%",
                  minHeight:100,
                  marginTop:16,
                  padding:12,
                  borderRadius:12,
                  border:"1px solid #374151",
                  background:"#030712",
                  color:"#e5e7eb",
                  resize:"vertical",
                  boxSizing:"border-box",
                }}
              />

              <button
                type="button"
                onClick={copiarCodigoPix}
                style={{
                  ...primaryButton,
                  width:"100%",
                  marginTop:10,
                  background:"#ffffff",
                  color:"#111827",
                }}
              >
                {copiouPix
                  ?"Código Pix copiado"
                  :"Copiar Pix Copia e Cola"}
              </button>

              <small style={{display:"block",marginTop:12,color:"#cbd5e1",lineHeight:1.5}}>
                Após a aprovação, o webhook libera automaticamente 12 meses do Plano Profissional.
              </small>
            </div>
          )}
        </section>

        <section style={{...card,marginTop:18}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"start",flexWrap:"wrap"}}>
            <div>
              <p style={{margin:"0 0 6px",fontSize:11,fontWeight:900,color:"#6d28d9",textTransform:"uppercase"}}>
                Métricas
              </p>
              <h2 style={{margin:0}}>Entenda como os clientes usam seu TAP PRO</h2>
              <p style={{margin:"8px 0 0",color:"#64748b",lineHeight:1.55}}>
                Acompanhe acessos, interações e as ações que mais despertam interesse.
              </p>
            </div>

            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[7,30,90].map(days=>(
                <button
                  key={days}
                  type="button"
                  onClick={()=>carregarMetricas(days)}
                  disabled={carregandoMetricas}
                  style={{
                    minHeight:40,
                    padding:"0 12px",
                    borderRadius:10,
                    border:periodoMetricas===days?"2px solid #6d28d9":"1px solid #d1d5db",
                    background:periodoMetricas===days?"#f5f3ff":"#ffffff",
                    color:"#111827",
                    fontWeight:850,
                    cursor:carregandoMetricas?"not-allowed":"pointer",
                  }}
                >
                  {days} dias
                </button>
              ))}
            </div>
          </div>

          <div className="pro-grid" style={{marginTop:18}}>
            <MetricCard
              label="Acessos"
              value={metricas?.views||0}
              helper={`Últimos ${metricas?.period_days||periodoMetricas} dias`}
            />
            <MetricCard
              label="Visitantes estimados"
              value={metricas?.unique_sessions||0}
              helper="Sessões diferentes"
            />
            <MetricCard
              label="Interações"
              value={metricas?.interactions||0}
              helper="Cliques e ações"
            />
            <MetricCard
              label="Redirecionamentos"
              value={metricas?.redirects||0}
              helper="Destino direto, campanha ou horário"
            />
          </div>

          <div style={{marginTop:18,padding:18,borderRadius:17,background:"#f8fafc",border:"1px solid #e2e8f0"}}>
            <strong style={{display:"block"}}>
              Ação mais usada
            </strong>
            <p style={{margin:"7px 0 0",fontSize:22,fontWeight:900,color:"#6d28d9"}}>
              {metricas?.top_action?.module_code
                ? nomeMetrica(metricas.top_action.module_code)
                :"Ainda sem interações"}
            </p>
            {metricas?.top_action?.clicks>0&&(
              <small style={{color:"#64748b"}}>
                {metricas.top_action.clicks} interações no período
              </small>
            )}
          </div>

          {Array.isArray(metricas?.by_action)&&metricas.by_action.length>0&&(
            <div style={{marginTop:18}}>
              <h3 style={{margin:"0 0 10px",fontSize:17}}>
                Interações por ação
              </h3>

              <div style={{display:"grid",gap:9}}>
                {metricas.by_action.map(item=>(
                  <div
                    key={item.module_code}
                    style={{
                      minHeight:48,
                      padding:"10px 13px",
                      borderRadius:12,
                      border:"1px solid #e2e8f0",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"space-between",
                      gap:12,
                    }}
                  >
                    <span style={{fontWeight:800}}>
                      {nomeMetrica(item.module_code)}
                    </span>
                    <strong>{item.clicks}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <small style={{display:"block",marginTop:15,color:"#64748b",lineHeight:1.45}}>
            As métricas começam a contar após esta atualização. Não coletamos nomes, telefones ou mensagens dos visitantes.
          </small>
        </section>

        <section style={{...card,marginTop:18}}>
          <p style={{margin:"0 0 6px",fontSize:11,fontWeight:900,color:"#6d28d9",textTransform:"uppercase"}}>
            Visuais premium
          </p>
          <h2 style={{margin:0}}>Escolha uma experiência exclusiva</h2>
          <p style={{margin:"8px 0 0",color:"#64748b",lineHeight:1.55}}>
            Seu visual atual continua disponível. A mudança só acontece quando você selecionar e salvar.
          </p>

          <div className="pro-grid" style={{marginTop:18}}>
            {PREMIUM_THEMES.map(theme=>{
              const selected=visualSelecionado===theme.code;

              return (
                <button
                  key={theme.code}
                  type="button"
                  onClick={()=>setVisualSelecionado(theme.code)}
                  style={{
                    padding:14,
                    borderRadius:17,
                    border:selected?"2px solid #6d28d9":"1px solid #d1d5db",
                    background:selected?"#f5f3ff":"#ffffff",
                    color:"#111827",
                    textAlign:"left",
                    cursor:"pointer",
                  }}
                >
                  <div
                    style={{
                      height:130,
                      borderRadius:13,
                      background:theme.preview,
                      border:"1px solid rgba(148,163,184,.35)",
                      position:"relative",
                      overflow:"hidden",
                    }}
                  >
                    {theme.code==="parametric"&&(
                      <>
                        <div style={{position:"absolute",inset:"18px 24px",border:"1px solid rgba(255,255,255,.22)",borderRadius:"50%"}}/>
                        <div style={{position:"absolute",inset:"34px 12px",border:"1px solid rgba(255,255,255,.15)",borderRadius:"50%"}}/>
                      </>
                    )}

                    {theme.code==="bento_premium"&&(
                      <div style={{position:"absolute",inset:10,display:"grid",gridTemplateColumns:"1.2fr .8fr",gridTemplateRows:"1fr 1fr",gap:7}}>
                        <div style={{gridRow:"1 / 3",borderRadius:9,background:"rgba(255,255,255,.18)"}}/>
                        <div style={{borderRadius:9,background:"rgba(255,255,255,.28)"}}/>
                        <div style={{borderRadius:9,background:"rgba(255,255,255,.12)"}}/>
                      </div>
                    )}

                    {theme.code==="minimal_brand"&&(
                      <div style={{position:"absolute",left:18,right:18,top:22}}>
                        <div style={{width:38,height:38,border:"1px solid #cbd5e1"}}/>
                        <div style={{width:"58%",height:8,marginTop:16,background:"#111827"}}/>
                        <div style={{width:"82%",height:5,marginTop:9,background:"#cbd5e1"}}/>
                        <div style={{width:"70%",height:5,marginTop:6,background:"#e2e8f0"}}/>
                      </div>
                    )}
                  </div>

                  <strong style={{display:"block",marginTop:12,fontSize:16}}>
                    {theme.name}
                  </strong>
                  <small style={{display:"block",marginTop:5,color:"#64748b",lineHeight:1.45}}>
                    {theme.description}
                  </small>

                  {selected&&(
                    <span style={{display:"inline-block",marginTop:9,padding:"4px 8px",borderRadius:999,background:"#6d28d9",color:"#ffffff",fontSize:11,fontWeight:900}}>
                      Selecionado
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap",marginTop:18}}>
            <button
              type="button"
              onClick={()=>{
                const url=`${window.location.origin}/pro/empresa/${dados?.piece_code}`;
                window.open(url,"_blank","noopener,noreferrer");
              }}
              style={secondaryButton}
            >
              <ExternalLink size={17} style={{verticalAlign:"middle",marginRight:7}}/>
              Ver página atual
            </button>

            <button
              type="button"
              onClick={salvarVisual}
              disabled={salvandoVisual}
              style={{
                ...primaryButton,
                background:salvandoVisual?"#9ca3af":"#111827",
                cursor:salvandoVisual?"not-allowed":"pointer",
              }}
            >
              {salvandoVisual?"Salvando...":"Salvar visual"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

const primaryButton={
  minHeight:44,
  padding:"0 15px",
  border:0,
  borderRadius:11,
  color:"#ffffff",
  fontWeight:850,
};

const secondaryButton={
  minHeight:44,
  padding:"0 14px",
  borderRadius:11,
  border:"1px solid #cbd5e1",
  background:"#ffffff",
  color:"#111827",
  fontWeight:850,
  cursor:"pointer",
};

const smallButton={
  minHeight:38,
  padding:"0 11px",
  borderRadius:10,
  border:"1px solid #d1d5db",
  background:"#ffffff",
  color:"#111827",
  fontWeight:800,
  cursor:"pointer",
  display:"inline-flex",
  alignItems:"center",
  gap:6,
};

function Choice({selected,title,description,onClick}){
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width:"100%",
        minHeight:86,
        padding:16,
        borderRadius:16,
        border:selected?"2px solid #6d28d9":"1px solid #d1d5db",
        background:selected?"#f5f3ff":"#ffffff",
        color:"#111827",
        textAlign:"left",
        cursor:"pointer",
      }}
    >
      <strong style={{display:"block",fontSize:15.5}}>{title}</strong>
      <small style={{display:"block",marginTop:5,color:"#64748b",lineHeight:1.45}}>
        {description}
      </small>
    </button>
  );
}

function MetricCard({label,value,helper}){
  return (
    <article
      style={{
        padding:18,
        borderRadius:16,
        background:"#111827",
        color:"#ffffff",
      }}
    >
      <small style={{display:"block",color:"#cbd5e1",fontWeight:800}}>
        {label}
      </small>
      <strong style={{display:"block",marginTop:8,fontSize:30,lineHeight:1}}>
        {Number(value||0).toLocaleString("pt-BR")}
      </strong>
      <small style={{display:"block",marginTop:8,color:"#94a3b8"}}>
        {helper}
      </small>
    </article>
  );
}

function Feature({icon,title,text}){
  return (
    <article style={{padding:17,borderRadius:16,background:"#f8fafc",border:"1px solid #e2e8f0"}}>
      <div style={{width:42,height:42,borderRadius:12,display:"grid",placeItems:"center",background:"#ede9fe",color:"#6d28d9"}}>
        {icon}
      </div>
      <strong style={{display:"block",marginTop:12}}>{title}</strong>
      <p style={{margin:"6px 0 0",color:"#64748b",fontSize:13.5,lineHeight:1.5}}>
        {text}
      </p>
    </article>
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

function Check({label,...props}){
  return (
    <label style={{display:"inline-flex",alignItems:"center",gap:8,fontWeight:800,cursor:"pointer"}}>
      <input type="checkbox" {...props}/>
      {label}
    </label>
  );
}

function Tela({children}){
  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f5f2ec",fontFamily:"Inter,Arial,sans-serif"}}>
      <section style={{padding:28,borderRadius:20,background:"#ffffff",textAlign:"center"}}>
        {children}
      </section>
    </main>
  );
}