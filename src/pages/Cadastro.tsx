import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BotaoGenerico from '../components/BotaoGenerico';
import { saveAuthSession } from '../lib/session';
import { trpc } from '../lib/trpc';

const Cadastro: React.FC = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [estadoSigla, setEstadoSigla] = useState('CE');
  const [estadoNome, setEstadoNome] = useState('Ceara');
  const [cidade, setCidade] = useState('Cedro');
  const [bairro, setBairro] = useState('Centro');
  const [cep, setCep] = useState('63400-000');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
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

    if (!cidade.trim() || !bairro.trim() || !cep.trim() || !estadoSigla.trim() || !estadoNome.trim()) {
      setLocalError('Preencha os campos obrigatorios de endereco.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        password: senha,
        phone: telefone.trim(),
        address: {
          stateCode: estadoSigla.trim().toUpperCase(),
          stateName: estadoNome.trim(),
          cityName: cidade.trim(),
          neighborhood: bairro.trim(),
          postalCode: cep.trim(),
          street: rua.trim() || undefined,
          number: numero.trim() || undefined,
          complement: complemento.trim() || undefined,
        },
      });
    } catch {
      // Error already exposed by mutation state.
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-deep-black overflow-x-hidden">

      {/* BOTÃO VOLTAR */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white text-sm transition-all"
      >
        ← Voltar
      </button>

      {/* FUNDO COM GLOW */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">

        <div className="absolute top-[-5%] right-[-5%] 
                        w-87.5 h-87.5 sm:w-137.5 sm:h-137.5 lg:w-212.5 lg:h-212.5 
                        bg-liquid-purple/30 rounded-full blur-[90px] sm:blur-[130px] lg:blur-[170px]" />

        <div className="absolute bottom-[-10%] left-[-5%] 
                        w-75 h-75 sm:w-125 sm:h-125 lg:w-212.5 lg:h-212.5 
                        bg-electric-blue/35 rounded-full blur-[80px] sm:blur-[120px] lg:blur-[170px]" />
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">

        {/* CARD */}
        <div className="w-full max-w-md p-8 rounded-4xl 
          bg-[#101018]/70 border border-white/10 border-t-white/30 border-l-white/30 
          backdrop-blur-3xl 
          shadow-[0_40px_80px_rgba(0,0,0,0.8)] 
          flex flex-col gap-6 max-h-[90vh] overflow-y-auto">

          {/* TÍTULO */}
          <h1 className="text-4xl font-black text-center tracking-tight text-white">
            Cadastra<span className="text-liquid-purple">Ê</span>
          </h1>

          {/* INPUTS */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 
              text-white placeholder-white/40 outline-none 
              focus:border-electric-blue transition-all"
            />

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
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 
              text-white placeholder-white/40 outline-none 
              focus:border-electric-blue transition-all"
            />

            <input
              type="text"
              placeholder="Telefone"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 
              text-white placeholder-white/40 outline-none 
              focus:border-electric-blue transition-all"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="UF (ex: CE)"
                value={estadoSigla}
                onChange={(event) => setEstadoSigla(event.target.value)}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-electric-blue transition-all"
              />

              <input
                type="text"
                placeholder="Estado"
                value={estadoNome}
                onChange={(event) => setEstadoNome(event.target.value)}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-electric-blue transition-all"
              />
            </div>

            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(event) => setCidade(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-electric-blue transition-all"
            />

            <input
              type="text"
              placeholder="Bairro"
              value={bairro}
              onChange={(event) => setBairro(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-electric-blue transition-all"
            />

            <input
              type="text"
              placeholder="CEP"
              value={cep}
              onChange={(event) => setCep(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-electric-blue transition-all"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Rua (opcional)"
                value={rua}
                onChange={(event) => setRua(event.target.value)}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-electric-blue transition-all"
              />

              <input
                type="text"
                placeholder="Numero (opcional)"
                value={numero}
                onChange={(event) => setNumero(event.target.value)}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-electric-blue transition-all"
              />
            </div>

            <input
              type="text"
              placeholder="Complemento (opcional)"
              value={complemento}
              onChange={(event) => setComplemento(event.target.value)}
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-electric-blue transition-all"
            />

            <div className="flex justify-center mt-4">
              <BotaoGenerico className="px-10 py-3">
                {registerMutation.isPending ? 'Criando conta...' : 'Criar minha conta'}
              </BotaoGenerico>
            </div>

            {(localError || registerMutation.error?.message) && (
              <p className="text-center text-red-400 text-sm font-black">
                {localError ?? registerMutation.error?.message}
              </p>
            )}
          </form>

          {/* LOGIN */}
          <p className="text-center text-white/40 text-sm">
            Já tem conta?{' '}
            <span
                onClick={() => navigate('/login')}
                className="text-electric-blue font-bold cursor-pointer hover:underline"
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