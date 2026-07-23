import {
  useEffect,
  useMemo,
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
  obterAcessoAdminPro,
  salvarAcessoAdminPro,
} from "../../lib/tappro";

export default function ProInicioCadastro() {
  const {
    pieceCode,
    accessCode: legacyAccessCode,
  } = useParams();

  const navigate = useNavigate();

  const cleanPieceCode =
    limparCodigoPro(pieceCode);

  const cleanLegacyAccessCode =
    limparCodigoPro(legacyAccessCode);

  const [codigoDigitado, setCodigoDigitado] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [validando, setValidando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [mensagem, setMensagem] =
    useState("Verificando este aparelho...");

  const codigoSalvo = useMemo(
    () => obterAcessoAdminPro(),
    []
  );

  function abrirPainel(
    profileType,
    accessCode
  ) {
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

  async function validarEEntrar(
    informedCode,
    silent = false
  ) {
    const cleanAccessCode =
      limparCodigoPro(informedCode);

    if (
      !codigoAdminProValido(
        cleanAccessCode
      )
    ) {
      if (!silent) {
        setErro(
          "Digite um código de acesso válido."
        );
      }
      return false;
    }

    setValidando(true);
    setErro("");

    try {
      /*
       * 1. Primeiro procura um perfil já existente.
       * Isso permite que clientes já cadastrados voltem
       * ao painel normalmente.
       */
      let profileResult =
        await getInicioPerfilPorAcessoPro(
          cleanAccessCode
        );

      /*
       * 2. Somente quando ainda não existe perfil,
       * inicia a peça pela primeira vez.
       */
      if (
        (
          profileResult.error ||
          !profileResult.data?.found
        ) &&
        cleanPieceCode
      ) {
        const startResult =
          await iniciarPerfilDaPecaPro(
            cleanPieceCode
          );

        if (startResult.error) {
          console.error(
            "Erro ao iniciar a peça:",
            startResult.error
          );

          if (!silent) {
            setErro(
              startResult.error.message ||
                "Não foi possível iniciar este cartão-controle."
            );
          }

          return false;
        }

        const expectedAccessCode =
          limparCodigoPro(
            startResult.data?.access_code
          );

        if (
          !expectedAccessCode ||
          expectedAccessCode !==
            cleanAccessCode
        ) {
          if (!silent) {
            setErro(
              "Código de acesso incorreto."
            );
          }

          return false;
        }

        profileResult =
          await getInicioPerfilPorAcessoPro(
            cleanAccessCode
          );
      } else if (
        cleanLegacyAccessCode &&
        cleanLegacyAccessCode !==
          cleanAccessCode
      ) {
        if (!silent) {
          setErro(
            "Código de acesso incorreto."
          );
        }

        return false;
      }

      if (
        profileResult.error ||
        !profileResult.data?.found
      ) {
        console.error(
          profileResult.error
        );

        if (!silent) {
          setErro(
            "Não foi possível localizar este acesso TAP PRO."
          );
        }

        return false;
      }

      if (
        !salvarAcessoAdminPro(
          cleanAccessCode
        )
      ) {
        if (!silent) {
          setErro(
            "Não foi possível autorizar este aparelho."
          );
        }

        return false;
      }

      if (
        !abrirPainel(
          profileResult.data.profile_type,
          cleanAccessCode
        )
      ) {
        if (!silent) {
          setErro(
            "Tipo de perfil não identificado."
          );
        }

        return false;
      }

      return true;
    } finally {
      setValidando(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function verificarAcessoSalvo() {
      if (
        cleanPieceCode &&
        !codigoPecaProValido(
          cleanPieceCode
        )
      ) {
        if (active) {
          setErro(
            "Código físico inválido."
          );
          setLoading(false);
        }
        return;
      }

      /*
       * Aparelho já autorizado:
       * tenta entrar automaticamente.
       */
      if (
        codigoAdminProValido(
          codigoSalvo
        )
      ) {
        setMensagem(
          "Abrindo seu painel..."
        );

        const entrou =
          await validarEEntrar(
            codigoSalvo,
            true
          );

        if (entrou || !active) {
          return;
        }
      }

      /*
       * Navegador novo:
       * exibe o formulário de código.
       */
      if (active) {
        setMensagem("");
        setLoading(false);
      }
    }

    verificarAcessoSalvo();

    return () => {
      active = false;
    };
  }, [
    cleanPieceCode,
    codigoSalvo,
  ]);

  async function submit(event) {
    event.preventDefault();

    await validarEEntrar(
      codigoDigitado,
      false
    );
  }

  if (loading) {
    return (
      <Screen>
        <Status text={mensagem} />
      </Screen>
    );
  }

  return (
    <Screen>
      <div
        style={{
          width: 54,
          height: 54,
          margin: "0 auto 17px",
          borderRadius: 17,
          background: "#111827",
          display: "grid",
          placeItems: "center",
          color: "#ffffff",
          fontWeight: 950,
          letterSpacing: ".5px",
        }}
      >
        TAP
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 27,
          lineHeight: 1.15,
        }}
      >
        Acesse seu painel
      </h1>

      <p
        style={{
          margin: "11px 0 22px",
          color: "#6b7280",
          lineHeight: 1.5,
        }}
      >
        Digite o código administrativo entregue
        com seu cartão-controle.
      </p>

      <form onSubmit={submit}>
        <label
          htmlFor="codigo-admin"
          style={{
            display: "block",
            marginBottom: 8,
            textAlign: "left",
            color: "#111827",
            fontSize: 14,
            fontWeight: 850,
          }}
        >
          Código de acesso
        </label>

        <input
          id="codigo-admin"
          value={codigoDigitado}
          onChange={(event) => {
            setCodigoDigitado(
              limparCodigoPro(
                event.target.value
              )
            );
            setErro("");
          }}
          autoCapitalize="characters"
          autoComplete="one-time-code"
          spellCheck={false}
          placeholder="Digite seu código"
          maxLength={12}
          style={{
            width: "100%",
            minHeight: 52,
            padding: "12px 14px",
            borderRadius: 13,
            border: erro
              ? "1px solid #dc2626"
              : "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#111827",
            fontSize: 19,
            fontWeight: 850,
            letterSpacing: "1.5px",
            textAlign: "center",
            textTransform: "uppercase",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {erro ? (
          <p
            style={{
              margin: "9px 0 0",
              color: "#b91c1c",
              fontSize: 13,
              fontWeight: 750,
              lineHeight: 1.4,
            }}
          >
            {erro}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            validando ||
            !codigoDigitado
          }
          style={{
            width: "100%",
            minHeight: 52,
            marginTop: 16,
            padding: "12px 16px",
            border: "none",
            borderRadius: 13,
            background:
              validando ||
              !codigoDigitado
                ? "#cbd5e1"
                : "#111827",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 900,
            cursor:
              validando ||
              !codigoDigitado
                ? "not-allowed"
                : "pointer",
          }}
        >
          {validando
            ? "Verificando..."
            : "Entrar"}
        </button>
      </form>

      <p
        style={{
          margin: "17px 0 0",
          color: "#9ca3af",
          fontSize: 12,
          lineHeight: 1.45,
        }}
      >
        Depois da primeira validação, este navegador
        poderá abrir o painel diretamente.
      </p>
    </Screen>
  );
}

function Status({ text }) {
  return (
    <>
      <div
        style={{
          width: 48,
          height: 48,
          margin: "0 auto 16px",
          borderRadius: 15,
          background: "#111827",
          display: "grid",
          placeItems: "center",
          color: "#ffffff",
          fontWeight: 900,
          letterSpacing: ".5px",
        }}
      >
        TAP
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 25,
        }}
      >
        TAP PRO
      </h1>

      <p
        style={{
          margin: "10px 0 0",
          color: "#6b7280",
          lineHeight: 1.5,
        }}
      >
        {text}
      </p>
    </>
  );
}

function Screen({ children }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 22,
        background: "#f5f2ec",
        color: "#111827",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 390,
          padding: "30px 24px",
          borderRadius: 24,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 18px 48px rgba(17,24,39,.1)",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {children}
      </section>
    </main>
  );
}