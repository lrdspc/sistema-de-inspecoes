import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export const formatCPFCNPJ = (value: string) => {
  // Remove todos os caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');

  if (numericValue.length <= 11) {
    // CPF: 000.000.000-00
    return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    // CNPJ: 00.000.000/0000-00
    return numericValue.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  }
};

export function formatCEP(cep: string) {
  // Remove todos os caracteres não numéricos
  const numericValue = cep.replace(/\D/g, '');

  // Formata como 00000-000
  return numericValue.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function isPWASupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    !window.location.hostname.includes('stackblitz')
  );
}

export function generateUniqueId(): string {
  return uuidv4();
}

export function convertMillimetersToTwip(mm: number): number {
  // 1 mm = 56.7 twips
  return Math.round(mm * 56.7);
}

export function getInitials(name: string): string {
  if (!name) return '';

  const parts = name.split(' ').filter((part) => part.length > 0);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
