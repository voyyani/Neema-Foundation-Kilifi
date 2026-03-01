/**
 * Unit Tests — Rule Evaluation Engine (Phase 7.5)
 *
 * Tests the core maintenance rule matching and priority resolution logic
 * used by useMaintenanceStatus and MaintenanceProvider.
 */

import { describe, it, expect } from 'vitest';
import type { MaintenanceScope, MaintenanceSeverity } from '../../admin/types/maintenance';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TestRule {
  id: string;
  scope: MaintenanceScope;
  target_key: string;
  severity: MaintenanceSeverity;
  title: string;
  message: string | null;
  display_config: Record<string, unknown>;
  estimated_end: string | null;
  priority: number;
}

// ─── Rule evaluation engine (extracted from useMaintenanceStatus logic) ────────

/**
 * Evaluates maintenance rules against a given context, returning the
 * highest-priority matching rule. This mirrors the logic in useMaintenanceStatus
 * and MaintenanceProvider.
 */
function evaluateMaintenanceRules(
  rules: TestRule[],
  context: {
    page?: string;
    section?: string;
    component?: string;
    feature?: string;
    userRole?: string;
  },
): TestRule | null {
  // Build the scope check chain from most specific to broadest
  const checks: { scope: MaintenanceScope; key: string }[] = [];

  if (context.component) checks.push({ scope: 'component', key: context.component });
  if (context.section) checks.push({ scope: 'section', key: context.section });
  if (context.page) checks.push({ scope: 'page', key: context.page });
  if (context.feature) checks.push({ scope: 'feature_group', key: context.feature });

  // Check for global rules first — they override everything
  const globalRule = rules.find(
    (r) => r.scope === 'global' && r.severity === 'full_block',
  );
  if (globalRule) return globalRule;

  // Check each scope from most specific to broadest
  for (const { scope, key } of checks) {
    const match = rules.find((r) => r.scope === scope && r.target_key === key);
    if (match) return match;
  }

  // Check for any global rule (non-full_block)
  const anyGlobal = rules.find((r) => r.scope === 'global');
  if (anyGlobal) return anyGlobal;

  return null;
}

/**
 * Checks if a given target is under maintenance.
 */
function isUnderMaintenance(
  rules: TestRule[],
  scope: MaintenanceScope,
  targetKey: string,
): boolean {
  const isGlobal = rules.some(
    (r) => r.scope === 'global' && r.severity === 'full_block',
  );
  if (isGlobal) return true;

  return rules.some(
    (r) =>
      (r.scope === scope && r.target_key === targetKey) ||
      r.scope === 'global',
  );
}

/**
 * Get the most specific matching rule for a target.
 */
function getRule(
  rules: TestRule[],
  scope: MaintenanceScope,
  targetKey: string,
): TestRule | null {
  return (
    rules.find((r) => r.scope === scope && r.target_key === targetKey) ??
    rules.find((r) => r.scope === 'global') ??
    null
  );
}

/**
 * Get all rules matching a scope.
 */
