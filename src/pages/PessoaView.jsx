import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PessoaView() {
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
          `Estou com essa pessoa!\nLocalização: https://maps.google.com/?q=${latitude},${longitude}`
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
        <h1 style={pessoaNome}>{data.name}</h1>
        <p style={frase}>Me ajude em uma emergência</p>
      </div>

      <div style={container}>

        {/* 🚑 SAMU PRIMEIRO */}
        <a href="tel:192" style={btnSamu}>
          🚑 Chamar SAMU 192
        </a>

        {/* 🩸 TIPO SANGUÍNEO */}
        {data.tipo_sanguineo && (
          <div style={tipoBox}>
            🩸 Tipo sanguíneo: <strong>{data.tipo_sanguineo}</strong>
          </div>
        )}

        {/* 👤 CONTATO 1 */}
        <div style={card}>
          <p style={label}>CONTATO 1</p>
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

        {/* 👤 CONTATO 2 */}
        {data.tutor2_telefone && (
          <div style={card}>
            <p style={label}>CONTATO 2</p>
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

        {/* 🩺 SAÚDE */}
        <div style={card}>
          <h3>🩺 Informações de saúde</h3>

          {data.comorbidades && (
            <p><strong>Comorbidades:</strong> {data.comorbidades}</p>
          )}

          {data.alergias && (
            <p><strong>Alergias:</strong> {data.alergias}</p>
          )}

          {data.medicamentos && (
            <p><strong>Medicamentos:</strong> {data.medicamentos}</p>
          )}
        </div>

      </div>
    </div>
  );
}

/* ===== ESTILO ===== */

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
const pessoaNome = { margin: 0, fontSize: 28 };
const frase = { marginTop: 5 };

const container = {
  maxWidth: 420,
  margin: "0 auto",
  padding: 15
};

const tipoBox = {
  background: "#ffeaea",
  padding: 12,
  borderRadius: 10,
  marginBottom: 15,
  textAlign: "center",
  fontWeight: "bold",
  color: "#d10000"
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
  fontWeight: "bold"
};

const btnSamu = {
  display: "block",
  width: "100%",
  padding: 14,
  borderRadius: 12,
  textAlign: "center",
  background: "#ff2d2d",
  color: "#fff",
  textDecoration: "none",
  fontWeight: "bold",
  marginBottom: 15
};