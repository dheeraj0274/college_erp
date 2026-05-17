import { useState } from 'react';
import clsx from 'clsx';

export default function Tabs({ tabs, defaultIndex = 0, onChange, className }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleChange = (index) => {
    setActiveIndex(index);
    onChange?.(index);
  };

  return (
    <div className={className}>
      <div className="border-b border-surface-200 dark:border-dark-700">
        <nav className="flex gap-0 -mb-px" aria-label="Tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => handleChange(i)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap',
                activeIndex === i
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300 dark:text-surface-400 dark:hover:text-surface-200'
              )}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={clsx(
                    'text-xs rounded-full px-1.5 py-0.5 font-medium',
                    activeIndex === i
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                      : 'bg-surface-100 text-surface-500 dark:bg-dark-800 dark:text-surface-400'
                  )}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-4">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}
