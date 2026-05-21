import tapLogo from "../assets/tap-logo.jpeg";

/**
 * Layout visual padrão TAP QR
 * Usado para padronizar telas de cadastro e telas de visualização.
 *
 * IMPORTANTE:
 * Este arquivo é apenas visual.
 * Não altera rotas, Supabase, status, salvamento ou lógica NFC/QR.
 */

const RED = "#ef1c1c";
const DARK_RED = "#c91515";
const GREEN = "#128c4a";
const TEXT = "#111";
const MUTED = "#777";
const SOFT_BG = "#f5f5f5";
const BORDER = "#eeeeee";

export default function TapLayout({
  children,
  footerType = "simple",
  productType = "pet",
  code,
}) {
  return (
    <div style={styles.page}>
      <main style={styles.shell}>{children}</main>

      <TapFooter
        variant={footerType}
        productType={productType}
        code={code}
      />
    </div>
  );
}

export function TapHero({
  variant = "view",
  title,
  subtitle,
  code,
  photoUrl,
  eyebrow,
  children,
}) {
  const isView = variant === "view";

  return (
    <section style={isView ? styles.viewHero : styles.formHero}>
      <div style={styles.heroPattern} />

      <div style={styles.heroContent}>
        {photoUrl && (
          <div style={styles.photoWrap}>
            <img src={photoUrl} alt="" style={styles.heroPhoto} />
          </div>
        )}

        {eyebrow && <p style={styles.heroEyebrow}>{eyebrow}</p>}

        {title && (
          <h1 style={isView ? styles.viewHeroTitle : styles.formHeroTitle}>
            {title}
          </h1>
        )}

        {subtitle && <p style={styles.heroSubtitle}>{subtitle}</p>}

        {code && <p style={styles.heroCode}>{code}</p>}

        {children}
      </div>

      {isView && <div style={styles.heroCurve} />}
    </section>
  );
}

export function TapCard({ children, style }) {
  return <section style={{ ...styles.card, ...style }}>{children}</section>;
}

