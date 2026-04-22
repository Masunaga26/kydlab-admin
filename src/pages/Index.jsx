import { useState } from "react";
import { supabase } from "../client";import { useNavigate } from "react-router-dom";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Logado com sucesso!");
      navigate("/dashboard"); // 🔥 agora funciona
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
useEffect(() => {
  async function checkUser() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      navigate("/dashboard");
    }
  }

  checkUser();
}, []);
}