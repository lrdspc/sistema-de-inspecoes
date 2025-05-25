import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import SignatureCanvas from 'react-signature-canvas';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import {
  Camera,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getDB, Vistoria, NaoConformidade } from '../../lib/db';
import { generateUniqueId } from '../../lib/utils';

interface InspecaoFormData {
  observacoes: string;
  naoConformidades: NaoConformidade[];
  assinaturaTecnico: string;
  assinaturaCliente: string;
  fotos: string[];
}

export function InspecaoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [vistoria, setVistoria] = useState<Vistoria | null>(null);
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const signatureTecnicoRef = useRef<SignatureCanvas>(null);
  const signatureClienteRef = useRef<SignatureCanvas>(null);

  const { devices } = useMediaDevices();
  const cameras = devices.filter((device) => device.kind === 'videoinput');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InspecaoFormData>({
    defaultValues: {
      observacoes: '',
      naoConformidades: [],
      assinaturaTecnico: '',
      assinaturaCliente: '',
      fotos: [],
    },
  });

  // Load vistoria data
  useEffect(() => {
    const loadVistoria = async () => {
      if (!id) return;

      try {
        const db = await getDB();
        const vistoriaData = await db.get('vistorias', id);
        if (vistoriaData) {
          setVistoria(vistoriaData);
          // Pre-fill form with existing data if any
          setValue('observacoes', vistoriaData.observacoes || '');
          setValue('naoConformidades', vistoriaData.naoConformidades || []);
          setValue('fotos', vistoriaData.fotos || []);
        }
      } catch (error) {
        console.error('Error loading vistoria:', error);
      }
    };

    loadVistoria();
  }, [id, setValue]);

  // Camera handling
  const startCamera = async (deviceId: string) => {
    try {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });

      videoRef.current.srcObject = stream;
      setActiveCamera(deviceId);
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Erro ao acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setActiveCamera(null);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert to base64 and save
    const photoData = canvas.toDataURL('image/jpeg');
    const currentPhotos = watch('fotos');
    setValue('fotos', [...currentPhotos, photoData]);

    stopCamera();
  };

  const removePhoto = (index: number) => {
    const currentPhotos = watch('fotos');
    setValue(
      'fotos',
      currentPhotos.filter((_, i) => i !== index)
    );
  };

  const addNaoConformidade = () => {
    const currentNCs = watch('naoConformidades');
    setValue('naoConformidades', [
      ...currentNCs,
      {
        id: generateUniqueId(),
        vistoriaId: id || '',
        tipo: '',
        descricao: '',
        confirmada: false,
        observacoes: '',
        fotos: [],
        dataCriacao: Date.now(),
        dataModificacao: Date.now(),
        sincronizado: false,
      },
    ]);
  };

  const removeNaoConformidade = (index: number) => {
    const currentNCs = watch('naoConformidades');
    setValue(
      'naoConformidades',
      currentNCs.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: InspecaoFormData) => {
    if (!id || !vistoria) return;

    try {
      setIsLoading(true);

      // Get signatures
      const assinaturaTecnico = signatureTecnicoRef.current?.toDataURL() || '';
      const assinaturaCliente = signatureClienteRef.current?.toDataURL() || '';

      // Update vistoria
      const updatedVistoria: Vistoria = {
        ...vistoria,
        status: 'concluida',
        observacoes: data.observacoes,
        naoConformidades: data.naoConformidades,
        fotos: data.fotos,
        assinaturaTecnico,
        assinaturaCliente,
        dataModificacao: Date.now(),
        sincronizado: false,
      };

      const db = await getDB();
      await db.put('vistorias', updatedVistoria);

      // Add to sync queue
      await db.add('sincronizacao', {
        id: generateUniqueId(),
        tabela: 'vistorias',
        operacao: 'atualizar',
        dados: updatedVistoria,
        tentativas: 0,
        dataModificacao: Date.now(),
      });

      navigate(`/vistorias/${id}`);
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Erro ao salvar a vistoria. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vistoria) {
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
            Realizar Vistoria
          </h1>
          <p className="text-gray-600">Protocolo: {vistoria.protocolo}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/vistorias/${id}`)}
          >
            <ArrowLeft size={18} className="mr-1" />
            Voltar
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Fotos */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <Camera size={18} className="inline mb-1 mr-2" />
            Registro Fotográfico
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {watch('fotos').map((foto, index) => (
              <div key={index} className="relative">
                <img
                  src={foto}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {!showCamera ? (
            <div className="flex gap-2">
              {cameras.map((camera) => (
                <Button
                  key={camera.deviceId}
                  type="button"
                  variant="outline"
                  onClick={() => startCamera(camera.deviceId)}
                >
                  <Camera size={18} className="mr-2" />
                  {camera.label || 'Câmera'}
                </Button>
              ))}
            </div>
          ) : (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-2xl mx-auto rounded-lg mb-4"
              />
              <div className="flex gap-2 justify-center">
                <Button type="button" onClick={capturePhoto}>
                  Capturar Foto
                </Button>
                <Button type="button" variant="outline" onClick={stopCamera}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Não Conformidades */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <AlertTriangle size={18} className="inline mb-1 mr-2" />
            Não Conformidades
          </h2>

          <div className="space-y-4">
            {watch('naoConformidades').map((nc, index) => (
              <div
                key={nc.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-md font-medium">
                    Não Conformidade #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeNaoConformidade(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      {...register(`naoConformidades.${index}.tipo`)}
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="instalacao">Problema de Instalação</option>
                      <option value="material">Defeito no Material</option>
                      <option value="vedacao">Falha na Vedação</option>
                      <option value="estrutural">Problema Estrutural</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Descrição"
                      {...register(`naoConformidades.${index}.descricao`)}
                      placeholder="Descreva o problema encontrado"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Input
                    label="Observações"
                    {...register(`naoConformidades.${index}.observacoes`)}
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addNaoConformidade}
              className="w-full"
            >
              <Plus size={18} className="mr-2" />
              Adicionar Não Conformidade
            </Button>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            <FileText size={18} className="inline mb-1 mr-2" />
            Observações Gerais
          </h2>

          <textarea
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            rows={4}
            placeholder="Observações gerais sobre a vistoria..."
            {...register('observacoes')}
          />
        </div>

        {/* Assinaturas */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Assinaturas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-2">
                Assinatura do Técnico
              </h3>
              <div className="border border-gray-300 rounded-lg">
                <SignatureCanvas
                  ref={signatureTecnicoRef}
                  canvasProps={{
                    className: 'w-full h-40 rounded-lg',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => signatureTecnicoRef.current?.clear()}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Limpar
              </button>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">
                Assinatura do Cliente
              </h3>
              <div className="border border-gray-300 rounded-lg">
                <SignatureCanvas
                  ref={signatureClienteRef}
                  canvasProps={{
                    className: 'w-full h-40 rounded-lg',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => signatureClienteRef.current?.clear()}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/vistorias/${id}`)}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save size={18} className="mr-2" />
            Finalizar Vistoria
          </Button>
        </div>
      </form>
    </div>
  );
}
