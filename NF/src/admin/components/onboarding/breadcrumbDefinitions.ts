/**
 * Breadcrumb Definitions — Phase 4 (updated Trail 1 for 17-step Dashboard tour)
 *
 * The canonical list of every breadcrumb trail and breadcrumb, derived
 * directly from the Breadcrumbs Roadmap. This file is the single source
 * of truth for computing progress, building checklists, and detecting
 * which trails apply to each role.
 */

import type { BreadcrumbTrail } from '../../types/onboarding';

// =============================================================================
// Trail 1 — First Login & Dashboard Mastery
// =============================================================================
// 25 breadcrumbs covering authentication, admin layout orientation, every
// dashboard widget section, activity monitoring, and auth mastery.
// Organised into 5 progressive sections (A–E) so the user builds competence
// layer by layer — from first login to full dashboard fluency.
//
// Tour step → breadcrumb mapping:
//   ① Sidebar          → 1.5   ② Mobile hamburger → 1.7
//   ③ Stats bar        → 1.11  ④–⑪ Quick Actions → 1.13, 1.14
//   ⑫ System Status   → 1.17  ⑬ User Distribution → 1.17
//   ⑭ Recent Activity → 1.15  ⑮ Upcoming Events   → 1.16
//   ⑯ Submissions     → 1.18  ⑰ Content Pipeline  → 1.19

