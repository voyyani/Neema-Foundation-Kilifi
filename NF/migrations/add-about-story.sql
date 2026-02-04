-- ============================================================================
-- ADD "ABOUT NEEMA FOUNDATION" STORY
-- ============================================================================
-- Run this script to add the About story to your database

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
  '',
  '',
  'published',
  true,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  updated_at = NOW();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ About Neema Foundation story added successfully!';
END $$;
