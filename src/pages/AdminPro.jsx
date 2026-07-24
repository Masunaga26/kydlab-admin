import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  adminAtualizarPecaPro,
  adminCriarPecasPro,
  adminLimparCadastroPecaPro,
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

const ENVIRONMENT_LABELS = {
  demonstration: "Demonstração",
  homologation: "Homologação",
  production: "Produção",
};

const ENVIRONMENT_REGEX =
  /\[AMBIENTE:(demonstration|homologation|production)\]/i;

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
  minHeight: "42px",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  fontSize: "14px",
  fontWeight: 850,
  cursor: "pointer",
};

const miniButton = {
  ...buttonStyle,
  minHeight: "34px",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "14px",
  verticalAlign: "top",
};

function clean(value) {
  return String(value || "").trim();
}

function getProfileIdentification(piece, access) {
  const candidates = [
    piece?.internal_label,
    access?.display_name,
    access?.professional_name,
    access?.company_name,
    access?.profile_name,
    access?.name,
    access?.title,
    access?.profile?.display_name,
    access?.profile?.professional_name,
    access?.profile?.company_name,
    piece?.display_name,
    piece?.professional_name,
    piece?.company_name,
    piece?.profile_name,
    piece?.name,
  ];

  const found = candidates.find((value) => clean(value));

  if (found) {
    return clean(found);
  }

  if (piece?.status === "activated") {
    return piece?.predefined_profile_type === "professional"
      ? "Profissional ativado"
      : piece?.predefined_profile_type === "company"
      ? "Empresa ativada"
      : "Perfil ativado";
  }

  return "-";
}

function getEnvironment(notes) {
  const match =
    clean(notes).match(
      ENVIRONMENT_REGEX
    );

  return match?.[1]?.toLowerCase() ||
    "production";
}

