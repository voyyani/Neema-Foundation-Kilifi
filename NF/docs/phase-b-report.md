# Phase B — Website Content Alignment Report

Date: 2026-01-14

Scope (per roadmap)
- Home: Hero, Mission/Vision, Programs teaser, Impact metrics, Events teaser
- Donate/BankDetails: donation instructions
- Board/Governance: board/staff + organization structure

## What changed

### 1) Content source of truth
- The app now loads content from `/nf-content.json` (served from `public/nf-content.json`).
- A small loader + hook was added:
  - `src/content/nfContent.ts`
  - `src/content/useNFContent.ts`

Outcome: content updates can now be made by editing `public/nf-content.json` (and/or syncing from the root `nf-content.json`).

### 2) Home page alignment
- Re-enabled the previously commented-out homepage sections so they render again:
  - `src/pages/Landing.tsx`
- Updated the following sections to pull canonical copy and/or metrics from content:
  - `src/components/Hero.tsx`
    - Badge/title/subtitle now come from `site.brandName` + `hero.title`/`hero.subtitle`
    - The 3 stat chips now come from `trustBar.items`
  - `src/components/Mission.tsx`
    - Vision + Mission now use `site.vision` and `site.mission`
    - Core values block renders from `site.values`
  - `src/components/Programs.tsx`
    - Header uses `site.brandName`/`site.mission`
    - Program description/stats for Ahoho/Widows are overridden from `programs[]` when matching entries exist
  - `src/components/Impact.tsx`
    - Headline uses `impact.headline`
    - Key animated targets are derived from `impact.metrics` and `programs.length`
  - `src/components/Events.tsx`
    - Events now come from `events[]`
    - If there are no future events, it automatically switches to “Recent Activities” and displays recent highlights

### 3) Donate + Bank Details
- `src/pages/Donate.tsx`
  - Uses `site.brandName` + `site.mission`
  - If `donate.methods` is populated, it renders those methods; otherwise it falls back to the previous static cards
- `src/pages/BankDetails.tsx`
  - Renders bank/mpesa fields from `bankDetails`
  - Keeps copy-to-clipboard behavior and avoids copying placeholder `TBD`

### 4) Governance
- `src/pages/Board.tsx`
  - Board/staff are now driven by `governance.board` and `governance.staff`
  - Removed random placeholder people/images
  - Added an “Organization Structure” block that matches the PPTX org chart roles

## Notes / Known gaps
- If `donate.methods` and `bankDetails` are left blank in `nf-content.json`, Donate/BankDetails will show placeholders or fall back to prior copy.
- Governance profiles still require real names/photos/bios to be filled in `nf-content.json`.

## How to update content going forward
- Edit: `public/nf-content.json`
- Recommended workflow: keep `nf-content.json` (root) as the editable source, then sync it to `public/nf-content.json` before deploying.

## Suggested commit message
- `feat(content): wire home/donate/board pages to nf-content.json`
