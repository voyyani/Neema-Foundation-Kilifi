import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LOGO_SRC } from '../../../components/shell/navLinks';

/**
 * AuthThreshold — the page frame shared by sign-in, forgot-password and
 * reset-password. Drawn in the public site's exercise-book world (paper,
 * margin rail, display heading) because it is the doorway between the
 * website and the portal; the admin's own system starts after sign-in.
 */
interface AuthThresholdProps {
  title: string;
  lede?: React.ReactNode;
  children: React.ReactNode;
  /** Footer link; defaults to the website */
  back?: { to: string; label: string };
}

const rail = { paddingLeft: 'calc(var(--rail) + var(--rail-gap))', paddingRight: 'var(--gutter)' } as const;

const AuthThreshold: React.FC<AuthThresholdProps> = ({
  title, lede, children, back = { to: '/', label: 'Back to the website' },
}) => (
  <div className="paper-ruled-faint relative flex min-h-screen flex-col">
    <span aria-hidden="true" className="margin-rail" />

    <header className="flex h-16 items-center md:h-[72px]" style={rail}>
      <Link
        to="/"
        className="flex min-w-0 items-center gap-2.5 rounded pr-3 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-600/35 sm:gap-3"
        aria-label="Neema Foundation Kilifi — back to the website"
      >
        <img src={LOGO_SRC} alt="" width={44} height={44} className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" decoding="async" />
        <span className="flex flex-col leading-none">
          <span className="truncate font-display uppercase text-[14px] font-extrabold text-content sm:text-lg" style={{ wordSpacing: '0.2em' }}>
            Neema Foundation
          </span>
          <span className="mt-1 hidden whitespace-nowrap text-[11px] font-medium tracking-wide text-content-3 min-[400px]:block sm:text-xs">
            Kilifi · Ganze Sub-county
          </span>
        </span>
      </Link>
    </header>

    <main id="main" className="flex flex-1 flex-col justify-center py-10 md:py-16" style={rail}>
      <div className="w-full max-w-md">
        <h1 className="font-display uppercase text-display-md text-content text-balance">{title}</h1>
        {lede && <p className="mt-3 max-w-prose text-base leading-relaxed text-content-2">{lede}</p>}
        {children}
        <Link
          to={back.to}
          className="mt-10 inline-flex items-center gap-1.5 rounded text-sm font-medium text-content-2 hover:text-content focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-600/35"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {back.label}
        </Link>
      </div>
    </main>
  </div>
);

export default AuthThreshold;
