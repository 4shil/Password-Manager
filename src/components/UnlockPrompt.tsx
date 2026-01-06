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
import { Lock, Loader2, Shield, Key, AlertTriangle, Fingerprint } from 'lucide-react';

const unlockSchema = z.object({
  masterPassword: z.string().min(1, 'Master password is required'),
});

interface UnlockPromptProps {
  open: boolean;
  onUnlock: () => void;
}

export function UnlockPrompt({ open, onUnlock }: UnlockPromptProps) {
  const router = useRouter();
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [glitch, setGlitch] = useState(false);
  const [decryptingAnimation, setDecryptingAnimation] = useState('');
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

  // Animate decryption glyphs
  useEffect(() => {
    if (unlocking) {
      const chars = '0123456789ABCDEF▓░▒█';
      const interval = setInterval(() => {
        let result = '';
        for (let i = 0; i < 24; i++) {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
        setDecryptingAnimation(result);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [unlocking]);

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
          title: 'NOT AUTHENTICATED',
          description: 'Session expired. Re-authenticate.',
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
          title: 'VAULT NOT FOUND',
          description: 'Initialize vault first.',
          variant: 'destructive',
        });
        router.push('/setup-vault');
        return;
      }

      const wrappedB64 = keyData.vault_key_wrapped ?? keyData.vaultKeyWrapped ?? keyData.wrapped;
      const ivB64 = keyData.vk_iv ?? keyData.iv ?? keyData.vkIv;

      if (!wrappedB64 || !ivB64) {
        throw new Error('Vault corrupted (missing wrapped key)');
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
        // Glitch effect on failed attempt
        setGlitch(true);
        setTimeout(() => setGlitch(false), 500);

        const attemptResult = recordFailedAttempt();
        setLockoutStatus(attemptResult);

        if (attemptResult.justLocked) {
          setError(`LOCKOUT ENGAGED: ${formatRemainingTime(attemptResult.remainingMs)}`);
        } else {
          setError(`INVALID KEY // ${attemptResult.remainingAttempts} attempts remaining`);
        }

        throw new Error('Incorrect master password');
      }

      clearAttempts();
      setVaultKey(vaultKey);

      toast({
        title: 'VAULT UNLOCKED',
        description: 'Decryption successful.',
      });

      reset();
      onUnlock();
    } catch (err: any) {
      if (!error && err?.message !== 'Incorrect master password') {
        toast({
          title: 'DECRYPTION FAILED',
          description: err?.message ?? 'Invalid master key',
          variant: 'destructive',
        });
      }
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md bg-[oklch(0.08_0.01_270)/0.95] backdrop-blur-xl border-2 border-[oklch(0.25_0.02_270)] p-0" hideClose>
        {/* Terminal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[oklch(0.25_0.02_270)]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.60_0.25_25)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.75_0.18_85)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.72_0.19_155)]" />
          </div>
          <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">
            VAULT_X://DECRYPT
          </span>
        </div>

        <div className={`p-8 ${glitch ? 'animate-glitch' : ''}`}>
          <DialogHeader className="text-center space-y-4 mb-8">
            {/* Lock icon with glow */}
            <div className="mx-auto relative">
              <div
                className={`w-20 h-20 flex items-center justify-center border-2 ${lockoutStatus.locked
                    ? 'border-[oklch(0.60_0.25_25)] bg-[oklch(0.60_0.25_25)/0.1]'
                    : 'border-[oklch(0.55_0.28_280)]'
                  }`}
              >
                {lockoutStatus.locked ? (
                  <AlertTriangle className="h-10 w-10 text-[oklch(0.60_0.25_25)]" />
                ) : unlocking ? (
                  <Fingerprint className="h-10 w-10 text-[oklch(0.75_0.18_195)] animate-pulse" />
                ) : (
                  <Lock className="h-10 w-10 text-[oklch(0.75_0.18_195)]" />
                )}
              </div>
              {!lockoutStatus.locked && (
                <div className="absolute inset-0 animate-pulse-glow pointer-events-none"
                  style={{ boxShadow: '0 0 40px oklch(0.55 0.28 280 / 0.3)' }}
                />
              )}
            </div>

            <DialogTitle className="text-2xl font-bold uppercase tracking-widest text-white">
              {lockoutStatus.locked ? 'LOCKED OUT' : unlocking ? 'DECRYPTING' : 'VAULT LOCKED'}
            </DialogTitle>
            <DialogDescription className="text-sm font-mono text-[oklch(0.45_0.02_270)]">
              {lockoutStatus.locked
                ? `Wait ${formatRemainingTime(lockoutStatus.remainingMs)} to retry`
                : unlocking
                  ? decryptingAnimation
                  : 'Enter master key to decrypt vault'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="masterPassword" className="text-xs uppercase tracking-widest text-[oklch(0.55_0.28_280)]">
                MASTER KEY
              </Label>
              <Input
                id="masterPassword"
                type="password"
                placeholder="••••••••••••••••"
                autoFocus
                {...register('masterPassword')}
                disabled={unlocking || lockoutStatus.locked}
                className="border-[oklch(0.55_0.28_280)]"
              />

              {/* Error */}
              {(errors.masterPassword || error) && (
                <p className="text-xs text-[oklch(0.60_0.25_25)] font-mono flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.masterPassword?.message || error}
                </p>
              )}

              {/* Attempts warning */}
              {!lockoutStatus.locked && lockoutStatus.remainingAttempts < 5 && lockoutStatus.remainingAttempts > 0 && (
                <p className="text-xs text-[oklch(0.75_0.18_85)] font-mono flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {lockoutStatus.remainingAttempts} ATTEMPTS REMAINING
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
                  DECRYPTING...
                </>
              ) : lockoutStatus.locked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  LOCKED ({formatRemainingTime(lockoutStatus.remainingMs)})
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  UNLOCK VAULT
                </>
              )}
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-[oklch(0.20_0.02_270)]">
              <Shield className="h-3 w-3 text-[oklch(0.35_0.02_270)]" />
              <span className="text-xs font-mono text-[oklch(0.35_0.02_270)]">
                ZERO-KNOWLEDGE • CLIENT-SIDE ONLY
              </span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