const trail1: BreadcrumbTrail = {
  number: 1,
  title: 'First Login & Dashboard Mastery',
  description:
    'Master authentication, explore every dashboard widget, understand the admin layout, and achieve full dashboard fluency.',
  roles: ['viewer', 'content_manager', 'events_manager', 'admin', 'owner', 'super_admin'],
  breadcrumbs: [
    // ── Section A: Authentication ──────────────────────────────────────────
    {
      id: '1.1', trail: 1,
      title: 'Receive your credentials',
      description: 'Check your email for an admin invitation link and set a strong password.',
      route: '/admin/login', level: 'beginner', estimatedMinutes: 3,
    },
    {
      id: '1.2', trail: 1,
      title: 'Log in to the admin portal',
      description: 'Enter your credentials on the login screen and land on your role-specific dashboard.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 2,
      autoDetectAction: 'auth.login',
    },
    {
      id: '1.3', trail: 1,
      title: 'Complete the welcome tour',
      description: 'Step through the guided onboarding modal that introduces the admin interface on first login.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 3,
      autoDetectAction: 'dashboard.welcome_tour',
    },

    // ── Section B: Admin Layout Orientation ────────────────────────────────
    {
      id: '1.4', trail: 1,
      title: 'Understand the admin layout',
      description: 'Identify the four zones visible on every admin page: sidebar navigation, top header bar, breadcrumb trail, and main content area.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 3,
    },
    {
      id: '1.5', trail: 1,
      title: '① Explore the sidebar navigation',
      description: 'Tour step 1 — Hover over each sidebar link (Dashboard, Events, Media, Content, Programs, Submissions, Users, Bank Details, Maintenance, Onboarding) to preview where it leads. Notice that only links permitted for your role appear.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 3,
    },
    {
      id: '1.6', trail: 1,
      title: 'Identify your role-specific menu items',
      description: 'Notice which sidebar items are visible for your role. Viewers see fewer items than Admins or Super Admins — this enforces the principle of least privilege.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 3,
    },
    {
      id: '1.7', trail: 1,
      title: '② Use the mobile hamburger menu',
      description: 'Tour step 2 — On a phone or narrow browser, tap the ☰ hamburger icon in the header to slide the sidebar open. Tap ✕ or tap the backdrop to collapse it. The sidebar uses a spring animation to feel native on iOS.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 2,
    },
    {
      id: '1.8', trail: 1,
      title: 'Navigate using the breadcrumb bar',
      description: 'Click any breadcrumb segment to jump back to a parent page (e.g. Dashboard › Events › Edit → click Events to return to the events list).',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 2,
    },

    // ── Section C: Dashboard Overview ──────────────────────────────────────
    {
      id: '1.9', trail: 1,
      title: 'Read the welcome header and role badge',
      description: 'Find your name, role badge, and personalised subtitle at the top of the dashboard.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 2,
    },
    {
      id: '1.10', trail: 1,
      title: 'Check your onboarding progress bar',
      description: 'Locate the progress bar below the welcome header — it shows your completion percentage across all trails.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 2,
    },
    {
      id: '1.11', trail: 1,
      title: '③ Read each dashboard stat card',
      description: 'Tour step 3 — Examine every stat card in the Stats Bar: Total Events, Active Programs, Published Stories, Impact Metrics (and Total Users for Super Admins). Each card also shows a contextual sub-value. All cards are clickable links.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 5,
    },
    {
      id: '1.12', trail: 1,
      title: 'Understand stat card sub-values',
      description: 'Each stat card has a secondary value — e.g. "3 upcoming" under Total Events or "+2 this month" under Published Stories. These give context to the headline number at a glance.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 3,
    },
    {
      id: '1.13', trail: 1,
      title: '④–⑪ Explore the Quick Actions grid',
      description: 'Tour steps 4–11 — Find the Quick Actions section and study each shortcut: Create Event, New Program, Write Story, Update Hero, Bank Details, Site Settings, Maintenance (and Manage Users for Super Admins). Each button is explained individually in the tour.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 5,
    },
    {
      id: '1.14', trail: 1,
      title: 'Use a Quick Action to navigate',
      description: 'Click any Quick Action button (e.g. "Create Event") and verify it takes you to the correct admin page. Use the breadcrumb bar to return to the dashboard.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 2,
      autoDetectAction: 'dashboard.quick_action_used',
    },

    // ── Section D: Activity & Monitoring ───────────────────────────────────
    {
      id: '1.15', trail: 1,
      title: '⑭ Review the Recent Activity timeline',
      description: 'Tour step 14 — Scroll through the activity feed to see who did what and when. It logs every create, edit, and delete action across the platform. Click an entry to navigate to the affected item.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 5,
    },
    {
      id: '1.16', trail: 1,
      title: '⑮ Check Upcoming Events',
      description: 'Tour step 15 — View the Upcoming Events panel. The left border colour signals urgency: red = within 3 days, amber = within a week, blue = further out. Click any event to manage it.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 3,
    },
    {
      id: '1.17', trail: 1,
      title: '⑫–⑬ Monitor System Status & User Distribution',
      description: 'Tour steps 12–13 — The System Status card shows maintenance and submission queue health (green = ok, amber = warning, red = alert). The User Distribution chart (Super Admin only) maps your team\'s role breakdown.',
      route: '/admin/dashboard', level: 'intermediate', estimatedMinutes: 3,
    },
    {
      id: '1.18', trail: 1,
      title: '⑯ Review the Submissions overview',
      description: 'Tour step 16 — Locate the Submissions panel showing Contact, Partnership, and Volunteer counts. A pending badge appears when new volunteer applications need review. Click "View all →" to read and reply.',
      route: '/admin/dashboard', level: 'intermediate', estimatedMinutes: 3,
    },
    {
      id: '1.19', trail: 1,
      title: '⑰ Explore the Content Pipeline',
      description: 'Tour step 17 — Read the Content Pipeline section: Programs (active / featured / total) and Stories (published / drafts / this month). Use this two-column snapshot to spot content gaps before acting via Quick Actions.',
      route: '/admin/dashboard', level: 'intermediate', estimatedMinutes: 3,
    },

    // ── Section E: Dashboard Features & Auth Mastery ───────────────────────
    {
      id: '1.20', trail: 1,
      title: 'Understand the Story Album banner',
      description: 'When completed events have no photo album, a banner prompts you to create one. Understand this event → media album workflow and why it matters for public galleries.',
      route: '/admin/dashboard', level: 'intermediate', estimatedMinutes: 3,
    },
    {
      id: '1.21', trail: 1,
      title: 'Open the Onboarding page',
      description: 'Click the progress bar or navigate to Onboarding in the sidebar. View the full checklist, auto-detected items, and trail breakdown to track your learning journey.',
      route: '/admin/onboarding', level: 'beginner', estimatedMinutes: 2,
      autoDetectAction: 'dashboard.onboarding_visited',
    },
    {
      id: '1.22', trail: 1,
      title: 'Click a stat card to navigate',
      description: 'Each stat card is a clickable link. Click "Active Programs" to jump to Programs, or "Total Events" to jump to Events. The breadcrumb bar shows where you are.',
      route: '/admin/dashboard', level: 'beginner', estimatedMinutes: 2,
      autoDetectAction: 'dashboard.stat_card_clicked',
    },
    {
      id: '1.23', trail: 1,
      title: 'Log out and log back in',
      description: 'Click the logout button in the sidebar user card, then log back in to practice the full authentication cycle.',
      route: '/admin/login', level: 'beginner', estimatedMinutes: 2,
    },
    {
      id: '1.24', trail: 1,
      title: 'Reset your password',
      description: 'Navigate to the forgot-password page, enter your email, follow the reset link, and set a new password.',
      route: '/admin/forgot-password', level: 'beginner', estimatedMinutes: 5,
    },
    {
      id: '1.25', trail: 1,
      title: 'Understand session expiry',
      description: 'Your session uses a JWT with automatic refresh. If idle too long, you will be redirected to login — this is normal and secure. No data is lost.',
      route: '/admin/dashboard', level: 'intermediate', estimatedMinutes: 2,
    },
  ],
};

