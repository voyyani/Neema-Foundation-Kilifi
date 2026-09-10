-- Rate limiting for public edge-function endpoints (Phase 0.2)
-- One row per (key, window_start). `key` is a hashed client identifier.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id           BIGSERIAL PRIMARY KEY,
  key          TEXT        NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INT         NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (key, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limits_key_window_idx
  ON public.rate_limits (key, window_start DESC);

-- Only the service role touches this table; no public policies are granted.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomically increment the counter for a window and return the new total.
CREATE OR REPLACE FUNCTION public.bump_rate_limit(
  p_key TEXT,
  p_window_start TIMESTAMPTZ
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

-- Housekeeping: drop windows older than 2 days.
CREATE OR REPLACE FUNCTION public.prune_rate_limits() RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.rate_limits WHERE window_start < NOW() - INTERVAL '2 days';
$$;
