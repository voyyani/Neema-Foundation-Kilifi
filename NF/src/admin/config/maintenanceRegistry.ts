/**
 * Maintenance Registry — Page, Section & Feature Group Configuration
 *
 * Central registry mapping every public page, its sections, and cross-cutting
 * feature groups. Used by the ScopePicker, FeatureGroupPicker, SiteMapView,
 * QuickActions, and analytics components for visual, point-and-click rule
 * targeting and impact estimation.
 *
 * Phase 6 additions:
 *  - FeatureGroupMapper class for bidirectional target ↔ group resolution
 *  - Traffic weight estimates per page for affected-users analytics
 *  - Quick maintenance presets configuration
 *  - Site health summary utilities
 */

import type {
  PageRegistryEntry,
  FeatureGroupEntry,
  MaintenanceRule,
} from '../types/maintenance';

// =============================================================================
// Page Registry
// =============================================================================

export const PAGE_REGISTRY: PageRegistryEntry[] = [
  {
    key: 'landing',
    label: 'Home / Landing',
    route: '/',
    icon: 'Home',
    trafficWeight: 35,
    sections: [
      { key: 'hero', label: 'Hero Carousel', component_name: 'Hero' },
      { key: 'mission', label: 'Mission Statement', component_name: 'Mission' },
      { key: 'problem', label: 'The Problem', component_name: 'Problem' },
      { key: 'programs', label: 'Programs Overview', component_name: 'Programs' },
      { key: 'impact', label: 'Impact Metrics', component_name: 'Impact' },
      { key: 'stories', label: 'Stories', component_name: 'Stories' },
      { key: 'events', label: 'Events', component_name: 'Events' },
      { key: 'action', label: 'Call to Action', component_name: 'Action' },
      { key: 'trust_bar', label: 'Trust Bar', component_name: 'TrustBar' },
    ],
  },
  {
    key: 'donate',
    label: 'Donate',
    route: '/donate',
    icon: 'Heart',
    trafficWeight: 12,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'DonateHero' },
      { key: 'amounts', label: 'Donation Amounts', component_name: 'DonationAmounts' },
      {
        key: 'payment_form',
        label: 'Payment Form',
        component_name: 'PaymentForm',
        components: [
          { key: 'mpesa', label: 'M-Pesa' },
          { key: 'stripe', label: 'Stripe/Card' },
          { key: 'bank_transfer', label: 'Bank Transfer' },
        ],
      },
      { key: 'recurring_options', label: 'Recurring Options', component_name: 'RecurringDonation' },
    ],
  },
  {
    key: 'bank_details',
    label: 'Bank Details',
    route: '/bank-details',
    icon: 'Building',
    trafficWeight: 4,
    sections: [
      { key: 'bank_list', label: 'Bank Accounts', component_name: 'BankList' },
      { key: 'mpesa_details', label: 'M-Pesa Details', component_name: 'MpesaDetails' },
      { key: 'international', label: 'International Transfers', component_name: 'InternationalTransfers' },
    ],
  },
  {
    key: 'legacy_giving',
    label: 'Legacy Giving',
    route: '/legacy-giving',
    icon: 'Gift',
    trafficWeight: 2,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'LegacyHero' },
      { key: 'options', label: 'Giving Options', component_name: 'GivingOptions' },
      { key: 'form', label: 'Inquiry Form', component_name: 'LegacyForm' },
    ],
  },
  {
    key: 'volunteer',
    label: 'Volunteer',
    route: '/volunteer',
    icon: 'Users',
    trafficWeight: 8,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'VolunteerHero' },
      { key: 'form', label: 'Application Form', component_name: 'VolunteerForm' },
      { key: 'opportunities', label: 'Opportunities List', component_name: 'Opportunities' },
      { key: 'testimonials', label: 'Testimonials', component_name: 'VolunteerTestimonials' },
    ],
  },
  {
    key: 'partnership',
    label: 'Partner With Us',
    route: '/partner',
    icon: 'Handshake',
    trafficWeight: 3,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'PartnerHero' },
      { key: 'tiers', label: 'Partnership Tiers', component_name: 'PartnerTiers' },
      { key: 'form', label: 'Partnership Form', component_name: 'PartnerForm' },
      { key: 'current_partners', label: 'Current Partners', component_name: 'CurrentPartners' },
    ],
  },
  {
    key: 'sponsorship',
    label: 'Sponsorship',
    route: '/sponsorship',
    icon: 'HeartHandshake',
    trafficWeight: 5,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'SponsorHero' },
      { key: 'children', label: 'Children Profiles', component_name: 'ChildrenProfiles' },
      { key: 'form', label: 'Sponsorship Form', component_name: 'SponsorForm' },
      { key: 'impact', label: 'Sponsorship Impact', component_name: 'SponsorImpact' },
    ],
  },
  {
    key: 'board',
    label: 'About Us / Board',
    route: '/board',
    icon: 'Building2',
    trafficWeight: 4,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'BoardHero' },
      { key: 'members', label: 'Board Members', component_name: 'BoardMembers' },
      { key: 'advisors', label: 'Advisory Board', component_name: 'Advisors' },
    ],
  },
  {
    key: 'programs',
    label: 'Programs',
    route: '/programs',
    icon: 'BookOpen',
    trafficWeight: 10,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'ProgramsHero' },
      { key: 'grid', label: 'Programs Grid', component_name: 'ProgramsGrid' },
      { key: 'categories', label: 'Category Filter', component_name: 'CategoryFilter' },
      { key: 'cta', label: 'Call to Action', component_name: 'ProgramsCTA' },
    ],
  },
  {
    key: 'program_detail',
    label: 'Program Detail',
    route: '/programs/:slug',
    icon: 'FileText',
    trafficWeight: 6,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'ProgramDetailHero' },
      { key: 'gallery', label: 'Image Gallery', component_name: 'ProgramGallery' },
      { key: 'description', label: 'Description', component_name: 'ProgramDescription' },
      { key: 'impact', label: 'Impact Section', component_name: 'ProgramImpact' },
      { key: 'testimonials', label: 'Testimonials', component_name: 'ProgramTestimonials' },
      { key: 'donate_cta', label: 'Donate CTA', component_name: 'ProgramDonateCTA' },
      { key: 'volunteer_cta', label: 'Volunteer CTA', component_name: 'ProgramVolunteerCTA' },
    ],
  },
  {
    key: 'media',
    label: 'Media',
    route: '/media',
    icon: 'Camera',
    trafficWeight: 5,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'MediaHero' },
      { key: 'events_grid', label: 'Events Grid', component_name: 'EventsGrid' },
      { key: 'albums', label: 'Albums', component_name: 'AlbumsGrid' },
      { key: 'program_galleries', label: 'Program Galleries', component_name: 'ProgramGalleries' },
    ],
  },
  {
    key: 'media_event',
    label: 'Event Story',
    route: '/media/events/:slug',
    icon: 'Calendar',
    trafficWeight: 2,
    sections: [
      { key: 'hero', label: 'Hero Banner', component_name: 'EventHero' },
      { key: 'gallery', label: 'Photo Gallery', component_name: 'EventGallery' },
      { key: 'description', label: 'Description', component_name: 'EventDescription' },
    ],
  },
  {
    key: 'media_album',
    label: 'Album',
    route: '/media/albums/:slug',
    icon: 'Image',
    trafficWeight: 2,
    sections: [
      { key: 'hero', label: 'Album Header', component_name: 'AlbumHero' },
      { key: 'gallery', label: 'Photo Grid', component_name: 'AlbumGallery' },
    ],
  },
  {
    key: 'media_program',
    label: 'Program Gallery',
    route: '/media/programs/:slug',
    icon: 'Images',
    trafficWeight: 2,
    sections: [
      { key: 'hero', label: 'Gallery Header', component_name: 'ProgramGalleryHero' },
      { key: 'gallery', label: 'Photo Grid', component_name: 'ProgramPhotoGrid' },
    ],
  },
];

