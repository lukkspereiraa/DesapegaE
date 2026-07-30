import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BotaoGenerico from '../../components/BotaoGenerico';
import { trpc } from '../../lib/trpc';

import './EsqueceuSenha.css';

const EsqueceuSenha: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setMensagem('Se o e-mail existir, enviaremos um link de recuperação.');
    },
    onError: () => {
      setErro('Não foi possível enviar o link de recuperação. Tente novamente mais tarde.');
    },
  });

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErro('');
    setMensagem('');

    if (!email.trim()) {
      setErro('Informe um e-mail.');
      return;
    }

    requestResetMutation.mutate({ email });
  };

  return (
    <div className="forgot-page">
      <button
        onClick={() => navigate('/login')}
        className="forgot-back"
      >
        ← Voltar
      </button>

      <div className="forgot-background">
        <div className="forgot-purple-glow" />
        <div className="forgot-blue-glow" />
      </div>

      <div className="forgot-container">
        <div className="forgot-card">

          <div className="forgot-icon">
            🔒
          </div>

          <h1 className="forgot-title">
            Esqueceu a senha?
          </h1>

          <p className="forgot-description">
            Não se preocupe! Digite o e-mail
            associado à sua conta e enviaremos
            as instruções para redefinição.
          </p>

          <form
            className="forgot-form"
            onSubmit={handleSubmit}
          >
            <label className="forgot-label">
              E-mail Cadastrado
            </label>

            <input
              type="email"
              placeholder="email@email.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="forgot-input"
            />

            <div className="forgot-button-wrapper">
              <BotaoGenerico
                className="forgot-button-container"
                buttonClassName="forgot-button"
                disabled={requestResetMutation.isPending}
              >
                {requestResetMutation.isPending ? 'Enviando...' : 'Enviar link de recuperação'}
              </BotaoGenerico>
            </div>

            {erro && (
              <p className="forgot-error">
                {erro}
              </p>
            )}

            {mensagem && (
              <p className="forgot-success">
                {mensagem}
              </p>
            )}
          </form>

          <p className="forgot-login-text">
            Voltar para o login?{' '}
            <span
              onClick={() => navigate('/login')}
              className="forgot-login-link"
            >
              Clique Aqui
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default EsqueceuSenha;