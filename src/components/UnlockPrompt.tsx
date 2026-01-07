'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

  // Check lockout status
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
        // Shake effect on failed attempt
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
      <DialogContent className="sm:max-w-md bg-white border-[3px] border-[#1a1a1a] shadow-[8px_8px_0_#1a1a1a] p-0" hideClose>
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#C4B5FD] border-b-[3px] border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF8A80] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#FFE156] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded-full bg-[#A0F5D3] border border-[#1a1a1a]" />
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">
            Unlock Vault
          </span>
        </div>

        <div className={`p-8 ${shake ? 'animate-shake' : ''}`}>
          <DialogHeader className="text-center space-y-4 mb-8">
            {/* Lock icon */}
            <div className="mx-auto">
              <div
                className={`w-20 h-20 flex items-center justify-center border-[3px] border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] ${lockoutStatus.locked
                    ? 'bg-[#FF8A80]'
                    : unlocking
                      ? 'bg-[#7DD3FC]'
                      : 'bg-[#FFE156]'
                  }`}
              >
                {lockoutStatus.locked ? (
                  <AlertCircle className="h-10 w-10 text-[#1a1a1a]" />
                ) : unlocking ? (
                  <Fingerprint className="h-10 w-10 text-[#1a1a1a] animate-pulse" />
                ) : (
                  <Lock className="h-10 w-10 text-[#1a1a1a]" />
                )}
              </div>
            </div>

            <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
              {lockoutStatus.locked ? 'Too many attempts' : unlocking ? 'Unlocking...' : 'Vault is locked'}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#666666]">
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
              <Label htmlFor="masterPassword" className="text-sm font-bold text-[#1a1a1a]">
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

              {/* Error */}
              {(errors.masterPassword || error) && (
                <p className="text-sm text-[#FF8A80] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.masterPassword?.message || error}
                </p>
              )}

              {/* Attempts warning */}
              {!lockoutStatus.locked && lockoutStatus.remainingAttempts < 5 && lockoutStatus.remainingAttempts > 0 && (
                <p className="text-sm text-[#FFB74D] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {lockoutStatus.remainingAttempts} attempts remaining
                </p>
              )}
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

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t-[2px] border-[#e5e5e5]">
              <Shield className="h-4 w-4 text-[#999999]" />
              <span className="text-sm text-[#999999]">
                Your data is encrypted locally
              </span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
