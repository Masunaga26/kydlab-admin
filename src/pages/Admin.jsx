import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { generateA3PDF } from "../utils/generateA3PDF";
import * as XLSX from "xlsx";
import QRCode from "qrcode";

const BASE_URL = "https://app.kydlab.com.br";
const QTD_QR_A3 = 125;

export default function Admin() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gerandoA3, setGerandoA3] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    let allData = [];
    let from = 0;
    let to = 999;

    while (true) {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Erro ao carregar códigos:", error);
        alert("Erro ao carregar códigos: " + (error.message || "erro desconhecido"));
        setLoading(false);
        return;
      }

      allData = [...allData, ...(data || [])];

      if (!data || data.length < 1000) break;

      from += 1000;
      to += 1000;
    }

    setTags(allData);
    setLoading(false);
  }

  async function sairAdmin() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function getStatus(t) {
    if (t.locked) return "Cadastrado";
    if (t.name || t.tutor1_nome) return "Vinculado";
    if (t.printed) return "Impresso";
    return "Disponível";
  }

  function getTelefone(t) {
    return t.tutor1_telefone || t.tutor2_telefone || "-";
  }

  function getNomePrincipal(t) {
    return t.name || t.tutor1_nome || t.tutor2_nome || "-";
  }

  function gerarUrlQR(code) {
    return `${BASE_URL}/qr/${code}`;
  }

  function gerarUrlNFC(code) {
    return `${BASE_URL}/nfc/${code}`;
  }

  function editar(tag) {
    window.location.href = `/admin/edit/${tag.code}`;
  }

  async function limpar(tag) {
    if (!confirm(`Limpar código ${tag.code}?`)) return;

    const { error } = await supabase
      .from("tags")
      .update({
        locked: false,
        name: null,
        tipo: null,
        tutor1_nome: null,
        tutor1_telefone: null,
        tutor2_nome: null,
        tutor2_telefone: null,
        foto_url: null,
        data_nascimento: null,
        tipo_sanguineo: null,
        comorbidades: null,
        alergias: null,
        medicamentos: null,
        observacoes: null,
      })
      .eq("code", tag.code);

    if (error) {
      console.error("Erro ao limpar código:", error);
      alert("Erro ao limpar código: " + (error.message || "erro desconhecido"));
      return;
    }

    fetchData();
  }

  async function baixarQR(tag) {
    try {
      const url = gerarUrlQR(tag.code);

      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 1000,
        margin: 2,
      });

      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `QR_${tag.code}.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao baixar QR:", error);
      alert("Erro ao baixar QR.");
    }
  }

  async function gerarA3() {
    try {
      if (!filtered.length) {
        alert("Nenhum código disponível para gerar o A3.");
        return;
      }

      setGerandoA3(true);

      const lista = filtered.slice(0, QTD_QR_A3);

      await generateA3PDF(lista);
    } catch (error) {
      console.error("Erro ao gerar A3:", error);
      alert("Erro ao gerar A3.");
    } finally {
      setGerandoA3(false);
    }
  }

  function exportXLS() {
    const dados = tags.map((t) => ({
      Código: t.code,
      Status: getStatus(t),
      Tipo: t.tipo || "-",
      Nome: getNomePrincipal(t),
      Telefone: getTelefone(t),
      "Contato 1": t.tutor1_nome || "-",
      "Telefone 1": t.tutor1_telefone || "-",
      "Contato 2": t.tutor2_nome || "-",
      "Telefone 2": t.tutor2_telefone || "-",
      Observações: t.observacoes || "-",
      "URL QR": gerarUrlQR(t.code),
      "URL NFC": gerarUrlNFC(t.code),
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Tags");
    XLSX.writeFile(wb, "tags_kydlab.xlsx");
  }

  const filtered = tags.filter((t) => {
    const termo = search.toLowerCase();

    return (
      String(t.code || "").toLowerCase().includes(termo) ||
      String(t.name || "").toLowerCase().includes(termo) ||
      String(t.tutor1_nome || "").toLowerCase().includes(termo) ||
      String(t.tutor2_nome || "").toLowerCase().includes(termo) ||
      String(t.tipo || "").toLowerCase().includes(termo)
    );
  });

  return (
    <div style={page}>
      <div style={shell}>
        <header style={header}>
          <div>
            <h1 style={title}>Admin KYD LAB</h1>
            <p style={subtitle}>Gerenciamento de QR Codes, NFCs e cadastros.</p>
          </div>

          <button onClick={sairAdmin} style={logoutButton}>
            Sair
          </button>
        </header>

        <div style={toolbar}>
          <button onClick={exportXLS} style={buttonDark}>
            📥 Exportar XLS
          </button>

          <button onClick={gerarA3} style={buttonRed} disabled={gerandoA3}>
            {gerandoA3 ? "Gerando A3..." : "📄 Gerar A3"}
          </button>

          <button onClick={fetchData} style={buttonLight}>
            🔄 Atualizar
          </button>
        </div>

        <input
          placeholder="Buscar por código, nome, tutor ou tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />

        <div style={summary}>
          <strong>{filtered.length}</strong> códigos encontrados
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div style={tableWrap}>
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
                {filtered.map((tag) => (
                  <tr key={tag.code}>
                    <td style={td}>{tag.code}</td>
                    <td style={td}>{getStatus(tag)}</td>
                    <td style={td}>{tag.tipo || "-"}</td>
                    <td style={td}>{getNomePrincipal(tag)}</td>
                    <td style={td}>{getTelefone(tag)}</td>

                    <td style={td}>
                      <a href={gerarUrlQR(tag.code)} target="_blank" rel="noreferrer">
                        Abrir
                      </a>
                    </td>

                    <td style={td}>
                      <a href={gerarUrlNFC(tag.code)} target="_blank" rel="noreferrer">
                        Abrir
                      </a>
                    </td>

                    <td style={tdActions}>
                      <button style={miniButton} onClick={() => baixarQR(tag)}>
                        ⬇
                      </button>

                      <button style={miniButton} onClick={() => editar(tag)}>
                        ✏️
                      </button>

                      <button style={miniButton} onClick={() => limpar(tag)}>
                        🧹
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* estilos */

const page = {
  minHeight: "100vh",
  background: "#f5f5f5",
  padding: 20,
  fontFamily: "Inter, Arial, sans-serif",
};

const shell = {
  maxWidth: 1200,
  margin: "0 auto",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#ff1c1c",
  color: "#fff",
  padding: 24,
  borderRadius: 20,
  marginBottom: 20,
};

const title = {
  fontSize: 28,
  margin: 0,
};

const subtitle = {
  margin: "6px 0 0",
  opacity: 0.9,
};

const logoutButton = {
  padding: "10px 16px",
  border: "none",
  borderRadius: 10,
  background: "#fff",
  color: "#ff1c1c",
  fontWeight: 700,
  cursor: "pointer",
};

const toolbar = {
  display: "flex",
  gap: 10,
  margin: "20px 0",
  flexWrap: "wrap",
};

const buttonDark = {
  padding: "12px 16px",
  border: "none",
  borderRadius: 10,
  background: "#222",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const buttonRed = {
  padding: "12px 16px",
  border: "none",
  borderRadius: 10,
  background: "#ff1c1c",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const buttonLight = {
  padding: "12px 16px",
  border: "1px solid #ddd",
  borderRadius: 10,
  background: "#fff",
  color: "#111",
  fontWeight: 700,
  cursor: "pointer",
};

const searchInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: 14,
  marginBottom: 12,
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 15,
};

const summary = {
  marginBottom: 14,
  color: "#555",
};

const tableWrap = {
  overflowX: "auto",
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 900,
};

const th = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #eee",
  background: "#fafafa",
  fontSize: 13,
};

const td = {
  padding: 12,
  borderBottom: "1px solid #eee",
  fontSize: 14,
};

const tdActions = {
  padding: 12,
  borderBottom: "1px solid #eee",
  display: "flex",
  gap: 6,
};

const miniButton = {
  border: "1px solid #ddd",
  background: "#fff",
  borderRadius: 8,
  padding: "6px 8px",
  cursor: "pointer",
};