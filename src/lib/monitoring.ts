import { METRICS_THRESHOLD } from './performance';

interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errors: ErrorReport[] = [];
  private readonly MAX_ERRORS = 100;

  private constructor() {
    this.setupErrorHandlers();
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  private setupErrorHandlers(): void {
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        context: {
          filename: event.filename,
          lineNo: event.lineno,
          colNo: event.colno,
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
      });
    });
  }

  captureError(error: ErrorReport): void {
    this.errors.unshift(error);
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors.pop();
    }
    this.persistErrors();
    this.notifyError(error);
  }

  private persistErrors(): void {
    try {
      localStorage.setItem('app_errors', JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Failed to persist errors:', e);
    }
  }

  private notifyError(error: ErrorReport): void {
    console.error('Application Error:', error);
    // Implementar notificação para equipe de desenvolvimento
  }

  getErrors(): ErrorReport[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
    localStorage.removeItem('app_errors');
  }
}

export const errorMonitor = ErrorMonitor.getInstance();
