import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart, ArrowRightToLine, ArrowRight } from 'lucide-react';
import { trpc } from '../../lib/trpc';

const Favoritos: React.FC = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<'Todos' | 'Disponiveis'>('Todos');
  
  // A query to list favorites
  const { data: favorites = [], refetch } = trpc.product.listFavorites.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  const toggleFavoriteMutation = trpc.product.toggleFavorite.useMutation({
    onSuccess: () => {
      refetch(); // Reload the list after unfavoriting
    }
  });

  const handleUnfavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate({ id });
  };

  const filteredFavorites = favorites.filter((ad) => {
    if (filtro === 'Disponiveis') {
      return ad.status === 'Open';
    }
    return true;
  });

  return (
    <main className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col relative z-10">
      {/* TOP SECTION: TITLE & TOGGLE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Bookmark size={40} className="text-[#a855f7] fill-[#a855f7]" />
              <h1 className="text-3xl md:text-4xl font-black text-white">Meus favoritos</h1>
            </div>
            <p className="text-white text-lg font-bold">
              Você tem <span className="text-[#a855f7]">{favorites.length} itens</span> salvos para ver mais tarde.
            </p>
          </div>

          <div className="flex bg-[#2b1f4c] rounded-xl p-1 w-full md:w-auto self-start md:self-auto shadow-lg">
            <button
              onClick={() => setFiltro('Todos')}
              className={`flex-1 md:w-40 py-2.5 rounded-lg text-lg font-bold transition-all ${
                filtro === 'Todos' 
                ? 'bg-[#a855f7] text-white shadow-md' 
                : 'text-white/60 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro('Disponiveis')}
              className={`flex-1 md:w-40 py-2.5 rounded-lg text-lg font-bold transition-all ${
                filtro === 'Disponiveis' 
                ? 'bg-[#a855f7] text-white shadow-md' 
                : 'text-white/60 hover:text-white'
              }`}
            >
              Disponíveis
            </button>
          </div>
        </div>

        {/* CARDS GRID AREA */}
        <div className="bg-[#121124] border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl relative">
          
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-20 text-white/50 font-bold text-xl">
              Nenhum anúncio encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-10">
              {filteredFavorites.map((ad) => {
                const isSold = ad.status !== 'Open';
                const adLocation = ad.address ? `${ad.address.cityName}, ${ad.address.neighborhood}` : 'Localização não informada';
                const imageUrl = ad.pictures?.[0]?.url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=300';
                
                return (
                  <div 
                    key={ad.id}
                    onClick={() => navigate(`/produto/${ad.id}`)}
                    className="group bg-[#2a2542] rounded-2xl overflow-hidden border border-white/5 flex flex-col relative cursor-pointer hover:-translate-y-1 hover:border-[#a855f7]/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 h-[380px]"
                  >
                    {/* Imagem (Topo) */}
                    <div className="w-full h-[60%] relative overflow-hidden bg-black">
                      <img 
                        src={imageUrl} 
                        alt={ad.title} 
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'opacity-40 grayscale' : ''}`} 
                      />
                      
                      {/* Botão de Coração / Desfavoritar */}
                      <button 
                        onClick={(e) => handleUnfavorite(e, ad.id)}
                        className="absolute top-4 right-4 w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors z-20 border border-white/10"
                      >
                        <Heart size={20} className="fill-red-500 text-red-500" />
                      </button>

                      {/* Selo de Vendido */}
                      {isSold && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="bg-[#a855f7]/90 backdrop-blur-sm text-white transform -rotate-12 px-8 py-3 rounded-2xl text-4xl font-black shadow-2xl border border-white/20 shadow-[#a855f7]/50">
                            Vendido
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informações (Rodapé) */}
                    <div className="flex-1 p-5 flex flex-col justify-between relative z-20">
                      <div>
                        <h3 className="text-xl font-black text-white line-clamp-1">{ad.title}</h3>
                        <p className="text-sm text-white/80 font-bold mt-1 truncate">{adLocation}</p>
                      </div>

                      <div className="flex items-end justify-between mt-auto">
                        <span className="text-3xl font-black text-[#a855f7]">
                          {(ad.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        
                        <div className="w-12 h-10 border border-white/20 rounded-xl flex items-center justify-center bg-transparent group-hover:bg-[#a855f7]/20 group-hover:border-[#a855f7] transition-all">
                          <ArrowRight className="text-[#a855f7]" size={20} />
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          
        </div>
      </main>
  );
};

export default Favoritos;
