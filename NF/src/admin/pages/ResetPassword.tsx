import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Check, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import { formatAuthError } from '../lib/authErrors';
import { supabaseAdmin } from '../../lib/supabase/client';
import { Alert, Button, Field, Input } from '../../components/ui';
import AuthThreshold from '../components/auth/AuthThreshold';

/**
 * /admin/reset-password — where the recovery link lands.
 *
 * Supabase exchanges the link for a short-lived recovery session before this
 * page mounts (App.tsx captures PASSWORD_RECOVERY). If no session exists the
 * link was used, expired, or opened in a different browser, and the only
 * honest thing to show is a way to request a new one. Supabase enforces
 * one-time use and the same-password rule server-side; we surface both.
 */

const RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'A number', test: (p: string) => /\d/.test(p) },
  { label: 'An upper-case letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A lower-case letter', test: (p: string) => /[a-z]/.test(p) },
];

const schema = z
  .object({
    password: z.string().refine((p) => RULES.every((r) => r.test(p)), 'Meet every requirement listed below'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'The two passwords do not match' });
type FormData = z.infer<typeof schema>;

type LinkState = 'checking' | 'valid' | 'invalid';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [linkState, setLinkState] = useState<LinkState>('checking');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
    mode: 'onBlur',
  });
  const password = watch('password');

  // A recovery session must exist for updateUser to succeed.
  useEffect(() => {
    let cancelled = false;
    supabaseAdmin.auth.getSession().then(({ data }) => {
      if (!cancelled) setLinkState(data.session ? 'valid' : 'invalid');
    });
    // The exchange can still be in flight on a slow link; listen briefly.
    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) setLinkState('valid');
    });
    const timer = window.setTimeout(() => {
      if (!cancelled) setLinkState((s) => (s === 'checking' ? 'invalid' : s));
    }, 4000);
    return () => { cancelled = true; subscription.unsubscribe(); window.clearTimeout(timer); };
  }, []);

  const onSubmit = async ({ password }: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabaseAdmin.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success('Password updated');
      window.setTimeout(() => navigate('/admin/dashboard', { replace: true }), 1200);
    } catch (error) {
      const info = formatAuthError(error);
      toast.error(info.title, { description: info.message });
      setIsLoading(false);
    }
  };

  if (linkState === 'invalid') {
    return (
      <AuthThreshold
        title="This link has expired"
        lede="Reset links work once and for one hour, in the browser that requested them. Ask for a new one and open it on this device."
        back={{ to: '/admin/login', label: 'Back to sign in' }}
      >
        <Button to="/admin/forgot-password" size="lg" className="mt-8">
          Request a new link
        </Button>
      </AuthThreshold>
    );
  }

  if (done) {
    return (
      <AuthThreshold
        title="Password updated"
        lede="You are signed in. Taking you to the dashboard."
        back={{ to: '/admin/dashboard', label: 'Go to the dashboard now' }}
      >
        <span className="sr-only" role="status">Password updated. Redirecting to the dashboard.</span>
      </AuthThreshold>
    );
  }

  const busy = isLoading || linkState === 'checking';

  return (
    <AuthThreshold
      title="Choose a new password"
      lede="It must be different from the one you had before."
      back={{ to: '/admin/login', label: 'Back to sign in' }}
    >
      {linkState === 'checking' && (
        <Alert status="info" className="mt-6">Checking your reset link…</Alert>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="New password" required error={errors.password?.message}>
          {({ id, describedBy, invalid }) => (
            <div className="relative">
              <Input
                id={id}
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                aria-describedby={[describedBy, 'password-rules'].filter(Boolean).join(' ')}
                invalid={invalid}
                disabled={busy}
                className="pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="touch-target absolute right-0 top-1/2 -translate-y-1/2 rounded text-content-3 hover:text-content focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-600/35"
                aria-label={show ? 'Hide password' : 'Show password'}
                aria-pressed={show}
                disabled={busy}
              >
                {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          )}
        </Field>

        <ul id="password-rules" className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2" aria-label="Password requirements">
          {RULES.map((r) => {
            const met = r.test(password);
            return (
              <li key={r.label} className={clsx('flex items-center gap-2 transition-colors', met ? 'text-success-700' : 'text-content-3')}>
                <span
                  className={clsx(
                    'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                    met ? 'border-success-600 bg-success-600 text-white' : 'border-border-strong',
                  )}
                  aria-hidden="true"
                >
                  {met && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                {r.label}
              </li>
            );
          })}
        </ul>

        <Field label="Confirm new password" required error={errors.confirm?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              aria-describedby={describedBy}
              invalid={invalid}
              disabled={busy}
              {...register('confirm')}
            />
          )}
        </Field>

        <Button type="submit" size="lg" block loading={isLoading} disabled={busy}>
          {isLoading ? 'Saving…' : 'Save new password'}
        </Button>
      </form>
    </AuthThreshold>
  );
}
