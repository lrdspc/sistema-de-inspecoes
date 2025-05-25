import React, { useState, useRef, useEffect } from 'react';
import { format, isValid, parse, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  error,
  disabled,
  minDate,
  maxDate,
  showTime = false,
  placeholder = 'Selecione uma data',
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedTime, setSelectedTime] = useState(value || new Date());
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

  // Generate calendar days
  const getDaysInMonth = () => {
    const start = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const end = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const days = [];

    // Add previous month's days
    const startDay = start.getDay();
    for (let i = startDay; i > 0; i--) {
      days.push({
        date: new Date(start.getFullYear(), start.getMonth(), -i + 1),
        isCurrentMonth: false,
      });
    }

    // Add current month's days
    for (let i = 1; i <= end.getDate(); i++) {
      days.push({
        date: new Date(start.getFullYear(), start.getMonth(), i),
        isCurrentMonth: true,
      });
    }

    // Add next month's days
    const endDay = end.getDay();
    for (let i = 1; i < 7 - endDay; i++) {
      days.push({
        date: new Date(end.getFullYear(), end.getMonth() + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    const newDate = new Date(date);
    if (showTime) {
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
    }
    onChange(newDate);
    if (!showTime) setIsOpen(false);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
    const newTime = new Date(selectedTime);
    if (type === 'hours') {
      newTime.setHours(value);
    } else {
      newTime.setMinutes(value);
    }
    setSelectedTime(newTime);

    if (value) {
      const newDate = new Date(value);
      newDate.setHours(newTime.getHours());
      newDate.setMinutes(newTime.getMinutes());
      onChange(newDate);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
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
            'flex h-10 w-full items-center rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          disabled={disabled}
        >
          <Calendar size={16} className="mr-2 text-gray-400" />
          <span className="flex-1 text-left">
            {value
              ? format(value, showTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy')
              : placeholder}
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-[280px] rounded-md border border-gray-200 bg-white p-2 shadow-lg">
            {/* Calendar Header */}
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-medium">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
              {getDaysInMonth().map((day, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    !isDateDisabled(day.date) && handleDateSelect(day.date)
                  }
                  className={cn(
                    'h-8 w-8 rounded-full text-sm',
                    !day.isCurrentMonth && 'text-gray-400',
                    day.isCurrentMonth &&
                      !isDateDisabled(day.date) &&
                      'hover:bg-gray-100',
                    value &&
                      day.date.toDateString() === value.toDateString() &&
                      'bg-blue-600 text-white hover:bg-blue-700',
                    isDateDisabled(day.date) && 'cursor-not-allowed opacity-50'
                  )}
                  disabled={isDateDisabled(day.date)}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>

            {/* Time Picker */}
            {showTime && (
              <div className="border-t pt-2">
                <div className="flex items-center justify-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <select
                    value={selectedTime.getHours()}
                    onChange={(e) =>
                      handleTimeChange('hours', parseInt(e.target.value))
                    }
                    className="w-16 rounded-md border p-1 text-sm"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span>:</span>
                  <select
                    value={selectedTime.getMinutes()}
                    onChange={(e) =>
                      handleTimeChange('minutes', parseInt(e.target.value))
                    }
                    className="w-16 rounded-md border p-1 text-sm"
                  >
                    {Array.from({ length: 60 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
