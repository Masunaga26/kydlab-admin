import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import TapLayout, {
  TapCard,
  TapSectionTitle,
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
      console.error("Erro ao carregar pessoa:", error);
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

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;

    const hoje = new Date();
    const nasc = new Date(dataNascimento);

    if (Number.isNaN(nasc.getTime())) return null;

    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }

    if (idade < 0 || idade > 120) return null;

    return idade;
  }

  const telefone1 = limparTelefone(data?.tutor1_telefone);
  const telefone2 = limparTelefone(data?.tutor2_telefone);

  const telefonePrincipal = telefoneValido(telefone1)
    ? telefone1
    : telefoneValido(telefone2)
    ? telefone2
    : null;

  const nomeContatoPrincipal = telefoneValido(telefone1)
    ? data?.tutor1_nome
    : data?.tutor2_nome;

  const mostrarContato2 =
    telefoneValido(telefone2) &&
    telefone2 !== telefonePrincipal &&
    Boolean(data?.tutor2_nome || telefone2);

  function mensagemBase() {
    return encodeURIComponent(
      `Estou com ${data?.name || "essa pessoa"} em uma emergência.`
    );
  }

  // 🔥 FUNÇÃO CORRIGIDA (ÚNICA ALTERAÇÃO)
  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) {
      alert("Telefone não disponível.");
      return;
    }

    const mensagemInicial = `Estou com ${data?.name || "essa pessoa"} em uma emergência.`;

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

  const idade = calcularIdade(data.data_nascimento);

  const fotoUrl =
    data?.foto_url && data.foto_url !== ""
      ? `${data.foto_url}?t=${Date.now()}`
      : "https://via.placeholder.com/150";

  return (
    <TapLayout footerType="view" productType="pessoa" code={code}>
      <section style={medicalHeader}>
        <div style={headerTop}>
          <div style={photoWrap}>
            <img src={fotoUrl} style={foto} alt={data.name || "Pessoa"} />
          </div>

          <div style={headerInfo}>
            <p style={eyebrow}>Ficha médica de emergência</p>
            <h1 style={pessoaNome}>{data.name || "Pessoa"}</h1>

            <div style={badges}>
              {idade !== null && <span style={badge}>🎂 {idade} anos</span>}

              {data.tipo_sanguineo && (
                <span style={badgeRed}>🩸 {data.tipo_sanguineo}</span>
              )}
            </div>
          </div>
        </div>

        <p style={emergencyText}>
          🚨 Em caso de emergência, use as informações abaixo para ajudar no
          contato com o responsável.
        </p>
      </section>

      <a href="tel:192" style={btnSamu}>
        👉 Ligar SAMU (192)
      </a>

      {telefoneValido(telefonePrincipal) && (
        <TapCard>
          <p style={label}>CONTATO PRINCIPAL</p>
          <h3 style={contactName}>
            {nomeContatoPrincipal || "Responsável"}
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

      {mostrarContato2 && (
        <TapCard>
          <p style={label}>CONTATO 2</p>
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
            Nenhum telefone válido foi informado para esta ficha.
          </p>
        </TapCard>
      )}

      {data.tipo_sanguineo && (
        <TapCard>
          <p style={label}>TIPO SANGUÍNEO</p>
          <p style={mainInfo}>
            🩸 <strong>{data.tipo_sanguineo}</strong>
          </p>
        </TapCard>
      )}

      {(data.comorbidades || data.alergias || data.medicamentos) && (
        <TapCard>
          <TapSectionTitle
            icon="🩺"
            title="Informações de saúde"
            subtitle="Dados importantes para uma situação de emergência."
          />

          {data.comorbidades && (
            <div style={infoBlock}>
              <p style={infoLabel}>Comorbidades</p>
              <p style={infoText}>{data.comorbidades}</p>
            </div>
          )}

          {data.alergias && (
            <div style={infoBlock}>
              <p style={infoLabel}>Alergias</p>
              <p style={infoText}>{data.alergias}</p>
            </div>
          )}

          {data.medicamentos && (
            <div style={infoBlock}>
              <p style={infoLabel}>Medicamentos de uso contínuo</p>
              <p style={infoText}>{data.medicamentos}</p>
            </div>
          )}
        </TapCard>
      )}
    </TapLayout>
  );
}