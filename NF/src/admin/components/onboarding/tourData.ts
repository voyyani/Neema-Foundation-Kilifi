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
// Content Manager Tour (Trails 2–9) — Phase 2: Deep Multi-Step Coverage
// =============================================================================
// 41 ordered steps that take a Content Manager through every content section
// with depth: navigating inside each feature, highlighting key UI elements,
// explaining the "why", and ending on actions that auto-detect breadcrumbs.
//
// Trail 2 (Content Hub)   — 3 steps: hub overview, content model, navigation
// Trail 3 (Hero Slides)   — 5 steps: view, edit, reorder, toggle, create
// Trail 4 (Programs)      — 6 steps: view, filters, slug, featured, gallery, create
// Trail 5 (Stories)       — 6 steps: view, status filter, draft workflow, publish, unpublish, feature
// Trail 6 (Impact Metrics)— 4 steps: view, edit value, create, reorder
// Trail 7 (Board/Partners)— 4 steps: board list, edit member, partners list, trust bar
// Trail 8 (Media)         — 5 steps: browse, upload, bulk, albums concept, create album
// Trail 9 (Submissions)   — 8 steps: contact, partnership, volunteer, reply, template, preview, history, status email
// =============================================================================

const contentManagerTour: RoleTour = {
  id: 'content_manager',
  name: 'Content Management Mastery',
  description:
    'Master every content section — hero slides, programs, stories, impact metrics, media, board members, partners, and form submissions.',
  roles: ['content_manager', 'owner', 'super_admin'],
  trails: [2, 3, 4, 5, 6, 7, 8, 9],
  estimatedMinutes: 40,
  steps: [

    // =========================================================================
    // TRAIL 2 — Content Hub Orientation (3 steps)
    // =========================================================================

    // ── T2 Step 1: Navigate to Content Hub ────────────────────────────────
    {
      target: '[data-tour="nav-content"]',
      title: '① Content Hub — Your Command Centre',
      content:
        'Click <strong>Content</strong> in the sidebar to open the <strong>Content Hub</strong>. This is the single gateway to every piece of content on the Neema Foundation website — hero slides, programs, stories, impact numbers, board profiles, and partner logos.',
      route: '/admin/content',
      placement: 'right',
      trailNumber: 2,
      breadcrumbId: '2.1',
    },

    // ── T2 Step 2: Hub overview — section grid ────────────────────────────
    {
      target: '[data-tour="content-hub-grid"]',
      title: '② Content Sections — Seven Pillars',
      content:
        'The hub shows seven cards, each representing a distinct content type. <strong>Programs</strong> → live initiatives. <strong>Hero Slides</strong> → homepage carousel. <strong>Stories</strong> → impact stories. <strong>Impact Metrics</strong> → animated counters. <strong>Partners</strong> → trust bar. <strong>Board Members</strong> → leadership profiles. <strong>Submissions</strong> → form entries. Click any card to manage that section.',
      route: '/admin/content',
      placement: 'right',
      trailNumber: 2,
      breadcrumbId: '2.2',
    },

    // ── T2 Step 3: Navigate into a section ───────────────────────────────
    {
      target: '[data-tour="content-programs-card"]',
      title: '③ Section Navigation Pattern',
      content:
        'Click any card to jump straight into that content section. Notice the <strong>hover border</strong> turns blue — that\'s the consistent navigation affordance across the hub. Each section has its own full-page manager. Use the breadcrumb bar at the top to navigate back here.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 2,
      breadcrumbId: '2.2',
    },

    // =========================================================================
    // TRAIL 3 — Hero Slides (5 steps)
    // =========================================================================

    // ── T3 Step 1: Open Hero Slides ───────────────────────────────────────
    {
      target: '[data-tour="content-hero-card"]',
      title: '① Hero Slides — Homepage First Impression',
      content:
        'The <strong>Hero Slides</strong> card takes you to the homepage carousel manager. Each slide is the first thing a visitor sees — it needs a compelling headline, a subtitle, a call-to-action button, and a background image. Click the card now or click <strong>Next →</strong>.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 3,
      breadcrumbId: '3.1',
    },

    // ── T3 Step 2: View existing slides ───────────────────────────────────
    {
      target: '[data-tour="hero-slides-list"]',
      title: '② Current Slides',
      content:
        'This grid shows every current hero slide with its title, subtitle, CTA label, and active/inactive badge. <span style="color:#16a34a">Green badge</span> = visible on the homepage. <span style="color:#6b7280">Grey badge</span> = hidden. Inactive slides are preserved — they can be re-activated at any time without recreating them.',
      route: '/admin/content/hero',
      placement: 'top',
      trailNumber: 3,
      breadcrumbId: '3.1',
    },

    // ── T3 Step 3: Reorder button ─────────────────────────────────────────
    {
      target: '[data-tour="hero-reorder-btn"]',
      title: '③ Reorder Slides',
      content:
        'Click <strong>Reorder Slides</strong> to enter drag-and-drop mode. Grab a slide by its handle and drag it to a new position — the order here is exactly what visitors see in the carousel. When happy, click <strong>Done Reordering</strong> to save.',
      route: '/admin/content/hero',
      placement: 'bottom',
      trailNumber: 3,
      breadcrumbId: '3.3',
      skipIfMissing: true,
    },

    // ── T3 Step 4: Toggle active / inactive ───────────────────────────────
    {
      target: '[data-tour="hero-slides-list"]',
      title: '④ Toggle Slides Active / Inactive',
      content:
        'Each slide card has an <strong>Eye icon</strong> (👁) toggle button. Click it to <em>hide</em> a slide from the homepage — useful when a campaign ends or a slide needs updating. Click again to re-activate. The slide data is never deleted, just hidden.',
      route: '/admin/content/hero',
      placement: 'top',
      trailNumber: 3,
      breadcrumbId: '3.4',
    },

    // ── T3 Step 5: Create new slide ───────────────────────────────────────
    {
      target: '[data-tour="hero-create-btn"]',
      title: '⑤ Add a New Slide',
      content:
        'Click <strong>Add Slide</strong> to open the slide creation form. Fill in: <em>Headline</em> (large text), <em>Subtitle</em> (smaller supporting text), <em>CTA Button 1 & 2</em> (label + link), and <em>Background Image</em> (upload via Cloudinary). Save and the slide appears immediately on the homepage.',
      route: '/admin/content/hero',
      placement: 'bottom',
      trailNumber: 3,
      breadcrumbId: '3.5',
    },

    // =========================================================================
    // TRAIL 4 — Programs (6 steps)
    // =========================================================================

    // ── T4 Step 1: Open Programs ──────────────────────────────────────────
    {
      target: '[data-tour="content-programs-card"]',
      title: '① Programs — Core Foundation Initiatives',
      content:
        'Programs are the foundation\'s <strong>active initiatives</strong> — Clean Water, Education, Women\'s Empowerment, etc. Each program has a public-facing page with a cover image, description, gallery, and impact metrics. Click the card to open the Programs manager.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 4,
      breadcrumbId: '4.1',
    },

    // ── T4 Step 2: Programs list & filters ───────────────────────────────
    {
      target: '[data-tour="programs-filters"]',
      title: '② Filter & Search Programs',
      content:
        'Use the <strong>search bar</strong> to find programs by name or summary. The <em>Category</em> dropdown filters by Health, Education, Empowerment, Community, or Other. The <em>Status</em> dropdown shows All, Active, Inactive, or Featured. These filters help you manage a growing library of programs efficiently.',
      route: '/admin/content/programs',
      placement: 'bottom',
      trailNumber: 4,
      breadcrumbId: '4.1',
    },

    // ── T4 Step 3: Slug explanation ───────────────────────────────────────
    {
      target: '[data-tour="programs-list"]',
      title: '③ Understanding the Program Slug',
      content:
        'Click <strong>Edit</strong> on any program. The <em>slug</em> field controls the public URL — e.g. a slug of <code>clean-water</code> creates <code>/programs/clean-water</code>. Slugs must be unique and URL-safe (lowercase, hyphens only). <strong>Important:</strong> once a program is live, changing its slug breaks existing links — treat it as permanent.',
      route: '/admin/content/programs',
      placement: 'top',
      trailNumber: 4,
      breadcrumbId: '4.3',
      skipIfMissing: true,
    },

    // ── T4 Step 4: Featured toggle ────────────────────────────────────────
    {
      target: '[data-tour="programs-list"]',
      title: '④ Feature a Program on the Homepage',
      content:
        'Each program card has a <strong>⭐ Featured toggle</strong>. When on, the program appears in the homepage <em>Featured Programs</em> section. Use this for your highest-impact or most active programs — typically 2–4 at any time. The toggle changes take effect on the public site within seconds.',
      route: '/admin/content/programs',
      placement: 'top',
      trailNumber: 4,
      breadcrumbId: '4.4',
    },

    // ── T4 Step 5: Gallery images ─────────────────────────────────────────
    {
      target: '[data-tour="programs-create-btn"]',
      title: '⑤ Program Galleries',
      content:
        'Inside the program edit form, scroll to the <strong>Gallery</strong> section. Upload multiple images that appear on the program\'s detail page. Each image is hosted on Cloudinary (auto-optimised for web). Gallery images tell the story of a program visually — aim for 5–10 high-quality photos per program.',
      route: '/admin/content/programs',
      placement: 'bottom',
      trailNumber: 4,
      breadcrumbId: '4.5',
    },

    // ── T4 Step 6: Create program ─────────────────────────────────────────
    {
      target: '[data-tour="programs-create-btn"]',
      title: '⑥ Create a New Program',
      content:
        'Click <strong>Add Program</strong> to open the full program creation form. Required fields: <em>Name</em>, <em>Slug</em>, <em>Category</em>, <em>Summary</em> (homepage card text). Optional but recommended: <em>Full Description</em>, <em>Cover Image</em>, <em>Gallery</em>, <em>Goals</em>, <em>Target Audience</em>. Save and the program appears on the public Programs page immediately.',
      route: '/admin/content/programs',
      placement: 'bottom',
      trailNumber: 4,
      breadcrumbId: '4.6',
    },

    // =========================================================================
    // TRAIL 5 — Stories (6 steps)
    // =========================================================================

    // ── T5 Step 1: Open Stories ───────────────────────────────────────────
    {
      target: '[data-tour="content-stories-card"]',
      title: '① Stories — Impact Narratives',
      content:
        'Stories are the <strong>human voice</strong> of the foundation — impact reports, volunteer testimonials, event recaps, and news. A great story with a strong image can be more persuasive than any statistic. Click the Stories card to open the Stories manager.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 5,
      breadcrumbId: '5.1',
    },

    // ── T5 Step 2: Draft / Published filter ──────────────────────────────
    {
      target: '[data-tour="stories-status-filter"]',
      title: '② Draft vs Published — The Publishing Workflow',
      content:
        'Use the <strong>Status</strong> dropdown to switch between All, Draft, and Published views. <strong>Draft</strong> stories are private — only admins see them. <strong>Published</strong> stories are live on the public website. This lets you work on a story privately until it\'s ready. Always publish deliberately — not accidentally.',
      route: '/admin/content/stories',
      placement: 'bottom',
      trailNumber: 5,
      breadcrumbId: '5.2',
    },

    // ── T5 Step 3: Stories list overview ─────────────────────────────────
    {
      target: '[data-tour="stories-list"]',
      title: '③ Stories Grid',
      content:
        'Each story card shows the cover image, title, category badge, publish status (green = Published, grey = Draft), and a featured badge if applicable. The <strong>action buttons</strong> beneath each card let you: <em>Edit</em> (edit all fields), <em>Publish / Unpublish</em>, <em>⭐ Feature</em>, and <em>🗑 Delete</em>.',
      route: '/admin/content/stories',
      placement: 'top',
      trailNumber: 5,
      breadcrumbId: '5.1',
    },

    // ── T5 Step 4: Create a draft story ──────────────────────────────────
    {
      target: '[data-tour="stories-create-btn"]',
      title: '④ Create a Draft Story',
      content:
        'Click <strong>New Story</strong> to open the story editor. Fill in: <em>Title</em>, <em>Category</em> (Impact, Testimonial, Event, News, Volunteer), <em>Excerpt</em> (2–3 sentence teaser), <em>Full Content</em> (rich text editor), <em>Author Name + Role</em>, and <em>Cover Image</em>. Save — it defaults to <strong>Draft</strong> so it\'s private until you\'re ready.',
      route: '/admin/content/stories',
      placement: 'bottom',
      trailNumber: 5,
      breadcrumbId: '5.3',
    },

    // ── T5 Step 5: Publish / unpublish ────────────────────────────────────
    {
      target: '[data-tour="stories-list"]',
      title: '⑤ Publish & Unpublish Stories',
      content:
        'On any draft story card, click the green <strong>Publish</strong> button to make it live on the website immediately. On a published story, click <strong>Unpublish</strong> to hide it from the public without deleting it — the content is safely preserved in Draft. Use unpublish for stories that are outdated or need revision, not delete.',
      route: '/admin/content/stories',
      placement: 'top',
      trailNumber: 5,
      breadcrumbId: '5.4',
    },

    // ── T5 Step 6: Feature a story ────────────────────────────────────────
    {
      target: '[data-tour="stories-list"]',
      title: '⑥ Feature a Story on the Homepage',
      content:
        'Click the <strong>⭐ star icon</strong> on any story card to toggle the Featured flag. Featured stories appear in the homepage Stories carousel. You can feature multiple stories — they rotate in the carousel. Feature your most recent, visually strong, or highest-impact stories.',
      route: '/admin/content/stories',
      placement: 'top',
      trailNumber: 5,
      breadcrumbId: '5.6',
    },

    // =========================================================================
    // TRAIL 6 — Impact Metrics (4 steps)
    // =========================================================================

    // ── T6 Step 1: Open Impact ────────────────────────────────────────────
    {
      target: '[data-tour="content-impact-card"]',
      title: '① Impact Metrics — Numbers That Inspire',
      content:
        'The <strong>Impact Metrics</strong> section controls the animated counters on the homepage — e.g. <em>"2,000+ Families Served"</em>, <em>"85% Clean Water Coverage"</em>. These numbers are powerful trust signals. Keeping them accurate and up-to-date builds credibility.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 6,
      breadcrumbId: '6.1',
    },

    // ── T6 Step 2: Metrics grid — edit value ─────────────────────────────
    {
      target: '[data-tour="impact-metrics-list"]',
      title: '② Edit a Metric Value',
      content:
        'Click the <strong>Edit</strong> icon on any metric card. Each metric has: <em>Value</em> (the number), <em>Suffix</em> (optional — e.g. <code>+</code>, <code>%</code>, <code>K</code>), <em>Label</em> (e.g. "Families Served"), <em>Icon</em>, and <em>Active toggle</em>. Change the value and save — the homepage counter updates immediately. Keep these numbers reflecting current reality.',
      route: '/admin/content/impact',
      placement: 'top',
      trailNumber: 6,
      breadcrumbId: '6.2',
    },

    // ── T6 Step 3: Create a metric ────────────────────────────────────────
    {
      target: '[data-tour="impact-create-btn"]',
      title: '③ Create a New Metric',
      content:
        'Click <strong>New Metric</strong> to add a counter. Choose an icon from the library that visually represents the stat (e.g. Users icon for families, Heart for health initiatives). The <em>Display Order</em> controls left-to-right position in the homepage counter row. Set it to 1 for the most important metric.',
      route: '/admin/content/impact',
      placement: 'bottom',
      trailNumber: 6,
      breadcrumbId: '6.3',
    },

    // ── T6 Step 4: Reorder metrics ────────────────────────────────────────
    {
      target: '[data-tour="impact-metrics-list"]',
      title: '④ Display Order Matters',
      content:
        'The homepage shows metrics in order of their <em>Display Order</em> field — lowest number first. When editing a metric, adjust the <strong>Display Order</strong> number to reposition it. Best practice: put your most impressive number first (e.g. total families served) to hook the reader immediately.',
      route: '/admin/content/impact',
      placement: 'top',
      trailNumber: 6,
      breadcrumbId: '6.4',
    },

    // =========================================================================
    // TRAIL 7 — Board Members & Partners (4 steps)
    // =========================================================================

    // ── T7 Step 1: Board Members list ────────────────────────────────────
    {
      target: '[data-tour="content-board-card"]',
      title: '① Board Members — Leadership Profiles',
      content:
        'The <strong>Board Members</strong> section manages the leadership team profiles visible on the About page. Each member profile includes: name, role/title, organisation, bio (rich text), photo, email, and LinkedIn URL. Active board members appear publicly; inactive ones are hidden but preserved.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 7,
      breadcrumbId: '7.1',
    },

    // ── T7 Step 2: Edit a board member ───────────────────────────────────
    {
      target: '[data-tour="board-list"]',
      title: '② Edit a Board Member Profile',
      content:
        'Click <strong>Edit</strong> on any board card to open the edit form. Update the bio using the <em>rich text editor</em> — bold, bullet points, and links are supported. The <em>Display Order</em> field controls the order on the public page. Toggle the <em>Active</em> switch to show or hide a member without deleting their profile.',
      route: '/admin/content/board',
      placement: 'top',
      trailNumber: 7,
      breadcrumbId: '7.1',
    },

    // ── T7 Step 3: Partners list ──────────────────────────────────────────
    {
      target: '[data-tour="content-partners-card"]',
      title: '③ Partners — Trust Bar Logos',
      content:
        'The <strong>Partners</strong> card opens the partners manager. Partner logos appear in the homepage <em>Trust Bar</em> — a horizontal strip of logos that signals credibility to visitors. Each partner has a name, logo image (via Cloudinary), optional website URL, and display order.',
      route: '/admin/content',
      placement: 'bottom',
      trailNumber: 7,
      breadcrumbId: '7.2',
    },

    // ── T7 Step 4: Partners — trust bar impact ────────────────────────────
    {
      target: '[data-tour="nav-content"]',
      title: '④ The Trust Bar — Why Partners Matter',
      content:
        'The Trust Bar auto-scrolls through all active partner logos on the homepage. It signals institutional credibility — donors and volunteers trust organisations with recognisable partners. Keep this list current: add new partners promptly and deactivate ones whose partnerships have ended.',
      route: '/admin/content/partners',
      placement: 'right',
      trailNumber: 7,
      breadcrumbId: '7.2',
      skipIfMissing: false,
    },

    // =========================================================================
    // TRAIL 8 — Media Library (5 steps)
    // =========================================================================

    // ── T8 Step 1: Navigate to Media ─────────────────────────────────────
    {
      target: '[data-tour="nav-media"]',
      title: '① Media Library — Your Visual Asset Hub',
      content:
        'The <strong>Media Library</strong> is the foundation\'s central image store. All photos — event photos, program galleries, team portraits — live here in <em>Albums</em>. Albums can be linked to events and programs so they appear as public galleries. Click <strong>Media</strong> in the sidebar.',
      route: '/admin/media',
      placement: 'right',
      trailNumber: 8,
      breadcrumbId: '8.1',
    },

    // ── T8 Step 2: Browse albums grid ────────────────────────────────────
    {
      target: '[data-tour="media-album-list"]',
      title: '② Browsing Albums',
      content:
        'Albums are organised by type: <strong>Events</strong>, <strong>Programs</strong>, <strong>Behind the Scenes</strong>, and <strong>Miscellaneous</strong>. Use the filter tabs to browse by type or the status filter for Published / Draft. Each album card shows its cover image, title, type badge, and publish status. Click any album to view and manage its images.',
      route: '/admin/media',
      placement: 'top',
      trailNumber: 8,
      breadcrumbId: '8.1',
    },

    // ── T8 Step 3: Upload an image ────────────────────────────────────────
    {
      target: '[data-tour="album-create-btn"]',
      title: '③ Uploading Images',
      content:
        'Images are uploaded <em>inside albums</em>. First create or open an album, then use the <strong>Upload</strong> area inside. Supported formats: JPEG, PNG, WebP, GIF (max 5 MB per file). Images are automatically optimised and resized by Cloudinary. Add an alt text for each image for accessibility.',
      route: '/admin/media',
      placement: 'bottom',
      trailNumber: 8,
      breadcrumbId: '8.2',
    },

    // ── T8 Step 4: Albums concept ─────────────────────────────────────────
    {
      target: '[data-tour="album-create-btn"]',
      title: '④ Albums — Organise & Link',
      content:
        'An album is more than a folder — it can be <strong>linked to an event or program</strong>. When linked, the album\'s images appear as a public gallery on that event or program\'s page automatically. After an event, create an album, upload photos, link it to the event, and publish — the gallery goes live instantly.',
      route: '/admin/media',
      placement: 'bottom',
      trailNumber: 8,
      breadcrumbId: '8.4',
    },

    // ── T8 Step 5: Create an album ────────────────────────────────────────
    {
      target: '[data-tour="album-create-btn"]',
      title: '⑤ Create a New Album',
      content:
        'Click <strong>New Album</strong> to open the creation form. Required: <em>Title</em>, <em>Type</em> (event / program / behind-the-scenes / misc). Optional: <em>Description</em>, <em>Linked Event</em>, <em>Linked Program</em>. Set <em>Published</em> = true when the album is ready for the public. After creating, open the album to start uploading images.',
      route: '/admin/media',
      placement: 'bottom',
      trailNumber: 8,
      breadcrumbId: '8.5',
    },

    // =========================================================================
    // TRAIL 9 — Form Submissions (8 steps)
    // =========================================================================

    // ── T9 Step 1: Navigate to Submissions ───────────────────────────────
    {
      target: '[data-tour="nav-submissions"]',
      title: '① Form Submissions — Inbox from the Public',
      content:
        'The <strong>Submissions</strong> section is your inbox for all contact form entries from the public site. It receives three types: <em>Contact</em> (general enquiries), <em>Partnership</em> (organisations seeking collaboration), and <em>Volunteer Applications</em> (people wanting to volunteer). Click Submissions in the sidebar.',
      route: '/admin/submissions',
      placement: 'right',
      trailNumber: 9,
      breadcrumbId: '9.1',
    },

    // ── T9 Step 2: Contact & Partnership tabs ────────────────────────────
    {
      target: '[data-tour="submissions-table"]',
      title: '② Tabs — Contact, Partnership, Volunteer',
      content:
        'The submissions page has three tabs. <strong>Contact</strong> shows general enquiries. <strong>Partnership</strong> shows organisations that want to partner with the foundation. Both are managed here. <strong>Volunteer Applications</strong> has its own dedicated page accessible via the sidebar. Each submission shows a status badge: New → In Progress → Responded → Closed.',
      route: '/admin/submissions',
      placement: 'top',
      trailNumber: 9,
      breadcrumbId: '9.2',
    },

    // ── T9 Step 3: Volunteer applications ────────────────────────────────
    {
      target: '[data-tour="nav-submissions"]',
      title: '③ Volunteer Applications',
      content:
        'Volunteer applications live at <strong>Volunteer Apps</strong> in the sidebar (look below Submissions). Applications follow a workflow: <em>New → Under Review → Accepted / Rejected / Waitlisted</em>. Click any application to expand it, review the applicant\'s motivation and experience, and update the status.',
      route: '/admin/submissions',
      placement: 'right',
      trailNumber: 9,
      breadcrumbId: '9.3',
    },

    // ── T9 Step 4: Reply modal ────────────────────────────────────────────
    {
      target: '[data-tour="submissions-table"]',
      title: '④ Reply to a Submission',
      content:
        'Click on any submission to expand it and reveal the <strong>Reply</strong> button. Clicking Reply opens a modal where you compose a fully branded Neema Foundation email. The response is sent directly to the submitter\'s email address from the configured reply address. The status auto-updates to <em>Responded</em> after sending.',
      route: '/admin/submissions',
      placement: 'top',
      trailNumber: 9,
      breadcrumbId: '9.6',
    },

    // ── T9 Step 5: Template dropdown ─────────────────────────────────────
    {
      target: '[data-tour="submissions-table"]',
      title: '⑤ Quick Reply Templates',
      content:
        'Inside the Reply modal, the <strong>Template dropdown</strong> lets you select pre-written response templates (e.g. "Acknowledge Contact", "Partnership Interest Response"). Select a template → it fills the subject and body automatically → customise as needed → send. Templates save time and ensure consistent, professional responses.',
      route: '/admin/submissions',
      placement: 'top',
      trailNumber: 9,
      breadcrumbId: '9.7',
    },

    // ── T9 Step 6: Preview tab ────────────────────────────────────────────
    {
      target: '[data-tour="submissions-table"]',
      title: '⑥ Preview Your Email Before Sending',
      content:
        'In the Reply modal, before hitting Send, switch to the <strong>Preview tab</strong>. You\'ll see exactly how the email will appear to the recipient — with the Neema Foundation branding, your message, and the sign-off. Always preview before sending to catch formatting issues.',
      route: '/admin/submissions',
      placement: 'top',
      trailNumber: 9,
      breadcrumbId: '9.8',
    },

    // ── T9 Step 7: Reply history ──────────────────────────────────────────
    {
      target: '[data-tour="submissions-table"]',
      title: '⑦ Conversation History',
      content:
        'Expand any submission and scroll down past the Reply button to the <strong>Conversation Timeline</strong>. It shows every reply sent to this person, in order — who sent it, when, and the subject. This gives you the full context of the conversation before replying again. Never send duplicate replies accidentally.',
      route: '/admin/submissions',
      placement: 'top',
      trailNumber: 9,
      breadcrumbId: '9.9',
    },

    // ── T9 Step 8: Status email (Volunteer) ───────────────────────────────
    {
      target: '[data-tour="nav-submissions"]',
      title: '⑧ Volunteer Status Emails',
      content:
        'On the Volunteer Applications page, when you change a status to <strong>Accepted</strong>, <strong>Rejected</strong>, or <strong>Waitlisted</strong>, a prompt appears to send a branded status email to the applicant. Click <em>"Send email to [name]"</em> — this opens a pre-filled Reply modal with the appropriate template. Always send a status email so applicants aren\'t left waiting.',
      route: '/admin/submissions',
      placement: 'right',
      trailNumber: 9,
      breadcrumbId: '9.10',
    },

  ],
};

