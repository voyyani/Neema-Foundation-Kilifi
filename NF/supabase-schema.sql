-- ============================================================================
-- Neema Foundation Admin System - Database Schema
-- ============================================================================
-- This file contains all table definitions in the correct dependency order.
-- Run this in your Supabase SQL Editor.

-- ============================================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policies: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 2. PROGRAMS (no dependencies)
-- ============================================================================
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('health', 'education', 'empowerment', 'community', 'other')),
  summary TEXT,
  description TEXT,
  objectives TEXT[],
  activities TEXT[],
  partners TEXT[],
  beneficiary_who TEXT,
  beneficiary_where TEXT,
  beneficiary_count INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  cta_label TEXT,
  cta_href TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read active programs
CREATE POLICY "Public can view active programs" ON public.programs
  FOR SELECT USING (is_active = true);

-- Policies: Authenticated users can read all programs
CREATE POLICY "Authenticated can view all programs" ON public.programs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Editors and above can insert programs
CREATE POLICY "Editors can insert programs" ON public.programs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Policies: Editors and above can update programs
CREATE POLICY "Editors can update programs" ON public.programs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Policies: Admins can delete programs
CREATE POLICY "Admins can delete programs" ON public.programs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 3. EVENTS (depends on profiles, programs)
-- ============================================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  start_time TEXT,
  end_time TEXT,
  venue_name TEXT,
  venue_address TEXT,
  is_virtual BOOLEAN DEFAULT FALSE,
  virtual_link TEXT,
  requires_registration BOOLEAN DEFAULT FALSE,
  registration_link TEXT,
  registration_deadline TIMESTAMPTZ,
  max_attendees INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  program_id UUID REFERENCES public.programs(id),
  cover_image TEXT,
  partners TEXT[],
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read published events
CREATE POLICY "Public can view published events" ON public.events
  FOR SELECT USING (status = 'published');

-- Policies: Authenticated can view all events
CREATE POLICY "Authenticated can view all events" ON public.events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Editors can insert events
CREATE POLICY "Editors can insert events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Policies: Editors can update events
CREATE POLICY "Editors can update events" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Policies: Admins can delete events
CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 4. IMPACT METRICS (depends on programs)
-- ============================================================================
CREATE TABLE public.impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  unit TEXT,
  icon TEXT,
  description TEXT,
  year INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  program_id UUID REFERENCES public.programs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read featured metrics
CREATE POLICY "Public can view featured metrics" ON public.impact_metrics
  FOR SELECT USING (is_featured = true);

