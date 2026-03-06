/**
 * SubmissionsPage — Phase 3 (Email Reply System)
 *
 * Admin page for viewing contact form submissions and partnership
 * inquiries. Reads from the `submissions` table.
 *
 * Features:
 * - Tabbed display: All / Contact / Partnership
 * - Status workflow: New → In Progress → Responded → Closed
 * - Search by name/email/subject
 * - Status change inline
 * - Notes field for internal tracking
 * - Reply modal for composing branded email responses
 * - Reply count badges on submissions with replies
 * - Auto-status update after sending a reply
 * - Conversation timeline with full reply history (Phase 3)
 * - "Last replied" relative timestamp on summary rows (Phase 3)
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Mail,
  Handshake,
  Search,
  Clock,
  CheckCircle2,
  MessageSquare,
  MessageSquareReply,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Phone,
  FileText,
  Loader2,
  Inbox,
  Reply,
  History,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import ReplyModal from '../components/shared/ReplyModal';
import type { ReplyPayload, ReplyModalSubmission } from '../components/shared/ReplyModal';
import ConversationTimeline from '../components/shared/ConversationTimeline';
import type { SubmissionReply } from '../components/shared/ConversationTimeline';
import { timeAgo } from '../lib/timeAgo';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Submission {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  status: 'new' | 'in_progress' | 'responded' | 'closed';
  notes: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

type TabFilter = 'all' | 'contact' | 'partnership';

interface ReplyCount {
  submission_id: string;
  count: number;
  last_replied_at: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:         { label: 'New',         color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  in_progress: { label: 'In Progress', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  responded:   { label: 'Responded',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  closed:      { label: 'Closed',      color: 'text-gray-500',    bg: 'bg-gray-50 border-gray-200' },
};

const STATUSES = ['new', 'in_progress', 'responded', 'closed'] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SubmissionsPage() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<ReplyModalSubmission | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);

  // Fetch submissions
  const { data: submissions = [], isLoading, error } = useQuery<Submission[]>({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('submissions') as ReturnType<typeof supabase.from>)
        .select('*')
        .in('type', ['contact', 'partnership'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Submission[];
    },
    staleTime: 30_000,
  });

  // Fetch reply counts + last replied date per submission
  const { data: replyCounts = [] } = useQuery<ReplyCount[]>({
    queryKey: ['admin-submission-reply-counts'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('submission_replies') as ReturnType<typeof supabase.from>)
        .select('submission_id, created_at')
        .not('submission_id', 'is', null)
        .order('created_at', { ascending: false });
      if (error) return [];
      const map: Record<string, { count: number; last_replied_at: string }> = {};
      for (const row of (data ?? []) as { submission_id: string; created_at: string }[]) {
        if (!map[row.submission_id]) {
          map[row.submission_id] = { count: 0, last_replied_at: row.created_at };
        }
        map[row.submission_id].count += 1;
      }
      return Object.entries(map).map(([submission_id, v]) => ({
        submission_id,
        count: v.count,
        last_replied_at: v.last_replied_at,
      }));
    },
    staleTime: 30_000,
  });

  const replyCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const rc of replyCounts) {
      map[rc.submission_id] = rc.count;
    }
    return map;
  }, [replyCounts]);

  const lastRepliedMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const rc of replyCounts) {
      if (rc.last_replied_at) map[rc.submission_id] = rc.last_replied_at;
    }
    return map;
  }, [replyCounts]);

  // Fetch full replies for the currently expanded submission
  const { data: expandedReplies = [], isLoading: repliesLoading } = useQuery<SubmissionReply[]>({
    queryKey: ['admin-submission-replies', expandedId],
    queryFn: async () => {
      if (!expandedId) return [];
      const { data, error } = await (supabase
        .from('submission_replies') as ReturnType<typeof supabase.from>)
        .select('id, subject, message, sent_by_name, sent_by_email, recipient_email, recipient_name, reply_type, template_used, created_at')
        .eq('submission_id', expandedId)
        .order('created_at', { ascending: true });
      if (error) return [];
      return (data ?? []) as SubmissionReply[];
    },
    enabled: !!expandedId,
    staleTime: 15_000,
  });

  // Filter
  const filtered = useMemo(() => {
    let items = submissions;
    if (tab !== 'all') items = items.filter((s) => s.type === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.subject ?? '').toLowerCase().includes(q),
      );
    }
    return items;
  }, [submissions, tab, search]);

  // Status counts
  const counts = useMemo(() => {
    const base = tab === 'all' ? submissions : submissions.filter((s) => s.type === tab);
    return {
      total: base.length,
      new: base.filter((s) => s.status === 'new').length,
      in_progress: base.filter((s) => s.status === 'in_progress').length,
      responded: base.filter((s) => s.status === 'responded').length,
    };
  }, [submissions, tab]);

  // Update status
  const updateStatus = useCallback(
    async (id: string, status: string) => {
      setUpdatingId(id);
      try {
        await (supabase
          .from('submissions') as ReturnType<typeof supabase.from>)
          .update({
            status,
            ...(status === 'responded' ? { responded_at: new Date().toISOString() } : {}),
          } as Record<string, unknown>)
          .eq('id', id);
        queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      } finally {
        setUpdatingId(null);
      }
    },
    [queryClient],
  );

  // Update notes
  const updateNotes = useCallback(
    async (id: string, notes: string) => {
      await (supabase
        .from('submissions') as ReturnType<typeof supabase.from>)
        .update({ notes } as Record<string, unknown>)
        .eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
    },
    [queryClient],
  );

  // Open reply modal
  const openReply = useCallback((s: Submission) => {
    setReplyTarget({
      id: s.id,
      type: s.type,
      name: s.name,
      email: s.email,
      subject: s.subject,
      message: s.message,
      created_at: s.created_at,
    });
    setReplyModalOpen(true);
  }, []);

  // Send reply via Edge Function
  const handleSendReply = useCallback(
    async (payload: ReplyPayload) => {
      const { data, error } = await supabase.functions.invoke('send-reply', {
        body: payload,
      });

      if (error) {
        const message = (data as Record<string, unknown>)?.error ?? error.message ?? 'Failed to send reply.';
        toast.error(String(message), {
          action: {
            label: 'Retry',
            onClick: () => handleSendReply(payload),
          },
        });
        throw new Error(String(message));
      }

      toast.success(`Reply sent to ${replyTarget?.name ?? 'recipient'}!`);
      // Refresh submissions (status → responded), reply counts, and expanded replies
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-submission-reply-counts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-submission-replies'] });
    },
    [queryClient, replyTarget],
  );

  const adminName = profile?.full_name || 'Admin';
  const adminEmail = profile?.email || '';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Contact form entries and partnership inquiries from the public site.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip icon={<Inbox className="h-4 w-4 text-gray-500" />} label="Total" value={counts.total} />
        <StatChip icon={<Clock className="h-4 w-4 text-blue-500" />} label="New" value={counts.new} />
        <StatChip icon={<MessageSquare className="h-4 w-4 text-amber-500" />} label="In Progress" value={counts.in_progress} />
        <StatChip icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Responded" value={counts.responded} />
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([
            { key: 'all', label: 'All', icon: Filter },
            { key: 'contact', label: 'Contact', icon: Mail },
            { key: 'partnership', label: 'Partnership', icon: Handshake },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                tab === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]/30 focus:border-[#B01C2E]"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load submissions. The table may not exist yet.</p>
          <p className="text-xs text-red-500 mt-1">Run the migration to create the submissions table.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No submissions found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const isExpanded = expandedId === s.id;
            const statusConf = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.new;
            const isContact = s.type === 'contact';

            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Summary row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="shrink-0">
                    {isContact ? (
                      <Mail className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Handshake className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {s.name}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusConf.bg} ${statusConf.color}`}>
                        {statusConf.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {s.subject || s.email}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {replyCountMap[s.id] > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#B01C2E]/10 text-[#B01C2E]">
                        <MessageSquareReply className="h-3 w-3" />
                        {replyCountMap[s.id]} {replyCountMap[s.id] === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                    {lastRepliedMap[s.id] ? (
                      <span className="text-[10px] text-gray-400 hidden sm:flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Replied {timeAgo(lastRepliedMap[s.id])}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 hidden sm:block">
                        {new Date(s.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <DetailRow icon={<User className="h-4 w-4" />} label="Name" value={s.name} />
                      <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={s.email} />
                      {s.phone && <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={s.phone} />}
                      <DetailRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Submitted"
                        value={new Date(s.created_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      />
                    </div>

                    {s.subject && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
                        <p className="text-sm text-gray-900">{s.subject}</p>
                      </div>
                    )}

                    {/* ── Conversation Timeline ── */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Conversation
                        {replyCountMap[s.id] > 0 && (
                          <span className="text-[10px] text-gray-400 font-normal">
                            ({replyCountMap[s.id]} {replyCountMap[s.id] === 1 ? 'reply' : 'replies'})
                          </span>
                        )}
                      </p>

                      {repliesLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        </div>
                      ) : (
                        <ConversationTimeline
                          original={{
                            name: s.name,
                            email: s.email,
                            subject: s.subject,
                            message: s.message,
                            created_at: s.created_at,
                          }}
                          replies={expandedReplies}
                        />
                      )}
                    </div>

                    {/* Status changer */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map((st) => {
                          const conf = STATUS_CONFIG[st];
                          const isActive = s.status === st;
                          return (
                            <button
                              key={st}
                              disabled={isActive || updatingId === s.id}
                              onClick={() => updateStatus(s.id, st)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                isActive
                                  ? `${conf.bg} ${conf.color} border-current`
                                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              } disabled:opacity-50`}
                            >
                              {conf.label}
                            </button>
                          );
                        })}
                        {updatingId === s.id && (
                          <Loader2 className="h-4 w-4 text-gray-400 animate-spin self-center" />
                        )}
                      </div>
                    </div>

                    {/* Reply button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openReply(s)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#B01C2E] rounded-lg hover:bg-[#9A1827] transition-colors shadow-sm"
                      >
                        <Reply className="h-4 w-4" />
                        Reply to {s.name.split(/\s+/)[0]}
                      </button>
                      {replyCountMap[s.id] > 0 && (
                        <span className="text-xs text-gray-400">
                          {replyCountMap[s.id]} {replyCountMap[s.id] === 1 ? 'reply' : 'replies'} sent
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        <FileText className="h-3 w-3 inline mr-1" />
                        Internal Notes
                      </p>
                      <textarea
                        defaultValue={s.notes ?? ''}
                        onBlur={(e) => {
                          if (e.target.value !== (s.notes ?? '')) {
                            updateNotes(s.id, e.target.value);
                          }
                        }}
                        rows={2}
                        placeholder="Add internal notes…"
                        className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#B01C2E]/30 focus:border-[#B01C2E] resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      <ReplyModal
        isOpen={replyModalOpen}
        onClose={() => {
          setReplyModalOpen(false);
          setReplyTarget(null);
        }}
        onSend={handleSendReply}
        submission={replyTarget}
        adminName={adminName}
        adminEmail={adminEmail}
        replyCount={replyTarget ? replyCountMap[replyTarget.id] : undefined}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal components
// ---------------------------------------------------------------------------

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-bold tabular-nums text-gray-900">{value}</p>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span className="text-xs font-medium text-gray-400 w-16 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 truncate">{value}</span>
    </div>
  );
}
