import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  adminCriarPecasPro,
  adminListarPecasPro,
  adminObterAcessoPecaPro,
} from "../lib/tappro";

const BASE_URL =
  "https://app.kydlab.com.br";

const PRODUCT_LABELS = {
  totem: "Totem",
  card: "Cartão",
  keychain: "Chaveiro",
  tag: "Tag",
  other: "Outro",
};

const PROFILE_LABELS = {
  professional: "Profissional",
  company: "Empresa",
};

const STATUS_LABELS = {
  available: "Disponível",
  activated: "Ativada",
  blocked: "Bloqueada",
  replaced: "Substituída",
  archived: "Arquivada",
};

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  padding: "12px 13px",
  borderRadius: "11px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#111827",
  fontSize: "14px",
  fontWeight: 800,
};

const cardStyle = {
  padding: "22px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 12px 30px rgba(0,0,0,0.06)",
};

const buttonStyle = {
  minHeight: "46px",
  padding: "12px 16px",
  borderRadius: "11px",
  border: "none",
  fontSize: "14px",
  fontWeight: 850,
  cursor: "pointer",
};

export default function AdminPro() {
  const [pecas, setPecas] =
    useState([]);

  const [geradas, setGeradas] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [criando, setCriando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [abrindoPeca, setAbrindoPeca] =
    useState("");

  const [form, setForm] = useState({
    productType: "other",
    predefinedProfileType: "",
    codeCount: 1,
    physicalQuantity: 1,
    internalLabel: "",
    campaignName: "",
    sellerName: "",
    notes: "",
  });

  useEffect(() => {
    carregarPecas();
  }, []);

  async function carregarPecas() {
    setLoading(true);
    setErro("");

    const { data, error } =
      await adminListarPecasPro();

    if (error) {
      console.error(
        "Erro ao carregar peças TAP PRO:",
        error
      );

      setErro(
        "Não foi possível carregar as peças TAP PRO."
      );

      setLoading(false);
      return;
    }

    setPecas(data || []);
    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function aplicarPadraoProduto(
    productType
  ) {
    setForm((anterior) => ({
      ...anterior,
      productType,
    }));
  }

  async function handleCriar(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setGeradas([]);

    const codeCount =
      Number(form.codeCount);

    const physicalQuantity =
      Number(form.physicalQuantity);

    if (
      !Number.isInteger(codeCount) ||
      codeCount < 1 ||
      codeCount > 200
    ) {
      setErro(
        "A quantidade de códigos deve ficar entre 1 e 200."
      );
      return;
    }

    if (
      !Number.isInteger(
        physicalQuantity
      ) ||
      physicalQuantity < 1 ||
      physicalQuantity > 5000
    ) {
      setErro(
        "A quantidade física por código deve ficar entre 1 e 5.000."
      );
      return;
    }

    setCriando(true);

    const { data, error } =
      await adminCriarPecasPro({
        ...form,
        codeCount,
        physicalQuantity,
      });

    if (error) {
      console.error(
        "Erro ao criar peças TAP PRO:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível criar as peças."
      );

      setCriando(false);
      return;
    }

    setGeradas(data || []);

    setSucesso(
      `${data?.length || 0} código(s) criado(s) com sucesso.`
    );

    setForm((anterior) => ({
      ...anterior,
      internalLabel: "",
      campaignName: "",
      sellerName: "",
      notes: "",
    }));

    setCriando(false);
    await carregarPecas();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function copiarTexto(texto) {
    try {
      await navigator.clipboard.writeText(
        texto
      );

      setSucesso("Copiado!");
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível copiar."
      );
    }
  }

  function linkPeca(code) {
    return `${BASE_URL}/pro/acesso/${code}`;
  }


  async function obterAcessoDaPeca(
    peca
  ) {
    setErro("");
    setSucesso("");
    setAbrindoPeca(peca.id);

    const { data, error } =
      await adminObterAcessoPecaPro(
        peca.id
      );

    setAbrindoPeca("");

    if (error) {
      console.error(
        "Erro ao obter acesso da peça:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível localizar o acesso administrativo."
      );

      return null;
    }

    if (!data?.found) {
      setErro(
        "Esta peça ainda não possui um perfil ativado."
      );

      return null;
    }

    return data;
  }

  async function abrirPaginaPublica(
    peca
  ) {
    const acesso =
      await obterAcessoDaPeca(
        peca
      );

    if (!acesso) return;

    window.open(
      acesso.public_url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function abrirPainelCliente(
    peca
  ) {
    const acesso =
      await obterAcessoDaPeca(
        peca
      );

    if (!acesso) return;

    window.localStorage.setItem(
      "tappro_codigo_admin",
      acesso.access_code
    );

    window.open(
      acesso.panel_url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copiarCodigoAdmin(
    peca
  ) {
    const acesso =
      await obterAcessoDaPeca(
        peca
      );

    if (!acesso) return;

    await copiarTexto(
      acesso.access_code
    );

    setSucesso(
      "Código administrativo copiado."
    );
  }

  const pecasFiltradas =
    useMemo(() => {
      const termo =
        busca.trim().toLowerCase();

      if (!termo) {
        return pecas;
      }

      return pecas.filter((peca) => {
        const campos = [
          peca.code,
          peca.product_type,
          peca.predefined_profile_type,
          peca.status,
          peca.internal_label,
          peca.campaign_name,
          peca.seller_name,
        ];

        return campos.some((campo) =>
          String(campo || "")
            .toLowerCase()
            .includes(termo)
        );
      });
    }, [busca, pecas]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px 16px 50px",
        background: "#f3f4f6",
        color: "#111827",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <style>
        {`
          .admin-pro-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .admin-pro-table-wrap {
            overflow-x: auto;
          }

          @media (max-width: 720px) {
            .admin-pro-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <section
        style={{
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            padding: "26px",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #111827 0%, #b8892f 100%)",
            color: "#ffffff",
            boxShadow:
              "0 18px 42px rgba(0,0,0,0.14)",
          }}
        >
          <p
            style={{
              margin: "0 0 7px",
              opacity: 0.82,
              fontWeight: 750,
            }}
          >
            Administração KYD LAB
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            Peças TAP PRO
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              opacity: 0.92,
              lineHeight: 1.5,
            }}
          >
            Gere códigos, defina o produto físico e escolha se o perfil será profissional, empresa ou decidido pelo cliente.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/admin";
            }}
            style={{
              ...buttonStyle,
              marginTop: "18px",
              background:
                "rgba(255,255,255,0.14)",
              color: "#ffffff",
              border:
                "1px solid rgba(255,255,255,0.35)",
            }}
          >
            Voltar ao Admin KYD LAB
          </button>
        </header>

        {erro && (
          <div
            role="alert"
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 750,
            }}
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontWeight: 750,
            }}
          >
            {sucesso}
          </div>
        )}

        {geradas.length > 0 && (
          <section
            style={{
              ...cardStyle,
              marginTop: "18px",
              background: "#fffaf0",
              borderColor: "#e6d7b8",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
              }}
            >
              Códigos recém-gerados
            </h2>

            <div
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              {geradas.map((peca) => (
                <div
                  key={peca.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr auto auto",
                    gap: "10px",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    border:
                      "1px solid #e6d7b8",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: "18px",
                        letterSpacing: "1px",
                      }}
                    >
                      {peca.code}
                    </strong>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#6b7280",
                        fontSize: "13px",
                      }}
                    >
                      {PRODUCT_LABELS[
                        peca.product_type
                      ] ||
                        peca.product_type}
                      {" · "}
                      {peca.physical_quantity}
                      {" peça(s) física(s)"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copiarTexto(peca.code)
                    }
                    style={{
                      ...buttonStyle,
                      minHeight: "40px",
                      padding: "9px 12px",
                      background: "#111827",
                      color: "#ffffff",
                    }}
                  >
                    Copiar código
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      copiarTexto(
                        linkPeca(peca.code)
                      )
                    }
                    style={{
                      ...buttonStyle,
                      minHeight: "40px",
                      padding: "9px 12px",
                      background: "#ffffff",
                      color: "#374151",
                      border:
                        "1px solid #d1d5db",
                    }}
                  >
                    Copiar link da peça
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section
          style={{
            ...cardStyle,
            marginTop: "18px",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
            }}
          >
            Criar nova peça
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            O código terá 10 caracteres: três números e sete letras. As letras I e O não são usadas para evitar confusão com 1 e 0.
          </p>

          <form onSubmit={handleCriar}>
            <div className="admin-pro-grid">
              <div>
                <label style={labelStyle}>
                  Produto físico
                </label>

                <select
                  name="productType"
                  value={form.productType}
                  onChange={(event) =>
                    aplicarPadraoProduto(
                      event.target.value
                    )
                  }
                  style={inputStyle}
                >
                  <option value="totem">
                    Totem
                  </option>
                  <option value="card">
                    Cartão
                  </option>
                  <option value="keychain">
                    Chaveiro
                  </option>
                  <option value="tag">
                    Tag
                  </option>
                  <option value="other">
                    Outro
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Tipo de perfil
                </label>

                <select
                  name="predefinedProfileType"
                  value={
                    form.predefinedProfileType
                  }
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">
                    Cliente escolhe
                  </option>
                  <option value="professional">
                    Profissional
                  </option>
                  <option value="company">
                    Empresa
                  </option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Quantidade de códigos
                </label>

                <input
                  type="number"
                  name="codeCount"
                  min="1"
                  max="200"
                  value={form.codeCount}
                  onChange={handleChange}
                  style={inputStyle}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#6b7280",
                  }}
                >
                  Use mais de um para criar códigos individuais por vendedor ou peça.
                </small>
              </div>

              <div>
                <label style={labelStyle}>
                  Peças físicas por código
                </label>

                <input
                  type="number"
                  name="physicalQuantity"
                  min="1"
                  max="5000"
                  value={
                    form.physicalQuantity
                  }
                  onChange={handleChange}
                  style={inputStyle}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#6b7280",
                  }}
                >
                  Exemplo: 1 código impresso em 100 chaveiros.
                </small>
              </div>

              <div>
                <label style={labelStyle}>
                  Identificação interna
                </label>

                <input
                  name="internalLabel"
                  value={form.internalLabel}
                  onChange={handleChange}
                  placeholder="Ex: Totem balcão principal"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Campanha
                </label>

                <input
                  name="campaignName"
                  value={form.campaignName}
                  onChange={handleChange}
                  placeholder="Ex: Feira julho"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Vendedor ou responsável
                </label>

                <input
                  name="sellerName"
                  value={form.sellerName}
                  onChange={handleChange}
                  placeholder="Ex: Carlos"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Observações
                </label>

                <input
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Informações internas"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={criando}
              style={{
                ...buttonStyle,
                width: "100%",
                marginTop: "20px",
                background: criando
                  ? "#9ca3af"
                  : "#111827",
                color: "#ffffff",
                cursor: criando
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {criando
                ? "Gerando códigos..."
                : "Gerar códigos TAP PRO"}
            </button>
          </form>
        </section>

        <section
          style={{
            ...cardStyle,
            marginTop: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 5px",
                }}
              >
                Peças criadas
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                {pecasFiltradas.length} registro(s)
              </p>
            </div>

            <button
              type="button"
              onClick={carregarPecas}
              style={{
                ...buttonStyle,
                background: "#ffffff",
                color: "#374151",
                border:
                  "1px solid #d1d5db",
              }}
            >
              Atualizar lista
            </button>
          </div>

          <input
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            placeholder="Buscar código, produto, campanha ou vendedor..."
            style={{
              ...inputStyle,
              marginTop: "18px",
            }}
          />

          {loading ? (
            <p
              style={{
                color: "#6b7280",
              }}
            >
              Carregando peças...
            </p>
          ) : (
            <div
              className="admin-pro-table-wrap"
              style={{
                marginTop: "16px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: "1320px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Código",
                      "Produto",
                      "Perfil",
                      "Quantidade",
                      "Status",
                      "Identificação",
                      "Campanha",
                      "Responsável",
                      "Ações",
                    ].map((titulo) => (
                      <th
                        key={titulo}
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "13px",
                          background: "#f9fafb",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {titulo}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pecasFiltradas.map(
                    (peca) => (
                      <tr key={peca.id}>
                        <td style={tdStyle}>
                          <strong>
                            {peca.code}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {PRODUCT_LABELS[
                            peca.product_type
                          ] ||
                            peca.product_type}
                        </td>

                        <td style={tdStyle}>
                          {peca.predefined_profile_type
                            ? PROFILE_LABELS[
                                peca.predefined_profile_type
                              ]
                            : "Cliente escolhe"}
                        </td>

                        <td style={tdStyle}>
                          {peca.physical_quantity}
                        </td>

                        <td style={tdStyle}>
                          {STATUS_LABELS[
                            peca.status
                          ] ||
                            peca.status}
                        </td>

                        <td style={tdStyle}>
                          {peca.internal_label ||
                            "-"}
                        </td>

                        <td style={tdStyle}>
                          {peca.campaign_name ||
                            "-"}
                        </td>

                        <td style={tdStyle}>
                          {peca.seller_name ||
                            "-"}
                        </td>

                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "7px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                copiarTexto(
                                  peca.code
                                )
                              }
                              style={miniButton}
                            >
                              Código público
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                copiarTexto(
                                  linkPeca(
                                    peca.code
                                  )
                                )
                              }
                              style={miniButton}
                            >
                              Link da peça
                            </button>

                            {peca.status ===
                              "activated" && (
                              <button
                                type="button"
                                disabled={
                                  abrindoPeca ===
                                  peca.id
                                }
                                onClick={() =>
                                  abrirPaginaPublica(
                                    peca
                                  )
                                }
                                style={{
                                  ...miniButton,
                                  background:
                                    "#f0fdf4",
                                  color:
                                    "#166534",
                                  border:
                                    "1px solid #bbf7d0",
                                }}
                              >
                                Página pública
                              </button>
                            )}

                            {(peca.status ===
                              "available" ||
                              peca.status ===
                                "activated") && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    abrindoPeca ===
                                    peca.id
                                  }
                                  onClick={() =>
                                    abrirPainelCliente(
                                      peca
                                    )
                                  }
                                  style={{
                                    ...miniButton,
                                    background:
                                      "#fffaf0",
                                    color:
                                      "#8a641f",
                                    border:
                                      "1px solid #e6d7b8",
                                  }}
                                >
                                  Painel do cliente
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    abrindoPeca ===
                                    peca.id
                                  }
                                  onClick={() =>
                                    copiarCodigoAdmin(
                                      peca
                                    )
                                  }
                                  style={{
                                    ...miniButton,
                                    background:
                                      "#111827",
                                    color:
                                      "#ffffff",
                                    border:
                                      "1px solid #111827",
                                  }}
                                >
                                  Código admin
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {!pecasFiltradas.length && (
                <p
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  Nenhuma peça encontrada.
                </p>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
  verticalAlign: "top",
};

const miniButton = {
  minHeight: "34px",
  padding: "7px 10px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  fontWeight: 800,
  cursor: "pointer",
};