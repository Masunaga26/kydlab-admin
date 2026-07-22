import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  codigoAdminProValido,
  codigoPecaProValido,
  encerrarAcessoAdminPro,
  encerrarAcessoPro,
  getInicioPerfilPorAcessoPro,
  getProfessionalProfileForEditByCode,
  limparCodigoPro,
  obterAcessoAdminPro,
  obterCodigoAcessoPro,
  salvarAcessoAdminPro,
  salvarAcessoPro,
} from "../../lib/tappro";

const inputStyle = {
  width: "100%",
  minHeight: "54px",
  padding: "14px 15px",
  borderRadius: "13px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "20px",
  fontWeight: 850,
  letterSpacing: "2px",
  textTransform: "uppercase",
  outline: "none",
  boxSizing: "border-box",
  textAlign: "center",
};

const buttonStyle = {
  width: "100%",
  minHeight: "52px",
  borderRadius: "13px",
  border: "none",
  padding: "14px",
  fontSize: "16px",
  fontWeight: 850,
  cursor: "pointer",
};

function rotaNovoPainel(data, accessCode) {
  if (!data?.found) return "";

  if (!data.profile_type && data.piece_code) {
    return `/pro/acesso/${data.piece_code}`;
  }

  const profileStatus =
    data.profile_status || data.status;

  if (profileStatus === "active") {
    return data.profile_type === "professional"
      ? `/pro/profissional/painel/${accessCode}`
      : `/pro/empresa/painel/${accessCode}`;
  }

  return `/pro/inicio/${accessCode}`;
}

