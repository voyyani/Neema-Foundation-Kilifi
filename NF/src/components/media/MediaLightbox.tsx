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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Download, Info, Share2, Maximize2, Minimize2 } from 'lucide-react';
import type { PublicMediaItem } from '../../hooks/public/usePublicMedia';
import { LightboxIconBtn, LightboxNavBtn, SharePanel } from './LightboxControls';
import { buildDownloadUrl, injectTransform } from './lightboxUtils';
import { useLightboxChrome } from './useLightboxChrome';
import { useLightboxGestures } from './useLightboxGestures';
import { ensureExtension } from '../../lib/cloudinaryUrls';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaLightboxProps {
  items: PublicMediaItem[];
  startIndex?: number;
  /** Called when the user closes the lightbox */
  onClose: () => void;
}

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastFocusRef = useRef<Element | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(next, items.length - 1));
    if (clamped === idx) return;
    setDirection(clamped > idx ? 1 : -1);
    setIdx(clamped);
    setShowShare(false);
  }, [idx, items.length]);

  const prev = useCallback(() => go(idx - 1), [go, idx]);
  const next = useCallback(() => go(idx + 1), [go, idx]);
  const { pinchScale, setPinchScale, onTouchStart, onTouchMove, onTouchEnd } = useLightboxGestures({ next, prev, onClose });

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

  useLightboxChrome(dialogRef, lastFocusRef);


  // ── Auto-scroll thumbnail into view ──────────────────────────────────────

  useEffect(() => {
    thumbRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    setPinchScale(1); // reset zoom on navigate
  }, [idx, setPinchScale]);

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
                <SharePanel caption={item.caption}
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
              src={ensureExtension(item.url)}
              alt={item.alt ?? item.caption ?? `Photo ${idx + 1}`}
              crossOrigin="anonymous"
              loading="eager"
              decoding="async"
              draggable={false}
              onError={(e) => {
                const img = e.currentTarget;
                // Prevent infinite loop — only retry once with a different src
                if (!img.dataset.retried && item.cloudinary_id && item.cloudinary_id !== item.url) {
                  img.dataset.retried = '1';
                  img.src = ensureExtension(
                    `https://res.cloudinary.com/dzqdxosk2/image/upload/${item.cloudinary_id}`,
                  );
                }
              }}
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
                'focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                i === idx
                  ? 'ring-brand-600 opacity-100 scale-105'
                  : 'ring-white/0 opacity-50 hover:opacity-80 hover:ring-white/30',
              ].join(' ')}
            >
              <img
                src={
                  thumb.thumbnail_url ??
                  injectTransform(thumb.url, 'w_128,h_128,c_fill,q_auto,f_auto')
                }
                alt=""
                crossOrigin="anonymous"
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


export default MediaLightbox;
