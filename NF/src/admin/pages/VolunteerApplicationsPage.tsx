/**
 * VolunteerApplicationsPage — Phase 5 (Email Reply System)
 *
 * Admin page for reviewing volunteer applications.
 * Reads from the `volunteer_applications` table.
 *
 * Features:
 * - Status workflow: New → Under Review → Accepted / Rejected / Waitlisted
 * - Search & status-tab filtering
 * - Inline details with status change + reviewer notes
 * - Reply modal for composing branded email responses (Phase 5)
 * - Status-change email trigger: prompt to email on accept/reject/waitlist (Phase 5)
 * - Reply count badges + "Last replied" timestamps (Phase 5)
 * - Conversation timeline with full reply history (Phase 5)
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Loader2,
  Users,
  Eye,
  Pause,
  Heart,
  Reply,
  MessageSquare,
  MessageSquareReply,
  History,
  Send,
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

interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  experience: string | null;
  availability: string | null;
  role_preferences: string[] | null;
  motivation: string | null;
  cv_url: string | null;
  status: 'new' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

type TabFilter = 'all' | 'new' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';

interface VolunteerReplyCount {
  volunteer_app_id: string;
  count: number;
  last_replied_at: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  new:          { label: 'New',          color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',     icon: <Clock className="h-3 w-3" /> },
  under_review: { label: 'Under Review', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   icon: <Eye className="h-3 w-3" /> },
  accepted:     { label: 'Accepted',     color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected:     { label: 'Rejected',     color: 'text-red-700',     bg: 'bg-red-50 border-red-200',       icon: <XCircle className="h-3 w-3" /> },
  waitlisted:   { label: 'Waitlisted',   color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200', icon: <Pause className="h-3 w-3" /> },
};

const STATUSES = ['new', 'under_review', 'accepted', 'rejected', 'waitlisted'] as const;

const TABS: { key: TabFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'all',          label: 'All',          icon: Filter },
  { key: 'new',          label: 'New',          icon: Clock },
  { key: 'under_review', label: 'Reviewing',    icon: Eye },
  { key: 'accepted',     label: 'Accepted',     icon: CheckCircle2 },
  { key: 'rejected',     label: 'Rejected',     icon: XCircle },
  { key: 'waitlisted',   label: 'Waitlisted',   icon: AlertCircle },
];

// ---------------------------------------------------------------------------
// Status-change email template messages
// ---------------------------------------------------------------------------

const STATUS_EMAIL_TEMPLATES: Record<string, {
  subject: string;
  message: string;
  templateKey: string;
  prompt: string;
}> = {
  accepted: {
    subject: 'Your Volunteer Application Has Been Accepted! — Neema Foundation',
    message: `We're delighted to let you know that your volunteer application has been accepted! We can't wait to have you on the team.\n\nOur volunteer coordinator will be in touch within 5 business days with next steps, including your welcome pack and orientation schedule.`,
    templateKey: 'volunteer_accepted',
    prompt: 'Send acceptance email to',
  },
  rejected: {
    subject: 'Update on Your Volunteer Application — Neema Foundation',
    message: `Thank you for your interest in volunteering with us. After careful review, we're unable to offer a volunteer placement at this time.\n\nWe encourage you to stay connected and apply again in the future when new opportunities arise.`,
    templateKey: 'volunteer_rejected',
    prompt: 'Send update email to',
  },
  waitlisted: {
    subject: "You're on the Waitlist — Neema Foundation",
    message: `We've reviewed your application and we're impressed. We've placed you on our waitlist for upcoming volunteer opportunities. As soon as a suitable placement becomes available, we'll reach out to you directly.\n\nTypically, waitlist positions are filled within 2–4 weeks.`,
    templateKey: 'volunteer_waitlisted',
    prompt: 'Send waitlist email to',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VolunteerApplicationsPage() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<ReplyModalSubmission | null>(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  // Status-change email prompt
  const [statusPrompt, setStatusPrompt] = useState<{
    appId: string;
    appName: string;
    appEmail: string;
    newStatus: string;
  } | null>(null);

  // Fetch applications
  const { data: applications = [], isLoading, error } = useQuery<VolunteerApplication[]>({
    queryKey: ['admin-volunteer-applications'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('volunteer_applications') as ReturnType<typeof supabase.from>)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as VolunteerApplication[];
    },
    staleTime: 30_000,
  });

  // Fetch reply counts + last replied date per volunteer app
  const { data: replyCounts = [] } = useQuery<VolunteerReplyCount[]>({
    queryKey: ['admin-volunteer-reply-counts'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('submission_replies') as ReturnType<typeof supabase.from>)
        .select('volunteer_app_id, created_at')
        .not('volunteer_app_id', 'is', null)
        .order('created_at', { ascending: false });
      if (error) return [];
      const map: Record<string, { count: number; last_replied_at: string }> = {};
      for (const row of (data ?? []) as { volunteer_app_id: string; created_at: string }[]) {
        if (!map[row.volunteer_app_id]) {
          map[row.volunteer_app_id] = { count: 0, last_replied_at: row.created_at };
        }
        map[row.volunteer_app_id].count += 1;
      }
      return Object.entries(map).map(([volunteer_app_id, v]) => ({
        volunteer_app_id,
        count: v.count,
        last_replied_at: v.last_replied_at,
      }));
    },
    staleTime: 30_000,
  });

  const replyCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const rc of replyCounts) {
      map[rc.volunteer_app_id] = rc.count;
    }
    return map;
  }, [replyCounts]);

  const lastRepliedMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const rc of replyCounts) {
      if (rc.last_replied_at) map[rc.volunteer_app_id] = rc.last_replied_at;
    }
    return map;
  }, [replyCounts]);

  // Fetch full replies for the currently expanded volunteer app
  const { data: expandedReplies = [], isLoading: repliesLoading } = useQuery<SubmissionReply[]>({
    queryKey: ['admin-volunteer-replies', expandedId],
    queryFn: async () => {
      if (!expandedId) return [];
      const { data, error } = await (supabase
        .from('submission_replies') as ReturnType<typeof supabase.from>)
        .select('id, subject, message, sent_by_name, sent_by_email, recipient_email, recipient_name, reply_type, template_used, created_at')
        .eq('volunteer_app_id', expandedId)
        .order('created_at', { ascending: true });
      if (error) return [];
      return (data ?? []) as SubmissionReply[];
    },
    enabled: !!expandedId,
    staleTime: 15_000,
  });

  // Filter
  const filtered = useMemo(() => {
    let items = applications;
    if (tab !== 'all') items = items.filter((a) => a.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.location ?? '').toLowerCase().includes(q),
      );
    }
    return items;
  }, [applications, tab, search]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: applications.length,
      new: applications.filter((a) => a.status === 'new').length,
      under_review: applications.filter((a) => a.status === 'under_review').length,
      accepted: applications.filter((a) => a.status === 'accepted').length,
    };
  }, [applications]);

  // Update status — with email prompt for accept/reject/waitlist
  const updateStatus = useCallback(
    async (app: VolunteerApplication, status: string) => {
      setUpdatingId(app.id);
      try {
        await (supabase
          .from('volunteer_applications') as ReturnType<typeof supabase.from>)
          .update({
            status,
            reviewed_at: new Date().toISOString(),
          } as Record<string, unknown>)
          .eq('id', app.id);
        queryClient.invalidateQueries({ queryKey: ['admin-volunteer-applications'] });

        // If status is one that has an email template, show the prompt
        if (STATUS_EMAIL_TEMPLATES[status]) {
          setStatusPrompt({
            appId: app.id,
            appName: app.name,
            appEmail: app.email,
            newStatus: status,
          });
        }
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
        .from('volunteer_applications') as ReturnType<typeof supabase.from>)
        .update({ notes } as Record<string, unknown>)
        .eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['admin-volunteer-applications'] });
    },
    [queryClient],
  );

  // Open reply modal (manual reply)
  const openReply = useCallback((app: VolunteerApplication) => {
    setReplyTarget({
      id: app.id,
      type: 'volunteer',
      targetType: 'volunteer',
      name: app.name,
      email: app.email,
      subject: null,
      message: app.motivation || app.experience || null,
      created_at: app.created_at,
    });
    setReplyModalOpen(true);
  }, []);

  // Open reply modal pre-filled with status-change template
  const openStatusEmail = useCallback(
    (appId: string, appName: string, appEmail: string, status: string) => {
      const template = STATUS_EMAIL_TEMPLATES[status];
      if (!template) return;

      // Find the full application for motivation/experience
      const app = applications.find((a) => a.id === appId);

      setReplyTarget({
        id: appId,
        type: 'volunteer',
        targetType: 'volunteer',
        name: appName,
        email: appEmail,
        subject: null,
        message: app?.motivation || app?.experience || null,
        created_at: app?.created_at || new Date().toISOString(),
        prefillSubject: template.subject,
        prefillMessage: template.message,
        prefillTemplateKey: template.templateKey,
        prefillReplyType: 'status_change',
      });
      setReplyModalOpen(true);
      setStatusPrompt(null);
    },
    [applications],
  );

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
      // Refresh applications, reply counts, and expanded replies
      queryClient.invalidateQueries({ queryKey: ['admin-volunteer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-volunteer-reply-counts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-volunteer-replies'] });
    },
    [queryClient, replyTarget],
  );

  const adminName = profile?.full_name || 'Admin';
  const adminEmail = profile?.email || '';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Applications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and process volunteer applications submitted from the public site.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip icon={<Users className="h-4 w-4 text-gray-500" />} label="Total" value={counts.total} />
        <StatChip icon={<Clock className="h-4 w-4 text-blue-500" />} label="New" value={counts.new} />
        <StatChip icon={<Eye className="h-4 w-4 text-amber-500" />} label="Reviewing" value={counts.under_review} />
        <StatChip icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Accepted" value={counts.accepted} />
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
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
            placeholder="Search by name, email, or location…"
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
          <p className="text-sm text-red-700">Failed to load volunteer applications.</p>
          <p className="text-xs text-red-500 mt-1">Run the migration to create the volunteer_applications table.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No volunteer applications found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((app) => {
            const isExpanded = expandedId === app.id;
            const statusConf = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.new;

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Summary row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[#B01C2E]/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-[#B01C2E]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {app.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusConf.bg} ${statusConf.color}`}
                      >
                        {statusConf.icon}
                        {statusConf.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {app.email}
                      {app.location ? ` · ${app.location}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {replyCountMap[app.id] > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#B01C2E]/10 text-[#B01C2E]">
                        <MessageSquareReply className="h-3 w-3" />
                        {replyCountMap[app.id]} {replyCountMap[app.id] === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                    {lastRepliedMap[app.id] ? (
                      <span className="text-[10px] text-gray-400 hidden sm:flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Replied {timeAgo(lastRepliedMap[app.id])}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 hidden sm:block">
                        {new Date(app.created_at).toLocaleDateString('en-GB', {
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
                      <DetailRow icon={<User className="h-4 w-4" />} label="Name" value={app.name} />
                      <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={app.email} />
                      {app.phone && <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={app.phone} />}
                      {app.location && <DetailRow icon={<MapPin className="h-4 w-4" />} label="Location" value={app.location} />}
                      {app.availability && <DetailRow icon={<Calendar className="h-4 w-4" />} label="Availability" value={app.availability} />}
                      {app.experience && <DetailRow icon={<Briefcase className="h-4 w-4" />} label="Experience" value={app.experience} />}
                      <DetailRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Applied"
                        value={new Date(app.created_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      />
                    </div>

                    {/* Role preferences */}
                    {app.role_preferences && app.role_preferences.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Role Preferences</p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.role_preferences.map((role) => (
                            <span
                              key={role}
                              className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Motivation */}
                    {app.motivation && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Motivation</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line bg-white rounded-lg border border-gray-100 p-3">
                          {app.motivation}
                        </p>
                      </div>
                    )}

                    {/* CV link */}
                    {app.cv_url && (
                      <div>
                        <a
                          href={app.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-[#B01C2E] hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View CV / Resume
                        </a>
                      </div>
                    )}

                    {/* Status changer */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map((st) => {
                          const conf = STATUS_CONFIG[st];
                          const isActive = app.status === st;
                          return (
                            <button
                              key={st}
                              disabled={isActive || updatingId === app.id}
                              onClick={() => updateStatus(app, st)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                isActive
                                  ? `${conf.bg} ${conf.color} border-current`
                                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              } disabled:opacity-50`}
                            >
                              {conf.icon}
                              {conf.label}
                            </button>
                          );
                        })}
                        {updatingId === app.id && (
                          <Loader2 className="h-4 w-4 text-gray-400 animate-spin self-center" />
                        )}
                      </div>
                    </div>

                    {/* ── Conversation Timeline ── */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Conversation
                        {replyCountMap[app.id] > 0 && (
                          <span className="text-[10px] text-gray-400 font-normal">
                            ({replyCountMap[app.id]} {replyCountMap[app.id] === 1 ? 'reply' : 'replies'})
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
                            name: app.name,
                            email: app.email,
                            subject: null,
                            message: app.motivation || app.experience || null,
                            created_at: app.created_at,
                          }}
                          replies={expandedReplies}
                        />
                      )}
                    </div>

                    {/* Reply button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openReply(app)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#B01C2E] rounded-lg hover:bg-[#9A1827] transition-colors shadow-sm"
                      >
                        <Reply className="h-4 w-4" />
                        Reply to {app.name.split(/\s+/)[0]}
                      </button>
                      {replyCountMap[app.id] > 0 && (
                        <span className="text-xs text-gray-400">
                          {replyCountMap[app.id]} {replyCountMap[app.id] === 1 ? 'reply' : 'replies'} sent
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        <FileText className="h-3 w-3 inline mr-1" />
                        Reviewer Notes
                      </p>
                      <textarea
                        defaultValue={app.notes ?? ''}
                        onBlur={(e) => {
                          if (e.target.value !== (app.notes ?? '')) {
                            updateNotes(app.id, e.target.value);
                          }
                        }}
                        rows={2}
                        placeholder="Add reviewer notes…"
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

      {/* Status-Change Email Prompt */}
      {statusPrompt && STATUS_EMAIL_TEMPLATES[statusPrompt.newStatus] && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setStatusPrompt(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 z-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#B01C2E]/10 flex items-center justify-center shrink-0">
                <Send className="h-5 w-5 text-[#B01C2E]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {STATUS_EMAIL_TEMPLATES[statusPrompt.newStatus].prompt} {statusPrompt.appName}?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Status updated to <span className="font-medium capitalize">{statusPrompt.newStatus}</span>
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Would you like to send a branded email notifying{' '}
              <span className="font-medium">{statusPrompt.appName}</span> about this status change?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusPrompt(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() =>
                  openStatusEmail(
                    statusPrompt.appId,
                    statusPrompt.appName,
                    statusPrompt.appEmail,
                    statusPrompt.newStatus,
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#B01C2E] rounded-lg hover:bg-[#9A1827] transition-colors shadow-sm"
              >
                <Mail className="h-4 w-4" />
                Customise & Send
              </button>
            </div>
          </div>
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
      <span className="text-xs font-medium text-gray-400 w-20 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 truncate">{value}</span>
    </div>
  );
}
