import { supabase } from "../supabaseClient";

const CHAVE_ACESSO_PRO =
  "tappro_codigo_acesso";

const CAMPOS_PUBLICOS_PRO = [
  "code",
  "active",
  "page_template",
  "color_palette",
  "logo_url",
  "mostrar_logo",
  "foto_url",
  "mostrar_foto",
  "nome",
  "titulo_profissional",
  "empresa",
  "mostrar_empresa",
  "descricao",
  "mostrar_descricao",
  "whatsapp",
  "telefone",
  "mostrar_telefone",
  "email",
  "mostrar_email",
  "instagram",
  "mostrar_instagram",
  "linkedin",
  "mostrar_linkedin",
  "site",
  "mostrar_site",
  "area_atendimento",
  "mostrar_area_atendimento",
  "endereco_comercial",
  "mostrar_endereco",
  "maps_url",
  "mostrar_maps",
  "servico_1",
  "servico_2",
  "servico_3",
  "servico_4",
  "mostrar_servicos",
  "especialidade_1",
  "especialidade_2",
  "especialidade_3",
  "especialidade_4",
  "especialidade_5",
  "mostrar_especialidades",
  "whatsapp_mensagem",
  "link_publico",
];

const CAMPOS_ATIVACAO_PRO = [
  "code",
  "active",
];

export function limparCodigoPro(code) {
  return String(code || "")
    .trim()
    .toUpperCase();
}

export function codigoPecaProValido(code) {
  return /^[0-9]{3}[A-Z]{7}$/.test(
    limparCodigoPro(code)
  );
}

export function codigoAdminProValido(code) {
  const cleanCode = limparCodigoPro(code);

  return (
    /^[A-Z]{4}$/.test(cleanCode) ||
    /^[0-9]{3}[A-Z]{7}$/.test(cleanCode)
  );
}

// Compatibilidade com arquivos e fluxos anteriores do TAP PRO.
// Aceita código público de peça e códigos administrativos antigos/novos.
export function codigoProValido(code) {
  return (
    codigoPecaProValido(code) ||
    codigoAdminProValido(code)
  );
}

export function salvarAcessoPro(code) {
  const cleanCode = limparCodigoPro(code);

  if (!codigoProValido(cleanCode)) {
    return false;
  }

  window.localStorage.setItem(
    CHAVE_ACESSO_PRO,
    cleanCode
  );

  return true;
}

export function obterCodigoAcessoPro() {
  return limparCodigoPro(
    window.localStorage.getItem(
      CHAVE_ACESSO_PRO
    )
  );
}

export function encerrarAcessoPro() {
  window.localStorage.removeItem(
    CHAVE_ACESSO_PRO
  );
}

export async function getProfessionalProfileByCode(
  code
) {
  const cleanCode = limparCodigoPro(code);

  const { data, error } = await supabase
    .schema("tappro")
    .from("professional_profiles_public")
    .select(CAMPOS_PUBLICOS_PRO.join(","))
    .eq("code", cleanCode)
    .maybeSingle();

  return { data, error };
}

export async function getProfessionalActivationByCode(
  code
) {
  const cleanCode = limparCodigoPro(code);

  const { data, error } = await supabase
    .schema("tappro")
    .from("professional_activation_codes")
    .select(CAMPOS_ATIVACAO_PRO.join(","))
    .eq("code", cleanCode)
    .maybeSingle();

  return { data, error };
}

export async function getProfessionalProfileForEditByCode(
  code
) {
  const cleanCode = limparCodigoPro(code);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("get_profile_for_edit", {
        p_code: cleanCode,
      });

  return {
    data: data || null,
    error,
  };
}

export async function acessoEdicaoProValido(
  code
) {
  const cleanCode = limparCodigoPro(code);
  const codigoSalvo =
    obterCodigoAcessoPro();

  if (
    !codigoProValido(cleanCode) ||
    codigoSalvo !== cleanCode
  ) {
    return {
      permitido: false,
      error: null,
    };
  }

  const { data, error } =
    await getProfessionalProfileForEditByCode(
      cleanCode
    );

  return {
    permitido: Boolean(
      data && data.active
    ),
    perfil: data || null,
    error,
  };
}

