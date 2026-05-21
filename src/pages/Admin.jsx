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
      .order("created_at", { ascending: false });

    if (!error) setTags(data);
  }

  // 🔍 FILTRO
  const filtrados = tags.filter((tag) =>
    (tag.code || "").toLowerCase().includes(busca.toLowerCase())
  );

  // 📄 EXPORTAR XLS (CSV)
  function exportarXLS() {
    const headers = [
      "Código",
      "Status",
      "Nome",
      "Telefone",
      "Tipo",
      "Data"
    ];

    const rows = filtrados.map((tag) => [
      tag.code,
      tag.status,
      tag.nome,
      tag.telefone,
      tag.tipo,
      tag.created_at,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((e) => e.join(";"))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kydlab_tags.csv");
    document.body.appendChild(link);
    link.click();
  }

  return (
    <div style={container}>
      <h1>🛠 Admin KYDLAB</h1>

      {/* BOTÕES */}
      <div style={acoes}>
        <button style={btnMain} onClick={exportarXLS}>
          📄 Exportar XLS
        </button>

        <button style={btnMain}>
          🧾 Gerar A3 (125 QR)
        </button>
      </div>

      {/* BUSCA */}
      <input
        placeholder="Buscar código..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={input}
      />

      {/* TABELA */}
      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Código</th>
              <th style={th}>Status</th>
              <th style={th}>Nome</th>
              <th style={th}>Telefone</th>
              <th style={th}>Tipo</th>
              <th style={th}>Criado em</th>
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
                <td style={td}>{tag.tipo || "-"}</td>
                <td style={td}>
                  {tag.created_at
                    ? new Date(tag.created_at).toLocaleDateString()
                    : "-"}
                </td>

                <td style={td}>
                  <div style={{ display: "flex", gap: "6px" }}>
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

const container = {
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "20px",
};

const acoes = {
  display: "flex",
  gap: "16px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const btnMain = {
  background: "#ff3b3b",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "20px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};

const th = {
  padding: "10px",
  border: "1px solid #ddd",
  background: "#eee",
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