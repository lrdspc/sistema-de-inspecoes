import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { sampleSize, random } from 'lodash';
import {
  FileText,
  Wand2,
  Building,
  Calendar,
  MapPin,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getDB, Cliente, Vistoria } from '../lib/db';
import { generateUniqueId } from '../lib/utils';
import { generateWordDoc } from '../lib/word';
import { Packer } from 'docx';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

interface QuickFormData {
  cliente: string;
  empreendimento: string;
  cidade: string;
  estado: string;
  endereco: string;
  protocolo: string;
  assunto: string;
  modeloTelha: string;
  quantidadeTelhas: number;
  areaCoberta: number;
  naoConformidades: string[];
}

export function QuickFormPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<QuickFormData>({
    defaultValues: {
      empreendimento: 'Residencial',
      estado: 'PR',
      modeloTelha: 'Ondulada 6mm CRFS',
      naoConformidades: [],
    },
  });

  const onSubmit = async (data: QuickFormData) => {
    try {
      setIsLoading(true);

      // Generate document using template
      const doc = await generateWordDoc({
        ...data,
        dataVistoria: new Date().toLocaleDateString('pt-BR'),
        tecnico: 'Técnico Demonstração',
        departamento: 'Assistência Técnica',
        unidade: 'PR',
        coordenador: 'Marlon Weingartner',
        gerente: 'Elisabete Kudo',
        regional: 'Sul',
      });

      // Convert to blob and download
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${data.protocolo}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert(
        'Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomData = () => {
    // Random client names
    const firstNames = [
      'Condomínio',
      'Edifício',
      'Residencial',
      'Centro Comercial',
      'Empresa',
    ];
    const lastNames = [
      'das Palmeiras',
      'Solar',
      'Vista Verde',
      'Horizonte',
      'Central',
    ];
    setValue(
      'cliente',
      `${firstNames[random(0, firstNames.length - 1)]} ${lastNames[random(0, lastNames.length - 1)]}`
    );

    // Random type
    setValue(
      'empreendimento',
      ['Residencial', 'Comercial', 'Industrial'][random(0, 2)]
    );

    // Random city and state
    const cities = ['Curitiba', 'São Paulo', 'Florianópolis', 'Porto Alegre'];
    const states = ['PR', 'SP', 'SC', 'RS'];
    const cityIndex = random(0, cities.length - 1);
    setValue('cidade', cities[cityIndex]);
    setValue('estado', states[cityIndex]);

    // Random address
    const streets = [
      'Rua das Flores',
      'Avenida Brasil',
      'Rua XV de Novembro',
      'Avenida Paulista',
    ];
    setValue(
      'endereco',
      `${streets[random(0, streets.length - 1)]}, ${random(100, 9999)}`
    );

    // Random protocol
    setValue(
      'protocolo',
      `FAR${new Date().getFullYear()}${String(random(1000, 9999)).padStart(4, '0')}`
    );

    // Random subject
    const subjects = [
      'Infiltração no telhado',
      'Vazamento',
      'Inspeção de rotina',
      'Avaliação técnica',
    ];
    setValue('assunto', subjects[random(0, subjects.length - 1)]);

    // Random product info
    setValue(
      'modeloTelha',
      [
        'Ondulada 5mm CRFS',
        'Ondulada 6mm CRFS',
        'Ondulada 8mm CRFS',
        'Estrutural',
      ][random(0, 3)]
    );
    setValue('quantidadeTelhas', random(50, 500));
    setValue('areaCoberta', random(100, 1000));

    // Random non-conformities (2 to 4 random items)
    const selectedNCs = sampleSize(
      Array.from({ length: 14 }, (_, i) => String(i + 1)),
      random(2, 4)
    );
    setValue('naoConformidades', selectedNCs);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Formulário Rápido</h1>
        <p className="text-gray-600">Gere relatórios técnicos rapidamente</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <Wand2 size={18} className="inline mb-1 mr-2" />
              Dados do Relatório
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={generateRandomData}
              className="flex items-center"
            >
              <Sparkles size={18} className="mr-2" />
              Gerar Dados Aleatórios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Cliente e Empreendimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Cliente *"
                {...register('cliente', { required: 'Cliente é obrigatório' })}
                error={errors.cliente?.message}
                icon={<Building size={18} className="text-gray-400" />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Empreendimento *
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  {...register('empreendimento', { required: true })}
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
            </div>

            {/* Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Cidade *"
                {...register('cidade', { required: 'Cidade é obrigatória' })}
                error={errors.cidade?.message}
                icon={<MapPin size={18} className="text-gray-400" />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  {...register('estado', { required: true })}
                >
                  <option value="PR">Paraná</option>
                  <option value="SP">São Paulo</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="RS">Rio Grande do Sul</option>
                </select>
              </div>

              <Input
                label="Endereço *"
                {...register('endereco', {
                  required: 'Endereço é obrigatório',
                })}
                error={errors.endereco?.message}
                icon={<MapPin size={18} className="text-gray-400" />}
              />
            </div>

            {/* Protocolo e Assunto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Protocolo FAR *"
                {...register('protocolo', {
                  required: 'Protocolo é obrigatório',
                })}
                error={errors.protocolo?.message}
                icon={<FileText size={18} className="text-gray-400" />}
              />

              <Input
                label="Assunto *"
                {...register('assunto', { required: 'Assunto é obrigatório' })}
                error={errors.assunto?.message}
                placeholder="Ex: Infiltração, Vazamento, etc."
              />
            </div>

            {/* Informações do Produto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo da Telha *
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  {...register('modeloTelha', { required: true })}
                >
                  <option value="Ondulada 5mm CRFS">Ondulada 5mm CRFS</option>
                  <option value="Ondulada 6mm CRFS">Ondulada 6mm CRFS</option>
                  <option value="Ondulada 8mm CRFS">Ondulada 8mm CRFS</option>
                  <option value="Estrutural">Estrutural</option>
                </select>
              </div>

              <Input
                label="Quantidade de Telhas *"
                type="number"
                {...register('quantidadeTelhas', {
                  required: 'Quantidade é obrigatória',
                  min: { value: 1, message: 'Quantidade inválida' },
                })}
                error={errors.quantidadeTelhas?.message}
              />

              <Input
                label="Área Coberta (m²) *"
                type="number"
                {...register('areaCoberta', {
                  required: 'Área é obrigatória',
                  min: { value: 1, message: 'Área inválida' },
                })}
                error={errors.areaCoberta?.message}
              />
            </div>

            {/* Não Conformidades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle size={18} className="inline mb-1 mr-2" />
                Não Conformidades *
              </label>
              <div className="space-y-2">
                {Array.from({ length: 14 }, (_, i) => i + 1).map((id) => (
                  <label key={id} className="flex items-start">
                    <input
                      type="checkbox"
                      value={id}
                      {...register('naoConformidades', {
                        required: 'Selecione pelo menos uma não conformidade',
                      })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {id}. Não Conformidade {id}
                    </span>
                  </label>
                ))}
              </div>
              {errors.naoConformidades && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.naoConformidades.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                <FileText size={18} className="mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