// =============================================================================
// Trail 2 — Content Hub Orientation (Content Manager)
// =============================================================================

const trail2: BreadcrumbTrail = {
  number: 2,
  title: 'Content Hub Orientation',
  description: 'Navigate the Content Hub and understand the content model.',
  roles: ['content_manager', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '2.1', trail: 2, title: 'Open the Content hub', description: 'Click "Content" in the sidebar to see all content sections.', route: '/admin/content', level: 'beginner', estimatedMinutes: 3 },
    { id: '2.2', trail: 2, title: 'Understand the content model', description: 'Learn how each section maps to a public page.', route: '/admin/content', level: 'beginner', estimatedMinutes: 5 },
  ],
};

// =============================================================================
// Trail 3 — Hero Slides Management (Content Manager)
// =============================================================================

const trail3: BreadcrumbTrail = {
  number: 3,
  title: 'Hero Slides Management',
  description: 'Create, edit, reorder, and toggle hero carousel slides.',
  roles: ['content_manager', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '3.1', trail: 3, title: 'View existing hero slides', description: 'Open the Hero Slides page and see all current slides.', route: '/admin/content/hero', level: 'beginner', estimatedMinutes: 3 },
    { id: '3.2', trail: 3, title: "Edit a slide's headline", description: 'Click a slide, change the headline, save, and verify on the homepage.', route: '/admin/content/hero', level: 'beginner', estimatedMinutes: 5, autoDetectAction: 'hero.edited' },
    { id: '3.3', trail: 3, title: 'Reorder slides', description: 'Drag and drop slides to change carousel order.', route: '/admin/content/hero', level: 'intermediate', estimatedMinutes: 3 },
    { id: '3.4', trail: 3, title: 'Toggle a slide inactive', description: 'Deactivate a slide and confirm it disappears from the homepage.', route: '/admin/content/hero', level: 'intermediate', estimatedMinutes: 3 },
    { id: '3.5', trail: 3, title: 'Create a new hero slide', description: 'Create a slide with headline, subtitle, CTA buttons, and background image.', route: '/admin/content/hero', level: 'intermediate', estimatedMinutes: 10, autoDetectAction: 'hero.created' },
  ],
};

// =============================================================================
// Trail 4 — Programs Management (Content Manager)
// =============================================================================

const trail4: BreadcrumbTrail = {
  number: 4,
  title: 'Programs Management',
  description: 'View, create, edit, feature, and manage program galleries.',
  roles: ['content_manager', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '4.1', trail: 4, title: 'View all programs', description: 'Open the Programs page and browse all programs.', route: '/admin/content/programs', level: 'beginner', estimatedMinutes: 3 },
    { id: '4.2', trail: 4, title: 'Edit a program', description: 'Update a program\'s short description and verify on the public page.', route: '/admin/content/programs', level: 'beginner', estimatedMinutes: 5 },
    { id: '4.3', trail: 4, title: 'Understand the slug', description: 'Learn how slugs create public URLs for programs.', route: '/admin/content/programs', level: 'intermediate', estimatedMinutes: 3 },
    { id: '4.4', trail: 4, title: 'Feature a program', description: 'Toggle the Featured switch and verify the program appears on the homepage.', route: '/admin/content/programs', level: 'intermediate', estimatedMinutes: 3, autoDetectAction: 'program.featured' },
    { id: '4.5', trail: 4, title: 'Manage gallery images', description: 'Add gallery images to a program for the detail page.', route: '/admin/content/programs', level: 'intermediate', estimatedMinutes: 10 },
    { id: '4.6', trail: 4, title: 'Create a new program', description: 'Create a complete program entry with all fields.', route: '/admin/content/programs', level: 'intermediate', estimatedMinutes: 15, autoDetectAction: 'program.created' },
  ],
};

// =============================================================================
// Trail 5 — Stories Management (Content Manager)
// =============================================================================

