import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown, 
  Eye, 
  Edit, 
  FileText, 
  Clock,
  MapPin,
  Calendar,
  User,
  Building,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getDB, Vistoria, Cliente } from '../../lib/db';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FilterStatus = 'todas' | 'agendadas' | 'em_andamento' | 'concluidas' | 'canceladas';

interface FilterState {
  status: FilterStatus;
  busca: string;
  periodo: {
    inicio: Date | null;
    fim: Date | null;
  };
  unidadeRegional: string;
}

export function VistoriasPage() {
  const navigate = useNavigate();
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [clientes, setClientes] = useState<{ [id: string]: Cliente }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtro, setFiltro] = useState<FilterState>({
    status: 'todas',
    busca: '',
    periodo: {
      inicio: null,
      fim: null
    },
    unidadeRegional: ''
  });
  const [filteredVistorias, setFilteredVistorias] = useState<Vistoria[]>([]);
  const [sortBy, setSortBy] = useState({ field: 'data', order: 'desc' });
  
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const db = await getDB();
        
        // Buscar vistorias
        const allVistorias = await db.getAll('vistorias');
        setVistorias(allVistorias);
        
        // Carregar dados dos clientes para exibição
        const allClientes = await db.getAll('clientes');
        const clientesMap: { [id: string]: Cliente } = {};
        allClientes.forEach(cliente => {
          clientesMap[cliente.id] = cliente;
        });
        setClientes(clientesMap);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar vistorias:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Filtrar vistorias com base nos critérios
    let filtered = [...vistorias];
    
    // Filtrar por status
    if (filtro.status !== 'todas') {
      filtered = filtered.filter(v => {
        switch (filtro.status) {
          case 'agendadas':
            return v.status === 'agendada';
          case 'em_andamento':
            return v.status === 'em_andamento';
          case 'concluidas':
            return v.status === 'concluida';
          case 'canceladas':
            return v.status === 'cancelada';
          default:
            return true;
        }
      });
    }
    
    // Filtrar por texto de busca
    if (filtro.busca) {
      const termoBusca = filtro.busca.toLowerCase();
      filtered = filtered.filter(v => 
        v.protocolo.toLowerCase().includes(termoBusca) ||
        v.assunto.toLowerCase().includes(termoBusca) ||
        (clientes[v.clienteId]?.nome.toLowerCase().includes(termoBusca)) ||
        (clientes[v.clienteId]?.cidade.toLowerCase().includes(termoBusca))
      );
    }
    
    // Filtrar por período
    if (filtro.periodo.inicio && filtro.periodo.fim) {
      filtered = filtered.filter(v => {
        const dataVistoria = new Date(v.data);
        return dataVistoria >= filtro.periodo.inicio! && dataVistoria <= filtro.periodo.fim!;
      });
    }
    
    // Filtrar por unidade regional
    if (filtro.unidadeRegional) {
      filtered = filtered.filter(v => v.unidadeRegional === filtro.unidadeRegional);
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      let compareResult = 0;
      
      switch (sortBy.field) {
        case 'data':
          compareResult = a.data - b.data;
          break;
        case 'protocolo':
          compareResult = a.protocolo.localeCompare(b.protocolo);
          break;
        case 'cliente':
          compareResult = (clientes[a.clienteId]?.nome || '').localeCompare(clientes[b.clienteId]?.nome || '');
          break;
        case 'status':
          compareResult = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          compareResult = 0;
      }
      
      return sortBy.order === 'asc' ? compareResult : -compareResult;
    });
    
    setFilteredVistorias(filtered);
    setCurrentPage(1); // Resetar para a primeira página quando os filtros mudam
  }, [vistorias, filtro, sortBy, clientes]);

  const handleSortChange = (field: string) => {
    setSortBy(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
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

  // Paginação
  const totalPages = Math.ceil(filteredVistorias.length / itemsPerPage);
  const currentItems = filteredVistorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vistorias</h1>
          <p className="text-gray-600">Gerencie todas as vistorias técnicas</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={() => navigate('/vistorias/nova')}
          >
            <Plus size={18} className="mr-1" />
            Nova Vistoria
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Buscar vistoria..."
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
                Status: {filtro.status === 'todas' ? 'Todas' : 
                        filtro.status === 'agendadas' ? 'Agendadas' :
                        filtro.status === 'em_andamento' ? 'Em Andamento' :
                        filtro.status === 'concluidas' ? 'Concluídas' : 'Canceladas'}
                <ChevronDown size={16} className="ml-2" />
              </Button>
              
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      setFiltro(prev => ({ ...prev, status: 'todas' }));
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => {
                      setFiltro(prev => ({ ...prev, status: 'agendadas' }));
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Agendadas
                  </button>
                  <button
                    onClick={() => {
                      setFiltro(prev => ({ ...prev, status: 'em_andamento' }));
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Em Andamento
                  </button>
                  <button
                    onClick={() => {
                      setFiltro(prev => ({ ...prev, status: 'concluidas' }));
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Concluídas
                  </button>
                  <button
                    onClick={() => {
                      setFiltro(prev => ({ ...prev, status: 'canceladas' }));
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Canceladas
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
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período Inicial
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
                Período Final
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade Regional
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                value={filtro.unidadeRegional}
                onChange={(e) => setFiltro(prev => ({ ...prev, unidadeRegional: e.target.value }))}
              >
                <option value="">Todas</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="PR">Paraná</option>
                <option value="SC">Santa Catarina</option>
                <option value="RS">Rio Grande do Sul</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Vistorias */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredVistorias.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-gray-500 text-lg mb-2">Nenhuma vistoria encontrada</div>
            <p className="text-gray-500">
              {vistorias.length === 0 ? 
                'Agende sua primeira vistoria.' : 
                'Tente ajustar os filtros para encontrar o que está procurando.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('data')}
                  >
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      Data
                      {sortBy.field === 'data' && (
                        <ChevronDown 
                          size={14} 
                          className={cn(
                            "ml-1 transition-transform",
                            sortBy.order === 'desc' ? "transform rotate-180" : ""
                          )}
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('protocolo')}
                  >
                    <div className="flex items-center">
                      <FileText size={14} className="mr-1" />
                      Protocolo
                      {sortBy.field === 'protocolo' && (
                        <ChevronDown 
                          size={14} 
                          className={cn(
                            "ml-1 transition-transform",
                            sortBy.order === 'desc' ? "transform rotate-180" : ""
                          )}
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('cliente')}
                  >
                    <div className="flex items-center">
                      <Building size={14} className="mr-1" />
                      Cliente
                      {sortBy.field === 'cliente' && (
                        <ChevronDown 
                          size={14} 
                          className={cn(
                            "ml-1 transition-transform",
                            sortBy.order === 'desc' ? "transform rotate-180" : ""
                          )}
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      Técnico
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('status')}
                  >
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      Status
                      {sortBy.field === 'status' && (
                        <ChevronDown 
                          size={14} 
                          className={cn(
                            "ml-1 transition-transform",
                            sortBy.order === 'desc' ? "transform rotate-180" : ""
                          )}
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((vistoria) => (
                  <tr key={vistoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(vistoria.data), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(vistoria.data), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vistoria.protocolo}</div>
                      <div className="text-sm text-gray-500">{vistoria.assunto}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {clientes[vistoria.clienteId]?.nome || 'Cliente não encontrado'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {clientes[vistoria.clienteId]?.cidade}/{clientes[vistoria.clienteId]?.estado}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Técnico Demonstração</div>
                      <div className="text-xs text-gray-500">{vistoria.unidadeRegional}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={cn(
                          "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                          getStatusColor(vistoria.status)
                        )}>
                          {vistoria.status === 'agendada' ? 'Agendada' : 
                           vistoria.status === 'em_andamento' ? 'Em andamento' : 
                           vistoria.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                        </span>
                        
                        {!vistoria.sincronizado && (
                          <div className="ml-2" title="Não sincronizado">
                            <AlertTriangle size={14} className="text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => navigate(`/vistorias/${vistoria.id}`)}
                      >
                        <Eye size={18} />
                      </button>
                      
                      {vistoria.status !== 'concluida' && (
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => navigate(`/vistorias/${vistoria.id}/editar`)}
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      
                      {vistoria.status === 'concluida' && !vistoria.relatorioId && (
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => navigate(`/relatorios/novo?vistoria=${vistoria.id}`)}
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      
                      {vistoria.status === 'concluida' && vistoria.relatorioId && (
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => navigate(`/relatorios/${vistoria.relatorioId}`)}
                        >
                          <FileText size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredVistorias.length)}</span> de{' '}
                      <span className="font-medium">{filteredVistorias.length}</span> resultados
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
                      
                      {/* Páginas */}
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