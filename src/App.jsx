import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// LOGIN / ADMIN
import Login from "./pages/Login";
import Admin from "./pages/Admin";

// ROTAS PÚBLICAS DAS TAGS
import QrRedirect from "./pages/QrRedirect";
import NfcView from "./pages/NfcView";
import Escolha from "./pages/Escolha";
import CadastroPet from "./pages/CadastroPet";
import CadastroPessoa from "./pages/CadastroPessoa";
import PetView from "./pages/PetView";
import PessoaView from "./pages/PessoaView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route path="/admin" element={<Admin />} />

        {/* ROTAS PÚBLICAS — QR / NFC NÃO PODEM PEDIR LOGIN */}
        <Route path="/qr/:code" element={<QrRedirect />} />
        <Route path="/nfc/:code" element={<NfcView />} />

        {/* ESCOLHA DO TIPO DE CADASTRO */}
        <Route path="/escolha/:code" element={<Escolha />} />

        {/* CADASTROS PÚBLICOS */}
        <Route path="/cadastro/pet/:code" element={<CadastroPet />} />
        <Route path="/cadastro/pessoa/:code" element={<CadastroPessoa />} />

        {/* VISUALIZAÇÃO PÚBLICA */}
        <Route path="/perfil/pet/:code" element={<PetView />} />
        <Route path="/perfil/pessoa/:code" element={<PessoaView />} />

        {/* COMPATIBILIDADE COM LINKS ANTIGOS */}
        <Route path="/perfil/:code" element={<NfcView />} />

        {/* REDIRECIONAMENTO PADRÃO */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}