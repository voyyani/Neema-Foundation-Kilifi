/**
 * AdminNotFound — Phase 1 (Breadcrumbs Audit, BUG-11)
 *
 * Catch-all 404 page rendered inside AdminLayout when the user
 * navigates to a URL under `/admin/*` that doesn't match any
 * defined route. Provides a clear error message with a link
 * back to the Dashboard.
 */

import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function AdminNotFound() {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
      {/* Icon */}
      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-red-50 mb-6">
        <AlertTriangle className="h-8 w-8 text-[#B01C2E]" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-gray-500 mb-1">
        The admin page you're looking for doesn't exist or has been moved.
      </p>
      <p className="text-xs text-gray-400 font-mono mb-8 break-all">
        {location.pathname}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B01C2E] text-white text-sm font-semibold hover:bg-[#9A1826] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E]/40 touch-target"
        >
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 touch-target"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
