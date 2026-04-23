import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

export default function CadastroPessoa() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [dataNascimento, setDataNascimento] = useState(""); // 🔥 NOVO
  const [contato1Nome, setContato1Nome] = useState("");
  const [contato1Telefone, setContato1Telefone] = useState("");
  const [contato2Nome, setContato2Nome] = useState("");
  const [contato2Telefone, setContato2Telefone] = useState("");
  const [tipoSanguineo, setTipoSanguineo] = useState("");
  const [comorbidades, setComorbidades] = useState("");
  const [alergias, setAlergias] = useState("");
  const [medicamentos, setMedicamentos] = useState("");
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

    if (!name || !contato1Telefone) {
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
        data_nascimento: dataNascimento, // 🔥 NOVO
        tipo: "pessoa",
        telefone: contato1Telefone,
        tutor1_nome: contato1Nome,
        tutor1_telefone: contato1Telefone,
        tutor2_nome: contato2Nome,
        tutor2_telefone: contato2Telefone,
        tipo_sanguineo: tipoSanguineo,
        comorbidades,
        alergias,
        medicamentos,
        foto_url,
        locked: true
      })
      .eq("code", code);

    if (error) {
      alert("Erro ao salvar");
      return;
    }

    navigate(`/pessoa/${code}`);
  }

  return (
    <Container>

      {/* HEADER */}
      <div style={header}>
        <h2>👤 Cadastro de Pessoa</h2>
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
              <div style={{ fontSize: 28 }}>👤</div>
              <span style={fotoTexto}>Enviar foto</span>
            </>
          )}
          <input type="file" onChange={handleFoto} hidden />
        </label>

        <input
          style={input}
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* 🔥 DATA DE NASCIMENTO */}
        <input
          type="date"
          style={input}
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />
      </div>

      {/* SAÚDE */}
      <div style={card}>
        <h3>🩸 Saúde</h3>

        <select style={input} value={tipoSanguineo} onChange={(e) => setTipoSanguineo(e.target.value)}>
          <option value="">Tipo sanguíneo</option>
          <option>O+</option><option>O-</option>
          <option>A+</option><option>A-</option>
          <option>B+</option><option>B-</option>
          <option>AB+</option><option>AB-</option>
        </select>

        <textarea style={input} placeholder="Comorbidades" value={comorbidades} onChange={(e) => setComorbidades(e.target.value)} />
        <textarea style={input} placeholder="Alergias" value={alergias} onChange={(e) => setAlergias(e.target.value)} />
        <textarea style={input} placeholder="Medicamentos" value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} />
      </div>

      {/* CONTATOS */}
      <div style={card}>
        <h3>📞 Contatos</h3>

        <input style={input} placeholder="Nome do contato principal" value={contato1Nome} onChange={(e) => setContato1Nome(e.target.value)} />
        <input style={input} placeholder="Telefone principal" value={contato1Telefone} onChange={(e) => setContato1Telefone(e.target.value)} />

        <input style={input} placeholder="Nome contato 2 (opcional)" value={contato2Nome} onChange={(e) => setContato2Nome(e.target.value)} />
        <input style={input} placeholder="Telefone contato 2" value={contato2Telefone} onChange={(e) => setContato2Telefone(e.target.value)} />
      </div>

      {/* ALERTA */}
      <div style={alerta}>
        ⚠️ Revise os dados antes de salvar.  
        Essas informações serão usadas em emergências.
      </div>

      {/* BOTÃO */}
      <button style={botao} onClick={salvar}>
        💾 Salvar Cadastro
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