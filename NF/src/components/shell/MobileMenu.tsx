import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../ui';
import { INVOLVE_LINKS, PRIMARY_LINKS } from './navLinks';

/**
 * MobileMenu — the book opened flat. A full-height sheet under the header,
 * every destination listed with its one-line description, the Give action
 * pinned at the bottom. Also the "More" panel on desktop.
 */
interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  return (
    <div
      id="site-menu"
      className={clsx(
        'fixed inset-x-0 bottom-0 top-16 z-40 md:top-[72px]',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <div
        className={clsx('absolute inset-0 bg-content/50 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={clsx(
          'paper-ruled-faint absolute inset-y-0 left-0 flex w-full flex-col overflow-y-auto overscroll-contain shadow-sheet-lg transition-transform duration-300 ease-out lg:max-w-md',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ paddingLeft: 'calc(var(--rail) + var(--rail-gap))', paddingRight: 'var(--gutter)' }}
      >
        <span aria-hidden="true" className="margin-rail" />
        <nav aria-label="All pages" className="flex-1 pt-rule">
          <ul className="space-y-1">
            {[{ label: 'Home', to: '/', description: 'Who we are and what we do' }, ...PRIMARY_LINKS].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={onClose}
                  tabIndex={open ? 0 : -1}
                  className="group flex items-baseline justify-between gap-4 rounded py-2 focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none"
                >
                  <span className="font-display uppercase text-display-sm text-content">{l.label}</span>
                  <ArrowRight className="h-5 w-5 shrink-0 self-center text-content-4 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-rule mb-2 text-sm font-semibold text-content-3">Get involved</p>
          <ul className="space-y-1">
            {INVOLVE_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={onClose}
                  tabIndex={open ? 0 : -1}
                  className="group flex items-center justify-between gap-4 rounded py-2 focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none"
                >
                  <span>
                    <span className="block text-base font-semibold text-content">{l.label}</span>
                    {l.description && <span className="block text-sm text-content-3">{l.description}</span>}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-content-4 transition-transform group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sticky bottom-0 mt-rule border-t border-border bg-surface-paper/95 py-4 backdrop-blur-sm safe-bottom">
          <Button to="/donate" size="lg" block onClick={onClose} tabIndex={open ? 0 : -1}>
            Give to the Foundation
          </Button>
          <Link
            to="/admin/login"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded px-1 text-sm font-medium text-content-3 hover:text-content focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none"
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            Staff sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
