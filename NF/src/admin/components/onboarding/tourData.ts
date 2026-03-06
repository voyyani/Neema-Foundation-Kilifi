/**
 * Tour Data — Phase 2
 *
 * Defines every guided tour, one per role. Each tour step maps directly to a
 * breadcrumb from the Breadcrumbs Roadmap. Steps are ordered logically so the
 * user discovers the platform section-by-section.
 *
 * CSS selectors target stable DOM landmarks (sidebar links, page headers,
 * stat cards, etc.) rather than brittle generated class names.
 */

import type { RoleTour } from '../../types/onboarding';

// =============================================================================
// Viewer Tour (Trail 1)
// =============================================================================

const viewerTour: RoleTour = {
  id: 'viewer',
  name: 'Dashboard Orientation',
  description:
    'Learn to navigate the admin portal, read the dashboard, and manage your account in under 10 minutes.',
  roles: ['viewer', 'content_manager', 'events_manager', 'admin', 'owner', 'super_admin'],
  trails: [1],
  estimatedMinutes: 10,
  steps: [
    {
      target: '[data-tour="sidebar"]',
      title: 'Navigation Sidebar',
      content:
        'This is your navigation sidebar. Each link takes you to a different section of the admin portal. Only sections your role can access are visible.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.3',
    },
    {
      target: '[data-tour="stats-cards"]',
      title: 'Dashboard Stats',
      content:
        'These cards show live counts for events, programs, stories, hero slides, board members, and users. They update in real time as content changes.',
      route: '/admin/dashboard',
      placement: 'bottom',
      trailNumber: 1,
      breadcrumbId: '1.4',
    },
    {
      target: '[data-tour="recent-activity"]',
      title: 'Recent Activity Feed',
      content:
        'The activity feed shows the latest actions across the platform — who created or updated something, and when. This is your audit pulse.',
      route: '/admin/dashboard',
      placement: 'top',
      trailNumber: 1,
      breadcrumbId: '1.5',
    },
    {
      target: '[data-tour="user-menu"]',
      title: 'Your Profile Menu',
      content:
        'Click your avatar to access your profile, settings, view the public website, or sign out. You can also reset your password from here.',
      route: '/admin/dashboard',
      placement: 'bottom',
      trailNumber: 1,
      breadcrumbId: '1.7',
    },
  ],
};

// =============================================================================
// Content Manager Tour (Trails 2–9)
// =============================================================================

