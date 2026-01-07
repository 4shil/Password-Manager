'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { supabase } from '@/lib/supabase/client';
import { Lock, Loader2, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setShake(true);
        setTimeout(() => setShake(false), 500);

        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'You are now logged in',
      });

      router.push('/app');
      router.refresh();
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);

      toast({
        title: 'Something went wrong',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FFFDF5] relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Decorative shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-[#FFE156] border-[3px] border-[#1a1a1a] rotate-12 hidden md:block" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-[#FF6B9D] border-[3px] border-[#1a1a1a] -rotate-6 hidden md:block" />
      <div className="absolute top-40 right-40 w-16 h-16 bg-[#A0F5D3] border-[3px] border-[#1a1a1a] rotate-45 hidden md:block" />

      {/* Login card */}
      <div className={`relative z-10 w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
        {/* Card header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#FFE156] border-[3px] border-b-0 border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF8A80] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#FFE156] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#A0F5D3] border border-[#1a1a1a]" />
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">
            Password Manager
          </span>
        </div>

        {/* Card body */}
        <div className="p-8 bg-white border-[3px] border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C4B5FD] border-[3px] border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] mb-6">
              <Lock className="h-8 w-8 text-[#1a1a1a]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[#666666]">
              Sign in to access your vault
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-[#1a1a1a]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-[#FF8A80] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-bold text-[#1a1a1a]">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#7DD3FC] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-[#FF8A80] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-[2px] border-[#e5e5e5]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-[#999999]">
                  or
                </span>
              </div>
            </div>

            {/* Signup link */}
            <div className="text-center">
              <p className="text-sm text-[#666666]">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="text-[#FF6B9D] hover:underline font-bold"
                >
                  Sign up →
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Shield className="h-4 w-4 text-[#999999]" />
          <span className="text-sm text-[#999999]">
            Your data is encrypted locally
          </span>
        </div>
      </div>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
