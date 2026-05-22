import React, { useEffect, useMemo, useState } from 'react';

interface GaleriaProdutoProps {
  imagens: string[];
  titulo: string;
}

const fallbackImage = 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=800';

const GaleriaProduto: React.FC<GaleriaProdutoProps> = ({ imagens, titulo }) => {
  const outrasFotos = useMemo(() => {
    const validImages = imagens.filter((image) => image.trim().length > 0);
    return validImages.length > 0 ? validImages : [fallbackImage];
  }, [imagens]);

  const [fotoExibida, setFotoExibida] = useState<string>(outrasFotos[0]);

  useEffect(() => {
    setFotoExibida(outrasFotos[0]);
  }, [outrasFotos]);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* 1. IMAGEM PRINCIPAL */}
      <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/10 bg-[#0a0a1a] group shadow-2xl">
        <img
          src={fotoExibida}
          className="w-full h-full object-cover transition-all duration-500"
          alt={titulo}
          onError={(event) => {
            const image = event.currentTarget;
            image.onerror = null;
            image.src = fallbackImage;
          }}
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
            <img
              src={foto}
              className="w-full h-full object-cover rounded-[20px]"
              alt={`Miniatura ${index}`}
              onError={(event) => {
                const image = event.currentTarget;
                image.onerror = null;
                image.src = fallbackImage;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GaleriaProduto;
