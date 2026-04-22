import { useParams, useNavigate } from "react-router-dom";

function EscolhaTipo() {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <div style={container}>
      <h1 style={{ marginBottom: "10px" }}>📲 Cadastro</h1>

      <p style={{ color: "#666", marginBottom: "20px" }}>
        Selecione o tipo de cadastro:
      </p>

      <button
        onClick={() => navigate(`/cadastro/pet/${code}`)}
        style={btnPet}
      >
        🐶 Pet
      </button>

      <button
        onClick={() => navigate(`/cadastro/pessoa/${code}`)}
        style={btnPessoa}
      >
        👤 Pessoa
      </button>
    </div>
  );
}

export default EscolhaTipo;

/* 🎨 ESTILO */

const container = {
  padding: "30px",
  textAlign: "center",
  fontFamily: "Arial",
};

const btnPet = {
  display: "block",
  width: "100%",
  padding: "15px",
  marginBottom: "15px",
  backgroundColor: "#4CAF50",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer",
};

const btnPessoa = {
  display: "block",
  width: "100%",
  padding: "15px",
  backgroundColor: "#2196F3",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer",
};