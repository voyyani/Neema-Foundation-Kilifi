/**
 * ApplicationModal.tsx — Volunteer Application Multi-Step Form
 * Neema Foundation Kilifi
 *
 * ✅ Fully controlled — all fields managed with useState
 * ✅ Per-step validation before advancing
 * ✅ On submit: calls send-notification Edge Function (saves to DB + emails)
 * ✅ Success + error states
 * ✅ Self-contained step management (no external step props needed)
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Send,
  Loader2,
  AlertCircle,
  User,
  Briefcase,
  ListChecks,
  Heart,
  ClipboardCheck,
} from 'lucide-react';
import type { VolunteerRole } from './types';
import { supabase } from '../../lib/supabase/client';

interface ApplicationModalProps {
  isOpen: boolean;
  roles: VolunteerRole[];
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  availability: string;
  rolePreferences: Set<string>;
  motivation: string;
  cvUrl: string;
}

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  location: '',
  experience: '',
  availability: '',
  rolePreferences: new Set(),
  motivation: '',
  cvUrl: '',
};

const STEPS = [
  { id: 1, label: 'Personal Info',    icon: User },
  { id: 2, label: 'Skills',          icon: Briefcase },
  { id: 3, label: 'Roles',           icon: ListChecks },
  { id: 4, label: 'Motivation',      icon: Heart },
  { id: 5, label: 'Review',          icon: ClipboardCheck },
] as const;

const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, roles, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const updateField = useCallback(
    (field: keyof Omit<FormState, 'rolePreferences'>, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setStepError(null);
    },
    [],
  );

  const toggleRole = useCallback((title: string) => {
    setForm((prev) => {
      const next = new Set(prev.rolePreferences);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return { ...prev, rolePreferences: next };
    });
    setStepError(null);
  }, []);

  const validateStep = useCallback(
    (step: number): string | null => {
      if (step === 1) {
        if (!form.name.trim()) return 'Full name is required.';
        if (!form.email.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
          return 'Please enter a valid email address.';
        if (!form.phone.trim()) return 'Phone number is required.';
        if (!form.location.trim()) return 'Location is required.';
      }
      if (step === 2) {
        if (!form.experience.trim()) return 'Please tell us about your experience.';
        if (!form.availability) return 'Please select your availability.';
      }
      if (step === 3) {
        if (form.rolePreferences.size === 0)
          return 'Please select at least one role you are interested in.';
      }
      if (step === 4) {
        if (!form.motivation.trim()) return 'Please share your motivation for volunteering.';
      }
      return null;
    },
    [form],
  );

  const goNext = useCallback(() => {
    const err = validateStep(currentStep);
    if (err) { setStepError(err); return; }
    setStepError(null);
    setCurrentStep((s) => Math.min(5, s + 1));
  }, [currentStep, validateStep]);

  const goPrev = useCallback(() => {
    setStepError(null);
    setCurrentStep((s) => Math.max(1, s - 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'volunteer',
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          location: form.location.trim(),
          experience: form.experience.trim(),
          availability: form.availability,
          rolePreferences: Array.from(form.rolePreferences),
          motivation: form.motivation.trim(),
          cvUrl: form.cvUrl.trim() || undefined,
        },
      });
      if (fnError) throw fnError;
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setCurrentStep(1);
      setForm(initialForm);
      setStepError(null);
      setSubmitError(null);
      setSubmitted(false);
    }, 300);
  }, [onClose]);

  if (!isOpen) return null;

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition-colors text-sm bg-white';

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Volunteer Application</h2>
              {!submitted && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].label}
                </p>
              )}
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            {submitted ? (
              /* ── Success screen ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-1">
                  Thank you, <strong>{form.name}</strong>. Your application has been received.
                </p>
                <p className="text-sm text-gray-400 max-w-sm mb-8">
                  We'll review it and get back to you at{' '}
                  <span className="text-gray-600">{form.email}</span> within 5–7 business days.
                  A confirmation email is on its way to you now.
                </p>
                <button
                  onClick={handleClose}
                  className="px-7 py-3 bg-[#B01C2E] text-white rounded-xl font-semibold text-sm hover:bg-[#8A1624] transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-8">
                  {STEPS.map((step, i) => {
                    const done = currentStep > step.id;
                    const active = currentStep === step.id;
                    return (
                      <React.Fragment key={step.id}>
                        {i > 0 && (
                          <div className={`flex-1 h-0.5 mx-1 transition-colors ${done ? 'bg-[#B01C2E]' : 'bg-gray-100'}`} />
                        )}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-[#B01C2E] border-[#B01C2E]' : active ? 'bg-white border-[#B01C2E]' : 'bg-white border-gray-200'}`}>
                            {done ? (
                              <CheckCircle className="h-4 w-4 text-white" />
                            ) : (
                              <step.icon className={`h-4 w-4 ${active ? 'text-[#B01C2E]' : 'text-gray-300'}`} />
                            )}
                          </div>
                          <span className={`text-[10px] mt-1 font-medium hidden sm:block ${active ? 'text-[#B01C2E]' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                            {step.label}
                          </span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Validation error */}
                {stepError && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-5"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{stepError}</span>
                  </motion.div>
                )}

                {/* Step content */}
                <AnimatePresence mode="wait">
                  {/* STEP 1 */}
                  {currentStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-5">
                      <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
                          <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} placeholder="Your full name" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email Address *</label>
                          <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass} placeholder="you@example.com" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
                          <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className={inputClass} placeholder="+254 7XX XXX XXX" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Location *</label>
                          <input type="text" value={form.location} onChange={(e) => updateField('location', e.target.value)} className={inputClass} placeholder="City, Country" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-5">
                      <h3 className="text-base font-bold text-gray-900">Skills &amp; Experience</h3>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Relevant Experience *</label>
                        <textarea rows={5} value={form.experience} onChange={(e) => updateField('experience', e.target.value)} className={`${inputClass} resize-none`} placeholder="Describe your skills, experience, and background…" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Availability *</label>
                        <select value={form.availability} onChange={(e) => updateField('availability', e.target.value)} className={inputClass}>
                          <option value="">Select your availability</option>
                          <option value="4-8 hours per week">4–8 hours per week</option>
                          <option value="8-12 hours per week">8–12 hours per week</option>
                          <option value="12-20 hours per week">12–20 hours per week</option>
                          <option value="20+ hours per week">20+ hours per week</option>
                          <option value="Short-term mission trip">Short-term mission trip</option>
                          <option value="Remote / online only">Remote / online only</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3 */}
                  {currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-4">
                      <h3 className="text-base font-bold text-gray-900">
                        Role Preferences
                        <span className="text-xs text-gray-400 font-normal ml-2">(select all that interest you)</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {roles.map((role) => {
                          const checked = form.rolePreferences.has(role.title);
                          return (
                            <label key={role.id} className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${checked ? 'bg-red-50 border-[#B01C2E]/30' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                              <input type="checkbox" checked={checked} onChange={() => toggleRole(role.title)} className="rounded border-gray-300 text-[#B01C2E] focus:ring-[#B01C2E] h-4 w-4" />
                              <span className={`text-sm font-medium ${checked ? 'text-[#B01C2E]' : 'text-gray-700'}`}>{role.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4 */}
                  {currentStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-5">
                      <h3 className="text-base font-bold text-gray-900">Motivation &amp; Expectations</h3>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Why do you want to volunteer with Neema Foundation? *</label>
                        <textarea rows={5} value={form.motivation} onChange={(e) => updateField('motivation', e.target.value)} className={`${inputClass} resize-none`} placeholder="Share your motivation and what you hope to achieve…" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                          CV / Resume Link
                          <span className="ml-1 normal-case text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input type="url" value={form.cvUrl} onChange={(e) => updateField('cvUrl', e.target.value)} className={inputClass} placeholder="https://drive.google.com/…" />
                        <p className="text-xs text-gray-400 mt-1.5">Upload to Google Drive / Dropbox and paste the shareable link here.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 5 — Review */}
                  {currentStep === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-5">
                      <h3 className="text-base font-bold text-gray-900">Review &amp; Submit</h3>
                      <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden text-sm">
                        {[
                          { section: 'Personal Info', items: [
                            { label: 'Name', value: form.name },
                            { label: 'Email', value: form.email },
                            { label: 'Phone', value: form.phone },
                            { label: 'Location', value: form.location },
                          ]},
                          { section: 'Skills', items: [
                            { label: 'Experience', value: form.experience.slice(0, 100) + (form.experience.length > 100 ? '…' : '') },
                            { label: 'Availability', value: form.availability },
                          ]},
                          { section: 'Roles', items: [
                            { label: 'Interested in', value: Array.from(form.rolePreferences).join(', ') || '—' },
                          ]},
                          { section: 'Motivation', items: [
                            { label: 'Motivation', value: form.motivation.slice(0, 100) + (form.motivation.length > 100 ? '…' : '') },
                            ...(form.cvUrl ? [{ label: 'CV Link', value: form.cvUrl }] : []),
                          ]},
                        ].map((group) => (
                          <div key={group.section} className="p-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">{group.section}</p>
                            <div className="space-y-1.5">
                              {group.items.map((item) => (
                                <div key={item.label} className="flex gap-2">
                                  <span className="text-gray-400 w-24 shrink-0">{item.label}</span>
                                  <span className="text-gray-700 font-medium">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {submitError && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-[#B01C2E] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#8A1624] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                        ) : (
                          <><Send className="h-4 w-4" /> Submit Application</>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                {currentStep < 5 && (
                  <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
                    <button onClick={goPrev} disabled={currentStep === 1} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button onClick={goNext} className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B01C2E] text-white rounded-xl font-semibold text-sm hover:bg-[#8A1624] transition-colors">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {currentStep === 5 && (
                  <div className="flex justify-start mt-5 pt-5 border-t border-gray-100">
                    <button onClick={goPrev} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                      <ArrowLeft className="h-4 w-4" /> Back to edit
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplicationModal;
