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