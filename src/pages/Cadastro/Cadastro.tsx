import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BotaoGenerico from '../../components/BotaoGenerico';

import { saveAuthSession } from '../../lib/session';
import { trpc } from '../../lib/trpc';

import './Cadastro.css';

const Cadastro: React.FC = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });

      navigate('/perfil', { replace: true });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!nome.trim() || !email.trim() || !senha.trim() || !telefone.trim()) {
      setLocalError('Preencha nome, e-mail, senha e telefone.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        password: senha,
        phone: telefone.trim(),

        address: {
          stateCode: 'CE',
          stateName: 'Ceará',
          cityName: 'Cedro',
          neighborhood: 'Centro',
          postalCode: '63400-000',
          street: undefined,
          number: undefined,
          complement: undefined,
        },
      });
    } catch {
      //
    }
  };

  return (
    <div className="cadastro-page">
      <button
        onClick={() => navigate('/')}
        className="cadastro-voltar"
      >
        ← Voltar
      </button>

      <div className="cadastro-background">
        <div className="cadastro-purple-glow" />
        <div className="cadastro-blue-glow" />
      </div>

      <div className="cadastro-container">
        <div className="cadastro-card">
          <h1 className="cadastro-title">
            Cadastra<span>Ê</span>
          </h1>

          <form className="cadastro-form" onSubmit={handleSubmit}>
            <label className="cadastro-label">Nome completo</label>
            <input
              type="text"
              placeholder="Seu nome aqui"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="cadastro-input"
            />

            <label className="cadastro-label">E-mail</label>
            <input
              type="email"
              placeholder="SeuEmail@Email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="cadastro-input"
            />

            <label className="cadastro-label">Senha de acesso</label>
            <input
              type="password"
              placeholder="................................."
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              className="cadastro-input"
            />

            <label className="cadastro-label">Telefone</label>
            <input
              type="text"
              placeholder="(XX) 999-999.99"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              className="cadastro-input"
            />

            <BotaoGenerico
              className="cadastro-button-wrapper"
              buttonClassName="cadastro-button"
            >
                {registerMutation.isPending
                  ? 'Criando conta...'
                  : 'Criar minha conta'}
              </BotaoGenerico>
            

            {(localError || registerMutation.error?.message) && (
              <p className="cadastro-error">
                {localError ?? registerMutation.error?.message}
              </p>
            )}
          </form>

          <p className="cadastro-login-text">
            já possui cadastro?{' '}
            <span
              onClick={() => navigate('/login')}
              className="cadastro-login-link"
            >
              Entrar
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;