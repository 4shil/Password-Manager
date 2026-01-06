'use client';

import { useState, useEffect, useRef } from 'react';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/Header';
import { UnlockPrompt } from '@/components/UnlockPrompt';
import { VaultList } from '@/components/VaultList';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getVaultKey, lockVault } from '@/lib/crypto/memory';
import { useKeyboardShortcuts, SHORTCUT_KEYS } from '@/hooks/useKeyboardShortcuts';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Shield } from 'lucide-react';

export default function AppPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...SHORTCUT_KEYS.NEW_ITEM,
        action: () => {
          if (isUnlocked) {
            setShowAddDialog(true);
          }
        },
      },
      {
        ...SHORTCUT_KEYS.LOCK_VAULT,
        action: () => {
          if (isUnlocked) {
            lockVault();
            setIsUnlocked(false);
            toast({
              title: 'Vault Locked',
              description: 'Your vault has been securely locked',
            });
          }
        },
      },
      {
        ...SHORTCUT_KEYS.SEARCH,
        action: () => {
          if (isUnlocked) {
            // Focus the search input in VaultList
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }
        },
      },
    ],
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl gradient-primary opacity-20 blur-xl scale-150 pulse-glow" />
            <div className="relative w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading vault...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header onLock={() => setIsUnlocked(false)} />

        <main className="flex-1 container mx-auto px-4 py-8">
          {isUnlocked ? (
            <VaultList />
          ) : (
            <UnlockPrompt open={!isUnlocked} onUnlock={() => setIsUnlocked(true)} />
          )}
        </main>

        <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
          <p>Zero-knowledge password manager • All data encrypted client-side</p>
          <p className="mt-1 text-xs opacity-70">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Ctrl+N</kbd> to add,
            <kbd className="ml-2 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Ctrl+L</kbd> to lock
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