export function TapSectionTitle({ icon, title, subtitle }) {
  return (
    <div style={styles.sectionTitleWrap}>
      <div style={styles.sectionTitleLine}>
        {icon && <span style={styles.sectionIcon}>{icon}</span>}
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>

      {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
    </div>
  );
}

export function TapWarningBox({
  children = "⚠️ Para segurança e eficiência do produto, após salvar os dados não são alterados. Revise antes de salvar.",
}) {
  return (
    <div style={styles.warningBox}>
      <strong style={styles.warningTitle}>ATENÇÃO!</strong>
      <p style={styles.warningText}>{children}</p>
    </div>
  );
}

export function TapSecurityNotice({
  children = "Não pedimos dados sensíveis como documentos ou dados bancários.",
}) {
  return (
    <div style={styles.securityNotice}>
      <span style={styles.securityIcon}>🛡️</span>
      <p style={styles.securityText}>{children}</p>
    </div>
  );
}

export function TapActionRow({ children }) {
  return <div style={styles.actionRow}>{children}</div>;
}

export function TapCallButton({ href, children = "Ligar Agora" }) {
  return (
    <a href={href} style={styles.callButton}>
      <span>📞</span>
      <span>{children}</span>
    </a>
  );
}

export function TapWhatsButton({ href, children = "WhatsApp" }) {
  return (
    <a href={href} style={styles.whatsButton}>
      <span>💬</span>
      <span>{children}</span>
    </a>
  );
}

export function TapPrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.primaryButton,
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function TapFooter({
  variant = "simple",
  productType = "pet",
  code,
}) {
  const label =
    productType === "pessoa"
      ? "TAP QR — Identificação Médica de Emergência"
      : productType === "geral"
      ? "TAP QR — Identificação de Emergência"
      : "TAP QR — Identificação PET";

  const whatsappMessage = encodeURIComponent(
    `Gostaria de um suporte ou informação. Meu cód. ${code || ""}`
  );

  const whatsappUrl = `https://wa.me/5511911669119?text=${whatsappMessage}`;

  return (
    <footer style={styles.footer}>
      {variant === "view" && (
        <p style={styles.footerDisclaimer}>
          Os dados exibidos nesta página foram fornecidos com autorização do
          responsável, exclusivamente para uso em situações de emergência. Têm a
          finalidade única de facilitar o contato e contribuir para o caso de
          emergência. Obrigado por ajudar, sua atitude faz toda a diferença.
        </p>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        style={styles.footerLogoLink}
        aria-label="Falar com suporte TAP QR pelo WhatsApp"
      >
        <img src={tapLogo} alt="TAP QR" style={styles.footerLogoImg} />
        <span style={styles.footerLabel}>{label}</span>
      </a>
    </footer>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: SOFT_BG,
    color: TEXT,
    fontFamily: "Inter, Arial, sans-serif",
  },

  shell: {
    width: "100%",
    maxWidth: 430,
    margin: "0 auto",
    paddingBottom: 24,
  },

  formHero: {
    position: "relative",
    overflow: "hidden",
    background: RED,
    color: "#fff",
    padding: "42px 28px 36px",
  },

  viewHero: {
    position: "relative",
    overflow: "hidden",
    background: RED,
    color: "#fff",
    padding: "52px 24px 76px",
    textAlign: "center",
  },

  heroPattern: {
    position: "absolute",
    inset: 0,
    opacity: 0.12,
    backgroundImage:
      "linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px)",
    backgroundSize: "36px 36px",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
  },

  photoWrap: {
    width: 132,
    height: 132,
    borderRadius: "50%",
    margin: "0 auto 22px",
    padding: 7,
    background: "rgba(255,255,255,.18)",
    boxShadow: "0 18px 35px rgba(0,0,0,.2)",
  },

  heroPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid rgba(255,255,255,.25)",
  },

  heroEyebrow: {
    margin: "0 0 6px",
    fontSize: 20,
    fontWeight: 500,
    opacity: 0.88,
  },

  viewHeroTitle: {
    margin: 0,
    fontSize: 44,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-1px",
    color: "#fff",
  },

  formHeroTitle: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.1,
    fontWeight: 900,
    color: "#fff",
  },

  heroSubtitle: {
    margin: "12px 0 0",
    fontSize: 20,
    lineHeight: 1.3,
    fontWeight: 700,
    opacity: 0.94,
  },

  heroCode: {
    margin: "8px 0 0",
    fontSize: 15,
    opacity: 0.7,
  },

  heroCurve: {
    position: "absolute",
    left: "-10%",
    right: "-10%",
    bottom: -38,
    height: 76,
    background: SOFT_BG,
    borderRadius: "50% 50% 0 0",
    zIndex: 1,
  },

  card: {
    background: "#fff",
    borderRadius: 22,
    padding: 22,
    margin: "16px 16px 0",
    boxShadow: "0 12px 28px rgba(0,0,0,.08)",
    border: `1px solid ${BORDER}`,
  },

  sectionTitleWrap: {
    marginBottom: 18,
  },

  sectionTitleLine: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  sectionIcon: {
    color: RED,
    fontSize: 22,
    lineHeight: 1,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 850,
    color: TEXT,
  },

  sectionSubtitle: {
    margin: "10px 0 0",
    color: MUTED,
    fontSize: 16,
    lineHeight: 1.45,
  },

  securityNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: "16px 16px 0",
    border: `1px solid ${BORDER}`,
  },

  securityIcon: {
    fontSize: 20,
  },

  securityText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.45,
    color: "#555",
  },

  warningBox: {
    margin: "20px 16px 0",
    padding: "22px 18px",
    borderRadius: 18,
    background: "#fff7f7",
    border: "2px solid #f19a9a",
    textAlign: "center",
  },

  warningTitle: {
    display: "block",
    color: RED,
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 10,
  },

  warningText: {
    margin: 0,
    color: "#444",
    fontSize: 17,
    lineHeight: 1.55,
  },

  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 16,
  },

  callButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 58,
    borderRadius: 14,
    background: DARK_RED,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 16,
    boxShadow: "0 14px 26px rgba(239,28,28,.25)",
  },

  whatsButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 58,
    borderRadius: 14,
    background: "#fff",
    color: GREEN,
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 16,
    border: "1.5px solid rgba(18,140,74,.35)",
  },

  primaryButton: {
    width: "calc(100% - 32px)",
    margin: "22px 16px 0",
    minHeight: 62,
    borderRadius: 16,
    border: "none",
    background: RED,
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 16px 30px rgba(239,28,28,.22)",
  },

  footer: {
    maxWidth: 430,
    margin: "0 auto",
    padding: "34px 22px 40px",
    textAlign: "center",
    color: "#aaa",
  },

  footerDisclaimer: {
    margin: "0 auto 22px",
    maxWidth: 360,
    fontSize: 13,
    lineHeight: 1.65,
    color: "#b2b2b2",
  },

  footerLogoLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#999",
    textDecoration: "none",
  },

  footerLogoImg: {
    width: 74,
    height: "auto",
    display: "block",
    objectFit: "contain",
    flexShrink: 0,
  },

  footerLabel: {
    fontSize: 14,
    color: "#999",
    lineHeight: 1.25,
    textAlign: "left",
  },
};