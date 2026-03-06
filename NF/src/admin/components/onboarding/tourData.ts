/**
 * Tour Data — Phase 2 (updated with full Dashboard Orientation steps)
 *
 * Defines every guided tour, one per role. Each tour step maps directly to a
 * breadcrumb from the Breadcrumbs Roadmap. Steps are ordered logically so the
 * user discovers the platform section-by-section.
 *
 * CSS selectors target stable DOM landmarks (sidebar links, page headers,
 * stat cards, etc.) rather than brittle generated class names.
 *
 * Steps marked skipIfMissing: true are silently skipped when the target
 * element is absent from the DOM (e.g. role-specific sections).
 */

import type { RoleTour } from '../../types/onboarding';

// =============================================================================
// Viewer Tour (Trail 1) — Full Dashboard Orientation
// =============================================================================
// 17 ordered steps that walk every admin role through the complete dashboard:
//   1.  Sidebar navigation
//   2.  Mobile collapse (hamburger)
//   3.  Stats bar overview
//   4.  Quick Actions grid overview
//   5–11. Individual quick action explanations (skipIfMissing)
//   12. System Status                         (skipIfMissing)
//   13. User Distribution                     (skipIfMissing, super_admin only)
//   14. Recent Activity feed
//   15. Upcoming Events                       (skipIfMissing)
//   16. Submissions panel                     (skipIfMissing)
//   17. Content Pipeline                      (skipIfMissing)
// =============================================================================

