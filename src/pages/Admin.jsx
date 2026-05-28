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
        alert("Erro ao carregar códigos");
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
    localStorage.removeItem("kyd_admin_auth");
    window.location.href = "/login";
  }

  // 🔥 CORRIGIDO (pet + pessoa)
  function getStatus(t) {
    if (t.locked) return "Cadastrado";
    if (t.name || t.tutor1_nome) return "Vinculado";
    if (t.printed) return "Impresso";
    return "Disponível";
  }

  function getTelefone(t) {
    return t.tutor1_telefone || t.tutor2_telefone || "-";
  }

  // 🔥 CORRIGIDO
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

    await supabase
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

    fetchData();
  }

  async function baixarQR(tag) {
    const url = gerarUrlQR(tag.code);

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 1000,
      margin: 2,
    });

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QR_${tag.code}.png`;
    link.click();
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
      String(t.tutor1_nome || "").toLowerCase().includes(termo)
    );
  });

  return (
    <div style={page}>
      <div style={shell}>

        <header style={header}>
          <div>
            <h1 style={title}>Admin KYD LAB</h1>
          </div>

          <button onClick={sairAdmin} style={logoutButton}>
            Sair
          </button>
        </header>

        <div style={toolbar}>
          <button onClick={exportXLS} style={buttonDark}>
            📥 Exportar XLS
          </button>

          <button onClick={gerarA3} style={buttonRed}>
            📄 Gerar A3
          </button>
        </div>

        <input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Status</th>
                <th>Tipo</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>QR</th>
                <th>NFC</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((tag) => (
                <tr key={tag.code}>
                  <td>{tag.code}</td>
                  <td>{getStatus(tag)}</td>
                  <td>{tag.tipo || "-"}</td>
                  <td>{getNomePrincipal(tag)}</td>
                  <td>{getTelefone(tag)}</td>

                  <td>
                    <a href={gerarUrlQR(tag.code)} target="_blank">
                      Abrir
                    </a>
                  </td>

                  <td>
                    <a href={gerarUrlNFC(tag.code)} target="_blank">
                      Abrir
                    </a>
                  </td>

                  <td>
                    <button onClick={() => baixarQR(tag)}>⬇</button>
                    <button onClick={() => editar(tag)}>✏️</button>
                    <button onClick={() => limpar(tag)}>🧹</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* estilos mantidos simples */

const page = { padding: 20 };
const shell = { maxWidth: 1200, margin: "0 auto" };
const header = { display: "flex", justifyContent: "space-between" };
const title = { fontSize: 28 };
const logoutButton = { padding: 10 };

const toolbar = { margin: "20px 0" };

const buttonDark = { padding: 10, marginRight: 10 };
const buttonRed = { padding: 10 };

const searchInput = { width: "100%", padding: 10, marginBottom: 20 };

const table = { width: "100%", borderCollapse: "collapse" };