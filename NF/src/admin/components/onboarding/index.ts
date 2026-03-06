/**
 * Onboarding module barrel export — Phase 2 + Phase 4
 */

// Phase 2
export { TourProvider, useTour } from './TourProvider';
export { default as WelcomeModal } from './WelcomeModal';
export { default as HelpMenuButton } from './HelpMenuButton';
export { getToursForRole, getTourById, ALL_TOURS } from './tourData';

// Phase 4
export { default as ProgressBar } from './ProgressBar';
export { default as BreadcrumbChecklist } from './BreadcrumbChecklist';
export { default as RoleMasteryBadge } from './RoleMasteryBadge';
export { getTrailsForRole, getBreadcrumbsForRole, ALL_TRAILS } from './breadcrumbDefinitions';