const viewerTour: RoleTour = {
  id: 'viewer',
  name: 'Dashboard Orientation',
  description:
    'A step-by-step walkthrough of every dashboard section — sidebar, stats, quick actions, system status, activity feeds, submissions, and content pipeline.',
  roles: ['viewer', 'content_manager', 'events_manager', 'admin', 'owner', 'super_admin'],
  trails: [1],
  estimatedMinutes: 12,
  steps: [
    // ── Step 1: Sidebar ───────────────────────────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '① Navigation Sidebar',
      content:
        'This is your <strong>navigation sidebar</strong> — your primary way to move between sections. Each link is filtered to show only the areas your role can access. Hover over any item to see where it leads. The active page is highlighted in white.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.5',
    },

    // ── Step 2: Mobile hamburger ──────────────────────────────────────────
    {
      target: '[data-tour="mobile-hamburger"]',
      title: '② Mobile Menu — Collapse & Expand',
      content:
        'On phones and narrow screens the sidebar is hidden by default. Tap the <strong>☰ hamburger icon</strong> here to slide it open. Tap the <strong>✕ close button</strong> on the drawer — or tap outside it — to collapse it again. Try it now!',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.7',
    },

    // ── Step 3: Stats bar ─────────────────────────────────────────────────
    {
      target: '[data-tour="stats-cards"]',
      title: '③ Dashboard Stats Bar',
      content:
        'These <strong>live stat cards</strong> give you an instant snapshot of the platform. Each card shows a primary count (e.g. Total Events) and a contextual sub-value (e.g. "3 upcoming"). Cards are clickable — tap any card to jump directly to that section. Data refreshes automatically.',
      route: '/admin/dashboard',
      placement: 'bottom',
      trailNumber: 1,
      breadcrumbId: '1.11',
    },

    // ── Step 4: Quick Actions overview ────────────────────────────────────
    {
      target: '[data-tour="quick-actions"]',
      title: '④ Quick Actions',
      content:
        'The <strong>Quick Actions grid</strong> is your shortcut hub. Every card here launches a key workflow in one click — no hunting through menus. The actions shown are tailored to your role. Click <strong>Next →</strong> to explore each action individually.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.13',
      skipIfMissing: true,
    },

    // ── Step 5: Create Event ──────────────────────────────────────────────
    {
      target: '[data-tour="quick-action-create-event"]',
      title: '⑤ Quick Action — Create Event',
      content:
        '<strong>Create Event</strong> opens the new-event form directly. Use this whenever you need to add an upcoming community event, fundraiser, or program showcase. Events follow a <em>Draft → Published → Completed</em> lifecycle.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.13',
      skipIfMissing: true,
    },

    // ── Step 6: New Program ───────────────────────────────────────────────
    {
      target: '[data-tour="quick-action-new-program"]',
      title: '⑥ Quick Action — New Program',
      content:
        '<strong>New Program</strong> takes you to the Programs manager where you can create or edit the foundation\'s community programs. Each program has a title, description, cover image, gallery, and a "Featured" toggle that controls homepage visibility.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.13',
      skipIfMissing: true,
    },

    // ── Step 7: Write Story ───────────────────────────────────────────────
    {
      target: '[data-tour="quick-action-write-story"]',
      title: '⑦ Quick Action — Write Story',
      content:
        '<strong>Write Story</strong> opens the Stories editor. Stories follow a <em>Draft → Published</em> workflow — only Published stories appear on the public website. You can also feature a story on the homepage carousel.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.13',
      skipIfMissing: true,
    },

    // ── Step 8: Update Hero ───────────────────────────────────────────────
    {
      target: '[data-tour="quick-action-update-hero"]',
      title: '⑧ Quick Action — Update Hero',
      content:
        '<strong>Update Hero</strong> goes to the Hero Slides manager. Here you craft the homepage carousel — each slide has a headline, subtitle, call-to-action button, and background image. Drag slides to reorder them.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.13',
      skipIfMissing: true,
    },

    // ── Step 9: Bank Details ──────────────────────────────────────────────
    {
      target: '[data-tour="quick-action-bank-details"]',
      title: '⑨ Quick Action — Bank Details',
      content:
        '<strong>Bank Details</strong> lets you manage the foundation\'s payment methods — bank account numbers, M-Pesa Paybill, and donation instructions shown on the public site. Keep these up to date so supporters can send contributions.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.14',
      skipIfMissing: true,
    },

    // ── Step 10: Site Settings ────────────────────────────────────────────
    {
      target: '[data-tour="quick-action-site-settings"]',
      title: '⑩ Quick Action — Site Settings',
      content:
        '<strong>Site Settings</strong> gives you control over global configuration — contact information, social media links, and general site metadata. Changes here update the header, footer, and contact page automatically.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.14',
      skipIfMissing: true,
    },

    // ── Step 11: Maintenance ──────────────────────────────────────────────
    {
      target: '[data-tour="quick-action-maintenance"]',
      title: '⑪ Quick Action — Maintenance',
      content:
        '<strong>Maintenance</strong> manages scheduled maintenance windows. You can display a "Site under maintenance" banner to visitors during planned downtime — with a custom message and countdown. Rules are time-based and auto-expire.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.14',
      skipIfMissing: true,
    },

    // ── Step 12: System Status ────────────────────────────────────────────
    {
      target: '[data-tour="system-status"]',
      title: '⑫ System Status',
      content:
        'The <strong>System Status</strong> card is your at-a-glance health monitor. <span style="color:#16a34a">Green</span> means all clear. <span style="color:#d97706">Amber</span> flags active maintenance rules or scheduled windows. <span style="color:#dc2626">Red</span> alerts highlight submissions awaiting your reply or pending volunteer applications.',
      route: '/admin/dashboard',
      placement: 'left',
      trailNumber: 1,
      breadcrumbId: '1.17',
      skipIfMissing: true,
    },

    // ── Step 13: User Distribution (super_admin only) ─────────────────────
    {
      target: '[data-tour="user-distribution"]',
      title: '⑬ User Distribution',
      content:
        'The <strong>User Distribution</strong> chart shows how your admin team is composed by role — Super Admin, Owner, Admin, Events Manager, Content Manager, and Viewer. Click <strong>Manage →</strong> to add users, change roles, or deactivate accounts. This card is only visible to Super Admins.',
      route: '/admin/dashboard',
      placement: 'left',
      trailNumber: 1,
      breadcrumbId: '1.17',
      skipIfMissing: true,
    },

    // ── Step 14: Recent Activity ──────────────────────────────────────────
    {
      target: '[data-tour="recent-activity"]',
      title: '⑭ Recent Activity Feed',
      content:
        'The <strong>Recent Activity</strong> timeline is your audit pulse. It logs every create, edit, and delete action across the platform — who did it and when. Click any entry to navigate directly to the affected item. Use this to stay informed of your team\'s work.',
      route: '/admin/dashboard',
      placement: 'left',
      trailNumber: 1,
      breadcrumbId: '1.15',
    },

    // ── Step 15: Upcoming Events ──────────────────────────────────────────
    {
      target: '[data-tour="upcoming-events"]',
      title: '⑮ Upcoming Events',
      content:
        'The <strong>Upcoming Events</strong> panel shows the next scheduled events in chronological order. The left border colour signals urgency: <span style="color:#dc2626">red</span> = within 3 days, <span style="color:#d97706">amber</span> = within a week, <span style="color:#2563eb">blue</span> = further out. Click any event to manage it.',
      route: '/admin/dashboard',
      placement: 'left',
      trailNumber: 1,
      breadcrumbId: '1.16',
      skipIfMissing: true,
    },

    // ── Step 16: Submissions ──────────────────────────────────────────────
    {
      target: '[data-tour="submissions"]',
      title: '⑯ Submissions Overview',
      content:
        'The <strong>Submissions</strong> panel tallies incoming form entries: <em>Contact</em> enquiries, <em>Partnership</em> proposals, and <em>Volunteer</em> applications. A <span style="color:#d97706">pending</span> badge appears when new volunteer applications need review. Click <strong>View all →</strong> to read and reply to each submission.',
      route: '/admin/dashboard',
      placement: 'top',
      trailNumber: 1,
      breadcrumbId: '1.18',
      skipIfMissing: true,
    },

    // ── Step 17: Content Pipeline ─────────────────────────────────────────
    {
      target: '[data-tour="content-pipeline"]',
      title: '⑰ Content Pipeline',
      content:
        'The <strong>Content Pipeline</strong> gives a two-column snapshot of your content health. <em>Programs</em> shows active, featured, and total counts. <em>Stories</em> shows published, drafts, and how many were added this month. Use this to spot content gaps at a glance — then act via the Quick Actions above.',
      route: '/admin/dashboard',
      placement: 'top',
      trailNumber: 1,
      breadcrumbId: '1.19',
      skipIfMissing: true,
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
    'Create, manage, and track events through their full lifecycle: Draft → Published → Completed → Archived.',
  roles: ['events_manager', 'owner', 'super_admin'],
  trails: [10],
  estimatedMinutes: 12,
  steps: [
    // ── Step 1: Navigate to Events via sidebar ────────────────────────────
    // Completes 10.1 — "Open the Events hub"
    {
      target: '[data-tour="nav-events"]',
      title: 'Events Section',
      content:
        'Click <strong>Events</strong> in the sidebar to open your Events hub — the central place to create, edit, filter, and track every foundation event.',
      route: '/admin/events',
      placement: 'right',
      trailNumber: 10,
      breadcrumbId: '10.1',
    },
    // ── Step 2: Status filter tabs overview ───────────────────────────────
    // Completes 10.2 — "Use the event status filter tabs"
    {
      target: '[data-tour="events-status-tabs"]',
      title: 'Status Filter Tabs',
      content:
        'These tabs filter events by lifecycle stage. The highlighted tab is active. Start on <strong>All</strong> to see every event at a glance — let\'s walk through each filter.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.2',
    },
    // ── Step 3: Published filter ──────────────────────────────────────────
    // Completes 10.3 — "Browse Published events"
    {
      target: '[data-tour="events-filter-published"]',
      title: 'Published Events',
      content:
        '<strong>Published</strong> events are live and visible to the public on the website. Use this filter any time you want to quickly see what\'s currently on display.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.3',
    },
    // ── Step 4: Draft filter ──────────────────────────────────────────────
    // Completes 10.4 — "Browse Draft events"
    {
      target: '[data-tour="events-filter-draft"]',
      title: 'Draft Events',
      content:
        '<strong>Draft</strong> events are private — visible only to admins. Use drafts to prepare an event in advance before making it public.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.4',
    },
    // ── Step 5: Completed filter ──────────────────────────────────────────
    // Completes 10.5 — "Browse Completed events"
    {
      target: '[data-tour="events-filter-completed"]',
      title: 'Completed Events',
      content:
        '<strong>Completed</strong> events have already taken place. They remain on the site as a record and can be linked to a photo album in the Media Library to showcase what happened.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.5',
    },
    // ── Step 6: Archived filter ───────────────────────────────────────────
    // Completes 10.6 — "Browse Archived events"
    {
      target: '[data-tour="events-filter-archived"]',
      title: 'Archived Events',
      content:
        '<strong>Archived</strong> events are removed from the public site but kept for internal records. Always archive rather than delete events you no longer want visible.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.6',
    },
    // ── Step 7: Grid & List view toggle ───────────────────────────────────
    // Completes 10.7 — "Switch between Grid and List view"
    {
      target: '[data-tour="events-view-toggle"]',
      title: 'Grid & List View',
      content:
        'Switch between <strong>Grid</strong> (spacious cards, great for scanning covers) and <strong>List</strong> (compact table, ideal for bulk editing). Your view preference is remembered.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.7',
    },
    // ── Step 8: Create Event button ───────────────────────────────────────
    // Completes 10.8 — "Create a new event"
    {
      target: '[data-tour="events-create-btn"]',
      title: 'Create a New Event',
      content:
        'Ready to add your first event? Click <strong>Next</strong> and we\'ll open the Create Event form for you — or click the button yourself at any time.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.8',
    },
    // ── Step 9: New Event modal ───────────────────────────────────────────
    // Completes 10.9 — "Complete the event creation form"
    {
      target: '[data-tour="new-event-modal"]',
      title: 'Your First Event 🎉',
      content:
        'The form is open! Fill in the event title, date, location, and any other details. Set the status to <strong>Draft</strong> to save privately, or <strong>Published</strong> to go live. Click <strong>Finish</strong> to complete this tour — breadcrumb 10.9 will auto-complete when you save.',
      route: '/admin/events',
      placement: 'bottom',
      trailNumber: 10,
      breadcrumbId: '10.9',
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
