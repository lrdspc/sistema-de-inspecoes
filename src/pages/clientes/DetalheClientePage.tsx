import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  User, 
  Edit, 
  ClipboardCheck, 
  Clock,
  Calendar,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getDB, Cliente, Vistoria } from '../../lib/db';
import { formatCPFCNPJ } from '../../lib/utils';

export function DetalheClientePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchClienteData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const db = await getDB();
        
        // Buscar cliente
        const clienteData = await db.get('clientes', id);
        if (clienteData) {
          setCliente(clienteData);
        }
        
        // Buscar vistorias relacionadas
        const clienteVistorias = await db.getAllFromIndex('vistorias', 'por_cliente', id);
        if (clienteVistorias) {
          // Ordenar por data, mais recente primeiro
          const sortedVistorias = clienteVistorias.sort((a, b) => b.data - a.data);
          setVistorias(sortedVistorias);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClienteData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const db = await getDB();
      
      // Verificar se há vistorias relacionadas
      if (vistorias.length > 0) {
        alert('Este cliente possui vistorias relacionadas e não pode ser excluído.');
        setShowDeleteConfirm(false);
        setIsLoading(false);
        return;
      }
      
      // Excluir cliente
      await db.delete('clientes', id);
      
      // Adicionar à fila de sincronização
      await db.add('sincronizacao', {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        tabela: 'clientes',
        operacao: 'remover',
        dados: { id },
        tentativas: 0,
        dataModificacao: Date.now(),
      });
      
      // Redirecionar para a lista de clientes
      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Ocorreu um erro ao excluir o cliente. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatarTipo = (tipo: string, customizado?: string) => {
    if (tipo === 'residencial') return 'Residencial';
    if (tipo === 'comercial') return 'Comercial';
    if (tipo === 'industrial') return 'Industrial';
    if (tipo === 'outro' && customizado) return customizado;
    return 'Outro';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Cliente não encontrado</h2>
        <p className="text-gray-600 mb-4">O cliente que você está procurando não existe ou foi removido.</p>
        <Button onClick={() => navigate('/clientes')}>
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
          <h1 className="text-2xl font-bold text-gray-900">{cliente.nome}</h1>
          <p className="text-gray-600">Detalhes do cliente</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/clientes/${id}/editar`)}
          >
            <Edit size={18} className="mr-1" />
            Editar
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate(`/vistorias/nova?cliente=${id}`)}
          >
            <ClipboardCheck size={18} className="mr-1" />
            Nova Vistoria
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                <Building size={18} className="inline mb-1 mr-2" />
                Informações Básicas
              </h2>
              <div 
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  cliente.sincronizado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {cliente.sincronizado ? 'Sincronizado' : 'Pendente sincronização'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nome / Razão Social</p>
                <p className="text-base text-gray-900">{cliente.nome}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">CPF / CNPJ</p>
                <p className="text-base text-gray-900">{formatCPFCNPJ(cliente.documento)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo de Construção</p>
                <p className="text-base text-gray-900">{formatarTipo(cliente.tipo, cliente.tipoCustomizado)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                <p className="text-base text-gray-900">
                  {new Date(cliente.dataCriacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                <MapPin size={18} className="inline mb-1 mr-2" />
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Logradouro</p>
                  <p className="text-base text-gray-900">{cliente.logradouro}, {cliente.numero}</p>
                </div>
                {cliente.complemento && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Complemento</p>
                    <p className="text-base text-gray-900">{cliente.complemento}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Bairro</p>
                  <p className="text-base text-gray-900">{cliente.bairro}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cidade/UF</p>
                  <p className="text-base text-gray-900">{cliente.cidade}/{cliente.estado}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">CEP</p>
                  <p className="text-base text-gray-900">
                    {cliente.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
                  </p>
                </div>
              </div>
              
              <div className="mt-2">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${cliente.logradouro}, ${cliente.numero}, ${cliente.cidade}, ${cliente.estado}`
                  )}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  <ExternalLink size={14} className="mr-1" />
                  Ver no mapa
                </a>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                <Phone size={18} className="inline mb-1 mr-2" />
                Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone Principal</p>
                  <p className="text-base text-gray-900">
                    {cliente.telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                  </p>
                </div>
                {cliente.telefoneSec && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefone Secundário</p>
                    <p className="text-base text-gray-900">
                      {cliente.telefoneSec.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                    </p>
                  </div>
                )}
                {cliente.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-mail</p>
                    <p className="text-base text-gray-900">{cliente.email}</p>
                  </div>
                )}
                {cliente.responsavel && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Responsável</p>
                    <p className="text-base text-gray-900">{cliente.responsavel}</p>
                  </div>
                )}
              </div>
            </div>
            
            {cliente.observacoes && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  <FileText size={18} className="inline mb-1 mr-2" />
                  Observações
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{cliente.observacoes}</p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-900 text-sm flex items-center"
              >
                <Trash2 size={16} className="mr-1" />
                Excluir Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Vistorias e Resumo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <Clock size={18} className="inline mb-1 mr-2" />
              Últimas Vistorias
            </h2>
            
            {vistorias.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <ClipboardCheck size={32} className="mx-auto mb-2 text-gray-300" />
                <p>Nenhuma vistoria encontrada</p>
                <Button 
                  onClick={() => navigate(`/vistorias/nova?cliente=${id}`)}
                  className="mt-3"
                  size="sm"
                >
                  Agendar Vistoria
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vistorias.slice(0, 5).map((vistoria) => (
                  <div 
                    key={vistoria.id}
                    className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/vistorias/${vistoria.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{vistoria.assunto}</p>
                        <p className="text-sm text-gray-500">
                          <Calendar size={14} className="inline mr-1 mb-1" />
                          {new Date(vistoria.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        vistoria.status === 'concluida' ? 'bg-green-100 text-green-800' :
                        vistoria.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                        vistoria.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {vistoria.status === 'concluida' ? 'Concluída' :
                        vistoria.status === 'agendada' ? 'Agendada' :
                        vistoria.status === 'em_andamento' ? 'Em andamento' :
                        'Cancelada'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <User size={14} className="inline mr-1 mb-1" />
                      Técnico: {vistoria.tecnicoId}
                    </p>
                  </div>
                ))}
                
                {vistorias.length > 5 && (
                  <div className="text-center">
                    <button 
                      onClick={() => navigate(`/clientes/${id}/historico`)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Ver todas as vistorias
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/vistorias/nova?cliente=${id}`)}
              >
                <Calendar size={18} className="mr-2" />
                Agendar Nova Vistoria
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/clientes/${id}/historico`)}
              >
                <Clock size={18} className="mr-2" />
                Ver Histórico Completo
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/clientes/${id}/editar`)}
              >
                <Edit size={18} className="mr-2" />
                Editar Dados
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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
                isLoading={isLoading}
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