import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Building,
  User,
  MapPin,
  Mail,
  Phone,
  FileText,
  Save,
  ArrowLeft,
  MapPinned,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getDB, Cliente } from '../../lib/db';
import { generateUniqueId, formatCPFCNPJ, formatCEP } from '../../lib/utils';

interface ClienteFormData {
  nome: string;
  documento: string;
  tipo: 'residencial' | 'comercial' | 'industrial' | 'outro';
  tipoCustomizado?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone: string;
  email?: string;
  responsavel?: string;
  telefoneSec?: string;
  observacoes?: string;
}

export function NovoClientePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClienteFormData>({
    defaultValues: {
      nome: '',
      documento: '',
      tipo: 'residencial',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      telefone: '',
      email: '',
      responsavel: '',
      telefoneSec: '',
      observacoes: '',
    },
  });

  const selectedTipo = watch('tipo');

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsLoading(true);

      // Formatar dados
      const documentoFormatado = data.documento.replace(/\D/g, '');

      // Preparar objeto cliente
      const novoCliente: Cliente = {
        id: generateUniqueId(),
        nome: data.nome,
        documento: documentoFormatado,
        tipo: data.tipo,
        tipoCustomizado:
          data.tipo === 'outro' ? data.tipoCustomizado : undefined,
        cep: data.cep.replace(/\D/g, ''),
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        telefone: data.telefone.replace(/\D/g, ''),
        email: data.email,
        responsavel: data.responsavel,
        telefoneSec: data.telefoneSec?.replace(/\D/g, ''),
        observacoes: data.observacoes,
        dataCriacao: Date.now(),
        dataModificacao: Date.now(),
        sincronizado: false,
      };

      // Salvar no banco de dados
      const db = await getDB();
      await db.add('clientes', novoCliente);

      // Adicionar à fila de sincronização
      await db.add('sincronizacao', {
        id: generateUniqueId(),
        tabela: 'clientes',
        operacao: 'inserir',
        dados: novoCliente,
        tentativas: 0,
        dataModificacao: Date.now(),
      });

      // Redirecionar para a lista de clientes
      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Ocorreu um erro ao salvar o cliente. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const buscarCep = async (cep: string) => {
    if (!cep || cep.length < 8) return;

    setCepLoading(true);
    try {
      // Simular uma chamada de API (em produção, seria uma API real)
      // Esta é apenas uma simulação para demonstração
      // Em um ambiente de produção, usaria a API dos Correios ou ViaCEP

      const cepNumerico = cep.replace(/\D/g, '');

      if (cepNumerico === '01310100') {
        // Simular tempo de resposta da API
        await new Promise((resolve) => setTimeout(resolve, 700));

        setValue('logradouro', 'Avenida Paulista');
        setValue('bairro', 'Bela Vista');
        setValue('cidade', 'São Paulo');
        setValue('estado', 'SP');
      } else if (cepNumerico === '80250000') {
        await new Promise((resolve) => setTimeout(resolve, 700));

        setValue('logradouro', 'Rua das Flores');
        setValue('bairro', 'Centro');
        setValue('cidade', 'Curitiba');
        setValue('estado', 'PR');
      } else {
        // Se não for um dos CEPs de demonstração, não encontrou
        alert('CEP não encontrado. Por favor, preencha os dados manualmente.');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP. Por favor, preencha os dados manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    buscarCep(cep);
  };

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    e.target.value = formatCPFCNPJ(value);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    e.target.value = formatCEP(value);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
          <p className="text-gray-600">Cadastre um novo cliente no sistema</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => navigate('/clientes')}>
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Dados Básicos */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Dados Básicos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Nome / Razão Social *"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                  error={errors.nome?.message}
                  icon={<Building size={18} className="text-gray-400" />}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Input
                  label="CPF / CNPJ *"
                  {...register('documento', {
                    required: 'Documento é obrigatório',
                  })}
                  error={errors.documento?.message}
                  icon={<FileText size={18} className="text-gray-400" />}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  onChange={handleCpfCnpjChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Construção *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building size={18} className="text-gray-400" />
                  </div>
                  <select
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    {...register('tipo', { required: 'Tipo é obrigatório' })}
                  >
                    <option value="residencial">Residencial</option>
                    <option value="comercial">Comercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tipo.message}
                  </p>
                )}
              </div>
              {selectedTipo === 'outro' && (
                <div>
                  <Input
                    label="Tipo Customizado *"
                    {...register('tipoCustomizado', {
                      required:
                        selectedTipo === 'outro' ? 'Especifique o tipo' : false,
                    })}
                    error={errors.tipoCustomizado?.message}
                    placeholder="Especifique o tipo de construção"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Endereço
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="CEP *"
                  {...register('cep', { required: 'CEP é obrigatório' })}
                  error={errors.cep?.message}
                  icon={<MapPin size={18} className="text-gray-400" />}
                  placeholder="00000-000"
                  onChange={handleCepChange}
                  onBlur={handleCepBlur}
                  disabled={cepLoading}
                  className={cepLoading ? 'opacity-70' : ''}
                />
                {cepLoading && (
                  <p className="mt-1 text-sm text-blue-600">Buscando CEP...</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-2">
                <Input
                  label="Logradouro *"
                  {...register('logradouro', {
                    required: 'Logradouro é obrigatório',
                  })}
                  error={errors.logradouro?.message}
                  icon={<MapPinned size={18} className="text-gray-400" />}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div>
                <Input
                  label="Número *"
                  {...register('numero', { required: 'Número é obrigatório' })}
                  error={errors.numero?.message}
                  placeholder="Ex: 1000 ou S/N"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Input
                  label="Complemento"
                  {...register('complemento')}
                  placeholder="Apto, Bloco, etc."
                />
              </div>
              <div>
                <Input
                  label="Bairro *"
                  {...register('bairro', { required: 'Bairro é obrigatório' })}
                  error={errors.bairro?.message}
                  placeholder="Nome do bairro"
                />
              </div>
              <div>
                <Input
                  label="Cidade *"
                  {...register('cidade', { required: 'Cidade é obrigatória' })}
                  error={errors.cidade?.message}
                  placeholder="Nome da cidade"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  {...register('estado', { required: 'Estado é obrigatório' })}
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
                {errors.estado && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.estado.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informações de Contato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Telefone Principal *"
                  {...register('telefone', {
                    required: 'Telefone é obrigatório',
                  })}
                  error={errors.telefone?.message}
                  icon={<Phone size={18} className="text-gray-400" />}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Input
                  label="Telefone Secundário"
                  {...register('telefoneSec')}
                  icon={<Phone size={18} className="text-gray-400" />}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Input
                  label="E-mail"
                  type="email"
                  {...register('email')}
                  icon={<Mail size={18} className="text-gray-400" />}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Input
                  label="Nome do Responsável"
                  {...register('responsavel')}
                  icon={<User size={18} className="text-gray-400" />}
                  placeholder="Nome do responsável técnico"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informações Adicionais
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                rows={4}
                {...register('observacoes')}
                placeholder="Informações adicionais sobre o cliente"
              ></textarea>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clientes')}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Save size={18} className="mr-2" />
              Salvar Cliente
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
