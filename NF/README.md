# Neema Foundation — Web Application

![Neema Foundation Logo](https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png)

*A world-class web platform empowering Neema Foundation to scale impact across Kilifi County through digital innovation, transparency, and community engagement.*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3.0-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

## 🚀 Overview

The Neema Foundation web application is a comprehensive digital platform designed to streamline operations, enhance donor engagement, and amplify impact for community development initiatives in Kilifi, Kenya. Built with modern web technologies and a mobile-first approach, it serves as the digital backbone for the foundation's humanitarian work.

**Live Demo:** [https://neema-foundation.vercel.app](https://neemafoundationkilifi.org)  
**Staging:** [https://staging.neema-foundation.vercel.app](neema-foundation-kilifi.vercel.app)

## ✨ Key Features

### 🎯 Core Capabilities
- **💝 Smart Donation Engine** - Multi-currency support with M-Pesa, Stripe, and mobile money integration
- **🤝 Volunteer Management** - Complete lifecycle from signup to assignment and impact tracking
- **👥 Beneficiary Case Management** - Secure, privacy-focused record keeping with offline capabilities
- **📊 Real-time Impact Dashboard** - Transparent reporting for donors and stakeholders
- **🌍 Multi-language Support** - English & Kiswahili with right-to-left text readiness

### 🛠️ Operational Excellence
- **Role-based Access Control** - Granular permissions for staff, volunteers, and partners
- **Event & Program Management** - End-to-end event lifecycle with automated communications
- **SMS/WhatsApp Integration** - Africa's Talking gateway for low-bandwidth communities
- **Progressive Web App** - Offline functionality for field workers in remote areas

## 🏗️ Architecture

```mermaid
graph TB
    A[Frontend - Next.js 14] --> B[API Layer - Next.js API Routes]
    B --> C[Database - PostgreSQL]
    B --> D[Auth - Supabase]
    B --> E[Storage - Cloudflare R2]
    
    F[Payment Providers] --> B
    F --> G[M-Pesa Daraja]
    F --> H[Stripe]
    
    I[Communication] --> B
    I --> J[Africa's Talking]
    I --> K[Resend]
    
    A --> L[CDN - Vercel Edge]
    
    style A fill:#000,color:#fff
    style C fill:#336791,color:#fff
    style D fill:#3ECF8E,color:#fff
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or later  
- PostgreSQL 14+  
- Supabase account  
- M-Pesa Daraja API credentials (for Kenyan payments)

### Installation

```bash
git clone https://github.com/neema-foundation/web-app.git
cd neema-foundation-web
npm install
# or
yarn install
```

### Environment setup

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/neema_db"
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Payments
MPESA_CONSUMER_KEY="your-mpesa-consumer-key"
MPESA_CONSUMER_SECRET="your-mpesa-consumer-secret"
STRIPE_SECRET_KEY="sk_test_..."

# Communications
AFRICAS_TALKING_API_KEY="your-at-api-key"
RESEND_API_KEY="your-resend-api-key"
```

### Database setup

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Run development server

```bash
npm run dev
# or
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
neema-foundation-web/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── admin/
│   ├── api/
│   └── [locale]/
├── components/
│   ├── ui/
│   ├── forms/
│   └── layout/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── validations/
├── locales/
├── public/
├── types/
└── storage/
```

## 🧩 Tech Stack

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui  
**Backend:** Node.js, PostgreSQL, Prisma, Supabase Auth  
**Payments:** M-Pesa Daraja API, Stripe, PayPal  
**Hosting:** Vercel + Railway  
**Monitoring:** Sentry, Vercel Analytics  
**Testing:** Playwright, Vitest

## 🔐 Security Features

- ✅ Row Level Security (RLS)
- ✅ PII encryption (pgcrypto)
- ✅ CSP & rate limiting
- ✅ 2FA for admins

## 🌐 Deployment

Automatically deployed to Vercel on `main` branch merge.

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Push & open a Pull Request

## 📞 Support

**Maintainer:** Neema Foundation Tech Team  
**Email:** security@neemafoundation.org  
**Docs:** GitHub Wiki

<div align="center">

**Empowering communities through technology and compassion**  
Neema Foundation — Building a better future for Kilifi, one life at a time

🌐 Website • 💌 Contact • 🐦 Twitter

</div>