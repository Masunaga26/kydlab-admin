import { supabase } from "../supabaseClient";

// 🔥 gera código aleatório (10 caracteres)
function gerarCodigo() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

// 🚀 função principal
export async function gerarLote(qtd = 100) {
  const lista = [];

  for (let i = 0; i < qtd; i++) {
    lista.push({
      code: gerarCodigo(),
      locked: false,
      printed: false,
    });
  }

  const { error } = await supabase
    .from("tags")
    .insert(lista);

  if (error) {
    console.error("Erro ao gerar lote:", error);
    throw error;
  }

  return true;
}