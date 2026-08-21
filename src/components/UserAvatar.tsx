import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, getAuthSession } from '../lib/session';
import { trpc } from '../lib/trpc';

const UserAvatar: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [temaClaro, setTemaClaro] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const session = getAuthSession();
  const user = session?.user;

  useEffect(() => {
    setAvatarBroken(false);
  }, [user?.avatarUrl]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSettled: () => {
      clearAuthSession();
      navigate('/');
    },
  });

  const initials = user?.name
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

  return (
    <div className="relative">
      {/* AVATAR */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-liquid-purple to-electric-blue shadow-[0_0_20px_rgba(168,85,247,0.6)]"
      >
        <div className="w-full h-full rounded-full bg-[#11142d] flex items-center justify-center text-white font-black overflow-hidden">
          {user?.avatarUrl && !avatarBroken ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            initials
          )}
        </div>
      </button>

      {/* MENU */}
      {open && (
        <div
          className="absolute right-0 top-16 w-72 rounded-2xl
          bg-[#09091d]/95 border border-liquid-purple
          shadow-[0_0_25px_rgba(168,85,247,0.5)]
          p-4 z-50"
        >
          {/* TOPO */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-liquid-purple font-black text-sm">
              {user?.name ?? 'Usuario'}
            </span>

            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-sm font-bold"
            >
              fechar
            </button>
          </div>

          {/* ENTRAR NO PERFIL */}
          <button
            onClick={() => {
              setOpen(false);
              navigate('/perfil');
            }}
            className="w-full h-12 rounded-xl border border-white/20
            bg-[#151747] text-white font-black text-sm
            hover:bg-white/10 transition-all mb-3 text-left px-5"
          >
            Entrar no perfil
          </button>

          {/* MEUS FAVORITOS */}
          <button
            onClick={() => {
              setOpen(false);
              navigate('/favoritos');
            }}
            className="w-full h-12 rounded-xl border border-white/20
            bg-[#151747] text-white font-black text-sm
            hover:bg-white/10 transition-all mb-3 text-left px-5 flex items-center justify-between"
          >
            <span>Meus favoritos</span>
          </button>

          {/* PAINEL ADMIN */}
          {user?.role === 'Admin' && (
            <button
              onClick={() => {
                setOpen(false);
                navigate('/admin');
              }}
              className="w-full h-12 rounded-xl border border-red-500/30
              bg-red-900/40 text-white font-black text-sm
              hover:bg-red-800/60 transition-all mb-3 text-left px-5 flex items-center justify-between"
            >
              <span className="text-red-300">Painel Admin</span>
            </button>
          )}

          {/* CONFIGURAÇÕES */}
          <button
            onClick={() => alert('Configurações simuladas')}
            className="w-full h-12 rounded-xl border border-white/20
            bg-[#151747] text-white font-black text-sm
            hover:bg-white/10 transition-all mb-3 text-left px-5"
          >
            Configurações
          </button>


          {/* SAIR */}
          <button
            onClick={handleLogout}
            className="w-full h-12 rounded-xl
            bg-gradient-to-r from-liquid-purple to-electric-blue
            text-white font-black text-sm
            shadow-[0_0_20px_rgba(168,85,247,0.6)]
            hover:brightness-110 transition-all"
          >
            SAIR
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;