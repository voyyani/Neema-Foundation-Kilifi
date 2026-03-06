-- ============================================================================
-- Fix: maintenance_audit_log rule_id foreign key prevents deleting rules
-- ============================================================================
-- Root cause: The AFTER DELETE trigger on maintenance_rules inserts a new row
-- into maintenance_audit_log with rule_id = OLD.id.  That INSERT is rejected
-- by the FK constraint because the referenced rule was already deleted.
--
-- Fix: Drop the FK constraint on maintenance_audit_log.rule_id.
-- The column becomes a plain nullable UUID that records which rule was
-- affected.  Full rule data is already captured in the `changes` JSONB column,
-- so no historical information is lost.  referential integrity on an audit log
-- is undesirable — you want audit entries to survive rule deletions.
-- ============================================================================

ALTER TABLE public.maintenance_audit_log
  DROP CONSTRAINT IF EXISTS maintenance_audit_log_rule_id_fkey;
