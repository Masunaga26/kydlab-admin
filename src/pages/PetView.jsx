import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function PetView() {
  const [data, setData] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const code = window.location.pathname.split("/").pop();

  useEffect(() => {
    buscar();
  }, []);

  async function buscar() {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    setData(data);
  }

  function telefoneValido(tel) {
    return tel && tel.length >= 10;
  }

  function mensagemBase() {
    return encodeURIComponent(
      `Encontrei ${data?.nome || "este pet"} em uma emergência.\n\nPor favor entre em contato urgente.`
    );
  }

  // 🔥 FUNÇÃO CORRIGIDA (IOS + ANDROID)
  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) {
      alert("Telefone não disponível.");
      return;
    }

    // 🔥 ALERT CURTO (UX MELHORADA)
    alert("Vamos usar sua localização para ajudar no resgate");

    if (!navigator.geolocation) {
      window.open(
        `https://wa.me/55${telefone}?text=${mensagemBase()}`,
        "_blank"
      );
      return;
    }

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const mensagem = encodeURIComponent(
          `Encontrei ${data?.nome || "este pet"} em uma emergência.\n\n📍 Minha localização:\nhttps://www.google.com/maps?q=${latitude},${longitude}\n\nPor favor entre em contato urgente.`
        );

        window.open(
          `https://wa.me/55${telefone}?text=${mensagem}`,
          "_blank"
        );
      },
      () => {
        setLoadingLoc(false);

        window.open(
          `https://wa.me/55${telefone}?text=${mensagemBase()}`,
          "_blank"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  if (!data) return <div>Carregando...</div>;

  return (
    <div style={container}>
      <h1>{data.nome}</h1>

      <p><b>Telefone:</b> {data.telefone}</p>
      <p><b>Observações:</b> {data.observacoes}</p>

      <div style={acoes}>
        <button
          style={btn}
          onClick={() => enviarLocalizacao(data.telefone)}
        >
          {loadingLoc ? "Obtendo localização..." : "📍 Enviar localização"}
        </button>

        <a
          href={`tel:${data.telefone}`}
          style={btnLink}
        >
          📞 Ligar
        </a>

        <a
          href={`https://wa.me/55${data.telefone}?text=${mensagemBase()}`}
          target="_blank"
          style={btnLink}
        >
          💬 WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ===== ESTILO ===== */

const container = {
  padding: "20px",
  textAlign: "center",
};

const acoes = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "20px",
};

const btn = {
  background: "#ff3b3b",
  color: "#fff",
  padding: "15px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};

const btnLink = {
  display: "block",
  background: "#333",
  color: "#fff",
  padding: "15px",
  borderRadius: "10px",
  textDecoration: "none",
};