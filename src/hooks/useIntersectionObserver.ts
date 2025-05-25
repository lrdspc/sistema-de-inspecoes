import { useInView } from 'react-intersection-observer';

export function useIntersectionObserver(options = {}) {
  const { ref, inView, entry } = useInView({
    threshold: 0,
    triggerOnce: true,
    ...options
  });

  return { ref, inView, entry };
}