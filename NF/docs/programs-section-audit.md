# Programs Section - High-Level Audit Report
**Neema Foundation Website**  
**Date:** February 3, 2025  
**Status:** 🔴 Critical Issues Identified

---

## Executive Summary

The programs section has **mixed implementation** — the homepage Programs component is successfully using the database, but the dedicated Programs landing page (`/programs`) is still reading from a static TypeScript file. This creates data inconsistencies and prevents the rich database content (objectives, activities, partners) from being displayed.

### Key Findings

✅ **What's Working:**
- `usePublicPrograms` hook exists and is functional
- Homepage Programs.tsx component uses database successfully
- Database contains 6 complete programs with rich metadata
- Admin CMS for programs management is operational
- Data mapping utilities exist for legacy compatibility

🔴 **Critical Issues:**
1. **ProgramsLandingPage.tsx** (631 lines) still imports static data from `/data/programs.ts`
2. **Additional program details not rendering** — database has objectives, activities, partners arrays that aren't displayed
3. **Data duplication** — static file and database contain different versions of program data
4. **No image management** — programs in database have empty cover_image fields
5. **Events integration** — programs have upcomingEvents in static data but not in database schema

---

## Current Architecture

### Component Hierarchy

```
/programs route
└── ProgramsPage.tsx (simple wrapper)
    └── ProgramsLandingPage.tsx ❌ USES STATIC DATA
        ├── ProgramsHero.tsx
        ├── ProgramGrid.tsx
        ├── AdditionalPrograms.tsx
        ├── ProgramModal.tsx
        └── LoadingSpinner / ErrorBoundary

Homepage
└── Landing.tsx
    └── Programs.tsx ✅ USES DATABASE
        ├── ProgramCard components
        └── ProgramDetails (AhohoMission, WidowsEmpowerment)
```

### Data Flow Analysis

**Current (Problematic):**
```typescript
// ProgramsLandingPage.tsx Line 18
import { mainPrograms, additionalPrograms, programsStats } from '../../data/programs';

// Static data used throughout component
const allUpcomingEvents = useMemo(() => {
  return mainPrograms.flatMap(program => 
    (program.upcomingEvents || []).map(event => ({...}))
  )
}, []);
```

**Correct Implementation (Homepage):**
```typescript
// Programs.tsx Line 5
import { usePublicPrograms, usePublicFeaturedPrograms, usePublicSiteSettings } from '../hooks/public';

const { data: allPrograms = [], isLoading: allLoading } = usePublicPrograms({ enabled: !featuredOnly });
const programs = dbPrograms.map(mapProgramToLegacyFormat);
```

---

## Database Schema vs. Static Data

### Database Fields Available (from migration script)
```sql
programs table:
- slug, name, category, summary, description
- objectives (text[]) ← NOT DISPLAYED
- activities (text[]) ← NOT DISPLAYED
- partners (text[]) ← NOT DISPLAYED
- beneficiary_who, beneficiary_where, beneficiary_count
- is_active, is_featured, display_order
- cta_label, cta_href
- cover_image (empty in DB)
- created_at, updated_at
```

### Static File Structure (169 lines)
```typescript
// src/data/programs.ts
interface Program {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  stats: string;
  features: string[]; // Basic list
  images: string[];
  impactMetrics: {
    beneficiaries: number;
    activities: number;
    volunteers: number;
  };
  upcomingEvents?: ProgramEvent[]; // DB doesn't have this
}
```

### Missing Database Features
1. **Program-specific events** — no link between programs and events tables
2. **Impact metrics** — no beneficiaries count, activities count, volunteers count
3. **Gallery images** — programs have `cover_image` but not image arrays
4. **Icons and colors** — UI-specific, need category-to-icon mapping

---

## What's NOT Rendering (User Complaint)

The "additional details" that aren't showing are the rich database fields:

### ❌ Currently Hidden from Users

**1. Objectives** (text array in DB)
- Example: "Provide quality and affordable Healthcare service in Ganze"
- "To nurture a reading culture among the youth in Ganze"

**2. Activities** (text array in DB)
- Example: "Medical camps and outreach"
- "Community library service"
- "Porridge program support"

