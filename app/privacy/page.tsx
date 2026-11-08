import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Miru Hindi',
  description: 'Privacy Policy for Miru Hindi Anime Streaming.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-base text-content-primary py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4 border-b border-border-subtle pb-10">
          <Link href="/" className="inline-flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors group">
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest">Back to Home</span>
          </Link>
          <h1 className="text-5xl font-serif italic tracking-tight">Privacy Policy</h1>
          <p className="text-content-tertiary font-medium">Last Updated: March 29, 2026</p>
        </header>

        <section className="prose prose-invert max-w-none space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
            <p className="text-content-secondary leading-relaxed">
              We collect minimal information to provide our services. This includes your email address when you sign up for an account. We do not collect payment information or other sensitive details.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. How We Use Information</h2>
            <p className="text-content-secondary leading-relaxed">
              Your information is used solely for the purpose of maintaining your account and providing access to our features. We do not sell or lease your personal information to third parties.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Third-Party Services</h2>
            <p className="text-content-secondary leading-relaxed">
              Miru Hindi uses third-party services for analytics and optional authentication. These services may collect information about your interactions with the site as part of their operations.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Cookies and Local Storage</h2>
            <p className="text-content-secondary leading-relaxed">
              We use cookies and browser local storage to manage your watch history, watchlist, and episode resume progress on your device without requiring you to create an account.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Security of Information</h2>
            <p className="text-content-secondary leading-relaxed">
              We take reasonable measures to protect your information from unauthorized access, loss, or theft.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">6. Children's Privacy</h2>
            <p className="text-content-secondary leading-relaxed">
              Miru Hindi is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">7. Changes to Privacy Policy</h2>
            <p className="text-content-secondary leading-relaxed">
              We reserve the right to modify this Privacy Policy at any time. Any changes will be posted on this page with an updated date.
            </p>
          </div>
        </section>

        <footer className="pt-10 border-t border-border-subtle text-center">
          <p className="text-content-tertiary text-sm">
            Questions about this policy? Contact us at legal@miruhindi.com
          </p>
        </footer>
      </div>
    </div>
  );
}
