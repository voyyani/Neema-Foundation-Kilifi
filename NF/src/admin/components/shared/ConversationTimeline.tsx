/**
 * ConversationTimeline — Phase 3 (Email Reply System)
 *
 * Renders the full conversation thread for a submission: original message
 * followed by all admin replies in chronological order, connected by a
 * vertical timeline line.
 */

import {
  Mail,
  Reply,
  Clock,
  User,
  Send,
} from 'lucide-react';
import { timeAgo } from '../../lib/timeAgo';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubmissionReply {
  id: string;
  subject: string;
  message: string;
  sent_by_name: string;
  sent_by_email: string;
  recipient_email: string;
  recipient_name: string;
  reply_type: 'manual' | 'status_change' | 'quick_reply';
  template_used: string | null;
  created_at: string;
}

interface OriginalMessage {
  name: string;
  email: string;
  subject: string | null;
  message: string | null;
  created_at: string;
}

interface ConversationTimelineProps {
  original: OriginalMessage;
  replies: SubmissionReply[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConversationTimeline({
  original,
  replies,
}: ConversationTimelineProps) {
  return (
    <div className="space-y-0">
      {/* ── Original message ── */}
      <div className="relative pl-8">
        {/* Timeline dot */}
        <div className="absolute left-0 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white z-10">
          <Mail className="h-3 w-3 text-blue-600" />
        </div>
        {/* Timeline line (extends below if there are replies) */}
        {replies.length > 0 && (
          <div className="absolute left-[11px] top-9 bottom-0 w-0.5 bg-gray-200" />
        )}

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="h-3 w-3" />
              <span className="font-medium text-blue-800">{original.name}</span>
              <span className="text-gray-400">·</span>
              <span>{original.email}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
              <Clock className="h-3 w-3" />
              <span>{formatDate(original.created_at)}</span>
            </div>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
            Original Message
          </p>

          {original.subject && (
            <p className="text-sm font-medium text-gray-900 mb-1.5">
              {original.subject}
            </p>
          )}
          {original.message && (
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {original.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Replies ── */}
      {replies.map((reply, idx) => {
        const isLast = idx === replies.length - 1;

        return (
          <div key={reply.id} className="relative pl-8 pt-4">
            {/* Timeline connector label */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
              {/* Continuing line from above */}
              <div className="w-0.5 h-4 bg-gray-200" />
              {/* Reply dot */}
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B01C2E]/10 ring-4 ring-white z-10 shrink-0">
                <Reply className="h-3 w-3 text-[#B01C2E]" />
              </div>
              {/* Line continues below if not last */}
              {!isLast && <div className="w-0.5 flex-1 bg-gray-200" />}
            </div>

            {/* Reply connector text */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2 -mt-0.5 ml-1">
              <Send className="h-2.5 w-2.5" />
              <span>
                Reply by <span className="font-medium text-gray-600">{reply.sent_by_name}</span>
                <span className="text-gray-400"> · </span>
                <span>{timeAgo(reply.created_at)}</span>
              </span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium text-[#B01C2E]">{reply.sent_by_name}</span>
                  <span className="text-gray-400">→</span>
                  <span>{reply.recipient_email}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(reply.created_at)}</span>
                </div>
              </div>

              {reply.subject && (
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-medium">Subject:</span> {reply.subject}
                </p>
              )}

              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {reply.message}
              </p>

              {/* Reply type badge */}
              {reply.reply_type !== 'manual' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-500">
                    {reply.reply_type === 'status_change'
                      ? 'Status Change'
                      : reply.reply_type === 'quick_reply'
                        ? `Template: ${reply.template_used ?? 'Quick Reply'}`
                        : reply.reply_type}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}