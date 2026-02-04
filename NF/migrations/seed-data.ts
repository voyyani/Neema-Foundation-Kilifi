/**
 * TypeScript Data Seeding Script
 * Neema Foundation Content Population
 * 
 * This script provides a type-safe way to seed the database
 * Use this for development/testing or as reference for SQL migration
 */

import type { 
  HeroSlideInput,
  ProgramInput,
  StoryInput,
  ImpactMetricInput,
  BoardMemberInput,
  SiteSettingsInput 
} from '../src/admin/types/content';

// ============================================================================
// SITE SETTINGS
// ============================================================================

export const siteSettings: SiteSettingsInput = {
  brand_name: 'Neema Foundation',
  tagline: 'Need meets God\'s Grace',
  mission: 'Share God\'s transformative grace to the community through the provision of compassionate, quality and affordable healthcare services, education and technology programs',
  vision: 'A transformed, healthy and self empowered Christ loving community',
  values: [
    'Christian faith',
    'Compassion',
    'Integrity',
    'Value Humanity',
    'Committed to Excellence'
  ],
  primary_color: '#B01C2E',
  secondary_color: '#111827',
  contact_email: 'info@neemafoundation.org',
  contact_phone: '+254 XXX XXX XXX',
  contact_address: 'Ganze Sub-county, Kilifi County, Kenya',
  social_facebook: '',
  social_instagram: '',
  social_twitter: '',
  social_linkedin: '',
  social_youtube: ''
};

// ============================================================================
// HERO SLIDES
// ============================================================================

export const heroSlides: HeroSlideInput[] = [
  {
    title: 'Need meets God\'s Grace',
    subtitle: 'Neema Foundation is a Christian based organization that spreads the message of God\'s grace by serving the community with affordable health services, education and youth empowerment programs.',
    cta_label: 'Donate Now',
    cta_href: '/donate',
    background_image: '', // Upload via Cloudinary
    is_active: true
  },
  {
    title: 'Quality Healthcare for Ganze',
    subtitle: 'Providing affordable level 3 health services including maternity, laboratory, dental, and comprehensive HIV care to 60,000 community members.',
    cta_label: 'Learn More',
    cta_href: '/programs',
    background_image: '', // Upload via Cloudinary
    is_active: true
  },
  {
    title: 'Empowering Youth Through Education',
    subtitle: 'Feeding 650+ pupils daily and nurturing a reading culture through our resource center and book clubs across Ganze schools.',
    cta_label: 'Get Involved',
    cta_href: '/volunteer',
    background_image: '', // Upload via Cloudinary
    is_active: true
  }
];

// ============================================================================
// PROGRAMS
// ============================================================================

