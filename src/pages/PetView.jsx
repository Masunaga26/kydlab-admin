import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PetView() {
  const { code } = useParams();
  const [tag, setTag] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    setTag(data);
  }

  function enviarLocalizacao() {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada");
      return;
    }

    if (!confirm("Vamos usar sua localização para ajudar no resgate")) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const link = `https://maps.google.com/?q=${lat},${lng}`;
      const texto = `Estou com ${tag?.nome || "um pet"} em uma emergência.\nLocalização: ${link}`;

      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
    });
  }

  if (!tag) return null;

  return (
    <div style={container}>
      <div style={content}>

        {/* HEADER */}
        <div style={header}>
          <div style={avatar}></div>
          <p style={sub}>Oi, me chamo</p>
          <h1 style={title}>{tag.nome || "PET"}</h1>
          <p style={msg}>Me ajuda voltar pra casa!</p>
        </div>

        {/* TUTOR 1 */}
        <div style={card}>
          <span style={label}>Tutor 1</span>
          <h3>{tag.tutor1_nome}</h3>

          <div style={row}>
            <a href={`tel:${tag.tutor1_telefone}`} style={btnCall}>📞 Ligar Agora</a>
            <a href={`https://wa.me/55${tag.tutor1_telefone}`} style={btnWhats}>💬 WhatsApp</a>
          </div>

          <button style={btnLocation} onClick={enviarLocalizacao}>
            📍 Enviar localização
          </button>
        </div>

        {/* TUTOR 2 */}
        {tag.tutor2_nome && (
          <div style={card}>
            <span style={label}>Tutor 2</span>
            <h3>{tag.tutor2_nome}</h3>

            <div style={row}>
              <a href={`tel:${tag.tutor2_telefone}`} style={btnCall}>📞 Ligar Agora</a>
              <a href={`https://wa.me/55${tag.tutor2_telefone}`} style={btnWhats}>💬 WhatsApp</a>
            </div>
          </div>
        )}

        {/* OBS */}
        {tag.observacoes && (
          <div style={card}>
            <span style={label}>Observações</span>
            <p>{tag.observacoes}</p>
          </div>
        )}

      </div>
    </div>
  );
}

/* 🎨 ESTILO PREMIUM */

const container = {
  background: "#f1f1f1",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  padding: "20px"
};

const content = {
  width: "100%",
  maxWidth: "380px"
};

const header = {
  background: "#ef1c1c",
  borderRadius: "30px",
  padding: "30px 20px",
  textAlign: "center",
  color: "#fff",
  marginBottom: "20px"
};

const avatar = {
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  background: "#ffffff33",
  margin: "0 auto 15px"
};

const sub = { opacity: 0.8 };
const title = { fontSize: "28px", margin: "5px 0" };
const msg = { fontSize: "14px", opacity: 0.9 };

const card = {
  background: "#fff",
  borderRadius: "18px",
  padding: "18px",
  marginBottom: "15px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
};

const label = {
  fontSize: "12px",
  color: "#888"
};

const row = {
  display: "flex",
  gap: "10px",
  marginTop: "10px"
};

const btnCall = {
  flex: 1,
  background: "#000",
  color: "#fff",
  padding: "12px",
  borderRadius: "10px",
  textAlign: "center",
  textDecoration: "none"
};

const btnWhats = {
  flex: 1,
  background: "#25D366",
  color: "#fff",
  padding: "12px",
  borderRadius: "10px",
  textAlign: "center",
  textDecoration: "none"
};

const btnLocation = {
  width: "100%",
  marginTop: "10px",
  background: "#ef1c1c",
  color: "#fff",
  padding: "14px",
  borderRadius: "12px",
  border: "none"
};