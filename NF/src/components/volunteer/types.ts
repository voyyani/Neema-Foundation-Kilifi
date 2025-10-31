// src/components/volunteer/types.ts
import type { LucideIcon } from 'lucide-react';

export interface VolunteerStats {
  value: string;
  label: string;
}

export interface VolunteerRole {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  skills: string[];
  commitment: string;
  location: string;
  level: string;
}

export interface JourneyStep {
  step: number;
  title: string;
  duration: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  stats: string;
}

export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ApplicationStepProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

export interface FilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}