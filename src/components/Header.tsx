 'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Lock, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { lockVault } from '@/lib/crypto/memory';
import { toast } from './ui/use-toast';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onLock: () => void;
}

export function Header({ onLock }: HeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLock = () => {
    lockVault();
    toast({
      title: 'Locked',
      description: 'Vault locked successfully',
    });
    onLock();
  };

  const handleLogout = async () => {
    if (loggingOut) return; // prevent duplicate clicks
    setLoggingOut(true);
    try {
      lockVault();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to log out',
          variant: 'destructive',
        });
        setLoggingOut(false);
        return;
      }

      router.push('/login');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    } catch (err: any) {
      console.error('Unexpected sign out error:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to log out',
        variant: 'destructive',
      });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Password Manager</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLock}>
            <Lock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