const trail5: BreadcrumbTrail = {
  number: 5,
  title: 'Stories Management',
  description: 'Create, publish, unpublish, and feature stories.',
  roles: ['content_manager', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '5.1', trail: 5, title: 'View all stories', description: 'Open the Stories page and browse stories by status.', route: '/admin/content/stories', level: 'beginner', estimatedMinutes: 3 },
    { id: '5.2', trail: 5, title: 'Understand the publishing workflow', description: 'Learn the Draft → Published lifecycle.', route: '/admin/content/stories', level: 'beginner', estimatedMinutes: 3 },
    { id: '5.3', trail: 5, title: 'Create a draft story', description: 'Write a story with all fields and save as Draft.', route: '/admin/content/stories', level: 'intermediate', estimatedMinutes: 15, autoDetectAction: 'story.created' },
    { id: '5.4', trail: 5, title: 'Publish a story', description: 'Change a draft story to Published and verify on the public site.', route: '/admin/content/stories', level: 'intermediate', estimatedMinutes: 3, autoDetectAction: 'story.published' },
    { id: '5.5', trail: 5, title: 'Unpublish without deleting', description: 'Revert a published story to Draft to hide it from the public.', route: '/admin/content/stories', level: 'intermediate', estimatedMinutes: 3 },
    { id: '5.6', trail: 5, title: 'Feature a story', description: 'Toggle the Featured flag to show a story on the homepage carousel.', route: '/admin/content/stories', level: 'intermediate', estimatedMinutes: 3 },
  ],
};

// =============================================================================
// Trail 6 — Impact Metrics (Content Manager)
// =============================================================================

const trail6: BreadcrumbTrail = {
  number: 6,
  title: 'Impact Metrics',
  description: 'View, update, create, and reorder homepage counters.',
  roles: ['content_manager', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '6.1', trail: 6, title: 'View impact metrics', description: 'Open the Impact page and see all homepage counter values.', route: '/admin/content/impact', level: 'beginner', estimatedMinutes: 2 },
    { id: '6.2', trail: 6, title: 'Update a metric value', description: 'Change a metric\'s value and verify on the homepage.', route: '/admin/content/impact', level: 'beginner', estimatedMinutes: 5 },
    { id: '6.3', trail: 6, title: 'Create a new metric', description: 'Add a new counter with label, value, suffix, icon, and display order.', route: '/admin/content/impact', level: 'intermediate', estimatedMinutes: 5 },
    { id: '6.4', trail: 6, title: 'Reorder metrics', description: 'Drag and drop to change the display order of homepage counters.', route: '/admin/content/impact', level: 'intermediate', estimatedMinutes: 3 },
  ],
};

// =============================================================================
// Trail 7 — Board Members & Partners (Content Manager)
// =============================================================================

const trail7: BreadcrumbTrail = {
  number: 7,
  title: 'Board Members & Partners',
  description: 'Manage board member profiles and partner logos.',
  roles: ['content_manager', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '7.1', trail: 7, title: 'Manage board members', description: 'View, edit, create, and toggle board member profiles.', route: '/admin/content/board', level: 'intermediate', estimatedMinutes: 10 },
    { id: '7.2', trail: 7, title: 'Manage partners', description: 'Add partner logos and info for the homepage Trust Bar.', route: '/admin/content/partners', level: 'intermediate', estimatedMinutes: 10 },
  ],
};

// =============================================================================
// Trail 8 — Media Library (Content Manager / Events Manager)
// =============================================================================

const trail8: BreadcrumbTrail = {
  number: 8,
  title: 'Media Library',
  description: 'Upload images, manage albums, and link media to content.',
  roles: ['content_manager', 'events_manager', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '8.1', trail: 8, title: 'Browse the media library', description: 'Open the Media page and browse the image grid.', route: '/admin/media', level: 'beginner', estimatedMinutes: 3 },
    { id: '8.2', trail: 8, title: 'Upload a single image', description: 'Upload an image (JPEG, PNG, WebP, GIF — max 5 MB).', route: '/admin/media/upload', level: 'beginner', estimatedMinutes: 5, autoDetectAction: 'media.uploaded' },
    { id: '8.3', trail: 8, title: 'Bulk upload', description: 'Select multiple files and watch progress indicators.', route: '/admin/media/upload', level: 'intermediate', estimatedMinutes: 5 },
    { id: '8.4', trail: 8, title: 'Understand albums', description: 'Learn how albums group media into galleries.', route: '/admin/media', level: 'intermediate', estimatedMinutes: 5 },
    { id: '8.5', trail: 8, title: 'Create and populate an album', description: 'Create a new album, add images, and verify the public gallery.', route: '/admin/media', level: 'intermediate', estimatedMinutes: 10 },
  ],
};

// =============================================================================
// Trail 9 — Form Submissions (Content Manager / Admin)
// =============================================================================

/**
 * Trail 9 — Form Submissions
 *
 * ✅ Restored (Phase 2 — Breadcrumbs Audit)
 *
 * Routes `/admin/content/submissions` and `/admin/volunteer-applications` are now
 * implemented. See SubmissionsPage.tsx and VolunteerApplicationsPage.tsx.
 */
