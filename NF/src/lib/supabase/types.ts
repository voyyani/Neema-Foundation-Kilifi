export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'super_admin' | 'admin' | 'editor' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'admin' | 'editor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'admin' | 'editor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          slug: string
          name: string
          purpose: string | null
          description: string | null
          start_date: string
          end_date: string | null
          start_time: string | null
          end_time: string | null
          venue_name: string | null
          venue_address: string | null
          is_virtual: boolean
          virtual_link: string | null
          requires_registration: boolean
          registration_link: string | null
          registration_deadline: string | null
          max_attendees: number | null
          current_attendees: number
          status: 'draft' | 'published' | 'cancelled' | 'completed' | 'archived'
          is_featured: boolean
          program_id: string | null
          cover_image: string | null
          partners: string[]
          created_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          purpose?: string | null
          description?: string | null
          start_date: string
          end_date?: string | null
          start_time?: string | null
          end_time?: string | null
          venue_name?: string | null
          venue_address?: string | null
          is_virtual?: boolean
          virtual_link?: string | null
          requires_registration?: boolean
          registration_link?: string | null
          registration_deadline?: string | null
          max_attendees?: number | null
          current_attendees?: number
          status?: 'draft' | 'published' | 'cancelled' | 'completed' | 'archived'
          is_featured?: boolean
          program_id?: string | null
          cover_image?: string | null
          partners?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          purpose?: string | null
          description?: string | null
          start_date?: string
          end_date?: string | null
          start_time?: string | null
          end_time?: string | null
          venue_name?: string | null
          venue_address?: string | null
          is_virtual?: boolean
          virtual_link?: string | null
          requires_registration?: boolean
          registration_link?: string | null
          registration_deadline?: string | null
          max_attendees?: number | null
          current_attendees?: number
          status?: 'draft' | 'published' | 'cancelled' | 'completed' | 'archived'
          is_featured?: boolean
          program_id?: string | null
          cover_image?: string | null
          partners?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      programs: {
        Row: {
          id: string
          slug: string
          name: string
          category: 'health' | 'education' | 'empowerment' | 'community' | 'other' | null
          summary: string | null
          description: string | null
          objectives: string[]
          activities: string[]
          partners: string[]
          beneficiary_who: string | null
          beneficiary_where: string | null
          beneficiary_count: number | null
          is_active: boolean
          is_featured: boolean
          display_order: number
          cta_label: string | null
          cta_href: string | null
          cover_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          category?: 'health' | 'education' | 'empowerment' | 'community' | 'other' | null
          summary?: string | null
          description?: string | null
          objectives?: string[]
          activities?: string[]
          partners?: string[]
          beneficiary_who?: string | null
          beneficiary_where?: string | null
          beneficiary_count?: number | null
          is_active?: boolean
          is_featured?: boolean
          display_order?: number
          cta_label?: string | null
          cta_href?: string | null
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          category?: 'health' | 'education' | 'empowerment' | 'community' | 'other' | null
          summary?: string | null
          description?: string | null
          objectives?: string[]
          activities?: string[]
          partners?: string[]
          beneficiary_who?: string | null
          beneficiary_where?: string | null
          beneficiary_count?: number | null
          is_active?: boolean
          is_featured?: boolean
          display_order?: number
          cta_label?: string | null
          cta_href?: string | null
          cover_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          brand_name: string
          tagline: string | null
          mission: string | null
          vision: string | null
          values: string[]
          primary_color: string
          secondary_color: string
          social_facebook: string | null
          social_instagram: string | null
          social_twitter: string | null
          social_linkedin: string | null
          social_youtube: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_address: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          brand_name?: string
          tagline?: string | null
          mission?: string | null
          vision?: string | null
          values?: string[]
          primary_color?: string
          secondary_color?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          social_linkedin?: string | null
          social_youtube?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_address?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          brand_name?: string
          tagline?: string | null
          mission?: string | null
          vision?: string | null
          values?: string[]
          primary_color?: string
          secondary_color?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          social_linkedin?: string | null
          social_youtube?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_address?: string | null
          updated_at?: string
        }
      }
      partners: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          type: string | null
          description: string | null
          website_url: string | null
          is_featured: boolean
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          type?: string | null
          description?: string | null
          website_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          type?: string | null
          description?: string | null
          website_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
