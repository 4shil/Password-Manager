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
import { loginSchema, type LoginInput } from '@/lib/validators';
import { supabase } from '@/lib/supabase/client';
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'You have been logged in successfully',
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
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Sign in to access your secure vault
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

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <div className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                Create vault
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
