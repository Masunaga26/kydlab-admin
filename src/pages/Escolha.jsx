import { useNavigate, useParams } from "react-router-dom";

import TapLayout, {
  TapHero,
  TapSecurityNotice,
} from "../components/TapLayout";

export default function Escolha() {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <TapLayout footerType="simple" productType="geral" code={code}>
      <TapHero
        variant="form"
        title="Ativar identificação"
        subtitle="Escolha como deseja usar este QR"
        code={code}
      />

      <TapSecurityNotice>
        Não pedimos dados sensíveis como documentos ou dados bancários.
      </TapSecurityNotice>

      <section style={optionsWrap}>
        <div
          style={optionCard}
          onClick={() => navigate(`/cadastro/pet/${code}`)}
        >
          <div style={iconBox}>🐶</div>

          <div style={optionContent}>
            <h3 style={optionTitle}>Cadastrar um Pet</h3>
            <p style={optionDescription}>
              Para identificação e contato com tutores.
            </p>
          </div>

          <span style={arrow}>›</span>
        </div>

        <div
          style={optionCard}
          onClick={() => navigate(`/cadastro/pessoa/${code}`)}
        >
          <div style={iconBox}>👤</div>

          <div style={optionContent}>
            <h3 style={optionTitle}>Cadastrar uma Pessoa</h3>
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

/* 🎨 ESTILO VISUAL DA ESCOLHA */

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