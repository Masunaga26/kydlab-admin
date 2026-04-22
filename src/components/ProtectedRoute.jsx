import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) return <h2>Carregando...</h2>;

  if (!user) return <Navigate to="/login" />;

  return children;
}