import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  UserRoundPlus,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  getProfessionalPublicByPieceNovoPro,
  limparCodigoPro,
} from "../../lib/tappro";

const MODULES = {
  instagram: {
    label: "Instagram",
    helper: "Acompanhe novidades e conteúdos",
  },
  linkedin: {
    label: "LinkedIn",
    helper: "Veja trajetória e conexões profissionais",
  },
  website: {
    label: "Site profissional",
    helper: "Conheça mais sobre o trabalho",
  },
  portfolio: {
    label: "Portfólio",
    helper: "Veja projetos, trabalhos e resultados",
  },
  scheduling: {
    label: "Agendar conversa",
    helper: "Escolha um horário para conversar",
  },
  maps: {
    label: "Localização",
    helper: "Veja onde o profissional atende",
  },
  company_page: {
    label: "Conheça a empresa",
    helper: "Acesse a página comercial da empresa",
  },
  email: {
    label: "Enviar e-mail",
    helper: "Entre em contato por e-mail",
  },
  phone: {
    label: "Ligar",
    helper: "Faça uma ligação direta",
  },
};

const GOALS = {
  whatsapp: {
    eyebrow: "Vamos conversar",
    title: "Fale com {nome}",
    text: "Tire dúvidas, solicite informações ou conheça melhor o trabalho.",
    button: "Conversar com {primeiro}",
  },
  scheduling: {
    eyebrow: "Agende uma conversa",
    title: "Reserve um horário com {nome}",
    text: "Escolha o melhor momento para uma conversa profissional.",
    button: "Agendar atendimento",
  },
  instagram: {
    eyebrow: "Acompanhe o trabalho",
    title: "Continue conectado com {nome}",
    text: "Veja novidades, conteúdos e oportunidades.",
    button: "Seguir {primeiro}",
  },
  portfolio: {
    eyebrow: "Conheça os resultados",
    title: "Veja o trabalho de {nome}",
    text: "Explore projetos, experiências e resultados profissionais.",
    button: "Abrir portfólio",
  },
  share: {
    eyebrow: "Indique este profissional",
    title: "Conhece alguém que precisa deste serviço?",
    text: "Compartilhe este perfil com outra pessoa.",
    button: "Indicar {primeiro}",
  },
  company_page: {
    eyebrow: "Conheça também a empresa",
    title: "Descubra onde {nome} atua",
    text: "Acesse a página da empresa e conheça outros serviços.",
    button: "Conhecer a empresa",
  },
};

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function url(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  if (
    text.startsWith("http://") ||
    text.startsWith("https://") ||
    text.startsWith("mailto:") ||
    text.startsWith("tel:")
  ) {
    return text;
  }

  return `https://${text}`;
}

function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "este profissional";
}

function personalized(text, name) {
  return String(text || "")
    .replaceAll("{nome}", name || "este profissional")
    .replaceAll("{primeiro}", firstName(name));
}

function goalUrl(data, goal, whatsapp) {
  const map = {
    whatsapp,
    scheduling: data.scheduling_url,
    instagram: data.instagram,
    portfolio: data.portfolio_url,
    company_page: data.company_page_url,
  };

  return url(map[goal] || "");
}

