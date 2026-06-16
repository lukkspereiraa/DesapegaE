import React, { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import BotaoGenerico from '../../components/BotaoGenerico';
import { trpc } from '../../lib/trpc';
import { uploadProductImages } from '../../lib/uploads';
import { fetchAddressFromCEP, fetchStates, fetchCities, StateResponse, CityResponse } from '../../lib/address';

import './EditarProduto.css';

interface ProdutoState {
  id?: number;
  titulo?: string;
  preco?: string;
  categoria?: string;
  estado?: string;
  localizacao?: string;
  descricao?: string;
  imagens?: string[];
}

interface ImagemState {
  url?: string;
  file?: File;
  preview: string;
}

const EditarProduto: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const inputRef = useRef<HTMLInputElement>(null);

  const produto = (location.state as ProdutoState) || {};
  const adId = produto.id;

  const utils = trpc.useUtils();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState(produto.titulo || '');
  const [valor, setValor] = useState(produto.preco ? produto.preco.replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.') : '');
  const [tipo, setTipo] = useState('Tecnologia');
  const [estado, setEstado] = useState('Seminovo');
  const [descricao, setDescricao] = useState('');

  const imagensIniciais: ImagemState[] = useMemo(() => {
    const urls = produto.imagens?.length ? produto.imagens : [];
    return urls.map(url => ({ url, preview: url }));
  }, [produto.imagens]);

  const [imagens, setImagens] = useState<ImagemState[]>(imagensIniciais);

  const categoryIdByName: Record<string, number> = {
    Tecnologia: 1,
    Roupas: 2,
    Móveis: 3,
    Eletrônicos: 4,
    Moda: 2,
    Games: 4,
  };

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

  const { data } = trpc.product.byId.useQuery(
    { id: adId! },
    {
      enabled: !!adId,
      refetchOnWindowFocus: false,
    }
  );

  React.useEffect(() => {
    if (data) {
      setTitulo(data.title);
      setValor((data.price / 100).toFixed(2));
      setTipo(data.category?.name || 'Tecnologia');
      setEstado(data.conditions || 'Seminovo');
      setDescricao(data.description);
      
      if (data.pictures && data.pictures.length > 0) {
        setImagens(data.pictures.map(pic => ({
          url: pic.url,
          blobId: pic.blobId,
          preview: pic.url
        })));
      }

      if (data.address && user?.address) {
        if (data.address.id !== user.address.id) {
          setUseProfileAddress(false);
          setCep(data.address.postalCode);
          setStateCode(data.address.stateCode);
          setStateName(data.address.stateName);
          setCityName(data.address.cityName);
          setNeighborhood(data.address.neighborhood);
          setStreet(data.address.street || '');
          setNumber(data.address.number || '');
          setComplement(data.address.complement || '');
        }
      }
    }
  }, [data, user]);

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.listPublic.invalidate(),
        utils.product.myAds.invalidate(),
      ]);
      navigate('/perfil');
    },
  });

  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.listPublic.invalidate(),
        utils.product.myAds.invalidate(),
      ]);
      navigate('/perfil');
    },
  });

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
    if (!adId || submitting) return;

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
      setError('O anúncio deve ter pelo menos uma foto.');
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

      const newFiles = imagens.filter(img => img.file).map(img => img.file as File);
      let newUploadedImages: any[] = [];
      if (newFiles.length > 0) {
        newUploadedImages = await uploadProductImages(newFiles);
      }

      let uploadIndex = 0;
      const finalPictures = imagens.map((img) => {
        if (img.file) {
          const uploaded = newUploadedImages[uploadIndex++];
          return { url: uploaded.url, blobId: uploaded.blobId };
        }
        return { url: img.url!, blobId: (img as any).blobId };
      });

      await updateProduct.mutateAsync({
        id: adId,
        title: titulo.trim(),
        description: descricao.trim() || titulo.trim(),
        price: Math.round(valorNormalizado * 100),
        conditions: estado,
        categoryId: categoryIdByName[tipo] ?? 1,
        pictures: finalPictures,
        useProfileAddress,
        address: addressData,
      });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar as alterações.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!adId) return;
    const confirm = window.confirm('Tem certeza que deseja excluir este anúncio?');
    if (confirm) {
      setSubmitting(true);
      try {
        await deleteProduct.mutateAsync({ id: adId });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao excluir o anúncio.');
        setSubmitting(false);
      }
    }
  };

  const imagemPrincipal = imagens.length > 0 ? imagens[0].preview : '';

  return (
    <div className="editar-page">
      <div className="editar-background">
        <div className="editar-purple-glow" />
        <div className="editar-blue-glow" />
      </div>

      <div className="editar-container">
        <div className="editar-card">
          <div className="editar-left">
            <h1 className="editar-title">
              Edita<span>Ê</span> seu anúncio
            </h1>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={adicionarFoto}
              hidden
            />

            <div
              className="editar-upload"
              onClick={() => inputRef.current?.click()}
              style={{
                backgroundImage: imagemPrincipal ? `url(${imagemPrincipal})` : 'none',
              }}
            >
              <div className="editar-upload-overlay">
                <div className="editar-upload-icon">{imagemPrincipal ? '↑' : '+'}</div>
                <p>{imagemPrincipal ? 'Adicionar Fotos' : 'Selecione Fotos'}</p>
              </div>
            </div>

            <div className="editar-miniaturas">
              {imagens.map((imagem, index) => (
                <div 
                  key={index} 
                  className="editar-miniatura-container"
                >
                  <img
                    src={imagem.preview}
                    alt=""
                    onClick={() => tornarPrincipal(index)}
                    title={index === 0 ? "Imagem Principal" : "Clique para tornar principal"}
                    style={{
                      borderColor: index === 0 ? '#fff' : '#a855f7',
                      borderWidth: index === 0 ? '3px' : '2px',
                      borderStyle: index === 0 ? 'solid' : 'dashed'
                    }}
                  />
                  <div 
                    className="editar-remover-foto"
                    onClick={(e) => removerFoto(e, index)}
                    title="Remover foto"
                  >
                    ✕
                  </div>
                  {index > 0 && (
                    <div 
                      className="editar-mover-esq"
                      onClick={(e) => moverFoto(e, index, 'esq')}
                      title="Mover para esquerda"
                    >
                      ‹
                    </div>
                  )}
                  {index < imagens.length - 1 && (
                    <div 
                      className="editar-mover-dir"
                      onClick={(e) => moverFoto(e, index, 'dir')}
                      title="Mover para direita"
                    >
                      ›
                    </div>
                  )}
                </div>
              ))}

              <div
                className="editar-add-foto"
                onClick={() => inputRef.current?.click()}
              >
                +
              </div>
            </div>

            <button 
              className="editar-excluir" 
              onClick={handleDelete}
              disabled={submitting}
            >
              Excluir anúncio
            </button>
            {error && (
              <p className="editar-error" style={{ color: '#ef4444', marginTop: '16px', textAlign: 'center', fontWeight: 'bold' }}>
                {error}
              </p>
            )}
          </div>

          <div className="editar-right">
            <div className="editar-group">
              <label>Título do anúncio</label>

              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="editar-group">
              <label>Preço</label>

              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="editar-grid">
              <div className="editar-group">
                <label>Tipo da Coleção</label>

                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Moda">Moda</option>
                  <option value="Games">Games</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                </select>
              </div>

              <div className="editar-group">
                <label>Estado</label>

                <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="Novo">Novo</option>
                  <option value="Seminovo">Seminovo</option>
                  <option value="Usado">Usado</option>
                </select>
              </div>
            </div>

            <div className="editar-group" style={{ marginTop: '20px' }}>
              <label>Localização do Anúncio</label>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={useProfileAddress} 
                    onChange={() => setUseProfileAddress(true)}
                    style={{ accentColor: '#a855f7' }}
                  />
                  Usar meu endereço de perfil
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    checked={!useProfileAddress} 
                    onChange={() => setUseProfileAddress(false)}
                    style={{ accentColor: '#a855f7' }}
                  />
                  Informar outro endereço
                </label>
              </div>

              {useProfileAddress && user?.address && (
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#ccc', fontSize: '14px' }}>
                  <p><strong>CEP:</strong> {user.address.postalCode}</p>
                  <p><strong>Cidade:</strong> {user.address.cityName} - {user.address.stateCode}</p>
                  <p><strong>Bairro:</strong> {user.address.neighborhood}</p>
                  {(user.address.street || user.address.number) && (
                    <p><strong>Rua:</strong> {user.address.street}{user.address.number ? `, ${user.address.number}` : ''}</p>
                  )}
                </div>
              )}

              {!useProfileAddress && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ color: '#ccc', fontSize: '13px', marginBottom: '4px', display: 'block' }}>CEP {fetchingCep && '...'}</label>
                      <input type="text" value={cep} onChange={handleCepChange} maxLength={9} placeholder="00000-000" style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ color: '#ccc', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Bairro</label>
                      <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Bairro" style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ color: '#ccc', fontSize: '13px', marginBottom: '4px', display: 'block' }}>UF</label>
                      <select 
                        value={stateCode} 
                        onChange={(e) => {
                          const newCode = e.target.value;
                          setStateCode(newCode);
                          const state = availableStates.find(s => s.sigla === newCode);
                          if (state) setStateName(state.nome);
                          setCityName('');
                        }}
                        style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', appearance: 'none', cursor: 'pointer' }}
                      >
                        <option value="">UF</option>
                        {availableStates.map(state => (
                          <option key={state.id} value={state.sigla}>{state.sigla}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: '#ccc', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Cidade</label>
                      <select 
                        value={cityName} 
                        onChange={e => setCityName(e.target.value)} 
                        disabled={!stateCode || availableCities.length === 0}
                        style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', appearance: 'none', cursor: 'pointer' }}
                      >
                        <option value="">Selecione uma cidade</option>
                        {availableCities.map(city => (
                          <option key={city.codigo_ibge} value={city.nome}>{city.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ color: '#ccc', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Rua</label>
                      <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="Rua" style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ color: '#ccc', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Número</label>
                      <input type="text" value={number} onChange={e => setNumber(e.target.value)} placeholder="123" style={{ width: '100%', height: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="editar-group" style={{ marginTop: '20px' }}>
              <label>Descrição</label>

              <textarea
                rows={5}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="editar-buttons">
              <button
                className="editar-cancelar"
                onClick={() => navigate('/perfil')}
                disabled={submitting}
              >
                Cancelar
              </button>

              <BotaoGenerico 
                buttonClassName="editar-salvar"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Salvando...' : 'Salvar alterações'}
              </BotaoGenerico>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarProduto;