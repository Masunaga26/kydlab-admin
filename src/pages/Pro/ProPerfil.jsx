import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  UserRoundPlus,
} from "lucide-react";

import {
  limparCodigoPro,
  codigoProValido,
  getProfessionalProfileByCode,
} from "../../lib/tappro";

const PALETAS = {
  dourado: {
    bg: "#f5f2ec",
    card: "#ffffff",
    text: "#1f2937",
    muted: "#6b7280",
    primary: "#b8892f",
    primaryHover: "#9f7424",
    primaryText: "#ffffff",
    border: "#e6d7b8",
    soft: "#faf7f0",
    dark: "#111827",
    gradientEnd: "#b8892f",
  },

  azul: {
    bg: "#eef4ff",
    card: "#ffffff",
    text: "#172033",
    muted: "#64748b",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    primaryText: "#ffffff",
    border: "#c7d7fe",
    soft: "#f5f8ff",
    dark: "#0f172a",
    gradientEnd: "#2563eb",
  },

  preto: {
    bg: "#111111",
    card: "#1c1c1c",
    text: "#ffffff",
    muted: "#c7c7c7",
    primary: "#d4af37",
    primaryHover: "#b99225",
    primaryText: "#111111",
    border: "#3a3a3a",
    soft: "#252525",
    dark: "#000000",
    gradientEnd: "#8a6d16",
  },

  verde: {
    bg: "#eef8f1",
    card: "#ffffff",
    text: "#1f2937",
    muted: "#64748b",
    primary: "#16a34a",
    primaryHover: "#15803d",
    primaryText: "#ffffff",
    border: "#cdebd6",
    soft: "#f3fbf5",
    dark: "#064e3b",
    gradientEnd: "#16a34a",
  },

  vinho: {
    bg: "#fbf1f4",
    card: "#ffffff",
    text: "#2a1720",
    muted: "#72515d",
    primary: "#8a1538",
    primaryHover: "#70112e",
    primaryText: "#ffffff",
    border: "#ead0d8",
    soft: "#fff7f9",
    dark: "#3f0a1a",
    gradientEnd: "#8a1538",
  },

  cinza: {
    bg: "#f3f4f6",
    card: "#ffffff",
    text: "#1f2937",
    muted: "#6b7280",
    primary: "#374151",
    primaryHover: "#1f2937",
    primaryText: "#ffffff",
    border: "#d1d5db",
    soft: "#f9fafb",
    dark: "#111827",
    gradientEnd: "#4b5563",
  },
};

function temTexto(valor) {
  return Boolean(String(valor || "").trim());
}

function normalizarUrl(url) {
  if (!url) return "";

  const value = String(url).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return value;
  }

  return `https://${value}`;
}

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function normalizarTelefoneBrasil(valor) {
  let numero = somenteNumeros(valor);

  if (!numero) return "";

  if (numero.startsWith("00")) {
    numero = numero.slice(2);
  }

  if (numero.startsWith("55") && (numero.length === 12 || numero.length === 13)) {
    return `+${numero}`;
  }

  if (numero.length === 10 || numero.length === 11) {
    return `+55${numero}`;
  }

  return `+${numero}`;
}

function telefoneParaWhatsapp(valor) {
  return normalizarTelefoneBrasil(valor).replace(/\D/g, "");
}

