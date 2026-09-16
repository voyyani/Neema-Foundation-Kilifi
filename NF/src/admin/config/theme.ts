/**
 * Neema Foundation Admin Theme Configuration
 * 
 * Brand Colors:
 * - Primary (Maroon): #B01C2E
 * - Primary Dark: #8A1624
 * - Primary Light: #D42A3F
 * - Secondary (Dark Gray): #111827
 * 
 * This file provides consistent theming across the admin portal.
 */

// =============================================================================
// Brand Colors
// =============================================================================

export const BRAND_COLORS = {
  primary: {
    50: '#FEF2F2',
    100: '#FDE8E9',
    200: '#FBBCC0',
    300: '#F78F96',
    400: '#D42A3F',
    500: '#B01C2E', // Main brand color
    600: '#8A1624',
    700: '#6B111C',
    800: '#4D0C14',
    900: '#2E070C',
  },
  secondary: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827', // Main secondary color
  },
} as const;

// =============================================================================
// Logo Configuration
// =============================================================================

export const LOGO_URL = 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png';

// =============================================================================
// Tailwind Class Mappings (for easy reference)
// =============================================================================

/**
 * Primary action buttons, headers, gradients
 * Replace: bg-blue-600 → bg-brand-600, hover:bg-blue-700 → hover:bg-brand-700
 */
export const THEME_CLASSES = {
  // Sidebar
  sidebar: {
    bg: 'bg-gradient-to-b from-brand-600 to-brand-700',
    navActive: 'bg-brand-700 text-white',
    navInactive: 'text-danger-100 hover:text-white hover:bg-brand-700',
    navIcon: 'text-danger-200 group-hover:text-white',
    userBg: 'bg-brand-700/50',
    userAvatar: 'bg-brand-500',
    textMuted: 'text-danger-200',
  },
  
  // Buttons
  button: {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
    secondary: 'bg-brand-600/10 text-brand-600 hover:bg-brand-600/20',
    outline: 'border-brand-600 text-brand-600 hover:bg-brand-600/10',
  },
  
  // Modals
  modal: {
    header: 'bg-gradient-to-r from-brand-600 to-brand-700',
  },
  
  // Focus states
  focus: {
    ring: 'focus:ring-brand-600 focus:border-brand-600',
    border: 'focus:border-brand-600',
  },
  
  // Links
  link: {
    primary: 'text-brand-600 hover:text-brand-700',
  },
  
  // Badges
  badge: {
    primary: 'bg-brand-600/10 text-brand-600 border-brand-600/20',
  },
  
  // Gradients
  gradient: {
    primary: 'from-brand-600 to-brand-700',
    subtle: 'from-danger-50 to-danger-100',
  },
  
  // Spinner/Loading
  loading: {
    spinner: 'border-brand-600',
  },
} as const;

// =============================================================================
// Status Colors (keep these semantic - green/red for success/error)
// =============================================================================

export const STATUS_COLORS = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  error: {
    bg: 'bg-danger-100',
    text: 'text-danger-800',
    border: 'border-danger-200',
    dot: 'bg-danger-500',
  },
  warning: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  info: {
    bg: 'bg-brand-600/10',
    text: 'text-brand-600',
    border: 'border-brand-600/20',
  },
} as const;
