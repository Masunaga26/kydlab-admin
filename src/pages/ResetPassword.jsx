import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState("");
  const navigate = useNavigate();

  // 🔥 CAPTURA O TOKEN DO EMAIL
  useEffect(() => {
    const handleSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        return;
      }

      if (!data.session) {
        alert("Link inválido ou expirado");
        navigate("/login");
      }
    };

    handleSession();
  }, []);

  // 🔥 ATUALIZA SENHA
  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Senha atualizada com sucesso!");
    navigate("/admin");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Definir nova senha</h2>

      <input
        type="password"
        placeholder="Nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleUpdate} style={{ width: "100%" }}>
        Atualizar senha
      </button>
    </div>
  );
}