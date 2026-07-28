import {
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  codigoAdminProValido,
  codigoPecaProValido,
  getInicioPerfilPorAcessoPro,
  iniciarPerfilDaPecaPro,
  limparCodigoPro,
  prepararAcessoAdministrativoPro,
  salvarAcessoAdminPro,
  validarAcessoAdminDaPecaPro,
} from "../../lib/tappro";

export default function ProInicioCadastro() {
  const { pieceCode } = useParams();
  const navigate = useNavigate();

  const cleanPieceCode =
    limparCodigoPro(pieceCode);

  const [codigoDigitado, setCodigoDigitado] =
    useState("");
  const [validando, setValidando] =
    useState(false);
  const [erro, setErro] =
    useState("");

  prepararAcessoAdministrativoPro();

  function abrirPainel(profileType, accessCode) {
    if (profileType === "professional") {
      navigate(
        `/pro/profissional/painel/${accessCode}`,
        { replace: true }
      );
      return true;
    }

    if (profileType === "company") {
      navigate(
        `/pro/empresa/painel/${accessCode}`,
        { replace: true }
      );
      return true;
    }

    return false;
  }

  async function submit(event) {
    event.preventDefault();

    const cleanAccessCode =
      limparCodigoPro(codigoDigitado);

    setErro("");

    if (!codigoPecaProValido(cleanPieceCode)) {
      setErro("Código físico inválido.");
      return;
    }

    if (!codigoAdminProValido(cleanAccessCode)) {
      setErro("Digite um código administrativo válido.");
      return;
    }

    setValidando(true);

    try {
      let binding =
        await validarAcessoAdminDaPecaPro(
          cleanPieceCode,
          cleanAccessCode
        );

      if (binding.error) {
        setErro(
          binding.error.message ||
            "Não foi possível validar este Cartão-Controle."
        );
        return;
      }

      const validBinding =
        binding.data?.valid === true ||
        binding.data?.ok === true;

      if (!validBinding) {
        const startResult =
          await iniciarPerfilDaPecaPro(
            cleanPieceCode
          );

        if (startResult.error) {
          setErro(
            startResult.error.message ||
              "Não foi possível iniciar esta peça."
          );
          return;
        }

        const expectedAccessCode =
          limparCodigoPro(
            startResult.data?.access_code
          );

        if (expectedAccessCode !== cleanAccessCode) {
          setErro(
            "Este código administrativo não pertence a esta peça."
          );
          return;
        }

        binding =
          await validarAcessoAdminDaPecaPro(
            cleanPieceCode,
            cleanAccessCode
          );

        if (
          binding.error ||
          !(
            binding.data?.valid === true ||
            binding.data?.ok === true
          )
        ) {
          setErro(
            "Não foi possível confirmar o vínculo desta peça."
          );
          return;
        }
      }

      const profileResult =
        await getInicioPerfilPorAcessoPro(
          cleanAccessCode
        );

      if (
        profileResult.error ||
        !profileResult.data?.found
      ) {
        setErro(
          "Não foi possível localizar este acesso TAP PRO."
        );
        return;
      }

      if (!salvarAcessoAdminPro(cleanAccessCode)) {
        setErro(
          "Não foi possível autorizar esta aba."
        );
        return;
      }

      if (
        !abrirPainel(
          profileResult.data.profile_type,
          cleanAccessCode
        )
      ) {
        setErro("Tipo de perfil não identificado.");
      }
    } finally {
      setValidando(false);
    }
  }

  return (
    <Screen>
      <div style={logo}>TAP</div>

      <h1 style={{ margin: 0, fontSize: 27 }}>
        Acesse seu painel
      </h1>

      <p style={description}>
        Digite o código administrativo do seu
        Cartão-Controle. Ele será solicitado em
        cada nova abertura.
      </p>

      <form onSubmit={submit}>
        <label htmlFor="codigo-admin" style={label}>
          Código administrativo
        </label>

        <input
          id="codigo-admin"
          value={codigoDigitado}
          onChange={(event) => {
            setCodigoDigitado(
              limparCodigoPro(event.target.value)
            );
            setErro("");
          }}
          autoFocus
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="Ex.: KBUM"
          maxLength={10}
          style={{
            ...input,
            border: erro
              ? "1px solid #dc2626"
              : "1px solid #cbd5e1",
          }}
        />

        {erro ? <p style={errorText}>{erro}</p> : null}

        <button
          type="submit"
          disabled={validando || !codigoDigitado}
          style={{
            ...button,
            background:
              validando || !codigoDigitado
                ? "#cbd5e1"
                : "#111827",
            cursor:
              validando || !codigoDigitado
                ? "not-allowed"
                : "pointer",
          }}
        >
          {validando ? "Verificando..." : "Entrar"}
        </button>
      </form>

      <p style={footnote}>
        O acesso vale somente nesta aba. O código
        não fica salvo permanentemente no celular.
      </p>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <main style={screen}>
      <section style={card}>{children}</section>
    </main>
  );
}

const screen = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 22,
  background: "#f5f2ec",
  color: "#111827",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
};

const card = {
  width: "100%",
  maxWidth: 390,
  padding: "30px 24px",
  borderRadius: 24,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 18px 48px rgba(17,24,39,.1)",
  textAlign: "center",
  boxSizing: "border-box",
};

const logo = {
  width: 54,
  height: 54,
  margin: "0 auto 17px",
  borderRadius: 17,
  background: "#111827",
  display: "grid",
  placeItems: "center",
  color: "#ffffff",
  fontWeight: 950,
};

const description = {
  margin: "11px 0 22px",
  color: "#6b7280",
  lineHeight: 1.5,
};

const label = {
  display: "block",
  marginBottom: 8,
  textAlign: "left",
  fontSize: 14,
  fontWeight: 850,
};

const input = {
  width: "100%",
  minHeight: 52,
  padding: "12px 14px",
  borderRadius: 13,
  background: "#ffffff",
  color: "#111827",
  fontSize: 19,
  fontWeight: 850,
  letterSpacing: "1.5px",
  textAlign: "center",
  textTransform: "uppercase",
  outline: "none",
  boxSizing: "border-box",
};

const errorText = {
  margin: "9px 0 0",
  color: "#b91c1c",
  fontSize: 13,
  fontWeight: 750,
  lineHeight: 1.4,
};

const button = {
  width: "100%",
  minHeight: 52,
  marginTop: 16,
  padding: "12px 16px",
  border: "none",
  borderRadius: 13,
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 900,
};

const footnote = {
  margin: "17px 0 0",
  color: "#9ca3af",
  fontSize: 12,
  lineHeight: 1.45,
};
