import React, { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../ui';
import { LOGO_SRC, PRIMARY_LINKS } from './navLinks';
import MobileMenu from './MobileMenu';

/**
 * Navbar — the top edge of every page of the book. Paper ground, the
 * brand written as a name (not a badge), three primary destinations, the
 * Give action in the pen's maroon. On phones: logo, Give, menu.
 *
 * The admin login modal is loaded only when opened so its form libraries
 * stay out of the public bundle.
 */
const AdminLoginModal = React.lazy(() => import('../AdminLoginModal'));

const Navbar: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (location.hash === '#admin') setAdminOpen(true);
  }, [location.hash]);

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-50 bg-surface-paper/95 backdrop-blur-sm transition-shadow duration-300',
          scrolled ? 'shadow-[0_1px_0_0_#E3E0D9,0_8px_24px_-16px_rgba(21,26,34,0.25)]' : 'shadow-[0_1px_0_0_#E3E0D9]',
        )}
      >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <div
        className="relative flex h-16 items-center gap-4 md:h-[72px]"
        style={{ paddingLeft: 'calc(var(--rail) + var(--rail-gap))', paddingRight: 'var(--gutter)' }}
      >
        {/* the rail continues through the header */}
        <span aria-hidden="true" className="margin-rail" />

        <Link to="/" className="flex min-w-0 items-center gap-2.5 overflow-hidden rounded pr-3 focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none sm:gap-3" aria-label="Neema Foundation Kilifi — home">
          <img src={LOGO_SRC} alt="" width={44} height={44} className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" loading="eager" decoding="async" />
          <span className="flex flex-col leading-none">
            <span className="truncate font-display uppercase text-[14px] font-extrabold tracking-normal text-content sm:text-lg" style={{ wordSpacing: '0.2em' }}>Neema Foundation</span>
            <span className="mt-1 hidden whitespace-nowrap text-[11px] font-medium tracking-wide text-content-3 min-[400px]:block sm:text-xs">Kilifi · Ganze Sub-county</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
          {PRIMARY_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'relative rounded px-3 py-2 text-[15px] font-medium text-content-2 transition-colors hover:text-content focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none',
                  isActive && 'text-content pen-underline',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/volunteer"
            className={({ isActive }) =>
              clsx(
                'relative rounded px-3 py-2 text-[15px] font-medium text-content-2 transition-colors hover:text-content focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none',
                isActive && 'text-content pen-underline',
              )
            }
          >
            Get involved
          </NavLink>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button to="/donate" size="sm" className="hidden sm:inline-flex md:h-11 md:px-5 md:text-[15px]">
            Give
          </Button>
          <Button to="/donate" size="sm" className="sm:hidden">
            Give
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="touch-target rounded text-content hover:bg-surface-paper-2 focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none lg:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="hidden items-center gap-2 rounded px-3 py-2 text-[15px] font-medium text-content-2 hover:text-content focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none lg:inline-flex"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            <span>More</span>
          </button>
        </div>
      </div>

      {adminOpen && (
        <Suspense fallback={null}>
          <AdminLoginModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
        </Suspense>
      )}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onAdmin={() => { setMenuOpen(false); setAdminOpen(true); }} />
    </>
  );
};

export default Navbar;
