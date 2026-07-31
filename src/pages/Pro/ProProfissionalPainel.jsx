import { useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  UserRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  atualizarProfissionalNovoPro,
  ativarTesteProfissionalPessoaPro,
  codigoProValido,
  getProfessionalDashboardNovoPro,
  limparCodigoPro,
  obterAcessoAdminPro,
  uploadImagemPro,
} from "../../lib/tappro";

const MODULES = [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["linkedin", "LinkedIn"],
  ["website", "Site"],
  ["portfolio", "Portfólio"],
  ["maps", "Localização"],
  ["email", "E-mail"],
  ["phone", "Telefone"],
];


const THEMES = [
  ["classic", "Clássica", "Elegante, sólida e tradicional."],
  ["modern", "Moderna", "Atual, limpa e equilibrada."],
  ["futuristic", "Futurista", "Tecnológica, marcante e ousada."],
  ["minimalist", "Minimalista", "Leve, clara e focada no essencial."],
];

const COLOR_PALETTES = [
  ["gold", "Dourado", "#b8892f"],
  ["blue", "Azul", "#2563eb"],
  ["green", "Verde", "#15803d"],
  ["red", "Vermelho", "#b91c1c"],
  ["purple", "Roxo", "#7c3aed"],
  ["graphite", "Grafite", "#111827"],
];

const ALLOWED_MODULE_CODES = new Set(MODULES.map((item) => item[0]));

const GOALS = {
  auto: {
    title: "Automático",
    result: "O TAP PRO usa a melhor ação disponível.",
    tip: "Boa opção para começar.",
  },
  whatsapp: {
    title: "Mais contatos",
    result: "A chamada principal leva as pessoas ao WhatsApp.",
    tip: "Ideal para orçamento e atendimento.",
  },
  instagram: {
    title: "Mais seguidores",
    result: "A chamada principal convida a acompanhar seu Instagram.",
    tip: "Use conteúdo recente e profissional.",
  },
  portfolio: {
    title: "Mais visitas ao portfólio",
    result: "A chamada principal destaca seus trabalhos.",
    tip: "Mostre projetos e resultados.",
  },
  share: {
    title: "Mais indicações",
    result: "A chamada principal incentiva o compartilhamento do perfil.",
    tip: "Ideal para quem cresce por indicação.",
  },
};

const initial = {
  page_template: "modern",
  color_palette: "gold",
  professional_name: "",
  professional_title: "",
  company_name: "",
  description: "",
  photo_url: "",
  logo_url: "",
  whatsapp: "",
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
  show_facebook: true,
  linkedin: "",
  website: "",
  maps_url: "",
  area_service: "",
  portfolio_url: "",
  scheduling_url: "",
  company_page_url: "",
  service_1: "",
  service_2: "",
  service_3: "",
  service_4: "",
  specialty_1: "",
  specialty_2: "",
  specialty_3: "",
  specialty_4: "",
  specialty_5: "",
  primary_goal: "auto",
};

const input = {
  width: "100%",
  minHeight: 48,
  padding: "12px 13px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
  fontSize: 15,
  background: "#ffffff",
  color: "#111827",
  outline: "none",
};

const section = {
  marginTop: 0,
  padding: "28px 4px",
  borderRadius: 0,
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #e5e7eb",
  boxShadow: "none",
};

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function Field({ label, ...props }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 7, fontWeight: 800 }}>
        {label}
      </label>
      <input {...props} style={input} />
    </div>
  );
}