function getIniciais(nome) {
  const partes = String(nome || "TP")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) return "TP";

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function escaparVCard(valor) {
  return String(valor || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function getBasePublica() {
  const urlConfigurada = String(
    import.meta.env.VITE_PUBLIC_APP_URL || ""
  ).trim();

  if (urlConfigurada) {
    return urlConfigurada.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "";
}

function criarVCard(perfil, linkPerfil) {
  const nome = escaparVCard(perfil.nome || "Contato TAP PRO");
  const empresa = escaparVCard(perfil.empresa || "");
  const titulo = escaparVCard(perfil.titulo_profissional || "");
  const whatsapp = normalizarTelefoneBrasil(perfil.whatsapp);
  const telefone = normalizarTelefoneBrasil(perfil.telefone);
  const email = String(perfil.email || "").trim();
  const site = perfil.site ? normalizarUrl(perfil.site) : "";
  const endereco = escaparVCard(perfil.endereco_comercial || "");

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${nome}`,
    empresa ? `ORG:${empresa}` : "",
    titulo ? `TITLE:${titulo}` : "",
    whatsapp ? `TEL;TYPE=CELL:${whatsapp}` : "",
    telefone ? `TEL;TYPE=WORK,VOICE:${telefone}` : "",
    email ? `EMAIL;TYPE=WORK:${email}` : "",
    site ? `URL;TYPE=WORK:${site}` : "",
    linkPerfil ? `URL;TYPE=HOME:${linkPerfil}` : "",
    endereco ? `ADR;TYPE=WORK:;;${endereco};;;;` : "",
    linkPerfil
      ? `NOTE:${escaparVCard(`Perfil profissional: ${linkPerfil}`)}`
      : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function baixarVCard(perfil, linkPerfil) {
  const vcard = criarVCard(perfil, linkPerfil);

  const blob = new Blob([vcard], {
    type: "text/vcard;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const nomeArquivoBase = String(perfil.nome || "contato-tappro")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const a = document.createElement("a");

  a.href = url;
  a.download = `${nomeArquivoBase || "contato-tappro"}.vcf`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function IconeComTexto({ icon: Icone, children, size = 18 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "9px",
      }}
    >
      <Icone size={size} strokeWidth={2.2} />
      <span>{children}</span>
    </span>
  );
}

function AvatarPerfil({
  perfil,
  tema,
  moderno = false,
  fotoErro,
  onFotoErro,
}) {
  const mostrarFoto =
    perfil.foto_url && perfil.mostrar_foto && !fotoErro;

  const tamanho = moderno ? 96 : 116;

  if (mostrarFoto) {
    return (
      <img
        src={perfil.foto_url}
        alt={perfil.nome || "Foto profissional"}
        onError={onFotoErro}
        style={{
          width: tamanho,
          height: tamanho,
          minWidth: tamanho,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
          border: moderno
            ? "3px solid rgba(255,255,255,0.55)"
            : `4px solid ${tema.border}`,
          boxShadow: moderno
            ? "0 10px 24px rgba(0,0,0,0.22)"
            : "0 8px 20px rgba(0,0,0,0.10)",
        }}
      />
    );
  }

  return (
    <div
      aria-label="Iniciais do perfil"
      style={{
        width: tamanho,
        height: tamanho,
        minWidth: tamanho,
        borderRadius: "50%",
        background: moderno
          ? "rgba(255,255,255,0.16)"
          : tema.primary,
        color: moderno ? "#ffffff" : tema.primaryText,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: moderno ? 25 : 32,
        fontWeight: 900,
        letterSpacing: "-0.5px",
        border: moderno
          ? "3px solid rgba(255,255,255,0.38)"
          : `4px solid ${tema.border}`,
        boxShadow: moderno
          ? "0 10px 24px rgba(0,0,0,0.18)"
          : "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      {getIniciais(perfil.nome)}
    </div>
  );
}

function LogoPerfil({ perfil, logoErro, onLogoErro, moderno = false }) {
  if (!perfil.logo_url || !perfil.mostrar_logo || logoErro) {
    return null;
  }

  return (
    <img
      src={perfil.logo_url}
      alt={`Logo ${perfil.empresa || perfil.nome || "profissional"}`}
      onError={onLogoErro}
      style={{
        maxWidth: moderno ? "92px" : "96px",
        maxHeight: moderno ? "52px" : "58px",
        objectFit: "contain",
        display: "block",
        borderRadius: "12px",
        background: moderno ? "rgba(255,255,255,0.96)" : "transparent",
        padding: moderno ? "7px" : "0",
      }}
    />
  );
}

function BotaoPrincipal({
  href,
  onClick,
  tema,
  children,
  cor,
  textoCor = "#ffffff",
  target,
  rel,
  type = "button",
}) {
  const style = {
    width: "100%",
    minHeight: "52px",
    border: "none",
    borderRadius: "14px",
    background: cor || tema.primary,
    color: textoCor,
    fontSize: "16px",
    fontWeight: 850,
    cursor: "pointer",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
    transition: "transform 0.18s ease, opacity 0.18s ease",
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        style={style}
        className="tappro-primary-action"
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      style={style}
      className="tappro-primary-action"
    >
      {children}
    </button>
  );
}

function BotaoLink({
  href,
  tema,
  icon: Icone,
  children,
  target,
  rel,
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="tappro-link-button"
      style={{
        minHeight: "50px",
        padding: "13px 15px",
        borderRadius: "13px",
        border: `1px solid ${tema.border}`,
        background: tema.soft,
        color: tema.text,
        textDecoration: "none",
        fontWeight: 780,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        transition:
          "transform 0.18s ease, border-color 0.18s ease, background 0.18s ease",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "11px",
          minWidth: 0,
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            minWidth: 34,
            borderRadius: "10px",
            background: tema.card,
            border: `1px solid ${tema.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: tema.primary,
          }}
        >
          <Icone size={18} strokeWidth={2.1} />
        </span>

        <span>{children}</span>
      </span>

      <ExternalLink size={16} color={tema.muted} />
    </a>
  );
}

function TituloSecao({ icon: Icone, children, tema, minimalista = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "14px",
        paddingBottom: minimalista ? "10px" : "0",
        borderBottom: minimalista ? `1px solid ${tema.border}` : "none",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: minimalista ? "8px" : "10px",
          background: tema.soft,
          border: `1px solid ${tema.border}`,
          color: tema.primary,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icone size={18} strokeWidth={2.2} />
      </span>

      <h2
        style={{
          fontSize: "18px",
          margin: 0,
          color: tema.text,
          fontWeight: 850,
          letterSpacing: "-0.2px",
        }}
      >
        {children}
      </h2>
    </div>
  );
}

export default function ProPerfil() {
  const { code } = useParams();
  const cleanCode = limparCodigoPro(code);

  const timerCopiarRef = useRef(null);
  const timerContatoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState("");

  const [contatoSalvo, setContatoSalvo] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const [fotoErro, setFotoErro] = useState(false);
  const [logoErro, setLogoErro] = useState(false);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      setErro("");
      setFotoErro(false);
      setLogoErro(false);

      if (!codigoProValido(cleanCode)) {
        setErro("Código TAP PRO inválido.");
        setLoading(false);
        return;
      }

      const { data, error } =
        await getProfessionalProfileByCode(cleanCode);

      if (error) {
        console.error("Erro ao carregar perfil TAP PRO:", error);
        setErro("Não foi possível carregar este perfil.");
        setLoading(false);
        return;
      }

      if (!data || !data.active) {
        setErro("Perfil ainda não ativado.");
        setLoading(false);
        return;
      }

      setPerfil(data);
      setLoading(false);
    }

    carregar();
  }, [cleanCode]);

  useEffect(() => {
    return () => {
      if (timerCopiarRef.current) {
        clearTimeout(timerCopiarRef.current);
      }

      if (timerContatoRef.current) {
        clearTimeout(timerContatoRef.current);
      }
    };
  }, []);

  const tema = useMemo(() => {
    return PALETAS[perfil?.color_palette] || PALETAS.dourado;
  }, [perfil?.color_palette]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "20px",
            padding: "34px 24px",
            boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "4px solid #e5e7eb",
              borderTopColor: "#b8892f",
              margin: "0 auto 18px",
              animation: "spin 0.9s linear infinite",
            }}
          />

          <h1 style={{ margin: "0 0 8px", fontSize: "25px" }}>
            TAP PRO
          </h1>

          <p style={{ margin: 0, color: "#6b7280" }}>
            Carregando perfil profissional...
          </p>
        </section>
      </main>
    );
  }

  if (erro || !perfil) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
            background: "#ffffff",
            borderRadius: "20px",
            padding: "34px 24px",
            boxShadow: "0 18px 45px rgba(0,0,0,0.10)",
          }}
        >
          <h1 style={{ margin: "0 0 10px", fontSize: "26px" }}>
            TAP PRO
          </h1>

          <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.5 }}>
            {erro || "Perfil não encontrado."}
          </p>
        </section>
      </main>
    );
  }

  const basePublica = getBasePublica();

  const linkPerfil = `${basePublica}/pro/perfil/${perfil.code}`;

  const numeroWhatsapp = telefoneParaWhatsapp(perfil.whatsapp);

  const mensagemWhatsapp =
    perfil.whatsapp_mensagem ||
    `Olá, ${perfil.nome}! Encontrei seu perfil profissional pelo TAP PRO.\n\nSeu perfil:\n${linkPerfil}`;

  const whatsappUrl = numeroWhatsapp
    ? `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(
        mensagemWhatsapp
      )}`
    : "";

  const servicos = [
    perfil.servico_1,
    perfil.servico_2,
    perfil.servico_3,
    perfil.servico_4,
  ].filter(temTexto);

  const especialidades = [
    perfil.especialidade_1,
    perfil.especialidade_2,
    perfil.especialidade_3,
    perfil.especialidade_4,
    perfil.especialidade_5,
  ].filter(temTexto);

  const contatosVisiveis = [
    {
      id: "telefone",
      mostrar: perfil.telefone && perfil.mostrar_telefone,
      href: `tel:${normalizarTelefoneBrasil(perfil.telefone)}`,
      texto: "Ligar",
      icon: Phone,
    },
    {
      id: "email",
      mostrar: perfil.email && perfil.mostrar_email,
      href: `mailto:${perfil.email}`,
      texto: "Enviar e-mail",
      icon: Mail,
    },
    {
      id: "instagram",
      mostrar: perfil.instagram && perfil.mostrar_instagram,
      href: normalizarUrl(perfil.instagram),
      texto: "Instagram",
      icon: Globe2,
      externo: true,
    },
    {
      id: "linkedin",
      mostrar: perfil.linkedin && perfil.mostrar_linkedin,
      href: normalizarUrl(perfil.linkedin),
      texto: "LinkedIn",
      icon: BriefcaseBusiness,
      externo: true,
    },
    {
      id: "site",
      mostrar: perfil.site && perfil.mostrar_site,
      href: normalizarUrl(perfil.site),
      texto: "Site profissional",
      icon: Globe2,
      externo: true,
    },
  ].filter((item) => Boolean(item.mostrar));

  const temContatosVisiveis = contatosVisiveis.length > 0;

  const temLocalizacao =
    (perfil.endereco_comercial && perfil.mostrar_endereco) ||
    (perfil.maps_url && perfil.mostrar_maps);

  const isModerno = perfil.page_template === "moderno";
  const isMinimalista = perfil.page_template === "minimalista";

  function salvarContato() {
    baixarVCard(perfil, linkPerfil);

    setContatoSalvo(true);

    if (timerContatoRef.current) {
      clearTimeout(timerContatoRef.current);
    }

    timerContatoRef.current = setTimeout(() => {
      setContatoSalvo(false);
    }, 5000);
  }

  async function copiarLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(linkPerfil);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = linkPerfil;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setLinkCopiado(true);

      if (timerCopiarRef.current) {
        clearTimeout(timerCopiarRef.current);
      }

      timerCopiarRef.current = setTimeout(() => {
        setLinkCopiado(false);
      }, 2500);
    } catch (error) {
      console.error("Não foi possível copiar o link:", error);
      setLinkCopiado(false);
    }
  }

  const cardStyle = {
    maxWidth: isModerno ? "640px" : isMinimalista ? "560px" : "540px",
    margin: "0 auto",
    background: tema.card,
    borderRadius: isMinimalista ? "12px" : "24px",
    boxShadow: isMinimalista
      ? "0 8px 24px rgba(0,0,0,0.05)"
      : "0 22px 54px rgba(0,0,0,0.13)",
    border: `1px solid ${tema.border}`,
    overflow: "hidden",
  };

  return (
    <>
      <style>
        {`
          .tappro-primary-action:hover {
            transform: translateY(-1px);
            opacity: 0.96;
          }

          .tappro-primary-action:active {
            transform: translateY(0);
          }

          .tappro-link-button:hover {
            transform: translateY(-1px);
          }

          .tappro-services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
            gap: 10px;
          }

          .tappro-actions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          @media (max-width: 520px) {
            .tappro-actions-grid {
              grid-template-columns: 1fr;
            }

            .tappro-services-grid {
              grid-template-columns: 1fr;
            }

            .tappro-modern-header-content {
              align-items: flex-start !important;
              flex-direction: column !important;
            }

            .tappro-modern-identity {
              width: 100%;
            }
          }
        `}
      </style>

      <main
        style={{
          minHeight: "100vh",
          background: tema.bg,
          padding: isMinimalista ? "22px 14px" : "30px 14px",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
          color: tema.text,
        }}
      >
        <section style={cardStyle}>
          {isModerno && (
            <header
              style={{
                padding: "28px",
                background: `linear-gradient(135deg, ${tema.dark} 0%, ${tema.gradientEnd} 100%)`,
                color: "#ffffff",
              }}
            >
              <div
                className="tappro-modern-header-content"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <div
                  className="tappro-modern-identity"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    minWidth: 0,
                  }}
                >
                  <AvatarPerfil
                    perfil={perfil}
                    tema={tema}
                    moderno
                    fotoErro={fotoErro}
                    onFotoErro={() => setFotoErro(true)}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        opacity: 0.84,
                        marginBottom: "7px",
                      }}
                    >
                      <BadgeCheck size={15} />
                      Perfil profissional
                    </div>

                    <h1
                      style={{
                        margin: 0,
                        fontSize: "clamp(25px, 5vw, 34px)",
                        lineHeight: 1.08,
                        letterSpacing: "-0.8px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {perfil.nome}
                    </h1>

                    <p
                      style={{
                        margin: "8px 0 0",
                        fontWeight: 750,
                        opacity: 0.95,
                        lineHeight: 1.35,
                      }}
                    >
                      {perfil.titulo_profissional}
                    </p>
                  </div>
                </div>

                <LogoPerfil
                  perfil={perfil}
                  logoErro={logoErro}
                  onLogoErro={() => setLogoErro(true)}
                  moderno
                />
              </div>
            </header>
          )}

          <div
            style={{
              padding: isMinimalista ? "28px 24px" : "28px",
              textAlign: isMinimalista ? "left" : "center",
            }}
          >
            {!isModerno && (
              <header
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMinimalista ? "flex-start" : "center",
                }}
              >
                <AvatarPerfil
                  perfil={perfil}
                  tema={tema}
                  fotoErro={fotoErro}
                  onFotoErro={() => setFotoErro(true)}
                />

                <div
                  style={{
                    marginTop: "14px",
                  }}
                >
                  <LogoPerfil
                    perfil={perfil}
                    logoErro={logoErro}
                    onLogoErro={() => setLogoErro(true)}
                  />
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    width: "100%",
                  }}
                >
                  {isMinimalista && (
                    <p
                      style={{
                        margin: "0 0 8px",
                        color: tema.primary,
                        fontSize: "12px",
                        fontWeight: 850,
                        textTransform: "uppercase",
                        letterSpacing: "1.4px",
                      }}
                    >
                      Perfil profissional
                    </p>
                  )}

                  <h1
                    style={{
                      margin: 0,
                      fontSize: isMinimalista
                        ? "clamp(28px, 7vw, 38px)"
                        : "clamp(27px, 7vw, 34px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.8px",
                      color: tema.text,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {perfil.nome}
                  </h1>

                  <p
                    style={{
                      margin: "9px 0 0",
                      color: tema.text,
                      fontSize: "17px",
                      fontWeight: 780,
                      lineHeight: 1.4,
                    }}
                  >
                    {perfil.titulo_profissional}
                  </p>
                </div>
              </header>
            )}

            <div
              style={{
                textAlign: isMinimalista ? "left" : "center",
              }}
            >
              {perfil.empresa && perfil.mostrar_empresa && (
                <p
                  style={{
                    display: isMinimalista ? "flex" : "inline-flex",
                    alignItems: "center",
                    justifyContent: isMinimalista ? "flex-start" : "center",
                    gap: "7px",
                    color: tema.muted,
                    margin: isModerno ? "0 0 12px" : "12px 0 0",
                    lineHeight: 1.4,
                    fontWeight: 650,
                  }}
                >
                  <Building2 size={17} />
                  {perfil.empresa}
                </p>
              )}

              {perfil.descricao && perfil.mostrar_descricao && (
                <p
                  style={{
                    lineHeight: 1.65,
                    color: tema.text,
                    margin: "18px 0 0",
                    fontSize: "15px",
                  }}
                >
                  {perfil.descricao}
                </p>
              )}

              {perfil.area_atendimento &&
                perfil.mostrar_area_atendimento && (
                  <p
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "8px 12px",
                      borderRadius: "999px",
                      background: tema.soft,
                      color: tema.muted,
                      margin: "16px 0 0",
                      fontSize: "13px",
                      border: `1px solid ${tema.border}`,
                      fontWeight: 700,
                    }}
                  >
                    <MapPin size={15} />
                    {perfil.area_atendimento}
                  </p>
                )}
            </div>

            <div
              className="tappro-actions-grid"
              style={{
                marginTop: "24px",
              }}
            >
              <BotaoPrincipal
                onClick={salvarContato}
                tema={tema}
                textoCor={tema.primaryText}
              >
                <IconeComTexto icon={UserRoundPlus}>
                  Salvar contato
                </IconeComTexto>
              </BotaoPrincipal>

              {whatsappUrl && (
                <BotaoPrincipal
                  href={whatsappUrl}
                  tema={tema}
                  cor="#16a34a"
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconeComTexto icon={MessageCircle}>
                    Falar no WhatsApp
                  </IconeComTexto>
                </BotaoPrincipal>
              )}
            </div>

            <p
              style={{
                color: tema.muted,
                fontSize: "12px",
                lineHeight: 1.5,
                margin: "11px 0 0",
                textAlign: "center",
              }}
            >
              Salve o contato na agenda e mantenha este perfil sempre
              acessível.
            </p>

            {contatoSalvo && (
              <div
                role="status"
                style={{
                  marginTop: "16px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: tema.soft,
                  border: `1px solid ${tema.border}`,
                  color: tema.text,
                  fontWeight: 750,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  textAlign: "center",
                }}
              >
                <Check size={18} color={tema.primary} />
                Arquivo de contato gerado.
              </div>
            )}

            {temContatosVisiveis && (
              <section
                style={{
                  marginTop: "30px",
                  textAlign: "left",
                }}
              >
                <TituloSecao
                  icon={Phone}
                  tema={tema}
                  minimalista={isMinimalista}
                >
                  Contato e links
                </TituloSecao>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  {contatosVisiveis.map((item) => (
                    <BotaoLink
                      key={item.id}
                      href={item.href}
                      tema={tema}
                      icon={item.icon}
                      target={item.externo ? "_blank" : undefined}
                      rel={item.externo ? "noreferrer" : undefined}
                    >
                      {item.texto}
                    </BotaoLink>
                  ))}
                </div>
              </section>
            )}

            {servicos.length > 0 && perfil.mostrar_servicos && (
              <section
                style={{
                  marginTop: "30px",
                  textAlign: "left",
                }}
              >
                <TituloSecao
                  icon={BriefcaseBusiness}
                  tema={tema}
                  minimalista={isMinimalista}
                >
                  Serviços
                </TituloSecao>

                <div className="tappro-services-grid">
                  {servicos.map((servico, index) => (
                    <div
                      key={`${servico}-${index}`}
                      style={{
                        padding: "15px",
                        borderRadius: isMinimalista ? "8px" : "14px",
                        background: tema.soft,
                        border: `1px solid ${tema.border}`,
                        color: tema.text,
                        fontWeight: 730,
                        lineHeight: 1.4,
                        minHeight: "54px",
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                      }}
                    >
                      <BadgeCheck
                        size={18}
                        color={tema.primary}
                        style={{ minWidth: 18 }}
                      />

                      <span>{servico}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {especialidades.length > 0 &&
              perfil.mostrar_especialidades && (
                <section
                  style={{
                    marginTop: "30px",
                    textAlign: "left",
                  }}
                >
                  <TituloSecao
                    icon={BadgeCheck}
                    tema={tema}
                    minimalista={isMinimalista}
                  >
                    Especialidades
                  </TituloSecao>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {especialidades.map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        style={{
                          padding: "8px 12px",
                          borderRadius: isMinimalista ? "7px" : "999px",
                          background: tema.soft,
                          border: `1px solid ${tema.border}`,
                          color: tema.text,
                          fontWeight: 720,
                          fontSize: "13px",
                          lineHeight: 1.35,
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>
              )}

            {temLocalizacao && (
              <section
                style={{
                  marginTop: "30px",
                  textAlign: "left",
                }}
              >
                <TituloSecao
                  icon={MapPin}
                  tema={tema}
                  minimalista={isMinimalista}
                >
                  Localização
                </TituloSecao>

                {perfil.endereco_comercial &&
                  perfil.mostrar_endereco && (
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: isMinimalista ? "8px" : "13px",
                        background: tema.soft,
                        border: `1px solid ${tema.border}`,
                        marginBottom:
                          perfil.maps_url && perfil.mostrar_maps
                            ? "10px"
                            : "0",
                      }}
                    >
                      <p
                        style={{
                          color: tema.text,
                          lineHeight: 1.55,
                          margin: 0,
                          fontSize: "14px",
                        }}
                      >
                        {perfil.endereco_comercial}
                      </p>
                    </div>
                  )}

                {perfil.maps_url && perfil.mostrar_maps && (
                  <BotaoLink
                    href={normalizarUrl(perfil.maps_url)}
                    tema={tema}
                    icon={MapPin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir no Google Maps
                  </BotaoLink>
                )}
              </section>
            )}

            <button
              type="button"
              onClick={copiarLink}
              style={{
                marginTop: "30px",
                background: linkCopiado ? tema.soft : "transparent",
                border: `1px solid ${tema.border}`,
                color: linkCopiado ? tema.primary : tema.muted,
                padding: "12px 14px",
                borderRadius: isMinimalista ? "8px" : "12px",
                cursor: "pointer",
                width: "100%",
                minHeight: "46px",
                fontWeight: 780,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition:
                  "background 0.18s ease, color 0.18s ease, transform 0.18s ease",
              }}
            >
              {linkCopiado ? (
                <>
                  <Check size={18} />
                  Link copiado!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copiar link do perfil
                </>
              )}
            </button>

            <footer
              style={{
                marginTop: "28px",
                paddingTop: "20px",
                borderTop: `1px solid ${tema.border}`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: tema.muted,
                  fontSize: "12px",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Perfil profissional conectado por{" "}
                <strong style={{ color: tema.text }}>TAP PRO</strong>
              </p>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}