const contentManagerTour: RoleTour = {
  id: 'content_manager',
  name: 'Content Management Mastery',
  description:
    'Master every content section — hero slides, programs, stories, impact metrics, media, board members, partners, and form submissions.',
  roles: ['content_manager', 'owner', 'super_admin'],
  trails: [2, 3, 4, 5, 6, 7, 8, 9],
  estimatedMinutes: 20,
  steps: [
    // Trail 2 — Content Hub Orientation
    {
      target: '[data-tour="nav-content"]',
      title: 'Content Hub',
      content:
        'Click "Content" to open the Content Hub. You\'ll see cards for each content section: Hero, Programs, Stories, Impact, Board, and Partners.',
      route: '/admin/content',
      placement: 'right',
      trailNumber: 2,
      breadcrumbId: '2.1',
    },
    // Trail 3 — Hero Slides
    {
      target: '[data-tour="content-hero-card"]',
      title: 'Hero Slides',
      content:
        'Manage the homepage hero carousel. You can create slides with headlines, subtitles, CTA buttons, and background images. Drag to reorder.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 3,
      breadcrumbId: '3.1',
    },
    // Trail 4 — Programs
    {
      target: '[data-tour="content-programs-card"]',
      title: 'Programs',
      content:
        'Manage programs with titles, slugs, descriptions, categories, cover images, and gallery images. Toggle "Featured" to show on the homepage.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 4,
      breadcrumbId: '4.1',
    },
    // Trail 5 — Stories
    {
      target: '[data-tour="content-stories-card"]',
      title: 'Stories',
      content:
        'Stories follow a Draft → Published workflow. Draft stories are private. Only Published stories appear on the public site. You can also feature stories for the homepage carousel.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 5,
      breadcrumbId: '5.1',
    },
    // Trail 6 — Impact Metrics
    {
      target: '[data-tour="content-impact-card"]',
      title: 'Impact Metrics',
      content:
        'Update the animated counters on the homepage. Each metric has a label, numeric value, optional suffix (+, %, K), icon, and display order.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 6,
      breadcrumbId: '6.1',
    },
    // Trail 7 — Board & Partners
    {
      target: '[data-tour="content-board-card"]',
      title: 'Board & Partners',
      content:
        'Manage board member profiles and partner logos. Featured partners appear in the homepage Trust Bar.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 7,
      breadcrumbId: '7.1',
    },
    // Trail 8 — Media Library
    {
      target: '[data-tour="nav-media"]',
      title: 'Media Library',
      content:
        'Upload images (JPEG, PNG, WebP, GIF — max 5 MB), organise them into albums, and link them to events or programs for public galleries.',
      route: '/admin/media',
      placement: 'right',
      trailNumber: 8,
      breadcrumbId: '8.1',
    },
    // Trail 9 — Form Submissions
    {
      target: '[data-tour="nav-content"]',
      title: 'Form Submissions',
      content:
        'Review contact form entries, partnership inquiries, and volunteer applications. Every submission triggers an automatic email notification to the foundation.',
      route: '/admin/content',
      placement: 'right',
      trailNumber: 9,
      breadcrumbId: '9.1',
    },
  ],
};

// =============================================================================
// Events Manager Tour (Trail 10)
// =============================================================================

const eventsManagerTour: RoleTour = {
  id: 'events_manager',
  name: 'Events Management',
  description:
    'Learn to create, manage, and track events through their full lifecycle: Draft → Published → Completed → Archived.',
  roles: ['events_manager', 'owner', 'super_admin'],
  trails: [10],
  estimatedMinutes: 12,
  steps: [
    {
      target: '[data-tour="nav-events"]',
      title: 'Events Section',
      content:
        'Click "Events" to see all events. Use status tabs (Draft, Published, Cancelled, Completed, Archived) and the search box to filter events.',
      route: '/admin/events',
      placement: 'right',
      trailNumber: 10,
      breadcrumbId: '10.1',
    },
    {
      target: '[data-tour="events-status-tabs"]',
      title: 'Status Filters',
      content:
        'Click each status tab to filter events by their current state. This helps you quickly find events at any stage of their lifecycle.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.2',
    },
    {
      target: '[data-tour="events-create-btn"]',
      title: 'Create a New Event',
      content:
        'Click "New Event" to create an event. Fill in the title, date & time, location, description, category, and status. Optionally add an end time and cover image.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.3',
    },
    {
      target: '[data-tour="events-list"]',
      title: 'Event Lifecycle',
      content:
        'Events move through: Draft → Published → Completed → Archived. Click any event row to edit it. You can also delete events from the action menu.',
      route: '/admin/events',
      placement: 'top',
      trailNumber: 10,
      breadcrumbId: '10.8',
    },
  ],
};

// =============================================================================
// Admin Tour (Trails 11–14)
// =============================================================================

