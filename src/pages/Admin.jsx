import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

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
    if (t.locked) return "Bloqueado";
    if (t.name) return "Vinculado";
    return "Disponível";
  };

  // 🔒 BLOQUEAR
  const toggleLock = async (tag) => {
    const { error } = await supabase
      .from("tags")
      .update({ locked: !tag.locked })
      .eq("id", tag.id);

    if (error) return alert("Erro");

    fetchData();
  };

  // ✏️ EDITAR
  const editar = async (tag) => {
    if (tag.locked) return alert("Desbloqueie primeiro");

    const nome = prompt("Nome:", tag.name || "");
    if (nome === null) return;

    const telefone = prompt("Telefone:", tag.telefone || "");

    const { error } = await supabase
      .from("tags")
      .update({
        name: nome || null,
        telefone: telefone || null,
      })
      .eq("id", tag.id);

    if (error) return alert("Erro");

    fetchData();
  };

  // 🧹 LIMPAR
  const limpar = async (tag) => {
    if (!confirm("Limpar?")) return;

    const { error } = await supabase
      .from("tags")
      .update({
        name: null,
        telefone: null,
        tipo: null,
        locked: false,
      })
      .eq("id", tag.id);

    if (error) return alert("Erro");

    fetchData();
  };

  // 📥 XLS
  const exportXLS = () => {
   const data = tags.map((t) => ({
  Código: t.code,
  NFC_URL: `https://kydlab.com.br/nfc/${t.code}`,
      Nome: t.name || "-",
      Telefone: t.telefone || "-",
      Status: getStatus(t),
      Baixado: t.downloaded ? "Sim" : "Não",
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
  };

  // 📱 QR
  const gerarQR = async (code) => {
    const url = `https://kydlab.com.br/qr/${code}`;

    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, url);

    const link = document.createElement("a");
    link.download = `${code}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // 🚀 GERAR LOTE
  const gerarLote = async () => {
    const loteId = Date.now();

    const novos = Array.from({ length: 125 }).map(() => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      lote: loteId,
      printed: false,
      downloaded: false,
      locked: false,
    }));

    const { error } = await supabase.from("tags").insert(novos);

    if (error) return alert("Erro ao gerar lote");

    alert("Lote criado!");
    fetchData();
  };

  // 📥 BAIXAR
  const baixarArquivos = async () => {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("downloaded", false)
      .limit(125);

    if (!data.length) return alert("Nada para baixar");

    for (const tag of data) {
      await gerarQR(tag.code);
    }

    const ids = data.map((t) => t.id);

    await supabase
      .from("tags")
      .update({
        downloaded: true,
        downloaded_at: new Date(),
      })
      .in("id", ids);

    alert("Download feito!");
    fetchData();
  };

  const filtered = tags.filter((t) =>
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>🛠️ Admin KYDLAB</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={exportXLS}>📥 XLS</button>
        <button onClick={gerarLote}>➕ Gerar QR</button>
        <button onClick={baixarArquivos}>⬇️ Baixar</button>
      </div>

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
              <th>Baixado</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.code}</td>
                <td>{getStatus(tag)}</td>
                <td>{tag.name || "-"}</td>
                <td>{tag.telefone || "-"}</td>
                <td>{tag.downloaded ? "✔" : "-"}</td>

                <td style={{ display: "flex", gap: 5 }}>
                  <button onClick={() => gerarQR(tag.code)}>QR</button>
                  <button onClick={() => toggleLock(tag)}>
                    {tag.locked ? "🔓" : "🔒"}
                  </button>
                  <button onClick={() => editar(tag)}>✏️</button>
                  <button onClick={() => limpar(tag)}>🧹</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}