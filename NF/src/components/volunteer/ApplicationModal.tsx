/**
 * ApplicationModal — the volunteer application, four short pages and a
 * review, with a visible progress line, per-page validation in plain
 * words, and a clear error state on submit. Posts to `send-notification`
 * with the same payload the office already receives.
 */
import React, { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { supabase } from '../../lib/supabase/client';
import { Alert, Button, Field, Input, Modal, Select, Textarea, Tick } from '../ui';
import { AVAILABILITY, ROLES } from './data';

interface FormState {
  name: string; email: string; phone: string; location: string;
  experience: string; availability: string; roles: string[]; motivation: string; cvUrl: string;
}
const EMPTY: FormState = { name: '', email: '', phone: '', location: '', experience: '', availability: '', roles: [], motivation: '', cvUrl: '' };
const STEPS = ['About you', 'Skills and time', 'Roles', 'Why', 'Review'] as const;

const validate = (step: number, f: FormState): Partial<Record<keyof FormState, string>> => {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (step === 0) {
    if (!f.name.trim()) e.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter an email address we can reply to.';
    if (f.phone.replace(/\D/g, '').length < 9) e.phone = 'Enter a phone number, with the country code if you are outside Kenya.';
  }
  if (step === 1 && !f.availability) e.availability = 'Choose how much time you can give.';
  if (step === 2 && f.roles.length === 0) e.roles = 'Choose at least one role you are interested in.';
  if (step === 3 && f.motivation.trim().length < 20) e.motivation = 'A few sentences on why you want to volunteer helps the office place you.';
  return e;
};

export interface ApplicationModalProps { open: boolean; onClose: () => void; preselectedRole?: string }

const ApplicationModal: React.FC<ApplicationModalProps> = ({ open, onClose, preselectedRole }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY, roles: preselectedRole ? [preselectedRole] : [] }));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const toggleRole = (id: string) => {
    setForm((f) => ({ ...f, roles: f.roles.includes(id) ? f.roles.filter((r) => r !== id) : [...f.roles, id] }));
    setErrors((er) => ({ ...er, roles: undefined }));
  };
  const next = useCallback(() => {
    const e = validate(step, form);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }, [step, form]);
  const back = () => { setErrors({}); setStep((s) => Math.max(0, s - 1)); };

  const submit = async () => {
    setStatus('sending');
    try {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          website: honeypot, type: 'volunteer',
          name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(),
          location: form.location.trim(), experience: form.experience.trim(), availability: form.availability,
          rolePreferences: form.roles, motivation: form.motivation.trim(), cvUrl: form.cvUrl.trim() || undefined,
        },
      });
      if (error) throw error;
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };
  const roleNames = useMemo(() => form.roles.map((id) => ROLES.find((r) => r.id === id)?.title ?? id), [form.roles]);
  const close = () => { onClose(); if (status === 'sent') { setStep(0); setForm(EMPTY); setStatus('idle'); } };

  const footer = status === 'sent' ? (
    <Button onClick={close}>Done</Button>
  ) : (
    <>
      {step > 0 && <Button variant="secondary" onClick={back}>Back</Button>}
      {step < STEPS.length - 1
        ? <Button onClick={next}>Continue</Button>
        : <Button onClick={submit} loading={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send application'}</Button>}
    </>
  );

  return (
    <Modal open={open} onClose={close} title="Apply to volunteer" description={status === 'sent' ? undefined : `${step + 1} of ${STEPS.length} · ${STEPS[step]}`} size="lg" footer={footer}>
      {status === 'sent' ? (
        <div role="status" className="flex flex-col gap-3 py-2">
          <Tick className="h-8 w-8" />
          <p className="font-display uppercase text-display-sm text-content">Application received</p>
          <p className="max-w-measure text-content-2">Thank you, {form.name.split(' ')[0]}. The office reads every application and will reply to {form.email}.</p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (step < STEPS.length - 1) next(); else submit(); }} noValidate className="space-y-6">
          {/* progress line */}
          <ol className="flex gap-1.5" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s} className="flex-1">
                <span className={clsx('block h-1 rounded-full', i <= step ? 'bg-brand-600' : 'bg-border')} aria-hidden="true" />
                <span className="sr-only">{s}{i < step ? ' (done)' : i === step ? ' (current)' : ''}</span>
              </li>
            ))}
          </ol>
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="vol-website">Website</label>
            <input id="vol-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>

          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required error={errors.name}>{({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" value={form.name} onChange={set('name')} aria-describedby={describedBy} invalid={invalid} autoFocus />}</Field>
              <Field label="Email" required error={errors.email}>{({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} aria-describedby={describedBy} invalid={invalid} />}</Field>
              <Field label="Phone or WhatsApp" required error={errors.phone}>{({ id, describedBy, invalid }) => <Input id={id} type="tel" autoComplete="tel" inputMode="tel" placeholder="+254…" value={form.phone} onChange={set('phone')} aria-describedby={describedBy} invalid={invalid} />}</Field>
              <Field label="Where you live">{({ id }) => <Input id={id} autoComplete="address-level2" placeholder="Town, country" value={form.location} onChange={set('location')} />}</Field>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <Field label="How much time can you give?" required error={errors.availability}>
                {({ id, describedBy, invalid }) => (
                  <Select id={id} value={form.availability} onChange={set('availability')} aria-describedby={describedBy} invalid={invalid}>
                    <option value="">Choose one</option>
                    {AVAILABILITY.map((a) => <option key={a} value={a}>{a.replace(/-/g, '–')}</option>)}
                  </Select>
                )}
              </Field>
              <Field label="Relevant skills or experience" hint="Training, work, church or community experience — anything that helps us place you.">{({ id }) => <Textarea id={id} rows={4} value={form.experience} onChange={set('experience')} />}</Field>
              <Field label="Link to a CV or profile">{({ id }) => <Input id={id} type="url" inputMode="url" placeholder="https://" value={form.cvUrl} onChange={set('cvUrl')} />}</Field>
            </div>
          )}
          {step === 2 && (
            <fieldset>
              <legend className="mb-1 text-sm font-semibold text-content">Which roles interest you? <span className="font-normal text-content-3">Choose any</span></legend>
              {errors.roles && <p role="alert" className="mb-2 text-sm text-danger-600">{errors.roles}</p>}
              <ul className="divide-y divide-border-rule border-y border-border-rule">
                {ROLES.map((r) => {
                  const on = form.roles.includes(r.id);
                  return (
                    <li key={r.id}>
                      <label className="flex cursor-pointer items-start gap-3 py-3">
                        <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={on} onChange={() => toggleRole(r.id)} />
                        <span><span className="block font-semibold text-content">{r.title}</span><span className="block text-sm text-content-3">{r.commitment} · {r.location}</span></span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          )}
          {step === 3 && (
            <Field label="Why do you want to volunteer with Neema Foundation?" required error={errors.motivation}>
              {({ id, describedBy, invalid }) => <Textarea id={id} rows={6} value={form.motivation} onChange={set('motivation')} aria-describedby={describedBy} invalid={invalid} autoFocus />}
            </Field>
          )}
          {step === 4 && (
            <dl className="divide-y divide-border-rule border-y border-border-rule text-sm">
              {[['Name', form.name], ['Email', form.email], ['Phone', form.phone], ['Location', form.location || '—'], ['Availability', form.availability], ['Roles', roleNames.join(', ')], ['Experience', form.experience || '—'], ['Motivation', form.motivation]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5"><dt className="font-semibold text-content-3">{k}</dt><dd className="text-content-2 whitespace-pre-line">{v}</dd></div>
              ))}
            </dl>
          )}
          {status === 'failed' && (
            <Alert status="danger" title="The application did not send.">Check your connection and try again. Your answers are still here.</Alert>
          )}
          <button type="submit" className="sr-only">Continue</button>
        </form>
      )}
    </Modal>
  );
};

export default ApplicationModal;