export const programs: ProgramInput[] = [
  {
    slug: 'neema-health-center',
    name: 'Neema Health Center',
    category: 'health',
    summary: 'Providing quality and affordable level 3 health services in Ganze.',
    description: `<h2>Comprehensive Healthcare Services</h2>
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
<p>We conduct medical camps and outreach programs while providing pharmacy and ambulatory services. Our progressive roadmap aims to expand from Level 1 to Level 3 services to better serve the community.</p>`,
    objectives: ['Provide quality and affordable Healthcare service in Ganze'],
    activities: [
      'Medical camps and outreach',
      'Pharmacy and ambulatory services',
      'Progressive roadmap from Level 1 → Level 3 services'
    ],
    partners: ['TBD'],
    beneficiary_who: 'Ganze community',
    beneficiary_where: 'Ganze Sub-county, Kilifi',
    beneficiary_count: 60000,
    is_active: true,
    is_featured: true,
    cta_label: 'Donate',
    cta_href: '/donate',
    cover_image: '' // Upload via Cloudinary
  },
  {
    slug: 'neema-resource-center',
    name: 'Neema Resource Center',
    category: 'education',
    summary: '"Shomani Kwa Furaha" — reading culture, technology and innovation for youth.',
    description: `<h2>A Hub for Learning and Innovation</h2>
<p>The Neema Resource Center is designed to nurture a reading culture and encourage technological innovation among the youth of Ganze.</p>
<h3>Facilities</h3>
<ul>
<li>Community library service with diverse book collection</li>
<li>Study and resource center for learners</li>
<li>Innovation hub (i-hub) for technology projects</li>
<li>Conference facilities for community events</li>
</ul>
<p>Our motto "Shomani Kwa Furaha" (Read with Joy) reflects our commitment to making learning enjoyable and accessible to all youth in the community.</p>`,
    objectives: [
      'To nurture a reading culture among the youth in Ganze',
      'To encourage technology innovation and opportunities in the Ganze'
    ],
    activities: [
      'Community library service',
      'Study and resource center',
      'Innovation hub (i-hub)',
      'Conference facilities'
    ],
    partners: ['TBD'],
    beneficiary_who: 'Youth and learners',
    beneficiary_where: 'Ganze Sub-county, Kilifi',
    is_active: true,
    is_featured: true,
    cta_label: 'Volunteer',
    cta_href: '/volunteer',
    cover_image: ''
  },
  {
    slug: 'ahoho-marye-mashome',
    name: 'Ahoho naMarye Mashome',
    category: 'education',
    summary: 'Feeding and education support initiatives for school children.',
    description: `<h2>Supporting Education Through Nutrition</h2>
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
</ul>`,
    objectives: ['Support education and child welfare through practical interventions'],
    activities: [
      'Porridge program support',
      'School engagement and mentorship',
      'Back-to-school support drives'
    ],
    partners: ['Nourish and Flourish (ICC Mombasa)', 'Jitambue Kijana Trust', 'TBD'],
    beneficiary_who: 'Primary school pupils',
    beneficiary_where: 'Ganze schools (Misufini, KAG, Boga)',
    beneficiary_count: 650,
    is_active: true,
    is_featured: true,
    cta_label: 'Donate',
    cta_href: '/donate',
    cover_image: ''
  },
  {
    slug: 'widows-fellowship',
    name: 'Widow Fellowship & Empowerment',
    category: 'empowerment',
    summary: 'Fellowship, trauma healing, literacy, and practical support for widows and their families.',
    description: `<h2>Supporting Widows in Our Community</h2>
<p>Our widow empowerment program provides comprehensive support to 43 widows and their families in the Ganze community through fellowship, healing, and practical assistance.</p>
<h3>Program Components</h3>
<ul>
<li><strong>Trauma Healing:</strong> Professional counseling and group therapy sessions</li>
<li><strong>Bible Literacy:</strong> Spiritual support and resource provision</li>
<li><strong>Fellowship:</strong> Regular gatherings for community building</li>
<li><strong>Economic Support:</strong> Practical assistance for families</li>
</ul>
<h3>2024 Highlights</h3>
<p>This year, our fellowship grew to 43 widows, and we conducted our Annual General Meeting with dedicated trauma healing sessions led by Rev. Jane Jilani and her team.</p>`,
    objectives: ['Strengthen community support systems and resilience'],
    activities: [
      'Trauma healing sessions',
      'Bible literacy and resource support',
      'Fellowship gatherings and support'
    ],
    partners: ['CITAM Mission Ministry', 'Renewal Project Africa', 'TBD'],
    beneficiary_who: 'Widows and their children',
    beneficiary_where: 'Ganze community',
    beneficiary_count: 43,
    is_active: true,
    is_featured: true,
    cta_label: 'Partner with us',
    cta_href: '/partnership',
    cover_image: ''
  },
  {
    slug: 'shomani-book-club',
    name: 'Shomani Book Club',
    category: 'education',
    summary: 'Reading culture initiatives and school book clubs in the community.',
    description: `<h2>Nurturing Young Readers</h2>
<p>The Shomani Book Club initiative brings reading culture to life in Ganze schools, targeting Grade 5 students across 5 schools with 20 students each.</p>
<h3>Program Structure</h3>
<ul>
<li><strong>Book Club Sensitization:</strong> Training teachers and students</li>
<li><strong>Club Launch:</strong> Official establishment in target schools</li>
<li><strong>Reading Camps:</strong> Interactive learning experiences</li>
<li><strong>Awards:</strong> Recognition through BAI Community Reading Awards</li>
</ul>
<h3>Impact</h3>
<p>Initial target: <strong>100 learners</strong> across 5 schools, with plans to expand as the program grows.</p>`,
    objectives: ['To nurture a reading culture among the youth in Ganze'],
    activities: [
      'Book club sensitization and training',
      'Book club launch',
      'Reading camps'
    ],
    partners: ['Kilifi County Library Services', 'BAI Community Reading Awards'],
    beneficiary_who: 'Learners (Grade 5 focus)',
    beneficiary_where: 'Target schools in the community',
    beneficiary_count: 100,
    is_active: true,
    is_featured: false,
    cta_label: 'Volunteer',
    cta_href: '/volunteer',
    cover_image: ''
  },
  {
    slug: 'nf-cup',
    name: 'NF Cup',
    category: 'community',
    summary: 'Sports-based youth engagement and back-to-school events.',
    description: `<h2>Youth Engagement Through Sports</h2>
<p>The NF Cup is our flagship sports initiative that brings together youth teams from across Ganze for friendly competition, mentorship, and community building.</p>
<h3>Event Highlights</h3>
<ul>
<li>Annual tournament events</li>
<li>Back-to-school editions to promote education</li>
<li>Mentorship opportunities through sports</li>
<li>Character development and teamwork</li>
</ul>
<h3>Partners</h3>
<p>The NF Cup is made possible through partnerships with Kingdom Springs, Kilifi County, CITAM, and other community stakeholders.</p>`,
    objectives: ['Youth engagement and holistic development'],
    activities: [
      'Tournament events',
      'Back-to-school editions',
      'Mentorship through sports'
    ],
    partners: ['Kingdom Springs', 'Kilifi County', 'CITAM', 'TBD'],
    beneficiary_who: 'Youth teams',
    beneficiary_where: 'Ganze community',
    is_active: true,
    is_featured: false,
    cta_label: 'Sponsor an event',
    cta_href: '/partnership',
    cover_image: ''
  }
];

