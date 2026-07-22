import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  codigoProValido,
  getInicioPerfilPorAcessoPro,
  limparCodigoPro,
  obterAcessoAdminPro,
  salvarCadastroInicialProfissionalPro,
  uploadImagemPro,
} from "../../lib/tappro";

const MODULES = [
  ["instagram", "Instagram", "Mostre novidades e fortaleça sua presença."],
  ["linkedin", "LinkedIn", "Apresente sua trajetória e conexões profissionais."],
  ["website", "Site", "Leve as pessoas ao seu site profissional."],
  ["portfolio", "Portfólio", "Mostre trabalhos, projetos e resultados."],
  ["scheduling", "Agendamento", "Facilite o agendamento de uma conversa."],
  ["maps", "Localização", "Mostre onde você atende."],
  ["company_page", "Conheça a empresa", "Conecte seu perfil à página da empresa."],
  ["email", "E-mail", "Receba contatos profissionais por e-mail."],
  ["phone", "Telefone", "Permita ligações diretas."],
];

const initialForm = {
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
  minHeight: "48px",
  padding: "12px 13px",
  borderRadius: "11px",
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
  fontSize: "15px",
  color: "#111827",
  background: "#ffffff",
};

const card = {
  marginTop: "18px",
  padding: "22px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 12px 30px rgba(0,0,0,0.06)",
};

function digits(value) {
  return String(value || "").replace(
    /\D/g,
    ""
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          marginBottom: 7,
          fontWeight: 800,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={input}
      />
    </div>
  );
}

