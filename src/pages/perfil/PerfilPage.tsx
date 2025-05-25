import React from 'react';
import { PageTransition } from '../../components/layout/PageTransition';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Camera,
  Lock,
  Save,
} from 'lucide-react';

export function PerfilPage() {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Informações Pessoais
              </h2>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome Completo"
                  defaultValue="Técnico Demonstração"
                  disabled={!isEditing}
                  icon={<User size={18} className="text-gray-400" />}
                />

                <Input
                  label="E-mail"
                  type="email"
                  defaultValue="tecnico@exemplo.com"
                  disabled={!isEditing}
                  icon={<Mail size={18} className="text-gray-400" />}
                />

                <Input
                  label="Telefone"
                  defaultValue="(11) 98765-4321"
                  disabled={!isEditing}
                  icon={<Phone size={18} className="text-gray-400" />}
                />

                <Input
                  label="Cargo"
                  defaultValue="Técnico"
                  disabled={!isEditing}
                  icon={<Building size={18} className="text-gray-400" />}
                />

                <Input
                  label="Unidade Regional"
                  defaultValue="São Paulo"
                  disabled={!isEditing}
                  icon={<MapPin size={18} className="text-gray-400" />}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save size={18} className="mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Segurança */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Segurança
            </h2>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Senha Atual"
                  type="password"
                  icon={<Lock size={18} className="text-gray-400" />}
                />

                <Input
                  label="Nova Senha"
                  type="password"
                  icon={<Lock size={18} className="text-gray-400" />}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">Alterar Senha</Button>
              </div>
            </form>
          </div>
        </div>

        {/* Barra Lateral */}
        <div className="space-y-6">
          {/* Foto de Perfil */}
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <User size={64} />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <Camera size={18} />
                </button>
              </div>
              <h3 className="font-medium text-gray-900">
                Técnico Demonstração
              </h3>
              <p className="text-sm text-gray-500">Técnico</p>
            </div>

            <Button variant="outline" className="w-full">
              Alterar Foto
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Estatísticas</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Vistorias Realizadas</p>
                <p className="text-2xl font-semibold text-gray-900">127</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Relatórios Gerados</p>
                <p className="text-2xl font-semibold text-gray-900">98</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Taxa de Conclusão</p>
                <p className="text-2xl font-semibold text-green-600">94%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
