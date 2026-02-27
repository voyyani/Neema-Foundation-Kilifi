/**
 * SensitiveField
 * A secure input for sensitive payment data (account numbers, SWIFT, IBAN, etc.)
 *
 * Behaviour:
 *  - In "input" mode:    standard password-type input with show/hide toggle, used
 *                        when the admin is creating or typing a new value.
 *  - In "masked" mode:   shows the server-returned masked value (e.g. "****1234")
 *                        with a padlock icon and a "Reveal" button.
 *                        The reveal button requires the user to re-authenticate
 *                        (re-enter password) before unlocking. This prevents
 *                        shoulder-surfing in shared workspaces.
 *
 * Security notes:
 *  - Plaintext is only ever held in a temporary React state and cleared if the
 *    component unmounts before being submitted.
 *  - We do NOT store the re-auth password anywhere; it is used once and dropped.
 *  - Clipboard copy is available only after successful reveal; the clipboard is
 *    cleared after 30 s via the Clipboard API.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, EyeOff, Lock, Copy, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SensitiveFieldInputModeProps {
  mode: 'input';
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

interface SensitiveFieldMaskedModeProps {
  mode: 'masked';
  label: string;
  /** Masked value from the server, e.g. "****1234" */
  maskedValue?: string;
  /** Called when the admin successfully re-authenticates. */
  onRevealSuccess?: (plaintext: string) => void;
  /** Called whenever a reveal attempt is made (success or fail). Used for audit. */
  onRevealAttempt?: (success: boolean) => void;
  disabled?: boolean;
}

export type SensitiveFieldProps =
  | SensitiveFieldInputModeProps
  | SensitiveFieldMaskedModeProps;

// ---------------------------------------------------------------------------
// Re-auth modal
// ---------------------------------------------------------------------------

interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ReAuthModal({ isOpen, onClose, onSuccess }: ReAuthModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const inputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      // Focus the password input when modal opens
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Re-authenticate by signing in with the current user's email + supplied password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Could not determine current user email.');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (signInError) {
        setError('Incorrect password. Please try again.');
        setPassword('');
        inputRef.current?.focus();
        return;
      }

      onSuccess();
    } catch (err) {
      setError((err as Error).message ?? 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Identity verification</h3>
                  <p className="text-xs text-gray-500">Re-enter your password to reveal this field</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {error && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm
                               font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !password.trim()}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm
                               font-medium hover:bg-amber-700 disabled:opacity-50
                               disabled:cursor-not-allowed transition-colors
                               inline-flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const CLIPBOARD_CLEAR_MS = 30_000;

export function SensitiveField(props: SensitiveFieldProps) {
  // ── Input mode ─────────────────────────────────────────────────────────
  if (props.mode === 'input') {
    return <SensitiveInput {...props} />;
  }
  // ── Masked mode ────────────────────────────────────────────────────────
  return <MaskedDisplay {...props} />;
}

// ---------------------------------------------------------------------------
// Input mode subcomponent
// ---------------------------------------------------------------------------

function SensitiveInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  hint,
}: SensitiveFieldInputModeProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        <span className="ml-2 text-xs text-amber-600 font-normal">Sensitive</span>
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={[
            'w-full pr-10 pl-3 py-2 border rounded-lg text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
          ].join(' ')}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-gray-600 transition-colors"
          title={visible ? 'Hide' : 'Show'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Masked display subcomponent (read-only with re-auth reveal)
// ---------------------------------------------------------------------------

function MaskedDisplay({
  label,
  maskedValue,
  onRevealSuccess,
  onRevealAttempt,
  disabled,
}: SensitiveFieldMaskedModeProps) {
  const [revealed, setRevealed]     = useState(false);
  const [plaintext, setPlaintext]   = useState('');
  const [reAuthOpen, setReAuthOpen] = useState(false);
  const [copied, setCopied]         = useState(false);
  const clearTimerRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear plaintext when the component unmounts
  useEffect(() => {
    return () => {
      setPlaintext('');
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  const handleRevealClick = () => {
    if (disabled) return;
    if (!maskedValue) return;
    setReAuthOpen(true);
  };

  const handleReAuthSuccess = useCallback(() => {
    setReAuthOpen(false);
    setRevealed(true);
    onRevealAttempt?.(true);

    // In a real scenario the plaintext would come from an explicit /decrypt
    // Edge Function call made after auth success. For now we surface the
    // masked value and note that full decryption requires additional Phase 3 wiring.
    const value = maskedValue ?? '';
    setPlaintext(value);
    onRevealSuccess?.(value);

    // Auto-hide after 60 s
    clearTimerRef.current = setTimeout(() => {
      setRevealed(false);
      setPlaintext('');
    }, 60_000);
  }, [maskedValue, onRevealAttempt, onRevealSuccess]);

  const handleReAuthClose = () => {
    setReAuthOpen(false);
    onRevealAttempt?.(false);
  };

  const handleCopy = useCallback(async () => {
    if (!plaintext) return;
    try {
      await navigator.clipboard.writeText(plaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Clear clipboard after 30 s
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(async () => {
        try { await navigator.clipboard.writeText(''); } catch { /* noop */ }
      }, CLIPBOARD_CLEAR_MS);
    } catch { /* noop */ }
  }, [plaintext]);

  const displayValue = revealed ? plaintext : (maskedValue ?? '—');

  return (
    <>
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <Lock className="w-3 h-3 text-amber-500" />
          <span className="text-xs text-amber-600 font-normal">Encrypted</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={[
              'flex-1 px-3 py-2 border rounded-lg text-sm',
              'bg-gray-50 border-gray-200 font-mono',
              revealed ? 'text-gray-900' : 'text-gray-500 tracking-widest',
            ].join(' ')}
          >
            {displayValue}
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={handleRevealClick}
              disabled={disabled || !maskedValue}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-amber-300
                         text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Reveal
            </button>
          ) : (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300
                           text-gray-700 bg-white hover:bg-gray-50 transition-colors
                           inline-flex items-center gap-1.5"
                title="Copy to clipboard (cleared in 30 s)"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => { setRevealed(false); setPlaintext(''); }}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300
                           text-gray-700 bg-white hover:bg-gray-50 transition-colors
                           inline-flex items-center gap-1.5"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Hide
              </button>
            </div>
          )}
        </div>

        {revealed && (
          <p className="mt-1 text-xs text-amber-600">
            Auto-hidden in 60 s · Clipboard cleared in 30 s
          </p>
        )}
      </div>

      <ReAuthModal
        isOpen={reAuthOpen}
        onClose={handleReAuthClose}
        onSuccess={handleReAuthSuccess}
      />
    </>
  );
}
