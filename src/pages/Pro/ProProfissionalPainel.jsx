import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  atualizarProfissionalNovoPro,
  solicitarModuloPerfilPro,
  criarCheckoutModuloPro,
  codigoProValido,
  getProfessionalDashboardNovoPro,
  listarCatalogoModulosClientePro,
  limparCodigoPro,
  obterAcessoAdminPro,
  uploadImagemPro,
} from "../../lib/tappro";

const MODULES = [
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
  ["website", "Site"],
  ["portfolio", "Portfólio"],
  ["scheduling", "Agendamento"],
  ["maps", "Localização"],
  ["company_page", "Conheça a empresa"],
  ["email", "E-mail"],
  ["phone", "Telefone"],
];

const GOALS = {
  auto: {
    title: "Automático",
    result:
      "O TAP PRO usa a melhor ação disponível.",
    tip:
      "Boa opção para começar.",
  },
  whatsapp: {
    title: "Mais contatos",
    result:
      "A chamada final leva as pessoas ao WhatsApp.",
    tip:
      "Ideal para orçamento e atendimento.",
  },
  scheduling: {
    title: "Mais agendamentos",
    result:
      "A chamada final incentiva o agendamento.",
    tip:
      "Cadastre um link de agenda atualizado.",
  },
  instagram: {
    title: "Mais seguidores",
    result:
      "A chamada final convida a acompanhar seu Instagram.",
    tip:
      "Use conteúdo recente e profissional.",
  },
  portfolio: {
    title: "Mais visitas ao portfólio",
    result:
      "A chamada final mostra seus trabalhos.",
    tip:
      "Destaque projetos e resultados.",
  },
  share: {
    title: "Mais indicações",
    result:
      "A chamada final incentiva o compartilhamento do perfil.",
    tip:
      "Ideal para profissionais que crescem por indicação.",
  },
  company_page: {
    title: "Apresentar minha empresa",
    result:
      "A chamada final conecta seu perfil à página da empresa.",
    tip:
      "Use quando sua empresa também tiver uma página TAP PRO.",
  },
};

const initial = {
  professional_name: "",
  professional_title: "",
  company_name: "",
  description: "",
  photo_url: "",
  logo_url: "",
  whatsapp: "",
  phone: "",
  email: "",
  instagram: "",
  linkedin: "",
  website: "",
  maps_url: "",
  area_service: "",
  portfolio_url: "",
  scheduling_url: "",
  company_page_url: "",
  service_1: "",
  service_2: "",
  service_3: "",
  service_4: "",
  specialty_1: "",
  specialty_2: "",
  specialty_3: "",
  specialty_4: "",
  specialty_5: "",
  primary_goal: "auto",
};

const input = {
  width: "100%",
  minHeight: 48,
  padding: "12px 13px",
  borderRadius: 11,
  border: "1px solid #d1d5db",
  boxSizing: "border-box",
  fontSize: 15,
  background: "#ffffff",
  color: "#111827",
};

const card = {
  marginTop: 18,
  padding: 22,
  borderRadius: 20,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 12px 30px rgba(0,0,0,0.06)",
};

function Field({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div style={{marginBottom:16}}>
      <label
        style={{
          display:"block",
          marginBottom:7,
          fontWeight:800,
        }}
      >
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        style={input}
      />
    </div>
  );
}

function digits(value) {
  return String(value || "").replace(
    /\D/g,
    ""
  );
}


