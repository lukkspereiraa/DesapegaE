import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BotaoGenerico from '../../components/BotaoGenerico';

import { saveAuthSession } from '../../lib/session';
import { trpc } from '../../lib/trpc';
import { fetchAddressFromCEP, fetchStates, fetchCities, StateResponse, CityResponse } from '../../lib/address';

import './Cadastro.css';

const Cadastro: React.FC = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');

  const [cep, setCep] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [stateName, setStateName] = useState('');
  const [cityName, setCityName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [fetchingCep, setFetchingCep] = useState(false);

  const [availableStates, setAvailableStates] = useState<StateResponse[]>([]);
  const [availableCities, setAvailableCities] = useState<CityResponse[]>([]);

  React.useEffect(() => {
    fetchStates().then(data => {
      const sorted = data.sort((a, b) => a.sigla.localeCompare(b.sigla));
      setAvailableStates(sorted);
    });
  }, []);

  React.useEffect(() => {
    if (stateCode) {
      fetchCities(stateCode).then(data => {
        const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
        setAvailableCities(sorted);
      });
    } else {
      setAvailableCities([]);
    }
  }, [stateCode]);

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

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let newCep = e.target.value.replace(/\D/g, '');
    if (newCep.length > 8) newCep = newCep.substring(0, 8);
    
    // Formatar CEP
    let formattedCep = newCep;
    if (newCep.length > 5) {
      formattedCep = `${newCep.substring(0, 5)}-${newCep.substring(5)}`;
    }
    setCep(formattedCep);

    if (newCep.length === 8) {
      setFetchingCep(true);
      try {
        const data = await fetchAddressFromCEP(newCep);
        if (data) {
          setStateCode(data.state);
          // O Brasil API não retorna o nome por extenso do estado no CEP v1,
          // mas a nossa API no backend apenas precisa de algo descritivo, 
          // usaremos a própria sigla como nome se não tivermos.
          setStateName(data.state);
          setCityName(data.city);
          setNeighborhood(data.neighborhood);
          setStreet(data.street);
        } else {
          setLocalError('CEP não encontrado.');
        }
      } catch {
        setLocalError('Falha ao buscar CEP.');
      } finally {
        setFetchingCep(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!nome.trim() || !email.trim() || !senha.trim() || !telefone.trim()) {
      setLocalError('Preencha nome, e-mail, senha e telefone.');
      return;
    }

    if (senha.length < 6) {
      setLocalError('Senha muito curta!!');
      return;
    }

    if (!cep.trim() || !cityName.trim() || !stateCode.trim() || !neighborhood.trim()) {
      setLocalError('Preencha os campos obrigatórios de endereço (CEP, Cidade, UF, Bairro).');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        password: senha,
        phone: telefone.trim(),

        address: {
          stateCode: stateCode.trim(),
          stateName: stateName.trim() || stateCode.trim(),
          cityName: cityName.trim(),
          neighborhood: neighborhood.trim(),
          postalCode: cep.trim(),
          street: street.trim() || undefined,
          number: number.trim() || undefined,
          complement: complement.trim() || undefined,
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

            <div className="cadastro-grid">
              <div>
                <label className="cadastro-label">Telefone</label>
                <input
                  type="text"
                  placeholder="(XX) 999-999.99"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                  className="cadastro-input"
                />
              </div>
              
              <div>
                <label className="cadastro-label">CEP {fetchingCep && '...'}</label>
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                  className="cadastro-input"
                  maxLength={9}
                />
              </div>
            </div>

            <div className="cadastro-grid">
              <div>
                <label className="cadastro-label">Rua / Logradouro</label>
                <input
                  type="text"
                  placeholder="Sua rua"
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  className="cadastro-input"
                />
              </div>
              <div>
                <label className="cadastro-label">Número</label>
                <input
                  type="text"
                  placeholder="123"
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  className="cadastro-input"
                />
              </div>
            </div>

            <label className="cadastro-label">Bairro</label>
            <input
              type="text"
              placeholder="Seu bairro"
              value={neighborhood}
              onChange={(event) => setNeighborhood(event.target.value)}
              className="cadastro-input"
            />

            <div className="cadastro-grid">
              <div>
                <label className="cadastro-label">Cidade</label>
                <select
                  value={cityName}
                  onChange={(event) => setCityName(event.target.value)}
                  className="cadastro-input"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                  disabled={!stateCode || availableCities.length === 0}
                >
                  <option value="">Selecione uma cidade</option>
                  {availableCities.map(city => (
                    <option key={city.codigo_ibge} value={city.nome}>{city.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="cadastro-label">UF (Estado)</label>
                <select
                  value={stateCode}
                  onChange={(event) => {
                    const newCode = event.target.value;
                    setStateCode(newCode);
                    const state = availableStates.find(s => s.sigla === newCode);
                    if (state) setStateName(state.nome);
                    setCityName(''); // reset city when state changes
                  }}
                  className="cadastro-input"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">UF</option>
                  {availableStates.map(state => (
                    <option key={state.id} value={state.sigla}>{state.sigla}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="cadastro-label">Complemento (Opcional)</label>
            <input
              type="text"
              placeholder="Apto, Bloco, etc."
              value={complement}
              onChange={(event) => setComplement(event.target.value)}
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