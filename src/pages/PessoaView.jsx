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

export default function PessoaView() {
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

    if (data.tipo && data.tipo !== "pessoa") {
      window.location.href = `/pet/${code}`;
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

  const telefone1 = limparTelefone(data?.contato1_telefone);
  const telefone2 = limparTelefone(data?.contato2_telefone);

  const telefonePrincipal = telefoneValido(telefone1)
    ? telefone1
    : telefoneValido(telefone2)
    ? telefone2
    : null;

  const nomePrincipal = telefoneValido(telefone1)
    ? data?.contato1_nome
    : data?.contato2_nome;

  const mostrarContato2 =
    telefoneValido(telefone2) &&
    telefone2 !== telefonePrincipal &&
    Boolean(data?.contato2_nome || telefone2);

  function mensagemBase() {
    return encodeURIComponent(
      `Estou com ${data?.name || "essa pessoa"} em uma emergência.`
    );
  }

  // 🔥 FIX PROFISSIONAL iOS + ANDROID (IGUAL PETVIEW)
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

    // 🔥 timeout inteligente (resolve iOS 16+)
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
          `Estou com ${data?.name || "essa pessoa"} em uma emergência.\n` +
          `Localização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        const url = `https://wa.me/55${telefone}?text=${mensagem}`;

        // 🔥 ESSENCIAL PRA IOS
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
      <TapLayout footerType="simple" productType="pessoa" code={code}>
        <TapCard>
          <p style={loading}>{erro}</p>
        </TapCard>
      </TapLayout>
    );
  }

  if (!data) {
    return (
      <TapLayout footerType="simple" productType="pessoa" code={code}>
        <p style={loading}>Carregando...</p>
      </TapLayout>
    );
  }

  return (
    <TapLayout footerType="view" productType="pessoa" code={code}>
      <TapHero
        variant="view"
        eyebrow="Estou com"
        title={(data.name || "Pessoa").toUpperCase()}
        subtitle="Precisa de ajuda 🚨"
      />

      {telefoneValido(telefonePrincipal) && (
        <TapCard>
          <p style={label}>CONTATO PRINCIPAL</p>
          <h3 style={contactName}>{nomePrincipal || "Responsável"}</h3>

          <TapActionRow>
            <TapCallButton href={`tel:${telefonePrincipal}`}>
              Ligar
            </TapCallButton>

            <TapWhatsButton
              href={`https://wa.me/55${telefonePrincipal}?text=${mensagemBase()}`}
            >
              WhatsApp
            </TapWhatsButton>
          </TapActionRow>

          <button
            style={btnLocal}
            onClick={() => enviarLocalizacao(telefonePrincipal)}
          >
            {loadingLoc ? "Enviando..." : "📍 Enviar localização"}
          </button>
        </TapCard>
      )}

      {mostrarContato2 && (
        <TapCard>
          <p style={label}>CONTATO 2</p>
          <h3 style={contactName}>{data.contato2_nome || "Responsável"}</h3>

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
          <p style={label}>CONTATO</p>
          <p style={infoText}>Nenhum telefone disponível.</p>
        </TapCard>
      )}

      {data.observacoes && (
        <TapCard>
          <p style={label}>OBSERVAÇÕES</p>
          <p style={infoText}>{data.observacoes}</p>
        </TapCard>
      )}
    </TapLayout>
  );
}

/* estilos */

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
};

const contactName = {
  margin: 0,
  fontSize: 26,
  fontWeight: 900,
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
};

const infoText = {
  margin: 0,
  fontSize: 16,
};