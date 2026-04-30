import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import BotaoGenerico from '../components/BotaoGenerico';

const Anunciar: React.FC = () => {
  const navigate = useNavigate();

  const [estadoOpen, setEstadoOpen] = useState(false);
  const [estado, setEstado] = useState('Seminovo');

  const [tipoOpen, setTipoOpen] = useState(false);
  const [tipo, setTipo] = useState('Tecnologia');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full bg-[#020513] overflow-hidden flex items-center justify-center px-4">

      {/* BOTÃO VOLTAR */}
      <button
        onClick={() => navigate('/perfil')}
        className="absolute top-6 left-6 text-white/40 hover:text-white text-sm transition-all z-20"
      >
        ← Voltar
      </button>

      {/* FUNDO */}
      <div className="absolute left-[18%] top-[32%] w-80 h-80 bg-liquid-purple/35 rounded-full blur-[120px]" />
      <div className="absolute right-[18%] bottom-[25%] w-80 h-80 bg-electric-blue/25 rounded-full blur-[120px]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-[560px] min-h-[640px] 
        rounded-[56px] px-12 py-8
        bg-[#111942]/85 
        border border-white/15
        shadow-[0_45px_90px_rgba(0,0,0,0.9)]
        flex flex-col">

        <h1 className="text-[31px] font-black text-center text-white/75 mb-3">
          Anunciar Item
        </h1>

        {/* TÍTULO */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Título do Desapego
        </label>
        <input
          type="text"
          placeholder="Ex: Monitor gamer AOC 144hz"
          className="h-[52px] rounded-xl px-6 mb-4
          bg-[#111735]/90 border border-liquid-purple/80
          text-white text-[12px] font-black placeholder-white/40 outline-none
          shadow-[0_0_18px_rgba(168,85,247,0.45)]"
        />

        {/* GPS */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Endereço via GPS
        </label>
        <button className="h-[52px] rounded-xl mb-4 border-2 border-dashed border-liquid-purple
          flex items-center justify-center gap-3 text-white">
          <MapPin size={26} />
          <span className="text-[12px] font-black">
            Clique para obter localização
          </span>
        </button>

        {/* GALERIA */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Galeria Visual
        </label>
        <button className="h-[52px] rounded-xl mb-4 border border-dashed border-white/25
          flex items-center justify-center gap-3 text-white/40">
          <Image size={26} />
          <span className="text-[12px] font-black">
            Selecione fotos
          </span>
        </button>

        {/* DROPDOWNS */}
        <div className="grid grid-cols-2 gap-16 mb-4">

          {/* TIPO */}
          <div className="flex flex-col relative">
            <label className="text-white/50 text-[11px] font-black mb-1">
              Tipo da Coleção
            </label>

            <button
              onClick={() => setTipoOpen(!tipoOpen)}
              className="h-[45px] rounded-xl px-4 bg-[#111735]/90 border border-white/25
              text-white text-[12px] font-black flex justify-between items-center"
            >
              {tipo}
              {tipoOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {tipoOpen && (
              <div className="absolute bottom-[52px] w-full rounded-xl overflow-hidden
                bg-gradient-to-b from-liquid-purple to-[#a84df5]
                shadow-[0_0_30px_rgba(168,85,247,0.75)] z-50">
                {['Tecnologia', 'Roupas', 'Móveis', 'Eletrônicos'].map(item => (
                  <button
                    key={item}
                    onClick={() => {
                      setTipo(item);
                      setTipoOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white text-[12px] font-black
                    border-b border-white/10 last:border-none hover:bg-white/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ESTADO */}
          <div className="flex flex-col relative">
            <label className="text-white/50 text-[11px] font-black mb-1">
              Estado
            </label>

            <button
              onClick={() => setEstadoOpen(!estadoOpen)}
              className="h-[45px] rounded-xl px-4 bg-[#111735]/90 border border-white/25
              text-white text-[12px] font-black flex justify-between items-center"
            >
              {estado}
              {estadoOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {estadoOpen && (
              <div className="absolute bottom-[52px] w-full rounded-xl overflow-hidden
                bg-gradient-to-b from-liquid-purple to-[#a84df5]
                shadow-[0_0_30px_rgba(168,85,247,0.75)] z-50">
                {['Usado', 'Novo', 'Seminovo'].map(item => (
                  <button
                    key={item}
                    onClick={() => {
                      setEstado(item);
                      setEstadoOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white text-[12px] font-black
                    border-b border-white/10 last:border-none hover:bg-white/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* VALOR */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Valor Sugerido
        </label>
        <input
          type="number"
          placeholder="R$ 0,00"
          className="h-[52px] rounded-xl px-6 mb-6
          bg-[#111735]/90 border border-white/25
          text-white text-[12px] font-black placeholder-white/40 outline-none"
        />

        {/* BOTÃO PUBLICAR */}
        <div className="flex justify-center mt-2">
          <BotaoGenerico
            onClick={() => navigate('/perfil')}
            className="px-12 py-4 text-xl"
          >
            Publicar no Desapega<span>Ê</span>
          </BotaoGenerico>
        </div>

      </div>
    </div>
  );
};

export default Anunciar;