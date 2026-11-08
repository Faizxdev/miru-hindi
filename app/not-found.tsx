import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base text-content-primary font-sans selection:bg-accent/30 selection:text-accent">
      <NewNavbar />
      
      <main className="w-full px-4 md:px-6 py-24 text-center space-y-8">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-bg-surface border border-border-subtle rounded-full flex items-center justify-center text-content-tertiary mx-auto mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="section-heading text-5xl md:text-6xl font-serif">404</h1>
          <h2 className="section-heading text-2xl font-serif">Page not found</h2>
          <p className="section-subtitle max-w-md mx-auto">
            The masterpiece you are looking for has either been moved or never existed in our collection.
          </p>
        </div>

        <div className="pt-6">
          <a 
            href="/" 
            className="btn-primary px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm inline-block transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-accent/20"
          >
            Back to Home
          </a>
        </div>
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}