// =============================================================================
// Owner Tour (Trails 1, 12, 15, 16) — Phase 2: Owner-Specific Responsibilities
// =============================================================================
// 13 ordered steps covering the unique responsibilities of the Owner role:
//   Trail 1  — full-system overview from an ownership perspective
//   Trail 12 — financial management and bank detail governance
//   Trail 15 — owner-level bank detail deletion and audit
//   Trail 16 — team management: invite, roles, and emergency protocols
// =============================================================================

const ownerTour: RoleTour = {
  id: 'owner',
  name: 'Owner Responsibilities',
  description:
    'Master the responsibilities unique to the Owner role — financial oversight, content governance, team management, and emergency access protocols.',
  roles: ['owner'],
  trails: [1, 12, 15, 16],
  estimatedMinutes: 25,
  steps: [

    // ── Step 1: Full-system access verification ──────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '① Full Platform Access',
      content:
        'As <strong>Owner</strong>, every sidebar link is unlocked. You have access to all content, events, media, submissions, users, bank details, maintenance, and site settings. With great power comes great responsibility — your actions affect the public website in real time. Walk through each sidebar section to verify your access.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.5',
    },

    // ── Step 2: Dashboard overview from ownership lens ───────────────────
    {
      target: '[data-tour="stats-cards"]',
      title: '② Dashboard — System Health at a Glance',
      content:
        'As Owner, the dashboard is your <strong>high-level system health view</strong>. Stat cards show you the platform\'s overall activity. Watch for: a rising count of unresponded submissions (reply backlog), draft programs/stories (content in limbo), and upcoming events needing attention. Check this weekly.',
      route: '/admin/dashboard',
      placement: 'bottom',
      trailNumber: 1,
      breadcrumbId: '1.11',
    },

    // ── Step 3: Quick Actions for owners ─────────────────────────────────
    {
      target: '[data-tour="quick-actions"]',
      title: '③ Governance via Quick Actions',
      content:
        'Your Quick Actions include all content operations plus <strong>Bank Details</strong> and <strong>Site Settings</strong> — Owner-exclusive items. Use Bank Details to approve payment method changes. Use Site Settings to update brand configuration. These are high-impact actions that affect what every visitor sees.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.13',
      skipIfMissing: true,
    },

    // ── Step 4: Bank Details — financial oversight ────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '④ Financial Oversight — Payment Methods',
      content:
        'Navigate to <strong>Bank Details</strong>. As Owner, you have full CRUD access to donation payment methods — Bank Transfer, M-Pesa Paybill, PayPal, and Stripe. You can create, edit, toggle visibility, reorder, and <strong>delete</strong> payment methods. Admins can manage but not delete; only Owner and Super Admin can permanently delete.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 12,
      breadcrumbId: '12.1',
    },

    // ── Step 5: Encryption & security notice ─────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '⑤ Encryption & Data Security',
      content:
        'Sensitive fields (account numbers, IBAN, SWIFT) are stored encrypted with <strong>AES-256-GCM</strong> via pgcrypto. Only masked values are shown in the admin UI. If you ever need the actual value, retrieve it via Supabase Dashboard with encrypted column access. This encryption protects donors and the foundation from data breaches.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 12,
      breadcrumbId: '12.2',
    },

    // ── Step 6: Visibility toggle ─────────────────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '⑥ Public Visibility Toggle',
      content:
        'Each payment method has an <strong>is_public</strong> toggle. <em>Public</em> methods appear on the Donate page for supporters to use. <em>Private</em> methods are visible in the admin only. A payment method might be private when: you\'re configuring it, it\'s seasonal (e.g. campaign-specific), or it\'s being deprecated. Always toggle public only when the method is fully configured.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 12,
      breadcrumbId: '12.5',
    },

    // ── Step 7: Audit log ─────────────────────────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '⑦ Change History — Immutable Audit Log',
      content:
        'Scroll down on Bank Details to the <strong>Change History</strong> section. Every create, edit, toggle, and delete action is logged here — who, when, what changed. This log is append-only (immutable). Review it regularly to spot unauthorised changes. For your peace of mind: this is your compliance trail.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.2',
    },

    // ── Step 8: Delete a payment method ──────────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '⑧ Deleting Payment Methods (Owner Only)',
      content:
        'The <strong>Delete</strong> button on payment methods is visible only to Owner and Super Admin. Deletion is <em>permanent and irreversible</em> — the record is gone from the database. Use delete only when a payment method is no longer valid at all (e.g. account closed, provider discontinued). For temporary removal, use the visibility toggle instead.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.1',
    },

    // ── Step 9: User management — view all users ──────────────────────────
    {
      target: '[data-tour="nav-users"]',
      title: '⑨ Team Management — User Oversight',
      content:
        'Navigate to <strong>Users</strong>. As Owner you can see all admin users, their roles, and their active status. You can invite new team members, change roles, and deactivate accounts. The 6-tier hierarchy: Super Admin → <strong>Owner</strong> → Admin → Events Manager → Content Manager → Viewer.',
      route: '/admin/users',
      placement: 'right',
      trailNumber: 16,
      breadcrumbId: '16.1',
    },

    // ── Step 10: Invite a user ────────────────────────────────────────────
    {
      target: '[data-tour="users-invite-btn"]',
      title: '⑩ Inviting New Team Members',
      content:
        'Click <strong>Invite User</strong> to send an invitation email. Select the appropriate role: assign the <em>lowest role that covers their work</em> (principle of least privilege). A content team member should be Content Manager, not Owner. An events coordinator should be Events Manager or Content Manager, not Admin.',
      route: '/admin/users',
      placement: 'bottom',
      trailNumber: 16,
      breadcrumbId: '16.3',
    },

    // ── Step 11: Change roles ─────────────────────────────────────────────
    {
      target: '[data-tour="users-list"]',
      title: '⑪ Changing User Roles',
      content:
        'Click any user row to open their profile. Change the role via the <strong>Role</strong> dropdown and save — the change takes effect immediately. The user will see different menu items and permissions on their next page load. Always confirm with the user after a role change so they know what changed.',
      route: '/admin/users',
      placement: 'top',
      trailNumber: 16,
      breadcrumbId: '16.4',
    },

    // ── Step 12: Deactivate a user ────────────────────────────────────────
    {
      target: '[data-tour="users-list"]',
      title: '⑫ Deactivating & Emergency Access',
      content:
        'To block a user from logging in, toggle their <strong>Active</strong> switch to off — they cannot log in while inactive. This is your primary emergency control. For a more permanent block, you can also set <code>profiles.is_active = false</code> directly in the Supabase Dashboard SQL editor, which takes effect instantly even if the admin is currently logged in.',
      route: '/admin/users',
      placement: 'top',
      trailNumber: 16,
      breadcrumbId: '16.5',
    },

    // ── Step 13: Full-system review ───────────────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '⑬ Completing Your Owner Orientation',
      content:
        'You now understand the full scope of Owner responsibilities: financial governance (bank details), content oversight (all sections), team management (users), and emergency protocols. Return to this tour anytime from the <strong>Help Menu (?) → Owner Responsibilities</strong>. Welcome to ownership of the Neema Foundation admin — you\'ve got this! 🎉',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 1,
      breadcrumbId: '1.19',
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
// Admin Tour (Trails 11–14) — Phase 2: Deep Coverage (~12 steps)
// =============================================================================
// Expands from 4 stub steps to 12 deep steps across all admin trails:
//   Trail 11: Site settings — form fields one by one (contact, social, brand)
//   Trail 12: Bank details — visibility toggle, encryption, audit trail
//   Trail 13: Maintenance — rule creation, scope, severity, real-time
//   Trail 14: Data export — marked as future feature, explained here
// =============================================================================

