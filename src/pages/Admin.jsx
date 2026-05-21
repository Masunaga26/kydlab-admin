import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
  const [tags, setTags] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarTags();
  }, []);

  async function carregarTags() {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("code", { ascending: true });

    if (!error) setTags(data);
  }

  const filtrados = tags.filter((tag) =>
    tag.code.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>🛠 Admin KYDLAB</h1>

      {/* BOTÕES */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          style={{
            background: "#ff3b3b",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            minWidth: "180px",
          }}
        >
          📄 XLS
        </button>

        <button
          style={{
            background: "#ff3b3b",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            minWidth: "220px",
          }}
        >
          🧾 Gerar A3 (125 QR)
        </button>
      </div>

      {/* BUSCA */}
      <input
        placeholder="Buscar código..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {/* TABELA */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr style={{ background: "#eee" }}>
              <th style={th}>Código</th>
              <th style={th}>Status</th>
              <th style={th}>Nome</th>
              <th style={th}>Telefone</th>
              <th style={th}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((tag) => (
              <tr key={tag.id}>
                <td style={td}>{tag.code}</td>
                <td style={td}>{tag.status || "Disponível"}</td>
                <td style={td}>{tag.nome || "-"}</td>
                <td style={td}>{tag.telefone || "-"}</td>

                <td style={td}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={btnDark}>QR</button>
                    <button style={btnBlue}>✏️</button>
                    <button style={btnRed}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====== ESTILOS ====== */

const th = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "left",
};

const td = {
  padding: "10px",
  border: "1px solid #ddd",
};

const btnDark = {
  background: "#444",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const btnBlue = {
  background: "#3498db",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const btnRed = {
  background: "#e74c3c",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};