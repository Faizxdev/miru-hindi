'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';

interface PasswordResetFormData {
  email: string;
}

interface PasswordResetFormProps {
  onBack: () => void;
  onClose: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBack, onClose }) => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PasswordResetFormData>();

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(data.email);
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many requests. Try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  if (success) {
    return (
      <div className="w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-2xl shadow-accent/10">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-serif italic text-white tracking-tight">Email Sent</h2>
          <p className="text-content-tertiary text-sm leading-relaxed font-medium">
            A password reset link has been sent to your email address. <br/>
            Please check your inbox to proceed.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full h-12 bg-accent text-bg-base font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-2xl hover:shadow-accent/40 active:scale-[0.98] transition-all duration-500"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.3em] text-content-tertiary ml-1">
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
            className="w-full h-12 px-5 bg-bg-surface/50 border border-border-subtle rounded-xl text-content-primary placeholder-content-tertiary/40 focus:outline-none focus:border-accent/50 focus:bg-bg-surface transition-all duration-300 shadow-inner text-sm"
            placeholder="yours@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-accent text-bg-base font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-2xl hover:shadow-accent/40 active:scale-[0.98] transition-all duration-500"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={onBack}
          className="text-content-tertiary hover:text-accent text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 mx-auto py-2 px-4 hover:bg-accent/5 rounded-full"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  );
}
