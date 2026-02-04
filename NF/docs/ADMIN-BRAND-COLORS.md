# Admin Portal Brand Colors Update

## Brand Colors Applied

The admin portal has been updated to use Neema Foundation's brand colors consistently across all components.

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Maroon** | `#B01C2E` | Main buttons, headers, gradients, links |
| **Primary Dark** | `#8A1624` | Hover states, secondary gradient |
| **Primary Darker** | `#6B111C` | Deep accents |
| **Primary Light** | `#D42A3F` | Avatar backgrounds |

### Components Updated

#### Layout
- ✅ **Sidebar** - Brand gradient background with NF logo
- ✅ **Header** - User avatar with brand gradient

#### Pages
- ✅ **Admin Login** - Form inputs, buttons
- ✅ **Admin Dashboard** - Stats, buttons
- ✅ **Users Management** - Modals, buttons, badges
- ✅ **Events Pages** - All form inputs and buttons
- ✅ **Content Pages** - Programs, Stories, Board, Impact, Hero slides
- ✅ **Site Settings** - All inputs and save button
- ✅ **Forgot/Reset Password** - Form styling

#### Components
- ✅ **EventForm** - All inputs and submit button
- ✅ **RichMediaInput** - Video icons, focus states

### CSS Classes Migration

| Old Class | New Class |
|-----------|-----------|
| `bg-blue-600` | `bg-[#B01C2E]` |
| `hover:bg-blue-700` | `hover:bg-[#8A1624]` |
| `focus:ring-blue-500` | `focus:ring-[#B01C2E]` |
| `text-blue-600` | `text-[#B01C2E]` |
| `hover:text-blue-700` | `hover:text-[#8A1624]` |
| `bg-blue-100` | `bg-[#B01C2E]/10` |
| `from-blue-600 to-blue-800` | `from-[#B01C2E] to-[#8A1624]` |

### Theme Configuration

A centralized theme file was created at [src/admin/config/theme.ts](../src/admin/config/theme.ts) containing:
- Brand color definitions
- Logo URL constant
- Theme class mappings
- Status colors (kept semantic: green/red for success/error)

### Tailwind Safelist

The following brand classes were added to `tailwind.config.js` safelist to ensure they aren't purged in production:

```js
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
]
```

### Logo

The NF logo is now displayed in the admin sidebar:
- URL: `https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png`
- Size: 40x40px with white background and rounded corners

---

*Updated: February 4, 2026*
