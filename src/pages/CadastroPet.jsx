import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

export default function CadastroPet() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [tutor1Nome, setTutor1Nome] = useState("");
  const [tutor1Telefone, setTutor1Telefone] = useState("");
  const [tutor2Nome, setTutor2Nome] = useState("");
  const [tutor2Telefone, setTutor2Telefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [salvando, setSalvando] = useState(false);

  function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function salvar() {
    if (salvando) return;

    setSalvando(true);

    const { data: check, error: checkError } = await supabase
      .from("tags")
      .select("locked")
      .eq("code", code)
      .single();

    if (checkError) {
      console.error("Erro ao verificar código:", checkError);
      alert("Erro ao verificar código: " + checkError.message);
      setSalvando(false);
      return;
    }

    if (check?.locked) {
      alert("Cadastro já bloqueado");
      setSalvando(false);
      return;
    }

    if (!name || !tutor1Telefone) {
      alert("Preencha os campos obrigatórios");
      setSalvando(false);
      return;
    }

    let foto_url = null;

    if (foto) {
      const fileName = `${code}_${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, foto);

      if (!uploadError) {
        const { data } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        foto_url = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from("tags")
      .update({
        name,
        tipo: "pet",
        tutor1_nome: tutor1Nome,
        tutor1_telefone: tutor1Telefone,
        tutor2_nome: tutor2Nome,
        tutor2_telefone: tutor2Telefone,
        observacoes,
        foto_url,
        locked: true
      })
      .eq("code", code);

    if (error) {
      console.error("Erro Supabase ao salvar pet:", error);
      alert("Erro ao salvar: " + (error.message || "erro desconhecido"));
      setSalvando(false);
      return;
    }

    navigate(`/pet/${code}`);
  }

  return (
    <Container>

      {/* HEADER */}
      <div style={header}>
        <h2>🐶 Cadastro do Pet</h2>
        <p style={subtitle}>Identificação • {code}</p>
      </div>

      {/* FOTO */}
      <div style={card}>
        <h3>📸 Foto</h3>

        <label style={fotoCircle}>
          {preview ? (
            <img src={preview} style={imgCircle} />
          ) : (
            <>
              <div style={{ fontSize: 28 }}>🐾</div>
              <span style={fotoTexto}>Enviar foto</span>
            </>
          )}
          <input type="file" onChange={handleFoto} hidden disabled={salvando} />
        </label>

        <input
          style={input}
          placeholder="Nome do pet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={salvando}
        />
      </div>

      {/* TUTORES */}
      <div style={card}>
        <h3>📞 Tutores</h3>

        <input
          style={input}
          placeholder="Nome do tutor principal"
          value={tutor1Nome}
          onChange={(e) => setTutor1Nome(e.target.value)}
          disabled={salvando}
        />

        <input
          style={input}
          placeholder="Telefone principal"
          value={tutor1Telefone}
          onChange={(e) => setTutor1Telefone(e.target.value)}
          disabled={salvando}
        />

        <input
          style={input}
          placeholder="Nome tutor 2 (opcional)"
          value={tutor2Nome}
          onChange={(e) => setTutor2Nome(e.target.value)}
          disabled={salvando}
        />

        <input
          style={input}
          placeholder="Telefone contato 2"
          value={tutor2Telefone}
          onChange={(e) => setTutor2Telefone(e.target.value)}
          disabled={salvando}
        />
      </div>

      {/* OBS */}
      <div style={card}>
        <h3>📝 Observações</h3>

        <textarea
          style={input}
          placeholder="Ex: dócil, idoso, precisa de cuidados..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          disabled={salvando}
        />
      </div>

      {/* ALERTA */}
      <div style={alerta}>
        ⚠️ Revise os dados antes de salvar.  
        Essas informações podem ser essenciais para encontrar seu pet.
      </div>

      {/* BOTÃO */}
      <button
        style={{
          ...botao,
          opacity: salvando ? 0.7 : 1,
          cursor: salvando ? "not-allowed" : "pointer"
        }}
        onClick={salvar}
        disabled={salvando}
      >
        {salvando ? "⏳ Salvando..." : "💾 Salvar Cadastro"}
      </button>

    </Container>
  );
}

/* ===== ESTILOS ===== */

const header = {
  textAlign: "center",
  marginBottom: 20
};

const subtitle = {
  fontSize: 12,
  color: "#777"
};

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 15,
  marginBottom: 15,
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
};

const fotoCircle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: "#ffeaea",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 10px auto",
  cursor: "pointer"
};

const fotoTexto = {
  color: "#ff3b3b",
  fontWeight: 600
};

const imgCircle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover"
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 14
};

const alerta = {
  background: "#fff5f5",
  border: "1px solid #ffb3b3",
  padding: 12,
  borderRadius: 10,
  fontSize: 13,
  marginBottom: 15,
  textAlign: "center"
};

const botao = {
  width: "100%",
  padding: 16,
  background: "#ff2d2d",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontSize: 16,
  fontWeight: "bold"
};