const adminTour: RoleTour = {
  id: 'admin',
  name: 'Administration & Settings',
  description:
    'Configure site settings, manage bank payment methods, set up maintenance rules, and export data.',
  roles: ['admin', 'owner', 'super_admin'],
  trails: [11, 12, 13, 14],
  estimatedMinutes: 15,
  steps: [
    // Trail 11 — Site Settings
    {
      target: '[data-tour="nav-site-settings"]',
      title: 'Site Settings',
      content:
        'Configure global settings: contact email, phone, physical address, and social media links. Changes appear on the public site footer and contact section.',
      route: '/admin/site-settings',
      placement: 'right',
      trailNumber: 11,
      breadcrumbId: '11.1',
    },
    // Trail 12 — Bank Details
    {
      target: '[data-tour="nav-bank-details"]',
      title: 'Bank Details',
      content:
        'Manage payment methods (Bank Transfer, M-Pesa, PayPal, Stripe). Sensitive fields are encrypted at rest. Toggle visibility to show/hide on the public page. Every action is audited.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 12,
      breadcrumbId: '12.1',
    },
    // Trail 13 — Maintenance
    {
      target: '[data-tour="nav-maintenance"]',
      title: 'Maintenance System',
      content:
        'Create maintenance rules with five scopes (global, page, section, component, feature group) and three severities (full block, degraded, notice). Changes propagate in real time via Supabase Realtime.',
      route: '/admin/maintenance',
      placement: 'right',
      trailNumber: 13,
      breadcrumbId: '13.1',
    },
    {
      target: '[data-tour="maintenance-rules-list"]',
      title: 'Active Rules',
      content:
        'View all active and inactive maintenance rules. During maintenance, the Vercel Edge Middleware returns HTTP 503 + Retry-After to protect SEO.',
      route: '/admin/maintenance',
      placement: 'top',
      trailNumber: 13,
      breadcrumbId: '13.2',
    },
  ],
};

// =============================================================================
// Super Admin Tour (Trails 16–18)
// =============================================================================

const superAdminTour: RoleTour = {
  id: 'super_admin',
  name: 'User & Security Management',
  description:
    'Master user management, role assignment, and security review. Understand the principle of least privilege and emergency access protocols.',
  roles: ['super_admin'],
  trails: [16, 17, 18],
  estimatedMinutes: 15,
  steps: [
    // Trail 16 — User Management
    {
      target: '[data-tour="nav-users"]',
      title: 'User Management',
      content:
        'View all admin users with their roles, emails, and active status. From here you can invite, promote, demote, deactivate, and delete users.',
      route: '/admin/users',
      placement: 'right',
      trailNumber: 16,
      breadcrumbId: '16.1',
    },
    {
      target: '[data-tour="users-invite-btn"]',
      title: 'Invite Users',
      content:
        'Click "Invite User" to send an invitation email. Select the appropriate role based on the principle of least privilege — assign the lowest role that covers the person\'s responsibilities.',
      route: '/admin/users',
      placement: 'bottom',
      trailNumber: 16,
      breadcrumbId: '16.3',
    },
    {
      target: '[data-tour="users-list"]',
      title: 'Role Assignment',
      content:
        'Click any user to change their role or toggle active/inactive status. Role changes take effect immediately. The 6-tier hierarchy: Super Admin → Owner → Admin → Events/Content Manager → Viewer.',
      route: '/admin/users',
      placement: 'top',
      trailNumber: 16,
      breadcrumbId: '16.4',
    },
    // Trail 17–18 — Security
    {
      target: '[data-tour="user-menu"]',
      title: 'Security & Audit',
      content:
        'Row Level Security at the database layer is the source of truth. Regularly review bank detail audit logs. For emergency access, you can set profiles.is_active = false in the Supabase Dashboard to instantly revoke access.',
      route: '/admin/dashboard',
      placement: 'bottom',
      trailNumber: 18,
      breadcrumbId: '18.1',
    },
  ],
};

// =============================================================================
// Export all tours
// =============================================================================

export const ALL_TOURS: RoleTour[] = [
  viewerTour,
  contentManagerTour,
  eventsManagerTour,
  adminTour,
  superAdminTour,
];

/**
 * Returns the tours available for a given role, ordered from foundational
 * (Viewer) to role-specific.
 */
export function getToursForRole(role: string): RoleTour[] {
  return ALL_TOURS.filter((tour) =>
    tour.roles.includes(role as RoleTour['roles'][number]),
  );
}

/**
 * Returns a single tour by its ID.
 */
export function getTourById(tourId: string): RoleTour | undefined {
  return ALL_TOURS.find((t) => t.id === tourId);
}
