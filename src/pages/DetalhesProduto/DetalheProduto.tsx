import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import GaleriaProduto from '../../components/detalhes/GaleriaProduto';
import HeaderDetalhes from '../../components/detalhes/HeaderDetalhes';
import InfoProduto from '../../components/detalhes/InfoProduto';
import CardVendedor from '../../components/detalhes/CardVendedor';
import AcoesProduto from '../../components/detalhes/AcoesProduto';

import { trpc } from '../../lib/trpc';

import './DetalheProduto.css';

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

  const productQuery = trpc.product.byId.useQuery(
    { id: productId },
    { enabled: hasValidId }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (
    !hasValidId ||
    productQuery.isError ||
    (!productQuery.isLoading && !productQuery.data)
  ) {
    return (
      <div className="detalhe-status-page">
        <h1 className="detalhe-status-title">
          Item não encontrado
        </h1>

        <button
          onClick={() => navigate('/')}
          className="detalhe-status-button"
        >
          Voltar para a Home
        </button>
      </div>
    );
  }

  if (productQuery.isLoading || !productQuery.data) {
    return (
      <div className="detalhe-status-page">
        <p className="detalhe-loading">
          Carregando item...
        </p>
      </div>
    );
  }

  const produto = productQuery.data;

  const precoEmReais = produto.price / 100;
  const localizacao = formatLocation(produto);

  const imagensProduto = (produto.pictures ?? []).map(
    (picture) => picture.url
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
                nome={produto.advertiser.name}
                vendas="0"
                avatarUrl={produto.advertiser.avatarUrl}
              />
            </div>

            <div className="detalhe-acoes-wrapper">
              <AcoesProduto productId={productId} isFavorited={produto.isFavorited} />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DetalheProduto;