import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export default function Modal({ isOpen, onClose, title, description, size = 'md', children }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-[0.98] translate-y-1"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-[0.98] translate-y-1"
            >
              <DialogPanel
                className={clsx(
                  'w-full rounded-xl bg-white shadow-xl dark:bg-dark-900',
                  'border border-surface-200 dark:border-dark-700',
                  sizes[size]
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-dark-700">
                  <div>
                    <DialogTitle className="text-base font-semibold text-surface-900 dark:text-surface-100">
                      {title}
                    </DialogTitle>
                    {description && (
                      <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-dark-800 dark:hover:text-surface-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function ModalFooter({ children, className }) {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-2 pt-4 mt-4 border-t border-surface-200 dark:border-dark-700',
        className
      )}
    >
      {children}
    </div>
  );
}
