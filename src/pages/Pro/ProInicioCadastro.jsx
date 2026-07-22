import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  Clock3,
  MapPin,
  MessageCircle,
  Palette,
  Share2,
  Sparkles,
  Star,
  Wifi,
  Phone,
  QrCode,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  codigoAdminProValido,
  getInicioPerfilPorAcessoPro,
  limparCodigoPro,
  obterAcessoAdminPro,
  salvarCadastroInicialEmpresaPro,
  uploadImagemPro,
} from "../../lib/tappro";

function InstagramIcon({ size = 22, strokeWidth = 2 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

const GOALS = [
  { code: "auto", title: "Automático", description: "O TAP PRO escolhe a melhor ação disponível.", icon: Bot },
  { code: "whatsapp", title: "Gerar contatos", description: "Conduz o visitante para o WhatsApp.", icon: MessageCircle },
  { code: "instagram", title: "Ganhar seguidores", description: "Conduz o visitante para o Instagram.", icon: InstagramIcon },
  { code: "google_review", title: "Receber avaliações", description: "Conduz o visitante para avaliar no Google.", icon: Star },
  { code: "maps", title: "Levar clientes ao local", description: "Conduz o visitante para abrir a rota.", icon: MapPin },
  { code: "information", title: "Divulgar informações", description: "Apresenta contatos e informações de forma equilibrada.", icon: Building2 },
];

const HIGHLIGHTS = [
  { code: "whatsapp", name: "WhatsApp", description: "Leva o cliente direto para uma conversa.", icon: MessageCircle },
  { code: "instagram", name: "Instagram", description: "Ajuda a conquistar novos seguidores.", icon: InstagramIcon },
  { code: "google_review", name: "Avaliação no Google", description: "Facilita novas avaliações.", icon: Star },
  { code: "maps", name: "Localização", description: "Abre automaticamente o endereço no Maps.", icon: MapPin },
  { code: "phone", name: "Telefone", description: "Permite uma ligação direta.", icon: Phone },
  { code: "wifi", name: "Wi-Fi", description: "Mostra a rede e a senha aos clientes.", icon: Wifi },
  { code: "pix", name: "Pix", description: "Facilita copiar a chave Pix.", icon: QrCode },
  { code: "business_hours", name: "Horário", description: "Mostra quando a empresa atende.", icon: Clock3 },
];

const THEMES = [
  { code: "classic", name: "Clássica", description: "Elegante, sólida e tradicional.", preview: "linear-gradient(135deg,#201d18,#8a641f)" },
  { code: "modern", name: "Moderna", description: "Atual, limpa e equilibrada.", preview: "linear-gradient(135deg,#111827,#64748b)" },
  { code: "futuristic", name: "Futurista", description: "Tecnológica, marcante e ousada.", preview: "linear-gradient(135deg,#09090b,#6d28d9)" },
  { code: "minimalist", name: "Minimalista", description: "Leve, clara e focada no essencial.", preview: "linear-gradient(135deg,#f8fafc,#cbd5e1)" },
];

const PROFESSIONAL = [
  "Site", "Cardápio", "Catálogo", "Promoções", "Delivery e pedidos",
  "Orçamento", "Agendamento e reservas", "Links de pagamento",
  "Portfólio e PDFs", "Aplicativo e links externos", "Métricas, campanhas e temas",
];

const initialForm = {
  display_name: "", description: "", logo_url: "",
  primary_goal: "auto", page_template: "modern",
  whatsapp: "", whatsapp_message: "", show_whatsapp: true,
  phone: "", show_phone: false,
  instagram: "", show_instagram: false,
  google_review_url: "", show_google_review: false,
  pix_key: "", show_pix: false,
  wifi_ssid: "", wifi_password: "", show_wifi: false,
  business_hours: "", show_business_hours: false,
  address_postal_code: "", address_street: "", address_number: "",
  address_complement: "", address_neighborhood: "", address_city: "",
  address_state: "", maps_url: "", show_maps: false,
  show_save_contact: true, show_share_page: true,
};

const input = {
  width: "100%", minHeight: 48, padding: "12px 13px", borderRadius: 12,
  border: "1px solid #d1d5db", background: "#fff", color: "#111827",
  fontSize: 15, boxSizing: "border-box",
};
const card = {
  marginTop: 18, padding: 22, borderRadius: 22, background: "#fff",
  border: "1px solid #e5e7eb", boxShadow: "0 12px 30px rgba(0,0,0,.06)",
};

function digits(v) { return String(v || "").replace(/\D/g, ""); }


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

export default function ProInicioCadastro() {
  const { accessCode } = useParams();
  const navigate = useNavigate();
  const cleanCode = limparCodigoPro(accessCode);

  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [top3, setTop3] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      if (!codigoAdminProValido(cleanCode)) {
        setErro("Código administrativo inválido."); setLoading(false); return;
      }
      if (obterAcessoAdminPro() !== cleanCode) {
        setErro("Este acesso administrativo não está autorizado neste aparelho.");
        setLoading(false); return;
      }
      const { data, error } = await getInicioPerfilPorAcessoPro(cleanCode);
      if (error || !data?.found) {
        setErro("Não foi possível carregar o cadastro."); setLoading(false); return;
      }
      setDados(data); setLoading(false);
    })();
  }, [cleanCode]);

  useEffect(() => {
    if (dados?.profile_type === "professional") {
      navigate(`/pro/profissional/cadastro/${cleanCode}`, { replace: true });
    }
  }, [dados?.profile_type, cleanCode, navigate]);

  const selectedNames = useMemo(
    () => top3.map(code => HIGHLIGHTS.find(item => item.code === code)?.name || code),
    [top3]
  );

  function change(e) {
    const { name, value, type, checked } = e.target;
    setForm(current => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function toggle(code) {
    setErro("");
    setTop3(current => {
      if (current.includes(code)) return current.filter(item => item !== code);
      if (current.length >= 3) {
        setErro("Você já escolheu 3 destaques. Desmarque um para trocar.");
        return current;
      }
      return [...current, code];
    });
  }

  function chooseGoal(goal) {
    setForm(current => ({ ...current, primary_goal: goal }));
    const suggested = {
      whatsapp: "whatsapp",
      instagram: "instagram",
      google_review: "google_review",
      maps: "maps",
    }[goal];

    if (suggested) {
      setTop3(current => current.includes(suggested)
        ? current
        : [suggested, ...current].slice(0, 3));
    }
  }

  function chooseTheme(theme) {
    setForm(current => ({ ...current, page_template: theme }));
  }

  function logo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErro("Escolha uma imagem válida."); return; }
    if (file.size > 8 * 1024 * 1024) { setErro("A imagem deve ter no máximo 8 MB."); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function validate() {
    if (!form.display_name.trim()) return "Informe o nome da empresa.";
    const w = digits(form.whatsapp);
    if (w.length < 10 || w.length > 13) return "Informe um WhatsApp válido com DDD.";
    if (top3.includes("instagram") && !form.instagram.trim()) return "Preencha o Instagram.";
    if (top3.includes("google_review") && !form.google_review_url.trim()) return "Preencha o link de avaliação.";
    if (top3.includes("pix") && !form.pix_key.trim()) return "Preencha a chave Pix.";
    if (top3.includes("wifi") && !form.wifi_ssid.trim()) return "Preencha o nome do Wi-Fi.";
    if (top3.includes("phone") && !digits(form.phone)) return "Preencha o telefone.";
    if (top3.includes("business_hours") && !form.business_hours.trim()) return "Preencha o horário.";
    if (top3.includes("maps") && !form.address_street.trim()) return "Preencha o endereço para gerar a localização.";
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setErro(validation);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErro("");
    setSalvando(true);

    let logoUrl = form.logo_url;
    if (logoFile) {
      const result = await uploadImagemPro(cleanCode, logoFile, "logo");
      if (result.error) {
        setErro("Não foi possível enviar o logo. Verifique o armazenamento e tente novamente.");
        setSalvando(false);
        return;
      }
      logoUrl = result.url || "";
    }

    const payload = {
      ...form,
      logo_url: logoUrl,
      whatsapp: digits(form.whatsapp),
      phone: digits(form.phone),
    };

    const { error } = await salvarCadastroInicialEmpresaPro(cleanCode, payload, top3);
    if (error) {
      setErro(error.message || "Não foi possível salvar o cadastro.");
      setSalvando(false);
      return;
    }

    navigate(`/pro/empresa/painel/${cleanCode}`);
  }

  if (loading) return <Shell><h1>TAP PRO</h1><p>Preparando cadastro...</p></Shell>;
  if (erro && !dados) return <Shell><h1>TAP PRO</h1><p>{erro}</p></Shell>;
  if (dados?.profile_type !== "company") return <Shell><h1>TAP PRO</h1><p>Preparando cadastro...</p></Shell>;

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px 48px", background: "#f5f2ec", fontFamily: "Inter,Arial,sans-serif" }}>
      <style>{`
        .tap-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .tap-choices{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .tap-choice:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(17,24,39,.08)}
        @media(max-width:680px){.tap-grid,.tap-choices{grid-template-columns:1fr}}
      `}</style>

      <section style={{ maxWidth: 880, margin: "0 auto" }}>
        <header style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg,#111827,#b8892f)", color: "#fff" }}>
          <p style={{ margin: "0 0 7px", opacity: .85, fontWeight: 800 }}>Cadastro inicial</p>
          <h1 style={{ margin: 0, fontSize: 31 }}>Perfil da empresa</h1>
          <p style={{ margin: "10px 0 0", lineHeight: 1.55 }}>Você não precisa preencher tudo agora. Escolha a estratégia, o visual e configure o essencial.</p>
        </header>

        {erro && <div style={{ ...card, background: "#fee2e2", color: "#991b1b" }}>{erro}</div>}

        <form onSubmit={submit}>
          <section style={card}>
            <h2>1. Informações básicas</h2>
            <label style={{ fontWeight: 800 }}>Logo da empresa</label>
            <input type="file" accept="image/*" onChange={logo} style={{ ...input, marginTop: 7 }} />
            {logoPreview && <img src={logoPreview} alt="Prévia" style={{ width: 130, height: 100, objectFit: "contain", marginTop: 12, border: "1px solid #ddd", borderRadius: 14 }} />}

            <div className="tap-grid" style={{ marginTop: 18 }}>
              <Field label="Nome da empresa *" name="display_name" value={form.display_name} onChange={change} />
              <Field label="WhatsApp *" name="whatsapp" value={form.whatsapp} onChange={change} inputMode="numeric" />
            </div>

            <label style={{ display: "block", marginTop: 18, fontWeight: 800 }}>Descrição curta</label>
            <textarea name="description" value={form.description} onChange={change} style={{ ...input, minHeight: 95, marginTop: 7 }} />
          </section>

          <section style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 900, color: "#8a641f", textTransform: "uppercase" }}>Plano atual</p>
                <h2 style={{ margin: 0 }}>Essencial</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span style={{ textDecoration: "line-through", color: "#9ca3af", fontWeight: 800 }}>R$ 39/mês</span>
                  <strong style={{ color: "#166534" }}>Disponível</strong>
                </div>
                <p style={{ color: "#6b7280" }}>Incluído na sua peça TAP PRO, sem mensalidade.</p>
              </div>
              <span style={{ height: "fit-content", padding: "8px 12px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontWeight: 900 }}>Disponível</span>
            </div>
            <p style={{ lineHeight: 1.5, color: "#4b5563" }}>WhatsApp, Instagram, Avaliação no Google, Localização, Telefone, Wi-Fi, Pix, Horário, Salvar contato e Compartilhar página.</p>
          </section>

          <section style={card}>
            <h2>2. O que você quer gerar com esta página?</h2>
            <p style={{ color: "#6b7280" }}>O TAP PRO adapta a chamada principal e o botão de ação ao objetivo escolhido.</p>
            <div className="tap-choices">
              {GOALS.map(({ code, title, description, icon: Icon }) => {
                const selected = form.primary_goal === code;
                return (
                  <button
                    key={code}
                    type="button"
                    className="tap-choice"
                    onClick={() => chooseGoal(code)}
                    style={{
                      minHeight: 118, padding: 16, borderRadius: 16, textAlign: "left",
                      cursor: "pointer", transition: ".18s ease",
                      border: selected ? "2px solid #b8892f" : "1px solid #d1d5db",
                      background: selected ? "#fffaf0" : "#fff",
                    }}
                  >
                    <span style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: selected ? "#b8892f" : "#f3f4f6", color: selected ? "#fff" : "#374151" }}>
                      <Icon size={21} />
                    </span>
                    <strong style={{ display: "block", marginTop: 11, fontSize: 16 }}>{title}</strong>
                    <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 13, lineHeight: 1.45 }}>{description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={card}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 9 }}><Palette size={22} /> 3. Estilo da página</h2>
            <p style={{ color: "#6b7280" }}>Escolha a personalidade visual. Você poderá trocar depois.</p>
            <div className="tap-choices">
              {THEMES.map(theme => {
                const selected = form.page_template === theme.code;
                return (
                  <button
                    key={theme.code}
                    type="button"
                    className="tap-choice"
                    onClick={() => chooseTheme(theme.code)}
                    style={{
                      padding: 12, borderRadius: 16, textAlign: "left", cursor: "pointer",
                      border: selected ? "2px solid #b8892f" : "1px solid #d1d5db",
                      background: selected ? "#fffaf0" : "#fff",
                    }}
                  >
                    <StylePreview type={theme.code} selected={selected} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                      <strong>{theme.name}</strong>
                      {selected && (
                        <span style={{ marginLeft: "auto", padding: "4px 8px", borderRadius: 999, background: "#b8892f", color: "#ffffff", fontSize: 11, fontWeight: 900 }}>
                          Selecionado
                        </span>
                      )}
                    </div>
                    <small style={{ display: "block", marginTop: 5, color: "#6b7280", lineHeight: 1.4 }}>{theme.description}</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={card}>
            <h2>4. Destaques da página</h2>
            <p style={{ color: "#6b7280" }}>Escolha até 3. Eles aparecem primeiro; as demais funções continuam disponíveis.</p>
            <div className="tap-choices">
              {HIGHLIGHTS.map(({ code, name, description, icon: Icon }) => {
                const selected = top3.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    className="tap-choice"
                    onClick={() => toggle(code)}
                    style={{
                      padding: 16, borderRadius: 16, textAlign: "left", cursor: "pointer",
                      border: selected ? "2px solid #b8892f" : "1px solid #d1d5db",
                      background: selected ? "#fffaf0" : "#fff",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon size={20} />
                      <strong>{name}</strong>
                      {selected && <b style={{ marginLeft: "auto", background: "#b8892f", color: "#fff", borderRadius: 999, padding: "4px 9px" }}>{top3.indexOf(code) + 1}</b>}
                    </span>
                    <p style={{ margin: "7px 0 0", color: "#6b7280", fontSize: 13 }}>{description}</p>
                  </button>
                );
              })}
            </div>
            {selectedNames.length > 0 && <p style={{ marginTop: 14 }}><strong>Ordem:</strong> {selectedNames.join(" → ")}</p>}
          </section>

          <section style={card}>
            <h2>5. Funções Essencial</h2>
            <div className="tap-grid">
              <Toggle label="Mostrar WhatsApp" name="show_whatsapp" checked={form.show_whatsapp} onChange={change} />
              <Field label="Mensagem do WhatsApp" name="whatsapp_message" value={form.whatsapp_message} onChange={change} placeholder="Opcional. O TAP PRO cria uma mensagem automaticamente." />
              <Toggle label="Mostrar Instagram" name="show_instagram" checked={form.show_instagram} onChange={change} />
              <Field label="Instagram" name="instagram" value={form.instagram} onChange={change} placeholder="@usuario, usuario ou link completo" />
              <Toggle label="Mostrar Avaliação no Google" name="show_google_review" checked={form.show_google_review} onChange={change} />
              <Field label="Link de avaliação" name="google_review_url" value={form.google_review_url} onChange={change} />
              <Toggle label="Mostrar telefone" name="show_phone" checked={form.show_phone} onChange={change} />
              <Field label="Telefone" name="phone" value={form.phone} onChange={change} inputMode="numeric" />
              <Toggle label="Mostrar Pix" name="show_pix" checked={form.show_pix} onChange={change} />
              <Field label="Chave Pix" name="pix_key" value={form.pix_key} onChange={change} />
              <Toggle label="Mostrar Wi-Fi" name="show_wifi" checked={form.show_wifi} onChange={change} />
              <Field label="Nome do Wi-Fi" name="wifi_ssid" value={form.wifi_ssid} onChange={change} />
              <Field label="Senha do Wi-Fi" name="wifi_password" value={form.wifi_password} onChange={change} />
              <Toggle label="Mostrar horário" name="show_business_hours" checked={form.show_business_hours} onChange={change} />
              <Field label="Horário de atendimento" name="business_hours" value={form.business_hours} onChange={change} placeholder="Ex: Seg a sex, 8h às 18h" />
            </div>
          </section>

          <section style={card}>
            <h2>6. Localização automática</h2>
            <p style={{ color: "#6b7280", lineHeight: 1.5 }}><strong>Preencha o endereço.</strong> O TAP PRO cria automaticamente o botão “Como chegar”. Você não precisa copiar nenhum link do Google Maps.</p>
            <Toggle label="Mostrar localização" name="show_maps" checked={form.show_maps} onChange={change} />
            <div className="tap-grid" style={{ marginTop: 14 }}>
              <Field label="CEP" name="address_postal_code" value={form.address_postal_code} onChange={change} />
              <Field label="Rua/Avenida" name="address_street" value={form.address_street} onChange={change} />
              <Field label="Número" name="address_number" value={form.address_number} onChange={change} />
              <Field label="Complemento" name="address_complement" value={form.address_complement} onChange={change} />
              <Field label="Bairro" name="address_neighborhood" value={form.address_neighborhood} onChange={change} />
              <Field label="Cidade" name="address_city" value={form.address_city} onChange={change} />
              <Field label="Estado" name="address_state" value={form.address_state} onChange={change} maxLength={2} />
            </div>
            <details style={{ marginTop: 14 }}>
              <summary style={{ cursor: "pointer", fontWeight: 800 }}>Usar link manual do Google Maps (opcional)</summary>
              <div style={{ marginTop: 12 }}><Field label="Link manual" name="maps_url" value={form.maps_url} onChange={change} /></div>
            </details>
          </section>

          <section style={{ ...card, background: "#111827", color: "#fff" }}>
            <p style={{ margin: "0 0 5px", color: "#d6b56c", fontWeight: 900, fontSize: 12, textTransform: "uppercase" }}>Evolua quando precisar</p>
            <h2 style={{ margin: "0 0 8px" }}>Profissional — R$ 59/mês</h2>
            <p style={{ color: "#d1d5db" }}>Todos os recursos avançados em um único plano.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 9 }}>
              {PROFESSIONAL.map(item => <div key={item} style={{ padding: 11, borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.11)" }}>{item}</div>)}
            </div>
          </section>

          <section style={{ ...card, position: "sticky", bottom: 10, zIndex: 10 }}>
            <button disabled={salvando} style={{ width: "100%", minHeight: 54, border: 0, borderRadius: 14, background: salvando ? "#9ca3af" : "#111827", color: "#fff", fontWeight: 900 }}>
              {salvando ? "Salvando..." : "Salvar e continuar"} <ArrowRight size={18} style={{ verticalAlign: "middle", marginLeft: 6 }} />
            </button>
          </section>
        </form>
      </section>
    </main>
  );
}

function Field({ label, ...props }) {
  return <div><label style={{ display: "block", marginBottom: 7, fontWeight: 800 }}>{label}</label><input {...props} style={input} /></div>;
}
function Toggle({ label, ...props }) {
  return <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, minHeight: 48 }}><input type="checkbox" {...props} />{label}</label>;
}
function Shell({ children }) {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f5f2ec" }}><section style={{ padding: 28, borderRadius: 20, background: "#fff", textAlign: "center" }}>{children}</section></main>;
}