export async function comprimirImagemPro(
  file,
  maxWidth = 1200,
  quality = 0.72
) {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    img.onload = () => {
      const scale = Math.min(
        maxWidth / img.width,
        1
      );

      const canvas =
        document.createElement("canvas");

      canvas.width = Math.round(
        img.width * scale
      );

      canvas.height = Math.round(
        img.height * scale
      );

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(
          new Error(
            "Não foi possível preparar a imagem."
          )
        );

        return;
      }

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Não foi possível comprimir a imagem."
              )
            );

            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(
              /\.[^/.]+$/,
              ".jpg"
            ),
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Imagem inválida."));
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Não foi possível ler a imagem."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadImagemPro(
  code,
  file,
  tipo
) {
  if (!file) {
    return {
      url: null,
      error: null,
    };
  }

  try {
    const cleanCode = limparCodigoPro(code);
    const cleanType = String(tipo || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");

    if (!codigoAdminProValido(cleanCode)) {
      return {
        url: null,
        error: new Error(
          "Código administrativo inválido para envio da imagem."
        ),
      };
    }

    if (!cleanType) {
      return {
        url: null,
        error: new Error(
          "Tipo de imagem inválido."
        ),
      };
    }

    const compressed =
      await comprimirImagemPro(file);

    const filePath =
      `${cleanCode}/${cleanType}.jpg`;

    const { error: uploadError } =
      await supabase.storage
        .from("professional-photos")
        .upload(filePath, compressed, {
          cacheControl: "60",
          upsert: true,
          contentType: "image/jpeg",
        });

    if (uploadError) {
      return {
        url: null,
        error: uploadError,
      };
    }

    const { data } = supabase.storage
      .from("professional-photos")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      return {
        url: null,
        error: new Error(
          "Não foi possível gerar o endereço público da imagem."
        ),
      };
    }

    return {
      // A URL permanece estável mesmo quando a imagem é substituída.
      url: data.publicUrl,
      error: null,
    };
  } catch (error) {
    return {
      url: null,
      error,
    };
  }
}

function criarPayloadPerfil(formData) {
  return {
    page_template:
      formData.page_template || "classico",

    color_palette:
      formData.color_palette || "dourado",

    logo_url:
      formData.logo_url || null,

    mostrar_logo:
      Boolean(formData.mostrar_logo),

    foto_url:
      formData.foto_url || null,

    mostrar_foto:
      Boolean(formData.mostrar_foto),

    nome:
      String(formData.nome || "").trim(),

    titulo_profissional:
      String(
        formData.titulo_profissional || ""
      ).trim(),

    empresa:
      String(formData.empresa || "").trim() ||
      null,

    mostrar_empresa:
      Boolean(formData.mostrar_empresa),

    descricao:
      String(formData.descricao || "").trim() ||
      null,

    mostrar_descricao:
      Boolean(formData.mostrar_descricao),

    whatsapp:
      String(formData.whatsapp || "").replace(
        /\D/g,
        ""
      ),

    telefone:
      String(formData.telefone || "").replace(
        /\D/g,
        ""
      ) || null,

    mostrar_telefone:
      Boolean(formData.mostrar_telefone),

    email:
      String(formData.email || "").trim() ||
      null,

    mostrar_email:
      Boolean(formData.mostrar_email),

    instagram:
      String(formData.instagram || "").trim() ||
      null,

    mostrar_instagram:
      Boolean(formData.mostrar_instagram),

    linkedin:
      String(formData.linkedin || "").trim() ||
      null,

    mostrar_linkedin:
      Boolean(formData.mostrar_linkedin),

    site:
      String(formData.site || "").trim() ||
      null,

    mostrar_site:
      Boolean(formData.mostrar_site),

    area_atendimento:
      String(
        formData.area_atendimento || ""
      ).trim() || null,

    mostrar_area_atendimento:
      Boolean(
        formData.mostrar_area_atendimento
      ),

    endereco_comercial:
      String(
        formData.endereco_comercial || ""
      ).trim() || null,

    mostrar_endereco:
      Boolean(formData.mostrar_endereco),

    maps_url:
      String(formData.maps_url || "").trim() ||
      null,

    mostrar_maps:
      Boolean(formData.mostrar_maps),

    servico_1:
      String(formData.servico_1 || "").trim() ||
      null,

    servico_2:
      String(formData.servico_2 || "").trim() ||
      null,

    servico_3:
      String(formData.servico_3 || "").trim() ||
      null,

    servico_4:
      String(formData.servico_4 || "").trim() ||
      null,

    mostrar_servicos:
      Boolean(formData.mostrar_servicos),

    especialidade_1:
      String(
        formData.especialidade_1 || ""
      ).trim() || null,

    especialidade_2:
      String(
        formData.especialidade_2 || ""
      ).trim() || null,

    especialidade_3:
      String(
        formData.especialidade_3 || ""
      ).trim() || null,

    especialidade_4:
      String(
        formData.especialidade_4 || ""
      ).trim() || null,

    especialidade_5:
      String(
        formData.especialidade_5 || ""
      ).trim() || null,

    mostrar_especialidades:
      Boolean(
        formData.mostrar_especialidades
      ),

    whatsapp_mensagem:
      String(
        formData.whatsapp_mensagem || ""
      ).trim() || null,
  };
}


