import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { uploadProfileImage } from '../lib/uploads';
import { getAuthSession, saveAuthSession } from '../lib/session';

const EditarPerfil: React.FC = () => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);

  const profileQuery = trpc.user.profile.useQuery();

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: async (updatedUser) => {
      const currentSession = getAuthSession();
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
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    setNome(profileQuery.data.name ?? '');
    setEmail(profileQuery.data.email ?? '');
    setTelefone(profileQuery.data.phone ?? '');
    setInstagram(profileQuery.data.instagram ?? '');
    setAvatarPreviewUrl(profileQuery.data.avatarUrl ?? null);
    setSelectedAvatarFile(null);
    setShouldRemoveAvatar(false);
  }, [profileQuery.data]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }
    };
  }, []);

  const handleAvatarSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = objectUrl;

    setSelectedAvatarFile(file);
    setAvatarPreviewUrl(objectUrl);
    setShouldRemoveAvatar(false);
  };

  const handleRemoveAvatar = () => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
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
      let avatarPayload: { url: string; blobId: number } | undefined;
      let avatarBlobId: number | null | undefined;

      if (selectedAvatarFile) {
        avatarPayload = await uploadProfileImage(selectedAvatarFile);
        avatarBlobId = avatarPayload.blobId;
      } else if (shouldRemoveAvatar) {
        avatarBlobId = null;
      }

      await updateMutation.mutateAsync({
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        phone: telefone.trim(),
        instagram: instagram.trim() || null,
        avatarBlobId,
      });
    } catch {
      // Error already exposed by mutation state.
    }
  };

  const initials = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  return (
    <div className="relative min-h-screen w-full bg-[#020513] overflow-hidden flex items-center justify-center px-4">

      {/* FUNDO (SEM CÍRCULO BUGADO) */}
      <div className="absolute right-[10%] bottom-[10%] w-96 h-96 bg-liquid-purple/30 rounded-full blur-[120px]" />
      <div className="absolute left-[10%] top-[10%] w-80 h-80 bg-electric-blue/20 rounded-full blur-[120px]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-[520px] rounded-[36px] px-9 py-8
        bg-[#120f2b]/90 border border-white/10 
        shadow-[0_45px_90px_rgba(0,0,0,0.85)]">

        {/* TÍTULO */}
        <h1 className="text-3xl font-black text-center text-white mb-7">
          Editar <span className="text-liquid-purple">Perfil</span>
        </h1>

        {/* FOTO */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelected}
            />

            <div className="w-36 h-36 rounded-full border-[6px] border-liquid-purple 
              flex items-center justify-center text-white text-6xl font-light 
              shadow-[0_0_35px_rgba(168,85,247,0.75)] overflow-hidden bg-[#080b1d]">
              {avatarPreviewUrl ? (
                <img
                  src={avatarPreviewUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-11 h-11 rounded-full 
              bg-white/30 border border-white/50 
              flex items-center justify-center text-white">
              <Camera size={20} />
            </button>
          </div>
        </div>

        {(avatarPreviewUrl || selectedAvatarFile || shouldRemoveAvatar) && (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="px-4 py-2 rounded-xl border border-red-300/40 text-red-200 text-xs font-black hover:bg-red-500/15 transition-all"
            >
              Remover foto
            </button>
          </div>
        )}

        {selectedAvatarFile && (
          <p className="text-center text-white/60 text-xs font-black mb-4">
            Arquivo selecionado: {selectedAvatarFile.name}
          </p>
        )}

        {shouldRemoveAvatar && !selectedAvatarFile && (
          <p className="text-center text-yellow-300 text-xs font-black mb-4">
            A foto de perfil sera removida ao salvar.
          </p>
        )}

        {/* INPUTS */}
        <div className="flex flex-col gap-4">

          <div>
            <label className="text-white font-black text-sm block mb-1">
              Nome completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="w-full h-12 px-5 rounded-xl bg-[#111735]/90 border border-white/25
              text-white outline-none focus:border-liquid-purple transition-all"
            />
          </div>

          <div>
            <label className="text-white font-black text-sm block mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full h-12 px-5 rounded-xl bg-[#111735]/90 border border-white/25
              text-white outline-none focus:border-liquid-purple transition-all"
            />
          </div>

          <div>
            <label className="text-white font-black text-sm block mb-1">
              Telefone & Whatsapp
            </label>
            <input
              type="text"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              className="w-full h-12 px-5 rounded-xl bg-[#111735]/90 border border-white/25
              text-white outline-none focus:border-liquid-purple transition-all"
            />
          </div>

          <div>
            <label className="text-white font-black text-sm block mb-1">
              Instagram
            </label>
            <input
              type="text"
              value={instagram}
              onChange={(event) => setInstagram(event.target.value)}
              className="w-full h-12 px-5 rounded-xl bg-[#111735]/90 border border-white/25
              text-white outline-none focus:border-liquid-purple transition-all"
            />
          </div>

        </div>

        {profileQuery.isLoading && (
          <p className="text-center text-white/50 text-sm font-black mt-4">
            Carregando perfil...
          </p>
        )}

        {(profileQuery.error || updateMutation.error) && (
          <p className="text-center text-red-400 text-sm font-black mt-4">
            {profileQuery.error?.message ?? updateMutation.error?.message}
          </p>
        )}

        
        {/* BOTÕES */}
        <div className="grid grid-cols-2 gap-6 mt-8">

        <button
            onClick={() => navigate('/perfil')}
            className="h-14 w-full rounded-xl border border-white/30 text-white text-xl font-black flex items-center justify-center hover:bg-white/10 transition-all"
        >
            CANCELAR
        </button>

        <div className="h-14 w-full rounded-xl bg-gradient-to-r from-liquid-purple to-electric-blue shadow-[0_0_28px_rgba(168,85,247,0.75)] flex items-center justify-center">
            <button
          onClick={handleSave}
            className="w-full h-full flex items-center justify-center text-white text-xl font-black tracking-widest"
            >
          {updateMutation.isPending ? 'SALVANDO...' : 'SALVAR'}
            </button>
        </div>

        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;