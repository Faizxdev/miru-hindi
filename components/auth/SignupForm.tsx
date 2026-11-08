'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';

interface SignupFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onClose }) => {
  const { signUp, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignupFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await signUp(data.email, data.password, data.displayName);
      onClose();
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
      onClose();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/popup-closed-by-user':
        return 'Sign-up popup was closed. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-up was cancelled. Please try again.';
      default:
        return 'An error occurred during sign-up. Please try again.';
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="displayName" className="block text-[10px] font-black uppercase tracking-[0.2em] text-content-tertiary ml-1">
            Display Name
          </label>
          <input
            {...register('displayName', {
              required: 'Display name is required',
              minLength: { value: 2, message: 'Too short' }
            })}
            type="text"
            id="displayName"
            className="w-full h-11 px-5 bg-bg-surface/50 border border-border-subtle rounded-xl text-content-primary placeholder-content-tertiary/40 focus:outline-none focus:border-accent/50 focus:bg-bg-surface transition-all duration-300 shadow-inner text-sm"
            placeholder="Your Alias"
          />
          {errors.displayName && (
            <p className="mt-1 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-content-tertiary ml-1">
            Email Address
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email'
              }
            })}
            type="email"
            id="email"
            className="w-full h-11 px-5 bg-bg-surface/50 border border-border-subtle rounded-xl text-content-primary placeholder-content-tertiary/40 focus:outline-none focus:border-accent/50 focus:bg-bg-surface transition-all duration-300 shadow-inner text-sm"
            placeholder="yours@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-[0.2em] text-content-tertiary ml-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Required',
                  minLength: { value: 6, message: '6+ chars' }
                })}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full h-11 px-5 pr-10 bg-bg-surface/50 border border-border-subtle rounded-xl text-content-primary placeholder-content-tertiary/40 focus:outline-none focus:border-accent/50 focus:bg-bg-surface transition-all duration-300 shadow-inner text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                </svg>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="confirmPassword" className="block text-[10px] font-black uppercase tracking-[0.2em] text-content-tertiary ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword', {
                  required: 'Required',
                  validate: value => value === password || "Mismatch"
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="w-full h-11 px-5 pr-10 bg-bg-surface/50 border border-border-subtle rounded-xl text-content-primary placeholder-content-tertiary/40 focus:outline-none focus:border-accent/50 focus:bg-bg-surface transition-all duration-300 shadow-inner text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showConfirmPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                </svg>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-accent text-bg-base font-black uppercase tracking-widest text-xs rounded-xl hover:shadow-2xl hover:shadow-accent/40 active:scale-[0.98] transition-all duration-500"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border-subtle/30"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-[0.3em] text-content-tertiary">Or continue with</span>
          <div className="flex-grow border-t border-border-subtle/30"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full h-12 bg-bg-surface/50 hover:bg-bg-surface border border-border-subtle text-content-primary font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-xs uppercase tracking-widest">Sign up with Google</span>
        </button>

        <div className="text-center">
          <p className="text-content-tertiary text-[13px] font-medium">
            Already a member?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-accent hover:underline font-bold transition-all ml-1"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