export async function ativarProfessionalProfilePorCodigo(
  code,
  formData
) {
  const cleanCode = limparCodigoPro(code);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin.replace(
          /\/+$/,
          ""
        )
      : "";

  const linkPublico = baseUrl
    ? `${baseUrl}/pro/perfil/${cleanCode}`
    : `/pro/perfil/${cleanCode}`;

  const payload = {
    ...criarPayloadPerfil(formData),
    link_publico: linkPublico,
  };

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("activate_profile_by_code", {
        p_code: cleanCode,
        p_payload: payload,
      });

  return {
    data: data || null,
    error,
  };
}

export async function atualizarProfessionalProfile(
  code,
  formData
) {
  const cleanCode = limparCodigoPro(code);

  const acesso =
    await acessoEdicaoProValido(
      cleanCode
    );

  if (!acesso.permitido) {
    return {
      data: null,
      error: new Error(
        "Código TAP PRO não autorizado."
      ),
    };
  }

  const payload =
    criarPayloadPerfil(formData);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("update_profile_by_code", {
        p_code: cleanCode,
        p_payload: payload,
      });

  return {
    data: data || null,
    error,
  };
}


export async function adminListarPecasPro() {
  const { data, error } = await supabase
    .schema("tappro")
    .rpc("admin_list_pieces");

  return {
    data: data || [],
    error,
  };
}

export async function adminCriarPecasPro({
  productType,
  predefinedProfileType,
  codeCount,
  physicalQuantity,
  internalLabel,
  campaignName,
  sellerName,
  notes,
}) {
  const { data, error } = await supabase
    .schema("tappro")
    .rpc("admin_create_pieces", {
      p_product_type: productType,
      p_predefined_profile_type:
        predefinedProfileType || null,
      p_code_count: Number(codeCount) || 1,
      p_physical_quantity:
        Number(physicalQuantity) || 1,
      p_internal_label:
        String(internalLabel || "").trim() ||
        null,
      p_campaign_name:
        String(campaignName || "").trim() ||
        null,
      p_seller_name:
        String(sellerName || "").trim() ||
        null,
      p_notes:
        String(notes || "").trim() ||
        null,
    });

  return {
    data: data || [],
    error,
  };
}

export async function adminAtualizarPecaPro({
  pieceId,
  status,
  predefinedProfileType,
  internalLabel,
  campaignName,
  sellerName,
  physicalQuantity,
  notes,
}) {
  const { data, error } = await supabase
    .schema("tappro")
    .rpc("admin_update_piece", {
      p_piece_id: pieceId,
      p_status: status,
      p_predefined_profile_type:
        predefinedProfileType || null,
      p_internal_label:
        String(internalLabel || "").trim() ||
        null,
      p_campaign_name:
        String(campaignName || "").trim() ||
        null,
      p_seller_name:
        String(sellerName || "").trim() ||
        null,
      p_physical_quantity:
        Number(physicalQuantity) || 1,
      p_notes:
        String(notes || "").trim() ||
        null,
    });

  return {
    data: data || null,
    error,
  };
}


export async function adminLimparCadastroPecaPro(
  pieceId
) {
  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "admin_reset_piece_registration",
        {
          p_piece_id: pieceId,
        }
      );

  return {
    data: data || null,
    error,
  };
}


