import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  adminAlterarStatusModuloCatalogoPro,
  adminDecidirPedidoModuloPro,
  adminListarCatalogoModulosPro,
  adminListarPedidosModulosPro,
  adminSalvarModuloCatalogoPro,
} from "../lib/tappro";

const EMPTY = {
  module_code: "",
  name: "",
  short_description: "",
  benefit: "",
  profile_scope: "both",
  billing_type: "one_time",
  price_cents: 0,
  trial_days: 0,
  is_active: true,
  is_featured: false,
  display_order: 0,
};

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  padding: "11px 12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  boxSizing: "border-box",
};

const cardStyle = {
  padding: "20px",
  borderRadius: "18px",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 10px 28px rgba(17,24,39,0.06)",
};

function money(cents) {

  return (
    Number(cents || 0) / 100
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function billingLabel(value) {
  const labels = {
    one_time: "Compra única",
    monthly: "Mensal",
    annual: "Anual",
    free: "Gratuito",
  };

  return labels[value] || value;
}

function scopeLabel(value) {
  const labels = {
    company: "Empresa",
    professional: "Profissional",
    both: "Empresa e profissional",
  };

  return labels[value] || value;
}

export default function AdminProModulos() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [modules, setModules] =
    useState([]);

  const [orders, setOrders] =
    useState([]);

  const [orderProcessing, setOrderProcessing] =
    useState("");

  const [form, setForm] =
    useState(EMPTY);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const editing =
    Boolean(form.module_code) &&
    modules.some(
      (item) =>
        item.module_code ===
        form.module_code
    );

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");

    const { data, error } =
      await adminListarCatalogoModulosPro();

    if (error) {
      console.error(error);
      setError(
        "Não foi possível carregar o catálogo."
      );
      setLoading(false);
      return;
    }

    setModules(data || []);

    const pedidos =
      await adminListarPedidosModulosPro();

    if (pedidos.error) {
      console.error(
        pedidos.error
      );
    } else {
      setOrders(
        pedidos.data || []
      );
    }

    setLoading(false);
  }

  const activeCount = useMemo(
    () =>
      modules.filter(
        (item) => item.is_active
      ).length,
    [modules]
  );

  function change(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function edit(item) {
    setForm({
      module_code:
        item.module_code || "",
      name:
        item.name || "",
      short_description:
        item.short_description || "",
      benefit:
        item.benefit || "",
      profile_scope:
        item.profile_scope || "both",
      billing_type:
        item.billing_type ||
        "one_time",
      price_cents:
        Number(
          item.price_cents || 0
        ),
      trial_days:
        Number(
          item.trial_days || 0
        ),
      is_active:
        Boolean(item.is_active),
      is_featured:
        Boolean(item.is_featured),
      display_order:
        Number(
          item.display_order || 0
        ),
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function reset() {
    setForm(EMPTY);
    setError("");
    setSuccess("");
  }

  function validate() {
    const code =
      String(
        form.module_code || ""
      )
        .trim()
        .toLowerCase();

    if (
      !/^[a-z0-9_]{3,50}$/.test(
        code
      )
    ) {
      return "Use um código com letras minúsculas, números ou underline.";
    }

    if (
      !String(
        form.name || ""
      ).trim()
    ) {
      return "Informe o nome comercial do módulo.";
    }

    if (
      Number(
        form.price_cents
      ) < 0
    ) {
      return "O preço não pode ser negativo.";
    }

    return "";
  }

  async function save(event) {
    event.preventDefault();

    const validation =
      validate();

    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { error } =
      await adminSalvarModuloCatalogoPro(
        form
      );

    if (error) {
      console.error(error);
      setError(
        error.message ||
          "Não foi possível salvar o módulo."
      );
      setSaving(false);
      return;
    }

    setSuccess(
      editing
        ? "Módulo atualizado."
        : "Módulo criado."
    );

    setForm(EMPTY);
    setSaving(false);
    await load();
  }

  async function toggleStatus(
    item
  ) {
    setError("");
    setSuccess("");

    const { error } =
      await adminAlterarStatusModuloCatalogoPro(
        item.module_code,
        !item.is_active
      );

    if (error) {
      console.error(error);
      setError(
        "Não foi possível alterar o status."
      );
      return;
    }

    setSuccess(
      item.is_active
        ? "Módulo desativado."
        : "Módulo ativado."
    );

    await load();
  }

  async function decidirPedido(
    item,
    decision
  ) {
    setOrderProcessing(
      item.id
    );

    setError("");
    setSuccess("");

    const { error } =
      await adminDecidirPedidoModuloPro(
        item.id,
        decision
      );

    setOrderProcessing("");

    if (error) {
      console.error(error);
      setError(
        error.message ||
          "Não foi possível atualizar o pedido."
      );
      return;
    }

    setSuccess(
      decision === "approved"
        ? "Módulo ativado no perfil."
        : "Solicitação recusada."
    );

    await load();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding:
          "24px 16px 48px",
        background: "#f5f5f4",
        color: "#111827",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <style>
        {`
          .module-admin-grid {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:14px;
          }

          .module-list-grid {
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(280px,1fr));
            gap:14px;
          }

          @media(max-width:680px) {
            .module-admin-grid {
              grid-template-columns:1fr;
            }
          }
        `}
      </style>

      <section
        style={{
          maxWidth: "980px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            padding: "26px",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg,#111827 0%,#6b5b3e 100%)",
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
              fontSize: "13px",
            }}
          >
            TAP PRO · Estrutura comercial
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            Catálogo de módulos
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              opacity: 0.94,
              lineHeight: 1.5,
            }}
          >
            Cadastre produtos digitais, preços, testes e disponibilidade para empresa e profissional.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            <span
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                background:
                  "rgba(255,255,255,0.14)",
                fontWeight: 800,
              }}
            >
              {modules.length} módulos
            </span>

            <span
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                background:
                  "rgba(255,255,255,0.14)",
                fontWeight: 800,
              }}
            >
              {activeCount} ativos
            </span>
          </div>
        </header>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/pro"
              )
            }
            style={{
              minHeight: "46px",
              padding: "11px 15px",
              borderRadius: "12px",
              border:
                "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Voltar ao painel TAP PRO
          </button>

          {editing && (
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: "46px",
                padding: "11px 15px",
                borderRadius: "12px",
                border:
                  "1px solid #b8892f",
                background: "#fffaf0",
                color: "#8a641f",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Criar novo módulo
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px",
              borderRadius: "13px",
              background: "#fee2e2",
              border:
                "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 750,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px",
              borderRadius: "13px",
              background: "#dcfce7",
              border:
                "1px solid #bbf7d0",
              color: "#166534",
              fontWeight: 750,
            }}
          >
            {success}
          </div>
        )}

        <form
          onSubmit={save}
          style={{
            ...cardStyle,
            marginTop: "18px",
          }}
        >
          <h2
            style={{
              margin: "0 0 6px",
            }}
          >
            {editing
              ? "Editar módulo"
              : "Novo módulo"}
          </h2>

          <p
            style={{
              margin: "0 0 18px",
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            O código é interno. O cliente verá o nome, o benefício e o preço.
          </p>

          <div className="module-admin-grid">
            <Field
              label="Código interno *"
              name="module_code"
              value={form.module_code}
              onChange={change}
              placeholder="Ex: promotions"
              disabled={editing}
            />

            <Field
              label="Nome comercial *"
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Ex: Promoções e novidades"
            />

            <Field
              label="Descrição curta"
              name="short_description"
              value={
                form.short_description
              }
              onChange={change}
              placeholder="Explique rapidamente o recurso."
            />

            <Field
              label="Benefício principal"
              name="benefit"
              value={form.benefit}
              onChange={change}
              placeholder="Ex: Traga clientes de volta."
            />

            <Select
              label="Disponível para"
              name="profile_scope"
              value={
                form.profile_scope
              }
              onChange={change}
              options={[
                ["both","Empresa e profissional"],
                ["company","Somente empresa"],
                ["professional","Somente profissional"],
              ]}
            />

            <Select
              label="Cobrança"
              name="billing_type"
              value={
                form.billing_type
              }
              onChange={change}
              options={[
                ["one_time","Compra única"],
                ["monthly","Mensal"],
                ["annual","Anual"],
                ["free","Gratuito"],
              ]}
            />

            <Field
              label="Preço em centavos"
              name="price_cents"
              value={form.price_cents}
              onChange={change}
              type="number"
              min="0"
              placeholder="Ex: 2500 = R$ 25,00"
            />

            <Field
              label="Dias de teste"
              name="trial_days"
              value={form.trial_days}
              onChange={change}
              type="number"
              min="0"
            />

            <Field
              label="Ordem de exibição"
              name="display_order"
              value={
                form.display_order
              }
              onChange={change}
              type="number"
            />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "4px",
            }}
          >
            <Check
              label="Módulo ativo"
              name="is_active"
              checked={
                form.is_active
              }
              onChange={change}
            />

            <Check
              label="Destacar no catálogo"
              name="is_featured"
              checked={
                form.is_featured
              }
              onChange={change}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              minHeight: "52px",
              marginTop: "20px",
              border: "none",
              borderRadius: "13px",
              background: saving
                ? "#9ca3af"
                : "#111827",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 850,
              cursor: saving
                ? "not-allowed"
                : "pointer",
            }}
          >
            {saving
              ? "Salvando..."
              : editing
                ? "Salvar alterações"
                : "Criar módulo"}
          </button>
        </form>

        <section
          style={{
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
            }}
          >
            Módulos cadastrados
          </h2>

          {loading ? (
            <div style={cardStyle}>
              Carregando catálogo...
            </div>
          ) : modules.length === 0 ? (
            <div style={cardStyle}>
              Nenhum módulo cadastrado.
            </div>
          ) : (
            <div className="module-list-grid">
              {modules.map(
                (item) => (
                  <article
                    key={
                      item.module_code
                    }
                    style={{
                      ...cardStyle,
                      opacity:
                        item.is_active
                          ? 1
                          : 0.62,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "12px",
                        alignItems:
                          "flex-start",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin:
                              "0 0 5px",
                            color:
                              "#b8892f",
                            fontSize:
                              "12px",
                            fontWeight:
                              900,
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {
                            item.module_code
                          }
                        </p>

                        <h3
                          style={{
                            margin: 0,
                            fontSize:
                              "19px",
                          }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      <span
                        style={{
                          padding:
                            "6px 9px",
                          borderRadius:
                            "999px",
                          background:
                            item.is_active
                              ? "#dcfce7"
                              : "#f3f4f6",
                          color:
                            item.is_active
                              ? "#166534"
                              : "#6b7280",
                          fontSize:
                            "12px",
                          fontWeight:
                            850,
                        }}
                      >
                        {item.is_active
                          ? "Ativo"
                          : "Inativo"}
                      </span>
                    </div>

                    {item.short_description && (
                      <p
                        style={{
                          color:
                            "#4b5563",
                          lineHeight:
                            1.5,
                        }}
                      >
                        {
                          item.short_description
                        }
                      </p>
                    )}

                    {item.benefit && (
                      <p
                        style={{
                          padding:
                            "10px 11px",
                          borderRadius:
                            "11px",
                          background:
                            "#fafafa",
                          color:
                            "#374151",
                          fontWeight:
                            750,
                          lineHeight:
                            1.45,
                        }}
                      >
                        {item.benefit}
                      </p>
                    )}

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: "8px",
                        marginTop:
                          "12px",
                        fontSize:
                          "13px",
                        color:
                          "#6b7280",
                      }}
                    >
                      <span>
                        {
                          scopeLabel(
                            item.profile_scope
                          )
                        }
                      </span>

                      <span>
                        {
                          billingLabel(
                            item.billing_type
                          )
                        }
                      </span>

                      <strong
                        style={{
                          color:
                            "#111827",
                        }}
                      >
                        {
                          item.billing_type ===
                          "free"
                            ? "Gratuito"
                            : money(
                                item.price_cents
                              )
                        }
                      </strong>

                      <span>
                        {item.trial_days > 0
                          ? `${item.trial_days} dias de teste`
                          : "Sem teste"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: "9px",
                        marginTop:
                          "16px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          edit(item)
                        }
                        style={{
                          minHeight:
                            "44px",
                          borderRadius:
                            "11px",
                          border:
                            "1px solid #d1d5db",
                          background:
                            "#ffffff",
                          color:
                            "#374151",
                          fontWeight:
                            800,
                          cursor:
                            "pointer",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleStatus(
                            item
                          )
                        }
                        style={{
                          minHeight:
                            "44px",
                          borderRadius:
                            "11px",
                          border:
                            item.is_active
                              ? "1px solid #fecaca"
                              : "1px solid #bbf7d0",
                          background:
                            item.is_active
                              ? "#fff7f7"
                              : "#f0fdf4",
                          color:
                            item.is_active
                              ? "#991b1b"
                              : "#166534",
                          fontWeight:
                            800,
                          cursor:
                            "pointer",
                        }}
                      >
                        {item.is_active
                          ? "Desativar"
                          : "Ativar"}
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <section
          style={{
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 12px",
            }}
          >
            Pedidos de módulos
          </h2>

          {orders.length === 0 ? (
            <div style={cardStyle}>
              Nenhum pedido de módulo.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {orders.map(
                (item) => (
                  <article
                    key={item.id}
                    style={cardStyle}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "12px",
                        alignItems:
                          "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin:
                              "0 0 4px",
                            color:
                              "#b8892f",
                            fontSize:
                              "12px",
                            fontWeight:
                              900,
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {item.profile_type ===
                          "professional"
                            ? "Profissional"
                            : "Empresa"}
                        </p>

                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          {item.display_name ||
                            "Perfil TAP PRO"}
                        </h3>

                        <p
                          style={{
                            margin:
                              "7px 0 0",
                            color:
                              "#4b5563",
                          }}
                        >
                          {item.module_name}
                        </p>
                      </div>

                      <span
                        style={{
                          padding:
                            "6px 9px",
                          borderRadius:
                            "999px",
                          background:
                            item.status ===
                            "pending"
                              ? "#fff7ed"
                              : item.status ===
                                "approved"
                                ? "#dcfce7"
                                : "#f3f4f6",
                          color:
                            item.status ===
                            "pending"
                              ? "#9a3412"
                              : item.status ===
                                "approved"
                                ? "#166534"
                                : "#6b7280",
                          fontSize:
                            "12px",
                          fontWeight:
                            850,
                        }}
                      >
                        {item.status ===
                        "pending"
                          ? "Pendente"
                          : item.status ===
                            "approved"
                            ? "Aprovado"
                            : "Recusado"}
                      </span>
                    </div>

                    <p
                      style={{
                        margin:
                          "12px 0 0",
                        color:
                          "#6b7280",
                        fontSize:
                          "13px",
                      }}
                    >
                      {item.billing_type ===
                      "monthly"
                        ? `${money(
                            item.price_cents
                          )}/mês`
                        : item.billing_type ===
                          "annual"
                          ? `${money(
                              item.price_cents
                            )}/ano`
                          : money(
                              item.price_cents
                            )}
                    </p>

                    {item.status ===
                      "pending" && (
                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap: "9px",
                          marginTop:
                            "14px",
                        }}
                      >
                        <button
                          type="button"
                          disabled={
                            orderProcessing ===
                            item.id
                          }
                          onClick={() =>
                            decidirPedido(
                              item,
                              "approved"
                            )
                          }
                          style={{
                            minHeight:
                              "44px",
                            borderRadius:
                              "11px",
                            border:
                              "1px solid #bbf7d0",
                            background:
                              "#f0fdf4",
                            color:
                              "#166534",
                            fontWeight:
                              850,
                            cursor:
                              "pointer",
                          }}
                        >
                          Aprovar e ativar
                        </button>

                        <button
                          type="button"
                          disabled={
                            orderProcessing ===
                            item.id
                          }
                          onClick={() =>
                            decidirPedido(
                              item,
                              "rejected"
                            )
                          }
                          style={{
                            minHeight:
                              "44px",
                            borderRadius:
                              "11px",
                            border:
                              "1px solid #fecaca",
                            background:
                              "#fff7f7",
                            color:
                              "#991b1b",
                            fontWeight:
                              850,
                            cursor:
                              "pointer",
                          }}
                        >
                          Recusar
                        </button>
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </section>

      </section>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  min,
}) {
  return (
    <div
      style={{
        marginBottom: "14px",
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "7px",
          fontWeight: 800,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        style={{
          ...inputStyle,
          opacity:
            disabled ? 0.65 : 1,
        }}
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div
      style={{
        marginBottom: "14px",
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "7px",
          fontWeight: 800,
        }}
      >
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
      >
        {options.map(
          ([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function Check({
  label,
  name,
  checked,
  onChange,
}) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontWeight: 750,
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />

      {label}
    </label>
  );
}