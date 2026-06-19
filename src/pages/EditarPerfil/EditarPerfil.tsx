import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

import { trpc } from '../../lib/trpc';
import { uploadProfileImage } from '../../lib/uploads';
import {
  getAuthSession,
  saveAuthSession,
} from '../../lib/session';
import { fetchAddressFromCEP, fetchStates, fetchCities, StateResponse, CityResponse } from '../../lib/address';

import './EditarPerfil.css';

const EditarPerfil: React.FC = () => {
  const navigate = useNavigate();

  const utils = trpc.useUtils();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [cep, setCep] = useState('');
  const [estado, setEstado] = useState('');
  const [stateName, setStateName] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');

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
    if (estado) {
      fetchCities(estado).then(data => {
        const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
        setAvailableCities(sorted);
      });
    } else {
      setAvailableCities([]);
    }
  }, [estado]);

  const [avatarPreviewUrl, setAvatarPreviewUrl] =
    useState<string | null>(null);

  const [selectedAvatarFile, setSelectedAvatarFile] =
    useState<File | null>(null);

  const [shouldRemoveAvatar, setShouldRemoveAvatar] =
    useState(false);

  const avatarInputRef =
    useRef<HTMLInputElement>(null);

  const avatarObjectUrlRef =
    useRef<string | null>(null);

  const profileQuery =
    trpc.user.profile.useQuery();

  const updateMutation =
    trpc.user.updateProfile.useMutation({
      onSuccess: async (updatedUser) => {
        const currentSession =
          getAuthSession();

        if (currentSession) {
          saveAuthSession({
            ...currentSession,
            user: updatedUser,
          });
        }

        await Promise.all([
          utils.user.profile.invalidate(),
          utils.auth.me.invalidate(),
        ]);

        navigate('/perfil');
      },
    });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(
        avatarObjectUrlRef.current
      );

      avatarObjectUrlRef.current = null;
    }

    setNome(profileQuery.data.name ?? '');
    setEmail(profileQuery.data.email ?? '');
    setTelefone(profileQuery.data.phone ?? '');
    setInstagram(
      profileQuery.data.instagram ?? ''
    );

    setAvatarPreviewUrl(
      profileQuery.data.avatarUrl ?? null
    );

    setSelectedAvatarFile(null);

    setShouldRemoveAvatar(false);

    setEstado(
      profileQuery.data?.address?.stateCode ??
        ''
    );

    setStateName(
      profileQuery.data?.address?.stateName ??
        ''
    );

    setCep(
      profileQuery.data?.address?.postalCode ??
        ''
    );

setCidade(
  profileQuery.data?.address?.cityName ??
    ''
);

setBairro(
  profileQuery.data?.address?.neighborhood ??
    ''
);

setRua(
  profileQuery.data?.address?.street ??
    ''
);

setNumero(
  profileQuery.data?.address?.number ??
    ''
);

