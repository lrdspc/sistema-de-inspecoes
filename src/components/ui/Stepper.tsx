import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface StepperProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function Stepper({
  steps,
  orientation = 'horizontal',
  onStepClick,
  className,
}: StepperProps) {
  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-white" />;
      case 'error':
        return <X className="h-5 w-5 text-white" />;
      default:
        return null;
    }
  };

  const getStepNumber = (index: number, status: Step['status']) => {
    if (status === 'completed' || status === 'error') {
      return getStepIcon(status);
    }
    return index + 1;
  };

  return (
    <div
      className={cn(
        'w-full',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
    >
      <div
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col space-y-4' : 'space-x-4'
        )}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className={cn(
                'flex',
                orientation === 'vertical'
                  ? 'flex-row items-start'
                  : 'flex-col items-center'
              )}
            >
              {/* Step Circle */}
              <div className="relative flex items-center">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                    step.status === 'completed' &&
                      'bg-green-600 text-white hover:bg-green-700',
                    step.status === 'current' &&
                      'border-2 border-blue-600 bg-white text-blue-600',
                    step.status === 'error' &&
                      'bg-red-600 text-white hover:bg-red-700',
                    step.status === 'pending' &&
                      'border-2 border-gray-300 bg-white text-gray-500',
                    onStepClick && 'cursor-pointer'
                  )}
                  disabled={!onStepClick}
                >
                  {getStepNumber(index, step.status)}
                </button>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      orientation === 'vertical'
                        ? 'absolute left-4 top-8 h-full w-0.5'
                        : 'absolute left-8 top-4 h-0.5 w-full',
                      step.status === 'completed'
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    )}
                  />
                )}
              </div>

              {/* Step Content */}
              <div
                className={cn(
                  'flex flex-col',
                  orientation === 'vertical'
                    ? 'ml-4'
                    : 'mt-2 items-center text-center'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-medium',
                    step.status === 'completed' && 'text-green-600',
                    step.status === 'current' && 'text-blue-600',
                    step.status === 'error' && 'text-red-600',
                    step.status === 'pending' && 'text-gray-500'
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span
                    className={cn(
                      'mt-0.5 text-xs',
                      step.status === 'pending'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    )}
                  >
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
