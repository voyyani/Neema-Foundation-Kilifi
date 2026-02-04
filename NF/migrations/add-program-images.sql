-- ============================================================================
-- Program Images Table Migration
-- ============================================================================
-- Creates a one-to-many relationship for program images with:
--   • Captions and alt text for accessibility
--   • Display ordering
--   • Primary image flag
--   • Proper RLS policies
-- ============================================================================

-- ============================================================================
-- 1. CREATE PROGRAM_IMAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS program_images (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to programs
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Image data
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  
  -- Display settings
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Image metadata (optional, for advanced use)
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE program_images IS 'Stores multiple images for each program with ordering and metadata';
COMMENT ON COLUMN program_images.image_url IS 'Full URL to the image (Cloudinary, Supabase Storage, etc.)';
COMMENT ON COLUMN program_images.caption IS 'Optional caption displayed with the image';
COMMENT ON COLUMN program_images.alt_text IS 'Alt text for accessibility (required for screen readers)';
COMMENT ON COLUMN program_images.is_primary IS 'Whether this is the primary/hero image for the program';
COMMENT ON COLUMN program_images.display_order IS 'Order in which images appear in gallery (0 = first)';

-- ============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for fetching images by program
CREATE INDEX IF NOT EXISTS idx_program_images_program_id 
  ON program_images(program_id);

-- Index for ordering images
CREATE INDEX IF NOT EXISTS idx_program_images_order 
  ON program_images(program_id, display_order);

-- Partial index for primary images
CREATE INDEX IF NOT EXISTS idx_program_images_primary 
  ON program_images(program_id) 
  WHERE is_primary = true;

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE program_images ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view images for active programs
CREATE POLICY "Public can view program images" ON program_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM programs 
      WHERE id = program_images.program_id 
      AND is_active = true
    )
  );

-- Policy: Authenticated users can view all program images
CREATE POLICY "Authenticated can view all program images" ON program_images
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Editors and above can insert program images
CREATE POLICY "Editors can insert program images" ON program_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Policy: Editors and above can update program images
CREATE POLICY "Editors can update program images" ON program_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Policy: Admins can delete program images
CREATE POLICY "Admins can delete program images" ON program_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 4. TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_program_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_program_images_updated_at ON program_images;
CREATE TRIGGER trigger_program_images_updated_at
  BEFORE UPDATE ON program_images
  FOR EACH ROW
  EXECUTE FUNCTION update_program_images_updated_at();

-- ============================================================================
-- 5. FUNCTION TO ENSURE ONLY ONE PRIMARY IMAGE
-- ============================================================================

-- Function to ensure only one primary image per program
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this image as primary, unset all others for this program
  IF NEW.is_primary = true THEN
    UPDATE program_images 
    SET is_primary = false 
    WHERE program_id = NEW.program_id 
    AND id != NEW.id 
    AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for primary image enforcement
DROP TRIGGER IF EXISTS trigger_ensure_single_primary ON program_images;
CREATE TRIGGER trigger_ensure_single_primary
  BEFORE INSERT OR UPDATE ON program_images
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_image();

-- ============================================================================
-- 6. HELPER VIEWS
-- ============================================================================

-- View to get programs with their images as arrays
CREATE OR REPLACE VIEW programs_with_images AS
SELECT 
  p.*,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', pi.id,
          'url', pi.image_url,
          'caption', pi.caption,
          'alt', pi.alt_text,
          'is_primary', pi.is_primary
        ) ORDER BY pi.display_order
      )
      FROM program_images pi 
      WHERE pi.program_id = p.id
    ),
    '[]'::jsonb
  ) AS images_json,
  (
    SELECT pi.image_url 
    FROM program_images pi 
    WHERE pi.program_id = p.id AND pi.is_primary = true 
    LIMIT 1
  ) AS primary_image
FROM programs p;

COMMENT ON VIEW programs_with_images IS 'Programs with their associated images as JSON array';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- Usage examples:
--
-- Insert an image:
-- INSERT INTO program_images (program_id, image_url, caption, is_primary, display_order)
-- VALUES ('program-uuid', 'https://example.com/image.jpg', 'Children at school', true, 0);
--
-- Get all images for a program:
-- SELECT * FROM program_images WHERE program_id = 'program-uuid' ORDER BY display_order;
--
-- Get program with images:
-- SELECT * FROM programs_with_images WHERE slug = 'ahoho-mission';
--
-- ============================================================================
