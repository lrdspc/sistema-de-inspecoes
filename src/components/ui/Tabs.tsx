import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: '0px',
    width: '0px',
  });

  useEffect(() => {
    updateIndicator();
  }, [activeTab]);

  const updateIndicator = () => {
    const activeElement = document.getElementById(`tab-${activeTab}`);
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevTab = tabs[currentIndex - 1];
          if (!prevTab.disabled) {
            handleTabClick(prevTab.id);
          }
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < tabs.length - 1) {
          const nextTab = tabs[currentIndex + 1];
          if (!nextTab.disabled) {
            handleTabClick(nextTab.id);
          }
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(tabId);
        break;
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <div
          className={cn(
            'flex',
            fullWidth ? 'w-full' : 'inline-flex',
            variant === 'pills' && 'p-1 bg-gray-100 rounded-lg',
            variant === 'underline' && 'border-b border-gray-200'
          )}
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => !tab.disabled && handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                fullWidth && 'flex-1 text-center',
                tab.disabled && 'cursor-not-allowed opacity-50',
                variant === 'default' &&
                  (activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'),
                variant === 'pills' &&
                  (activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-500 hover:text-gray-900'),
                variant === 'underline' &&
                  (activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700')
              )}
              disabled={tab.disabled}
            >
              {tab.label}
            </button>
          ))}

          {variant === 'underline' && (
            <div
              className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-200"
              style={indicatorStyle}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            className={cn(
              'focus:outline-none',
              activeTab === tab.id ? 'block' : 'hidden'
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
