import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

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

    // 🔴 BLOQUEADO (já cadastrado)
    if (data.locked) {
      if (data.tipo === "pet") {
        navigate(`/pet/${code}`);
      } else {
        navigate(`/pessoa/${code}`);
      }
      return;
    }

    // 🟡 SEM TIPO → escolha
    if (!data.tipo) {
      navigate(`/escolha/${code}`);
      return;
    }

    // 🟢 IR DIRETO PRO CADASTRO
    if (data.tipo === "pet") {
      navigate(`/cadastro/pet/${code}`);
    } else {
      navigate(`/cadastro/pessoa/${code}`);
    }
  }

  return (
    <Container>
      <div style={box}>
        <div style={logo}>🔴 KYD LAB</div>

        <div style={loader}></div>

        <p style={texto}>Carregando informações...</p>
      </div>
    </Container>
  );
}

/* ===== ESTILOS ===== */

const box = {
  textAlign: "center",
  marginTop: 80
};

const logo = {
  fontWeight: "bold",
  fontSize: 18,
  marginBottom: 20
};

const texto = {
  marginTop: 20,
  color: "#777"
};

/* loader simples */
const loader = {
  width: 40,
  height: 40,
  border: "4px solid #eee",
  borderTop: "4px solid #ff2d2d",
  borderRadius: "50%",
  margin: "0 auto",
  animation: "spin 1s linear infinite"
};