/**
 * WelcomeModal — Phase 2
 *
 * A polished modal shown on first login. It introduces the user to the
 * onboarding tour system and lets them start a tour, skip it, or dismiss.
 *
 * Design:
 *  - iOS-style frosted glass backdrop
 *  - Neema Foundation branding (#B01C2E accent)
 *  - Shows role-specific tour list with estimated times
 *  - Accessible: focus-trapped, keyboard-navigable, screen-reader-friendly
 */

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTour } from './TourProvider';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';
import type { RoleTour } from '../../types/onboarding';

// ---------------------------------------------------------------------------
// Difficulty badge colours (match the roadmap's 🟢🟡🔴 system)
// ---------------------------------------------------------------------------

function EstimateBadge({ minutes }: { minutes: number }) {
  const color =
    minutes <= 10
      ? 'bg-emerald-100 text-emerald-700'
      : minutes <= 20
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      ~{minutes} min
    </span>
  );
}

function CompletedBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
      ✓ Done
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WelcomeModal() {
  const {
    showWelcome,
    dismissWelcome,
    availableTours,
    completedTourIds,
    startTour,
  } = useTour();
  const { track } = useOnboardingTracker();

  if (!showWelcome) return null;

  const handleDismiss = () => {
    track('dashboard.welcome_tour');
    dismissWelcome();
  };

  const handleStart = (tour: RoleTour) => {
    track('dashboard.welcome_tour');
    dismissWelcome();
    startTour(tour.id);
  };

  return (
    <Transition appear show={showWelcome} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[9999]"
        onClose={handleDismiss}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
                {/* Header with gradient accent */}
                <div className="bg-gradient-to-r from-[#B01C2E] to-[#8A1624] px-6 py-8 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <svg
                        className="h-7 w-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 0 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                        />
                      </svg>
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold">
                        Welcome to Neema Foundation
                      </Dialog.Title>
                      <p className="text-sm text-red-200 mt-0.5">
                        Admin Portal Onboarding
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-red-100 leading-relaxed">
                    We&apos;ve prepared interactive guided tours to help you master every
                    feature of your role. Each tour highlights key UI elements and walks
                    you through real workflows step by step.
                  </p>
                </div>

                {/* Tour list */}
                <div className="px-6 py-5 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Your Tours
                  </h3>
                  <ul className="space-y-2">
                    {availableTours.map((tour) => {
                      const isComplete = completedTourIds.includes(tour.id);
                      return (
                        <li key={tour.id}>
                          <button
                            onClick={() => handleStart(tour)}
                            className="w-full flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-[#B01C2E]/30 hover:bg-red-50/50 hover:shadow-sm active:scale-[0.98] group"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#B01C2E] truncate">
                                {tour.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {tour.description}
                              </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              {isComplete ? (
                                <CompletedBadge />
                              ) : (
                                <EstimateBadge minutes={tour.estimatedMinutes} />
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
                  <button
                    onClick={handleDismiss}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Skip for now
                  </button>
                  <p className="text-xs text-gray-400">
                    You can replay tours from the{' '}
                    <span className="font-medium text-gray-500">Help</span> menu
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
