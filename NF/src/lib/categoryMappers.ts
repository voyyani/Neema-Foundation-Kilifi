/**
 * Category mapping utilities for programs
 * Maps database categories to UI properties (icons, colors)
 */

import { 
  Stethoscope, BookOpen, Users, Trophy, 
  Heart, Activity
} from 'lucide-react';

export const categoryToIcon = {
  health: Stethoscope,
  education: BookOpen,
  empowerment: Users,
  community: Trophy,
} as const;

export const categoryToColor = {
  health: 'red',
  education: 'blue',
  empowerment: 'green',
  community: 'purple',
} as const;

export function getCategoryIcon(category: string) {
  return categoryToIcon[category as keyof typeof categoryToIcon] || Heart;
}

export function getCategoryColor(category: string) {
  return categoryToColor[category as keyof typeof categoryToColor] || 'red';
}

export function getColorClasses(color: string) {
  const colors = {
    red: 'from-red-600 to-red-700 border-red-200',
    green: 'from-green-600 to-green-700 border-green-200',
    blue: 'from-blue-600 to-blue-700 border-blue-200',
    purple: 'from-purple-600 to-purple-700 border-purple-200'
  };
  return colors[color as keyof typeof colors] || colors.red;
}

export function getEventColor(programColor: string) {
  const colors = {
    red: 'bg-red-100 text-red-800 border-red-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  } as Record<string, string>;
  return colors[programColor] || colors.red;
}
