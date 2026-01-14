# PPTX → Website Content Roadmap (Neema Foundation)

Date: 2026-01-14

Goal: update the website’s copy, programs, governance info, and events so that the site becomes consistent with the official content in the PPTX decks.

## Inputs (Source of Truth)

- `docs/NF 2024 in a Glance.pptx` (2020–2024 achievements + 2024 events schedule + budgets/funds + partner activities)
- `docs/Neema Ministries 26092020.pptx` (core narrative: about/vision/mission/objectives/values, problem background, location, planned facilities, roadmaps)
- Extracted text artifact: `docs/pptx-extract.json`
- Content schema/template: `docs/data-template.json`

## Key principle

**Do not edit copy in multiple components.**

Instead:
1) Fill a single content file (`nf-content.json` derived from `docs/data-template.json`)
2) Make components read from that file
3) Treat PPTX as the canonical upstream source for facts/numbers

## Roadmap (Phases)

### Phase A — Content inventory + mapping (1–2 days)
- Review `docs/pptx-extract.json` and label slide groups by topic: Mission/Vision, Programs, Governance, Events, Roadmaps, “Where we work”, etc.
- Decide canonical wording for:
  - About statement
  - Vision
  - Mission statement
  - Objectives
  - Core values

Deliverable:
- A filled `nf-content.json` draft (even if some items are `TBD`).

### Phase B — Website content alignment (2–5 days)
- Update these sections to pull from content:
  - Home: Hero, Mission/Vision, Programs teaser, Impact metrics, Events teaser
  - Donate/BankDetails: donation instructions
  - Board/Governance: real board/staff + structure

Deliverable:
- Site content matches PPTX for core narrative and 2024 highlights.

### Phase C — World-class polish (1–2 weeks)
- Add SEO metadata + JSON-LD Organization
- A11y and performance improvements
- Ensure all stats and dates have consistent formatting

Deliverable:
- Lighthouse: high 90s for Performance/A11y/SEO, stable UX.

## PPTX-to-Site Mapping (What changes where)

This section maps slide content to the target web area and the recommended `data-template.json` field(s).

### Deck: Neema Ministries 26092020.pptx

#### About / Vision / Mission / Objectives / Values
- Slides 4–9
  - What it contains:
    - About statement
    - Vision
    - Mission statement
    - Objectives
    - Core values + commitment
  - Website targets:
    - Home → Mission section copy
    - Footer/About snippet (if present)
  - Content fields:
    - `site.mission`, `site.vision`, `site.values`, `site.tagline` (optional)

#### Problem background / context for Ganze
- Slides 10–14 (Problem statement + background + health + education)
  - Website targets:
    - Home → “Problem” section (currently exists as a component)
  - Content fields:
    - Consider adding a `problem` block to `nf-content.json` (or store as a Story if you don’t want schema changes).

#### Where we work + land allocation
- Slides 15–17
  - What it contains:
    - Location: Kilifi County, Ganze
    - Land: 9.25 acres (2 acres resource center, 7 acres health facility)
  - Website targets:
    - Trust bar metrics (Years active / Beneficiaries / Programs / Counties)
    - Programs page “where we work” callout
  - Content fields:
    - `trustBar.items` (Counties served)
    - Potentially a new `site.location` field (or include in hero/mission copy).

#### Neema Health Center + Neema Resource Center
- Slides 20–21
  - Website targets:
    - Programs page and/or Programs section
  - Content fields:
    - Add two entries in `programs[]`:
      - `program-neema-health-center`
      - `program-neema-resource-center`

Suggested program summaries:
- Neema Health Center: Level 3 services list (maternity, curative, lab, dental, counseling, pharmacy, TB/diabetes/hypertension/HIV clinics, antenatal/postnatal, referrals)
- Neema Resource Center: “Shomani Kwa Furaha” (library, study/resource center, innovation hub, conference)

#### Roadmaps (NHC / NRC / Foundation)
- Slides 24–26
  - Website targets:
    - Impact timeline OR a Programs “Roadmap” sub-section
  - Content fields:
    - These can be stored as:
      - `impact` timeline entries (recommended)
      - OR as `programs[].activities` + `programs[].objectives`

#### Governance structure (Org chart)
- Slides 30–31
  - Website targets:
    - Board page (plus a simple “How we’re organized” block)
  - Content fields:
    - `governance.board`, `governance.staff` (names/roles/bios need manual entry)

### Deck: NF 2024 in a Glance.pptx

#### Mission/Vision consistency
- Slide 2 repeats Vision/Mission/Objectives.
  - Action: ensure the website’s Mission component matches this wording exactly.

#### 2020–2024 narrative
- Slides 11–13
  - What it contains:
    - “Birth of online fundraising”
    - Key initiatives per year
  - Website targets:
    - Impact timeline section (best fit)
  - Content fields:
    - Represent as `impact` timeline items or `stories[]`.

#### 2024 roadmap
- Slide 14
  - Website targets:
    - Impact timeline (future vision)
  - Content fields:
    - Timeline entries; also aligns with Programs (Health/Resource center buildout).

#### 2024 schedule + event detail slides
- Slides 15–35
  - What it contains:
    - A calendar schedule
    - Detailed event cards: date, target beneficiaries, partners, description, and sometimes funds/budgets
  - Website targets:
    - Events section (teasers on home)
    - Stories section (each major event can become a story)
    - Programs detail pages (events tied to Ahoho/Widows/Book Club/etc)
  - Content fields:
    - `events[]` (for “calendar” view)
    - `stories[]` (for narrative + photos)
    - `programs[].activities` / `programs[].impact.metrics`

Suggested event entries to create immediately (minimum set)
- Widow children school fee drive (Slide 16)
- Widow AGM and trauma healing (Slide 17)
- Enendeni bible literacy (Slide 18)
- Ahoho Kiruku Secondary mentorship (Slide 19)
- Misufini Primary + porridge program launch (Slide 20)
- NF Cup Back to School edition (Slide 21)
- Enendeni pastors training (Slide 22)
- Widows fellowship June 2024 (Slide 24)
- Shomani Book Club launch (Slide 27)
- Injili Mashinani (Slide 29)
- World Orphans Day (Slide 32)
- Medical mission drug donation (Slide 33)
- Shomani reading camp (Slide 34)

## Editing plan (Where to change website text)

Once `nf-content.json` exists, edits should primarily be:
- Replace hard-coded strings with references to the content file
- Re-enable the homepage sections
- Ensure Programs/Impact/Events are driven by PPTX-derived data

Concretely, the most affected areas are:
- Home sections: Hero, Mission, Programs, Impact, Events, Stories
- Governance: Board page
- Donate/BankDetails: payment instructions (not in PPTX; needs separate source)

## Open questions (to resolve before final copy lock)
1) Should the site present “Neema Health Center” and “Neema Resource Center” as primary programs, and treat Ahoho/Widows/Shomani as initiatives under them?
2) Which metrics are the official public-facing headline metrics (beneficiaries, meals served, # events, # schools)?
3) Which 2024 activities should be highlighted on the homepage vs moved to an “All events” view later?

---

If you want, I can do the next step: generate a first-pass `nf-content.json` populated from the PPTX extraction (leaving unknown fields as `TBD`) and then refactor the site to read from that file.