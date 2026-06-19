import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import BotaoGenerico from '../../components/BotaoGenerico';

import { saveAuthSession } from '../../lib/session';
import { trpc } from '../../lib/trpc';

import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const from =
    (location.state as { from?: string } | null)?.from || '/perfil';

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });

      navigate(from, { replace: true });
    },
  });

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Informe e-mail e senha.');
      return;
    }

    if (password.trim().length < 6) {
      setLocalError('Senha muito curta.');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch {
      //
    }
  };

  return (
    <div className="login-page">
      <button
        onClick={() => navigate('/')}
        className="btn-voltar"
      >
        ← Voltar
      </button>

      <div className="background-effects">
        <div className="purple-glow" />
        <div className="blue-glow" />
      </div>

      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">
            Entrar no Desapega<span>Ê</span>
          </h1>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >
            <label className="login-label">
              E-mail
            </label>

            <input
              type="email"
              placeholder="email@email.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="login-input"
            />

            <label className="login-label">
              Senha de acesso
            </label>

            <input
              type="password"
              placeholder="........................"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="login-input"
            />

            <div className="login-button-wrapper">
              <BotaoGenerico
                className="login-button-component"
                buttonClassName="login-button"
              >
                {loginMutation.isPending
                  ? 'Entrando...'
                  : 'Acessar Conta'}
              </BotaoGenerico>
            </div>

            {(localError ||
              loginMutation.error?.message) && (
              <p className="login-error">
                {localError ??
                  loginMutation.error?.message}
              </p>
            )}
          </form>

          <p className="login-forgot">
            Esqueceu a senha?{' '}
            <span
              onClick={() => navigate('/esqueceu-senha')}
            >
              Clique Aqui
            </span>
          </p>

          <p className="login-register-text">
            Não tem conta?{' '}
            <span
              onClick={() => navigate('/cadastro')}
              className="login-register-link"
            >
              Cadastre-se
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;