const trail9: BreadcrumbTrail = {
  number: 9,
  title: 'Form Submissions',
  description: 'Review contact submissions, partnership inquiries, and volunteer applications.',
  roles: ['content_manager', 'admin', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '9.1', trail: 9, title: 'View contact submissions', description: 'Open Submissions and see contact form entries.', route: '/admin/content/submissions', level: 'beginner', estimatedMinutes: 3 },
    { id: '9.2', trail: 9, title: 'View partnership inquiries', description: 'Filter for partnership-type submissions.', route: '/admin/content/submissions', level: 'beginner', estimatedMinutes: 3 },
    { id: '9.3', trail: 9, title: 'Review volunteer applications', description: 'Open Volunteer Applications and view submissions.', route: '/admin/volunteer-applications', level: 'intermediate', estimatedMinutes: 5 },
    { id: '9.4', trail: 9, title: 'Process a volunteer application', description: 'Walk through the full lifecycle: New → Under Review → Accepted/Rejected.', route: '/admin/volunteer-applications', level: 'intermediate', estimatedMinutes: 10 },
    { id: '9.5', trail: 9, title: 'Understand email notifications', description: 'Know that every form submission triggers automatic email notifications.', route: '/admin/content/submissions', level: 'intermediate', estimatedMinutes: 5 },

    // ── Section B: Email Reply System ──────────────────────────────────────
    { id: '9.6', trail: 9, title: 'Reply to a submission', description: 'Open a submission, click Reply, compose a message, and send a branded NF email to the submitter.', route: '/admin/content/submissions', level: 'intermediate', estimatedMinutes: 5, autoDetectAction: 'submission.reply_sent' },
    { id: '9.7', trail: 9, title: 'Use a quick reply template', description: 'Select a pre-written template from the template dropdown, customise it, and send.', route: '/admin/content/submissions', level: 'intermediate', estimatedMinutes: 3, autoDetectAction: 'submission.template_used' },
    { id: '9.8', trail: 9, title: 'Preview a reply email', description: 'Switch to the Preview tab in the reply modal to see exactly how the recipient will see the email.', route: '/admin/content/submissions', level: 'beginner', estimatedMinutes: 2 },
    { id: '9.9', trail: 9, title: 'Review reply history', description: 'Expand a submission to view the conversation timeline showing the original message and all admin replies.', route: '/admin/content/submissions', level: 'beginner', estimatedMinutes: 3 },
    { id: '9.10', trail: 9, title: 'Send a volunteer status email', description: 'Accept or reject a volunteer application and send the corresponding branded status email.', route: '/admin/volunteer-applications', level: 'intermediate', estimatedMinutes: 5, autoDetectAction: 'volunteer.status_email_sent' },
  ],
};

// =============================================================================
// Trail 10 — Events Management (Events Manager)
// =============================================================================
// 10 breadcrumbs covering the full events workflow:
//   A. Discovery  — opening the hub, filter tabs, view modes
//   B. Authoring  — create, draft vs. publish, edit
//   C. Lifecycle  — status transitions, duplicate, delete
//   D. Media      — uploading event photos / albums
//
// Route note: "Create Event" opens a modal ON /admin/events (EventList).
// There is no /admin/events/new standalone page used in normal flow any more.

