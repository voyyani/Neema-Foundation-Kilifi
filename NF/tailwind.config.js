// tailwind.config.js — the single colour/type authority for the site.
//
// The brand is the maroon scale (#B01C2E / #8A1624 / #D42A3F / #6B111C); it is
// expressed as `brand-50…950` and every accent, control and hover derives from
// it. Neutrals are split into `surface` (what things sit on), `content`
// (ink) and `border` (rules). Semantic scales carry status only.
//
// Contrast on every documented foreground/background pair is verified by
// `node scripts/design/contrast.mjs` (WCAG 2.2 AA); see DESIGN.md.

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF2F3',
          100: '#FBE0E3',
          200: '#F6BFC5',
          300: '#EE8E99',
          400: '#E25A6B',
          500: '#D42A3F', // brand light
          600: '#B01C2E', // brand primary
          700: '#8A1624', // brand dark
          800: '#6B111C', // brand darker
          900: '#4E0C14',
          950: '#2A0609',
          DEFAULT: '#B01C2E',
        },
        // What things sit on. `paper` is the exercise-book page, `board` the
        // classroom chalkboard; both are real materials in the world, not moods.
        surface: {
          DEFAULT: '#FFFFFF',
          paper: '#FCFBF8',
          'paper-2': '#F4F2ED',
          'paper-3': '#EBE8E1',
          board: '#1B2622',
          'board-2': '#243330',
          'board-3': '#2E403C',
        },
        // Ink. `content` is the pupil's blue-black pen; `chalk` is what is
        // written on the board.
        content: {
          DEFAULT: '#151A22',
          2: '#3D4451',
          3: '#5F6774', // 5.5:1 on paper — the floor for secondary text
          4: '#8A919C', // decorative only, never running text
          inverse: '#FFFFFF',
          chalk: '#F4F1EA',
          'chalk-2': '#C9C4B8', // secondary text on board, 8.6:1
          'chalk-3': '#9A968C', // metadata on board, 5.0:1
        },
        border: {
          DEFAULT: '#E3E0D9',
          rule: '#CBD7E4', // the blue feint rule of the exercise book
          strong: '#8E8A80', // 3.2:1 on paper — input borders
          ink: '#151A22',
          chalk: 'rgba(244, 241, 234, 0.18)',
        },
        success: {
          50: '#F0FAF3',
          100: '#DCF3E3',
          500: '#22A05A',
          600: '#1B8348',
          700: '#166A3B',
        },
        warning: {
          50: '#FFF8EB',
          100: '#FEEFCB',
          500: '#D9900E',
          600: '#B4740A',
          700: '#8F5C08',
        },
        // Danger is a distinct hue from the brand so an error never reads as
        // a call to action. Admin surfaces map their former `red-*` here.
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Archivo', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Playfair was loaded but never used; `serif` now aliases display so
        // legacy `font-serif` call sites inherit the new voice.
        serif: ['Archivo', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display scale: condensed Archivo caps read larger than Inter at the
        // same size, so the top steps are tighter than Tailwind's defaults.
        'display-xl': ['clamp(2.75rem, 2rem + 4vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['clamp(2.25rem, 1.6rem + 2.8vw, 4rem)', { lineHeight: '0.98', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['clamp(1.75rem, 1.35rem + 1.6vw, 2.75rem)', { lineHeight: '1.02', letterSpacing: '-0.015em', fontWeight: '800' }],
        'display-sm': ['clamp(1.375rem, 1.2rem + 0.8vw, 1.875rem)', { lineHeight: '1.08', letterSpacing: '-0.01em', fontWeight: '700' }],
        // The rubber-stamp label: wide, small, tracked. Never above a heading.
        stamp: ['0.75rem', { lineHeight: '1', letterSpacing: '0.14em', fontWeight: '700' }],
      },
      lineHeight: {
        // Text on ruled ground sits on the lines.
        rule: '30px',
        'rule-2': '60px',
      },
      spacing: {
        // The exercise-book grid: 8mm feint rules ≈ 30px. Vertical rhythm
        // snaps to multiples of `rule` so type sits on the lines.
        rule: '30px',
        'rule-2': '60px',
        'rule-3': '90px',
        'rule-4': '120px',
        // The margin rail: fixed on phones, grows with the page on desktop.
        rail: 'var(--rail)',
      },
      maxWidth: {
        page: '1200px',
        measure: '68ch',
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '10px',
        xl: '14px',
      },
      boxShadow: {
        // Shadows carry an offset and blur: a sheet lifted off the desk.
        sheet: '0 1px 2px rgba(21, 26, 34, 0.06), 0 8px 24px -12px rgba(21, 26, 34, 0.18)',
        'sheet-lg': '0 2px 4px rgba(21, 26, 34, 0.06), 0 24px 48px -20px rgba(21, 26, 34, 0.28)',
        focus: '0 0 0 3px rgba(176, 28, 46, 0.35)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'draw-rail': { from: { transform: 'scaleY(0)' }, to: { transform: 'scaleY(1)' } },
        'tick-in': { from: { clipPath: 'inset(0 100% 0 0)' }, to: { clipPath: 'inset(0 0 0 0)' } },
        'rise-in': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        'draw-rail': 'draw-rail 900ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'tick-in': 'tick-in 450ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both',
        'rise-in': 'rise-in 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
