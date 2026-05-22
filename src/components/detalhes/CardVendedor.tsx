import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface CardVendedorProps {
  nome?: string;
  vendas?: string;
  avatarUrl?: string | null;
}

const CardVendedor: React.FC<CardVendedorProps> = ({
  nome = "Lucas Pereira",
  vendas = "12",
  avatarUrl,
}) => {
  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  const initials = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  return (
    <div className="flex items-center gap-5 py-6 mt-4 border-t border-white/5">
      {/* FOTO COM GLOW ROXO SUTIL */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-full p-0.5 bg-linear-to-tr from-liquid-purple to-electric-blue shadow-[0_0_15px_rgba(151,71,255,0.3)]">
          <div className="w-full h-full rounded-full bg-[#050508] p-0.5 flex items-center justify-center text-white font-black overflow-hidden">
            {avatarUrl && !avatarBroken ? (
              <img
                src={avatarUrl}
                className="w-full h-full rounded-full object-cover"
                alt={nome}
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>

      {/* TEXTOS */}
      <div className="flex flex-col gap-1">
        <h4 className="text-xl font-black text-white tracking-tight leading-none">
          {nome}
        </h4>

        <div className="flex items-center gap-2">
          {/* ESTRELAS AMARELAS */}
          <div className="flex items-center gap-0.5 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" stroke="none" />
            ))}
          </div>

          {/* VENDAS */}
          <span className="text-white/40 text-[13px] font-bold">
            ({vendas} vendas)
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardVendedor;
