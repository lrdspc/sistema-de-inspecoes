interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

class Analytics {
  private static instance: Analytics;
  private events: AnalyticsEvent[] = [];
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncEvents();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  trackEvent(event: AnalyticsEvent): void {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });

    if (this.isOnline) {
      this.syncEvents();
    }
  }

  private async syncEvents(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      // Em produção, enviar para servidor de analytics
      console.log('Syncing analytics events:', this.events);
      this.events = [];
    } catch (error) {
      console.error('Error syncing analytics:', error);
    }
  }

  getMetrics(): any {
    return {
      totalEvents: this.events.length,
      eventsByCategory: this.events.reduce(
        (acc, event) => {
          acc[event.category] = (acc[event.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}

export const analytics = Analytics.getInstance();
