# Complete File Setup Guide

This document lists all remaining files that need to be created for the Zero-Knowledge Password Manager.

## ✅ Already Created Files

### Configuration Files

- ✅ `package.json`
- ✅ `tsconfig.json`
- ✅ `tailwind.config.ts`
- ✅ `postcss.config.js`
- ✅ `next.config.js`
- ✅ `.eslintrc.json`
- ✅ `.prettierrc`
- ✅ `.gitignore`
- ✅ `vitest.config.ts`
- ✅ `components.json`
- ✅ `.env.local.example`

### Database & Backend

- ✅ `supabase/migrations/001_init_schema.sql`

### Lib & Utilities

- ✅ `src/lib/utils.ts`
- ✅ `src/lib/cn.ts`
- ✅ `src/lib/validators.ts`
- ✅ `src/lib/crypto/derive.ts`
- ✅ `src/lib/crypto/aes.ts`
- ✅ `src/lib/crypto/keys.ts`
- ✅ `src/lib/crypto/memory.ts`
- ✅ `src/lib/supabase/client.ts`
- ✅ `src/lib/supabase/server.ts`
- ✅ `src/lib/supabase/database.types.ts`

### Styles & Theme

- ✅ `src/styles/theme.css`
- ✅ `src/app/globals.css`

### UI Components (shadcn/ui)

- ✅ `src/components/ui/button.tsx`
- ✅ `src/components/ui/input.tsx`
- ✅ `src/components/ui/label.tsx`
- ✅ `src/components/ui/card.tsx`
- ✅ `src/components/ui/dialog.tsx`
- ✅ `src/components/ui/toast.tsx`
- ✅ `src/components/ui/use-toast.ts`
- ✅ `src/components/ui/toaster.tsx`
- ✅ `src/components/ui/switch.tsx`

### Theme Components

- ✅ `src/components/ThemeProvider.tsx`
- ✅ `src/components/ThemeToggle.tsx`

### Pages

- ✅ `src/app/layout.tsx`
- ✅ `src/app/page.tsx`
- ✅ `src/app/login/page.tsx`
- ✅ `src/app/signup/page.tsx`

### Documentation

- ✅ `README.md`

---

## 📝 Files to Create

### 1. App Layout & Pages

#### `src/app/app/layout.tsx`

Protected app shell with header, sidebar, and authentication check.

```typescript
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

#### `src/app/app/page.tsx`

Main vault page with item list and unlock prompt.

```typescript
'use client';

import { useState, useEffect } from 'react';
import { VaultList } from '@/components/VaultList';
import { UnlockPrompt } from '@/components/UnlockPrompt';
import { isVaultUnlocked } from '@/lib/crypto/memory';

export default function VaultPage() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(isVaultUnlocked());
  }, []);

  if (!unlocked) {
    return <UnlockPrompt onUnlock={() => setUnlocked(true)} />;
  }

  return <VaultList />;
}
```

#### `src/app/api/logout/route.ts`

Server action for logout.

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
```

### 2. Core Application Components

#### `src/components/Header.tsx`

```typescript
'use client';

import { ThemeToggle } from './ThemeToggle';
import { LockButton } from './LockButton';
import { Button } from './ui/button';
import { Shield, Plus } from 'lucide-react';
import { useState } from 'react';
import { VaultEditorDialog } from './VaultEditorDialog';

export function Header() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-xl font-bold">My Vault</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <ThemeToggle />
          <LockButton />
        </div>
      </div>
      {showAddDialog && (
        <VaultEditorDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </header>
  );
}
```

#### `src/components/LockButton.tsx`

```typescript
'use client';

import { Lock } from 'lucide-react';
import { Button } from './ui/button';
import { lockVault } from '@/lib/crypto/memory';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function LockButton() {
  const router = useRouter();

  const handleLock = async () => {
    lockVault();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleLock} aria-label="Lock vault">
      <Lock className="h-5 w-5" />
    </Button>
  );
}
```