function vcard(data, pageUrl) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.professional_name || ""}`,
    data.professional_title ? `TITLE:${data.professional_title}` : "",
    data.whatsapp
      ? `TEL;TYPE=CELL:+55${digits(data.whatsapp).replace(/^55/, "")}`
      : "",
    data.phone
      ? `TEL;TYPE=WORK:+55${digits(data.phone).replace(/^55/, "")}`
      : "",
    data.email ? `EMAIL:${data.email}` : "",
    data.website ? `URL:${url(data.website)}` : "",
    `URL:${pageUrl}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function downloadContact(data, pageUrl) {
  const blob = new Blob([vcard(data, pageUrl)], {
    type: "text/vcard;charset=utf-8",
  });

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = `${firstName(
    data.professional_name
  ).toLowerCase()}-contato.vcf`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function moduleHref(data, code) {
  const map = {
    instagram: data.instagram,
    linkedin: data.linkedin,
    website: data.website,
    portfolio: data.portfolio_url,
    scheduling: data.scheduling_url,
    maps: data.maps_url,
    company_page: data.company_page_url,
    email: data.email ? `mailto:${data.email}` : "",
    phone: data.phone ? `tel:${digits(data.phone)}` : "",
  };

  return url(map[code] || "");
}

function ModuleIcon({ code }) {
  if (code === "linkedin") return <BriefcaseBusiness size={20} />;
  if (code === "scheduling") return <CalendarDays size={20} />;
  if (code === "maps") return <MapPin size={20} />;
  if (code === "email") return <Mail size={20} />;
  if (code === "phone") return <Phone size={20} />;
  if (code === "company_page") return <BriefcaseBusiness size={20} />;
  return <Globe2 size={20} />;
}

export default function ProProfissionalPublico() {
  const { pieceCode } = useParams();
  const cleanCode = limparCodigoPro(pieceCode);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const result = await getProfessionalPublicByPieceNovoPro(cleanCode);

      if (result.error || !result.data?.found) {
        console.error(result.error);
        setError("Perfil profissional não encontrado.");
        setLoading(false);
        return;
      }

      setData(result.data);
      setLoading(false);
    }

    load();
  }, [cleanCode]);

  const whatsappUrl = useMemo(() => {
    if (!data?.whatsapp) return "";

    const number = digits(data.whatsapp);
    const finalNumber = number.startsWith("55") ? number : `55${number}`;
    const text = `Olá, ${firstName(
      data.professional_name
    )}! Encontrei seu perfil pelo TAP PRO.`;

    return `https://wa.me/${finalNumber}?text=${encodeURIComponent(text)}`;
  }, [data?.whatsapp, data?.professional_name]);

  const primaryGoal =
    data?.primary_goal === "auto"
      ? data?.portfolio_url
        ? "portfolio"
        : data?.instagram
        ? "instagram"
        : "whatsapp"
      : data?.primary_goal;

  const goal = GOALS[primaryGoal] || GOALS.whatsapp;

  const actionUrl =
    data && goal ? goalUrl(data, primaryGoal, whatsappUrl) : "";

  async function share() {
    const pageUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: data.professional_name,
          text: data.description || `Conheça ${data.professional_name}`,
          url: pageUrl,
        });
      } catch {
        // O usuário pode cancelar.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(pageUrl);
      setMessage("Link copiado.");
    } catch {
      setMessage("Não foi possível copiar o link.");
    }
  }

  if (loading) return <Screen text="Carregando perfil..." />;
  if (error || !data) return <Screen text={error} />;

  const services = [data.service_1, data.service_2].filter(Boolean);

  const visibleModules = (data.top3 || [])
    .map((item) => {
      const config = MODULES[item.module_code];
      const href = moduleHref(data, item.module_code);

      if (!config || !href) return null;

      return {
        code: item.module_code,
        config,
        href,
      };
    })
    .filter(Boolean);

  const quickActions = [
    data.phone
      ? {
          key: "phone",
          label: "Ligar",
          icon: Phone,
          href: `tel:${digits(data.phone)}`,
        }
      : null,
    data.email
      ? {
          key: "email",
          label: "E-mail",
          icon: Mail,
          href: `mailto:${data.email}`,
        }
      : null,
    whatsappUrl
      ? {
          key: "whatsapp",
          label: "WhatsApp",
          icon: MessageCircle,
          href: whatsappUrl,
        }
      : null,
  ].filter(Boolean);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px 14px 48px",
        background: "linear-gradient(180deg,#f4f5f7 0%,#eceff3 100%)",
        color: "#111827",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            padding: "30px 24px 28px",
            borderRadius: 28,
            background:
              "linear-gradient(145deg,#161616 0%,#26231f 58%,#3b352e 100%)",
            color: "#ffffff",
            textAlign: "center",
            boxShadow: "0 20px 54px rgba(17,24,39,.19)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 230,
              height: 230,
              borderRadius: "50%",
              right: -120,
              top: -145,
              border: "1px solid rgba(255,255,255,.08)",
              pointerEvents: "none",
            }}
          />

          {data.photo_url && (
            <img
              src={data.photo_url}
              alt={data.professional_name}
              style={{
                width: 108,
                height: 108,
                objectFit: "cover",
                borderRadius: "50%",
                border: "4px solid rgba(255,255,255,.85)",
                boxShadow: "0 14px 34px rgba(0,0,0,.26)",
                position: "relative",
                zIndex: 1,
              }}
            />
          )}

          <p
            style={{
              margin: "15px 0 5px",
              opacity: 0.67,
              fontSize: 10.5,
              fontWeight: 850,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Perfil profissional
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(30px,7vw,40px)",
              lineHeight: 1.04,
              letterSpacing: "-.8px",
              fontWeight: 800,
            }}
          >
            {data.professional_name}
          </h1>

          {data.professional_title && (
            <p
              style={{
                margin: "8px 0 0",
                fontWeight: 680,
                fontSize: 15,
              }}
            >
              {data.professional_title}
            </p>
          )}

          {data.description && (
            <p
              style={{
                margin: "14px auto 0",
                maxWidth: 420,
                fontSize: 14,
                lineHeight: 1.58,
                opacity: 0.78,
              }}
            >
              {data.description}
            </p>
          )}
        </header>

        <div style={{ padding: "28px 8px 0" }}>
          {message && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                borderRadius: 14,
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                color: "#166534",
                textAlign: "center",
                fontWeight: 740,
                fontSize: 13,
              }}
            >
              {message}
            </div>
          )}

          <section>
            <p
              style={{
                margin: "0 0 7px",
                color: "#9a6d23",
                fontSize: 11.5,
                fontWeight: 850,
                textTransform: "uppercase",
                letterSpacing: ".8px",
              }}
            >
              {goal.eyebrow}
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "clamp(25px,6vw,31px)",
                lineHeight: 1.13,
                letterSpacing: "-.55px",
              }}
            >
              {personalized(goal.title, data.professional_name)}
            </h2>

            <p
              style={{
                margin: "10px 0 0",
                color: "#6b7280",
                fontSize: 14.5,
                lineHeight: 1.58,
              }}
            >
              {personalized(goal.text, data.professional_name)}
            </p>

            {primaryGoal === "share" ? (
              <button type="button" onClick={share} style={primaryButtonStyle}>
                <Share2 size={20} />
                {personalized(goal.button, data.professional_name)}
                <ArrowUpRight size={18} style={{ marginLeft: "auto" }} />
              </button>
            ) : actionUrl ? (
              <a
                href={actionUrl}
                target="_blank"
                rel="noreferrer"
                style={primaryButtonStyle}
              >
                {primaryGoal === "whatsapp" ? (
                  <MessageCircle size={20} />
                ) : (
                  <ArrowUpRight size={20} />
                )}
                {personalized(goal.button, data.professional_name)}
                <ArrowUpRight size={18} style={{ marginLeft: "auto" }} />
              </a>
            ) : null}
          </section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0,
              marginTop: 18,
              borderTop: "1px solid #dfe3e8",
              borderBottom: "1px solid #dfe3e8",
            }}
          >
            <button
              type="button"
              onClick={() => downloadContact(data, window.location.href)}
              style={{
                ...toolbarButtonStyle,
                borderRight: "1px solid #dfe3e8",
              }}
            >
              <UserRoundPlus size={19} />
              Salvar contato
            </button>

            <button type="button" onClick={share} style={toolbarButtonStyle}>
              <Share2 size={19} />
              Compartilhar
            </button>
          </div>

          {quickActions.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${quickActions.length},1fr)`,
                  gap: 10,
                }}
              >
                {quickActions.map(({ key, label, icon: Icon, href }) => (
                  <a
                    key={key}
                    href={href}
                    target={key === "whatsapp" ? "_blank" : undefined}
                    rel={key === "whatsapp" ? "noreferrer" : undefined}
                    style={{
                      minHeight: 82,
                      padding: "11px 6px",
                      borderRadius: 16,
                      border: "1px solid #e1e5ea",
                      background: "rgba(255,255,255,.72)",
                      color: "#111827",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 12.5,
                      fontWeight: 760,
                    }}
                  >
                    <span
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: "#f3eadc",
                        color: "#9a6d23",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon size={19} />
                    </span>
                    {label}
                  </a>
                ))}
              </div>
            </section>
          )}

          {visibleModules.length > 0 && (
            <section
              style={{
                marginTop: 30,
                paddingTop: 25,
                borderTop: "1px solid #dfe3e8",
              }}
            >
              <SectionTitle
                title="Meus links"
                subtitle="Acesse os principais canais profissionais"
              />

              <div style={{ display: "grid", gap: 10 }}>
                {visibleModules.map(({ code, config, href }) => (
                  <a
                    key={code}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      minHeight: 66,
                      padding: "11px 13px",
                      borderRadius: 15,
                      border: "1px solid #e1e5ea",
                      background: "rgba(255,255,255,.76)",
                      color: "#111827",
                      textDecoration: "none",
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 18px",
                      gap: 11,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "#f3eadc",
                        color: "#9a6d23",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ModuleIcon code={code} />
                    </span>

                    <span>
                      <strong
                        style={{
                          display: "block",
                          fontSize: 14.5,
                          fontWeight: 760,
                        }}
                      >
                        {config.label}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: 3,
                          color: "#6b7280",
                          fontSize: 12.5,
                          lineHeight: 1.4,
                        }}
                      >
                        {config.helper}
                      </span>
                    </span>

                    <ArrowUpRight size={17} style={{ opacity: 0.62 }} />
                  </a>
                ))}
              </div>
            </section>
          )}

          {services.length > 0 && (
            <section
              style={{
                marginTop: 30,
                paddingTop: 25,
                borderTop: "1px solid #dfe3e8",
              }}
            >
              <SectionTitle
                title="Serviços"
                subtitle="O que este profissional oferece"
              />

              <div style={{ display: "grid", gap: 9 }}>
                {services.map((service) => (
                  <div
                    key={service}
                    style={{
                      padding: "13px 14px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,.66)",
                      border: "1px solid #e1e5ea",
                      fontSize: 14,
                      fontWeight: 720,
                    }}
                  >
                    {service}
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer
            style={{
              marginTop: 27,
              padding: "18px 0 4px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: 11.5,
            }}
          >
            Conectado por{" "}
            <a
              href="https://kydlab.com.br"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#111827",
                textDecoration: "none",
                fontWeight: 760,
              }}
            >
              TAP PRO · KYD LAB
            </a>
          </footer>
        </div>
      </section>
    </main>
  );
}

const primaryButtonStyle = {
  width: "100%",
  minHeight: 62,
  marginTop: 18,
  padding: "12px 15px",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(135deg,#9a6d23,#b17c22)",
  color: "#ffffff",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 800,
  fontSize: 15.5,
  cursor: "pointer",
  boxSizing: "border-box",
  boxShadow: "0 10px 24px rgba(154,109,35,.15)",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
};

const toolbarButtonStyle = {
  minHeight: 54,
  padding: "0 10px",
  borderRadius: 0,
  border: "none",
  background: "transparent",
  color: "#111827",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontWeight: 760,
  fontSize: 13.5,
  cursor: "pointer",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
};

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 18,
          lineHeight: 1.25,
          fontWeight: 780,
          letterSpacing: "-.2px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: "5px 0 0",
          color: "#6b7280",
          fontSize: 12.7,
          lineHeight: 1.45,
        }}
      >
        {subtitle}
      </p>
    </div>
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