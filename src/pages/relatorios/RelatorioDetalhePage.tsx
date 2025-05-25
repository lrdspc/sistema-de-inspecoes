import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Building,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Camera,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getDB, Relatorio, Vistoria, Cliente } from '../../lib/db';
import { generatePDF } from '../../lib/pdf';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RelatorioDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [vistoria, setVistoria] = useState<Vistoria | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const db = await getDB();

        // Buscar relatório
        const relatorioData = await db.get('relatorios', id);
        if (relatorioData) {
          setRelatorio(relatorioData);

          // Buscar vistoria relacionada
          const vistoriaData = await db.get(
            'vistorias',
            relatorioData.vistoriaId
          );
          if (vistoriaData) {
            setVistoria(vistoriaData);

            // Buscar cliente
            const clienteData = await db.get(
              'clientes',
              vistoriaData.clienteId
            );
            if (clienteData) {
              setCliente(clienteData);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do relatório:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!relatorio || !vistoria || !cliente) return;

    try {
      setIsGeneratingPDF(true);

      const pdf = await generatePDF({
        relatorio,
        vistoria,
        cliente,
      });

      // Download do arquivo
      pdf.save(`relatorio-${vistoria.protocolo}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

  const getParecerIcon = (parecer: string) => {
    switch (parecer) {
      case 'procedente':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'improcedente':
        return <XCircle size={18} className="text-red-600" />;
      case 'parcialmente_procedente':
        return <AlertTriangle size={18} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!relatorio || !vistoria || !cliente) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Relatório não encontrado
        </h2>
        <p className="text-gray-600 mb-4">
          O relatório que você está procurando não existe ou foi removido.
        </p>
        <Button onClick={() => navigate('/relatorios')}>
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
            Relatório Técnico
          </h1>
          <p className="text-gray-600">Protocolo: {vistoria.protocolo}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button variant="outline" onClick={() => navigate('/relatorios')}>
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>

          {relatorio.dataFinalizacao && (
            <Button onClick={handleDownloadPDF} isLoading={isGeneratingPDF}>
              <Download size={18} className="mr-1" />
              {isGeneratingPDF ? 'Gerando PDF...' : 'Download PDF'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo do Relatório */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {relatorio.titulo}
              </h2>

              {relatorio.parecerFinal && (
                <div
                  className={cn(
                    'px-3 py-1 rounded-full flex items-center',
                    getParecerColor(relatorio.parecerFinal)
                  )}
                >
                  {getParecerIcon(relatorio.parecerFinal)}
                  <span className="ml-2 text-sm font-medium">
                    {getParecerLabel(relatorio.parecerFinal)}
                  </span>
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Introdução
                </h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {relatorio.introducao}
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Análise Técnica
                </h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {relatorio.analiseTecnica}
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Conclusão
                </h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {relatorio.conclusao}
                </div>
              </section>

              {vistoria.naoConformidades &&
                vistoria.naoConformidades.length > 0 && (
                  <section className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Não Conformidades Identificadas
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
                              <p className="text-base text-gray-900">
                                {nc.tipo}
                              </p>
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
                  </section>
                )}

              {vistoria.fotos && vistoria.fotos.length > 0 && (
                <section className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Registro Fotográfico
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {vistoria.fotos.map((foto, index) => (
                      <div key={index} className="relative">
                        <img
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          Foto {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Informações Laterais */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status do Relatório */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <FileText size={18} className="inline mb-1 mr-2" />
              Status do Relatório
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Data de Criação
                </p>
                <p className="text-base text-gray-900">
                  {format(
                    new Date(relatorio.dataCriacao),
                    "dd 'de' MMMM 'de' yyyy",
                    { locale: ptBR }
                  )}
                </p>
              </div>

              {relatorio.dataFinalizacao && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Data de Finalização
                  </p>
                  <p className="text-base text-gray-900">
                    {format(
                      new Date(relatorio.dataFinalizacao),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Status de Sincronização
                </p>
                <div
                  className={cn(
                    'mt-1 px-2 py-1 rounded-full text-xs inline-flex items-center',
                    relatorio.sincronizado
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {relatorio.sincronizado ? (
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

          {/* Dados da Vistoria */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              <ClipboardCheck size={18} className="inline mb-1 mr-2" />
              Dados da Vistoria
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Protocolo</p>
                <p className="text-base text-gray-900">{vistoria.protocolo}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Data da Vistoria
                </p>
                <p className="text-base text-gray-900">
                  {format(new Date(vistoria.data), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Assunto</p>
                <p className="text-base text-gray-900">{vistoria.assunto}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-2">
                  <Building size={16} className="inline mb-1 mr-1" />
                  Cliente
                </h3>
                <p className="text-base text-gray-900">{cliente.nome}</p>
                <p className="text-sm text-gray-500">
                  {cliente.logradouro}, {cliente.numero}
                  {cliente.complemento && `, ${cliente.complemento}`}
                </p>
                <p className="text-sm text-gray-500">
                  {cliente.bairro}, {cliente.cidade}/{cliente.estado}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ações</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/vistorias/${vistoria.id}`)}
              >
                <ClipboardCheck size={18} className="mr-2" />
                Ver Vistoria
              </Button>

              {relatorio.dataFinalizacao && (
                <Button
                  className="w-full justify-start"
                  onClick={handleDownloadPDF}
                  isLoading={isGeneratingPDF}
                >
                  <Download size={18} className="mr-2" />
                  {isGeneratingPDF ? 'Gerando PDF...' : 'Download PDF'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
