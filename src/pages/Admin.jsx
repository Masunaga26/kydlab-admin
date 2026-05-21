import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

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

      if (error) break;

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

  // 🔥 GERAR URLS
  function gerarUrlQR(code) {
    return `https://app.kydlab.com.br/qr/${code}`;
  }

  function gerarUrlNFC(code) {
    return `https://app.kydlab.com.br/nfc/${code}`;
  }

  // 🔥 EXPORTAR COMPLETO
  function exportarXLS() {
    const headers = [
      "Código",
      "Status",
      "Tipo",
      "Nome",
      "Telefone",
      "Contato 1",
      "Contato 2",
      "Observações",
      "URL QR",
      "URL NFC",
      "Criado em"
    ];

    const rows = tags.map((tag) => [
      tag.code,
      tag.status,
      tag.tipo,
      tag.nome,
      tag.telefone,
      tag.contato1,
      tag.contato2,
      tag.observacoes,
      gerarUrlQR(tag.code),
      gerarUrlNFC(tag.code),
      tag.created_at
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(";")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "kydlab_full.csv";
    link.click();
  }

  return (
    <div style={container}>
      <h1>🛠 Admin KYDLAB</h1>

      <div style={acoes}>
        <button style={btnMain} onClick={exportarXLS}>
          📄 Exportar COMPLETO
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
              <th style={th}>QR</th>
              <th style={th}>NFC</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((tag) => (
              <tr key={tag.id}>
                <td style={td}>{tag.code}</td>
                <td style={td}>{tag.status}</td>
                <td style={td}>{tag.tipo}</td>
                <td style={td}>{tag.nome || "-"}</td>
                <td style={td}>{tag.telefone || "-"}</td>

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* estilos */

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
};VVVVV