// =============================================================================
// Feature Groups
// =============================================================================

export const FEATURE_GROUPS: FeatureGroupEntry[] = [
  {
    key: 'donations',
    label: 'Donations',
    description: 'All donation-related pages and CTAs across the site',
    icon: 'Heart',
    targets: [
      'donate',
      'bank_details',
      'legacy_giving',
      'sponsorship',
      'landing:action',
      'program_detail:donate_cta',
    ],
  },
  {
    key: 'media',
    label: 'Media & Galleries',
    description: 'All media pages, galleries, and story displays',
    icon: 'Camera',
    targets: [
      'media',
      'media_event',
      'media_album',
      'media_program',
      'landing:stories',
    ],
  },
  {
    key: 'volunteering',
    label: 'Volunteering',
    description: 'Volunteer application and related CTAs',
    icon: 'Users',
    targets: ['volunteer', 'program_detail:volunteer_cta'],
  },
  {
    key: 'programs',
    label: 'Programs',
    description: 'All program listings and detail pages',
    icon: 'BookOpen',
    targets: ['programs', 'program_detail', 'landing:programs'],
  },
  {
    key: 'contact',
    label: 'Contact & Inquiries',
    description: 'Contact forms and inquiry submissions',
    icon: 'Mail',
    targets: ['landing:action'],
  },
];