export default function ProProfissionalCadastro() {
  const { accessCode } =
    useParams();

  const navigate = useNavigate();

  const cleanCode =
    limparCodigoPro(accessCode);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [data, setData] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [top3, setTop3] =
    useState([]);

  const [photoFile, setPhotoFile] =
    useState(null);

  const [logoFile, setLogoFile] =
    useState(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [logoPreview, setLogoPreview] =
    useState("");

  useEffect(() => {
    async function load() {
      if (!codigoProValido(cleanCode)) {
        setError(
          "Código administrativo inválido."
        );
        setLoading(false);
        return;
      }

      if (
        obterAcessoAdminPro() !==
        cleanCode
      ) {
        setError(
          "Este acesso não está autorizado neste aparelho."
        );
        setLoading(false);
        return;
      }

      const { data, error } =
        await getInicioPerfilPorAcessoPro(
          cleanCode
        );

      if (
        error ||
        !data?.found ||
        data.profile_type !==
          "professional"
      ) {
        setError(
          "Cadastro profissional não encontrado."
        );
        setLoading(false);
        return;
      }

      setData(data);
      setLoading(false);
    }

    load();
  }, [cleanCode]);

  const topNames = useMemo(
    () =>
      top3.map(
        (code) =>
          MODULES.find(
            (item) => item[0] === code
          )?.[1] || code
      ),
    [top3]
  );

  function change(event) {
    const { name, value } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function chooseFile(
    event,
    type
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Escolha uma imagem válida."
      );
      return;
    }

    const preview =
      URL.createObjectURL(file);

    if (type === "photo") {
      setPhotoFile(file);
      setPhotoPreview(preview);
    } else {
      setLogoFile(file);
      setLogoPreview(preview);
    }
  }

  function toggle(code) {
    setError("");

    setTop3((prev) => {
      if (prev.includes(code)) {
        return prev.filter(
          (item) => item !== code
        );
      }

      if (prev.length >= 3) {
        setError(
          "Você já escolheu 3 destaques."
        );
        return prev;
      }

      return [...prev, code];
    });
  }

  function validate() {
    if (
      !form.professional_name.trim()
    ) {
      return "Informe seu nome profissional.";
    }

    if (
      !form.professional_title.trim()
    ) {
      return "Informe seu título ou especialidade.";
    }

    const whatsapp =
      digits(form.whatsapp);

    if (
      whatsapp.length < 10 ||
      whatsapp.length > 13
    ) {
      return "Informe um WhatsApp válido com DDD.";
    }

    return "";
  }

  async function submit(event) {
    event.preventDefault();

    const message = validate();

    if (message) {
      setError(message);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    setSaving(true);
    setError("");

    let photoUrl =
      form.photo_url;

    let logoUrl =
      form.logo_url;

    if (photoFile) {
      const result =
        await uploadImagemPro(
          cleanCode,
          photoFile,
          "foto"
        );

      if (result.error) {
        setError(
          "Não foi possível salvar a foto."
        );
        setSaving(false);
        return;
      }

      photoUrl = result.url;
    }

    if (logoFile) {
      const result =
        await uploadImagemPro(
          cleanCode,
          logoFile,
          "logo"
        );

      if (result.error) {
        setError(
          "Não foi possível salvar o logo."
        );
        setSaving(false);
        return;
      }

      logoUrl = result.url;
    }

    const payload = {
      ...form,
      photo_url: photoUrl,
      logo_url: logoUrl,
      whatsapp:
        digits(form.whatsapp),
      phone:
        digits(form.phone),
    };

    const { error } =
      await salvarCadastroInicialProfissionalPro(
        cleanCode,
        payload,
        top3
      );

    if (error) {
      console.error(error);
      setError(
        error.message ||
          "Não foi possível salvar o cadastro."
      );
      setSaving(false);
      return;
    }

    navigate(
      `/pro/profissional/painel/${cleanCode}`,
      { replace: true }
    );
  }

  if (loading) {
    return (
      <Screen text="Preparando cadastro..." />
    );
  }

  if (error && !data) {
    return <Screen text={error} />;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 48px",
        background: "#f5f5f4",
        color: "#111827",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <style>
        {`
          .pro-grid {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:16px;
          }
          .pro-modules {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px;
          }
          @media(max-width:680px){
            .pro-grid,.pro-modules{
              grid-template-columns:1fr;
            }
          }
        `}
      </style>

      <section
        style={{
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            padding: 27,
            borderRadius: 22,
            background:
              "linear-gradient(135deg,#1c1917 0%,#6b5b3e 100%)",
            color: "#ffffff",
          }}
        >
          <p
            style={{
              margin: "0 0 7px",
              opacity: 0.82,
              fontWeight: 750,
              fontSize: 13,
            }}
          >
            Cadastro inicial
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: 30,
            }}
          >
            Seu perfil profissional
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              opacity: 0.94,
              lineHeight: 1.5,
            }}
          >
            WhatsApp, Salvar contato e Compartilhar já estão incluídos. Escolha até 3 outros destaques.
          </p>
        </header>

        {error && (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 13,
              background: "#fee2e2",
              color: "#991b1b",
              fontWeight: 750,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <section style={card}>
            <h2>1. Sua apresentação</h2>

            <div className="pro-grid">
              <div>
                <label style={{fontWeight:800}}>
                  Foto profissional
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    chooseFile(e, "photo")
                  }
                  style={{
                    ...input,
                    marginTop: 7,
                  }}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Prévia"
                    style={{
                      width: 110,
                      height: 110,
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginTop: 12,
                    }}
                  />
                )}
              </div>

              <div>
                <label style={{fontWeight:800}}>
                  Logo da empresa
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    chooseFile(e, "logo")
                  }
                  style={{
                    ...input,
                    marginTop: 7,
                  }}
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Prévia"
                    style={{
                      width: 120,
                      height: 90,
                      objectFit: "contain",
                      marginTop: 12,
                    }}
                  />
                )}
              </div>
            </div>

            <div className="pro-grid">
              <Field
                label="Nome profissional *"
                name="professional_name"
                value={form.professional_name}
                onChange={change}
                placeholder="Ex: Mariana Costa"
              />

              <Field
                label="Título ou especialidade *"
                name="professional_title"
                value={form.professional_title}
                onChange={change}
                placeholder="Ex: Consultora Comercial"
              />
            </div>

            <Field
              label="Empresa"
              name="company_name"
              value={form.company_name}
              onChange={change}
              placeholder="Ex: Costa Soluções"
            />

            <div style={{marginBottom:16}}>
              <label style={{fontWeight:800}}>
                Descrição profissional
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={change}
                maxLength={350}
                placeholder="Conte como você ajuda seus clientes."
                style={{
                  ...input,
                  minHeight: 100,
                  marginTop: 7,
                  resize: "vertical",
                }}
              />
            </div>

            <div className="pro-grid">
              <Field
                label="WhatsApp *"
                name="whatsapp"
                value={form.whatsapp}
                onChange={change}
                placeholder="11987654321"
              />

              <Field
                label="Área de atendimento"
                name="area_service"
                value={form.area_service}
                onChange={change}
                placeholder="Bragança Paulista e região"
              />
            </div>
          </section>

          <section style={card}>
            <h2>
              2. Escolha até 3 destaques
            </h2>

            <p
              style={{
                color: "#6b7280",
              }}
            >
              Escolhidos: {top3.length}/3 · Restam {3 - top3.length}
            </p>

            <div className="pro-modules">
              {MODULES.map(
                ([code, name, desc]) => {
                  const selected =
                    top3.includes(code);

                  const position =
                    top3.indexOf(code) + 1;

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        toggle(code)
                      }
                      style={{
                        padding: 15,
                        borderRadius: 14,
                        border: selected
                          ? "2px solid #b8892f"
                          : "1px solid #d1d5db",
                        background: selected
                          ? "#fffaf0"
                          : "#ffffff",
                        color: "#111827",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <strong>{name}</strong>
                      {selected && (
                        <span
                          style={{
                            float: "right",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#b8892f",
                            color: "#ffffff",
                          }}
                        >
                          {position}
                        </span>
                      )}
                      <p
                        style={{
                          margin: "7px 0 0",
                          color: "#6b7280",
                          fontSize: 13,
                          lineHeight: 1.4,
                        }}
                      >
                        {desc}
                      </p>
                    </button>
                  );
                }
              )}
            </div>

            {top3.length > 0 && (
              <ol>
                {topNames.map(
                  (name) => (
                    <li key={name}>
                      {name}
                    </li>
                  )
                )}
              </ol>
            )}
          </section>

          <section style={card}>
            <h2>
              3. Dados dos destaques
            </h2>

            <div className="pro-grid">
              <Field
                label="Instagram"
                name="instagram"
                value={form.instagram}
                onChange={change}
              />
              <Field
                label="LinkedIn"
                name="linkedin"
                value={form.linkedin}
                onChange={change}
              />
              <Field
                label="Site"
                name="website"
                value={form.website}
                onChange={change}
              />
              <Field
                label="Portfólio"
                name="portfolio_url"
                value={form.portfolio_url}
                onChange={change}
              />
              <Field
                label="Agendamento"
                name="scheduling_url"
                value={form.scheduling_url}
                onChange={change}
              />
              <Field
                label="Página da empresa"
                name="company_page_url"
                value={form.company_page_url}
                onChange={change}
              />
              <Field
                label="E-mail"
                name="email"
                value={form.email}
                onChange={change}
                type="email"
              />
              <Field
                label="Telefone"
                name="phone"
                value={form.phone}
                onChange={change}
              />
              <Field
                label="Google Maps"
                name="maps_url"
                value={form.maps_url}
                onChange={change}
              />
            </div>
          </section>

          <section
            style={{
              ...card,
              position: "sticky",
              bottom: 10,
              zIndex: 10,
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                minHeight: 54,
                border: "none",
                borderRadius: 14,
                background: saving
                  ? "#9ca3af"
                  : "#111827",
                color: "#ffffff",
                fontWeight: 850,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {saving
                ? "Salvando..."
                : "Salvar e abrir meu painel"}
            </button>
          </section>
        </form>
      </section>
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
        padding: 24,
        background: "#f5f5f4",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          padding: 28,
          borderRadius: 20,
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h1>TAP PRO</h1>
        <p>{text}</p>
      </section>
    </main>
  );
}
