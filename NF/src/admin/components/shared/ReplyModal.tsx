/**
 * ReplyModal — Phase 2 + Phase 4 (Email Reply System)
 *
 * Modal for composing and sending branded email replies to contact/partnership
 * submissions directly from the admin panel. Sends via the `send-reply`
 * Supabase Edge Function.
 *
 * Features:
 *   • Pre-filled subject with Re: prefix
 *   • Pre-filled greeting with recipient's first name
 *   • Quick reply template selector (Phase 4)
 *   • Collapsible quoted original message for context
 *   • "Sending as" shows the admin's identity
 *   • Minimum 10 char message validation
 *   • Ctrl+Enter / Cmd+Enter to send
 *   • Spinner + disable on send to prevent double-sends
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Mail,
  FileText,
  Sparkles,
  Eye,
  Edit3,
} from 'lucide-react';
import {
  getTemplatesForType,
  resolveTemplatePlaceholders,
  CATEGORY_LABELS,
  type ReplyTemplate,
  type TemplatePlaceholders,
} from '../../config/replyTemplates';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReplyModalSubmission {
  id: string;
  type: 'contact' | 'partnership' | string;
  name: string;
  email: string;
  subject: string | null;
  message: string | null;
  created_at: string;
  /** Determines the Edge Function target: 'submission' (default) or 'volunteer'. */
  targetType?: 'submission' | 'volunteer';
  /** Optional pre-filled message body (e.g. for status-change emails). */
  prefillMessage?: string;
  /** Optional pre-filled subject line. */
  prefillSubject?: string;
  /** Optional pre-selected template key. */
  prefillTemplateKey?: string;
  /** Optional reply type override (e.g. 'status_change'). */
  prefillReplyType?: 'manual' | 'status_change' | 'quick_reply';
}

export interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: ReplyPayload) => Promise<void>;
  submission: ReplyModalSubmission | null;
  adminName: string;
  adminEmail: string;
  /** Number of existing replies for this submission (for badge display). */
  replyCount?: number;
}

