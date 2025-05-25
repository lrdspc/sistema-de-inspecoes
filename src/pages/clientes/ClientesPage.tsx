import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown, 
  Eye, 
  Edit, 
  ClipboardCheck, 
  Clock,
  MapPin
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getDB, Cliente } from '../../lib/db';
import { cn } from '../../lib/utils';

export function ClientesPage() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [sortBy, setSortBy] = useState({ field: 'nome', order: 'asc' });
  const [advancedFilters, setAdvancedFilters] = useState({
    estado: '',
    tipo: ''
  });
  
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const db = await getDB();
        const allClientes = await db.getAll('clientes');
        
        // Ordenar por nome inicialmente
        const sortedClientes = allClientes.sort((a, b) => 
          a.nome.localeCompare(b.nome)
        );
        
        setClientes(sortedClientes);
        setFilteredClientes(sortedClientes);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    let result = [...clientes];
    
    // Aplicar filtro de status
    if (filterStatus !== 'todos') {
      // Esta é uma simulação, em um sistema real teria mais lógica aqui
      if (filterStatus === 'ativos') {
        // Apenas um exemplo - considerando clientes com modificação recente como "ativos"
        const threeMonthsAgo = Date.now() - (3 * 30 * 24 * 60 * 60 * 1000);
        result = result.filter(cliente => cliente.dataModificacao > threeMonthsAgo);
      } else if (filterStatus === 'inativos') {
        const threeMonthsAgo = Date.now() - (3 * 30 * 24 * 60 * 60 * 1000);
        result = result.filter(cliente => cliente.dataModificacao <= threeMonthsAgo);
      } else if (filterStatus === 'pendentes') {
        // Simulação - por exemplo, clientes não sincronizados
        result = result.filter(cliente => !cliente.sincronizado);
      }
    }
    
    // Aplicar filtros avançados
    if (advancedFilters.estado) {
      result = result.filter(cliente => 
        cliente.estado.toLowerCase() === advancedFilters.estado.toLowerCase()
      );
    }
    
    if (advancedFilters.tipo) {
      result = result.filter(cliente => 
        cliente.tipo === advancedFilters.tipo
      );
    }
    
    // Aplicar busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchLower) ||
        cliente.documento.toLowerCase().includes(searchLower) ||
        cliente.cidade.toLowerCase().includes(searchLower) ||
        cliente.estado.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar ordenação
    result.sort((a, b) => {
      let compareResult = 0;
      
      if (sortBy.field === 'nome') {
        compareResult = a.nome.localeCompare(b.nome);
      } else if (sortBy.field === 'cidade') {
        compareResult = a.cidade.localeCompare(b.cidade);
      } else if (sortBy.field === 'dataCriacao') {
        compareResult = a.dataCriacao - b.dataCriacao;
      }
      
      return sortBy.order === 'asc' ? compareResult : -compareResult;
    });
    
    setFilteredClientes(result);
    setCurrentPage(1); // Resetar para a primeira página quando os filtros mudam
  }, [clientes, searchTerm, filterStatus, advancedFilters, sortBy]);

  const handleSortChange = (field: string) => {
    setSortBy(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Paginação
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const currentItems = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Função para adicionar clientes de demonstração
  const addDemoClientes = async () => {
    try {
      setIsLoading(true);
      
      const demoClientes: Cliente[] = [
        {
          id: '1',
          nome: 'Condomínio Solar das Palmeiras',
          documento: '12.345.678/0001-90',
          tipo: 'residencial',
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          estado: 'SP',
          telefone: '(11) 3456-7890',
          email: 'contato@condominiosolar.com.br',
          responsavel: 'Carlos Silva',
          dataCriacao: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 dias atrás
          dataModificacao: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 dias atrás
          sincronizado: true
        },
        {
          id: '2',
          nome: 'Edifício Comercial Infinity',
          documento: '23.456.789/0001-12',
          tipo: 'comercial',
          cep: '01310-200',
          logradouro: 'Rua Augusta',
          numero: '500',
          bairro: 'Consolação',
          cidade: 'São Paulo',
          estado: 'SP',
          telefone: '(11) 2345-6789',
          email: 'admin@edificioinfinity.com.br',
          responsavel: 'Ana Mendes',
          dataCriacao: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 dias atrás
          dataModificacao: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 dias atrás
          sincronizado: true
        },
        {
          id: '3',
          nome: 'Residencial Flores',
          documento: '34.567.890/0001-23',
          tipo: 'residencial',
          cep: '01320-000',
          logradouro: 'Rua dos Pinheiros',
          numero: '300',
          bairro: 'Pinheiros',
          cidade: 'São Paulo',
          estado: 'SP',
          telefone: '(11) 3333-4444',
          email: 'contato@residencialflores.com.br',
          responsavel: 'Roberto Flores',
          dataCriacao: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 dias atrás
          dataModificacao: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 dias atrás
          sincronizado: true
        },
        {
          id: '4',
          nome: 'Residencial Vitória',
          documento: '45.678.901/0001-34',
          tipo: 'residencial',
          cep: '80250-000',
          logradouro: 'Rua das Flores',
          numero: '500',
          bairro: 'Centro',
          cidade: 'Curitiba',
          estado: 'PR',
          telefone: '(41) 3456-7890',
          email: 'contato@residencialvitoria.com.br',
          responsavel: 'Marcos Vinicius',
          dataCriacao: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 dias atrás
          dataModificacao: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 dia atrás
          sincronizado: false
        },
        {
          id: '5',
          nome: 'Empresa ABC Ltda',
          documento: '56.789.012/0001-45',
          tipo: 'industrial',
          cep: '85800-000',
          logradouro: 'Avenida Industrial',
          numero: '2000',
          bairro: 'Distrito Industrial',
          cidade: 'Cascavel',
          estado: 'PR',
          telefone: '(45) 3456-7890',
          email: 'contato@empresaabc.com.br',
          responsavel: 'José Pereira',
          dataCriacao: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 dias atrás
          dataModificacao: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 dias atrás
          sincronizado: true
        },
        {
          id: '6',
          nome: 'Residencial Parque das Águas',
          documento: '67.890.123/0001-56',
          tipo: 'residencial',
          cep: '88010-000',
          logradouro: 'Avenida Beira Mar',
          numero: '1500',
          bairro: 'Centro',
          cidade: 'Florianópolis',
          estado: 'SC',
          telefone: '(48) 3456-7890',
          email: 'contato@parquedasaguas.com.br',
          responsavel: 'Carla Santos',
          dataCriacao: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 dias atrás
          dataModificacao: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 dias atrás
          sincronizado: true
        },
        {
          id: '7',
          nome: 'Shopping Center Sul',
          documento: '78.901.234/0001-67',
          tipo: 'comercial',
          cep: '90110-000',
          logradouro: 'Avenida Ipiranga',
          numero: '5000',
          bairro: 'Partenon',
          cidade: 'Porto Alegre',
          estado: 'RS',
          telefone: '(51) 3456-7890',
          email: 'administracao@shoppingsul.com.br',
          responsavel: 'Rodrigo Maia',
          dataCriacao: Date.now() - 120 * 24 * 60 * 60 * 1000, // 120 dias atrás
          dataModificacao: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 dias atrás
          sincronizado: true
        },
        {
          id: '8',
          nome: 'Escola Municipal Nova Esperança',
          documento: '89.012.345/0001-78',
          tipo: 'outro',
          tipoCustomizado: 'Educacional',
          cep: '04532-000',
          logradouro: 'Rua da Educação',
          numero: '200',
          bairro: 'Vila Nova',
          cidade: 'São Paulo',
          estado: 'SP',
          telefone: '(11) 3456-7890',
          email: 'contato@escolanovaesperanca.edu.br',
          responsavel: 'Maria Eduarda',
          dataCriacao: Date.now() - 180 * 24 * 60 * 60 * 1000, // 180 dias atrás
          dataModificacao: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 dias atrás
          sincronizado: false
        }
      ];
      
      const db = await getDB();
      
      // Adicionar cada cliente ao banco de dados
      for (const cliente of demoClientes) {
        await db.put('clientes', cliente);
      }
      
      // Atualizar o estado
      setClientes([...demoClientes]);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao adicionar clientes de demonstração:', error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie todos os seus clientes</p>
        </div>
        <div className="mt-4 sm:mt-0 flex">
          {clientes.length === 0 && (
            <Button 
              onClick={addDemoClientes}
              variant="secondary"
              className="mr-2"
            >
              Adicionar Dados Demo
            </Button>
          )}
          <Button 
            onClick={() => navigate('/clientes/novo')}
          >
            <Plus size={18} className="mr-1" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                Status: {filterStatus === 'todos' ? 'Todos' : 
                        filterStatus === 'ativos' ? 'Ativos' :
                        filterStatus === 'inativos' ? 'Inativos' : 'Pendentes'}
                <ChevronDown size={16} className="ml-2" />
              </Button>
              
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      setFilterStatus('todos');
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('ativos');
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Ativos
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('inativos');
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Inativos
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus('pendentes');
                      setShowFilterMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Com Pendências
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
                Estado
              </label>
              <select
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={advancedFilters.estado}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, estado: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="PR">Paraná</option>
                <option value="SC">Santa Catarina</option>
                <option value="RS">Rio Grande do Sul</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cliente
              </label>
              <select
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                value={advancedFilters.tipo}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, tipo: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-gray-500 text-lg mb-2">Nenhum cliente encontrado</div>
            <p className="text-gray-500">
              {clientes.length === 0 ? 
                'Cadastre seu primeiro cliente ou adicione dados de demonstração.' : 
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
                    onClick={() => handleSortChange('nome')}
                  >
                    <div className="flex items-center">
                      Nome
                      {sortBy.field === 'nome' && (
                        <ChevronDown 
                          size={16} 
                          className={`ml-1 ${sortBy.order === 'desc' ? 'transform rotate-180' : ''}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('cidade')}
                  >
                    <div className="flex items-center">
                      Cidade/UF
                      {sortBy.field === 'cidade' && (
                        <ChevronDown 
                          size={16} 
                          className={`ml-1 ${sortBy.order === 'desc' ? 'transform rotate-180' : ''}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{cliente.nome}</div>
                      <div className="text-sm text-gray-500">{cliente.responsavel || 'Não informado'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.documento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1 text-gray-400" />
                        {cliente.cidade}/{cliente.estado}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cliente.telefone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        cliente.sincronizado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        {cliente.sincronizado ? 'Sincronizado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => navigate(`/clientes/${cliente.id}`)}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 mr-3"
                        onClick={() => navigate(`/vistorias/nova?cliente=${cliente.id}`)}
                      >
                        <ClipboardCheck size={18} />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => navigate(`/clientes/${cliente.id}/historico`)}
                      >
                        <Clock size={18} />
                      </button>
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
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredClientes.length)}</span> de{' '}
                      <span className="font-medium">{filteredClientes.length}</span> resultados
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