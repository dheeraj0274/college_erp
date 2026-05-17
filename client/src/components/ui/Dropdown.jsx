import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import clsx from 'clsx';

export default function Dropdown({ trigger, items, align = 'right', className }) {
  return (
    <Menu as="div" className={clsx('relative', className)}>
      <MenuButton as={Fragment}>{trigger}</MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 scale-[0.97] translate-y-0.5"
        enterTo="opacity-100 scale-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-[0.97]"
      >
        <MenuItems
          className={clsx(
            'absolute z-50 mt-1.5 w-56 rounded-lg bg-white dark:bg-dark-900',
            'border border-surface-200 dark:border-dark-700',
            'shadow-lg shadow-black/5 dark:shadow-black/20',
            'py-1 focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} className="my-1 border-t border-surface-100 dark:border-dark-700" />;
            }

            return (
              <MenuItem key={i}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-surface-50 text-surface-900 dark:bg-dark-800 dark:text-surface-100'
                        : 'text-surface-700 dark:text-surface-300',
                      item.danger && active && 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400',
                      item.danger && !active && 'text-danger-600 dark:text-danger-400'
                    )}
                  >
                    {item.icon && <item.icon className="h-4 w-4 opacity-60" />}
                    {item.label}
                  </button>
                )}
              </MenuItem>
            );
          })}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
