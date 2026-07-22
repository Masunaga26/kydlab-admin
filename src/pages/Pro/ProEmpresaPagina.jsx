import { useMemo, useState, useEffect } from "react";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Star,
  UserPlus,
  Wifi,
} from "lucide-react";

function InstagramIcon({ size = 22, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

const ACTIONS = {
  whatsapp: { title: "Falar no WhatsApp", helper: "Tire dúvidas ou peça atendimento", icon: MessageCircle },
  instagram: { title: "Seguir no Instagram", helper: "Acompanhe novidades e bastidores", icon: InstagramIcon },
  google_review: { title: "Avaliar no Google", helper: "Conte como foi sua experiência", icon: Star },
  maps: { title: "Como chegar", helper: "Abra a rota automaticamente", icon: MapPin },
  phone: { title: "Ligar agora", helper: "Fale diretamente com a empresa", icon: Phone },
  wifi: { title: "Acessar o Wi-Fi", helper: "Copie a senha da rede", icon: Wifi },
  pix: { title: "Copiar chave Pix", helper: "Pagamento rápido e prático", icon: QrCode },
};

const THEMES = {
  classic: {
    page: "#f4efe7", shell: "#fffdf8", text: "#211d18", muted: "#746d63",
    border: "#e4d7c3", accent: "#9b6b20", hero: "linear-gradient(135deg,#211d18,#75521f)",
  },
  modern: {
    page: "#eef2f7", shell: "#ffffff", text: "#0f172a", muted: "#64748b",
    border: "#dfe7f0", accent: "#2563eb", hero: "linear-gradient(135deg,#111827,#334155)",
  },
  futuristic: {
    page: "#07070a", shell: "#111116", text: "#f8fafc", muted: "#a1a1aa",
    border: "#2b2b35", accent: "#8b5cf6", hero: "linear-gradient(135deg,#09090b,#312e81 55%,#6d28d9)",
  },
  minimalist: {
    page: "#f7f7f5", shell: "#ffffff", text: "#111827", muted: "#6b7280",
    border: "#e5e7eb", accent: "#111827", hero: "#ffffff",
  },
  parametric: {
    page: "#050507", shell: "#0f0f16", text: "#f8fafc", muted: "#a1a1aa",
    border: "#2d2d3a", accent: "#8b5cf6", hero: "linear-gradient(135deg,#09090b,#312e81 55%,#7c3aed)",
  },
  bento_premium: {
    page: "#edf1f5", shell: "#ffffff", text: "#0f172a", muted: "#64748b",
    border: "#dbe3ec", accent: "#111827", hero: "linear-gradient(135deg,#111827,#475569)",
  },
  minimal_brand: {
    page: "#f4f4f1", shell: "#ffffff", text: "#171717", muted: "#737373",
    border: "#deded8", accent: "#171717", hero: "#ffffff",
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

  return `https://wa.me/${number}?text=${encodeURIComponent(`${message}\n${pageUrl}`)}`;
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
  if (data.business_address) lines.push(`ADR;TYPE=WORK:;;${data.business_address};;;;`);
  if (data.public_url) lines.push(`URL:${data.public_url}`);

  lines.push("END:VCARD");

  const blob = new Blob([lines.join("\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${(data.display_name || "contato").replace(/\s+/g, "-")}.vcf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildCompanyStrategy(data) {
  const requested = data.primary_goal || "auto";
  let effective = requested;

  if (requested === "auto") {
    if (data.show_whatsapp && data.whatsapp) effective = "whatsapp";
    else if (data.show_instagram && data.instagram) effective = "instagram";
    else if (data.show_google_review && data.google_review_url) effective = "google_review";
    else if (data.show_maps && data.maps_url) effective = "maps";
    else effective = "information";
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
    if (preview || typeof onTrack !== "function") {
      return;
    }

    Promise.resolve(onTrack(eventData)).catch(() => {});
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  const whatsappUrl = useMemo(() => buildWhatsappUrl(data), [data]);
  const themeName = data.page_template || "modern";
  const theme = THEMES[themeName] || THEMES.modern;
  const strategy = data.strategy || buildCompanyStrategy(data);
  const top3 = (data.top3 || []).map(item =>
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
    track({
      eventType:"share",
      moduleCode:"share",
    });

    const url = data.public_url || window.location.href;
    const companyName = String(data.display_name || "esta empresa").trim();
    const message = `Conheça ${companyName}:\n${url}`;
    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    const opened = window.open(
      whatsappShareUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!opened) {
      window.location.href = whatsappShareUrl;
    }
  }

  async function copyPix() {
    track({
      eventType:"pix_copy",
      moduleCode:"pix",
    });

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
    track({
      eventType:"wifi_open",
      moduleCode:"wifi",
    });

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
    if (code === "google_review" && data.show_google_review && data.google_review_url) {
      return { type: "link", href: normalizeUrl(data.google_review_url) };
    }
    if (code === "maps" && data.show_maps && data.maps_url) {
      return { type: "link", href: data.maps_url };
    }
    if (code === "phone" && data.show_phone && (data.phone || data.whatsapp)) {
      const callNumber = data.phone || data.whatsapp;
      return { type: "link", href: `tel:${callNumber}`, sameTab: true };
    }
    if (code === "wifi" && data.show_wifi && data.wifi_ssid) {
      return { type: "button", action: "wifi" };
    }
    if (code === "pix" && data.show_pix && data.pix_key) {
      return { type: "button", action: "pix" };
    }
    return null;
  }

  const wifiModal = wifiOpen ? (
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
        background: "rgba(15,23,42,.62)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <section
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 390,
          padding: 22,
          borderRadius: 20,
          background: "#ffffff",
          color: "#111827",
          boxShadow: "0 28px 80px rgba(0,0,0,.28)",
          fontFamily: "Inter,Arial,sans-serif",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "#eef2ff",
            color: "#3730a3",
          }}
        >
          <Wifi size={23} />
        </div>

        <h2 style={{ margin: "16px 0 6px", fontSize: 22 }}>
          Wi-Fi disponível
        </h2>

        <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.5 }}>
          Copie a senha e selecione a rede nas configurações do seu celular.
        </p>

        <div
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 15,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
          }}
        >
          <small
            style={{
              display: "block",
              color: "#6b7280",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".7px",
            }}
          >
            Rede
          </small>
          <strong
            style={{
              display: "block",
              marginTop: 5,
              fontSize: 16,
              wordBreak: "break-word",
            }}
          >
            {data.wifi_ssid}
          </strong>

          <small
            style={{
              display: "block",
              marginTop: 15,
              color: "#6b7280",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".7px",
            }}
          >
            Senha protegida
          </small>
          <strong
            style={{
              display: "block",
              marginTop: 5,
              fontSize: 18,
              letterSpacing: "3px",
            }}
          >
            {data.wifi_password ? "••••••••" : "Rede sem senha informada"}
          </strong>
        </div>

        <button
          type="button"
          onClick={copyWifiPassword}
          style={{
            width: "100%",
            minHeight: 50,
            marginTop: 16,
            borderRadius: 13,
            border: "none",
            background: wifiCopied ? "#166534" : "#111827",
            color: "#ffffff",
            fontWeight: 850,
            cursor: "pointer",
          }}
        >
          {wifiCopied
            ? "Copiado ✓"
            : data.wifi_password
            ? "Copiar senha"
            : "Copiar nome da rede"}
        </button>

        <button
          type="button"
          onClick={() => setWifiOpen(false)}
          style={{
            width: "100%",
            minHeight: 46,
            marginTop: 9,
            borderRadius: 13,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#111827",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Fechar
        </button>
      </section>
    </div>
  ) : null;


  function actionNode(code, variant = "default") {
    const available = getAvailableAction(code);
    const config = ACTIONS[code];
    if (!available || !config) return null;

    const Icon = config.icon;
    const handlers = { wifi: showWifi, pix: copyPix };
    const featured = variant === "cta";

  if (themeName === "minimalist" || themeName === "minimal_brand") {
      const content = (
        <>
          <span style={{ width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={20} />
          </span>
          <span>
            <strong style={{ display: "block", fontSize: 15, fontWeight: 750 }}>
              {featured && strategy.cta_label ? strategy.cta_label : code === "pix" && pixCopied ? "Chave Pix copiada ✓" : config.title}
            </strong>
            <span style={{ display: "block", marginTop: 4, color: featured ? "rgba(255,255,255,.78)" : theme.muted, fontSize: 12.5 }}>
              {config.helper}
            </span>
          </span>
          <ArrowUpRight size={17} />
        </>
      );

      const style = {
        width: "100%", minHeight: featured ? 72 : 62, padding: "12px 0",
        border: "none", borderTop: featured ? "none" : `1px solid ${theme.border}`,
        borderBottom: `1px solid ${theme.border}`,
        background: featured ? theme.text : "transparent",
        color: featured ? "#ffffff" : theme.text,
        display: "grid", gridTemplateColumns: "42px 1fr 20px", gap: 10,
        alignItems: "center", textDecoration: "none", textAlign: "left",
        cursor: "pointer", fontFamily: "Inter,Arial,sans-serif",
      };

      return available.type === "link" ? (
        <a
          href={available.href}
          target={available.sameTab ? undefined : "_blank"}
          rel={available.sameTab ? undefined : "noreferrer"}
          onClick={() =>
            track({
              eventType:"action_click",
              moduleCode:code,
            })
          }
          style={style}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => {
            track({
              eventType:"action_click",
              moduleCode:code,
            });
            handlers[available.action]?.();
          }}
          style={style}
        >
          {content}
        </button>
      );
    }

    if (themeName === "futuristic" || themeName === "parametric") {
      const content = (
        <>
          <span style={{
            width: 42, height: 42, borderRadius: 13, display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            background: featured ? "rgba(255,255,255,.16)" : "#1b1b24",
            border: `1px solid ${featured ? "rgba(255,255,255,.18)" : theme.border}`,
          }}>
            <Icon size={21} />
          </span>
          <span>
            <strong style={{ display: "block", fontSize: 15, fontWeight: 780 }}>
              {featured && strategy.cta_label ? strategy.cta_label : code === "pix" && pixCopied ? "Chave Pix copiada ✓" : config.title}
            </strong>
            <span style={{ display: "block", marginTop: 4, color: featured ? "rgba(255,255,255,.78)" : theme.muted, fontSize: 12.2 }}>
              {config.helper}
            </span>
          </span>
        </>
      );

      const style = {
        width: "100%", minHeight: featured ? 90 : 88, padding: 15,
        borderRadius: 17, border: `1px solid ${featured ? "rgba(255,255,255,.16)" : theme.border}`,
        background: featured ? "linear-gradient(135deg,#312e81,#7c3aed)" : "#18181f",
        color: "#ffffff", display: "grid", gridTemplateColumns: "44px 1fr",
        gap: 11, alignItems: "center", textDecoration: "none", textAlign: "left",
        cursor: "pointer", boxShadow: featured ? "0 0 30px rgba(124,58,237,.22)" : "none",
        fontFamily: "Inter,Arial,sans-serif",
      };

      return available.type === "link" ? (
        <a
          href={available.href}
          target={available.sameTab ? undefined : "_blank"}
          rel={available.sameTab ? undefined : "noreferrer"}
          onClick={() =>
            track({
              eventType:"action_click",
              moduleCode:code,
            })
          }
          style={style}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => {
            track({
              eventType:"action_click",
              moduleCode:code,
            });
            handlers[available.action]?.();
          }}
          style={style}
        >
          {content}
        </button>
      );
    }

    const classic = themeName === "classic";
    const style = {
      width: "100%", minHeight: featured ? 80 : 70,
      padding: featured ? "16px 17px" : "14px 15px",
      borderRadius: classic ? 16 : 18,
      border: `1px solid ${featured ? theme.accent : theme.border}`,
      background: featured ? theme.accent : theme.shell,
      color: featured ? "#ffffff" : theme.text,
      display: "grid", gridTemplateColumns: "44px 1fr 20px",
      gap: 12, alignItems: "center", textDecoration: "none", textAlign: "left",
      cursor: "pointer", boxSizing: "border-box",
      boxShadow: featured ? "0 12px 26px rgba(15,23,42,.12)" : "none",
      fontFamily: "Inter,Arial,sans-serif",
    };

    const content = (
      <>
        <span style={{
          width: 44, height: 44, borderRadius: 13, display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          background: featured ? "rgba(255,255,255,.16)" : theme.page,
          border: `1px solid ${featured ? "rgba(255,255,255,.18)" : theme.border}`,
        }}>
          <Icon size={21} />
        </span>
        <span>
          <strong style={{ display: "block", fontSize: 15.2, fontWeight: 760 }}>
            {featured && strategy.cta_label ? strategy.cta_label : code === "pix" && pixCopied ? "Chave Pix copiada ✓" : config.title}
          </strong>
          <span style={{ display: "block", marginTop: 4, color: featured ? "rgba(255,255,255,.82)" : theme.muted, fontSize: 12.4 }}>
            {config.helper}
          </span>
        </span>
        <ArrowUpRight size={17} />
      </>
    );

    return available.type === "link" ? (
      <a
          href={available.href}
          target={available.sameTab ? undefined : "_blank"}
          rel={available.sameTab ? undefined : "noreferrer"}
          onClick={() =>
            track({
              eventType:"action_click",
              moduleCode:code,
            })
          }
          style={style}
        >
          {content}
        </a>
    ) : (
      <button
          type="button"
          onClick={() => {
            track({
              eventType:"action_click",
              moduleCode:code,
            });
            handlers[available.action]?.();
          }}
          style={style}
        >
          {content}
        </button>
    );
  }

  const ctaCode = strategy.cta_module;
  const cta = ctaCode ? actionNode(ctaCode, "cta") : null;

  const actionCodes = ["whatsapp", "instagram", "google_review", "maps", "phone", "wifi", "pix"];

  const featuredActions = top3
    .filter(code => code !== "business_hours" && code !== ctaCode)
    .map(code => ({ code, node: actionNode(code) }))
    .filter(item => item.node);

  const secondaryActions = actionCodes
    .filter(code => !top3.includes(code) && code !== ctaCode)
    .map(code => ({ code, node: actionNode(code) }))
    .filter(item => item.node);

  const previewBar = preview ? (
    <div style={{
      position: "sticky", top: 10, zIndex: 50, width: "100%", maxWidth: 590,
      margin: "0 auto 14px", padding: 10, borderRadius: 16,
      background: "rgba(255,255,255,.96)", border: "1px solid #d1d5db",
      boxShadow: "0 12px 28px rgba(15,23,42,.15)",
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
      boxSizing: "border-box",
    }}>
      <button type="button" onClick={onBack} style={{
        minHeight: 46, borderRadius: 12, border: "1px solid #d1d5db",
        background: "#ffffff", color: "#111827", fontWeight: 850, cursor: "pointer",
      }}>
        ← Voltar para edição
      </button>
      <button type="button" onClick={onPublish} disabled={publishing} style={{
        minHeight: 46, borderRadius: 12, border: "none",
        background: publishing ? "#9ca3af" : "#111827",
        color: "#ffffff", fontWeight: 850, cursor: publishing ? "not-allowed" : "pointer",
      }}>
        {publishing ? "Publicando..." : "Salvar e publicar"}
      </button>
    </div>
  ) : null;

  const shareBlock = data.show_share_page ? (
    <section style={{
      marginTop: 26, padding: themeName === "minimalist" ? "22px 0" : 20,
      borderRadius: themeName === "minimalist" ? 0 : 18,
      background: themeName === "futuristic" || themeName === "parametric"
        ? "linear-gradient(135deg,#312e81,#7c3aed)"
        : themeName === "minimalist" || themeName === "minimal_brand"
        ? "transparent"
        : theme.text,
      color: themeName === "minimalist" ? theme.text : "#ffffff",
      borderTop: themeName === "minimalist" ? `1px solid ${theme.border}` : undefined,
      borderBottom: themeName === "minimalist" ? `1px solid ${theme.border}` : undefined,
    }}>
      <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 850, textTransform: "uppercase", letterSpacing: "1px", opacity: .72 }}>Indique também</p>
      <h2 style={{ margin: 0, fontSize: 21, lineHeight: 1.25 }}>Mande para alguém que precisa</h2>
      <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.5, opacity: .78 }}>Envie esta página diretamente pelo WhatsApp.</p>
      <button type="button" onClick={sharePage} style={{
        width: "100%", minHeight: 52, marginTop: 14,
        borderRadius: themeName === "minimalist" ? 0 : 14,
        border: themeName === "minimalist" ? `1px solid ${theme.text}` : "1px solid rgba(255,255,255,.18)",
        background: themeName === "minimalist" ? theme.text : "rgba(255,255,255,.11)",
        color: "#ffffff", fontWeight: 800, cursor: "pointer",
      }}>
        <Share2 size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
        Compartilhar no WhatsApp
      </button>
    </section>
  ) : null;

  const infoBlock = (
    <section style={{ marginTop: 26, paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 17.5, fontWeight: 800 }}>Informações úteis</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {data.show_business_hours && data.business_hours && (
          <div style={{
            minHeight: 56, padding: "12px 14px",
            borderRadius: themeName === "minimalist" ? 0 : 14,
            background: themeName === "minimalist" ? "transparent" : theme.page,
            border: themeName === "minimalist" ? "none" : `1px solid ${theme.border}`,
            borderBottom: themeName === "minimalist" ? `1px solid ${theme.border}` : undefined,
            display: "grid", gridTemplateColumns: "36px 1fr", gap: 10, alignItems: "center",
          }}>
            <Clock3 size={18} />
            <span>
              <strong style={{ display: "block", fontSize: 13.5 }}>Horário de atendimento</strong>
              <small style={{ display: "block", marginTop: 3, color: theme.muted, fontSize: 12.5 }}>{data.business_hours}</small>
            </span>
          </div>
        )}

        {data.business_address && (
          <div style={{
            minHeight: 56, padding: "12px 14px",
            borderRadius: themeName === "minimalist" ? 0 : 14,
            background: themeName === "minimalist" ? "transparent" : theme.page,
            border: themeName === "minimalist" ? "none" : `1px solid ${theme.border}`,
            borderBottom: themeName === "minimalist" ? `1px solid ${theme.border}` : undefined,
            display: "grid", gridTemplateColumns: "36px 1fr", gap: 10, alignItems: "center",
          }}>
            <MapPin size={18} />
            <span>
              <strong style={{ display: "block", fontSize: 13.5 }}>Endereço</strong>
              <small style={{ display: "block", marginTop: 3, color: theme.muted, fontSize: 12.5, lineHeight: 1.4 }}>{data.business_address}</small>
            </span>
          </div>
        )}

        {data.show_save_contact && (
          <button
            type="button"
            onClick={() => {
              track({
                eventType:"save_contact",
                moduleCode:"save_contact",
              });
              downloadContact(data);
            }}
            style={{
            width: "100%", minHeight: 54,
            borderRadius: themeName === "minimalist" ? 0 : 14,
            border: themeName === "minimalist" ? "none" : `1px solid ${theme.border}`,
            borderBottom: themeName === "minimalist" ? `1px solid ${theme.border}` : undefined,
            background: "transparent", color: theme.text, fontWeight: 800,
            cursor: "pointer", textAlign: "left",
            padding: themeName === "minimalist" ? "14px 0" : "12px 14px",
          }}>
            <UserPlus size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
            Salvar contato
          </button>
        )}
      </div>
    </section>
  );

  const footer = (
    <footer style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${theme.border}`, textAlign: "center" }}>
      <a href="https://kydlab.com.br" target="_blank" rel="noreferrer" style={{ color: theme.muted, fontSize: 11.5, textDecoration: "none" }}>
        Conectado por <strong style={{ color: theme.text }}>TAP PRO · KYD LAB</strong>
      </a>
    </footer>
  );

  if (themeName === "minimalist" || themeName === "minimal_brand") {
    return (
      <main style={{ minHeight: "100vh", padding: "24px 18px 46px", background: theme.page, color: theme.text, fontFamily: "Inter,Arial,sans-serif" }}>
        {wifiModal}
        {previewBar}
        <section style={{ maxWidth: 560, margin: "0 auto" }}>
          <header style={{ padding: "8px 0 30px" }}>
            {data.logo_url && (
              <div style={{ width: 78, height: 68, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, border: `1px solid ${theme.border}` }}>
                <img src={data.logo_url} alt={`Logo ${data.display_name}`} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
              </div>
            )}
            <p style={{ margin: "0 0 9px", color: theme.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{strategy.eyebrow || "Conecte-se"}</p>
            <h1 style={{ margin: 0, fontSize: "clamp(34px,9vw,50px)", lineHeight: 1.02, letterSpacing: "-1.3px", fontWeight: 820 }}>{data.display_name}</h1>
            {data.description && <p style={{ margin: "14px 0 0", maxWidth: 460, color: theme.muted, fontSize: 15, lineHeight: 1.65 }}>{data.description}</p>}
          </header>

          {notice && <Notice text={notice} />}

          <section style={{ padding: "20px 0" }}>
            <h2 style={{ margin: 0, fontSize: 27, lineHeight: 1.18, letterSpacing: "-.6px" }}>{strategy.headline || "Como podemos ajudar?"}</h2>
            <p style={{ margin: "10px 0 0", color: theme.muted, lineHeight: 1.6 }}>{strategy.body || "Escolha uma opção para continuar."}</p>
            {cta && <div style={{ marginTop: 18 }}>{cta}</div>}
          </section>

          {featuredActions.length > 0 && (
            <section style={{ marginTop: 20 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>Destaques</h2>
              {featuredActions.map(({ code, node }) => <div key={code}>{node}</div>)}
            </section>
          )}

          {secondaryActions.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>Outras formas de conectar</h2>
              {secondaryActions.map(({ code, node }) => <div key={code}>{node}</div>)}
            </section>
          )}

          {shareBlock}
          {infoBlock}
          {footer}
        </section>
      </main>
    );
  }

  if (themeName === "bento_premium") {
    return (
      <main style={{ minHeight: "100vh", padding: "24px 12px 46px", background: theme.page, color: theme.text, fontFamily: "Inter,Arial,sans-serif", position: "relative", overflow: "hidden" }}>
        {themeName === "parametric" && (
          <>
            <div style={{ position: "fixed", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(139,92,246,.16)", top: -160, right: -100, pointerEvents: "none" }} />
            <div style={{ position: "fixed", width: 520, height: 520, borderRadius: "50%", border: "1px solid rgba(139,92,246,.10)", bottom: -260, left: -160, pointerEvents: "none" }} />
          </>
        )}
        {wifiModal}
        {previewBar}
        <section style={{ width: "100%", maxWidth: 610, margin: "0 auto", display: "grid", gap: 12 }}>
          <header style={{ padding: "32px 26px", borderRadius: 24, background: theme.hero, color: "#ffffff" }}>
            <div style={{ display: "grid", gridTemplateColumns: data.logo_url ? "88px 1fr" : "1fr", gap: 18, alignItems: "center" }}>
              {data.logo_url && (
                <div style={{ width: 88, height: 76, padding: 9, borderRadius: 18, background: "#ffffff" }}>
                  <img src={data.logo_url} alt={`Logo ${data.display_name}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              )}
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 11.5, fontWeight: 850, textTransform: "uppercase", letterSpacing: "1px", opacity: .72 }}>{strategy.eyebrow || "Conecte-se"}</p>
                <h1 style={{ margin: 0, fontSize: "clamp(31px,8vw,43px)", lineHeight: 1.03, letterSpacing: "-1px" }}>{data.display_name}</h1>
                {data.description && <p style={{ margin: "12px 0 0", maxWidth: 430, lineHeight: 1.55, opacity: .8 }}>{data.description}</p>}
              </div>
            </div>
          </header>

          {notice && <Notice text={notice} />}

          <section style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 12 }}>
            <div style={{ padding: 22, borderRadius: 22, background: theme.shell, border: `1px solid ${theme.border}` }}>
              <h2 style={{ margin: 0, fontSize: 25, lineHeight: 1.18 }}>{strategy.headline || "Como podemos ajudar?"}</h2>
              <p style={{ margin: "10px 0 0", color: theme.muted, lineHeight: 1.6 }}>{strategy.body || "Escolha uma opção para continuar."}</p>
              {cta && <div style={{ marginTop: 18 }}>{cta}</div>}
            </div>

            <div style={{ padding: 18, borderRadius: 22, background: "#111827", color: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, opacity: .65, textTransform: "uppercase", letterSpacing: "1px" }}>Acesso rápido</p>
                <h3 style={{ margin: "8px 0 0", fontSize: 20 }}>Tudo conectado</h3>
              </div>
              <p style={{ margin: "18px 0 0", fontSize: 13, lineHeight: 1.5, opacity: .72 }}>Contatos, localização e serviços em um único ponto.</p>
            </div>
          </section>

          {featuredActions.length > 0 && (
            <section>
              <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Destaques</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {featuredActions.map(({ code, node }, index) => (
                  <div key={code} style={{ gridColumn: index === 0 ? "1 / -1" : undefined }}>{node}</div>
                ))}
              </div>
            </section>
          )}

          {secondaryActions.length > 0 && (
            <section>
              <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Outras formas de conectar</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {secondaryActions.map(({ code, node }) => <div key={code}>{node}</div>)}
              </div>
            </section>
          )}

          {shareBlock}
          {infoBlock}
          {footer}
        </section>
      </main>
    );
  }

  if (themeName === "futuristic" || themeName === "parametric") {
    return (
      <main style={{ minHeight: "100vh", padding: "24px 12px 46px", background: theme.page, color: theme.text, fontFamily: "Inter,Arial,sans-serif" }}>
        {wifiModal}
        {previewBar}
        <section style={{
          width: "100%", maxWidth: 590, margin: "0 auto", padding: 14,
          borderRadius: 26, background: theme.shell, border: `1px solid ${theme.border}`,
          boxShadow: "0 28px 80px rgba(0,0,0,.48)", boxSizing: "border-box",
        }}>
          <header style={{ padding: "34px 24px 30px", borderRadius: 20, background: theme.hero, textAlign: "center" }}>
            {data.logo_url && (
              <div style={{ width: 104, height: 86, margin: "0 auto 17px", padding: 9, borderRadius: 18, background: "rgba(255,255,255,.95)" }}>
                <img src={data.logo_url} alt={`Logo ${data.display_name}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            )}
            <h1 style={{ margin: 0, fontSize: "clamp(31px,8vw,42px)", letterSpacing: "-.8px" }}>{data.display_name}</h1>
            {data.description && <p style={{ margin: "13px auto 0", maxWidth: 420, color: "rgba(255,255,255,.76)", lineHeight: 1.55 }}>{data.description}</p>}
          </header>

          <div style={{ padding: "16px 4px 4px" }}>
            {notice && <Notice text={notice} />}
            <section style={{ padding: 19, borderRadius: 18, background: "#18181f", border: `1px solid ${theme.border}` }}>
              <p style={{ margin: "0 0 6px", color: theme.accent, fontSize: 11.5, fontWeight: 850, textTransform: "uppercase", letterSpacing: "1px" }}>{strategy.eyebrow || "Conecte-se"}</p>
              <h2 style={{ margin: 0, fontSize: 23 }}>{strategy.headline || "Como podemos ajudar?"}</h2>
              <p style={{ margin: "9px 0 0", color: theme.muted, lineHeight: 1.55 }}>{strategy.body || "Escolha uma opção para continuar."}</p>
              {cta && <div style={{ marginTop: 15 }}>{cta}</div>}
            </section>

            {featuredActions.length > 0 && (
              <section style={{ marginTop: 16 }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Destaques</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 10 }}>
                  {featuredActions.map(({ code, node }, index) => (
                    <div key={code} style={{ gridColumn: index === 0 ? "1 / -1" : undefined }}>{node}</div>
                  ))}
                </div>
              </section>
            )}

            {secondaryActions.length > 0 && (
              <section style={{ marginTop: 18 }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Outras formas de conectar</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {secondaryActions.map(({ code, node }) => <div key={code}>{node}</div>)}
                </div>
              </section>
            )}

            {shareBlock}
            {infoBlock}
            {footer}
          </div>
        </section>
      </main>
    );
  }

  const classic = themeName === "classic";

  return (
    <main style={{ minHeight: "100vh", padding: "24px 12px 46px", background: theme.page, color: theme.text, fontFamily: "Inter,Arial,sans-serif" }}>
      {wifiModal}
      {previewBar}
      <section style={{
        width: "100%", maxWidth: classic ? 550 : 570, margin: "0 auto",
        overflow: "hidden", background: theme.shell, border: `1px solid ${theme.border}`,
        borderRadius: classic ? 24 : 28, boxShadow: "0 24px 64px rgba(15,23,42,.14)",
      }}>
        <header style={{ padding: classic ? "42px 28px 34px" : "36px 28px 32px", background: theme.hero, color: "#ffffff", textAlign: "center" }}>
          {data.logo_url && (
            <div style={{
              width: classic ? 110 : 116, height: classic ? 92 : 96,
              margin: "0 auto 18px", padding: 10, borderRadius: classic ? "50%" : 20,
              background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 12px 28px rgba(0,0,0,.18)",
            }}>
              <img src={data.logo_url} alt={`Logo ${data.display_name}`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: classic ? "50%" : 0 }} />
            </div>
          )}

          <h1 style={{
            margin: 0, fontSize: "clamp(31px,8vw,40px)",
            letterSpacing: classic ? "-.3px" : "-.8px",
            fontFamily: classic ? "Georgia,serif" : "Inter,Arial,sans-serif",
          }}>
            {data.display_name}
          </h1>

          {data.description && <p style={{ margin: "14px auto 0", maxWidth: 420, fontSize: 14.5, lineHeight: 1.6, opacity: .86 }}>{data.description}</p>}
        </header>

        <div style={{ padding: classic ? "26px 26px 28px" : "24px 24px 26px" }}>
          {notice && <Notice text={notice} />}

          <section style={{
            padding: classic ? "24px 22px" : "21px 20px",
            borderRadius: classic ? 16 : 20,
            background: classic ? "#fbf6ec" : theme.page,
            border: `1px solid ${theme.border}`,
            textAlign: classic ? "center" : "left",
          }}>
            <p style={{ margin: "0 0 6px", color: theme.accent, fontSize: 11.5, fontWeight: 850, textTransform: "uppercase", letterSpacing: "1px" }}>{strategy.eyebrow || "Conecte-se"}</p>
            <h2 style={{ margin: 0, fontSize: classic ? 24 : 23, fontFamily: classic ? "Georgia,serif" : "Inter,Arial,sans-serif" }}>{strategy.headline || "Como podemos ajudar?"}</h2>
            <p style={{ margin: "9px 0 0", color: theme.muted, fontSize: 14, lineHeight: 1.55 }}>{strategy.body || "Escolha uma opção para continuar."}</p>
            {cta && <div style={{ marginTop: 15 }}>{cta}</div>}
          </section>

          {featuredActions.length > 0 && (
            <section style={{ marginTop: 22 }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 19, fontFamily: classic ? "Georgia,serif" : "Inter,Arial,sans-serif" }}>Destaques</h2>
              <div style={{ display: "grid", gap: 11 }}>
                {featuredActions.map(({ code, node }) => <div key={code}>{node}</div>)}
              </div>
            </section>
          )}

          {secondaryActions.length > 0 && (
            <section style={{ marginTop: 22 }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 19, fontFamily: classic ? "Georgia,serif" : "Inter,Arial,sans-serif" }}>Outras formas de conectar</h2>
              <div style={{ display: "grid", gap: 11 }}>
                {secondaryActions.map(({ code, node }) => <div key={code}>{node}</div>)}
              </div>
            </section>
          )}

          {shareBlock}
          {infoBlock}
          {footer}
        </div>
      </section>
    </main>
  );
}

function Notice({ text }) {
  return (
    <div role="status" style={{
      marginBottom: 16, padding: "12px 14px", borderRadius: 13,
      background: "#ecfdf5", border: "1px solid #bbf7d0",
      color: "#166534", textAlign: "center", fontWeight: 750, fontSize: 13,
    }}>
      {text}
    </div>
  );
}