-- ============================================================================
-- Phase 5 — Enable Realtime on maintenance_status_updates
-- Allows public visitors to receive live status updates via Supabase Realtime
-- ============================================================================

-- Enable Realtime publication for the maintenance_status_updates table
-- This allows the useMaintenanceStatusFeed hook to subscribe to INSERT events
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_status_updates;

-- Also enable replica identity FULL so Realtime can send complete row data
ALTER TABLE public.maintenance_status_updates REPLICA IDENTITY FULL;

-- ============================================================================
-- Database webhook for push notifications
-- Triggers the maintenance-notify Edge Function on each status update INSERT
-- ============================================================================

-- Note: Database webhooks are configured in the Supabase dashboard:
--   Database → Webhooks → Create Webhook
--   - Name: maintenance-status-notify
--   - Table: maintenance_status_updates
--   - Events: INSERT
--   - Type: Supabase Edge Function
--   - Function: maintenance-notify
--
-- Alternatively, use a trigger + net extension for HTTP calls:

-- Create the webhook trigger function (if pg_net extension is available)
DO $$
BEGIN
  -- Check if pg_net extension exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    -- Create the notification trigger function
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.notify_maintenance_status_update()
      RETURNS TRIGGER AS $trigger$
      DECLARE
        _supabase_url TEXT;
        _anon_key TEXT;
      BEGIN
        -- Get Supabase URL from environment or hardcode project ref
        _supabase_url := current_setting('app.settings.supabase_url', true);
        _anon_key := current_setting('app.settings.anon_key', true);

        -- Only send notification if we have the URL configured
        IF _supabase_url IS NOT NULL AND _anon_key IS NOT NULL THEN
          PERFORM net.http_post(
            url := _supabase_url || '/functions/v1/maintenance-notify',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || _anon_key
            ),
            body := jsonb_build_object(
              'record', jsonb_build_object(
                'id', NEW.id,
                'rule_id', NEW.rule_id,
                'title', NEW.title,
                'body', NEW.body,
                'progress_pct', NEW.progress_pct,
                'status_type', NEW.status_type,
                'created_by', NEW.created_by,
                'created_at', NEW.created_at
              )
            )
          );
        END IF;

        RETURN NEW;
      END;
      $trigger$ LANGUAGE plpgsql SECURITY DEFINER;
    $fn$;

    -- Create the trigger
    DROP TRIGGER IF EXISTS on_maintenance_status_insert_notify ON public.maintenance_status_updates;
    CREATE TRIGGER on_maintenance_status_insert_notify
      AFTER INSERT ON public.maintenance_status_updates
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_maintenance_status_update();

    RAISE NOTICE 'Maintenance notification trigger created with pg_net';
  ELSE
    RAISE NOTICE 'pg_net extension not available — configure database webhook via Supabase dashboard instead';
  END IF;
END $$;
