import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import DetalheProduto from './pages/DetalheProduto';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Anunciar from './pages/Anunciar';
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';
import { isAuthenticated } from './lib/session';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;