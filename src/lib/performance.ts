import { throttle, debounce } from './utils';

const METRICS_THRESHOLD = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  FCP: 1800,
  TTI: 3800,
  TTFB: 800
};

export { METRICS_THRESHOLD };

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  tti?: number;
}

const metrics: PerformanceMetrics = {};

// Monitora métricas de performance
export const monitorPerformance = () => {
  if ('performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Analisar e reportar métricas importantes
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          if (lcp > METRICS_THRESHOLD.LCP) {
            console.warn(`LCP alto: ${lcp}ms`);
            metrics.lcp = lcp;
          }
        }
        if (entry.entryType === 'first-input-delay') {
          const fid = entry.processingStart - entry.startTime;
          if (fid > METRICS_THRESHOLD.FID) {
            console.warn(`FID alto: ${fid}ms`);
            metrics.fid = fid;
          }
        }
        if (entry.entryType === 'cumulative-layout-shift') {
          const cls = entry.value;
          if (cls > METRICS_THRESHOLD.CLS) {
            console.warn(`CLS alto: ${cls}`);
            metrics.cls = cls;
          }
        }
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
          
          if (metrics.ttfb > METRICS_THRESHOLD.TTFB) {
            console.warn(`TTFB alto: ${metrics.ttfb}ms`);
          }
        }
      }
    });

    observer.observe({ 
      entryTypes: [
        'largest-contentful-paint',
        'first-input-delay',
        'layout-shift',
        'first-contentful-paint',
        'time-to-interactive',
        'navigation'
      ] 
    });
  }
  
  // Report metrics periodically
  setInterval(() => {
    if (Object.keys(metrics).length > 0) {
      reportMetrics(metrics);
    }
  }, 60000);
};

async function reportMetrics(metrics: PerformanceMetrics): Promise<void> {
  try {
    // Em produção, enviar métricas para serviço de analytics
    console.log('Performance Metrics:', metrics);
  } catch (error) {
    console.error('Failed to report metrics:', error);
  }
}

// Otimiza renderização de listas longas
export const optimizeListRendering = (items: any[], pageSize = 20) => {
  const [visibleItems, setVisibleItems] = useState(items.slice(0, pageSize));
  
  const loadMore = useCallback(
    throttle(() => {
      setVisibleItems(prev => [
        ...prev,
        ...items.slice(prev.length, prev.length + pageSize)
      ]);
    }, 300),
    [items, pageSize]
  );

  return { visibleItems, loadMore };
};

// Pré-carrega imagens
export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

// Otimiza inputs com debounce
export const optimizeInput = (callback: (value: string) => void, delay = 300) => {
  return debounce(callback, delay);
};