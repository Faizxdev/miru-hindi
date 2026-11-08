'use client';

import React, { useEffect, useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { PasswordResetForm } from './PasswordResetForm';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToSignup={() => setMode('signup')}
            onClose={onClose}
            onForgotPassword={() => setMode('reset')}
          />
        );
      case 'signup':
        return (
          <SignupForm
            onSwitchToLogin={() => setMode('login')}
            onClose={onClose}
          />
        );
      case 'reset':
        return (
          <PasswordResetForm
            onBack={() => setMode('login')}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md sm:my-auto sm:max-w-[32rem]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 rounded-full bg-gray-800 p-2 text-white transition-colors duration-200 hover:bg-gray-700 sm:-top-3 sm:-right-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[1.4rem] border border-border-subtle bg-bg-surface/95 p-5 shadow-2xl backdrop-blur-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[1.75rem] sm:p-8">
          <div className="mb-6 space-y-3 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-accent sm:tracking-[0.28em]">
                Unlock More
              </span>
            </div>
            <h2 className="max-w-[15ch] text-2xl font-serif italic leading-tight text-white tracking-tight sm:text-3xl">
              Sign in to get all features
            </h2>
            <p className="max-w-[34ch] text-sm leading-relaxed text-content-tertiary">
              Save your watchlist, sync progress across devices, track history, and unlock your personalized Miru Hindi experience.
            </p>
          </div>

          {renderForm()}
        </div>
      </div>
    </div>
  );
};
