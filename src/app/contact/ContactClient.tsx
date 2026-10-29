'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Send, Loader2, CheckCircle2, ShieldCheck, ArrowRight, MessageSquare, AlertCircle, Clock, LifeBuoy, HelpCircle, Sparkles } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
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
                className="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-1 inline-flex items-center min-h-[44px]"
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
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-2 inline-flex items-center gap-1 min-h-[44px]"
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
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-2 inline-flex items-center gap-1 min-h-[44px]"
              >
                About Compixor <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="glass-card p-5 sm:p-8 md:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80">
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
                      className="w-full px-3.5 py-3 rounded-xl text-base bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
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
                      className="w-full px-3.5 py-3 rounded-xl text-base bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
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
                    className="w-full px-3.5 py-3 rounded-xl text-base bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
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
                    className="w-full px-3.5 py-3 rounded-xl text-base bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3 min-h-[48px] inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold cursor-pointer disabled:opacity-50"
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

      {/* ============ HOW WE CAN HELP YOU SECTION ============ */}
      <section className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-3">
            <LifeBuoy className="w-3.5 h-3.5" />
            Support Channels
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
            How We Can Help You
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Our team is committed to providing prompt technical guidance, resolving browser quirks, and hearing your ideas for new tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Technical &amp; Bug Support
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Encountering an unexpected error during client-side WebAssembly rendering or Canvas transformation? Send us your browser details and error traces for rapid diagnosis.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Tool Assistance &amp; Guidance
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Need assistance selecting biometric passport sheet dimensions, AES-256 PDF encryption parameters, or vector QR error correction levels? We are happy to guide you.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              24?48 Hour Response Window
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every message sent through our form or sent to <strong className="text-zinc-900 dark:text-zinc-200 font-semibold">support@compixor-ai.cloud</strong> is reviewed by engineering within 24 to 48 business hours.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FAQS BEFORE CONTACTING SUPPORT SECTION ============ */}
      <section className="mt-16 pt-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Instant Answers
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-zinc-900 dark:text-white mb-3">
            Frequently Asked Questions Before Contacting Support
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Check our most common support questions below?you might find your answer immediately.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="glass-card p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white mb-2">
              Can you recover a file I processed on Compixor?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No. Compixor operates on a 100% zero-upload, client-side processing architecture. When you compress a PDF, generate a QR code, or format a passport photo, the file buffers reside exclusively within your device&apos;s volatile RAM. Your files never touch external cloud servers and are immediately purged the moment you close or refresh your browser tab. We have no copies of your files.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white mb-2">
              Are Compixor tools completely free for commercial use?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Yes. All tools on Compixor AI are completely free for both individual and commercial projects. We never require account signups, credit card information, artificial queue waiting limits, or forced promotional watermark stamps on your exported documents.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white mb-2">
              How do I report a browser compatibility issue?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To help us reproduce and resolve the problem swiftly, please include your exact browser name and version (e.g., Google Chrome 124, Safari 17.4), your operating system (Windows 11, macOS Sonoma, iOS, Android), the tool URL (e.g., /tools/pdf-to-word), and any error text logged in your browser&apos;s developer console.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
