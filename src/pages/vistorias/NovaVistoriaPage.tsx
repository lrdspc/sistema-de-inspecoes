import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Save,
  ArrowLeft,
  Building,
  Calendar,
  MapPin,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getDB, Cliente, Vistoria } from '../../lib/db';
import { generateUniqueId } from '../../lib/utils';
import { format } from 'date-fns';

interface VistoriaFormData {
  clienteId: string;
  data: string;
  hora: string;
  assunto: string;
  modeloTelha?: string;
  espessura?: string;
  tecnologia?: string;
  quantidadeTelhas?: number;
  areaCoberta?: number;
  observacoes?: string;
}

export function NovaVistoriaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientesList, setShowClientesList] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<VistoriaFormData>({
    defaultValues: {
      data: format(new Date(), 'yyyy-MM-dd'),
      hora: format(new Date(), 'HH:mm')
    }
  });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const db = await getDB();
        const allClientes = await db.getAll('clientes');
        setClientes(allClientes);
        
        // Se houver um cliente na query string, selecionar automaticamente
        const params = new URLSearchParams(location.search);
        const clienteId = params.get('cliente');
        if (clienteId) {
          const cliente = allClientes.find(c => c.id === clienteId);
          if (cliente) {
            setClienteSelecionado(cliente);
            setValue('clienteId', cliente.id);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    };

    fetchClientes();
  }, [location.search, setValue]);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.documento.includes(searchTerm) ||
    cliente.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: VistoriaFormData) => {
    if (!clienteSelecionado) {
      alert('Selecione um cliente para continuar');
      return;
    }

    try {
      setIsLoading(true);
      
      // Criar objeto da vistoria
      const novaVistoria: Vistoria = {
        id: generateUniqueId(),
        clienteId: clienteSelecionado.id,
        data: new Date(`${data.data}T${data.hora}`).getTime(),
        protocolo: generateProtocolo(),
        tecnicoId: 'tecnico-demo', // Em produção, usar ID do usuário logado
        departamento: 'Técnico',
        unidadeRegional: 'SP',
        status: 'agendada',
        assunto: data.assunto,
        modeloTelha: data.modeloTelha,
        espessura: data.espessura,
        tecnologia: data.tecnologia,
        quantidadeTelhas: data.quantidadeTelhas,
        areaCoberta: data.areaCoberta,
        observacoes: data.observacoes,
        dataCriacao: Date.now(),
        dataModificacao: Date.now(),
        sincronizado: false
      };
      
      const db = await getDB();
      await db.add('vistorias', novaVistoria);
      
      // Adicionar à fila de sincronização
      await db.add('sincronizacao', {
        id: generateUniqueId(),
        tabela: 'vistorias',
        operacao: 'inserir',
        dados: novaVistoria,
        tentativas: 0,
        dataModificacao: Date.now(),
      });
      
      navigate('/vistorias');
    } catch (error) {
      console.error('Erro ao salvar vistoria:', error);
      alert('Ocorreu um erro ao salvar a vistoria. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateProtocolo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `VST${year}${month}${random}`;
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Vistoria</h1>
          <p className="text-gray-600">Agende uma nova vistoria técnica</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="outline"
            onClick={() => navigate('/vistorias')}
          >
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seleção de Cliente */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <Building size={18} className="inline mb-1 mr-2" />
              Cliente
            </h2>
            
            <div className="relative">
              <Input
                placeholder="Buscar cliente por nome, documento ou cidade..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowClientesList(true);
                }}
                icon={<Search size={18} className="text-gray-400" />}
              />
              
              {showClientesList && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="max-h-60 overflow-y-auto">
                    {filteredClientes.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-gray-500">Nenhum cliente encontrado</p>
                        <Button 
                          onClick={() => navigate('/clientes/novo')}
                          size="sm"
                          className="mt-2"
                        >
                          <Plus size={16} className="mr-1" />
                          Novo Cliente
                        </Button>
                      </div>
                    ) : (
                      filteredClientes.map(cliente => (
                        <div
                          key={cliente.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setClienteSelecionado(cliente);
                            setValue('clienteId', cliente.id);
                            setShowClientesList(false);
                            setSearchTerm('');
                          }}
                        >
                          <div className="font-medium text-gray-900">{cliente.nome}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {cliente.cidade}/{cliente.estado}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {clienteSelecionado && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Cliente Selecionado</p>
                    <p className="text-lg font-medium text-gray-900">{clienteSelecionado.nome}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClienteSelecionado(null);
                      setValue('clienteId', '');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Alterar
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Endereço</p>
                  <p className="text-base text-gray-900">
                    {clienteSelecionado.logradouro}, {clienteSelecionado.numero}
                    {clienteSelecionado.complemento && `, ${clienteSelecionado.complemento}`}
                  </p>
                  <p className="text-base text-gray-900">
                    {clienteSelecionado.bairro}, {clienteSelecionado.cidade}/{clienteSelecionado.estado}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Data e Hora */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <Calendar size={18} className="inline mb-1 mr-2" />
              Data e Hora
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Data *"
                  type="date"
                  {...register('data', { required: 'Data é obrigatória' })}
                  error={errors.data?.message}
                />
              </div>
              <div>
                <Input
                  label="Hora *"
                  type="time"
                  {...register('hora', { required: 'Hora é obrigatória' })}
                  error={errors.hora?.message}
                />
              </div>
            </div>
          </div>

          {/* Detalhes da Vistoria */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalhes da Vistoria</h2>
            
            <div className="space-y-4">
              <Input
                label="Assunto *"
                {...register('assunto', { required: 'Assunto é obrigatório' })}
                error={errors.assunto?.message}
                placeholder="Ex: Inspeção de rotina, Verificação de infiltração, etc."
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Modelo de Telha"
                  {...register('modeloTelha')}
                  placeholder="Ex: Ondulada, Romana, etc."
                />
                <Input
                  label="Espessura"
                  {...register('espessura')}
                  placeholder="Ex: 6mm, 8mm, etc."
                />
                <Input
                  label="Tecnologia"
                  {...register('tecnologia')}
                  placeholder="Ex: CRFS, Cerâmica, etc."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Quantidade de Telhas"
                  type="number"
                  {...register('quantidadeTelhas', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Quantidade inválida' }
                  })}
                  error={errors.quantidadeTelhas?.message}
                />
                <Input
                  label="Área Coberta (m²)"
                  type="number"
                  {...register('areaCoberta', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Área inválida' }
                  })}
                  error={errors.areaCoberta?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  rows={4}
                  {...register('observacoes')}
                  placeholder="Observações adicionais sobre a vistoria..."
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/vistorias')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              <Save size={18} className="mr-2" />
              Agendar Vistoria
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}