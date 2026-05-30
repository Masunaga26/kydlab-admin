import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PetView() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("code", code)
        .single();

      if (!error && data) setData(data);
    }

    fetchData();
  }, [code]);

  if (!data) return null;

  // 📌 DADOS
  const nome = data?.name || "Pet";
  const foto = data?.foto_url || "";

  const tel1 = (data?.tutor1_telefone || "").replace(/\D/g, "");
  const tel2 = (data?.tutor2_telefone || "").replace(/\D/g, "");

  const tutor1 = data?.tutor1_nome || "Tutor principal";
  const tutor2 = data?.tutor2_nome || "Tutor 2";

  const obs = data?.observacoes || "-";

  // 🔥 VALIDAÇÃO
  const telefoneValido = (tel) => tel.length === 10 || tel.length === 11;

  // 🔥 DEFINE PRINCIPAL COM FALLBACK
  const telefonePrincipal = telefoneValido(tel1)
    ? tel1
    : telefoneValido(tel2)
    ? tel2
    : null;

  const nomePrincipal = telefonePrincipal === tel1 ? tutor1 : tutor2;

  // 🔥 MOSTRAR TUTOR 2 CORRETO
  const mostrarTutor2 =
    telefoneValido(tel2) &&
    tel2 !== telefonePrincipal &&
    Boolean(tutor2 || tel2);

  // 🔥 LOCALIZAÇÃO PADRÃO (IGUAL PESSOA)
  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) {
      alert("Telefone não disponível.");
      return;
    }

    const mensagemInicial = `Encontrei ${nome} e ele está perdido.`;

    if (!navigator.geolocation) {
      const mensagem = encodeURIComponent(mensagemInicial);
      window.location.href = `https://wa.me/55${telefone}?text=${mensagem}`;
      return;
    }

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        const linkMapa = isIOS
          ? `https://maps.apple.com/?q=${latitude},${longitude}`
          : `https://maps.google.com/?q=${latitude},${longitude}`;

        const mensagem = encodeURIComponent(
          `${mensagemInicial}\n\nMinha localização:\n${linkMapa}`
        );

        window.location.href = `https://wa.me/55${telefone}?text=${mensagem}`;
      },
      () => {
        setLoadingLoc(false);
        const mensagem = encodeURIComponent(mensagemInicial);
        window.location.href = `https://wa.me/55${telefone}?text=${mensagem}`;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  return (
    <div style={{ background: "#f2f2f2", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>

        {/* HEADER */}
        <div
          style={{
            background: "#ff1c1c",
            borderRadius: 24,
            padding: 24,
            textAlign: "center",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "#fff",
              margin: "0 auto 12px",
              overflow: "hidden",
            }}
          >
            {foto ? (
              <img
                src={foto}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ lineHeight: "110px" }}>🐶</div>
            )}
          </div>

          <div style={{ fontSize: 12 }}>Oi, me chamo</div>
          <h2>{nome}</h2>

          <div style={{ fontSize: 14 }}>
            Estou perdido 😢 Me ajuda a voltar pra casa!
          </div>
        </div>

        {/* CONTATO PRINCIPAL */}
        {telefonePrincipal && (
          <div style={card}>
            <small>Tutor principal</small>
            <h3>{nomePrincipal}</h3>

            <div style={row}>
              <a href={`tel:${telefonePrincipal}`} style={btnCall}>
                📞 Ligar Agora
              </a>
              <a
                href={`https://wa.me/55${telefonePrincipal}`}
                style={btnWhats}
              >
                WhatsApp
              </a>
            </div>

            <button
              style={btnRed}
              onClick={() => enviarLocalizacao(telefonePrincipal)}
            >
              📍 Enviar localização
            </button>
          </div>
        )}

        {/* TUTOR 2 */}
        {mostrarTutor2 && (
          <div style={card}>
            <small>Tutor 2</small>
            <h3>{tutor2}</h3>

            <div style={row}>
              <a href={`tel:${tel2}`} style={btnCall}>
                📞 Ligar Agora
              </a>
              <a href={`https://wa.me/55${tel2}`} style={btnWhats}>
                WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* OBS */}
        <div style={card}>
          <b>Condições especiais / observações</b>
          <br />
          {obs}
        </div>

        {/* RODAPÉ */}
        <div style={{ textAlign: "center", marginTop: 30, fontSize: 12 }}>
          Os dados exibidos nesta página foram fornecidos com autorização do responsável.
          <br />
          Em caso de dúvida ou problema:
          <br />
          <a href="https://wa.me/SEUNUMERO" style={{ color: "#25d366" }}>
            Suporte via WhatsApp
          </a>
          <br />
          TAP QR — Identificação PET
        </div>
      </div>
    </div>
  );
}

/* estilos */
const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 16,
  marginTop: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const row = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const btnCall = {
  flex: 1,
  background: "#ff1c1c",
  color: "#fff",
  padding: 10,
  borderRadius: 8,
  textAlign: "center",
};

const btnWhats = {
  flex: 1,
  border: "2px solid #25d366",
  color: "#25d366",
  padding: 10,
  borderRadius: 8,
  textAlign: "center",
};

const btnRed = {
  width: "100%",
  marginTop: 10,
  background: "#ff1c1c",
  color: "#fff",
  padding: 10,
  borderRadius: 8,
  border: "none",
};