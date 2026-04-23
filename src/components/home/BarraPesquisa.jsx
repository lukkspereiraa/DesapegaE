import React from 'react';
import { Search } from 'lucide-react';

const BarraPesquisa = ({ placeholder = "O que você está procurando no Cedro?" }) => {
  return (
    <div className="relative w-full max-w-xl group">
      
      {/* GLOW DE FUNDO - Agora com um pouquinho de opacidade base para não sumir 100% */}
      <div className="absolute inset-0 bg-liquid-purple/5 rounded-full blur-2xl group-hover:opacity-100 transition-opacity duration-700 -z-10" />

      {/* CONTAINER DA BARRA */}
      <div className="glass-search-liquid flex items-center h-14 w-full px-6
                      /* ESTADO PADRÃO: Mais contraste na borda e fundo */
                      bg-white/[0.05] border border-white/10
                      /* HOVER: Ganha vida antes do clique */
                      hover:bg-white/[0.08] hover:border-white/20
                      /* FOCO: Explosão de cor e brilho */
                      group-focus-within:bg-[#0a0a1a] group-focus-within:border-liquid-purple/50
                      transition-all duration-300 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        
        <Search 
          size={20} 
          strokeWidth={2.5}
          /* Ícone mais visível por padrão */
          className="text-white/40 group-focus-within:text-liquid-purple transition-colors" 
        />

        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 h-full pl-4 
                     bg-transparent border-none outline-none
                     text-[15px] font-medium text-white placeholder:text-white/30
                     group-focus-within:placeholder:text-white/10"
        />

        {/* DETALHE PREMIUM: Um atalho ou indicador (opcional, só visual) */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-black text-white/10 group-focus-within:opacity-0 transition-opacity">
           <span>PRESS</span>
           <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">ENTER</span>
        </div>
      </div>
    </div>
  );
};

export default BarraPesquisa;