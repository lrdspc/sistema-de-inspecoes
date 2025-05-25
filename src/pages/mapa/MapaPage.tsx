import React, { useState } from 'react';
import { PageTransition } from '../../components/layout/PageTransition';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Map as MapIcon,
  Search,
  MapPin,
  Navigation,
  List,
  Calendar,
} from 'lucide-react';

export function MapaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'mapa' | 'lista'>('mapa');

  const mockVisitas = [
    {
      id: '1',
      cliente: 'Condomínio Solar das Palmeiras',
      endereco: 'Av. Paulista, 1000 - São Paulo, SP',
      data: new Date(),
      status: 'agendada',
      latitude: -23.5505,
      longitude: -46.6333,
    },
    {
      id: '2',
      cliente: 'Edifício Comercial Infinity',
      endereco: 'Rua Augusta, 500 - São Paulo, SP',
      data: new Date(Date.now() + 86400000),
      status: 'agendada',
      latitude: -23.5505,
      longitude: -46.6333,
    },
  ];

  return (
    <PageTransition>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mapa de Vistorias
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie vistorias geograficamente
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button
            variant={viewType === 'mapa' ? 'primary' : 'outline'}
            onClick={() => setViewType('mapa')}
          >
            <MapIcon size={18} className="mr-2" />
            Mapa
          </Button>
          <Button
            variant={viewType === 'lista' ? 'primary' : 'outline'}
            onClick={() => setViewType('lista')}
          >
            <List size={18} className="mr-2" />
            Lista
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Barra de Ferramentas */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por endereço ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} className="text-gray-400" />}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar size={18} className="mr-2" />
                Filtrar por Data
              </Button>
              <Button>
                <Navigation size={18} className="mr-2" />
                Minha Localização
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-16rem)]">
          {/* Lista de Visitas */}
          <div
            className={`border-r border-gray-200 overflow-y-auto ${viewType === 'lista' ? 'lg:col-span-3' : ''}`}
          >
            <div className="divide-y divide-gray-200">
              {mockVisitas.map((visita) => (
                <div key={visita.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {visita.cliente}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin size={14} className="mr-1" />
                        {visita.endereco}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar size={14} className="mr-1" />
                        {visita.data.toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm">Ver Detalhes</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa */}
          {viewType === 'mapa' && (
            <div className="lg:col-span-2 bg-gray-100 p-4 flex items-center justify-center">
              <div className="text-center">
                <MapIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  O mapa será implementado em breve com integração Google
                  Maps/OpenStreetMap
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
