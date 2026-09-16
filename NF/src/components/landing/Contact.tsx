/**
 * Contact — where the office is and a short form. Details come from site
 * settings; the form posts to the `send-notification` edge function with
 * the honeypot the function expects. Validation is native + plain words.
 */
import React, { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { usePublicSiteSettings } from '../../hooks/public';
import { supabase } from '../../lib/supabase/client';
import { Alert, Button, Container, Field, Input, Section, SectionHeading, Select, Textarea, Tick } from '../ui';
import { useMaintenanceFormGate } from '../maintenance/useMaintenanceFormGate';
import MaintenanceFormNotice from '../maintenance/MaintenanceFormNotice';

const SUBJECTS = [
  ['volunteer', 'Volunteering'],
  ['partnership', 'Partnership proposal'],
  ['donation', 'Donation or sponsorship'],
  ['programs', 'Programme information'],
  ['other', 'Something else'],
] as const;

type FormState = { name: string; email: string; subject: string; message: string };
type Errors = Partial<Record<keyof FormState, string>>;

const validate = (f: FormState): Errors => {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter an email address we can reply to.';
  if (!f.subject) e.subject = 'Choose what your message is about.';
  if (f.message.trim().length < 10) e.message = 'Write a few words so we know how to help.';
  return e;
};

const Contact: React.FC = () => {
  const { data: s } = usePublicSiteSettings();
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [honeypot, setHoneypot] = useState('');
  const gate = useMaintenanceFormGate({ feature: 'contact', section: 'landing:contact' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (gate.blocked) return;
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus('sending');
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: { website: honeypot, type: 'contact', ...form },
      });
      if (error) throw error;
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <Section ground="paper" pad="lg" id="contact" aria-labelledby="contact-title">
      <Container>
        <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-5">
            <SectionHeading id="contact-title" title="Write to us" lede="Questions about a programme, a visit, or how to help — the office answers every message." />
            <address className="not-italic space-y-4 text-base text-content-2">
              {s?.contact_address && (
                <p className="flex items-start gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" /><span>{s.contact_address}</span></p>
              )}
              {s?.contact_phone && (
                <p className="flex items-center gap-3"><Phone className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  <a href={`tel:${s.contact_phone.replace(/\s/g, '')}`} className="tabular underline-offset-4 hover:underline">{s.contact_phone}</a>
                  <span className="text-sm text-content-3">phone & WhatsApp</span>
                </p>
              )}
              {s?.contact_email && (
                <p className="flex items-center gap-3"><Mail className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  <a href={`mailto:${s.contact_email}`} className="underline-offset-4 hover:underline">{s.contact_email}</a>
                </p>
              )}
              <p className="border-t border-border-rule pt-4 text-sm text-content-3">Office hours: Mon–Fri 8 am – 5 pm · Sat 9 am – 1 pm (EAT)</p>
            </address>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            {status === 'sent' ? (
              <div role="status" className="flex flex-col gap-3 border-t border-border-rule pt-5">
                <Tick className="h-8 w-8" />
                <p className="font-display uppercase text-display-sm text-content">Message received</p>
                <p className="max-w-measure text-content-2">Thank you, {form.name.split(' ')[0]}. The office will reply to {form.email}.</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-6" aria-describedby={gate.rule ? 'contact-maintenance' : undefined}>
                <div id="contact-maintenance"><MaintenanceFormNotice rule={gate.rule} /></div>
                {/* honeypot: hidden from people, filled by bots */}
                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Your name" required error={errors.name}>
                    {({ id, describedBy, invalid }) => <Input id={id} name="name" autoComplete="name" value={form.name} onChange={set('name')} aria-describedby={describedBy} invalid={invalid} />}
                  </Field>
                  <Field label="Email" required error={errors.email}>
                    {({ id, describedBy, invalid }) => <Input id={id} type="email" name="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} aria-describedby={describedBy} invalid={invalid} />}
                  </Field>
                </div>
                <Field label="What is this about?" required error={errors.subject}>
                  {({ id, describedBy, invalid }) => (
                    <Select id={id} name="subject" value={form.subject} onChange={set('subject')} aria-describedby={describedBy} invalid={invalid}>
                      <option value="">Choose one</option>
                      {SUBJECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </Select>
                  )}
                </Field>
                <Field label="Message" required error={errors.message}>
                  {({ id, describedBy, invalid }) => <Textarea id={id} name="message" rows={5} value={form.message} onChange={set('message')} aria-describedby={describedBy} invalid={invalid} />}
                </Field>
                {status === 'failed' && (
                  <Alert status="danger" title="The message did not send.">
                    Check your connection and try again, or email {s?.contact_email ?? 'the office'} directly.
                  </Alert>
                )}
                <Button type="submit" size="lg" loading={status === 'sending'} disabled={gate.blocked}>
                  {gate.blocked ? 'Messages are paused' : status === 'sending' ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Contact;
