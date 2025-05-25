import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Save,
  ArrowLeft,
  FileText,
  Building,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getDB, Relatorio, Vistoria, Cliente } from '../../lib/db';
import { generateUniqueId } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RelatorioFormData {
  titulo: string;
  introducao: string;
  analiseTecnica: string;
  conclusao: string;
  parecerFinal: 'procedente' | 'improcedente' | 'parcialmente_procedente';
}

export function NovoRelatorioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [vistoria, setVistoria] = useState<Vistoria | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  
  // Parse query parameters
  const params = new URLSearchParams(location.search);
  const vistoriaId = params.get('vistoria');

  const { register, handleSubmit, formState: { errors } } = useForm<RelatorioFormData>({
    defaultValues: {
      titulo: '',
      introducao: '',
      analiseTecnica: '',
      conclusao: '',
      parecerFinal: 'procedente'
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!vistoriaId) return;

      try {
        setIsLoading(true);
        const db = await getDB();
        
        // Buscar vistoria
        const vistoriaData = await db.get('vistorias', vistoriaId);
        if (vistoriaData) {
          setVistoria(vistoriaData);
          
          // Buscar cliente
          const clienteData = await db.get('clientes', vistoriaData.clienteId);
          if (clienteData) {
            setCliente(clienteData);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [vistoriaId]);

  const onSubmit = async (data: RelatorioFormData) => {
    if (!vistoria) return;

    try {
      setIsLoading(true);
      
      const novoRelatorio: Relatorio = {
        id: generateUniqueId(),
        vistoriaId: vistoria.id,
        titulo: data.titulo,
        introducao: data.introducao,
        analiseTecnica: data.analiseTecnica,
        conclusao: data.conclusao,
        parecerFinal: data.parecerFinal,
        dataFinalizacao: Date.now(),
        dataCriacao: Date.now(),
        dataModificacao: Date.now(),
        sincronizado: false
      };
      
      const db = await getDB();
      
      // Salvar relatório
      await db.add('relatorios', novoRelatorio);
      
      // Atualizar vistoria com o ID do relatório
      const vistoriaAtualizada: Vistoria = {
        ...vistoria,
        relatorioId: novoRelatorio.id,
        dataModificacao: Date.now(),
        sincronizado: false
      };
      
      await db.put('vistorias', vistoriaAtualizada);
      
      // Adicionar à fila de sincronização
      await db.add('sincronizacao', {
        id: generateUniqueId(),
        tabela: 'relatorios',
        operacao: 'inserir',
        dados: novoRelatorio,
        tentativas: 0,
        dataModificacao: Date.now(),
      });
      
      await db.add('sincronizacao', {
        id: generateUniqueId(),
        tabela: 'vistorias',
        operacao: 'atualizar',
        dados: vistoriaAtualizada,
        tentativas: 0,
        dataModificacao: Date.now(),
      });
      
      // Redirecionar para a lista de relatórios
      navigate('/relatorios');
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      alert('Ocorreu um erro ao salvar o relatório. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vistoria || !cliente) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Vistoria não encontrada</h2>
        <p className="text-gray-600 mb-4">Selecione uma vistoria para gerar o relatório.</p>
        <Button onClick={() => navigate('/vistorias')}>
          <ArrowLeft size={18} className="mr-2" />
          Voltar para vistorias
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Relatório</h1>
          <p className="text-gray-600">Gerar relatório técnico da vistoria</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="outline"
            onClick={() => navigate('/relatorios')}
          >
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <Building size={18} className="inline mb-1 mr-2" />
            Dados da Vistoria
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Cliente</p>
              <p className="text-base text-gray-900">{cliente.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Protocolo</p>
              <p className="text-base text-gray-900">{vistoria.protocolo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Data da Vistoria</p>
              <p className="text-base text-gray-900">
                {format(new Date(vistoria.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Assunto</p>
              <p className="text-base text-gray-900">{vistoria.assunto}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              label="Título do Relatório *"
              {...register('titulo', { required: 'Título é obrigatório' })}
              error={errors.titulo?.message}
              placeholder="Ex: Relatório de Vistoria Técnica - Infiltração em Telhado"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Introdução *
            </label>
            <textarea
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              rows={4}
              placeholder="Descreva o objetivo da vistoria e contexto inicial..."
              {...register('introducao', { required: 'Introdução é obrigatória' })}
            ></textarea>
            {errors.introducao && (
              <p className="mt-1 text-sm text-red-600">{errors.introducao.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Análise Técnica *
            </label>
            <textarea
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              rows={8}
              placeholder="Detalhe a análise técnica realizada, incluindo observações e não conformidades encontradas..."
              {...register('analiseTecnica', { required: 'Análise técnica é obrigatória' })}
            ></textarea>
            {errors.analiseTecnica && (
              <p className="mt-1 text-sm text-red-600">{errors.analiseTecnica.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conclusão *
            </label>
            <textarea
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              rows={4}
              placeholder="Apresente a conclusão da análise e recomendações..."
              {...register('conclusao', { required: 'Conclusão é obrigatória' })}
            ></textarea>
            {errors.conclusao && (
              <p className="mt-1 text-sm text-red-600">{errors.conclusao.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parecer Final *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="procedente"
                  {...register('parecerFinal')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-600 mr-2" />
                  <span className="text-sm font-medium">Procedente</span>
                </div>
                <div className="absolute -inset-px rounded-lg border-2 pointer-events-none peer-checked:border-blue-600" aria-hidden="true"></div>
              </label>
              
              <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="improcedente"
                  {...register('parecerFinal')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <XCircle size={20} className="text-red-600 mr-2" />
                  <span className="text-sm font-medium">Improcedente</span>
                </div>
                <div className="absolute -inset-px rounded-lg border-2 pointer-events-none peer-checked:border-blue-600" aria-hidden="true"></div>
              </label>
              
              <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="parcialmente_procedente"
                  {...register('parecerFinal')}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">Parcialmente Procedente</span>
                </div>
                <div className="absolute -inset-px rounded-lg border-2 pointer-events-none peer-checked:border-blue-600" aria-hidden="true"></div>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/relatorios')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              <Save size={18} className="mr-2" />
              Salvar Relatório
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}