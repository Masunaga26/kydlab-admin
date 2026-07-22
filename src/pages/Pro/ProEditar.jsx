import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  limparCodigoPro,
  codigoProValido,
  getProfessionalProfileForEditByCode,
  atualizarProfessionalProfile,
  uploadImagemPro,
  acessoEdicaoProValido,
  encerrarAcessoPro,
} from "../../lib/tappro";

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  padding: "12px 13px",
  borderRadius: "11px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#111827",
  fontSize: "14px",
  fontWeight: 800,
};

const fieldStyle = {
  marginBottom: "18px",
};

const checkboxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "9px",
  color: "#4b5563",
  fontSize: "13px",
  fontWeight: 650,
};

const sectionStyle = {
  marginTop: "18px",
  padding: "24px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
};

const formInicial = {
  page_template: "classico",
  color_palette: "dourado",

  logo_url: "",
  mostrar_logo: true,

  foto_url: "",
  mostrar_foto: true,

  nome: "",
  titulo_profissional: "",

  empresa: "",
  mostrar_empresa: true,

  descricao: "",
  mostrar_descricao: true,

  whatsapp: "",

  telefone: "",
  mostrar_telefone: false,

  email: "",
  mostrar_email: true,

  instagram: "",
  mostrar_instagram: true,

  linkedin: "",
  mostrar_linkedin: true,

  site: "",
  mostrar_site: true,

  area_atendimento: "",
  mostrar_area_atendimento: true,

  endereco_comercial: "",
  mostrar_endereco: false,

  maps_url: "",
  mostrar_maps: false,

  servico_1: "",
  servico_2: "",
  servico_3: "",
  servico_4: "",
  mostrar_servicos: true,

  especialidade_1: "",
  especialidade_2: "",
  especialidade_3: "",
  especialidade_4: "",
  especialidade_5: "",
  mostrar_especialidades: true,

  whatsapp_mensagem: "",
};

function preencherFormulario(perfil) {
  const resultado = {
    ...formInicial,
  };

  Object.keys(resultado).forEach((campo) => {
    if (
      perfil[campo] !== null &&
      perfil[campo] !== undefined
    ) {
      resultado[campo] = perfil[campo];
    }
  });

  return resultado;
}

function somenteNumeros(valor) {
  return String(valor || "").replace(
    /\D/g,
    ""
  );
}

function Campo({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  mostrarName,
  mostrarValue,
  onMostrarChange,
  children,
}) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        style={inputStyle}
      />

      {mostrarName && (
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            name={mostrarName}
            checked={Boolean(mostrarValue)}
            onChange={onMostrarChange}
            style={{
              width: "auto",
              margin: 0,
            }}
          />

          {children}
        </label>
      )}
    </div>
  );
}

