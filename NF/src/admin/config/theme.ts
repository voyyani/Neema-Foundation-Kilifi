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
 * Replace: bg-blue-600 → bg-[#B01C2E], hover:bg-blue-700 → hover:bg-[#8A1624]
 */
export const THEME_CLASSES = {
  // Sidebar
  sidebar: {
    bg: 'bg-gradient-to-b from-[#B01C2E] to-[#8A1624]',
    navActive: 'bg-[#8A1624] text-white',
    navInactive: 'text-red-100 hover:text-white hover:bg-[#8A1624]',
    navIcon: 'text-red-200 group-hover:text-white',
    userBg: 'bg-[#8A1624]/50',
    userAvatar: 'bg-[#D42A3F]',
    textMuted: 'text-red-200',
  },
  
  // Buttons
  button: {
    primary: 'bg-[#B01C2E] hover:bg-[#8A1624] text-white',
    secondary: 'bg-[#B01C2E]/10 text-[#B01C2E] hover:bg-[#B01C2E]/20',
    outline: 'border-[#B01C2E] text-[#B01C2E] hover:bg-[#B01C2E]/10',
  },
  
  // Modals
  modal: {
    header: 'bg-gradient-to-r from-[#B01C2E] to-[#8A1624]',
  },
  
  // Focus states
  focus: {
    ring: 'focus:ring-[#B01C2E] focus:border-[#B01C2E]',
    border: 'focus:border-[#B01C2E]',
  },
  
  // Links
  link: {
    primary: 'text-[#B01C2E] hover:text-[#8A1624]',
  },
  
  // Badges
  badge: {
    primary: 'bg-[#B01C2E]/10 text-[#B01C2E] border-[#B01C2E]/20',
  },
  
  // Gradients
  gradient: {
    primary: 'from-[#B01C2E] to-[#8A1624]',
    subtle: 'from-red-50 to-red-100',
  },
  
  // Spinner/Loading
  loading: {
    spinner: 'border-[#B01C2E]',
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
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  info: {
    bg: 'bg-[#B01C2E]/10',
    text: 'text-[#B01C2E]',
    border: 'border-[#B01C2E]/20',
  },
} as const;
