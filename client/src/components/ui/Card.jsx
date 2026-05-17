import clsx from 'clsx';

export default function Card({ className, children, padding = true, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-surface-200 shadow-sm',
        'dark:bg-dark-900 dark:border-dark-700',
        hover && 'hover:shadow-md hover:border-surface-300 dark:hover:border-dark-600 transition-all duration-150',
        padding && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={clsx('text-base font-medium text-surface-900 dark:text-surface-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={clsx('text-sm text-surface-500 dark:text-surface-400', className)} {...props}>
      {children}
    </p>
  );
}
