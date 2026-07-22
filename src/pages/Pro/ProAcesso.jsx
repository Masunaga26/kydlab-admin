import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  codigoPecaProValido,
  escolherTipoPerfilDaPecaPro,
  getPieceAccessStatePro,
  iniciarPerfilDaPecaPro,
  limparCodigoPro,
  salvarAcessoAdminPro,
} from "../../lib/tappro";

const PROFILE_LABELS = {
  professional: "Profissional",
  company: "Empresa",
};

const PRODUCT_LABELS = {
  totem: "Totem",
  card: "Cartão",
  keychain: "Chaveiro",
  tag: "Tag",
  other: "Outro",
};

const STATUS_LABELS = {
  available: "Disponível",
  activated: "Ativada",
  blocked: "Bloqueada",
  replaced: "Substituída",
  archived: "Arquivada",
};

const buttonBase = {
  width: "100%",
  minHeight: "54px",
  padding: "14px 16px",
  borderRadius: "14px",
  fontSize: "16px",
  fontWeight: 850,
  cursor: "pointer",
};

export default function ProAcesso() {
  const { code } = useParams();
  const navigate = useNavigate();

  const cleanCode =
    limparCodigoPro(code);

  const [loading, setLoading] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [peca, setPeca] =
    useState(null);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  useEffect(() => {
    carregarPeca();
  }, [cleanCode, navigate]);

  async function carregarPeca() {
    setLoading(true);
    setErro("");
    setSucesso("");

    if (!codigoPecaProValido(cleanCode)) {
      setErro(
        "Código TAP PRO inválido."
      );
      setLoading(false);
      return;
    }

    const { data, error } =
      await getPieceAccessStatePro(
        cleanCode
      );

    if (error) {
      console.error(
        "Erro ao consultar peça TAP PRO:",
        error
      );

      setErro(
        "Não foi possível verificar esta peça."
      );
      setLoading(false);
      return;
    }

    if (!data?.found) {
      setErro(
        "Código TAP PRO não encontrado."
      );
      setLoading(false);
      return;
    }

    if (
      data.status === "activated" &&
      data.profile_id
    ) {
      const destino =
        data.predefined_profile_type ===
        "professional"
          ? `/pro/profissional/${cleanCode}`
          : `/pro/empresa/${cleanCode}`;

      navigate(
        destino,
        { replace: true }
      );
      return;
    }

    setPeca(data);
    setLoading(false);
  }

  async function escolherTipo(
    profileType
  ) {
    setSalvando(true);
    setErro("");
    setSucesso("");

    const { data, error } =
      await escolherTipoPerfilDaPecaPro(
        cleanCode,
        profileType
      );

    if (error) {
      console.error(
        "Erro ao escolher perfil:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível salvar a escolha."
      );
      setSalvando(false);
      return;
    }

    setPeca(data);

    setSucesso(
      `Perfil ${PROFILE_LABELS[
        data.predefined_profile_type
      ]} definido com sucesso.`
    );

    setSalvando(false);
  }


  async function iniciarCadastro() {
    setSalvando(true);
    setErro("");
    setSucesso("");

    const { data, error } =
      await iniciarPerfilDaPecaPro(
        cleanCode
      );

    if (error) {
      console.error(
        "Erro ao iniciar perfil:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível iniciar o cadastro."
      );

      setSalvando(false);
      return;
    }

    if (
      !data?.access_code ||
      !data?.profile_id
    ) {
      setErro(
        "O sistema não retornou o acesso administrativo."
      );

      setSalvando(false);
      return;
    }

    salvarAcessoAdminPro(
      data.access_code
    );

    navigate(
      `/pro/inicio/${data.access_code}`
    );
  }

  if (loading) {
    return (
      <TelaCentral>
        <h1 style={titulo}>TAP PRO</h1>
        <p style={texto}>
          Verificando sua peça...
        </p>
      </TelaCentral>
    );
  }

  if (erro && !peca) {
    return (
      <TelaCentral>
        <h1 style={titulo}>TAP PRO</h1>
        <div style={alertaErro}>
          {erro}
        </div>
      </TelaCentral>
    );
  }

  const indisponivel =
    peca.status !== "available";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 48px",
        background: "#f5f2ec",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        color: "#111827",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "520px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid #e6d7b8",
          boxShadow:
            "0 22px 54px rgba(0,0,0,0.13)",
        }}
      >
        <header
          style={{
            padding: "30px 24px",
            background:
              "linear-gradient(135deg, #111827 0%, #b8892f 100%)",
            color: "#ffffff",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              opacity: 0.84,
              fontSize: "13px",
              fontWeight: 750,
            }}
          >
            Ativação da peça
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            TAP PRO
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              opacity: 0.94,
              lineHeight: 1.5,
            }}
          >
            Vamos preparar a experiência correta para esta peça.
          </p>
        </header>

        <div style={{ padding: "26px 24px" }}>
          <div
            style={{
              padding: "16px",
              borderRadius: "15px",
              background: "#fffaf0",
              border: "1px solid #e6d7b8",
            }}
          >
            <div style={linhaInfo}>
              <span style={rotulo}>
                Código
              </span>
              <strong>
                {peca.code}
              </strong>
            </div>

            <div style={linhaInfo}>
              <span style={rotulo}>
                Produto
              </span>
              <strong>
                {PRODUCT_LABELS[
                  peca.product_type
                ] || peca.product_type}
              </strong>
            </div>

            <div style={linhaInfo}>
              <span style={rotulo}>
                Status
              </span>
              <strong>
                {STATUS_LABELS[
                  peca.status
                ] || peca.status}
              </strong>
            </div>
          </div>

          {erro && (
            <div style={alertaErro}>
              {erro}
            </div>
          )}

          {sucesso && (
            <div style={alertaSucesso}>
              {sucesso}
            </div>
          )}

          {indisponivel ? (
            <div
              style={{
                marginTop: "18px",
                padding: "18px",
                borderRadius: "15px",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "20px",
                }}
              >
                Esta peça não está disponível para uma nova ativação
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  lineHeight: 1.55,
                }}
              >
                Na próxima fase, peças já ativadas abrirão diretamente sua página pública.
              </p>
            </div>
          ) : peca.predefined_profile_type ? (
            <div
              style={{
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 7px",
                  color: "#6b7280",
                }}
              >
                Tipo de perfil definido
              </p>

              <h2
                style={{
                  margin: 0,
                  fontSize: "27px",
                }}
              >
                {
                  PROFILE_LABELS[
                    peca.predefined_profile_type
                  ]
                }
              </h2>

              <p
                style={{
                  margin: "12px 0 18px",
                  color: "#6b7280",
                  lineHeight: 1.55,
                }}
              >
                A peça está pronta para iniciar o cadastro. O acesso administrativo já foi preparado.
              </p>

              <button
                type="button"
                disabled={salvando}
                onClick={iniciarCadastro}
                style={{
                  ...buttonBase,
                  border: "none",
                  background: salvando
                    ? "#9ca3af"
                    : "#111827",
                  color: "#ffffff",
                  cursor: salvando
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {salvando
                  ? "Preparando cadastro..."
                  : `Iniciar cadastro de ${
                      PROFILE_LABELS[
                        peca.predefined_profile_type
                      ]
                    }`}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: "22px" }}>
              <h2
                style={{
                  margin: "0 0 8px",
                  textAlign: "center",
                  fontSize: "23px",
                }}
              >
                Como esta peça será usada?
              </h2>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#6b7280",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Essa escolha será registrada na peça.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() =>
                    escolherTipo(
                      "professional"
                    )
                  }
                  style={{
                    ...buttonBase,
                    border: "none",
                    background: "#111827",
                    color: "#ffffff",
                    cursor: salvando
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Usar como Profissional
                </button>

                <button
                  type="button"
                  disabled={salvando}
                  onClick={() =>
                    escolherTipo(
                      "company"
                    )
                  }
                  style={{
                    ...buttonBase,
                    border:
                      "1px solid #b8892f",
                    background: "#fffaf0",
                    color: "#8a641f",
                    cursor: salvando
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Usar como Empresa
                </button>
              </div>
            </div>
          )}

          <p
            style={{
              margin: "24px 0 0",
              color: "#9ca3af",
              fontSize: "12px",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Nesta fase estamos validando o reconhecimento da peça e a escolha do perfil.
          </p>
        </div>
      </section>
    </main>
  );
}

function TelaCentral({ children }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f5f2ec",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "30px 24px",
          borderRadius: "22px",
          background: "#ffffff",
          textAlign: "center",
          border: "1px solid #e6d7b8",
          boxShadow:
            "0 18px 45px rgba(0,0,0,0.10)",
        }}
      >
        {children}
      </section>
    </main>
  );
}

const titulo = {
  margin: "0 0 10px",
  fontSize: "28px",
};

const texto = {
  margin: 0,
  color: "#6b7280",
};

const linhaInfo = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  padding: "7px 0",
};

const rotulo = {
  color: "#6b7280",
  fontSize: "14px",
};

const alertaErro = {
  marginTop: "18px",
  padding: "13px 14px",
  borderRadius: "12px",
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  fontWeight: 750,
  lineHeight: 1.5,
};

const alertaSucesso = {
  marginTop: "18px",
  padding: "13px 14px",
  borderRadius: "12px",
  background: "#dcfce7",
  border: "1px solid #bbf7d0",
  color: "#166534",
  fontWeight: 750,
  lineHeight: 1.5,
};