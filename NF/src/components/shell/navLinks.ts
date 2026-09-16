/**
 * Public navigation. One list, used by the navbar, the mobile menu and
 * the footer so the three never drift.
 */
export interface NavLink {
  label: string;
  to: string;
  /** Rendered in the "Get involved" group rather than the primary row */
  group?: 'primary' | 'involve';
  /** One-line description for the mobile menu and footer */
  description?: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Programmes', to: '/programs', group: 'primary', description: 'Health, education, missions and resilience in Ganze' },
  { label: 'Media', to: '/media', group: 'primary', description: 'Photographs from the programmes and events' },
  { label: 'Board', to: '/board', group: 'primary', description: 'The people accountable for the Foundation' },
  { label: 'Volunteer', to: '/volunteer', group: 'involve', description: 'Give your time in Kilifi' },
  { label: 'Partner with us', to: '/partner', group: 'involve', description: 'Organisations, churches and companies' },
  { label: 'Sponsor', to: '/sponsorship', group: 'involve', description: 'Support a child or a programme' },
  { label: 'Legacy giving', to: '/legacy-giving', group: 'involve', description: 'Leave a gift in your will' },
  { label: 'Bank details', to: '/bank-details', group: 'involve', description: 'Paybill and bank transfer details' },
];

export const PRIMARY_LINKS = NAV_LINKS.filter((l) => l.group === 'primary');
export const INVOLVE_LINKS = NAV_LINKS.filter((l) => l.group === 'involve');

export const LOGO_SRC =
  'https://res.cloudinary.com/dzqdxosk2/image/upload/f_auto,q_auto,w_96,c_limit/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png';
