import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from "./pages/Home/Home";
import DetalheProduto from './pages/DetalhesProduto/DetalheProduto';
import Cadastro from './pages/Cadastro/Cadastro';
import Login from './pages/Login/Login';
import Anunciar from './pages/Anunciar/Anunciar';
import Perfil from './pages/Perfil/Perfil';
import EditarPerfil from './pages/EditarPerfil/EditarPerfil';
<<<<<<< HEAD
import DadosPrivados from './pages/DadosPrivados/DadosPrivados';
=======
>>>>>>> 0471e8603a6f2fce95e821fda133f5fcdc37a9ed
import { isAuthenticated } from './lib/session';
import EditarProduto from './pages/EditarProduto/EditarProduto';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route path="/produto/:id" element={<DetalheProduto />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
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
<<<<<<< HEAD

        <Route
          path="/dados-privados"
          element={
            <RequireAuth>
              <DadosPrivados />
            </RequireAuth>
          }
        />
=======
>>>>>>> 0471e8603a6f2fce95e821fda133f5fcdc37a9ed
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