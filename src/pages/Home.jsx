import React, { useState } from 'react';
import BotaoFiltroMestre from '../components/BotaoFiltroMestre';
import ModalFiltros from '../components/ModalFiltros';
import CardProduto from '../components/CardProduto'; 

import { 
  X, Shirt, Armchair, Tv, LayoutGrid, 
  Sparkles, History, Clock, DollarSign 
} from 'lucide-react';

const iconesFiltros = {
  "Roupas": Shirt,
  "Móveis": Armchair,
  "Eletrônicos": Tv,
  "Todos": LayoutGrid,
  "Novo": Sparkles,
  "Usado": History,
  "Seminovo": Clock
};

const produtosExemplo = [
  { 
    id: 1, 
    preco: 2500, 
    titulo: "iPhone 13 Pro Max - 256GB Grafite", 
    localizacao: "Centro, Cedro", 
    imagem: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=400&q=80" 
  },
  { 
    id: 2, 
    preco: 450, 
    titulo: "Cadeira Gamer Reclinável Preta", 
    localizacao: "Vila Nova, Cedro", 
    imagem: "https://m.media-amazon.com/images/I/61H3dhK2+BL._AC_SY300_SX300_QL70_ML2_.jpg" 
  },
  { 
    id: 3, 
    preco: 120, 
    titulo: "Tênis Esportivo Running - Tam 41", 
    localizacao: "Pista, Cedro", 
    imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" 
  },
  { 
    id: 4, 
    preco: 3200, 
    titulo: "Smart TV 4K 55' Samsung Neo QLED", 
    localizacao: "Centro, Cedro", 
    imagem: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80" 
  },
];

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState([]);

  const removeFiltro = (filtro) => {
    if (filtro === 'all') setFiltrosAtivos([]);
    else setFiltrosAtivos(filtrosAtivos.filter(f => f !== filtro));
  };

  return (
    <div className="container mx-auto px-6 py-8">
      
      {/* 1. SEÇÃO DE FILTROS */}
      <div className="w-full py-6 flex items-center gap-4">
        <div className="relative">
          <BotaoFiltroMestre onClick={() => setIsModalOpen(!isModalOpen)} />
          
          <ModalFiltros 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            filtrosAtivos={filtrosAtivos}
            setFiltrosAtivos={setFiltrosAtivos}
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 flex-1">
          {filtrosAtivos.map((filtro) => {
            let IconeExibir = LayoutGrid;
            if (filtro.startsWith('Min:') || filtro.startsWith('Max:')) {
              IconeExibir = DollarSign;
            } else {
              IconeExibir = iconesFiltros[filtro] || LayoutGrid;
            }

            return (
              <div key={filtro} className="flex items-center gap-2 px-4 py-1.5 bg-liquid-purple/10 border border-liquid-purple/30 rounded-full whitespace-nowrap animate-in fade-in zoom-in duration-300">
                <IconeExibir size={12} className="text-electric-blue" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  {filtro}
                </span>
                <button onClick={() => removeFiltro(filtro)} className="text-white/40 hover:text-white cursor-pointer ml-1">
                  <X size={14} />
                </button>
              </div>
            );
          })}

          {filtrosAtivos.length > 0 && (
            <button onClick={() => removeFiltro('all')} className="text-[10px] font-black text-white/30 hover:text-white uppercase ml-2 border-b border-white/10 transition-colors">
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      {/* 2. GRID DE PRODUTOS (A parte que faltava) */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {produtosExemplo.map((produto) => (
          <CardProduto 
            key={produto.id}
            imagem={produto.imagem}
            preco={produto.preco}
            titulo={produto.titulo}
            localizacao={produto.localizacao}
          />
        ))}
      </div>

    </div>
  );
};

export default Home;