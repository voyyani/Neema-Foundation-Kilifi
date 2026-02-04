# ⚠️ DATABASE SETUP REQUIRED

## Why Admin Pages Are Loading Slowly

**Root Cause**: The database tables for the new Phase 3 modules don't exist yet.

When your app tries to query these tables:
- `stories`
- `impact_metrics`  
- `board_members`

Supabase either:
1. Returns errors (table doesn't exist)
2. Times out waiting for a response
3. Takes 2-5 seconds per failed query

This makes each admin page feel slow because it's waiting for failed database queries.

## The Solution

You need to execute the schema SQL in your Supabase database.

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `sflwsxrihvzpbrcwhknl`
3. **Open SQL Editor**: Click "SQL Editor" in the left sidebar
4. **Create new query**: Click "+ New Query" button
5. **Copy the schema**: Open `supabase-schema.sql` in this project
6. **Paste and run**: Paste the entire SQL and click "Run"

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

## What Tables Will Be Created

The schema will create these tables:

### Phase 1 & 2 (May already exist)
- ✅ `profiles` - User profiles with roles
- ✅ `events` - Event management

### Phase 3 (Need to be created)
- 🆕 `site_settings` - Brand identity and social links
- 🆕 `hero_slides` - Homepage hero carousel  
- 🆕 `programs` - Foundation programs
- 🆕 `stories` - Success stories and testimonials
- 🆕 `impact_metrics` - Impact statistics
- 🆕 `board_members` - Team and board profiles

## After Running the Schema

Once you've executed the SQL:

1. **Refresh your browser** (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
2. **Admin pages will load instantly** - no more delays
3. **Test each module**:
   - `/admin/content/stories` - Try creating a story
   - `/admin/content/impact` - Add an impact metric
   - `/admin/content/board` - Add a board member
4. **Verify persistence** - Refresh and check data is still there

## Verification

After setup, each content page should:
- ✅ Load in < 500ms
- ✅ Show empty state (no items found)
- ✅ Allow you to create new items
- ✅ Save data successfully

## If You Still Have Issues

1. **Check browser console** for specific errors
2. **Check Supabase logs** in the dashboard
3. **Verify RLS policies** are set correctly
4. **Check environment variables** in `.env.local`

## Current Environment

Your Supabase project:
- **URL**: `https://sflwsxrihvzpbrcwhknl.supabase.co`
- **Project ID**: `sflwsxrihvzpbrcwhknl`

---

**TL;DR**: Run `supabase-schema.sql` in your Supabase SQL Editor to fix the slow loading issue.
