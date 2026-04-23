import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

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

    if (!data) {
      alert("Código inválido");
      window.location.href = "/";
      return;
    }

    if (!data.locked) {
      window.location.href = `/escolha/${code}`;
      return;
    }

    setData(data);
  }

  // 🔥 CALCULAR IDADE
  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;

    const hoje = new Date();
    const nasc = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }

    return idade;
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
          `Estou com essa pessoa!\nLocalização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        window.open(`https://wa.me/55${telefone}?text=${mensagem}`, "_blank");
      },
      () => {
        setLoadingLoc(false);
        alert("Permita a localização.");
      }
    );
  }

  if (!data) return <p style={{ textAlign: "center" }}>Carregando...</p>;

  return (
    <Container>

      {/* HEADER */}
      <div style={header}>
        <img
          src={data.foto_url || "https://via.placeholder.com/150"}
          style={foto}
        />

        <h2 style={nome}>Olá, meu nome é</h2>
        <h1 style={pessoaNome}>{data.name}</h1>

        {/* 🔥 IDADE */}
        {data.data_nascimento && (
          <p style={idadeStyle}>
            🎂 {calcularIdade(data.data_nascimento)} anos
          </p>
        )}

        <p style={frase}>🚨 Preciso de ajuda em uma emergência</p>
      </div>

      {/* 🚑 SAMU */}
      <a href="tel:192" style={btnSamu}>
        🚑 Emergência SAMU 192
      </a>

      {/* 🩸 TIPO SANGUÍNEO */}
      {data.tipo_sanguineo && (
        <div style={tipoBox}>
          🩸 Tipo sanguíneo: <strong>{data.tipo_sanguineo}</strong>
        </div>
      )}

      {/* CONTATO 1 */}
      <div style={card}>
        <p style={label}>CONTATO PRINCIPAL</p>
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

      {/* CONTATO 2 */}
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

      {/* SAÚDE */}
      {(data.comorbidades || data.alergias || data.medicamentos) && (
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
      )}

      {/* RODAPÉ */}
      <p style={rodape}>
        Este QR ajuda em situações de emergência.
        Use estas informações com responsabilidade 🙏
      </p>

    </Container>
  );
}

/* ===== ESTILOS ===== */

const header = {
  background: "#ff2d2d",
  padding: "25px 15px",
  borderRadius: "0 0 20px 20px",
  textAlign: "center",
  color: "#fff",
  marginBottom: 20
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
const pessoaNome = { margin: 0, fontSize: 26 };

const idadeStyle = {
  marginTop: 5,
  fontSize: 14,
  opacity: 0.9
};

const frase = { marginTop: 5 };

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
  marginTop: 10,
  flexWrap: "wrap"
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

const btnSamu = {
  display: "block",
  width: "100%",
  padding: 14,
  borderRadius: 12,
  textAlign: "center",
  background: "#d10000",
  color: "#fff",
  textDecoration: "none",
  fontWeight: "bold",
  marginBottom: 15
};

const rodape = {
  textAlign: "center",
  fontSize: 12,
  color: "#777",
  marginTop: 20,
  lineHeight: 1.4
};