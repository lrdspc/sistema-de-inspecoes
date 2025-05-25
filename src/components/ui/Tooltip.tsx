import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = triggerRect.top - tooltipRect.height - 8;
            left =
              triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case 'right':
            top =
              triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            left = triggerRect.right + 8;
            break;
          case 'bottom':
            top = triggerRect.bottom + 8;
            left =
              triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case 'left':
            top =
              triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            left = triggerRect.left - tooltipRect.width - 8;
            break;
        }

        // Adjust position to keep tooltip within viewport
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        if (left < 0) left = 8;
        if (left + tooltipRect.width > viewport.width) {
          left = viewport.width - tooltipRect.width - 8;
        }
        if (top < 0) top = 8;
        if (top + tooltipRect.height > viewport.height) {
          top = viewport.height - tooltipRect.height - 8;
        }

        setTooltipStyle({
          top: `${top}px`,
          left: `${left}px`,
        });
      }
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={tooltipStyle}
          className={cn(
            'fixed z-50 max-w-xs rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-sm',
            'animate-in fade-in zoom-in-95 duration-100',
            position === 'top' && 'data-[state=closed]:slide-out-to-top-2',
            position === 'right' && 'data-[state=closed]:slide-out-to-right-2',
            position === 'bottom' &&
              'data-[state=closed]:slide-out-to-bottom-2',
            position === 'left' && 'data-[state=closed]:slide-out-to-left-2',
            className
          )}
        >
          {content}
          <div
            className={cn(
              'absolute h-2 w-2 rotate-45 bg-gray-900',
              position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
              position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2',
              position === 'bottom' && 'left-1/2 top-[-4px] -translate-x-1/2',
              position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2'
            )}
          />
        </div>
      )}
    </>
  );
}
