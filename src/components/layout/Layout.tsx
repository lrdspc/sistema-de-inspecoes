import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PWAUpdateNotification } from '../ui/PWAUpdateNotification';
import { PWAInstallBanner } from '../ui/PWAInstallBanner';
import { OfflineNotification } from '../ui/OfflineNotification';
import { SyncStatus } from '../ui/SyncStatus';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineNotification />
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Outlet />
          </main>
        </div>
      </div>
      <PWAUpdateNotification />
      <PWAInstallBanner />
      <div className="fixed bottom-4 left-4">
        <SyncStatus />
      </div>
    </div>
  );
}
