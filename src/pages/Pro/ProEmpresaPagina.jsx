import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Clock3,
  Copy,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Star,
  UserPlus,
  Wifi,
  X,
} from "lucide-react";

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

const ACTIONS = {
  whatsapp: {
    title: "Falar no WhatsApp",
    helper: "Tire dúvidas ou peça atendimento",
    icon: MessageCircle,
  },
  instagram: {
    title: "Seguir no Instagram",
    helper: "Acompanhe novidades e bastidores",
    icon: InstagramIcon,
  },
  google_review: {
    title: "Avaliar no Google",
    helper: "Conte como foi sua experiência",
    icon: Star,
  },
  maps: {
    title: "Como chegar",
    helper: "Abra a rota automaticamente",
    icon: MapPin,
  },
  phone: {
    title: "Ligar agora",
    helper: "Fale diretamente com a empresa",
    icon: Phone,
  },
  wifi: {
    title: "Acessar o Wi-Fi",
    helper: "Copie a senha da rede",
    icon: Wifi,
  },
  pix: {
    title: "Copiar chave Pix",
    helper: "Pagamento rápido e prático",
    icon: QrCode,
  },
};

const THEMES = {
  classic: {
    page: "#f3efe8",
    shell: "#fffdfa",
    text: "#211d18",
    muted: "#756f67",
    border: "#e7dfd4",
    accent: "#8b611f",
    accentSoft: "#f5ead8",
    accentText: "#ffffff",
    hero: "linear-gradient(145deg,#241d15,#74521e)",
    heroText: "#ffffff",
  },
  modern: {
    page: "#edf1f5",
    shell: "#ffffff",
    text: "#111827",
    muted: "#687386",
    border: "#e2e8f0",
    accent: "#1f4fd1",
    accentSoft: "#eef3ff",
    accentText: "#ffffff",
    hero: "linear-gradient(145deg,#111827,#334155)",
    heroText: "#ffffff",
  },
  futuristic: {
    page: "#07070a",
    shell: "#111116",
    text: "#f8fafc",
    muted: "#a1a1aa",
    border: "#2b2b35",
    accent: "#7c3aed",
    accentSoft: "#201633",
    accentText: "#ffffff",
    hero: "linear-gradient(145deg,#111116,#312e81 58%,#6d28d9)",
    heroText: "#ffffff",
  },
  minimalist: {
    page: "#f5f5f2",
    shell: "#ffffff",
    text: "#161616",
    muted: "#737373",
    border: "#e5e5e0",
    accent: "#161616",
    accentSoft: "#f0f0ec",
    accentText: "#ffffff",
    hero: "#ffffff",
    heroText: "#161616",
  },
  parametric: {
    page: "#050507",
    shell: "#101016",
    text: "#f8fafc",
    muted: "#a1a1aa",
    border: "#2c2c38",
    accent: "#8b5cf6",
    accentSoft: "#211632",
    accentText: "#ffffff",
    hero: "linear-gradient(145deg,#0f0f16,#312e81 58%,#7c3aed)",
    heroText: "#ffffff",
  },
  bento_premium: {
    page: "#edf1f4",
    shell: "#ffffff",
    text: "#111827",
    muted: "#64748b",
    border: "#dfe6ee",
    accent: "#111827",
    accentSoft: "#f0f3f7",
    accentText: "#ffffff",
    hero: "linear-gradient(145deg,#111827,#475569)",
    heroText: "#ffffff",
  },
  minimal_brand: {
    page: "#f4f4f1",
    shell: "#ffffff",
    text: "#171717",
    muted: "#737373",
    border: "#e1e1dc",
    accent: "#171717",
    accentSoft: "#efefeb",
    accentText: "#ffffff",
    hero: "#ffffff",
    heroText: "#171717",
  },
};

