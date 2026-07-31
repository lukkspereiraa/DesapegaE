import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { trpc } from '../../lib/trpc';
import BotaoGenerico from '../../components/BotaoGenerico';
import '../EsqueceuSenha/EsqueceuSenha.css'; // Reusing styles

const RedefinirSenha: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setMensagem('Senha redefinida com sucesso! Você já pode fazer login.');
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (e) => {
      setErro(e.message || 'Erro ao redefinir senha. O link pode ser inválido ou expirado.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!token) {
      setErro('Token inválido. Solicite a redefinição de senha novamente.');
      return;
    }

    if (password.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErro('As senhas não coincidem.');
      return;
    }

    resetMutation.mutate({ token, newPassword: password });
  };

  return (
    <div className="forgot-page">
      <div className="forgot-background">
        <div className="forgot-purple-glow" />
        <div className="forgot-blue-glow" />
      </div>

      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-icon">🔑</div>
          <h1 className="forgot-title">Criar Nova Senha</h1>
          <p className="forgot-description">
            Digite sua nova senha abaixo.
          </p>

          <form className="forgot-form" onSubmit={handleSubmit}>
            <label className="forgot-label">Nova Senha</label>
            <input
              type="password"
              placeholder="Sua nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="forgot-input"
            />

            <label className="forgot-label" style={{ marginTop: '15px' }}>Confirmar Senha</label>
            <input
              type="password"
              placeholder="Confirme a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="forgot-input"
            />

            <div className="forgot-button-wrapper" style={{ marginTop: '30px' }}>
              <BotaoGenerico
                className="forgot-button-container"
                buttonClassName="forgot-button"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? 'Redefinindo...' : 'Salvar nova senha'}
              </BotaoGenerico>
            </div>

            {erro && <p className="forgot-error">{erro}</p>}
            {mensagem && <p className="forgot-success">{mensagem}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
