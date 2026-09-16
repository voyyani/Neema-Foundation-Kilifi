/**
 * Lightbox controls — share panel, icon and navigation buttons. Split from
 * MediaLightbox by responsibility; URL and touch helpers live in lightboxUtils.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Instagram, Link2, MessageCircle } from 'lucide-react';

interface SharePanelProps {
  caption: string | null | undefined;
  onDismiss: () => void;
}

export const SharePanel: React.FC<SharePanelProps> = ({ caption, onDismiss }) => {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const text = encodeURIComponent(
    `${caption ? caption + ' — ' : ''}Neema Foundation Kilifi ${window.location.href}`,
  );
  const waHref = `https://wa.me/?text=${text}`;
  const igHref = 'https://www.instagram.com/';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute bottom-full mb-3 right-0 min-w-[176px] bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
    >
      <button
        onClick={copyLink}
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
        onClick={onDismiss}
      >
        <MessageCircle className="w-4 h-4 text-green-400" />
        WhatsApp
      </a>
      <a
        href={igHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
        onClick={onDismiss}
      >
        <Instagram className="w-4 h-4 text-pink-400" />
        Instagram
      </a>
    </motion.div>
  );
};


// ─── Sub-components ───────────────────────────────────────────────────────────

interface LightboxIconBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  className?: string;
}

export const LightboxIconBtn: React.FC<LightboxIconBtnProps> = ({
  label,
  active = false,
  children,
  className = '',
  ...props
}) => (
  <button
    aria-label={label}
    aria-pressed={active}
    className={[
      'w-9 h-9 rounded-full flex items-center justify-center',
      'transition-colors duration-150 focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      active
        ? 'bg-brand-600/80 text-white'
        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white',
      className,
    ].join(' ')}
    {...props}
  >
    {children}
  </button>
);

interface LightboxNavBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: 'prev' | 'next';
  'aria-label': string;
}

export const LightboxNavBtn: React.FC<LightboxNavBtnProps> = ({ direction, ...props }) => (
  <button
    {...props}
    className={[
      'absolute z-10 top-1/2 -translate-y-1/2',
      'w-11 h-11 sm:w-14 sm:h-14 rounded-full',
      'bg-black/40 hover:bg-black/60 backdrop-blur-sm',
      'text-white flex items-center justify-center',
      'transition-all duration-150 active:scale-95',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
      direction === 'prev' ? 'left-2 sm:left-4' : 'right-2 sm:right-4',
    ].join(' ')}
  >
    {direction === 'prev' ? (
      <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
    ) : (
      <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
    )}
  </button>
);

