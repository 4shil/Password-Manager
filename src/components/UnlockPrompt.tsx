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
import { Lock, Loader2, Shield, KeyRound, AlertTriangle } from 'lucide-react';

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

  // Check lockout status on mount and periodically
  useEffect(() => {
    const checkLockout = () => {
      const status = isLockedOut();
      setLockoutStatus(status);
    };

    checkLockout();

    // Update every second if locked out
    const interval = setInterval(() => {
      const status = isLockedOut();
      setLockoutStatus(status);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: { masterPassword: string }) => {
    if (unlocking) return;

    // Check if locked out
    const currentStatus = isLockedOut();
    if (currentStatus.locked) {
      setLockoutStatus(currentStatus);
      setError(getLockoutMessage(currentStatus.remainingMs));
      return;
    }

    setUnlocking(true);
    setError(null);

    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        toast({
          title: 'Not authenticated',
          description: 'Please log in before unlocking your vault',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      // Fetch user_keys row
      const { data: keyData, error: keyError } = await supabase
        .from('user_keys')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (keyError || !keyData) {
        toast({
          title: 'Vault not initialized',
          description: 'Please set up your vault before unlocking',
          variant: 'destructive',
        });
        router.push('/setup-vault');
        return;
      }

      // Ensure DB fields exist and support legacy names
      const wrappedB64 = keyData.vault_key_wrapped ?? keyData.vaultKeyWrapped ?? keyData.wrapped;
      const ivB64 = keyData.vk_iv ?? keyData.iv ?? keyData.vkIv;

      if (!wrappedB64 || !ivB64) {
        throw new Error('Vault not initialized correctly (missing wrapped key or IV)');
      }

      // Derive KEK from master password
      const kek = await deriveKEK(
        data.masterPassword,
        keyData.salt,
        keyData.kdf_iterations
      );

      // Unwrap vault key
      let vaultKey: CryptoKey;
      try {
        vaultKey = await unwrapVaultKey(wrappedB64, ivB64, kek);
      } catch (e) {
        // Record failed attempt
        const attemptResult = recordFailedAttempt();
        setLockoutStatus(attemptResult);

        if (attemptResult.justLocked) {
          setError(getLockoutMessage(attemptResult.remainingMs));
          toast({
            title: 'Too many failed attempts',
            description: getLockoutMessage(attemptResult.remainingMs),
            variant: 'destructive',
          });
        } else {
          setError(`Incorrect master password. ${attemptResult.remainingAttempts} attempts remaining.`);
        }

        throw new Error('Incorrect master password');
      }

      // Success! Clear attempts and store key
      clearAttempts();
      setVaultKey(vaultKey);

      toast({
        title: 'Vault Unlocked',
        description: 'Welcome back! Your vault is now accessible.',
      });

      reset();
      onUnlock();
    } catch (err: any) {
      // Only show generic toast if we haven't already shown a specific error
      if (!error && err?.message !== 'Incorrect master password') {
        const msg = err?.message ?? 'Invalid master password';
        toast({
          title: 'Unlock Failed',
          description: msg,
          variant: 'destructive',
        });
      }
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md border-border/50" hideClose>
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-6 relative">
            {/* Animated Background */}
            <div className="absolute inset-0 rounded-full gradient-primary opacity-20 blur-xl scale-150 pulse-glow" />

            {/* Icon Container */}
            <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${lockoutStatus.locked ? 'bg-destructive' : 'gradient-primary'
              }`}>
              {lockoutStatus.locked ? (
                <AlertTriangle className="h-10 w-10 text-white" />
              ) : (
                <Lock className="h-10 w-10 text-white" />
              )}
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold">
            {lockoutStatus.locked ? 'Account Locked' : 'Unlock Your Vault'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {lockoutStatus.locked
              ? `Too many failed attempts. Please wait ${formatRemainingTime(lockoutStatus.remainingMs)}.`
              : 'Enter your master password to decrypt your passwords'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="masterPassword" className="text-sm font-medium">
              Master Password
            </Label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="masterPassword"
                type="password"
                placeholder="Enter your master password"
                autoFocus
                {...register('masterPassword')}
                disabled={unlocking || lockoutStatus.locked}
                className="pl-11 h-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-all"
              />
            </div>

            {/* Error Message */}
            {(errors.masterPassword || error) && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-destructive" />
                {errors.masterPassword?.message || error}
              </p>
            )}

            {/* Attempts Warning */}
            {!lockoutStatus.locked && lockoutStatus.remainingAttempts < 5 && lockoutStatus.remainingAttempts > 0 && (
              <p className="text-xs text-warning flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                {lockoutStatus.remainingAttempts} attempt{lockoutStatus.remainingAttempts !== 1 ? 's' : ''} remaining before lockout
              </p>
            )}
          </div>

          <Button
            type="submit"
            className={`w-full h-12 text-base ${lockoutStatus.locked ? '' : 'gradient-primary'} hover-scale press shadow-lg`}
            disabled={unlocking || lockoutStatus.locked}
            variant={lockoutStatus.locked ? 'secondary' : 'default'}
          >
            {unlocking ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Unlocking...
              </>
            ) : lockoutStatus.locked ? (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Locked ({formatRemainingTime(lockoutStatus.remainingMs)})
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Unlock Vault
              </>
            )}
          </Button>

          {/* Security Note */}
          <p className="text-xs text-center text-muted-foreground">
            Your master password never leaves your device.
            <br />
            All decryption happens locally in your browser.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
