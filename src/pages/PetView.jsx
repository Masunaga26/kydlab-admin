import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PetView() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    setData(data);
  }

  function enviarLocalizacao(telefone) {
    if (!navigator.geolocation) {
      alert("Seu dispositivo não suporta localização.");
      return;
    }

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const mensagem = encodeURIComponent(
          `Encontrei seu pet! 🐶\nEstou enviando minha localização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        const url = `https://wa.me/55${telefone}?text=${mensagem}`;

        window.open(url, "_blank");
      },
      () => {
        setLoadingLoc(false);
        alert("Permita a localização para enviar.");
      }
    );
  }

  if (!data) return <p style={{ textAlign: "center" }}>Carregando...</p>;

  return (
    <div style={page}>
      
      {/* HEADER */}
      <div style={header}>
        <img
          src={data.foto_url || "https://via.placeholder.com/150"}
          style={foto}
        />

        <h2 style={nome}>Oi, me chamo</h2>
        <h1 style={petNome}>{data.name}</h1>
        <p style={frase}>Estou perdido 😢 Me ajude a voltar pra casa!</p>
      </div>

      <div style={container}>

        {/* TUTOR 1 */}
        <div style={card}>
          <p style={label}>TUTOR 1</p>
          <h3>{data.tutor1_nome}</h3>

          <div style={botoes}>
            <a href={`tel:${data.tutor1_telefone}`} style={btnLigar}>
              📞 Ligar
            </a>

            <a
              href={`https://wa.me/55${data.tutor1_telefone}`}
              target="_blank"
              style={btnWhats}
            >
              💬 WhatsApp
            </a>
          </div>

          <button
            style={btnLocal}
            onClick={() => enviarLocalizacao(data.tutor1_telefone)}
          >
            {loadingLoc ? "Enviando..." : "📍 Enviar localização"}
          </button>
        </div>

        {/* TUTOR 2 */}
        {data.tutor2_telefone && (
          <div style={card}>
            <p style={label}>TUTOR 2</p>
            <h3>{data.tutor2_nome}</h3>

            <div style={botoes}>
              <a href={`tel:${data.tutor2_telefone}`} style={btnLigar}>
                📞 Ligar
              </a>

              <a
                href={`https://wa.me/55${data.tutor2_telefone}`}
                target="_blank"
                style={btnWhats}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* OBS */}
        {data.observacoes && (
          <div style={card}>
            <p style={label}>INFORMAÇÕES IMPORTANTES</p>
            <p>{data.observacoes}</p>
          </div>
        )}

        {/* DICA */}
        <p style={dica}>
          💡 Dica: envie sua localização pelo WhatsApp para o tutor.
        </p>

      </div>
    </div>
  );
}

/* ===== ESTILOS ===== */

const page = {
  background: "#f5f5f5",
  minHeight: "100vh",
  overflowX: "hidden"
};

const header = {
  background: "#ff2d2d",
  padding: 25,
  textAlign: "center",
  color: "#fff",
  width: "100%"
};

const foto = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #fff",
  marginBottom: 10,
  maxWidth: "100%"
};

const nome = { margin: 0, fontSize: 16 };
const petNome = { margin: 0, fontSize: 28 };
const frase = { marginTop: 5 };

const container = {
  maxWidth: 420,
  margin: "0 auto",
  padding: 15,
  width: "100%"
};

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 15,
  marginBottom: 15,
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
};

const label = {
  fontSize: 12,
  color: "#999",
  marginBottom: 5
};

const botoes = {
  display: "flex",
  gap: 10,
  marginTop: 10,
  width: "100%"
};

const btnLigar = {
  flex: 1,
  background: "#ff2d2d",
  color: "#fff",
  padding: 12,
  textAlign: "center",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: "600"
};

const btnWhats = {
  flex: 1,
  background: "#25D366",
  color: "#fff",
  padding: 12,
  textAlign: "center",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: "600"
};

const btnLocal = {
  marginTop: 10,
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  background: "#ff2d2d",
  color: "#fff",
  fontWeight: "bold"
};

const dica = {
  textAlign: "center",
  color: "#777",
  fontSize: 13
};