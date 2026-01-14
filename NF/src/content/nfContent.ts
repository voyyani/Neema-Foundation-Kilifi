export type NFContent = {
  site?: {
    brandName?: string;
    tagline?: string;
    mission?: string;
    vision?: string;
    values?: string[];
  };
  hero?: {
    title?: string;
    subtitle?: string;
    cta?: { label?: string; href?: string };
  };
  trustBar?: {
    items?: Array<{ label?: string; value?: string }>;
  };
  impact?: {
    headline?: string;
    metrics?: Array<{ label?: string; value?: number }>;
  };
  programs?: Array<{
    id?: string;
    name?: string;
    category?: string;
    summary?: string;
    description?: string;
    beneficiaries?: { who?: string; where?: string; count?: number };
    partners?: string[];
    cta?: { label?: string; href?: string };
  }>;
  events?: Array<{
    id?: string;
    name?: string;
    dates?: { start?: string; end?: string };
    venue?: { name?: string; mapUrl?: string };
    purpose?: string;
    partners?: string[];
    registration?: { link?: string; notes?: string };
  }>;
  donate?: {
    methods?: Array<
      | { type: 'mpesa'; paybill?: string; account?: string }
      | {
          type: 'bank';
          bankName?: string;
          accountName?: string;
          accountNumber?: string;
          swift?: string;
        }
      | { type: 'stripe'; link?: string }
    >;
    currencies?: string[];
    recurring?: boolean;
  };
  bankDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    swift?: string;
    iban?: string;
    mpesa?: { paybill?: string; till?: string };
  };
  governance?: {
    board?: Array<{ name?: string; role?: string; bio?: string; photoUrl?: string }>;
    staff?: Array<{ name?: string; role?: string; bio?: string; photoUrl?: string }>;
  };
};

let cached: NFContent | null = null;

export async function loadNFContent(): Promise<NFContent> {
  if (cached) return cached;

  const res = await fetch('/nf-content.json', { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Failed to load nf-content.json (${res.status})`);
  }

  const data = (await res.json()) as NFContent;
  cached = data;
  return data;
}
