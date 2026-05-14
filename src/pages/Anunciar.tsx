import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ImagePlus, MapPin, Trash2 } from 'lucide-react';
import BotaoGenerico from '../components/BotaoGenerico';
import { isAuthenticated } from '../lib/session';
import { trpc } from '../lib/trpc';
import { uploadProductImages } from '../lib/uploads';

const categoryOptions = [
  { id: 1, label: 'Tecnologia' },
  { id: 2, label: 'Roupas' },
  { id: 3, label: 'Móveis' },
  { id: 4, label: 'Eletrônicos' },
];

const categoryIdByName = Object.fromEntries(categoryOptions.map((option) => [option.label, option.id]));
const categoryNameById = Object.fromEntries(categoryOptions.map((option) => [option.id, option.label]));

type EditLocationState = {
  productId?: number;
};

type ProductImageItem = {
  id: string;
  url: string;
  blobId?: number;
  file?: File;
  isNew: boolean;
};

const maxProductImages = 10;
const fallbackProductImage = 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=800';

function createImageItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function revokePreviewUrlIfNeeded(item: ProductImageItem): void {
  if (item.isNew && item.url.startsWith('blob:')) {
    URL.revokeObjectURL(item.url);
  }
}

function revokePreviewUrls(items: ProductImageItem[]): void {
  for (const item of items) {
    revokePreviewUrlIfNeeded(item);
  }
}