export default function ProPortal() {
  const navigate = useNavigate();

  const [codigo, setCodigo] =
    useState("");

  const [verificando, setVerificando] =
    useState(false);

  const [carregando, setCarregando] =
    useState(true);

  const [acessoSalvo, setAcessoSalvo] =
    useState(null);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarAcessoSalvo() {
      const codigoAdmin =
        obterAcessoAdminPro();

      if (
        codigoAdminProValido(
          codigoAdmin
        )
      ) {
        const { data, error } =
          await getInicioPerfilPorAcessoPro(
            codigoAdmin
          );

        if (!ativo) return;

        if (!error && data?.found) {
          setCodigo(codigoAdmin);
          setAcessoSalvo({
            code: codigoAdmin,
            kind: "new",
            data,
          });
          setCarregando(false);
          return;
        }

        encerrarAcessoAdminPro();
      }

      const codigoAntigo =
        obterCodigoAcessoPro();

      if (
        codigoPecaProValido(
          codigoAntigo
        )
      ) {
        const { data, error } =
          await getProfessionalProfileForEditByCode(
            codigoAntigo
          );

        if (!ativo) return;

        if (!error && data?.active) {
          setCodigo(codigoAntigo);
          setAcessoSalvo({
            code: codigoAntigo,
            kind: "legacy",
            data,
          });
          setCarregando(false);
          return;
        }

        encerrarAcessoPro();
      }

      if (ativo) {
        setCarregando(false);
      }
    }

    carregarAcessoSalvo();

    return () => {
      ativo = false;
    };
  }, []);

  function abrirAcessoSalvo() {
    if (!acessoSalvo) return;

    if (acessoSalvo.kind === "new") {
      const destino = rotaNovoPainel(
        acessoSalvo.data,
        acessoSalvo.code
      );

      if (destino) {
        navigate(destino);
      }

      return;
    }

    navigate(
      `/pro/editar/${acessoSalvo.code}`
    );
  }

  async function handleAcessar(event) {
    event.preventDefault();

    const cleanCode =
      limparCodigoPro(codigo);

    setErro("");

    if (
      !codigoAdminProValido(
        cleanCode
      )
    ) {
      setErro(
        "Digite o código administrativo com 4 letras. Códigos antigos de 10 caracteres também continuam válidos."
      );
      return;
    }

    setVerificando(true);

    const novoAcesso =
      await getInicioPerfilPorAcessoPro(
        cleanCode
      );

    if (
      !novoAcesso.error &&
      novoAcesso.data?.found
    ) {
      salvarAcessoAdminPro(cleanCode);

      const destino = rotaNovoPainel(
        novoAcesso.data,
        cleanCode
      );

      setVerificando(false);

      if (destino) {
        navigate(destino);
      }

      return;
    }

    if (codigoPecaProValido(cleanCode)) {
      const antigoAcesso =
        await getProfessionalProfileForEditByCode(
          cleanCode
        );

      if (
        !antigoAcesso.error &&
        antigoAcesso.data?.active
      ) {
        salvarAcessoPro(cleanCode);
        setVerificando(false);
        navigate(
          `/pro/editar/${cleanCode}`
        );
        return;
      }
    }

    if (novoAcesso.error) {
      console.error(
        "Erro ao verificar acesso TAP PRO:",
        novoAcesso.error
      );
    }

    setErro(
      "Código administrativo não encontrado. Confira as letras impressas no cartão da peça."
    );
    setVerificando(false);
  }

  if (carregando) {
    return (
      <main
        className="notranslate"
        translate="no"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f2ec",
          padding: "24px 16px",
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
          Carregando TAP PRO...
        </p>
      </main>
    );
  }

  return (
    <main
      className="notranslate"
      translate="no"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f2ec",
        padding: "24px 16px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
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
              fontSize: "13px",
              opacity: 0.84,
              fontWeight: 750,
            }}
          >
            Painel do lojista
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
            {acessoSalvo
              ? "Seu acesso está salvo neste aparelho."
              : "Digite o código administrativo impresso no cartão da peça."}
          </p>
        </header>

        <div style={{ padding: "26px 24px" }}>
          {erro && (
            <div
              role="alert"
              style={{
                marginBottom: "18px",
                padding: "13px 14px",
                borderRadius: "12px",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontWeight: 750,
                lineHeight: 1.5,
              }}
            >
              {erro}
            </div>
          )}

          {acessoSalvo ? (
            <div
              style={{
                padding: "18px",
                borderRadius: "16px",
                background: "#fffaf0",
                border: "1px solid #e6d7b8",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#111827",
                  fontWeight: 850,
                  fontSize: "17px",
                }}
              >
                {acessoSalvo.data
                  ?.display_name ||
                  acessoSalvo.data?.nome ||
                  "Página TAP PRO"}
              </p>

              <p
                style={{
                  margin: 0,
                  color: "#8a641f",
                  fontSize: "14px",
                  fontWeight: 900,
                  letterSpacing: "1.4px",
                }}
              >
                {acessoSalvo.code}
              </p>

              <button
                type="button"
                onClick={abrirAcessoSalvo}
                style={{
                  ...buttonStyle,
                  marginTop: "18px",
                  background: "#111827",
                  color: "#ffffff",
                }}
              >
                Abrir meu painel
              </button>

              <button
                type="button"
                onClick={() => {
                  encerrarAcessoAdminPro();
                  encerrarAcessoPro();
                  setAcessoSalvo(null);
                  setCodigo("");
                }}
                style={{
                  ...buttonStyle,
                  marginTop: "10px",
                  background: "#ffffff",
                  color: "#374151",
                  border:
                    "1px solid #d1d5db",
                }}
              >
                Usar outro código
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleAcessar}>
                <label
                  htmlFor="codigo-tappro"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#111827",
                    fontWeight: 850,
                    textAlign: "center",
                  }}
                >
                  Código administrativo
                </label>

                <input
                  id="codigo-tappro"
                  type="text"
                  value={codigo}
                  onChange={(event) =>
                    setCodigo(
                      limparCodigoPro(
                        event.target.value
                      )
                    )
                  }
                  maxLength={10}
                  placeholder="ABCD"
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  style={inputStyle}
                />

                <button
                  type="submit"
                  disabled={verificando}
                  style={{
                    ...buttonStyle,
                    marginTop: "20px",
                    background: verificando
                      ? "#9ca3af"
                      : "#111827",
                    color: "#ffffff",
                    cursor: verificando
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {verificando
                    ? "Verificando..."
                    : "Acessar painel"}
                </button>
              </form>

              <p
                style={{
                  margin: "18px 0 0",
                  color: "#6b7280",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                O código fica salvo neste aparelho para facilitar os próximos acessos.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}