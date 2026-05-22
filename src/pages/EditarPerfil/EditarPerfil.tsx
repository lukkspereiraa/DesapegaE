import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

import { trpc } from '../../lib/trpc';
import { uploadProfileImage } from '../../lib/uploads';
import {
  getAuthSession,
  saveAuthSession,
} from '../../lib/session';

import './EditarPerfil.css';

const EditarPerfil: React.FC = () => {
  const navigate = useNavigate();

  const utils = trpc.useUtils();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');

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
  }, [profileQuery.data]);

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

          <div className="editar-perfil-field">

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

          <div className="editar-perfil-field">

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

            <label>Instagram</label>

            <input
              type="text"
              value={instagram}
              onChange={(event) =>
                setInstagram(
                  event.target.value
                )
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