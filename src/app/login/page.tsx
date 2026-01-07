'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/components/ui/use-toast';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { supabase } from '@/lib/supabase/client';
import { Lock, Loader2, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)] relative overflow-hidden transition-colors">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Decorative shapes */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 12 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="absolute top-20 left-20 w-32 h-32 bg-[var(--yellow)] border-[3px] border-[var(--border)] hidden md:block"
      />
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: -6 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="absolute bottom-20 right-20 w-24 h-24 bg-[var(--pink)] border-[3px] border-[var(--border)] hidden md:block"
      />
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 45 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="absolute top-40 right-40 w-16 h-16 bg-[var(--mint)] border-[3px] border-[var(--border)] hidden md:block"
      />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 w-full max-w-md ${shake ? 'animate-shake' : ''}`}
      >
        {/* Card header bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center justify-between px-4 py-3 bg-[var(--yellow)] border-[3px] border-b-0 border-[var(--border)] origin-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--coral)] border border-[var(--border)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--yellow)] border border-[var(--border)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--mint)] border border-[var(--border)]" />
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">
            Password Manager
          </span>
        </motion.div>

        {/* Card body */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8 bg-[var(--surface)] border-[3px] border-[var(--border)] shadow-[8px_8px_0_var(--shadow-color)]"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-[var(--lavender)] border-[3px] border-[var(--border)] shadow-[3px_3px_0_var(--shadow-color)] mb-6"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Lock className="h-8 w-8 text-[#1a1a1a]" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Sign in to access your vault
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-[var(--text)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-[var(--coral)] flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-bold text-[var(--text)]">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[var(--sky)] hover:underline font-medium"
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
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-[var(--coral)] flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants}>
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
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-[2px] border-[var(--border-light)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[var(--surface)] text-sm text-[var(--text-muted)]">
                  or
                </span>
              </div>
            </motion.div>

            {/* Signup link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="text-[var(--pink)] hover:underline font-bold"
                >
                  Sign up →
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-6"
        >
          <Shield className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-muted)]">
            Your data is encrypted locally
          </span>
        </motion.div>
      </motion.div>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
