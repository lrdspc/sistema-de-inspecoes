import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/ToastContainer';
import { useToast } from '../../hooks/useToast';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toasts, removeToast } = useToast();

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-64 relative">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay para fechar o sidebar em dispositivos móveis */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}