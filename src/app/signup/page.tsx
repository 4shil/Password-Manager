'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { signupSchema, type SignupInput } from '@/lib/validators';
import { supabase } from '@/lib/supabase/client';
import { generateSalt, deriveKEK } from '@/lib/crypto/derive';
import { generateVaultKey, wrapVaultKey } from '@/lib/crypto/keys';
import { Shield, AlertTriangle, Mail, Lock, KeyRound, Loader2, Sparkles, ArrowRight, Check, X } from 'lucide-react';

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-warning' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-accent' };
  return { score, label: 'Strong', color: 'bg-success' };
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
  const strength = getPasswordStrength(masterPassword);

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);

    try {
      // 1. Create Supabase user
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
          title: 'Error',
          description: 'Failed to create user',
          variant: 'destructive',
        });
        return;
      }

      // If email confirmation required
      if (!authData.session) {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link. Please verify your email to continue.',
        });

        const base = process.env.NEXT_PUBLIC_BASE_URL || undefined;
        if (base) {
          window.location.href = `${base}/confirm-email`;
        } else {
          router.push('/confirm-email');
        }
        return;
      }

      // 2. Generate crypto materials
      const salt = generateSalt();
      const kek = await deriveKEK(data.masterPassword, salt);
      const vaultKey = await generateVaultKey();
      const { wrappedB64, ivB64 } = await wrapVaultKey(vaultKey, kek);

      // 3. Store wrapped vault key
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
          description: dbError.message || 'Failed to initialize vault',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Vault Created!',
        description: 'Your secure vault is ready to use',
      });

      router.push('/app');
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="hero-mesh" />
      <div className="noise" />

      <Card className="w-full max-w-md relative z-10 glass-card border-border/50 page-enter">
        <CardHeader className="space-y-4 text-center pb-2">
          {/* Logo */}
          <div className="mx-auto relative">
            <div className="absolute inset-0 rounded-2xl gradient-primary opacity-20 blur-xl scale-150" />
            <div className="relative w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Create your vault</CardTitle>
            <CardDescription className="text-base">
              Set up your zero-knowledge password manager
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  disabled={isLoading}
                  className="pl-11"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Account Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Account Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                  className="pl-11"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                  className="pl-11"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Master Password Warning */}
            <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-warning">Important</p>
                <p className="text-xs text-muted-foreground">
                  Your <strong>master password</strong> encrypts your vault. It must be different
                  from your account password and <strong>cannot be recovered</strong> if lost.
                </p>
              </div>
            </div>

            {/* Master Password */}
            <div className="space-y-2">
              <Label htmlFor="masterPassword" className="text-sm font-medium">Master Password</Label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="masterPassword"
                  type="password"
                  placeholder="••••••••••••"
                  {...register('masterPassword')}
                  disabled={isLoading}
                  className="pl-11"
                />
              </div>

              {/* Strength Meter */}
              {masterPassword && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-muted'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: <span className={`font-medium`}>{strength.label}</span>
                  </p>
                </div>
              )}

              {errors.masterPassword && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.masterPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Master Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmMasterPassword" className="text-sm font-medium">
                Confirm Master Password
              </Label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirmMasterPassword"
                  type="password"
                  placeholder="••••••••••••"
                  {...register('confirmMasterPassword')}
                  disabled={isLoading}
                  className="pl-11"
                />
              </div>
              {errors.confirmMasterPassword && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-destructive" />
                  {errors.confirmMasterPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-12 text-base gradient-primary hover-scale press shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating vault...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Vault
                </>
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                Sign in
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
