import { useNavigate, useParams } from "react-router-dom";

export default function Escolha() {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>📋 Cadastro</h1>
      <p>O que deseja cadastrar?</p>

      <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
        <button onClick={() => navigate(`/cadastro/pet/${code}`)}>
          🐶 Pet
        </button>

        <button onClick={() => navigate(`/cadastro/pessoa/${code}`)}>
          👤 Pessoa
        </button>
      </div>
    </div>
  );
}	