-- Phase 6: Enhanced Programs Schema Migration
-- Run this in Supabase SQL Editor

-- =============================================
-- MEDIA GALLERY SUPPORT
-- =============================================

-- Add gallery images array
ALTER TABLE programs ADD COLUMN IF NOT EXISTS gallery_images TEXT[];

-- Add video fields
ALTER TABLE programs ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;

-- =============================================
-- DONATION/FUNDING FIELDS
-- =============================================

-- Add donation goal tracking
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_goal NUMERIC(12,2);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_current NUMERIC(12,2) DEFAULT 0;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_currency TEXT DEFAULT 'KES';
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_deadline DATE;

-- =============================================
-- VOLUNTEER OPPORTUNITIES
-- =============================================

-- Add volunteer management fields
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_opportunities TEXT[];
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_slots INTEGER;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_skills_needed TEXT[];

-- =============================================
-- CONTENT ENHANCEMENT
-- =============================================

-- Add impact statement
ALTER TABLE programs ADD COLUMN IF NOT EXISTS impact_statement TEXT;

-- Add testimonials (JSONB for structured data)
-- Format: [{ "name": "Jane", "quote": "...", "image": "url", "role": "Beneficiary" }]
ALTER TABLE programs ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]';

-- =============================================
-- SEO & SOCIAL SHARING
-- =============================================

ALTER TABLE programs ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS social_image TEXT;

-- =============================================
-- SCHEDULING
-- =============================================

ALTER TABLE programs ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS end_date DATE;

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);

-- Index for featured programs (partial index for efficiency)
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(is_featured) WHERE is_featured = true;

-- Index for active programs
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active) WHERE is_active = true;

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_programs_dates ON programs(start_date, end_date);

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON COLUMN programs.gallery_images IS 'Array of image URLs for the program gallery';
COMMENT ON COLUMN programs.video_url IS 'YouTube/Vimeo URL or direct video link';
COMMENT ON COLUMN programs.video_thumbnail IS 'Custom thumbnail URL for the video';
COMMENT ON COLUMN programs.donation_goal IS 'Target fundraising amount';
COMMENT ON COLUMN programs.donation_current IS 'Current amount raised';
COMMENT ON COLUMN programs.donation_currency IS 'Currency code (KES, USD, EUR, GBP)';
COMMENT ON COLUMN programs.donation_deadline IS 'Fundraising deadline';
COMMENT ON COLUMN programs.volunteer_opportunities IS 'List of volunteer role titles';
COMMENT ON COLUMN programs.volunteer_slots IS 'Total number of volunteer slots available';
COMMENT ON COLUMN programs.volunteer_skills_needed IS 'Skills/qualifications needed for volunteers';
COMMENT ON COLUMN programs.impact_statement IS 'Short impactful statement about program outcomes';
COMMENT ON COLUMN programs.testimonials IS 'JSON array of beneficiary testimonials';
COMMENT ON COLUMN programs.meta_title IS 'SEO meta title for search engines';
COMMENT ON COLUMN programs.meta_description IS 'SEO meta description (max 160 chars recommended)';
COMMENT ON COLUMN programs.social_image IS 'Open Graph image for social sharing (1200x630 recommended)';
COMMENT ON COLUMN programs.start_date IS 'Program start date';
COMMENT ON COLUMN programs.end_date IS 'Program end date (null for ongoing programs)';

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Run this to verify all columns were added:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'programs'
ORDER BY ordinal_position;
