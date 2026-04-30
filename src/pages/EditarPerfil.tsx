import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import BotaoGenerico from '../components/BotaoGenerico';

const EditarPerfil: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) navigate('/login');
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full bg-[#020513] overflow-hidden flex items-center justify-center px-4">

      {/* FUNDO (SEM CÍRCULO BUGADO) */}
      <div className="absolute right-[10%] bottom-[10%] w-96 h-96 bg-liquid-purple/30 rounded-full blur-[120px]" />
      <div className="absolute left-[10%] top-[10%] w-80 h-80 bg-electric-blue/20 rounded-full blur-[120px]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-[520px] rounded-[36px] px-9 py-8
        bg-[#120f2b]/90 border border-white/10 
        shadow-[0_45px_90px_rgba(0,0,0,0.85)]">

        {/* TÍTULO */}
        <h1 className="text-3xl font-black text-center text-white mb-7">
          Editar <span className="text-liquid-purple">Perfil</span>
        </h1>

        {/* FOTO */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-36 h-36 rounded-full border-[6px] border-liquid-purple 
              flex items-center justify-center text-white text-6xl font-light 
              shadow-[0_0_35px_rgba(168,85,247,0.75)]">
              LP
            </div>

            <button className="absolute bottom-1 right-1 w-11 h-11 rounded-full 
              bg-white/30 border border-white/50 
              flex items-center justify-center text-white">
              <Camera size={20} />
            </button>
          </div>
        </div>

        {/* INPUTS */}
        <div className="flex flex-col gap-4">

          <div>
            <label className="text-white font-black text-sm block mb-1">
              Nome completo
            </label>
            <input
              type="text"
              defaultValue="Lana Liz Lima Torres"
              className="w-full h-12 px-5 rounded-xl bg-[#111735]/90 border border-white/25
              text-white outline-none focus:border-liquid-purple transition-all"
            />
          </div>

          <div>
            <label className="text-white font-black text-sm block mb-1">
              E-mail
            </label>
            <input
              type="email"
              defaultValue="lana.liz.lima08@aluno.ifce.edu.br"
              className="w-full h-12 px-5 rounded-xl bg-[#111735]/90 border border-white/25
              text-white outline-none focus:border-liquid-purple transition-all"
            />
          </div>

          <div>
            <label className="text-white font-black text-sm block mb-1">
              Telefone & Whatsapp
            </label>
            <input
              type="text"
              defaultValue="(xx) 999-999.99"
              className="w-full h-12 px-5 rounded-xl bg-[#111735]/90 border border-white/25
              text-white outline-none focus:border-liquid-purple transition-all"
            />
          </div>

          <div>
            <label className="text-white font-black text-sm block mb-1">
              Instagram
            </label>
            <input
              type="text"
              defaultValue="@Lana_liz__"
              className="w-full h-12 px-5 rounded-xl bg-[#111735]/90 border border-white/25
              text-white outline-none focus:border-liquid-purple transition-all"
            />
          </div>

        </div>

        
        {/* BOTÕES */}
        <div className="grid grid-cols-2 gap-6 mt-8">

        <button
            onClick={() => navigate('/perfil')}
            className="h-14 w-full rounded-xl border border-white/30 text-white text-xl font-black flex items-center justify-center hover:bg-white/10 transition-all"
        >
            CANCELAR
        </button>

        <div className="h-14 w-full rounded-xl bg-gradient-to-r from-liquid-purple to-electric-blue shadow-[0_0_28px_rgba(168,85,247,0.75)] flex items-center justify-center">
            <button
            onClick={() => navigate('/perfil')}
            className="w-full h-full flex items-center justify-center text-white text-xl font-black tracking-widest"
            >
            SALVAR
            </button>
        </div>

        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;