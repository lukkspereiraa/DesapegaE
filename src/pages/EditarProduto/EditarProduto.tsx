import React, { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import BotaoGenerico from '../../components/BotaoGenerico';

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

const EditarProduto: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const inputRef = useRef<HTMLInputElement>(null);

  const produto = (location.state as ProdutoState) || {};

  const imagensIniciais = useMemo(
    () =>
      produto.imagens?.length
        ? produto.imagens
        : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab'],
    [produto.imagens]
  );

  const [imagens, setImagens] = useState<string[]>(imagensIniciais);
  const [imagemPrincipal, setImagemPrincipal] = useState<string>(
    imagensIniciais[0]
  );

  const trocarFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    const novaImagem = URL.createObjectURL(arquivo);

    setImagemPrincipal(novaImagem);

    setImagens((estadoAtual) => {
      const novas = [...estadoAtual];
      novas[0] = novaImagem;
      return novas;
    });
  };

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
              onChange={trocarFoto}
              hidden
            />

            <div
              className="editar-upload"
              onClick={() => inputRef.current?.click()}
              style={{
                backgroundImage: `url(${imagemPrincipal})`,
              }}
            >
              <div className="editar-upload-overlay">
                <div className="editar-upload-icon">↑</div>
                <p>Alterar Foto</p>
              </div>
            </div>

            <div className="editar-miniaturas">
              {imagens.map((imagem, index) => (
                <img
                  key={index}
                  src={imagem}
                  alt=""
                  onClick={() => setImagemPrincipal(imagem)}
                />
              ))}

              <div
                className="editar-add-foto"
                onClick={() => inputRef.current?.click()}
              >
                +
              </div>
            </div>

            <button className="editar-excluir">
              Excluir anúncio
            </button>
          </div>

          <div className="editar-right">
            <div className="editar-group">
              <label>Título do anúncio</label>

              <input
                type="text"
                value={produto.titulo || 'iPhone 13 Pro'}
                readOnly
              />
            </div>

            <div className="editar-group">
              <label>Preço</label>

              <input
                type="text"
                value={produto.preco || '3.850,00'}
                readOnly
              />
            </div>

            <div className="editar-grid">
              <div className="editar-group">
                <label>Tipo da Coleção</label>

                <select defaultValue={produto.categoria || 'Tecnologia'}>
                  <option>Tecnologia</option>
                  <option>Moda</option>
                  <option>Games</option>
                </select>
              </div>

              <div className="editar-group">
                <label>Estado</label>

                <select defaultValue={produto.estado || 'Seminovo'}>
                  <option>Novo</option>
                  <option>Seminovo</option>
                  <option>Usado</option>
                </select>
              </div>
            </div>

            <div className="editar-group">
              <label>Localização</label>

              <input
                type="text"
                value={produto.localizacao || 'Centro, Cedro'}
                readOnly
              />
            </div>

            <div className="editar-group">
              <label>Descrição</label>

              <textarea
                rows={5}
                defaultValue={
                  produto.descricao ||
                  'Aparelho em excelente estado de conservação. 128GB de memória, saúde da bateria em 88%. Acompanha caixa e cabo original. Sem marcas de uso.'
                }
              />
            </div>

            <div className="editar-buttons">
              <button
                className="editar-cancelar"
                onClick={() => navigate('/perfil')}
              >
                Cancelar
              </button>

              <BotaoGenerico buttonClassName="editar-salvar">
                Salvar alterações
              </BotaoGenerico>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarProduto;