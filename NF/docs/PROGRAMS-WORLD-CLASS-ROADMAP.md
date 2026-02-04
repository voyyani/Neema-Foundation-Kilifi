# Programs Section: World-Class Execution Roadmap

> **Goal:** Transform the programs section into a compelling, donor-attracting, volunteer-inspiring showcase that creates awareness and drives action.

---

## 📊 Current State Analysis

### ✅ What's Working
- Supabase database schema with CRUD operations (`usePrograms` admin hook)
- Public hooks for fetching programs (`usePublicPrograms`, `usePublicFeaturedPrograms`)
- Data mapper to convert DB format to legacy UI format
- Programs page (ProgramsLandingPage) with tabs for Programs/Events/Impact
- Basic modal infrastructure (`ProgramModal` component)
- Featured/Active toggle in admin

### ❌ Critical Issues Identified

| Issue | Location | Impact |
|-------|----------|--------|
| **Modal doesn't open on Landing page** | `Programs.tsx` (lines 59-67) | `renderProgramModal()` only handles 2 hardcoded IDs (`ahoho-mission`, `widows-empowerment`), returns `null` for others |
| **Raw HTML tags in modal content** | `fullDescription` field | Description stored with `<h1>`, `<h2>` tags renders as text, not HTML |
| **Inconsistent modal logic** | `Programs.tsx` vs `ProgramsLandingPage.tsx` | Landing page passes program ID (string), Programs page passes program object |
| **Hardcoded program details** | `AhohoMission.tsx`, `WidowsEmpowerment.tsx` | Defeats purpose of CMS - data should come from DB |
| **Missing media gallery support** | DB schema | Only `cover_image` field, no multiple images support |
| **No rich text/markdown support** | DB and UI | Plain text descriptions limit storytelling |
| **Missing volunteer opportunities in DB** | Schema gap | Empty array in mapper |
| **No donation goals in DB** | Schema gap | Important for donor engagement |

---

## 🎯 Phase 1: Critical Bug Fixes (Days 1-2)

### 1.1 Fix Landing Page Modal Not Opening

**Problem:** `renderProgramModal()` in `Programs.tsx` uses a switch statement with only 2 cases.

**Solution:** Replace hardcoded switch with the same `ProgramModal` component used in `ProgramsLandingPage`.

```tsx
// In Programs.tsx - REPLACE the custom modal logic
// Use ProgramModal like ProgramsLandingPage does

// Change state from string to object
const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

// Change openProgramModal to pass the full program object
const openProgramModal = (program: any) => {
  setSelectedProgram(program);
  document.body.style.overflow = 'hidden';
};

// Use ProgramModal component instead of custom renderProgramModal
<AnimatePresence>
  {selectedProgram && (
    <ProgramModal
      program={selectedProgram}
      onClose={closeProgramModal}
    />
  )}
</AnimatePresence>
```

### 1.2 Fix HTML Tags Rendering as Text

**Problem:** `fullDescription` contains raw HTML like `<h1>`, `<h2>`.

**Solution Options:**
1. **Option A (Quick):** Use `dangerouslySetInnerHTML` with sanitization
2. **Option B (Better):** Switch to Markdown with `react-markdown`
3. **Option C (Best):** Use a rich text editor (Tiptap/Lexical) in admin

**Immediate Fix (Option A):**
```tsx
import DOMPurify from 'dompurify';

// In DefaultProgramView
<div 
  className="prose prose-lg max-w-none"
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(program.fullDescription || program.description) 
  }}
/>
```

### 1.3 Standardize Modal Data Flow

Ensure both `Programs.tsx` and `ProgramsLandingPage.tsx` pass the **full mapped program object** to `ProgramModal`, not just an ID.

---

## 🎨 Phase 2: Enhanced Modal Experience (Days 3-5)

### 2.1 Create Universal Program Modal

Replace `DefaultProgramView` with a world-class modal design:

