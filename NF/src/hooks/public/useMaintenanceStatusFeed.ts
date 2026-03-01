/**
 * useMaintenanceStatusFeed — Public hook for real-time maintenance status updates
 *
 * Combines an initial Supabase query with a Realtime subscription so visitors
 * see new status updates the moment an admin posts them — no polling required.
 *
 * Features:
 *  - Initial fetch of existing updates for a rule
 *  - Supabase Realtime INSERT subscription on `maintenance_status_updates`
 *  - Connection state tracking (isConnected)
 *  - Automatic reconnection handling
 *  - Deduplication of updates
 *  - Sorted newest-first
 *  - Cleanup on unmount / rule change
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabasePublic as supabase } from '../../lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { StatusType } from '../../admin/types/maintenance';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatusFeedUpdate {
  id: string;
  rule_id: string;
  title: string;
  body: string | null;
  progress_pct: number | null;
  status_type: StatusType;
  created_by: string | null;
  created_at: string;
}

export interface MaintenanceStatusFeedResult {
  /** All status updates for this rule, newest first */
  updates: StatusFeedUpdate[];
  /** Whether the Realtime channel is connected */
  isConnected: boolean;
  /** Whether the initial query is loading */
  isLoading: boolean;
  /** Fetch error, if any */
  error: Error | null;
  /** Latest progress percentage across all updates */
  latestProgress: number | null;
  /** Latest update object */
  latestUpdate: StatusFeedUpdate | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMaintenanceStatusFeed(ruleId: string | null | undefined): MaintenanceStatusFeedResult {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeUpdates, setRealtimeUpdates] = useState<StatusFeedUpdate[]>([]);

  // ── Initial fetch ───────────────────────────────────────────────────────────
  const queryKey = ['public', 'maintenance', 'status-feed', ruleId];

  const {
    data: initialUpdates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<StatusFeedUpdate[]> => {
      if (!ruleId) return [];

      const { data, error: fetchError } = await supabase
        .from('maintenance_status_updates')
        .select('id, rule_id, title, body, progress_pct, status_type, created_by, created_at')
        .eq('rule_id', ruleId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('[StatusFeed] Failed to fetch status updates:', fetchError);
        throw fetchError;
      }

      return (data ?? []) as StatusFeedUpdate[];
    },
    enabled: !!ruleId,
    staleTime: 15_000,
    gcTime: 2 * 60_000,
    refetchOnWindowFocus: true,
  });

  // ── Merge initial + realtime, deduplicate, sort ─────────────────────────────
  const updates: StatusFeedUpdate[] = (() => {
    const map = new Map<string, StatusFeedUpdate>();

    // Add initial data first, then realtime (realtime wins on duplicates)
    for (const u of initialUpdates) map.set(u.id, u);
    for (const u of realtimeUpdates) map.set(u.id, u);

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  })();

  // ── Supabase Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!ruleId) return;

    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setRealtimeUpdates([]);

    const channel = supabase
      .channel(`status-updates-${ruleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maintenance_status_updates',
          filter: `rule_id=eq.${ruleId}`,
        },
        (payload) => {
          const newUpdate = payload.new as StatusFeedUpdate;
          setRealtimeUpdates((prev) => {
            // Prevent duplicates
            if (prev.some((u) => u.id === newUpdate.id)) return prev;
            return [newUpdate, ...prev];
          });

          // Also invalidate the query to keep things in sync
          queryClient.invalidateQueries({ queryKey: ['public', 'maintenance', 'status-feed', ruleId] });
        },
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');

        if (status === 'CHANNEL_ERROR') {
          console.warn('[StatusFeed] Realtime channel error, will retry…');
        }

        if (status === 'TIMED_OUT') {
          console.warn('[StatusFeed] Realtime subscription timed out');
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [ruleId, queryClient]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const latestUpdate = updates[0] ?? null;
  const latestProgress =
    updates.find((u) => u.progress_pct !== null && u.progress_pct !== undefined)?.progress_pct ??
    null;

  return {
    updates,
    isConnected,
    isLoading,
    error: error as Error | null,
    latestProgress,
    latestUpdate,
  };
}

// ─── Convenience: hook for all active rules' latest status ────────────────────

export interface RuleLatestStatus {
  ruleId: string;
  latestProgress: number | null;
  latestTitle: string | null;
  latestStatusType: StatusType | null;
  latestCreatedAt: string | null;
}

/**
 * useMaintenanceLatestStatuses — Fetch the latest status update for each active rule.
 * Used by the maintenance placeholder to show real progress.
 */
export function useMaintenanceLatestStatuses(ruleIds: string[]): {
  statuses: Map<string, RuleLatestStatus>;
  isLoading: boolean;
} {
  const {
    data: statuses = new Map<string, RuleLatestStatus>(),
    isLoading,
  } = useQuery({
    queryKey: ['public', 'maintenance', 'latest-statuses', ...ruleIds.sort()],
    queryFn: async () => {
      if (!ruleIds.length) return new Map<string, RuleLatestStatus>();

      // Fetch latest status update per rule using DISTINCT ON
      const { data, error } = await supabase
        .from('maintenance_status_updates')
        .select('rule_id, title, progress_pct, status_type, created_at')
        .in('rule_id', ruleIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[LatestStatuses] Failed to fetch:', error);
        throw error;
      }

      const map = new Map<string, RuleLatestStatus>();

      // Group by rule_id, take the latest for each
      for (const row of data ?? []) {
        if (!map.has(row.rule_id)) {
          map.set(row.rule_id, {
            ruleId: row.rule_id,
            latestProgress: row.progress_pct,
            latestTitle: row.title,
            latestStatusType: row.status_type as StatusType,
            latestCreatedAt: row.created_at,
          });
        }
      }

      return map;
    },
    enabled: ruleIds.length > 0,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  return { statuses, isLoading };
}
