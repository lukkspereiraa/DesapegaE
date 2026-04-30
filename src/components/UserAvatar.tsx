import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserAvatar: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [temaClaro, setTemaClaro] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* AVATAR */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-liquid-purple to-electric-blue shadow-[0_0_20px_rgba(168,85,247,0.6)]"
      >
        <div className="w-full h-full rounded-full bg-[#11142d] flex items-center justify-center text-white font-black">
          LL
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
              Lana Liz Lima Torres
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

          {/* CONFIGURAÇÕES */}
          <button
            onClick={() => alert('Configurações simuladas')}
            className="w-full h-12 rounded-xl border border-white/20
            bg-[#151747] text-white font-black text-sm
            hover:bg-white/10 transition-all mb-3 text-left px-5"
          >
            Configurações
          </button>

          {/* MUDAR TEMA */}
          <div
            className="w-full h-12 rounded-xl border border-white/20
            bg-[#151747] text-white font-black text-sm
            flex items-center justify-between px-5 mb-4"
          >
            <span>Mudar tema</span>

            <button
              onClick={() => setTemaClaro(!temaClaro)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                temaClaro ? 'bg-electric-blue' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-all ${
                  temaClaro ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

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