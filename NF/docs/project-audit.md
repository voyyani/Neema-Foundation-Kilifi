# Neema Foundation Kilifi Website — Deep Project Audit

Date: 2026-01-14

This audit focuses on (1) product/content readiness, (2) engineering quality, and (3) a path to “world-class” execution. It is grounded in the current codebase and the two PPTX decks in `docs/`.

## 1) Current State (What’s Actually Shipping)

### App architecture
- Stack: Vite + React + TypeScript + Tailwind + React Router.
- Routes are in `src/App.tsx` (no code splitting yet).
- The homepage route (`/`) renders `src/pages/Landing.tsx`.

### Important note: homepage is partially disabled
In `src/pages/Landing.tsx`, most sections are currently commented out (Programs/Impact/Stories/Action/Events/Contact). This means visitors only see:
- Hero
- TrustBar
- Mission

That is a major “product completeness” gap (and likely why the site feels unfinished even if components exist).

## 2) Strengths

### Product / content
- Clear intent and structure in the PRD (`docs/PRD.md`) including goals, IA, and non-functional targets (performance/a11y/SEO).
- A content intake workflow already exists (`docs/data-template.json` + `docs/README-content-intake.md`). This is a strong foundation for consistent updates.
- The PPTX decks contain substantial authoritative content (vision/mission/objectives, roadmaps, 2024 events), enabling strong storytelling and credibility.

### Engineering
- Modern dependencies and a straightforward deploy path (Vercel).
- Strong component separation (pages vs reusable sections).
- Error boundary exists (GlobalErrorBoundary in `src/App.tsx`).
- Some components show careful UX intent (Framer Motion, reduced motion considerations in README).

## 3) Weaknesses / Gaps

### A) Content-model + maintainability gaps
- Content is largely hard-coded in components (e.g. `Mission.tsx`, `Impact.tsx`, `pages/Donate.tsx`, `pages/Board.tsx`).
- Program data exists in two places with different shapes:
  - `src/components/Programs.tsx` (inline arrays)
  - `src/data/programs.ts` (richer typed objects)
  This duplication will create drift as you update content from the PPTX.

### B) Tailwind dynamic class risk (real production styling issue)
Multiple components build Tailwind class names dynamically, e.g. `bg-${color}-100`, `text-${color}-800`.

Tailwind only generates classes it can statically detect (unless you safelist). With the current `tailwind.config.js`, there is no safelist. This means:
- Those dynamic color styles can silently disappear in production builds.

This is a high-priority quality issue for “world-class” reliability.

### C) Routing mismatch vs PRD
PRD proposes `/partnership`, but the code uses `/partner`.
- That mismatch increases confusion and hurts SEO/bookmark stability.

### D) Placeholder / credibility issues
- `src/pages/Board.tsx` uses random profile images and placeholder bios. This reduces trust.
- Some copy appears inconsistent with the PPTX source of truth (mission/vision wording and the overall program framing).

### E) Performance risk concentration
- `src/components/Hero.tsx` is extremely large and complex (video controls, analytics, streaming quality logic, fullscreen, etc.).
- Heavy logic in the initial route (home) increases risk to LCP/TBT and maintainability.

### F) SEO / metadata
- No obvious per-route metadata management (titles/descriptions/OG tags).
- No JSON-LD schema integration yet (PRD mentions it as a requirement).

### G) Content update workflow not yet integrated
- `docs/data-template.json` exists, but the site does not appear to load a single `nf-content.json` as a source of truth.

## 4) Risks
- **Content drift**: as soon as you start updating from PPTX, the same facts will need changing in multiple components.
- **Production styling regressions**: dynamic Tailwind classes can break in build output.
- **Trust & donor conversion**: placeholder governance info and incomplete homepage reduce donation/partnership intent.

## 5) Path to “World-Class” (Way Forward)

### Phase 0 (1–2 days): “Make it whole”
- Re-enable all key homepage sections in `src/pages/Landing.tsx`.
- Ensure navigation matches PRD (decide `/partner` vs `/partnership`, then standardize).
- Replace placeholder governance content (board) with real data from PPTX (or at minimum remove random images).

### Phase 1 (3–7 days): Single Source of Truth for content
- Create `nf-content.json` based on `docs/data-template.json`.
- Add a minimal content loader module (e.g. `src/content/nf-content.ts`) that exports typed data.
- Refactor components to consume content data rather than hard-coded text.

Outcome: updating website copy becomes editing JSON (or one TS file), not editing multiple components.

### Phase 2 (1–2 weeks): Credibility + storytelling upgrades
- Use the PPTX 2024 schedule/events to populate:
  - Events teasers
  - Stories/case studies
  - Impact metrics/timeline
- Add basic photo governance (real images, consent, alt text).

### Phase 3 (1–2 weeks): Quality bar (a11y/perf/SEO)
- Remove Tailwind dynamic class names OR add an explicit safelist.
- Add route-based metadata (title/description/OG) and Organization JSON-LD.
- Performance pass:
  - reduce initial-route JS work (especially Hero)
  - lazy load non-critical sections
  - enforce image optimization

### Phase 4 (optional): Content operations (CMS)
If the org expects frequent updates:
- Move `nf-content.json` to a headless CMS or a Git-based content workflow.
- Keep the “content schema” identical to the template to prevent breaking changes.

## 6) Immediate Recommendations (Most Impactful)
1. Standardize content into `nf-content.json` and refactor components to read it.
2. Fix Tailwind dynamic class generation risk.
3. Replace placeholder governance data with PPTX-derived facts.
4. Re-enable homepage sections once content is aligned.

---

Supporting artifact: `docs/pptx-extract.json` (machine-extracted slide text from both PPTX decks).
