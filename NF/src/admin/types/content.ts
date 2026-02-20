// Content Management Types

// Site Settings
export interface SiteSettings {
  id: string;
  brand_name: string;
  tagline: string | null;
  mission: string | null;
  vision: string | null;
  values: string[] | null;
  primary_color: string;
  secondary_color: string;
  social_facebook: string | null;
  social_facebook_enabled: boolean | null;
  social_instagram: string | null;
  social_instagram_enabled: boolean | null;
  social_twitter: string | null;
  social_twitter_enabled: boolean | null;
  social_linkedin: string | null;
  social_linkedin_enabled: boolean | null;
  social_youtube: string | null;
  social_youtube_enabled: boolean | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  updated_at: string;
}

export interface SiteSettingsInput {
  brand_name?: string;
  tagline?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  primary_color?: string;
  secondary_color?: string;
  social_facebook?: string;
  social_facebook_enabled?: boolean;
  social_instagram?: string;
  social_instagram_enabled?: boolean;
  social_twitter?: string;
  social_twitter_enabled?: boolean;
  social_linkedin?: string;
  social_linkedin_enabled?: boolean;
  social_youtube?: string;
  social_youtube_enabled?: boolean;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
}

// Hero Content
export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  background_image: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HeroSlideInput {
  title: string;
  subtitle?: string;
  cta_label?: string;
  cta_href?: string;
  background_image?: string;
  is_active?: boolean;
}

// Programs
export type ProgramCategory = 'health' | 'education' | 'empowerment' | 'community' | 'other';

export interface Program {
  id: string;
  slug: string;
  name: string;
  category: ProgramCategory;
  summary: string | null;
  description: string | null;
  objectives: string[] | null;
  activities: string[] | null;
  partners: string[] | null;
  beneficiary_who: string | null;
  beneficiary_where: string | null;
  beneficiary_count: number | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  cta_label: string | null;
  cta_href: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  
  // Enhanced media fields
  gallery_images: string[] | null;
  video_url: string | null;
  video_thumbnail: string | null;
  
  // Donation/funding fields
  donation_goal: number | null;
  donation_current: number | null;
  donation_currency: string | null;
  donation_deadline: string | null;
  
  // Volunteer fields
  volunteer_opportunities: string[] | null;
  volunteer_slots: number | null;
  volunteer_skills_needed: string[] | null;
  
  // Content fields
  impact_statement: string | null;
  testimonials: ProgramTestimonial[] | null;
  
  // Full rich-text description (HTML)
  full_description: string | null;
  
  // SEO fields
  meta_title: string | null;
  meta_description: string | null;
  social_image: string | null;
  
  // Scheduling
  start_date: string | null;
  end_date: string | null;
}

// Testimonial type for programs
export interface ProgramTestimonial {
  name: string;
  quote: string;
  image?: string;
  role?: string;
}

export interface ProgramInput {
  name: string;
  slug?: string;
  category: ProgramCategory;
  summary?: string;
  description?: string;
  full_description?: string; // Rich HTML from the WYSIWYG editor
  objectives?: string[];
  activities?: string[];
  partners?: string[];
  beneficiary_who?: string;
  beneficiary_where?: string;
  beneficiary_count?: number;
  is_active?: boolean;
  is_featured?: boolean;
  cta_label?: string;
  cta_href?: string;
  cover_image?: string;
  
  // Enhanced media fields
  gallery_images?: string[];
  video_url?: string;
  video_thumbnail?: string;
  
  // Donation/funding fields
  donation_goal?: number;
  donation_current?: number;
  donation_currency?: string;
  donation_deadline?: string;
  
  // Volunteer fields
  volunteer_opportunities?: string[];
  volunteer_slots?: number;
  volunteer_skills_needed?: string[];
  
  // Content fields
  impact_statement?: string;
  testimonials?: ProgramTestimonial[];
  
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  social_image?: string;
  
  // Scheduling
  start_date?: string;
  end_date?: string;
}

// Stories
export type StoryCategory = 'impact' | 'testimonial' | 'news' | 'announcement' | 'event' | 'volunteer';

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  author_name: string | null;
  author_role: string | null;
  author_photo: string | null;
  cover_image: string | null;
  category: StoryCategory;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author_name?: string;
  author_role?: string;
  author_photo_url?: string; // UI field, mapped to author_photo
  image_url?: string;        // UI field, mapped to cover_image
  category: StoryCategory;
  status?: 'draft' | 'published'; // UI field, mapped to is_published
  is_featured?: boolean;
  published_at?: string;
}

// Impact Metrics
export interface ImpactMetric {
  id: string;
  label: string;
  value: number;
  suffix: string | null;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
  program_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImpactMetricInput {
  label: string;
  value: number;
  suffix?: string;
  icon?: string;
  description?: string;
  is_active?: boolean;
  program_id?: string | null;
}

// Board Members
export interface BoardMember {
  id: string;
  name: string;
  role: string;
  organization: string | null;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardMemberInput {
  name: string;
  role: string;
  organization?: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  linkedin_url?: string;
  is_active?: boolean;
}
