import { useState } from "react";
import { supabase } from "../client";
export default function Novo() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  function gerarCodigo() {
    return "KYD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    const codigo = gerarCodigo();

    const { error } = await supabase.from("pets").insert([
      {
        nome,
        telefone,
        codigo,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert("Pet cadastrado com sucesso!\nCódigo: " + codigo);

      // limpa campos
      setNome("");
      setTelefone("");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🐶 Cadastrar Pet</h1>

      <form onSubmit={handleSave}>
        <div style={{ marginTop: 10 }}>
          <input
            placeholder="Nome do pet"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}