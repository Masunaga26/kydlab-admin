import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import TapLayout, {
  TapHero,
  TapCard,
  TapActionRow,
  TapCallButton,
  TapWhatsButton,
} from "../components/TapLayout";

export default function PetView() {
  const { code } = useParams();

  const [data, setData] = useState(null);
  const [erro, setErro] = useState("");
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      console.error("Erro ao carregar pet:", error);
      setErro("Código inválido ou não encontrado.");
      return;
    }

    if (!data.locked) {
      window.location.href = `/escolha/${code}`;
      return;
    }

    if (data.tipo && data.tipo !== "pet") {
      window.location.href = `/pessoa/${code}`;
      return;
    }

    setData(data);
  }

  function limparTelefone(tel) {
    return (tel || "").replace(/\D/g, "");
  }

  function telefoneValido(tel) {
    const limpo = limparTelefone(tel);
    return limpo.length === 10 || limpo.length === 11;
  }

  const telefone1 = limparTelefone(data?.tutor1_telefone);
  const telefone2 = limparTelefone(data?.tutor2_telefone);

  const telefonePrincipal = telefoneValido(telefone1)
    ? telefone1
    : telefoneValido(telefone2)
    ? telefone2
    : null;

  const nomeTutorPrincipal = telefoneValido(telefone1)
    ? data?.tutor1_nome
    : data?.tutor2_nome;

  const mostrarTutor2 =
    telefoneValido(telefone2) &&
    telefone2 !== telefonePrincipal &&
    Boolean(data?.tutor2_nome || telefone2);

  function mensagemBase() {
    return encodeURIComponent(
      `Encontrei ${data?.name || "esse pet"} em uma emergência.`
    );
  }

  // 🔥 ÚNICA PARTE ALTERADA (CORREÇÃO iOS + ANDROID)
  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) {
      alert("Telefone não disponível.");
      return;
    }

    const ok = confirm("Vamos usar sua localização para ajudar no resgate");
    if (!ok) return;

    if (!navigator.geolocation) {
      const url = `https://wa.me/55${telefone}?text=${mensagemBase()}`;
      window.open(url, "_self");
      return;
    }

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const mensagem = encodeURIComponent(
          `Encontrei ${data?.name || "esse pet"} em uma emergência.\nLocalização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        const url = `https://wa.me/55${telefone}?text=${mensagem}`;

        // 🔥 iOS precisa desse delay
        setTimeout(() => {
          window.open(url, "_self");
        }, 300);
      },
      () => {
        setLoadingLoc(false);

        const url = `https://wa.me/55${telefone}?text=${mensagemBase()}`;
        window.open(url, "_self");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  if (erro) {
    return (
      <TapLayout footerType="simple" productType="pet" code={code}>
        <TapCard>
          <p style={loading}>{erro}</p>
        </TapCard>
      </TapLayout>
    );
  }

  if (!data) {
    return (
      <TapLayout footerType="simple" productType="pet" code={code}>
        <p style={loading}>Carregando...</p>
      </TapLayout>
    );
  }

  const fotoUrlFinal =
    data?.foto_url && data.foto_url !== ""
      ? `${data.foto_url}?t=${Date.now()}`
      : "https://via.placeholder.com/150";

  return (
    <TapLayout footerType="view" productType="pet" code={code}>
      <TapHero
        variant="view"
        photoUrl={fotoUrlFinal}
        eyebrow="Oi, me chamo"
        title={(data.name || "Pet").toUpperCase()}
        subtitle="Estou perdido 😢 Me ajude a voltar pra casa!"
      />

      {telefoneValido(telefonePrincipal) && (
        <TapCard>
          <p style={label}>TUTOR PRINCIPAL</p>
          <h3 style={contactName}>
            {nomeTutorPrincipal || "Responsável"}
          </h3>

          <TapActionRow>
            <TapCallButton href={`tel:${telefonePrincipal}`}>
              Ligar Agora
            </TapCallButton>

            <TapWhatsButton
              href={`https://wa.me/55${telefonePrincipal}?text=${mensagemBase()}`}
            >
              WhatsApp
            </TapWhatsButton>
          </TapActionRow>

          <button
            type="button"
            style={btnLocal}
            onClick={() => enviarLocalizacao(telefonePrincipal)}
          >
            {loadingLoc ? "Enviando..." : "📍 Enviar localização"}
          </button>
        </TapCard>
      )}

      {mostrarTutor2 && (
        <TapCard>
          <p style={label}>TUTOR 2</p>
          <h3 style={contactName}>{data.tutor2_nome || "Responsável"}</h3>

          <TapActionRow>
            <TapCallButton href={`tel:${telefone2}`}>
              Ligar Agora
            </TapCallButton>

            <TapWhatsButton
              href={`https://wa.me/55${telefone2}?text=${mensagemBase()}`}
            >
              WhatsApp
            </TapWhatsButton>
          </TapActionRow>
        </TapCard>
      )}

      {!telefoneValido(telefonePrincipal) && (
        <TapCard>
          <p style={label}>CONTATO</p>
          <p style={infoText}>
            Nenhum telefone válido foi informado para este pet.
          </p>
        </TapCard>
      )}

      {data.observacoes && (
        <TapCard>
          <p style={label}>CONDIÇÕES ESPECIAIS / OBSERVAÇÕES</p>
          <p style={infoText}>{data.observacoes}</p>
        </TapCard>
      )}
    </TapLayout>
  );
}

/* 🎨 ESTILO VISUAL DA VIEW PET */

const loading = {
  textAlign: "center",
  padding: 30,
  color: "#777",
};

const label = {
  margin: "0 0 10px",
  fontSize: 13,
  color: "#777",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".5px",
};

const contactName = {
  margin: 0,
  fontSize: 26,
  color: "#111",
  fontWeight: 950,
};

const btnLocal = {
  width: "100%",
  marginTop: 12,
  minHeight: 54,
  borderRadius: 14,
  border: "none",
  background: "#ef1c1c",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
};

const infoText = {
  margin: 0,
  color: "#333",
  fontSize: 18,
  lineHeight: 1.45,
  fontWeight: 500,
};