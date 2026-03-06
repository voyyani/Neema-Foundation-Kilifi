/**
 * HelpMenuButton — Phase 2
 *
 * A floating help button in the admin header that lets users:
 *  - Replay completed tours
 *  - Start tours they haven't taken yet
 *  - See their onboarding progress
 *
 * Design: Matches the existing Header dropdown pattern (Headless UI Menu).
 */

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useTour } from './TourProvider';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
      />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HelpMenuButton() {
  const {
    availableTours,
    completedTourIds,
    startTour,
    isOnboardingComplete,
    activeTour,
  } = useTour();

  const completedCount = completedTourIds.length;
  const totalCount = availableTours.length;
  const progress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className="touch-target tap-scale rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors relative"
        aria-label="Help & Tours"
        data-tour="help-menu"
      >
        <HelpIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        {/* Dot indicator for incomplete onboarding */}
        {!isOnboardingComplete && totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B01C2E] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#B01C2E]" />
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 scale-95 translate-y-1"
        enterTo="opacity-100 scale-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100 translate-y-0"
        leaveTo="opacity-0 scale-95 translate-y-1"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-2xl bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Guided Tours
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isOnboardingComplete
                    ? 'All tours completed — replay anytime!'
                    : `${completedCount}/${totalCount} tours completed`}
                </p>
              </div>
              {totalCount > 0 && (
                <span className="text-xs font-bold text-[#B01C2E]">
                  {progress}%
                </span>
              )}
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B01C2E] to-[#D4374B] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Tour list */}
          <div className="py-1.5 max-h-80 overflow-y-auto">
            {availableTours.map((tour) => {
              const isComplete = completedTourIds.includes(tour.id);
              const isRunning =
                activeTour?.tourId === tour.id &&
                activeTour?.status === 'in_progress';

              return (
                <Menu.Item key={tour.id}>
                  {({ active }) => (
                    <button
                      onClick={() => startTour(tour.id)}
                      disabled={isRunning}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center gap-3 px-4 py-3 text-left min-h-[44px] transition-colors ${
                        isRunning ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <PlayIcon className="h-5 w-5 text-[#B01C2E] flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tour.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {isComplete
                            ? 'Tap to replay'
                            : isRunning
                              ? 'In progress…'
                              : `~${tour.estimatedMinutes} min`}
                        </p>
                      </div>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50">
            <p className="text-xs text-gray-400 text-center">
              Tours highlight key features for your role
            </p>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
