import { useParams, useNavigate } from "react-router-dom";

export default function Ativar() {
  const { codigo } = useParams();
  const navigate = useNavigate();

  // proteção
  if (!codigo) return <p>Código inválido</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🔗 Ativar TAG</h1>

      <p><b>Código:</b> {codigo}</p>

      <h2>O que deseja cadastrar?</h2>

      <button onClick={() => <Route path="/cadastro-pet/:code" element={<CadastroPet />} />}>
        🐶 Pet
      </button>

      <button onClick={() => navigate(`/cadastro/pessoa/${codigo}`)}>
        👤 Pessoa
      </button>
    </div>
  );
}