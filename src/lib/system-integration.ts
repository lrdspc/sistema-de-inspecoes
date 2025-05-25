// Tipos para as APIs do sistema
interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

// API de Compartilhamento
export const shareApi = {
  async share(data: ShareData) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        return false;
      }
    }
    return false;
  },

  async receiveShare(formData: FormData) {
    const title = formData.get('title') as string;
    const text = formData.get('text') as string;
    const url = formData.get('url') as string;
    const files = formData.getAll('media');
    
    // Processa os dados compartilhados
    return { title, text, url, files };
  }
};

// API de Badges
export const badgeApi = {
  async setBadge(count: number) {
    if ('setAppBadge' in navigator) {
      try {
        await navigator.setAppBadge(count);
        return true;
      } catch (error) {
        console.error('Erro ao definir badge:', error);
        return false;
      }
    }
    return false;
  },

  async clearBadge() {
    if ('clearAppBadge' in navigator) {
      try {
        await navigator.clearAppBadge();
        return true;
      } catch (error) {
        console.error('Erro ao limpar badge:', error);
        return false;
      }
    }
    return false;
  }
};

// API de Manipulação de Arquivos
export const fileApi = {
  async handleFiles(files: FileList) {
    // Implementar lógica de manipulação de arquivos
    const results = [];
    for (const file of files) {
      results.push({
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
    return results;
  },

  async saveFile(fileHandle: any, content: Blob) {
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'documento.pdf',
          types: [{
            description: 'Documento PDF',
            accept: { 'application/pdf': ['.pdf'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return true;
      } catch (error) {
        console.error('Erro ao salvar arquivo:', error);
        return false;
      }
    }
    return false;
  }
};

// API de Notificações
export const notificationApi = {
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  async showNotification(title: string, options: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
        return true;
      } catch (error) {
        console.error('Erro ao mostrar notificação:', error);
        return false;
      }
    }
    return false;
  }
};

// API de Sincronização em Background
export const syncApi = {
  async registerSync(tag: string) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        return true;
      } catch (error) {
        console.error('Erro ao registrar sync:', error);
        return false;
      }
    }
    return false;
  },

  async registerPeriodicSync(tag: string, minInterval: number) {
    if ('serviceWorker' in navigator && 'PeriodicSyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName
        });

        if (status.state === 'granted') {
          await registration.periodicSync.register(tag, {
            minInterval
          });
          return true;
        }
      } catch (error) {
        console.error('Erro ao registrar periodic sync:', error);
      }
    }
    return false;
  }
};

// API de Protocolos
export const protocolApi = {
  async handleProtocol(url: string) {
    const protocolPrefix = 'web+inspecao://';
    if (url.startsWith(protocolPrefix)) {
      const data = url.slice(protocolPrefix.length);
      // Implementar lógica de manipulação do protocolo
      return { type: 'protocol', data };
    }
    return null;
  }
};

// API de Estado de Rede
export const networkApi = {
  isOnline() {
    return navigator.onLine;
  },

  async getConnectionInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        type: connection.type,
        effectiveType: connection.effectiveType,
        saveData: connection.saveData
      };
    }
    return null;
  },

  addOnlineListener(callback: () => void) {
    window.addEventListener('online', callback);
  },

  addOfflineListener(callback: () => void) {
    window.addEventListener('offline', callback);
  },

  removeOnlineListener(callback: () => void) {
    window.removeEventListener('online', callback);
  },

  removeOfflineListener(callback: () => void) {
    window.removeEventListener('offline', callback);
  }
}; 