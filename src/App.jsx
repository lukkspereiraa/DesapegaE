import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import DetalheProduto from './pages/DetalheProduto';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota da Home: Envolvida pelo Layout (Com Header/Footer) */}
        <Route 
          path="/" 
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          } 
        />
        
        {/* Rota de Detalhe: SEM o Layout */}
        <Route path="/produto/:id" element={<DetalheProduto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;