function SectionTitle({ kicker, title, description, aside }) {
  return (
    <div
      style={{
        marginBottom: 18,
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 5px",
            fontSize: 11,
            fontWeight: 900,
            color: "#8a641f",
            textTransform: "uppercase",
            letterSpacing: ".6px",
          }}
        >
          {kicker}
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: 22,
            color: "#111827",
          }}
        >
          {title}
        </h2>

        {description && (
          <p
            style={{
              margin: "7px 0 0",
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {aside && (
        <span
          style={{
            flex: "0 0 auto",
            padding: "7px 10px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#475569",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {aside}
        </span>
      )}
    </div>
  );
}

export default function ProProfissionalPainel() {
  const { accessCode } = useParams();
  const navigate = useNavigate();
  const cleanCode = limparCodigoPro(accessCode);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState(null);
  const [form, setForm] = useState(initial);
  const [top3, setTop3] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      if (
        !codigoProValido(cleanCode) ||
        obterAcessoAdminPro() !== cleanCode
      ) {
        setError("Acesso administrativo não autorizado.");
        setLoading(false);
        return;
      }

      const result = await getProfessionalDashboardNovoPro(cleanCode);

      if (result.error || !result.data?.found) {
        console.error(result.error);
        setError("Não foi possível carregar o painel profissional.");
        setLoading(false);
        return;
      }

      const loadedData = result.data;
      const loadedGoal = GOALS[loadedData.primary_goal]
        ? loadedData.primary_goal
        : "auto";

      setData(loadedData);
      setForm({
        ...initial,
        ...loadedData,
        primary_goal: loadedGoal,
      });

      setTop3(
        (loadedData.top3 || [])
          .sort((a, b) => a.featured_position - b.featured_position)
          .map((item) => item.module_code)
          .filter((code) => ALLOWED_MODULE_CODES.has(code))
      );

      setPhotoPreview(loadedData.photo_url || "");
      setLogoPreview(loadedData.logo_url || "");
      setLoading(false);
    }

    load();
  }, [cleanCode]);

  const strategy = GOALS[form.primary_goal] || GOALS.auto;

  const topNames = useMemo(
    () =>
      top3.map(
        (code) => MODULES.find((item) => item[0] === code)?.[1] || code
      ),
    [top3]
  );

  function change(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggle(code) {
    setError("");

    setTop3((prev) => {
      if (prev.includes(code)) {
        return prev.filter((item) => item !== code);
      }

      return [...prev, code];
    });
  }

  function file(event, type) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    const preview = URL.createObjectURL(selected);

    if (type === "photo") {
      setPhotoFile(selected);
      setPhotoPreview(preview);
    } else {
      setLogoFile(selected);
      setLogoPreview(preview);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
    window.setTimeout(() => {
      setToast((current) =>
        current?.text === text ? null : current
      );
    }, type === "error" ? 7000 : 4200);
  }

  async function activateTrial() {
    setActivatingTrial(true);
    setError("");
    setSuccess("");

    const result =
      await ativarTesteProfissionalPessoaPro(cleanCode);

    if (result.error) {
      const message =
        result.error.message ||
        "Não foi possível liberar o teste grátis.";
      setError(message);
      showToast("error", message);
      setActivatingTrial(false);
      return;
    }

    setData((current) => ({
      ...current,
      ...result.data,
      plan_code: "professional",
      subscription_status: "trial",
      professional_enabled: true,
    }));

    const message =
      "Plano Profissional liberado por 30 dias.";
    setSuccess(message);
    showToast("success", message);
    setActivatingTrial(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event?.preventDefault();

    if (!form.professional_name.trim() || !form.professional_title.trim()) {
      setError("Preencha nome e título profissional.");
      return;
    }

    const whatsapp = digits(form.whatsapp);

    if (whatsapp.length < 10 || whatsapp.length > 13) {
      setError("Informe um WhatsApp válido.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    let photoUrl = form.photo_url;
    let logoUrl = form.logo_url;

    if (photoFile) {
      const result = await uploadImagemPro(cleanCode, photoFile, "foto");

      if (result.error) {
        setError("Não foi possível salvar a foto.");
        setSaving(false);
        return;
      }

      photoUrl = result.url;
    }

    if (logoFile) {
      const result = await uploadImagemPro(cleanCode, logoFile, "logo");

      if (result.error) {
        setError("Não foi possível salvar o logo.");
        setSaving(false);
        return;
      }

      logoUrl = result.url;
    }

    const payload = {
      ...form,
      photo_url: photoUrl,
      logo_url: logoUrl,
      whatsapp,
      phone: digits(form.phone),
    };

    const result = await atualizarProfissionalNovoPro(
      cleanCode,
      payload,
      top3
    );

    if (result.error) {
      console.error(result.error);
      const message = result.error.message || "Não foi possível salvar.";
      setError(message);
      showToast("error", message);
      setSaving(false);
      return;
    }

    setForm(payload);
    setPhotoPreview(photoUrl);
    setLogoPreview(logoUrl);
    setPhotoFile(null);
    setLogoFile(null);
    setSuccess("Alterações salvas com sucesso.");
    showToast("success", "Alterações salvas com sucesso.");
    setSaving(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const subscriptionStatus =
    String(data?.subscription_status || "")
      .trim()
      .toLowerCase();

  const professionalEnabled =
    Boolean(data?.professional_enabled) ||
    ["trial", "active", "past_due"].includes(subscriptionStatus);

  const trialDaysRemaining =
    data?.trial_days_remaining;

  if (loading) return <Screen text="Carregando painel..." />;
  if (error && !data) return <Screen text={error} />;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "22px 14px 118px",
        background: "#f3f1ec",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        color: "#111827",
      }}
    >
      {toast && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "calc(100% - 28px)",
            maxWidth: 560,
            padding: "14px 16px",
            borderRadius: 15,
            background:
              toast.type === "error" ? "#991b1b" : "#166534",
            color: "#ffffff",
            boxShadow: "0 18px 46px rgba(15,23,42,.28)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 800,
          }}
        >
          {toast.type === "error"
            ? <AlertCircle size={20} />
            : <CheckCircle2 size={20} />}
          <span style={{ flex: 1 }}>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              border: 0,
              background: "transparent",
              color: "#ffffff",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        .pro-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .pro-actions{columns:2 360px;column-gap:14px}
        .pro-action-card{break-inside:avoid;margin:0 0 14px;width:100%;display:inline-block;box-sizing:border-box}
        .pro-goals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .pro-theme-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        .pro-color-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .pro-topbar{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}
        @media(max-width:760px){
          .pro-grid,.pro-goals{grid-template-columns:1fr}
          .pro-actions{columns:1}
          .pro-action-card{margin-bottom:10px;padding:13px!important;border-radius:15px!important}
          .pro-topbar{grid-template-columns:1fr}
          form{padding-left:16px!important;padding-right:16px!important}
          section>div[style*="grid-template-columns: 1fr auto"]{
            grid-template-columns:1fr!important;
          }
        }
      `}</style>

      <section style={{ maxWidth: 940, margin: "0 auto" }}>
        <header
          style={{
            padding: 24,
            borderRadius: 24,
            background: "#111827",
            color: "#ffffff",
            boxShadow: "0 18px 46px rgba(17,24,39,.18)",
          }}
        >
          <div className="pro-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto profissional"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <UserRound size={30} color="#111827" />
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: "rgba(214,181,108,.16)",
                    color: "#efd18c",
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: ".6px",
                  }}
                >
                  {professionalEnabled
                    ? "Plano Profissional"
                    : "Plano Essencial"}
                </span>

                <h1
                  style={{
                    margin: "10px 0 0",
                    fontSize: "clamp(25px,5vw,34px)",
                    lineHeight: 1.1,
                    overflowWrap: "anywhere",
                  }}
                >
                  {form.professional_name || "Seu perfil"}
                </h1>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#cbd5e1",
                    lineHeight: 1.5,
                  }}
                >
                  Atualize seu perfil, escolha uma estratégia e publique.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/pro/profissional/${data.piece_code}`)}
              style={{
                minHeight: 50,
                padding: "0 18px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,.22)",
                background: "#ffffff",
                color: "#111827",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Ver perfil público
            </button>
          </div>
        </header>

        {error && (
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 16,
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 16,
              background: "#dcfce7",
              color: "#166534",
              border: "1px solid #bbf7d0",
            }}
          >
            {success}
          </div>
        )}

        <section
          style={{
            marginTop: 18,
            padding: 20,
            borderRadius: 20,
            background: professionalEnabled
              ? "#f0fdf4"
              : "#fffaf0",
            border: professionalEnabled
              ? "1px solid #bbf7d0"
              : "1px solid #e6d7b8",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: 18,
                }}
              >
                {professionalEnabled
                  ? "Plano Profissional ativo"
                  : "Plano Essencial incluído"}
              </strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                  lineHeight: 1.5,
                }}
              >
                {professionalEnabled
                  ? subscriptionStatus === "trial"
                    ? `Teste grátis${Number.isFinite(trialDaysRemaining)
                        ? ` · ${trialDaysRemaining} dias restantes`
                        : ""}`
                    : "Recursos profissionais liberados."
                  : "Use seu perfil sem mensalidade ou teste os recursos profissionais por 30 dias."}
              </p>
            </div>

            {!professionalEnabled ? (
              <button
                type="button"
                onClick={activateTrial}
                disabled={activatingTrial}
                style={{
                  minHeight: 48,
                  padding: "0 17px",
                  border: 0,
                  borderRadius: 13,
                  background: activatingTrial
                    ? "#9ca3af"
                    : "#111827",
                  color: "#ffffff",
                  fontWeight: 900,
                  cursor: activatingTrial
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {activatingTrial
                  ? "Liberando..."
                  : "Testar Profissional por 30 dias"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/pro/profissional/profissional/${cleanCode}`
                  )
                }
                style={{
                  minHeight: 48,
                  padding: "0 17px",
                  border: 0,
                  borderRadius: 13,
                  background: "#111827",
                  color: "#ffffff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Abrir Plano Profissional
              </button>
            )}
          </div>
        </section>

        <form
          onSubmit={save}
          style={{
            marginTop: 18,
            padding: "0 22px 4px",
            borderRadius: 24,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 12px 30px rgba(0,0,0,.05)",
          }}
        >
          <section style={section}>
            <SectionTitle
              kicker="1. Identidade"
              title="Como você aparece"
              description="Use uma foto clara e uma apresentação fácil de reconhecer."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: 20,
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Foto profissional"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <UserRound size={42} color="#94a3b8" />
                  )}
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    marginTop: 10,
                    padding: "11px 12px",
                    borderRadius: 12,
                    background: "#fffaf0",
                    border: "1px solid #e6d7b8",
                    color: "#8a641f",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  <ImagePlus size={17} />
                  Trocar foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => file(event, "photo")}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              <div>
                <div className="pro-grid">
                  <Field
                    label="Nome profissional"
                    name="professional_name"
                    value={form.professional_name}
                    onChange={change}
                  />

                  <Field
                    label="Título ou especialidade"
                    name="professional_title"
                    value={form.professional_title}
                    onChange={change}
                  />
                </div>

                <label
                  style={{
                    display: "block",
                    marginTop: 16,
                    fontWeight: 800,
                  }}
                >
                  Descrição curta
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={change}
                  placeholder="Explique em uma frase como você ajuda seus clientes."
                  style={{
                    ...input,
                    minHeight: 86,
                    marginTop: 7,
                    resize: "vertical",
                  }}
                />

                <div className="pro-grid" style={{ marginTop: 16 }}>
                  <Field
                    label="WhatsApp"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={change}
                  />

                  <Field
                    label="Área de atendimento"
                    name="area_service"
                    value={form.area_service}
                    onChange={change}
                  />
                </div>
              </div>
            </div>

            <details style={{ marginTop: 18 }}>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 850,
                  color: "#475569",
                }}
              >
                Logo opcional
              </summary>

              <div
                style={{
                  marginTop: 13,
                  padding: 15,
                  borderRadius: 15,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "10px 12px",
                    borderRadius: 11,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    fontWeight: 850,
                    cursor: "pointer",
                  }}
                >
                  <ImagePlus size={17} />
                  Selecionar logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => file(event, "logo")}
                    style={{ display: "none" }}
                  />
                </label>

                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    style={{
                      display: "block",
                      width: 110,
                      height: 72,
                      objectFit: "contain",
                      marginTop: 12,
                    }}
                  />
                )}
              </div>
            </details>
          </section>

          <section style={section}>
            <SectionTitle
              kicker="2. Objetivo"
              title="O que este perfil deve gerar?"
              description="A opção escolhida define a chamada principal da página."
            />

            <div className="pro-goals">
              {Object.entries(GOALS).map(([code, item]) => {
                const selected = form.primary_goal === code;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        primary_goal: code,
                      }))
                    }
                    style={{
                      minHeight: 74,
                      padding: 12,
                      borderRadius: 13,
                      border: selected
                        ? "2px solid #b8892f"
                        : "1px solid #d1d5db",
                      background: selected ? "#fffaf0" : "#ffffff",
                      color: "#111827",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <strong style={{ display: "block" }}>{item.title}</strong>

                    <small
                      style={{
                        display: "block",
                        marginTop: 6,
                        color: selected ? "#8a641f" : "#6b7280",
                        lineHeight: 1.35,
                      }}
                    >
                      {item.result}
                    </small>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 13,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                lineHeight: 1.5,
              }}
            >
              <strong>{strategy.title}</strong>
              <span> · {strategy.tip}</span>
            </div>
          </section>

          <section style={section}>
            <SectionTitle
              kicker="3. Ações e destaques"
              title="Escolha o que o visitante pode fazer"
              description="Preencha os canais que utiliza e escolha livremente quais terão destaque principal."
              aside={`${top3.length} ${top3.length===1?"destaque":"destaques"}`}
            />

            <div className="pro-actions">
              <ProfessionalActionCard
                title="Instagram"
                code="instagram"
                value={form.instagram}
                top3={top3}
                onToggleHighlight={toggle}
              >
                <Field
                  label="Usuário ou link"
                  name="instagram"
                  value={form.instagram}
                  onChange={change}
                  placeholder="@seuperfil ou instagram.com/seuperfil"
                />
              </ProfessionalActionCard>

              <ProfessionalActionCard
                title="Facebook"
                code="facebook"
                value={form.facebook}
                top3={top3}
                onToggleHighlight={toggle}
              >
                <Field
                  label="Página ou perfil"
                  name="facebook"
                  value={form.facebook}
                  onChange={change}
                  placeholder="facebook.com/seuperfil"
                />
              </ProfessionalActionCard>

              <ProfessionalActionCard
                title="LinkedIn"
                code="linkedin"
                value={form.linkedin}
                top3={top3}
                onToggleHighlight={toggle}
              >
                <Field
                  label="Perfil profissional"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={change}
                  placeholder="linkedin.com/in/seuperfil"
                />
              </ProfessionalActionCard>

              <ProfessionalActionCard
                title="Site"
                code="website"
                value={form.website}
                top3={top3}
                onToggleHighlight={toggle}
              >
                <Field
                  label="Link do site"
                  name="website"
                  value={form.website}
                  onChange={change}
                  placeholder="seusite.com.br"
                />
              </ProfessionalActionCard>

              <ProfessionalActionCard
                title="Portfólio"
                code="portfolio"
                value={form.portfolio_url}
                top3={top3}
                onToggleHighlight={toggle}
              >
                <Field
                  label="Link do portfólio"
                  name="portfolio_url"
                  value={form.portfolio_url}
                  onChange={change}
                  placeholder="Link dos seus trabalhos"
                />
              </ProfessionalActionCard>

              <ProfessionalActionCard
                title="Localização"
                code="maps"
                value={form.maps_url}
                top3={top3}
                onToggleHighlight={toggle}
              >
                <Field
                  label="Link do Google Maps"
                  name="maps_url"
                  value={form.maps_url}
                  onChange={change}
                  placeholder="Cole o link da localização"
                />
              </ProfessionalActionCard>

              <ProfessionalActionCard
                title="E-mail"
                code="email"
                value={form.email}
                top3={top3}
                onToggleHighlight={toggle}
              >
                <Field
                  label="E-mail profissional"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={change}
                  placeholder="contato@empresa.com.br"
                />
              </ProfessionalActionCard>

              <ProfessionalActionCard
                title="Telefone"
                code="phone"
                value={form.phone}
                top3={top3}
                onToggleHighlight={toggle}
              >
                <Field
                  label="Telefone"
                  name="phone"
                  value={form.phone}
                  onChange={change}
                  placeholder="Telefone com DDD"
                />
              </ProfessionalActionCard>
            </div>

            {topNames.length > 0 && (
              <div
                style={{
                  marginTop:15,
                  padding:14,
                  borderRadius:14,
                  background:"#f8fafc",
                  border:"1px solid #e2e8f0",
                }}
              >
                <strong style={{display:"block",marginBottom:8,fontSize:13}}>
                  Ordem na página
                </strong>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {topNames.map((name,index)=>(
                    <span
                      key={`${name}-${index}`}
                      style={{
                        padding:"7px 10px",
                        borderRadius:999,
                        background:"#ffffff",
                        border:"1px solid #d1d5db",
                        color:"#475569",
                        fontSize:12,
                        fontWeight:800,
                      }}
                    >
                      {index+1}. {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section style={section}>
            <SectionTitle
              kicker="5. Serviços"
              title="Serviços principais"
              description="Mostre de forma simples o que você oferece."
            />

            <div className="pro-grid">
              {[1, 2].map((number) => (
                <Field
                  key={`service_${number}`}
                  label={`Serviço ${number}`}
                  name={`service_${number}`}
                  value={form[`service_${number}`] || ""}
                  onChange={change}
                />
              ))}
            </div>
          </section>

          <section style={section}>
            <SectionTitle
              kicker="6. Aparência"
              title="Escolha o estilo da página"
              description="Defina o visual e a cor principal do seu perfil profissional."
            />

            <div className="pro-theme-grid">
              {THEMES.map(([code,name,description])=>{
                const selected=form.page_template===code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={()=>setForm(current=>({...current,page_template:code}))}
                    style={{
                      padding:10,
                      borderRadius:14,
                      textAlign:"left",
                      cursor:"pointer",
                      border:selected?"2px solid #b8892f":"1px solid #d1d5db",
                      background:selected?"#fffaf0":"#ffffff",
                      color:"#111827",
                    }}
                  >
                    <ThemePreview type={code} accent={COLOR_PALETTES.find(item=>item[0]===form.color_palette)?.[2]||"#b8892f"}/>
                    <strong style={{display:"block",marginTop:9}}>{name}</strong>
                    <small style={{display:"block",marginTop:4,color:"#6b7280",lineHeight:1.4}}>{description}</small>
                  </button>
                );
              })}
            </div>

            <h3 style={{margin:"22px 0 10px",fontSize:16}}>Cor principal</h3>
            <div className="pro-color-grid">
              {COLOR_PALETTES.map(([code,name,color])=>{
                const selected=form.color_palette===code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={()=>setForm(current=>({...current,color_palette:code}))}
                    style={{
                      minHeight:52,
                      padding:"9px 11px",
                      borderRadius:13,
                      border:selected?`2px solid ${color}`:"1px solid #d1d5db",
                      background:selected?"#ffffff":"#fafafa",
                      color:"#111827",
                      display:"flex",
                      alignItems:"center",
                      gap:10,
                      cursor:"pointer",
                      fontWeight:850,
                    }}
                  >
                    <span style={{width:26,height:26,borderRadius:9,background:color,boxShadow:"inset 0 0 0 1px rgba(0,0,0,.08)"}}/>
                    {name}
                  </button>
                );
              })}
            </div>
          </section>
        </form>
      </section>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          padding: "10px 14px",
          background: "rgba(255,255,255,.96)",
          borderTop: "1px solid #e5e7eb",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            maxWidth: 940,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: 13 }}>
              Seu perfil profissional
            </strong>

            <small style={{ color: "#6b7280" }}>
              Salve as alterações antes de sair.
            </small>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/pro/profissional/${data.piece_code}`)}
            style={{
              minHeight: 48,
              padding: "0 16px",
              borderRadius: 13,
              border: "1px solid #b8892f",
              background: "#fffaf0",
              color: "#8a641f",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Ver perfil público
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              minHeight: 48,
              padding: "0 18px",
              border: 0,
              borderRadius: 13,
              background: saving ? "#9ca3af" : "#111827",
              color: "#ffffff",
              fontWeight: 900,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </main>
  );
}



function ThemePreview({type,accent}) {
  const dark=type==="futuristic";
  const minimalist=type==="minimalist";
  const classic=type==="classic";
  return (
    <div style={{height:82,padding:7,borderRadius:11,background:dark?"#111116":"#f8fafc",border:"1px solid #e5e7eb",overflow:"hidden"}}>
      <div style={{height:27,borderRadius:minimalist?3:8,background:minimalist?"#ffffff":classic?"linear-gradient(135deg,#241f19,#74521e)":dark?"linear-gradient(135deg,#09090b,#312e81,#6d28d9)":"linear-gradient(135deg,#111827,#475569)"}}/>
      <div style={{height:13,marginTop:6,borderRadius:6,background:accent,opacity:.92}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:5}}>
        <div style={{height:17,borderRadius:6,background:dark?"#1f1f28":"#ffffff",border:"1px solid #e5e7eb"}}/>
        <div style={{height:17,borderRadius:6,background:dark?"#1f1f28":"#ffffff",border:"1px solid #e5e7eb"}}/>
      </div>
    </div>
  );
}

function ProfessionalActionCard({
  title,
  code,
  value,
  top3,
  onToggleHighlight,
  children,
}) {
  const position = top3.indexOf(code);
  const highlighted = position >= 0;
  const filled = Boolean(String(value || "").trim());

  return (
    <section
      className="pro-action-card"
      style={{
        padding:16,
        borderRadius:17,
        border:highlighted
          ? "2px solid #b8892f"
          : filled
          ? "1px solid #d6b56c"
          : "1px solid #e5e7eb",
        background:filled ? "#fffdf7" : "#ffffff",
        boxSizing:"border-box",
        overflow:"hidden",
      }}
    >
      <div>
        <strong style={{display:"block",fontSize:15,lineHeight:1.25}}>
          {title}
        </strong>
        <small style={{display:"block",marginTop:4,color:"#64748b",lineHeight:1.4}}>
          {filled ? "Função disponível" : "Cole o link ou preencha o dado"}
        </small>
      </div>

      <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #ece7dc"}}>
        {children}
      </div>

      <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid #ece7dc"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div style={{minWidth:0,flex:"1 1 180px"}}>
            <strong style={{display:"block",fontSize:13.5,lineHeight:1.3}}>
              {highlighted ? `Destaque ${position+1}` : "Adicionar aos destaques"}
            </strong>
            <small style={{display:"block",marginTop:3,color:"#64748b",lineHeight:1.4}}>
              {highlighted
                ? "Esta ação aparece entre as principais."
                : filled
                ? "Esta ação ganhará mais visibilidade na página."
                : "Preencha o campo para liberar o destaque."}
            </small>
          </div>

          <button
            type="button"
            onClick={()=>onToggleHighlight(code)}
            disabled={!filled && !highlighted}
            style={{
              flex:"0 0 auto",
              minWidth:112,
              minHeight:40,
              padding:"0 14px",
              borderRadius:11,
              border:highlighted ? "1px solid #b8892f" : "1px solid #d1d5db",
              background:highlighted ? "#fff3d6" : "#ffffff",
              color:!filled && !highlighted ? "#9ca3af" : "#7c5718",
              fontWeight:850,
              cursor:!filled && !highlighted ? "not-allowed" : "pointer",
              whiteSpace:"nowrap",
            }}
          >
            {highlighted ? "Remover" : "Adicionar"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Screen({ text }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f5f4",
        padding: 24,
      }}
    >
      <section
        style={{
          background: "#ffffff",
          padding: 28,
          borderRadius: 20,
          textAlign: "center",
        }}
      >
        <h1>TAP PRO</h1>
        <p>{text}</p>
      </section>
    </main>
  );
}