import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Pencil,
  Shield,
} from 'lucide-react';

import { trpc } from '../../lib/trpc';

import './DadosPrivados.css';

const DadosPrivados: React.FC = () => {
  const navigate = useNavigate();

  const [modoEdicao, setModoEdicao] =
    useState(false);

  const [mostrarDados, setMostrarDados] =
    useState(false);

  const profileQuery =
    trpc.user.profile.useQuery(undefined, {
      retry: false,
    });

  const user = profileQuery.data;

  const [formData, setFormData] =
    useState({
      name: '',
      cpf: '',
      birthDate: '',
      phone: '',

      street: '',
      postalCode: '',
    });

  useEffect(() => {
    if (user?.address) {
      setFormData({
        name:
          user.name ?? '',

        cpf:
          '000.000.000-00',

        birthDate:
          '00/00/0000',

        phone:
          user.phone ?? '',

        street:
          user.address.street ?? '',

        postalCode:
          user.address
            .postalCode ?? '',
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const salvarAlteracoes = () => {
    console.log(formData);

    setModoEdicao(false);
  };

  const ocultarTexto = (
    valor?: string | null
  ) => {
    if (mostrarDados) {
      return valor || '-';
    }

    return '••••••••••';
  };

  return (
    <div className="dados-page">
      <div className="bg-blur purple" />

      <div className="bg-blur blue" />

      <div className="dados-container">
        <div className="dados-top">
          <div className="dados-title">
            <div className="shield-box">
              <Shield size={28} />
            </div>

            <div>
              <h1>
                Meus Dados Privados
              </h1>

              <p>
                Ambiente Seguro e
                Criptografado
              </p>
            </div>
          </div>

          <button
            className="mostrar-btn"
            onClick={() =>
              setMostrarDados(
                !mostrarDados
              )
            }
          >
            {mostrarDados ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}

            {mostrarDados
              ? 'Ocultar dados'
              : 'Mostrar dados'}
          </button>
        </div>

        {profileQuery.error && (
          <p className="dados-error">
            {
              profileQuery.error
                .message
            }
          </p>
        )}

        <div className="dados-grid">
          <div className="dados-coluna">
            <h2>
              Informações Pessoais
            </h2>

            <div className="dados-card">
              <label>
                Nome Completo
              </label>

              {modoEdicao ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={
                    handleChange
                  }
                  className="dados-input"
                />
              ) : (
                <span>
                  {ocultarTexto(
                    formData.name
                  )}
                </span>
              )}
            </div>

            <div className="dados-card">
              <label>CPF</label>

              {modoEdicao ? (
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={
                    handleChange
                  }
                  className="dados-input"
                />
              ) : (
                <span>
                  {ocultarTexto(
                    formData.cpf
                  )}
                </span>
              )}
            </div>

            <div className="dados-card">
              <label>
                Data de nascimento
              </label>

              {modoEdicao ? (
                <input
                  type="text"
                  name="birthDate"
                  value={
                    formData.birthDate
                  }
                  onChange={
                    handleChange
                  }
                  className="dados-input"
                />
              ) : (
                <span>
                  {ocultarTexto(
                    formData.birthDate
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="dados-coluna">
            <h2>
              Endereço Privado
            </h2>

            <div className="dados-card">
              <label>
                Endereço principal
              </label>

              {modoEdicao ? (
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={
                    handleChange
                  }
                  className="dados-input"
                />
              ) : (
                <span>
                  {ocultarTexto(
                    formData.street
                  )}
                </span>
              )}
            </div>

            <div className="dados-card">
              <label>CEP</label>

              {modoEdicao ? (
                <input
                  type="text"
                  name="postalCode"
                  value={
                    formData.postalCode
                  }
                  onChange={
                    handleChange
                  }
                  className="dados-input"
                />
              ) : (
                <span>
                  {ocultarTexto(
                    formData.postalCode
                  )}
                </span>
              )}
            </div>

            <div className="dados-card">
              <label>
                Telefone principal
              </label>

              {modoEdicao ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={
                    handleChange
                  }
                  className="dados-input"
                />
              ) : (
                <span>
                  {ocultarTexto(
                    formData.phone
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="dados-actions">
          <button
            onClick={() =>
              navigate('/perfil')
            }
            className="btn-voltar-dados"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="dados-actions-right">
            <button className="btn-senha">
              <KeyRound size={18} />
              Alterar senha
            </button>

            <button
              onClick={() => {
                if (modoEdicao) {
                  salvarAlteracoes();

                  return;
                }

                setModoEdicao(true);
              }}
              className="btn-editar"
            >
              <Pencil size={18} />

              {modoEdicao
                ? 'Salvar alterações'
                : 'Editar meus dados'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DadosPrivados;