**3. Partners** (text array in DB)
- Example: "Nourish and Flourish (ICC Mombasa)"
- "CITAM Mission Ministry"
- "Kilifi County Library Services"

**4. Beneficiary Details**
- `beneficiary_who`: "Primary school pupils"
- `beneficiary_where`: "Ganze schools (Misufini, KAG, Boga)"
- `beneficiary_count`: 650

**5. Full Description HTML**
- Database has rich HTML content with headings, lists, paragraphs
- Static file only has 1-2 sentence descriptions

### ✅ What IS Being Displayed (Static Data)
- Program title, subtitle, basic description
- Icon and color (hardcoded in static file)
- Features array (generic list)
- Upcoming events (only in static data)
- Impact metrics (only in static data)

---

## Component-by-Component Analysis

### 1. ProgramsLandingPage.tsx (631 lines)
**Status:** 🔴 Critical - Uses Static Data

**Current Implementation:**
```typescript
// Line 18: Static import
import { mainPrograms, additionalPrograms, programsStats } from '../../data/programs';

// Line 39-43: Fake loading state
useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 1500);
  return () => clearTimeout(timer);
}, []);

// Line 51-57: Static event aggregation
const allUpcomingEvents = useMemo(() => {
  return mainPrograms.flatMap(program => 
    (program.upcomingEvents || []).map(event => ({
      ...event,
      program: program.title,
      programId: program.id,
      programColor: program.color
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}, []);
```

**What Needs to Change:**
1. Remove static data import
2. Add `usePublicPrograms()` hook
3. Add `usePublicEvents()` hook for events tab
4. Remove fake loading, use actual React Query loading state
5. Update impact metrics calculation to use database data
6. Pass database programs to AdditionalPrograms component

### 2. AdditionalPrograms.tsx (101 lines)
**Status:** ⚠️ Functional but no data

**Current Props:**
```typescript
interface AdditionalProgramsProps {
  programs: Array<{
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    status: 'active' | 'planning' | 'paused';
    launchDate: string;
  }>;
  onSelectProgram: (programId: string) => void;
}
```

**Issue:** 
- Component structure is perfect
- Parent (ProgramsLandingPage) passes `additionalPrograms` from static file
- Static file has limited data (name, description, status)
- Database has ALL programs but not being passed

**Fix:** 
- Filter featured programs from database (is_featured = false)
- Map to expected prop format
- Add category-to-icon mapping

### 3. ProgramModal.tsx
**Status:** ⚠️ Needs database integration

- Currently receives program ID and loads from static data
- Should receive full program object from database
- Needs to display objectives, activities, partners
- Needs rich description HTML rendering

### 4. Programs.tsx (Homepage) 
**Status:** ✅ Working Correctly

```typescript
const { data: allPrograms = [], isLoading: allLoading } = usePublicPrograms({ enabled: !featuredOnly });
const { data: featuredPrograms = [], isLoading: featuredLoading } = usePublicFeaturedPrograms({ enabled: featuredOnly });
const programs = dbPrograms.map(mapProgramToLegacyFormat);
```

This component can serve as the reference implementation for ProgramsLandingPage.

---

## Data Inconsistencies

### Static File Programs (6 programs)
1. **Ahoho Mission** — Full details with events, metrics, images
2. **Neema Health Center** — Full details
3. **Resource Center** — Full details
4. **Widows Empowerment** — Full details
5. **Sports Development** — Basic info (not in DB)
6. **Agricultural Training** — Basic info (not in DB)
7. **Youth Mentorship** — Basic info (not in DB)
8. **Community Health** — Basic info (not in DB)

### Database Programs (6 programs)
1. **Neema Health Center** ✅ Matches
2. **Neema Resource Center** ✅ Matches
3. **Ahoho naMarye Mashome** ✅ Matches (different name)
4. **Widow Fellowship & Empowerment** ✅ Matches
5. **Shomani Book Club** ❌ Not in static file
6. **NF Cup** ❌ Not in static file

**Key Issue:** Static file has 8 programs (4 real + 4 placeholder), database has 6 real programs. Names don't match exactly.

---

## Migration Readiness

### ✅ Already Available
- `usePublicPrograms.ts` hook (118 lines) with 3 functions:
  - `usePublicPrograms()` — all active programs
  - `usePublicFeaturedPrograms()` — featured only
  - `usePublicProgram(slug)` — single program by slug
