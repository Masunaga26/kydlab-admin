import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  limparCodigoPro,
  codigoProValido,
  getProfessionalActivationByCode,
  salvarAcessoPro,
} from "../../lib/tappro";

export default function ProAtivar() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function verificarCodigo() {
      const cleanCode = limparCodigoPro(code);

      if (!codigoProValido(cleanCode)) {
        setErro("Código TAP PRO inválido.");
        setLoading(false);
        return;
      }

      const { data, error } = await getProfessionalActivationByCode(cleanCode);

      if (error) {
        console.error("Erro ao buscar perfil TAP PRO:", error);
        setErro("Não foi possível verificar este código.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErro("Código TAP PRO não encontrado.");
        setLoading(false);
        return;
      }

      salvarAcessoPro(cleanCode);

      if (data.active) {
        navigate(`/pro/editar/${cleanCode}`, { replace: true });
        return;
      }

      navigate(`/pro/cadastro/${cleanCode}`, { replace: true });
    }

    verificarCodigo();
  }, [code, navigate]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">TAP PRO</h1>
          <p className="text-neutral-300">Verificando código...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-6">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold mb-3">TAP PRO</h1>
        <p className="text-neutral-300">{erro}</p>
      </div>
    </main>
  );
}