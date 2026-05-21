import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminEdit() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tag, setTag] = useState(null);

  const [form, setForm] = useState({
    name: "",
    tipo: "",
    data_nascimento: "",
    tipo_sanguineo: "",
    tutor1_nome: "",
    tutor1_telefone: "",
    tutor2_nome: "",
    tutor2_telefone: "",
    comorbidades: "",
    alergias: "",
    medicamentos: "",
    observacoes: "",
    foto_url: "",
    locked: false,
    printed: false,
  });

  useEffect(() => {
    carregar();
  }, [code]);

  async function carregar() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      alert("Código não encontrado");
      navigate("/admin");
      return;
    }

    setTag(data);

    setForm({
      name: data.name || "",
      tipo: data.tipo || "",
      data_nascimento: data.data_nascimento || "",
      tipo_sanguineo: data.tipo_sanguineo || "",
      tutor1_nome: data.tutor1_nome || "",
      tutor1_telefone: data.tutor1_telefone || "",
      tutor2_nome: data.tutor2_nome || "",
      tutor2_telefone: data.tutor2_telefone || "",
      comorbidades: data.comorbidades || "",
      alergias: data.alergias || "",
      medicamentos: data.medicamentos || "",
      observacoes: data.observacoes || "",
      foto_url: data.foto_url || "",
      locked: Boolean(data.locked),
      printed: Boolean(data.printed),
    });

    setLoading(false);
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function salvar() {
    if (salvando) return;

    if (!code) {
      alert("Código inválido");
      return;
    }

    if (!confirm("Salvar alterações deste cadastro?")) return;

    setSalvando(true);

    const updateData = {
      name: form.name || null,
      tipo: form.tipo || null,
      data_nascimento: form.data_nascimento || null,
      tipo_sanguineo: form.tipo_sanguineo || null,

      tutor1_nome: form.tutor1_nome || null,
      tutor1_telefone: form.tutor1_telefone || null,

      tutor2_nome: form.tutor2_nome || null,
      tutor2_telefone: form.tutor2_telefone || null,

      comorbidades: form.comorbidades || null,
      alergias: form.alergias || null,
      medicamentos: form.medicamentos || null,
      observacoes: form.observacoes || null,
      foto_url: form.foto_url || null,

      locked: form.locked,
      printed: form.printed,
    };

    const { error } = await supabase
      .from("tags")
      .update(updateData)
      .eq("code", code);

    setSalvando(false);

    if (error) {
      console.error(error);
      alert("Erro ao salvar alterações: " + (error.message || "erro desconhecido"));
      return;
    }

    alert("Cadastro atualizado com sucesso!");
    navigate("/admin");
  }

  function abrirView() {
    if (form.tipo === "pet") {
      window.open(`/pet/${code}`, "_blank");
      return;
    }

    if (form.tipo === "pessoa") {
      window.open(`/pessoa/${code}`, "_blank");
      return;
    }

    window.open(`/escolha/${code}`, "_blank");
  }

  if (loading) {
    return (
      <div style={page}>
        <div style={shell}>
          <div style={card}>
            <div style={loader}></div>
            <p style={loadingText}>Carregando cadastro...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={shell}>
        <header style={header}>
          <button type="button" onClick={() => navigate("/admin")} style={backButton}>
            ← Voltar
          </button>

          <div>
            <p style={eyebrow}>Edição administrativa</p>
            <h1 style={title}>Editar cadastro</h1>
            <p style={subtitle}>
              Código: <strong>{code}</strong>
            </p>
          </div>
        </header>

        <section style={actionsTop}>
          <button type="button" onClick={abrirView} style={buttonDark}>
            👁️ Ver página
          </button>

          <button type="button" onClick={salvar} disabled={salvando} style={buttonRed}>
            {salvando ? "Salvando..." : "💾 Salvar alterações"}
          </button>
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Status do produto</h2>

          <div style={gridTwo}>
            <div>
              <label style={label}>Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => updateField("tipo", e.target.value)}
                style={input}
              >
                <option value="">Sem tipo</option>
                <option value="pet">Pet</option>
                <option value="pessoa">Pessoa</option>
              </select>
            </div>

            <div>
              <label style={label}>Foto URL</label>
              <input
                value={form.foto_url}
                onChange={(e) => updateField("foto_url", e.target.value)}
                style={input}
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={checkboxRow}>
            <label style={checkboxLabel}>
              <input
                type="checkbox"
                checked={form.locked}
                onChange={(e) => updateField("locked", e.target.checked)}
              />
              Cadastro bloqueado / ativado
            </label>

            <label style={checkboxLabel}>
              <input
                type="checkbox"
                checked={form.printed}
                onChange={(e) => updateField("printed", e.target.checked)}
              />
              QR impresso / baixado
            </label>
          </div>
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Dados principais</h2>

          <label style={label}>Nome</label>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            style={input}
            placeholder="Nome"
          />

          {form.tipo === "pessoa" && (
            <div style={gridTwo}>
              <div>
                <label style={label}>Data de nascimento</label>
                <input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => updateField("data_nascimento", e.target.value)}
                  style={input}
                />
              </div>

              <div>
                <label style={label}>Tipo sanguíneo</label>
                <select
                  value={form.tipo_sanguineo}
                  onChange={(e) => updateField("tipo_sanguineo", e.target.value)}
                  style={input}
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
          )}
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>
            {form.tipo === "pet" ? "Tutores" : "Contatos de emergência"}
          </h2>

          <div style={contactBox}>
            <h3 style={contactTitle}>Contato 1</h3>

            <div style={gridTwo}>
              <div>
                <label style={label}>Nome</label>
                <input
                  value={form.tutor1_nome}
                  onChange={(e) => updateField("tutor1_nome", e.target.value)}
                  style={input}
                  placeholder="Nome do contato"
                />
              </div>

              <div>
                <label style={label}>Telefone</label>
                <input
                  value={form.tutor1_telefone}
                  onChange={(e) => updateField("tutor1_telefone", e.target.value)}
                  style={input}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          <div style={contactBox}>
            <h3 style={contactTitle}>Contato 2</h3>

            <div style={gridTwo}>
              <div>
                <label style={label}>Nome</label>
                <input
                  value={form.tutor2_nome}
                  onChange={(e) => updateField("tutor2_nome", e.target.value)}
                  style={input}
                  placeholder="Nome do contato"
                />
              </div>

              <div>
                <label style={label}>Telefone</label>
                <input
                  value={form.tutor2_telefone}
                  onChange={(e) => updateField("tutor2_telefone", e.target.value)}
                  style={input}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </section>

        {form.tipo === "pessoa" && (
          <section style={card}>
            <h2 style={sectionTitle}>Dados médicos</h2>

            <label style={label}>Comorbidades</label>
            <textarea
              value={form.comorbidades}
              onChange={(e) => updateField("comorbidades", e.target.value)}
              style={textarea}
            />

            <label style={label}>Alergias</label>
            <textarea
              value={form.alergias}
              onChange={(e) => updateField("alergias", e.target.value)}
              style={textarea}
            />

            <label style={label}>Medicamentos</label>
            <textarea
              value={form.medicamentos}
              onChange={(e) => updateField("medicamentos", e.target.value)}
              style={textarea}
            />
          </section>
        )}

        <section style={card}>
          <h2 style={sectionTitle}>
            {form.tipo === "pet" ? "Observações do pet" : "Observações gerais"}
          </h2>

          <textarea
            value={form.observacoes}
            onChange={(e) => updateField("observacoes", e.target.value)}
            style={textarea}
            placeholder="Observações importantes"
          />
        </section>

        <section style={actionsBottom}>
          <button type="button" onClick={() => navigate("/admin")} style={buttonDark}>
            Cancelar
          </button>

          <button type="button" onClick={salvar} disabled={salvando} style={buttonRed}>
            {salvando ? "Salvando..." : "💾 Salvar alterações"}
          </button>
        </section>
      </div>
    </div>
  );
}

