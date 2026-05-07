import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const apiBaseUrl = 'http://localhost:3333';

const fallbackImage = 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=600';

const resolveAdvertiserId = () => {
  const storedUserId = Number(localStorage.getItem('userId'));
  if (Number.isInteger(storedUserId) && storedUserId > 0) {
    return storedUserId;
  }

  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as { id?: number };
      if (Number.isInteger(parsed.id) && (parsed.id ?? 0) > 0) {
        return parsed.id as number;
      }
    } catch {
      // Ignore invalid JSON.
    }
  }

  return 1;
};

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

interface AdvertisementResponse {
  id: number;
  title: string;
  price: number;
  status?: string;
  pictures?: { url: string }[];
}

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const loadAnuncios = async () => {
      setLoading(true);
      setError(null);

      try {
        const advertiserId = resolveAdvertiserId();
        const response = await fetch(`${apiBaseUrl}/api/ads?advertiserId=${advertiserId}`);
        if (!response.ok) {
          setError(`Falha ao carregar anuncios (HTTP ${response.status}).`);
          return;
        }

        const data = await response.json();
        const ads = Array.isArray(data) ? (data as AdvertisementResponse[]) : [];
        const mapped = ads.map((ad) => ({
          id: ad.id,
          imagem: ad.pictures?.[0]?.url ?? fallbackImage,
          status: mapStatus(ad.status),
          titulo: ad.title,
          preco: Number.isFinite(ad.price) ? ad.price / 100 : 0,
        }));

        if (isMounted) {
          setAnuncios(mapped);
        }
      } catch {
        if (isMounted) {
          setError('Nao foi possivel carregar os anuncios.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnuncios();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const pausarAnuncio = (id: number) => {
    setAnuncios(lista =>
      lista.map(anuncio =>
        anuncio.id === id ? { ...anuncio, status: 'PAUSADO' } : anuncio
      )
    );
  };

  const reativarAnuncio = (id: number) => {
    setAnuncios(lista =>
      lista.map(anuncio =>
        anuncio.id === id ? { ...anuncio, status: 'ATIVO' } : anuncio
      )
    );
  };

  const excluirAnuncio = (id: number) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir este anúncio?');

    if (confirmar) {
      setAnuncios(lista => lista.filter(anuncio => anuncio.id !== id));
    }
  };

  const editarAnuncio = (id: number) => {
    alert(`Edição simulada do anúncio ${id}`);
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
              LL
            </div>

            <div>
              <h1 className="text-4xl font-black text-white mb-3">
                Lana Liz Lima Torres
              </h1>

              <div className="flex items-center gap-4">
                <span className="px-6 py-1 rounded-full bg-white/5 border border-white/10 text-liquid-purple text-sm font-black">
                  Vendedor Elite
                </span>

                <span className="text-white font-black">
                  ★ 4.9 (12 Vendas)
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

        {loading && (
          <p className="text-center text-white/50 font-bold mt-10">
            Carregando anuncios...
          </p>
        )}

        {error && (
          <p className="text-center text-red-400 font-bold mt-10">
            {error}
          </p>
        )}

        {!loading && !error && anuncios.length === 0 && (
          <p className="text-center text-white/40 font-bold mt-10">
            Nenhum anúncio cadastrado.
          </p>
        )}
      </div>
    </div>
  );
};

export default Perfil;