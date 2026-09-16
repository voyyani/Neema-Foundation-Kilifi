/**
 * Volunteer content. Roles, process and answers are the Foundation's own
 * copy carried forward from the previous page; the unsourced statistics
 * block was retired.
 */
export interface VolunteerRole {
  id: string;
  title: string;
  description: string;
  skills: string[];
  commitment: string;
  location: 'On-site' | 'Hybrid' | 'Remote' | 'Flexible';
  level: string;
}

export const ROLES: VolunteerRole[] = [
  { id: 'medical', title: 'Medical professionals', description: 'Healthcare services and medical outreach in Ganze.', skills: ['Medical', 'Field work', 'Training'], commitment: '8–20 hours a week', location: 'On-site', level: 'Professional' },
  { id: 'education', title: 'Education', description: 'Literacy programmes, book clubs and learning support.', skills: ['Teaching', 'Curriculum', 'Mentoring'], commitment: '6–15 hours a week', location: 'Hybrid', level: 'All levels' },
  { id: 'outreach', title: 'Community outreach', description: 'Work alongside local communities and run programme days.', skills: ['Events', 'Workshops', 'Coordination'], commitment: '5–12 hours a week', location: 'On-site', level: 'Beginner and up' },
  { id: 'events', title: 'Event planning', description: 'Coordinate fundraising events and community gatherings.', skills: ['Planning', 'Logistics', 'Coordination'], commitment: '4–10 hours a week', location: 'Flexible', level: 'Intermediate' },
  { id: 'admin', title: 'Administrative support', description: 'The office work that keeps the programmes running.', skills: ['Office', 'Organisation', 'Communication'], commitment: '5–15 hours a week', location: 'Remote', level: 'All levels' },
  { id: 'technical', title: 'Technical and IT', description: 'Keep the Foundation’s technology working, including this site.', skills: ['IT', 'Technical', 'Support'], commitment: '4–12 hours a week', location: 'Remote', level: 'Intermediate and up' },
];

export const JOURNEY = [
  { title: 'Application review', duration: '3–5 days', description: 'The office reads your application and skills.' },
  { title: 'Interview', duration: 'about a week', description: 'A conversation to get to know each other and find the right fit.' },
  { title: 'Orientation and training', duration: '2 weeks', description: 'Induction with the programme team you will join.' },
  { title: 'Placement', duration: 'straight after', description: 'You start in your role with a named contact.' },
  { title: 'Ongoing support', duration: 'continuous', description: 'Regular check-ins with the team.' },
  { title: 'Recognition', duration: 'quarterly', description: 'Volunteer contributions are acknowledged each quarter.' },
];

export const FAQS = [
  { question: 'What is the minimum time commitment?', answer: 'Most roles ask for 4–20 hours a week, with flexible scheduling.' },
  { question: 'Do I need specific qualifications?', answer: 'Some roles need professional qualifications; many are open to anyone committed, with training provided.' },
  { question: 'Can I volunteer remotely?', answer: 'Yes. Administrative and technical roles can be done remotely; outreach and medical roles are on the ground in Ganze.' },
  { question: 'What support will I receive?', answer: 'Induction, a named contact in your team, and regular check-ins.' },
];

export const AVAILABILITY = [
  '4-8 hours per week',
  '8-12 hours per week',
  '12-20 hours per week',
  '20+ hours per week',
  'Short-term mission trip',
  'Remote / online only',
];
