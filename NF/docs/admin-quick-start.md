# Admin System Quick Start Guide

This guide helps you set up the Neema Foundation Admin Management System integrated into the existing React app.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free at supabase.com)
- Existing NF project running

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose organization and set:
   - **Project name**: `neema-foundation`
   - **Database password**: (save this securely!)
   - **Region**: Choose closest to Kenya (e.g., Frankfurt)
4. Wait for project to be created (~2 minutes)
5. Note down from Project Settings > API:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon public key**: `eyJhbGc...`

## Step 2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire SQL schema from `docs/admin-system-implementation-plan.md`
4. Click **Run** (or Cmd/Ctrl + Enter)
5. Verify tables created in **Table Editor**

## Step 3: Configure Storage

1. Go to **Storage** in Supabase Dashboard
2. Click "New Bucket"
3. Name: `media`
4. Toggle **Public bucket**: ON
5. Click "Create bucket"
6. Go to **Policies** tab for the bucket
7. Add policy for authenticated uploads:
   - Policy name: `Authenticated users can upload`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `true`

## Step 4: Environment Setup

Create `.env.local` in your project root (`NF/.env.local`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Add `.env.local` to `.gitignore` if not already there.

## Step 5: Install Dependencies

```bash
cd /home/karisa/Projects/Neema-Foundation-Kilifi/NF

# Core Supabase client
npm install @supabase/supabase-js

# Form handling & validation
npm install react-hook-form @hookform/resolvers zod

# Data fetching & caching
npm install @tanstack/react-query

# Data tables
npm install @tanstack/react-table

# Rich text editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder

# Notifications
npm install sonner

# File upload
npm install react-dropzone

# Utilities
npm install clsx
```

Or all in one command:

```bash
npm install @supabase/supabase-js react-hook-form @hookform/resolvers zod @tanstack/react-query @tanstack/react-table @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder sonner react-dropzone clsx
```

## Step 6: Create Supabase Client

Create `src/lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

## Step 7: Create First Admin User

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. Click "Add User" > "Create new user"
3. Enter email and password
4. User will be created with a profile in `profiles` table
5. Go to **Table Editor** > `profiles`
6. Find the new user and edit
7. Change `role` from `viewer` to `super_admin`
8. Save

## Step 8: Verify Setup

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:5173/admin/login`
3. Login with the admin credentials
4. You should see the admin dashboard

## Project Structure (After Setup)

```
src/
├── admin/                    # Admin module
│   ├── components/           # Admin UI components
│   ├── pages/               # Admin pages
│   ├── hooks/               # Data hooks
│   └── lib/                 # Utilities
├── lib/
│   └── supabase/
│       ├── client.ts        # Supabase client
│       └── types.ts         # Database types
├── components/              # Existing public components
├── pages/                   # Existing public pages
└── App.tsx                  # Routes (public + admin)
```

## Key URLs

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Public website |
| `http://localhost:5173/admin/login` | Admin login |
| `http://localhost:5173/admin` | Admin dashboard |
| `https://app.supabase.com` | Supabase Dashboard |

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists in project root
- Check variable names start with `VITE_`
- Restart dev server after creating `.env.local`

### "Invalid API key"
- Double-check the anon key from Supabase dashboard
- Make sure you're using the **anon** key, not the **service_role** key

### Login not working
- Verify user exists in Authentication > Users
- Check the user's profile exists in Table Editor > profiles
- Ensure RLS policies are correctly set up

### Tables not created
- Re-run the SQL schema
- Check for errors in SQL Editor output
- Ensure you have the correct database selected

## Next Steps

1. ✅ Complete Phase 1 from the implementation plan
2. Build the admin layout and authentication
3. Implement event management
4. Continue with content management

## Useful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate Supabase types (optional)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)
- [Tiptap Editor](https://tiptap.dev)
