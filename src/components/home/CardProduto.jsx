import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom'; // Importante para a navegação

const CardProduto = ({ id, imagem, preco, titulo, localizacao }) => {
  return (
    /* Trocamos a div por Link para habilitar o clique */
    <Link 
      to={`/produto/${id}`} 
      className="group h-full bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden 
                 flex flex-col
                 transition-all duration-300 ease-in-out
                 hover:border-electric-blue/40 
                 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] 
                 hover:-translate-y-1"
    >

      {/* ÁREA DA IMAGEM */}
      <div className="w-full aspect-[4/3] overflow-hidden">
        <img 
          src={imagem} 
          alt={titulo} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = "https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=400"; 
          }}
        />
      </div>

      {/* CONTEÚDO */}
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

        {/* RODAPÉ: LOCALIZAÇÃO */}
        <div className="flex items-center gap-1.5 mt-4">
          <MapPin size={14} className="text-[#3b82f6]" />
          
          <span className="text-[11px] font-bold text-[#3b82f6] tracking-tight truncate">
            {localizacao}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CardProduto;