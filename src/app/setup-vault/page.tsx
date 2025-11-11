'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { generateSalt, deriveKEK } from '@/lib/crypto/derive';
import { generateVaultKey, wrapVaultKey } from '@/lib/crypto/keys';
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
import { Shield, AlertCircle } from 'lucide-react';

const setupVaultSchema = z
  .object({
    masterPassword: z
      .string()
      .min(12, 'Master password must be at least 12 characters')
      .max(128, 'Master password too long'),
    confirmMasterPassword: z.string(),
  })
  .refine((data) => data.masterPassword === data.confirmMasterPassword, {
    message: "Master passwords don't match",
    path: ['confirmMasterPassword'],
  });

type SetupVaultInput = z.infer<typeof setupVaultSchema>;

export default function SetupVaultPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupVaultInput>({
    resolver: zodResolver(setupVaultSchema),
  });

  const onSubmit = async (data: SetupVaultInput) => {
    setIsLoading(true);

    try {
      // Get authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to set up your vault',
          variant: 'destructive',
        });
        router.push('/login');
        return;
      }

      // Generate crypto materials
      const salt = generateSalt();
      const kek = await deriveKEK(data.masterPassword, salt);
      const vaultKey = await generateVaultKey();
      const { wrappedB64, ivB64 } = await wrapVaultKey(vaultKey, kek);

      // Store wrapped vault key
      const { error: dbError } = await supabase.from('user_keys').insert({
        user_id: userData.user.id,
        kdf: 'pbkdf2-sha256',
        kdf_iterations: 200000,
        salt,
        vault_key_wrapped: wrappedB64,
        vk_iv: ivB64,
      });

      if (dbError) {
        console.error('Database error:', dbError);
        toast({
          title: 'Setup failed',
          description: dbError.message || 'Failed to initialize vault',
          variant: 'destructive',
        });
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
          <CardTitle className="text-2xl">Set Up Your Vault</CardTitle>
          <CardDescription>
            Create a master password to encrypt your vault
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-md flex gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Your <strong>master password</strong> encrypts your vault and{' '}
                <strong>cannot be recovered</strong> if lost. Store it securely!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="masterPassword">Master Password</Label>
              <Input
                id="masterPassword"
                type="password"
                placeholder="At least 12 characters"
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
              {isLoading ? 'Creating vault...' : 'Create Vault'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
