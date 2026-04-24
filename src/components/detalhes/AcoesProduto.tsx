import React from 'react';
import { Heart } from 'lucide-react';

const AcoesProduto: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 mt-6 w-full">

      {/* BOTÃO CHAT */}
      <button className="w-full py-4 bg-linear-to-r from-liquid-purple to-electric-blue rounded-2xl transition-all hover:brightness-110 shadow-[0_10px_20px_rgba(151,71,255,0.3)] cursor-pointer">
        <span className="font-black text-white text-base">
          Tenho Interesse / Chat
        </span>
      </button>

      {/* BOTÃO SALVAR */}
      <button className="w-full flex items-center justify-center gap-3 py-4 bg-white/3 border border-white/10 rounded-2xl hover:bg-white/8 transition-all cursor-pointer group">
        <Heart size={20} className="text-white group-hover:fill-white transition-all" strokeWidth={2} />
        <span className="font-bold text-white text-base">
          Salvar Favorito
        </span>
      </button>

      {/* DENUNCIAR */}
      <button className="mt-2 text-[10px] font-black uppercase tracking-widest text-red-600/80 hover:text-red-500 transition-colors cursor-pointer text-center w-full">
        Denunciar Anúncio
      </button>

    </div>
  );
};

export default AcoesProduto;
