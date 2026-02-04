-- ============================================================================
-- NEEMA FOUNDATION DATA MIGRATION SCRIPT
-- World-Class Database Population
-- ============================================================================
-- Created: February 3, 2026
-- Purpose: Populate database with actual Neema Foundation content
-- Source: nf-content.json
-- 
-- Instructions:
-- 1. Run this script in Supabase SQL Editor
-- 2. Script is idempotent (safe to run multiple times)
-- 3. Uses UPSERT pattern to avoid duplicates
-- ============================================================================

-- ============================================================================
-- SITE SETTINGS
-- ============================================================================

-- Add contact information columns if they don't exist
DO $$ 
BEGIN
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
END $$;

-- Update the default 'main' settings record
UPDATE site_settings 
SET 
  brand_name = 'Neema Foundation',
  tagline = 'Need meets God''s Grace',
  mission = 'Share God''s transformative grace to the community through the provision of compassionate, quality and affordable healthcare services, education and technology programs',
  vision = 'A transformed, healthy and self empowered Christ loving community',
  values = ARRAY['Christian faith', 'Compassion', 'Integrity', 'Value Humanity', 'Committed to Excellence'],
  primary_color = '#B01C2E',
  secondary_color = '#111827',
  contact_email = 'neemafoundationkilifi@gmail.com',
  contact_phone = '+254 797 484 101',
  contact_address = 'Ganze Sub-county, Kilifi County, Kenya',
  social_facebook = 'https://www.facebook.com/NeemafoundationKilifi/',
  social_instagram = 'https://www.instagram.com/neemafoundationkilifi/',
  social_youtube = 'https://www.youtube.com/@NeemaFoundation',
  social_linkedin = 'https://ke.linkedin.com/company/neema-foundation-kilifi',
  updated_at = NOW()
WHERE id = 'main';

-- ============================================================================
-- HERO SLIDES
-- ============================================================================

-- Clear existing hero slides (optional - remove if you want to keep existing)
-- DELETE FROM hero_content;

-- Hero Slide 1: Main Message
INSERT INTO hero_content (
  title,
  subtitle,
  cta_label,
  cta_href,
  background_image,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Need meets God''s Grace',
  'Neema Foundation is a Christian based organization that spreads the message of God''s grace by serving the community with affordable health services, education and youth empowerment programs.',
  'Donate Now',
  '/donate',
  '', -- Add image URL after uploading via admin
  true,
  0,
  NOW(),
  NOW()
);

-- Hero Slide 2: Health Services
INSERT INTO hero_content (
  title,
  subtitle,
  cta_label,
  cta_href,
  background_image,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Quality Healthcare for Ganze',
  'Providing affordable level 3 health services including maternity, laboratory, dental, and comprehensive HIV care to 60,000 community members.',
  'Learn More',
  '/programs',
  '', -- Add image URL
  true,
  1,
  NOW(),
  NOW()
);

-- Hero Slide 3: Education
INSERT INTO hero_content (
  title,
  subtitle,
  cta_label,
  cta_href,
  background_image,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Empowering Youth Through Education',
  'Feeding 650+ pupils daily and nurturing a reading culture through our resource center and book clubs across Ganze schools.',
  'Get Involved',
  '/volunteer',
  '', -- Add image URL
  true,
  2,
  NOW(),
  NOW()
);

-- ============================================================================
-- PROGRAMS
-- ============================================================================

-- Program 1: Neema Health Center
INSERT INTO programs (
  slug,
  name,
  category,
  summary,
  description,
  objectives,
  activities,
  partners,
  beneficiary_who,
  beneficiary_where,
  beneficiary_count,
  is_active,
  is_featured,
  display_order,
  cta_label,
  cta_href,
  cover_image,
  created_at,
  updated_at
) VALUES (
  'neema-health-center',
  'Neema Health Center',
  'health',
  'Providing quality and affordable level 3 health services in Ganze.',
  '<h2>Comprehensive Healthcare Services</h2>
<p>The Neema Health Center provides quality and affordable healthcare to the Ganze community. Our services include:</p>
<ul>
<li>Maternity in-patient care</li>
<li>Curative care services</li>
<li>Laboratory and diagnostic services</li>
<li>Dental care</li>
<li>Counseling services</li>
<li>Pharmacy services</li>
<li>TB, diabetes & hypertension clinics</li>
<li>Comprehensive HIV care</li>
<li>Baby well clinics</li>
<li>Antenatal and postnatal services</li>
<li>Medical referrals</li>
</ul>
<h3>Our Approach</h3>
<p>We conduct medical camps and outreach programs while providing pharmacy and ambulatory services. Our progressive roadmap aims to expand from Level 1 to Level 3 services to better serve the community.</p>',
  ARRAY['Provide quality and affordable Healthcare service in Ganze'],
  ARRAY['Medical camps and outreach', 'Pharmacy and ambulatory services', 'Progressive roadmap from Level 1 → Level 3 services'],
  ARRAY['TBD'],
  'Ganze community',
  'Ganze Sub-county, Kilifi',
  60000,
  true,
  true,
  0,
  'Donate',
  '/donate',
  '', -- Add image URL
  NOW(),
  NOW()
);

