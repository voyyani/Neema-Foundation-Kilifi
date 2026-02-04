# Programs Page Showing No Data - Troubleshooting Guide

## Issue
The programs page is showing only 2 programs (or no programs) instead of the 6 programs from the database.

## Root Cause
The database needs:
1. RLS (Row Level Security) policy to allow public read access
2. Data migration to populate programs (if not done yet)

## Quick Fix (5 minutes)

### Step 1: Enable Public Access to Programs
Run this SQL in **Supabase SQL Editor**:

```sql
-- Enable RLS and create public read policy
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active programs" ON programs;

CREATE POLICY "Allow public read access to active programs"
ON programs
FOR SELECT
TO anon, authenticated
USING (is_active = true);
```

**File:** [migrations/enable-public-programs-access.sql](../migrations/enable-public-programs-access.sql)

### Step 2: Verify Data Exists
Run this query in Supabase:

```sql
SELECT id, slug, name, is_active, is_featured 
FROM programs 
ORDER BY display_order;
```

**Expected Result:** 6 rows

If you see **0 rows**, you need to run the data migration:

### Step 3: Populate Database (if empty)
Run this SQL in **Supabase SQL Editor**:

**File:** [migrations/neema-content-migration.sql](../migrations/neema-content-migration.sql)

This will insert:
1. Neema Health Center (featured)
2. Neema Resource Center (featured)
3. Ahoho naMarye Mashome (featured)
4. Widow Fellowship & Empowerment (featured)
5. Shomani Book Club
6. NF Cup

### Step 4: Check Browser Console
1. Open http://localhost:5173/programs
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for: `🔍 Programs Debug:`

You should see:
```javascript
{
  isLoading: false,
  error: null,
  allPrograms: 6,
  featuredPrograms: 4,
  allProgramsData: [... 6 programs ...],
  featuredProgramsData: [... 4 programs ...]
}
```

## Common Issues & Solutions

### Issue 1: "allPrograms: 0, featuredPrograms: 0"
**Cause:** RLS policy blocking access or no data in database  
**Solution:** Run Step 1 (enable-public-programs-access.sql)

### Issue 2: Error message in console
**Cause:** Database connection issue or missing table  
**Solution:** Check Supabase project settings, verify connection

### Issue 3: "isLoading: true" forever
**Cause:** Network issue or Supabase down  
**Solution:** Check network tab, verify Supabase status

### Issue 4: Data exists but page shows old programs
**Cause:** React Query cache or browser cache  
**Solution:** 
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear cache: DevTools → Application → Clear storage

## Verification Checklist

After running the SQL scripts:

- [ ] Run enable-public-programs-access.sql in Supabase
- [ ] Verify 6 programs exist in database
- [ ] All programs have `is_active = true`
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Check console shows 6 programs loaded
- [ ] Programs page shows 4 featured + 2 additional
- [ ] Click program card → modal opens with details

## SQL Scripts Location

1. **Enable Access:** `/migrations/enable-public-programs-access.sql`
2. **Populate Data:** `/migrations/neema-content-migration.sql`

## Need Help?

If still not working after these steps:

1. **Check console output** - Copy the `🔍 Programs Debug:` log
2. **Check Supabase logs** - Go to Supabase Dashboard → Logs
3. **Verify table structure** - Ensure programs table exists with correct columns

## Expected Behavior After Fix

**Programs Page Should Show:**
- Loading spinner (briefly)
- 4 featured programs in main grid
- 2 additional programs in secondary section
- Stats: 6 programs, 60,000+ beneficiaries

**Program Modal Should Show:**
- Objectives section with checkmarks
- Activities section in grid
- Partners as badges
- Beneficiary information card

---

**Time to Fix:** 5 minutes  
**Difficulty:** Easy (just run SQL scripts)  
**Impact:** High (entire programs section works)
