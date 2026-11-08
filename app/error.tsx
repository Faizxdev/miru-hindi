"use client";

import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-bg-base text-content-primary font-sans selection:bg-accent/30 selection:text-accent">
      <NewNavbar />
      
      <main className="w-full px-4 md:px-6 py-24 text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="section-heading text-4xl font-serif">Something went wrong</h1>
          <p className="section-subtitle max-w-md mx-auto text-red-400/80 italic">
            {error?.message || 'An unexpected error occurred while processing your request.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => reset()} 
            className="btn-primary px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm w-full sm:w-auto transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/20"
          >
            Try again
          </button>
          <a 
            href="/" 
            className="btn-outline px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm w-full sm:w-auto transition-all hover:scale-105 active:scale-95"
          >
            Go Home
          </a>
        </div>
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}


