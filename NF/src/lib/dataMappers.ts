/**
 * Data mapper utilities to transform database models to UI component props
 * Separates database schema from UI concerns
 */

import type { HeroSlide } from '../hooks/public/usePublicHeroSlides';
import type { PublicProgram } from '../hooks/public/usePublicPrograms';
import { getCategoryIcon, getCategoryColor } from './categoryMappers';

/**
 * Map database hero slide to component-friendly format
 */
export function mapHeroSlideToUI(slide: HeroSlide) {
  return {
    title: slide.title,
    subtitle: slide.subtitle,
    primaryCta: slide.cta_label ? {
      label: slide.cta_label,
      href: slide.cta_href || '/donate',
    } : undefined,
    backgroundImage: slide.background_image || '',
    order: slide.display_order,
  };
}

/**
 * Map database program to legacy Program type for compatibility
 * Enhanced to support all Phase 3 database fields
 */
export function mapProgramToLegacyFormat(program: PublicProgram) {
  // Build images array from multiple sources
  const images: string[] = [];
  
  // Add cover image first
  if (program.cover_image) {
    images.push(program.cover_image);
  }
  
  // Add gallery images
  if (program.gallery_images && program.gallery_images.length > 0) {
    images.push(...program.gallery_images);
  }
  
  // Add images from program_images table (via view/join)
  if (program.images_json && program.images_json.length > 0) {
    const imageUrls = program.images_json
      .filter(img => img.url && !images.includes(img.url))
      .map(img => img.url);
    images.push(...imageUrls);
  }

  // Build videos array
  const videos: string[] = [];
  if (program.video_url) {
    videos.push(program.video_url);
  }
  if (program.additional_videos && program.additional_videos.length > 0) {
    videos.push(...program.additional_videos.map(v => v.url));
  }

  // Build donation goal object
  const donationGoal = program.donation_goal ? {
    target: program.donation_goal,
    current: program.donation_current || 0,
    currency: program.donation_currency || 'KES',
    deadline: program.donation_deadline || '',
  } : undefined;

  // Calculate progress percentage if there's a goal
  const donationProgress = donationGoal 
    ? Math.min(100, (donationGoal.current / donationGoal.target) * 100)
    : 0;

  return {
    // Core identifiers
    id: program.slug,
    slug: program.slug,
    dbId: program.id, // Preserve database UUID for relations
    
    // Display names
    name: program.name,
    title: program.name,
    subtitle: program.category.charAt(0).toUpperCase() + program.category.slice(1),
    
    // Content
    description: program.summary,
    fullDescription: program.full_description || program.description,
    impactStatement: program.impact_statement,
    
    // Database fields
    objectives: program.objectives || [],
    activities: program.activities || [],
    partners: (program.partners || []).filter(p => p !== 'TBD'),
    features: program.features || [
      ...(program.objectives || []),
      ...(program.activities || []),
    ],
    
    // Beneficiary info
    beneficiary_who: program.beneficiary_who,
    beneficiary_where: program.beneficiary_where,
    beneficiary_count: program.beneficiary_count,
    
    // UI properties from category
    color: getCategoryColor(program.category),
    icon: getCategoryIcon(program.category),
    
    // Legacy computed stats
    stats: `${program.beneficiary_count || 'Many'} Beneficiaries | ${program.beneficiary_where || 'Ganze'}`,
    
    // Media - Images (combined from all sources)
    images,
    
    // Media - Videos
    videos,
    videoUrl: program.video_url,
    video_url: program.video_url, // Alias for compatibility
    videoThumbnail: program.video_thumbnail,
    
    // Status
    status: mapProgramStatus(program.program_status, program.is_active),
    program_status: program.program_status,
    is_active: program.is_active,
    is_featured: program.is_featured,
    
    // Dates
    launchDate: program.start_date || new Date(program.created_at).toISOString().split('T')[0],
    startDate: program.start_date,
    endDate: program.end_date,
    
    // Impact metrics
    impactMetrics: {
      beneficiaries: program.beneficiary_count || 0,
      duration: calculateDuration(program.start_date, program.end_date),
      location: program.beneficiary_where || 'Ganze Sub-county, Kilifi',
      startDate: program.start_date || new Date(program.created_at).toISOString().split('T')[0],
    },
    
    // CTAs
    cta: program.cta_label || 'Learn More',
    ctaHref: program.cta_href || '/programs',
    
    // Donation/Funding
    donationGoal,
    donationProgress,
    acceptsDonations: program.accepts_donations !== false,
    donationLink: (program as any).donation_link || null,
    
    // Volunteer opportunities
    volunteerOpportunities: program.volunteer_opportunities || [],
    volunteerSlots: program.volunteer_slots,
    volunteerCurrent: program.volunteer_current,
    volunteerSkillsNeeded: program.volunteer_skills_needed || [],
    acceptsVolunteers: program.accepts_volunteers !== false,
    volunteerLink: (program as any).volunteer_link || null,
    
    // Testimonials
    testimonials: program.testimonials || [],
    
    // SEO
    metaTitle: program.meta_title || program.name,
    metaDescription: program.meta_description || program.summary,
    socialImage: program.social_image || program.cover_image,
    
    // Coordinator
    coordinator: program.coordinator_name ? {
      name: program.coordinator_name,
      email: program.coordinator_email,
      phone: program.coordinator_phone,
    } : undefined,
    
    // Metadata
    category: program.category,
    createdAt: program.created_at,
    updatedAt: program.updated_at,
    
    // Placeholder for events (populated separately)
    upcomingEvents: [],
  };
}

/**
 * Map database program status to UI status
 */
function mapProgramStatus(
  programStatus: string | undefined, 
  isActive: boolean
): 'active' | 'upcoming' | 'completed' | 'paused' {
  if (programStatus) {
    switch (programStatus) {
      case 'active': return 'active';
      case 'upcoming': return 'upcoming';
      case 'completed': return 'completed';
      case 'archived': return 'completed';
      case 'paused': return 'paused';
      default: return isActive ? 'active' : 'completed';
    }
  }
  return isActive ? 'active' : 'completed';
}

/**
 * Calculate human-readable duration from start/end dates
 */
function calculateDuration(startDate?: string, endDate?: string): string {
  if (!startDate) return 'Ongoing';
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  // If end date is in the future, show "Since [year]"
  if (!endDate || new Date(endDate) > new Date()) {
    return `Since ${start.getFullYear()}`;
  }
  
  // Calculate difference
  const diffYears = end.getFullYear() - start.getFullYear();
  const diffMonths = end.getMonth() - start.getMonth();
  
  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  }
  
  return 'Ongoing';
}

/**
 * Get fallback data for when database is unavailable
 */
export const fallbackHeroSlide: HeroSlide = {
  id: 'fallback',
  title: 'Need meets God\'s Grace',
  subtitle: 'Neema Foundation is a Christian based organization that spreads the message of God\'s grace by serving the community with affordable health services, education and youth empowerment programs.',
  cta_label: 'Donate Now',
  cta_href: '/donate',
  background_image: '',
  is_active: true,
  display_order: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const fallbackSiteSettings = {
  brand_name: 'Neema Foundation',
  tagline: 'Need meets God\'s Grace',
  mission: 'Share God\'s transformative grace to the community through the provision of compassionate, quality and affordable healthcare services, education and technology programs',
  vision: 'A transformed, healthy and self empowered Christ loving community',
  values: ['Christian faith', 'Compassion', 'Integrity', 'Value Humanity', 'Committed to Excellence'],
  primary_color: '#B01C2E',
  secondary_color: '#111827',
};
