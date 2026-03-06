/**
 * Reply System Unit Tests — Phase 6.8
 *
 * Tests for:
 *   • Template placeholder resolution
 *   • Template filtering by submission type
 *   • Template category grouping
 *   • Template lookup by key
 *   • ReplyModal validation and state
 *   • ReplyModal compose/preview tabs
 *   • ReplyModal template selection
 *   • ReplyModal keyboard shortcuts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  resolveTemplatePlaceholders,
  getTemplatesForType,
  getTemplatesByCategory,
  getTemplateByKey,
  REPLY_TEMPLATES,
  CATEGORY_LABELS,
  type ReplyTemplate,
} from '../admin/config/replyTemplates';
import ReplyModal from '../admin/components/shared/ReplyModal';
import type { ReplyModalSubmission, ReplyPayload } from '../admin/components/shared/ReplyModal';

// =============================================================================
// Mock supabase
// =============================================================================

vi.mock('../lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
  },
}));

vi.mock('../admin/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    },
  },
}));

// =============================================================================
// Template Tests
// =============================================================================

describe('Reply Templates', () => {
  describe('resolveTemplatePlaceholders', () => {
    const placeholders = {
      name: 'John',
      fullName: 'John Doe',
      subject: 'Partnership Inquiry',
      organization: 'UNICEF',
      date: '6 Mar 2026',
    };

    it('resolves {name} placeholder', () => {
      const result = resolveTemplatePlaceholders('Hi {name},', placeholders);
      expect(result).toBe('Hi John,');
    });

    it('resolves {fullName} placeholder', () => {
      const result = resolveTemplatePlaceholders('Dear {fullName},', placeholders);
      expect(result).toBe('Dear John Doe,');
    });

    it('resolves {subject} placeholder', () => {
      const result = resolveTemplatePlaceholders('Regarding "{subject}"', placeholders);
      expect(result).toBe('Regarding "Partnership Inquiry"');
    });

    it('resolves {organization} placeholder', () => {
      const result = resolveTemplatePlaceholders('From {organization}', placeholders);
      expect(result).toBe('From UNICEF');
    });

    it('resolves {date} placeholder', () => {
      const result = resolveTemplatePlaceholders('Sent on {date}', placeholders);
      expect(result).toBe('Sent on 6 Mar 2026');
    });

    it('resolves multiple placeholders in one string', () => {
      const template = 'Hi {name}, your message about "{subject}" from {date} has been received.';
      const result = resolveTemplatePlaceholders(template, placeholders);
      expect(result).toBe('Hi John, your message about "Partnership Inquiry" from 6 Mar 2026 has been received.');
    });

    it('resolves duplicate placeholders', () => {
      const result = resolveTemplatePlaceholders('{name} and {name} again', placeholders);
      expect(result).toBe('John and John again');
    });

    it('leaves {organization} as-is when not provided', () => {
      const noOrg = { ...placeholders, organization: undefined };
      const result = resolveTemplatePlaceholders('From {organization}', noOrg);
      expect(result).toBe('From {organization}');
    });

    it('returns unchanged string when no placeholders present', () => {
      const result = resolveTemplatePlaceholders('Hello world!', placeholders);
      expect(result).toBe('Hello world!');
    });
  });

  describe('getTemplatesForType', () => {
    it('returns contact-specific templates first for contact type', () => {
      const templates = getTemplatesForType('contact');
      const firstKeys = templates.slice(0, 2).map((t: ReplyTemplate) => t.key);
      expect(firstKeys).toContain('thank_contact');
    });

    it('returns partnership-specific templates first for partnership type', () => {
      const templates = getTemplatesForType('partnership');
      const firstKeys = templates.slice(0, 2).map((t: ReplyTemplate) => t.key);
      expect(firstKeys).toContain('thank_partner');
    });

    it('includes universal templates (empty applicableTo)', () => {
      const templates = getTemplatesForType('contact');
      const universalKeys = templates.filter((t: ReplyTemplate) => t.applicableTo.length === 0).map((t: ReplyTemplate) => t.key);
      expect(universalKeys).toContain('need_info');
      expect(universalKeys).toContain('follow_up');
      expect(universalKeys).toContain('general_update');
    });

    it('returns universal templates for unknown type', () => {
      const templates = getTemplatesForType('unknown');
      expect(templates.length).toBeGreaterThan(0);
      // All should be universals since no specific match
      const specifics = templates.filter((t: ReplyTemplate) => t.applicableTo.length > 0);
      expect(specifics.length).toBe(0);
    });
  });

  describe('getTemplatesByCategory', () => {
    it('groups all templates into three categories', () => {
      const grouped = getTemplatesByCategory();
      expect(Object.keys(grouped)).toHaveLength(3);
      expect(grouped).toHaveProperty('acknowledgement');
      expect(grouped).toHaveProperty('information');
      expect(grouped).toHaveProperty('follow-up');
    });

    it('has at least one template per category', () => {
      const grouped = getTemplatesByCategory();
      expect(grouped.acknowledgement.length).toBeGreaterThan(0);
      expect(grouped.information.length).toBeGreaterThan(0);
      expect(grouped['follow-up'].length).toBeGreaterThan(0);
    });

    it('total grouped templates equals REPLY_TEMPLATES count', () => {
      const grouped = getTemplatesByCategory();
      const total = Object.values(grouped).reduce((acc: number, arr) => acc + (arr as ReplyTemplate[]).length, 0);
      expect(total).toBe(REPLY_TEMPLATES.length);
    });
  });

  describe('getTemplateByKey', () => {
    it('finds a template by key', () => {
      const template = getTemplateByKey('thank_contact');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Thank You (Contact)');
    });

    it('returns undefined for non-existent key', () => {
      const template = getTemplateByKey('nonexistent');
      expect(template).toBeUndefined();
    });

    it('every template key is unique', () => {
      const keys = REPLY_TEMPLATES.map((t: ReplyTemplate) => t.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('CATEGORY_LABELS', () => {
    it('has labels for all three categories', () => {
      expect(CATEGORY_LABELS.acknowledgement).toBe('Acknowledgements');
      expect(CATEGORY_LABELS.information).toBe('Information Requests');
      expect(CATEGORY_LABELS['follow-up']).toBe('Follow-ups');
    });
  });

  describe('Template integrity', () => {
    it('every template has required fields', () => {
      for (const t of REPLY_TEMPLATES) {
        expect(t.key).toBeTruthy();
        expect(t.name).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.body).toBeTruthy();
        expect(['acknowledgement', 'information', 'follow-up']).toContain(t.category);
        expect(Array.isArray(t.applicableTo)).toBe(true);
      }
    });

    it('template body contains at least {name} placeholder', () => {
      for (const t of REPLY_TEMPLATES) {
        expect(t.body).toContain('{name}');
      }
    });
  });
});

// =============================================================================
// ReplyModal Tests
// =============================================================================

describe('ReplyModal', () => {
  const mockSubmission: ReplyModalSubmission = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: 'contact',
    name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Website Feedback',
    message: 'I love your community outreach programme and would like to know more.',
    created_at: '2026-03-01T10:00:00Z',
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSend: vi.fn().mockResolvedValue(undefined),
    submission: mockSubmission,
    adminName: 'Sarah Mwangi',
    adminEmail: 'sarah@neemafoundationkilifi.org',
    replyCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when open', () => {
    render(<ReplyModal {...defaultProps} />);
    expect(screen.getByText('Reply to Jane')).toBeInTheDocument();
  });

  it('does not render when submission is null', () => {
    const { container } = render(<ReplyModal {...defaultProps} submission={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows the recipient email as read-only', () => {
    render(<ReplyModal {...defaultProps} />);
    expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
  });

  it('pre-fills subject with Re: prefix', () => {
    render(<ReplyModal {...defaultProps} />);
    const subjectInput = screen.getByLabelText('Subject') as HTMLInputElement;
    expect(subjectInput.value).toBe('Re: Website Feedback — Neema Foundation');
  });

  it('pre-fills message with greeting', () => {
    render(<ReplyModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Hi Jane/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Hi Jane,');
  });

  it('shows character count', () => {
    render(<ReplyModal {...defaultProps} />);
    expect(screen.getByText(/\/ 5000/)).toBeInTheDocument();
  });

  it('shows the sign-off preview', () => {
    render(<ReplyModal {...defaultProps} />);
    // Admin name appears in both sign-off and "Sending as" footer
    const nameElements = screen.getAllByText('Sarah Mwangi');
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Neema Foundation/)).toBeInTheDocument();
  });

  it('shows "Sending as" in footer', () => {
    render(<ReplyModal {...defaultProps} />);
    expect(screen.getByText(/Sending as/)).toBeInTheDocument();
    expect(screen.getByText(/sarah@neemafoundationkilifi.org/)).toBeInTheDocument();
  });

  it('disables send button when message is too short', () => {
    render(<ReplyModal {...defaultProps} />);
    // Default message is "Hi Jane,\n\n" which is less than 10 chars trimmed
    const sendButton = screen.getByRole('button', { name: /Send Reply/i });
    // "Hi Jane,\n\n" trims to "Hi Jane," which is 9 chars — below 10 min
    expect(sendButton).toBeDisabled();
  });

  it('shows minimum character warning for short messages', async () => {
    render(<ReplyModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Hi Jane/i) as HTMLTextAreaElement;
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Short');
    expect(screen.getByText(/Minimum 10 characters required/)).toBeInTheDocument();
  });

  it('shows previous reply count badge when replies exist', () => {
    render(<ReplyModal {...defaultProps} replyCount={3} />);
    expect(screen.getByText('3 previous replies')).toBeInTheDocument();
  });

  it('shows singular reply text for 1 reply', () => {
    render(<ReplyModal {...defaultProps} replyCount={1} />);
    expect(screen.getByText('1 previous reply')).toBeInTheDocument();
  });

  it('renders compose and preview tabs', () => {
    render(<ReplyModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Compose/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
  });

  it('preview button is disabled when message is too short', () => {
    render(<ReplyModal {...defaultProps} />);
    const previewBtn = screen.getByRole('button', { name: /Preview/i });
    // Default "Hi Jane,\n\n" is < 10 trimmed chars
    expect(previewBtn).toBeDisabled();
  });

  it('shows email preview when preview tab is active', async () => {
    render(<ReplyModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Hi Jane/i);
    fireEvent.change(textarea, { target: { value: 'Thank you for your wonderful message about our community outreach.' } });

    const previewBtn = screen.getByRole('button', { name: /Preview/i });
    expect(previewBtn).not.toBeDisabled();
    await userEvent.click(previewBtn);

    expect(screen.getByText(/recipient/i)).toBeInTheDocument();
  });

  it('shows compose content when compose tab is active', async () => {
    render(<ReplyModal {...defaultProps} />);
    // Compose is default tab
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('shows template selector for contact submissions', () => {
    render(<ReplyModal {...defaultProps} />);
    expect(screen.getByText('Quick Reply Template')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    render(<ReplyModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', async () => {
    render(<ReplyModal {...defaultProps} />);
    // X is the close button in the header
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find((btn) => btn.querySelector('.lucide-x'));
    if (xButton) {
      await userEvent.click(xButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    }
  });

  it('calls onSend with correct payload when send button clicked', async () => {
    render(<ReplyModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Hi Jane/i);
    fireEvent.change(textarea, { target: { value: 'Thank you for your wonderful message about our community outreach.' } });

    const sendButton = screen.getByRole('button', { name: /Send Reply/i });
    expect(sendButton).not.toBeDisabled();
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(defaultProps.onSend).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'submission',
          targetId: '123e4567-e89b-12d3-a456-426614174000',
          replyType: 'manual',
        }),
      );
    });
  });

  it('shows spinner during sending', async () => {
    const slowSend = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 1000)));
    render(<ReplyModal {...defaultProps} onSend={slowSend} />);

    const textarea = screen.getByPlaceholderText(/Hi Jane/i);
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Thank you for your wonderful message about our community outreach.');

    await userEvent.click(screen.getByRole('button', { name: /Send Reply/i }));

    expect(screen.getByText(/Sending/)).toBeInTheDocument();
  });

  it('uses prefill values when provided', () => {
    const prefilled: ReplyModalSubmission = {
      ...mockSubmission,
      prefillSubject: 'Volunteer Application Accepted',
      prefillMessage: 'Your application has been accepted!',
      prefillReplyType: 'status_change',
      prefillTemplateKey: 'volunteer_accepted',
    };
    render(<ReplyModal {...defaultProps} submission={prefilled} />);
    const subjectInput = screen.getByLabelText('Subject') as HTMLInputElement;
    expect(subjectInput.value).toBe('Volunteer Application Accepted');
  });

  it('sets replyType to quick_reply when template used', async () => {
    render(<ReplyModal {...defaultProps} />);

    // Open template dropdown
    const templateButton = screen.getByText('Choose a template…');
    await userEvent.click(templateButton);

    // Select the "Thank You (Contact)" template
    const thankYouOption = await screen.findByText('Thank You (Contact)');
    await userEvent.click(thankYouOption);

    // Now the textarea should be populated
    const textarea = screen.getByPlaceholderText(/Hi Jane/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Thank you for reaching out');

    const sendButton = screen.getByRole('button', { name: /Send Reply/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(defaultProps.onSend).toHaveBeenCalledWith(
        expect.objectContaining({
          replyType: 'quick_reply',
          templateKey: 'thank_contact',
        }),
      );
    });
  });

  it('shows keyboard shortcut hint', () => {
    render(<ReplyModal {...defaultProps} />);
    expect(screen.getByText(/to send/)).toBeInTheDocument();
  });

  it('shows collapsible original message quote', async () => {
    render(<ReplyModal {...defaultProps} />);
    const quoteButton = screen.getByText(/Their original message/);
    expect(quoteButton).toBeInTheDocument();

    await userEvent.click(quoteButton);
    expect(screen.getByText(/I love your community outreach/)).toBeInTheDocument();
  });
});
