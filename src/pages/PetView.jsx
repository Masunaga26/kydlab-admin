import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PetView() {
  const { code } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    buscar();
  }, []);

  async function buscar() {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (!error) setData(data);
  }

  // 🔥 LOCALIZAÇÃO FUNCIONANDO IOS + ANDROID
  function enviarLocalizacao() {
    alert("Vamos usar sua localização para ajudar no resgate");

    if (!navigator.geolocation) {
      alert("Localização não suportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const link = `https://maps.google.com/?q=${lat},${lng}`;

        const mensagem = `Estou com ${nomePet} em uma emergência.\nLocalização: ${link}`;

        if (telefone1) {
          window.location.href = `https://wa.me/${telefone1}?text=${encodeURIComponent(
            mensagem
          )}`;
        } else {
          alert("Telefone não disponível");
        }
      },
      () => {
        alert("Não foi possível obter localização");
      }
    );
  }

  if (!data) return <div>Carregando...</div>;

  // 🔥 MAPEAMENTO CORRETO DO BANCO
  const nomePet = data.pet_nome || data.nome || "PET";

  const tutor1 = data.tutor1_nome || "";
  const telefone1 = data.tutor1_telefone || "";

  const tutor2 = data.tutor2_nome || "";
  const telefone2 = data.tutor2_telefone || "";

  const obs = data.observacoes || "";

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <h2>Oi, me chamo</h2>
        <h1>{nomePet}</h1>
      </div>

      {/* TUTOR 1 */}
      {telefone1 && (
        <div style={card}>
          <p style={label}>Tutor principal</p>
          <h3>{tutor1}</h3>

          <div style={row}>
            <a href={`tel:${telefone1}`} style={btnCall}>
              📞 Ligar
            </a>

            <a
              href={`https://wa.me/${telefone1}`}
              target="_blank"
              style={btnZap}
            >
              💬 WhatsApp
            </a>
          </div>

          <button style={btnLocal} onClick={enviarLocalizacao}>
            📍 Enviar localização
          </button>
        </div>
      )}

      {/* TUTOR 2 */}
      {telefone2 && (
        <div style={card}>
          <p style={label}>Contato alternativo</p>
          <h3>{tutor2}</h3>

          <div style={row}>
            <a href={`tel:${telefone2}`} style={btnCall}>
              📞 Ligar
            </a>

            <a
              href={`https://wa.me/${telefone2}`}
              target="_blank"
              style={btnZap}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* OBSERVAÇÕES */}
      {obs && (
        <div style={card}>
          <p style={label}>Observações</p>
          <p>{obs}</p>
        </div>
      )}

      {/* FALLBACK */}
      {!telefone1 && (
        <div style={card}>
          <p>Nenhum telefone disponível.</p>
        </div>
      )}
    </div>
  );
}

/* 🔥 ESTILOS (mantidos simples e iguais ao seu padrão) */

const container = {
  maxWidth: "500px",
  margin: "0 auto",
  padding: "20px",
};

const header = {
  background: "#ff2b2b",
  color: "#fff",
  textAlign: "center",
  padding: "40px 20px",
  borderRadius: "0 0 30px 30px",
};

const card = {
  background: "#f5f5f5",
  padding: "15px",
  borderRadius: "12px",
  marginTop: "15px",
};

const label = {
  fontSize: "12px",
  color: "#666",
};

const row = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
};

const btnCall = {
  flex: 1,
  background: "#000",
  color: "#fff",
  padding: "10px",
  textAlign: "center",
  borderRadius: "8px",
};

const btnZap = {
  flex: 1,
  background: "#25D366",
  color: "#fff",
  padding: "10px",
  textAlign: "center",
  borderRadius: "8px",
};

const btnLocal = {
  marginTop: "10px",
  width: "100%",
  background: "#ff2b2b",
  color: "#fff",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
};