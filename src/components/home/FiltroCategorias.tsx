import React from 'react';
import { X } from 'lucide-react';
import BotaoFiltroMestre from './BotaoFiltroMestre';
import ModalFiltros from './ModalFiltros';

interface FiltroCategoriaProps {
  onAbrirFiltros: () => void;
  isModalOpen: boolean;
  onClose: () => void;
  filtrosAtivos?: string[];
  onRemoveFiltro: (filtro: string) => void;
  setFiltrosAtivos: React.Dispatch<React.SetStateAction<string[]>>;
}

const FiltroCategorias: React.FC<FiltroCategoriaProps> = ({
  onAbrirFiltros,
  isModalOpen,
  onClose,
  filtrosAtivos = [],
  onRemoveFiltro,
  setFiltrosAtivos,
}) => {
  return (
    <div className="w-full py-6 flex items-center gap-4 h-fit">

      <div className="relative flex items-center justify-center">
        <BotaoFiltroMestre onClick={onAbrirFiltros} />
        <ModalFiltros
          isOpen={isModalOpen}
          onClose={onClose}
          filtrosAtivos={filtrosAtivos}
          setFiltrosAtivos={setFiltrosAtivos}
        />
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 flex-1">
        {filtrosAtivos.map((filtro) => (
          <div
            key={filtro}
            className="flex items-center gap-2 px-4 py-1.5 
                       bg-liquid-purple/10 border border-liquid-purple/30 
                       rounded-full whitespace-nowrap animate-in fade-in zoom-in duration-300"
          >
            <span className="text-[11px] font-black text-white uppercase tracking-wider">
              {filtro}
            </span>

            <button
              onClick={() => onRemoveFiltro(filtro)}
              className="text-white/40 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {filtrosAtivos.length > 0 && (
          <button
            onClick={() => onRemoveFiltro('all')}
            className="text-[10px] font-black text-white/30 hover:text-white 
                       uppercase tracking-widest ml-2 whitespace-nowrap cursor-pointer
                       border-b border-white/5 hover:border-white/20 transition-all duration-300"
          >
            Limpar tudo
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltroCategorias;
