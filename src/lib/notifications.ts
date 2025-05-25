const NOTIFICATION_TYPES = {
  SYNC_ERROR: 'sync_error',
  SYNC_SUCCESS: 'sync_success',
  NEW_INSPECTION: 'new_inspection',
  INSPECTION_REMINDER: 'inspection_reminder',
  REPORT_DUE: 'report_due'
} as const;

type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

interface NotificationOptions extends Omit<NotificationOptions, 'icon' | 'badge'> {
  type: NotificationType;
  data?: any;
}

// Solicita permissão para notificações
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
};

// Mostra uma notificação
export const showNotification = (title: string, options: NotificationOptions) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  try {
    new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options
      requireInteraction: options.type === NOTIFICATION_TYPES.INSPECTION_REMINDER,
      actions: getNotificationActions(options.type)
    });
  } catch (error) {
    console.error('Erro ao mostrar notificação:', error);
  }
};

function getNotificationActions(type: NotificationType) {
  switch (type) {
    case NOTIFICATION_TYPES.NEW_INSPECTION:
      return [
        { action: 'view', title: 'Ver Detalhes' },
        { action: 'accept', title: 'Aceitar' }
      ];
    case NOTIFICATION_TYPES.INSPECTION_REMINDER:
      return [
        { action: 'view', title: 'Ver Vistoria' },
        { action: 'snooze', title: 'Adiar 1h' }
      ];
    case NOTIFICATION_TYPES.REPORT_DUE:
      return [
        { action: 'start', title: 'Iniciar Relatório' }
      ];
    default:
      return [];
  }
};