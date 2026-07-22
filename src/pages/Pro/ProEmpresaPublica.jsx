import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCompanyPublicByPiecePro,
  limparCodigoPro,
  registrarEventoEmpresaPro,
  resolverAberturaEmpresaPorPecaPro,
} from "../../lib/tappro";
import ProEmpresaPagina from "./ProEmpresaPagina";

function normalizarDestinoExterno(value) {
  const clean = String(value || "").trim();

  if (!clean) {
    return "";
  }

  const candidate = /^https?:\/\//i.test(clean)
    ? clean
    : `https://${clean}`;

  try {
    const parsed = new URL(candidate);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}


function obterSessaoPublicaPro() {
  const key = "tappro_public_session_id";

  try {
    const existing = window.sessionStorage.getItem(key);

    if (existing) {
      return existing;
    }

    const created =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.sessionStorage.setItem(key, created);
    return created;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function obterHostReferencia() {
  try {
    if (!document.referrer) {
      return "";
    }

    return new URL(document.referrer).hostname || "";
  } catch {
    return "";
  }
}

export default function ProEmpresaPublica() {
  const { pieceCode } = useParams();
  const cleanCode = limparCodigoPro(pieceCode);
  const sessionId = obterSessaoPublicaPro();
  const referrerHost = obterHostReferencia();

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function carregar() {
      setLoading(true);
      setRedirecting(false);
      setData(null);
      setError("");

      const openingResult =
        await resolverAberturaEmpresaPorPecaPro(
          cleanCode
        );

      if (!active) {
        return;
      }

      const opening = openingResult.data;

      if (
        !openingResult.error &&
        opening?.found &&
        opening.action === "redirect"
      ) {
        const destination =
          normalizarDestinoExterno(opening.url);

        if (destination) {
          setRedirecting(true);

          await registrarEventoEmpresaPro(
            cleanCode,
            {
              eventType:"redirect",
              moduleCode:opening.source||"direct",
              openingSource:opening.source||"direct",
              sessionId,
              referrerHost,
            }
          );

          if (!active) {
            return;
          }

          window.location.replace(destination);
          return;
        }
      }

      const result =
        await getCompanyPublicByPiecePro(cleanCode);

      if (!active) {
        return;
      }

      if (result.error || !result.data?.found) {
        setError("Página não encontrada.");
        setLoading(false);
        return;
      }

      const baseUrl =
        window.location.origin.replace(/\/+$/, "");

      const hydratedData={
        ...result.data,
        public_url:
          `${baseUrl}/pro/empresa/${cleanCode}`,
      };

      setData(hydratedData);

      await registrarEventoEmpresaPro(
        cleanCode,
        {
          eventType:"page_view",
          openingSource:"page",
          sessionId,
          referrerHost,
        }
      );

      if (!active) {
        return;
      }

      setLoading(false);
    }

    carregar();

    return () => {
      active = false;
    };
  }, [cleanCode]);

  if (redirecting) {
    return (
      <Tela>
        <h1>TAP PRO</h1>
        <p>Abrindo o conteúdo...</p>
      </Tela>
    );
  }

  if (loading) {
    return (
      <Tela>
        <h1>TAP PRO</h1>
        <p>Carregando...</p>
      </Tela>
    );
  }

  if (error || !data) {
    return (
      <Tela>
        <h1>TAP PRO</h1>
        <p>{error}</p>
      </Tela>
    );
  }

  return (
    <ProEmpresaPagina
      data={data}
      onTrack={(eventData)=>
        registrarEventoEmpresaPro(
          cleanCode,
          {
            ...eventData,
            sessionId,
            referrerHost,
          }
        )
      }
    />
  );
}

function Tela({ children }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f5f2ec",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      <section
        style={{
          padding: 28,
          borderRadius: 20,
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        {children}
      </section>
    </main>
  );
}