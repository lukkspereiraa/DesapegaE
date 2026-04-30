import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import DetalheProduto from './pages/DetalheProduto';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Anunciar from './pages/Anunciar';
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';

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
        <Route path="/anunciar" element={<Anunciar />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;