import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🔹 Páginas
import NfcView from "./pages/NfcView";
import QrRedirect from "./pages/QrRedirect";
import Escolha from "./pages/Escolha";

import CadastroPet from "./pages/CadastroPet";
import CadastroPessoa from "./pages/CadastroPessoa";

import PetView from "./pages/PetView";
import PessoaView from "./pages/PessoaView";

import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 ENTRADAS */}
        <Route path="/qr/:code" element={<QrRedirect />} />
        <Route path="/nfc/:code" element={<NfcView />} />

        {/* 🔀 ESCOLHA */}
        <Route path="/escolha/:code" element={<Escolha />} />

        {/* 📝 CADASTRO */}
        <Route path="/cadastro/pet/:code" element={<CadastroPet />} />
        <Route path="/cadastro/pessoa/:code" element={<CadastroPessoa />} />

        {/* 👁️ VISUALIZAÇÃO (PADRÃO FINAL) */}
        <Route path="/pet/:code" element={<PetView />} />
        <Route path="/pessoa/:code" element={<PessoaView />} />

        {/* 🛠️ ADMIN */}
        <Route path="/admin" element={<Admin />} />

      </Routes>
    </BrowserRouter>
  );
}