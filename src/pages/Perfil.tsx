import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, getAuthSession } from '../lib/session';
import { trpc } from '../lib/trpc';

const fallbackImage = 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=600';

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const mapStatus = (status?: string) => {
  if (status === 'Closed' || status === 'Blocked') {
    return 'PAUSADO' as const;
  }
  return 'ATIVO' as const;
};

interface Anuncio {
  id: number;
  imagem: string;
  status: 'ATIVO' | 'PAUSADO';
  titulo: string;
  preco: number;
}

const Perfil: React.FC = () => {
  const navigate = useNavigate();

  const utils = trpc.useUtils();
  const session = getAuthSession();

  const profileQuery = trpc.user.profile.useQuery(undefined, {
    retry: false,
  });
  const myAdsQuery = trpc.product.myAds.useQuery(undefined, {
    retry: false,
  });

  const setStatusMutation = trpc.product.setStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.myAds.invalidate(),
        utils.product.listPublic.invalidate(),
      ]);
    },
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.myAds.invalidate(),
        utils.product.listPublic.invalidate(),
      ]);
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSettled: () => {
      clearAuthSession();
      navigate('/');
    },
  });

  const anuncios = useMemo<Anuncio[]>(() => {
    const ads = myAdsQuery.data ?? [];
    return ads.map((ad) => ({
      id: ad.id,
      imagem: ad.pictures?.[0]?.url ?? fallbackImage,
      status: mapStatus(ad.status),
      titulo: ad.title,
      preco: Number.isFinite(ad.price) ? ad.price / 100 : 0,
    }));
  }, [myAdsQuery.data]);

  const user = profileQuery.data;
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk[0]?.toUpperCase() ?? '')
        .join('')
    : 'U';

  const handleLogout = () => {
    if (session?.refreshToken) {
      logoutMutation.mutate({ refreshToken: session.refreshToken });
      return;
    }

    clearAuthSession();
    navigate('/');
  };

  const pausarAnuncio = (id: number) => {
    setStatusMutation.mutate({ id, status: 'Closed' });
  };

  const reativarAnuncio = (id: number) => {
    setStatusMutation.mutate({ id, status: 'Open' });
  };

  const excluirAnuncio = (id: number) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir este anúncio?');

    if (confirmar) {
      deleteMutation.mutate({ id });
    }
  };

  const editarAnuncio = (id: number) => {
    navigate('/anunciar', {
      state: { productId: id },
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020513] overflow-hidden px-6 py-10">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-white/40 hover:text-white text-sm transition-all"
      >
        ← Voltar
      </button>

      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 text-red-400 font-bold text-sm hover:text-red-300 transition-all"
      >
        Sair
      </button>

      <div className="absolute left-[5%] top-[10%] w-96 h-96 bg-liquid-purple/30 rounded-full blur-[130px]" />
      <div className="absolute right-[10%] bottom-[10%] w-96 h-96 bg-electric-blue/20 rounded-full blur-[130px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="w-full rounded-[40px] bg-[#11142d]/85 border border-white/10 px-14 py-10 flex items-center justify-between shadow-[0_35px_80px_rgba(0,0,0,0.75)]">
          <div className="flex items-center gap-7">
            <div className="w-28 h-28 rounded-full border-4 border-liquid-purple flex items-center justify-center text-white text-5xl font-light shadow-[0_0_30px_rgba(168,85,247,0.8)]">
              {userInitials}
            </div>

            <div>
              <h1 className="text-4xl font-black text-white mb-3">
                {user?.name ?? 'Carregando...'}
              </h1>

              <div className="flex items-center gap-4">
                <span className="px-6 py-1 rounded-full bg-white/5 border border-white/10 text-liquid-purple text-sm font-black">
                  {user?.role ?? 'Advertiser'}
                </span>

                <span className="text-white font-black">
                  ★ 0.0 (0 Vendas)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/editar-perfil')}
            className="px-10 py-3 rounded-xl border border-liquid-purple text-white text-lg font-black hover:bg-liquid-purple/10 transition-all"
            >
            Editar Perfil
          </button>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-3xl font-black text-white">
            Meus Anúncios
          </h2>

          <button
            onClick={() => navigate('/anunciar')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-liquid-purple to-electric-blue text-white text-lg font-black shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:brightness-110 transition-all"
          >
            + Criar novo anúncio
          </button>
        </div>

        {profileQuery.error && (
          <p className="text-center text-red-400 font-bold mt-6">
            {profileQuery.error.message}
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {anuncios.map(item => (
            <div
              key={item.id}
              className="rounded-[28px] bg-[#11142d]/85 border border-white/10 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.65)]"
            >
              <img
                src={item.imagem}
                alt={item.titulo}
                className="w-full h-44 object-cover rounded-[24px] mb-3"
              />

              <div
                className={`text-[11px] font-black px-3 py-1 rounded-md border mb-3 ${
                  item.status === 'PAUSADO'
                    ? 'text-white bg-white/10 border-white/30'
                    : 'text-green-400 bg-green-500/15 border-green-500'
                }`}
              >
                {item.status}
              </div>

              <h3 className="text-white font-black text-sm mb-1">
                {item.titulo}
              </h3>

              <p className="text-liquid-purple text-2xl font-black mb-4">
                {formatCurrency(item.preco)}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {item.status === 'PAUSADO' ? (
                  <>
                    <button
                      onClick={() => reativarAnuncio(item.id)}
                      className="py-2 rounded-lg border border-green-400 text-green-400 font-black bg-green-400/10 hover:bg-green-400/20 transition-all"
                    >
                      REATIVAR
                    </button>

                    <button
                      onClick={() => excluirAnuncio(item.id)}
                      className="py-2 rounded-lg border border-red-500 text-red-500 font-black bg-red-500/10 hover:bg-red-500/20 transition-all"
                    >
                      EXCLUIR
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => editarAnuncio(item.id)}
                      className="py-2 rounded-lg border border-liquid-purple text-white font-black bg-liquid-purple/20 hover:bg-liquid-purple/30 transition-all"
                    >
                      EDITAR
                    </button>

                    <button
                      onClick={() => pausarAnuncio(item.id)}
                      className="py-2 rounded-lg border border-white/30 text-white font-black bg-white/5 hover:bg-white/10 transition-all"
                    >
                      PAUSAR
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {myAdsQuery.isLoading && (
          <p className="text-center text-white/50 font-bold mt-10">
            Carregando anuncios...
          </p>
        )}

        {myAdsQuery.error && (
          <p className="text-center text-red-400 font-bold mt-10">
            {myAdsQuery.error.message}
          </p>
        )}

        {(setStatusMutation.error || deleteMutation.error) && (
          <p className="text-center text-red-400 font-bold mt-6">
            {setStatusMutation.error?.message ?? deleteMutation.error?.message}
          </p>
        )}

        {!myAdsQuery.isLoading && !myAdsQuery.error && anuncios.length === 0 && (
          <p className="text-center text-white/40 font-bold mt-10">
            Nenhum anúncio cadastrado.
          </p>
        )}
      </div>
    </div>
  );
};

export default Perfil;