// =============================================================================
// Lookup Helpers
// =============================================================================

/** Find a page entry by key */
export function findPage(pageKey: string): PageRegistryEntry | undefined {
  return PAGE_REGISTRY.find((p) => p.key === pageKey);
}

/** Find a section within a page */
export function findSection(pageKey: string, sectionKey: string) {
  const page = findPage(pageKey);
  return page?.sections.find((s) => s.key === sectionKey);
}

/** Resolve a target_key like "landing:hero" into a human-readable label */
export function resolveTargetLabel(targetKey: string): string {
  if (targetKey === 'global') return 'Entire Site';

  const parts = targetKey.split(':');

  // Feature group
  const featureGroup = FEATURE_GROUPS.find((fg) => fg.key === parts[0] && parts.length === 1);
  if (featureGroup) return featureGroup.label;

  // Page only
  const page = findPage(parts[0]);
  if (!page) return targetKey;
  if (parts.length === 1) return page.label;

  // Page + Section
  const section = page.sections.find((s) => s.key === parts[1]);
  if (!section) return `${page.label} > ${parts[1]}`;
  if (parts.length === 2) return `${page.label} > ${section.label}`;

  // Page + Section + Component
  const component = section.components?.find((c) => c.key === parts[2]);
  return component
    ? `${page.label} > ${section.label} > ${component.label}`
    : `${page.label} > ${section.label} > ${parts[2]}`;
}

/** Get an icon name for a target key */
export function getTargetIcon(targetKey: string): string {
  const parts = targetKey.split(':');
  const page = findPage(parts[0]);
  return page?.icon ?? 'FileText';
}

/** Get all valid target keys for a given scope */
export function getTargetKeysForScope(scope: string): string[] {
  switch (scope) {
    case 'global':
      return ['global'];
    case 'page':
      return PAGE_REGISTRY.map((p) => p.key);
    case 'section':
      return PAGE_REGISTRY.flatMap((p) =>
        p.sections.map((s) => `${p.key}:${s.key}`)
      );
    case 'component':
      return PAGE_REGISTRY.flatMap((p) =>
        p.sections.flatMap((s) =>
          (s.components ?? []).map((c) => `${p.key}:${s.key}:${c.key}`)
        )
      );
    case 'feature_group':
      return FEATURE_GROUPS.map((fg) => fg.key);
    default:
      return [];
  }
}

// =============================================================================
// Phase 6 — Feature Group Mapper (bidirectional resolution)
// =============================================================================

/**
 * FeatureGroupMapper provides bidirectional lookup between feature groups
 * and their individual page/section targets, plus analytics helpers.
 */
export class FeatureGroupMapper {
  private targetToGroups: Map<string, string[]>;
  private groupToTargets: Map<string, string[]>;

