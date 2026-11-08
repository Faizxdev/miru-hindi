'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import Link from 'next/link';

type AuthMode = 'login' | 'signup' | 'reset';

export default function SignInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-accent),_transparent_70%)]"></div>
        
        <div className="relative z-10 text-center space-y-8">
          <div className="w-20 h-20 mx-auto bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-accent font-serif text-3xl italic">A</span>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto"></div>
            <p className="text-content-tertiary text-sm font-medium tracking-widest uppercase">Initializing</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToSignup={() => setMode('signup')}
            onClose={() => router.push('/')}
            onForgotPassword={() => setMode('reset')}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSwitchToLogin={() => setMode('login')}
            onClose={() => router.push('/')}
          />
        );
      case 'reset':
        return (
          <PasswordResetForm
            onBack={() => setMode('login')}
            onClose={() => router.push('/')}
          />
        );
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign In';
      case 'signup':
        return 'Create Account';
      case 'reset':
        return 'Reset Password';
      default:
        return 'Authentication';
    }
  };

  const getPageDescription = () => {
    switch (mode) {
      case 'login':
        return 'Welcome back! Sign in to continue your anime journey';
      case 'signup':
        return 'Join Miru Hindi and start your anime adventure';
      case 'reset':
        return 'Enter your email to receive a password reset link';
      default:
        return 'Access your account';
    }
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans relative overflow-hidden flex flex-col md:flex-row">
      {/* Branding for desktop */}
      <div className="hidden lg:block lg:fixed top-8 left-8 z-50">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
            <span className="text-bg-base font-bold text-lg">A</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">Miru Hindi</span>
        </Link>
      </div>

      {/* Left Side: Cinematic Immersive Background */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 h-[400px] md:h-screen relative overflow-hidden bg-bg-surface">
        <div className="absolute inset-0">
          <img 
            src="/images/login-bg.png" 
            alt="Cinematic Background" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-bg-base via-bg-base/60 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg-base to-transparent"></div>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-end p-12 lg:p-24 space-y-8">
          <div className="space-y-4 max-w-xl">
            <div className="px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full w-fit">
              <span className="text-accent text-xs font-bold tracking-widest uppercase">Premium Experience</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-serif italic text-white leading-tight">
              Begin your <br/>
              <span className="text-accent not-italic font-sans font-black tracking-tighter">Anime Journey</span>
            </h2>
            <p className="text-content-secondary text-lg leading-relaxed font-medium">
              Join millions of fans in the highest quality streaming experience. <br className="hidden lg:block"/>
              Fast, beautiful, and cinematic.
            </p>
          </div>

          <div className="flex items-center space-x-8 pt-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-base bg-bg-elevated overflow-hidden ring-2 ring-accent/10">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-bg-base bg-accent flex items-center justify-center text-[10px] font-black text-bg-base shadow-lg ring-2 ring-accent/10">
                +10k
              </div>
            </div>
            <p className="text-content-tertiary text-sm font-medium">Joined the community this week</p>
          </div>
        </div>
      </div>

      {/* Right Side: Authentication Portal */}
      <div className="w-full md:w-1/2 lg:w-2/5 min-h-screen flex flex-col relative bg-bg-base items-center justify-center">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-8 left-8 right-8 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-bg-base font-bold text-sm">A</span>
            </div>
          </Link>
          <button onClick={() => router.push('/')} className="text-content-tertiary hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="w-full max-w-md px-8 py-12">
          <div className="space-y-12">
            {/* Header Text */}
            <div className="space-y-3">
              <h1 className="text-4xl font-serif italic text-white tracking-tight">
                {getPageTitle()}
              </h1>
              <p className="text-content-tertiary font-medium">
                {getPageDescription()}
              </p>
            </div>

            {/* Auth Form Container */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-accent/5 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-bg-surface/40 backdrop-blur-3xl border border-white/5 p-1 rounded-[1.8rem] shadow-2xl">
                <div className="bg-bg-base/30 rounded-[1.6rem] p-8 md:p-10">
                  {renderForm()}
                </div>
              </div>
            </div>

            {/* Mode Switcher & Navigation */}
            <div className="space-y-8 pt-4">
              {mode === 'login' && (
                <div className="text-center">
                  <button
                    onClick={() => setMode('reset')}
                    className="text-content-tertiary hover:text-accent text-sm font-medium transition-colors py-2 px-4 hover:bg-accent/5 rounded-full"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center space-x-2 text-content-tertiary hover:text-white transition-all py-3 rounded-xl border border-border-subtle/50 hover:bg-bg-surface/50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-bold text-xs uppercase tracking-widest">Back to Home</span>
                </button>

                <div className="flex items-center justify-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-content-tertiary/60">
                  <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
                  <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info in right side */}
        <div className="absolute bottom-8 text-[10px] text-content-tertiary/40 font-bold uppercase tracking-[0.2em]">
          &copy; 2026 Miru Hindi - Anime Streaming Platform
        </div>
      </div>
    </div>
  );
}
