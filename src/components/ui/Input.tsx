import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    const inputType = showPassword ? 'text' : type;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            className={cn(
              'mb-1 block text-sm font-medium',
              error ? 'text-red-500' : 'text-gray-700'
            )}
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative',
            (leftIcon || rightIcon || showPasswordToggle) && 'flex items-center'
          )}
        >
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex h-full items-center text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus-visible:ring-red-500',
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle) && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          {rightIcon && !showPasswordToggle && (
            <div className="pointer-events-none absolute right-3 flex h-full items-center text-gray-400">
              {rightIcon}
            </div>
          )}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 flex h-full items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Example usage:
/*
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  leftIcon={<Mail className="h-4 w-4" />}
/>

<Input
  label="Password"
  type="password"
  showPasswordToggle
  error="Password is required"
/>
*/