  constructor() {
    this.targetToGroups = new Map();
    this.groupToTargets = new Map();

    for (const group of FEATURE_GROUPS) {
      this.groupToTargets.set(group.key, [...group.targets]);
      for (const target of group.targets) {
        const existing = this.targetToGroups.get(target) ?? [];
        existing.push(group.key);
        this.targetToGroups.set(target, existing);
      }
    }
  }

  /** Get all targets affected by a feature group */
  getTargetsForGroup(groupKey: string): string[] {
    return this.groupToTargets.get(groupKey) ?? [];
  }

  /** Find which feature groups include a given target */
  getGroupsForTarget(targetKey: string): FeatureGroupEntry[] {
    const keys = this.targetToGroups.get(targetKey) ?? [];
    return keys
      .map((k) => FEATURE_GROUPS.find((fg) => fg.key === k))
      .filter(Boolean) as FeatureGroupEntry[];
  }

  /** Check if a target belongs to a feature group */
  isTargetInGroup(targetKey: string, groupKey: string): boolean {
    return this.groupToTargets.get(groupKey)?.includes(targetKey) ?? false;
  }

  /** Calculate what percentage of a group's targets are under active maintenance */
  getGroupCoverage(groupKey: string, activeRules: MaintenanceRule[]): {
    total: number;
    covered: number;
    percentage: number;
    coveredTargets: string[];
    uncoveredTargets: string[];
  } {
    const targets = this.getTargetsForGroup(groupKey);
    const activeTargets = new Set(activeRules.filter((r) => r.is_active).map((r) => r.target_key));
    const covered = targets.filter((t) => activeTargets.has(t));
    const uncovered = targets.filter((t) => !activeTargets.has(t));

    return {
      total: targets.length,
      covered: covered.length,
      percentage: targets.length > 0 ? Math.round((covered.length / targets.length) * 100) : 0,
      coveredTargets: covered,
      uncoveredTargets: uncovered,
    };
  }

  /** Get all groups with their coverage data */
  getAllGroupCoverage(activeRules: MaintenanceRule[]): Array<
    FeatureGroupEntry & { coverage: ReturnType<FeatureGroupMapper['getGroupCoverage']> }
  > {
    return FEATURE_GROUPS.map((group) => ({
      ...group,
      coverage: this.getGroupCoverage(group.key, activeRules),
    }));
  }
}

/** Singleton instance */
export const featureGroupMapper = new FeatureGroupMapper();

// =============================================================================
// Phase 6 — Traffic / Impact Estimation
// =============================================================================

/** Estimated monthly visitor percentage per page (sums to ~100%) */
export function getPageTrafficWeight(pageKey: string): number {
  const page = findPage(pageKey);
  return page?.trafficWeight ?? 1;
}

/** Estimate the percentage of total site visitors affected by a set of rules */
export function estimateAffectedUsers(
  rules: MaintenanceRule[],
  monthlyVisitors: number = 10000
): {
  percentage: number;
  estimated: number;
  byPage: Array<{ page: string; label: string; weight: number; severity: string }>;
} {
  const activeRules = rules.filter((r) => r.is_active);
  const affectedPages = new Set<string>();
  const pageDetails: Array<{ page: string; label: string; weight: number; severity: string }> = [];

  for (const rule of activeRules) {
    if (rule.scope === 'global') {
      // Global affects everything
      return {
        percentage: 100,
        estimated: monthlyVisitors,
        byPage: PAGE_REGISTRY.map((p) => ({
          page: p.key,
          label: p.label,
          weight: p.trafficWeight ?? 1,
          severity: rule.severity,
        })),
      };
    }

    const pageKey = rule.target_key.split(':')[0];

    // For feature groups, expand to affected page keys
    if (rule.scope === 'feature_group') {
      const targets = featureGroupMapper.getTargetsForGroup(rule.target_key);
      for (const t of targets) {
        const pk = t.split(':')[0];
        if (!affectedPages.has(pk)) {
          affectedPages.add(pk);
          const pg = findPage(pk);
          pageDetails.push({
            page: pk,
            label: pg?.label ?? pk,
            weight: pg?.trafficWeight ?? 1,
            severity: rule.severity,
          });
        }
      }
    } else if (!affectedPages.has(pageKey)) {
      affectedPages.add(pageKey);
      const pg = findPage(pageKey);
      pageDetails.push({
        page: pageKey,
        label: pg?.label ?? pageKey,
        weight: pg?.trafficWeight ?? 1,
        severity: rule.severity,
      });
    }
  }

  const totalWeight = PAGE_REGISTRY.reduce((s, p) => s + (p.trafficWeight ?? 1), 0);
  const affectedWeight = pageDetails.reduce((s, p) => s + p.weight, 0);
  const percentage = totalWeight > 0 ? Math.round((affectedWeight / totalWeight) * 100) : 0;

  return {
    percentage,
    estimated: Math.round(monthlyVisitors * (percentage / 100)),
    byPage: pageDetails,
  };
}