function normalizeUrl(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

function normalizeInstagram(value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://instagram.com/${clean.replace(/^@/, "")}`;
}

function buildWhatsappUrl(data) {
  let number = String(data.whatsapp || "").replace(/\D/g, "");
  if (!number) return "";
  if (!number.startsWith("55")) number = `55${number}`;

  const savedMessage = String(data.whatsapp_message || "").trim();
  const oldAutomaticMessage =
    /^oi,?.*vi sua página tap pro e gostaria de falar com vocês\.?$/i.test(
      savedMessage
    );

  const message =
    !savedMessage || oldAutomaticMessage
      ? `Olá! Recebi seu contato pela página da ${data.display_name}.`
      : savedMessage;

  const pageUrl = data.public_url || window.location.href;

  return `https://wa.me/${number}?text=${encodeURIComponent(
    `${message}\n${pageUrl}`
  )}`;
}

function downloadContact(data) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.display_name || ""}`,
    `ORG:${data.display_name || ""}`,
  ];

  if (data.whatsapp) lines.push(`TEL;TYPE=CELL:${data.whatsapp}`);
  if (data.phone) lines.push(`TEL;TYPE=WORK:${data.phone}`);
  if (data.business_address) {
    lines.push(`ADR;TYPE=WORK:;;${data.business_address};;;;`);
  }
  if (data.public_url) lines.push(`URL:${data.public_url}`);

  lines.push("END:VCARD");

  const blob = new Blob([lines.join("\n")], {
    type: "text/vcard;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${(data.display_name || "contato").replace(
    /\s+/g,
    "-"
  )}.vcf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildCompanyStrategy(data) {
  const requested = data.primary_goal || "auto";
  let effective = requested;

  if (requested === "auto") {
    if (data.show_whatsapp && data.whatsapp) effective = "whatsapp";
    else if (data.show_instagram && data.instagram) effective = "instagram";
    else if (data.show_google_review && data.google_review_url) {
      effective = "google_review";
    } else if (data.show_maps && data.maps_url) {
      effective = "maps";
    } else {
      effective = "information";
    }
  }

  const map = {
    whatsapp: {
      eyebrow: "Atendimento rápido",
      headline: "Fale com a gente",
      body: "Tire dúvidas, peça informações ou solicite atendimento agora.",
      cta_label: "Chamar no WhatsApp",
      cta_module: "whatsapp",
    },
    instagram: {
      eyebrow: "Acompanhe de perto",
      headline: "Siga nossas novidades",
      body: "Veja novidades, produtos, bastidores e atualizações no Instagram.",
      cta_label: "Seguir no Instagram",
      cta_module: "instagram",
    },
    google_review: {
      eyebrow: "Sua opinião importa",
      headline: "Conte como foi sua experiência",
      body: "Sua avaliação ajuda outras pessoas e fortalece nosso trabalho.",
      cta_label: "Avaliar no Google",
      cta_module: "google_review",
    },
    maps: {
      eyebrow: "Venha nos visitar",
      headline: "Encontre a gente com facilidade",
      body: "Abra a localização e trace a melhor rota até o estabelecimento.",
      cta_label: "Como chegar",
      cta_module: "maps",
    },
    information: {
      eyebrow: "Tudo em um só lugar",
      headline: data.display_name || "Conheça nossa empresa",
      body: "Acesse nossos principais contatos e informações.",
      cta_label: "Ver informações",
      cta_module: null,
    },
  };

  return map[effective] || map.information;
}

export default function ProEmpresaPagina({
  data,
  preview = false,
  onBack,
  onPublish,
  publishing = false,
  onTrack,
}) {
  const [notice, setNotice] = useState("");
  const [wifiOpen, setWifiOpen] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);

  function track(eventData) {
    if (preview || typeof onTrack !== "function") return;
    Promise.resolve(onTrack(eventData)).catch(() => {});
  }

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  const whatsappUrl = useMemo(() => buildWhatsappUrl(data), [data]);
  const themeName = data.page_template || "modern";
  const theme = THEMES[themeName] || THEMES.modern;
  const strategy = data.strategy || buildCompanyStrategy(data);
  const darkTheme =
    themeName === "futuristic" || themeName === "parametric";

  const top3 = (data.top3 || []).map((item) =>
    typeof item === "string" ? item : item.module_code
  );

  async function copyText(value) {
    const textToCopy = String(value || "");
    if (!textToCopy) return false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        return true;
      }
    } catch {
      // Usa o método alternativo abaixo.
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  }

  function sharePage() {
    track({ eventType: "share", moduleCode: "share" });

    const url = data.public_url || window.location.href;
    const companyName = String(data.display_name || "esta empresa").trim();
    const message = `Conheça ${companyName}:\n${url}`;
    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
      message
    )}`;

    const opened = window.open(
      whatsappShareUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!opened) window.location.href = whatsappShareUrl;
  }

  async function copyPix() {
    track({ eventType: "pix_copy", moduleCode: "pix" });

    const copied = await copyText(data.pix_key || "");

    if (copied) {
      setPixCopied(true);
      setNotice("Chave Pix copiada.");
      setTimeout(() => setPixCopied(false), 2600);
      return;
    }

    setNotice(`Chave Pix: ${data.pix_key || ""}`);
  }

  function showWifi() {
    track({ eventType: "wifi_open", moduleCode: "wifi" });
    setWifiCopied(false);
    setWifiOpen(true);
  }

  async function copyWifiPassword() {
    const value = data.wifi_password || data.wifi_ssid || "";
    const copied = await copyText(value);

    if (copied) {
      setWifiCopied(true);
      setNotice(
        data.wifi_password
          ? "Senha do Wi-Fi copiada."
          : "Nome da rede copiado."
      );
      return;
    }

    setNotice(
      data.wifi_password
        ? `Senha do Wi-Fi: ${data.wifi_password}`
        : `Rede Wi-Fi: ${data.wifi_ssid}`
    );
  }

  function getAvailableAction(code) {
    if (code === "whatsapp" && data.show_whatsapp && whatsappUrl) {
      return { type: "link", href: whatsappUrl };
    }

    if (code === "instagram" && data.show_instagram && data.instagram) {
      return { type: "link", href: normalizeInstagram(data.instagram) };
    }

    if (
      code === "google_review" &&
      data.show_google_review &&
      data.google_review_url
    ) {
      return { type: "link", href: normalizeUrl(data.google_review_url) };
    }

    if (code === "maps" && data.show_maps && data.maps_url) {
      return { type: "link", href: data.maps_url };
    }

    if (code === "phone" && data.show_phone && (data.phone || data.whatsapp)) {
      return {
        type: "link",
        href: `tel:${data.phone || data.whatsapp}`,
        sameTab: true,
      };
    }

    if (code === "wifi" && data.show_wifi && data.wifi_ssid) {
      return { type: "button", action: "wifi" };
    }

    if (code === "pix" && data.show_pix && data.pix_key) {
      return { type: "button", action: "pix" };
    }

    return null;
  }

  function actionNode(code, variant = "default") {
    const available = getAvailableAction(code);
    const config = ACTIONS[code];

    if (!available || !config) return null;

    const Icon = config.icon;
    const featured = variant === "cta";
    const label =
      featured && strategy.cta_label
        ? strategy.cta_label
        : code === "pix" && pixCopied
        ? "Chave Pix copiada"
        : config.title;

    const content = (
      <>
        <span
          style={{
            width: featured ? 46 : 42,
            height: featured ? 46 : 42,
            borderRadius: featured ? 14 : 13,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: featured
              ? "rgba(255,255,255,.16)"
              : theme.accentSoft,
            color: featured ? theme.accentText : theme.accent,
            border: featured
              ? "1px solid rgba(255,255,255,.16)"
              : `1px solid ${theme.border}`,
          }}
        >
          {code === "pix" && pixCopied ? (
            <Check size={21} />
          ) : (
            <Icon size={21} />
          )}
        </span>

        <span style={{ minWidth: 0 }}>
          <strong
            style={{
              display: "block",
              fontSize: featured ? 16 : 15,
              lineHeight: 1.22,
              fontWeight: 760,
            }}
          >
            {label}
          </strong>

          <span
            style={{
              display: "block",
              marginTop: 4,
              color: featured
                ? "rgba(255,255,255,.78)"
                : theme.muted,
              fontSize: 12.5,
              lineHeight: 1.35,
            }}
          >
            {config.helper}
          </span>
        </span>

        <ArrowUpRight size={18} style={{ flexShrink: 0, opacity: 0.72 }} />
      </>
    );

    const style = {
      width: "100%",
      minHeight: featured ? 76 : 68,
      padding: featured ? "15px 16px" : "12px 14px",
      borderRadius: featured ? 18 : 16,
      border: featured
        ? `1px solid ${theme.accent}`
        : `1px solid ${theme.border}`,
      background: featured ? theme.accent : theme.shell,
      color: featured ? theme.accentText : theme.text,
      display: "grid",
      gridTemplateColumns: featured ? "46px 1fr 18px" : "42px 1fr 18px",
      gap: 12,
      alignItems: "center",
      boxSizing: "border-box",
      textAlign: "left",
      textDecoration: "none",
      cursor: "pointer",
      fontFamily: "Inter, Arial, sans-serif",
      boxShadow: featured
        ? "0 14px 34px rgba(15,23,42,.14)"
        : "0 1px 0 rgba(15,23,42,.02)",
      transition:
        "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
    };

    const commonProps = {
      style,
      onMouseEnter: (event) => {
        event.currentTarget.style.transform = "translateY(-1px)";
        event.currentTarget.style.boxShadow = featured
          ? "0 18px 40px rgba(15,23,42,.18)"
          : "0 8px 22px rgba(15,23,42,.08)";
      },
      onMouseLeave: (event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow = featured
          ? "0 14px 34px rgba(15,23,42,.14)"
          : "0 1px 0 rgba(15,23,42,.02)";
      },
    };

    if (available.type === "link") {
      return (
        <a
          href={available.href}
          target={available.sameTab ? undefined : "_blank"}
          rel={available.sameTab ? undefined : "noreferrer"}
          onClick={() =>
            track({
              eventType: "action_click",
              moduleCode: code,
            })
          }
          {...commonProps}
        >
          {content}
        </a>
      );
    }

    const handlers = {
      wifi: showWifi,
      pix: copyPix,
    };

    return (
      <button
        type="button"
        onClick={() => {
          track({
            eventType: "action_click",
            moduleCode: code,
          });
          handlers[available.action]?.();
        }}
        {...commonProps}
      >
        {content}
      </button>
    );
  }

  const ctaCode = strategy.cta_module;
  const cta = ctaCode ? actionNode(ctaCode, "cta") : null;
  const actionCodes = [
    "whatsapp",
    "instagram",
    "google_review",
    "maps",
    "phone",
    "wifi",
    "pix",
  ];

  const featuredActions = top3
    .filter((code) => code !== "business_hours" && code !== ctaCode)
    .map((code) => ({ code, node: actionNode(code) }))
    .filter((item) => item.node);

  const secondaryActions = actionCodes
    .filter((code) => !top3.includes(code) && code !== ctaCode)
    .map((code) => ({ code, node: actionNode(code) }))
    .filter((item) => item.node);

  const hasUsefulInfo =
    (data.show_business_hours && data.business_hours) ||
    data.business_address ||
    data.show_save_contact;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: preview ? "18px 12px 48px" : "26px 12px 48px",
        background: theme.page,
        color: theme.text,
        fontFamily: "Inter, Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {wifiOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dados do Wi-Fi"
          onClick={() => setWifiOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            padding: 18,
            background: "rgba(15,23,42,.66)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <section
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              padding: 22,
              borderRadius: 24,
              background: "#ffffff",
              color: "#111827",
              boxShadow: "0 30px 90px rgba(0,0,0,.32)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 15,
                  display: "grid",
                  placeItems: "center",
                  background: "#eef2ff",
                  color: "#3730a3",
                }}
              >
                <Wifi size={23} />
              </div>

              <button
                type="button"
                onClick={() => setWifiOpen(false)}
                aria-label="Fechar"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#374151",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={19} />
              </button>
            </div>

            <h2 style={{ margin: "18px 0 7px", fontSize: 23 }}>
              Wi-Fi disponível
            </h2>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                lineHeight: 1.55,
                fontSize: 14,
              }}
            >
              Copie a senha e selecione a rede nas configurações do celular.
            </p>

            <div
              style={{
                marginTop: 18,
                padding: 17,
                borderRadius: 18,
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
              }}
            >
              <small
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontWeight: 760,
                  textTransform: "uppercase",
                  letterSpacing: ".8px",
                }}
              >
                Rede
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: 6,
                  fontSize: 16,
                  wordBreak: "break-word",
                }}
              >
                {data.wifi_ssid}
              </strong>

              <small
                style={{
                  display: "block",
                  marginTop: 17,
                  color: "#6b7280",
                  fontWeight: 760,
                  textTransform: "uppercase",
                  letterSpacing: ".8px",
                }}
              >
                Senha
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: 6,
                  fontSize: 18,
                  letterSpacing: data.wifi_password ? "3px" : "0",
                }}
              >
                {data.wifi_password
                  ? "••••••••"
                  : "Rede sem senha informada"}
              </strong>
            </div>

            <button
              type="button"
              onClick={copyWifiPassword}
              style={{
                width: "100%",
                minHeight: 52,
                marginTop: 16,
                borderRadius: 15,
                border: "none",
                background: wifiCopied ? "#166534" : "#111827",
                color: "#ffffff",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {wifiCopied ? <Check size={18} /> : <Copy size={18} />}
              {wifiCopied
                ? "Copiado"
                : data.wifi_password
                ? "Copiar senha"
                : "Copiar nome da rede"}
            </button>
          </section>
        </div>
      )}

      {preview && (
        <div
          style={{
            position: "sticky",
            top: 10,
            zIndex: 50,
            width: "100%",
            maxWidth: 580,
            margin: "0 auto 14px",
            padding: 10,
            borderRadius: 16,
            background: "rgba(255,255,255,.96)",
            border: "1px solid #d1d5db",
            boxShadow: "0 12px 28px rgba(15,23,42,.15)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            boxSizing: "border-box",
            backdropFilter: "blur(10px)",
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              minHeight: 46,
              borderRadius: 12,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ← Voltar
          </button>

          <button
            type="button"
            onClick={onPublish}
            disabled={publishing}
            style={{
              minHeight: 46,
              borderRadius: 12,
              border: "none",
              background: publishing ? "#9ca3af" : "#111827",
              color: "#ffffff",
              fontWeight: 800,
              cursor: publishing ? "not-allowed" : "pointer",
            }}
          >
            {publishing ? "Publicando..." : "Salvar e publicar"}
          </button>
        </div>
      )}

      <section
        style={{
          width: "100%",
          maxWidth: 580,
          margin: "0 auto",
        }}
      >
        <article
          style={{
            overflow: "hidden",
            borderRadius: 28,
            background: theme.shell,
            border: `1px solid ${theme.border}`,
            boxShadow: darkTheme
              ? "0 30px 90px rgba(0,0,0,.45)"
              : "0 24px 70px rgba(15,23,42,.11)",
          }}
        >
          <header
            style={{
              padding: "28px 28px 26px",
              background: theme.hero,
              color: theme.heroText,
              borderBottom: `1px solid ${
                darkTheme ? "rgba(255,255,255,.08)" : theme.border
              }`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              {data.logo_url && (
                <div
                  style={{
                    width: 84,
                    height: 84,
                    padding: 9,
                    borderRadius: 22,
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 10px 28px rgba(0,0,0,.14)",
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src={data.logo_url}
                    alt={`Logo ${data.display_name}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(29px,7.5vw,40px)",
                    lineHeight: 1.04,
                    letterSpacing: "-.9px",
                    fontWeight: 800,
                    overflowWrap: "anywhere",
                  }}
                >
                  {data.display_name}
                </h1>
              </div>
            </div>

            {data.description && (
              <p
                style={{
                  margin: "16px 0 0",
                  maxWidth: 470,
                  fontSize: 14.5,
                  lineHeight: 1.58,
                  opacity: 0.78,
                }}
              >
                {data.description}
              </p>
            )}
          </header>

          <div style={{ padding: "26px 26px 28px" }}>
            {notice && <Notice text={notice} />}

            <section>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(24px,6vw,31px)",
                  lineHeight: 1.12,
                  letterSpacing: "-.65px",
                  fontWeight: 790,
                }}
              >
                {strategy.headline || "Como podemos ajudar?"}
              </h2>

              <p
                style={{
                  margin: "10px 0 0",
                  color: theme.muted,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                }}
              >
                {strategy.body || "Escolha uma opção para continuar."}
              </p>

              {cta && <div style={{ marginTop: 18 }}>{cta}</div>}
            </section>

            {featuredActions.length > 0 && (
              <section style={{ marginTop: 27 }}>
                <SectionLabel
                  title="Acesso rápido"
                  theme={theme}
                />

                <div style={{ display: "grid", gap: 10 }}>
                  {featuredActions.map(({ code, node }) => (
                    <div key={code}>{node}</div>
                  ))}
                </div>
              </section>
            )}

            {secondaryActions.length > 0 && (
              <section style={{ marginTop: 27 }}>
                <SectionLabel
                  title="Outras opções"
                  theme={theme}
                />

                <div style={{ display: "grid", gap: 10 }}>
                  {secondaryActions.map(({ code, node }) => (
                    <div key={code}>{node}</div>
                  ))}
                </div>
              </section>
            )}

            {hasUsefulInfo && (
              <section style={{ marginTop: 29 }}>
                <SectionLabel
                  title="Informações"
                  theme={theme}
                />

                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: 18,
                    border: `1px solid ${theme.border}`,
                    background: darkTheme
                      ? "rgba(255,255,255,.025)"
                      : theme.shell,
                  }}
                >
                  {data.show_business_hours && data.business_hours && (
                    <InfoRow
                      icon={Clock3}
                      title="Horário de atendimento"
                      value={data.business_hours}
                      theme={theme}
                    />
                  )}

                  {data.business_address && (
                    <InfoRow
                      icon={MapPin}
                      title="Endereço"
                      value={data.business_address}
                      theme={theme}
                    />
                  )}

                  {data.show_save_contact && (
                    <button
                      type="button"
                      onClick={() => {
                        track({
                          eventType: "save_contact",
                          moduleCode: "save_contact",
                        });
                        downloadContact(data);
                      }}
                      style={{
                        width: "100%",
                        minHeight: 62,
                        padding: "13px 15px",
                        border: "none",
                        borderTop: `1px solid ${theme.border}`,
                        background: "transparent",
                        color: theme.text,
                        display: "grid",
                        gridTemplateColumns: "38px 1fr 18px",
                        gap: 11,
                        alignItems: "center",
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: "Inter, Arial, sans-serif",
                      }}
                    >
                      <span
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          display: "grid",
                          placeItems: "center",
                          background: theme.accentSoft,
                          color: theme.accent,
                        }}
                      >
                        <UserPlus size={18} />
                      </span>

                      <span>
                        <strong
                          style={{
                            display: "block",
                            fontSize: 14.5,
                            fontWeight: 760,
                          }}
                        >
                          Salvar contato
                        </strong>
                        <small
                          style={{
                            display: "block",
                            marginTop: 3,
                            color: theme.muted,
                            fontSize: 12.5,
                          }}
                        >
                          Guarde esta empresa no celular
                        </small>
                      </span>

                      <ArrowUpRight size={17} style={{ opacity: 0.65 }} />
                    </button>
                  )}
                </div>
              </section>
            )}

            {data.show_share_page && (
              <section
                style={{
                  marginTop: 28,
                  paddingTop: 22,
                  borderTop: `1px solid ${theme.border}`,
                }}
              >
                <button
                  type="button"
                  onClick={sharePage}
                  style={{
                    width: "100%",
                    minHeight: 58,
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: `1px solid ${theme.border}`,
                    background: "transparent",
                    color: theme.text,
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 18px",
                    gap: 11,
                    alignItems: "center",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "Inter, Arial, sans-serif",
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      background: theme.accentSoft,
                      color: theme.accent,
                    }}
                  >
                    <Share2 size={18} />
                  </span>

                  <span>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 14.5,
                        fontWeight: 760,
                      }}
                    >
                      Compartilhar esta página
                    </strong>
                    <small
                      style={{
                        display: "block",
                        marginTop: 3,
                        color: theme.muted,
                        fontSize: 12.5,
                      }}
                    >
                      Envie pelo WhatsApp para outra pessoa
                    </small>
                  </span>

                  <ArrowUpRight size={17} style={{ opacity: 0.65 }} />
                </button>
              </section>
            )}

            <footer
              style={{
                marginTop: 28,
                paddingTop: 19,
                borderTop: `1px solid ${theme.border}`,
                textAlign: "center",
              }}
            >
              <a
                href="https://kydlab.com.br"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: theme.muted,
                  fontSize: 11.5,
                  textDecoration: "none",
                  letterSpacing: ".1px",
                }}
              >
                Conectado por{" "}
                <strong style={{ color: theme.text, fontWeight: 760 }}>
                  TAP PRO · KYD LAB
                </strong>
              </a>
            </footer>
          </div>
        </article>
      </section>
    </main>
  );
}

function SectionLabel({ title }) {
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
    </div>
  );
}

function InfoRow({ icon: Icon, title, value, theme }) {
  return (
    <div
      style={{
        minHeight: 62,
        padding: "13px 15px",
        display: "grid",
        gridTemplateColumns: "38px 1fr",
        gap: 11,
        alignItems: "center",
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: theme.accentSoft,
          color: theme.accent,
        }}
      >
        <Icon size={18} />
      </span>

      <span style={{ minWidth: 0 }}>
        <strong
          style={{
            display: "block",
            fontSize: 13.7,
            lineHeight: 1.25,
            fontWeight: 740,
          }}
        >
          {title}
        </strong>

        <small
          style={{
            display: "block",
            marginTop: 4,
            color: theme.muted,
            fontSize: 12.7,
            lineHeight: 1.45,
            wordBreak: "break-word",
          }}
        >
          {value}
        </small>
      </span>
    </div>
  );
}

function Notice({ text }) {
  return (
    <div
      role="status"
      style={{
        marginBottom: 17,
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
      {text}
    </div>
  );
}