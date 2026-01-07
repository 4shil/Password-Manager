'use client';

import { useState } from 'react';
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
import { signupSchema, type SignupInput } from '@/lib/validators';
import { supabase } from '@/lib/supabase/client';
import { generateSalt, deriveKEK } from '@/lib/crypto/derive';
import { generateVaultKey, wrapVaultKey } from '@/lib/crypto/keys';
import { Shield, AlertCircle, Key, Loader2, Sparkles, Lock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Password strength calculator
function calculateStrength(password: string): number {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/\d/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;
  return Math.round(Math.log2(Math.pow(poolSize || 1, password.length)));
}

function getStrengthLevel(strength: number): { label: string; color: string; width: string } {
  if (strength < 40) return { label: 'Weak', color: 'var(--coral)', width: '25%' };
  if (strength < 60) return { label: 'Okay', color: 'var(--orange)', width: '50%' };
  if (strength < 80) return { label: 'Strong', color: 'var(--sky)', width: '75%' };
  return { label: 'Very Strong', color: 'var(--mint)', width: '100%' };
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

      if (!authData.session) {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link.',
        });
        router.push('/confirm-email');
        return;
      }

      const salt = generateSalt();
      const kek = await deriveKEK(data.masterPassword, salt);
      const vaultKey = await generateVaultKey();
      const { wrappedB64, ivB64 } = await wrapVaultKey(vaultKey, kek);

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
        animate={{ scale: 1, rotate: -12 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="absolute top-10 right-32 w-40 h-40 bg-[var(--pink)] border-[3px] border-[var(--border)] hidden md:block"
      />
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 6 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className="absolute bottom-32 left-20 w-28 h-28 bg-[var(--sky)] border-[3px] border-[var(--border)] hidden md:block"
      />
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 45 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="absolute top-1/3 left-32 w-20 h-20 bg-[var(--mint)] border-[3px] border-[var(--border)] hidden md:block"
      />

      {/* Signup card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Card header bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center justify-between px-4 py-3 bg-[var(--mint)] border-[3px] border-b-0 border-[var(--border)] origin-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--coral)] border border-[var(--border)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--yellow)] border border-[var(--border)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--mint)] border border-[var(--border)]" />
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">
            Create Account
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
              className="inline-flex items-center justify-center w-20 h-20 bg-[var(--yellow)] border-[3px] border-[var(--border)] shadow-[3px_3px_0_var(--shadow-color)] mb-6"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Key className="h-10 w-10 text-[#1a1a1a]" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
              Create your vault
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Set up your secure password manager
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <Label htmlFor="password" className="text-sm font-bold text-[var(--text)]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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

            {/* Confirm Password */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-bold text-[var(--text)]">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-[var(--coral)] flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Master Password Warning */}
            <motion.div
              variants={itemVariants}
              className="p-4 bg-[var(--orange)] border-[3px] border-[var(--border)]"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#1a1a1a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-1">Important</p>
                  <p className="text-sm text-[#1a1a1a]/80">
                    Your <span className="font-bold">Master Password</span> encrypts all your data.
                    If you forget it, <span className="font-bold">we cannot recover it</span>.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Master Password */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="masterPassword" className="text-sm font-bold text-[var(--pink)]">
                Master Password
              </Label>
              <Input
                id="masterPassword"
                type="password"
                placeholder="••••••••••••••••"
                {...register('masterPassword')}
                disabled={isLoading}
                className="border-[var(--pink)]"
              />

              {/* Strength meter */}
              <AnimatePresence>
                {masterPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="h-2 bg-[var(--muted)] border-[2px] border-[var(--border)] overflow-hidden">
                      <motion.div
                        className="h-full"
                        initial={{ width: 0 }}
                        animate={{ width: strengthLevel.width }}
                        style={{ backgroundColor: strengthLevel.color }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Strength: <span className="font-bold text-[var(--text)]">{strength} bits</span>
                      </span>
                      <motion.span
                        className="font-bold px-2 py-0.5 border-[2px] border-[var(--border)]"
                        style={{ backgroundColor: strengthLevel.color }}
                        key={strengthLevel.label}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        {strengthLevel.label}
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {errors.masterPassword && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-[var(--coral)] flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.masterPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Master Password */}
            <motion.div variants={itemVariants} className="space-y-2">
              <Label htmlFor="confirmMasterPassword" className="text-sm font-bold text-[var(--pink)]">
                Confirm Master Password
              </Label>
              <Input
                id="confirmMasterPassword"
                type="password"
                placeholder="••••••••••••••••"
                {...register('confirmMasterPassword')}
                disabled={isLoading}
                className="border-[var(--pink)]"
              />
              <AnimatePresence>
                {errors.confirmMasterPassword && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-[var(--coral)] flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmMasterPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants}>
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
            </motion.div>

            {/* Login link */}
            <motion.div variants={itemVariants} className="text-center pt-4 border-t-[2px] border-[var(--border-light)]">
              <p className="text-sm text-[var(--text-muted)]">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[var(--sky)] hover:underline font-bold"
                >
                  Sign in →
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
          <Lock className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-muted)]">
            Your passwords are encrypted on your device
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