/* 🎨 ESTILO ADMIN EDIT */

const page = {
  minHeight: "100vh",
  background: "#f5f5f5",
  color: "#111",
  fontFamily: "Inter, Arial, sans-serif",
};

const shell = {
  width: "100%",
  maxWidth: 920,
  margin: "0 auto",
  padding: "24px 16px 42px",
};

const header = {
  background: "#ef1c1c",
  color: "#fff",
  padding: 26,
  borderRadius: 24,
  marginBottom: 16,
  boxShadow: "0 16px 36px rgba(239,28,28,.22)",
};

const backButton = {
  width: "auto",
  minHeight: 40,
  padding: "0 14px",
  marginBottom: 18,
  borderRadius: 12,
  border: "none",
  background: "rgba(255,255,255,.18)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const eyebrow = {
  margin: "0 0 6px",
  fontSize: 13,
  fontWeight: 900,
  opacity: 0.8,
  textTransform: "uppercase",
  letterSpacing: ".5px",
};

const title = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.1,
  fontWeight: 950,
};

const subtitle = {
  margin: "10px 0 0",
  fontSize: 15,
  opacity: 0.9,
};

const actionsTop = {
  display: "flex",
  gap: 10,
  marginBottom: 14,
};

const actionsBottom = {
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  marginTop: 18,
};

const buttonBase = {
  width: "auto",
  minHeight: 48,
  padding: "0 18px",
  borderRadius: 14,
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const buttonDark = {
  ...buttonBase,
  background: "#222",
};

const buttonRed = {
  ...buttonBase,
  background: "#ef1c1c",
};

const card = {
  background: "#fff",
  borderRadius: 22,
  padding: 22,
  marginBottom: 14,
  border: "1px solid #eee",
  boxShadow: "0 12px 28px rgba(0,0,0,.08)",
};

const sectionTitle = {
  margin: "0 0 16px",
  fontSize: 22,
  fontWeight: 950,
};

const gridTwo = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const label = {
  display: "block",
  margin: "14px 0 8px",
  color: "#666",
  fontSize: 13,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".4px",
};

const input = {
  width: "100%",
  minHeight: 52,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #ddd",
  background: "#fff",
  fontSize: 15,
  outline: "none",
};

const textarea = {
  ...input,
  minHeight: 108,
  resize: "vertical",
  lineHeight: 1.45,
};

const checkboxRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  marginTop: 18,
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#333",
  fontWeight: 800,
};

const contactBox = {
  background: "#fafafa",
  border: "1px solid #f0f0f0",
  borderRadius: 18,
  padding: 18,
  marginTop: 14,
};

const contactTitle = {
  margin: 0,
  color: "#d71920",
  fontSize: 18,
  fontWeight: 900,
};

const loadingText = {
  margin: "14px 0 0",
  textAlign: "center",
  color: "#777",
};

const loader = {
  width: 42,
  height: 42,
  border: "5px solid #f1f1f1",
  borderTop: "5px solid #ef1c1c",
  borderRadius: "50%",
  margin: "0 auto",
  animation: "spin 1s linear infinite",
};