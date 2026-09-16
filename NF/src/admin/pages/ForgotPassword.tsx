import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { formatAuthError } from '../lib/authErrors';
import { useRateLimit } from '../hooks/useRateLimit';
import { Alert, Button, Field, Input } from '../../components/ui';
import AuthThreshold from '../components/auth/AuthThreshold';

/**
 * /admin/forgot-password — asks Supabase to email a recovery link that
 * lands on /admin/reset-password.
 *
 * Supabase does not reveal whether the address exists, and neither do we:
 * the "sent" state reads the same either way. Three requests per fifteen
 * minutes per device keeps the mailbox from being used to spam someone.
 */

const schema = z.object({
  email: z.string().email('Enter the email address on your staff account'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { checkRateLimit, recordAttempt, isLocked, lockoutTimeRemaining } =
    useRateLimit('forgot-password', 3, 15 * 60 * 1000);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: FormData) => {
    try {
      checkRateLimit();
    } catch (error) {
      toast.error('Too many requests', { description: (error as Error).message });
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email);
      recordAttempt(false); // every send counts toward the window, success or not
      setSent(email);
    } catch (error) {
      recordAttempt(false);
      const info = formatAuthError(error);
      toast.error(info.title, { description: info.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthThreshold
        title="Check your email"
        lede={
          <>
            If <span className="font-semibold text-content">{sent}</span> belongs to a staff account, a
            link to choose a new password is on its way. It works once and expires after an hour.
          </>
        }
        back={{ to: '/admin/login', label: 'Back to sign in' }}
      >
        <Alert status="info" className="mt-6" title="Nothing arrived?">
          Check the spam folder, make sure the address is the one your super-admin invited, then request
          another link.
        </Alert>
        <Button variant="secondary" className="mt-6" onClick={() => setSent(null)}>
          Send another link
        </Button>
      </AuthThreshold>
    );
  }

  return (
    <AuthThreshold
      title="Forgot your password?"
      lede="Enter the email on your staff account and we will send a link to choose a new one."
      back={{ to: '/admin/login', label: 'Back to sign in' }}
    >
      {isLocked && (
        <Alert status="warning" title="Requests paused" className="mt-6">
          Too many reset requests from this device. Try again in {lockoutTimeRemaining ?? 'a few minutes'}.
        </Alert>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email address" required error={errors.email?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@neemafoundation.org"
              aria-describedby={describedBy}
              invalid={invalid}
              disabled={isLoading || isLocked}
              {...register('email')}
            />
          )}
        </Field>
        <Button type="submit" size="lg" block loading={isLoading} disabled={isLoading || isLocked}>
          {isLoading ? 'Sending…' : 'Email me a reset link'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-content-3">
        Remembered it?{' '}
        <Link to="/admin/login" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthThreshold>
  );
}
