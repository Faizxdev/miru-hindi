'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onClose: () => void;
  onForgotPassword?: () => void;
}

type LoginFormData = {
  email: string;
  password: string;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignup,
  onClose,
  onForgotPassword,
}) => {
  const { signIn, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn(data.email, data.password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 sm:p-4 animate-in fade-in slide-in-from-top-2">
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <label htmlFor="email" className="block pl-1 text-[10px] font-black uppercase tracking-[0.2em] text-content-tertiary">
            Email Address
          </label>
          <div className="relative group">
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              id="email"
              className="w-full h-12 px-5 bg-bg-surface/50 border border-border-subtle rounded-xl text-content-primary placeholder-content-tertiary/40 focus:outline-none focus:border-accent/50 focus:bg-bg-surface transition-all duration-300 shadow-inner"
              placeholder="your.email@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 pl-1 text-xs font-medium text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          <label htmlFor="password" className="block pl-1 text-[10px] font-black uppercase tracking-[0.2em] text-content-tertiary">
            Password
          </label>
          <div className="relative group">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="w-full h-12 px-5 pr-14 bg-bg-surface/50 border border-border-subtle rounded-xl text-content-primary placeholder-content-tertiary/40 focus:outline-none focus:border-accent/50 focus:bg-bg-surface transition-all duration-300 shadow-inner"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-accent transition-colors p-2"
            >
              {showPassword ? (
                <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 pl-1 text-xs font-medium text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative h-12 w-full overflow-hidden rounded-xl bg-accent text-bg-base text-xs font-black uppercase tracking-widest transition-all duration-500 hover:shadow-2xl hover:shadow-accent/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <div className="relative flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : 'Sign In'}
          </div>
        </button>
      </form>

      {onForgotPassword && (
        <div className="-mt-1 text-center sm:-mt-2">
          <button
            type="button"
            onClick={onForgotPassword}
            className="rounded-full px-3 py-2 text-xs font-medium text-content-tertiary transition-colors hover:bg-accent/5 hover:text-accent"
          >
            Forgot your password?
          </button>
        </div>
      )}

      <div className="space-y-5 sm:space-y-6">
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border-subtle/30"></div>
          <span className="mx-3 flex-shrink text-[10px] font-black uppercase tracking-[0.28em] text-content-tertiary sm:mx-4 sm:tracking-[0.3em]">Or continue with</span>
          <div className="flex-grow border-t border-border-subtle/30"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border-subtle bg-bg-surface/50 font-bold text-content-primary shadow-lg transition-all duration-300 hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-50 sm:gap-4"
        >
          <svg className="w-5 h-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-xs uppercase tracking-widest">Sign in with Google</span>
        </button>

        <div className="text-center">
          <p className="text-[13px] font-medium leading-6 text-content-tertiary">
            New to Miru Hindi?{' '}
            <button
              onClick={onSwitchToSignup}
              className="ml-1 font-bold text-accent transition-all hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
