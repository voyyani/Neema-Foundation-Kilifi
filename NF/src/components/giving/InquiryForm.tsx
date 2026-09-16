/**
 * InquiryForm — one form for partnership, sponsorship and legacy
 * enquiries. Posts to `send-notification` as type "partnership" with the
 * enquiry kind in `partnershipType`, which is what the office already
 * receives. Validation is plain words; success is the teacher's tick.
 */
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { Alert, Button, Field, Input, Select, Textarea, Tick } from '../ui';

export interface InquiryFormProps {
  /** Options for the "kind" select: [value, label] */
  kinds: readonly (readonly [string, string])[];
  defaultKind?: string;
  kindLabel?: string;
  /** Show the organisation field */
  organisation?: boolean;
  submitLabel?: string;
  /** Shown once sent */
  thanks?: string;
  contactEmail?: string | null;
  tone?: 'paper' | 'board';
}

type F = { name: string; email: string; organization: string; kind: string; message: string };

const InquiryForm: React.FC<InquiryFormProps> = ({
  kinds, defaultKind, kindLabel = 'What kind of partnership?', organisation = true, submitLabel = 'Send enquiry',
  thanks = 'The office will reply with the next steps.', contactEmail, tone = 'paper',
}) => {
  const [f, setF] = useState<F>({ name: '', email: '', organization: '', kind: defaultKind ?? kinds[0]?.[0] ?? '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof F, string>>>({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Partial<Record<keyof F, string>> = {};
    if (!f.name.trim()) er.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) er.email = 'Enter an email address we can reply to.';
    if (f.message.trim().length < 10) er.message = 'A few words on what you have in mind helps us reply well.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus('sending');
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: { website: honeypot, type: 'partnership', name: f.name.trim(), email: f.email.trim().toLowerCase(), organization: f.organization.trim(), partnershipType: f.kind, message: f.message.trim() },
      });
      if (error) throw error;
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };
  const onBoard = tone === 'board';

  if (status === 'sent') {
    return (
      <div role="status" className={`flex flex-col gap-3 border-t pt-5 ${onBoard ? 'border-border-chalk' : 'border-border-rule'}`}>
        <Tick className="h-8 w-8" tone={tone} />
        <p className={`font-display uppercase text-display-sm ${onBoard ? 'text-content-chalk' : 'text-content'}`}>Received</p>
        <p className={`max-w-measure ${onBoard ? 'text-content-chalk-2' : 'text-content-2'}`}>Thank you, {f.name.split(' ')[0]}. {thanks}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="inq-website">Website</label>
        <input id="inq-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" required error={errors.name} tone={tone}>{({ id, describedBy, invalid }) => <Input id={id} tone={tone} autoComplete="name" value={f.name} onChange={set('name')} aria-describedby={describedBy} invalid={invalid} />}</Field>
        <Field label="Email" required error={errors.email} tone={tone}>{({ id, describedBy, invalid }) => <Input id={id} tone={tone} type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set('email')} aria-describedby={describedBy} invalid={invalid} />}</Field>
        {organisation && <Field label="Organisation" tone={tone}>{({ id }) => <Input id={id} tone={tone} autoComplete="organization" value={f.organization} onChange={set('organization')} />}</Field>}
        <Field label={kindLabel} required tone={tone}>{({ id }) => <Select id={id} tone={tone} value={f.kind} onChange={set('kind')}>{kinds.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>}</Field>
      </div>
      <Field label="What do you have in mind?" required error={errors.message} tone={tone}>{({ id, describedBy, invalid }) => <Textarea id={id} tone={tone} rows={5} value={f.message} onChange={set('message')} aria-describedby={describedBy} invalid={invalid} />}</Field>
      {status === 'failed' && (
        <Alert status="danger" title="The enquiry did not send." tone={tone}>Check your connection and try again{contactEmail ? `, or email ${contactEmail} directly` : ''}.</Alert>
      )}
      <Button type="submit" size="lg" tone={tone} loading={status === 'sending'}>{status === 'sending' ? 'Sending…' : submitLabel}</Button>
    </form>
  );
};

export default InquiryForm;
