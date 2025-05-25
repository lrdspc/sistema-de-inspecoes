import React, { useEffect, useRef, useState } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholder?: React.ReactNode;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  placeholder,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef} className="w-full">
      {isVisible ? children : placeholder}
    </div>
  );
};

export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}> = ({ src, alt, className = '', placeholderSrc }) => {
  return (
    <LazyLoad
      placeholder={
        placeholderSrc ? (
          <img
            src={placeholderSrc}
            alt={alt}
            className={`${className} animate-pulse`}
          />
        ) : (
          <div className={`${className} bg-gray-200 animate-pulse`} />
        )
      }
    >
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300`}
        loading="lazy"
      />
    </LazyLoad>
  );
};
