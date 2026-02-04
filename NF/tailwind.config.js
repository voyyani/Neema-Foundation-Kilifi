// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // Safelist brand colors to prevent purging in production
  safelist: [
    'bg-[#B01C2E]',
    'bg-[#8A1624]',
    'bg-[#D42A3F]',
    'bg-[#B01C2E]/5',
    'bg-[#B01C2E]/10',
    'bg-[#B01C2E]/20',
    'text-[#B01C2E]',
    'text-[#8A1624]',
    'border-[#B01C2E]',
    'border-[#B01C2E]/20',
    'hover:bg-[#8A1624]',
    'hover:bg-[#B01C2E]/20',
    'hover:text-[#8A1624]',
    'hover:text-[#B01C2E]',
    'focus:ring-[#B01C2E]',
    'focus:border-[#B01C2E]',
    'from-[#B01C2E]',
    'to-[#8A1624]',
    'to-[#6B111C]',
  ],
  theme: {
    extend: {
      colors: {
        // Neema Foundation Brand Colors
        'neema-maroon': '#B01C2E',
        'neema-maroon-dark': '#8A1624',
        'neema-maroon-light': '#D42A3F',
        'neema-maroon-darker': '#6B111C',
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}