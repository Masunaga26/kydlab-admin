import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas existentes (baseado no seu print)
import Login from "./pages/Login";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route path="/admin" element={<Admin />} />

        {/* REDIRECIONAMENTO PADRÃO */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}