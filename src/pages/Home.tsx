import React, { useEffect, useState } from 'react';
import BotaoFiltroMestre from '../components/home/BotaoFiltroMestre';
import ModalFiltros from '../components/home/ModalFiltros';
import CardProduto from '../components/home/CardProduto';

import {
  X, Shirt, Armchair, Tv, LayoutGrid,
  Sparkles, History, Clock, DollarSign,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const apiBaseUrl = 'http://localhost:3333';

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
}

interface AdvertisementResponse {
  id: number;
  title: string;
  price: number;
  pictures?: { url: string }[];
  advertiser?: {
    address?: {
      neighborhood?: string | null;
      city?: {
        name?: string | null;
      } | null;
    } | null;
  } | null;
}

const formatLocation = (ad: AdvertisementResponse) => {
  const neighborhood = ad.advertiser?.address?.neighborhood ?? '';
  const city = ad.advertiser?.address?.city?.name ?? '';
  const location = [neighborhood, city].filter(Boolean).join(', ');
  return location || 'Localizacao nao informada';
};

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProdutos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/ads`);
        if (!response.ok) {
          setError(`Falha ao carregar anuncios (HTTP ${response.status}).`);
          return;
        }

        const data = await response.json();
        const ads = Array.isArray(data) ? (data as AdvertisementResponse[]) : [];

        const mapped = ads.map((ad) => ({
          id: ad.id,
          preco: Number.isFinite(ad.price) ? ad.price / 100 : 0,
          titulo: ad.title,
          localizacao: formatLocation(ad),
          imagem: ad.pictures?.[0]?.url ?? fallbackImage,
        }));

        if (isMounted) {
          setProdutos(mapped);
        }
      } catch {
        if (isMounted) {
          setError('Nao foi possivel carregar os anuncios.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProdutos();

    return () => {
      isMounted = false;
    };
  }, []);

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
        {produtos.map((produto) => (
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

      {loading && (
        <p className="mt-6 text-center text-white/50 text-sm font-black">
          Carregando anuncios...
        </p>
      )}

      {error && (
        <p className="mt-6 text-center text-red-400 text-sm font-black">
          {error}
        </p>
      )}

      {!loading && !error && produtos.length === 0 && (
        <p className="mt-6 text-center text-white/40 text-sm font-black">
          Nenhum anuncio encontrado.
        </p>
      )}

    </div>
  );
};

export default Home;
