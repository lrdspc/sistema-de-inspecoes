import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([
    { id: 1, title: 'Relatório pendente', description: 'Cliente XYZ - Há 2 dias', unread: true },
    { id: 2, title: 'Nova vistoria agendada', description: 'Amanhã - 14:00', unread: true },
    { id: 3, title: 'Lembrete de vistoria', description: 'Hoje - 16:30', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-3 md:px-4 h-16 flex items-center justify-between">
        {/* Logo e Botão de menu móvel */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-3 p-2 rounded-md text-gray-500 lg:hidden hover:bg-gray-100"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center">
            <span className="text-lg md:text-xl font-semibold text-blue-800">Sistema</span>
            <span className="text-lg md:text-xl font-light text-gray-600 ml-1">Inspeções</span>
          </div>
        </div>

        {/* Ações do usuário */}
        <div className="flex items-center">
          {/* Notificações */}
          <div className="relative mr-2 md:mr-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 relative"
            >
              <Bell size={18} className="md:w-5 md:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de notificações */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold">Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 hover:bg-gray-50 cursor-pointer",
                          notification.unread ? "bg-blue-50" : ""
                        )}
                        onClick={() => {
                          setNotifications(prev => 
                            prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
                          );
                        }}
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      Não há notificações
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Perfil do usuário */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(prev => !prev)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm"> 
                <span>TD</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">Técnico Demo</p>
                <p className="text-xs text-gray-500">Técnico</p>
              </div>
            </button>

            {/* Menu dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Técnico Demo</p>
                  <p className="text-xs text-gray-500">tecnico@exemplo.com</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => navigate('/perfil')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => navigate('/configuracoes')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Configurações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}