const trail10: BreadcrumbTrail = {
  number: 10,
  title: 'Events Management',
  description: 'Create, manage, and track the full event lifecycle — from first draft to archived record.',
  roles: ['events_manager', 'owner', 'super_admin'],
  breadcrumbs: [
    // ── Step 1: Open Events hub ───────────────────────────────────────────
    {
      id: '10.1', trail: 10,
      title: 'Open the Events hub',
      description: 'Click Events in the sidebar to land on the events list. Observe the status-filter row, search bar, view-mode toggle, and the Create Event button.',
      route: '/admin/events', level: 'beginner', estimatedMinutes: 3,
      autoDetectAction: 'event.page_visited',
    },
    // ── Step 2: Status filter tabs overview ──────────────────────────────
    {
      id: '10.2', trail: 10,
      title: 'Use the event status filter tabs',
      description: 'Click each filter tab — All, Published, Draft, Completed, Archived — to understand what events belong to each lifecycle stage.',
      route: '/admin/events', level: 'beginner', estimatedMinutes: 3,
      autoDetectAction: 'event.filter_used',
    },
    // ── Step 3: Published filter ──────────────────────────────────────────
    {
      id: '10.3', trail: 10,
      title: 'Browse Published events',
      description: 'Use the Published filter to see all events currently live and visible to the public on the website.',
      route: '/admin/events', level: 'beginner', estimatedMinutes: 2,
    },
    // ── Step 4: Draft filter ──────────────────────────────────────────────
    {
      id: '10.4', trail: 10,
      title: 'Browse Draft events',
      description: 'Use the Draft filter to see private events visible only to admins — useful for preparing events before going public.',
      route: '/admin/events', level: 'beginner', estimatedMinutes: 2,
    },
    // ── Step 5: Completed filter ──────────────────────────────────────────
    {
      id: '10.5', trail: 10,
      title: 'Browse Completed events',
      description: 'Use the Completed filter to see past events. Completed events remain on the site as a record and can be linked to a photo album.',
      route: '/admin/events', level: 'beginner', estimatedMinutes: 2,
    },
    // ── Step 6: Archived filter ───────────────────────────────────────────
    {
      id: '10.6', trail: 10,
      title: 'Browse Archived events',
      description: 'Use the Archived filter to see events removed from the public site but kept for internal records.',
      route: '/admin/events', level: 'beginner', estimatedMinutes: 2,
    },
    // ── Step 7: Grid & List view toggle ──────────────────────────────────
    {
      id: '10.7', trail: 10,
      title: 'Switch between Grid and List view',
      description: 'Click the Grid/List toggle (top-right of the filter row) to switch views. Grid shows visual cards; List shows a compact table suited for bulk scanning.',
      route: '/admin/events', level: 'beginner', estimatedMinutes: 2,
      autoDetectAction: 'event.view_switched',
    },
    // ── Step 8: Create Event button ───────────────────────────────────────
    {
      id: '10.8', trail: 10,
      title: 'Create a new event',
      description: 'Click the Create Event button to open the event creation form.',
      route: '/admin/events', level: 'intermediate', estimatedMinutes: 5,
      autoDetectAction: 'event.created',
    },
    // ── Step 9: Complete the event creation form ──────────────────────────
    {
      id: '10.9', trail: 10,
      title: 'Complete the event creation form',
      description: 'Fill in all required fields (name, date, location or virtual link), set the status to Draft or Published, and save the event.',
      route: '/admin/events', level: 'intermediate', estimatedMinutes: 10,
    },
  ],
};

// =============================================================================
// Trail 11 — Site Settings (Admin)
// =============================================================================

const trail11: BreadcrumbTrail = {
  number: 11,
  title: 'Site Settings',
  description: 'Configure global site settings including contact info and social links.',
  roles: ['admin', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '11.1', trail: 11, title: 'Open Site Settings', description: 'Navigate to Site Settings and view all configuration values.', route: '/admin/site-settings', level: 'beginner', estimatedMinutes: 3 },
    { id: '11.2', trail: 11, title: 'Update contact information', description: 'Change contact email, phone, or address and verify on the public site.', route: '/admin/site-settings', level: 'beginner', estimatedMinutes: 5 },
    { id: '11.3', trail: 11, title: 'Update social media links', description: 'Add or change URLs for social media platforms.', route: '/admin/site-settings', level: 'intermediate', estimatedMinutes: 5 },
  ],
};

// =============================================================================
// Trail 12 — Bank Details Management (Admin)
// =============================================================================

const trail12: BreadcrumbTrail = {
  number: 12,
  title: 'Bank Details Management',
  description: 'Manage encrypted payment methods, toggle visibility, and review audit logs.',
  roles: ['admin', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '12.1', trail: 12, title: 'View payment methods', description: 'Open Bank Details and see all configured payment methods.', route: '/admin/bank-details', level: 'beginner', estimatedMinutes: 5 },
    { id: '12.2', trail: 12, title: 'Understand encryption', description: 'Learn how sensitive fields are encrypted at rest via pgcrypto.', route: '/admin/bank-details', level: 'intermediate', estimatedMinutes: 5 },
    { id: '12.3', trail: 12, title: 'Add a payment method', description: 'Create a new payment method (Bank Transfer, M-Pesa, PayPal, or Stripe).', route: '/admin/bank-details', level: 'intermediate', estimatedMinutes: 10, autoDetectAction: 'bank.created' },
    { id: '12.4', trail: 12, title: 'Edit a payment method', description: 'Edit an existing payment method\'s details.', route: '/admin/bank-details', level: 'intermediate', estimatedMinutes: 5 },
    { id: '12.5', trail: 12, title: 'Toggle visibility', description: 'Show/hide a payment method on the public page.', route: '/admin/bank-details', level: 'intermediate', estimatedMinutes: 3, autoDetectAction: 'bank.toggled' },
    { id: '12.6', trail: 12, title: 'Reorder payment methods', description: 'Drag and drop to change the public display order.', route: '/admin/bank-details', level: 'intermediate', estimatedMinutes: 3 },
    { id: '12.7', trail: 12, title: 'Read the audit log', description: 'Review the detailed audit log of all bank detail operations.', route: '/admin/bank-details', level: 'intermediate', estimatedMinutes: 5 },
  ],
};

