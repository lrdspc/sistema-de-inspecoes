import { useState, useEffect, useCallback } from 'react';
import {
  shareApi,
  badgeApi,
  fileApi,
  notificationApi,
  syncApi,
  networkApi,
  protocolApi,
} from '../lib/system-integration';

// Hook para compartilhamento
export function useShare() {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare('share' in navigator);
  }, []);

  const share = useCallback(async (data: any) => {
    return shareApi.share(data);
  }, []);

  return { canShare, share };
}

// Hook para badges
export function useBadge() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('setAppBadge' in navigator);
  }, []);

  const setBadge = useCallback(async (count: number) => {
    return badgeApi.setBadge(count);
  }, []);

  const clearBadge = useCallback(async () => {
    return badgeApi.clearBadge();
  }, []);

  return { supported, setBadge, clearBadge };
}

// Hook para notificações
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await notificationApi.requestPermission();
    if (granted) {
      setPermission('granted');
    }
    return granted;
  }, []);

  const showNotification = useCallback(async (title: string, options: NotificationOptions) => {
    return notificationApi.showNotification(title, options);
  }, []);

  return { permission, requestPermission, showNotification };
}

// Hook para estado de rede
export function useNetwork() {
  const [isOnline, setIsOnline] = useState(networkApi.isOnline());
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    networkApi.addOnlineListener(handleOnline);
    networkApi.addOfflineListener(handleOffline);

    // Obter informações iniciais de conexão
    networkApi.getConnectionInfo().then(setConnectionInfo);

    return () => {
      networkApi.removeOnlineListener(handleOnline);
      networkApi.removeOfflineListener(handleOffline);
    };
  }, []);

  return { isOnline, connectionInfo };
}

// Hook para sincronização em background
export function useBackgroundSync() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'SyncManager' in window);
  }, []);

  const registerSync = useCallback(async (tag: string) => {
    return syncApi.registerSync(tag);
  }, []);

  const registerPeriodicSync = useCallback(async (tag: string, minInterval: number) => {
    return syncApi.registerPeriodicSync(tag, minInterval);
  }, []);

  return { supported, registerSync, registerPeriodicSync };
}

// Hook para manipulação de arquivos
export function useFileSystem() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('showOpenFilePicker' in window);
  }, []);

  const handleFiles = useCallback(async (files: FileList) => {
    return fileApi.handleFiles(files);
  }, []);

  const saveFile = useCallback(async (content: Blob) => {
    return fileApi.saveFile(null, content);
  }, []);

  return { supported, handleFiles, saveFile };
}

// Hook para protocolos personalizados
export function useProtocolHandler() {
  const handleProtocol = useCallback(async (url: string) => {
    return protocolApi.handleProtocol(url);
  }, []);

  return { handleProtocol };
} 