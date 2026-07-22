import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  limparCodigoPro,
  codigoProValido,
  getProfessionalActivationByCode,
  ativarProfessionalProfilePorCodigo,
  salvarAcessoPro,
  uploadImagemPro,
} from "../../lib/tappro";

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d4d4d4",
  fontSize: "16px",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontWeight: 700,
  marginBottom: "6px",
};

const fieldStyle = {
  marginBottom: "18px",
};

const checkboxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  marginTop: "8px",
};

export default function ProCadastro() {
  const { code } = useParams();
  const navigate = useNavigate();

  const cleanCode = limparCodigoPro(code);

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [logoFile, setLogoFile] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");

  const [form, setForm] = useState({
    page_template: "classico",
    color_palette: "dourado",

    logo_url: "",
    mostrar_logo: true,

    foto_url: "",
    mostrar_foto: true,

    nome: "",
    titulo_profissional: "",

    empresa: "",
    mostrar_empresa: true,

    descricao: "",
    mostrar_descricao: true,

    whatsapp: "",

    telefone: "",
    mostrar_telefone: false,

    email: "",
    mostrar_email: true,

    instagram: "",
    mostrar_instagram: true,

    linkedin: "",
    mostrar_linkedin: true,

    site: "",
    mostrar_site: true,

    area_atendimento: "",
    mostrar_area_atendimento: true,

    endereco_comercial: "",
    mostrar_endereco: false,

    maps_url: "",
    mostrar_maps: false,

    servico_1: "",
    servico_2: "",
    servico_3: "",
    servico_4: "",
    mostrar_servicos: true,

    especialidade_1: "",
    especialidade_2: "",
    especialidade_3: "",
    especialidade_4: "",
    especialidade_5: "",
    mostrar_especialidades: true,

    whatsapp_mensagem: "",
  });

  useEffect(() => {
    async function carregar() {
      if (!codigoProValido(cleanCode)) {
        setErro("Código TAP PRO inválido.");
        setLoading(false);
        return;
      }

      const { data, error } = await getProfessionalActivationByCode(cleanCode);

      if (error) {
        console.error(error);
        setErro("Não foi possível carregar este código.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErro("Código TAP PRO não encontrado.");
        setLoading(false);
        return;
      }

      if (data.active) {
        salvarAcessoPro(cleanCode);
        navigate(`/pro/editar/${cleanCode}`, {
          replace: true,
        });
        return;
      }

      setLoading(false);
    }

    carregar();
  }, [cleanCode, navigate]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageChange(e, tipo) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErro("Escolha um arquivo de imagem válido.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErro("A imagem deve ter no máximo 8 MB.");
      return;
    }

    const preview = URL.createObjectURL(file);

    if (tipo === "logo") {
      setLogoFile(file);
      setLogoPreview(preview);
    }

    if (tipo === "foto") {
      setFotoFile(file);
      setFotoPreview(preview);
    }
  }

  function limparTelefone(valor) {
    return String(valor || "").replace(/\D/g, "");
  }

  function validar() {
    if (!form.nome.trim()) {
      return "Informe seu nome profissional.";
    }

    if (!form.titulo_profissional.trim()) {
      return "Informe seu título profissional.";
    }

    const whatsappLimpo = limparTelefone(form.whatsapp);

    if (whatsappLimpo.length < 10 || whatsappLimpo.length > 13) {
      return "Informe um WhatsApp válido com DDD.";
    }

    if (
      !form.email_acesso.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email_acesso.trim()
      )
    ) {
      return "Informe um e-mail de acesso válido.";
    }

    if (!form.senha || form.senha.length < 6) {
      return "Crie uma senha com pelo menos 6 caracteres.";
    }

    if (form.senha !== form.confirmar_senha) {
      return "As senhas não conferem.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const erroValidacao = validar();

    if (erroValidacao) {
      setErro(erroValidacao);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      const whatsappLimpo = limparTelefone(form.whatsapp);
      const telefoneLimpo = limparTelefone(form.telefone);

      let logo_url = "";
      let foto_url = "";

      if (logoFile) {
        const { url, error } = await uploadImagemPro(cleanCode, logoFile, "logo");

        if (error) {
          console.error(error);
          setErro("Não foi possível salvar o logo. Tente outra imagem.");
          setSalvando(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        logo_url = url;
      }

      if (fotoFile) {
        const { url, error } = await uploadImagemPro(cleanCode, fotoFile, "foto");

        if (error) {
          console.error(error);
          setErro("Não foi possível salvar a foto. Tente outra imagem.");
          setSalvando(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        foto_url = url;
      }

      const payload = {
        ...form,
        logo_url,
        foto_url,
        whatsapp: whatsappLimpo,
        telefone: telefoneLimpo || "",
      };

      const { error } =
        await ativarProfessionalProfilePorCodigo(
          cleanCode,
          payload
        );

      if (error) {
        console.error(error);
        setErro("Não foi possível salvar seu perfil. Tente novamente.");
        setSalvando(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      salvarAcessoPro(cleanCode);

      navigate(`/pro/editar/${cleanCode}`, {
        replace: true,
      });
    } catch (e) {
      console.error(e);
      setErro("Erro inesperado ao salvar o perfil.");
      setSalvando(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h1>TAP PRO</h1>
        <p>Carregando cadastro...</p>
      </main>
    );
  }

  if (erro && !salvando && !codigoProValido(cleanCode)) {
    return (
      <main style={{ padding: 24 }}>
        <h1>TAP PRO</h1>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "24px 16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px" }}>
          Cadastro Profissional TAP PRO
        </h1>

        <p style={{ color: "#666", marginTop: "8px" }}>
          Código: <strong>{cleanCode}</strong>
        </p>

        <p style={{ color: "#444", lineHeight: 1.5 }}>
          Preencha as informações principais do seu perfil profissional.
          Depois você poderá editar e melhorar sua página.
        </p>

        {erro && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "18px",
              fontWeight: 700,
            }}
          >
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h2>1. Visual da página</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Modelo da página</label>
            <select
              name="page_template"
              value={form.page_template}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="classico">Clássico</option>
              <option value="moderno">Moderno</option>
              <option value="minimalista">Minimalista</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Cor principal</label>
            <select
              name="color_palette"
              value={form.color_palette}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="dourado">Dourado profissional</option>
              <option value="azul">Azul confiança</option>
              <option value="preto">Preto premium</option>
              <option value="verde">Verde negócios</option>
              <option value="vinho">Vinho elegante</option>
              <option value="cinza">Cinza minimalista</option>
            </select>
          </div>

          <h2>2. Identidade profissional</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Logo da empresa</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "logo")}
              style={inputStyle}
            />

            {logoPreview && (
              <img
                src={logoPreview}
                alt="Prévia do logo"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "contain",
                  borderRadius: "14px",
                  border: "1px solid #ddd",
                  marginTop: "10px",
                  background: "#fff",
                }}
              />
            )}

            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_logo"
                checked={form.mostrar_logo}
                onChange={handleChange}
              />
              Mostrar logo no perfil
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Foto profissional</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "foto")}
              style={inputStyle}
            />

            {fotoPreview && (
              <img
                src={fotoPreview}
                alt="Prévia da foto"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  marginTop: "10px",
                }}
              />
            )}

            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_foto"
                checked={form.mostrar_foto}
                onChange={handleChange}
              />
              Mostrar foto no perfil
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Nome profissional *</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Mariana Costa"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Título profissional *</label>
            <input
              name="titulo_profissional"
              value={form.titulo_profissional}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Consultora Comercial"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Empresa</label>
            <input
              name="empresa"
              value={form.empresa}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Costa Soluções"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_empresa"
                checked={form.mostrar_empresa}
                onChange={handleChange}
              />
              Mostrar empresa no perfil
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Descrição curta</label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: "90px" }}
              maxLength={220}
              placeholder="Ex: Ajudo empresas a melhorarem seus processos comerciais com atendimento consultivo e soluções personalizadas."
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_descricao"
                checked={form.mostrar_descricao}
                onChange={handleChange}
              />
              Mostrar descrição no perfil
            </label>
          </div>

          <h2>3. Contato</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>WhatsApp *</label>
            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: 11987654321"
              inputMode="numeric"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: 1133334444"
              inputMode="numeric"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_telefone"
                checked={form.mostrar_telefone}
                onChange={handleChange}
              />
              Mostrar telefone no perfil
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>E-mail</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: contato@costasolucoes.com.br"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_email"
                checked={form.mostrar_email}
                onChange={handleChange}
              />
              Mostrar e-mail no perfil
            </label>
          </div>

          <h2>4. Links profissionais</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Instagram</label>
            <input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: https://instagram.com/costasolucoes"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_instagram"
                checked={form.mostrar_instagram}
                onChange={handleChange}
              />
              Mostrar Instagram no perfil
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>LinkedIn</label>
            <input
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: https://linkedin.com/in/marianacosta"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_linkedin"
                checked={form.mostrar_linkedin}
                onChange={handleChange}
              />
              Mostrar LinkedIn no perfil
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Site</label>
            <input
              name="site"
              value={form.site}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: https://costasolucoes.com.br"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_site"
                checked={form.mostrar_site}
                onChange={handleChange}
              />
              Mostrar site no perfil
            </label>
          </div>

          <h2>5. Atendimento e localização</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Área de atendimento</label>
            <input
              name="area_atendimento"
              value={form.area_atendimento}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: São Paulo e região"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_area_atendimento"
                checked={form.mostrar_area_atendimento}
                onChange={handleChange}
              />
              Mostrar área de atendimento no perfil
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Endereço comercial</label>
            <input
              name="endereco_comercial"
              value={form.endereco_comercial}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Av. Paulista, 1000 - São Paulo - SP"
            />
            <small style={{ color: "#666" }}>
              Use apenas endereço comercial. Evite cadastrar endereço residencial.
            </small>
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_endereco"
                checked={form.mostrar_endereco}
                onChange={handleChange}
              />
              Mostrar endereço no perfil
            </label>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Link do Google Maps</label>
            <input
              name="maps_url"
              value={form.maps_url}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: https://maps.google.com/..."
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_maps"
                checked={form.mostrar_maps}
                onChange={handleChange}
              />
              Mostrar botão de mapa no perfil
            </label>
          </div>

          <h2>6. Serviços</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Serviço 1</label>
            <input
              name="servico_1"
              value={form.servico_1}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Consultoria"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Serviço 2</label>
            <input
              name="servico_2"
              value={form.servico_2}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Atendimento empresarial"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Serviço 3</label>
            <input
              name="servico_3"
              value={form.servico_3}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Projetos personalizados"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Serviço 4</label>
            <input
              name="servico_4"
              value={form.servico_4}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Suporte especializado"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_servicos"
                checked={form.mostrar_servicos}
                onChange={handleChange}
              />
              Mostrar serviços no perfil
            </label>
          </div>

          <h2>7. Especialidades</h2>

          <div style={fieldStyle}>
            <label style={labelStyle}>Especialidade 1</label>
            <input
              name="especialidade_1"
              value={form.especialidade_1}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Vendas"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Especialidade 2</label>
            <input
              name="especialidade_2"
              value={form.especialidade_2}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Relacionamento com clientes"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Especialidade 3</label>
            <input
              name="especialidade_3"
              value={form.especialidade_3}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Gestão comercial"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Especialidade 4</label>
            <input
              name="especialidade_4"
              value={form.especialidade_4}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Atendimento corporativo"
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Especialidade 5</label>
            <input
              name="especialidade_5"
              value={form.especialidade_5}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Estratégia"
            />
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                name="mostrar_especialidades"
                checked={form.mostrar_especialidades}
                onChange={handleChange}
              />
              Mostrar especialidades no perfil
            </label>
          </div>

          <h2>8. Finalizar cadastro</h2>

          <p
            style={{
              color: "#555",
              lineHeight: 1.5,
              marginTop: "-4px",
            }}
          >
            O código único da peça será usado para abrir e editar este painel.
          </p>

          <button
            type="submit"
            disabled={salvando}
            style={{
              width: "100%",
              padding: "16px",
              border: "none",
              borderRadius: "12px",
              background: salvando ? "#999" : "#111827",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 800,
              cursor: salvando ? "not-allowed" : "pointer",
              marginTop: "12px",
            }}
          >
            {salvando ? "Salvando..." : "Ativar perfil profissional"}
          </button>
        </form>
      </section>
    </main>
  );
}