setComplemento(
  profileQuery.data?.address?.complement ??
    ''
);
  }, [profileQuery.data]);

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
          setEstado(data.state);
          setStateName(data.state);
          setCidade(data.city);
          setBairro(data.neighborhood);
          setRua(data.street);
        }
      } catch {
        // ignore
      } finally {
        setFetchingCep(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(
          avatarObjectUrlRef.current
        );

        avatarObjectUrlRef.current = null;
      }
    };
  }, []);

  const handleAvatarSelected = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(
        avatarObjectUrlRef.current
      );

      avatarObjectUrlRef.current = null;
    }

    const objectUrl =
      URL.createObjectURL(file);

    avatarObjectUrlRef.current = objectUrl;

    setSelectedAvatarFile(file);

    setAvatarPreviewUrl(objectUrl);

    setShouldRemoveAvatar(false);
  };

  const handleRemoveAvatar = () => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(
        avatarObjectUrlRef.current
      );

      avatarObjectUrlRef.current = null;
    }

    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }

    setSelectedAvatarFile(null);

    setAvatarPreviewUrl(null);

    setShouldRemoveAvatar(true);
  };

  const handleSave = async () => {
    try {
      let avatarBlobId:
        | number
        | null
        | undefined;

      if (selectedAvatarFile) {
        const avatarPayload =
          await uploadProfileImage(
            selectedAvatarFile
          );

        avatarBlobId =
          avatarPayload.blobId;
      } else if (shouldRemoveAvatar) {
        avatarBlobId = null;
      }

      await updateMutation.mutateAsync({
        name: nome.trim(),

        email: email
          .trim()
          .toLowerCase(),

        phone: telefone.trim(),

        instagram:
          instagram.trim() || null,

        avatarBlobId,

        address: {
          stateCode: estado.trim(),
          stateName: stateName.trim() || estado.trim(),
          cityName: cidade.trim(),
          neighborhood: bairro.trim(),
          postalCode: cep.trim(),
          street: rua.trim() || undefined,
          number: numero.trim() || undefined,
          complement: complemento.trim() || undefined,
        },
      });
    } catch {
      //
    }
  };

  const initials =
    nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (chunk) =>
          chunk[0]?.toUpperCase() ?? ''
      )
      .join('') || 'U';

  return (
    <div className="editar-perfil-page">

      <div className="editar-perfil-purple-glow" />

      <div className="editar-perfil-blue-glow" />

      <div className="editar-perfil-card">

        <h1 className="editar-perfil-title">
          Editar <span>Perfil</span>
        </h1>

        <div className="editar-perfil-avatar-wrapper">

          <div className="editar-perfil-avatar-container">

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="editar-perfil-avatar-input"
              onChange={
                handleAvatarSelected
              }
            />

            <div className="editar-perfil-avatar">

              {avatarPreviewUrl ? (
                <img
                  src={avatarPreviewUrl}
                  alt="Avatar"
                />
              ) : (
                initials
              )}

            </div>

            <button
              type="button"
              onClick={() =>
                avatarInputRef.current?.click()
              }
              className="editar-perfil-camera-button"
            >
              <Camera size={18} />
            </button>

          </div>
        </div>

        {(avatarPreviewUrl ||
          selectedAvatarFile ||
          shouldRemoveAvatar) && (
          <div className="editar-perfil-remove-photo">

            <button
              type="button"
              onClick={
                handleRemoveAvatar
              }
            >
              Remover foto
            </button>

          </div>
        )}

        {selectedAvatarFile && (
          <p className="editar-perfil-file-name">
            Arquivo selecionado:{' '}
            {selectedAvatarFile.name}
          </p>
        )}

        {shouldRemoveAvatar &&
          !selectedAvatarFile && (
            <p className="editar-perfil-warning">
              A foto de perfil será
              removida ao salvar.
            </p>
          )}

        <div className="editar-perfil-form">

          <div className="editar-perfil-field full">

            <label>
              Nome completo
            </label>

            <input
              type="text"
              value={nome}
              onChange={(event) =>
                setNome(
                  event.target.value
                )
              }
            />

          </div>

          <div className="editar-perfil-field full">

            <label>E-mail</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
            />

          </div>

          <div className="editar-perfil-field">

            <label>
              Telefone & Whatsapp
            </label>

            <input
              type="text"
              value={telefone}
              onChange={(event) =>
                setTelefone(
                  event.target.value
                )
              }
            />

          </div>



<div className="editar-perfil-field">
  <label>CEP</label>

  <input
    type="text"
    value={cep}
    onChange={handleCepChange}
  />
</div>

<div className="editar-perfil-field">
  <label>Estado</label>

  <select
    value={estado}
    onChange={(e) => {
      const newCode = e.target.value;
      setEstado(newCode);
      const st = availableStates.find(s => s.sigla === newCode);
      if (st) setStateName(st.nome);
      setCidade('');
    }}
  >
    <option value="">Selecione</option>
    {availableStates.map(state => (
      <option key={state.id} value={state.sigla}>{state.sigla}</option>
    ))}
  </select>
</div>

<div className="editar-perfil-field">
  <label>Cidade</label>

  <select
    value={cidade}
    onChange={(e) => setCidade(e.target.value)}
    disabled={!estado || availableCities.length === 0}
  >
    <option value="">Selecione</option>
    {availableCities.map(city => (
      <option key={city.codigo_ibge} value={city.nome}>{city.nome}</option>
    ))}
  </select>
</div>

<div className="editar-perfil-field">
  <label>Bairro</label>

  <input
    type="text"
    value={bairro}
    onChange={(e) =>
      setBairro(e.target.value)
    }
  />
</div>

<div className="editar-perfil-field">
  <label>Rua</label>

  <input
    type="text"
    value={rua}
    onChange={(e) =>
      setRua(e.target.value)
    }
  />
</div>

<div className="editar-perfil-field">
  <label>Número</label>

  <input
    type="text"
    value={numero}
    onChange={(e) =>
      setNumero(e.target.value)
    }
  />
</div>

<div className="editar-perfil-field full">
  <label>Complemento</label>

  <input
    type="text"
    value={complemento}
    onChange={(e) =>
      setComplemento(e.target.value)
    }
  />
</div>

        </div>

        {profileQuery.isLoading && (
          <p className="editar-perfil-loading">
            Carregando perfil...
          </p>
        )}

        {(profileQuery.error ||
          updateMutation.error) && (
          <p className="editar-perfil-error">
            {profileQuery.error
              ?.message ??
              updateMutation.error
                ?.message}
          </p>
        )}

        <div className="editar-perfil-actions">

          <button
            onClick={() =>
              navigate('/perfil')
            }
            className="editar-perfil-cancelar"
          >
            CANCELAR
          </button>

          <div className="editar-perfil-salvar-wrapper">

            <button
              onClick={handleSave}
              className="editar-perfil-salvar"
            >
              {updateMutation.isPending
                ? 'SALVANDO...'
                : 'SALVAR'}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EditarPerfil;