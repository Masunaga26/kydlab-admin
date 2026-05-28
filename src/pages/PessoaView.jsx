import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PessoaView() {
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

  // 🚀 LOCALIZAÇÃO DEFINITIVA (IOS + ANDROID)
  function enviarLocalizacao() {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada");
      return;
    }

    if (!confirm("Vamos usar sua localização para ajudar no resgate")) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const linkMaps = `https://maps.google.com/?q=${lat},${lng}`;

        const texto = `Estou com ${tag?.nome || "uma pessoa"} em uma emergência.\nLocalização: ${linkMaps}`;

        window.open(
          `https://wa.me/?text=${encodeURIComponent(texto)}`,
          "_blank"
        );
      },
      () => {
        alert("Não foi possível obter localização");
      }
    );
  }

  if (!tag) return null;

  return (
    <div style={container}>
      <div style={content}>

        {/* HEADER */}
        <div style={header}>
          <h3 style={{ opacity: 0.8 }}>Estou com</h3>
          <h1 style={{ margin: 0 }}>{tag.nome || "Pessoa"}</h1>
          <p>Precisa de ajuda 🚨</p>
        </div>

        {/* CONTATO */}
        {tag.tutor1_nome ? (
          <div style={card}>
            <div style={label}>CONTATO PRINCIPAL</div>
            <div style={nome}>{tag.tutor1_nome}</div>

            <div style={row}>
              {tag.tutor1_telefone && (
                <a href={`tel:${tag.tutor1_telefone}`} style={btnCall}>
                  📞 Ligar
                </a>
              )}

              {tag.tutor1_telefone && (
                <a
                  href={`https://wa.me/55${tag.tutor1_telefone}`}
                  target="_blank"
                  style={btnWhats}
                >
                  💬 WhatsApp
                </a>
              )}
            </div>

            <button style={btnLocation} onClick={enviarLocalizacao}>
              📍 Enviar localização
            </button>
          </div>
        ) : (
          <div style={card}>
            <div style={label}>CONTATO</div>
            Nenhum telefone disponível.
          </div>
        )}

        {/* CONTATO 2 */}
        {tag.tutor2_nome && (
          <div style={card}>
            <div style={label}>CONTATO ALTERNATIVO</div>
            <div style={nome}>{tag.tutor2_nome}</div>

            <div style={row}>
              {tag.tutor2_telefone && (
                <a href={`tel:${tag.tutor2_telefone}`} style={btnCall}>
                  📞 Ligar
                </a>
              )}

              {tag.tutor2_telefone && (
                <a
                  href={`https://wa.me/55${tag.tutor2_telefone}`}
                  target="_blank"
                  style={btnWhats}
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        {/* OBSERVAÇÕES */}
        {tag.observacoes && (
          <div style={card}>
            <div style={label}>OBSERVAÇÕES</div>
            <div>{tag.observacoes}</div>
          </div>
        )}

        {/* RODAPÉ */}
        <div style={footer}>
          Os dados exibidos nesta página foram fornecidos com autorização do responsável,
          exclusivamente para uso em situações de emergência.
        </div>

      </div>
    </div>
  );
}

/* 🎨 ESTILO PADRÃO KYDLAB */

const container = {
  display: "flex",
  justifyContent: "center",
  background: "#f4f4f4",
  minHeight: "100vh",
  padding: "20px",
};

const content = {
  width: "100%",
  maxWidth: "420px",
};

const header = {
  background: "#ef1c1c",
  color: "#fff",
  padding: "30px 20px",
  borderRadius: "20px 20px 40px 40px",
  textAlign: "center",
  marginBottom: "20px",
};

const card = {
  background: "#fff",
  padding: "18px",
  borderRadius: "16px",
  marginBottom: "15px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const label = {
  fontSize: "12px",
  color: "#777",
  marginBottom: "5px",
};

const nome = {
  fontSize: "18px",
  fontWeight: "bold",
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
  padding: "12px",
  borderRadius: "8px",
  textAlign: "center",
  textDecoration: "none",
};

const btnWhats = {
  flex: 1,
  background: "#25D366",
  color: "#fff",
  padding: "12px",
  borderRadius: "8px",
  textAlign: "center",
  textDecoration: "none",
};

const btnLocation = {
  width: "100%",
  background: "#ef1c1c",
  color: "#fff",
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  marginTop: "10px",
};

const footer = {
  fontSize: "12px",
  color: "#888",
  textAlign: "center",
  marginTop: "20px",
};