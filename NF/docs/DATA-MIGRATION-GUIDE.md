# Neema Foundation Data Migration Guide

## 📋 Overview

This guide walks you through populating your database with actual Neema Foundation content. We provide two methods:

1. **SQL Script** (Recommended) - Direct database insertion
2. **TypeScript Seed Data** - Type-safe reference for future updates

---

## 🚀 Method 1: SQL Migration (Recommended)

### Step 1: Backup Current Database (Optional)
```bash
# From Supabase Dashboard
# Settings → Database → Database backups → Create backup
```

### Step 2: Run Migration Script

1. Open **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `migrations/neema-content-migration.sql`
4. Copy entire contents
5. Paste into SQL Editor
6. Click **Run**

### Step 3: Verify Data

Run these queries to confirm:

```sql
-- Check hero slides
SELECT COUNT(*) as hero_count FROM hero_content;
-- Should return: 3

-- Check programs
SELECT COUNT(*) as programs_count FROM programs;
-- Should return: 6

-- Check impact metrics
SELECT COUNT(*) as metrics_count FROM impact_metrics;
-- Should return: 6

-- Check stories
SELECT COUNT(*) as stories_count FROM stories;
-- Should return: 1

-- View all data
SELECT 'Hero Slides' as table_name, COUNT(*)::text as count FROM hero_content
UNION ALL
SELECT 'Programs', COUNT(*)::text FROM programs
UNION ALL
SELECT 'Impact Metrics', COUNT(*)::text FROM impact_metrics
UNION ALL
SELECT 'Stories', COUNT(*)::text FROM stories
UNION ALL
SELECT 'Board Members', COUNT(*)::text FROM board_members;
```

---

## 📝 Post-Migration Tasks

### 1. Upload Images via Cloudinary

All records are created with empty `cover_image`, `background_image`, `photo_url` fields. Upload images through the admin panel:

#### Hero Slides (3 images needed)
1. Go to **Admin → Content → Hero Slides**
2. Click **Edit** on each slide
3. Use **Image Uploader** to upload:
   - Main hero image (Neema community/health center)
   - Health services image
   - Education/feeding program image
4. **Recommended dimensions:** 1920x800px (21:9 aspect ratio)

#### Programs (6 images needed)
1. Go to **Admin → Programs**
2. Edit each program:
   - **Neema Health Center**: Health facility photo
   - **Resource Center**: Library/learning space
   - **Ahoho naMarye**: Children eating/porridge program
   - **Widows Fellowship**: Group gathering photo
   - **Shomani Book Club**: Reading session photo
   - **NF Cup**: Sports event photo
3. **Recommended dimensions:** 1200x675px (16:9 aspect ratio)

#### Stories (1 image needed)
1. Go to **Admin → Content → Stories**
2. Edit "About Neema Foundation"
3. Upload a representative image of the organization
4. **Recommended dimensions:** 1200x675px

### 2. Add Board Members

The migration script doesn't include board members (sensitive information). Add them manually:

1. Go to **Admin → Content → Board Members**
2. Click **Add Board Member**
3. Fill in:
   - Name
   - Role (Chairperson, Treasurer, Secretary, Member)
   - Organization: "Neema Foundation"
   - Biography (use rich text editor)
   - Email (optional)
   - LinkedIn URL (optional)
   - Photo (upload via Cloudinary)
4. Set **Active** status
5. Repeat for all board members

### 3. Update Placeholder Information

Review and update "TBD" placeholders:

#### Partners (in Programs)
- Replace "TBD" with actual partner organizations
- Edit each program and update the Partners field

#### Contact Information (in Site Settings)
1. Go to **Admin → Site Settings**
2. Update:
   - Contact Email: Replace with actual email
   - Contact Phone: Replace with actual phone number
   - Social Media URLs (Facebook, Instagram, etc.)

### 4. Verify Public Site Display

After migration and image uploads:

1. Visit your public site: `https://your-domain.com`
2. Check each page:
   - **Homepage**: Hero slides displaying correctly
   - **Programs**: All 6 programs with images
   - **About**: Impact metrics showing
   - **Stories**: About page accessible
3. Verify images load fast (Cloudinary CDN)

---

## 🔄 Method 2: TypeScript Seed Data

For development or testing, use the TypeScript seed data:

### Usage:

```typescript
import { heroSlides, programs, stories } from './migrations/seed-data';
import { useHeroContent } from './src/admin/hooks/useHeroContent';
import { usePrograms } from './src/admin/hooks/usePrograms';

// Example: Seed hero slides
async function seedHeroSlides() {
  const { createSlide } = useHeroContent();
  
  for (const slide of heroSlides) {
    await createSlide(slide);
    console.log(`✅ Created: ${slide.title}`);
  }
}

// Example: Seed programs
async function seedPrograms() {
  const { createProgram } = usePrograms();
  
  for (const program of programs) {
    await createProgram(program);
    console.log(`✅ Created: ${program.name}`);
  }
}
```

---

## ✅ Pre-Population Verification

### How Forms Auto-Populate:

All admin forms are designed to auto-populate with existing data. When you click "Edit" on any item:

