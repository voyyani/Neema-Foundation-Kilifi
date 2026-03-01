/**
 * MaintenanceErrorBoundary — Fail-open error boundary for the maintenance system
 *
 * Phase 7.7: If the maintenance provider, gate, or placeholder throws,
 * this boundary catches the error and renders a no-op maintenance context
 * so all MaintenanceGate components pass through to show content normally.
 *
 * The site should never be *harder* to use because the maintenance system
 * itself fails. When in error state, all maintenance gating is bypassed.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

// ─── Props & State ────────────────────────────────────────────────────────────

interface Props {
  /** Content to protect — rendered normally on error */
  children: ReactNode;
  /**
   * Fallback content to render when error is caught.
   * Typically the same page content but WITHOUT MaintenanceProvider wrapping,
   * so gates are never evaluated at all.
   */
  fallback?: ReactNode;
  /** Optional flag to show a subtle warning banner when in error state */
  showWarning?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

class MaintenanceErrorBoundary extends Component<Props, State> {
  static defaultProps = {
    showWarning: false,
  };

  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log but don't crash — maintenance system is non-critical
    console.warn(
      '[MaintenanceErrorBoundary] Maintenance system error caught — failing open.',
      { error: error.message, componentStack: errorInfo.componentStack },
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const fallbackContent = this.props.fallback ?? (
        <div data-testid="maintenance-boundary-fallback">
          {/* Fallback renders nothing extra — outer layout handles content */}
        </div>
      );

      return (
        <>
          {this.props.showWarning && (
            <div
              role="status"
              aria-live="polite"
              className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 text-center"
            >
              Maintenance status unavailable — showing all content.
            </div>
          )}
          {fallbackContent}
        </>
      );
    }

    return this.props.children;
  }
}

export default MaintenanceErrorBoundary;
