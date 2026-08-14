import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { getAuthSession } from '../lib/session';
import { useNavigate } from 'react-router-dom';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: number;
  type: 'AD' | 'USER';
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetId, type }) => {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [category, setCategory] = useState(type === 'AD' ? 'FRAUD' : 'OFFENSIVE');
  const [reason, setReason] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const reportMutation = trpc.complaint.create.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReason('');
        onClose();
      }, 2000);
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      navigate('/login');
      return;
    }
    
    if (reason.trim().length < 5) {
      alert("O motivo precisa ter pelo menos 5 caracteres.");
      return;
    }

    reportMutation.mutate({
      category,
      reason: reason.trim(),
      advertisementId: type === 'AD' ? targetId : undefined,
      targetUserId: type === 'USER' ? targetId : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#151226] border border-[#a855f7]/30 rounded-2xl p-6 w-full max-w-md relative shadow-[0_0_40px_rgba(168,85,247,0.15)]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Flag className="text-red-500" size={20} />
          </div>
          <h2 className="text-2xl font-black text-white">
            Denunciar {type === 'AD' ? 'Anúncio' : 'Usuário'}
          </h2>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <p className="text-green-400 font-bold text-lg mb-2">Denúncia enviada com sucesso!</p>
            <p className="text-white/60 text-sm">Nossa equipe analisará o caso em breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Categoria da denúncia
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none w-full bg-[#1e1b33] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#a855f7] cursor-pointer"
                >
                  {type === 'AD' ? (
                    <>
                      <option value="FRAUD">Tentativa de Fraude</option>
                      <option value="PROHIBITED">Produto Proibido ou Ilegal</option>
                      <option value="SPAM">Spam ou Anúncio Falso</option>
                      <option value="OTHER">Outro</option>
                    </>
                  ) : (
                    <>
                      <option value="OFFENSIVE">Linguagem Ofensiva</option>
                      <option value="SCAM">Comportamento Suspeito (Golpe)</option>
                      <option value="FAKE_PROFILE">Perfil Falso</option>
                      <option value="OTHER">Outro</option>
                    </>
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Detalhes adicionais (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Conte-nos um pouco mais sobre o ocorrido..."
                className="w-full bg-[#1e1b33] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#a855f7] min-h-[100px] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={reportMutation.isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors mt-2"
            >
              {reportMutation.isLoading ? 'Enviando...' : 'Enviar Denúncia'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
