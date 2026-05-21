import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import * as XLSX from "xlsx";

export default function Admin() {
  const [tags, setTags] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarTags();
  }, []);

  async function carregarTags() {
    let allData = [];
    let from = 0;
    let to = 999;

    while (true) {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .range(from, to);

      if (error) {
        console.error(error);
        break;
      }

      allData = [...allData, ...data];

      if (data.length < 1000) break;

      from += 1000;
      to += 1000;
    }

    setTags(allData);
  }

  const filtrados = tags.filter((tag) =>
    (tag.code || "").toLowerCase().includes(busca.toLowerCase())
  );

  const BASE_URL = window.location.origin;

  function gerarUrlQR(code) {
    return `${BASE_URL}/qr/${code}`;
  }

  function gerarUrlNFC(code) {
    return `${BASE_URL}/nfc/${code}`;
  }

  // ✅ EXPORTAÇÃO XLS PROFISSIONAL
  function exportarXLS() {
    const dados = tags.map((tag) => ({
      Código: tag.code,
      Status: tag.status,
      Tipo: tag.tipo,
      Nome: tag.nome,
      Telefone: tag.telefone,
      "Contato 1": tag.contato1,
      "Contato 2": tag.contato2,
      Observações: tag.observacoes,
      "URL QR": gerarUrlQR(tag.code),
      "URL NFC": gerarUrlNFC(tag.code),
      "Criado em": tag.created_at,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Tags");

    XLSX.writeFile(workbook, "kydlab_tags.xlsx");
  }

  return (
    <div style={container}>
      <h1>🛠 Admin KYDLAB</h1>

      <div style={acoes}>
        <button style={btnMain} onClick={exportarXLS}>
          📄 Exportar XLS
        </button>
      </div>

      <input
        placeholder="Buscar código..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={input}
      />

      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Código</th>
              <th style={th}>Status</th>
              <th style={th}>Tipo</th>
              <th style={th}>Nome</th>
              <th style={th}>Telefone</th>
              <th style={th}>Contato 1</th>
              <th style={th}>Contato 2</th>
              <th style={th}>Observações</th>
              <th style={th}>QR</th>
              <th style={th}>NFC</th>
              <th style={th}>Criado em</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((tag) => (
              <tr key={tag.id}>
                <td style={td}>{tag.code}</td>
                <td style={td}>{tag.status || "-"}</td>
                <td style={td}>{tag.tipo || "-"}</td>
                <td style={td}>{tag.nome || "-"}</td>
                <td style={td}>{tag.telefone || "-"}</td>
                <td style={td}>{tag.contato1 || "-"}</td>
                <td style={td}>{tag.contato2 || "-"}</td>
                <td style={td}>{tag.observacoes || "-"}</td>

                <td style={td}>
                  <a href={gerarUrlQR(tag.code)} target="_blank">
                    Abrir
                  </a>
                </td>

                <td style={td}>
                  <a href={gerarUrlNFC(tag.code)} target="_blank">
                    Abrir
                  </a>
                </td>

                <td style={td}>
                  {tag.created_at
                    ? new Date(tag.created_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== ESTILOS ===== */

const container = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "20px",
};

const acoes = {
  marginBottom: "20px",
};

const btnMain = {
  background: "#ff3b3b",
  color: "#fff",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "20px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
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