-- ============================================================================
-- Enhanced Programs Schema Migration
-- ============================================================================
-- Run this in Supabase SQL Editor to add new columns for world-class programs
-- 
-- Features added:
--   • Media gallery (multiple images + videos)
--   • Donation/funding tracking
--   • Volunteer opportunities management
--   • Testimonials from beneficiaries
--   • SEO optimization fields
--   • Program scheduling
-- ============================================================================

-- ============================================================================
-- 1. MEDIA GALLERY SUPPORT
-- ============================================================================

-- Gallery images array for multiple images per program
ALTER TABLE programs ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
COMMENT ON COLUMN programs.gallery_images IS 'Array of image URLs for the program gallery (in addition to cover_image)';

-- Video support
ALTER TABLE programs ADD COLUMN IF NOT EXISTS video_url TEXT;
COMMENT ON COLUMN programs.video_url IS 'Primary video URL (YouTube, Vimeo, or direct link)';

ALTER TABLE programs ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;
COMMENT ON COLUMN programs.video_thumbnail IS 'Thumbnail image URL for the video';

-- Additional videos array for programs with multiple videos
ALTER TABLE programs ADD COLUMN IF NOT EXISTS additional_videos JSONB DEFAULT '[]';
COMMENT ON COLUMN programs.additional_videos IS 'Array of video objects: [{"url": "...", "title": "...", "thumbnail": "..."}]';

-- ============================================================================
-- 2. DONATION/FUNDING FIELDS
-- ============================================================================

-- Donation goal amount
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_goal NUMERIC(12,2);
COMMENT ON COLUMN programs.donation_goal IS 'Target donation amount for the program';

-- Current donation amount
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_current NUMERIC(12,2) DEFAULT 0;
COMMENT ON COLUMN programs.donation_current IS 'Current amount raised for the program';

-- Currency (default KES for Kenya Shillings)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_currency TEXT DEFAULT 'KES';
COMMENT ON COLUMN programs.donation_currency IS 'Currency code (KES, USD, EUR, GBP)';

-- Fundraising deadline
ALTER TABLE programs ADD COLUMN IF NOT EXISTS donation_deadline DATE;
COMMENT ON COLUMN programs.donation_deadline IS 'Deadline for reaching the donation goal';

-- Enable accepting donations flag
ALTER TABLE programs ADD COLUMN IF NOT EXISTS accepts_donations BOOLEAN DEFAULT true;
COMMENT ON COLUMN programs.accepts_donations IS 'Whether the program is currently accepting donations';

-- ============================================================================
-- 3. VOLUNTEER OPPORTUNITIES
-- ============================================================================

-- List of volunteer opportunities
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_opportunities TEXT[];
COMMENT ON COLUMN programs.volunteer_opportunities IS 'Array of volunteer opportunity descriptions';

-- Number of volunteer slots available
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_slots INTEGER;
COMMENT ON COLUMN programs.volunteer_slots IS 'Total number of volunteer positions available';

-- Current volunteer count
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_current INTEGER DEFAULT 0;
COMMENT ON COLUMN programs.volunteer_current IS 'Current number of active volunteers';

-- Skills needed for volunteering
ALTER TABLE programs ADD COLUMN IF NOT EXISTS volunteer_skills_needed TEXT[];
COMMENT ON COLUMN programs.volunteer_skills_needed IS 'Array of skills/qualifications needed for volunteers';

-- Enable volunteer applications flag
ALTER TABLE programs ADD COLUMN IF NOT EXISTS accepts_volunteers BOOLEAN DEFAULT true;
COMMENT ON COLUMN programs.accepts_volunteers IS 'Whether the program is currently accepting volunteer applications';

-- ============================================================================
-- 4. CONTENT ENHANCEMENT FIELDS
-- ============================================================================

-- Impact statement - compelling summary of program impact
ALTER TABLE programs ADD COLUMN IF NOT EXISTS impact_statement TEXT;
COMMENT ON COLUMN programs.impact_statement IS 'Compelling summary of the program impact for donors/volunteers';

