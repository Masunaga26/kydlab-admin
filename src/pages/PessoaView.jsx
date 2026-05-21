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

  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) {
      alert("Telefone não disponível.");
      return;
    }

    if (!navigator.geolocation) {
      window.location.href = `https://wa.me/55${telefone}?text=${mensagemBase()}`;
      return;
    }

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const mensagem = encodeURIComponent(
          `Estou com ${data?.name || "essa pessoa"} em uma emergência.\nLocalização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        window.location.href = `https://wa.me/55${telefone}?text=${mensagem}`;
      },
      () => {
        setLoadingLoc(false);
        window.location.href = `https://wa.me/55${telefone}?text=${mensagemBase()}`;
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

/* 🎨 ESTILO VISUAL DA VIEW MÉDICA */

const loading = {
  textAlign: "center",
  padding: 30,
  color: "#777",
};

const medicalHeader = {
  background: "#fff",
  margin: "16px 16px 0",
  padding: 22,
  borderRadius: 24,
  boxShadow: "0 12px 28px rgba(0,0,0,.08)",
  borderTop: "6px solid #ef1c1c",
};

const headerTop = {
  display: "flex",
  alignItems: "center",
  gap: 18,
};

const photoWrap = {
  width: 108,
  height: 108,
  minWidth: 108,
  borderRadius: "50%",
  padding: 5,
  background: "#fbe2e2",
  border: "1px solid #f2caca",
};

const foto = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
};

const headerInfo = {
  flex: 1,
};

const eyebrow = {
  margin: "0 0 6px",
  color: "#777",
  fontSize: 13,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".4px",
};

const pessoaNome = {
  margin: 0,
  fontSize: 30,
  lineHeight: 1.05,
  fontWeight: 950,
  color: "#111",
  textTransform: "uppercase",
};

const badges = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
};

const badge = {
  display: "inline-flex",
  alignItems: "center",
  background: "#f7f7f7",
  color: "#666",
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
};

const badgeRed = {
  ...badge,
  background: "#fff1f1",
  color: "#d71920",
};

const emergencyText = {
  margin: "20px 0 0",
  color: "#555",
  fontSize: 15,
  lineHeight: 1.5,
};

const btnSamu = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 60,
  margin: "16px 16px 0",
  background: "#ef1c1c",
  color: "#fff",
  borderRadius: 16,
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 17,
  boxShadow: "0 16px 30px rgba(239,28,28,.22)",
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
  fontSize: 24,
  color: "#111",
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
  fontSize: 16,
  cursor: "pointer",
};

const mainInfo = {
  margin: 0,
  fontSize: 22,
  color: "#111",
};

const infoBlock = {
  background: "#fafafa",
  border: "1px solid #f0f0f0",
  borderRadius: 16,
  padding: 16,
  marginTop: 14,
};

const infoLabel = {
  margin: "0 0 8px",
  color: "#777",
  fontSize: 13,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".4px",
};

const infoText = {
  margin: 0,
  color: "#222",
  fontSize: 17,
  lineHeight: 1.45,
  fontWeight: 600,
};