const adminTour: RoleTour = {
  id: 'admin',
  name: 'Administration & Settings',
  description:
    'Configure site settings, manage bank payment methods, set up maintenance rules, and understand data export. Master the administrative backbone of the platform.',
  roles: ['admin', 'owner', 'super_admin'],
  trails: [11, 12, 13, 14],
  estimatedMinutes: 25,
  steps: [

    // =========================================================================
    // TRAIL 11 — Site Settings (~3 steps)
    // =========================================================================

    // ── Step 1: Navigate to Site Settings ────────────────────────────────
    {
      target: '[data-tour="nav-site-settings"]',
      title: '① Site Settings — Global Platform Configuration',
      content:
        'Click <strong>Site Settings</strong> in the sidebar. This is the global configuration for the entire Neema Foundation website — brand name, tagline, contact details, social media links, and brand colours. Changes here update the page header, footer, and contact page on the public site automatically.',
      route: '/admin/site-settings',
      placement: 'right',
      trailNumber: 11,
      breadcrumbId: '11.1',
    },

    // ── Step 2: Contact information fields ────────────────────────────────
    {
      target: '[data-tour="site-settings-contact"]',
      title: '② Contact Information',
      content:
        'The <strong>Contact Information</strong> section updates how supporters can reach the foundation. <em>Contact Email</em> appears on the contact page and in auto-reply emails. <em>Phone</em> and <em>Address</em> appear in the footer and on the contact page. Keep these accurate — outdated contact details lose supporters.',
      route: '/admin/site-settings',
      placement: 'top',
      trailNumber: 11,
      breadcrumbId: '11.2',
      skipIfMissing: true,
    },

    // ── Step 3: Social media links ────────────────────────────────────────
    {
      target: '[data-tour="site-settings-social"]',
      title: '③ Social Media Links',
      content:
        'The <strong>Social Media</strong> section controls which platforms appear in the header and footer. Each platform has a URL field and an <em>Enabled toggle</em> — if disabled, the icon disappears from the site even if a URL is set. Enable only platforms you actively use. Dead social links signal neglect to visitors.',
      route: '/admin/site-settings',
      placement: 'top',
      trailNumber: 11,
      breadcrumbId: '11.3',
      skipIfMissing: true,
    },

    // =========================================================================
    // TRAIL 12 — Bank Details (~3 steps)
    // =========================================================================

    // ── Step 4: Navigate to Bank Details ─────────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '④ Bank Details — Donation Payment Methods',
      content:
        'Click <strong>Bank Details</strong> in the sidebar. This page manages all payment methods displayed on the public Donate page: Bank Transfer (account number, sort code), M-Pesa Paybill, PayPal donation link, and Stripe. Each method is individually controlled — you can add, edit, reorder, show/hide, and (for Owner/Super Admin) delete.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 12,
      breadcrumbId: '12.1',
    },

    // ── Step 5: Visibility toggle & ordering ─────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '⑤ Visibility, Ordering & Encryption',
      content:
        'Each payment method card has an <strong>Eye toggle</strong> to show/hide it on the public page. Drag payment methods to reorder their display. Account numbers and IBAN/SWIFT codes are <strong>AES-256-GCM encrypted</strong> at rest — only masked values appear in the UI. The security notice on this page explains this clearly. Best practice: only toggle a method public when it\'s fully configured.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 12,
      breadcrumbId: '12.5',
    },

    // ── Step 6: Audit log ─────────────────────────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '⑥ Change History — The Audit Trail',
      content:
        'Scroll to the bottom of Bank Details to see the <strong>Change History</strong>. Every action — create, edit, visibility toggle, reorder, delete — is logged with the acting user, timestamp, and changed fields. This audit trail is <em>append-only</em> (no-one can edit or delete it). Review it weekly to catch any unauthorised changes to payment methods.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 12,
      breadcrumbId: '12.7',
    },

    // =========================================================================
    // TRAIL 13 — Maintenance System (~5 steps)
    // =========================================================================

    // ── Step 7: Navigate to Maintenance ──────────────────────────────────
    {
      target: '[data-tour="nav-maintenance"]',
      title: '⑦ Maintenance System — Surgical Site Control',
      content:
        'Click <strong>Maintenance</strong> in the sidebar. The Maintenance System lets you put any part of the site — from a single component to the entire public site — into maintenance mode. This is essential for safe deployments, data migrations, and planned downtime. Rules propagate in real time via Supabase Realtime.',
      route: '/admin/maintenance',
      placement: 'right',
      trailNumber: 13,
      breadcrumbId: '13.1',
    },

    // ── Step 8: Scopes explained ──────────────────────────────────────────
    {
      target: '[data-tour="maintenance-rules-list"]',
      title: '⑧ Maintenance Scopes — Surgery vs. Full Shutdown',
      content:
        'Rules have five <strong>scopes</strong>: <br/>• <em>Global</em> — entire public site <br/>• <em>Page</em> — single page (e.g. /programs) <br/>• <em>Section</em> — a page section (e.g. hero) <br/>• <em>Component</em> — a specific UI element <br/>• <em>Feature Group</em> — a logical group (e.g. all forms) <br/>Use the narrowest scope possible. A Global Full Block shows the maintenance page to every visitor immediately.',
      route: '/admin/maintenance',
      placement: 'top',
      trailNumber: 13,
      breadcrumbId: '13.2',
    },

    // ── Step 9: Severity levels ───────────────────────────────────────────
    {
      target: '[data-tour="maintenance-rules-list"]',
      title: '⑨ Severity Levels — Intensity of Disruption',
      content:
        'Rules have three <strong>severity levels</strong>: <br/>• <em>Full Block</em> — replaces content with a "Site under maintenance" screen + HTTP 503 <br/>• <em>Degraded</em> — shows a banner warning but content still loads <br/>• <em>Notice</em> — minimal informational banner, no disruption <br/>Choose severity carefully. A Full Block on a Global scope = complete public site shutdown.',
      route: '/admin/maintenance',
      placement: 'top',
      trailNumber: 13,
      breadcrumbId: '13.3',
    },

    // ── Step 10: Create a rule ────────────────────────────────────────────
    {
      target: '[data-tour="maintenance-new-btn"]',
      title: '⑩ Create a Maintenance Rule',
      content:
        'Click <strong>New Rule</strong> to open the rule creation form. Required fields: <em>Title</em>, <em>Scope</em>, <em>Severity</em>, <em>Public Message</em> (what visitors see). Optional: <em>Target</em> (specific page path or component name), <em>Start / End time</em> (for scheduled maintenance), <em>Contact Email</em> (in message). Save — the rule takes effect <em>immediately</em>.',
      route: '/admin/maintenance',
      placement: 'bottom',
      trailNumber: 13,
      breadcrumbId: '13.4',
      skipIfMissing: true,
    },

    // ── Step 11: Active rules list & SEO ─────────────────────────────────
    {
      target: '[data-tour="maintenance-rules-list"]',
      title: '⑪ Active Rules & SEO Safety',
      content:
        'The rules list shows all active and inactive rules. The toggle beside each rule activates / deactivates it instantly. Important: when a Global Full Block rule is active, the Vercel Edge Middleware returns <strong>HTTP 503 + Retry-After header</strong>. This protects your Google SEO ranking — search engines know to come back, not to de-index the site.',
      route: '/admin/maintenance',
      placement: 'top',
      trailNumber: 13,
      breadcrumbId: '13.5',
    },

    // =========================================================================
    // TRAIL 14 — Data Export (~1 step — future feature)
    // =========================================================================

    // ── Step 12: Data Export (future) ────────────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '⑫ Data Export — Coming Soon',
      content:
        'The <strong>Data Export</strong> feature (Trail 14) is on the roadmap. When built, it will allow you to download CSV exports of events, submissions, volunteer applications, and program data for offline analysis and reporting. For now, you can export data directly from the Supabase Dashboard under <em>Table Editor → Download CSV</em>. We\'ll add the in-app export in a future release.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 14,
      breadcrumbId: '14.1',
    },

  ],
};

