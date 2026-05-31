import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// páginas
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import PessoaView from "./pages/PessoaView";
import PetView from "./pages/PetView";
import QrRedirect from "./pages/QrRedirect";
import TagEntry from "./pages/TagEntry";
import Escolha from "./pages/Escolha";

// proteção
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* ROTAS PÚBLICAS QR / NFC */}
        <Route path="/qr/:code" element={<QrRedirect />} />
        <Route path="/nfc/:code" element={<QrRedirect />} />
        <Route path="/ativar/:code" element={<TagEntry />} />
        <Route path="/escolha/:code" element={<Escolha />} />

        {/* VISUALIZAÇÃO PÚBLICA */}
        <Route path="/pessoa/:code" element={<PessoaView />} />
        <Route path="/pet/:code" element={<PetView />} />

        {/* CADASTRO PÚBLICO */}
        <Route path="/cadastro/pessoa/:code" element={<PessoaView />} />
        <Route path="/cadastro/pet/:code" element={<PetView />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN PROTEGIDO */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;