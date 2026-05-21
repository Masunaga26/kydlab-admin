import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// LOGIN / ADMIN
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminEdit from "./pages/AdminEdit";

// ROTAS PÚBLICAS DAS TAGS
import QrRedirect from "./pages/QrRedirect";
import NfcView from "./pages/NfcView";
import Escolha from "./pages/Escolha";

import CadastroPet from "./pages/CadastroPet";
import CadastroPessoa from "./pages/CadastroPessoa";

import PetView from "./pages/PetView";
import PessoaView from "./pages/PessoaView";
import TagEntry from "./pages/TagEntry";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/edit/:code" element={<AdminEdit />} />

        {/* ENTRADAS PÚBLICAS QR / NFC */}
        <Route path="/qr/:code" element={<QrRedirect />} />
        <Route path="/nfc/:code" element={<NfcView />} />

        {/* ESCOLHA / CADASTRO PÚBLICO */}
        <Route path="/escolha/:code" element={<Escolha />} />
        <Route path="/cadastro/pet/:code" element={<CadastroPet />} />
        <Route path="/cadastro/pessoa/:code" element={<CadastroPessoa />} />

        {/* VISUALIZAÇÃO PÚBLICA */}
        <Route path="/pet/:code" element={<PetView />} />
        <Route path="/pessoa/:code" element={<PessoaView />} />

        {/* COMPATIBILIDADE COM LINKS ANTIGOS */}
        <Route path="/view/pet/:code" element={<PetView />} />
        <Route path="/view/pessoa/:code" element={<PessoaView />} />
        <Route path="/perfil/pet/:code" element={<PetView />} />
        <Route path="/perfil/pessoa/:code" element={<PessoaView />} />
        <Route path="/perfil/:code" element={<NfcView />} />

        {/* ENTRADAS GENÉRICAS ANTIGAS */}
        <Route path="/tag/:code" element={<TagEntry />} />
        <Route path="/ativar/:code" element={<TagEntry />} />

        {/* RAIZ */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}