```
┌─────────────────────────────────────────────────────────┐
│  [Header: Icon + Title + Status Badge]           [X]    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │        HERO IMAGE / VIDEO / GALLERY              │   │
│  │           with navigation arrows                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Beneficiaries │  │   Location   │  │   Duration   │  │
│  │    650+       │  │    Ganze     │  │   Ongoing    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ═══════════════════════════════════════════════════   │
│  📖 ABOUT THIS PROGRAM                                  │
│  [Rich formatted description with proper headings]      │
│                                                         │
│  🎯 OBJECTIVES              📋 ACTIVITIES               │
│  ✓ Objective 1              • Activity 1                │
│  ✓ Objective 2              • Activity 2                │
│                                                         │
│  💰 FUNDING PROGRESS                                    │
│  ████████████░░░░░░░░ 72% of $50,000                   │
│                                                         │
│  🤝 PARTNERS                                            │
│  [Partner Logo] [Partner Logo] [Partner Logo]           │
│                                                         │
│  📅 UPCOMING EVENTS                                     │
│  ┌────────────────────────────────────────────────┐    │
│  │ Medical Camp - March 15, 2026 | Ganze          │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ═══════════════════════════════════════════════════   │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   💖 DONATE NOW     │  │  🙋 VOLUNTEER       │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
│  [Share: Facebook] [Twitter] [WhatsApp] [Copy Link]    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Modal Component Features

- **Responsive design** - Full screen on mobile, centered modal on desktop
- **Image gallery** with swipe support (already partially there)
- **Smooth animations** with Framer Motion
- **Keyboard navigation** - ESC to close, arrow keys for images
- **Share functionality** - Social media + copy link
- **Video embed support** - YouTube/Vimeo integration
- **Testimonial slider** - Stories from beneficiaries

---

## 🗄️ Phase 3: Database Schema Enhancements (Days 6-8)

### 3.1 New Migration: Enhanced Programs Table

```sql
-- migrations/enhance-programs-schema.sql

-- Add media gallery support
ALTER TABLE programs ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
ALTER TABLE programs ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;

-- Add donation/funding fields
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_goal NUMERIC(12,2);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_current NUMERIC(12,2) DEFAULT 0;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_currency TEXT DEFAULT 'KES';
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_deadline DATE;

-- Add volunteer opportunities
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_opportunities TEXT[];
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_slots INTEGER;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_skills_needed TEXT[];

-- Add content fields
ALTER TABLE programs ADD COLUMN IF NOT EXISTS impact_statement TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]';
-- testimonials format: [{ "name": "Jane", "quote": "...", "image": "url", "role": "Beneficiary" }]

-- Add SEO and sharing
ALTER TABLE programs ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS social_image TEXT;

-- Add scheduling
ALTER TABLE programs ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS end_date DATE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(is_featured) WHERE is_featured = true;
```

### 3.2 Create Program Images Table (One-to-Many)

```sql
-- migrations/add-program-images.sql

CREATE TABLE program_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE program_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view program images" ON program_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM programs WHERE id = program_id AND is_active = true)
  );

CREATE POLICY "Editors can manage program images" ON program_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );
```

### 3.3 Link Events to Programs

Events table already has `program_id` - ensure it's populated and used.

---

## 🔧 Phase 4: Update Data Layer (Days 9-11)

### 4.1 Update PublicProgram Type

```typescript
// hooks/public/usePublicPrograms.ts

export interface PublicProgram {
  // Existing fields...
  
  // New media fields
  gallery_images?: string[];
  video_url?: string;
  video_thumbnail?: string;
  
  // Donation fields
  donation_goal?: number;
  donation_current?: number;
  donation_currency?: string;
  donation_deadline?: string;
  
  // Volunteer fields
  volunteer_opportunities?: string[];
  volunteer_slots?: number;
  volunteer_skills_needed?: string[];
  
  // Content fields
  impact_statement?: string;
  testimonials?: Array<{
    name: string;
    quote: string;
    image?: string;
    role?: string;
  }>;
  
  // Dates
  start_date?: string;
  end_date?: string;
}
```

### 4.2 Update Data Mapper

```typescript
// lib/dataMappers.ts

export function mapProgramToLegacyFormat(program: PublicProgram) {
  return {
    // Existing mappings...
    
    // Enhanced images - combine cover + gallery
    images: [
      program.cover_image,
      ...(program.gallery_images || [])
    ].filter(Boolean) as string[],
    
    // Video
    videoUrl: program.video_url,
    videoThumbnail: program.video_thumbnail,
    
    // Donation goal
    donationGoal: program.donation_goal ? {
      target: program.donation_goal,
      current: program.donation_current || 0,
      currency: program.donation_currency || 'KES',
      deadline: program.donation_deadline || '',
    } : undefined,
    
    // Volunteer opportunities
    volunteerOpportunities: program.volunteer_opportunities || [],
    volunteerSlots: program.volunteer_slots,
    volunteerSkillsNeeded: program.volunteer_skills_needed || [],
    
    // Testimonials
    testimonials: program.testimonials || [],
    
    // Impact
    impactStatement: program.impact_statement,
  };
}
```

### 4.3 Fetch Related Events

```typescript
// hooks/public/usePublicPrograms.ts

