import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  limparCodigoPro,
  codigoProValido,
  salvarAcessoAdminPro,
  listarCatalogoModulosClientePro,
} from "../../lib/tappro";

const STATUS_CONFIG = {
  approved: {
    eyebrow: "PAGAMENTO APROVADO",
    title: "Tudo certo!",
    description:
      "Seu pagamento foi confirmado. Estamos finalizando a ativação do novo recurso.",
    icon: "✓",
    accent: "#16a34a",
    soft: "#ecfdf3",
    border: "#bbf7d0",
  },
  pending: {
    eyebrow: "PAGAMENTO EM ANÁLISE",
    title: "Recebemos seu pagamento",
    description:
      "A confirmação ainda está em processamento. Assim que o Mercado Pago aprovar, o recurso será ativado automaticamente.",
    icon: "…",
    accent: "#b7791f",
    soft: "#fffaf0",
    border: "#f3d8a7",
  },
  failure: {
    eyebrow: "PAGAMENTO NÃO CONCLUÍDO",
    title: "Não foi possível finalizar",
    description:
      "O pagamento não foi aprovado. Você pode voltar ao painel e tentar novamente com outro meio de pagamento.",
    icon: "!",
    accent: "#c62828",
    soft: "#fff1f1",
    border: "#fecaca",
  },
};

function normalizeProfileType(value) {
  return value === "professional"
    ? "professional"
    : "company";
}

function normalizeModuleCode(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isModuleActive(item) {
  const status = String(
    item?.profile_module_status ||
      item?.status ||
      ""
  ).toLowerCase();

  return (
    item?.is_active_on_profile === true ||
    item?.active_on_profile === true ||
    status === "active" ||
    status === "included" ||
    status === "trial"
  );
}

export default function ProPagamentoRetorno({
  status = "approved",
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.approved;

  const accessCode = useMemo(
    () =>
      limparCodigoPro(
        searchParams.get("accessCode")
      ),
    [searchParams]
  );

  const profileType = useMemo(
    () =>
      normalizeProfileType(
        searchParams.get("profileType")
      ),
    [searchParams]
  );

  const moduleCode = useMemo(
    () =>
      normalizeModuleCode(
        searchParams.get("moduleCode")
      ),
    [searchParams]
  );

  const [checking, setChecking] =
    useState(status === "approved");

  const [activated, setActivated] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const panelPath =
    profileType === "professional"
      ? `/pro/profissional/painel/${accessCode}`
      : `/pro/empresa/painel/${accessCode}`;

  useEffect(() => {
    if (!codigoProValido(accessCode)) {
      setChecking(false);
      setMessage(
        "O retorno foi recebido, mas o código de acesso não veio completo."
      );
      return;
    }

    salvarAcessoAdminPro(accessCode);

    if (
      status !== "approved" ||
      !moduleCode
    ) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function verifyActivation() {
      attempts += 1;

      const { data, error } =
        await listarCatalogoModulosClientePro(
          accessCode
        );

      if (cancelled) {
        return;
      }

      if (!error) {
        const target = (data || []).find(
          (item) =>
            String(
              item?.module_code || ""
            ).toLowerCase() === moduleCode
        );

        if (
          target &&
          isModuleActive(target)
        ) {
          setActivated(true);
          setChecking(false);
          setMessage(
            "O novo recurso já está ativo no seu painel."
          );
          return;
        }
      }

      if (attempts < 8) {
        window.setTimeout(
          verifyActivation,
          1500
        );
        return;
      }

      setChecking(false);
      setMessage(
        "O pagamento foi aprovado. A ativação pode levar alguns segundos para aparecer no painel."
      );
    }

    verifyActivation();

    return () => {
      cancelled = true;
    };
  }, [
    accessCode,
    moduleCode,
    status,
  ]);

  function goToPanel() {
    if (!codigoProValido(accessCode)) {
      navigate("/pro");
      return;
    }

    navigate(panelPath);
  }

  const detailText =
    status === "approved"
      ? checking
        ? "Confirmando a ativação automática..."
        : activated
          ? "Recurso ativado com sucesso."
          : message
      : message ||
        config.description;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f7f5f0 0%, #efece5 100%)",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow:
            "0 24px 70px rgba(15, 23, 42, 0.12)",
          overflow: "hidden",
          border:
            "1px solid rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            padding: "30px 30px 24px",
            background: config.soft,
            borderBottom:
              `1px solid ${config.border}`,
          }}
        >
          <div
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "#ffffff",
              border:
                `2px solid ${config.accent}`,
              color: config.accent,
              fontSize: "30px",
              fontWeight: 900,
              marginBottom: "20px",
            }}
          >
            {config.icon}
          </div>

          <p
            style={{
              margin: "0 0 8px",
              color: config.accent,
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}
          >
            {config.eyebrow}
          </p>

          <h1
            style={{
              margin: "0 0 12px",
              color: "#111827",
              fontSize: "34px",
              lineHeight: 1.08,
            }}
          >
            {config.title}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#4b5563",
              fontSize: "16px",
              lineHeight: 1.6,
            }}
          >
            {config.description}
          </p>
        </div>

        <div
          style={{
            padding: "26px 30px 30px",
          }}
        >
          <div
            style={{
              borderRadius: "16px",
              padding: "16px",
              background: "#f8fafc",
              border:
                "1px solid #e5e7eb",
              color: "#374151",
              lineHeight: 1.55,
              marginBottom: "20px",
            }}
          >
            {checking ? (
              <strong>
                Confirmando ativação...
              </strong>
            ) : (
              <strong>{detailText}</strong>
            )}
          </div>

          <button
            type="button"
            onClick={goToPanel}
            style={{
              width: "100%",
              minHeight: "52px",
              border: "none",
              borderRadius: "13px",
              background: "#111827",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {status === "failure"
              ? "Voltar e tentar novamente"
              : "Voltar ao meu painel"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/pro")
            }
            style={{
              width: "100%",
              minHeight: "48px",
              marginTop: "10px",
              borderRadius: "13px",
              border:
                "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Ir para o TAP PRO
          </button>

          <p
            style={{
              margin:
                "18px 0 0",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            TAP PRO · Tecnologia simples para conexões profissionais
          </p>
        </div>
      </section>
    </main>
  );
}