function TituloSecao({
  numero,
  titulo,
  descricao,
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <p
        style={{
          margin: "0 0 5px",
          color: "#b8892f",
          fontSize: "12px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Etapa {numero}
      </p>

      <h2
        style={{
          margin: "0 0 6px",
          fontSize: "22px",
          color: "#111827",
        }}
      >
        {titulo}
      </h2>

      {descricao && (
        <p
          style={{
            margin: 0,
            color: "#6b7280",
            lineHeight: 1.5,
            fontSize: "14px",
          }}
        >
          {descricao}
        </p>
      )}
    </div>
  );
}


const PREVIEW_PALETAS = {
  dourado: {
    bg: "#f5f2ec",
    card: "#ffffff",
    text: "#1f2937",
    muted: "#6b7280",
    primary: "#b8892f",
    border: "#e6d7b8",
    dark: "#111827",
  },
  azul: {
    bg: "#eef4ff",
    card: "#ffffff",
    text: "#172033",
    muted: "#64748b",
    primary: "#2563eb",
    border: "#c7d7fe",
    dark: "#0f172a",
  },
  preto: {
    bg: "#111111",
    card: "#1c1c1c",
    text: "#ffffff",
    muted: "#c7c7c7",
    primary: "#d4af37",
    border: "#3a3a3a",
    dark: "#000000",
  },
  verde: {
    bg: "#eef8f1",
    card: "#ffffff",
    text: "#1f2937",
    muted: "#64748b",
    primary: "#16a34a",
    border: "#cdebd6",
    dark: "#064e3b",
  },
  vinho: {
    bg: "#fbf1f4",
    card: "#ffffff",
    text: "#2a1720",
    muted: "#72515d",
    primary: "#8a1538",
    border: "#ead0d8",
    dark: "#3f0a1a",
  },
  cinza: {
    bg: "#f3f4f6",
    card: "#ffffff",
    text: "#1f2937",
    muted: "#6b7280",
    primary: "#374151",
    border: "#d1d5db",
    dark: "#111827",
  },
};

function getIniciaisPreview(nome) {
  const partes = String(nome || "TP")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) return "TP";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function PreviewPerfil({
  form,
  fotoPreview,
  logoPreview,
  onClose,
  onSalvar,
  salvando,
}) {
  const tema =
    PREVIEW_PALETAS[form.color_palette] ||
    PREVIEW_PALETAS.dourado;

  const moderno = form.page_template === "moderno";
  const minimalista = form.page_template === "minimalista";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pré-visualização do perfil"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.72)",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              minHeight: "46px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Fechar preview
          </button>

          <button
            type="button"
            onClick={onSalvar}
            disabled={salvando}
            style={{
              flex: 1,
              minHeight: "46px",
              borderRadius: "12px",
              border: "none",
              background: salvando ? "#9ca3af" : "#111827",
              color: "#ffffff",
              fontWeight: 800,
              cursor: salvando ? "not-allowed" : "pointer",
            }}
          >
            {salvando ? "Salvando..." : "Aplicar e salvar"}
          </button>
        </div>

        <div
          style={{
            background: tema.bg,
            borderRadius: "22px",
            padding: "16px",
          }}
        >
          <section
            style={{
              background: tema.card,
              color: tema.text,
              border: `1px solid ${tema.border}`,
              borderRadius: minimalista ? "12px" : "22px",
              overflow: "hidden",
              boxShadow: minimalista
                ? "none"
                : "0 18px 40px rgba(0,0,0,0.14)",
            }}
          >
            {moderno ? (
              <header
                style={{
                  padding: "24px",
                  background: `linear-gradient(135deg, ${tema.dark}, ${tema.primary})`,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {fotoPreview && form.mostrar_foto ? (
                  <img
                    src={fotoPreview}
                    alt="Prévia da foto"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid rgba(255,255,255,0.5)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.16)",
                      border: "3px solid rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      fontWeight: 900,
                    }}
                  >
                    {getIniciaisPreview(form.nome)}
                  </div>
                )}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: "12px",
                      opacity: 0.82,
                    }}
                  >
                    Perfil profissional
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "28px",
                      lineHeight: 1.1,
                    }}
                  >
                    {form.nome || "Seu nome"}
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      fontWeight: 750,
                    }}
                  >
                    {form.titulo_profissional || "Seu título profissional"}
                  </p>
                </div>

                {logoPreview && form.mostrar_logo && (
                  <img
                    src={logoPreview}
                    alt="Prévia do logo"
                    style={{
                      maxWidth: "88px",
                      maxHeight: "50px",
                      objectFit: "contain",
                      background: "#ffffff",
                      borderRadius: "10px",
                      padding: "6px",
                    }}
                  />
                )}
              </header>
            ) : (
              <header
                style={{
                  padding: "26px 24px 18px",
                  textAlign: minimalista ? "left" : "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: minimalista ? "flex-start" : "center",
                  }}
                >
                  {fotoPreview && form.mostrar_foto ? (
                    <img
                      src={fotoPreview}
                      alt="Prévia da foto"
                      style={{
                        width: 116,
                        height: 116,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `4px solid ${tema.border}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 116,
                        height: 116,
                        borderRadius: "50%",
                        background: tema.primary,
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                        fontWeight: 900,
                        border: `4px solid ${tema.border}`,
                      }}
                    >
                      {getIniciaisPreview(form.nome)}
                    </div>
                  )}

                  {logoPreview && form.mostrar_logo && (
                    <img
                      src={logoPreview}
                      alt="Prévia do logo"
                      style={{
                        maxWidth: "96px",
                        maxHeight: "58px",
                        objectFit: "contain",
                        marginTop: "14px",
                      }}
                    />
                  )}
                </div>

                {minimalista && (
                  <p
                    style={{
                      margin: "16px 0 7px",
                      color: tema.primary,
                      fontSize: "12px",
                      fontWeight: 850,
                      textTransform: "uppercase",
                      letterSpacing: "1.2px",
                    }}
                  >
                    Perfil profissional
                  </p>
                )}

                <h2
                  style={{
                    margin: minimalista ? 0 : "16px 0 0",
                    fontSize: "30px",
                    lineHeight: 1.1,
                  }}
                >
                  {form.nome || "Seu nome"}
                </h2>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontWeight: 750,
                  }}
                >
                  {form.titulo_profissional || "Seu título profissional"}
                </p>
              </header>
            )}

            <div
              style={{
                padding: "0 24px 26px",
                textAlign: minimalista ? "left" : "center",
              }}
            >
              {form.empresa && form.mostrar_empresa && (
                <p
                  style={{
                    color: tema.muted,
                    fontWeight: 650,
                    margin: "10px 0 0",
                  }}
                >
                  {form.empresa}
                </p>
              )}

              {form.descricao && form.mostrar_descricao && (
                <p
                  style={{
                    margin: "16px 0 0",
                    lineHeight: 1.55,
                  }}
                >
                  {form.descricao}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "22px",
                }}
              >
                <div
                  style={{
                    minHeight: "50px",
                    borderRadius: "13px",
                    background: tema.primary,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 850,
                  }}
                >
                  Salvar contato
                </div>

                <div
                  style={{
                    minHeight: "50px",
                    borderRadius: "13px",
                    background: "#16a34a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 850,
                  }}
                >
                  WhatsApp
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ProEditar() {
  const { code } = useParams();
  const navigate = useNavigate();

  const cleanCode = limparCodigoPro(code);

  const timerMensagemRef = useRef(null);

  const [loading, setLoading] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [perfil, setPerfil] =
    useState(null);

  const [form, setForm] =
    useState(formInicial);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  const [logoFile, setLogoFile] =
    useState(null);

  const [fotoFile, setFotoFile] =
    useState(null);

  const [logoPreview, setLogoPreview] =
    useState("");

  const [fotoPreview, setFotoPreview] =
    useState("");

  const [previewAberto, setPreviewAberto] =
    useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro("");

      if (!codigoProValido(cleanCode)) {
        if (ativo) {
          setErro(
            "Código TAP PRO inválido."
          );

          setLoading(false);
        }

        return;
      }

      const acesso =
        await acessoEdicaoProValido(
          cleanCode
        );

      if (!ativo) return;

      if (!acesso.permitido) {
        navigate(
          "/pro",
          { replace: true }
        );

        return;
      }

      const { data, error } =
        await getProfessionalProfileForEditByCode(
          cleanCode
        );

      if (!ativo) return;

      if (error) {
        console.error(
          "Erro ao carregar painel TAP PRO:",
          error
        );

        setErro(
          "Não foi possível carregar o painel."
        );

        setLoading(false);
        return;
      }

      if (!data || !data.active) {
        encerrarAcessoPro();

        navigate(
          "/pro",
          { replace: true }
        );

        return;
      }

      setPerfil(data);
      setForm(preencherFormulario(data));

      setLogoPreview(
        data.logo_url || ""
      );

      setFotoPreview(
        data.foto_url || ""
      );

      setLoading(false);
    }

    carregar();

    return () => {
      ativo = false;

      if (timerMensagemRef.current) {
        clearTimeout(
          timerMensagemRef.current
        );
      }
    };
  }, [cleanCode, navigate]);

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handleImageChange(
    event,
    tipo
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setErro("");
    setSucesso("");

    if (
      !file.type.startsWith("image/")
    ) {
      setErro(
        "Escolha um arquivo de imagem válido."
      );

      return;
    }

    if (
      file.size >
      8 * 1024 * 1024
    ) {
      setErro(
        "A imagem deve ter no máximo 8 MB."
      );

      return;
    }

    const preview =
      URL.createObjectURL(file);

    if (tipo === "logo") {
      if (
        logoPreview &&
        logoPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          logoPreview
        );
      }

      setLogoFile(file);
      setLogoPreview(preview);
    }

    if (tipo === "foto") {
      if (
        fotoPreview &&
        fotoPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          fotoPreview
        );
      }

      setFotoFile(file);
      setFotoPreview(preview);
    }
  }

  function validar() {
    if (!form.nome.trim()) {
      return "Informe seu nome profissional.";
    }

    if (
      !form.titulo_profissional.trim()
    ) {
      return "Informe seu título profissional.";
    }

    const whatsapp =
      somenteNumeros(form.whatsapp);

    if (
      whatsapp.length < 10 ||
      whatsapp.length > 13
    ) {
      return "Informe um WhatsApp válido com DDD.";
    }

    const telefone =
      somenteNumeros(form.telefone);

    if (
      telefone &&
      (
        telefone.length < 10 ||
        telefone.length > 13
      )
    ) {
      return "Informe um telefone válido com DDD.";
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      return "Informe um e-mail válido.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const erroValidacao = validar();

    if (erroValidacao) {
      setErro(erroValidacao);
      setSucesso("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const acesso =
      await acessoEdicaoProValido(
        cleanCode
      );

    if (!acesso.permitido) {
      navigate(
        "/pro",
        { replace: true }
      );

      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      let logoUrl = form.logo_url;
      let fotoUrl = form.foto_url;

      if (logoFile) {
        const resultadoLogo =
          await uploadImagemPro(
            cleanCode,
            logoFile,
            "logo"
          );

        if (resultadoLogo.error) {
          console.error(
            resultadoLogo.error
          );

          setErro(
            "Não foi possível salvar o logo."
          );

          setSalvando(false);

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          return;
        }

        logoUrl =
          resultadoLogo.url || logoUrl;
      }

      if (fotoFile) {
        const resultadoFoto =
          await uploadImagemPro(
            cleanCode,
            fotoFile,
            "foto"
          );

        if (resultadoFoto.error) {
          console.error(
            resultadoFoto.error
          );

          setErro(
            "Não foi possível salvar a foto."
          );

          setSalvando(false);

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          return;
        }

        fotoUrl =
          resultadoFoto.url || fotoUrl;
      }

      const payload = {
        ...form,
        logo_url: logoUrl,
        foto_url: fotoUrl,
        whatsapp:
          somenteNumeros(
            form.whatsapp
          ),
        telefone:
          somenteNumeros(
            form.telefone
          ),
      };

      const { data, error } =
        await atualizarProfessionalProfile(
          cleanCode,
          payload
        );

      if (error) {
        console.error(
          "Erro ao atualizar TAP PRO:",
          error
        );

        setErro(
          "Não foi possível salvar as alterações."
        );

        setSalvando(false);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      const perfilAtualizado =
        data || payload;

      setPerfil(perfilAtualizado);

      setForm(
        preencherFormulario(
          perfilAtualizado
        )
      );

      setLogoPreview(
        perfilAtualizado.logo_url ||
          logoUrl ||
          ""
      );

      setFotoPreview(
        perfilAtualizado.foto_url ||
          fotoUrl ||
          ""
      );

      setLogoFile(null);
      setFotoFile(null);

      setSucesso(
        "Alterações salvas com sucesso."
      );

      setSalvando(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      if (
        timerMensagemRef.current
      ) {
        clearTimeout(
          timerMensagemRef.current
        );
      }

      timerMensagemRef.current =
        setTimeout(() => {
          setSucesso("");
        }, 5000);
    } catch (error) {
      console.error(
        "Erro inesperado ao salvar:",
        error
      );

      setErro(
        "Erro inesperado ao salvar as alterações."
      );

      setSalvando(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }


  function sair() {
    encerrarAcessoPro();

    navigate("/pro", {
      replace: true,
    });
  }

  async function copiarLink() {
    const link =
      `${window.location.origin}/pro/perfil/${cleanCode}`;

    try {
      await navigator.clipboard.writeText(
        link
      );

      setSucesso(
        "Link público copiado."
      );

      if (
        timerMensagemRef.current
      ) {
        clearTimeout(
          timerMensagemRef.current
        );
      }

      timerMensagemRef.current =
        setTimeout(() => {
          setSucesso("");
        }, 2500);
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível copiar o link."
      );
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          padding: "24px",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#374151",
          }}
        >
          Carregando painel TAP PRO...
        </p>
      </main>
    );
  }

  if (erro && !perfil) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          padding: "24px",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "28px 24px",
            background: "#ffffff",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow:
              "0 18px 45px rgba(0,0,0,0.10)",
          }}
        >
          <h1
            style={{
              margin: "0 0 10px",
            }}
          >
            TAP PRO
          </h1>

          <p
            style={{
              margin: 0,
              color: "#991b1b",
            }}
          >
            {erro}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "24px 16px 46px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        color: "#111827",
      }}
    >
      {previewAberto && (
        <PreviewPerfil
          form={form}
          fotoPreview={fotoPreview}
          logoPreview={logoPreview}
          onClose={() => setPreviewAberto(false)}
          onSalvar={() =>
            handleSubmit({
              preventDefault() {},
            })
          }
          salvando={salvando}
        />
      )}

      <style>
        {`
          .tappro-editor-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .tappro-editor-actions {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          }

          @media (max-width: 680px) {
            .tappro-editor-grid,
            .tappro-editor-actions {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <section
        style={{
          width: "100%",
          maxWidth: "820px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            padding: "26px",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #111827 0%, #b8892f 100%)",
            color: "#ffffff",
            boxShadow:
              "0 18px 42px rgba(0,0,0,0.14)",
          }}
        >
          <p
            style={{
              margin: "0 0 7px",
              fontSize: "13px",
              opacity: 0.82,
              fontWeight: 700,
            }}
          >
            Painel profissional
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              lineHeight: 1.15,
            }}
          >
            Olá, {perfil?.nome}
          </h1>

          <p
            style={{
              margin: "9px 0 0",
              opacity: 0.92,
            }}
          >
            Código TAP PRO: {cleanCode}
          </p>
        </header>

        <section
          style={{
            marginTop: "18px",
            padding: "18px 20px",
            borderRadius: "16px",
            background: "#fffaf0",
            border: "1px solid #e6d7b8",
            color: "#374151",
            lineHeight: 1.55,
          }}
        >
          <p
            style={{
              margin: "0 0 5px",
              color: "#111827",
              fontWeight: 850,
            }}
          >
            Você não precisa preencher tudo agora.
          </p>

          <p style={{ margin: "0 0 5px" }}>
            Comece com o essencial e complete sua página profissional aos poucos.
          </p>

          <p style={{ margin: 0 }}>
            Você pode voltar a qualquer momento para editar, adicionar serviços, trocar fotos e melhorar seu perfil.
          </p>
        </section>

        {erro && (
          <div
            role="alert"
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 750,
            }}
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontWeight: 750,
            }}
          >
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section style={sectionStyle}>
            <TituloSecao
              numero="1"
              titulo="Aparência da página"
              descricao="Escolha o modelo visual e a cor principal do perfil."
            />

            <div className="tappro-editor-grid">
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Modelo da página
                </label>

                <select
                  name="page_template"
                  value={form.page_template}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="classico">
                    Clássico
                  </option>

                  <option value="moderno">
                    Moderno
                  </option>

                  <option value="minimalista">
                    Minimalista
                  </option>
                </select>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Cor principal
                </label>

                <select
                  name="color_palette"
                  value={form.color_palette}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="dourado">
                    Dourado profissional
                  </option>

                  <option value="azul">
                    Azul confiança
                  </option>

                  <option value="preto">
                    Preto premium
                  </option>

                  <option value="verde">
                    Verde negócios
                  </option>

                  <option value="vinho">
                    Vinho elegante
                  </option>

                  <option value="cinza">
                    Cinza minimalista
                  </option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewAberto(true)}
              style={{
                width: "100%",
                minHeight: "50px",
                marginTop: "4px",
                padding: "13px",
                borderRadius: "13px",
                border: "1px solid #b8892f",
                background: "#fffaf0",
                color: "#8a641f",
                fontSize: "15px",
                fontWeight: 850,
                cursor: "pointer",
              }}
            >
              Pré-visualizar antes de salvar
            </button>
          </section>

          <section style={sectionStyle}>
            <TituloSecao
              numero="2"
              titulo="Identidade profissional"
              descricao="Atualize sua foto, logo e apresentação."
            />

            <div className="tappro-editor-grid">
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Logo da empresa
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageChange(
                      event,
                      "logo"
                    )
                  }
                  style={inputStyle}
                />

                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Prévia do logo"
                    style={{
                      width: "130px",
                      height: "100px",
                      objectFit: "contain",
                      marginTop: "12px",
                      padding: "8px",
                      borderRadius: "12px",
                      border:
                        "1px solid #d1d5db",
                      background: "#ffffff",
                    }}
                  />
                )}

                <label style={checkboxStyle}>
                  <input
                    type="checkbox"
                    name="mostrar_logo"
                    checked={Boolean(
                      form.mostrar_logo
                    )}
                    onChange={handleChange}
                    style={{
                      width: "auto",
                      margin: 0,
                    }}
                  />

                  Mostrar logo no perfil
                </label>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Foto profissional
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageChange(
                      event,
                      "foto"
                    )
                  }
                  style={inputStyle}
                />

                {fotoPreview && (
                  <img
                    src={fotoPreview}
                    alt="Prévia da foto"
                    style={{
                      width: "104px",
                      height: "104px",
                      objectFit: "cover",
                      marginTop: "12px",
                      borderRadius: "50%",
                      border:
                        "3px solid #e6d7b8",
                    }}
                  />
                )}

                <label style={checkboxStyle}>
                  <input
                    type="checkbox"
                    name="mostrar_foto"
                    checked={Boolean(
                      form.mostrar_foto
                    )}
                    onChange={handleChange}
                    style={{
                      width: "auto",
                      margin: 0,
                    }}
                  />

                  Mostrar foto no perfil
                </label>
              </div>
            </div>

            <Campo
              label="Nome profissional *"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Mariana Costa"
            />

            <Campo
              label="Título profissional *"
              name="titulo_profissional"
              value={
                form.titulo_profissional
              }
              onChange={handleChange}
              placeholder="Ex: Consultora Comercial"
            />

            <Campo
              label="Empresa"
              name="empresa"
              value={form.empresa}
              onChange={handleChange}
              placeholder="Ex: Costa Soluções"
              mostrarName="mostrar_empresa"
              mostrarValue={
                form.mostrar_empresa
              }
              onMostrarChange={
                handleChange
              }
            >
              Mostrar empresa no perfil
            </Campo>

            <div style={fieldStyle}>
              <label style={labelStyle}>
                Descrição profissional
              </label>

              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                maxLength={350}
                placeholder="Descreva brevemente seu trabalho e como você ajuda seus clientes."
                style={{
                  ...inputStyle,
                  minHeight: "110px",
                  resize: "vertical",
                }}
              />

              <label style={checkboxStyle}>
                <input
                  type="checkbox"
                  name="mostrar_descricao"
                  checked={Boolean(
                    form.mostrar_descricao
                  )}
                  onChange={handleChange}
                  style={{
                    width: "auto",
                    margin: 0,
                  }}
                />

                Mostrar descrição no perfil
              </label>
            </div>
          </section>

          <section style={sectionStyle}>
            <TituloSecao
              numero="3"
              titulo="Contato"
              descricao="Defina os meios de contato exibidos no perfil."
            />

            <div className="tappro-editor-grid">
              <Campo
                label="WhatsApp *"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="Ex: 11987654321"
                inputMode="numeric"
              />

              <Campo
                label="Telefone"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="Ex: 1133334444"
                inputMode="numeric"
                mostrarName="mostrar_telefone"
                mostrarValue={
                  form.mostrar_telefone
                }
                onMostrarChange={
                  handleChange
                }
              >
                Mostrar telefone no perfil
              </Campo>
            </div>

            <Campo
              label="E-mail"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Ex: contato@empresa.com.br"
              type="email"
              mostrarName="mostrar_email"
              mostrarValue={
                form.mostrar_email
              }
              onMostrarChange={
                handleChange
              }
            >
              Mostrar e-mail no perfil
            </Campo>

            <div style={fieldStyle}>
              <label style={labelStyle}>
                Mensagem automática do WhatsApp
              </label>

              <textarea
                name="whatsapp_mensagem"
                value={
                  form.whatsapp_mensagem
                }
                onChange={handleChange}
                placeholder="Ex: Olá! Encontrei seu perfil pelo TAP PRO."
                style={{
                  ...inputStyle,
                  minHeight: "90px",
                  resize: "vertical",
                }}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "7px",
                  color: "#6b7280",
                  lineHeight: 1.4,
                }}
              >
                Deixe vazio para usar a
                mensagem padrão do TAP PRO.
              </small>
            </div>
          </section>

          <section style={sectionStyle}>
            <TituloSecao
              numero="4"
              titulo="Links profissionais"
              descricao="Adicione redes sociais e site."
            />

            <Campo
              label="Instagram"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/seuperfil"
              mostrarName="mostrar_instagram"
              mostrarValue={
                form.mostrar_instagram
              }
              onMostrarChange={
                handleChange
              }
            >
              Mostrar Instagram no perfil
            </Campo>

            <Campo
              label="LinkedIn"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/seuperfil"
              mostrarName="mostrar_linkedin"
              mostrarValue={
                form.mostrar_linkedin
              }
              onMostrarChange={
                handleChange
              }
            >
              Mostrar LinkedIn no perfil
            </Campo>

            <Campo
              label="Site"
              name="site"
              value={form.site}
              onChange={handleChange}
              placeholder="https://suaempresa.com.br"
              mostrarName="mostrar_site"
              mostrarValue={
                form.mostrar_site
              }
              onMostrarChange={
                handleChange
              }
            >
              Mostrar site no perfil
            </Campo>
          </section>

          <section style={sectionStyle}>
            <TituloSecao
              numero="5"
              titulo="Atendimento e localização"
              descricao="Informe onde você atende e, se necessário, o endereço comercial."
            />

            <Campo
              label="Área de atendimento"
              name="area_atendimento"
              value={
                form.area_atendimento
              }
              onChange={handleChange}
              placeholder="Ex: Bragança Paulista e região"
              mostrarName="mostrar_area_atendimento"
              mostrarValue={
                form.mostrar_area_atendimento
              }
              onMostrarChange={
                handleChange
              }
            >
              Mostrar área de atendimento
            </Campo>

            <Campo
              label="Endereço comercial"
              name="endereco_comercial"
              value={
                form.endereco_comercial
              }
              onChange={handleChange}
              placeholder="Ex: Rua Exemplo, 100 - Centro"
              mostrarName="mostrar_endereco"
              mostrarValue={
                form.mostrar_endereco
              }
              onMostrarChange={
                handleChange
              }
            >
              Mostrar endereço no perfil
            </Campo>

            <Campo
              label="Link do Google Maps"
              name="maps_url"
              value={form.maps_url}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
              mostrarName="mostrar_maps"
              mostrarValue={
                form.mostrar_maps
              }
              onMostrarChange={
                handleChange
              }
            >
              Mostrar botão do mapa
            </Campo>
          </section>

          <section style={sectionStyle}>
            <TituloSecao
              numero="6"
              titulo="Serviços"
              descricao="Adicione até quatro serviços principais."
            />

            <div className="tappro-editor-grid">
              {[1, 2, 3, 4].map(
                (numero) => {
                  const campo =
                    `servico_${numero}`;

                  return (
                    <Campo
                      key={campo}
                      label={`Serviço ${numero}`}
                      name={campo}
                      value={form[campo]}
                      onChange={handleChange}
                      placeholder="Ex: Consultoria"
                    />
                  );
                }
              )}
            </div>

            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_servicos"
                checked={Boolean(
                  form.mostrar_servicos
                )}
                onChange={handleChange}
                style={{
                  width: "auto",
                  margin: 0,
                }}
              />

              Mostrar serviços no perfil
            </label>
          </section>

          <section style={sectionStyle}>
            <TituloSecao
              numero="7"
              titulo="Especialidades"
              descricao="Adicione até cinco especialidades."
            />

            <div className="tappro-editor-grid">
              {[1, 2, 3, 4, 5].map(
                (numero) => {
                  const campo =
                    `especialidade_${numero}`;

                  return (
                    <Campo
                      key={campo}
                      label={`Especialidade ${numero}`}
                      name={campo}
                      value={form[campo]}
                      onChange={handleChange}
                      placeholder="Ex: Gestão comercial"
                    />
                  );
                }
              )}
            </div>

            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_especialidades"
                checked={Boolean(
                  form.mostrar_especialidades
                )}
                onChange={handleChange}
                style={{
                  width: "auto",
                  margin: 0,
                }}
              />

              Mostrar especialidades no perfil
            </label>
          </section>


          <section
            style={{
              ...sectionStyle,
              position: "sticky",
              bottom: "10px",
              zIndex: 10,
              boxShadow:
                "0 16px 40px rgba(0,0,0,0.15)",
            }}
          >
            <div className="tappro-editor-actions">
              <button
                type="submit"
                disabled={salvando}
                style={{
                  minHeight: "52px",
                  padding: "14px",
                  borderRadius: "13px",
                  border: "none",
                  background: salvando
                    ? "#9ca3af"
                    : "#111827",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 850,
                  cursor: salvando
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {salvando
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/pro/perfil/${cleanCode}`
                  )
                }
                style={{
                  minHeight: "52px",
                  padding: "14px",
                  borderRadius: "13px",
                  border: "none",
                  background: "#b8892f",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                Ver perfil público
              </button>

              <button
                type="button"
                onClick={copiarLink}
                style={{
                  minHeight: "52px",
                  padding: "14px",
                  borderRadius: "13px",
                  border:
                    "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: "15px",
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                Copiar link
              </button>
            </div>
          </section>
        </form>

        <button
          type="button"
          onClick={sair}
          style={{
            width: "100%",
            minHeight: "48px",
            marginTop: "18px",
            padding: "12px",
            borderRadius: "13px",
            border:
              "1px solid #d1d5db",
            background: "#ffffff",
            color: "#991b1b",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Fechar acesso neste aparelho
        </button>
      </section>
    </main>
  );
}