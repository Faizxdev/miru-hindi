import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Miru Hindi',
  description: 'Terms of Service for Miru Hindi Anime Streaming.',
};

export default function TermsPage() {
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
          <h1 className="text-5xl font-serif italic tracking-tight">Terms of Service</h1>
          <p className="text-content-tertiary font-medium">Last Updated: March 29, 2026</p>
        </header>

        <section className="prose prose-invert max-w-none space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p className="text-content-secondary leading-relaxed">
              By accessing or using Miru Hindi, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Description of Service</h2>
            <p className="text-content-secondary leading-relaxed">
              Miru Hindi is an online index of anime content. We do not host any media files on our servers. Our service provides links to content hosted on third-party platforms. We operate similarly to a search engine, indexing content that is already publicly available on the internet.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. User Conduct</h2>
            <p className="text-content-secondary leading-relaxed">
              Users are responsible for their own conduct while using our service. You agree not to use Miru Hindi for any unlawful purposes or to interfere with the operation of the service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Intellectual Property</h2>
            <p className="text-content-secondary leading-relaxed">
              All trademarks, service marks, and logos used on Miru Hindi are the property of their respective owners. Miru Hindi does not claim ownership of the content indexed through its service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Disclaimer of Warranties</h2>
            <p className="text-content-secondary leading-relaxed">
              Miru Hindi is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee the availability, accuracy, or reliability of the indexed content.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">6. Limitation of Liability</h2>
            <p className="text-content-secondary leading-relaxed">
              In no event shall Miru Hindi be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">7. Changes to Terms</h2>
            <p className="text-content-secondary leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Your continued use of the service after any changes indicates your acceptance of the new terms.
            </p>
          </div>
        </section>

        <footer className="pt-10 border-t border-border-subtle text-center">
          <p className="text-content-tertiary text-sm">
            Questions about these terms? Contact us at legal@miruhindi.com
          </p>
        </footer>
      </div>
    </div>
  );
}