-- Testimonials from beneficiaries
ALTER TABLE programs ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]';
COMMENT ON COLUMN programs.testimonials IS 'Array of testimonial objects: [{"name": "...", "quote": "...", "image": "...", "role": "Beneficiary"}]';

-- Features list for quick highlights
ALTER TABLE programs ADD COLUMN IF NOT EXISTS features TEXT[];
COMMENT ON COLUMN programs.features IS 'Array of key program features/highlights';

-- Full rich-text description (HTML/Markdown)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS full_description TEXT;
COMMENT ON COLUMN programs.full_description IS 'Full program description with HTML/Markdown formatting';

-- ============================================================================
-- 5. SEO AND SOCIAL SHARING
-- ============================================================================

-- Custom meta title for SEO
ALTER TABLE programs ADD COLUMN IF NOT EXISTS meta_title TEXT;
COMMENT ON COLUMN programs.meta_title IS 'Custom page title for SEO (defaults to program name if empty)';

-- Meta description for SEO
ALTER TABLE programs ADD COLUMN IF NOT EXISTS meta_description TEXT;
COMMENT ON COLUMN programs.meta_description IS 'Meta description for search engines (150-160 chars recommended)';

-- Social sharing image (1200x630 recommended for Open Graph)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS social_image TEXT;
COMMENT ON COLUMN programs.social_image IS 'Image URL for social media sharing (1200x630 recommended)';

-- ============================================================================
-- 6. PROGRAM SCHEDULING
-- ============================================================================

-- Program start date
ALTER TABLE programs ADD COLUMN IF NOT EXISTS start_date DATE;
COMMENT ON COLUMN programs.start_date IS 'Date when the program started or will start';

-- Program end date (null for ongoing programs)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS end_date DATE;
COMMENT ON COLUMN programs.end_date IS 'Date when the program ends (null for ongoing programs)';

-- Program status with more options
ALTER TABLE programs ADD COLUMN IF NOT EXISTS program_status TEXT DEFAULT 'active' 
  CHECK (program_status IN ('draft', 'upcoming', 'active', 'paused', 'completed', 'archived'));
COMMENT ON COLUMN programs.program_status IS 'Current status of the program lifecycle';

-- ============================================================================
-- 7. CONTACT & COORDINATION
-- ============================================================================

-- Program coordinator/contact person
ALTER TABLE programs ADD COLUMN IF NOT EXISTS coordinator_name TEXT;
COMMENT ON COLUMN programs.coordinator_name IS 'Name of the program coordinator';

ALTER TABLE programs ADD COLUMN IF NOT EXISTS coordinator_email TEXT;
COMMENT ON COLUMN programs.coordinator_email IS 'Email of the program coordinator';

ALTER TABLE programs ADD COLUMN IF NOT EXISTS coordinator_phone TEXT;
COMMENT ON COLUMN programs.coordinator_phone IS 'Phone number of the program coordinator';

-- ============================================================================
-- 8. PERFORMANCE INDEXES
-- ============================================================================

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);

-- Partial index for featured programs (more efficient)
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(is_featured) 
  WHERE is_featured = true;

-- Index for active programs
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(is_active) 
  WHERE is_active = true;

-- Index for program status
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(program_status);

-- Index for programs accepting donations
CREATE INDEX IF NOT EXISTS idx_programs_donations ON programs(accepts_donations) 
  WHERE accepts_donations = true;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_programs_active_featured ON programs(is_active, is_featured, display_order);

-- ============================================================================
-- 9. UPDATE TIMESTAMP TRIGGER
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_programs_updated_at ON programs;
CREATE TRIGGER trigger_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_programs_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update TypeScript types in usePublicPrograms.ts
-- 3. Update data mapper in dataMappers.ts
-- 4. Test by adding data through admin or directly in Supabase
--
-- ============================================================================
