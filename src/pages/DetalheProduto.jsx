import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import GaleriaProduto from '../components/detalhes/GaleriaProduto';
import HeaderDetalhes from '../components/detalhes/HeaderDetalhes';
import InfoProduto from '../components/detalhes/InfoProduto';
import CardVendedor from '../components/detalhes/CardVendedor';
import AcoesProduto from '../components/detalhes/AcoesProduto';

const produtosExemplo = [
  { id: 1, preco: 2500, titulo: "iPhone 13 Pro Max - 256GB Grafite", localizacao: "Centro, Cedro", imagem: "https://images.pexels.com/photos/12794533/pexels-photo-12794533.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: 2, preco: 450, titulo: "Cadeira Gamer Reclinável Preta", localizacao: "Vila Nova, Cedro", imagem: "https://images.pexels.com/photos/7194634/pexels-photo-7194634.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: 3, preco: 120, titulo: "Tênis Esportivo Running - Tam 41", localizacao: "Pista, Cedro", imagem: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: 4, preco: 3200, titulo: "Smart TV 4K 55' Samsung Neo QLED", localizacao: "Centro, Cedro", imagem: "https://images.pexels.com/photos/6976094/pexels-photo-6976094.jpeg?auto=compress&cs=tinysrgb&w=800" },
];

const DetalheProduto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const produto = produtosExemplo.find(p => String(p.id) === String(id));

  if (!produto) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-4xl font-black mb-4 tracking-tighter italic uppercase text-white/50">Item não encontrado</h1>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-electric-blue rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all">
          Voltar para a Home
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#08080c] text-white selection:bg-electric-blue overflow-hidden pb-12 font-sans">
   
      <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-liquid-purple/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 p-4 md:p-6 max-w-287.5 mx-auto">
        
        <div className="mb-2">
          <HeaderDetalhes tituloProduto={produto.titulo} />
        </div>

        <div className="bg-[#101018]/70 border border-white/10 border-t-white/30 border-l-white/30 rounded-4xl p-6 md:p-8 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row gap-8 animate-in fade-in zoom-in duration-700 items-start">
          
          <div className="w-full lg:w-[53%] shrink-0">
            <GaleriaProduto 
              imagemPrincipal={produto.imagem} 
              titulo={produto.titulo} 
            />
          </div>

          <div className="w-full lg:flex-1 flex flex-col pt-0">
            <InfoProduto 
              titulo={produto.titulo}
              preco={produto.preco}
              localizacao={produto.localizacao}
            />

            <div className="-mt-3">
              <CardVendedor nome="Lucas Pereira" vendas="12" />
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