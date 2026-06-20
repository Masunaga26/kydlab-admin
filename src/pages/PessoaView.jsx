import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PessoaView() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.rpc("get_public_tag", {
        p_code: code,
      });

      if (!error && data) setData(data);
    }

    fetchData();
  }, [code]);

  if (!data) return null;

  // 🔥 LIMPA TELEFONE
  const limparTelefone = (tel) => {
    if (!tel) return "";
    return tel.replace(/\D/g, "");
  };

  const tel1 = limparTelefone(data?.tutor1_telefone);
  const tel2 = limparTelefone(data?.tutor2_telefone);

  // 🔥 VALIDAÇÃO IGUAL AO PETVIEW
  const telefoneValido = (tel) => tel && (tel.length === 10 || tel.length === 11);

  // 🔥 DEFINE PRINCIPAL
  const telefonePrincipal = telefoneValido(tel1)
    ? tel1
    : telefoneValido(tel2)
    ? tel2
    : null;

  const nomePrincipal =
    telefonePrincipal === tel1 ? data?.tutor1_nome : data?.tutor2_nome;

  // 🔥 CORRIGIDO: permite contato 2 mesmo com nome/telefone igual ao principal
  const mostrarContato2 = telefoneValido(tel2);

  // 🔥 DADOS
  const nome = data?.name || "Pessoa";
  const foto = data?.foto_url || "";
  const tipo = data?.tipo_sanguineo || "-";
  const nascimento = data?.data_nascimento;

  const contato2 = data?.tutor2_nome;

  const comorbidades = data?.comorbidades || "-";
  const alergias = data?.alergias || "-";
  const medicamentos = data?.medicamentos || "-";
  const obs = data?.observacoes || "-";

  const idade = nascimento
    ? Math.floor(
        (new Date() - new Date(nascimento)) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  // 🔥 FUNÇÃO WHATSAPP NORMAL
  function abrirWhatsApp(telefone, mensagem) {
    if (!telefoneValido(telefone)) {
      alert("Telefone inválido");
      return;
    }

    const texto = encodeURIComponent(mensagem);
    window.location.href = `https://wa.me/55${telefone}?text=${texto}`;
  }

  // 🔥 LOCALIZAÇÃO CORRIGIDA IGUAL AO PETVIEW
  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) {
      alert("Telefone inválido");
      return;
    }

    const mensagemInicial = `Encontrei ${nome} e precisa de ajuda.`;

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
              <div style={{ lineHeight: "110px" }}>👤</div>
            )}
          </div>

          <div style={{ fontSize: 12 }}>FICHA MÉDICA DE EMERGÊNCIA</div>
          <h2>{nome}</h2>

          <div>
            {idade && <span>🎂 {idade} anos </span>}
            <span>🩸 {tipo}</span>
          </div>
        </div>

        {/* SAMU */}
        <a href="tel:192" style={btnSamu}>
          📞 Ligar SAMU (192)
        </a>

        {/* CONTATO PRINCIPAL */}
        {telefonePrincipal && (
          <div style={card}>
            <small>Contato principal</small>
            <h3>{nomePrincipal}</h3>

            <div style={row}>
              <a href={`tel:${telefonePrincipal}`} style={btnCall}>
                📞 Ligar Agora
              </a>

              <button
                style={btnWhats}
                onClick={() =>
                  abrirWhatsApp(
                    telefonePrincipal,
                    `Encontrei ${nome} e precisa de ajuda.`
                  )
                }
              >
                WhatsApp
              </button>
            </div>

            <button
              style={btnRed}
              onClick={() => enviarLocalizacao(telefonePrincipal)}
              disabled={loadingLoc}
            >
              {loadingLoc ? "Obtendo localização..." : "📍 Enviar localização"}
            </button>
          </div>
        )}

        {/* CONTATO 2 */}
        {mostrarContato2 && (
          <div style={card}>
            <small>Contato 2</small>
            <h3>{contato2}</h3>

            <div style={row}>
              <a href={`tel:${tel2}`} style={btnCall}>
                📞 Ligar Agora
              </a>

              <button
                style={btnWhats}
                onClick={() =>
                  abrirWhatsApp(
                    tel2,
                    `Encontrei ${nome} e precisa de ajuda.`
                  )
                }
              >
                WhatsApp
              </button>
            </div>

            <button
              style={btnRed}
              onClick={() => enviarLocalizacao(tel2)}
              disabled={loadingLoc}
            >
              {loadingLoc ? "Obtendo localização..." : "📍 Enviar localização"}
            </button>
          </div>
        )}

        {/* DADOS */}
        <div style={card}>
          <b>Comorbidades</b>
          <br />
          {comorbidades}
        </div>

        <div style={card}>
          <b>Alergias</b>
          <br />
          {alergias}
        </div>

        <div style={card}>
          <b>Medicamentos</b>
          <br />
          {medicamentos}
        </div>

        <div style={card}>
          <b>Observações</b>
          <br />
          {obs}
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
  border: "none",
  textDecoration: "none",
};

const btnWhats = {
  flex: 1,
  border: "2px solid #25d366",
  color: "#25d366",
  padding: 10,
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
};

const btnRed = {
  width: "100%",
  marginTop: 10,
  background: "#ff1c1c",
  color: "#fff",
  padding: 10,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
};

const btnSamu = {
  display: "block",
  width: "100%",
  background: "#ff1c1c",
  color: "#fff",
  padding: 14,
  textAlign: "center",
  borderRadius: 10,
  marginTop: 12,
  textDecoration: "none",
};