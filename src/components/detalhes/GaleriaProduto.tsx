import React, { useState } from 'react';

interface GaleriaProdutoProps {
  imagemPrincipal: string;
  titulo: string;
}

const GaleriaProduto: React.FC<GaleriaProdutoProps> = ({ imagemPrincipal, titulo }) => {
  const [fotoExibida, setFotoExibida] = useState<string>(imagemPrincipal);

  const outrasFotos: string[] = [
    imagemPrincipal,
    "https://images.pexels.com/photos/4065887/pexels-photo-4065887.jpeg?auto=compress&cs=tinysrgb&w=400",
    "https://images.pexels.com/photos/4065890/pexels-photo-4065890.jpeg?auto=compress&cs=tinysrgb&w=400",
  ];

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* 1. IMAGEM PRINCIPAL */}
      <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/10 bg-[#0a0a1a] group shadow-2xl">
        <img
          src={fotoExibida}
          className="w-full h-full object-cover transition-all duration-500"
          alt={titulo}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#050510]/40 to-transparent pointer-events-none" />
      </div>

      {/* 2. MINIATURAS  */}
      <div className="flex gap-4">
        {outrasFotos.map((foto, index) => (
          <button
            key={index}
            onClick={() => setFotoExibida(foto)}
            className={`w-24 h-24 rounded-[28px] overflow-hidden border-2 transition-all cursor-pointer p-1 
              ${fotoExibida === foto
                ? 'border-electric-blue shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105'
                : 'border-white/5 bg-white/3 hover:border-white/20'
              }`}
          >
            <img src={foto} className="w-full h-full object-cover rounded-[20px]" alt={`Miniatura ${index}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GaleriaProduto;
