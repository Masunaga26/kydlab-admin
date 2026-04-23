import { useNavigate, useParams } from "react-router-dom";
import Container from "../components/Container";

export default function Escolha() {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <Container>

      {/* HEADER */}
      <div style={header}>
        <h2>📋 Cadastro</h2>
        <p style={subtitle}>Como deseja usar este QR?</p>
      </div>

      {/* OPÇÕES */}
      <div style={opcao} onClick={() => navigate(`/cadastro/pet/${code}`)}>
        <div style={icone}>🐶</div>
        <div>
          <h3 style={titulo}>Cadastrar um Pet</h3>
          <p style={descricao}>Para identificação de animais</p>
        </div>
      </div>

      <div style={opcao} onClick={() => navigate(`/cadastro/pessoa/${code}`)}>
        <div style={icone}>👤</div>
        <div>
          <h3 style={titulo}>Cadastrar uma Pessoa</h3>
          <p style={descricao}>Para situações de emergência</p>
        </div>
      </div>

    </Container>
  );
}

/* ===== ESTILOS ===== */

const header = {
  textAlign: "center",
  marginBottom: 30
};

const subtitle = {
  fontSize: 14,
  color: "#777"
};

const opcao = {
  display: "flex",
  alignItems: "center",
  gap: 15,
  background: "#fff",
  padding: 18,
  borderRadius: 16,
  marginBottom: 15,
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  cursor: "pointer",
  transition: "0.2s"
};

const icone = {
  fontSize: 30
};

const titulo = {
  margin: 0
};

const descricao = {
  margin: 0,
  fontSize: 13,
  color: "#777"
};