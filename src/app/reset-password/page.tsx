"use client";

// This page uses client-only hooks and must not be prerendered
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';
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
import { Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const validateRecoveryToken = async () => {
      try {
        // Check if we have the recovery token in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Reset password - URL hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (type !== 'recovery' || !accessToken) {
          console.error('Invalid recovery link - missing token or wrong type');
          toast({
            title: 'Invalid Link',
            description: 'This password reset link is invalid or expired',
            variant: 'destructive',
          });
          setTimeout(() => router.push('/login'), 2000);
          setIsValidating(false);
          return;
        }

        // Set the session with the recovery token
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            title: 'Link Expired',
            description: 'This password reset link has expired. Please request a new one.',
            variant: 'destructive',
          });
          setTimeout(() => router.push('/login'), 2000);
          setIsValidating(false);
          return;
        }

        console.log('Session set successfully');
        setIsValid(true);
        setIsValidating(false);
      } catch (err) {
        console.error('Validation error:', err);
        toast({
          title: 'Error',
          description: 'Failed to validate reset link',
          variant: 'destructive',
        });
        setTimeout(() => router.push('/login'), 2000);
        setIsValidating(false);
      }
    };

    validateRecoveryToken();
  }, [router]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Your password has been updated',
      });

      // Redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <Shield className="h-12 w-12 mx-auto text-destructive" />
            <CardTitle className="text-2xl">Link Expired</CardTitle>
            <CardDescription>
              This password reset link has expired or is invalid.
              <br />
              Reset links are valid for 1 hour.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please request a new password reset link from the login page.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/login" className="w-full">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Shield className="h-12 w-12 mb-2" />
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new account password</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
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

            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
              ⚠️ Note: This only resets your <strong>account password</strong>.
              Your <strong>master password</strong> and vault data remain
              unchanged.
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Remember your password?{' '}
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
