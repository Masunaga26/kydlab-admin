import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

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

  function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function salvar() {
    const { data: check } = await supabase
      .from("tags")
      .select("locked")
      .eq("code", code)
      .single();

    if (check?.locked) {
      alert("Cadastro já bloqueado");
      return;
    }

    if (!name || !tutor1Telefone) {
      alert("Preencha os campos obrigatórios");
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
        telefone: tutor1Telefone,
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
      alert("Erro ao salvar");
      return;
    }

    navigate(`/view/pet/${code}`);
  }

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={header}>
        <div style={headerContent}>
          <div style={avatar}>🐶</div>
          <div>
            <h2 style={title}>Cadastro do Pet</h2>
            <p style={subtitle}>Identificação • {code}</p>
          </div>
        </div>
      </div>

      <div style={container}>

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
                <small>JPG ou PNG, máx 5MB</small>
              </>
            )}
            <input type="file" onChange={handleFoto} hidden />
          </label>

          <input
            style={input}
            placeholder="Nome do pet"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* TUTORES */}
        <div style={card}>
          <h3>📞 Tutores</h3>

          <input
            style={input}
            placeholder="Nome do tutor 1"
            value={tutor1Nome}
            onChange={(e) => setTutor1Nome(e.target.value)}
          />

          <input
            style={input}
            placeholder="Telefone contato 1"
            value={tutor1Telefone}
            onChange={(e) => setTutor1Telefone(e.target.value)}
          />

          <input
            style={input}
            placeholder="Nome do tutor 2 (opcional)"
            value={tutor2Nome}
            onChange={(e) => setTutor2Nome(e.target.value)}
          />

          <input
            style={input}
            placeholder="Telefone contato 2"
            value={tutor2Telefone}
            onChange={(e) => setTutor2Telefone(e.target.value)}
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
          />
        </div>

        {/* ALERTA */}
        <div style={alerta}>
          <strong>⚠️ ATENÇÃO</strong>
          <p>Revise cuidadosamente os dados antes de salvar.</p>
          <p>Por segurança, não será possível editar depois.</p>
          <p>Essas informações podem ser essenciais para seu pet voltar para casa.</p>
        </div>

        <button style={botao} onClick={salvar}>
          💾 Salvar Cadastro
        </button>

      </div>
    </div>
  );
}

/* ===== ESTILOS ===== */

const header = {
  background: "#ff2d2d",
  padding: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20
};

const headerContent = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const avatar = {
  background: "#fff",
  borderRadius: "50%",
  width: 45,
  height: 45,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22
};

const title = { margin: 0, color: "#fff" };
const subtitle = { margin: 0, color: "#ffdede", fontSize: 12 };

const container = {
  maxWidth: 420,
  margin: "0 auto",
  padding: 15
};

const card = {
  background: "#fff",
  padding: 18,
  borderRadius: 18,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  marginBottom: 18,
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const fotoCircle = {
  width: 130,
  height: 130,
  borderRadius: "50%",
  background: "#ffeaea",
  border: "2px dashed #ffb3b3",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 10px auto",
  cursor: "pointer",
  textAlign: "center"
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
  fontSize: 14,
  outline: "none"
};

const alerta = {
  border: "2px solid #ff2d2d",
  background: "#fff5f5",
  padding: 16,
  borderRadius: 14,
  marginBottom: 20,
  fontSize: 14
};

const botao = {
  width: "100%",
  padding: 16,
  background: "#ff2d2d",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontSize: 16,
  fontWeight: "bold",
  boxShadow: "0 4px 12px rgba(255,45,45,0.4)",
  cursor: "pointer"
};