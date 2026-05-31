import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import TapLayout, { TapCard } from "../components/TapLayout";

export default function QrRedirect() {
  const { code } = useParams();

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function verificar() {
    try {
      const codigoLimpo = String(code || "").trim();

      if (!codigoLimpo) {
        setErro("Código inválido ou não informado.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("code", codigoLimpo)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar código:", error);
        setErro("Não foi possível verificar este QR no momento.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErro("Código não encontrado no sistema.");
        setLoading(false);
        return;
      }

      if (!data.tipo) {
        window.location.replace(`/escolha/${codigoLimpo}`);
        return;
      }

      if (!data.locked) {
        if (data.tipo === "pet") {
          window.location.replace(`/cadastro/pet/${codigoLimpo}`);
          return;
        }

        if (data.tipo === "pessoa") {
          window.location.replace(`/cadastro/pessoa/${codigoLimpo}`);
          return;
        }

        window.location.replace(`/escolha/${codigoLimpo}`);
        return;
      }

      if (data.tipo === "pet") {
        window.location.replace(`/pet/${codigoLimpo}`);
        return;
      }

      if (data.tipo === "pessoa") {
        window.location.replace(`/pessoa/${codigoLimpo}`);
        return;
      }

      setErro("Tipo de identificação não reconhecido.");
      setLoading(false);
    } catch (err) {
      console.error("Erro inesperado no QR:", err);
      setErro("Erro inesperado ao abrir este QR.");
      setLoading(false);
    }
  }

  if (erro) {
    return (
      <TapLayout footerType="simple" productType="geral" code={code}>
        <div style={screenCenter}>
          <div style={brandBadge}>
            <span style={brandDot}>●</span>
            <span>TAP QR</span>
          </div>

          <TapCard style={statusCard}>
            <div style={errorIcon}>⚠️</div>

            <h2 style={statusTitle}>QR não disponível</h2>

            <p style={statusText}>{erro}</p>

            <p style={codeText}>Código: {code}</p>
          </TapCard>
        </div>
      </TapLayout>
    );
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

const errorIcon = {
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