function formatarPrecoModulo(
  item
) {
  if (
    item.billing_type === "free"
  ) {
    return "Gratuito";
  }

  const preco = (
    Number(
      item.price_cents || 0
    ) / 100
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  if (
    item.billing_type === "monthly"
  ) {
    return `${preco}/mês`;
  }

  if (
    item.billing_type === "annual"
  ) {
    return `${preco}/ano`;
  }

  return preco;
}

function ModuloCatalogoCard({
  item,
  aberto,
  onToggle,
  onRequest,
  processing,
}) {
  const ativoNoPerfil =
    item.profile_module_status ===
      "active" ||
    item.profile_module_status ===
      "included" ||
    item.profile_module_status ===
      "trial";

  const pedidoPendente =
    item.order_status ===
      "pending";

  const testeDisponivel =
    Number(
      item.trial_days || 0
    ) > 0 &&
    !item.trial_used_at;

  return (
    <article
      style={{
        padding: "17px",
        borderRadius: "16px",
        background: "#ffffff",
        border: item.is_featured
          ? "1px solid #d6c39c"
          : "1px solid #e5e7eb",
        boxShadow:
          "0 8px 22px rgba(17,24,39,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <div>
          {item.is_featured && (
            <p
              style={{
                margin: "0 0 5px",
                color: "#b8892f",
                fontSize: "11px",
                fontWeight: 900,
                textTransform:
                  "uppercase",
                letterSpacing: "0.7px",
              }}
            >
              Recomendado
            </p>
          )}

          <h3
            style={{
              margin: 0,
              fontSize: "18px",
            }}
          >
            {item.name}
          </h3>
        </div>

        <span
          style={{
            padding: "6px 9px",
            borderRadius: "999px",
            background: ativoNoPerfil
              ? "#dcfce7"
              : "#f3f4f6",
            color: ativoNoPerfil
              ? "#166534"
              : "#374151",
            fontSize: "12px",
            fontWeight: 850,
            whiteSpace: "nowrap",
          }}
        >
          {ativoNoPerfil
            ? item.profile_module_status ===
              "trial"
              ? "Em teste"
              : "Ativo"
            : pedidoPendente
              ? "Solicitado"
              : formatarPrecoModulo(
                  item
                )}
        </span>
      </div>

      {item.short_description && (
        <p
          style={{
            margin: "10px 0 0",
            color: "#4b5563",
            lineHeight: 1.5,
            fontSize: "14px",
          }}
        >
          {item.short_description}
        </p>
      )}

      {item.trial_days > 0 &&
        !ativoNoPerfil && (
          <p
            style={{
              margin: "9px 0 0",
              color: "#8a641f",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            {item.trial_days} dias de teste
          </p>
        )}

      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          minHeight: "44px",
          marginTop: "14px",
          borderRadius: "11px",
          border: ativoNoPerfil
            ? "1px solid #bbf7d0"
            : "1px solid #d1d5db",
          background: ativoNoPerfil
            ? "#f0fdf4"
            : "#ffffff",
          color: ativoNoPerfil
            ? "#166534"
            : "#374151",
          fontWeight: 850,
          cursor: "pointer",
        }}
      >
        {ativoNoPerfil
          ? "Ver detalhes"
          : aberto
            ? "Fechar detalhes"
            : "Conhecer módulo"}
      </button>

      {!ativoNoPerfil && (
        <button
          type="button"
          disabled={processing}
          onClick={onRequest}
          style={{
            width: "100%",
            minHeight: "44px",
            marginTop: "9px",
            borderRadius: "11px",
            border: "none",
            background: processing
              ? "#9ca3af"
              : "#111827",
            color: "#ffffff",
            fontWeight: 850,
            cursor: processing
              ? "not-allowed"
              : "pointer",
          }}
        >
          {processing
            ? "Processando..."
            : testeDisponivel
              ? "Ativar teste grátis"
              : pedidoPendente
                ? "Continuar pagamento"
                : "Comprar agora"}
        </button>
      )}

      {pedidoPendente && (
        <div
          style={{
            marginTop: "9px",
            padding: "10px 11px",
            borderRadius: "10px",
            background: "#fffaf0",
            border: "1px solid #e6d7b8",
            color: "#8a641f",
            fontSize: "13px",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          Pagamento ainda não concluído
        </div>
      )}

      {aberto && (
        <div
          style={{
            marginTop: "11px",
            padding: "12px",
            borderRadius: "11px",
            background: "#fafafa",
            border: "1px solid #e5e7eb",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#374151",
              lineHeight: 1.5,
              fontSize: "13px",
            }}
          >
            {item.benefit ||
              "Este módulo adiciona novos recursos à sua página TAP PRO."}
          </p>

          {!ativoNoPerfil && (
              <p
                style={{
                  margin: "9px 0 0",
                  color: "#6b7280",
                  fontSize: "12px",
                  lineHeight: 1.45,
                }}
              >
                Testes são liberados imediatamente. Compras são ativadas automaticamente após a confirmação do pagamento.
              </p>
            )}
        </div>
      )}
    </article>
  );
}

export default function ProProfissionalPainel() {
  const { accessCode } =
    useParams();

  const navigate = useNavigate();

  const cleanCode =
    limparCodigoPro(accessCode);

  const [loading, setLoading] =
    useState(true);

  const [catalogoModulos, setCatalogoModulos] =
    useState([]);

  const [catalogoLoading, setCatalogoLoading] =
    useState(true);

  const [moduloAberto, setModuloAberto] =
    useState("");

  const [moduloProcessando, setModuloProcessando] =
    useState("");

  const [mensagemModulo, setMensagemModulo] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [data, setData] =
    useState(null);

  const [form, setForm] =
    useState(initial);

  const [top3, setTop3] =
    useState([]);

  const [photoFile, setPhotoFile] =
    useState(null);

  const [logoFile, setLogoFile] =
    useState(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [logoPreview, setLogoPreview] =
    useState("");

  useEffect(() => {
    async function load() {
      if (
        !codigoProValido(cleanCode) ||
        obterAcessoAdminPro() !==
          cleanCode
      ) {
        setError(
          "Acesso administrativo não autorizado."
        );
        setLoading(false);
        return;
      }

      const { data, error } =
        await getProfessionalDashboardNovoPro(
          cleanCode
        );

      if (
        error ||
        !data?.found
      ) {
        console.error(error);
        setError(
          "Não foi possível carregar o painel profissional."
        );
        setLoading(false);
        return;
      }

      setData(data);

      setForm({
        ...initial,
        ...data,
        primary_goal:
          data.primary_goal || "auto",
      });

      setTop3(
        (data.top3 || [])
          .sort(
            (a,b) =>
              a.featured_position -
              b.featured_position
          )
          .map(
            (item) =>
              item.module_code
          )
      );

      setPhotoPreview(
        data.photo_url || ""
      );

      setLogoPreview(
        data.logo_url || ""
      );

      const catalogo =
        await listarCatalogoModulosClientePro(
          cleanCode
        );

      if (catalogo.error) {
        console.error(
          "Erro ao carregar catálogo:",
          catalogo.error
        );
      } else {
        setCatalogoModulos(
          catalogo.data || []
        );
      }

      setCatalogoLoading(false);
      setLoading(false);
    }

    load();
  }, [cleanCode]);

  const strategy =
    GOALS[form.primary_goal] ||
    GOALS.auto;

  const topNames = useMemo(
    () =>
      top3.map(
        (code) =>
          MODULES.find(
            (item) => item[0] === code
          )?.[1] || code
      ),
    [top3]
  );

  function change(event) {
    const { name, value } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggle(code) {
    setTop3((prev) => {
      if (prev.includes(code)) {
        return prev.filter(
          (item) => item !== code
        );
      }

      if (prev.length >= 3) {
        setError(
          "Você já escolheu 3 destaques."
        );
        return prev;
      }

      return [...prev, code];
    });
  }

  function file(event, type) {
    const selected =
      event.target.files?.[0];

    if (!selected) return;

    const preview =
      URL.createObjectURL(selected);

    if (type === "photo") {
      setPhotoFile(selected);
      setPhotoPreview(preview);
    } else {
      setLogoFile(selected);
      setLogoPreview(preview);
    }
  }

  async function save(event) {
    event.preventDefault();

    if (
      !form.professional_name.trim() ||
      !form.professional_title.trim()
    ) {
      setError(
        "Preencha nome e título profissional."
      );
      return;
    }

    const whatsapp =
      digits(form.whatsapp);

    if (
      whatsapp.length < 10 ||
      whatsapp.length > 13
    ) {
      setError(
        "Informe um WhatsApp válido."
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    let photoUrl =
      form.photo_url;

    let logoUrl =
      form.logo_url;

    if (photoFile) {
      const result =
        await uploadImagemPro(
          cleanCode,
          photoFile,
          "foto"
        );

      if (result.error) {
        setError(
          "Não foi possível salvar a foto."
        );
        setSaving(false);
        return;
      }

      photoUrl = result.url;
    }

    if (logoFile) {
      const result =
        await uploadImagemPro(
          cleanCode,
          logoFile,
          "logo"
        );

      if (result.error) {
        setError(
          "Não foi possível salvar o logo."
        );
        setSaving(false);
        return;
      }

      logoUrl = result.url;
    }

    const payload = {
      ...form,
      photo_url: photoUrl,
      logo_url: logoUrl,
      whatsapp,
      phone: digits(form.phone),
    };

    const { data, error } =
      await atualizarProfissionalNovoPro(
        cleanCode,
        payload,
        top3
      );

    if (error) {
      console.error(error);
      setError(
        error.message ||
          "Não foi possível salvar."
      );
      setSaving(false);
      return;
    }

    setForm(payload);
    setPhotoPreview(photoUrl);
    setLogoPreview(logoUrl);
    setPhotoFile(null);
    setLogoFile(null);
    setSuccess(
      "Alterações salvas com sucesso."
    );
    setSaving(false);
  }


  async function solicitarModulo(
    item
  ) {
    setModuloProcessando(
      item.module_code
    );

    setMensagemModulo("");

    const testeDisponivel =
      Number(
        item.trial_days || 0
      ) > 0 &&
      !item.trial_used_at;

    if (testeDisponivel) {
      const { data, error } =
        await solicitarModuloPerfilPro(
          cleanCode,
          item.module_code
        );

      setModuloProcessando("");

      if (error) {
        console.error(error);

        const message =
          error.message ||
          "Não foi possível ativar o teste.";

        setError(message);

        return;
      }

      setMensagemModulo(
        data?.message ||
        "Teste grátis ativado."
      );
    } else {
      const { data, error } =
        await criarCheckoutModuloPro(
          cleanCode,
          item.module_code
        );

      setModuloProcessando("");

      if (error) {
        console.error(error);

        const message =
          error.message ||
          "Não foi possível iniciar o pagamento.";

        setError(message);

        return;
      }

      if (!data?.checkoutUrl) {
        const message =
          data?.message ||
          "O checkout não retornou uma URL válida.";

        setError(message);

        return;
      }

      window.location.href =
        data.checkoutUrl;

      return;
    }

    const catalogo =
      await listarCatalogoModulosClientePro(
        cleanCode
      );

    if (!catalogo.error) {
      setCatalogoModulos(
        catalogo.data || []
      );
    }
  }

  if (loading) {
    return (
      <Screen text="Carregando painel..." />
    );
  }

  if (error && !data) {
    return <Screen text={error} />;
  }

  return (
    <main
      style={{
        minHeight:"100vh",
        padding:"24px 16px 48px",
        background:"#f5f5f4",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        color:"#111827",
      }}
    >
      <style>
        {`
          .pro-grid{
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:16px;
          }
          .pro-modules{
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px;
          }
          @media(max-width:680px){
            .pro-grid,.pro-modules{
              grid-template-columns:1fr;
            }
          }
        `}
      </style>

      <section
        style={{
          maxWidth:820,
          margin:"0 auto",
        }}
      >
        <header
          style={{
            padding:27,
            borderRadius:22,
            background:
              "linear-gradient(135deg,#1c1917 0%,#6b5b3e 100%)",
            color:"#ffffff",
          }}
        >
          <p
            style={{
              margin:"0 0 7px",
              opacity:.82,
              fontWeight:750,
            }}
          >
            Painel profissional
          </p>

          <h1
            style={{
              margin:0,
              fontSize:30,
            }}
          >
            {form.professional_name}
          </h1>

          <p
            style={{
              margin:"10px 0 0",
              opacity:.94,
            }}
          >
            Atualize seu perfil e escolha o resultado que deseja gerar.
          </p>

          {photoPreview && (
            <img
              src={photoPreview}
              alt="Foto profissional"
              style={{
                width:96,
                height:96,
                objectFit:"cover",
                borderRadius:"50%",
                marginTop:16,
                border:"3px solid rgba(255,255,255,.6)",
              }}
            />
          )}
        </header>

        {error && (
          <div
            style={{
              marginTop:18,
              padding:14,
              borderRadius:13,
              background:"#fee2e2",
              color:"#991b1b",
              fontWeight:750,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop:18,
              padding:14,
              borderRadius:13,
              background:"#dcfce7",
              color:"#166534",
              fontWeight:750,
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={save}>
          <section style={card}>
            <h2>Identidade profissional</h2>

            <div className="pro-grid">
              <div>
                <label style={{fontWeight:800}}>
                  Foto profissional
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    file(e,"photo")
                  }
                  style={{
                    ...input,
                    marginTop:7,
                  }}
                />
              </div>

              <div>
                <label style={{fontWeight:800}}>
                  Logo da empresa
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    file(e,"logo")
                  }
                  style={{
                    ...input,
                    marginTop:7,
                  }}
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    style={{
                      width:110,
                      height:80,
                      objectFit:"contain",
                      marginTop:10,
                    }}
                  />
                )}
              </div>
            </div>

            <div className="pro-grid">
              <Field
                label="Nome profissional"
                name="professional_name"
                value={form.professional_name}
                onChange={change}
              />
              <Field
                label="Título ou especialidade"
                name="professional_title"
                value={form.professional_title}
                onChange={change}
              />
            </div>

            <Field
              label="Empresa"
              name="company_name"
              value={form.company_name}
              onChange={change}
            />

            <div style={{marginBottom:16}}>
              <label style={{fontWeight:800}}>
                Descrição
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={change}
                style={{
                  ...input,
                  minHeight:100,
                  marginTop:7,
                }}
              />
            </div>

            <div className="pro-grid">
              <Field
                label="WhatsApp"
                name="whatsapp"
                value={form.whatsapp}
                onChange={change}
              />
              <Field
                label="Área de atendimento"
                name="area_service"
                value={form.area_service}
                onChange={change}
              />
            </div>
          </section>

          <section style={card}>
            <h2>Destaques do perfil</h2>
            <p style={{color:"#6b7280"}}>
              Escolhidos: {top3.length}/3 · Restam {3-top3.length}
            </p>

            <div className="pro-modules">
              {MODULES.map(
                ([code,name]) => {
                  const selected =
                    top3.includes(code);

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        toggle(code)
                      }
                      style={{
                        padding:15,
                        borderRadius:14,
                        border:selected
                          ? "2px solid #b8892f"
                          : "1px solid #d1d5db",
                        background:selected
                          ? "#fffaf0"
                          : "#ffffff",
                        color:"#111827",
                        textAlign:"left",
                        fontWeight:800,
                        cursor:"pointer",
                      }}
                    >
                      {name}
                      {selected && (
                        <span
                          style={{
                            float:"right",
                            width:28,
                            height:28,
                            borderRadius:"50%",
                            display:"inline-flex",
                            alignItems:"center",
                            justifyContent:"center",
                            background:"#b8892f",
                            color:"#ffffff",
                          }}
                        >
                          {top3.indexOf(code)+1}
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {topNames.length > 0 && (
              <ol>
                {topNames.map(
                  (name) => (
                    <li key={name}>
                      {name}
                    </li>
                  )
                )}
              </ol>
            )}
          </section>

          <section style={card}>
            <h2>
              O que você quer gerar com este perfil?
            </h2>

            <select
              name="primary_goal"
              value={form.primary_goal}
              onChange={change}
              style={input}
            >
              <option value="auto">
                Automático
              </option>
              <option value="whatsapp">
                Mais contatos
              </option>
              <option value="scheduling">
                Mais agendamentos
              </option>
              <option value="instagram">
                Mais seguidores
              </option>
              <option value="portfolio">
                Mais visitas ao portfólio
              </option>
              <option value="share">
                Mais indicações
              </option>
              <option value="company_page">
                Apresentar minha empresa
              </option>
            </select>

            <div
              style={{
                marginTop:16,
                padding:16,
                borderRadius:14,
                background:"#fafafa",
                border:"1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  margin:"0 0 5px",
                  color:"#b8892f",
                  fontWeight:900,
                  fontSize:12,
                  textTransform:"uppercase",
                }}
              >
                Sua estratégia atual
              </p>
              <strong>{strategy.title}</strong>
              <p
                style={{
                  color:"#4b5563",
                  lineHeight:1.5,
                }}
              >
                {strategy.result}
              </p>
              <p
                style={{
                  color:"#6b7280",
                  fontSize:13,
                }}
              >
                <strong>Dica:</strong>{" "}
                {strategy.tip}
              </p>
            </div>
          </section>

          <section style={card}>
            <h2>Links e contatos</h2>
            <div className="pro-grid">
              {[
                ["phone","Telefone"],
                ["email","E-mail"],
                ["instagram","Instagram"],
                ["linkedin","LinkedIn"],
                ["website","Site"],
                ["portfolio_url","Portfólio"],
                ["scheduling_url","Agendamento"],
                ["company_page_url","Página da empresa"],
                ["maps_url","Google Maps"],
              ].map(([name,label]) => (
                <Field
                  key={name}
                  label={label}
                  name={name}
                  value={form[name] || ""}
                  onChange={change}
                />
              ))}
            </div>
          </section>

          <section style={card}>
            <h2>Serviços e especialidades</h2>
            <div className="pro-grid">
              {[1,2,3,4].map((n) => (
                <Field
                  key={`service_${n}`}
                  label={`Serviço ${n}`}
                  name={`service_${n}`}
                  value={form[`service_${n}`] || ""}
                  onChange={change}
                />
              ))}
              {[1,2,3,4,5].map((n) => (
                <Field
                  key={`specialty_${n}`}
                  label={`Especialidade ${n}`}
                  name={`specialty_${n}`}
                  value={form[`specialty_${n}`] || ""}
                  onChange={change}
                />
              ))}
            </div>
          </section>


          <section style={card}>
            <p
              style={{
                margin: "0 0 5px",
                color: "#b8892f",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Novas possibilidades
            </p>

            <h2>
              Melhore seu perfil
            </h2>

            <p
              style={{
                color: "#6b7280",
                lineHeight: 1.5,
              }}
            >
              Conheça recursos extras para apresentar melhor seu trabalho, gerar confiança e conquistar novos contatos.
            </p>

            {mensagemModulo && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "12px 13px",
                  borderRadius: "11px",
                  background: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  fontWeight: 800,
                  fontSize: "13px",
                }}
              >
                {mensagemModulo}
              </div>
            )}

            {catalogoLoading ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 13,
                  background: "#fafafa",
                  color: "#6b7280",
                }}
              >
                Carregando módulos...
              </div>
            ) : catalogoModulos.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 13,
                  background: "#fafafa",
                  color: "#6b7280",
                }}
              >
                Nenhum módulo extra disponível agora.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: 12,
                }}
              >
                {catalogoModulos.map(
                  (item) => (
                    <ModuloCatalogoCard
                      key={
                        item.module_code
                      }
                      item={item}
                      aberto={
                        moduloAberto ===
                        item.module_code
                      }
                      onToggle={() =>
                        setModuloAberto(
                          moduloAberto ===
                            item.module_code
                            ? ""
                            : item.module_code
                        )
                      }
                      onRequest={() =>
                        solicitarModulo(
                          item
                        )
                      }
                      processing={
                        moduloProcessando ===
                        item.module_code
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>

          <section
            style={{
              ...card,
              position:"sticky",
              bottom:10,
              zIndex:10,
            }}
          >
            <div
              style={{
                display:"grid",
                gridTemplateColumns:"1fr 1fr",
                gap:12,
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  minHeight:54,
                  border:"none",
                  borderRadius:14,
                  background:saving
                    ? "#9ca3af"
                    : "#111827",
                  color:"#ffffff",
                  fontWeight:850,
                  cursor:saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {saving
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/pro/profissional/${data.piece_code}`
                  )
                }
                style={{
                  minHeight:54,
                  borderRadius:14,
                  border:"1px solid #b8892f",
                  background:"#fffaf0",
                  color:"#8a641f",
                  fontWeight:850,
                  cursor:"pointer",
                }}
              >
                Ver perfil público
              </button>
            </div>
          </section>
        </form>
      </section>
    </main>
  );
}

function Screen({text}) {
  return (
    <main
      style={{
        minHeight:"100vh",
        display:"grid",
        placeItems:"center",
        background:"#f5f5f4",
        padding:24,
      }}
    >
      <section
        style={{
          background:"#ffffff",
          padding:28,
          borderRadius:20,
          textAlign:"center",
        }}
      >
        <h1>TAP PRO</h1>
        <p>{text}</p>
      </section>
    </main>
  );
}