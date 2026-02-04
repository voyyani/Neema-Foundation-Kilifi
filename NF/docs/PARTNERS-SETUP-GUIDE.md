# Partners Management Setup Guide

## ✅ What's Been Implemented

### 1. Database Schema
- **File**: `/migrations/add-partners-table.sql`
- **Table**: `partners` with fields:
  - `id`, `name`, `logo_url`, `type`, `description`
  - `website_url`, `is_featured`, `is_active`, `display_order`
- **Includes**: Indexes, RLS policies, and seed data for 4 existing partners

### 2. Backend Hooks
- **Admin Hooks** (`/src/admin/hooks/usePartners.ts`):
  - Full CRUD operations
  - Toggle featured/active status
  - Drag-and-drop reordering
- **Public Hooks** (`/src/hooks/public/usePublicPartners.ts`):
  - Fetch active partners
  - Fetch featured partners only
  - 10-minute caching

### 3. Frontend Components
- **Admin UI** (`/src/admin/components/content/PartnersManagement.tsx`):
  - Table view with drag-and-drop reordering
  - Add/Edit modal form
  - Quick actions (feature, activate, delete)
  - Logo preview with fallback to initials
- **Public Component** (`/src/components/TrustBar.tsx`):
  - Updated to use database partners
  - Shows only featured partners
  - Logo or initials display

### 4. Featured Programs
- **Landing Page**: Now shows only featured programs
- **Programs Component**: Accepts `featuredOnly` prop
- **Hook Updates**: Support conditional fetching

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration**:
   - Copy the entire contents of `/migrations/add-partners-table.sql`
   - Paste into the SQL editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Success**:
   - You should see "Success. No rows returned"
   - Check Table Editor → `partners` table should exist with 4 rows

### Step 2: Access Partners Management

1. **Navigate to Admin Panel**:
   - Go to `http://localhost:5173/admin/login`
   - Login with your admin credentials

2. **Access Partners**:
   - Go to Dashboard → Content Management
   - Click on "Partners" card (green with handshake icon)
   - Or go directly to `/admin/content/partners`

### Step 3: Verify Public Display

1. **Check TrustBar**:
   - Go to homepage `http://localhost:5173/`
   - Scroll to "Trusted Partners" section
   - Should show 4 featured partners from database

2. **Test Landing Page Programs**:
   - Only featured programs should appear on landing page
   - To see all programs, navigate to `/programs` page

---

## 📖 How to Use Partners Management

### Add New Partner

1. Click "Add Partner" button
2. Fill in the form:
   - **Name** (required): Organization name
   - **Logo URL**: Direct link to partner logo image
   - **Type**: e.g., "Community Partner", "Faith Partner"
   - **Description**: Brief description of partnership
   - **Website URL**: Partner's website
   - **Featured**: Check to show on landing page
   - **Active**: Uncheck to hide without deleting
3. Click "Save Partner"

### Edit Partner

1. Click the pencil icon in the Actions column
2. Update fields as needed
3. Click "Save Partner"

### Delete Partner

1. Click the trash icon in the Actions column
2. Confirm deletion

### Reorder Partners

1. Drag the grip icon (⋮⋮) in the Order column
2. Drop in desired position
3. Order saves automatically

### Toggle Featured Status

1. Click the star icon
2. Yellow/filled = featured (shows on landing page)
3. Gray/outline = not featured

### Toggle Active Status

1. Click the "Active"/"Inactive" badge
2. Green = active (visible on public site)
3. Gray = inactive (hidden but not deleted)

---

## 🎨 Features

### Admin Features
✅ Full CRUD operations
✅ Drag-and-drop reordering
✅ Quick toggle featured/active
✅ Logo preview with fallback
✅ Form validation
✅ Responsive design

### Public Features
✅ Featured partners on landing page
✅ Logo display with automatic fallback to initials
✅ Partner type badges
✅ Descriptions
✅ Hover effects
✅ Database-driven (no code changes needed)

---

## 🔧 Configuration

### Caching
- **Admin**: 5-minute cache
- **Public**: 10-minute cache
- Changes appear immediately in admin
- Public site refreshes every 10 minutes

### Display
- **TrustBar**: Shows only featured partners
- **Order**: Determined by `display_order` field
- **Fallback**: Shows initials if no logo_url

---

## 📊 Database Schema

```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    type VARCHAR(100),
    description TEXT,
    website_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Fields:
- **is_featured**: Controls landing page display
- **is_active**: Controls public visibility
- **display_order**: Controls ordering (lower = first)

---

## 🐛 Troubleshooting

### Partners Not Showing
1. Check `is_active = true` in database
2. For TrustBar, check `is_featured = true`
3. Clear browser cache
4. Check console for errors

### Logo Not Displaying
1. Verify logo_url is valid and accessible
2. Check CORS settings if external URL
3. Fallback initials will show automatically

### Can't Save Partner
1. Check Supabase connection
2. Verify RLS policies are correct
3. Check browser console for errors
4. Ensure admin is authenticated

---

## 🎯 Next Steps

### Recommended Enhancements
1. **Logo Upload**: Add Cloudinary integration for logo uploads
2. **Website Links**: Make partner names clickable to websites
3. **Analytics**: Track partner impressions
4. **Categories**: Group partners by category
5. **Bulk Actions**: Select multiple partners for batch operations

### Future Features
- Partner profiles with detailed pages
- Partnership timeline/history
- Partner resources/downloads
- Partner testimonials

---

## 📝 Technical Notes

### File Structure
```
/migrations/
  └── add-partners-table.sql

/src/admin/
  ├── hooks/
  │   └── usePartners.ts
  └── components/content/
      └── PartnersManagement.tsx

/src/hooks/public/
  ├── usePublicPartners.ts
  └── index.ts (updated)

/src/components/
  ├── TrustBar.tsx (updated)
  └── Programs.tsx (updated)

/src/pages/
  └── Landing.tsx (updated)
```

### Dependencies Used
- React Query (data fetching)
- DnD Kit (drag-and-drop)
- Lucide React (icons)
- Tailwind CSS (styling)

---

## ✅ Testing Checklist

- [ ] Migration runs successfully
- [ ] Partners table created with 4 seed records
- [ ] Can access `/admin/content/partners`
- [ ] Can add new partner
- [ ] Can edit existing partner
- [ ] Can delete partner
- [ ] Can reorder partners (drag-drop)
- [ ] Can toggle featured status
- [ ] Can toggle active status
- [ ] TrustBar shows featured partners
- [ ] Landing page shows featured programs only
- [ ] Logos display correctly
- [ ] Fallback initials work for missing logos
- [ ] Changes reflect on public site after cache expiry

---

## 🎉 You're All Set!

Your partners management system is now fully integrated. You can:
1. Add/edit/delete partners from the admin panel
2. Reorder them with drag-and-drop
3. Control which appear on landing page (featured)
4. See changes automatically on public site

**Questions?** Check the code comments or Supabase dashboard for more details.