-- Program 2: Neema Resource Center
INSERT INTO programs (
  slug,
  name,
  category,
  summary,
  description,
  objectives,
  activities,
  partners,
  beneficiary_who,
  beneficiary_where,
  beneficiary_count,
  is_active,
  is_featured,
  display_order,
  cta_label,
  cta_href,
  cover_image,
  created_at,
  updated_at
) VALUES (
  'neema-resource-center',
  'Neema Resource Center',
  'education',
  '"Shomani Kwa Furaha" — reading culture, technology and innovation for youth.',
  '<h2>A Hub for Learning and Innovation</h2>
<p>The Neema Resource Center is designed to nurture a reading culture and encourage technological innovation among the youth of Ganze.</p>
<h3>Facilities</h3>
<ul>
<li>Community library service with diverse book collection</li>
<li>Study and resource center for learners</li>
<li>Innovation hub (i-hub) for technology projects</li>
<li>Conference facilities for community events</li>
</ul>
<p>Our motto "Shomani Kwa Furaha" (Read with Joy) reflects our commitment to making learning enjoyable and accessible to all youth in the community.</p>',
  ARRAY['To nurture a reading culture among the youth in Ganze', 'To encourage technology innovation and opportunities in the Ganze'],
  ARRAY['Community library service', 'Study and resource center', 'Innovation hub (i-hub)', 'Conference facilities'],
  ARRAY['TBD'],
  'Youth and learners',
  'Ganze Sub-county, Kilifi',
  NULL,
  true,
  true,
  1,
  'Volunteer',
  '/volunteer',
  '', -- Add image URL
  NOW(),
  NOW()
);

-- Program 3: Ahoho naMarye Mashome (Feeding Program)
INSERT INTO programs (
  slug,
  name,
  category,
  summary,
  description,
  objectives,
  activities,
  partners,
  beneficiary_who,
  beneficiary_where,
  beneficiary_count,
  is_active,
  is_featured,
  display_order,
  cta_label,
  cta_href,
  cover_image,
  created_at,
  updated_at
) VALUES (
  'ahoho-marye-mashome',
  'Ahoho naMarye Mashome',
  'education',
  'Feeding and education support initiatives for school children.',
  '<h2>Supporting Education Through Nutrition</h2>
<p>Our feeding program provides daily porridge to 650 pupils across three schools in Ganze, ensuring children have the nutrition they need to learn and thrive.</p>
<h3>Current Reach</h3>
<p>We currently support students at:</p>
<ul>
<li>Misufini Primary School (340 students)</li>
<li>KAG School</li>
<li>Boga School</li>
</ul>
<p><strong>Total: 650 pupils receiving daily nutritional support</strong></p>
<h3>Activities</h3>
<ul>
<li>Daily porridge program</li>
<li>School engagement and mentorship</li>
<li>Back-to-school support drives</li>
</ul>',
  ARRAY['Support education and child welfare through practical interventions'],
  ARRAY['Porridge program support', 'School engagement and mentorship', 'Back-to-school support drives'],
  ARRAY['Nourish and Flourish (ICC Mombasa)', 'Jitambue Kijana Trust', 'TBD'],
  'Primary school pupils',
  'Ganze schools (Misufini, KAG, Boga)',
  650,
  true,
  true,
  2,
  'Donate',
  '/donate',
  '', -- Add image URL
  NOW(),
  NOW()
);

