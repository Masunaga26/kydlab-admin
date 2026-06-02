import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import TapLayout, {
  TapHero,
  TapCard,
  TapSectionTitle,
  TapSecurityNotice,
  TapWarningBox,
  TapPrimaryButton,
} from "../components/TapLayout";

export default function CadastroPessoa() {
  const { code } = useParams();

  const [nome, setNome] = useState("");
  const [dataNascTexto, setDataNascTexto] = useState("");
  const [tipoSanguineo, setTipoSanguineo] = useState("");
  const [telefone1, setTelefone1] = useState("");
  const [telefone2, setTelefone2] = useState("");
  const [tutor1Nome, setTutor1Nome] = useState("");
  const [tutor2Nome, setTutor2Nome] = useState("");

  const [comorbidades, setComorbidades] = useState("");
  const [alergias, setAlergias] = useState("");
  const [medicamentos, setMedicamentos] = useState("");

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processandoFoto, setProcessandoFoto] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const salvandoRef = useRef(false);

  function limparTelefone(tel) {
    return (tel || "").replace(/\D/g, "");
  }

  function telefoneValido(tel) {
    const limpo = limparTelefone(tel);
    return limpo.length === 10 || limpo.length === 11;
  }

  function comprimirImagem(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onerror = () => {
        reject(new Error("Erro ao ler o arquivo da imagem"));
      };

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onerror = () => {
        reject(new Error("Erro ao carregar a imagem"));
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 1200;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Erro ao comprimir a imagem"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          0.7
        );
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    setProcessandoFoto(true);
    setFoto(null);
    setPreview(null);

    try {
      const compressed = await comprimirImagem(file);

      setFoto(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch (err) {
      console.error("Erro ao processar foto:", err);
      alert("Não foi possível processar a foto. Tente outra imagem.");
      setFoto(null);
      setPreview(null);
    } finally {
      setProcessandoFoto(false);
    }
  }

  function formatarDataISO(data) {
    if (!data) return null;

    if (data.length !== 10) {
      alert("Data de nascimento inválida. Use o formato DD/MM/AAAA.");
      return "INVALIDA";
    }

    const [dia, mes, ano] = data.split("/").map(Number);

    const dataObj = new Date(ano, mes - 1, dia);

    const dataValida =
      dataObj.getFullYear() === ano &&
      dataObj.getMonth() === mes - 1 &&
      dataObj.getDate() === dia;

    if (!dataValida) {
      alert("Data de nascimento inválida. Confira dia, mês e ano.");
      return "INVALIDA";
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataObj.setHours(0, 0, 0, 0);

    if (dataObj > hoje) {
      alert("Data de nascimento inválida. A data não pode ser no futuro.");
      return "INVALIDA";
    }

    const idadeMaxima = 120;
    const dataMinima = new Date(
      hoje.getFullYear() - idadeMaxima,
      hoje.getMonth(),
      hoje.getDate()
    );

    if (dataObj < dataMinima) {
      alert("Data de nascimento inválida. Confira o ano informado.");
      return "INVALIDA";
    }

    return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(
      2,
      "0"
    )}`;
  }

  async function salvar() {
    if (salvandoRef.current) return;

    salvandoRef.current = true;

    if (salvando) {
      salvandoRef.current = false;
      return;
    }

    if (processandoFoto) {
      alert(
        "A foto ainda está sendo carregada. Aguarde a prévia aparecer antes de salvar."
      );
      salvandoRef.current = false;
      return;
    }

    if (!foto || !preview) {
      alert("Envie uma foto antes de salvar o cadastro.");
      salvandoRef.current = false;
      return;
    }

    if (!nome.trim()) {
      alert("Preencha o nome.");
      salvandoRef.current = false;
      return;
    }

    if (!telefoneValido(telefone1)) {
      alert("Telefone principal inválido. Informe um telefone com DDD.");
      salvandoRef.current = false;
      return;
    }

    if (telefone2 && !telefoneValido(telefone2)) {
      alert("Telefone 2 inválido. Informe um telefone com DDD ou deixe em branco.");
      salvandoRef.current = false;
      return;
    }

    const dataNascimentoFormatada = formatarDataISO(dataNascTexto);

    if (dataNascimentoFormatada === "INVALIDA") {
      salvandoRef.current = false;
      return;
    }

    const telefone1Limpo = limparTelefone(telefone1);
    const telefone2Limpo = limparTelefone(telefone2);

    setSalvando(true);

    try {
      const { data: tagAtual, error: checkError } = await supabase
        .from("tags")
        .select("locked,tipo")
        .eq("code", code)
        .single();

      if (checkError || !tagAtual) {
        console.error("Erro ao verificar código:", checkError);
        alert("Código não encontrado ou indisponível.");
        return;
      }

      if (tagAtual.locked) {
        window.location.href =
          tagAtual.tipo === "pet" ? `/pet/${code}` : `/pessoa/${code}`;
        return;
      }

      let foto_url = null;

      if (foto) {
        const fileName = `${code}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, foto, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error("Erro no upload da foto:", uploadError);
          alert(
            "Erro ao enviar a foto: " +
              (uploadError.message || "erro desconhecido")
          );
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        foto_url = publicUrlData.publicUrl;
      }

      const updateData = {
        name: nome.trim(),
        data_nascimento: dataNascimentoFormatada,
        tipo_sanguineo: tipoSanguineo,

        tutor1_nome: tutor1Nome.trim(),
        tutor1_telefone: telefone1Limpo,

        tutor2_nome: tutor2Nome.trim(),
        tutor2_telefone: telefone2Limpo,

        comorbidades: comorbidades.trim(),
        alergias: alergias.trim(),
        medicamentos: medicamentos.trim(),

        tipo: "pessoa",
        locked: true,
      };

      if (foto_url) {
        updateData.foto_url = foto_url;
      }

      const { data: tagSalva, error } = await supabase
        .from("tags")
        .update(updateData)
        .eq("code", code)
        .eq("locked", false)
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Erro Supabase ao salvar pessoa:", error);

        const { data: tagDepoisErro } = await supabase
          .from("tags")
          .select("*")
          .eq("code", code)
          .maybeSingle();

        if (tagDepoisErro?.locked && tagDepoisErro?.tipo) {
          window.location.href =
            tagDepoisErro.tipo === "pet" ? `/pet/${code}` : `/pessoa/${code}`;
          return;
        }

        alert("Erro ao salvar: " + (error.message || "erro desconhecido"));
        return;
      }

      if (!tagSalva) {
        console.error(
          "Nenhuma linha foi atualizada. Possível código já bloqueado ou condição locked=false não atendida."
        );

        const { data: tagAtualizada } = await supabase
          .from("tags")
          .select("*")
          .eq("code", code)
          .maybeSingle();

        if (tagAtualizada?.locked && tagAtualizada?.name && tagAtualizada?.tipo) {
          window.location.href =
            tagAtualizada.tipo === "pet" ? `/pet/${code}` : `/pessoa/${code}`;
          return;
        }

        alert(
          "Não foi possível confirmar o salvamento. Recarregue a página e tente novamente."
        );
        return;
      }

      window.location.href = `/pessoa/${tagSalva.code}?v=${Date.now()}`;
    } catch (err) {
      console.error("Erro inesperado ao salvar pessoa:", err);
      alert("Erro inesperado ao salvar. Tente novamente.");
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  }

  return (
    <TapLayout footerType="simple" productType="pessoa" code={code}>
      <TapHero
        variant="form"
        title="Cadastre seus dados"
        subtitle="Ficha médica de emergência"
        code={code}
      />

      <TapSecurityNotice>
        Não pedimos dados sensíveis como documentos ou dados bancários.
      </TapSecurityNotice>

      <TapCard>
        <TapSectionTitle
          icon="👤"
          title="Dados Pessoais"
          subtitle="Essas informações serão exibidas em caso de emergência."
        />

        <div style={photoRow}>
          <div
            style={fotoCircle}
            onClick={() => {
              if (!processandoFoto && !salvando) {
                document.getElementById("fileInput").click();
              }
            }}
          >
            {preview ? (
              <img src={preview} style={imgCircle} alt="Prévia da foto" />
            ) : (
              <span style={fotoIcon}>👤</span>
            )}

            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFoto}
              style={{ display: "none" }}
              disabled={processandoFoto || salvando}
            />
          </div>

          <div style={photoTextBox}>
            <button
              type="button"
              onClick={() => document.getElementById("fileInput").click()}
              style={uploadButton}
              disabled={processandoFoto || salvando}
            >
              {processandoFoto ? "Processando foto..." : "⬆️ Enviar foto"}
            </button>

            <p style={uploadHint}>
              A foto é obrigatória. Aguarde a prévia aparecer antes de salvar.
            </p>
          </div>
        </div>

        <label style={label}>Nome completo *</label>
        <input
          placeholder="Seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={input}
          disabled={salvando}
        />

        <div style={twoColumns}>
          <div>
            <label style={label}>Nascimento</label>
            <input
              placeholder="__/__/____"
              value={dataNascTexto}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "");

                if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);

                setDataNascTexto(v);
              }}
              style={input}
              disabled={salvando}
            />
          </div>

          <div>
            <label style={label}>Tipo sanguíneo</label>
            <select
              value={tipoSanguineo}
              onChange={(e) => setTipoSanguineo(e.target.value)}
              style={input}
              disabled={salvando}
            >
              <option value="">Selecione</option>
              <option>O+</option>
              <option>O-</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
            </select>
          </div>
        </div>
      </TapCard>

      <TapCard>
        <TapSectionTitle
          icon="〽️"
          title="Dados Médicos"
          subtitle="Essas informações ajudam em uma situação de emergência."
        />

        <label style={label}>Comorbidades</label>
        <textarea
          placeholder="Ex: Diabetes tipo 2, hipertensão..."
          value={comorbidades}
          onChange={(e) => setComorbidades(e.target.value)}
          style={textarea}
          disabled={salvando}
        />

        <label style={label}>Alergias</label>
        <textarea
          placeholder="Ex: Penicilina, dipirona, amendoim..."
          value={alergias}
          onChange={(e) => setAlergias(e.target.value)}
          style={textarea}
          disabled={salvando}
        />

        <label style={label}>Medicamentos de uso contínuo</label>
        <textarea
          placeholder="Ex: Metformina 850mg 2x/dia..."
          value={medicamentos}
          onChange={(e) => setMedicamentos(e.target.value)}
          style={textarea}
          disabled={salvando}
        />
      </TapCard>

      <TapCard>
        <TapSectionTitle icon="📞" title="Contatos de Emergência" />

        <div style={contactBox}>
          <h3 style={contactTitle}>Contato 1</h3>

          <label style={labelSmall}>Nome</label>
          <input
            placeholder="Nome do contato"
            value={tutor1Nome}
            onChange={(e) => setTutor1Nome(e.target.value)}
            style={input}
            disabled={salvando}
          />

          <label style={labelSmall}>Telefone *</label>
          <input
            placeholder="(00) 00000-0000"
            value={telefone1}
            onChange={(e) =>
              setTelefone1(e.target.value.replace(/[^0-9()\- ]/g, ""))
            }
            style={input}
            disabled={salvando}
          />
        </div>

        <div style={contactBox}>
          <h3 style={contactTitle}>Contato 2</h3>

          <label style={labelSmall}>Nome</label>
          <input
            placeholder="Nome do contato"
            value={tutor2Nome}
            onChange={(e) => setTutor2Nome(e.target.value)}
            style={input}
            disabled={salvando}
          />

          <label style={labelSmall}>Telefone</label>
          <input
            placeholder="(00) 00000-0000"
            value={telefone2}
            onChange={(e) =>
              setTelefone2(e.target.value.replace(/[^0-9()\- ]/g, ""))
            }
            style={input}
            disabled={salvando}
          />
        </div>
      </TapCard>

      <TapWarningBox>
        Para segurança e eficiência do produto, após salvar os dados não são
        alterados. Revise antes de salvar.
      </TapWarningBox>

      <TapPrimaryButton onClick={salvar} disabled={salvando || processandoFoto}>
        {salvando
          ? "Salvando..."
          : processandoFoto
          ? "Processando foto..."
          : "💾 Salvar dados"}
      </TapPrimaryButton>

      <p style={obs}>* Campos obrigatórios</p>
    </TapLayout>
  );
}

