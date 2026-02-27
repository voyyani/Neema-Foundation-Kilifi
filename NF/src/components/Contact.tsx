// components/Contact.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, Loader2, AlertCircle } from 'lucide-react';
import { usePublicSiteSettings } from '../hooks/public';
import { supabase } from '../lib/supabase/client';

const easing = [0.22, 1, 0.36, 1] as const;

const Contact: React.FC = () => {
  const { data: siteSettings } = usePublicSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'contact',
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        },
      });
      if (fnError) throw fnError;
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    siteSettings?.contact_address && {
      icon: MapPin,
      label: 'Location',
      value: siteSettings.contact_address,
      href: undefined,
    },
    siteSettings?.contact_phone && {
      icon: Phone,
      label: 'Phone & WhatsApp',
      value: siteSettings.contact_phone,
      href: `tel:${siteSettings.contact_phone.replace(/\s/g, '')}`,
    },
    siteSettings?.contact_email && {
      icon: Mail,
      label: 'Email',
      value: siteSettings.contact_email,
      href: `mailto:${siteSettings.contact_email}`,
    },
    {
      icon: Clock,
      label: 'Hours',
      value: 'Mon – Fri 8 AM – 5 PM · Sat 9 AM – 1 PM',
      href: undefined,
    },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href?: string }[];

  return (
    <section id="contact" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
            <Mail className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#B01C2E]">Contact Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Get In Touch
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            We'd love to hear from you — to learn more, volunteer, or partner with us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <div className="space-y-5 mb-10">
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-gray-700 hover:text-[#B01C2E] transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Dark info band */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-950 p-8">
              <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" />
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Neema Foundation Kilifi</p>
              <p className="text-white/80 text-sm leading-relaxed">
                A Christ-centred community development organisation serving Ganze Sub-county, Kilifi County, Kenya — since 2020.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 border border-gray-100 rounded-2xl">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Send className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Message sent!</h3>
                <p className="text-sm text-gray-500">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="name" name="name" type="text" required
                      value={form.name} onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Email *
                    </label>
                    <input
                      id="email" name="email" type="email" required
                      value={form.email} onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Subject *
                  </label>
                  <select
                    id="subject" name="subject" required
                    value={form.subject} onChange={handleChange}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E] outline-none transition-colors bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="volunteer">Volunteer Enquiry</option>
                    <option value="partnership">Partnership Proposal</option>
                    <option value="donation">Donation / Sponsorship</option>
                    <option value="programs">Program Information</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="message" name="message" rows={5} required
                    value={form.message} onChange={handleChange}
                    placeholder="Tell us how we can help…"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E] outline-none transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#B01C2E] text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#8A1624] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…</>
                  ) : (
                    <>Send Message <Send className="h-4 w-4" aria-hidden="true" /></>
                  )}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
