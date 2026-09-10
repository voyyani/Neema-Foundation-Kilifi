# Design Master Plan

**Status:** Draft — current-state audit complete, target direction proposed for review
**Last updated:** 2026-08-29

Related: [ARCHITECTURE.md's known issues](ARCHITECTURE.md#8-known-issues--technical-debt) for where these gaps were first spotted.

---

## 1. Current state — the token system exists and is being ignored

`tailwind.config.js` defines four brand colors (`neema-maroon`, `-dark`,
`-light`, `-darker`) and safelists them explicitly so Tailwind's purger can't
drop them. A `grep` across `src/` for actual usage:

| Color source | Files using it |
|---|---|
| `neema-maroon` Tailwind token (the one defined *for this purpose*) | **0** |
| Hardcoded hex (`#B01C2E`, `#8A1624`, `#D42A3F`, `#6B111C`) inline in `className`/`style` | **126** |
| Tailwind's *default* red palette (`red-600`/`red-700`/`red-800`) used as a stand-in for brand red | **72** |

The token was defined once and never adopted — every component that needed
the brand color reached for either a raw hex literal or Tailwind's unrelated
default red instead. Three visually-similar-but-not-identical reds ship on
the same page (`Navbar.tsx` uses `red-800`, `Hero.tsx` uses `#B01C2E`
directly) with no single place to change the brand color and have it
propagate.

**It gets worse, not better, at the database layer.** `site_settings` has a
`primary_color` column with a full admin UI — `SiteSettingsPage.tsx` renders
a `HexColorPicker` and lets an editor change it. But grepping every
consumer of that field shows it is read in exactly one place: a preview
swatch on the settings page itself (`style={{ backgroundColor:
formData.primary_color }}`). **Nothing on the live public site reads
`site_settings.primary_color` at all.** An admin can "rebrand" the site
through a picker that does nothing — a feature that looks finished and
isn't. This is the single highest-value fix available in this doc: either
wire it up (inject it as a CSS custom property consumed by the token layer
below) or remove the picker so it stops promising a capability that doesn't
exist.

Typography: `font-serif` (mapped to Georgia) is used in only 14 places —
mostly H1s — with no documented rule for *when* serif vs. the default sans
applies, so it reads as occasional rather than deliberate.

`src/index.css` still ships the unmodified Vite starter template (dark
`#242424` background, `#646cff` links) dead alongside the real iOS-inspired
admin rules added later — noted in ARCHITECTURE.md, not repeated here.

## 2. Target direction

Not "clean and modern" — that phrase produces identical output regardless of
who the client is. A direction specific enough that two people implementing
it independently would converge on similar output:

> **Institutional warmth.** The confident, slightly formal trustworthiness of
> an audited annual report — not the disposable brightness of a stock-photo
> charity template. Editorial serif carries emotion (headlines, stories,
> testimonials); a clean grotesque sans carries function (navigation, forms,
> data, admin UI). One maroon, used with total consistency, reads as
> considered; the same maroon smeared across three near-identical hex values
> reads as improvised — which is the actual, current problem, not the color
> choice itself. Photography should read as documentary (real Ganze
> community, real programs) over polished stock — the site's credibility
> argument *is* that the work is real.

This mirrors the principle refero.design's own `DESIGN.md` format is built
around: pick a concrete, describable anchor — not a mood board of adjectives
— so the same direction produces consistent output whether a human or an AI
agent is the one implementing the next component.

## 3. Token table

Colors as they exist today (`tailwind.config.js`), renamed with clearer
roles — this table, once approved, is what every future component should
cite by name instead of a literal hex value:

| Token | Value | Role |
|---|---|---|
| `brand-maroon` | `#B01C2E` | Primary actions, links-on-light, brand accents |
| `brand-maroon-dark` | `#8A1624` | Hover/active states for primary actions |
| `brand-maroon-light` | `#D42A3F` | Accent highlights on dark backgrounds (e.g. hero headline emphasis) |
| `brand-maroon-darker` | `#6B111C` | Gradient endpoints only, never a standalone fill |
| `ink` | `gray-900` (existing Tailwind) | Body text on light backgrounds |
| `ink-muted` | `gray-600` | Secondary text |
| `surface` | `white` | Card/panel backgrounds |
| `surface-sunken` | `gray-50` | Page background, input backgrounds |

Type scale — current H1 sizing (`text-4xl md:text-6xl lg:text-7xl`) is a
reasonable fluid scale; the gap is *rule*, not *scale*:

| Use | Font | Weight | Size (mobile → desktop) |
|---|---|---|---|
| Display / H1 | Georgia (serif) | Bold | `text-4xl` → `text-7xl` |
| Section heading / H2 | Georgia (serif) | Bold | `text-2xl` → `text-4xl` |
| Card title / H3 | System sans | Semibold | `text-lg` → `text-xl` |
| Body | System sans | Regular | `text-base` |
| Label / eyebrow | System sans | Medium, uppercase, tracked | `text-xs` |

**Rule:** serif is reserved for headline-level emotional content (H1/H2,
pull quotes, testimonial names). Everything functional — nav, buttons,
forms, data, admin UI — stays sans. No H3-and-below should ever be serif;
today's occasional serif usage should be audited against this rule rather
than left ambiguous.

Spacing/radii/motion — already fairly consistent in practice, formalized here
so they stay that way: spacing on the standard Tailwind 4px scale; card
radius `rounded-xl`/`rounded-2xl` (12–16px) for panels and modals,
`rounded-full` for pills/avatars; shadow `shadow-lg`/`shadow-2xl` for
elevated surfaces (modals, dropdowns) only — flat elsewhere; motion durations
200–400ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` for the "iOS spring" feel
already established in `index.css` and reused via Framer Motion `transition`
props throughout.

## 4. Component states — audited against what's actually implemented

| Component | Default | Hover | Focus-visible | Disabled | Loading | Error | Empty |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Nav links (`Navbar.tsx`) | ✅ | ✅ | ✅ (ring) | — | — | — | — |
| Primary button (donate CTA) | ✅ | ✅ | ✅ | ❌ not styled | — | — | — |
| `ConfirmDialog` | ✅ | ✅ | — | — | — | — | — |
| Hero video player | ✅ | ✅ (controls) | ✅ | — | ✅ | ✅ (retry + data-saver) | — |
| Admin data hooks (bank details, etc.) | ✅ | — | — | ✅ per-row spinner | ✅ | ✅ (toast) | ❌ not standardized |

Two gaps worth closing deliberately rather than ad hoc: **disabled button
styling** has no defined token (buttons that should be unclickable during a
pending mutation mostly just… stay clickable), and **empty states** across
the admin CRUD screens are inconsistent — some show `EmptyState.tsx`
(it exists, in `admin/components/ui/`), many don't use it.

## 5. Making this portable: a spec an AI session can be pointed at

The token table in §3 is the part that matters for day-to-day work — it's
short enough to paste directly into a prompt. The actual mechanism that
would have prevented the 126-vs-72-vs-0 split in §1 is simple: **before
generating or editing any UI, point the session at this file's token table
first**, the same way `refero.design` frames its own `DESIGN.md` — a small,
literal, machine-readable spec that travels with the repo, rather than a
style relearned from scratch (or re-improvised) every session. Practically:
reference `docs/DESIGN-MASTER-PLAN.md#3-token-table` in this repo's
`CLAUDE.md`/agent instructions once one exists, so it's loaded automatically
rather than something a future session has to remember to ask for.

## 6. Suggested sequencing

Not committing to a timeline — just the order that pays down the most
confusion per unit of effort:

1. Decide the fate of `site_settings.primary_color` (wire it up or remove the
   picker) — currently the most misleading thing in the admin CMS.
2. Introduce the token names from §3 into `tailwind.config.js` (rename
   `neema-maroon` → the clearer roles, or keep the name and just enforce
   usage) and sweep the 126 hardcoded hex + 72 default-red occurrences to
   reference them. Mechanical, high file-count, low risk — good candidate for
   a dedicated pass rather than doing it opportunistically file-by-file.
3. Apply the serif/sans rule from §3 as a lint-able convention (even just a
   comment convention reviewers check for, before reaching for an actual
   ESLint rule).
4. Decompose `Hero.tsx` (flagged in ARCHITECTURE.md) — it's both the worst
   single-responsibility violation and the highest-visibility component to
   demonstrate the new token discipline on.
