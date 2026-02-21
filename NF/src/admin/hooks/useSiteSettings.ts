// useSiteSettings hook - Site Settings CRUD

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SiteSettings, SiteSettingsInput } from '../types/content';
import { toast } from 'sonner';
import { queryClient } from '../config/queryClient';

// Type helper for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const siteSettingsTable = () => supabase.from('site_settings') as any;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .single();

      if (fetchError) throw fetchError;
      setSettings(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update settings
  const updateSettings = async (input: SiteSettingsInput): Promise<void> => {
    try {
      const { data, error: updateError } = await siteSettingsTable()
        .update(input)
        .eq('id', 'main')
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data);
      // Invalidate the public React Query cache so the public site reflects changes immediately
      queryClient.invalidateQueries({ queryKey: ['public', 'site-settings'] });
      toast.success('Settings updated successfully!');
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update settings: ' + error.message);
      throw error;
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