const Anunciar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const utils = trpc.useUtils();

  const state = (location.state as EditLocationState | null) ?? null;
  const productIdFromState = Number(state?.productId);
  const isEditMode = Number.isInteger(productIdFromState) && productIdFromState > 0;

  const [estadoOpen, setEstadoOpen] = useState(false);
  const [estado, setEstado] = useState('Seminovo');

  const [tipoOpen, setTipoOpen] = useState(false);
  const [tipo, setTipo] = useState('Tecnologia');

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [imageItems, setImageItems] = useState<ProductImageItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageItemsRef = useRef<ProductImageItem[]>([]);

  const productQuery = trpc.product.byId.useQuery(
    { id: productIdFromState },
    {
      enabled: isEditMode,
    },
  );

  const createProduct = trpc.product.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.product.listPublic.invalidate(),
        utils.product.myAds.invalidate(),
      ]);
      setSuccess('Anuncio publicado com sucesso.');
      navigate('/perfil');
    },
  });

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.product.listPublic.invalidate(),
        utils.product.myAds.invalidate(),
        utils.product.byId.invalidate({ id: data.id }),
      ]);
      setSuccess('Anuncio atualizado com sucesso.');
      navigate('/perfil');
    },
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/anunciar' }, replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    imageItemsRef.current = imageItems;
  }, [imageItems]);

  useEffect(() => {
    return () => {
      revokePreviewUrls(imageItemsRef.current);
    };
  }, []);

  useEffect(() => {
    if (!productQuery.data) {
      return;
    }

    setTitulo(productQuery.data.title);
    setDescricao(productQuery.data.description);
    setValor((productQuery.data.price / 100).toString());
    setImageItems((current) => {
      revokePreviewUrls(current);

      return productQuery.data.pictures.map((picture) => ({
        id: `existing-${picture.id}`,
        url: picture.url,
        blobId: picture.blobId ?? undefined,
        isNew: false,
      }));
    });
    setEstado(productQuery.data.conditions || 'Seminovo');
    setTipo(categoryNameById[productQuery.data.categoryId] ?? 'Tecnologia');
  }, [productQuery.data]);

  const handleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!selectedFiles.length) {
      return;
    }

    setError(null);

    setImageItems((current) => {
      const remainingSlots = maxProductImages - current.length;
      if (remainingSlots <= 0) {
        setError(`Voce pode adicionar no maximo ${maxProductImages} imagens.`);
        return current;
      }

      const filesToAdd = selectedFiles.slice(0, remainingSlots);
      if (filesToAdd.length < selectedFiles.length) {
        setError(`Limite de ${maxProductImages} imagens atingido. Apenas ${filesToAdd.length} imagem(ns) adicionada(s).`);
      }

      const newItems = filesToAdd.map((file) => ({
        id: `new-${createImageItemId()}`,
        url: URL.createObjectURL(file),
        file,
        isNew: true,
      }));

      return [...current, ...newItems];
    });
  };

  const handleRemoveImage = (itemId: string) => {
    setImageItems((current) => {
      const imageToRemove = current.find((item) => item.id === itemId);
      if (!imageToRemove) {
        return current;
      }

      revokePreviewUrlIfNeeded(imageToRemove);
      return current.filter((item) => item.id !== itemId);
    });
  };

  const handleMoveImage = (currentIndex: number, direction: 'left' | 'right') => {
    setImageItems((current) => {
      const nextIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const reordered = [...current];
      const [movedItem] = reordered.splice(currentIndex, 1);
      reordered.splice(nextIndex, 0, movedItem);
      return reordered;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setError(null);
    setSuccess(null);

    const tituloNormalizado = titulo.trim();
    const descricaoNormalizada = descricao.trim();

    if (!tituloNormalizado) {
      setError('Informe o titulo do anuncio.');
      return;
    }

    if (!descricaoNormalizada) {
      setError('Informe a descricao do anuncio.');
      return;
    }

    const valorNormalizado = Number(valor.replace(',', '.'));
    if (!Number.isFinite(valorNormalizado) || valorNormalizado < 0) {
      setError('Informe um valor valido.');
      return;
    }

    try {
      setSubmitting(true);

      const categoryId = categoryIdByName[tipo] ?? 1;
      const newImagesToUpload = imageItems
        .filter((item) => item.isNew && item.file)
        .map((item) => item.file as File);

      const uploadedNewImages = newImagesToUpload.length
        ? await uploadProductImages(newImagesToUpload)
        : [];

      let uploadCursor = 0;
      const orderedPictures = imageItems.map((item) => {
        if (item.isNew) {
          const uploadedImage = uploadedNewImages[uploadCursor];
          uploadCursor += 1;

          if (!uploadedImage) {
            throw new Error('Falha ao processar o upload das imagens.');
          }

          return uploadedImage;
        }

        return {
          url: item.url,
          blobId: item.blobId,
        };
      });

      const picturesPayload = isEditMode
        ? orderedPictures
        : orderedPictures.length
          ? orderedPictures
          : undefined;

      if (!isEditMode && !picturesPayload?.length) {
        setError('Adicione pelo menos uma imagem para o anuncio.');
        setSubmitting(false);
        return;
      }

      const payload = {
        title: tituloNormalizado,
        description: descricaoNormalizada,
        price: Math.round(valorNormalizado * 100),
        conditions: estado,
        categoryId,
        pictures: picturesPayload,
      };

      if (isEditMode) {
        await updateProduct.mutateAsync({
          id: productIdFromState,
          ...payload,
        });
      } else {
        await createProduct.mutateAsync(payload);
      }
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : 'Nao foi possivel salvar o anuncio.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020513] overflow-hidden flex items-center justify-center px-4">

      {/* BOTÃO VOLTAR */}
      <button
        onClick={() => navigate('/perfil')}
        className="absolute top-6 left-6 text-white/40 hover:text-white text-sm transition-all z-20"
      >
        ← Voltar
      </button>

      {/* FUNDO */}
      <div className="absolute left-[18%] top-[32%] w-80 h-80 bg-liquid-purple/35 rounded-full blur-[120px]" />
      <div className="absolute right-[18%] bottom-[25%] w-80 h-80 bg-electric-blue/25 rounded-full blur-[120px]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-[560px] min-h-[640px] 
        rounded-[56px] px-12 py-8
        bg-[#111942]/85 
        border border-white/15
        shadow-[0_45px_90px_rgba(0,0,0,0.9)]
        flex flex-col">

        <h1 className="text-[31px] font-black text-center text-white/75 mb-3">
          {isEditMode ? 'Editar Anuncio' : 'Anunciar Item'}
        </h1>

        {isEditMode && productQuery.isLoading && (
          <p className="text-center text-white/50 text-sm font-black mb-3">
            Carregando dados do anuncio...
          </p>
        )}

        {isEditMode && productQuery.error && (
          <p className="text-center text-red-400 text-sm font-black mb-3">
            {productQuery.error.message}
          </p>
        )}

        {/* TÍTULO */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Título do Desapego
        </label>
        <input
          type="text"
          placeholder="Ex: Monitor gamer AOC 144hz"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          className="h-[52px] rounded-xl px-6 mb-4
          bg-[#111735]/90 border border-liquid-purple/80
          text-white text-[12px] font-black placeholder-white/40 outline-none
          shadow-[0_0_18px_rgba(168,85,247,0.45)]"
        />

        {/* DESCRIÇÃO */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Descrição
        </label>
        <textarea
          placeholder="Descreva o item, estado de uso e detalhes importantes"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          className="h-[100px] rounded-xl px-6 py-4 mb-4
          bg-[#111735]/90 border border-white/25
          text-white text-[12px] font-black placeholder-white/40 outline-none
          resize-none"
        />

        {/* GPS */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Endereço via GPS
        </label>
        <button className="h-[52px] rounded-xl mb-4 border-2 border-dashed border-liquid-purple
          flex items-center justify-center gap-3 text-white">
          <MapPin size={26} />
          <span className="text-[12px] font-black">
            Clique para obter localização
          </span>
        </button>

        {/* GALERIA */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Galeria Visual
        </label>
        <div className="mb-4 rounded-xl border border-dashed border-white/25 bg-[#111735]/90 p-3">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleSelectImages}
          />

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="w-full h-[52px] rounded-xl border border-white/25 flex items-center justify-center gap-3 text-white hover:bg-white/5 transition-all"
          >
            <ImagePlus size={18} />
            <span className="text-[12px] font-black">Adicionar fotos do dispositivo</span>
          </button>

          <p className="mt-2 text-white/65 text-[11px] font-black">
            {imageItems.length}/{maxProductImages} imagem(ns). Use as setas para mudar a ordem e a lixeira para remover.
          </p>

          {imageItems.length === 0 ? (
            <p className="mt-3 text-white/45 text-[11px] font-black text-center border border-white/10 rounded-xl py-5 px-3">
              Nenhuma imagem adicionada ainda.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imageItems.map((item, index) => (
                <div key={item.id} className="rounded-xl overflow-hidden border border-white/15 bg-[#0d1435]">
                  <div className="relative aspect-square">
                    <img
                      src={item.url}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(event) => {
                        const image = event.currentTarget;
                        image.onerror = null;
                        image.src = fallbackProductImage;
                      }}
                    />

                    <span className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-black bg-black/65 text-white">
                      #{index + 1}
                    </span>

                    {item.isNew && (
                      <span className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-black bg-electric-blue/80 text-white">
                        Nova
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 p-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, 'left')}
                      disabled={index === 0}
                      className="h-8 rounded-lg border border-white/20 text-white flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                      title="Mover para a esquerda"
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveImage(index, 'right')}
                      disabled={index === imageItems.length - 1}
                      className="h-8 rounded-lg border border-white/20 text-white flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                      title="Mover para a direita"
                    >
                      <ChevronRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(item.id)}
                      className="h-8 rounded-lg border border-red-300/35 text-red-200 flex items-center justify-center hover:bg-red-500/15 transition-all"
                      title="Remover imagem"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DROPDOWNS */}
        <div className="grid grid-cols-2 gap-16 mb-4">

          {/* TIPO */}
          <div className="flex flex-col relative">
            <label className="text-white/50 text-[11px] font-black mb-1">
              Tipo da Coleção
            </label>

            <button
              onClick={() => setTipoOpen(!tipoOpen)}
              className="h-[45px] rounded-xl px-4 bg-[#111735]/90 border border-white/25
              text-white text-[12px] font-black flex justify-between items-center"
            >
              {tipo}
              {tipoOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {tipoOpen && (
              <div className="absolute bottom-[52px] w-full rounded-xl overflow-hidden
                bg-gradient-to-b from-liquid-purple to-[#a84df5]
                shadow-[0_0_30px_rgba(168,85,247,0.75)] z-50">
                {categoryOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setTipo(option.label);
                      setTipoOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white text-[12px] font-black
                    border-b border-white/10 last:border-none hover:bg-white/10"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ESTADO */}
          <div className="flex flex-col relative">
            <label className="text-white/50 text-[11px] font-black mb-1">
              Estado
            </label>

            <button
              onClick={() => setEstadoOpen(!estadoOpen)}
              className="h-[45px] rounded-xl px-4 bg-[#111735]/90 border border-white/25
              text-white text-[12px] font-black flex justify-between items-center"
            >
              {estado}
              {estadoOpen ? <ChevronUp /> : <ChevronDown />}
            </button>

            {estadoOpen && (
              <div className="absolute bottom-[52px] w-full rounded-xl overflow-hidden
                bg-gradient-to-b from-liquid-purple to-[#a84df5]
                shadow-[0_0_30px_rgba(168,85,247,0.75)] z-50">
                {['Usado', 'Novo', 'Seminovo'].map(item => (
                  <button
                    key={item}
                    onClick={() => {
                      setEstado(item);
                      setEstadoOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white text-[12px] font-black
                    border-b border-white/10 last:border-none hover:bg-white/10"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* VALOR */}
        <label className="text-white/50 text-[11px] font-black mb-1">
          Valor Sugerido
        </label>
        <input
          type="number"
          placeholder="R$ 0,00"
          value={valor}
          onChange={(event) => setValor(event.target.value)}
          min="0"
          step="0.01"
          className="h-[52px] rounded-xl px-6 mb-6
          bg-[#111735]/90 border border-white/25
          text-white text-[12px] font-black placeholder-white/40 outline-none"
        />

        {/* BOTÃO PUBLICAR */}
        <div className="flex justify-center mt-2">
          <BotaoGenerico
            onClick={handleSubmit}
            className="px-12 py-4 text-xl"
          >
            {submitting
              ? 'Salvando...'
              : isEditMode
                ? 'Salvar alteracoes'
                : 'Publicar no Desapega'}
            <span>Ê</span>
          </BotaoGenerico>
        </div>

        {error && (
          <p className="mt-4 text-center text-red-400 text-sm font-black">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-4 text-center text-green-400 text-sm font-black">
            {success}
          </p>
        )}

      </div>
    </div>
  );
};

export default Anunciar;