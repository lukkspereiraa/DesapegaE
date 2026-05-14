import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import GaleriaProduto from '../components/detalhes/GaleriaProduto';
import HeaderDetalhes from '../components/detalhes/HeaderDetalhes';
import InfoProduto from '../components/detalhes/InfoProduto';
import CardVendedor from '../components/detalhes/CardVendedor';
import AcoesProduto from '../components/detalhes/AcoesProduto';
import { trpc } from '../lib/trpc';

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

const DetalheProduto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const hasValidId = Number.isInteger(productId) && productId > 0;

  const productQuery = trpc.product.byId.useQuery(
    { id: productId },
    { enabled: hasValidId },
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!hasValidId || productQuery.isError || (!productQuery.isLoading && !productQuery.data)) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-4xl font-black mb-4 tracking-tighter italic uppercase text-white/50">Item não encontrado</h1>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-electric-blue rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all">
          Voltar para a Home
        </button>
      </div>
    );
  }

  if (productQuery.isLoading || !productQuery.data) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <p className="text-white/60 text-xl font-black">Carregando item...</p>
      </div>
    );
  }

  const produto = productQuery.data;
  const precoEmReais = produto.price / 100;
  const localizacao = formatLocation(produto);
  const imagensProduto = (produto.pictures ?? []).map((picture) => picture.url);

  return (
    <div className="relative min-h-screen bg-[#08080c] text-white selection:bg-electric-blue overflow-hidden pb-12 font-sans">

      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-liquid-purple/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 p-4 md:p-6 max-w-287.5 mx-auto">

        <div className="mb-2">
          <HeaderDetalhes tituloProduto={produto.title} />
        </div>

        <div className="bg-[#101018]/70 border border-white/10 border-t-white/30 border-l-white/30 rounded-4xl p-6 md:p-8 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row gap-8 animate-in fade-in zoom-in duration-700 items-start">

          <div className="w-full lg:w-[53%] shrink-0">
            <GaleriaProduto
              imagens={imagensProduto}
              titulo={produto.title}
            />
          </div>

          <div className="w-full lg:flex-1 flex flex-col pt-0">
            <InfoProduto
              titulo={produto.title}
              preco={precoEmReais}
              localizacao={localizacao}
              descricao={produto.description}
            />

            <div className="-mt-3">
              <CardVendedor
                nome={produto.advertiser.name}
                vendas="0"
                avatarUrl={produto.advertiser.avatarUrl}
              />
            </div>

            <div className="-mt-2">
              <AcoesProduto />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalheProduto;
