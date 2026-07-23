import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  codigoAdminProValido,
  codigoPecaProValido,
  getInicioPerfilPorAcessoPro,
  iniciarPerfilDaPecaPro,
  limparCodigoPro,
  salvarAcessoAdminPro,
} from "../../lib/tappro";

export default function ProInicioCadastro() {
  const { pieceCode, accessCode } = useParams();
  const navigate = useNavigate();

  const cleanPieceCode = limparCodigoPro(pieceCode);
  const cleanAccessCode = limparCodigoPro(accessCode);

  const [message, setMessage] = useState(
    "Preparando seu painel..."
  );

  useEffect(() => {
    let active = true;

    function showMessage(text) {
      if (active) {
        setMessage(text);
      }
    }

    function openDashboard(profileType) {
      if (profileType === "professional") {
        navigate(
          `/pro/profissional/painel/${cleanAccessCode}`,
          { replace: true }
        );
        return true;
      }

      if (profileType === "company") {
        navigate(
          `/pro/empresa/painel/${cleanAccessCode}`,
          { replace: true }
        );
        return true;
      }

      return false;
    }

    async function getProfileState() {
      return getInicioPerfilPorAcessoPro(
        cleanAccessCode
      );
    }

    async function prepareControlAccess() {
      if (
        !codigoAdminProValido(
          cleanAccessCode
        )
      ) {
        showMessage(
          "Código administrativo inválido."
        );
        return;
      }

      if (
        cleanPieceCode &&
        !codigoPecaProValido(
          cleanPieceCode
        )
      ) {
        showMessage(
          "Código físico inválido."
        );
        return;
      }

      /*
       * Primeiro tenta abrir um perfil que já existe.
       * Isso mantém compatibilidade com clientes já ativados.
       */
      let result =
        await getProfileState();

      if (!active) return;

      /*
       * No primeiro uso do cartão-controle, o perfil pode
       * ainda não ter sido iniciado. Nesse caso, a própria
       * rota privada inicia a peça e confirma se os dois
       * códigos realmente pertencem ao mesmo cadastro.
       */
      if (
        (!result.data?.found ||
          result.error) &&
        cleanPieceCode
      ) {
        showMessage(
          "Ativando seu cartão-controle..."
        );

        const startResult =
          await iniciarPerfilDaPecaPro(
            cleanPieceCode
          );

        if (!active) return;

        if (startResult.error) {
          console.error(
            "Erro ao iniciar perfil pelo cartão-controle:",
            startResult.error
          );

          showMessage(
            startResult.error.message ||
              "Não foi possível ativar este cartão-controle."
          );
          return;
        }

        const returnedAccessCode =
          limparCodigoPro(
            startResult.data?.access_code
          );

        if (
          !returnedAccessCode ||
          returnedAccessCode !==
            cleanAccessCode
        ) {
          showMessage(
            "Este cartão-controle não pertence a esta peça."
          );
          return;
        }

        result =
          await getProfileState();

        if (!active) return;
      }

      if (
        result.error ||
        !result.data?.found
      ) {
        console.error(result.error);

        showMessage(
          "Não foi possível carregar o acesso TAP PRO."
        );
        return;
      }

      /*
       * A autorização só é salva depois que o banco confirma
       * que o código administrativo corresponde a um perfil.
       */
      if (
        !salvarAcessoAdminPro(
          cleanAccessCode
        )
      ) {
        showMessage(
          "Não foi possível autorizar este aparelho."
        );
        return;
      }

      if (
        !openDashboard(
          result.data.profile_type
        )
      ) {
        showMessage(
          "Tipo de perfil não identificado."
        );
      }
    }

    prepareControlAccess();

    return () => {
      active = false;
    };
  }, [
    cleanAccessCode,
    cleanPieceCode,
    navigate,
  ]);

  return <Screen text={message} />;
}

function Screen({ text }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f5f2ec",
        color: "#111827",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 28,
          borderRadius: 22,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 18px 48px rgba(17,24,39,.1)",
          textAlign: "center",
        }}
      >
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

        <p
          style={{
            margin: "14px 0 0",
            color: "#9ca3af",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          Acesso privado do cartão-controle.
        </p>
      </section>
    </main>
  );
}