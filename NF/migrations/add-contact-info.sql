-- ============================================================================
-- ADD CONTACT INFORMATION AND SOCIAL MEDIA CONTROLS TO SITE SETTINGS
-- ============================================================================
-- Run this script to add contact fields and social media enable/disable flags

-- Add contact information columns if they don't exist
DO $$ 
BEGIN
  -- Contact information columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'contact_email') THEN
    ALTER TABLE site_settings ADD COLUMN contact_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'contact_phone') THEN
    ALTER TABLE site_settings ADD COLUMN contact_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'contact_address') THEN
    ALTER TABLE site_settings ADD COLUMN contact_address TEXT;
  END IF;

  -- Social media enable/disable flags
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'social_facebook_enabled') THEN
    ALTER TABLE site_settings ADD COLUMN social_facebook_enabled BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'social_instagram_enabled') THEN
    ALTER TABLE site_settings ADD COLUMN social_instagram_enabled BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'social_twitter_enabled') THEN
    ALTER TABLE site_settings ADD COLUMN social_twitter_enabled BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'social_linkedin_enabled') THEN
    ALTER TABLE site_settings ADD COLUMN social_linkedin_enabled BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'site_settings' AND column_name = 'social_youtube_enabled') THEN
    ALTER TABLE site_settings ADD COLUMN social_youtube_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Update the site settings with contact information and enable all social media by default
UPDATE site_settings 
SET 
  contact_email = 'neemafoundationkilifi@gmail.com',
  contact_phone = '+254 797 484 101',
  contact_address = 'Ganze Sub-county, Kilifi County, Kenya',
  social_facebook = 'https://www.facebook.com/NeemafoundationKilifi/',
  social_facebook_enabled = true,
  social_instagram = 'https://www.instagram.com/neemafoundationkilifi/',
  social_instagram_enabled = true,
  social_youtube = 'https://www.youtube.com/@NeemaFoundation',
  social_youtube_enabled = true,
  social_linkedin = 'https://ke.linkedin.com/company/neema-foundation-kilifi',
  social_linkedin_enabled = true,
  social_twitter_enabled = false,
  updated_at = NOW()
WHERE id = 'main';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Contact information and social media controls added successfully!';
END $$;
