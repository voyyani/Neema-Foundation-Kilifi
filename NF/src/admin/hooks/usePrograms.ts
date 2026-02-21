import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Program, ProgramInput } from '../types/content';
import { toast } from 'sonner';
import { slugify } from '../lib/utils';

// Type helper for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const programsTable = () => supabase.from('programs') as any;

/**
 * Normalize a raw ProgramInput (or partial) before sending to PostgREST:
 *  - Empty strings → null   (avoids overwriting fields with '')
 *  - Empty arrays  → null   (avoids PostgREST type errors on non-array columns)
 *  - Ensures slug is generated from name when not supplied
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePayload(payload: Record<string, any>, name?: string): Record<string, any> {
  const out: Record<string, any> = { ...payload };

  // Auto-generate slug
  if (name && (!out.slug || String(out.slug).trim() === '')) {
    out.slug = slugify(name);
  }

  for (const key of Object.keys(out)) {
    const v = out[key];
    if (typeof v === 'string' && v.trim() === '') {
      out[key] = null;
    }
    if (Array.isArray(v) && v.length === 0) {
      out[key] = null;
    }
  }

  return out;
}

/**
 * Attempt a PostgREST write, automatically dropping any column that the
 * database doesn't know about yet (code === '42703') and retrying once.
 * This lets the app stay functional when a migration hasn't been applied.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function tryWrite(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildQuery: (payload: Record<string, any>) => PromiseLike<{ data: any; error: any }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
): Promise<Program> {
  const res = await buildQuery(payload);

  if (!res.error) return res.data as Program;

  const { error } = res;
  console.error('[Programs] DB error:', {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    payload_keys: Object.keys(payload),
  });

  // 42703 = undefined_column — drop the offending column and retry once
  const colMatch =
    (error.message as string | undefined)?.match(/column "?([^"]+)"? (of relation|does not exist)/i) ||
    (error.details as string | undefined)?.match(/column "?([^"]+)"? (of relation|does not exist)/i);

  if (error.code === '42703' && colMatch?.[1]) {
    const bad = colMatch[1];
    console.warn(`[Programs] Column "${bad}" missing in DB — dropping and retrying`);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete payload[bad];
    const retry = await buildQuery(payload);
    if (!retry.error) return retry.data as Program;
    throw retry.error;
  }

  throw error;
}

/**
 * Convert a raw Supabase/PostgREST error into a human-readable message that
 * names the field or constraint that caused the failure, so the UI can surface
 * exactly what went wrong.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildErrorMessage(err: any): string {
  const code: string = err?.code ?? '';
  const msg: string = err?.message ?? String(err);
  const hint: string = err?.hint ?? '';
  const detail: string = err?.details ?? '';

  // Unique constraint → slug conflict
  if (code === '23505') {
    const colMatch = detail.match(/Key \(([^)]+)\)=/);
    const col = colMatch?.[1] ?? 'slug';
    return `Duplicate value for "${col}". A program with this ${col} already exists.`;
  }
  // Not-null violation
  if (code === '23502') {
    const colMatch = msg.match(/column "([^"]+)"/);
    const col = colMatch?.[1] ?? 'a required field';
    return `"${col}" is required and cannot be empty.`;
  }
  // Check constraint
  if (code === '23514') {
    return `Invalid value: the data doesn't pass a database rule. ${hint || msg}`;
  }
  // Foreign key constraint
  if (code === '23503') {
    return `Related record not found. ${hint || msg}`;
  }
  // Undefined column (migration mismatch)
  if (code === '42703') {
    const colMatch = msg.match(/column "?([^"]+)"?/);
    return `Database column "${colMatch?.[1] ?? '?'}" doesn't exist — a migration may be pending.`;
  }
  // RLS policy block — PostgREST returns 0 rows on INSERT and a generic error on UPDATE
  if (code === 'PGRST116') {
    return 'Permission denied: your role may not have write access to programs. Check Supabase RLS policies.';
  }
  // JWT / auth errors
  if (code === 'PGRST301' || msg.toLowerCase().includes('jwt')) {
    return 'Session expired. Please sign out and sign back in.';
  }

  return `Save failed: ${msg}`;
}

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all programs
  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('programs')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setPrograms(data || []);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to load programs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Create program
  const createProgram = async (input: ProgramInput): Promise<Program> => {
    try {
      const maxOrder = Math.max(...programs.map(p => p.display_order), 0);

      const raw: Record<string, any> = {
        ...input,
        display_order: maxOrder + 1,
        is_active: input.is_active ?? true,
        is_featured: input.is_featured ?? false,
      };

      const payload = normalizePayload(raw, input.name);

      const data = await tryWrite(
        (p) => programsTable().insert([p]).select().single(),
        payload,
      );

      toast.success('Program created successfully!');
      fetchPrograms();
      return data;
    } catch (err) {
      const error = err as Error;
      const msg = buildErrorMessage(error);
      toast.error(msg);
      throw Object.assign(new Error(msg), { original: err });
    }
  };

  // Update program
  const updateProgram = async (id: string, input: Partial<ProgramInput>): Promise<Program> => {
    try {
      const payload = normalizePayload(input as Record<string, any>, input.name);

      const data = await tryWrite(
        (p) => programsTable().update(p).eq('id', id).select().single(),
        payload,
      );

      toast.success('Program updated successfully!');
      fetchPrograms();
      return data;
    } catch (err) {
      const error = err as Error;
      const msg = buildErrorMessage(error);
      toast.error(msg);
      throw Object.assign(new Error(msg), { original: err });
    }
  };

  // Delete program
  const deleteProgram = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Program deleted successfully!');
      fetchPrograms();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to delete program: ' + error.message);
      throw error;
    }
  };

  // Toggle active status
  const toggleActive = async (id: string): Promise<Program> => {
    try {
      const program = programs.find(p => p.id === id);
      if (!program) throw new Error('Program not found');

      const { data, error: updateError } = await programsTable()
        .update({ is_active: !program.is_active })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success(`Program ${data.is_active ? 'activated' : 'deactivated'}`);
      fetchPrograms();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to toggle status: ' + error.message);
      throw error;
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id: string): Promise<Program> => {
    try {
      const program = programs.find(p => p.id === id);
      if (!program) throw new Error('Program not found');

      // Optimistic UI update so the badge flips immediately
      const nextFeatured = !program.is_featured;
      setPrograms(prev =>
        prev.map(p => (p.id === id ? { ...p, is_featured: nextFeatured } : p))
      );

      const { data, error: updateError } = await programsTable()
        .update({ is_featured: nextFeatured })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success(`Program ${data.is_featured ? 'featured' : 'unfeatured'}`);
      fetchPrograms();
      return data;
    } catch (err) {
      const error = err as Error;
      // Revert optimistic change if the request fails
      setPrograms(prev =>
        prev.map(p =>
          p.id === id ? { ...p, is_featured: !p.is_featured } : p
        )
      );
      toast.error('Failed to toggle featured: ' + error.message);
      throw error;
    }
  };

  // Reorder programs
  const reorderPrograms = async (reorderedPrograms: Program[]): Promise<void> => {
    try {
      const updates = reorderedPrograms.map((program, index) => ({
        id: program.id,
        display_order: index,
      }));

      for (const update of updates) {
        await programsTable()
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Programs reordered!');
      fetchPrograms();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to reorder programs: ' + error.message);
      throw error;
    }
  };

  return {
    programs,
    isLoading,
    error,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    toggleActive,
    toggleFeatured,
    reorderPrograms,
  };
}