- `mapProgramToLegacyFormat()` utility for backward compatibility
- Database populated with 6 complete programs
- Admin CMS for managing programs

### ⚠️ Needs Creation
- Category-to-icon mapping utility
- Category-to-color mapping utility (exists in dataMapper but needs expansion)
- Program-event relationship (database schema extension)
- Image upload management (cover_image is empty in DB)
- Impact metrics aggregation query

### 🔴 Blocking Issues
1. **Events not linked to programs** — static file has `upcomingEvents` array per program, database doesn't
2. **Images not uploaded** — all `cover_image` fields are empty strings in DB
3. **Legacy component dependencies** — ProgramModal, ProgramDetails components expect old format

---

## Performance Analysis

### Current (Static Data)
- **Initial Load:** Instant (data bundled in JS)
- **Data Freshness:** Requires code deployment to update
- **Cache:** Browser cache only
- **Admin Changes:** Not reflected until redeployment

### After Migration (Database)
- **Initial Load:** ~200-500ms (React Query cache)
- **Data Freshness:** 5 minutes (stale time)
- **Cache:** React Query + Browser + CDN
- **Admin Changes:** Live within 5 minutes
- **SEO:** Better (can implement SSR/SSG with fresh data)

---

## Risk Assessment

### High Risk
1. **Breaking Change** — ProgramModal and ProgramDetails components expect static data format
2. **Image URLs** — Static file has placeholder images, database fields empty
3. **Events Tab** — Relies on program.upcomingEvents which doesn't exist in database
4. **Icon Dependencies** — Static file imports Lucide icons directly, database just has category string

### Medium Risk
1. **Data Mapping Errors** — Legacy format mapper might not cover all use cases
2. **Loading States** — Need to ensure smooth UX during database queries
3. **Error Handling** — What happens if database query fails?

### Low Risk
1. **Performance** — React Query caching mitigates database query overhead
2. **Type Safety** — TypeScript interfaces already defined for PublicProgram

---

## Recommended Action Plan

### Phase 1: Immediate Fixes (2-4 hours)
1. ✅ Update ProgramsLandingPage to use `usePublicPrograms()`
2. ✅ Remove static data import
3. ✅ Connect AdditionalPrograms to database
4. ✅ Add objectives/activities/partners display in ProgramModal
5. ✅ Test loading and error states

### Phase 2: Enhanced Features (4-6 hours)
1. Create program-events relationship in database
2. Migrate events from static file to database (link via program_id)
3. Upload program images and populate cover_image fields
4. Add impact metrics aggregation
5. Implement filtering by category

### Phase 3: World-Class Features (8-12 hours)
1. Advanced search and filtering UI
2. Program comparison tool
3. Interactive impact dashboard
4. Volunteer sign-up integration per program
5. Donation allocation by program
6. Social sharing for programs
7. Calendar integration for events

See `programs-section-roadmap.md` for detailed implementation plan.

---

## Testing Checklist

### Before Migration
- [ ] Verify all 6 programs in database have complete data
- [ ] Check database RLS policies allow public read access
- [ ] Test usePublicPrograms hook in isolation
- [ ] Confirm mapProgramToLegacyFormat handles all fields

### After Migration  
- [ ] Programs load from database on /programs page
- [ ] Featured programs display correctly
- [ ] Additional programs section renders
- [ ] Modal shows objectives, activities, partners
- [ ] Beneficiary details visible
- [ ] Loading states work smoothly
- [ ] Error states handled gracefully
- [ ] No console errors or warnings
- [ ] Mobile responsive layout maintained
- [ ] Admin panel program edits reflect on site

---

## Conclusion

The programs section is **partially implemented** — the foundation is solid with the database schema and hooks already in place, but the main Programs landing page hasn't been migrated yet. The fix is straightforward: replace static imports with database hooks and map the data correctly.

**Estimated Effort:** 2-4 hours for Phase 1 (critical fixes)  
**Complexity:** Medium (legacy format mapping required)  
**Impact:** High (displays rich program details, enables live updates)

The "additional details" user mentioned are **objectives, activities, partners, and beneficiary information** — all present in the database but not displayed because the component is reading from the static file instead.
