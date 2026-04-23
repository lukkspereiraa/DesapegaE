import React from 'react';

const SeloCidade = ({ nome = "Cedro" }) => {
  return (
    <div className="relative flex items-center justify-center group">

      <div className="absolute inset-0 bg-agressive-purple/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="glass-cedro-manual px-5 py-1.5 flex items-center justify-center relative z-10">
        <span className="text-neon-purple text-[12px] font-[900] uppercase tracking-[0.2em]">
          {nome}
        </span>
      </div>
    </div>
  );
};

export default SeloCidade;