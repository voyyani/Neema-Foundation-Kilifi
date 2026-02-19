/**
 * MediaLightbox — Immersive fullscreen image viewer
 * Neema Foundation Kilifi · Phase 5
 *
 * Features
 *  • Framer Motion animated backdrop + image slide transitions
 *  • Caption bar: alt text, caption, index counter
 *  • Arrow navigation + keyboard  ← → Esc  f (fullscreen)  i (info overlay)
 *  • Thumbnail strip: horizontal scrollable, active item auto-scrolled into view
 *  • Share: copy link, WhatsApp, Instagram
 *  • Download: full-res via Cloudinary fl_attachment
 *  • Touch: swipe left/right (navigate), swipe down (close), pinch-to-zoom
 *  • Accessibility: role=dialog, aria-label, focus trap, aria-live polite
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Share2,
  Maximize2,
  Minimize2,
  Link2,
  MessageCircle,
  Instagram,
  Check,
} from 'lucide-react';
import type { PublicMediaItem } from '../../hooks/public/usePublicMedia';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaLightboxProps {
  items: PublicMediaItem[];
  startIndex?: number;
  /** Called when the user closes the lightbox */
  onClose: () => void;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Inject a Cloudinary transformation string into a full URL */
function injectTransform(url: string, transform: string): string {
  if (!url) return url;
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return `${url.slice(0, idx + marker.length)}${transform}/${url.slice(idx + marker.length)}`;
  }
  return url;
}

/** Build a download-forced URL via Cloudinary fl_attachment */
function buildDownloadUrl(url: string): string {
  return injectTransform(url, 'fl_attachment');
}

/** Touch distance between two touches */
function touchDist(t: React.TouchList): number {
  const dx = t[0].clientX - t[1].clientX;
  const dy = t[0].clientY - t[1].clientY;
  return Math.hypot(dx, dy);
}

// ─── Share Panel ─────────────────────────────────────────────────────────────

interface SharePanelProps {
  url: string;
  caption: string | null | undefined;
  onDismiss: () => void;
}

