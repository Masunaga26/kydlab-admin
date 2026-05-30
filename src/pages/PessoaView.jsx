import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function PessoaView() {
  const { code } = useParams();
  const [data, setData] = useState(null);

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

  const nome = data?.name || "Pessoa";
  const foto = data?.foto_url || "";
  const tipo = data?.tipo_sanguineo || "-";
  const nascimento = data?.data_nascimento;

  const contato1 = data?.contato1_nome || "Contato principal";
  const contato2 = data?.contato2_nome || "Contato 2";
  const tel1 = data?.telefone1 || "";
  const tel2 = data?.telefone2 || "";

  const alergias = data?.alergias || "-";
  const medicamentos = data?.medicamentos || "-";
  const obs = data?.observacoes || "-";

  const idade = nascimento
    ? Math.floor((new Date() - new Date(nascimento)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const formatTel = (tel) => tel?.replace(/\D/g, "");

  const enviarLocalizacao = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      window.open(url);
    });
  };

  return (
    <div style={{ background: "#f2f2f2", minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{
          background: "#ff1c1c",
          borderRadius: 24,
          padding: 24,
          textAlign: "center",
          color: "#fff"
        }}>
          <div style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "#fff",
            margin: "0 auto 12px",
            overflow: "hidden",
            border: "4px solid rgba(255,255,255,0.4)"
          }}>
            {foto
              ? <img src={foto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ lineHeight: "110px" }}>👤</div>
            }
          </div>

          <div style={{ fontSize: 12 }}>FICHA MÉDICA DE EMERGÊNCIA</div>

          <h2 style={{ margin: "6px 0", fontSize: 22 }}>
            {nome}
          </h2>

          <div style={{ display: "flex", justifyContent: "center", gap: 15, fontSize: 14 }}>
            {idade && <div>🎂 {idade} anos</div>}
            <div>🩸 {tipo}</div>
          </div>

          <div style={{ marginTop: 10, fontSize: 13 }}>
            🚨 Em caso de emergência, use as informações abaixo para ajudar no contato.
          </div>
        </div>

        {/* SAMU */}
        <a href="tel:192" style={btnSamu}>
          📞 Ligar SAMU (192)
        </a>

        {/* CONTATO 1 */}
        <div style={card}>
          <small>Contato principal</small>
          <h3>{contato1}</h3>

          <div style={row}>
            <a href={`tel:${tel1}`} style={btnCall}>
              📞 Ligar Agora
            </a>

            <a href={`https://wa.me/${formatTel(tel1)}`} style={btnWhats}>
              WhatsApp
            </a>
          </div>

          <button style={btnRed} onClick={enviarLocalizacao}>
            📍 Enviar localização
          </button>
        </div>

        {/* CONTATO 2 */}
        <div style={card}>
          <small>Contato 2</small>
          <h3>{contato2}</h3>

          <div style={row}>
            <a href={`tel:${tel2}`} style={btnCall}>
              📞 Ligar Agora
            </a>

            <a href={`https://wa.me/${formatTel(tel2)}`} style={btnWhats}>
              WhatsApp
            </a>
          </div>
        </div>

        {/* DADOS */}
        <div style={card}><b>Alergias</b><br />{alergias}</div>
        <div style={card}><b>Medicamentos</b><br />{medicamentos}</div>
        <div style={card}><b>Observações</b><br />{obs}</div>

        {/* RODAPÉ (IGUAL PET) */}
        <div style={{ textAlign: "center", marginTop: 30, fontSize: 12, opacity: 0.7 }}>
          <div>
            Os dados exibidos nesta página foram fornecidos com autorização do responsável,
            exclusivamente para uso em situações de emergência. Tem a finalidade única de facilitar o contato
            e contribuir para o caso de emergência.
          </div>

          <div style={{ marginTop: 10 }}>
            Problemas ou dúvidas:
          </div>

          <a
            href="https://wa.me/SEUNUMEROAQUI"
            style={{ color: "#25d366", textDecoration: "none", fontWeight: "bold" }}
          >
            Suporte via WhatsApp
          </a>

          <div style={{ marginTop: 10 }}>
            TAP QR — Identificação de Emergência
          </div>
        </div>

      </div>
    </div>
  );
}

/* ===== ESTILOS ===== */

const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 16,
  marginTop: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};

const row = {
  display: "flex",
  gap: 10,
  marginTop: 10
};

const btnCall = {
  flex: 1,
  background: "#ff1c1c",
  color: "#fff",
  padding: 10,
  borderRadius: 8,
  textAlign: "center",
  fontWeight: "bold"
};

const btnWhats = {
  flex: 1,
  border: "2px solid #25d366",
  color: "#25d366",
  padding: 10,
  borderRadius: 8,
  textAlign: "center",
  fontWeight: "bold"
};

const btnRed = {
  width: "100%",
  marginTop: 10,
  background: "#ff1c1c",
  color: "#fff",
  padding: 10,
  borderRadius: 8,
  border: "none",
  fontWeight: "bold"
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
  fontWeight: "bold"
};