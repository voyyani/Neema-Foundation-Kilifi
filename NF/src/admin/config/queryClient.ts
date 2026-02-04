import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  // Auth
  auth: ['auth'],
  
  // Hero
  heroSlides: ['hero', 'slides'],
  heroSlide: (id: string) => ['hero', 'slide', id],
  
  // Programs
  programs: ['programs'],
  program: (id: string) => ['program', id],
  programBySlug: (slug: string) => ['program', 'slug', slug],
  
  // Stories
  stories: ['stories'],
  story: (id: string) => ['story', id],
  storiesByCategory: (category: string) => ['stories', 'category', category],
  storiesByStatus: (status: string) => ['stories', 'status', status],
  
  // Impact Metrics
  impactMetrics: ['impact', 'metrics'],
  impactMetric: (id: string) => ['impact', 'metric', id],
  
  // Board Members
  boardMembers: ['board', 'members'],
  boardMember: (id: string) => ['board', 'member', id],
  
  // Events
  events: ['events'],
  event: (id: string) => ['event', id],
  eventsByStatus: (status: string) => ['events', 'status', status],
  
  // Users
  users: ['users'],
  user: (id: string) => ['user', id],
  
  // Site Settings
  siteSettings: ['site', 'settings'],
};
