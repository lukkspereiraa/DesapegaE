import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BotaoGenerico from '../../components/BotaoGenerico';
import { trpc } from '../../lib/trpc';
import { uploadProductImages } from '../../lib/uploads';
import { fetchAddressFromCEP, fetchStates, fetchCities, StateResponse, CityResponse } from '../../lib/address';

import './Anunciar.css';

interface ImagemUpload {
  file: File;
  preview: string;
}

const Anunciar: React.FC = () => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('Roupas');;
  const [estado, setEstado] = useState('Seminovo');
  const [descricao, setDescricao] = useState('');
  
  const [imagens, setImagens] = useState<ImagemUpload[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: user } = trpc.auth.me.useQuery(undefined, { refetchOnWindowFocus: false });

  const [useProfileAddress, setUseProfileAddress] = useState(true);
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

  const inputRef = useRef<HTMLInputElement>(null);

  const categoryIdByName: Record<string, number> = {
  Roupas: 2,
  Móveis: 3,
  Eletrônicos: 4,
  Todos: 1,
};

  const createProduct = trpc.product.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.listPublic.invalidate(),
        utils.product.myAds.invalidate(),
      ]);

      navigate('/perfil');
    },
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const adicionarFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = event.target.files;
    if (!arquivos) return;

    const novasImagens = Array.from(arquivos).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagens((prev) => [...prev, ...novasImagens]);
    event.target.value = '';
  };

  const removerFoto = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  const moverFoto = (e: React.MouseEvent, index: number, direcao: 'esq' | 'dir') => {
    e.stopPropagation();
    setImagens(prev => {
      const novas = [...prev];
      if (direcao === 'esq' && index > 0) {
        [novas[index - 1], novas[index]] = [novas[index], novas[index - 1]];
      } else if (direcao === 'dir' && index < novas.length - 1) {
        [novas[index + 1], novas[index]] = [novas[index], novas[index + 1]];
      }
      return novas;
    });
  };

  const tornarPrincipal = (index: number) => {
    setImagens(prev => {
      const novas = [...prev];
      const [removida] = novas.splice(index, 1);
      novas.unshift(removida);
      return novas;
    });
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let newCep = e.target.value.replace(/\D/g, '');
    if (newCep.length > 8) newCep = newCep.substring(0, 8);
    
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
          setStateName(data.state);
          setCityName(data.city);
          setNeighborhood(data.neighborhood);
          setStreet(data.street);
        } else {
          setError('CEP não encontrado.');
        }
      } catch {
        setError('Falha ao buscar CEP.');
      } finally {
        setFetchingCep(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setError(null);

    if (!titulo.trim()) {
      setError('Informe o título do anúncio.');
      return;
    }

    const valorNormalizado = Number(valor.replace(',', '.'));

    if (!Number.isFinite(valorNormalizado) || valorNormalizado < 0) {
      setError('Informe um valor válido.');
      return;
    }

    if (imagens.length === 0) {
      setError('Selecione pelo menos uma imagem.');
      return;
    }

    let addressData = undefined;
    if (!useProfileAddress) {
      if (!cep.trim() || !cityName.trim() || !stateCode.trim() || !neighborhood.trim()) {
        setError('Preencha os campos obrigatórios de endereço (CEP, Cidade, UF, Bairro).');
        return;
      }
      addressData = {
        stateCode: stateCode.trim(),
        stateName: stateName.trim() || stateCode.trim(),
        cityName: cityName.trim(),
        neighborhood: neighborhood.trim(),
        postalCode: cep.trim(),
        street: street.trim() || undefined,
        number: number.trim() || undefined,
        complement: complement.trim() || undefined,
      };
    }

    try {
      setSubmitting(true);

      const filesToUpload = imagens.map(img => img.file);
      const uploadedImages = await uploadProductImages(filesToUpload);

      await createProduct.mutateAsync({
        title: titulo.trim(),
        description: descricao.trim() || titulo.trim(),
        price: Math.round(valorNormalizado * 100),
        conditions: estado,
        categoryId: categoryIdByName[tipo] ?? 1,
        pictures: uploadedImages,
        useProfileAddress,
        address: addressData,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o anúncio.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const imagemPrincipal = imagens.length > 0 ? imagens[0].preview : '';

  return (
    <div className="anunciar-page">
      <div className="anunciar-background">
        <div className="anunciar-purple-glow" />
        <div className="anunciar-blue-glow" />
      </div>

      <div className="anunciar-container">
        <div className="anunciar-card">
          <button
  className="anunciar-voltar"
  onClick={() => navigate('/perfil')}
>
  ← Voltar
</button>
  <h1 className="anunciar-title">
    Anunciar Item
  </h1>

  <input
    ref={inputRef}
    type="file"
    accept="image/*"
    multiple
    onChange={adicionarFoto}
    hidden
  />

  <div className="anunciar-group">
    <label>Título do Desapego</label>
    <input
      type="text"
      value={titulo}
      onChange={(e) => setTitulo(e.target.value)}
      placeholder="Ex: Monitor gamer AOC 144hz"
    />
  </div>

  <div className="anunciar-group">
    <label>Descrição</label>
    <textarea
      rows={4}
      value={descricao}
      onChange={(e) => setDescricao(e.target.value)}
      placeholder="Ex: descrição do produto"
    />
  </div>
  <div className="anunciar-group">
  <label>Localização do anúncio</label>

  <div className="anunciar-endereco-opcoes">
    <label className="anunciar-radio">
      <input
        type="radio"
        checked={useProfileAddress}
        onChange={() => setUseProfileAddress(true)}
      />
      Usar meu endereço de perfil
    </label>

    <label className="anunciar-radio">
      <input
        type="radio"
        checked={!useProfileAddress}
        onChange={() => setUseProfileAddress(false)}
      />
      Informar outro endereço
    </label>
  </div>
</div>

{useProfileAddress && user?.address && (
  <div className="anunciar-endereco-perfil">
    <p>
      <strong>CEP:</strong> {user.address.postalCode}
    </p>

    <p>
      <strong>Cidade:</strong> {user.address.cityName} - {user.address.stateCode}
    </p>

    <p>
      <strong>Bairro:</strong> {user.address.neighborhood}
    </p>

    {(user.address.street || user.address.number) && (
      <p>
        <strong>Endereço:</strong> {user.address.street}
        {user.address.number ? `, ${user.address.number}` : ''}
      </p>
    )}
  </div>
)}

  {!useProfileAddress && (
    <>
      <div className="anunciar-grid-2">
        <div className="anunciar-group">
          <label>CEP</label>
          <input
            type="text"
            value={cep}
            onChange={handleCepChange}
            maxLength={9}
            placeholder="CEP"
          />
        </div>

        <div className="anunciar-group">
          <label>Rua</label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Rua"
          />
        </div>
      </div>

      <div className="anunciar-grid-3">
        <div className="anunciar-group">
          <label>Número</label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Número"
          />
        </div>

        <div className="anunciar-group">
          <label>Bairro</label>
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Bairro"
          />
        </div>

        <div className="anunciar-group">
          <label>Estado/Cidade</label>

          <select
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
          >
            <option value="">
              Estado/Cidade
            </option>

            {availableCities.map(city => (
              <option
                key={city.codigo_ibge}
                value={city.nome}
              >
                {city.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  )}

  <div className="anunciar-group">
    <label>Galeria Visual</label>

<div
  className="anunciar-upload"
  onClick={() => inputRef.current?.click()}
>
  <div className="anunciar-upload-overlay">
    <div className="anunciar-upload-icon">
      
    </div>

    <p>
      {imagemPrincipal
        ? 'Adicionar mais fotos'
        : 'Selecione a Coleção de fotos do Produto'}
    </p>
  </div>
</div>



    <div className="anunciar-miniaturas">
      {imagens.map((imagem, index) => (
        

        <div
          key={index}
          className="anunciar-miniatura-container"
        >
          <img
            src={imagem.preview}
            alt=""
            onClick={() => tornarPrincipal(index)}
          />

          <div
            className="anunciar-remover-foto"
            onClick={(e) => removerFoto(e, index)}
          >
            ✕
          </div>

          {index > 0 && (
  <div
    className="anunciar-mover-esq"
    onClick={(e) => moverFoto(e, index, 'esq')}
  >
    ‹
  </div>
)}

{index < imagens.length - 1 && (
  <div
    className="anunciar-mover-dir"
    onClick={(e) => moverFoto(e, index, 'dir')}
  >
    ›
  </div>
)}
        </div>
      ))}
    </div>
  </div>

  <div className="anunciar-grid-2">
    <div className="anunciar-group">
      <label>Tipo da Coleção</label>

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      >
        <option value="Roupas">Roupas</option>
        <option value="Móveis">Móveis</option>
        <option value="Eletrônicos">Eletrônicos</option>
        <option value="Todos">Todos</option>
      </select>
      </div>

    <div className="anunciar-group">
      <label>Estado</label>

      <select
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
      >
        <option value="Novo">Novo</option>
        <option value="Seminovo">Seminovo</option>
        <option value="Usado">Usado</option>
      </select>
    </div>
  </div>

  <div className="anunciar-group">
    <label>Valor Sugerido</label>

    <input
      type="number"
      value={valor}
      onChange={(e) => setValor(e.target.value)}
      placeholder="R$ 0,00"
      min="0"
      step="0.01"
    />
  </div>

  {error && (
    <p className="anunciar-error">
      {error}
    </p>
  )}
<div className="anunciar-botao-container">

  <BotaoGenerico
onClick={handleSubmit}
    buttonClassName="anunciar-salvar"
  >
    {submitting ? 'Publicando...' : 'Publicar no DesapegaÊ'}
  </BotaoGenerico>
</div>
</div>
          </div>
        </div>

  );
};

export default Anunciar;