// =============================================================================
// Phase 6 — Quick Maintenance Presets
// =============================================================================

export interface QuickPreset {
  key: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  rule: {
    scope: MaintenanceRule['scope'];
    target_key: string;
    severity: MaintenanceRule['severity'];
    title: string;
    message: string;
    priority: number;
    metadata: Record<string, unknown>;
  };
}

export const QUICK_PRESETS: QuickPreset[] = [
  {
    key: 'full_site',
    label: 'Full Site Maintenance',
    description: 'Block entire public site immediately',
    icon: 'Globe',
    color: 'bg-red-500',
    rule: {
      scope: 'global',
      target_key: 'global',
      severity: 'full_block',
      title: 'Site Under Maintenance',
      message: 'We are performing scheduled maintenance. Please check back shortly.',
      priority: 100,
      metadata: { reason: 'Scheduled maintenance', tags: ['quick-preset'] },
    },
  },
  {
    key: 'donation_system',
    label: 'Donation System Down',
    description: 'Block all donation-related pages',
    icon: 'Heart',
    color: 'bg-pink-500',
    rule: {
      scope: 'feature_group',
      target_key: 'donations',
      severity: 'full_block',
      title: 'Donation System Maintenance',
      message: 'Our donation processing system is being upgraded. Please try again later.',
      priority: 80,
      metadata: { reason: 'Payment system maintenance', tags: ['quick-preset', 'donations'] },
    },
  },
  {
    key: 'media_refresh',
    label: 'Media Gallery Refresh',
    description: 'Degrade media pages with notice',
    icon: 'Camera',
    color: 'bg-purple-500',
    rule: {
      scope: 'feature_group',
      target_key: 'media',
      severity: 'degraded',
      title: 'Media Gallery Refresh',
      message: 'Our media galleries are being updated with new content. Some images may be temporarily unavailable.',
      priority: 60,
      metadata: { reason: 'Content refresh', tags: ['quick-preset', 'media'] },
    },
  },
  {
    key: 'volunteer_apps',
    label: 'Pause Volunteer Apps',
    description: 'Show notice on volunteer pages',
    icon: 'Users',
    color: 'bg-indigo-500',
    rule: {
      scope: 'feature_group',
      target_key: 'volunteering',
      severity: 'notice',
      title: 'Volunteer Applications Paused',
      message: 'We are reviewing current applications. New applications will reopen soon.',
      priority: 50,
      metadata: { reason: 'Application review period', tags: ['quick-preset', 'volunteering'] },
    },
  },
  {
    key: 'landing_hero',
    label: 'Update Landing Hero',
    description: 'Show placeholder for hero section',
    icon: 'Image',
    color: 'bg-amber-500',
    rule: {
      scope: 'section',
      target_key: 'landing:hero',
      severity: 'degraded',
      title: 'Hero Section Update',
      message: 'We are updating our homepage hero with fresh content.',
      priority: 40,
      metadata: { reason: 'Content update', tags: ['quick-preset', 'landing'] },
    },
  },
  {
    key: 'programs_update',
    label: 'Programs Update',
    description: 'Notice bar on all program pages',
    icon: 'BookOpen',
    color: 'bg-emerald-500',
    rule: {
      scope: 'feature_group',
      target_key: 'programs',
      severity: 'notice',
      title: 'Programs Being Updated',
      message: 'Our program information is being updated. Some details may change.',
      priority: 50,
      metadata: { reason: 'Program data refresh', tags: ['quick-preset', 'programs'] },
    },
  },
];