export function usePublicProgramWithEvents(slug: string) {
  const programQuery = usePublicProgram(slug);
  
  const eventsQuery = useQuery({
    queryKey: ['public', 'programs', slug, 'events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('program_id', programQuery.data?.id)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5);
      return data || [];
    },
    enabled: !!programQuery.data?.id,
  });
  
  return {
    program: programQuery.data,
    events: eventsQuery.data || [],
    isLoading: programQuery.isLoading || eventsQuery.isLoading,
  };
}
```

---

## 🎨 Phase 5: World-Class UI Components (Days 12-16)

### 5.1 Create New Components

```
src/components/programs/
├── ProgramModal/
│   ├── index.tsx              # Main modal container
│   ├── ProgramHeader.tsx      # Icon, title, status, close btn
│   ├── MediaGallery.tsx       # Image/video gallery with lightbox
│   ├── ImpactStats.tsx        # Beneficiaries, location, duration
│   ├── ProgramContent.tsx     # Rich text description
│   ├── ObjectivesActivities.tsx
│   ├── DonationProgress.tsx   # Progress bar + donate CTA
│   ├── VolunteerSection.tsx   # Opportunities + apply CTA
│   ├── TestimonialsSlider.tsx # Beneficiary stories
│   ├── UpcomingEvents.tsx     # Linked events
│   ├── PartnersGrid.tsx       # Partner logos
│   └── ShareButtons.tsx       # Social sharing
├── ProgramCard/
│   ├── index.tsx              # Refactored card
│   ├── ProgramCardCompact.tsx # For grids
│   └── ProgramCardFeatured.tsx # Hero card style
└── ProgramFilters.tsx         # Category, status filters
```

### 5.2 Rich Text Rendering Component

```tsx
// components/ui/RichContent.tsx
import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface RichContentProps {
  content: string;
  format?: 'html' | 'markdown' | 'plain';
  className?: string;
}

