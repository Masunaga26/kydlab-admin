import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function QrRedirect() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    verificar();
  }, []);

  async function verificar() {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (!data) {
      alert("Código inválido");
      return;
    }

    // 🔴 JÁ BLOQUEADO → VIEW DIRETO
    if (data.locked) {
      if (data.tipo === "pet") {
        navigate(`/view/pet/${code}`);
      } else {
        navigate(`/view/pessoa/${code}`);
      }
      return;
    }

    // 🟡 NÃO TEM TIPO
    if (!data.tipo) {
      navigate(`/escolha/${code}`);
      return;
    }

    // 🟢 IR PRA CADASTRO
    if (data.tipo === "pet") {
      navigate(`/cadastro/pet/${code}`);
    } else {
      navigate(`/cadastro/pessoa/${code}`);
    }
  }

  return <p>Carregando...</p>;
}