// =============================================================================
// Phase 6 — Site Health Summary
// =============================================================================

export interface SiteHealthStatus {
  page: PageRegistryEntry;
  status: 'online' | 'degraded' | 'blocked' | 'notice';
  activeRules: MaintenanceRule[];
  sectionStatuses: Array<{
    section: string;
    label: string;
    status: 'online' | 'degraded' | 'blocked' | 'notice';
    rule?: MaintenanceRule;
  }>;
}

/** Build a comprehensive site health map from active rules */
export function buildSiteHealthMap(rules: MaintenanceRule[]): SiteHealthStatus[] {
  const activeRules = rules.filter((r) => r.is_active);

  // Expand feature group rules to their individual targets
  const expandedTargets = new Map<string, MaintenanceRule>();
  for (const rule of activeRules) {
    if (rule.scope === 'feature_group') {
      const targets = featureGroupMapper.getTargetsForGroup(rule.target_key);
      for (const t of targets) {
        const existing = expandedTargets.get(t);
        if (!existing || rule.priority > existing.priority) {
          expandedTargets.set(t, rule);
        }
      }
    } else {
      const existing = expandedTargets.get(rule.target_key);
      if (!existing || rule.priority > existing.priority) {
        expandedTargets.set(rule.target_key, rule);
      }
    }
  }

  // Check for global rule
  const globalRule = expandedTargets.get('global');

  return PAGE_REGISTRY.map((page) => {
    const pageRule = expandedTargets.get(page.key) ?? globalRule;
    const pageActiveRules = activeRules.filter(
      (r) =>
        r.target_key === page.key ||
        r.target_key === 'global' ||
        r.target_key.startsWith(`${page.key}:`) ||
        (r.scope === 'feature_group' &&
          featureGroupMapper.getTargetsForGroup(r.target_key).some(
            (t) => t === page.key || t.startsWith(`${page.key}:`)
          ))
    );

    const sectionStatuses = page.sections.map((section) => {
      const sectionKey = `${page.key}:${section.key}`;
      const sectionRule = expandedTargets.get(sectionKey) ?? pageRule;

      return {
        section: section.key,
        label: section.label,
        status: sectionRule
          ? severityToStatus(sectionRule.severity)
          : ('online' as const),
        rule: sectionRule,
      };
    });

    return {
      page,
      status: pageRule ? severityToStatus(pageRule.severity) : 'online',
      activeRules: pageActiveRules,
      sectionStatuses,
    };
  });
}

function severityToStatus(severity: string): 'online' | 'degraded' | 'blocked' | 'notice' {
  switch (severity) {
    case 'full_block':
      return 'blocked';
    case 'degraded':
      return 'degraded';
    case 'notice':
      return 'notice';
    default:
      return 'online';
  }
}

/** Compute global site health percentages */
export function computeSiteHealth(healthMap: SiteHealthStatus[]): {
  online: number;
  degraded: number;
  blocked: number;
  notice: number;
  healthScore: number;
} {
  const total = healthMap.length;
  if (total === 0) return { online: 100, degraded: 0, blocked: 0, notice: 0, healthScore: 100 };

  const counts = { online: 0, degraded: 0, blocked: 0, notice: 0 };
  for (const h of healthMap) counts[h.status]++;

  return {
    online: Math.round((counts.online / total) * 100),
    degraded: Math.round((counts.degraded / total) * 100),
    blocked: Math.round((counts.blocked / total) * 100),
    notice: Math.round((counts.notice / total) * 100),
    healthScore: Math.round(((counts.online + counts.notice * 0.9) / total) * 100),
  };
}
