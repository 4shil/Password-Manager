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
import { Shield, AlertTriangle, Key, Loader2, Sparkles, ArrowRight, Lock } from 'lucide-react';

// Password entropy calculator
function calculateEntropy(password: string): number {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/\d/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
  return Math.round(Math.log2(Math.pow(poolSize || 1, password.length)));
}

function getEntropyLevel(entropy: number): { label: string; color: string; width: string } {
  if (entropy < 40) return { label: 'WEAK', color: 'oklch(0.60 0.25 25)', width: '25%' };
  if (entropy < 60) return { label: 'FAIR', color: 'oklch(0.75 0.18 85)', width: '50%' };
  if (entropy < 80) return { label: 'STRONG', color: 'oklch(0.75 0.18 195)', width: '75%' };
  return { label: 'MAXIMUM', color: 'oklch(0.72 0.19 155)', width: '100%' };
}

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [glyphAnimation, setGlyphAnimation] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const masterPassword = watch('masterPassword') || '';
  const entropy = calculateEntropy(masterPassword);
  const entropyLevel = getEntropyLevel(entropy);

  // Animate crypto glyphs
  useEffect(() => {
    const chars = '0123456789ABCDEF';
    const interval = setInterval(() => {
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      setGlyphAnimation(result);
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
          title: 'INITIALIZATION FAILED',
          description: authError.message,
          variant: 'destructive',
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: 'SYSTEM ERROR',
          description: 'Failed to create operator',
          variant: 'destructive',
        });
        return;
      }

      // Email confirmation required
      if (!authData.session) {
        toast({
          title: 'VERIFICATION REQUIRED',
          description: 'Check your email to confirm identity.',
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
          title: 'VAULT INITIALIZATION FAILED',
          description: dbError.message || 'Crypto setup error',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'VAULT INITIALIZED',
        description: 'Welcome to the system, operator.',
      });

      router.push('/app');
      router.refresh();
    } catch (err) {
      toast({
        title: 'CRITICAL ERROR',
        description: 'Initialization sequence aborted',
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
        className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.28 280) 0%, oklch(0.75 0.18 195) 50%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Signup card */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Terminal header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[oklch(0.08_0.01_270)] border-2 border-b-0 border-[oklch(0.25_0.02_270)]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.60_0.25_25)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.18_85)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.72_0.19_155)]" />
          </div>
          <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">
            VAULT_X://INIT/NEW_OPERATOR
          </span>
        </div>

        {/* Card */}
        <div className="p-8 bg-[oklch(0.08_0.01_270)/0.9] backdrop-blur-xl border-2 border-[oklch(0.25_0.02_270)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-[oklch(0.75_0.18_195)] mb-6 relative">
              <Key className="h-10 w-10 text-[oklch(0.75_0.18_195)]" />
              <div className="absolute inset-0 animate-pulse-glow" style={{ boxShadow: '0 0 30px oklch(0.75 0.18 195 / 0.3)' }} />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-white mb-2">
              INITIALIZE VAULT
            </h1>
            <p className="text-sm font-mono text-[oklch(0.45_0.02_270)]">
              Create your zero-knowledge encryption keys
            </p>
          </div>

          {/* Crypto animation */}
          <div className="mb-8 p-3 bg-[oklch(0.05_0.005_270)] border border-[oklch(0.20_0.02_270)] overflow-hidden">
            <div className="font-mono text-xs text-[oklch(0.35_0.02_270)] break-all">
              <span className="text-[oklch(0.55_0.28_280)]">0x</span>
              {glyphAnimation}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)]">
                OPERATOR ID
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
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)]">
                ACCOUNT PASSPHRASE
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)]">
                CONFIRM PASSPHRASE
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-[oklch(0.60_0.25_25)] font-mono flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Master Password Warning */}
            <div className="p-4 border-2 border-[oklch(0.75_0.18_85)/0.5] bg-[oklch(0.75_0.18_85)/0.1]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[oklch(0.75_0.18_85)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-[oklch(0.75_0.18_85)] mb-1">
                    CRITICAL
                  </p>
                  <p className="text-xs font-mono text-[oklch(0.45_0.02_270)]">
                    Your <span className="text-white">MASTER KEY</span> encrypts all vault data.
                    It <span className="text-[oklch(0.60_0.25_25)]">CANNOT BE RECOVERED</span> if lost.
                  </p>
                </div>
              </div>
            </div>

            {/* Master Password */}
            <div className="space-y-2">
              <Label htmlFor="masterPassword" className="text-xs uppercase tracking-widest text-[oklch(0.55_0.28_280)]">
                MASTER ENCRYPTION KEY
              </Label>
              <Input
                id="masterPassword"
                type="password"
                placeholder="••••••••••••••••"
                {...register('masterPassword')}
                disabled={isLoading}
                className="border-[oklch(0.55_0.28_280)]"
              />

              {/* Entropy meter */}
              {masterPassword && (
                <div className="space-y-2">
                  <div className="h-1 bg-[oklch(0.15_0.02_270)] overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: entropyLevel.width,
                        backgroundColor: entropyLevel.color,
                        boxShadow: `0 0 10px ${entropyLevel.color}`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[oklch(0.45_0.02_270)]">
                      ENTROPY: <span className="text-white">{entropy}</span> bits
                    </span>
                    <span style={{ color: entropyLevel.color }}>
                      {entropyLevel.label}
                    </span>
                  </div>
                </div>
              )}

              {errors.masterPassword && (
                <p className="text-xs text-[oklch(0.60_0.25_25)] font-mono flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.masterPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Master Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmMasterPassword" className="text-xs uppercase tracking-widest text-[oklch(0.55_0.28_280)]">
                CONFIRM MASTER KEY
              </Label>
              <Input
                id="confirmMasterPassword"
                type="password"
                placeholder="••••••••••••••••"
                {...register('confirmMasterPassword')}
                disabled={isLoading}
                className="border-[oklch(0.55_0.28_280)]"
              />
              {errors.confirmMasterPassword && (
                <p className="text-xs text-[oklch(0.60_0.25_25)] font-mono flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.confirmMasterPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  GENERATING KEYS...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  INITIALIZE VAULT
                </>
              )}
            </Button>

            {/* Login link */}
            <div className="text-center pt-4 border-t border-[oklch(0.25_0.02_270)]">
              <p className="text-sm font-mono text-[oklch(0.45_0.02_270)]">
                EXISTING OPERATOR?{' '}
                <Link
                  href="/login"
                  className="text-[oklch(0.75_0.18_195)] hover:underline"
                >
                  AUTHENTICATE →
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Lock className="h-4 w-4 text-[oklch(0.35_0.02_270)]" />
          <span className="text-xs font-mono text-[oklch(0.35_0.02_270)]">
            CLIENT-SIDE ENCRYPTION ONLY
          </span>
        </div>
      </div>
    </div>
  );
}
