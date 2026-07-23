import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// páginas
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminEdit from "./pages/AdminEdit";
import AdminPro from "./pages/AdminPro";

import PessoaView from "./pages/PessoaView";
import PetView from "./pages/PetView";

import CadastroPessoa from "./pages/CadastroPessoa";
import CadastroPet from "./pages/CadastroPet";

import QrRedirect from "./pages/QrRedirect";
import TagEntry from "./pages/TagEntry";
import Escolha from "./pages/Escolha";

// páginas TAP PRO
import ProAtivar from "./pages/Pro/ProAtivar";
import ProCadastro from "./pages/Pro/ProCadastro";
import ProPerfil from "./pages/Pro/ProPerfil";
import ProEditar from "./pages/Pro/ProEditar";
import ProPortal from "./pages/Pro/ProPortal";
import ProAcesso from "./pages/Pro/ProAcesso";
import ProInicioCadastro from "./pages/Pro/ProInicioCadastro";
import ProEmpresaPainel from "./pages/Pro/ProEmpresaPainel";
import ProEmpresaProfissionalPainel from "./pages/Pro/ProEmpresaProfissionalPainel";
import ProEmpresaPublica from "./pages/Pro/ProEmpresaPublica";
import ProProfissionalCadastro from "./pages/Pro/ProProfissionalCadastro";
import ProProfissionalPainel from "./pages/Pro/ProProfissionalPainel";
import ProProfissionalPublico from "./pages/Pro/ProProfissionalPublico";
import AdminProModulos from "./pages/AdminProModulos";
import ProPagamentoRetorno from "./pages/Pro/ProPagamentoRetorno";
import ProAssinaturaRetorno from "./pages/Pro/ProAssinaturaRetorno";

// páginas TAP INSTA
import TapInstaAtivacao from "./pages/TapInsta/TapInstaAtivacao";
import TapInstaRedirect from "./pages/TapInsta/TapInstaRedirect";
import TapInstaAdmin from "./pages/TapInsta/TapInstaAdmin";

// proteção
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* ROTAS PÚBLICAS QR / NFC */}
        <Route
          path="/qr/:code"
          element={<QrRedirect />}
        />

        <Route
          path="/nfc/:code"
          element={<QrRedirect />}
        />

        <Route
          path="/ativar/:code"
          element={<TagEntry />}
        />

        <Route
          path="/escolha/:code"
          element={<Escolha />}
        />

        {/* ROTAS PÚBLICAS TAP INSTA */}
        <Route
          path="/tapinsta/:publicCode"
          element={<TapInstaAtivacao />}
        />

        <Route
          path="/i/:publicCode"
          element={<TapInstaRedirect />}
        />

        {/* PORTAL GERAL TAP PRO */}
        <Route
          path="/pro"
          element={<ProPortal />}
        />


        <Route
          path="/pro/acesso/:code"
          element={<ProAcesso />}
        />


        {/* CARTÃO-CONTROLE TAP PRO */}
        <Route
          path="/pro/controle/:pieceCode/:accessCode"
          element={<ProInicioCadastro />}
        />

        {/* COMPATIBILIDADE COM ACESSOS ANTERIORES */}
        <Route
          path="/pro/inicio/:accessCode"
          element={<ProInicioCadastro />}
        />


        <Route
          path="/pro/empresa/painel/:accessCode"
          element={<ProEmpresaPainel />}
        />

        <Route
          path="/pro/empresa/profissional/:accessCode"
          element={<ProEmpresaProfissionalPainel />}
        />

        <Route
          path="/pro/empresa/:pieceCode"
          element={<ProEmpresaPublica />}
        />

        <Route
          path="/pro/profissional/cadastro/:accessCode"
          element={<ProProfissionalCadastro />}
        />

        <Route
          path="/pro/profissional/painel/:accessCode"
          element={<ProProfissionalPainel />}
        />

        <Route
          path="/pro/profissional/:pieceCode"
          element={<ProProfissionalPublico />}
        />


        {/* RETORNO DE ASSINATURA TAP PRO */}
        <Route
          path="/pro/assinatura/retorno"
          element={<ProAssinaturaRetorno />}
        />

        {/* RETORNO DE PAGAMENTO TAP PRO */}
        <Route
          path="/pro/pagamento/aprovado"
          element={
            <ProPagamentoRetorno
              status="approved"
            />
          }
        />

        <Route
          path="/pro/pagamento/pendente"
          element={
            <ProPagamentoRetorno
              status="pending"
            />
          }
        />

        <Route
          path="/pro/pagamento/erro"
          element={
            <ProPagamentoRetorno
              status="failure"
            />
          }
        />

        {/* ROTAS TAP PRO POR CÓDIGO */}
        <Route
          path="/pro/ativar/:code"
          element={<ProAtivar />}
        />

        <Route
          path="/pro/cadastro/:code"
          element={<ProCadastro />}
        />

        <Route
          path="/pro/perfil/:code"
          element={<ProPerfil />}
        />

        <Route
          path="/pro/editar/:code"
          element={<ProEditar />}
        />

        {/* CADASTRO PÚBLICO */}
        <Route
          path="/cadastro/pessoa/:code"
          element={<CadastroPessoa />}
        />

        <Route
          path="/cadastro/pet/:code"
          element={<CadastroPet />}
        />

        {/* VISUALIZAÇÃO PÚBLICA */}
        <Route
          path="/pessoa/:code"
          element={<PessoaView />}
        />

        <Route
          path="/pet/:code"
          element={<PetView />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* ADMIN PROTEGIDO */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />


        {/* ADMIN TAP INSTA */}
        <Route
          path="/admin/tapinsta"
          element={
            <ProtectedRoute>
              <TapInstaAdmin />
            </ProtectedRoute>
          }
        />

        {/* ADMIN TAP PRO */}
        <Route
          path="/admin/pro"
          element={
            <ProtectedRoute>
              <AdminPro />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pro/modulos"
          element={
            <ProtectedRoute>
              <AdminProModulos />
            </ProtectedRoute>
          }
        />

        {/* EDIÇÃO ADMIN PROTEGIDA */}
        <Route
          path="/admin/edit/:code"
          element={
            <ProtectedRoute>
              <AdminEdit />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;