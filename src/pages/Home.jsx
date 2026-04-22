import React, { useState } from 'react';
import BotaoFiltroMestre from '../components/BotaoFiltroMestre';
import ModalFiltros from '../components/ModalFiltros';

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

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState([]);

  const removeFiltro = (filtro) => {
    if (filtro === 'all') setFiltrosAtivos([]);
    else setFiltrosAtivos(filtrosAtivos.filter(f => f !== filtro));
  };

  return (
    <div className="container mx-auto px-6 py-8">
      
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
    </div>
  );
};

export default Home;