import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import GaleriaProduto from '../../components/detalhes/GaleriaProduto';
import HeaderDetalhes from '../../components/detalhes/HeaderDetalhes';
import InfoProduto from '../../components/detalhes/InfoProduto';
import CardVendedor from '../../components/detalhes/CardVendedor';
import AcoesProduto from '../../components/detalhes/AcoesProduto';

import { trpc } from '../../lib/trpc';

import './DetalheProduto.css';

// ============================================================================
// 🔧 CONTROLE DE MOCK: Mude para 'false' para usar os dados do banco real
// ============================================================================
const USE_MOCK_DATA = false;

const MOCK_PRODUTO: {
  id: number;
  title: string;
  description: string;
  price: number;
  conditions: string;
  category: { name: string };
  isFavorited: boolean;
  pictures: { url: string }[];
  address: {
    street: string;
    number: string;
    neighborhood: string;
    cityName: string;
    stateCode: string;
  };
  advertiser: {
    id: number; // ADICIONADO: ID do vendedor para o link funcionar
    name: string;
    avatarUrl: string;
    address?: {
      street?: string | null;
      number?: string | null;
      neighborhood?: string;
      cityName?: string;
      stateCode?: string;
    } | null;
  };
} = {
  id: 999,
  title: "PlayStation 5 Completo + 2 Controles",
  description: "Console em perfeito estado, usado por poucos meses. Acompanha caixa, cabos originais e 2 controles DualSense. Motivo da venda: falta de tempo para jogar.",
  price: 350000, // R$ 3.500,00 (em centavos)
  conditions: "Usado - Como Novo",
  category: { name: "Videogames" },
  isFavorited: false,
  pictures: [
    { url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800" },
    { url: "https://images.unsplash.com/photo-1607453998774-a53665f585d9?auto=format&fit=crop&q=80&w=800" }
  ],
  address: {
    street: "Av. Principal",
    number: "123",
    neighborhood: "Centro",
    cityName: "Cedro",
    stateCode: "CE"
  },
  advertiser: {
    id: 1, // ADICIONADO: ID falso do vendedor
    name: "Lucas Pereira",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
  }
};
// ============================================================================

const formatLocation = (ad: {
  address?: {
    street?: string | null;
    number?: string | null;
    neighborhood?: string;
    cityName?: string;
    stateCode?: string;
  } | null;
  advertiser?: {
    address?: {
      street?: string | null;
      number?: string | null;
      neighborhood?: string;
      cityName?: string;
      stateCode?: string;
    } | null;
  };
}) => {
  const addressSource = ad.address || ad.advertiser?.address;
  if (!addressSource) return 'Localização não informada';

  const parts = [];
  if (addressSource.street) {
    let streetStr = addressSource.street;
    if (addressSource.number) {
      streetStr += `, ${addressSource.number}`;
    }
    parts.push(streetStr);
  }
  if (addressSource.neighborhood) parts.push(addressSource.neighborhood);
  
  if (addressSource.cityName) {
    let cityStr = addressSource.cityName;
    if (addressSource.stateCode) {
      cityStr += ` - ${addressSource.stateCode}`;
    }
    parts.push(cityStr);
  }

  return parts.join(' • ') || 'Localização não informada';
};

const DetalheProduto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const productId = Number(id);
  const hasValidId = Number.isInteger(productId) && productId > 0;

  // A query só é disparada se o USE_MOCK_DATA for false
  const productQuery = trpc.product.byId.useQuery(
    { id: productId },
    { enabled: hasValidId && !USE_MOCK_DATA }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Se estivermos usando MOCK, ignoramos os erros de ID inválido e da query
  if (!USE_MOCK_DATA) {
    if (
      !hasValidId ||
      productQuery.isError ||
      (!productQuery.isLoading && !productQuery.data)
    ) {
      return (
        <div className="detalhe-status-page">
          <h1 className="detalhe-status-title">Item não encontrado</h1>
          <button onClick={() => navigate('/')} className="detalhe-status-button">
            Voltar para a Home
          </button>
        </div>
      );
    }

    if (productQuery.isLoading || !productQuery.data) {
      return (
        <div className="detalhe-status-page">
          <p className="detalhe-loading">Carregando item...</p>
        </div>
      );
    }
  }

  // Define qual dado vai ser usado para renderizar a tela
  const produto = USE_MOCK_DATA ? MOCK_PRODUTO : productQuery.data;

  // CORREÇÃO 2: Essa trava mágica diz ao TypeScript que, a partir desta linha, 
  // é impossível que 'produto' seja undefined, acabando com as linhas vermelhas!
  if (!produto) {
    return null;
  }

  const precoEmReais = produto.price / 100;
  const localizacao = formatLocation(produto);

  const imagensProduto = (produto.pictures ?? []).map(
    (picture: { url: string }) => picture.url
  );

  return (
    <div className="detalhe-page">
      <div className="detalhe-purple-glow" />
      <div className="detalhe-blue-glow" />

      <div className="detalhe-container">
        <div className="detalhe-header-wrapper">
          <HeaderDetalhes tituloProduto={produto.title} />
        </div>

        <div className="detalhe-card">
          <div className="detalhe-galeria">
            <GaleriaProduto
              imagens={imagensProduto}
              titulo={produto.title}
            />
          </div>

          <div className="detalhe-info-area">
            <InfoProduto
              titulo={produto.title}
              preco={precoEmReais}
              localizacao={localizacao}
              descricao={produto.description}
              categoria={produto.category?.name}
              condicao={produto.conditions}
            />

            <div className="detalhe-vendedor-wrapper">
              <CardVendedor
                vendedorId={produto.advertiser.id} // ADICIONADO: Passando o ID para o CardVendedor
                nome={produto.advertiser.name}
                vendas="0"
                avatarUrl={produto.advertiser.avatarUrl}
              />
            </div>

            <div className="detalhe-acoes-wrapper">
              <AcoesProduto productId={produto.id} isFavorited={produto.isFavorited} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalheProduto;