import { useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  atualizarProfissionalNovoPro,
  codigoProValido,
  getProfessionalDashboardNovoPro,
  limparCodigoPro,
  obterAcessoAdminPro,
  uploadImagemPro,
} from "../../lib/tappro";

const MODULES = [
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
  ["website", "Site"],
  ["portfolio", "Portfólio"],
  ["maps", "Localização"],
  ["email", "E-mail"],
  ["phone", "Telefone"],
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
          .slice(0, 3)
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

      if (prev.length >= 3) {
        setError("Você já escolheu 3 destaques.");
        return prev;
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
      setError(result.error.message || "Não foi possível salvar.");
      setSaving(false);
      return;
    }

    setForm(payload);
    setPhotoPreview(photoUrl);
    setLogoPreview(logoUrl);
    setPhotoFile(null);
    setLogoFile(null);
    setSuccess("Alterações salvas com sucesso.");
    setSaving(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
      <style>{`
        .pro-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .pro-modules{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .pro-goals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .pro-topbar{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}
        @media(max-width:760px){
          .pro-grid,.pro-modules,.pro-goals{grid-template-columns:1fr}
          .pro-topbar{grid-template-columns:1fr}
          form{padding-left:16px!important;padding-right:16px!important}
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
                  Perfil profissional
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
              kicker="3. Destaques"
              title="Escolha os principais acessos"
              description="Marque até 3 opções para aparecerem com mais destaque."
              aside={`${top3.length}/3 destaques`}
            />

            <div className="pro-modules">
              {MODULES.map(([code, name]) => {
                const selected = top3.includes(code);
                const position = top3.indexOf(code) + 1;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggle(code)}
                    style={{
                      minHeight: 54,
                      padding: "11px 13px",
                      borderRadius: 13,
                      border: selected
                        ? "2px solid #b8892f"
                        : "1px solid #d1d5db",
                      background: selected ? "#fffaf0" : "#ffffff",
                      color: "#111827",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      textAlign: "left",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    <span>{name}</span>

                    {selected ? (
                      <span
                        style={{
                          width: 29,
                          height: 29,
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#b8892f",
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {position}
                      </span>
                    ) : (
                      <span
                        style={{
                          width: 29,
                          height: 29,
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f3f4f6",
                          color: "#9ca3af",
                          flexShrink: 0,
                        }}
                      >
                        +
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {topNames.length > 0 && (
              <div
                style={{
                  marginTop: 15,
                  padding: 14,
                  borderRadius: 14,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  Ordem na página
                </strong>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {topNames.map((name, index) => (
                    <span
                      key={`${name}-${index}`}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 999,
                        background: "#ffffff",
                        border: "1px solid #d1d5db",
                        color: "#475569",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}. {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section style={section}>
            <SectionTitle
              kicker="4. Contatos"
              title="Links e canais profissionais"
              description="Preencha apenas o que você realmente usa."
            />

            <div className="pro-grid">
              {[
                ["phone", "Telefone"],
                ["email", "E-mail"],
                ["instagram", "Instagram"],
                ["linkedin", "LinkedIn"],
                ["website", "Site"],
                ["portfolio_url", "Portfólio"],
                ["maps_url", "Google Maps"],
              ].map(([name, label]) => (
                <Field
                  key={name}
                  label={label}
                  name={name}
                  value={form[name] || ""}
                  onChange={change}
                />
              ))}
            </div>
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