// =============================================================================
// Trail 13 — Maintenance System (Admin)
// =============================================================================

const trail13: BreadcrumbTrail = {
  number: 13,
  title: 'Maintenance System',
  description: 'Create and manage maintenance rules with real-time propagation.',
  roles: ['admin', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '13.1', trail: 13, title: 'Open the Maintenance dashboard', description: 'Navigate to Maintenance and view all rules.', route: '/admin/maintenance', level: 'intermediate', estimatedMinutes: 3 },
    { id: '13.2', trail: 13, title: 'Understand maintenance scopes', description: 'Learn the five scopes: global, page, section, component, feature_group.', route: '/admin/maintenance', level: 'intermediate', estimatedMinutes: 5 },
    { id: '13.3', trail: 13, title: 'Understand severity levels', description: 'Learn the three severities: full_block, degraded, notice.', route: '/admin/maintenance', level: 'intermediate', estimatedMinutes: 5 },
    { id: '13.4', trail: 13, title: 'Create a maintenance rule', description: 'Create a rule with scope, target, severity, message, and schedule.', route: '/admin/maintenance/new', level: 'intermediate', estimatedMinutes: 10, autoDetectAction: 'maintenance.rule_created' },
    { id: '13.5', trail: 13, title: 'Verify real-time updates', description: 'Observe maintenance state take effect in real time on the public site.', route: '/admin/maintenance', level: 'advanced', estimatedMinutes: 5 },
    { id: '13.6', trail: 13, title: 'Edit and deactivate a rule', description: 'Modify or deactivate a rule and confirm the public site reverts.', route: '/admin/maintenance', level: 'intermediate', estimatedMinutes: 5 },
    { id: '13.7', trail: 13, title: 'Review maintenance history', description: 'See all past maintenance events and their duration.', route: '/admin/maintenance/history', level: 'intermediate', estimatedMinutes: 3 },
    { id: '13.8', trail: 13, title: 'SEO safety check', description: 'Understand HTTP 503 + Retry-After headers during maintenance.', route: '/admin/maintenance', level: 'advanced', estimatedMinutes: 5 },
  ],
};

// =============================================================================
// Trail 14 — Dashboard Data Export (Admin)
// =============================================================================

const trail14: BreadcrumbTrail = {
  number: 14,
  title: 'Dashboard Data Export',
  description: 'Export dashboard data and reports for offline analysis.',
  roles: ['admin', 'owner', 'super_admin'],
  breadcrumbs: [
    { id: '14.1', trail: 14, title: 'Export dashboard data', description: 'Use the export function on the dashboard to download data.', route: '/admin/dashboard', level: 'intermediate', estimatedMinutes: 5 },
    { id: '14.2', trail: 14, title: 'Export reports', description: 'Download report data for offline analysis or sharing.', route: '/admin/dashboard', level: 'intermediate', estimatedMinutes: 5 },
  ],
};

// =============================================================================
// Trail 15 — Owner-Level Bank Detail Management
// =============================================================================

const trail15: BreadcrumbTrail = {
  number: 15,
  title: 'Owner-Level Bank Detail Management',
  description: 'Delete payment methods and audit deletions.',
  roles: ['owner', 'super_admin'],
  breadcrumbs: [
    { id: '15.1', trail: 15, title: 'Delete a payment method', description: 'Permanently delete a bank record (Owner/Super Admin only).', route: '/admin/bank-details', level: 'advanced', estimatedMinutes: 5 },
    { id: '15.2', trail: 15, title: 'Audit a deletion', description: 'Verify the audit log shows the deletion event with full detail.', route: '/admin/bank-details', level: 'advanced', estimatedMinutes: 5 },
    { id: '15.3', trail: 15, title: 'Full platform review', description: 'Walk through every admin section to verify full access.', route: '/admin/dashboard', level: 'intermediate', estimatedMinutes: 15 },
  ],
};

// =============================================================================
// Trail 16 — User Management (Super Admin)
// =============================================================================

