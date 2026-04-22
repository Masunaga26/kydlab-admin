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
          `Estou com seu pet!\nLocalização: https://maps.google.com/?q=${latitude},${longitude}`
        );

        const url = `https://wa.me/55${telefone}?text=${mensagem}`;

        window.open(url, "_blank");
      },
      (erro) => {
        setLoadingLoc(false);

        if (erro.code === 1) {
          alert("Você precisa permitir a localização.");
        } else if (erro.code === 2) {
          alert("Não foi possível obter sua localização.");
        } else {
          alert("Erro ao acessar localização.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  if (!data) return <p>Carregando...</p>;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={header}>
        <img
          src={data.foto_url || "https://via.placeholder.com/150"}
          style={foto}
        />

        <h2 style={nome}>Oi, me chamo</h2>
        <h1 style={petNome}>{data.name}</h1>
        <p style={frase}>Me ajuda voltar pra casa!</p>
      </div>

      <div style={container}>

        {/* TUTOR 1 */}
        <div style={card}>
          <p style={label}>TUTOR 1</p>
          <h3>{data.tutor1_nome}</h3>

          <div style={botoes}>
            <a href={`tel:${data.tutor1_telefone}`} style={btnLigar}>
              📞 Ligar Agora
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
                📞 Ligar Agora
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
          💡 No WhatsApp do tutor, envie uma localização.
        </p>

      </div>
    </div>
  );
}

/* ===== ESTILOS ===== */

const header = {
  background: "#ff2d2d",
  padding: 30,
  textAlign: "center",
  color: "#fff"
};

const foto = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #fff",
  marginBottom: 10
};

const nome = { margin: 0, fontSize: 16 };
const petNome = { margin: 0, fontSize: 28 };
const frase = { marginTop: 5 };

const container = {
  maxWidth: 420,
  margin: "0 auto",
  padding: 15
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
  marginTop: 10
};

const btnLigar = {
  flex: 1,
  background: "#ff2d2d",
  color: "#fff",
  padding: 10,
  textAlign: "center",
  borderRadius: 10,
  textDecoration: "none"
};

const btnWhats = {
  flex: 1,
  border: "2px solid #25D366",
  color: "#25D366",
  padding: 10,
  textAlign: "center",
  borderRadius: 10,
  textDecoration: "none"
};

const btnLocal = {
  marginTop: 10,
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#ff2d2d",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const dica = {
  textAlign: "center",
  color: "#777",
  fontSize: 13
};