// ============================================================================
// STORIES
// ============================================================================

export const stories: Omit<StoryInput, 'slug'>[] = [
  {
    title: 'About Neema Foundation',
    excerpt: 'Who we are and what we exist to do.',
    content: `<h2>Our Identity</h2>
<p>Neema Foundation is a Christian based organization that spreads the message of God's grace by serving the community with affordable health services, education and youth empowerment programs.</p>

<h3>Our Vision</h3>
<p><strong>A transformed, healthy and self empowered Christ loving community</strong></p>

<h3>Our Mission</h3>
<p>Share God's transformative grace to the community through the provision of compassionate, quality and affordable healthcare services, education and technology programs.</p>

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
</ul>`,
    category: 'impact',
    author_name: 'Neema Foundation Team',
    author_photo_url: '',
    image_url: '',
    status: 'published',
    is_featured: true
  }
];

// ============================================================================
// IMPACT METRICS  
// Note: These will need program IDs after programs are created
// ============================================================================

export const impactMetricsTemplate = [
  {
    label: 'Pupils Fed Daily',
    value: 650,
    suffix: '+',
    icon: 'users',
    programSlug: 'ahoho-marye-mashome',
    is_active: true
  },
  {
    label: 'Community Members Served',
    value: 60000,
    suffix: '',
    icon: 'heart',
    programSlug: 'neema-health-center',
    is_active: true
  },
  {
    label: 'Widows Empowered',
    value: 43,
    suffix: '',
    icon: 'users',
    programSlug: 'widows-fellowship',
    is_active: true
  },
  {
    label: 'Young Readers Engaged',
    value: 100,
    suffix: '+',
    icon: 'book',
    programSlug: 'shomani-book-club',
    is_active: true
  },
  {
    label: 'Years of Service',
    value: 4,
    suffix: '+',
    icon: 'calendar',
    programSlug: null,
    is_active: true
  },
  {
    label: 'Sanitary Kits Provided',
    value: 500,
    suffix: '',
    icon: 'package',
    programSlug: null,
    is_active: true
  }
];

// ============================================================================
// BOARD MEMBERS (Template - Update with actual data)
// ============================================================================

export const boardMembersTemplate: BoardMemberInput[] = [
  // Add actual board members here
  // Example:
  // {
  //   name: 'John Doe',
  //   role: 'Chairperson',
  //   organization: 'Neema Foundation',
  //   bio: '<p>Biography...</p>',
  //   email: 'john@example.com',
  //   linkedin_url: 'https://linkedin.com/in/johndoe',
  //   photo_url: '',
  //   is_active: true
  // }
];

// ============================================================================
// USAGE NOTES
// ============================================================================

/*
To use this seed data:

1. Import the data in your seeding script
2. Loop through arrays and call create functions
3. Handle relationships (e.g., program IDs for metrics)

Example:
```typescript
import { heroSlides, programs, impactMetricsTemplate } from './seed-data';

// Seed hero slides
for (const slide of heroSlides) {
  await createSlide(slide);
}

// Seed programs
const createdPrograms = [];
for (const program of programs) {
  const created = await createProgram(program);
  createdPrograms.push(created);
}

// Seed impact metrics with program references
for (const metric of impactMetricsTemplate) {
  const program = createdPrograms.find(p => p.slug === metric.programSlug);
  await createMetric({
    label: metric.label,
    value: metric.value,
    suffix: metric.suffix,
    icon: metric.icon,
    program_id: program?.id,
    is_active: metric.is_active
  });
}
```
*/
