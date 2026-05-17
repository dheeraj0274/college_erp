import { forwardRef } from 'react';
import clsx from 'clsx';

const variants = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm',
  secondary:
    'bg-surface-100 text-surface-700 hover:bg-surface-200 focus-visible:ring-surface-400 dark:bg-dark-800 dark:text-surface-200 dark:hover:bg-dark-700',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 focus-visible:ring-danger-500 shadow-sm',
  ghost:
    'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-dark-800 dark:hover:text-surface-100',
  outline:
    'border border-surface-300 text-surface-700 hover:bg-surface-50 focus-visible:ring-surface-400 dark:border-dark-700 dark:text-surface-300 dark:hover:bg-dark-800',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
  xl: 'h-11 px-6 text-base gap-2.5',
};

const Button = forwardRef(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'dark:focus-visible:ring-offset-dark-950',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