const SharePanel: React.FC<SharePanelProps> = ({ url, caption, onDismiss }) => {
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

// ─── MediaLightbox ────────────────────────────────────────────────────────────

const MediaLightbox: React.FC<MediaLightboxProps> = ({
  items,
  startIndex = 0,
  onClose,
}) => {
  const [idx, setIdx] = useState(Math.max(0, Math.min(startIndex, items.length - 1)));
  const [direction, setDirection] = useState<1 | -1>(1);
  const [showInfo, setShowInfo] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pinchScale, setPinchScale] = useState(1);

  const dialogRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastFocusRef = useRef<Element | null>(null);

  // Touch tracking
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const pinchStartDistRef = useRef(0);
  const pinchStartScaleRef = useRef(1);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(next, items.length - 1));
    if (clamped === idx) return;
    setDirection(clamped > idx ? 1 : -1);
    setPinchScale(1); // reset zoom on navigate
    setIdx(clamped);
    setShowShare(false);
  }, [idx, items.length]);

  const prev = useCallback(() => go(idx - 1), [go, idx]);
  const next = useCallback(() => go(idx + 1), [go, idx]);

  // ── Fullscreen ─────────────────────────────────────────────────────────────

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      dialogRef.current?.requestFullscreen().catch(() => {/* ignore */});
    } else {
      document.exitFullscreen().catch(() => {/* ignore */});
    }
  }, []);

  useEffect(() => {
    function onFsChange() { setIsFullscreen(!!document.fullscreenElement); }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Keyboard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't intercept while typing in inputs
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); prev(); break;
        case 'ArrowRight': e.preventDefault(); next(); break;
        case 'Escape':     onClose(); break;
        case 'f':          toggleFullscreen(); break;
        case 'i':          setShowInfo((v) => !v); break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next, onClose, toggleFullscreen]);

  // ── Focus trap ────────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    lastFocusRef.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      // Restore focus on unmount
      (lastFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, []);

  // ── Prevent body scroll ───────────────────────────────────────────────────

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Auto-scroll thumbnail into view ──────────────────────────────────────

  useEffect(() => {
    thumbRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [idx]);

  // ── Touch handlers ────────────────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      pinchStartDistRef.current = touchDist(e.touches);
      pinchStartScaleRef.current = pinchScale;
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 2) return;
    const dist = touchDist(e.touches);
    const ratio = dist / pinchStartDistRef.current;
    const newScale = Math.max(1, Math.min(4, pinchStartScaleRef.current * ratio));
    setPinchScale(newScale);
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.changedTouches.length !== 1 || pinchScale > 1.05) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    const dy = e.changedTouches[0].clientY - touchStartYRef.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx > 50 && absDx > absDy) {
      // Horizontal swipe
      if (dx < 0) next(); else prev();
    } else if (dy > 80 && absDy > absDx) {
      // Swipe down → close
      onClose();
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────

  async function handleDownload() {
    const item = items[idx];
    if (!item) return;
    const downloadUrl = buildDownloadUrl(item.url);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `neema-foundation-${item.id}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ── Current item ──────────────────────────────────────────────────────────

  const item = items[idx];
  if (!item) return null;

  // ── Slide variants ────────────────────────────────────────────────────────

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 80 }),
    center: { opacity: 1, x: 0 },
    exit:  (dir: number) => ({ opacity: 0, x: dir * -80 }),
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render via portal (escapes all stacking contexts)
  // ─────────────────────────────────────────────────────────────────────────

  return ReactDOM.createPortal(
    <motion.div
      key="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-label="Image gallery viewer"
      aria-modal="true"
      ref={dialogRef}
      tabIndex={-1}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={() => { setShowShare(false); }}
    >
      {/* ── aria-live region ─────────────────────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Image {idx + 1} of {items.length}
        {item.alt ? `: ${item.alt}` : ''}
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* TOP BAR                                                          */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Counter */}
        <span className="text-white/60 text-sm tabular-nums select-none font-medium">
          {idx + 1}&thinsp;/&thinsp;{items.length}
        </span>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* Info toggle */}
          <LightboxIconBtn
            label={showInfo ? 'Hide information' : 'Show information'}
            active={showInfo}
            onClick={(e) => { e.stopPropagation(); setShowInfo((v) => !v); }}
          >
            <Info className="w-[18px] h-[18px]" />
          </LightboxIconBtn>

          {/* Share */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <LightboxIconBtn
              label="Share this photo"
              active={showShare}
              onClick={() => setShowShare((v) => !v)}
            >
              <Share2 className="w-[18px] h-[18px]" />
            </LightboxIconBtn>
            <AnimatePresence>
              {showShare && (
                <SharePanel
                  url={item.url}
                  caption={item.caption}
                  onDismiss={() => setShowShare(false)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Download */}
          <LightboxIconBtn label="Download full-resolution photo" onClick={handleDownload}>
            <Download className="w-[18px] h-[18px]" />
          </LightboxIconBtn>

          {/* Fullscreen */}
          <LightboxIconBtn
            label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          >
            {isFullscreen ? (
              <Minimize2 className="w-[18px] h-[18px]" />
            ) : (
              <Maximize2 className="w-[18px] h-[18px]" />
            )}
          </LightboxIconBtn>

          {/* Close */}
          <LightboxIconBtn
            label="Close gallery"
            className="ml-1"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
          >
            <X className="w-5 h-5" />
          </LightboxIconBtn>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* MAIN IMAGE AREA                                                  */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden select-none min-h-0">

        {/* Prev arrow */}
        {idx > 0 && (
          <LightboxNavBtn
            direction="prev"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous image"
          />
        )}

        {/* Image */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={item.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
            className="absolute inset-0 flex items-center justify-center px-14 sm:px-20"
            style={{ cursor: pinchScale > 1 ? 'grab' : 'default' }}
          >
            <img
              src={item.url}
              alt={item.alt ?? item.caption ?? `Photo ${idx + 1}`}
              loading="eager"
              decoding="async"
              draggable={false}
              style={{
                transform: `scale(${pinchScale})`,
                transformOrigin: 'center',
                transition: 'transform 0.1s linear',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '0.5rem',
                userSelect: 'none',
              }}
              onDoubleClick={() => setPinchScale((s) => (s > 1 ? 1 : 2))}
            />
          </motion.div>
        </AnimatePresence>

        {/* Next arrow */}
        {idx < items.length - 1 && (
          <LightboxNavBtn
            direction="next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next image"
          />
        )}

        {/* ── Info overlay (toggle with i / info button) ─────────────── */}
        <AnimatePresence>
          {showInfo && (item.caption || item.alt || item.taken_at) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 inset-x-0 p-5 sm:p-7 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              {item.caption && (
                <p className="text-white text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
                  {item.caption}
                </p>
              )}
              {item.alt && item.alt !== item.caption && (
                <p className="text-white/60 text-xs mt-1 max-w-2xl">{item.alt}</p>
              )}
              {item.taken_at && (
                <p className="text-white/40 text-xs mt-2 uppercase tracking-wide">
                  {new Date(item.taken_at).toLocaleDateString('en-KE', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* CAPTION BAR (always visible)                                     */}
      {/* ──────────────────────────────────────────────────────────────── */}
      {!showInfo && (item.caption || item.alt) && (
        <div className="flex-none px-5 py-2 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-white/70 text-sm truncate max-w-lg mx-auto">
            {item.caption ?? item.alt}
          </p>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* THUMBNAIL STRIP                                                  */}
      {/* ──────────────────────────────────────────────────────────────── */}
      {items.length > 1 && (
        <div
          ref={stripRef}
          className="flex-none flex gap-2 px-4 pb-4 pt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          style={{ scrollSnapType: 'x mandatory' }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((thumb, i) => (
            <button
              key={thumb.id}
              ref={(el) => { thumbRefs.current[i] = el; }}
              onClick={() => go(i)}
              aria-label={`View photo ${i + 1}${thumb.caption ? ': ' + thumb.caption : ''}`}
              aria-current={i === idx ? 'true' : 'false'}
              style={{ scrollSnapAlign: 'center' }}
              className={[
                'flex-none w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden',
                'ring-2 transition-all duration-200 focus-visible:outline-none',
                'focus-visible:ring-[#B01C2E] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                i === idx
                  ? 'ring-[#B01C2E] opacity-100 scale-105'
                  : 'ring-white/0 opacity-50 hover:opacity-80 hover:ring-white/30',
              ].join(' ')}
            >
              <img
                src={
                  thumb.thumbnail_url ??
                  injectTransform(thumb.url, 'w_128,h_128,c_fill,q_auto,f_auto')
                }
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Keyboard hint (desktop) ──────────────────────────────────── */}
      <div className="flex-none pb-3 text-center pointer-events-none select-none hidden sm:block">
        <p className="text-white/20 text-xs tracking-wide">
          ← → navigate &nbsp;·&nbsp; Esc close &nbsp;·&nbsp; F fullscreen &nbsp;·&nbsp; I info &nbsp;·&nbsp; Double-tap to zoom
        </p>
      </div>
    </motion.div>,
    document.body,
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LightboxIconBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  className?: string;
}

const LightboxIconBtn: React.FC<LightboxIconBtnProps> = ({
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
      'focus-visible:ring-2 focus-visible:ring-[#B01C2E] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      active
        ? 'bg-[#B01C2E]/80 text-white'
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

const LightboxNavBtn: React.FC<LightboxNavBtnProps> = ({ direction, ...props }) => (
  <button
    {...props}
    className={[
      'absolute z-10 top-1/2 -translate-y-1/2',
      'w-11 h-11 sm:w-14 sm:h-14 rounded-full',
      'bg-black/40 hover:bg-black/60 backdrop-blur-sm',
      'text-white flex items-center justify-center',
      'transition-all duration-150 active:scale-95',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E]',
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

export default MediaLightbox;
