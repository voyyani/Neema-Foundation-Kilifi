/**
 * Quick Reply Templates — Phase 4 (Email Reply System)
 *
 * Pre-written response templates for common scenarios. Each template supports
 * placeholder tokens that are resolved at selection time in the ReplyModal.
 *
 * Placeholders:
 *   {name}         → Recipient's first name
 *   {fullName}     → Recipient's full name
 *   {subject}      → Original subject line
 *   {organization} → Organisation name (partnerships)
 *   {date}         → Submission date (formatted)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReplyTemplate {
  /** Unique key stored in `submission_replies.template_used` */
  key: string;
  /** Human-readable name shown in the selector */
  name: string;
  /** Short description / use-case hint */
  description: string;
  /** Submission types this template is most relevant for (empty = all) */
  applicableTo: ('contact' | 'partnership' | 'volunteer' | 'event' | 'donation')[];
  /** Template body with placeholders */
  body: string;
  /** Optional category for grouping in the selector */
  category: 'acknowledgement' | 'follow-up' | 'information';
}

// ---------------------------------------------------------------------------
// Placeholder resolver
// ---------------------------------------------------------------------------

export interface TemplatePlaceholders {
  name: string;
  fullName: string;
  subject: string;
  organization?: string;
  date: string;
}

/**
 * Replaces `{token}` placeholders in a template body with actual values.
 * Unknown tokens are left as-is so the admin can fill them in manually.
 */
export function resolveTemplatePlaceholders(
  body: string,
  placeholders: TemplatePlaceholders,
): string {
  return body
    .replace(/\{name\}/g, placeholders.name)
    .replace(/\{fullName\}/g, placeholders.fullName)
    .replace(/\{subject\}/g, placeholders.subject)
    .replace(/\{organization\}/g, placeholders.organization ?? '{organization}')
    .replace(/\{date\}/g, placeholders.date);
}

// ---------------------------------------------------------------------------
// Template library
// ---------------------------------------------------------------------------

export const REPLY_TEMPLATES: ReplyTemplate[] = [
  // ── Acknowledgements ────────────────────────────────────────────────────
  {
    key: 'thank_contact',
    name: 'Thank You (Contact)',
    description: 'General acknowledgement for contact form submissions',
    applicableTo: ['contact'],
    category: 'acknowledgement',
    body: `Hi {name},

Thank you for reaching out to Neema Foundation Kilifi. We've received your message regarding "{subject}" and truly appreciate you taking the time to connect with us.

Our team is reviewing your inquiry and will get back to you within 3–5 business days. If your matter is urgent, please don't hesitate to follow up.

We look forward to continuing this conversation.`,
  },
  {
    key: 'thank_partner',
    name: 'Thank You (Partnership)',
    description: 'Acknowledgement for partnership inquiries',
    applicableTo: ['partnership'],
    category: 'acknowledgement',
    body: `Hi {name},

Thank you for your interest in partnering with Neema Foundation Kilifi. We're always looking for organisations who share our vision for transforming communities in Kilifi County through healthcare, education, and empowerment.

We'd love to explore how we can work together. Our partnerships team will review your inquiry and reach out within the next few days to discuss potential collaboration opportunities.

In the meantime, feel free to visit our website to learn more about our current programmes and impact.`,
  },
  {
    key: 'donation_thanks',
    name: 'Donation Thanks',
    description: 'Gratitude for donation inquiries or contributions',
    applicableTo: ['donation'],
    category: 'acknowledgement',
    body: `Hi {name},

Your generosity means the world to us and the communities we serve in Ganze, Kilifi County. Every contribution — no matter the size — helps us continue our mission of transforming lives through healthcare, education, and community empowerment.

We'll be in touch shortly with more details on how your support will make a difference. Thank you for being part of the Neema Foundation family.`,
  },

  // ── Information ─────────────────────────────────────────────────────────
  {
    key: 'need_info',
    name: 'Request More Info',
    description: 'Ask the sender for additional details',
    applicableTo: [],
    category: 'information',
    body: `Hi {name},

Thank you for your message. To better assist you, could you please provide a bit more detail about your inquiry? Specifically, it would help us to know:

1. The specific programme or service you're interested in
2. Any relevant dates or timelines
3. How you'd prefer us to follow up with you

This will help us connect you with the right team member and give you the most helpful response.`,
  },
  {
    key: 'event_info',
    name: 'Event Information',
    description: 'Response to event-related enquiries',
    applicableTo: ['contact', 'event'],
    category: 'information',
    body: `Hi {name},

Thank you for your interest in our upcoming events at Neema Foundation Kilifi! We're delighted to share more details with you.

Please let us know which event you'd like to learn more about, and we'll send you the full schedule, location details, and any registration information you might need.

You can also check our website for the latest updates on community events and programmes.`,
  },

  // ── Follow-ups ──────────────────────────────────────────────────────────
  {
    key: 'follow_up',
    name: 'Follow Up',
    description: 'Check in after a previous conversation',
    applicableTo: [],
    category: 'follow-up',
    body: `Hi {name},

We wanted to follow up on your earlier message regarding "{subject}" (sent on {date}). We hope our previous response was helpful.

Is there anything else we can assist you with, or any additional information you need? We're here to help.`,
  },
  {
    key: 'follow_up_partner',
    name: 'Partnership Follow Up',
    description: 'Follow up on a partnership conversation',
    applicableTo: ['partnership'],
    category: 'follow-up',
    body: `Hi {name},

We're following up on your partnership inquiry from {date}. We're very excited about the possibility of working together and wanted to check in on next steps.

Would you be available for a brief call or meeting in the coming week to discuss how we can align our efforts? Please let us know a few times that work for you, and we'll set something up.`,
  },
  {
    key: 'general_update',
    name: 'General Update',
    description: 'Provide a status update on their inquiry',
    applicableTo: [],
    category: 'follow-up',
    body: `Hi {name},

We wanted to give you a quick update on your inquiry regarding "{subject}". Our team is actively working on this and we expect to have a full response for you shortly.

Thank you for your patience — we want to make sure we give your message the attention it deserves.`,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Group templates by category for display in the selector. */
export function getTemplatesByCategory(): Record<ReplyTemplate['category'], ReplyTemplate[]> {
  const grouped: Record<ReplyTemplate['category'], ReplyTemplate[]> = {
    acknowledgement: [],
    'follow-up': [],
    information: [],
  };

  for (const t of REPLY_TEMPLATES) {
    grouped[t.category].push(t);
  }

  return grouped;
}

/** Find templates relevant to a submission type (returns all if type has no specific matches). */
export function getTemplatesForType(
  submissionType: string,
): ReplyTemplate[] {
  const typeMatches = REPLY_TEMPLATES.filter(
    (t) => t.applicableTo.length > 0 && t.applicableTo.includes(submissionType as never),
  );
  const universals = REPLY_TEMPLATES.filter((t) => t.applicableTo.length === 0);

  // Show type-specific first, then universals
  return [...typeMatches, ...universals];
}

/** Find a template by key. */
export function getTemplateByKey(key: string): ReplyTemplate | undefined {
  return REPLY_TEMPLATES.find((t) => t.key === key);
}

/** Category labels for display. */
export const CATEGORY_LABELS: Record<ReplyTemplate['category'], string> = {
  acknowledgement: 'Acknowledgements',
  information: 'Information Requests',
  'follow-up': 'Follow-ups',
};
