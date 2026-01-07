'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { signupSchema, type SignupInput } from '@/lib/validators';
import { supabase } from '@/lib/supabase/client';
import { generateSalt, deriveKEK } from '@/lib/crypto/derive';
import { generateVaultKey, wrapVaultKey } from '@/lib/crypto/keys';
import { Shield, AlertCircle, Key, Loader2, Sparkles, Lock } from 'lucide-react';

// Password strength calculator
function calculateStrength(password: string): number {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/\d/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
  return Math.round(Math.log2(Math.pow(poolSize || 1, password.length)));
}

function getStrengthLevel(strength: number): { label: string; color: string; bg: string; width: string } {
  if (strength < 40) return { label: 'Weak', color: '#FF8A80', bg: '#FFE5E2', width: '25%' };
  if (strength < 60) return { label: 'Okay', color: '#FFB74D', bg: '#FFF3E0', width: '50%' };
  if (strength < 80) return { label: 'Strong', color: '#7DD3FC', bg: '#E0F7FF', width: '75%' };
  return { label: 'Very Strong', color: '#A0F5D3', bg: '#E8FFF5', width: '100%' };
}

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const masterPassword = watch('masterPassword') || '';
  const strength = calculateStrength(masterPassword);
  const strengthLevel = getStrengthLevel(strength);

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);

    try {
      // Create Supabase user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        toast({
          title: 'Signup failed',
          description: authError.message,
          variant: 'destructive',
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: 'Something went wrong',
          description: 'Could not create account',
          variant: 'destructive',
        });
        return;
      }

      // Email confirmation required
      if (!authData.session) {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link.',
        });
        router.push('/confirm-email');
        return;
      }

      // Generate crypto materials
      const salt = generateSalt();
      const kek = await deriveKEK(data.masterPassword, salt);
      const vaultKey = await generateVaultKey();
      const { wrappedB64, ivB64 } = await wrapVaultKey(vaultKey, kek);

      // Store wrapped vault key
      const { error: dbError } = await supabase.from('user_keys').insert({
        user_id: authData.user.id,
        kdf: 'pbkdf2-sha256',
        kdf_iterations: 200000,
        salt,
        vault_key_wrapped: wrappedB64,
        vk_iv: ivB64,
      });

      if (dbError) {
        toast({
          title: 'Setup failed',
          description: dbError.message || 'Could not set up encryption',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Account created!',
        description: 'Welcome to your password vault.',
      });

      router.push('/app');
      router.refresh();
    } catch (err) {
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
      <div className="absolute top-10 right-32 w-40 h-40 bg-[#FF6B9D] border-[3px] border-[#1a1a1a] -rotate-12 hidden md:block" />
      <div className="absolute bottom-32 left-20 w-28 h-28 bg-[#7DD3FC] border-[3px] border-[#1a1a1a] rotate-6 hidden md:block" />
      <div className="absolute top-1/3 left-32 w-20 h-20 bg-[#A0F5D3] border-[3px] border-[#1a1a1a] rotate-45 hidden md:block" />

      {/* Signup card */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Card header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#A0F5D3] border-[3px] border-b-0 border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF8A80] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#FFE156] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#A0F5D3] border border-[#1a1a1a]" />
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">
            Create Account
          </span>
        </div>

        {/* Card body */}
        <div className="p-8 bg-white border-[3px] border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFE156] border-[3px] border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] mb-6">
              <Key className="h-10 w-10 text-[#1a1a1a]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
              Create your vault
            </h1>
            <p className="text-sm text-[#666666]">
              Set up your secure password manager
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
              <Label htmlFor="password" className="text-sm font-bold text-[#1a1a1a]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-bold text-[#1a1a1a]">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-[#FF8A80] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Master Password Warning */}
            <div className="p-4 bg-[#FFF3E0] border-[3px] border-[#1a1a1a]">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#FFB74D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-1">
                    Important
                  </p>
                  <p className="text-sm text-[#666666]">
                    Your <span className="font-bold">Master Password</span> encrypts all your data.
                    If you forget it, <span className="text-[#FF8A80] font-bold">we cannot recover it</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Master Password */}
            <div className="space-y-2">
              <Label htmlFor="masterPassword" className="text-sm font-bold text-[#FF6B9D]">
                Master Password
              </Label>
              <Input
                id="masterPassword"
                type="password"
                placeholder="••••••••••••••••"
                {...register('masterPassword')}
                disabled={isLoading}
                className="border-[#FF6B9D]"
              />

              {/* Strength meter */}
              {masterPassword && (
                <div className="space-y-2">
                  <div className="h-2 bg-[#F5F5F5] border-[2px] border-[#1a1a1a] overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: strengthLevel.width,
                        backgroundColor: strengthLevel.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#666666]">
                      Strength: <span className="font-bold text-[#1a1a1a]">{strength} bits</span>
                    </span>
                    <span
                      className="font-bold px-2 py-0.5 border-[2px] border-[#1a1a1a]"
                      style={{ backgroundColor: strengthLevel.color }}
                    >
                      {strengthLevel.label}
                    </span>
                  </div>
                </div>
              )}

              {errors.masterPassword && (
                <p className="text-sm text-[#FF8A80] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.masterPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Master Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmMasterPassword" className="text-sm font-bold text-[#FF6B9D]">
                Confirm Master Password
              </Label>
              <Input
                id="confirmMasterPassword"
                type="password"
                placeholder="••••••••••••••••"
                {...register('confirmMasterPassword')}
                disabled={isLoading}
                className="border-[#FF6B9D]"
              />
              {errors.confirmMasterPassword && (
                <p className="text-sm text-[#FF8A80] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.confirmMasterPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" variant="pink" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            {/* Login link */}
            <div className="text-center pt-4 border-t-[2px] border-[#e5e5e5]">
              <p className="text-sm text-[#666666]">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#7DD3FC] hover:underline font-bold"
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Lock className="h-4 w-4 text-[#999999]" />
          <span className="text-sm text-[#999999]">
            Your passwords are encrypted on your device
          </span>
        </div>
      </div>
    </div>
  );
}
