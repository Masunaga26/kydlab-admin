import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  getResumoCobrancaEmpresaProfissionalPro,
  sincronizarAssinaturaMensalEmpresaPro,
  limparCodigoPro,
} from "../../lib/tappro";

const STORAGE_KEY =
  "tappro_subscription_return_access_code";

const EMAIL_STORAGE_KEY =
  "tappro_subscription_return_payer_email";

function formatDate(value) {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        dateStyle: "long",
      }
    ).format(new Date(value));
  } catch {
    return "";
  }
}

export default function ProAssinaturaRetorno() {
  const [accessCode] = useState(() => {
    try {
      return limparCodigoPro(
        window.localStorage.getItem(
          STORAGE_KEY
        ) || ""
      );
    } catch {
      return "";
    }
  });

  const [payerEmail] = useState(() => {
    try {
      return String(
        window.localStorage.getItem(
          EMAIL_STORAGE_KEY
        ) || ""
      )
        .trim()
        .toLowerCase();
    } catch {
      return "";
    }
  });

  const [loading, setLoading] =
    useState(Boolean(accessCode));

  const [checking, setChecking] =
    useState(false);

  const [summary, setSummary] =
    useState(null);

  const [error, setError] =
    useState("");

  const panelUrl = useMemo(() => {
    if (!accessCode) {
      return "/pro";
    }

    return `/pro/empresa/profissional/${accessCode}`;
  }, [accessCode]);

  const active =
    Boolean(
      summary?.professional_enabled
    );

  const status =
    String(
      summary?.subscription_status || ""
    ).toLowerCase();

  const pending =
    !active &&
    [
      "",
      "pending",
      "created",
      "authorized",
      "in_process",
    ].includes(
      String(
        summary?.payment_last_status || ""
      ).toLowerCase()
    );

  async function loadStatus({
    silent = false,
  } = {}) {
    if (!accessCode) {
      setLoading(false);
      return;
    }

    if (!silent) {
      setChecking(true);
      setError("");
    }

    if (payerEmail) {
      const {
        error: syncError,
      } =
        await sincronizarAssinaturaMensalEmpresaPro(
          accessCode,
          payerEmail
        );

      if (
        syncError &&
        !silent
      ) {
        setError(
          syncError.message ||
          "Não foi possível sincronizar a assinatura."
        );
      }
    }

    const { data, error: requestError } =
      await getResumoCobrancaEmpresaProfissionalPro(
        accessCode
      );

    if (requestError) {
      if (!silent) {
        setError(
          requestError.message ||
          "Não foi possível consultar a assinatura."
        );
      }

      setLoading(false);
      setChecking(false);
      return;
    }

    setSummary(data || null);
    setLoading(false);
    setChecking(false);
  }

  useEffect(() => {
    let activeEffect = true;

    async function firstLoad() {
      if (!activeEffect) {
        return;
      }

      await loadStatus({
        silent: true,
      });
    }

    firstLoad();

    const interval = window.setInterval(
      async () => {
        if (
          !activeEffect ||
          !accessCode
        ) {
          return;
        }

        await loadStatus({
          silent: true,
        });
      },
      5000
    );

    return () => {
      activeEffect = false;
      window.clearInterval(interval);
    };
  }, [accessCode, payerEmail]);

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <Loader2
            size={38}
            style={{
              animation:
                "tappro-spin 1s linear infinite",
            }}
          />
          <h1 style={styles.title}>
            Confirmando sua assinatura
          </h1>
          <p style={styles.text}>
            Estamos verificando a atualização
            enviada pelo Mercado Pago.
          </p>

          <style>{`
            @keyframes tappro-spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div
          style={{
            ...styles.iconCircle,
            background:
              active
                ? "#dcfce7"
                : "#ede9fe",
            color:
              active
                ? "#15803d"
                : "#6d28d9",
          }}
        >
          {active ? (
            <CheckCircle2 size={34} />
          ) : (
            <Clock3 size={34} />
          )}
        </div>

        <p style={styles.eyebrow}>
          TAP PRO PROFISSIONAL
        </p>

        <h1 style={styles.title}>
          {active
            ? "Assinatura confirmada"
            : "Assinatura recebida"}
        </h1>

        <p style={styles.text}>
          {active
            ? "Seu Plano Profissional está ativo e pronto para uso."
            : "O Mercado Pago recebeu sua solicitação. A confirmação pode levar alguns instantes."}
        </p>

        {active && (
          <div style={styles.successBox}>
            <strong>
              Plano Profissional ativo
            </strong>

            {status === "trial" && (
              <span>
                Período gratuito em andamento
                {summary?.trial_ends_at
                  ? ` até ${formatDate(
                      summary.trial_ends_at
                    )}.`
                  : "."}
              </span>
            )}

            {summary?.billing_cycle ===
              "monthly" &&
              status === "active" && (
                <span>
                  Assinatura mensal ativa.
                </span>
              )}

            {summary?.billing_cycle ===
              "annual" && (
                <span>
                  Plano anual ativo
                  {summary?.annual_ends_at
                    ? ` até ${formatDate(
                        summary.annual_ends_at
                      )}.`
                    : "."}
                </span>
              )}
          </div>
        )}

        {!active && pending && (
          <div style={styles.pendingBox}>
            <Clock3 size={18} />
            <span>
              Aguardando a atualização automática
              do Mercado Pago.
            </span>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {!accessCode && (
          <div style={styles.errorBox}>
            Não foi possível identificar esta assinatura.
            Inicie o checkout novamente pelo Painel Profissional
            usando a mesma janela do navegador.
          </div>
        )}

        <div style={styles.actions}>
          <a
            href={panelUrl}
            style={styles.primaryButton}
          >
            Voltar ao Painel Profissional
            <ExternalLink size={17} />
          </a>

          {accessCode && !active && (
            <button
              type="button"
              onClick={() => loadStatus()}
              disabled={checking}
              style={styles.secondaryButton}
            >
              {checking ? (
                <Loader2
                  size={17}
                  style={{
                    animation:
                      "tappro-spin 1s linear infinite",
                  }}
                />
              ) : (
                <RefreshCw size={17} />
              )}

              {checking
                ? "Verificando..."
                : "Verificar novamente"}
            </button>
          )}
        </div>

        <div style={styles.security}>
          <ShieldCheck size={17} />
          <span>
            Pagamento processado com segurança pelo
            Mercado Pago.
          </span>
        </div>

        <style>{`
          @keyframes tappro-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px 16px",
    background:
      "linear-gradient(180deg,#f4f1ec,#ebe7df)",
    display: "grid",
    placeItems: "center",
    fontFamily:
      "Inter,Arial,sans-serif",
    color: "#111827",
  },

  card: {
    width: "100%",
    maxWidth: 560,
    padding: "34px 28px",
    borderRadius: 24,
    background: "#ffffff",
    boxShadow:
      "0 24px 70px rgba(15,23,42,.12)",
    textAlign: "center",
  },

  iconCircle: {
    width: 68,
    height: 68,
    margin: "0 auto",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
  },

  eyebrow: {
    margin: "18px 0 7px",
    color: "#6d28d9",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: ".8px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(27px,7vw,38px)",
    lineHeight: 1.08,
    letterSpacing: "-.7px",
  },

  text: {
    margin: "13px auto 0",
    maxWidth: 430,
    color: "#64748b",
    lineHeight: 1.65,
  },

  successBox: {
    marginTop: 22,
    padding: 16,
    borderRadius: 15,
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
    display: "grid",
    gap: 5,
    textAlign: "left",
  },

  pendingBox: {
    marginTop: 22,
    padding: 15,
    borderRadius: 15,
    background: "#f5f3ff",
    border: "1px solid #c4b5fd",
    color: "#5b21b6",
    display: "flex",
    alignItems: "center",
    gap: 9,
    textAlign: "left",
    fontWeight: 750,
  },

  errorBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 13,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    textAlign: "left",
    lineHeight: 1.5,
  },

  actions: {
    marginTop: 24,
    display: "grid",
    gap: 10,
  },

  primaryButton: {
    minHeight: 50,
    padding: "0 18px",
    borderRadius: 12,
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 900,
  },

  secondaryButton: {
    minHeight: 48,
    padding: "0 18px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 850,
    cursor: "pointer",
  },

  security: {
    marginTop: 22,
    paddingTop: 18,
    borderTop: "1px solid #e5e7eb",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    fontSize: 13,
  },
};