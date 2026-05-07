import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BotaoGenerico from '../components/BotaoGenerico';
import { saveAuthSession } from '../lib/session';
import { trpc } from '../lib/trpc';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from || '/perfil';

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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Informe e-mail e senha.');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch {
      // Error already exposed by mutation state.
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-deep-black overflow-x-hidden">

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white text-sm transition-all"
      >
        ← Voltar
      </button>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] 
                        w-87.5 h-87.5 sm:w-137.5 sm:h-137.5 lg:w-212.5 lg:h-212.5 
                        bg-liquid-purple/30 rounded-full blur-[90px] sm:blur-[130px] lg:blur-[170px]" />

        <div className="absolute bottom-[-10%] left-[-5%] 
                        w-75 h-75 sm:w-125 sm:h-125 lg:w-212.5 lg:h-212.5 
                        bg-electric-blue/35 rounded-full blur-[80px] sm:blur-[120px] lg:blur-[170px]" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">

        <div className="w-full max-w-md p-8 rounded-4xl 
          bg-[#101018]/70 border border-white/10 border-t-white/30 border-l-white/30 
          backdrop-blur-3xl 
          shadow-[0_40px_80px_rgba(0,0,0,0.8)] 
          flex flex-col gap-6">

          <h1 className="text-4xl font-black text-center tracking-tight text-white">
            Login<span className="text-liquid-purple">Ê</span>
          </h1>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 
              text-white placeholder-white/40 outline-none 
              focus:border-electric-blue transition-all"
            />

            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 
              text-white placeholder-white/40 outline-none 
              focus:border-electric-blue transition-all"
            />

            <div className="flex justify-center mt-4">
              <BotaoGenerico className="px-10 py-3">
                {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
              </BotaoGenerico>
            </div>

            {(localError || loginMutation.error?.message) && (
              <p className="text-center text-red-400 text-sm font-black">
                {localError ?? loginMutation.error?.message}
              </p>
            )}
          </form>

          <p className="text-center text-white/40 text-sm">
            Não tem conta?{' '}
            <span
              onClick={() => navigate('/cadastro')}
              className="text-electric-blue font-bold cursor-pointer hover:underline"
            >
              Criar conta
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;