function getRulesForScope(
  rules: TestRule[],
  scope: MaintenanceScope,
): TestRule[] {
  return rules.filter((r) => r.scope === scope || r.scope === 'global');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRule(overrides: Partial<TestRule> = {}): TestRule {
  return {
    id: crypto.randomUUID(),
    scope: 'page',
    target_key: 'landing',
    severity: 'full_block',
    title: 'Test Maintenance',
    message: 'Test message',
    display_config: {},
    estimated_end: null,
    priority: 50,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Rule Evaluation Engine', () => {
  describe('evaluateMaintenanceRules', () => {
    it('should return null when no rules exist', () => {
      const result = evaluateMaintenanceRules([], { page: 'landing' });
      expect(result).toBeNull();
    });

    it('should return null when no rules match', () => {
      const rules = [makeRule({ scope: 'page', target_key: 'donate' })];
      const result = evaluateMaintenanceRules(rules, { page: 'landing' });
      expect(result).toBeNull();
    });

    it('should match a page-level rule', () => {
      const rule = makeRule({ scope: 'page', target_key: 'donate' });
      const result = evaluateMaintenanceRules([rule], { page: 'donate' });
      expect(result).toBe(rule);
    });

    it('should match a section-level rule', () => {
      const rule = makeRule({ scope: 'section', target_key: 'hero' });
      const result = evaluateMaintenanceRules([rule], { section: 'hero' });
      expect(result).toBe(rule);
    });

    it('should match a component-level rule', () => {
      const rule = makeRule({ scope: 'component', target_key: 'mpesa' });
      const result = evaluateMaintenanceRules([rule], { component: 'mpesa' });
      expect(result).toBe(rule);
    });

    it('should match a feature_group rule', () => {
      const rule = makeRule({ scope: 'feature_group', target_key: 'donations' });
      const result = evaluateMaintenanceRules([rule], { feature: 'donations' });
      expect(result).toBe(rule);
    });

    it('should prefer component over section over page over feature', () => {
      const componentRule = makeRule({
        scope: 'component',
        target_key: 'mpesa',
        title: 'Component',
        priority: 10,
      });
      const sectionRule = makeRule({
        scope: 'section',
        target_key: 'hero',
        title: 'Section',
        priority: 20,
      });
      const pageRule = makeRule({
        scope: 'page',
        target_key: 'donate',
        title: 'Page',
        priority: 30,
      });
      const featureRule = makeRule({
        scope: 'feature_group',
        target_key: 'donations',
        title: 'Feature',
        priority: 40,
      });

      const rules = [pageRule, sectionRule, componentRule, featureRule];
      const result = evaluateMaintenanceRules(rules, {
        page: 'donate',
        section: 'hero',
        component: 'mpesa',
        feature: 'donations',
      });

      // Component is most specific
      expect(result?.title).toBe('Component');
    });

    it('should prefer section over page when both match', () => {
      const sectionRule = makeRule({
        scope: 'section',
        target_key: 'hero',
        title: 'Section',
      });
      const pageRule = makeRule({
        scope: 'page',
        target_key: 'landing',
        title: 'Page',
      });

      const result = evaluateMaintenanceRules([pageRule, sectionRule], {
        page: 'landing',
        section: 'hero',
      });

      expect(result?.title).toBe('Section');
    });

    it('should let global full_block override everything', () => {
      const globalRule = makeRule({
        scope: 'global',
        target_key: '*',
        severity: 'full_block',
        title: 'Global Block',
        priority: 100,
      });
      const pageRule = makeRule({
        scope: 'page',
        target_key: 'donate',
        severity: 'notice',
        title: 'Page Notice',
        priority: 50,
      });

      const result = evaluateMaintenanceRules([pageRule, globalRule], {
        page: 'donate',
      });

      expect(result?.title).toBe('Global Block');
    });

    it('should fall back to global rule when no specific match', () => {
      const globalRule = makeRule({
        scope: 'global',
        target_key: '*',
        severity: 'notice',
        title: 'Global Notice',
      });

      const result = evaluateMaintenanceRules([globalRule], {
        page: 'donate',
      });

      expect(result?.title).toBe('Global Notice');
    });
  });

  describe('isUnderMaintenance', () => {
    it('should return false for empty rules', () => {
      expect(isUnderMaintenance([], 'page', 'donate')).toBe(false);
    });

    it('should return true for exact scope+target match', () => {
      const rules = [makeRule({ scope: 'page', target_key: 'donate' })];
      expect(isUnderMaintenance(rules, 'page', 'donate')).toBe(true);
    });

    it('should return false for non-matching target', () => {
      const rules = [makeRule({ scope: 'page', target_key: 'donate' })];
      expect(isUnderMaintenance(rules, 'page', 'landing')).toBe(false);
    });

    it('should return true when global full_block is active', () => {
      const rules = [
        makeRule({ scope: 'global', target_key: '*', severity: 'full_block' }),
      ];
      expect(isUnderMaintenance(rules, 'page', 'donate')).toBe(true);
      expect(isUnderMaintenance(rules, 'section', 'hero')).toBe(true);
    });

    it('should return true when any global rule exists', () => {
      const rules = [
        makeRule({ scope: 'global', target_key: '*', severity: 'notice' }),
      ];
      expect(isUnderMaintenance(rules, 'page', 'landing')).toBe(true);
    });

    it('should handle multiple scopes independently', () => {
      const rules = [
        makeRule({ scope: 'page', target_key: 'donate' }),
        makeRule({ scope: 'section', target_key: 'hero' }),
      ];
      expect(isUnderMaintenance(rules, 'page', 'donate')).toBe(true);
      expect(isUnderMaintenance(rules, 'section', 'hero')).toBe(true);
      expect(isUnderMaintenance(rules, 'page', 'landing')).toBe(false);
    });
  });

  describe('getRule', () => {
    it('should return null for no rules', () => {
      expect(getRule([], 'page', 'donate')).toBeNull();
    });

    it('should return exact match first', () => {
      const pageRule = makeRule({
        scope: 'page',
        target_key: 'donate',
        title: 'Page',
      });
      const globalRule = makeRule({
        scope: 'global',
        target_key: '*',
        title: 'Global',
      });
      const rules = [pageRule, globalRule];

      expect(getRule(rules, 'page', 'donate')?.title).toBe('Page');
    });

    it('should fall back to global rule', () => {
      const globalRule = makeRule({
        scope: 'global',
        target_key: '*',
        title: 'Global',
      });

      expect(getRule([globalRule], 'page', 'donate')?.title).toBe('Global');
    });

    it('should return null when no match and no global', () => {
      const rules = [makeRule({ scope: 'page', target_key: 'donate' })];
      expect(getRule(rules, 'page', 'landing')).toBeNull();
    });
  });

  describe('getRulesForScope', () => {
    it('should return empty array for no rules', () => {
      expect(getRulesForScope([], 'page')).toEqual([]);
    });

    it('should return only rules matching scope + global', () => {
      const rules = [
        makeRule({ scope: 'page', target_key: 'donate', title: 'Page' }),
        makeRule({ scope: 'section', target_key: 'hero', title: 'Section' }),
        makeRule({ scope: 'global', target_key: '*', title: 'Global' }),
      ];

      const pageRules = getRulesForScope(rules, 'page');
      expect(pageRules).toHaveLength(2);
      expect(pageRules.map((r) => r.title)).toContain('Page');
      expect(pageRules.map((r) => r.title)).toContain('Global');
      expect(pageRules.map((r) => r.title)).not.toContain('Section');
    });
  });

  describe('severity handling', () => {
    it('should distinguish full_block vs degraded vs notice', () => {
      const fullBlock = makeRule({ severity: 'full_block', target_key: 'donate' });
      const degraded = makeRule({ severity: 'degraded', target_key: 'hero', scope: 'section' });
      const notice = makeRule({ severity: 'notice', target_key: '*', scope: 'global' });

      expect(fullBlock.severity).toBe('full_block');
      expect(degraded.severity).toBe('degraded');
      expect(notice.severity).toBe('notice');
    });

    it('should return the correct severity for page vs section', () => {
      const rules = [
        makeRule({ scope: 'page', target_key: 'donate', severity: 'full_block' }),
        makeRule({ scope: 'section', target_key: 'hero', severity: 'degraded' }),
      ];

      const donateResult = getRule(rules, 'page', 'donate');
      expect(donateResult?.severity).toBe('full_block');

      const heroResult = getRule(rules, 'section', 'hero');
      expect(heroResult?.severity).toBe('degraded');
    });
  });

  describe('display_config handling', () => {
    it('should parse display_config correctly', () => {
      const rule = makeRule({
        display_config: {
          show_countdown: true,
          show_progress: true,
          theme: 'animated',
          custom_cta: { label: 'Go Home', href: '/' },
          placeholder_height: '300px',
        },
      });

      const config = rule.display_config;
      expect(config.show_countdown).toBe(true);
      expect(config.show_progress).toBe(true);
      expect(config.theme).toBe('animated');
      expect(config.custom_cta).toEqual({ label: 'Go Home', href: '/' });
      expect(config.placeholder_height).toBe('300px');
    });

    it('should handle empty display_config', () => {
      const rule = makeRule({ display_config: {} });
      expect(rule.display_config.show_countdown).toBeUndefined();
      expect(rule.display_config.theme).toBeUndefined();
    });
  });

  describe('estimated_end handling', () => {
    it('should handle null estimated_end', () => {
      const rule = makeRule({ estimated_end: null });
      expect(rule.estimated_end).toBeNull();
    });

    it('should preserve ISO date string', () => {
      const end = '2026-03-15T02:00:00Z';
      const rule = makeRule({ estimated_end: end });
      expect(rule.estimated_end).toBe(end);
      expect(new Date(rule.estimated_end!).getTime()).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle rules with same target_key but different scopes', () => {
      const pageRule = makeRule({
        scope: 'page',
        target_key: 'hero',
        title: 'Page Hero',
      });
      const sectionRule = makeRule({
        scope: 'section',
        target_key: 'hero',
        title: 'Section Hero',
      });

      // When querying as page scope
      expect(getRule([pageRule, sectionRule], 'page', 'hero')?.title).toBe('Page Hero');
      // When querying as section scope
      expect(getRule([pageRule, sectionRule], 'section', 'hero')?.title).toBe('Section Hero');
    });

    it('should handle multiple global rules (first wins)', () => {
      const globalNotice = makeRule({
        scope: 'global',
        target_key: '*',
        severity: 'notice',
        title: 'Notice',
        priority: 50,
      });
      const globalBlock = makeRule({
        scope: 'global',
        target_key: '*',
        severity: 'full_block',
        title: 'Block',
        priority: 100,
      });

      // Global full_block wins
      const result = evaluateMaintenanceRules([globalNotice, globalBlock], {
        page: 'landing',
      });
      expect(result?.title).toBe('Block');
    });

    it('should handle empty context gracefully', () => {
      const rules = [makeRule({ scope: 'page', target_key: 'donate' })];
      const result = evaluateMaintenanceRules(rules, {});
      expect(result).toBeNull();
    });
  });
});
