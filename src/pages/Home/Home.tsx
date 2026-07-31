import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import BotaoFiltroMestre from '../../components/home/BotaoFiltroMestre';
import ModalFiltros from '../../components/home/ModalFiltros';
import CardProduto from '../../components/home/CardProduto';

import { trpc } from '../../lib/trpc';

import {
  X,
  Shirt,
  Armchair,
  Tv,
  LayoutGrid,
  Sparkles,
  History,
  Clock,
  DollarSign,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import './Home.css';

const fallbackImage =
  'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=400';

const iconesFiltros: Record<string, LucideIcon> = {
  Novo: Sparkles,
  Usado: History,
  Seminovo: Clock,
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
  advertiser?: {
    address?: {
      neighborhood?: string;
      city?: {
        name?: string;
      };
    };
  };
}) => {
  const neighborhood = ad.advertiser?.address?.neighborhood ?? '';
  const city = ad.advertiser?.address?.city?.name ?? '';

  const location = [neighborhood, city].filter(Boolean).join(', ');

  return location || 'Localização não informada';
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>([]);
  const [ordenacao, setOrdenacao] = useState('mais-recente');
  const [searchParams] = useSearchParams();

  const searchText = (searchParams.get('q') ?? '').trim();
  const normalizedSearch = normalize(searchText);

  const productsQuery = trpc.product.listPublic.useQuery();
  const categoriesQuery = trpc.product.listCategories.useQuery();

  const categorias = useMemo(() => {
    const nomes = categoriesQuery.data?.map((c) => c.name) ?? [];
    return Array.from(new Set(nomes));
  }, [categoriesQuery.data]);

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
      categorias.includes(filtro)
    );

    const conditionFilters = filtrosAtivos.filter((filtro) =>
      ['Novo', 'Usado', 'Seminovo'].includes(filtro)
    );

    const minFilter = filtrosAtivos.find((filtro) =>
      filtro.startsWith('Min: R$')
    );

    const maxFilter = filtrosAtivos.find((filtro) =>
      filtro.startsWith('Max: R$')
    );

    const minValue = minFilter
      ? Number(minFilter.replace('Min: R$', '').replace(',', '.'))
      : undefined;

    const maxValue = maxFilter
      ? Number(maxFilter.replace('Max: R$', '').replace(',', '.'))
      : undefined;

    const resultado = produtos.filter((produto) => {
  if (normalizedSearch) {
    const matchSearch =
      normalize(produto.titulo).includes(normalizedSearch) ||
      normalize(produto.categoria).includes(normalizedSearch) ||
      normalize(produto.localizacao).includes(normalizedSearch) ||
      normalize(produto.condicao).includes(normalizedSearch);

    if (!matchSearch) return false;
  }

  if (categoryFilters.length > 0) {
    const produtoCategoria = normalize(produto.categoria);

    const matchCategoria = categoryFilters.some(
      (category) => normalize(category) === produtoCategoria
    );

    if (!matchCategoria) return false;
  }

  if (conditionFilters.length > 0) {
    const produtoCondicao = normalize(produto.condicao);

    const matchCondicao = conditionFilters.some(
      (condition) => normalize(condition) === produtoCondicao
    );

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

switch (ordenacao) {
  case 'mais-recente':
    resultado.sort((a, b) => b.id - a.id);
    break;

  case 'relevancia':
    resultado.sort((a, b) => b.id - a.id);
    break;

  case 'alfabetica-crescente':
    resultado.sort((a, b) =>
      a.titulo.localeCompare(b.titulo)
    );
    break;

  case 'alfabetica-decrescente':
    resultado.sort((a, b) =>
      b.titulo.localeCompare(a.titulo)
    );
    break;

  case 'preco-crescente':
    resultado.sort((a, b) =>
      a.preco - b.preco
    );
    break;

  case 'preco-decrescente':
    resultado.sort((a, b) =>
      b.preco - a.preco
    );
    break;
}

  return resultado;
}, [
  filtrosAtivos,
  normalizedSearch,
  produtos,
  ordenacao,
  categorias
]);

const removeFiltro = (filtro: string): void => {
    if (filtro === 'all') {
      setFiltrosAtivos([]);
      return;
    }

    setFiltrosAtivos((prev) => prev.filter((item) => item !== filtro));
  };

  return (
    <div className="home-container">
      <div className="home-filtros-section">
        <div className="home-filtro-wrapper">
          <BotaoFiltroMestre onClick={() => setIsModalOpen(!isModalOpen)} />

          <ModalFiltros
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            filtrosAtivos={filtrosAtivos}
            setFiltrosAtivos={setFiltrosAtivos}
            ordenacao={ordenacao}
            setOrdenacao={setOrdenacao}
            categorias={categorias}
          />
        </div>

        <div className="home-filtros-ativos">
          {filtrosAtivos.map((filtro) => {
            let IconeExibir: LucideIcon = LayoutGrid;

            if (filtro.startsWith('Min:') || filtro.startsWith('Max:')) {
              IconeExibir = DollarSign;
            } else {
              IconeExibir = iconesFiltros[filtro] ?? LayoutGrid;
            }

            return (
              <div key={filtro} className="home-filtro-chip">
                <IconeExibir size={12} className="home-filtro-icon" />

                <span className="home-filtro-text">
                  {filtro}
                </span>

                <button
                  type="button"
                  onClick={() => removeFiltro(filtro)}
                  className="home-filtro-remove"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}

          {filtrosAtivos.length > 0 && (
            <button
              type="button"
              onClick={() => removeFiltro('all')}
              className="home-clear-filters"
            >
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      <div className="home-grid-produtos">
        {produtosFiltrados.map((produto) => (
          <CardProduto
            key={produto.id}
            id={produto.id}
            imagem={produto.imagem}
            preco={produto.preco}
            titulo={produto.titulo}
            localizacao={produto.localizacao}
            condicao={produto.condicao}
          />
        ))}
      </div>

      {productsQuery.isLoading && (
        <p className="home-message">
          Carregando anúncios...
        </p>
      )}

      {productsQuery.error && (
        <p className="home-error">
          {productsQuery.error.message}
        </p>
      )}

      {!productsQuery.isLoading &&
        !productsQuery.error &&
        produtosFiltrados.length === 0 && (
          <p className="home-empty">
            Nenhum anúncio encontrado.
          </p>
        )}
    </div>
  );
};

export default Home;