-- Policies: Authenticated can view all metrics
CREATE POLICY "Authenticated can view all metrics" ON public.impact_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Editors can manage metrics
CREATE POLICY "Editors can insert metrics" ON public.impact_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update metrics" ON public.impact_metrics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete metrics" ON public.impact_metrics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 5. STORIES / TESTIMONIALS (no dependencies)
-- ============================================================================
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author_name TEXT,
  author_role TEXT,
  author_photo TEXT,
  category TEXT CHECK (category IN ('impact', 'testimonial', 'news', 'announcement')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  cover_image TEXT,
  display_order INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read published stories
CREATE POLICY "Public can view published stories" ON public.stories
  FOR SELECT USING (is_published = true);

-- Policies: Authenticated can view all stories
CREATE POLICY "Authenticated can view all stories" ON public.stories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Editors can manage stories
CREATE POLICY "Editors can insert stories" ON public.stories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update stories" ON public.stories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete stories" ON public.stories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 6. BOARD MEMBERS (no dependencies)
-- ============================================================================
CREATE TABLE public.board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  photo TEXT,
  email TEXT,
  linkedin TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read active board members
CREATE POLICY "Public can view active board members" ON public.board_members
  FOR SELECT USING (is_active = true);

-- Policies: Authenticated can view all board members
CREATE POLICY "Authenticated can view all board members" ON public.board_members
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Admins can manage board members
CREATE POLICY "Admins can insert board members" ON public.board_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update board members" ON public.board_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete board members" ON public.board_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 7. SITE SETTINGS (singleton, no dependencies)
-- ============================================================================
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  brand_name TEXT DEFAULT 'Neema Foundation',
  tagline TEXT,
  mission TEXT,
  vision TEXT,
  values TEXT[],
  primary_color TEXT DEFAULT '#B01C2E',
  secondary_color TEXT DEFAULT '#111827',
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_youtube TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.site_settings (id) VALUES ('main');

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read settings
CREATE POLICY "Public can view settings" ON public.site_settings
  FOR SELECT USING (true);

-- Policies: Admins can update settings
CREATE POLICY "Admins can update settings" ON public.site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 8. HERO CONTENT (no dependencies)
-- ============================================================================
CREATE TABLE public.hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_label TEXT,
  cta_href TEXT,
  background_image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read active hero content
CREATE POLICY "Public can view active hero content" ON public.hero_content
  FOR SELECT USING (is_active = true);

-- Policies: Authenticated can view all hero content
CREATE POLICY "Authenticated can view all hero content" ON public.hero_content
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Editors can manage hero content
CREATE POLICY "Editors can insert hero content" ON public.hero_content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update hero content" ON public.hero_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete hero content" ON public.hero_content
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 9. TRUST BAR ITEMS (no dependencies)
-- ============================================================================
CREATE TABLE public.trust_bar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.trust_bar_items ENABLE ROW LEVEL SECURITY;

-- Policies: Public can read active items
CREATE POLICY "Public can view active trust items" ON public.trust_bar_items
  FOR SELECT USING (is_active = true);

-- Policies: Authenticated can view all items
CREATE POLICY "Authenticated can view all trust items" ON public.trust_bar_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Editors can manage items
CREATE POLICY "Editors can insert trust items" ON public.trust_bar_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Editors can update trust items" ON public.trust_bar_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete trust items" ON public.trust_bar_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 10. SUBMISSIONS (no dependencies)
-- ============================================================================
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('contact', 'volunteer', 'partnership', 'donation', 'sponsorship', 'event')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded', 'closed')),
  notes TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated users can view submissions
CREATE POLICY "Authenticated can view submissions" ON public.submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies: Public can insert submissions (for contact forms)
CREATE POLICY "Public can insert submissions" ON public.submissions
  FOR INSERT WITH CHECK (true);

-- Policies: Editors can update submissions
CREATE POLICY "Editors can update submissions" ON public.submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Policies: Admins can delete submissions
CREATE POLICY "Admins can delete submissions" ON public.submissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 11. MEDIA (depends on profiles)
-- ============================================================================
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT,
  url TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  alt TEXT,
  caption TEXT,
  folder TEXT DEFAULT '/',
  tags TEXT[],
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policies: Public can view media
CREATE POLICY "Public can view media" ON public.media
  FOR SELECT USING (true);

-- Policies: Authenticated can upload media
CREATE POLICY "Authenticated can upload media" ON public.media
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies: Users can update their own uploads
CREATE POLICY "Users can update own media" ON public.media
  FOR UPDATE USING (uploaded_by = auth.uid());

-- Policies: Admins can delete any media
CREATE POLICY "Admins can delete media" ON public.media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 12. AUDIT LOG (depends on profiles)
-- ============================================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policies: Admins can view audit log
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Policies: System can insert audit entries (via trigger)
CREATE POLICY "System can insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.impact_metrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.board_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.hero_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.trust_bar_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Events indexes
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_program_id ON public.events(program_id);
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- Programs indexes
CREATE INDEX idx_programs_category ON public.programs(category);
CREATE INDEX idx_programs_is_active ON public.programs(is_active);

-- Stories indexes
CREATE INDEX idx_stories_category ON public.stories(category);
CREATE INDEX idx_stories_is_published ON public.stories(is_published);

-- Submissions indexes
CREATE INDEX idx_submissions_type ON public.submissions(type);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at);

-- Media indexes
CREATE INDEX idx_media_folder ON public.media(folder);
CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by);

-- Audit log indexes
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_entity_type ON public.audit_log(entity_type);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Go to Authentication > Users in Supabase dashboard';
  RAISE NOTICE '   2. Create your first admin user';
  RAISE NOTICE '   3. Run this SQL to make them super admin:';
  RAISE NOTICE '      UPDATE public.profiles SET role = ''super_admin'' WHERE email = ''your@email.com'';';
  RAISE NOTICE '   4. Update .env.local with your Supabase credentials';
  RAISE NOTICE '   5. Start the dev server and login!';
END $$;
