/**
 * Tests for MaintenanceErrorBoundary — Phase 7.7
 *
 * Verifies fail-open behavior: when maintenance system throws,
 * the fallback is rendered instead of crashing the page.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MaintenanceErrorBoundary from '../../components/maintenance/MaintenanceErrorBoundary';

// Suppress React error boundary console output during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Component that always throws (simulates MaintenanceProvider crashing)
function CrashingMaintenanceProvider({
  children: _children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  throw new Error('Maintenance system crashed!');
}

// Safe page content
function PageContent(): React.ReactElement {
  return <div data-testid="page-content">Normal Page Content</div>;
}

// Fallback content (page without maintenance gating)
function FallbackContent(): React.ReactElement {
  return <div data-testid="fallback-content">Fallback Page Content</div>;
}

describe('MaintenanceErrorBoundary', () => {
  it('should render children normally when no error occurs', () => {
    render(
      <MaintenanceErrorBoundary fallback={<FallbackContent />}>
        <PageContent />
      </MaintenanceErrorBoundary>,
    );

    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByText('Normal Page Content')).toBeInTheDocument();
    expect(screen.queryByTestId('fallback-content')).not.toBeInTheDocument();
  });

  it('should render fallback when a child throws', () => {
    render(
      <MaintenanceErrorBoundary fallback={<FallbackContent />}>
        <CrashingMaintenanceProvider>
          <PageContent />
        </CrashingMaintenanceProvider>
      </MaintenanceErrorBoundary>,
    );

    // CrashingMaintenanceProvider threw, so fallback should be shown
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
    expect(screen.getByText('Fallback Page Content')).toBeInTheDocument();
    // Children (wrapped in crashing provider) should NOT be visible
    expect(screen.queryByTestId('page-content')).not.toBeInTheDocument();
  });

  it('should render default fallback div when no fallback prop provided', () => {
    render(
      <MaintenanceErrorBoundary>
        <CrashingMaintenanceProvider>
          <PageContent />
        </CrashingMaintenanceProvider>
      </MaintenanceErrorBoundary>,
    );

    expect(screen.getByTestId('maintenance-boundary-fallback')).toBeInTheDocument();
  });

  it('should show warning banner when showWarning is true and error occurs', () => {
    render(
      <MaintenanceErrorBoundary showWarning={true} fallback={<FallbackContent />}>
        <CrashingMaintenanceProvider>
          <PageContent />
        </CrashingMaintenanceProvider>
      </MaintenanceErrorBoundary>,
    );

    expect(
      screen.getByText('Maintenance status unavailable — showing all content.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
  });

  it('should NOT show warning banner when showWarning is false/default', () => {
    render(
      <MaintenanceErrorBoundary fallback={<FallbackContent />}>
        <CrashingMaintenanceProvider>
          <PageContent />
        </CrashingMaintenanceProvider>
      </MaintenanceErrorBoundary>,
    );

    expect(
      screen.queryByText('Maintenance status unavailable — showing all content.'),
    ).not.toBeInTheDocument();
  });

  it('should have proper ARIA attributes on warning banner', () => {
    render(
      <MaintenanceErrorBoundary showWarning={true} fallback={<FallbackContent />}>
        <CrashingMaintenanceProvider>
          <PageContent />
        </CrashingMaintenanceProvider>
      </MaintenanceErrorBoundary>,
    );

    const banner = screen.getByText(
      'Maintenance status unavailable — showing all content.',
    );
    expect(banner).toHaveAttribute('role', 'status');
    expect(banner).toHaveAttribute('aria-live', 'polite');
  });

  it('should log warning to console when error is caught', () => {
    render(
      <MaintenanceErrorBoundary fallback={<FallbackContent />}>
        <CrashingMaintenanceProvider>
          <PageContent />
        </CrashingMaintenanceProvider>
      </MaintenanceErrorBoundary>,
    );

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[MaintenanceErrorBoundary]'),
      expect.objectContaining({
        error: 'Maintenance system crashed!',
      }),
    );
  });
});
