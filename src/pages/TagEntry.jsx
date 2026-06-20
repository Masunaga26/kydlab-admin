import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import TapLayout, {
  TapHero,
  TapCard,
  TapSecurityNotice,
} from "../components/TapLayout";

function TagEntry() {
  const { code } = useParams();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading");
  const [erro, setErro] = useState("");

  useEffect(() => {
    checkTag();
  }, [code]);

  async function checkTag() {
    try {
      const { data, error } = await supabase.rpc("get_tag_status", {
        p_code: code,
      });

      if (error) {
        console.error("Erro ao verificar código:", error);
        setErro("Não foi possível verificar este código.");
        setStatus("erro");
        setLoading(false);
        return;
      }

      if (!data) {
        setErro("Código não encontrado.");
        setStatus("erro");
        setLoading(false);
        return;
      }

      if (data.locked) {
        if (data.tipo === "pet") {
          window.location.replace(`/pet/${code}`);
          return;
        }

        if (data.tipo === "pessoa") {
          window.location.replace(`/pessoa/${code}`);
          return;
        }

        setErro("Este código já está ativado, mas o tipo de cadastro não foi identificado.");
        setStatus("erro");
        setLoading(false);
        return;
      }

      if (data.tipo === "pet") {
        window.location.replace(`/cadastro/pet/${code}`);
        return;
      }

      if (data.tipo === "pessoa") {
        window.location.replace(`/cadastro/pessoa/${code}`);
        return;
      }

      setStatus("novo");
      setLoading(false);
    } catch (err) {
      console.error("Erro inesperado ao verificar código:", err);
      setErro("Erro inesperado ao verificar este código.");
      setStatus("erro");
      setLoading(false);
    }
  }

  if (loading || status === "loading") {
    return (
      <TapLayout footerType="simple" productType="geral" code={code}>
        <div style={screenCenter}>
          <TapCard style={statusCard}>
            <div style={loader}></div>
            <h2 style={statusTitle}>Carregando identificação</h2>
            <p style={statusText}>Aguarde enquanto verificamos este código.</p>
            <p style={codeText}>Código: {code}</p>
          </TapCard>
        </div>
      </TapLayout>
    );
  }

  if (status === "erro") {
    return (
      <TapLayout footerType="simple" productType="geral" code={code}>
        <div style={screenCenter}>
          <TapCard style={statusCard}>
            <div style={blockedIcon}>⚠️</div>
            <h2 style={statusTitle}>Código indisponível</h2>
            <p style={statusText}>{erro}</p>
            <p style={codeText}>Código: {code}</p>
          </TapCard>
        </div>
      </TapLayout>
    );
  }

  return (
    <TapLayout footerType="simple" productType="geral" code={code}>
      <TapHero
        variant="form"
        title="Iniciar cadastro"
        subtitle="Escolha como deseja usar este código"
        code={code}
      />

      <TapSecurityNotice>
        Não pedimos dados sensíveis como documentos ou dados bancários.
      </TapSecurityNotice>

      <section style={optionsWrap}>
        <div
          style={optionCard}
          onClick={() => window.location.href = `/cadastro/pet/${code}`}
        >
          <div style={iconBox}>🐶</div>

          <div style={optionContent}>
            <h3 style={optionTitle}>Cadastrar Pet</h3>
            <p style={optionDescription}>
              Para identificação e contato com tutores.
            </p>
          </div>

          <span style={arrow}>›</span>
        </div>

        <div
          style={optionCard}
          onClick={() => window.location.href = `/cadastro/pessoa/${code}`}
        >
          <div style={iconBox}>👤</div>

          <div style={optionContent}>
            <h3 style={optionTitle}>Cadastrar Pessoa</h3>
            <p style={optionDescription}>
              Para ficha médica e situações de emergência.
            </p>
          </div>

          <span style={arrow}>›</span>
        </div>
      </section>
    </TapLayout>
  );
}

export default TagEntry;

/* 🎨 ESTILO VISUAL TAG ENTRY */

const screenCenter = {
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "24px 0",
};

const statusCard = {
  textAlign: "center",
  paddingTop: 32,
  paddingBottom: 32,
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

const statusTitle = {
  margin: 0,
  color: "#111",
  fontSize: 25,
  fontWeight: 950,
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

const optionsWrap = {
  margin: "16px 16px 0",
};

const optionCard = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  background: "#fff",
  padding: 18,
  borderRadius: 20,
  marginBottom: 14,
  boxShadow: "0 12px 28px rgba(0,0,0,.08)",
  border: "1px solid #eeeeee",
  cursor: "pointer",
};

const iconBox = {
  width: 58,
  height: 58,
  minWidth: 58,
  borderRadius: 18,
  background: "#fff1f1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
};

const optionContent = {
  flex: 1,
};

const optionTitle = {
  margin: 0,
  color: "#111",
  fontSize: 19,
  fontWeight: 900,
};

const optionDescription = {
  margin: "6px 0 0",
  color: "#777",
  fontSize: 14,
  lineHeight: 1.35,
};

const arrow = {
  color: "#d71920",
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 300,
};