#### Hero Slides
```typescript
// In HeroSlideModal
const [formData, setFormData] = useState<HeroSlideInput>({
  title: slide?.title || '',              // ✅ Loads from DB
  subtitle: slide?.subtitle || '',        // ✅ Loads from DB
  cta_label: slide?.cta_label || '',      // ✅ Loads from DB
  // ... all fields pre-populate
});
```

#### Programs
```typescript
// In ProgramModal
const [formData, setFormData] = useState<ProgramInput>({
  name: program?.name || '',              // ✅ Loads from DB
  summary: program?.summary || '',        // ✅ Loads from DB
  description: program?.description || '', // ✅ Loads from DB
  // ... all fields pre-populate
});
```

**This pattern is consistent across all admin pages:**
- ✅ Hero Slides
- ✅ Programs
- ✅ Stories
- ✅ Impact Metrics
- ✅ Board Members
- ✅ Events
- ✅ Site Settings

### Testing Form Pre-Population:

1. Run the migration script
2. Go to any admin page (e.g., Hero Slides)
3. Click **Edit** on any item
4. **Verify**: All fields should show existing data
5. Make a change and save
6. Re-open: Change should persist

If fields are blank when editing:
- Check database has data: `SELECT * FROM hero_content;`
- Verify hook is fetching: Check browser console for errors
- Ensure types match database schema

---

## 🎯 Data Summary

After successful migration, you'll have:

| Content Type | Count | Status |
|--------------|-------|--------|
| Hero Slides | 3 | ✅ Migrated |
| Programs | 6 | ✅ Migrated |
| Impact Metrics | 6 | ✅ Migrated |
| Stories | 1 | ✅ Migrated |
| Board Members | 0 | ⚠️ Manual entry needed |
| Site Settings | 1 | ✅ Migrated |

### Content Breakdown:

**Programs:**
1. Neema Health Center (Health, Featured)
2. Neema Resource Center (Education, Featured)
3. Ahoho naMarye Mashome (Education, Featured) - 650 pupils
4. Widow Fellowship & Empowerment (Empowerment, Featured) - 43 widows
5. Shomani Book Club (Education) - 100 learners
6. NF Cup (Community) - Youth engagement

**Impact Metrics:**
- 650+ Pupils fed daily
- 60,000 Community members served
- 43 Widows empowered
- 100+ Young readers engaged
- 4+ Years of service
- 500 Sanitary kits provided

---

## 🚨 Troubleshooting

### Issue: "Column does not exist"
**Solution:** Run schema migration first:
```bash
# migrations/migration-fix-schema.sql
```

### Issue: "Duplicate key value violates unique constraint"
**Solution:** Script already ran. Either:
1. Clear tables first: `DELETE FROM hero_content;`
2. Or skip - script uses UPSERT where possible

### Issue: Images not uploading
**Solution:** 
1. Check Cloudinary credentials in `.env.local`
2. Verify upload preset is "Unsigned"
3. See `.env.example` for setup guide

### Issue: Rich text not rendering
**Solution:**
1. Check Tiptap editor is initialized
2. Verify content has HTML tags
3. Test with simple HTML: `<p>Test</p>`

---

## 📊 Performance Notes

After migration:
- **Hero Slides**: Cached for 5 minutes (React Query)
- **Programs**: Cached for 5 minutes
- **Images**: Served via Cloudinary CDN (fast global delivery)
- **Database**: Indexed on display_order, slug, status fields

Expected load times:
- Initial load: <2 seconds
- Cached load: <200ms
- Image load: <500ms (Cloudinary)

---

## 🔐 Security Notes

The migration script:
- ✅ Uses parameterized queries
- ✅ Escapes single quotes properly
- ✅ Safe to run multiple times
- ✅ No sensitive data in version control
- ⚠️ Add board member info manually (don't commit personal data)

---

## 📚 Next Steps

1. **Complete Migration** ✅
2. **Upload Images** (15-30 minutes)
3. **Add Board Members** (10 minutes)
4. **Update Placeholders** (5 minutes)
5. **Test Public Site** (10 minutes)
6. **Phase 5: Connect CMS to Frontend** (Next phase)

---

## 💡 Pro Tips

- **Bulk Upload**: Upload all images at once to Cloudinary dashboard, then add URLs via admin
- **Image Naming**: Use descriptive names: `neema-health-center.jpg`, `feeding-program.jpg`
- **Image Optimization**: Cloudinary auto-optimizes, but upload high-quality originals
- **Content Review**: Have team review migrated content for accuracy
- **Backup**: Export content regularly via Supabase backups

---

## ✨ Success Criteria

Migration is successful when:
- [ ] All database queries return expected counts
- [ ] Admin forms pre-populate with data when editing
- [ ] Images display on admin pages
- [ ] Public site shows all content
- [ ] No console errors
- [ ] Page load times <2 seconds

**Status: READY TO MIGRATE** ✅

---

*For issues or questions, refer to [PHASE-4-COMPLETION-REPORT.md](./PHASE-4-COMPLETION-REPORT.md) or [ADMIN-STATUS.md](./ADMIN-STATUS.md)*
