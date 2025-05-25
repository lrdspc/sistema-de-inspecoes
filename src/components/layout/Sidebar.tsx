import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  Settings,
  Map,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
      count: null,
    },
    {
      icon: FileText,
      label: 'Formulário Rápido',
      path: '/quick-form',
      count: null,
    },
    {
      icon: Users,
      label: 'Clientes',
      path: '/clientes',
      count: 22,
    },
    {
      icon: Calendar,
      label: 'Agenda',
      path: '/agenda',
      count: 15,
    },
    {
      icon: ClipboardCheck,
      label: 'Vistorias',
      path: '/vistorias',
      count: 8,
    },
    {
      icon: FileText,
      label: 'Relatórios',
      path: '/relatorios',
      count: 4,
    },
    {
      icon: Map,
      label: 'Mapa',
      path: '/mapa',
      count: null,
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/configuracoes',
      count: null,
    },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 bg-blue-800 text-white transition-transform duration-300 ease-in-out transform z-20 w-[280px] sm:w-64 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="h-16 px-4 md:px-6 flex items-center border-b border-blue-700">
        <span className="text-xl font-semibold">Sistema de Inspeções</span>
      </div>

      <nav className="mt-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 md:px-4 py-3 text-sm rounded-md transition-colors group',
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700/50'
                  )
                }
              >
                <item.icon
                  size={18}
                  className="mr-3 flex-shrink-0 md:w-5 md:h-5"
                />
                <span className="flex-1">{item.label}</span>
                {item.count !== null && (
                  <span className="ml-auto px-2 py-0.5 text-xs bg-blue-900/50 rounded-full">
                    {item.count}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-blue-900/40 rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-200">Sincronização</span>
            <span className="text-xs text-blue-200">100%</span>
          </div>
          <div className="w-full bg-blue-950 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-blue-200">
            <span>Última atualização: 10:32</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
