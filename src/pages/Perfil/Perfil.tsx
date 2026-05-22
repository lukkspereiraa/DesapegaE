import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearAuthSession, getAuthSession } from '../../lib/session';
import { trpc } from '../../lib/trpc';

import './Perfil.css';

const fallbackImage =
  'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=600';

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const mapStatus = (status?: string) => {
  if (status === 'Closed' || status === 'Blocked') {
    return 'VENDIDO' as const;
  }

  return 'ATIVO' as const;
};

interface Anuncio {
  id: number;
  imagem: string;
  status: 'ATIVO' | 'VENDIDO';
  titulo: string;
  preco: number;
}

const Perfil: React.FC = () => {
  const navigate = useNavigate();

  const [avatarBroken, setAvatarBroken] =
    useState(false);

  const utils = trpc.useUtils();

  const session = getAuthSession();

  const profileQuery =
    trpc.user.profile.useQuery(undefined, {
      retry: false,
    });

  const myAdsQuery =
    trpc.product.myAds.useQuery(undefined, {
      retry: false,
    });

  const setStatusMutation =
    trpc.product.setStatus.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.product.myAds.invalidate(),
          utils.product.listPublic.invalidate(),
        ]);
      },
    });

  const deleteMutation =
    trpc.product.delete.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.product.myAds.invalidate(),
          utils.product.listPublic.invalidate(),
        ]);
      },
    });

  const logoutMutation =
    trpc.auth.logout.useMutation({
      onSettled: () => {
        clearAuthSession();

        navigate('/');
      },
    });

  const anuncios = useMemo<Anuncio[]>(() => {
    const ads = myAdsQuery.data ?? [];

    return ads.map((ad) => ({
      id: ad.id,

      imagem:
        ad.pictures?.[0]?.url ??
        fallbackImage,

      status: mapStatus(ad.status),

      titulo: ad.title,

      preco:
        Number.isFinite(ad.price)
          ? ad.price / 100
          : 0,
    }));
  }, [myAdsQuery.data]);

  const user = profileQuery.data;

  useEffect(() => {
    setAvatarBroken(false);
  }, [user?.avatarUrl]);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(
          (chunk) =>
            chunk[0]?.toUpperCase() ?? ''
        )
        .join('')
    : 'U';

  const handleLogout = () => {
    if (session?.refreshToken) {
      logoutMutation.mutate({
        refreshToken:
          session.refreshToken,
      });

      return;
    }

    clearAuthSession();

    navigate('/');
  };

  const marcarComoVendido = (
    id: number
  ) => {
    setStatusMutation.mutate({
      id,
      status: 'Closed',
    });
  };

  const reativarAnuncio = (
    id: number
  ) => {
    setStatusMutation.mutate({
      id,
      status: 'Open',
    });
  };

  const excluirAnuncio = (
    id: number
  ) => {
    const confirmar = window.confirm(
      'Tem certeza que deseja excluir este anúncio?'
    );

    if (confirmar) {
      deleteMutation.mutate({ id });
    }
  };

  const editarAnuncio = (
    item: Anuncio
  ) => {
    navigate('/editar-produto', {
      state: {
        id: item.id,

        titulo: item.titulo,

        preco: formatCurrency(
          item.preco
        ),

        imagens: [item.imagem],
      },
    });
  };

  return (
    <div className="perfil-page">

      <button
        onClick={() => navigate('/')}
        className="perfil-voltar"
      >
        ← Voltar
      </button>

      <button
        onClick={handleLogout}
        className="perfil-sair"
      >
        Sair
      </button>

      <div className="perfil-glow-purple" />

      <div className="perfil-glow-blue" />

      <div className="perfil-container">

        <div className="perfil-header-card">

          <div className="perfil-header-info">

            <div className="perfil-avatar">

              {user?.avatarUrl &&
              !avatarBroken ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  onError={() =>
                    setAvatarBroken(true)
                  }
                />
              ) : (
                userInitials
              )}

            </div>

            <div>

              <h1 className="perfil-nome">
                {user?.name ??
                  'Carregando...'}
              </h1>

              <div className="perfil-info-row">

                <span className="perfil-role">
                  {user?.role ??
                    'Advertiser'}
                </span>

                <span className="perfil-vendas">
                  ★ 0.0 (0 Vendas)
                </span>

              </div>

            </div>

          </div>

        <div className="perfil-header-actions">

          <button
            onClick={() =>
              navigate(
                '/dados-privados'
              )
            }
            className="perfil-dados-btn"
          >
            Meus Dados
          </button>

          <button
            onClick={() =>
              navigate(
                '/editar-perfil'
              )
            }
            className="perfil-editar"
          >
            Editar Perfil
          </button>

        </div>

        </div>

        <div className="perfil-section-header">

          <h2 className="perfil-section-title">
            Meus Anúncios
          </h2>

          <button
            onClick={() =>
              navigate('/anunciar')
            }
            className="perfil-criar"
          >
            + Criar novo anúncio
          </button>

        </div>

        {profileQuery.error && (
          <p className="perfil-error perfil-error-profile">
            {
              profileQuery.error
                .message
            }
          </p>
        )}

        <div className="perfil-grid">

          {anuncios.map((item) => (
            <div
              key={item.id}
              className="perfil-anuncio-card"
            >

              <img
                src={item.imagem}
                alt={item.titulo}
                className="perfil-anuncio-imagem"
              />

              <div
                className={
                  item.status ===
                  'VENDIDO'
                    ? 'perfil-status perfil-status-vendido'
                    : 'perfil-status perfil-status-ativo'
                }
              >
                {item.status}
              </div>

              <h3 className="perfil-anuncio-titulo">
                {item.titulo}
              </h3>

              <p className="perfil-anuncio-preco">
                {formatCurrency(
                  item.preco
                )}
              </p>

              <div className="perfil-acoes">

                {item.status ===
                'VENDIDO' ? (
                  <>

                    <button
                      onClick={() =>
                        reativarAnuncio(
                          item.id
                        )
                      }
                      className="perfil-btn-reativar"
                    >
                      REATIVAR
                    </button>

                    <button
                      onClick={() =>
                        excluirAnuncio(
                          item.id
                        )
                      }
                      className="perfil-btn-excluir"
                    >
                      EXCLUIR
                    </button>

                  </>
                ) : (
                  <>

                    <button
                      onClick={() =>
                        editarAnuncio(
                          item
                        )
                      }
                      className="perfil-btn-editar"
                    >
                      EDITAR
                    </button>

                    <button
                      onClick={() =>
                        marcarComoVendido(
                          item.id
                        )
                      }
                      className="perfil-btn-vendido"
                    >
                      VENDIDO
                    </button>

                  </>
                )}

              </div>

            </div>
          ))}

        </div>

        {myAdsQuery.isLoading && (
          <p className="perfil-message">
            Carregando anúncios...
          </p>
        )}

        {myAdsQuery.error && (
          <p className="perfil-error perfil-error-ads">
            {
              myAdsQuery.error
                .message
            }
          </p>
        )}

        {(setStatusMutation.error ||
          deleteMutation.error) && (
          <p className="perfil-error perfil-error-mutation">
            {setStatusMutation.error
              ?.message ??
              deleteMutation.error
                ?.message}
          </p>
        )}

        {!myAdsQuery.isLoading &&
          !myAdsQuery.error &&
          anuncios.length === 0 && (
            <p className="perfil-empty">
              Nenhum anúncio cadastrado.
            </p>
          )}

      </div>
    </div>
  );
};

export default Perfil;