import React from 'react';

const InfoProduto = ({ titulo, preco, localizacao, descricao }) => {
  return (
    <div className="flex flex-col max-w-lg">
      
      {/* 1. TAG DE CATEGORIA - Menos peso (font-bold em vez de black) */}
      <div className="mb-6">
        <span className="bg-[#1a1a2e] text-liquid-purple text-[10px] font-bold px-5 py-2 rounded-full border border-white/5 uppercase tracking-[0.2em]">
          Maquina & Tecnologia
        </span>
      </div>

      {/* 2. LOCALIZAÇÃO - Peso médio para não brigar com o título */}
      <div className="flex items-center gap-2 text-electric-blue font-semibold text-xl tracking-tight mb-4">
        <span>📍</span>
        <span>{localizacao}</span>
      </div>

      {/* 3. TÍTULO - Aqui sim mantemos o peso (font-black) */}
      <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-none text-white uppercase italic">
        {titulo}
      </h1>
      
      {/* 4. PREÇO - Peso pesado para destaque máximo */}
      <div className="text-7xl font-black text-white mb-10 tracking-tighter flex items-baseline gap-2">
        <span className="text-3xl text-electric-blue font-bold">R$</span>
        {preco.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
      </div>

      {/* 5. DESCRIÇÃO - Ajustada para font-medium (mais elegante e legível) */}
      <div className="max-w-sm">
        <p className="text-white/40 text-[16px] leading-snug font-medium uppercase tracking-tight">
          {descricao || "Aparelho em excelente estado de conservação. 128gb de memória, saúde da bateria em 88%. Acompanha caixa e cabo original."}
        </p>
      </div>

    </div>
  );
};

export default InfoProduto;