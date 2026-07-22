import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function normalizarWhatsapp(valor) {
  let numero = somenteNumeros(valor);

  if (!numero) return "";

  if (numero.startsWith("55") && (numero.length === 12 || numero.length === 13)) {
    return numero;
  }

  if (numero.length === 10 || numero.length === 11) {
    return `55${numero}`;
  }

  return numero;
}

export default function Perfil() {
  const { code } = useParams();

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro("");

      try {
        const codigoLimpo = String(code || "").trim();

        if (!codigoLimpo) {
          if (ativo) {
            setErro("Código inválido.");
            setDados(null);
            setLoading(false);
          }

          return;
        }

        const { data, error } = await supabase
          .from("tags")
          .select("*")
          .eq("code", codigoLimpo)
          .maybeSingle();

        if (!ativo) return;

        if (error) {
          console.error("Erro ao carregar perfil:", error);
          setErro("Não foi possível carregar este cadastro.");
          setDados(null);
          setLoading(false);
          return;
        }

        if (!data) {
          setDados(null);
          setErro("Nenhum cadastro encontrado.");
          setLoading(false);
          return;
        }

        setDados(data);
        setLoading(false);
      } catch (error) {
        console.error("Erro inesperado ao carregar perfil:", error);

        if (ativo) {
          setErro("Erro inesperado ao carregar o cadastro.");
          setDados(null);
          setLoading(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [code]);

  const numeroWhatsapp = useMemo(() => {
    return normalizarWhatsapp(dados?.telefone);
  }, [dados?.telefone]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#f5f5f5",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <p style={{ margin: 0 }}>Carregando...</p>
      </main>
    );
  }

  if (erro || !dados) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#f5f5f5",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "24px",
            background: "#ffffff",
            borderRadius: "18px",
            textAlign: "center",
            boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ margin: "0 0 10px" }}>Cadastro não encontrado</h1>

          <p style={{ margin: 0, color: "#666" }}>
            {erro || "Nenhum cadastro encontrado."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px",
        background: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          margin: "0 auto",
          padding: "26px",
          background: "#ffffff",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 14px 36px rgba(0,0,0,0.10)",
        }}
      >
        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "30px",
          }}
        >
          🐶 {dados.nome || "Pet identificado"}
        </h1>

        <p
          style={{
            margin: "0 0 22px",
            fontSize: "17px",
            lineHeight: 1.5,
            color: "#444",
          }}
        >
          Este pet está perdido? Entre em contato com o responsável.
        </p>

        {numeroWhatsapp && (
          <a
            href={`https://wa.me/${numeroWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              width: "100%",
              margin: "0 0 12px",
              padding: "15px",
              background: "#16a34a",
              color: "#ffffff",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            💬 Falar no WhatsApp
          </a>
        )}

        {dados.telefone && (
          <a
            href={`tel:${dados.telefone}`}
            style={{
              display: "block",
              width: "100%",
              margin: "0",
              padding: "14px",
              border: "1px solid #d1d5db",
              color: "#111827",
              background: "#ffffff",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            📞 Ligar
          </a>
        )}

        <p
          style={{
            marginTop: "28px",
            marginBottom: 0,
            fontSize: "12px",
            color: "#777",
          }}
        >
          Código: {dados.code}
        </p>
      </section>
    </main>
  );
}