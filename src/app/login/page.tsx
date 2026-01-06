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
import { Shield, Lock, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [glitch, setGlitch] = useState(false);

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
        // Trigger glitch effect on error
        setGlitch(true);
        setTimeout(() => setGlitch(false), 500);

        toast({
          title: 'ACCESS DENIED',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'ACCESS GRANTED',
        description: 'Welcome back, operator.',
      });

      router.push('/app');
      router.refresh();
    } catch (err) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 500);

      toast({
        title: 'SYSTEM ERROR',
        description: 'Connection failed. Retry.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cyber-mesh relative overflow-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cyber-grid" />

      {/* Glow orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.28 280) 0%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Login card */}
      <div className={`relative z-10 w-full max-w-md ${glitch ? 'animate-glitch' : ''}`}>
        {/* Terminal header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[oklch(0.08_0.01_270)] border-2 border-b-0 border-[oklch(0.25_0.02_270)]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.60_0.25_25)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.18_85)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.72_0.19_155)]" />
          </div>
          <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">
            VAULT_X://AUTH/LOGIN
          </span>
        </div>

        {/* Card */}
        <div className="p-8 bg-[oklch(0.08_0.01_270)/0.9] backdrop-blur-xl border-2 border-[oklch(0.25_0.02_270)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-[oklch(0.55_0.28_280)] mb-6">
              <Lock className="h-8 w-8 text-[oklch(0.75_0.18_195)]" />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-white mb-2">
              AUTHENTICATE
            </h1>
            <p className="text-sm font-mono text-[oklch(0.45_0.02_270)]">
              Enter credentials to access vault
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)]">
                IDENTIFIER
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@vault-x.io"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-[oklch(0.60_0.25_25)] font-mono flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)]">
                  PASSPHRASE
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-mono text-[oklch(0.55_0.28_280)] hover:text-[oklch(0.75_0.18_195)] transition-colors"
                >
                  RESET_KEY
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
                <p className="text-xs text-[oklch(0.60_0.25_25)] font-mono flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  ACCESS VAULT
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[oklch(0.25_0.02_270)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[oklch(0.08_0.01_270)] text-xs font-mono text-[oklch(0.35_0.02_270)]">
                  OR
                </span>
              </div>
            </div>

            {/* Signup link */}
            <div className="text-center">
              <p className="text-sm font-mono text-[oklch(0.45_0.02_270)]">
                NO VAULT?{' '}
                <Link
                  href="/signup"
                  className="text-[oklch(0.75_0.18_195)] hover:underline"
                >
                  INITIALIZE →
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Shield className="h-4 w-4 text-[oklch(0.35_0.02_270)]" />
          <span className="text-xs font-mono text-[oklch(0.35_0.02_270)]">
            ZERO-KNOWLEDGE PROTOCOL
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
