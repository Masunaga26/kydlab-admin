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

  // STATUS
  function getStatus(t) {
    if (t.locked) return "Cadastrado";
    if (t.tutor1_nome) return "Vinculado";
    if (t.printed) return "Impresso";
    return "Disponível";
  }

  function getNome(t) {
    return t.tutor1_nome || "-";
  }

  function getTelefone(t) {
    return t.tutor1_telefone || t.tutor2_telefone || "-";
  }

  function gerarUrlQR(code) {
    return `https://app.kydlab.com.br/qr/${code}`;
  }

  function gerarUrlNFC(code) {
    return `https://app.kydlab.com.br/nfc/${code}`;
  }

  // 🔥 EXPORTAR XLS REAL
  function exportarXLS() {
    const dataExport = tags.map((t) => ({
      Código: t.code,
      Status: getStatus(t),
      Tipo: t.tipo,
      Nome: t.tutor1_nome,
      Telefone: t.tutor1_telefone,
      Contato2_Nome: t.tutor2_nome,
      Contato2_Telefone: t.tutor2_telefone,
      Observações: t.observacoes,
      URL_QR: gerarUrlQR(t.code),
      URL_NFC: gerarUrlNFC(t.code),
      Criado_em: t.created_at,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tags");

    XLSX.writeFile(workbook, "kydlab_tags.xlsx");
  }

  // 🔥 BAIXAR QR
  function baixarQR(code) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${gerarUrlQR(
      code
    )}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = `${code}.png`;
    link.click();
  }

  // LIMPAR
  async function limparTag(id) {
    const confirmar = confirm("Deseja limpar esse cadastro?");
    if (!confirmar) return;

    await supabase
      .from("tags")
      .update({
        tutor1_nome: null,
        tutor1_telefone: null,
        tutor2_nome: null,
        tutor2_telefone: null,
        observacoes: null,
        locked: false,
      })
      .eq("id", id);

    carregarTags();
  }

  // CONTADORES
  const total = tags.length;
  const cadastrados = tags.filter((t) => t.locked).length;
  const disponiveis = tags.filter((t) => !t.locked).length;
  const impressos = tags.filter((t) => t.printed).length;

  const filtrados = tags.filter((tag) =>
    (tag.code || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={container}>
      <h1>🛠 Admin KYDLAB</h1>

      {/* DASHBOARD */}
      <div style={dashboard}>
        <Card titulo="Total" valor={total} />
        <Card titulo="Cadastrados" valor={cadastrados} />
        <Card titulo="Disponíveis" valor={disponiveis} />
        <Card titulo="Impressos" valor={impressos} />
      </div>

      {/* AÇÕES */}
      <div style={acoes}>
        <button style={btnMain} onClick={exportarXLS}>
          📄 Exportar XLS
        </button>

        <button style={btnA3}>
          🧾 Gerar A3 (125 QR)
        </button>
      </div>

      <input
        placeholder="Buscar código..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={input}
      />

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
          {filtrados.map((t) => (
            <tr key={t.id}>
              <td style={td}>{t.code}</td>
              <td style={td}>{getStatus(t)}</td>
              <td style={td}>{t.tipo || "-"}</td>
              <td style={td}>{getNome(t)}</td>
              <td style={td}>{getTelefone(t)}</td>

              <td style={td}>
                <a href={gerarUrlQR(t.code)} target="_blank">
                  Abrir
                </a>
              </td>

              <td style={td}>
                <a href={gerarUrlNFC(t.code)} target="_blank">
                  Abrir
                </a>
              </td>

              <td style={td}>
                <button style={btnQR} onClick={() => baixarQR(t.code)}>
                  ⬇ QR
                </button>

                <button style={btnDelete} onClick={() => limparTag(t.id)}>
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* COMPONENTES */

function Card({ titulo, valor }) {
  return (
    <div style={cardDash}>
      <h4>{titulo}</h4>
      <h2>{valor}</h2>
    </div>
  );
}

/* ESTILOS */

const container = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "20px",
};

const dashboard = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
};

const cardDash = {
  flex: 1,
  background: "#f5f5f5",
  padding: "15px",
  borderRadius: "10px",
  textAlign: "center",
};

const acoes = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
};

const btnMain = {
  background: "#ff3b3b",
  color: "#fff",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
};

const btnA3 = {
  background: "#000",
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
};

const btnQR = {
  marginRight: "5px",
  background: "#444",
  color: "#fff",
  border: "none",
  padding: "6px",
  borderRadius: "6px",
};

const btnDelete = {
  background: "#e74c3c",
  color: "#fff",
  border: "none",
  padding: "6px",
  borderRadius: "6px",
};