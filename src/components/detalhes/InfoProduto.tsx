import React from 'react';

interface InfoProdutoProps {
  titulo: string;
  preco: number;
  localizacao: string;
  descricao?: string;
  categoria?: string;
  condicao?: string;
}

const InfoProduto: React.FC<InfoProdutoProps> = ({ titulo, preco, localizacao, descricao, categoria, condicao }) => {
  return (
    <div className="flex flex-col max-w-lg">

      {/* 1. TAG DE CATEGORIA E CONDICAO */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {categoria && (
          <span className="bg-[#1a1a2e] text-liquid-purple text-[10px] font-bold px-5 py-2 rounded-full border border-white/5 uppercase tracking-[0.2em]">
            {categoria}
          </span>
        )}
        {condicao && (
          <span className="bg-[#1a1a2e] text-electric-blue text-[10px] font-bold px-5 py-2 rounded-full border border-white/5 uppercase tracking-[0.2em]">
            {condicao}
          </span>
        )}
      </div>

      {/* 2. LOCALIZAÇÃO */}
      <div className="flex items-center gap-2 text-electric-blue font-semibold text-xl tracking-tight mb-4">
        <span>📍</span>
        <span>{localizacao}</span>
      </div>

      {/* 3. TÍTULO */}
      <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-none text-white uppercase italic">
        {titulo}
      </h1>

      {/* 4. PREÇO */}
      <div className="text-7xl font-black text-white mb-10 tracking-tighter flex items-baseline gap-2">
        <span className="text-3xl text-electric-blue font-bold">R$</span>
        {preco.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
      </div>

      {/* 5. DESCRIÇÃO */}
      <div className="max-w-sm">
        <p className="text-white/40 text-[16px] leading-snug font-medium uppercase tracking-tight">
          {descricao ?? "Aparelho em excelente estado de conservação. 128gb de memória, saúde da bateria em 88%. Acompanha caixa e cabo original."}
        </p>
      </div>

    </div>
  );
};

export default InfoProduto;
