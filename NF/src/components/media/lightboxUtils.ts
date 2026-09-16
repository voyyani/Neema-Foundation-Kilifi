/** Pure helpers for the lightbox: URL transforms and touch geometry. */
import { ensureExtension } from '../../lib/cloudinaryUrls';

/** Inject a Cloudinary transformation string into a full URL */
export function injectTransform(url: string, transform: string): string {
  if (!url) return url;
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return ensureExtension(
      `${url.slice(0, idx + marker.length)}${transform}/${url.slice(idx + marker.length)}`,
    );
  }
  return ensureExtension(url);
}

/** Build a download-forced URL via Cloudinary fl_attachment */
export function buildDownloadUrl(url: string): string {
  return injectTransform(url, 'fl_attachment');
}

/** Touch distance between two touches */
export function touchDist(t: React.TouchList): number {
  const dx = t[0].clientX - t[1].clientX;
  const dy = t[0].clientY - t[1].clientY;
  return Math.hypot(dx, dy);
}


// ─── Share Panel ─────────────────────────────────────────────────────────────

