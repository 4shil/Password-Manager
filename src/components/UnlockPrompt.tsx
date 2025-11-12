'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { deriveKEK } from '@/lib/crypto/derive';
import { unwrapVaultKey } from '@/lib/crypto/keys';
import { setVaultKey } from '@/lib/crypto/memory';
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
import { Lock } from 'lucide-react';

const unlockSchema = z.object({
  masterPassword: z.string().min(1, 'Master password is required'),
});

interface UnlockPromptProps {
  open: boolean;
  onUnlock: () => void;
}

export function UnlockPrompt({ open, onUnlock }: UnlockPromptProps) {
  const [unlocking, setUnlocking] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ masterPassword: string }>({
    resolver: zodResolver(unlockSchema),
  });

  const onSubmit = async (data: { masterPassword: string }) => {
    // Prevent double submissions
    if (unlocking) return;
    setUnlocking(true);

    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('Not authenticated');
      }

      // Fetch user_keys row
      const { data: keyData, error: keyError } = await supabase
        .from('user_keys')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (keyError || !keyData) {
        throw new Error('Vault not initialized');
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
        // Rethrow with a clear message for the outer catch
        throw new Error('Incorrect master password or corrupted vault data');
      }

      // Store in memory
      setVaultKey(vaultKey);

      toast({
        title: 'Unlocked',
        description: 'Vault unlocked successfully',
      });

      reset();
      onUnlock();
    } catch (err: any) {
      const msg = err?.message ?? 'Invalid master password';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader>
          <div className="mx-auto rounded-full bg-primary/10 p-3 mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Unlock Your Vault</DialogTitle>
          <DialogDescription className="text-center">
            Enter your master password to decrypt your vault
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="masterPassword">Master Password</Label>
            <Input
              id="masterPassword"
              type="password"
              placeholder="Enter master password"
              autoFocus
              {...register('masterPassword')}
              disabled={unlocking}
            />
            {errors.masterPassword && (
              <p className="text-sm text-destructive">
                {errors.masterPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={unlocking}>
            {unlocking ? 'Unlocking...' : 'Unlock Vault'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
