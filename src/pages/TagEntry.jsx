import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function TagEntry() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [tipo, setTipo] = useState(null);

  useEffect(() => {
    async function checkTag() {
      const { data } = await supabase
        .from("tags")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (!data) {
        setStatus("novo");
        setLoading(false);
        return;
      }

      if (data.locked) {
        setStatus("bloqueado");
        setLoading(false);
        return;
      }

      if (data.tipo && data.name) {
        setTipo(data.tipo);
        setStatus("cadastrado");
        setLoading(false);
        return;
      }

      setStatus("novo");
      setLoading(false);
    }

    checkTag();
  }, [code]);

  if (loading) return <h2>Carregando...</h2>;

  // 🔒 bloqueado
  if (status === "bloqueado") {
    return (
      <div style={{ padding: "20px" }}>
        <h2>🔒 Código indisponível</h2>
        <p>Este cadastro não pode ser alterado.</p>
      </div>
    );
  }

  // ✅ já cadastrado → redireciona automático
  if (status === "cadastrado") {
    if (tipo === "pet") navigate(`/pet/${code}`);
    if (tipo === "pessoa") navigate(`/pessoa/${code}`);
    return null;
  }

  // 🟡 NOVO (AQUI É O PONTO PRINCIPAL)
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>📲 Cadastro não encontrado</h2>
      <p>Deseja iniciar o cadastro?</p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate(`/cadastro/pet/${code}`)}
          style={btn}
        >
          🐶 Cadastrar Pet
        </button>

        <button
          onClick={() => navigate(`/cadastro/pessoa/${code}`)}
          style={btn}
        >
          👤 Cadastrar Pessoa
        </button>
      </div>
    </div>
  );
}

export default TagEntry;

const btn = {
  display: "block",
  margin: "10px auto",
  padding: "12px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#4CAF50",
  color: "#fff",
  cursor: "pointer",
};