// =============================================================================
// Super Admin Tour (Trails 16–18)
// =============================================================================

// =============================================================================
// Super Admin Tour (Trails 15–18) — Phase 2: RBAC Deep Coverage (~15 steps)
// =============================================================================
// Expands from 7 stub steps to 15 deep steps:
//   Trail 15: RBAC architecture — 6-tier hierarchy, hasPermission(), RLS, PoLP
//   Trail 15: Owner-level bank deletions + audit
//   Trail 16: User management — invite, promote, deactivate, delete
//   Trails 17–18: Security audit, emergency access, SEO integrity
// =============================================================================

const superAdminTour: RoleTour = {
  id: 'super_admin',
  name: 'User, Security & RBAC Management',
  description:
    'Master the 6-tier role hierarchy, RBAC architecture, user lifecycle management, and emergency access protocols. Super Admin is the only role that can permanently delete users and payment methods.',
  roles: ['super_admin'],
  trails: [15, 16, 17, 18],
  estimatedMinutes: 30,
  steps: [

    // =========================================================================
    // TRAIL 15a — RBAC Architecture (~5 steps)
    // =========================================================================

    // ── Step 1: 6-tier role hierarchy ─────────────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '① RBAC — The 6-Tier Role Hierarchy',
      content:
        'The platform uses a strict <strong>6-tier Role-Based Access Control</strong> hierarchy:<br/><br/>1. <em>Super Admin</em> — full destructive access, user & role management<br/>2. <em>Owner</em> — bank deletion, platform oversight<br/>3. <em>Admin</em> — settings, maintenance, all content<br/>4. <em>Content Manager</em> — all content sections (no settings)<br/>5. <em>Events Manager</em> — events only<br/>6. <em>Viewer</em> — read-only dashboard<br/><br/>Each role is a strict superset of the one below. <em>Super Admin</em> is the only role that can create/delete other Super Admins.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.1',
    },

    // ── Step 2: hasPermission() in auth.ts ───────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '② The Permission Gate — hasPermission() & usePermissions()',
      content:
        'Every protected UI element and API action is guarded by <code>hasPermission(role, action)</code> in <code>src/lib/auth.ts</code>. The <code>usePermissions()</code> React hook wraps this for component-level checks. <br/><br/>Permission checks follow the hierarchy: if <code>admin</code> can do X, then <code>owner</code> and <code>super_admin</code> can too. Adding a new action requires updating the <code>PERMISSION_MAP</code> constant — <em>never</em> hardcode role checks inline in components.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.2',
    },

    // ── Step 3: Row Level Security (RLS) ─────────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '③ Database Layer — Row Level Security (RLS)',
      content:
        'The frontend permission checks are a UX convenience. The <strong>real security enforcement</strong> is Supabase Row Level Security (RLS) at the PostgreSQL layer. Every table that contains user data has RLS policies that check the JWT\'s <code>app_metadata.role</code> field. Even if a front-end check is bypassed, the database will reject unauthorised reads and writes. Check <code>supabase-schema.sql</code> to review the RLS policy definitions.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.3',
    },

    // ── Step 4: Principle of Least Privilege ─────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '④ Principle of Least Privilege (PoLP)',
      content:
        'Always assign the <strong>lowest role</strong> that covers a person\'s actual responsibilities. A person managing only events should be <em>Events Manager</em>, not Admin. A person writing blog posts should be <em>Content Manager</em>, not Admin. Excessive permissions are a security liability — they expand the blast radius of a compromised account. Review all user roles quarterly.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.4',
    },

    // ── Step 5: Emergency de-activation ──────────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '⑤ Emergency Access Revocation',
      content:
        'If an account is compromised or a staff member departs unexpectedly: <br/><br/>1. Go to <strong>Users</strong> → toggle their account <em>Inactive</em><br/>2. In Supabase Dashboard → Auth → Users → disable the user<br/>3. Set <code>profiles.is_active = false</code> in Table Editor for database-layer enforcement<br/><br/>All three together are belt-and-braces. Step 1 alone revokes admin portal access. Steps 2–3 revoke API access. Complete all three for full revocation.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.5',
    },

    // =========================================================================
    // TRAIL 15b — Owner-Level Bank Detail Management (deletion + audit)
    // =========================================================================

    // ── Step 6: Permanent deletion power ─────────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '⑥ Owner-Level Bank Controls — Permanent Deletion',
      content:
        'As Super Admin you have full destructive access, including <strong>permanent deletion</strong> of payment methods. This is restricted to Owner and Super Admin because deletions are <em>irreversible</em> — no recycle bin, no undo. Before deleting, verify the payment method has zero pending donations and has been superseded by an updated record.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.6',
    },

    // ── Step 7: Audit trail ───────────────────────────────────────────────
    {
      target: '[data-tour="nav-bank-details"]',
      title: '⑦ Bank Detail Audit Trail',
      content:
        'After any bank detail change, scroll to the <strong>Change History</strong> section. Every action — create, edit, visibility toggle, reorder, delete — is appended with actor, timestamp, and changed fields. This log is <em>append-only</em> (protected by RLS — even Super Admin cannot delete an audit row). Review it after each change to confirm intentions.',
      route: '/admin/bank-details',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.7',
    },

    // ── Step 8: Full platform access check ───────────────────────────────
    {
      target: '[data-tour="sidebar"]',
      title: '⑧ Full Platform Access Check',
      content:
        'As Super Admin every sidebar item is unlocked. Walk through: <em>Dashboard → Events → Media → Content → Submissions → Volunteer Applications → Users → Bank Details → Maintenance → Site Settings</em>. If any section is unexpectedly hidden, check that <code>hasPermission(\'super_admin\', action)</code> returns true in <code>auth.ts</code> for the guarding action. A missing entry in <code>PERMISSION_MAP</code> is the most common cause.',
      route: '/admin/dashboard',
      placement: 'right',
      trailNumber: 15,
      breadcrumbId: '15.8',
    },

    // =========================================================================
    // TRAIL 16 — User Management (~4 steps)
    // =========================================================================

    // ── Step 9: Navigate to Users ─────────────────────────────────────────
    {
      target: '[data-tour="nav-users"]',
      title: '⑨ User Management — The Admin Directory',
      content:
        'Click <strong>Users</strong> in the sidebar. This page shows every admin account: name, email, role badge, last-active timestamp, and active/inactive status. Filtered by role using the tabs at the top. Only Super Admin can see the full list — Admins see only users below their own tier.',
      route: '/admin/users',
      placement: 'right',
      trailNumber: 16,
      breadcrumbId: '16.1',
    },

    // ── Step 10: Invite ───────────────────────────────────────────────────
    {
      target: '[data-tour="users-invite-btn"]',
      title: '⑩ Invite a New Admin User',
      content:
        'Click <strong>Invite User</strong>. Enter their email and select the appropriate role (applying PoLP). They receive an email invitation with a secure link. When they click it and set their password, a row is created in both <code>auth.users</code> and <code>profiles</code>. Until they accept, they appear as "Pending" in the list.',
      route: '/admin/users',
      placement: 'bottom',
      trailNumber: 16,
      breadcrumbId: '16.3',
      skipIfMissing: true,
    },

    // ── Step 11: Role changes ─────────────────────────────────────────────
    {
      target: '[data-tour="users-list"]',
      title: '⑪ Promote, Demote & Deactivate',
      content:
        'Click any user card to open their profile. You can: <br/>• Change their role (takes effect immediately for all future API calls)<br/>• Toggle <em>Active / Inactive</em> (inactive blocks portal login)<br/>• Delete the account (removes <code>profiles</code> row + disables auth account)<br/><br/>The 6-tier hierarchy is enforced — you cannot assign a role equal to or above your own. Super Admin can only be created by another Super Admin.',
      route: '/admin/users',
      placement: 'top',
      trailNumber: 16,
      breadcrumbId: '16.4',
    },

    // ── Step 12: Quarterly user audit ────────────────────────────────────
    {
      target: '[data-tour="users-list"]',
      title: '⑫ Quarterly User Audit Practice',
      content:
        'Run a quarterly audit: <br/>1. Filter by each role tab and verify every account is still needed<br/>2. Check <em>Last Active</em> — users inactive for 90+ days should be reviewed<br/>3. Confirm no one has a higher role than their responsibilities require<br/>4. Cross-reference with the organisation\'s active volunteers/staff list<br/><br/>Documenting this in a log email preserves your compliance trail.',
      route: '/admin/users',
      placement: 'top',
      trailNumber: 16,
      breadcrumbId: '16.5',
    },

    // =========================================================================
    // TRAIL 17 — System Integrity (~2 steps)
    // =========================================================================

    // ── Step 13: RLS integrity check ─────────────────────────────────────
    {
      target: '[data-tour="user-menu"]',
      title: '⑬ Database Integrity — RLS Policy Review',
      content:
        'Periodically audit Supabase RLS policies from the Dashboard → Database → Policies page. Confirm every table that stores sensitive data (user profiles, bank details, submissions) has <em>SELECT / INSERT / UPDATE / DELETE</em> policies scoped to the correct roles. A misconfigured RLS <code>USING</code> clause is the most dangerous configuration mistake in the platform.',
      route: '/admin/dashboard',
      placement: 'bottom',
      trailNumber: 17,
      breadcrumbId: '17.1',
    },

    // ── Step 14: Edge middleware & SEO ────────────────────────────────────
    {
      target: '[data-tour="user-menu"]',
      title: '⑭ Vercel Edge Middleware — 503 & SEO Protection',
      content:
        'The <code>middleware.ts</code> at the repository root runs on Vercel\'s Edge Network before any page load. When a Global Full Block maintenance rule is active, it intercepts all requests and returns <strong>HTTP 503 + Retry-After: 3600</strong>. This signals search engines to retry rather than de-index the site. Review <code>middleware.ts</code> to understand the maintenance cookie bypass for admin sessions.',
      route: '/admin/dashboard',
      placement: 'bottom',
      trailNumber: 17,
      breadcrumbId: '17.2',
    },

    // =========================================================================
    // TRAIL 18 — Security Hardening (~1 step)
    // =========================================================================

    // ── Step 15: Security hardening summary ──────────────────────────────
    {
      target: '[data-tour="user-menu"]',
      title: '⑮ Security Hardening Checklist',
      content:
        'Your ongoing Super Admin security responsibilities: <br/>• ✅ Enable MFA on your Supabase account<br/>• ✅ Rotate Supabase <code>service_role</code> key if ever exposed<br/>• ✅ Review Vercel Environment Variables quarterly<br/>• ✅ Monitor the bank-detail audit log weekly<br/>• ✅ Run user role audit quarterly<br/>• ✅ Check Supabase audit log for unusual API activity monthly<br/><br/>Treat access to this admin portal with the same care as banking credentials.',
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
  ownerTour,
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
