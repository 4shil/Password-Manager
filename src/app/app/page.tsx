'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { UnlockPrompt } from '@/components/UnlockPrompt';
import { VaultList } from '@/components/VaultList';
import { getVaultKey } from '@/lib/crypto/memory';

export default function AppPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        redirect('/login');
      }

      setIsAuthenticated(true);
      setIsUnlocked(!!getVaultKey());
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        redirect('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLock={() => setIsUnlocked(false)} />

      <main className="flex-1 container mx-auto px-4 py-8">
        {isUnlocked ? (
          <VaultList />
        ) : (
          <UnlockPrompt open={!isUnlocked} onUnlock={() => setIsUnlocked(true)} />
        )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Zero-knowledge password manager • All data encrypted client-side</p>
      </footer>
    </div>
  );
}
