import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      // Navigate to home after signOut completes
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  return (
    /*
     * admin-header-blur: iOS-style frosted glass (saturate + blur).
     * sticky top-0 keeps it pinned while the page scrolls beneath it.
     * safe-top:  respect the status-bar notch on iPhone X+.
     */
    <div className="admin-header-blur sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-2 border-b border-gray-200/60 px-3 shadow-sm safe-top sm:h-16 sm:gap-x-4 sm:px-4 lg:px-8">
      {/* Mobile menu button — 44×44 touch target */}
      <button
        type="button"
        aria-label="Open navigation"
        className="touch-target tap-scale -ml-1 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors lg:hidden"
        onClick={onMenuClick}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-3 self-stretch lg:gap-x-6">
        {/* Page title */}
        <div className="flex flex-1 items-center">
          <h1 className="text-base font-semibold text-gray-900 sm:text-lg truncate">
            Welcome back, {profile?.full_name?.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-x-1 sm:gap-x-3 lg:gap-x-4">
          {/* Notifications button — 44×44 touch target */}
          <button
            type="button"
            aria-label="View notifications"
            className="touch-target tap-scale rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="touch-target tap-scale -m-1 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#B01C2E] to-[#8A1624] flex items-center justify-center ring-2 ring-white shadow-sm">
                <span className="text-sm font-semibold text-white">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-3 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  {profile?.full_name}
                </span>
                <svg
                  className="ml-2 h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-150"
              enterFrom="transform opacity-0 scale-95 translate-y-1"
              enterTo="transform opacity-100 scale-100 translate-y-0"
              leave="transition ease-in duration-100"
              leaveFrom="transform opacity-100 scale-100 translate-y-0"
              leaveTo="transform opacity-0 scale-95 translate-y-1"
            >
              {/* Dropdown: wider on mobile, frosted + rounded for iOS feel */}
              <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-2xl bg-white/95 backdrop-blur-md py-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none">
                {/* Profile info */}
                <div className="px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#B01C2E] to-[#8A1624] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                      <p className="text-xs text-[#B01C2E] font-medium mt-0.5 capitalize">
                        {profile?.role?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items with 44px tap targets */}
                {[
                  { to: '/admin/profile', label: 'Your Profile' },
                  { to: '/admin/settings', label: 'Settings' },
                  { to: '/', label: 'View Website' },
                ].map((item) => (
                  <Menu.Item key={item.to}>
                    {({ active }) => (
                      <Link
                        to={item.to}
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center px-4 py-3 text-sm text-gray-700 min-h-[44px] transition-colors`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </Menu.Item>
                ))}

                <div className="border-t border-gray-100 my-1" />
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? 'bg-red-50' : ''
                      } flex w-full items-center px-4 py-3 text-sm text-red-600 min-h-[44px] transition-colors`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}
