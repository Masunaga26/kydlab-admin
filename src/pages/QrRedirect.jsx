import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import TapLayout, { TapCard } from "../components/TapLayout";

export default function QrRedirect() {
  const { code } = useParams();

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
        window.location.replace("/");
        return;
      }

      if (!data.tipo) {
        window.location.replace(`/escolha/${code}`);
        return;
      }

      if (!data.locked) {
        if (data.tipo === "pet") {
          window.location.replace(`/cadastro/pet/${code}`);
        } else {
          window.location.replace(`/cadastro/pessoa/${code}`);
        }
        return;
      }

      if (data.tipo === "pet") {
        window.location.replace(`/pet/${code}`);
      } else {
        window.location.replace(`/pessoa/${code}`);
      }
    } catch (err) {
      console.error("Erro QR:", err);
      window.location.replace("/");
    }
  }

  return (
    <TapLayout footerType="simple" productType="geral" code={code}>
      <div style={screenCenter}>
        <div style={brandBadge}>
          <span style={brandDot}>●</span>
          <span>TAP QR</span>
        </div>

        <TapCard style={statusCard}>
          <div style={loader}></div>

          <h2 style={statusTitle}>Abrindo identificação</h2>

          <p style={statusText}>
            Aguarde enquanto verificamos este QR.
          </p>

          <p style={codeText}>Código: {code}</p>
        </TapCard>
      </div>
    </TapLayout>
  );
}

/* 🎨 ESTILO VISUAL QR REDIRECT */

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