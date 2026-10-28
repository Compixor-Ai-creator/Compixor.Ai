'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Send, Loader2, CheckCircle2, ShieldCheck, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Spam honeypot
    if (honeypot.trim().length > 0) {
      setSubmitted(true);
      return;
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_name: 'contact-inquiry',
          rating: 5,
          first_name: name.trim(),
          message: `[Subject: ${subject}] [Email: ${email.trim()}]\n\n${message.trim()}`,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Your message has been sent successfully!');
      } else {
        throw new Error('Server returned an error');
      }
    } catch {
      // Fallback: allow user to open email client directly
      setErrorMsg('Unable to send message via web form. Please email support@compixor-ai.cloud directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-4">
          <Mail className="w-3.5 h-3.5" />
          Direct Support &amp; Inquiries
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-white mb-4">
          Contact Compixor AI
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Have questions about our client-side tools, need technical support, or want to report an issue? Send us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Card */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Email Us Directly</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                For general support and inquiries:
              </p>
              <a
                href="mailto:support@compixor-ai.cloud"
                className="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-1 inline-block"
              >
                support@compixor-ai.cloud
              </a>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Privacy Guarantee</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Your email is used solely to respond to your inquiry. We never send marketing newsletters or share your contact info.
              </p>
              <Link
                href="/privacy"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-2 inline-flex items-center gap-1"
              >
                Read Privacy Policy <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Learn About Us</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Compixor AI Digital Studio builds privacy-first client-side web tools.
              </p>
              <Link
                href="/about"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-2 inline-flex items-center gap-1"
              >
                About Compixor <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="glass-card p-8 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                  Thank you for reaching out. We will review your message and reply via email as soon as possible.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="btn-secondary text-xs px-5 py-2.5 mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot anti-spam */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Topic / Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Bug / Technical Issue">Bug / Technical Issue</option>
                    <option value="Tool Feature Request">Tool Feature Request</option>
                    <option value="Privacy Question">Privacy Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
