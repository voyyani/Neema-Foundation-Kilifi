import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatAuthError } from '../lib/authErrors';
import { useRateLimit } from '../hooks/useRateLimit';
import { Alert, Button, Field, Input } from '../../components/ui';
import AuthThreshold from '../components/auth/AuthThreshold';

/**
 * /admin/login — the one door into the portal.
 *
 * The public site's "Staff sign in" links here. The page is drawn in the
 * exercise-book world so the threshold still feels like the Foundation's
 * site; the admin's own iOS-style system begins after sign-in.
 *
 * Behaviour: five failed attempts lock the form for fifteen minutes
 * (client-side; Supabase enforces its own limits server-side), the email can
 * be remembered on this device, and the visitor is returned to the page they
 * were trying to open.
 */

const loginSchema = z.object({
  email: z.string().email('Enter the email address on your staff account'),
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const REMEMBER_KEY = 'nf-remember-me';
const REMEMBERED_EMAIL_KEY = 'nf-remembered-email';

function readRemembered(): { email: string; remember: boolean } {
  try {
    const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
    return { remember, email: remember ? localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '' : '' };
  } catch {
    return { email: '', remember: false };
  }
}

function writeRemembered(email: string, remember: boolean) {
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, 'true');
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  } catch {
    /* storage unavailable — remembering is a convenience, not a requirement */
  }
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { checkRateLimit, recordAttempt, isLocked, attemptsRemaining, lockoutTimeRemaining } =
    useRateLimit('login', 5, 15 * 60 * 1000);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: (() => {
      const r = readRemembered();
      return { email: r.email, password: '', rememberMe: r.remember };
    })(),
  });

  // Already signed in: there is nothing to do here.
  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true });
  }, [authLoading, user, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      checkRateLimit();
    } catch (error) {
      toast.error('Too many attempts', { description: (error as Error).message, duration: 5000 });
      return;
    }

    setIsLoading(true);
    try {
      await signIn(data.email, data.password, data.rememberMe);
      recordAttempt(true);
      writeRemembered(data.email, data.rememberMe);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (error) {
      recordAttempt(false);
      const info = formatAuthError(error);
      toast.error(info.title, { description: info.message, duration: 5000 });
      setIsLoading(false);
    }
  };

  const disabled = isLoading || isLocked;

  return (
    <AuthThreshold
      title="Staff sign in"
      lede={
        <>
          For Foundation staff who manage the website. If you are here to give or to volunteer,{' '}
          <Link to="/" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            the website is this way
          </Link>
          .
        </>
      }
    >
      {isLocked && (
        <Alert status="warning" title="Sign-in paused" className="mt-6">
          Too many wrong attempts. Try again in {lockoutTimeRemaining ?? 'a few minutes'}, or use
          “Forgot password” below.
        </Alert>
      )}
      {!isLocked && attemptsRemaining < 5 && attemptsRemaining > 0 && (
        <Alert status="info" className="mt-6">
          {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} left before sign-in pauses for fifteen minutes.
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
              disabled={disabled}
              {...register('email')}
            />
          )}
        </Field>

        <Field label="Password" required error={errors.password?.message}>
          {({ id, describedBy, invalid }) => (
            <div className="relative">
              <Input
                id={id}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={disabled}
                className="pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="touch-target absolute right-0 top-1/2 -translate-y-1/2 rounded text-content-3 hover:text-content focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-600/35"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={disabled}
              >
                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          )}
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-content-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border-strong text-brand-600 focus:ring-brand-600/35"
              disabled={disabled}
              {...register('rememberMe')}
            />
            Remember my email on this device
          </label>
          <Link
            to="/admin/forgot-password"
            className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-600/35 rounded"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" block loading={isLoading} disabled={disabled}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-10 text-sm text-content-3">
        Protected area. Access is granted by a super-admin; there is no self-registration.
      </p>
    </AuthThreshold>
  );
}
