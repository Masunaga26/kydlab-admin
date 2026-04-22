import NfcView from "./pages/NfcView";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
<Route path="/nfc/:code" element={<NfcView />} />       
 <Route path="/qr/:code" element={<QrRedirect />} />
        <Route path="/escolha/:code" element={<Escolha />} />

        <Route path="/cadastro/pet/:code" element={<CadastroPet />} />
        <Route path="/cadastro/pessoa/:code" element={<CadastroPessoa />} />

        <Route path="/view/pet/:code" element={<PetView />} />
        <Route path="/view/pessoa/:code" element={<PessoaView />} />

        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}