export async function getPieceAccessStatePro(
  code
) {
  const cleanCode = limparCodigoPro(code);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("public_get_piece_access_state", {
        p_code: cleanCode,
      });

  return {
    data: data || null,
    error,
  };
}

export async function escolherTipoPerfilDaPecaPro(
  code,
  profileType
) {
  const cleanCode = limparCodigoPro(code);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("public_choose_piece_profile_type", {
        p_code: cleanCode,
        p_profile_type: profileType,
      });

  return {
    data: data || null,
    error,
  };
}


const CHAVE_ADMIN_PRO =
  "tappro_codigo_admin";

export function salvarAcessoAdminPro(
  accessCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  if (!codigoAdminProValido(cleanCode)) {
    return false;
  }

  window.localStorage.setItem(
    CHAVE_ADMIN_PRO,
    cleanCode
  );

  return true;
}

export function obterAcessoAdminPro() {
  return limparCodigoPro(
    window.localStorage.getItem(
      CHAVE_ADMIN_PRO
    )
  );
}

export function encerrarAcessoAdminPro() {
  window.localStorage.removeItem(
    CHAVE_ADMIN_PRO
  );
}

export async function iniciarPerfilDaPecaPro(
  pieceCode
) {
  const cleanCode =
    limparCodigoPro(pieceCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("public_start_profile_from_piece", {
        p_piece_code: cleanCode,
      });

  return {
    data: data || null,
    error,
  };
}

export async function getInicioPerfilPorAcessoPro(
  accessCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("get_profile_onboarding_state", {
        p_access_code: cleanCode,
      });

  return {
    data: data || null,
    error,
  };
}



function criarPayloadEmpresaPro(formData) {
  const texto = (value) => String(value || "").trim();
  const numero = (value) => String(value || "").replace(/\D/g, "");

  return {
    display_name: texto(formData.display_name),
    description: texto(formData.description) || null,
    logo_url: formData.logo_url || null,
    primary_goal: texto(formData.primary_goal) || "auto",
    page_template: texto(formData.page_template) || "moderno",

    whatsapp: numero(formData.whatsapp),
    whatsapp_message: texto(formData.whatsapp_message) || null,
    show_whatsapp: Boolean(formData.show_whatsapp),

    phone: numero(formData.phone) || null,
    show_phone: Boolean(formData.show_phone),

    instagram: texto(formData.instagram) || null,
    show_instagram: Boolean(formData.show_instagram),

    google_review_url:
      texto(formData.google_review_url) || null,
    show_google_review:
      Boolean(formData.show_google_review),

    pix_key: texto(formData.pix_key) || null,
    show_pix: Boolean(formData.show_pix),

    wifi_ssid: texto(formData.wifi_ssid) || null,
    wifi_password:
      texto(formData.wifi_password) || null,
    show_wifi: Boolean(formData.show_wifi),

    business_hours:
      texto(formData.business_hours) || null,
    show_business_hours:
      Boolean(formData.show_business_hours),

    address_postal_code:
      texto(formData.address_postal_code) || null,
    address_street:
      texto(formData.address_street) || null,
    address_number:
      texto(formData.address_number) || null,
    address_complement:
      texto(formData.address_complement) || null,
    address_neighborhood:
      texto(formData.address_neighborhood) || null,
    address_city:
      texto(formData.address_city) || null,
    address_state:
      texto(formData.address_state).toUpperCase() || null,

    maps_url: texto(formData.maps_url) || null,
    show_maps: Boolean(formData.show_maps),

    show_save_contact:
      formData.show_save_contact !== false,
    show_share_page:
      formData.show_share_page !== false,

    website: texto(formData.website) || null,
    menu_url: texto(formData.menu_url) || null,
    catalog_url: texto(formData.catalog_url) || null,
    delivery_url: texto(formData.delivery_url) || null,
  };
}


export async function salvarCadastroInicialEmpresaPro(
  accessCode,
  formData,
  top3
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("save_company_onboarding", {
        p_access_code: cleanCode,
        p_payload:
          criarPayloadEmpresaPro(formData),
        p_top3: top3,
      });

  return {
    data: data || null,
    error,
  };
}


export async function getCompanyDashboardPro(
  accessCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("get_company_dashboard", {
        p_access_code: cleanCode,
      });

  return {
    data: data || null,
    error,
  };
}

export async function getCompanyPublicByPiecePro(
  pieceCode
) {
  const cleanCode =
    limparCodigoPro(pieceCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("get_company_public_by_piece", {
        p_piece_code: cleanCode,
      });

  return {
    data: data || null,
    error,
  };
}


export async function resolverAberturaEmpresaPorPecaPro(
  pieceCode
) {
  const cleanCode =
    limparCodigoPro(pieceCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "resolve_company_opening_by_piece",
        {
          p_piece_code: cleanCode,
        }
      );

  return {
    data: data || null,
    error,
  };
}


export async function atualizarEmpresaPro(
  accessCode,
  formData,
  top3
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("update_company_profile", {
        p_access_code: cleanCode,
        p_payload:
          criarPayloadEmpresaPro(formData),
        p_top3: top3,
      });

  return {
    data: data || null,
    error,
  };
}


function criarPayloadProfissionalNovo(
  formData
) {
  return {
    professional_name:
      String(
        formData.professional_name || ""
      ).trim(),

    professional_title:
      String(
        formData.professional_title || ""
      ).trim(),

    company_name:
      String(
        formData.company_name || ""
      ).trim() || null,

    description:
      String(
        formData.description || ""
      ).trim() || null,

    photo_url:
      formData.photo_url || null,

    logo_url:
      formData.logo_url || null,

    whatsapp:
      String(
        formData.whatsapp || ""
      ).replace(/\D/g, ""),

    phone:
      String(
        formData.phone || ""
      ).replace(/\D/g, "") || null,

    email:
      String(
        formData.email || ""
      ).trim() || null,

    instagram:
      String(
        formData.instagram || ""
      ).trim() || null,

    linkedin:
      String(
        formData.linkedin || ""
      ).trim() || null,

    website:
      String(
        formData.website || ""
      ).trim() || null,

    maps_url:
      String(
        formData.maps_url || ""
      ).trim() || null,

    area_service:
      String(
        formData.area_service || ""
      ).trim() || null,

    portfolio_url:
      String(
        formData.portfolio_url || ""
      ).trim() || null,

    scheduling_url:
      String(
        formData.scheduling_url || ""
      ).trim() || null,

    company_page_url:
      String(
        formData.company_page_url || ""
      ).trim() || null,

    service_1:
      String(
        formData.service_1 || ""
      ).trim() || null,

    service_2:
      String(
        formData.service_2 || ""
      ).trim() || null,

    service_3:
      String(
        formData.service_3 || ""
      ).trim() || null,

    service_4:
      String(
        formData.service_4 || ""
      ).trim() || null,

    specialty_1:
      String(
        formData.specialty_1 || ""
      ).trim() || null,

    specialty_2:
      String(
        formData.specialty_2 || ""
      ).trim() || null,

    specialty_3:
      String(
        formData.specialty_3 || ""
      ).trim() || null,

    specialty_4:
      String(
        formData.specialty_4 || ""
      ).trim() || null,

    specialty_5:
      String(
        formData.specialty_5 || ""
      ).trim() || null,

    primary_goal:
      String(
        formData.primary_goal || "auto"
      ).trim() || "auto",
  };
}

export async function salvarCadastroInicialProfissionalPro(
  accessCode,
  formData,
  top3
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "save_professional_onboarding",
        {
          p_access_code: cleanCode,
          p_payload:
            criarPayloadProfissionalNovo(
              formData
            ),
          p_top3: top3,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function getProfessionalDashboardNovoPro(
  accessCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "get_professional_dashboard",
        {
          p_access_code: cleanCode,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function atualizarProfissionalNovoPro(
  accessCode,
  formData,
  top3
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "update_professional_profile",
        {
          p_access_code: cleanCode,
          p_payload:
            criarPayloadProfissionalNovo(
              formData
            ),
          p_top3: top3,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function getProfessionalPublicByPieceNovoPro(
  pieceCode
) {
  const cleanCode =
    limparCodigoPro(pieceCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "get_professional_public_by_piece",
        {
          p_piece_code: cleanCode,
        }
      );

  return {
    data: data || null,
    error,
  };
}


export async function adminListarCatalogoModulosPro() {
  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc("admin_list_module_catalog");

  return {
    data: data || [],
    error,
  };
}

export async function adminSalvarModuloCatalogoPro(
  moduleData
) {
  const payload = {
    module_code:
      String(
        moduleData.module_code || ""
      )
        .trim()
        .toLowerCase(),

    name:
      String(
        moduleData.name || ""
      ).trim(),

    short_description:
      String(
        moduleData.short_description || ""
      ).trim() || null,

    benefit:
      String(
        moduleData.benefit || ""
      ).trim() || null,

    profile_scope:
      String(
        moduleData.profile_scope ||
          "both"
      ).trim(),

    billing_type:
      String(
        moduleData.billing_type ||
          "one_time"
      ).trim(),

    price_cents:
      Math.max(
        0,
        Number(
          moduleData.price_cents
        ) || 0
      ),

    trial_days:
      Math.max(
        0,
        Number(
          moduleData.trial_days
        ) || 0
      ),

    is_active:
      Boolean(
        moduleData.is_active
      ),

    is_featured:
      Boolean(
        moduleData.is_featured
      ),

    display_order:
      Number(
        moduleData.display_order
      ) || 0,
  };

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "admin_upsert_module_catalog",
        {
          p_payload: payload,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function adminAlterarStatusModuloCatalogoPro(
  moduleCode,
  isActive
) {
  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "admin_set_module_catalog_status",
        {
          p_module_code:
            String(
              moduleCode || ""
            )
              .trim()
              .toLowerCase(),
          p_is_active:
            Boolean(isActive),
        }
      );

  return {
    data: data || null,
    error,
  };
}


export async function listarCatalogoModulosClientePro(
  accessCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "get_available_module_catalog",
        {
          p_access_code: cleanCode,
        }
      );

  return {
    data: data || [],
    error,
  };
}


export async function adminObterAcessoPecaPro(
  pieceId
) {
  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "admin_get_piece_access",
        {
          p_piece_id: pieceId,
        }
      );

  return {
    data: data || null,
    error,
  };
}


export async function solicitarModuloPerfilPro(
  accessCode,
  moduleCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "request_profile_module",
        {
          p_access_code: cleanCode,
          p_module_code:
            String(
              moduleCode || ""
            )
              .trim()
              .toLowerCase(),
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function adminListarPedidosModulosPro() {
  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "admin_list_module_orders"
      );

  return {
    data: data || [],
    error,
  };
}

export async function adminDecidirPedidoModuloPro(
  orderId,
  decision
) {
  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "admin_decide_module_order",
        {
          p_order_id: orderId,
          p_decision:
            String(
              decision || ""
            )
              .trim()
              .toLowerCase(),
        }
      );

  return {
    data: data || null,
    error,
  };
}


export async function criarCheckoutModuloPro(
  accessCode,
  moduleCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase.functions.invoke(
      "tappro-create-checkout",
      {
        body: {
          accessCode: cleanCode,
          moduleCode:
            String(
              moduleCode || ""
            )
              .trim()
              .toLowerCase(),
        },
      }
    );

  return {
    data: data || null,
    error,
  };
}

export async function ativarTesteProfissionalEmpresaPro(
  accessCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "start_company_professional_trial",
        {
          p_access_code: cleanCode,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function atualizarAberturaEmpresaPro(
  accessCode,
  {
    openingMode,
    directTargetTitle,
    directTargetUrl,
  }
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "update_company_opening_settings",
        {
          p_access_code: cleanCode,
          p_opening_mode:
            String(
              openingMode || "page"
            )
              .trim()
              .toLowerCase(),
          p_direct_target_title:
            String(
              directTargetTitle || ""
            ).trim() || null,
          p_direct_target_url:
            String(
              directTargetUrl || ""
            ).trim() || null,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function salvarConexaoProfissionalEmpresaPro(
  accessCode,
  linkData,
  linkId = null
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const payload = {
    link_type:
      String(
        linkData.link_type || "custom"
      )
        .trim()
        .toLowerCase(),

    title:
      String(
        linkData.title || ""
      ).trim(),

    description:
      String(
        linkData.description || ""
      ).trim() || null,

    url:
      String(
        linkData.url || ""
      ).trim(),

    icon_key:
      String(
        linkData.icon_key || ""
      ).trim() || null,

    is_active:
      linkData.is_active !== false,

    show_on_page:
      linkData.show_on_page !== false,

    is_featured:
      Boolean(
        linkData.is_featured
      ),

    display_order:
      Math.max(
        0,
        Number(
          linkData.display_order
        ) || 0
      ),
  };

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "upsert_company_professional_link",
        {
          p_access_code: cleanCode,
          p_link_id: linkId || null,
          p_payload: payload,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function excluirConexaoProfissionalEmpresaPro(
  accessCode,
  linkId
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "delete_company_professional_link",
        {
          p_access_code: cleanCode,
          p_link_id: linkId,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function salvarCampanhaProfissionalEmpresaPro(
  accessCode,
  campaignData,
  campaignId = null
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const payload = {
    name:
      String(
        campaignData.name || ""
      ).trim(),

    description:
      String(
        campaignData.description || ""
      ).trim() || null,

    destination_type:
      String(
        campaignData.destination_type || "saved_link"
      )
        .trim()
        .toLowerCase(),

    destination_link_id:
      campaignData.destination_link_id || null,

    destination_url:
      String(
        campaignData.destination_url || ""
      ).trim() || null,

    starts_at:
      campaignData.starts_at || null,

    ends_at:
      campaignData.ends_at || null,

    after_end_mode:
      String(
        campaignData.after_end_mode || "page"
      )
        .trim()
        .toLowerCase(),

    after_end_link_id:
      campaignData.after_end_link_id || null,

    after_end_url:
      String(
        campaignData.after_end_url || ""
      ).trim() || null,

    status:
      String(
        campaignData.status || "draft"
      )
        .trim()
        .toLowerCase(),

    is_active:
      Boolean(
        campaignData.is_active
      ),
  };

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "upsert_company_professional_campaign",
        {
          p_access_code: cleanCode,
          p_campaign_id: campaignId || null,
          p_payload: payload,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function alterarStatusCampanhaProfissionalEmpresaPro(
  accessCode,
  campaignId,
  isActive
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "set_company_professional_campaign_active",
        {
          p_access_code: cleanCode,
          p_campaign_id: campaignId,
          p_is_active: Boolean(isActive),
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function excluirCampanhaProfissionalEmpresaPro(
  accessCode,
  campaignId
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "delete_company_professional_campaign",
        {
          p_access_code: cleanCode,
          p_campaign_id: campaignId,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function salvarProgramacaoProfissionalEmpresaPro(
  accessCode,
  ruleData,
  ruleId = null
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const payload = {
    name:
      String(
        ruleData.name || ""
      ).trim(),

    days_of_week:
      Array.isArray(ruleData.days_of_week)
        ? ruleData.days_of_week.map(Number)
        : [],

    start_time:
      String(
        ruleData.start_time || ""
      ).trim(),

    end_time:
      String(
        ruleData.end_time || ""
      ).trim(),

    destination_type:
      String(
        ruleData.destination_type || "saved_link"
      )
        .trim()
        .toLowerCase(),

    destination_link_id:
      ruleData.destination_link_id || null,

    destination_url:
      String(
        ruleData.destination_url || ""
      ).trim() || null,

    priority:
      Math.max(
        0,
        Number(
          ruleData.priority
        ) || 100
      ),

    is_active:
      ruleData.is_active !== false,
  };

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "upsert_company_professional_schedule_rule",
        {
          p_access_code: cleanCode,
          p_rule_id: ruleId || null,
          p_payload: payload,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function alterarStatusProgramacaoProfissionalEmpresaPro(
  accessCode,
  ruleId,
  isActive
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "set_company_professional_schedule_rule_active",
        {
          p_access_code: cleanCode,
          p_rule_id: ruleId,
          p_is_active: Boolean(isActive),
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function excluirProgramacaoProfissionalEmpresaPro(
  accessCode,
  ruleId
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "delete_company_professional_schedule_rule",
        {
          p_access_code: cleanCode,
          p_rule_id: ruleId,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function atualizarVisualProfissionalEmpresaPro(
  accessCode,
  pageTemplate
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "update_company_professional_template",
        {
          p_access_code: cleanCode,
          p_page_template:
            String(
              pageTemplate || ""
            )
              .trim()
              .toLowerCase(),
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function registrarEventoEmpresaPro(
  pieceCode,
  {
    eventType,
    moduleCode = null,
    linkId = null,
    openingSource = null,
    sessionId = null,
    referrerHost = null,
    metadata = {},
  }
) {
  const cleanCode =
    limparCodigoPro(pieceCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "public_track_company_event",
        {
          p_piece_code: cleanCode,
          p_event_type:
            String(
              eventType || ""
            )
              .trim()
              .toLowerCase(),
          p_module_code:
            moduleCode
              ? String(moduleCode)
                  .trim()
                  .toLowerCase()
              : null,
          p_link_id: linkId || null,
          p_opening_source:
            openingSource
              ? String(openingSource)
                  .trim()
                  .toLowerCase()
              : null,
          p_session_id:
            sessionId
              ? String(sessionId).trim()
              : null,
          p_referrer_host:
            referrerHost
              ? String(referrerHost)
                  .trim()
                  .toLowerCase()
              : null,
          p_metadata:
            metadata &&
            typeof metadata === "object" &&
            !Array.isArray(metadata)
              ? metadata
              : {},
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function getMetricasEmpresaProfissionalPro(
  accessCode,
  days = 30
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "get_company_professional_metrics",
        {
          p_access_code: cleanCode,
          p_days: Math.min(
            365,
            Math.max(
              1,
              Number(days) || 30
            )
          ),
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function getResumoCobrancaEmpresaProfissionalPro(
  accessCode
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase
      .schema("tappro")
      .rpc(
        "get_company_professional_billing_summary",
        {
          p_access_code:
            cleanCode,
        }
      );

  return {
    data: data || null,
    error,
  };
}

export async function iniciarCheckoutMensalEmpresaPro(
  accessCode,
  payerEmail
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase.functions.invoke(
      "tappro-start-monthly-checkout",
      {
        body: {
          accessCode:
            cleanCode,
          payerEmail:
            String(
              payerEmail || ""
            )
              .trim()
              .toLowerCase(),
        },
      }
    );

  return {
    data: data || null,
    error:
      error ||
      (
        data?.ok === false
          ? new Error(
              data?.error ||
              "Não foi possível iniciar o checkout mensal."
            )
          : null
      ),
  };
}

export async function criarPixAnualEmpresaPro(
  accessCode,
  payerEmail
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const { data, error } =
    await supabase.functions.invoke(
      "tappro-create-annual-pix",
      {
        body: {
          accessCode:
            cleanCode,
          payerEmail:
            String(
              payerEmail || ""
            )
              .trim()
              .toLowerCase(),
        },
      }
    );

  return {
    data: data || null,
    error:
      error ||
      (
        data?.ok === false
          ? new Error(
              data?.error ||
              "Não foi possível criar o Pix anual."
            )
          : null
      ),
  };
}

export async function sincronizarAssinaturaMensalEmpresaPro(
  accessCode,
  payerEmail,
  subscriptionId = null
) {
  const cleanCode =
    limparCodigoPro(accessCode);

  const cleanSubscriptionId =
    String(
      subscriptionId || ""
    ).trim();

  const { data, error } =
    await supabase.functions.invoke(
      "tappro-sync-monthly-subscription",
      {
        body: {
          accessCode:
            cleanCode,
          payerEmail:
            String(
              payerEmail || ""
            )
              .trim()
              .toLowerCase(),
          subscriptionId:
            cleanSubscriptionId ||
            null,
        },
      }
    );

  return {
    data: data || null,
    error:
      error ||
      (
        data?.ok === false
          ? new Error(
              data?.error ||
              "Não foi possível sincronizar a assinatura."
            )
          : null
      ),
  };
}

export async function regularizarAssinaturaMensalEmpresaPro(
  accessCode,
  payerEmail,
  subscriptionId = null
) {
  const result =
    await sincronizarAssinaturaMensalEmpresaPro(
      accessCode,
      payerEmail,
      subscriptionId
    );

  if (result.error) {
    return result;
  }

  const regularizationUrl =
    String(
      result.data?.regularizationUrl ||
      ""
    ).trim();

  return {
    data: {
      ...result.data,
      regularizationUrl:
        regularizationUrl || null,
    },
    error: null,
  };
}