const trail16: BreadcrumbTrail = {
  number: 16,
  title: 'User Management',
  description: 'Invite, promote, demote, deactivate, and delete admin users.',
  roles: ['super_admin'],
  breadcrumbs: [
    { id: '16.1', trail: 16, title: 'View all users', description: 'Open Users and see every admin user with their role and status.', route: '/admin/users', level: 'intermediate', estimatedMinutes: 3 },
    { id: '16.2', trail: 16, title: 'Understand the role hierarchy', description: 'Review the 6-tier hierarchy and permission model.', route: '/admin/users', level: 'intermediate', estimatedMinutes: 10 },
    { id: '16.3', trail: 16, title: 'Invite a new user', description: 'Send an invitation email with a selected role.', route: '/admin/users', level: 'intermediate', estimatedMinutes: 5, autoDetectAction: 'user.invited' },
    { id: '16.4', trail: 16, title: "Change a user's role", description: 'Select a new role and save — permissions update immediately.', route: '/admin/users', level: 'advanced', estimatedMinutes: 5, autoDetectAction: 'user.role_changed' },
    { id: '16.5', trail: 16, title: 'Deactivate a user', description: 'Toggle Active off to block a user from logging in.', route: '/admin/users', level: 'advanced', estimatedMinutes: 3 },
    { id: '16.6', trail: 16, title: 'Re-activate a user', description: 'Toggle Active back on to restore access.', route: '/admin/users', level: 'advanced', estimatedMinutes: 2 },
    { id: '16.7', trail: 16, title: 'Delete a user', description: 'Permanently delete a user account (irreversible).', route: '/admin/users', level: 'advanced', estimatedMinutes: 3 },
  ],
};

// =============================================================================
// Trail 17 — Role Assignment Strategy (Super Admin)
// =============================================================================

const trail17: BreadcrumbTrail = {
  number: 17,
  title: 'Role Assignment Strategy',
  description: 'Apply least-privilege principles and test role permissions.',
  roles: ['super_admin'],
  breadcrumbs: [
    { id: '17.1', trail: 17, title: 'Principle of least privilege', description: 'Assign the lowest role that covers each user\'s responsibilities.', route: '/admin/users', level: 'advanced', estimatedMinutes: 5 },
    { id: '17.2', trail: 17, title: 'Map staff to roles', description: 'Create a mapping of all staff to their correct roles.', route: '/admin/users', level: 'advanced', estimatedMinutes: 15 },
    { id: '17.3', trail: 17, title: 'Test each role', description: 'Create test accounts and verify the permissions matrix.', route: '/admin/users', level: 'advanced', estimatedMinutes: 20 },
    { id: '17.4', trail: 17, title: 'Emergency access protocol', description: 'Know how to promote a user via the Supabase Dashboard SQL editor.', route: '/admin/users', level: 'advanced', estimatedMinutes: 5 },
  ],
};

// =============================================================================
// Trail 18 — System Security Review (Super Admin)
// =============================================================================

const trail18: BreadcrumbTrail = {
  number: 18,
  title: 'System Security Review',
  description: 'Verify RLS policies, session management, and audit access.',
  roles: ['super_admin'],
  breadcrumbs: [
    { id: '18.1', trail: 18, title: 'Verify RLS policies', description: 'Understand that Row Level Security is the source of truth.', route: '/admin/dashboard', level: 'advanced', estimatedMinutes: 10 },
    { id: '18.2', trail: 18, title: 'Review session management', description: 'Understand JWT lifetime and auto-refresh behaviour.', route: '/admin/dashboard', level: 'advanced', estimatedMinutes: 5 },
    { id: '18.3', trail: 18, title: 'Emergency account suspension', description: 'Know how to set profiles.is_active = false for instant access revocation.', route: '/admin/dashboard', level: 'advanced', estimatedMinutes: 5 },
    { id: '18.4', trail: 18, title: 'Audit bank detail access', description: 'Review the bank details audit log for anomalies.', route: '/admin/bank-details', level: 'advanced', estimatedMinutes: 10 },
  ],
};

// =============================================================================
// All Trails (ordered)
// =============================================================================

export const ALL_TRAILS: BreadcrumbTrail[] = [
  trail1,
  trail2,
  trail3,
  trail4,
  trail5,
  trail6,
  trail7,
  trail8,
  trail9,
  trail10,
  trail11,
  trail12,
  trail13,
  trail14,
  trail15,
  trail16,
  trail17,
  trail18,
];

/**
 * Returns trails assigned to the given role (includes inherited trails
 * since higher roles inherit all lower-role trails).
 */
export function getTrailsForRole(role: string): BreadcrumbTrail[] {
  return ALL_TRAILS.filter((trail) =>
    trail.roles.includes(role as BreadcrumbTrail['roles'][number]),
  );
}

/**
 * Returns a flat list of all breadcrumbs for the given role.
 */
export function getBreadcrumbsForRole(role: string): BreadcrumbTrail['breadcrumbs'] {
  return getTrailsForRole(role).flatMap((t) => t.breadcrumbs);
}

/**
 * Returns a single trail by number.
 */
export function getTrailByNumber(num: number): BreadcrumbTrail | undefined {
  return ALL_TRAILS.find((t) => t.number === num);
}
