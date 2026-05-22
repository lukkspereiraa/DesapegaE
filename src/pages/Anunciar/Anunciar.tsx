import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ImagePlus, MapPin } from 'lucide-react';

import BotaoGenerico from '../../components/BotaoGenerico';
import { trpc } from '../../lib/trpc';
import { uploadProductImages } from '../../lib/uploads';

import './Anunciar.css';

const Anunciar: React.FC = () => {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('Tecnologia');
  const [estado, setEstado] = useState('Seminovo');
  const [tipoOpen, setTipoOpen] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [imagem, setImagem] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const categoryIdByName: Record<string, number> = {
    Tecnologia: 1,
    Roupas: 2,
    Móveis: 3,
    Eletrônicos: 4,
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

    if (!imagem) {
      setError('Selecione uma imagem.');
      return;
    }

    try {
      setSubmitting(true);

      const uploadedImages = await uploadProductImages([imagem]);

      await createProduct.mutateAsync({
        title: titulo.trim(),
        description: titulo.trim(),
        price: Math.round(valorNormalizado * 100),
        conditions: estado,
        categoryId: categoryIdByName[tipo] ?? 1,
        pictures: uploadedImages,
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

  return (
    <div className="anunciar-page">
      <button
        onClick={() => navigate('/perfil')}
        className="anunciar-voltar"
      >
        ← Voltar
      </button>

      <div className="anunciar-glow-left" />
      <div className="anunciar-glow-right" />

      <div className="anunciar-card">
        <h1 className="anunciar-title">
          Anunciar Item
        </h1>

        <label className="anunciar-label">
          Título do Desapego
        </label>

        <input
          type="text"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="Monitor gamer AOC 144hz"
          className="anunciar-input"
        />

        <label className="anunciar-label">
          Endereço via GPS
        </label>

        <button className="anunciar-gps-button">
          <MapPin size={28} />
          <span>Clique Para obter localização</span>
        </button>

        <label className="anunciar-label">
          Galeria Visual
        </label>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="anunciar-hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setImagem(file);
          }}
        />

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="anunciar-upload"
        >
          <ImagePlus size={30} />
          <span>
            {imagem ? imagem.name : 'Selecione a Coleção de fotos do Produto'}
          </span>
        </button>

        <div className="anunciar-row">
          <div className="anunciar-select-area">
            <label className="anunciar-label">
              Tipo da Coleção
            </label>

            <button
              type="button"
              onClick={() => setTipoOpen(!tipoOpen)}
              className="anunciar-select"
            >
              {tipo}
              <ChevronDown size={28} />
            </button>

            {tipoOpen && (
              <div className="anunciar-menu">
                {['Tecnologia', 'Roupas', 'Móveis', 'Eletrônicos'].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setTipo(item);
                        setTipoOpen(false);
                      }}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="anunciar-select-area">
            <label className="anunciar-label">
              Estado
            </label>

            <button
              type="button"
              onClick={() => setEstadoOpen(!estadoOpen)}
              className="anunciar-select"
            >
              {estado}
              <ChevronDown size={28} />
            </button>

            {estadoOpen && (
              <div className="anunciar-menu">
                {['Seminovo', 'Novo', 'Usado'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setEstado(item);
                      setEstadoOpen(false);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <label className="anunciar-label">
          Valor Sugerido
        </label>

        <input
          type="number"
          value={valor}
          onChange={(event) => setValor(event.target.value)}
          placeholder="R$ 0,00"
          min="0"
          step="0.01"
          className="anunciar-input"
        />

        <div className="anunciar-submit">
          <BotaoGenerico
            onClick={handleSubmit}
            className="anunciar-botao-publicar"
          >
            {submitting ? 'Publicando...' : 'Publicar no DesapegaÊ'}
          </BotaoGenerico>
        </div>

        {error && (
          <p className="anunciar-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Anunciar;