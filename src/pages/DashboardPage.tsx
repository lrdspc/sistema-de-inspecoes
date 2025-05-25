import React from 'react';
import { Calendar, Clock, ArrowUp, ArrowDown, MoreHorizontal, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  const currentDate = new Date();
  const diaDaSemana = currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
  const data = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Dados simulados para próximas visitas
  const proximasVisitas = [
    {
      id: '1',
      cliente: 'Condomínio Solar das Palmeiras',
      endereco: 'Av. Paulista, 1000 - São Paulo, SP',
      data: new Date(currentDate.getTime() + 3600000 * 2), // Hoje + 2 horas
      status: 'agendada',
      assunto: 'Inspeção inicial',
    },
    {
      id: '2',
      cliente: 'Edifício Comercial Infinity',
      endereco: 'Rua Augusta, 500 - São Paulo, SP',
      data: new Date(currentDate.getTime() + 3600000 * 24), // Amanhã
      status: 'agendada',
      assunto: 'Reclamação de infiltração',
    },
    {
      id: '3',
      cliente: 'Residencial Flores',
      endereco: 'Rua dos Pinheiros, 300 - São Paulo, SP',
      data: new Date(currentDate.getTime() + 3600000 * 48), // Depois de amanhã
      status: 'agendada',
      assunto: 'Vistoria de garantia',
    },
  ];

  // Dados simulados para o calendário semanal
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const diaAtual = currentDate.getDay();
  
  const calendarioSemanal = diasSemana.map((dia, index) => {
    const dataDay = new Date(currentDate);
    const diff = index - diaAtual;
    dataDay.setDate(currentDate.getDate() + diff);
    
    const visitas = Math.floor(Math.random() * 3); // 0, 1 ou 2 visitas simuladas
    const status = index < diaAtual 
      ? 'concluido' 
      : (index === diaAtual ? 'hoje' : 'agendado');
    
    return {
      dia,
      data: dataDay,
      visitas,
      status
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo. Hoje é {diaDaSemana}, {data}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Semanal */}
        <div className="bg-white p-6 rounded-lg shadow-sm col-span-3 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar size={18} className="mr-2" />
              Calendário Semanal
            </h2>
            <Button variant="ghost" size="sm">
              Ver calendário completo
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarioSemanal.map((item, index) => (
              <div 
                key={index} 
                className={`
                  text-center p-3 rounded-md 
                  ${item.status === 'hoje' ? 'bg-blue-100 border border-blue-300' : ''}
                  ${item.status === 'concluido' ? 'bg-gray-50' : ''}
                `}
              >
                <p className="text-gray-600 text-sm">{item.dia}</p>
                <p className={`
                  text-lg font-medium
                  ${item.status === 'hoje' ? 'text-blue-800' : 'text-gray-800'}
                `}>
                  {item.data.getDate()}
                </p>
                <div className={`
                  mt-2 text-xs rounded-full py-1 px-2
                  ${item.visitas > 0 
                    ? (item.status === 'concluido' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800')
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {item.visitas} {item.visitas === 1 ? 'visita' : 'visitas'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas do Mês */}
        <div className="bg-white p-6 rounded-lg shadow-sm col-span-3 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Métricas do Mês</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Vistorias Realizadas</p>
                <p className="text-2xl font-semibold">12</p>
              </div>
              <div className="bg-green-100 text-green-800 p-2 rounded-full">
                <ArrowUp size={20} />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Vistorias Pendentes</p>
                <p className="text-2xl font-semibold">5</p>
              </div>
              <div className="bg-red-100 text-red-800 p-2 rounded-full">
                <ArrowDown size={20} />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Média de Tempo</p>
                <p className="text-2xl font-semibold">1.5h</p>
              </div>
              <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                <Clock size={20} />
              </div>
            </div>
            
            <div className="pt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                70% da meta mensal atingida
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas Visitas */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Clock size={18} className="mr-2" />
            Próximas Visitas
          </h2>
          <Button variant="ghost" size="sm">
            Ver todas
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endereço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {proximasVisitas.map((visita) => (
                <tr key={visita.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{visita.cliente}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{visita.endereco}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">
                      {visita.data.toLocaleDateString('pt-BR')} às {visita.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{visita.assunto}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Agendada
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Check size={16} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas e Notificações */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
            <AlertCircle size={18} className="mr-2" />
            Relatórios Pendentes
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-red-800">Residencial Vitória</p>
                  <p className="text-sm text-red-700">Vistoria realizada: 01/07/2025</p>
                </div>
                <div className="bg-red-200 text-red-800 px-2 py-1 rounded-md text-xs font-medium">
                  48h+ atraso
                </div>
              </div>
              <Button variant="danger" size="sm" className="mt-2">
                Finalizar Relatório
              </Button>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-yellow-800">Empresa ABC Ltda</p>
                  <p className="text-sm text-yellow-700">Vistoria realizada: 03/07/2025</p>
                </div>
                <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">
                  24h atraso
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                Continuar Relatório
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
            <Calendar size={18} className="mr-2" />
            Lembretes
          </h2>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
              <div className="bg-blue-200 text-blue-800 p-1 rounded-full mr-3">
                <Calendar size={16} />
              </div>
              <div>
                <p className="font-medium text-blue-800">Vistoria agendada amanhã</p>
                <p className="text-sm text-blue-700">Edifício Comercial Infinity - 10:00</p>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
              <div className="bg-green-200 text-green-800 p-1 rounded-full mr-3">
                <Check size={16} />
              </div>
              <div>
                <p className="font-medium text-green-800">Atualização de software disponível</p>
                <p className="text-sm text-green-700">Nova versão com correções de bugs</p>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-md flex items-center">
              <div className="bg-purple-200 text-purple-800 p-1 rounded-full mr-3">
                <AlertCircle size={16} />
              </div>
              <div>
                <p className="font-medium text-purple-800">Reunião mensal</p>
                <p className="text-sm text-purple-700">10/07/2025 - 14:00 - Sala de reuniões</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}