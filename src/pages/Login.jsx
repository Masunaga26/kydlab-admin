import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao verificar sessão:", error);
        return;
      }

      if (data?.session) {
        navigate("/admin");
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErro("");

    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLimpo,
      password: senhaLimpa,
    });

    setLoading(false);

    if (error) {
      console.error("Erro Supabase login:", error);
      setErro(error.message || "Não foi possível fazer login.");
      return;
    }

    if (!data?.session) {
      setErro("Login realizado, mas a sessão não foi criada.");
      return;
    }

    navigate("/admin");
  };

  return (
    <div style={page}>
      <form onSubmit={handleLogin} style={box}>
        <h2 style={title}>Login Admin</h2>

        {erro && (
          <div style={errorBox}>
            {erro}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          autoComplete="current-password"
          onChange={(e) => setSenha(e.target.value)}
          style={input}
        />

        <button type="submit" disabled={loading} style={button}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  background: "#f2f2f2",
  padding: 20,
};

const box = {
  maxWidth: 420,
  margin: "80px auto",
  background: "#fff",
  padding: 24,
  borderRadius: 18,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const title = {
  marginTop: 0,
  marginBottom: 20,
  color: "#111",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  marginBottom: 12,
  padding: 14,
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 15,
};

const button = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "none",
  background: "#ff1c1c",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const errorBox = {
  background: "#fff1f1",
  color: "#b00020",
  padding: 12,
  borderRadius: 10,
  marginBottom: 14,
  fontSize: 14,
};