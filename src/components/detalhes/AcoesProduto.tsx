import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../lib/trpc';
import { isAuthenticated } from '../../lib/session';

interface AcoesProdutoProps {
  productId: number;
  isFavorited?: boolean;
}

const AcoesProduto: React.FC<AcoesProdutoProps> = ({ productId, isFavorited = false }) => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [favorited, setFavorited] = useState(isFavorited);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const toggleFavoriteMutation = trpc.product.toggleFavorite.useMutation({
    onSuccess: (data) => {
      setFavorited(data.favorited);
      utils.product.byId.invalidate({ id: productId });
      utils.product.listPublic.invalidate();
    },
    onError: (error) => {
      // Revert state if mutation fails
      setFavorited(favorited);
      alert(error.message || 'Ocorreu um erro ao atualizar favoritos.');
    },
  });

  const handleFavoriteClick = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const nextState = !favorited;
    setFavorited(nextState);

    toggleFavoriteMutation.mutate({ id: productId });
  };

  return (
    <div className="flex flex-col gap-3 mt-6 w-full">

      {/* BOTÃO CHAT */}
      <button className="w-full py-4 bg-linear-to-r from-liquid-purple to-electric-blue rounded-2xl transition-all hover:brightness-110 shadow-[0_10px_20px_rgba(151,71,255,0.3)] cursor-pointer">
        <span className="font-black text-white text-base">
          Tenho Interesse / Chat
        </span>
      </button>

      {/* BOTÃO SALVAR */}
      <button
        onClick={handleFavoriteClick}
        disabled={toggleFavoriteMutation.isPending}
        className="w-full flex items-center justify-center gap-3 py-4 bg-white/3 border border-white/10 rounded-2xl hover:bg-white/8 transition-all cursor-pointer group disabled:opacity-50"
      >
        <Heart
          size={20}
          className={`transition-all ${
            favorited
              ? 'text-red-500 fill-red-500 group-hover:text-red-400 group-hover:fill-red-400'
              : 'text-white group-hover:fill-white'
          }`}
          strokeWidth={2}
        />
        <span className="font-bold text-white text-base">
          {favorited ? 'Remover dos Favoritos' : 'Salvar Favorito'}
        </span>
      </button>

      {/* DENUNCIAR */}
      <button className="mt-2 text-[10px] font-black uppercase tracking-widest text-red-600/80 hover:text-red-500 transition-colors cursor-pointer text-center w-full">
        Denunciar Anúncio
      </button>

    </div>
  );
};

export default AcoesProduto;
