'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { deriveKEK } from '@/lib/crypto/derive';
import { unwrapVaultKey } from '@/lib/crypto/keys';
import { setVaultKey } from '@/lib/crypto/memory';
import {
  isLockedOut,
  recordFailedAttempt,
  clearAttempts,
  formatRemainingTime,
  getLockoutMessage
} from '@/lib/crypto/rate-limit';
import { toast } from './ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Lock, Loader2, Shield, Key, AlertCircle, Fingerprint } from 'lucide-react';

const unlockSchema = z.object({
  masterPassword: z.string().min(1, 'Please enter your master password'),
});

interface UnlockPromptProps {
  open: boolean;
  onUnlock: () => void;
}

export function UnlockPrompt({ open, onUnlock }: UnlockPromptProps) {
  const router = useRouter();
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [lockoutStatus, setLockoutStatus] = useState<{
    locked: boolean;
    remainingMs: number;
    remainingAttempts: number;
  }>({ locked: false, remainingMs: 0, remainingAttempts: 5 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ masterPassword: string }>({
    resolver: zodResolver(unlockSchema),
  });

  useEffect(() => {
    const checkLockout = () => {
      const status = isLockedOut();
      setLockoutStatus(status);
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: { masterPassword: string }) => {
    if (unlocking) return;

    const currentStatus = isLockedOut();
    if (currentStatus.locked) {
      setLockoutStatus(currentStatus);
      setError(getLockoutMessage(currentStatus.remainingMs));
      return;
    }

    setUnlocking(true);
    setError(null);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        toast({
          title: 'Session expired',
          description: 'Please sign in again',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      const { data: keyData, error: keyError } = await supabase
        .from('user_keys')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (keyError || !keyData) {
        toast({
          title: 'Vault not found',
          description: 'Please set up your vault first',
          variant: 'destructive',
        });
        router.push('/setup-vault');
        return;
      }

      const wrappedB64 = keyData.vault_key_wrapped ?? keyData.vaultKeyWrapped ?? keyData.wrapped;
      const ivB64 = keyData.vk_iv ?? keyData.iv ?? keyData.vkIv;

      if (!wrappedB64 || !ivB64) {
        throw new Error('Vault data is corrupted');
      }

      const kek = await deriveKEK(
        data.masterPassword,
        keyData.salt,
        keyData.kdf_iterations
      );

      let vaultKey: CryptoKey;
      try {
        vaultKey = await unwrapVaultKey(wrappedB64, ivB64, kek);
      } catch (e) {
        setShake(true);
        setTimeout(() => setShake(false), 500);

        const attemptResult = recordFailedAttempt();
        setLockoutStatus(attemptResult);

        if (attemptResult.justLocked) {
          setError(`Too many attempts. Try again in ${formatRemainingTime(attemptResult.remainingMs)}`);
        } else {
          setError(`Wrong password. ${attemptResult.remainingAttempts} tries left`);
        }

        throw new Error('Incorrect master password');
      }

      clearAttempts();
      setVaultKey(vaultKey);

      toast({
        title: 'Vault unlocked!',
        description: 'Welcome back',
      });

      reset();
      onUnlock();
    } catch (err: any) {
      if (!error && err?.message !== 'Incorrect master password') {
        toast({
          title: 'Could not unlock',
          description: err?.message ?? 'Please check your password',
          variant: 'destructive',
        });
      }
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md bg-[var(--surface)] border-[3px] border-[var(--border)] shadow-[8px_8px_0_var(--shadow-color)] p-0" hideClose>
        {/* Header bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between px-4 py-3 bg-[var(--lavender)] border-b-[3px] border-[var(--border)] origin-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--coral)] border border-[var(--border)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--yellow)] border border-[var(--border)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--mint)] border border-[var(--border)]" />
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">
            Unlock Vault
          </span>
        </motion.div>

        <motion.div
          className={`p-8 ${shake ? 'animate-shake' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <DialogHeader className="text-center space-y-4 mb-8">
            {/* Lock icon */}
            <motion.div
              className="mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <motion.div
                className={`w-20 h-20 flex items-center justify-center border-[3px] border-[var(--border)] shadow-[3px_3px_0_var(--shadow-color)]`}
                style={{
                  backgroundColor: lockoutStatus.locked
                    ? 'var(--coral)'
                    : unlocking
                      ? 'var(--sky)'
                      : 'var(--yellow)'
                }}
                animate={unlocking ? { rotate: [0, -5, 5, 0] } : {}}
                transition={{ repeat: unlocking ? Infinity : 0, duration: 0.5 }}
              >
                <AnimatePresence mode="wait">
                  {lockoutStatus.locked ? (
                    <motion.div
                      key="alert"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                    >
                      <AlertCircle className="h-10 w-10 text-[#1a1a1a]" />
                    </motion.div>
                  ) : unlocking ? (
                    <motion.div
                      key="fingerprint"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Fingerprint className="h-10 w-10 text-[#1a1a1a]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lock"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Lock className="h-10 w-10 text-[#1a1a1a]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            <DialogTitle className="text-2xl font-bold text-[var(--text)]">
              {lockoutStatus.locked ? 'Too many attempts' : unlocking ? 'Unlocking...' : 'Vault is locked'}
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-muted)]">
              {lockoutStatus.locked
                ? `Please wait ${formatRemainingTime(lockoutStatus.remainingMs)} before trying again`
                : unlocking
                  ? 'Decrypting your data...'
                  : 'Enter your master password to continue'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="masterPassword" className="text-sm font-bold text-[var(--text)]">
                Master Password
              </Label>
              <Input
                id="masterPassword"
                type="password"
                placeholder="••••••••••••••••"
                autoFocus
                {...register('masterPassword')}
                disabled={unlocking || lockoutStatus.locked}
              />

              <AnimatePresence>
                {(errors.masterPassword || error) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-[var(--coral)] flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errors.masterPassword?.message || error}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!lockoutStatus.locked && lockoutStatus.remainingAttempts < 5 && lockoutStatus.remainingAttempts > 0 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-[var(--orange)] flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {lockoutStatus.remainingAttempts} attempts remaining
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={unlocking || lockoutStatus.locked}
              variant={lockoutStatus.locked ? 'secondary' : 'default'}
            >
              {unlocking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Unlocking...
                </>
              ) : lockoutStatus.locked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Locked ({formatRemainingTime(lockoutStatus.remainingMs)})
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Unlock Vault
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-4 border-t-[2px] border-[var(--border-light)]">
              <Shield className="h-4 w-4 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-muted)]">
                Your data is encrypted locally
              </span>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
