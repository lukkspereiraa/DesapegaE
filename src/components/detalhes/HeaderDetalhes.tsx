import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BotaoGenerico from '../BotaoGenerico';

interface HeaderDetalhesProps {
  tituloProduto: string;
}

const HeaderDetalhes: React.FC<HeaderDetalhesProps> = ({ tituloProduto }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-8 mb-12">

      {/* BOTÃO VOLTAR */}
      <BotaoGenerico
        onClick={() => navigate(-1)}
        className="px-6 py-2.5"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
        <span className="font-black">Voltar</span>
      </BotaoGenerico>

      <nav className="flex items-center gap-3 overflow-hidden">
        {/* Itens Secundários */}
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 whitespace-nowrap">
          <span
            className="hover:text-white transition-colors cursor-pointer"
            onClick={() => navigate('/')}
          >
            Início
          </span>
          <span className="text-white/10 text-xs">•</span>
          <span className="hover:text-white transition-colors cursor-pointer">
            Produtos
          </span>
          <span className="text-white/10 text-xs">•</span>
        </div>

        {/* Item Atual */}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-electric-blue truncate drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
          {tituloProduto}
        </span>
      </nav>

    </div>
  );
};

export default HeaderDetalhes;
