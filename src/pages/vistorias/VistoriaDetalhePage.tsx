import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Camera,
  MapPin,
  Calendar,
  Clock,
  User,
  ClipboardList,
  FileText,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getDB } from '../../lib/db';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function VistoriaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vistoria, setVistoria] = useState<Vistoria | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchVistoriaData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const db = await getDB();

        // Buscar vistoria
        const vistoriaData = await db.get('vistorias', id);
        if (vistoriaData) {
          setVistoria(vistoriaData);

          // Buscar dados do cliente
          const clienteData = await db.get('clientes', vistoriaData.clienteId);
          if (clienteData) {
            setCliente(clienteData);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados da vistoria:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVistoriaData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      const db = await getDB();

      // Excluir vistoria
      await db.delete('vistorias', id);

      // Adicionar à fila de sincronização
      await db.add('sincronizacao', {
        id:
          Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        tabela: 'vistorias',
        operacao: 'remover',
        dados: { id },
        tentativas: 0,
        dataModificacao: Date.now(),
      });

      // Redirecionar para a lista de vistorias
      navigate('/vistorias');
    } catch (error) {
      console.error('Erro ao excluir vistoria:', error);
      alert(
        'Ocorreu um erro ao excluir a vistoria. Por favor, tente novamente.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartInspection = async () => {
    if (!id || !vistoria) return;

    try {
      setIsLoading(true);
      const db = await getDB();

      // Update vistoria status
      const updatedVistoria: Vistoria = {
        ...vistoria,
        status: 'em_andamento',
        dataModificacao: Date.now(),
        sincronizado: false,
      };

      await db.put('vistorias', updatedVistoria);

      // Add to sync queue
      await db.add('sincronizacao', {
        id:
          Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        tabela: 'vistorias',
        operacao: 'atualizar',
        dados: updatedVistoria,
        tentativas: 0,
        dataModificacao: Date.now(),
      });

      // Navigate to inspection form
      navigate(`/vistorias/${id}/inspecao`);
    } catch (error) {
      console.error('Erro ao iniciar vistoria:', error);
      alert(
        'Ocorreu um erro ao iniciar a vistoria. Por favor, tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendada':
        return <Calendar className="text-blue-600" />;
      case 'em_andamento':
        return <Clock className="text-yellow-600" />;
      case 'concluida':
        return <CheckCircle className="text-green-600" />;
      case 'cancelada':
        return <XCircle className="text-red-600" />;
      default:
        return <AlertCircle className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'em_andamento':
        return 'Em andamento';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusClasses = (status: string): string => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!vistoria || !cliente) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Vistoria não encontrada
        </h2>
        <p className="text-gray-600 mb-4">
          A vistoria que você está procurando não existe ou foi removida.
        </p>
        <Button onClick={() => navigate('/vistorias')}>
          <ArrowLeft size={18} className="mr-2" />
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalhes da Vistoria
          </h1>
          <p className="text-gray-600">Protocolo: {vistoria.protocolo}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/vistorias')}>
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>

          {vistoria.status === 'agendada' && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/vistorias/${id}/editar`)}
              >
                <Edit size={18} className="mr-1" />
                Editar
              </Button>
              <Button onClick={handleStartInspection} isLoading={isLoading}>
                <Play size={18} className="mr-1" />
                Iniciar Vistoria
              </Button>
            </>
          )}

          {vistoria.status === 'em_andamento' && (
            <Button onClick={() => navigate(`/vistorias/${id}/inspecao`)}>
              <Play size={18} className="mr-1" />
              Continuar Vistoria
            </Button>
          )}

          {vistoria.status === 'concluida' && !vistoria.relatorioId && (
            <Button onClick={() => navigate(`/relatorios/novo?vistoria=${id}`)}>
              <FileText size={18} className="mr-1" />
              Gerar Relatório
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                <ClipboardList size={18} className="inline mb-1 mr-2" />
                Informações da Vistoria
              </h2>
              <div className="flex items-center">
                <div
                  className={cn(
                    'px-3 py-1 rounded-full flex items-center',
                    getStatusClasses(vistoria.status)
                  )}
                >
                  {getStatusIcon(vistoria.status)}
                  <span className="ml-2 text-sm font-medium">
                    {getStatusLabel(vistoria.status)}
                  </span>
                </div>

                {!vistoria.sincronizado && (
                  <div className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center">
                    <AlertTriangle size={12} className="mr-1" />
                    Não sincronizado
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Assunto</p>
                <p className="text-base text-gray-900">{vistoria.assunto}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data e Hora</p>
                <p className="text-base text-gray-900">
                  {format(
                    new Date(vistoria.data),
                    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Técnico Responsável
                </p>
                <p className="text-base text-gray-900">Técnico Demonstração</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Unidade Regional
                </p>
                <p className="text-base text-gray-900">
                  {vistoria.unidadeRegional}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                <Building size={18} className="inline mb-1 mr-2" />
                Informações do Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Nome / Razão Social
                  </p>
                  <p className="text-base text-gray-900">{cliente.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    CPF / CNPJ
                  </p>
                  <p className="text-base text-gray-900">{cliente.documento}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p className="text-base text-gray-900">
                    {cliente.logradouro}, {cliente.numero}
                    {cliente.complemento && `, ${cliente.complemento}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bairro</p>
                  <p className="text-base text-gray-900">{cliente.bairro}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cidade/UF</p>
                  <p className="text-base text-gray-900">
                    {cliente.cidade}/{cliente.estado}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-base text-gray-900">{cliente.telefone}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                <Building size={18} className="inline mb-1 mr-2" />
                Informações do Produto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Modelo de Telha
                  </p>
                  <p className="text-base text-gray-900">
                    {vistoria.modeloTelha || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Espessura</p>
                  <p className="text-base text-gray-900">
                    {vistoria.espessura || 'Não informada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tecnologia
                  </p>
                  <p className="text-base text-gray-900">
                    {vistoria.tecnologia || 'Não informada'}
                  </p>
                </div>
                {vistoria.quantidadeTelhas && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Quantidade de Telhas
                    </p>
                    <p className="text-base text-gray-900">
                      {vistoria.quantidadeTelhas}
                    </p>
                  </div>
                )}
                {vistoria.areaCoberta && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Área Coberta
                    </p>
                    <p className="text-base text-gray-900">
                      {vistoria.areaCoberta} m²
                    </p>
                  </div>
                )}
              </div>
            </div>

            {vistoria.observacoes && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  <FileText size={18} className="inline mb-1 mr-2" />
                  Observações
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {vistoria.observacoes}
                </p>
              </div>
            )}

            {/* Registro Fotográfico */}
            {vistoria.fotos && vistoria.fotos.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  <Camera size={18} className="inline mb-1 mr-2" />
                  Registro Fotográfico
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vistoria.fotos.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Não Conformidades */}
            {vistoria.naoConformidades &&
              vistoria.naoConformidades.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    <AlertTriangle size={18} className="inline mb-1 mr-2" />
                    Não Conformidades
                  </h3>
                  <div className="space-y-4">
                    {vistoria.naoConformidades.map((nc, index) => (
                      <div
                        key={nc.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            Não Conformidade #{index + 1}
                          </h4>
                          <span
                            className={cn(
                              'px-2 py-1 text-xs rounded-full',
                              nc.confirmada
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            )}
                          >
                            {nc.confirmada ? 'Confirmada' : 'Pendente'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Tipo
                            </p>
                            <p className="text-base text-gray-900">{nc.tipo}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Descrição
                            </p>
                            <p className="text-base text-gray-900">
                              {nc.descricao}
                            </p>
                          </div>
                        </div>
                        {nc.observacoes && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-500">
                              Observações
                            </p>
                            <p className="text-base text-gray-900">
                              {nc.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Assinaturas */}
            {(vistoria.assinaturaTecnico || vistoria.assinaturaCliente) && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  Assinaturas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vistoria.assinaturaTecnico && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Assinatura do Técnico
                      </p>
                      <img
                        src={vistoria.assinaturaTecnico}
                        alt="Assinatura do Técnico"
                        className="border border-gray-200 rounded-lg"
                      />
                    </div>
                  )}
                  {vistoria.assinaturaCliente && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Assinatura do Cliente
                      </p>
                      <img
                        src={vistoria.assinaturaCliente}
                        alt="Assinatura do Cliente"
                        className="border border-gray-200 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-900 text-sm flex items-center"
              >
                <Trash2 size={16} className="mr-1" />
                Excluir Vistoria
              </button>
            </div>
          </div>
        </div>

        {/* Barra Lateral */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status e Ações */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Status e Ações
            </h2>

            <div className="space-y-4">
              {/* Linha do tempo */}
              <div className="flex items-center">
                <div className="relative flex items-center justify-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      vistoria.status === 'agendada'
                        ? 'bg-blue-100 text-blue-600'
                        : vistoria.status === 'em_andamento'
                          ? 'bg-yellow-100 text-yellow-600'
                          : vistoria.status === 'concluida'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                    )}
                  >
                    {getStatusIcon(vistoria.status)}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {getStatusLabel(vistoria.status)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(
                      new Date(vistoria.dataModificacao),
                      "dd/MM/yyyy 'às' HH:mm"
                    )}
                  </p>
                </div>
              </div>

              {/* Ações disponíveis */}
              <div className="pt-4 space-y-2">
                {vistoria.status === 'agendada' && (
                  <>
                    <Button
                      className="w-full justify-start"
                      onClick={handleStartInspection}
                      isLoading={isLoading}
                    >
                      <Play size={18} className="mr-2" />
                      Iniciar Vistoria
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={() => navigate(`/vistorias/${id}/cancelar`)}
                    >
                      <XCircle size={18} className="mr-2" />
                      Cancelar Vistoria
                    </Button>
                  </>
                )}

                {vistoria.status === 'em_andamento' && (
                  <Button
                    className="w-full justify-start"
                    onClick={() => navigate(`/vistorias/${id}/inspecao`)}
                  >
                    <Play size={18} className="mr-2" />
                    Continuar Vistoria
                  </Button>
                )}

                {vistoria.status === 'concluida' && !vistoria.relatorioId && (
                  <Button
                    className="w-full justify-start"
                    onClick={() => navigate(`/relatorios/novo?vistoria=${id}`)}
                  >
                    <FileText size={18} className="mr-2" />
                    Gerar Relatório
                  </Button>
                )}

                {vistoria.status === 'concluida' && vistoria.relatorioId && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      navigate(`/relatorios/${vistoria.relatorioId}`)
                    }
                  >
                    <FileText size={18} className="mr-2" />
                    Ver Relatório
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informações do Sistema
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Data de Criação</p>
                <p className="font-medium">
                  {format(
                    new Date(vistoria.dataCriacao),
                    "dd/MM/yyyy 'às' HH:mm"
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Última Modificação</p>
                <p className="font-medium">
                  {format(
                    new Date(vistoria.dataModificacao),
                    "dd/MM/yyyy 'às' HH:mm"
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Status de Sincronização</p>
                <div
                  className={cn(
                    'mt-1 px-2 py-1 rounded-full text-xs inline-flex items-center',
                    vistoria.sincronizado
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {vistoria.sincronizado ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      Sincronizado
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={12} className="mr-1" />
                      Pendente sincronização
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir esta vistoria? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                <Trash2 size={18} className="mr-2" />
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
