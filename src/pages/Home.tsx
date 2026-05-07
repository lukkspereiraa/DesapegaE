import React, { useMemo, useState } from 'react';
import BotaoFiltroMestre from '../components/home/BotaoFiltroMestre';
import ModalFiltros from '../components/home/ModalFiltros';
import CardProduto from '../components/home/CardProduto';
import { trpc } from '../lib/trpc';

import {
  X, Shirt, Armchair, Tv, LayoutGrid,
  Sparkles, History, Clock, DollarSign,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const fallbackImage = 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=400';

const iconesFiltros: Record<string, LucideIcon> = {
  "Roupas": Shirt,
  "Móveis": Armchair,
  "Eletrônicos": Tv,
  "Todos": LayoutGrid,
  "Novo": Sparkles,
  "Usado": History,
  "Seminovo": Clock,
};

interface Produto {
  id: number;
  preco: number;
  titulo: string;
  localizacao: string;
  imagem: string;
  condicao: string;
  categoria: string;
}

const formatLocation = (ad: {
  advertiser: {
    address: {
      neighborhood: string;
      city: {
        name: string;
      };
    };
  };
}) => {
  const neighborhood = ad.advertiser?.address?.neighborhood ?? '';
  const city = ad.advertiser?.address?.city?.name ?? '';
  const location = [neighborhood, city].filter(Boolean).join(', ');
  return location || 'Localizacao nao informada';
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>([]);

  const productsQuery = trpc.product.listPublic.useQuery();

  const produtos = useMemo<Produto[]>(() => {
    const ads = productsQuery.data ?? [];
    return ads.map((ad) => ({
      id: ad.id,
      preco: Number.isFinite(ad.price) ? ad.price / 100 : 0,
      titulo: ad.title,
      localizacao: formatLocation(ad),
      imagem: ad.pictures?.[0]?.url ?? fallbackImage,
      condicao: ad.conditions,
      categoria: ad.category?.name ?? 'Todos',
    }));
  }, [productsQuery.data]);

  const produtosFiltrados = useMemo(() => {
    const categoryFilters = filtrosAtivos.filter((filtro) =>
      ['Roupas', 'Móveis', 'Eletrônicos', 'Todos'].includes(filtro),
    );
    const conditionFilters = filtrosAtivos.filter((filtro) =>
      ['Novo', 'Usado', 'Seminovo'].includes(filtro),
    );

    const minFilter = filtrosAtivos.find((filtro) => filtro.startsWith('Min: R$'));
    const maxFilter = filtrosAtivos.find((filtro) => filtro.startsWith('Max: R$'));
    const minValue = minFilter ? Number(minFilter.replace('Min: R$', '').replace(',', '.')) : undefined;
    const maxValue = maxFilter ? Number(maxFilter.replace('Max: R$', '').replace(',', '.')) : undefined;

    return produtos.filter((produto) => {
      if (categoryFilters.length > 0 && !categoryFilters.includes('Todos')) {
        const produtoCategoria = normalize(produto.categoria);
        const matchCategoria = categoryFilters.some((category) => normalize(category) === produtoCategoria);
        if (!matchCategoria) return false;
      }

      if (conditionFilters.length > 0) {
        const produtoCondicao = normalize(produto.condicao);
        const matchCondicao = conditionFilters.some((condition) => normalize(condition) === produtoCondicao);
        if (!matchCondicao) return false;
      }

      if (Number.isFinite(minValue) && produto.preco < (minValue as number)) {
        return false;
      }

      if (Number.isFinite(maxValue) && produto.preco > (maxValue as number)) {
        return false;
      }

      return true;
    });
  }, [filtrosAtivos, produtos]);

  const removeFiltro = (filtro: string): void => {
    if (filtro === 'all') setFiltrosAtivos([]);
    else setFiltrosAtivos(filtrosAtivos.filter(f => f !== filtro));
  };

  return (
    <div className="container mx-auto px-6 py-8">

      {/* 1. SEÇÃO DE FILTROS */}
      <div className="w-full py-6 flex items-center gap-4">
        <div className="relative">
          <BotaoFiltroMestre onClick={() => setIsModalOpen(!isModalOpen)} />

          <ModalFiltros
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            filtrosAtivos={filtrosAtivos}
            setFiltrosAtivos={setFiltrosAtivos}
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 flex-1">
          {filtrosAtivos.map((filtro) => {
            let IconeExibir: LucideIcon = LayoutGrid;
            if (filtro.startsWith('Min:') || filtro.startsWith('Max:')) {
              IconeExibir = DollarSign;
            } else {
              IconeExibir = iconesFiltros[filtro] ?? LayoutGrid;
            }

            return (
              <div key={filtro} className="flex items-center gap-2 px-4 py-1.5 bg-liquid-purple/10 border border-liquid-purple/30 rounded-full whitespace-nowrap animate-in fade-in zoom-in duration-300">
                <IconeExibir size={12} className="text-electric-blue" />
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  {filtro}
                </span>
                <button onClick={() => removeFiltro(filtro)} className="text-white/40 hover:text-white cursor-pointer ml-1">
                  <X size={14} />
                </button>
              </div>
            );
          })}

          {filtrosAtivos.length > 0 && (
            <button onClick={() => removeFiltro('all')} className="text-[10px] font-black text-white/30 hover:text-white uppercase ml-2 border-b border-white/10 transition-colors">
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      {/* 2. GRID DE PRODUTOS */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {produtosFiltrados.map((produto) => (
          <CardProduto
            key={produto.id}
            id={produto.id}
            imagem={produto.imagem}
            preco={produto.preco}
            titulo={produto.titulo}
            localizacao={produto.localizacao}
          />
        ))}
      </div>

      {productsQuery.isLoading && (
        <p className="mt-6 text-center text-white/50 text-sm font-black">
          Carregando anuncios...
        </p>
      )}

      {productsQuery.error && (
        <p className="mt-6 text-center text-red-400 text-sm font-black">
          {productsQuery.error.message}
        </p>
      )}

      {!productsQuery.isLoading && !productsQuery.error && produtosFiltrados.length === 0 && (
        <p className="mt-6 text-center text-white/40 text-sm font-black">
          Nenhum anuncio encontrado.
        </p>
      )}

    </div>
  );
};

export default Home;
