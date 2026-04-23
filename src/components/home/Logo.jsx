import React from 'react';
import SeloCidade from './SeloCidade';

const Logo = ({ cidade = "Cedro" }) => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <h1 className="text-2xl font-black tracking-tighter text-white">
        Desapega<span className="text-liquid-purple drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Ê</span>
      </h1>

      <div className="scale-90 origin-left transition-transform group-hover:scale-95">
        <SeloCidade nome={cidade} />
      </div>
    </div>
  );
};

export default Logo;