import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function NfcView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [bloqueado, setBloqueado] = useState(true);

  useEffect(() => {
    verificar();
  }, []);

  async function verificar() {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (!data) return;

    if (!data.locked) {
      setBloqueado(true);
      return;
    }

    if (data.tipo === "pet") {
      navigate(`/view/pet/${code}`);
    } else {
      navigate(`/view/pessoa/${code}`);
    }
  }

  if (bloqueado) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>🔒 Produto não ativado</h2>
        <p>Finalize o cadastro antes de usar o NFC</p>
      </div>
    );
  }

  return null;
}