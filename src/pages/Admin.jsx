import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { generateA3PDF } from "../utils/generateA3PDF";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

const BASE_URL = "https://app.kydlab.com.br";

export default function Admin() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .order("created_at", { ascending: false });

    setTags(data || []);
    setLoading(false);
  }

  // STATUS
  const getStatus = (t) => {
    if (t.locked) return "Cadastrado";
    if (t.name) return "Vinculado";
    return "Disponível";
  };

  // ✏️ EDITAR
  function editar(tag) {
    window.location.href = `/admin/edit/${tag.code}`;
  }

  // 🧹 LIMPAR (BLOQUEIO SIMPLES)
  async function limpar(tag) {
    if (!confirm("Deseja resetar este QR?")) return;

    const { error } = await supabase
      .from("tags")
      .update({
        locked: false,
        name: null,
        telefone: null,
        tutor1_nome: null,
        tutor1_telefone: null,
        tutor2_nome: null,
        tutor2_telefone: null,
        foto_url: null,
        tipo: null,
        tipo_sanguineo: null,
        comorbidades: null,
        alergias: null,
        medicamentos: null,
        observacoes: null
      })
      .eq("code", tag.code);

    if (error) {
      alert("Erro ao limpar");
      console.error(error);
      return;
    }

    fetchData();
  }

  // ⬇️ BAIXAR QR
  async function baixarQR(tag) {
    try {
      const url = `${BASE_URL}/qr/${tag.code}`;

      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 1000
      });

      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `QR_${tag.code}.png`;

      link.click();
    } catch (err) {
      alert("Erro ao gerar QR");
      console.error(err);
    }
  }

  // 📥 XLS
  function exportXLS() {
  const data = tags.map((t) => ({
    Código: t.code,
    NFC: `${BASE_URL}/nfc/${t.code}`, // 🔥 NOVO
    QR: `${BASE_URL}/qr/${t.code}`,   // (renomeei URL pra QR)
    Nome: t.name || "-",
    Telefone: t.telefone || "-",
    Status: getStatus(t),
    Criado: new Date(t.created_at).toLocaleString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tags");

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(new Blob([buffer]), "tags_kydlab.xlsx");
}

  // 🚀 GERAR A3
  async function gerarA3() {
    const qtd = 125;

    const novos = Array.from({ length: qtd }).map(() => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      locked: false,
      downloaded: false,
    }));

    const { error } = await supabase.from("tags").insert(novos);

    if (error) {
      alert("Erro ao gerar lote");
      return;
    }

    const { data } = await supabase
      .from("tags")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(qtd);

    await generateA3PDF(data);

    alert("PDF gerado!");
    fetchData();
  }

  // 🔍 FILTRO
  const filtered = tags.filter((t) =>
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>🛠️ Admin KYDLAB</h1>

      {/* BOTÕES */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={exportXLS}>📥 XLS</button>
        <button onClick={gerarA3}>📄 Gerar A3 (125 QR)</button>
      </div>

      {/* BUSCA */}
      <input
        placeholder="Buscar código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br /><br />

      {loading && <p>Carregando...</p>}

      {!loading && (
        <table border="1" cellPadding="10" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Status</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((tag) => (
              <tr key={tag.code}>
                <td>{tag.code}</td>
                <td>{getStatus(tag)}</td>
                <td>{tag.name || "-"}</td>
                <td>{tag.telefone || "-"}</td>

                <td>
                  <div style={{ display: "flex", gap: 5 }}>
                    
                    {/* ⬇️ QR DOWNLOAD */}
                    <button
                      style={{ background: "#555", color: "#fff" }}
                      onClick={() => baixarQR(tag)}
                    >
                      ⬇️ QR
                    </button>

                    {/* ✏️ EDITAR */}
                    <button
                      style={{ background: "#3498db", color: "#fff" }}
                      onClick={() => editar(tag)}
                    >
                      ✏️
                    </button>

                    {/* 🧹 LIMPAR */}
                    <button
                      style={{ background: "#e74c3c", color: "#fff" }}
                      onClick={() => limpar(tag)}
                    >
                      🧹
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}