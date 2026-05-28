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

  // ✅ CORRIGIDO AQUI
  const telefone1 = limparTelefone(data?.contato1_telefone);
  const telefone2 = limparTelefone(data?.contato2_telefone);

  const telefonePrincipal = telefoneValido(telefone1)
    ? telefone1
    : telefoneValido(telefone2)
    ? telefone2
    : null;

  const nomeTutorPrincipal = telefoneValido(telefone1)
    ? data?.contato1_nome
    : data?.contato2_nome;

  const mostrarTutor2 =
    telefoneValido(telefone2) &&
    telefone2 !== telefonePrincipal &&
    Boolean(data?.contato2_nome || telefone2);

  function mensagemBase() {
    return encodeURIComponent(
      `Estou com ${data?.name || "esse pet"} em uma emergência.`
    );
  }

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

    let enviou = false;

    const timeoutFallback = setTimeout(() => {
      if (!enviou) {
        setLoadingLoc(false);
        const url = `https://wa.me/55${telefone}?text=${mensagemBase()}`;
        window.open(url, "_self");
      }
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (enviou) return;

        enviou = true;
        clearTimeout(timeoutFallback);

        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const mensagem = encodeURIComponent(
          `Estou com ${data?.name || "esse pet"} em uma emergência.\n` +
            `Localização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        const url = `https://wa.me/55${telefone}?text=${mensagem}`;

        setTimeout(() => {
          window.open(url, "_self");
        }, 300);
      },
      () => {
        if (enviou) return;

        enviou = true;
        clearTimeout(timeoutFallback);

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
          <p>{erro}</p>
        </TapCard>
      </TapLayout>
    );
  }

  if (!data) {
    return (
      <TapLayout footerType="simple" productType="pet" code={code}>
        <p>Carregando...</p>
      </TapLayout>
    );
  }

  return (
    <TapLayout footerType="view" productType="pet" code={code}>
      <TapHero
        variant="view"
        eyebrow="Oi, me chamo"
        title={(data.name || "Pet").toUpperCase()}
        subtitle="Precisa de ajuda 🚨"
      />

      {telefoneValido(telefonePrincipal) && (
        <TapCard>
          <p>TUTOR PRINCIPAL</p>
          <h3>{nomeTutorPrincipal || "Responsável"}</h3>

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

          <button onClick={() => enviarLocalizacao(telefonePrincipal)}>
            {loadingLoc ? "Enviando..." : "📍 Enviar localização"}
          </button>
        </TapCard>
      )}

      {mostrarTutor2 && (
        <TapCard>
          <p>CONTATO 2</p>
          <h3>{data.contato2_nome || "Responsável"}</h3>

          <TapActionRow>
            <TapCallButton href={`tel:${telefone2}`}>
              Ligar
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
          <p>CONTATO</p>
          <p>Nenhum telefone disponível.</p>
        </TapCard>
      )}

      {data.observacoes && (
        <TapCard>
          <p>OBSERVAÇÕES</p>
          <p>{data.observacoes}</p>
        </TapCard>
      )}
    </TapLayout>
  );
}