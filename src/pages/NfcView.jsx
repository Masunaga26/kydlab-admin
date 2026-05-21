import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import TapLayout, { TapCard } from "../components/TapLayout";

export default function NfcView() {
  const { code } = useParams();

  const [status, setStatus] = useState("loading");
  // loading | bloqueado | redirecionando

  useEffect(() => {
    verificar();
  }, []);

  async function verificar() {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("code", code)
        .single();

      if (error || !data) {
        setStatus("bloqueado");
        return;
      }

      if (!data.locked) {
        setStatus("bloqueado");
        return;
      }

      setStatus("redirecionando");

      let destino = `/escolha/${code}`;

      if (data.tipo === "pet") {
        destino = `/pet/${code}`;
      } else if (data.tipo === "pessoa") {
        destino = `/pessoa/${code}`;
      }

      setTimeout(() => {
        window.location.replace(destino);
      }, 300);
    } catch (err) {
      console.error("Erro NFC:", err);
      setStatus("bloqueado");
    }
  }

  if (status === "loading" || status === "redirecionando") {
    return (
      <TapLayout footerType="simple" productType="geral" code={code}>
        <div style={screenCenter}>
          <div style={brandBadge}>
            <span style={brandDot}>●</span>
            <span>TAP QR</span>
          </div>

          <TapCard style={statusCard}>
            <div style={loader}></div>

            <h2 style={statusTitle}>
              {status === "loading"
                ? "Verificando identificação"
                : "Abrindo informações"}
            </h2>

            <p style={statusText}>
              {status === "loading"
                ? "Aguarde enquanto validamos este código."
                : "Estamos direcionando para a página correta."}
            </p>

            <p style={codeText}>Código: {code}</p>
          </TapCard>
        </div>
      </TapLayout>
    );
  }

  return (
    <TapLayout footerType="simple" productType="geral" code={code}>
      <div style={screenCenter}>
        <TapCard style={blockedCard}>
          <div style={blockedIcon}>🔒</div>

          <h2 style={blockedTitle}>Produto não ativado</h2>

          <p style={blockedText}>
            Este NFC ainda não possui cadastro salvo.
          </p>

          <p style={blockedSubText}>
            Para segurança, as informações só ficam disponíveis após a ativação
            correta do produto.
          </p>

          <p style={codeText}>Código: {code}</p>
        </TapCard>
      </div>
    </TapLayout>
  );
}

/* 🎨 ESTILO VISUAL NFC */

const screenCenter = {
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "24px 0",
};

const brandBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  margin: "0 auto 18px",
  padding: "10px 16px",
  borderRadius: 999,
  background: "#fff",
  color: "#ef1c1c",
  fontWeight: 900,
  fontSize: 15,
  boxShadow: "0 10px 24px rgba(0,0,0,.08)",
};

const brandDot = {
  color: "#ef1c1c",
  fontSize: 14,
};

const statusCard = {
  textAlign: "center",
  paddingTop: 30,
  paddingBottom: 30,
};

const loader = {
  width: 46,
  height: 46,
  border: "5px solid #f1f1f1",
  borderTop: "5px solid #ef1c1c",
  borderRadius: "50%",
  margin: "0 auto 22px",
  animation: "spin 1s linear infinite",
};

const statusTitle = {
  margin: 0,
  color: "#111",
  fontSize: 23,
  fontWeight: 900,
};

const statusText = {
  margin: "12px 0 0",
  color: "#666",
  fontSize: 15,
  lineHeight: 1.45,
};

const codeText = {
  margin: "18px 0 0",
  color: "#aaa",
  fontSize: 12,
  fontWeight: 700,
};

const blockedCard = {
  textAlign: "center",
  paddingTop: 32,
  paddingBottom: 32,
};

const blockedIcon = {
  width: 72,
  height: 72,
  margin: "0 auto 18px",
  borderRadius: 22,
  background: "#fff1f1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 34,
};

const blockedTitle = {
  margin: 0,
  color: "#111",
  fontSize: 25,
  fontWeight: 950,
};

const blockedText = {
  margin: "14px 0 0",
  color: "#444",
  fontSize: 16,
  lineHeight: 1.45,
  fontWeight: 700,
};

const blockedSubText = {
  margin: "10px 0 0",
  color: "#777",
  fontSize: 14,
  lineHeight: 1.45,
};