export interface ReplyPayload {
  type: 'submission' | 'volunteer';
  targetId: string;
  message: string;
  subject: string;
  replyType: 'manual' | 'quick_reply' | 'status_change';
  templateKey?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFirstName(fullName: string): string {
  return fullName.split(/\s+/)[0] || fullName;
}

function generateSubject(original: string | null): string {
  const base = original?.trim() || 'Your Message';
  return `Re: ${base} — Neema Foundation`;
}

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SUBJECT_LENGTH = 200;

// ---------------------------------------------------------------------------
// Email Preview — renders a scaled-down version of the branded email
// ---------------------------------------------------------------------------

/** HTML-escape for safe rendering in preview */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convert newlines to <br/> tags (after escaping). */
function nl2br(str: string): string {
  return escapeHtml(str).replace(/\n/g, '<br/>');
}

function EmailPreview({
  recipientName,
  message,
  adminName,
  originalMessage,
  originalDate,
}: {
  recipientName: string;
  message: string;
  adminName: string;
  originalMessage: string | null;
  originalDate: string;
}) {
  const firstName = getFirstName(recipientName);
  const formattedMessage = nl2br(message.trim() || '(Empty message)');
  const formattedOriginal = originalMessage ? nl2br(originalMessage) : '';

  const previewHtml = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f0f0f0;padding:16px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#700F1A 0%,#9E1826 45%,#B01C2E 100%);padding:18px 24px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;">
              <span style="color:#fff;font-family:Georgia,serif;font-weight:700;font-size:14px;letter-spacing:1px;">NF</span>
            </div>
            <div>
              <div style="color:#fff;font-family:Georgia,serif;font-weight:700;font-size:15px;">Neema Foundation Kilifi</div>
              <div style="color:rgba(255,255,255,0.55);font-size:9px;text-transform:uppercase;letter-spacing:2px;margin-top:2px;">Transforming Communities · Kenya</div>
            </div>
          </div>
          <div style="margin-top:10px;color:rgba(255,255,255,0.4);font-size:8.5px;text-transform:uppercase;letter-spacing:2.5px;">Healthcare · Education · Empowerment</div>
        </div>
        <!-- Body -->
        <div style="padding:24px 24px 18px;">
          <p style="color:#374151;font-size:13px;line-height:1.7;margin:0 0 12px;">
            Hi <strong>${escapeHtml(firstName)}</strong>,
          </p>
          <div style="color:#374151;font-size:13px;line-height:1.7;margin:0 0 20px;">
            ${formattedMessage}
          </div>
          <p style="color:#374151;font-size:13px;line-height:1.7;margin:0;">
            Warmly,<br/>
            <strong>${escapeHtml(adminName)}</strong><br/>
            <span style="color:#9ca3af;font-size:11px;">Neema Foundation Kilifi</span>
          </p>
          ${formattedOriginal ? `
          <div style="border-left:3px solid #e5e7eb;padding-left:12px;margin-top:20px;color:#6b7280;">
            <p style="font-size:10px;margin:0 0 6px;font-weight:600;">On ${escapeHtml(originalDate)}, ${escapeHtml(recipientName)} wrote:</p>
            <div style="font-size:11px;line-height:1.6;">${formattedOriginal}</div>
          </div>` : ''}
        </div>
        <!-- Footer -->
        <div style="background:#f9fafb;padding:12px 24px;border-top:1px solid #e5e7eb;text-align:center;">
          <span style="color:#B01C2E;font-size:9px;font-weight:600;">neemafoundationkilifi.org</span>
          <span style="color:#9ca3af;font-size:9px;"> · Ganze, Kilifi County, Kenya</span>
          <div style="color:#c4c9d0;font-size:8.5px;margin-top:4px;">This is a personal reply from the Neema Foundation team. You may respond directly to this email.</div>
        </div>
        <div style="height:4px;background:linear-gradient(90deg,#700F1A,#B01C2E,#700F1A);border-radius:0 0 12px 12px;"></div>
      </div>
    </div>
  `;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-200 flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
          Recipient's view
        </span>
      </div>
      <div
        className="max-h-[340px] overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReplyModal({
  isOpen,
  onClose,
  onSend,
  submission,
  adminName,
  adminEmail,
  replyCount,
}: ReplyModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [quoteExpanded, setQuoteExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  // Available templates filtered by submission type
  const availableTemplates = submission
    ? getTemplatesForType(submission.type)
    : [];

  // Build placeholders from the current submission
  const buildPlaceholders = useCallback(
    (s: ReplyModalSubmission): TemplatePlaceholders => {
      const firstName = getFirstName(s.name);
      const formattedDate = new Date(s.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return {
        name: firstName,
        fullName: s.name,
        subject: s.subject ?? 'Your Message',
        date: formattedDate,
      };
    },
    [],
  );

  // Apply a template: resolve placeholders and populate the textarea
  const applyTemplate = useCallback(
    (template: ReplyTemplate) => {
      if (!submission) return;
      const placeholders = buildPlaceholders(submission);
      const resolved = resolveTemplatePlaceholders(template.body, placeholders);
      setMessage(resolved + '\n');
      setSelectedTemplate(template.key);
      setTemplateMenuOpen(false);
      // Focus textarea so admin can edit before sending
      setTimeout(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 50);
    },
    [submission, buildPlaceholders],
  );

  // Close template menu on outside click
  useEffect(() => {
    if (!templateMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
        setTemplateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [templateMenuOpen]);

  // Reset form when submission changes or modal opens
  useEffect(() => {
    if (isOpen && submission) {
      setSubject(submission.prefillSubject || generateSubject(submission.subject));
      setMessage(submission.prefillMessage || `Hi ${getFirstName(submission.name)},\n\n`);
      setSending(false);
      setQuoteExpanded(false);
      setSelectedTemplate(submission.prefillTemplateKey || '');
      setTemplateMenuOpen(false);
      // Focus textarea after mount
      setTimeout(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 100);
    }
  }, [isOpen, submission]);

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to send
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canSend) handleSend();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [message, subject, sending],
  );

  const messageBody = message.trim();
  const canSend =
    !sending &&
    messageBody.length >= MIN_MESSAGE_LENGTH &&
    subject.trim().length > 0 &&
    subject.trim().length <= MAX_SUBJECT_LENGTH &&
    messageBody.length <= MAX_MESSAGE_LENGTH;

  const handleSend = async () => {
    if (!submission || !canSend) return;
    setSending(true);
    try {
      await onSend({
        type: submission.targetType || 'submission',
        targetId: submission.id,
        message: messageBody,
        subject: subject.trim(),
        replyType: submission.prefillReplyType || (selectedTemplate ? 'quick_reply' : 'manual'),
        ...(selectedTemplate ? { templateKey: selectedTemplate } : {}),
      });
      onClose();
    } catch {
      // Error toasts handled by parent
      setSending(false);
    }
  };

  if (!submission) return null;

  const recipientFirst = getFirstName(submission.name);
  const formattedDate = new Date(submission.created_at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#B01C2E]/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[#B01C2E]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Reply to {recipientFirst}
                    </h2>
                    {replyCount != null && replyCount > 0 && (
                      <span className="text-[10px] text-gray-400">
                        {replyCount} previous {replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={sending}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Compose / Preview tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('compose')}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeTab === 'compose'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Edit3 className="h-3 w-3" />
                    Compose
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    disabled={messageBody.length < MIN_MESSAGE_LENGTH}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      activeTab === 'preview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                </div>

                {/* Preview tab content */}
                {activeTab === 'preview' ? (
                  <EmailPreview
                    recipientName={submission.name}
                    message={messageBody}
                    adminName={adminName}
                    originalMessage={submission.message}
                    originalDate={formattedDate}
                  />
                ) : (
                <>
                {/* To (read-only) */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">To</label>
                  <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    {submission.name} &lt;{submission.email}&gt;
                  </div>
                </div>

                {/* Template selector */}
                {availableTemplates.length > 0 && (
                  <div ref={templateMenuRef} className="relative">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Quick Reply Template
                    </label>
                    <button
                      type="button"
                      onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
                      disabled={sending}
                      className="w-full flex items-center justify-between text-sm border border-gray-200 rounded-lg px-3 py-2 hover:border-[#B01C2E]/30 focus:outline-none focus:ring-2 focus:ring-[#B01C2E]/30 focus:border-[#B01C2E] disabled:opacity-50 transition-colors bg-white"
                    >
                      <span className="flex items-center gap-2">
                        {selectedTemplate ? (
                          <>
                            <FileText className="h-3.5 w-3.5 text-[#B01C2E]" />
                            <span className="text-gray-700">
                              {availableTemplates.find((t) => t.key === selectedTemplate)?.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-400">Choose a template…</span>
                          </>
                        )}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${templateMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown menu */}
                    <AnimatePresence>
                      {templateMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                        >
                          {/* Clear selection option */}
                          {selectedTemplate && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTemplate('');
                                setTemplateMenuOpen(false);
                                if (submission) {
                                  setMessage(`Hi ${getFirstName(submission.name)},\n\n`);
                                }
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                            >
                              Clear template selection
                            </button>
                          )}

                          {/* Grouped by category */}
                          {(['acknowledgement', 'information', 'follow-up'] as const).map((cat) => {
                            const catTemplates = availableTemplates.filter((t) => t.category === cat);
                            if (catTemplates.length === 0) return null;
                            return (
                              <div key={cat}>
                                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                                  {CATEGORY_LABELS[cat]}
                                </div>
                                {catTemplates.map((template) => (
                                  <button
                                    key={template.key}
                                    type="button"
                                    onClick={() => applyTemplate(template)}
                                    className={`w-full text-left px-3 py-2 hover:bg-[#B01C2E]/5 transition-colors ${
                                      selectedTemplate === template.key
                                        ? 'bg-[#B01C2E]/5 border-l-2 border-[#B01C2E]'
                                        : ''
                                    }`}
                                  >
                                    <div className="text-sm font-medium text-gray-700">
                                      {template.name}
                                    </div>
                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                      {template.description}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label htmlFor="reply-subject" className="text-xs font-medium text-gray-500 mb-1 block">
                    Subject
                  </label>
                  <input
                    id="reply-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={sending}
                    maxLength={MAX_SUBJECT_LENGTH}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B01C2E]/30 focus:border-[#B01C2E] disabled:opacity-50"
                  />
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="reply-message" className="text-xs font-medium text-gray-500">
                      Message
                    </label>
                    <span
                      className={`text-[10px] tabular-nums ${
                        messageBody.length < MIN_MESSAGE_LENGTH
                          ? 'text-amber-500'
                          : messageBody.length > MAX_MESSAGE_LENGTH * 0.9
                            ? 'text-red-500'
                            : 'text-gray-400'
                      }`}
                    >
                      {messageBody.length} / {MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    id="reply-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending}
                    rows={8}
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder={`Hi ${recipientFirst},\n\nType your reply here…`}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B01C2E]/30 focus:border-[#B01C2E] resize-y min-h-[120px] disabled:opacity-50"
                  />
                  {messageBody.length > 0 && messageBody.length < MIN_MESSAGE_LENGTH && (
                    <p className="text-[10px] text-amber-500 mt-1">
                      Minimum {MIN_MESSAGE_LENGTH} characters required ({MIN_MESSAGE_LENGTH - messageBody.length} more)
                    </p>
                  )}
                </div>

                {/* Sign-off preview */}
                <div className="text-xs text-gray-400 bg-gray-50/60 rounded-lg px-3 py-2 border border-gray-100 border-dashed">
                  <p className="italic">Auto-appended sign-off:</p>
                  <p className="mt-1 text-gray-500">
                    Warmly,<br />
                    <strong>{adminName}</strong><br />
                    Neema Foundation Kilifi
                  </p>
                </div>

                {/* Original message quote */}
                {submission.message && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setQuoteExpanded(!quoteExpanded)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {quoteExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                      Their original message ({formattedDate})
                    </button>
                    <AnimatePresence>
                      {quoteExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border-l-3 border-gray-300 whitespace-pre-line">
                            {submission.message}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-400">
                    Sending as <span className="font-medium text-gray-500">{adminName}</span>{' '}
                    ({adminEmail})
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      disabled={sending}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!canSend}
                      className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-[#B01C2E] rounded-lg hover:bg-[#9A1827] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {!sending && (
                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">
                      {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
                    </kbd>{' '}
                    to send
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
