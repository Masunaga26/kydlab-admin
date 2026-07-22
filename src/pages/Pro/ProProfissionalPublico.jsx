import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Share2,
  UserRoundPlus,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

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
    text: "Compartilhe o perfil de {nome}.",
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
  return String(value || "").replace(
    /\D/g,
    ""
  );
}

function url(value) {
  const text =
    String(value || "").trim();

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
  return (
    String(name || "")
      .trim()
      .split(/\s+/)[0] ||
    "este profissional"
  );
}

function personalized(
  text,
  name
) {
  return String(text || "")
    .replaceAll(
      "{nome}",
      name || "este profissional"
    )
    .replaceAll(
      "{primeiro}",
      firstName(name)
    );
}

function goalUrl(
  data,
  goal,
  whatsapp
) {
  const map = {
    whatsapp,
    scheduling:
      data.scheduling_url,
    instagram:
      data.instagram,
    portfolio:
      data.portfolio_url,
    company_page:
      data.company_page_url,
  };

  return url(map[goal] || "");
}

function vcard(data, pageUrl) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.professional_name || ""}`,
    data.company_name
      ? `ORG:${data.company_name}`
      : "",
    data.professional_title
      ? `TITLE:${data.professional_title}`
      : "",
    data.whatsapp
      ? `TEL;TYPE=CELL:+55${digits(data.whatsapp).replace(/^55/,"")}`
      : "",
    data.phone
      ? `TEL;TYPE=WORK:+55${digits(data.phone).replace(/^55/,"")}`
      : "",
    data.email
      ? `EMAIL:${data.email}`
      : "",
    data.website
      ? `URL:${url(data.website)}`
      : "",
    `URL:${pageUrl}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

function downloadContact(
  data,
  pageUrl
) {
  const blob = new Blob(
    [vcard(data,pageUrl)],
    {
      type:
        "text/vcard;charset=utf-8",
    }
  );

  const objectUrl =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = objectUrl;
  anchor.download =
    `${firstName(data.professional_name).toLowerCase()}-contato.vcf`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(
        objectUrl
      ),
    1000
  );
}

function moduleHref(
  data,
  code
) {
  const map = {
    instagram:
      data.instagram,
    linkedin:
      data.linkedin,
    website:
      data.website,
    portfolio:
      data.portfolio_url,
    scheduling:
      data.scheduling_url,
    maps:
      data.maps_url,
    company_page:
      data.company_page_url,
    email:
      data.email
        ? `mailto:${data.email}`
        : "",
    phone:
      data.phone
        ? `tel:${digits(data.phone)}`
        : "",
  };

  return url(map[code] || "");
}

function ModuleIcon({code}) {
  if (code === "linkedin") {
    return <BriefcaseBusiness size={24}/>;
  }
  if (code === "scheduling") {
    return <CalendarDays size={24}/>;
  }
  if (code === "maps") {
    return <MapPin size={24}/>;
  }
  if (code === "email") {
    return <Mail size={24}/>;
  }
  if (code === "phone") {
    return <Phone size={24}/>;
  }
  if (code === "company_page") {
    return <BriefcaseBusiness size={24}/>;
  }
  return <Globe2 size={24}/>;
}

