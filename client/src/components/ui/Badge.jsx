import clsx from 'clsx';

const variants = {
  default: 'bg-surface-100 text-surface-700 dark:bg-dark-800 dark:text-surface-300',
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-500',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-500',
  accent: 'bg-accent-500/10 text-accent-600 dark:text-accent-400',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-xs',
};

export default function Badge({ variant = 'default', size = 'md', dot, className, children }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-md gap-1',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', {
            'bg-surface-500': variant === 'default',
            'bg-primary-500': variant === 'primary',
            'bg-success-500': variant === 'success',
            'bg-warning-500': variant === 'warning',
            'bg-danger-500': variant === 'danger',
            'bg-accent-500': variant === 'accent',
          })}
        />
      )}
      {children}
    </span>
  );
}