function cleanNotes(notes) {
  return clean(notes)
    .replace(
      ENVIRONMENT_REGEX,
      ""
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildNotes(
  environment,
  notes
) {
  const valid =
    ENVIRONMENT_LABELS[environment]
      ? environment
      : "production";

  return [
    `[AMBIENTE:${valid}]`,
    cleanNotes(notes),
  ]
    .filter(Boolean)
    .join(" ");
}

function csvCell(value) {
  return `"${String(value ?? "")
    .replace(/"/g, '""')}"`;
}

function downloadText(
  filename,
  content,
  mime
) {
  const blob =
    new Blob([content], {
      type: mime,
    });

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function AdminPro() {
  const [pecas, setPecas] =
    useState([]);

  const [geradas, setGeradas] =
    useState([]);

  const [acessos, setAcessos] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [criando, setCriando] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [limpandoId, setLimpandoId] =
    useState(null);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [editando, setEditando] =
    useState(null);

  const [form, setForm] =
    useState({
      productType: "totem",
      predefinedProfileType:
        "company",
      codeCount: 1,
      physicalQuantity: 1,
      internalLabel: "",
      campaignName: "",
      sellerName: "",
      notes: "",
      environment:
        "production",
    });

  const [editForm, setEditForm] =
    useState({
      status: "available",
      predefinedProfileType:
        "company",
      physicalQuantity: 1,
      internalLabel: "",
      campaignName: "",
      sellerName: "",
      notes: "",
      environment:
        "production",
    });

  useEffect(() => {
    carregarPecas();
  }, []);

  async function loadAccesses(
    list
  ) {
    const results =
      await Promise.all(
        (list || []).map(
          async (piece) => {
            const { data, error } =
              await adminObterAcessoPecaPro(
                piece.id
              );

            return {
              id: piece.id,
              access:
                !error && data?.found
                  ? data
                  : null,
            };
          }
        )
      );

    setAcessos((current) => {
      const next = {
        ...current,
      };

      results.forEach(
        ({ id, access }) => {
          if (access) {
            next[id] = access;
          }
        }
      );

      return next;
    });

    return results;
  }

  async function carregarPecas() {
    setLoading(true);
    setErro("");

    const { data, error } =
      await adminListarPecasPro();

    if (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar as peças TAP PRO."
      );

      setLoading(false);
      return;
    }

    const list = data || [];

    setPecas(list);
    setLoading(false);

    await loadAccesses(list);
  }

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditChange(
    event
  ) {
    const { name, value } =
      event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function copiar(text) {
    const value = String(text || "").trim();

    if (!value) {
      setErro("Não há conteúdo disponível para copiar.");
      return;
    }

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea =
          document.createElement("textarea");

        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";

        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(
          0,
          textarea.value.length
        );

        const copied =
          document.execCommand("copy");

        textarea.remove();

        if (!copied) {
          throw new Error(
            "O navegador recusou a cópia."
          );
        }
      }

      setErro("");
      setSucesso("Link copiado!");
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível copiar automaticamente. Abra o link e copie pela barra do navegador."
      );
    }
  }

  function activationLink(code) {
    return `${BASE_URL}/pro/acesso/${code}`;
  }

  function publicPieceLink(
    piece,
    access
  ) {
    if (access?.public_url) {
      return access.public_url;
    }

    if (
      piece?.predefined_profile_type ===
      "professional"
    ) {
      return `${BASE_URL}/pro/profissional/${piece.code}`;
    }

    if (
      piece?.predefined_profile_type ===
      "company"
    ) {
      return `${BASE_URL}/pro/empresa/${piece.code}`;
    }

    return activationLink(
      piece?.code
    );
  }

  function controlCardLink(
    piece,
    access
  ) {
    if (!piece?.code) {
      return "";
    }

    return `${BASE_URL}/pro/controle/${piece.code}`;
  }

  function qrImageUrl(destination) {
    const text =
      String(destination || "").trim();

    if (!text) {
      return "";
    }

    const params =
      new URLSearchParams({
        text,
        size: "1200",
        margin: "4",
        ecLevel: "H",
        format: "png",
        dark: "000000",
        light: "ffffff",
      });

    return `https://quickchart.io/qr?${params.toString()}`;
  }

  async function baixarQrPng({
    destination,
    filename,
    label,
  }) {
    const imageUrl =
      qrImageUrl(destination);

    if (!imageUrl) {
      setErro(
        "Destino do QR Code não disponível."
      );
      return;
    }

    setErro("");
    setSucesso(
      `Preparando ${label}...`
    );

    try {
      const response =
        await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(
          "Falha ao gerar QR Code."
        );
      }

      const blob =
        await response.blob();

      const objectUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(
        objectUrl
      );

      setSucesso(
        `${label} baixado em PNG.`
      );
    } catch (error) {
      console.error(error);

      /*
       * Fallback para navegadores que bloqueiam
       * o download via fetch.
       */
      const link =
        document.createElement("a");

      link.href = imageUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSucesso(
        `${label} aberto. Salve a imagem em PNG pelo navegador.`
      );
    }
  }

  async function baixarQrTotem(
    piece
  ) {
    const access =
      acessos[piece.id] ||
      await obterAcesso(piece);

    await baixarQrPng({
      destination:
        publicPieceLink(
          piece,
          access
        ),
      filename:
        `QR-TOTEM-${piece.code}.png`,
      label:
        "QR do Totem",
    });
  }

  async function baixarQrCartao(
    piece
  ) {
    await baixarQrPng({
      destination:
        controlCardLink(piece),
      filename:
        `QR-CARTAO-CONTROLE-${piece.code}.png`,
      label:
        "QR do Cartão-controle",
    });
  }

  async function limparCadastro(
    piece
  ) {
    if (!piece?.id) {
      return;
    }

    const firstConfirm =
      window.confirm(
        `Limpar todo o cadastro da peça ${piece.code}?\n\nOs códigos físico e administrativo serão preservados. Os dados do cliente, imagens, funções, campanhas, configurações e acessos vinculados serão apagados.`
      );

    if (!firstConfirm) {
      return;
    }

    const typed =
      window.prompt(
        `Confirmação final: digite o código físico ${piece.code}`
      );

    if (
      clean(typed).toUpperCase() !==
      clean(piece.code).toUpperCase()
    ) {
      setErro(
        "Limpeza cancelada: o código físico digitado não confere."
      );
      return;
    }

    setLimpandoId(piece.id);
    setErro("");
    setSucesso("");

    const { error } =
      await adminLimparCadastroPecaPro(
        piece.id
      );

    setLimpandoId(null);

    if (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível limpar o cadastro."
      );
      return;
    }

    setAcessos((current) => {
      const next = {
        ...current,
      };

      delete next[piece.id];
      return next;
    });

    setSucesso(
      `Cadastro da peça ${piece.code} limpo. Os códigos foram preservados.`
    );

    await carregarPecas();
  }

  async function obterAcesso(
    piece
  ) {
    if (acessos[piece.id]) {
      return acessos[piece.id];
    }

    const { data, error } =
      await adminObterAcessoPecaPro(
        piece.id
      );

    if (error || !data?.found) {
      setErro(
        error?.message ||
          "Acesso administrativo não encontrado."
      );

      return null;
    }

    setAcessos((current) => ({
      ...current,
      [piece.id]: data,
    }));

    return data;
  }

  async function handleCriar(
    event
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setGeradas([]);

    const codeCount =
      Number(form.codeCount);

    const physicalQuantity =
      Number(
        form.physicalQuantity
      );

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
        "A quantidade física deve ficar entre 1 e 5.000."
      );
      return;
    }

    setCriando(true);

    const { data, error } =
      await adminCriarPecasPro({
        productType:
          form.productType,
        predefinedProfileType:
          form.predefinedProfileType,
        codeCount,
        physicalQuantity,
        internalLabel:
          form.internalLabel,
        campaignName:
          form.campaignName,
        sellerName:
          form.sellerName,
        notes: buildNotes(
          form.environment,
          form.notes
        ),
      });

    setCriando(false);

    if (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível criar as peças."
      );
      return;
    }

    const created = data || [];

    setGeradas(created);

    await loadAccesses(created);

    setSucesso(
      `${created.length} código(s) criado(s) com sucesso.`
    );

    setForm((current) => ({
      ...current,
      internalLabel: "",
      campaignName: "",
      sellerName: "",
      notes: "",
    }));

    await carregarPecas();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEdit(piece) {
    setEditando(piece);

    setEditForm({
      status:
        piece.status ||
        "available",
      predefinedProfileType:
        piece.predefined_profile_type ||
        "",
      physicalQuantity:
        Number(
          piece.physical_quantity
        ) || 1,
      internalLabel:
        piece.internal_label || "",
      campaignName:
        piece.campaign_name || "",
      sellerName:
        piece.seller_name || "",
      notes:
        cleanNotes(
          piece.notes
        ),
      environment:
        getEnvironment(
          piece.notes
        ),
    });

    setErro("");
    setSucesso("");
  }

  async function saveEdit(event) {
    event.preventDefault();

    if (!editando?.id) {
      return;
    }

    const physicalQuantity =
      Number(
        editForm.physicalQuantity
      );

    if (
      !Number.isInteger(
        physicalQuantity
      ) ||
      physicalQuantity < 1 ||
      physicalQuantity > 5000
    ) {
      setErro(
        "A quantidade física deve ficar entre 1 e 5.000."
      );
      return;
    }

    setSalvando(true);

    const { error } =
      await adminAtualizarPecaPro({
        pieceId:
          editando.id,
        status:
          editForm.status,
        predefinedProfileType:
          editForm.predefinedProfileType,
        internalLabel:
          editForm.internalLabel,
        campaignName:
          editForm.campaignName,
        sellerName:
          editForm.sellerName,
        physicalQuantity,
        notes: buildNotes(
          editForm.environment,
          editForm.notes
        ),
      });

    setSalvando(false);

    if (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível atualizar a peça."
      );
      return;
    }

    setEditando(null);

    setSucesso(
      "Peça atualizada com sucesso."
    );

    await carregarPecas();
  }


  async function exportCsv() {
    setErro("");
    setSucesso("");

    const rows =
      await Promise.all(
        filteredPieces.map(
          async (piece) => {
            const access =
              acessos[piece.id] ||
              await obterAcesso(
                piece
              );

            return [
              piece.code,
              access?.access_code || "",
              publicPieceLink(
                piece,
                access
              ),
              controlCardLink(
                piece,
                access
              ),
              activationLink(
                piece.code
              ),
              PRODUCT_LABELS[
                piece.product_type
              ] ||
                piece.product_type,
              piece.predefined_profile_type
                ? PROFILE_LABELS[
                    piece.predefined_profile_type
                  ]
                : "Cliente escolhe",
              piece.physical_quantity,
              STATUS_LABELS[
                piece.status
              ] ||
                piece.status,
              ENVIRONMENT_LABELS[
                getEnvironment(
                  piece.notes
                )
              ],
              getProfileIdentification(piece, access),
              piece.campaign_name || "",
              piece.seller_name || "",
              cleanNotes(
                piece.notes
              ),
            ];
          }
        )
      );

    const header = [
      "codigo_fisico",
      "codigo_admin",
      "link_publico_peca",
      "link_cartao_controle",
      "link_ativacao_legado",
      "produto",
      "perfil",
      "quantidade",
      "status",
      "ambiente",
      "identificacao",
      "campanha",
      "responsavel",
      "observacoes",
    ];

    const csv = [
      header
        .map(csvCell)
        .join(";"),
      ...rows.map((row) =>
        row
          .map(csvCell)
          .join(";")
      ),
    ].join("\n");

    downloadText(
      `tap-pro-estoque-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      `\uFEFF${csv}`,
      "text/csv;charset=utf-8"
    );

    setSucesso(
      "Estoque exportado em CSV."
    );
  }

  const filteredPieces =
    useMemo(() => {
      const term =
        busca
          .trim()
          .toLowerCase();

      if (!term) {
        return pecas;
      }

      return pecas.filter(
        (piece) => {
          const access =
            acessos[piece.id];

          const fields = [
            piece.code,
            access?.access_code,
            piece.product_type,
            piece.predefined_profile_type,
            piece.status,
            piece.internal_label,
            getProfileIdentification(piece, access),
            piece.campaign_name,
            piece.seller_name,
            cleanNotes(
              piece.notes
            ),
            ENVIRONMENT_LABELS[
              getEnvironment(
                piece.notes
              )
            ],
          ];

          return fields.some(
            (field) =>
              String(field || "")
                .toLowerCase()
                .includes(term)
          );
        }
      );
    }, [
      busca,
      pecas,
      acessos,
    ]);

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

          .admin-pro-generated {
            display: grid;
            grid-template-columns: minmax(260px, 1fr) repeat(4, auto);
            gap: 10px;
            align-items: center;
          }

          .admin-pro-table-wrap {
            overflow-x: auto;
          }

          .admin-pro-actions-header,
          .admin-pro-actions-cell {
            position: sticky;
            right: 0;
            min-width: 390px;
            width: 390px;
            background: #ffffff;
            box-shadow: -10px 0 18px rgba(17,24,39,0.06);
            z-index: 2;
          }

          .admin-pro-actions-header {
            background: #f9fafb;
            z-index: 3;
          }

          .admin-pro-actions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }

          .admin-pro-actions-grid button {
            width: 100%;
            white-space: nowrap;
          }

          .admin-pro-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: grid;
            place-items: center;
            padding: 18px;
            background: rgba(17,24,39,0.66);
          }

          .admin-pro-modal {
            width: min(760px, 100%);
            max-height: calc(100vh - 36px);
            overflow-y: auto;
            padding: 22px;
            border-radius: 20px;
            background: #ffffff;
            box-shadow: 0 30px 80px rgba(0,0,0,0.28);
          }

          @media (max-width: 840px) {
            .admin-pro-generated,
            .admin-pro-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <section
        style={{
          width: "100%",
          maxWidth: "1320px",
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
            Gere a peça pública e o cartão-controle privado de cada TAP PRO.
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
              {geradas.map(
                (piece) => {
                  const access =
                    acessos[piece.id];

                  return (
                    <div
                      key={piece.id}
                      className="admin-pro-generated"
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        background: "#ffffff",
                        border:
                          "1px solid #e6d7b8",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            gap: "18px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <small>
                              CÓDIGO FÍSICO
                            </small>
                            <div
                              style={{
                                fontSize: "19px",
                                fontWeight: 900,
                                letterSpacing: "1px",
                              }}
                            >
                              {piece.code}
                            </div>
                          </div>

                          <div>
                            <small>
                              CÓDIGO ADMIN
                            </small>
                            <div
                              style={{
                                fontSize: "19px",
                                fontWeight: 900,
                                letterSpacing: "1px",
                              }}
                            >
                              {access?.access_code ||
                                "Carregando..."}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: "7px",
                            color: "#6b7280",
                            fontSize: "13px",
                          }}
                        >
                          {PRODUCT_LABELS[
                            piece.product_type
                          ] ||
                            piece.product_type}
                          {" · "}
                          {piece.physical_quantity}
                          {" peça(s) · "}
                          {ENVIRONMENT_LABELS[
                            getEnvironment(
                              piece.notes
                            )
                          ]}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copiar(
                            publicPieceLink(
                              piece,
                              access
                            )
                          )
                        }
                        style={{
                          ...buttonStyle,
                          background: "#f0fdf4",
                          color: "#166534",
                          border:
                            "1px solid #bbf7d0",
                        }}
                      >
                        Copiar link do Totem
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          copiar(
                            controlCardLink(
                              piece
                            )
                          )
                        }
                        style={{
                          ...buttonStyle,
                          background: "#fffaf0",
                          color: "#8a641f",
                          border:
                            "1px solid #e6d7b8",
                        }}
                      >
                        Copiar link do Cartão
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          baixarQrTotem(
                            piece
                          )
                        }
                        style={{
                          ...buttonStyle,
                          background: "#111827",
                          color: "#ffffff",
                        }}
                      >
                        Baixar QR do Totem
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          baixarQrCartao(
                            piece
                          )
                        }
                        style={{
                          ...buttonStyle,
                          background: "#b8892f",
                          color: "#ffffff",
                        }}
                      >
                        Baixar QR do Cartão
                      </button>
                    </div>
                  );
                }
              )}
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
            Cada cadastro gera dois acessos vinculados: a peça pública e o cartão-controle privado do cliente.
          </p>

          <form
            onSubmit={handleCriar}
          >
            <div className="admin-pro-grid">
              <div>
                <label style={labelStyle}>
                  Produto físico
                </label>

                <select
                  name="productType"
                  value={form.productType}
                  onChange={handleChange}
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
                  Ambiente
                </label>

                <select
                  name="environment"
                  value={form.environment}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="demonstration">
                    Demonstração
                  </option>
                  <option value="homologation">
                    Homologação
                  </option>
                  <option value="production">
                    Produção
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
              </div>

              <div>
                <label style={labelStyle}>
                  Identificação interna
                </label>

                <input
                  name="internalLabel"
                  value={form.internalLabel}
                  onChange={handleChange}
                  placeholder="Ex: LOTE 001 - KYD LAB"
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
                  placeholder="Ex: Mostruário"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Responsável
                </label>

                <input
                  name="sellerName"
                  value={form.sellerName}
                  onChange={handleChange}
                  placeholder="Ex: Fabio"
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
                ? "Gerando..."
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
                {filteredPieces.length} registro(s)
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={exportCsv}
                disabled={
                  !filteredPieces.length
                }
                style={{
                  ...buttonStyle,
                  background: "#111827",
                  color: "#ffffff",
                }}
              >
                Baixar planilha do estoque
              </button>

              <div
                style={{
                  width: "100%",
                  color: "#6b7280",
                  fontSize: "12px",
                  lineHeight: 1.4,
                }}
              >
                Gera uma planilha compatível com Excel contendo códigos, links, status e identificação das peças.
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
          </div>

          <input
            value={busca}
            onChange={(event) =>
              setBusca(
                event.target.value
              )
            }
            placeholder="Buscar código físico, código admin, ambiente, campanha ou responsável..."
            style={{
              ...inputStyle,
              marginTop: "18px",
            }}
          />

          {loading ? (
            <p>
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
                  minWidth: "1480px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Código físico",
                      "Código admin",
                      "Produto",
                      "Perfil",
                      "Qtd.",
                      "Status",
                      "Ambiente",
                      "Identificação",
                      "Campanha",
                      "Responsável",
                      "Ações",
                    ].map((title) => (
                      <th
                        key={title}
                        className={
                          title === "Ações"
                            ? "admin-pro-actions-header"
                            : undefined
                        }
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "13px",
                          background: "#f9fafb",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredPieces.map(
                    (piece) => {
                      const access =
                        acessos[piece.id];

                      return (
                        <tr
                          key={piece.id}
                        >
                          <td style={tdStyle}>
                            <strong>
                              {piece.code}
                            </strong>
                          </td>

                          <td style={tdStyle}>
                            <strong>
                              {access?.access_code ||
                                "..."}
                            </strong>
                          </td>

                          <td style={tdStyle}>
                            {PRODUCT_LABELS[
                              piece.product_type
                            ] ||
                              piece.product_type}
                          </td>

                          <td style={tdStyle}>
                            {piece.predefined_profile_type
                              ? PROFILE_LABELS[
                                  piece.predefined_profile_type
                                ]
                              : "Cliente escolhe"}
                          </td>

                          <td style={tdStyle}>
                            {piece.physical_quantity}
                          </td>

                          <td style={tdStyle}>
                            {STATUS_LABELS[
                              piece.status
                            ] ||
                              piece.status}
                          </td>

                          <td style={tdStyle}>
                            {ENVIRONMENT_LABELS[
                              getEnvironment(
                                piece.notes
                              )
                            ]}
                          </td>

                          <td style={tdStyle}>
                            <strong
                              style={{
                                display: "block",
                                color: "#111827",
                              }}
                            >
                              {getProfileIdentification(
                                piece,
                                access
                              )}
                            </strong>

                            {piece.internal_label &&
                              getProfileIdentification(
                                piece,
                                access
                              ) !== piece.internal_label && (
                                <small
                                  style={{
                                    display: "block",
                                    marginTop: "4px",
                                    color: "#6b7280",
                                  }}
                                >
                                  Interno: {piece.internal_label}
                                </small>
                              )}
                          </td>

                          <td style={tdStyle}>
                            {piece.campaign_name ||
                              "-"}
                          </td>

                          <td style={tdStyle}>
                            {piece.seller_name ||
                              "-"}
                          </td>

                          <td
                            style={tdStyle}
                            className="admin-pro-actions-cell"
                          >
                            <div className="admin-pro-actions-grid">
                              <button
                                type="button"
                                onClick={() =>
                                  startEdit(
                                    piece
                                  )
                                }
                                style={{
                                  ...miniButton,
                                  background:
                                    "#eff6ff",
                                  color:
                                    "#1d4ed8",
                                  border:
                                    "1px solid #bfdbfe",
                                }}
                              >
                                Editar peça
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  copiar(
                                    publicPieceLink(
                                      piece,
                                      access
                                    )
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
                                Copiar link do Totem
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  copiar(
                                    controlCardLink(
                                      piece
                                    )
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
                                Copiar link do Cartão
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  baixarQrTotem(
                                    piece
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
                                Baixar QR do Totem
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  baixarQrCartao(
                                    piece
                                  )
                                }
                                style={{
                                  ...miniButton,
                                  background:
                                    "#b8892f",
                                  color:
                                    "#ffffff",
                                  border:
                                    "1px solid #b8892f",
                                }}
                              >
                                Baixar QR do Cartão
                              </button>

                              <button
                                type="button"
                                disabled={
                                  limpandoId ===
                                  piece.id
                                }
                                onClick={() =>
                                  limparCadastro(
                                    piece
                                  )
                                }
                                style={{
                                  ...miniButton,
                                  background:
                                    limpandoId ===
                                    piece.id
                                      ? "#e5e7eb"
                                      : "#fff1f2",
                                  color:
                                    limpandoId ===
                                    piece.id
                                      ? "#6b7280"
                                      : "#be123c",
                                  border:
                                    "1px solid #fecdd3",
                                  cursor:
                                    limpandoId ===
                                    piece.id
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                              >
                                {limpandoId ===
                                piece.id
                                  ? "Limpando..."
                                  : "Limpar cadastro"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>

              {!filteredPieces.length && (
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

      {editando && (
        <div
          className="admin-pro-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setEditando(null);
            }
          }}
        >
          <section
            className="admin-pro-modal"
            role="dialog"
            aria-modal="true"
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
                <p
                  style={{
                    margin: "0 0 4px",
                    color: "#6b7280",
                    fontWeight: 800,
                  }}
                >
                  Código: {editando.code}
                </p>

                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Editar peça TAP PRO
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditando(null)
                }
                style={{
                  ...miniButton,
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveEdit}
              style={{
                marginTop: "20px",
              }}
            >
              <div className="admin-pro-grid">
                <div>
                  <label style={labelStyle}>
                    Ambiente
                  </label>

                  <select
                    name="environment"
                    value={
                      editForm.environment
                    }
                    onChange={
                      handleEditChange
                    }
                    style={inputStyle}
                  >
                    <option value="demonstration">
                      Demonstração
                    </option>
                    <option value="homologation">
                      Homologação
                    </option>
                    <option value="production">
                      Produção
                    </option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      editForm.status
                    }
                    onChange={
                      handleEditChange
                    }
                    style={inputStyle}
                  >
                    <option value="available">
                      Disponível
                    </option>
                    <option value="activated">
                      Ativada
                    </option>
                    <option value="blocked">
                      Bloqueada
                    </option>
                    <option value="replaced">
                      Substituída
                    </option>
                    <option value="archived">
                      Arquivada
                    </option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Perfil
                  </label>

                  <select
                    name="predefinedProfileType"
                    value={
                      editForm.predefinedProfileType
                    }
                    onChange={
                      handleEditChange
                    }
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
                    Quantidade física
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="5000"
                    name="physicalQuantity"
                    value={
                      editForm.physicalQuantity
                    }
                    onChange={
                      handleEditChange
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Identificação interna
                  </label>

                  <input
                    name="internalLabel"
                    value={
                      editForm.internalLabel
                    }
                    onChange={
                      handleEditChange
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Campanha
                  </label>

                  <input
                    name="campaignName"
                    value={
                      editForm.campaignName
                    }
                    onChange={
                      handleEditChange
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Responsável
                  </label>

                  <input
                    name="sellerName"
                    value={
                      editForm.sellerName
                    }
                    onChange={
                      handleEditChange
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Observações
                  </label>

                  <input
                    name="notes"
                    value={
                      editForm.notes
                    }
                    onChange={
                      handleEditChange
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setEditando(null)
                  }
                  style={{
                    ...buttonStyle,
                    background: "#ffffff",
                    color: "#374151",
                    border:
                      "1px solid #d1d5db",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  style={{
                    ...buttonStyle,
                    background: salvando
                      ? "#9ca3af"
                      : "#111827",
                    color: "#ffffff",
                    cursor: salvando
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}