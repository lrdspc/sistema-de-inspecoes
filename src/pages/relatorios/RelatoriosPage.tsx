import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  FileText,
  Download,
  Eye,
  Clock,
  Building,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getDB, Relatorio, Vistoria, Cliente } from '../../lib/db';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FilterStatus = 'todos' | 'pendentes' | 'finalizados';

interface FilterState {
  status: FilterStatus;
  busca: string;
  periodo: {
    inicio: Date | null;
    fim: Date | null;
  };
}

export function RelatoriosPage() {
  const navigate = useNavigate();
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [vistorias, setVistorias] = useState<{ [id: string]: Vistoria }>({});
  const [clientes, setClientes] = useState<{ [id: string]: Cliente }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtro, setFiltro] = useState<FilterState>({
    status: 'todos',
    busca: '',
    periodo: {
      inicio: null,
      fim: null
    }
  });
  
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const db = await getDB();
        
        // Buscar relatórios
        const allRelatorios = await db.getAll('relatorios');
        setRelatorios(allRelatorios);
        
        // Buscar vistorias relacionadas
        const vistoriasMap: { [id: string]: Vistoria } = {};
        for (const relatorio of allRelatorios) {
          const vistoria = await db.get('vistorias', relatorio.vistoriaId);
          if (vistoria) {
            vistoriasMap[vistoria.id] = vistoria;
          }
        }
        setVistorias(vistoriasMap);
        
        // Buscar clientes
        const clientesMap: { [id: string]: Cliente } = {};
        for (const vistoria of Object.values(vistoriasMap)) {
          const cliente = await db.get('clientes', vistoria.clienteId);
          if (cliente) {
            clientesMap[cliente.id] = cliente;
          }
        }
        setClientes(clientesMap);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredRelatorios = relatorios.filter(relatorio => {
    // Filtrar por status
    if (filtro.status !== 'todos') {
      if (filtro.status === 'pendentes' && relatorio.dataFinalizacao) return false;
      if (filtro.status === 'finalizados' && !relatorio.dataFinalizacao) return false;
    }
    
    // Filtrar por texto de busca
    if (filtro.busca) {
      const termoBusca = filtro.busca.toLowerCase();
      const vistoria = vistorias[relatorio.vistoriaId];
      const cliente = vistoria ? clientes[vistoria.clienteId] : null;
      
      return (
        relatorio.titulo.toLowerCase().includes(termoBusca) ||
        (cliente?.nome.toLowerCase().includes(termoBusca)) ||
        (vistoria?.protocolo.toLowerCase().includes(termoBusca))
      );
    }
    
    // Filtrar por período
    if (filtro.periodo.inicio && filtro.periodo.fim) {
      const dataRelatorio = relatorio.dataFinalizacao || relatorio.dataCriacao;
      return dataRelatorio >= filtro.periodo.inicio.getTime() && 
             dataRelatorio <= filtro.periodo.fim.getTime();
    }
    
    return true;
  });

  // Paginação
  const totalPages = Math.ceil(filteredRelatorios.length / itemsPerPage);
  const currentItems = filteredRelatorios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getParecerColor = (parecer: string) => {
    switch (parecer) {
      case 'procedente':
        return 'bg-green-100 text-green-800';
      case 'improcedente':
        return 'bg-red-100 text-red-800';
      case 'parcialmente_procedente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getParecerLabel = (parecer: string) => {
    switch (parecer) {
      case 'procedente':
        return 'Procedente';
      case 'improcedente':
        return 'Improcedente';
      case 'parcialmente_procedente':
        return 'Parcialmente Procedente';
      default:
        return parecer;
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Gerencie os relatórios técnicos</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={() => navigate('/relatorios/novo')}
          >
            <FileText size={18} className="mr-1" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Buscar relatório..."
              value={filtro.busca}
              onChange={(e) => setFiltro(prev => ({ ...prev, busca: e.target.value }))}
              icon={<Search size={18} className="text-gray-400" />}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center"
              >
                <Filter size={16} className="mr-2" />
                Status: {filtro.status === 'todos' ? 'Todos' : 
                        filtro.status === 'pendentes' ? 'Pendentes' : 'Finalizados'}
                <ChevronDown size={16} className="ml-2" />
              </Button>
              
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      setFiltro(prev => ({ ...prev, status: 'todos' }));
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => {
                      setFiltro(prev => ({ ...prev, status: 'pendentes' }));
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Pendentes
                  </button>
                  <button
                    onClick={() => {
                      setFiltro(prev => ({ ...prev, status: 'finalizados' }));
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Finalizados
                  </button>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className="flex items-center"
            >
              <Filter size={16} className="mr-2" />
              Filtros Avançados
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </div>
        </div>
        
        {showAdvancedFilter && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                value={filtro.periodo.inicio ? format(filtro.periodo.inicio, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setFiltro(prev => ({
                    ...prev,
                    periodo: { ...prev.periodo, inicio: date }
                  }));
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                value={filtro.periodo.fim ? format(filtro.periodo.fim, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setFiltro(prev => ({
                    ...prev,
                    periodo: { ...prev.periodo, fim: date }
                  }));
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de Relatórios */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredRelatorios.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={40} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório encontrado</h3>
            <p className="text-gray-500 mb-4">
              {relatorios.length === 0 ? 
                'Comece gerando seu primeiro relatório.' : 
                'Tente ajustar os filtros para encontrar o que está procurando.'}
            </p>
            <Button 
              onClick={() => navigate('/relatorios/novo')}
              size="sm"
            >
              <FileText size={16} className="mr-2" />
              Novo Relatório
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FileText size={14} className="mr-1" />
                      Relatório
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Building size={14} className="mr-1" />
                      Cliente
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      Data
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parecer
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((relatorio) => {
                  const vistoria = vistorias[relatorio.vistoriaId];
                  const cliente = vistoria ? clientes[vistoria.clienteId] : null;
                  
                  return (
                    <tr key={relatorio.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {relatorio.titulo}
                        </div>
                        <div className="text-sm text-gray-500">
                          Protocolo: {vistoria?.protocolo}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {cliente?.nome || 'Cliente não encontrado'}
                        </div>
                        {cliente && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <MapPin size={12} className="mr-1" />
                            {cliente.cidade}/{cliente.estado}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {relatorio.dataFinalizacao ? (
                            format(new Date(relatorio.dataFinalizacao), 'dd/MM/yyyy')
                          ) : (
                            <span className="text-yellow-600 flex items-center">
                              <Clock size={14} className="mr-1" />
                              Em elaboração
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Criado em: {format(new Date(relatorio.dataCriacao), 'dd/MM/yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {relatorio.parecerFinal ? (
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full font-medium",
                            getParecerColor(relatorio.parecerFinal)
                          )}>
                            {getParecerLabel(relatorio.parecerFinal)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => navigate(`/relatorios/${relatorio.id}`)}
                        >
                          <Eye size={18} />
                        </button>
                        
                        {relatorio.dataFinalizacao && (
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => navigate(`/relatorios/${relatorio.id}/download`)}
                          >
                            <Download size={18} />
                          </button>
                        )}
                        
                        {!relatorio.sincronizado && (
                          <div 
                            className="inline-block ml-2" 
                            title="Relatório não sincronizado"
                          >
                            <AlertTriangle size={16} className="text-yellow-500" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Paginação */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredRelatorios.length)}</span> de{' '}
                      <span className="font-medium">{filteredRelatorios.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginação">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium",
                            currentPage === page 
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600" 
                              : "text-gray-500 hover:bg-gray-50"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Próxima
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}