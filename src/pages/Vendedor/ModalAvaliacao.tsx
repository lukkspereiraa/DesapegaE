import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface ModalAvaliacaoProps {
  isOpen: boolean;
  onClose: () => void;
  vendedorNome: string;
}

const ModalAvaliacao: React.FC<ModalAvaliacaoProps> = ({ isOpen, onClose, vendedorNome }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");

  if (!isOpen) return null;

  const iniciais = vendedorNome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSalvar = () => {
    console.log({ rating, comentario });
    // Aqui no futuro chamaremos a mutação do tRPC
    alert("Avaliação enviada com sucesso!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop (Fundo escurecido) */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0c0c12] border-2 border-purple-500/50 rounded-[40px] p-8 shadow-[0_0_50px_rgba(147,51,234,0.3)] overflow-hidden">
        
        {/* Efeito de luz interna */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl font-black text-white mb-6 tracking-tight">
            Avalia<span className="text-purple-400">É</span> o Vendedor
          </h2>

          {/* Avatar Círculo */}
          <div className="w-24 h-24 rounded-full bg-linear-to-tr from-purple-600 to-blue-500 p-1 mb-4 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            <div className="w-full h-full rounded-full bg-[#0c0c12] flex items-center justify-center text-3xl font-black text-white">
              {iniciais}
            </div>
          </div>

          <p className="text-lg font-bold text-white mb-6 text-center">
            {vendedorNome}
          </p>

          {/* Estrelas Interativas */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={36}
                  className={`${
                    star <= (hover || rating) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-white/20"
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>

          {/* Área de Texto */}
          <div className="w-full mb-8">
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Como foi sua negociação com o vendedor ..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors uppercase tracking-wider text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={rating === 0}
              className="flex-1 py-4 rounded-2xl bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none uppercase tracking-wider text-sm"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAvaliacao;