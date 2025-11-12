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
import { Shield, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

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

      // If the signUp flow didn't create an active session (email confirmation required),
      // we cannot create the user's wrapped vault key yet because RLS will block unauthenticated inserts.
      // In that case, ask the user to confirm their email and complete vault setup after confirming.
      if (!authData.session) {
        toast({
          title: 'Confirm your email',
          description:
            'Check your inbox for a confirmation email. After confirming, complete vault setup.',
        });

        // Redirect to the confirmation helper page which will handle the Supabase redirect/hash
        // If running in production, prefer the configured public base URL
        const base = process.env.NEXT_PUBLIC_BASE_URL || undefined;
        if (base) {
          // If a base is configured, navigate the browser to that domain's confirm route
          window.location.href = `${base}/confirm-email`;
        } else {
          router.push('/confirm-email');
        }
        return;
      }

      // 2. Generate crypto materials and store wrapped vault key (only when session is active)
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
        // Clean up: delete auth user if we created it but couldn't initialize vault
        try {
          // Only attempt admin delete if we have a user id
          if (authData.user?.id) {
            // The client-side anon key cannot delete users; skip if not permitted.
            await supabase.auth.admin.deleteUser(authData.user.id);
          }
        } catch (e) {
          // ignore cleanup errors
          console.error('Cleanup failed:', e);
        }
        return;
      }

      toast({
        title: 'Success!',
        description: 'Your vault has been created',
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Shield className="h-12 w-12 mb-2" />
          <CardTitle className="text-2xl">Create your vault</CardTitle>
          <CardDescription>
            Set up your zero-knowledge password manager
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Account Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="bg-muted p-3 rounded-md flex gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Your <strong>master password</strong> encrypts your vault. It
                must be different from your account password and cannot be
                recovered if lost.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="masterPassword">Master Password</Label>
              <Input
                id="masterPassword"
                type="password"
                {...register('masterPassword')}
                disabled={isLoading}
              />
              {errors.masterPassword && (
                <p className="text-sm text-destructive">
                  {errors.masterPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmMasterPassword">
                Confirm Master Password
              </Label>
              <Input
                id="confirmMasterPassword"
                type="password"
                {...register('confirmMasterPassword')}
                disabled={isLoading}
              />
              {errors.confirmMasterPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmMasterPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating vault...' : 'Create vault'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
