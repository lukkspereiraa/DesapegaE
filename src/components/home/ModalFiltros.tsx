import React from 'react';
import {
  Globe, DollarSign, Shirt, Check,
  Armchair, Tv, LayoutGrid, Sparkles,
  History, Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconesOpcoes: Record<string, LucideIcon> = {
  "Roupas": Shirt,
  "Móveis": Armchair,
  "Eletrônicos": Tv,
  "Todos": LayoutGrid,
  "Novo": Sparkles,
  "Usado": History,
  "Seminovo": Clock,
};

interface SecaoFiltroProps {
  icone: LucideIcon;
  titulo: string;
  opcoes: string[];
  filtrosAtivos: string[];
  onToggle: (opcao: string) => void;
}

const SecaoFiltro: React.FC<SecaoFiltroProps> = ({
  icone: Icone,
  titulo,
  opcoes,
  filtrosAtivos,
  onToggle,
}) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Icone size={18} className="text-white/80" />
      <span className="text-[12px] font-black uppercase tracking-widest text-white/90">
        {titulo}
      </span>
    </div>

    <div className="flex flex-col gap-3 ml-7">
      {opcoes.map((opcao) => {
        const IconeOpcao = iconesOpcoes[opcao] ?? LayoutGrid;

        return (
          <label key={opcao} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => onToggle(opcao)}
              className={`w-4.5 h-4.5 rounded-sm border-2 transition-all duration-300 flex items-center justify-center
                ${filtrosAtivos.includes(opcao)
                  ? 'bg-electric-blue border-electric-blue'
                  : 'border-white/80 group-hover:border-electric-blue/50'}`}
            >
              {filtrosAtivos.includes(opcao) && <Check size={12} strokeWidth={4} className="text-white" />}
            </div>

            <div className="flex items-center gap-2">
              <IconeOpcao size={14} className={filtrosAtivos.includes(opcao) ? 'text-electric-blue' : 'text-white/80'} />
              <span className={`text-[13px] font-bold ${filtrosAtivos.includes(opcao) ? 'text-electric-blue' : 'text-white/80'}`}>
                {opcao}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  </div>
);

interface ModalFiltrosProps {
  isOpen: boolean;
  onClose: () => void;
  filtrosAtivos: string[];
  setFiltrosAtivos: React.Dispatch<React.SetStateAction<string[]>>;
  ordenacao: string;
  setOrdenacao: React.Dispatch<React.SetStateAction<string>>;
}

const ModalFiltros: React.FC<ModalFiltrosProps> = ({
  isOpen,
  onClose,
  filtrosAtivos,
  setFiltrosAtivos,
  ordenacao,
  setOrdenacao,
}) => {
  if (!isOpen) return null;

  const precoMin = filtrosAtivos.find(f => f.startsWith('Min:'))?.replace('Min: R$', '') ?? '';
  const precoMax = filtrosAtivos.find(f => f.startsWith('Max:'))?.replace('Max: R$', '') ?? '';

  const handlePrecoChange = (tipo: string, valor: string): void => {
    const novosFiltros = filtrosAtivos.filter(f => !f.startsWith(tipo));
    if (valor) novosFiltros.push(`${tipo} R$${valor}`);
    setFiltrosAtivos(novosFiltros);
  };

  const toggleFiltro = (filtro: string): void => {
    if (filtrosAtivos.includes(filtro)) {
      setFiltrosAtivos(filtrosAtivos.filter(f => f !== filtro));
    } else {
      setFiltrosAtivos([...filtrosAtivos, filtro]);
    }
  };

  return (
    <div className="absolute top-full left-0 z-200 mt-1 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="fixed inset-0 z-[-1]" onClick={onClose} />

      <div className="w-75 bg-[#050510] border-2 border-electric-blue rounded-[22px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">

        <SecaoFiltro
          icone={Globe}
          titulo="Tipo de Coleção"
          opcoes={["Roupas", "Móveis", "Eletrônicos", "Todos"]}
          filtrosAtivos={filtrosAtivos}
          onToggle={toggleFiltro}
        />

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-white/80" />
            <span className="text-[12px] font-black uppercase tracking-widest text-white/90">
              Faixa de Preço
            </span>
          </div>

          <div className="flex items-center gap-3 ml-7">
            <div className="flex-1 flex items-center bg-white/3 border border-white/10 px-3 py-2 rounded-xl focus-within:border-electric-blue transition-all">
              <span className="text-[12px] text-electric-blue font-bold mr-1">R$</span>
              <input
                type="number"
                placeholder="00"
                value={precoMin}
                onChange={(e) => handlePrecoChange('Min:', e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[14px] text-white font-bold placeholder:text-white/10"
              />
            </div>
            <span className="text-white/20 font-black text-[10px]">A</span>
            <div className="flex-1 flex items-center bg-white/3 border border-white/10 px-3 py-2 rounded-xl focus-within:border-electric-blue transition-all">
              <span className="text-[12px] text-electric-blue font-bold mr-1">R$</span>
              <input
                type="number"
                placeholder="100"
                value={precoMax}
                onChange={(e) => handlePrecoChange('Max:', e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[14px] text-white font-bold placeholder:text-white/10"
              />
            </div>
          </div>
        </div>

        <SecaoFiltro
          icone={Shirt}
          titulo="Estado"
          opcoes={["Novo", "Usado", "Seminovo"]}
          filtrosAtivos={filtrosAtivos}
          onToggle={toggleFiltro}
        />
        
        <div className="mb-6">
  <div className="flex items-center gap-2 mb-4">
    <LayoutGrid size={18} className="text-white/80" />

    <span className="text-[12px] font-black uppercase tracking-widest text-white/90">
      Ordenar por
    </span>
  </div>

  <select
    value={ordenacao}
    onChange={(e) => setOrdenacao(e.target.value)}
    className="
    w-full
    bg-[#0A0A18]
    border
    border-white/10
    rounded-xl
    p-3
    text-white
    outline-none
    focus:border-electric-blue
    cursor-pointer
    "
  >
    <option value="mais-recente">Mais recente</option>
    <option value="relevancia">Relevância</option>
    <option value="alfabetica-crescente">A → Z</option>
    <option value="alfabetica-decrescente">Z → A</option>
    <option value="preco-crescente">Menor preço</option>
    <option value="preco-decrescente">Maior preço</option>
  </select>
</div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-3 bg-electric-blue/20 hover:bg-electric-blue/40 border border-electric-blue/30 rounded-xl text-[11px] text-electric-blue font-black uppercase tracking-widest transition-all cursor-pointer"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default ModalFiltros;
