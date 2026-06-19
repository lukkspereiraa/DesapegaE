import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Home from './pages/Home/Home';
import DetalheProduto from './pages/DetalhesProduto/DetalheProduto';
import Cadastro from './pages/Cadastro/Cadastro';
import Login from './pages/Login/Login';
import EsqueceuSenha from './pages/EsqueceuSenha/EsqueceuSenha';

import Anunciar from './pages/Anunciar/Anunciar';
import Perfil from './pages/Perfil/Perfil';
import EditarPerfil from './pages/EditarPerfil/EditarPerfil';
import EditarProduto from './pages/EditarProduto/EditarProduto';
import DadosPrivados from './pages/DadosPrivados/DadosPrivados';

import { isAuthenticated } from './lib/session';

function RequireAuth({
  children,
}: {
  children: React.ReactElement;
}) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        {/* PRODUTO */}
        <Route
          path="/produto/:id"
          element={<DetalheProduto />}
        />

        {/* AUTENTICAÇÃO */}
        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/esqueceu-senha"
          element={<EsqueceuSenha />}
        />

        {/* ROTAS PROTEGIDAS */}
        <Route
          path="/anunciar"
          element={
            <RequireAuth>
              <Anunciar />
            </RequireAuth>
          }
        />

        <Route
          path="/perfil"
          element={
            <RequireAuth>
              <Perfil />
            </RequireAuth>
          }
        />

        <Route
          path="/editar-perfil"
          element={
            <RequireAuth>
              <EditarPerfil />
            </RequireAuth>
          }
        />

        <Route
          path="/dados-privados"
          element={
            <RequireAuth>
              <DadosPrivados />
            </RequireAuth>
          }
        />

        <Route
          path="/editar-produto"
          element={
            <RequireAuth>
              <EditarProduto />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;