/* 🎨 ESTILOS VISUAIS DA TELA */

const photoRow = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
};

const fotoCircle = {
  width: 120,
  height: 120,
  minWidth: 120,
  borderRadius: "50%",
  background: "#fbe2e2",
  border: "5px solid #f3caca",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  overflow: "hidden",
};

const imgCircle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
};

const fotoIcon = {
  color: "#ef1c1c",
  fontSize: 48,
};

const photoTextBox = {
  flex: 1,
};

const uploadButton = {
  width: "auto",
  background: "transparent",
  color: "#ef1c1c",
  border: "none",
  padding: 0,
  margin: 0,
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
  textAlign: "left",
};

const uploadHint = {
  margin: "10px 0 0",
  color: "#777",
  fontSize: 14,
};

const label = {
  display: "block",
  margin: "16px 0 8px",
  color: "#111",
  fontWeight: 800,
  fontSize: 15,
};

const labelSmall = {
  display: "block",
  margin: "16px 0 8px",
  color: "#666",
  fontWeight: 850,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: ".4px",
};

const input = {
  width: "100%",
  minHeight: 56,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #e5e5e5",
  background: "#fff",
  fontSize: 16,
  color: "#222",
  outline: "none",
  margin: 0,
};

const textarea = {
  ...input,
  minHeight: 108,
  resize: "vertical",
  lineHeight: 1.4,
};

const twoColumns = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const contactBox = {
  background: "#fafafa",
  border: "1px solid #f0f0f0",
  borderRadius: 18,
  padding: 18,
  marginTop: 16,
};

const contactTitle = {
  margin: "0 0 12px",
  color: "#d71920",
  fontSize: 18,
  fontWeight: 900,
};

const obs = {
  textAlign: "center",
  fontSize: 12,
  color: "#999",
  margin: "12px 0 0",
};