export default function ProProfissionalPublico() {
  const { pieceCode } =
    useParams();

  const cleanCode =
    limparCodigoPro(pieceCode);

  const [loading, setLoading] =
    useState(true);

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function load() {
      const { data, error } =
        await getProfessionalPublicByPieceNovoPro(
          cleanCode
        );

      if (
        error ||
        !data?.found
      ) {
        console.error(error);
        setError(
          "Perfil profissional não encontrado."
        );
        setLoading(false);
        return;
      }

      setData(data);
      setLoading(false);
    }

    load();
  }, [cleanCode]);

  const whatsappUrl = useMemo(
    () => {
      if (!data?.whatsapp) {
        return "";
      }

      const number =
        digits(data.whatsapp);

      const finalNumber =
        number.startsWith("55")
          ? number
          : `55${number}`;

      const text =
        `Olá, ${firstName(data.professional_name)}! Encontrei seu perfil pelo TAP PRO.`;

      return `https://wa.me/${finalNumber}?text=${encodeURIComponent(text)}`;
    },
    [
      data?.whatsapp,
      data?.professional_name,
    ]
  );

  const primaryGoal =
    data?.primary_goal === "auto"
      ? (
          data?.scheduling_url
            ? "scheduling"
            : data?.portfolio_url
              ? "portfolio"
              : data?.instagram
                ? "instagram"
                : "whatsapp"
        )
      : data?.primary_goal;

  const goal =
    GOALS[primaryGoal];

  const actionUrl =
    data && goal
      ? goalUrl(
          data,
          primaryGoal,
          whatsappUrl
        )
      : "";

  async function share() {
    const pageUrl =
      window.location.href;

    if (navigator.share) {
      await navigator.share({
        title:
          data.professional_name,
        text:
          data.description ||
          `Conheça ${data.professional_name}`,
        url: pageUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(
      pageUrl
    );

    setMessage("Link copiado.");
  }

  if (loading) {
    return (
      <Screen text="Carregando perfil..." />
    );
  }

  if (error || !data) {
    return <Screen text={error} />;
  }

  const services = [
    data.service_1,
    data.service_2,
    data.service_3,
    data.service_4,
  ].filter(Boolean);

  const specialties = [
    data.specialty_1,
    data.specialty_2,
    data.specialty_3,
    data.specialty_4,
    data.specialty_5,
  ].filter(Boolean);

  return (
    <main
      style={{
        minHeight:"100vh",
        padding:"24px 14px 44px",
        background:"#f5f5f4",
        color:"#111827",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <section
        style={{
          width:"100%",
          maxWidth:560,
          margin:"0 auto",
          borderRadius:28,
          overflow:"hidden",
          background:"#ffffff",
          border:"1px solid #e5e7eb",
          boxShadow:
            "0 24px 60px rgba(17,24,39,.13)",
        }}
      >
        <header
          style={{
            padding:"32px 26px 30px",
            background:
              "linear-gradient(135deg,#1c1917 0%,#4b4336 100%)",
            color:"#ffffff",
            textAlign:"center",
          }}
        >
          {data.photo_url && (
            <img
              src={data.photo_url}
              alt={data.professional_name}
              style={{
                width:128,
                height:128,
                objectFit:"cover",
                borderRadius:"50%",
                border:"4px solid rgba(255,255,255,.75)",
                boxShadow:
                  "0 14px 30px rgba(0,0,0,.22)",
              }}
            />
          )}

          <p
            style={{
              margin:"15px 0 7px",
              opacity:.78,
              fontSize:12,
              fontWeight:850,
              textTransform:"uppercase",
              letterSpacing:"1px",
            }}
          >
            Perfil profissional
          </p>

          <h1
            style={{
              margin:0,
              fontSize:"clamp(31px,8vw,40px)",
              lineHeight:1.08,
            }}
          >
            {data.professional_name}
          </h1>

          <p
            style={{
              margin:"10px 0 0",
              fontWeight:800,
              fontSize:17,
            }}
          >
            {data.professional_title}
          </p>

          {data.company_name && (
            <p
              style={{
                margin:"8px 0 0",
                opacity:.82,
              }}
            >
              {data.company_name}
            </p>
          )}

          {data.description && (
            <p
              style={{
                margin:"15px auto 0",
                maxWidth:430,
                lineHeight:1.6,
                opacity:.94,
              }}
            >
              {data.description}
            </p>
          )}
        </header>

        <div style={{padding:26}}>
          {message && (
            <div
              style={{
                marginBottom:14,
                padding:12,
                borderRadius:12,
                background:"#ecfdf5",
                color:"#166534",
                textAlign:"center",
                fontWeight:750,
              }}
            >
              {message}
            </div>
          )}

          <section
            style={{
              padding:18,
              borderRadius:18,
              background:"#fafafa",
              border:"1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                margin:"0 0 5px",
                color:"#b8892f",
                fontSize:12,
                fontWeight:900,
                textTransform:"uppercase",
              }}
            >
              Vamos conectar
            </p>
            <h2
              style={{
                margin:0,
                fontSize:22,
              }}
            >
              Como posso ajudar você?
            </h2>
          </section>

          <div
            style={{
              display:"grid",
              gap:12,
              marginTop:16,
            }}
          >
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  minHeight:68,
                  padding:"15px 18px",
                  borderRadius:18,
                  background:"#168a45",
                  color:"#ffffff",
                  textDecoration:"none",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:10,
                  fontWeight:850,
                }}
              >
                Falar no WhatsApp
              </a>
            )}

            <div
              style={{
                display:"grid",
                gridTemplateColumns:"1fr 1fr",
                gap:12,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  downloadContact(
                    data,
                    window.location.href
                  )
                }
                style={{
                  minHeight:58,
                  borderRadius:16,
                  border:"1px solid #d1d5db",
                  background:"#ffffff",
                  color:"#111827",
                  fontWeight:850,
                  cursor:"pointer",
                }}
              >
                <UserRoundPlus
                  size={20}
                  style={{marginRight:7}}
                />
                Salvar contato
              </button>

              <button
                type="button"
                onClick={share}
                style={{
                  minHeight:58,
                  borderRadius:16,
                  border:"none",
                  background:"#1f2937",
                  color:"#ffffff",
                  fontWeight:850,
                  cursor:"pointer",
                }}
              >
                <Share2
                  size={20}
                  style={{marginRight:7}}
                />
                Compartilhar
              </button>
            </div>
          </div>

          {(data.top3 || []).length > 0 && (
            <section style={{marginTop:24}}>
              <p
                style={{
                  margin:"0 0 5px",
                  color:"#b8892f",
                  fontSize:12,
                  fontWeight:900,
                  textTransform:"uppercase",
                }}
              >
                Conheça mais
              </p>

              <h2
                style={{
                  margin:"0 0 12px",
                  fontSize:21,
                }}
              >
                Links profissionais
              </h2>

              <div
                style={{
                  display:"grid",
                  gap:11,
                }}
              >
                {data.top3.map(
                  (item) => {
                    const config =
                      MODULES[
                        item.module_code
                      ];

                    const href =
                      moduleHref(
                        data,
                        item.module_code
                      );

                    if (
                      !config ||
                      !href
                    ) {
                      return null;
                    }

                    return (
                      <a
                        key={item.module_code}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          minHeight:78,
                          padding:"14px 16px",
                          borderRadius:16,
                          border:"1px solid #e5e7eb",
                          background:"#ffffff",
                          color:"#111827",
                          textDecoration:"none",
                          display:"grid",
                          gridTemplateColumns:"46px 1fr 20px",
                          gap:13,
                          alignItems:"center",
                        }}
                      >
                        <span
                          style={{
                            width:46,
                            height:46,
                            borderRadius:14,
                            background:"#fafafa",
                            border:"1px solid #e5e7eb",
                            color:"#b8892f",
                            display:"inline-flex",
                            alignItems:"center",
                            justifyContent:"center",
                          }}
                        >
                          <ModuleIcon
                            code={
                              item.module_code
                            }
                          />
                        </span>

                        <span>
                          <strong
                            style={{
                              display:"block",
                            }}
                          >
                            {config.label}
                          </strong>
                          <span
                            style={{
                              display:"block",
                              marginTop:4,
                              color:"#6b7280",
                              fontSize:13,
                            }}
                          >
                            {config.helper}
                          </span>
                        </span>

                        <span>›</span>
                      </a>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {services.length > 0 && (
            <section style={{marginTop:24}}>
              <h2 style={{fontSize:21}}>
                Serviços
              </h2>
              <div
                style={{
                  display:"grid",
                  gap:9,
                }}
              >
                {services.map(
                  (service) => (
                    <div
                      key={service}
                      style={{
                        padding:14,
                        borderRadius:14,
                        background:"#fafafa",
                        border:"1px solid #e5e7eb",
                        fontWeight:750,
                      }}
                    >
                      {service}
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {specialties.length > 0 && (
            <section style={{marginTop:24}}>
              <h2 style={{fontSize:21}}>
                Especialidades
              </h2>
              <div
                style={{
                  display:"flex",
                  flexWrap:"wrap",
                  gap:8,
                }}
              >
                {specialties.map(
                  (item) => (
                    <span
                      key={item}
                      style={{
                        padding:"8px 11px",
                        borderRadius:999,
                        background:"#fafafa",
                        border:"1px solid #e5e7eb",
                        fontSize:13,
                        fontWeight:750,
                      }}
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </section>
          )}

          {goal && (primaryGoal === "share" || actionUrl) && (
            <section
              style={{
                marginTop:24,
                padding:21,
                borderRadius:20,
                background:"#fafafa",
                border:"1px solid #e5e7eb",
                textAlign:"center",
              }}
            >
              <p
                style={{
                  margin:"0 0 6px",
                  color:"#b8892f",
                  fontSize:12,
                  fontWeight:900,
                  textTransform:"uppercase",
                }}
              >
                {goal.eyebrow}
              </p>

              <h2
                style={{
                  margin:0,
                  fontSize:22,
                }}
              >
                {personalized(
                  goal.title,
                  data.professional_name
                )}
              </h2>

              <p
                style={{
                  color:"#6b7280",
                  lineHeight:1.5,
                }}
              >
                {personalized(
                  goal.text,
                  data.professional_name
                )}
              </p>

              {primaryGoal === "share" ? (
                <button
                  type="button"
                  onClick={share}
                  style={{
                    minHeight:48,
                    padding:"12px 18px",
                    borderRadius:14,
                    border:"none",
                    background:"#b8892f",
                    color:"#ffffff",
                    fontWeight:850,
                    cursor:"pointer",
                  }}
                >
                  {personalized(
                    goal.button,
                    data.professional_name
                  )}
                </button>
              ) : (
                <a
                  href={actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    minHeight:48,
                    padding:"12px 18px",
                    borderRadius:14,
                    background:"#b8892f",
                    color:"#ffffff",
                    fontWeight:850,
                    textDecoration:"none",
                    display:"inline-flex",
                    alignItems:"center",
                  }}
                >
                  {personalized(
                    goal.button,
                    data.professional_name
                  )}
                </a>
              )}
            </section>
          )}

          <footer
            style={{
              marginTop:26,
              paddingTop:18,
              borderTop:"1px solid #e5e7eb",
              textAlign:"center",
              color:"#6b7280",
              fontSize:12,
            }}
          >
            Perfil profissional conectado por{" "}
            <strong style={{color:"#111827"}}>
              TAP PRO
            </strong>
          </footer>
        </div>
      </section>
    </main>
  );
}

function Screen({text}) {
  return (
    <main
      style={{
        minHeight:"100vh",
        display:"grid",
        placeItems:"center",
        background:"#f5f5f4",
        padding:24,
      }}
    >
      <section
        style={{
          padding:28,
          borderRadius:20,
          background:"#ffffff",
          textAlign:"center",
        }}
      >
        <h1>TAP PRO</h1>
        <p>{text}</p>
      </section>
    </main>
  );
}