#### `src/components/UnlockPrompt.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { masterPasswordSchema, type MasterPasswordInput } from '@/lib/validators';
import { supabase } from '@/lib/supabase/client';
import { deriveKEK } from '@/lib/crypto/derive';
import { unwrapVaultKey } from '@/lib/crypto/keys';
import { cacheVaultKey } from '@/lib/crypto/memory';
import { Shield } from 'lucide-react';

export function UnlockPrompt({ onUnlock }: { onUnlock: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<MasterPasswordInput>({
    resolver: zodResolver(masterPasswordSchema),
  });

  const onSubmit = async (data: MasterPasswordInput) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: keyData, error } = await supabase
        .from('user_keys')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !keyData) {
        toast({ title: 'Error', description: 'Failed to fetch vault key', variant: 'destructive' });
        return;
      }

      const kek = await deriveKEK(data.masterPassword, keyData.salt, keyData.kdf_iterations);
      const vaultKey = await unwrapVaultKey(keyData.vault_key_wrapped, keyData.vk_iv, kek);

      cacheVaultKey(vaultKey);
      toast({ title: 'Unlocked', description: 'Vault unlocked successfully' });
      onUnlock();
    } catch (err) {
      toast({ title: 'Error', description: 'Incorrect master password', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-2" />
          <CardTitle>Unlock Your Vault</CardTitle>
          <CardDescription>Enter your master password</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <Label htmlFor="masterPassword">Master Password</Label>
            <Input
              id="masterPassword"
              type="password"
              {...register('masterPassword')}
              disabled={isLoading}
            />
            {errors.masterPassword && (
              <p className="text-sm text-destructive mt-1">{errors.masterPassword.message}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Unlocking...' : 'Unlock'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

### 3. Vault Components

Create these in `src/components/`:

- `VaultList.tsx` - Fetches and displays vault items
- `VaultItemCard.tsx` - Individual item with reveal/copy buttons
- `VaultEditorDialog.tsx` - Create/edit dialog with form
- `PasswordGenerator.tsx` - Password generation utility
- `CopyButton.tsx` - Copy to clipboard with feedback

### 4. Server Actions

#### `src/app/actions/vault.ts`

```typescript
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createVaultItem(data: {
  title: string;
  enc_payload: string;
  iv: string;
}) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('vault_items').insert({
    user_id: user.id,
    ...data,
  });

  if (error) throw error;
  revalidatePath('/app');
}

export async function updateVaultItem(
  id: string,
  data: {
    title: string;
    enc_payload: string;
    iv: string;
  }
) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('vault_items')
    .update(data)
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/app');
}

export async function deleteVaultItem(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('vault_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/app');
}
```

### 5. Tests

Create test files in `src/__tests__/`:

- `crypto.test.ts` - Test encryption/decryption
- `utils.test.ts` - Test base64 and helpers

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { encryptPayload, decryptPayload } from '@/lib/crypto/aes';
import { generateVaultKey } from '@/lib/crypto/keys';

describe('AES Encryption', () => {
  it('should encrypt and decrypt payload', async () => {
    const vaultKey = await generateVaultKey();
    const data = { username: 'test', password: 'secret123' };

    const { cipherB64, ivB64 } = await encryptPayload(vaultKey, data);
    const decrypted = await decryptPayload(vaultKey, cipherB64, ivB64);

    expect(decrypted).toEqual(data);
  });
});
```

### 6. CI/CD & Tooling

See next files for complete setup.

---

## Installation Steps After Creating Files

1. **Install dependencies**:

   ```powershell
   npm install
   ```

2. **Copy environment file**:

   ```powershell
   copy .env.local.example .env.local
   ```

3. **Run Supabase migration**:
   - Open Supabase SQL Editor
   - Paste content from `supabase/migrations/001_init_schema.sql`
   - Execute

4. **Start development server**:

   ```powershell
   npm run dev
   ```

5. **Run tests**:
   ```powershell
   npm run test
   ```

All TypeScript errors shown during file creation are expected and will resolve once `npm install` completes.
