import React from 'react';
import { MapPin } from 'lucide-react';

const CardProduto = ({ imagem, preco, titulo, localizacao }) => {
  return (
    <div className="group h-full bg-white/2 border border-white/5 rounded-2xl overflow-hidden 
                    flex flex-col
                    transition-all duration-300 ease-in-out
                    
                    /* EFEITO NO HOVER
                       - border-electric-blue/40: A borda acende em azul.
                       - shadow-[0_0_30px_rgba(37,99,235,0.2)]: O brilho neon azul.
                       - -translate-y-1: O card sobe levemente.
                    */
                    hover:border-electric-blue/40 
                    hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] 
                    hover:-translate-y-1">

      <div className="w-full aspect-4/3 overflow-hidden">
        <img 
          src={imagem} 
          alt={titulo} 

          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between 
                      bg-linear-to-b from-transparent to-[#050510]/50">
        
        <div>
          <p className="text-xl font-extrabold text-white">
            {preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>

          <h3 className="mt-1 text-[13px] font-medium text-white/70 tracking-tight line-clamp-2">
            {titulo}
          </h3>
        </div>

         <div className="flex items-center gap-1.5 mt-4">
          <MapPin size={14} className="text-[#3b82f6]" /> {/* Ícone azul vibrante */}
          
          <span className="text-[11px] font-bold text-[#3b82f6] tracking-tight truncate">
            {localizacao}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardProduto;