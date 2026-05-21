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

  const BASE_URL = window.location.origin;

  const total = tags.length;
  const gravados = tags.filter((t) => t.nome).length;
  const disponiveis = tags.filter((t) => !t.nome).length;

  function gerarUrlQR(code) {
    return `${BASE_URL}/qr/${code}`;
  }

  function gerarUrlNFC(code) {
    return `${BASE_URL}/nfc/${code}`;
  }

  function baixarQR(code) {
    const url = `${BASE_URL}/qr/${code}`;
    window.open(url, "_blank");
  }

  async function limparTag(id) {
    const confirmar = confirm("Limpar esse cadastro?");
    if (!confirmar) return;

    await supabase
      .from("tags")
      .update({
        nome: null,
        telefone: null,
        contato1: null,
        contato2: null,
        observacoes: null,
        tipo: null,
        status: "Disponível",
      })
      .eq("id", id);

    carregarTags();
  }

  function gerarA3() {
    alert("Função gerar A3 (125 QR) - próxima etapa 🚀");
  }

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

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Tags");
    XLSX.writeFile(wb, "kydlab_tags.xlsx");
  }

  return (
    <div style={container}>
      <h1>🛠 Admin KYDLAB</h1>

      {/* CARDS */}
      <div style={cards}>
        <div style={card}>Total QR<br /><b>{total}</b></div>
        <div style={card}>Gravados<br /><b>{gravados}</b></div>
        <div style={card}>Disponíveis<br /><b>{disponiveis}</b></div>
      </div>

      {/* BOTÕES */}
      <div style={acoes}>
        <button style={btnMain} onClick={exportarXLS}>
          📄 Exportar XLS
        </button>

        <button style={btnMain} onClick={gerarA3}>
          🧾 Gerar A3 (125 QR)
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
              <th style={th}>Ações</th>
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

                <td style={td}>
                  <a href={gerarUrlQR(tag.code)} target="_blank">Abrir</a>
                </td>

                <td style={td}>
                  <a href={gerarUrlNFC(tag.code)} target="_blank">Abrir</a>
                </td>

                <td style={td}>
                  <button style={btnBlue} onClick={() => baixarQR(tag.code)}>
                    ⬇ QR
                  </button>

                  <button style={btnRed} onClick={() => limparTag(tag.id)}>
                    🧹 Limpar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== ESTILO ===== */

const container = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "20px",
};

const cards = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
};

const card = {
  flex: 1,
  background: "#eee",
  padding: "15px",
  borderRadius: "8px",
  textAlign: "center",
};

const acoes = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
};

const btnMain = {
  flex: 1,
  background: "#ff3b3b",
  color: "#fff",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const btnBlue = {
  background: "#3498db",
  color: "#fff",
  padding: "6px",
  marginRight: "5px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const btnRed = {
  background: "#e74c3c",
  color: "#fff",
  padding: "6px",
  border: "none",
  borderRadius: "6px",
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