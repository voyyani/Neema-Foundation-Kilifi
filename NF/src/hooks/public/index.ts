// Public data hooks for CMS-driven content
// Read-only queries for the public-facing website

export { usePublicHeroSlides } from './usePublicHeroSlides';
export type { HeroSlide } from './usePublicHeroSlides';

export { 
  usePublicPrograms, 
  usePublicFeaturedPrograms,
  usePublicProgram 
} from './usePublicPrograms';
export type { PublicProgram } from './usePublicPrograms';

export { usePublicImpactMetrics, usePublicImpactMetricsByProgram } from './usePublicImpactMetrics';
export type { 
  PublicImpactMetric, 
  PublicImpactMetricWithProgram 
} from './usePublicImpactMetrics';

export { 
  usePublicStories, 
  usePublicFeaturedStories,
  usePublicStory 
} from './usePublicStories';
export type { PublicStory } from './usePublicStories';

export { usePublicSiteSettings } from './usePublicSiteSettings';
export type { PublicSiteSettings } from './usePublicSiteSettings';

export { 
  usePublicPartners, 
  usePublicFeaturedPartners 
} from './usePublicPartners';
export type { PublicPartner } from './usePublicPartners';

export { 
  usePublicEvents, 
  usePublicUpcomingEvents,
  usePublicPastEvents,
  usePublicFeaturedEvents,
  usePublicProgramEvents
} from './usePublicEvents';
export type { PublicEvent } from './usePublicEvents';

export {
  usePublicAlbums,
  usePublicFeaturedAlbums,
  usePublicAlbum,
  usePublicProgramAlbums,
  usePublicEventAlbum,
  buildCloudinaryUrl,
} from './usePublicMedia';
export type {
  PublicMediaAlbum,
  PublicMediaItem,
  PublicAlbumDetail,
  AlbumType,
  AlbumFilterType,
} from './usePublicMedia';

// ─── Bank Details (Phase 7) ───────────────────────────────────────────────────
export { useBankDetails } from './useBankDetails';
export type { PublicBankDetail, PaymentMethodType } from './useBankDetails';

// ─── Program Gallery (Phase 1+) ───────────────────────────────────────────────
export {
  usePublicProgramImages,
  usePublicCoverProgramImage,
  /** @deprecated use usePublicCoverProgramImage */
  usePublicPrimaryProgramImage,
} from './useProgramImages';
export type { ProgramImage, ProgramImageInput } from './useProgramImages';

// ─── Program Media Albums (Phase 2 — bridge sync) ────────────────────────────
export {
  usePublicProgramMediaAlbums,
  usePublicProgramMediaAlbumsBySlug,
} from './usePublicProgramMediaAlbums';
export type { ProgramMediaAlbum } from './usePublicProgramMediaAlbums';

// ─── Maintenance Status (Phase 1) ────────────────────────────────────────────
export {
  useMaintenanceStatus,
  usePageMaintenance,
  useSectionMaintenance,
} from './useMaintenanceStatus';
export type {
  ActiveMaintenanceRule,
  MaintenanceStatus,
} from './useMaintenanceStatus';
