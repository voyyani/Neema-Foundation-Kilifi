// types.ts
import type { LucideIcon } from 'lucide-react';

export interface Program {
    id: string;
    icon: LucideIcon;
    title: string;
    subtitle: string;
    description: string;
    fullDescription: string;
    stats: string;
    features: string[];
    color: 'red' | 'green' | 'blue' | 'purple';
    images: string[];
    status: 'active' | 'upcoming' | 'completed';
    impactMetrics: {
        beneficiaries: number;
        duration: string;
        location: string;
        startDate: string;
    };
    upcomingEvents?: ProgramEvent[];
    donationGoal?: {
        target: number;
        current: number;
        deadline: string;
        currency: string;
    };
    volunteerOpportunities: string[];
    partners?: string[];
}

export interface ProgramEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    image: string;
    registrationLink?: string;
    maxAttendees?: number;
    currentAttendees?: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface AdditionalProgram {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    status: 'active' | 'planning' | 'paused';
    launchDate?: string;
}

export interface ProgramModalProps {
    programId: string | null;
    onClose: () => void;
}

export interface ProgramFilter {
    status: ('active' | 'upcoming' | 'completed')[];
    category: string[];
    location: string[];
}

export interface ProgramsStats {
    totalPrograms: number;
    activePrograms: number;
    totalBeneficiaries: number;
    totalEvents: number;
}