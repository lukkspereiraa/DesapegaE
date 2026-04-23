import React from 'react';
import { Filter } from 'lucide-react';
import BotaoGenerico from '../BotaoGenerico';

const BotaoFiltroMestre = ({ onClick }) => {
  return (

    <div className="relative group inline-block">
      <div className="absolute -inset-1 
                      bg-linear-to-r from-[#9747FF] to-[#6366F1] 
                      rounded-full blur-lg 
                      opacity-0 group-hover:opacity-100 
                      transition-all duration-500 -z-10" />

      <BotaoGenerico onClick={onClick}>
        <div className="flex items-center gap-2.5">
          <Filter size={18} className="text-white/90" />

          <span className="uppercase text-[12px] font-black tracking-widest whitespace-nowrap">
            Filtros
          </span>
        </div>
      </BotaoGenerico>
    </div>
  );
};

export default BotaoFiltroMestre;