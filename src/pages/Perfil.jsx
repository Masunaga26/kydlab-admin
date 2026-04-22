import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Perfil() {
  const { code } = useParams();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("tags")
        .select("*")
        .eq("code", code)
        .limit(1);

      if (data && data.length > 0) {
        setDados(data[0]);
      } else {
        setDados(false);
      }

      setLoading(false);
    }

    carregar();
  }, [code]);

  if (loading) return <p>Carregando...</p>;
  if (!dados) return <p>Nenhum cadastro encontrado.</p>;

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>🐶 {dados.nome}</h1>

      <p style={{ fontSize: 18 }}>
        Este pet está perdido? Entre em contato:
      </p>

      <a
        href={`https://wa.me/55${dados.telefone}`}
        style={{
          display: "block",
          margin: "20px auto",
          padding: "15px",
          background: "green",
          color: "white",
          borderRadius: "10px",
          textDecoration: "none",
          width: "200px",
        }}
      >
        💬 Falar no WhatsApp
      </a>

      <a
        href={`tel:${dados.telefone}`}
        style={{
          display: "block",
          margin: "10px auto",
          padding: "12px",
          border: "1px solid black",
          borderRadius: "10px",
          textDecoration: "none",
          width: "200px",
        }}
      >
        📞 Ligar
      </a>

      <p style={{ marginTop: 30, fontSize: 12 }}>
        Código: {dados.code}
      </p>
    </div>
  );
}