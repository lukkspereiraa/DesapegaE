import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Image, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import BotaoGenerico from '../components/BotaoGenerico';
import { isAuthenticated } from '../lib/session';
import { trpc } from '../lib/trpc';

const categoryOptions = [
  { id: 1, label: 'Tecnologia' },
  { id: 2, label: 'Roupas' },
  { id: 3, label: 'Móveis' },
  { id: 4, label: 'Eletrônicos' },
];

const categoryIdByName = Object.fromEntries(categoryOptions.map((option) => [option.label, option.id]));
const categoryNameById = Object.fromEntries(categoryOptions.map((option) => [option.id, option.label]));

const parsePictureUrls = (value: string) => value
  .split(/[\n,]+/)
  .map((item) => item.trim())
  .filter(Boolean);

type EditLocationState = {
  productId?: number;
};

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
  const [urlsFotos, setUrlsFotos] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    if (!productQuery.data) {
      return;
    }

    setTitulo(productQuery.data.title);
    setDescricao(productQuery.data.description);
    setValor((productQuery.data.price / 100).toString());
    setUrlsFotos(productQuery.data.pictures.map((picture) => picture.url).join('\n'));
    setEstado(productQuery.data.conditions || 'Seminovo');
    setTipo(categoryNameById[productQuery.data.categoryId] ?? 'Tecnologia');
  }, [productQuery.data]);

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

    const categoryId = categoryIdByName[tipo] ?? 1;
    const pictures = parsePictureUrls(urlsFotos);

    const payload = {
      title: tituloNormalizado,
      description: descricaoNormalizada,
      price: Math.round(valorNormalizado * 100),
      conditions: estado,
      categoryId,
      pictures: pictures.length ? pictures : undefined,
    };

    setSubmitting(true);

    try {
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
        <div className="relative mb-4">
          <div className="absolute left-4 top-3 text-white/40">
            <Image size={18} />
          </div>
          <textarea
            placeholder="Cole links das fotos separados por virgula ou quebra de linha"
            value={urlsFotos}
            onChange={(event) => setUrlsFotos(event.target.value)}
            className="h-[80px] w-full rounded-xl px-10 py-3
            bg-[#111735]/90 border border-dashed border-white/25
            text-white text-[12px] font-black placeholder-white/40 outline-none
            resize-none"
          />
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