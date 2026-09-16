import React from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import clsx from 'clsx';

/**
 * Modal — a sheet placed on the desk. Headless UI handles focus trapping,
 * Escape, and restoring focus. Reserved for tasks that need protected focus
 * (a form, a confirmation); browsing content is a route, not a modal.
 *
 * On phones the sheet rises from the bottom edge; on wider screens it
 * centres. Motion is one ease-out; reduced motion collapses it.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** Hide the visible title but keep it for assistive tech */
  titleHidden?: boolean;
  description?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Sticky footer (actions) */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** Remove body padding, e.g. for media */
  bare?: boolean;
  initialFocus?: React.MutableRefObject<HTMLElement | null>;
}

const sizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

const Modal: React.FC<ModalProps> = ({
  open, onClose, title, titleHidden = false, description, size = 'md', footer, children, bare = false, initialFocus,
}) => (
  <Transition show={open} as={React.Fragment}>
    <Dialog onClose={onClose} initialFocus={initialFocus} className="relative z-[100]">
      <TransitionChild
        as={React.Fragment}
        enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
        leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-content/60" aria-hidden="true" />
      </TransitionChild>

      <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-6">
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0 translate-y-8 sm:translate-y-2 sm:scale-[0.98]" enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-6 sm:translate-y-2 sm:scale-[0.98]"
        >
          <DialogPanel
            className={clsx(
              'relative flex max-h-[92dvh] w-full flex-col bg-surface-paper text-content shadow-sheet-lg',
              'rounded-t-xl sm:rounded-xl',
              sizes[size],
            )}
          >
            <div className={clsx('flex items-start gap-4 border-b border-border', bare ? 'px-4 py-3 sm:px-5' : 'px-5 py-4 sm:px-6')}>
              <div className="min-w-0 flex-1">
                <DialogTitle
                  as="h2"
                  className={clsx(titleHidden ? 'sr-only' : 'font-display uppercase text-display-sm text-content')}
                >
                  {title}
                </DialogTitle>
                {description && <p className="mt-1 text-sm text-content-3">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="touch-target -mr-2 -mt-1 rounded text-content-3 hover:bg-surface-paper-2 hover:text-content focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className={clsx('min-h-0 flex-1 overflow-y-auto overscroll-contain', !bare && 'px-5 py-5 sm:px-6')}>
              {children}
            </div>

            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-paper px-5 py-4 sm:flex-row sm:justify-end sm:px-6 safe-bottom">
                {footer}
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </Transition>
);

export default Modal;
