import React from 'react';
import { Search } from 'lucide-react';

const BarraPesquisa = ({ placeholder = "O que você está procurando no Cedro?" }) => {
  return (
    <div className="relative w-full max-w-xl group">

      <div className="absolute inset-0 bg-liquid-purple/20 rounded-full blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 -z-10" />

      <div className="glass-search-liquid flex items-center h-12 w-full px-5
                      /* No hover, ela ganha uma leve definição */
                      hover:bg-white/[0.04] hover:border-white/20
                      /* No foco, ela se destaca suavemente */
                      group-focus-within:bg-white/[0.06] group-focus-within:border-liquid-purple/30">
        
        <Search 
          size={18} 
          className="text-white/20 group-focus-within:text-liquid-purple transition-colors" 
        />

        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 h-full pl-4 
                     bg-transparent border-none outline-none
                     text-[14px] text-white/90 placeholder:text-white/20
                     focus:placeholder:text-white/40"
        />
      </div>
    </div>
  );
};

export default BarraPesquisa;