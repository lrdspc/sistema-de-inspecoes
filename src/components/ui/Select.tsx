import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  label,
  error,
  disabled,
  loading,
  multiple = false,
  searchable = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection
  const handleSelect = (option: SelectOption) => {
    if (multiple) {
      const currentValue = (value as string[]) || [];
      const newValue = currentValue.includes(option.value)
        ? currentValue.filter((v) => v !== option.value)
        : [...currentValue, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  // Get selected option(s) label
  const getSelectedLabel = () => {
    if (multiple) {
      const selectedValues = (value as string[]) || [];
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        return options.find((opt) => opt.value === selectedValues[0])?.label;
      }
      return `${selectedValues.length} selecionados`;
    }
    return options.find((opt) => opt.value === value)?.label || placeholder;
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{getSelectedLabel()}</span>
          <ChevronDown
            size={16}
            className={cn('transition-transform', isOpen && 'rotate-180')}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {searchable && (
              <div className="p-2 border-b">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-auto">
              {loading ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  Carregando...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-2 text-center text-sm text-gray-500">
                  Nenhum resultado encontrado
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = multiple
                    ? (value as string[])?.includes(option.value)
                    : value === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={cn(
                        'flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100',
                        isSelected && 'bg-blue-50 text-blue-600'
                      )}
                    >
                      {multiple && (
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded border',
                            isSelected
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          )}
                        >
                          {isSelected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                      )}
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
