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

  function enviarLocalizacao() {
    if (!navigator.geolocation) return;

    if (!confirm("Vamos usar sua localização para ajudar no resgate")) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const link = `https://maps.google.com/?q=${lat},${lng}`;
      const texto = `Estou com ${tag?.nome || "uma pessoa"} em uma emergência.\nLocalização: ${link}`;

      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
    });
  }

  if (!tag) return null;

  return (
    <div style={container}>
      <div style={content}>

        <div style={header}>
          <p style={sub}>Estou com</p>
          <h1 style={title}>{tag.nome || "Pessoa"}</h1>
          <p style={msg}>Precisa de ajuda 🚨</p>
        </div>

        {tag.tutor1_nome && (
          <div style={card}>
            <span style={label}>Contato principal</span>
            <h3>{tag.tutor1_nome}</h3>

            <div style={row}>
              <a href={`tel:${tag.tutor1_telefone}`} style={btnCall}>📞 Ligar</a>
              <a href={`https://wa.me/55${tag.tutor1_telefone}`} style={btnWhats}>💬 WhatsApp</a>
            </div>

            <button style={btnLocation} onClick={enviarLocalizacao}>
              📍 Enviar localização
            </button>
          </div>
        )}

      </div>
    </div>
  );
}