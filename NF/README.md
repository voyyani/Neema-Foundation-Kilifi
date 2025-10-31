# Neema Foundation Kilifi — Web App (React + TypeScript + Tailwind)

![Neema Foundation Logo](https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png)

A modern, performant website for Neema Foundation Kilifi that drives donations, volunteering, and partnerships while communicating impact with clarity and compassion.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=000)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=fff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=fff)](https://reactrouter.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-0055FF?style=for-the-badge&logo=framer&logoColor=fff)](https://www.framer.com/motion/)
[![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?style=for-the-badge&logo=threedotjs&logoColor=fff)](https://threejs.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=for-the-badge&logo=eslint&logoColor=fff)](https://eslint.org/)

> This repository lives at `NF/` and uses Vite + React 18/19 API compatibility, TypeScript, and Tailwind 3.4.

## 🔗 Links

- Production: (add URL once deployed on Vercel)  
- Preview deployments: via Vercel (auto-created on PRs)

> Update `vercel.json` and project settings to match your domain.

## ✨ Features

- Smooth-scroll navigation with a11y fallbacks
- Animated hero (Three.js) with reduced-motion support
- Framer Motion animations for entrances, counters, and interactions
- Interactive Programs section with program detail subcomponents
- Impact metrics with animated counters
- Stories, Events teasers, and Trust Bar
- Donation pathways + Bank details page with copy/print support (MVP)
- Volunteer and Partnership pages (forms + email integration, planned)
- Fully responsive, mobile-first design

See the detailed PRD at `docs/PRD.md`.

## 🧰 Tech Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS 3.4
- React Router 7
- Framer Motion 12
- Three.js 0.180
- ESLint 9, TypeScript ESLint

## 📦 Scripts

These map to `package.json`:

```bash
# start dev server (http://localhost:5173)
npm run dev

# type-check + build for production
npm run build

# preview production build (http://localhost:4173)
npm run preview

# lint the codebase
npm run lint
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+ (or 20+ recommended)
- npm (or pnpm/yarn)

### Install

```bash
npm install
```

### Run

```bash
npm run dev
# open http://localhost:5173
```

### Build & Preview

```bash
npm run build
npm run preview
```

## 🗂️ Project Structure

```
NF/
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ vite.config.ts
├─ docs/
│  └─ PRD.md
├─ public/
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ index.css
│  ├─ components/
│  │  ├─ Navbar.tsx
│  │  ├─ Hero.tsx
│  │  ├─ TrustBar.tsx
│  │  ├─ Impact.tsx
│  │  ├─ Programs.tsx
│  │  ├─ Stories.tsx
│  │  ├─ Events.tsx
│  │  ├─ Mission.tsx
│  │  ├─ Problem.tsx
│  │  ├─ Action.tsx
│  │  ├─ Contact.tsx
│  │  └─ Footer.tsx
│  ├─ components/programs/
│  │  ├─ AhohoMission.tsx
│  │  └─ WidowsEmpowerment.tsx
│  └─ pages/
│     ├─ Landing.tsx
│     ├─ Donate.tsx
│     ├─ BankDetails.tsx
│     ├─ Sponsorship.tsx
│     ├─ Volunteer.tsx
│     ├─ Partnership.tsx
│     ├─ LegacyGiving.tsx
│     ├─ Board.tsx
│     ├─ Maintenance.tsx
│     └─ NotFound.tsx
```

## ⚙️ Configuration

Environment variables (optional; see PRD for details):

```env
# Site
VITE_SITE_URL=

# Email integration (if using EmailJS)
VITE_EMAIL_SERVICE_ID=
VITE_EMAIL_TEMPLATE_ID=
VITE_EMAIL_PUBLIC_KEY=

# Analytics (optional)
VITE_ANALYTICS_ID=
```

Tailwind version is pinned to 3.4 and configured via `tailwind.config.js`. Vite dev server runs on port `5173` (preview `4173`).

## 🧭 Architecture Notes

- Routing via React Router; consider route-based code splitting with `React.lazy`
- Animations via Framer Motion with `prefers-reduced-motion` fallbacks
- Hero visuals with Three.js; provide static fallback for older/low-power devices
- Content: initially static via `src/content/*` and typed via `src/types/*` (see PRD)

## ♿ Accessibility & ✅ Quality

- WCAG 2.1 AA target: keyboard nav, visible focus, semantic landmarks
- Color contrast ≥ 4.5:1; respect `prefers-reduced-motion`
- Forms: labelled inputs, ARIA-live errors, proper roles
- Run Lighthouse and axe checks before release

## ⚡ Performance & SEO

- Budgets: JS ≤ 180KB (gz), CSS ≤ 50KB (gz) on initial route
- Optimize images (WebP/AVIF, `srcset`, `sizes`); lazy-load below-the-fold
- Defer non-critical scripts; avoid large dependencies on the landing route
- Add per-route `<title>` and meta; include Organization JSON-LD

## 🌐 Deployment (Vercel)

- Connect repo to Vercel; set framework to Vite
- Inject `VITE_*` env vars in Vercel Project Settings
- Preview deployments on PRs; protect production with checks

## 🤝 Contributing

1. Create a feature branch
2. Make changes with tests/validation where applicable
3. Run `npm run lint` and ensure type-checks pass
4. Open a Pull Request with a clear description and screenshots

## 🔒 License & Ownership

Copyright (c) Neema Foundation Kilifi. All rights reserved.

## 📬 Contact

- Website: neemafoundationkilifi.org  
- Email: neemafoundationkilifi@gmail.com      


<div align="center">

Compassion in action. Transforming communities in Kilifi through healthcare, education, and empowerment.

</div>