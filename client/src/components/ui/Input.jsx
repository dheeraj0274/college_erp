import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(
  ({ className, label, error, icon: Icon, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-4 w-4 text-surface-400" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'block w-full rounded-lg border bg-white px-3 py-2 text-sm',
              'placeholder:text-surface-400',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
              'dark:bg-dark-900 dark:text-surface-100 dark:placeholder:text-surface-500',
              error
                ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500'
                : 'border-surface-300 dark:border-dark-700',
              Icon && 'pl-9',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger-500">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-surface-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