export function RichContent({ content, format = 'html', className = '' }: RichContentProps) {
  const sanitizedHtml = useMemo(() => {
    let html = content;
    
    if (format === 'markdown') {
      html = marked.parse(content) as string;
    }
    
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br', 'blockquote'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  }, [content, format]);
  
  if (format === 'plain') {
    return <p className={className}>{content}</p>;
  }
  
  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
```

### 5.3 Video Embed Component

```tsx
// components/ui/VideoEmbed.tsx
import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  thumbnail?: string;
  title?: string;
}

export function VideoEmbed({ url, thumbnail, title }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const getEmbedUrl = (url: string) => {
    // Handle YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    
    // Handle Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    
    return url;
  };
  
  if (isPlaying) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          src={getEmbedUrl(url)}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  
  return (
    <div 
      className="aspect-video rounded-xl overflow-hidden relative cursor-pointer group"
      onClick={() => setIsPlaying(true)}
    >
      <img 
        src={thumbnail || `https://img.youtube.com/vi/${url.split('v=')[1]}/maxresdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
        <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
          <Play className="h-12 w-12 text-red-800 fill-red-800" />
        </div>
      </div>
    </div>
  );
}
```

---

## 🛠️ Phase 6: Admin CRUD Enhancements (Days 17-20)

### 6.1 Enhanced Program Editor

Update the admin program form to include:

- **Rich text editor** for description (Tiptap recommended)
- **Image gallery uploader** with drag-and-drop reordering
- **Video URL input** with preview
- **Donation goal configuration**
- **Volunteer opportunities manager**
- **Testimonials editor** with image upload
- **SEO fields** (meta title, description, social image)

### 6.2 Admin Program Types Update

```typescript
// admin/types/content.ts

export interface ProgramInput {
  name: string;
  slug?: string;
  category: 'health' | 'education' | 'empowerment' | 'community';
  summary: string;
  description: string; // Now supports HTML/Markdown
  objectives: string[];
  activities: string[];
  partners: string[];
  beneficiary_who?: string;
  beneficiary_where?: string;
  beneficiary_count?: number;
  is_active?: boolean;
  is_featured?: boolean;
  cover_image?: string;
  gallery_images?: string[];
  video_url?: string;
  donation_goal?: number;
  donation_currency?: string;
  donation_deadline?: string;
  volunteer_opportunities?: string[];
  volunteer_slots?: number;
  testimonials?: Array<{
    name: string;
    quote: string;
    image?: string;
    role?: string;
  }>;
  cta_label?: string;
  cta_href?: string;
}
```

---

## 🔗 Phase 7: Donor & Volunteer Conversion (Days 21-25)

### 7.1 Program-Specific Donation Flow

```
[Program Modal] → [Donate to This Program] → [Donation Page with Program Pre-selected]
```

- Pass program ID/slug via URL params or state
- Pre-fill program name in donation form
- Show program-specific impact metrics
- "Your $50 provides 10 meals for children in Ahoho program"

### 7.2 Volunteer Application Flow

```
[Program Modal] → [Volunteer for This Program] → [Volunteer Form with Program Pre-selected]
```

- Filter volunteer form by program
- Show specific skills needed
- Display available slots
- "5 of 20 volunteer slots remaining"

### 7.3 CTAs with Urgency

```tsx
// Donation CTA with urgency
{donationGoal && (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
    <div className="flex items-center gap-2 text-amber-800 mb-2">
      <AlertCircle className="h-5 w-5" />
      <span className="font-semibold">
        Only {daysUntilDeadline} days left to reach our goal!
      </span>
    </div>
    <p className="text-gray-700 mb-4">
      We're {100 - progressPercentage}% away from funding this program for the year.
    </p>
    <Link 
      to={`/donate?program=${program.slug}`}
      className="btn-primary"
    >
      Help Us Reach 100%
    </Link>
  </div>
)}
```

---

## 📱 Phase 8: Mobile Optimization (Days 26-28)

### 8.1 Mobile Modal Experience

- **Full-screen modal** on mobile (no rounded corners at edges)
- **Bottom sheet** style with drag-to-close
- **Swipe gestures** for image gallery
- **Sticky CTAs** at bottom
- **Touch-optimized** buttons (min 44px tap targets)

### 8.2 Performance Optimizations

- **Lazy load images** with blur placeholder
- **Skeleton loading** states
- **Virtual scrolling** for long lists
- **Image optimization** via Cloudinary transforms

---

## 📊 Phase 9: Analytics & Tracking (Days 29-30)

### 9.1 Event Tracking

```typescript
// Track program interactions
const trackProgramView = (programSlug: string) => {
  gtag('event', 'view_program', { program_slug: programSlug });
};

const trackDonationIntent = (programSlug: string) => {
  gtag('event', 'donation_intent', { program_slug: programSlug });
};

const trackVolunteerIntent = (programSlug: string) => {
  gtag('event', 'volunteer_intent', { program_slug: programSlug });
};

const trackShare = (programSlug: string, platform: string) => {
  gtag('event', 'share', { program_slug: programSlug, platform });
};
```

### 9.2 Database Analytics

```sql
-- Track program views
CREATE TABLE program_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  referrer TEXT
);

-- Create view for dashboard
CREATE VIEW program_analytics AS
SELECT 
  p.slug,
  p.name,
  COUNT(pv.id) as total_views,
  COUNT(DISTINCT pv.session_id) as unique_views
FROM programs p
LEFT JOIN program_views pv ON p.id = pv.program_id
GROUP BY p.id;
```

---

## ✅ Implementation Checklist

### Immediate (This Week)
- [ ] Fix landing page modal opening (Programs.tsx)
- [ ] Fix HTML rendering in description
- [ ] Standardize modal data flow
- [ ] Install DOMPurify: `npm install dompurify @types/dompurify`

### Short-term (Next 2 Weeks)
- [ ] Run database migration for new fields
- [ ] Update PublicProgram type and mapper
- [ ] Create RichContent component
- [ ] Create VideoEmbed component
- [ ] Refactor ProgramModal to use DefaultProgramView for all programs

### Medium-term (Next Month)
- [ ] Build image gallery with lightbox
- [ ] Add testimonials slider
- [ ] Implement program-specific donation flow
- [ ] Update admin form with new fields
- [ ] Add rich text editor to admin

### Long-term (Next Quarter)
- [ ] Full mobile optimization
- [ ] Analytics dashboard
- [ ] A/B testing for CTAs
- [ ] Multi-language support
- [ ] Program comparison feature

---

## 🚀 Quick Wins (Do Today)

1. **Fix the modal bug** - Change `renderProgramModal()` to use `ProgramModal` component
2. **Add DOMPurify** - `npm install dompurify @types/dompurify`
3. **Update DefaultProgramView** - Use `dangerouslySetInnerHTML` with sanitization
4. **Test all programs** - Ensure every program opens a modal on both pages

---

## 📚 Dependencies to Add

```bash
# For rich text sanitization
npm install dompurify @types/dompurify

# For markdown support (optional but recommended)
npm install marked @types/marked

# For rich text editor in admin (Phase 6)
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image

# For image lightbox
npm install yet-another-react-lightbox

# For video embedding
npm install react-player
```

---

## 📈 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Modal open rate on landing | 0% (broken) | 100% |
| Program page bounce rate | ? | < 40% |
| Donation conversion from programs | ? | > 5% |
| Volunteer signup from programs | ? | > 3% |
| Time on program modal | ? | > 45 seconds |
| Social shares per program | 0 | > 10/week |

---

*Roadmap created: February 2026*
*Owner: Development Team*
*Review date: Monthly*