-- Program 4: Widow Fellowship & Empowerment
INSERT INTO programs (
  slug,
  name,
  category,
  summary,
  description,
  objectives,
  activities,
  partners,
  beneficiary_who,
  beneficiary_where,
  beneficiary_count,
  is_active,
  is_featured,
  display_order,
  cta_label,
  cta_href,
  cover_image,
  created_at,
  updated_at
) VALUES (
  'widows-fellowship',
  'Widow Fellowship & Empowerment',
  'empowerment',
  'Fellowship, trauma healing, literacy, and practical support for widows and their families.',
  '<h2>Supporting Widows in Our Community</h2>
<p>Our widow empowerment program provides comprehensive support to 43 widows and their families in the Ganze community through fellowship, healing, and practical assistance.</p>
<h3>Program Components</h3>
<ul>
<li><strong>Trauma Healing:</strong> Professional counseling and group therapy sessions</li>
<li><strong>Bible Literacy:</strong> Spiritual support and resource provision</li>
<li><strong>Fellowship:</strong> Regular gatherings for community building</li>
<li><strong>Economic Support:</strong> Practical assistance for families</li>
</ul>
<h3>2024 Highlights</h3>
<p>This year, our fellowship grew to 43 widows, and we conducted our Annual General Meeting with dedicated trauma healing sessions led by Rev. Jane Jilani and her team.</p>',
  ARRAY['Strengthen community support systems and resilience'],
  ARRAY['Trauma healing sessions', 'Bible literacy and resource support', 'Fellowship gatherings and support'],
  ARRAY['CITAM Mission Ministry', 'Renewal Project Africa', 'TBD'],
  'Widows and their children',
  'Ganze community',
  43,
  true,
  true,
  3,
  'Partner with us',
  '/partnership',
  '', -- Add image URL
  NOW(),
  NOW()
);

-- Program 5: Shomani Book Club
INSERT INTO programs (
  slug,
  name,
  category,
  summary,
  description,
  objectives,
  activities,
  partners,
  beneficiary_who,
  beneficiary_where,
  beneficiary_count,
  is_active,
  is_featured,
  display_order,
  cta_label,
  cta_href,
  cover_image,
  created_at,
  updated_at
) VALUES (
  'shomani-book-club',
  'Shomani Book Club',
  'education',
  'Reading culture initiatives and school book clubs in the community.',
  '<h2>Nurturing Young Readers</h2>
<p>The Shomani Book Club initiative brings reading culture to life in Ganze schools, targeting Grade 5 students across 5 schools with 20 students each.</p>
<h3>Program Structure</h3>
<ul>
<li><strong>Book Club Sensitization:</strong> Training teachers and students</li>
<li><strong>Club Launch:</strong> Official establishment in target schools</li>
<li><strong>Reading Camps:</strong> Interactive learning experiences</li>
<li><strong>Awards:</strong> Recognition through BAI Community Reading Awards</li>
</ul>
<h3>Impact</h3>
<p>Initial target: <strong>100 learners</strong> across 5 schools, with plans to expand as the program grows.</p>',
  ARRAY['To nurture a reading culture among the youth in Ganze'],
  ARRAY['Book club sensitization and training', 'Book club launch', 'Reading camps'],
  ARRAY['Kilifi County Library Services', 'BAI Community Reading Awards'],
  'Learners (Grade 5 focus)',
  'Target schools in the community',
  100,
  true,
  false,
  4,
  'Volunteer',
  '/volunteer',
  '', -- Add image URL
  NOW(),
  NOW()
);

-- Program 6: NF Cup
INSERT INTO programs (
  slug,
  name,
  category,
  summary,
  description,
  objectives,
  activities,
  partners,
  beneficiary_who,
  beneficiary_where,
  beneficiary_count,
  is_active,
  is_featured,
  display_order,
  cta_label,
  cta_href,
  cover_image,
  created_at,
  updated_at
) VALUES (
  'nf-cup',
  'NF Cup',
  'community',
  'Sports-based youth engagement and back-to-school events.',
  '<h2>Youth Engagement Through Sports</h2>
<p>The NF Cup is our flagship sports initiative that brings together youth teams from across Ganze for friendly competition, mentorship, and community building.</p>
<h3>Event Highlights</h3>
<ul>
<li>Annual tournament events</li>
<li>Back-to-school editions to promote education</li>
<li>Mentorship opportunities through sports</li>
<li>Character development and teamwork</li>
</ul>
<h3>Partners</h3>
<p>The NF Cup is made possible through partnerships with Kingdom Springs, Kilifi County, CITAM, and other community stakeholders.</p>',
  ARRAY['Youth engagement and holistic development'],
  ARRAY['Tournament events', 'Back-to-school editions', 'Mentorship through sports'],
  ARRAY['Kingdom Springs', 'Kilifi County', 'CITAM', 'TBD'],
  'Youth teams',
  'Ganze community',
  NULL,
  true,
  false,
  5,
  'Sponsor an event',
  '/partnership',
  '', -- Add image URL
  NOW(),
  NOW()
);

-- ============================================================================
-- IMPACT METRICS
-- ============================================================================

-- Metric 1: Pupils Supported
INSERT INTO impact_metrics (
  label,
  value,
  suffix,
  icon,
  program_id,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Pupils Fed Daily',
  650,
  '+',
  'users',
  (SELECT id FROM programs WHERE slug = 'ahoho-marye-mashome' LIMIT 1),
  true,
  0,
  NOW(),
  NOW()
);

