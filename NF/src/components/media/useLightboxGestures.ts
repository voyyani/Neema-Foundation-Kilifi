/**
 * useLightboxGestures — swipe to navigate, swipe down to close, pinch to
 * zoom. Split from MediaLightbox by responsibility.
 */
import { useRef, useState } from 'react';
import type React from 'react';
import { touchDist } from './LightboxControls';

export function useLightboxGestures({ next, prev, onClose }: { next: () => void; prev: () => void; onClose: () => void }) {
  const [pinchScale, setPinchScale] = useState(1);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const pinchStartDistRef = useRef(0);
  const pinchStartScaleRef = useRef(1);

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


  return { pinchScale, setPinchScale, onTouchStart, onTouchMove, onTouchEnd };
}
