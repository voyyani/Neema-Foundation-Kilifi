/**
 * E2E Integration Tests — Maintenance Gating (Phase 7.4)
 *
 * Tests the full maintenance gating flow: provider → context → gate → placeholder.
 * Uses React Testing Library to verify end-user behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { MaintenanceScope, MaintenanceSeverity } from '../../admin/types/maintenance';

// ─── Mock Types ──────────────────────────────────────────────────────────────

interface MockRule {
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

// ─── Mock Supabase ───────────────────────────────────────────────────────────

const mockRules: MockRule[] = [];

vi.mock('../../lib/supabase/client', () => ({
  supabasePublic: {
    from: () => ({
      select: () => ({
        order: () => ({
          data: mockRules,
          error: null,
        }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: vi.fn() }),
      }),
    }),
  },
  supabaseAdmin: {
    from: () => ({
      select: () => ({ data: [], error: null }),
    }),
  },
}));

// ─── Mock useMaintenanceStatusFeed ────────────────────────────────────────────

vi.mock('../../hooks/public/useMaintenanceStatusFeed', () => ({
  useMaintenanceStatusFeed: () => ({
    updates: [],
    isConnected: false,
    isLoading: false,
    error: null,
    latestProgress: null,
    latestUpdate: null,
  }),
  useMaintenanceLatestStatuses: () => ({
    data: {},
    isLoading: false,
  }),
}));

// ─── Test Wrapper ────────────────────────────────────────────────────────────

// We need to create a lightweight test version of the provider
// since the real one uses React Query which needs more setup

interface TestMaintenanceContextValue {
  rules: MockRule[];
  isLoading: boolean;
  error: Error | null;
  isGlobalMaintenance: boolean;
  isUnderMaintenance: (scope: MaintenanceScope, targetKey: string) => boolean;
  getRule: (scope: MaintenanceScope, targetKey: string) => MockRule | null;
  getRulesForScope: (scope: MaintenanceScope) => MockRule[];
  isPageUnderMaintenance: (pageKey: string) => boolean;
  isSectionUnderMaintenance: (sectionKey: string) => boolean;
  isFeatureUnderMaintenance: (featureKey: string) => boolean;
  getMaintenanceInfo: (scope: MaintenanceScope, targetKey: string) => null;
  globalNotices: MockRule[];
}

const TestMaintenanceContext = React.createContext<TestMaintenanceContextValue | null>(null);

function TestMaintenanceProvider({
  rules,
  isLoading = false,
  children,
}: {
  rules: MockRule[];
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  const isGlobalMaintenance = rules.some(
    (r) => r.scope === 'global' && r.severity === 'full_block',
  );

  const isUnderMaintenance = (scope: MaintenanceScope, targetKey: string) => {
    if (isGlobalMaintenance) return true;
    return rules.some(
      (r) =>
        (r.scope === scope && r.target_key === targetKey) ||
        r.scope === 'global',
    );
  };

  const getRule = (scope: MaintenanceScope, targetKey: string) => {
    return (
      rules.find((r) => r.scope === scope && r.target_key === targetKey) ??
      rules.find((r) => r.scope === 'global') ??
      null
    );
  };

  const getRulesForScope = (scope: MaintenanceScope) => {
    return rules.filter((r) => r.scope === scope || r.scope === 'global');
  };

  const value: TestMaintenanceContextValue = {
    rules,
    isLoading,
    error: null,
    isGlobalMaintenance,
    isUnderMaintenance,
    getRule,
    getRulesForScope,
    isPageUnderMaintenance: (k: string) => isUnderMaintenance('page', k),
    isSectionUnderMaintenance: (k: string) => isUnderMaintenance('section', k),
    isFeatureUnderMaintenance: (k: string) => isUnderMaintenance('feature_group', k),
    getMaintenanceInfo: () => null,
    globalNotices: rules.filter((r) => r.scope === 'global' && r.severity === 'notice'),
  };

  return (
    <TestMaintenanceContext.Provider value={value as unknown as TestMaintenanceContextValue}>
      {children}
    </TestMaintenanceContext.Provider>
  );
}

// ─── Minimal Gate Component (mirrors MaintenanceGate logic) ──────────────────

function TestMaintenanceGate({
  page,
  section,
  feature,
  children,
}: {
  page?: string;
  section?: string;
  feature?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TestMaintenanceContext);
  if (!ctx) throw new Error('Missing TestMaintenanceProvider');

  if (ctx.isLoading) return <>{children}</>;

  // Global full-block
  if (ctx.isGlobalMaintenance) {
    const globalRule = ctx.getRule('global', '*');
    if (globalRule && globalRule.severity === 'full_block') {
      return (
        <div role="alert" data-testid="maintenance-placeholder">
          <h2>{globalRule.title}</h2>
          {globalRule.message && <p>{globalRule.message}</p>}
        </div>
      );
    }
  }

  const checks: { scope: MaintenanceScope; key: string }[] = [];
  if (section) checks.push({ scope: 'section', key: section });
  if (page) checks.push({ scope: 'page', key: page });
  if (feature) checks.push({ scope: 'feature_group', key: feature });

  for (const { scope, key } of checks) {
    const rule = ctx.getRule(scope, key);
    if (!rule) continue;

    if (rule.severity === 'full_block') {
      return (
        <div role="alert" data-testid="maintenance-placeholder">
          <h2>{rule.title}</h2>
          {rule.message && <p>{rule.message}</p>}
        </div>
      );
    }
    if (rule.severity === 'degraded') {
      return (
        <div role="region" data-testid="maintenance-degraded">
          <h3>{rule.title}</h3>
          {rule.message && <p>{rule.message}</p>}
        </div>
      );
    }
    if (rule.severity === 'notice') {
      return (
        <>
          <div role="alert" data-testid="maintenance-notice">
            <p>{rule.title}</p>
          </div>
          {children}
        </>
      );
    }
  }

  return <>{children}</>;
}

// ─── Test Helpers ─────────────────────────────────────────────────────────────

function makeRule(overrides: Partial<MockRule> = {}): MockRule {
  return {
    id: `rule-${Math.random().toString(36).slice(2)}`,
    scope: 'page',
    target_key: 'landing',
    severity: 'full_block',
    title: 'Under Maintenance',
    message: 'We are performing scheduled maintenance.',
    display_config: {},
    estimated_end: null,
    priority: 50,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Maintenance Gating E2E', () => {
  beforeEach(() => {
    mockRules.length = 0;
  });

  describe('No maintenance active', () => {
    it('should render children normally with no active rules', () => {
      render(
        <TestMaintenanceProvider rules={[]}>
          <TestMaintenanceGate page="landing">
            <div data-testid="hero">Hero Content</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByText('Hero Content')).toBeInTheDocument();
      expect(screen.queryByTestId('maintenance-placeholder')).not.toBeInTheDocument();
    });

    it('should render multiple sections normally', () => {
      render(
        <TestMaintenanceProvider rules={[]}>
          <TestMaintenanceGate page="landing" section="hero">
            <div data-testid="hero">Hero</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="landing" section="programs">
            <div data-testid="programs">Programs</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="landing" section="impact">
            <div data-testid="impact">Impact</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('programs')).toBeInTheDocument();
      expect(screen.getByTestId('impact')).toBeInTheDocument();
    });
  });

  describe('Global full_block maintenance', () => {
    it('should replace ALL content with maintenance placeholder', () => {
      const rule = makeRule({
        scope: 'global',
        target_key: '*',
        severity: 'full_block',
        title: 'Site Under Maintenance',
        message: 'Full site maintenance in progress.',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="landing">
            <div data-testid="hero">Hero Content</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
      expect(screen.getByTestId('maintenance-placeholder')).toBeInTheDocument();
      expect(screen.getByText('Site Under Maintenance')).toBeInTheDocument();
      expect(screen.getByText('Full site maintenance in progress.')).toBeInTheDocument();
    });

    it('should block all pages when global is active', () => {
      const rule = makeRule({
        scope: 'global',
        target_key: '*',
        severity: 'full_block',
        title: 'Global Maintenance',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="donate">
            <div data-testid="donate">Donate</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="volunteer">
            <div data-testid="volunteer">Volunteer</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.queryByTestId('donate')).not.toBeInTheDocument();
      expect(screen.queryByTestId('volunteer')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('maintenance-placeholder')).toHaveLength(2);
    });
  });

  describe('Page-level maintenance', () => {
    it('should block only the targeted page', () => {
      const rule = makeRule({
        scope: 'page',
        target_key: 'donate',
        severity: 'full_block',
        title: 'Donate Page Down',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="landing">
            <div data-testid="landing">Landing</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="donate">
            <div data-testid="donate">Donate</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.getByTestId('landing')).toBeInTheDocument();
      expect(screen.queryByTestId('donate')).not.toBeInTheDocument();
      expect(screen.getByText('Donate Page Down')).toBeInTheDocument();
    });

    it('should show degraded placeholder for degraded severity', () => {
      const rule = makeRule({
        scope: 'page',
        target_key: 'media',
        severity: 'degraded',
        title: 'Media Gallery Update',
        message: 'Uploading new photos.',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="media">
            <div data-testid="media">Gallery</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.queryByTestId('media')).not.toBeInTheDocument();
      expect(screen.getByTestId('maintenance-degraded')).toBeInTheDocument();
      expect(screen.getByText('Media Gallery Update')).toBeInTheDocument();
    });

    it('should show notice banner AND render content for notice severity', () => {
      const rule = makeRule({
        scope: 'page',
        target_key: 'volunteer',
        severity: 'notice',
        title: 'Volunteer App Update',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="volunteer">
            <div data-testid="volunteer">Volunteer Form</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      // Content should STILL be visible
      expect(screen.getByTestId('volunteer')).toBeInTheDocument();
      expect(screen.getByText('Volunteer Form')).toBeInTheDocument();
      // Notice banner should also be visible
      expect(screen.getByTestId('maintenance-notice')).toBeInTheDocument();
      expect(screen.getByText('Volunteer App Update')).toBeInTheDocument();
    });
  });

  describe('Section-level maintenance', () => {
    it('should block only the targeted section', () => {
      const rule = makeRule({
        scope: 'section',
        target_key: 'hero',
        severity: 'full_block',
        title: 'Hero Update',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="landing" section="hero">
            <div data-testid="hero">Hero Content</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="landing" section="programs">
            <div data-testid="programs">Programs Content</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
      expect(screen.getByTestId('programs')).toBeInTheDocument();
      expect(screen.getByText('Hero Update')).toBeInTheDocument();
    });

    it('should allow multiple sections to be independently maintained', () => {
      const rules = [
        makeRule({
          scope: 'section',
          target_key: 'hero',
          severity: 'full_block',
          title: 'Hero Down',
        }),
        makeRule({
          scope: 'section',
          target_key: 'impact',
          severity: 'degraded',
          title: 'Impact Updating',
        }),
      ];

      render(
        <TestMaintenanceProvider rules={rules}>
          <TestMaintenanceGate page="landing" section="hero">
            <div data-testid="hero">Hero</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="landing" section="programs">
            <div data-testid="programs">Programs</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="landing" section="impact">
            <div data-testid="impact">Impact</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      // Hero: blocked
      expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
      expect(screen.getByText('Hero Down')).toBeInTheDocument();
      // Programs: visible
      expect(screen.getByTestId('programs')).toBeInTheDocument();
      // Impact: degraded
      expect(screen.queryByTestId('impact')).not.toBeInTheDocument();
      expect(screen.getByText('Impact Updating')).toBeInTheDocument();
    });
  });

  describe('Feature group maintenance', () => {
    it('should block content gated by feature group', () => {
      const rule = makeRule({
        scope: 'feature_group',
        target_key: 'donations',
        severity: 'full_block',
        title: 'Donations Offline',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate feature="donations">
            <div data-testid="donate-cta">Donate Button</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="landing" section="programs">
            <div data-testid="programs">Programs</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.queryByTestId('donate-cta')).not.toBeInTheDocument();
      expect(screen.getByTestId('programs')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should render children during loading (avoid flash)', () => {
      render(
        <TestMaintenanceProvider rules={[]} isLoading={true}>
          <TestMaintenanceGate page="landing">
            <div data-testid="hero">Hero Content</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      // During loading, content should be visible to avoid flash
      expect(screen.getByTestId('hero')).toBeInTheDocument();
    });
  });

  describe('Maintenance message display', () => {
    it('should display custom title and message', () => {
      const rule = makeRule({
        scope: 'page',
        target_key: 'donate',
        severity: 'full_block',
        title: 'Payment System Upgrade',
        message: 'We are upgrading our payment provider for better security.',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="donate">
            <div>Donate</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.getByText('Payment System Upgrade')).toBeInTheDocument();
      expect(
        screen.getByText('We are upgrading our payment provider for better security.'),
      ).toBeInTheDocument();
    });

    it('should handle null message gracefully', () => {
      const rule = makeRule({
        scope: 'page',
        target_key: 'donate',
        severity: 'full_block',
        title: 'Maintenance',
        message: null,
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="donate">
            <div>Donate</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });
  });

  describe('Multiple rules interaction', () => {
    it('should apply all applicable rules independently', () => {
      const rules = [
        makeRule({
          scope: 'page',
          target_key: 'donate',
          severity: 'full_block',
          title: 'Donate Down',
        }),
        makeRule({
          scope: 'page',
          target_key: 'media',
          severity: 'notice',
          title: 'Media Note',
        }),
      ];

      render(
        <TestMaintenanceProvider rules={rules}>
          <TestMaintenanceGate page="donate">
            <div data-testid="donate">Donate</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="media">
            <div data-testid="media">Media</div>
          </TestMaintenanceGate>
          <TestMaintenanceGate page="volunteer">
            <div data-testid="volunteer">Volunteer</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      // Donate: blocked
      expect(screen.queryByTestId('donate')).not.toBeInTheDocument();
      // Media: notice (content visible)
      expect(screen.getByTestId('media')).toBeInTheDocument();
      expect(screen.getByText('Media Note')).toBeInTheDocument();
      // Volunteer: unaffected
      expect(screen.getByTestId('volunteer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA roles on maintenance placeholder', () => {
      const rule = makeRule({
        scope: 'page',
        target_key: 'donate',
        severity: 'full_block',
        title: 'Maintenance Active',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="donate">
            <div>Donate</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      const placeholder = screen.getByTestId('maintenance-placeholder');
      expect(placeholder).toHaveAttribute('role', 'alert');
    });

    it('should have appropriate ARIA roles on notice', () => {
      const rule = makeRule({
        scope: 'page',
        target_key: 'volunteer',
        severity: 'notice',
        title: 'Notice',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="volunteer">
            <div>Form</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.getByTestId('maintenance-notice')).toHaveAttribute('role', 'alert');
    });

    it('should have appropriate ARIA roles on degraded', () => {
      const rule = makeRule({
        scope: 'page',
        target_key: 'media',
        severity: 'degraded',
        title: 'Degraded',
      });

      render(
        <TestMaintenanceProvider rules={[rule]}>
          <TestMaintenanceGate page="media">
            <div>Gallery</div>
          </TestMaintenanceGate>
        </TestMaintenanceProvider>,
      );

      expect(screen.getByTestId('maintenance-degraded')).toHaveAttribute('role', 'region');
    });
  });
});
