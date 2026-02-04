-- Migration: Add Partners Table
-- Date: 2026-02-03
-- Description: Create partners table for managing organizational partners displayed in TrustBar

-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    type VARCHAR(100), -- e.g., 'Community Partner', 'Faith Partner', 'Agriculture Partner'
    description TEXT,
    website_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for featured partners
CREATE INDEX IF NOT EXISTS idx_partners_featured ON public.partners(is_featured, is_active, display_order);

-- Create index for active partners
CREATE INDEX IF NOT EXISTS idx_partners_active ON public.partners(is_active, display_order);

-- Enable Row Level Security
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Public can view active partners
CREATE POLICY "Public can view active partners"
    ON public.partners
    FOR SELECT
    USING (is_active = true);

-- Authenticated users can do everything (for admin)
CREATE POLICY "Authenticated users can manage partners"
    ON public.partners
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Insert seed data from current TrustBar
INSERT INTO public.partners (name, logo_url, type, description, is_featured, is_active, display_order)
VALUES 
    ('Dzarino CBO', 
     'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969357/Dzarnio-logo_y9trca.png', 
     'Community Partner', 
     'Women-led community organization partnering on health initiatives',
     true,
     true,
     1),
    ('KickStart International', 
     'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969470/KickStart-Logo_Color_RGB_sg1t6p.svg', 
     'Agriculture Partner', 
     'Providing water pumps and farming training for widows',
     true,
     true,
     2),
    ('ICC Mombasa', 
     NULL, 
     'Feeding Program Partner', 
     'Supporting daily porridge program for 650+ children',
     true,
     true,
     3),
    ('CITAM Mombasa', 
     'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969566/citam-logo-1_lg4qqi.png', 
     'Faith Partner', 
     'Spiritual support and community outreach collaboration',
     true,
     true,
     4);

COMMENT ON TABLE public.partners IS 'Organizational partners displayed on public site';
COMMENT ON COLUMN public.partners.is_featured IS 'Featured partners appear prominently in TrustBar';
COMMENT ON COLUMN public.partners.display_order IS 'Order in which partners are displayed (lower numbers first)';
