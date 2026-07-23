import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  codigoAdminProValido,
  getInicioPerfilPorAcessoPro,
  limparCodigoPro,
  obterAcessoAdminPro,
} from "../../lib/tappro";

export default function ProInicioCadastro() {
  const { accessCode } = useParams();
  const navigate = useNavigate();
  const cleanCode = limparCodigoPro(accessCode);

  const [message, setMessage] = useState("Preparando seu painel...");

  useEffect(() => {
    let active = true;

    async function redirectToDashboard() {
      if (!codigoAdminProValido(cleanCode)) {
        if (active) {
          setMessage("Código administrativo inválido.");
        }
        return;
      }

      if (obterAcessoAdminPro() !== cleanCode) {
        if (active) {
          setMessage(
            "Este acesso administrativo não está autorizado neste aparelho."
          );
        }
        return;
      }

      const { data, error } = await getInicioPerfilPorAcessoPro(cleanCode);

      if (!active) return;

      if (error || !data?.found) {
        console.error(error);
        setMessage("Não foi possível carregar o acesso TAP PRO.");
        return;
      }

      if (data.profile_type === "professional") {
        navigate(`/pro/profissional/painel/${cleanCode}`, {
          replace: true,
        });
        return;
      }

      if (data.profile_type === "company") {
        navigate(`/pro/empresa/painel/${cleanCode}`, {
          replace: true,
        });
        return;
      }

      setMessage("Tipo de perfil não identificado.");
    }

    redirectToDashboard();

    return () => {
      active = false;
    };
  }, [cleanCode, navigate]);

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
          boxShadow: "0 18px 48px rgba(17,24,39,.1)",
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
      </section>
    </main>
  );
}