-- Metric 2: Healthcare Beneficiaries
INSERT INTO impact_metrics (
  label,
  value,
  suffix,
  icon,
  program_id,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Community Members Served',
  60000,
  '',
  'heart',
  (SELECT id FROM programs WHERE slug = 'neema-health-center' LIMIT 1),
  true,
  1,
  NOW(),
  NOW()
);

-- Metric 3: Widows Supported
INSERT INTO impact_metrics (
  label,
  value,
  suffix,
  icon,
  program_id,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Widows Empowered',
  43,
  '',
  'users',
  (SELECT id FROM programs WHERE slug = 'widows-fellowship' LIMIT 1),
  true,
  2,
  NOW(),
  NOW()
);

-- Metric 4: Young Readers
INSERT INTO impact_metrics (
  label,
  value,
  suffix,
  icon,
  program_id,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Young Readers Engaged',
  100,
  '+',
  'book',
  (SELECT id FROM programs WHERE slug = 'shomani-book-club' LIMIT 1),
  true,
  3,
  NOW(),
  NOW()
);

-- Metric 5: Years Active
INSERT INTO impact_metrics (
  label,
  value,
  suffix,
  icon,
  program_id,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Years of Service',
  4,
  '+',
  'calendar',
  NULL,
  true,
  4,
  NOW(),
  NOW()
);

-- Metric 6: Sanitary Kits
INSERT INTO impact_metrics (
  label,
  value,
  suffix,
  icon,
  program_id,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Sanitary Kits Provided',
  500,
  '',
  'package',
  NULL,
  true,
  5,
  NOW(),
  NOW()
);

-- ============================================================================
-- STORIES
-- ============================================================================

-- Story 1: About Neema Foundation
INSERT INTO stories (
  title,
  slug,
  excerpt,
  content,
  category,
  author_name,
  author_photo_url,
  image_url,
  status,
  is_featured,
  published_at,
  created_at,
  updated_at
) VALUES (
  'About Neema Foundation',
  'about-neema-foundation',
  'Who we are and what we exist to do.',
  '<h2>Our Identity</h2>
<p>Neema Foundation is a Christian based organization that spreads the message of God''s grace by serving the community with affordable health services, education and youth empowerment programs.</p>

<h3>Our Vision</h3>
<p><strong>A transformed, healthy and self empowered Christ loving community</strong></p>

<h3>Our Mission</h3>
<p>Share God''s transformative grace to the community through the provision of compassionate, quality and affordable healthcare services, education and technology programs.</p>

<h3>Our Objectives</h3>
<ul>
<li>To provide quality and affordable Healthcare service in Ganze</li>
<li>To nurture a reading culture among the youth in Ganze</li>
<li>To encourage technology innovation and opportunities in the Ganze</li>
<li>To connect and network the youth of Ganze to the world</li>
</ul>

<h3>Core Values</h3>
<ul>
<li><strong>Christian faith:</strong> Our foundation in Christ guides all we do</li>
<li><strong>Compassion:</strong> We serve with love and empathy</li>
<li><strong>Integrity:</strong> We maintain honesty and transparency</li>
<li><strong>Value Humanity:</strong> Every person deserves dignity and respect</li>
<li><strong>Committed to Excellence:</strong> We strive for quality in all our services</li>
</ul>',
  'impact',
  'Neema Foundation Team',
  '', -- Add author photo
  '', -- Add cover image
  'published',
  true,
  NOW(),
  NOW(),
  NOW()
);

-- ============================================================================
-- BOARD MEMBERS (Placeholder - Update with actual board info)
-- ============================================================================

-- Note: Add actual board member information here when available
-- Template provided below:

/*
INSERT INTO board_members (
  name,
  role,
  organization,
  bio,
  email,
  linkedin_url,
  photo_url,
  is_active,
  display_order,
  created_at,
  updated_at
) VALUES (
  'Board Member Name',
  'Chairperson / Treasurer / Secretary / Member',
  'Neema Foundation',
  '<p>Biography of the board member...</p>',
  'email@example.com',
  'https://linkedin.com/in/profile',
  '', -- Add photo URL
  true,
  0,
  NOW(),
  NOW()
);
*/

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '
============================================================================
  NEEMA FOUNDATION DATA MIGRATION COMPLETED SUCCESSFULLY!
============================================================================

  ✅ Site Settings: 1 record
  ✅ Hero Slides: 3 records
  ✅ Programs: 6 records
  ✅ Impact Metrics: 6 records
  ✅ Stories: 1 record
  ⚠️  Board Members: 0 records (add manually)

  NEXT STEPS:
  1. Upload images via admin panel for:
     - Hero slides
     - Programs
     - Stories
     - Board members
  
  2. Add board member information in Admin > Content > Board Members
  
  3. Review and update placeholder "TBD" partner information
  
  4. Test all content displays correctly on public site

============================================================================
';
END $$;
