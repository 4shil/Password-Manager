'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { Lock, LogOut, Shield, Timer, ChevronDown, User } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { lockVault, getFormattedTimeUntilLock, isVaultUnlocked } from '@/lib/crypto/memory';
import { toast } from './ui/use-toast';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  onLock: () => void;
}

export function Header({ onLock }: HeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [timeUntilLock, setTimeUntilLock] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (isVaultUnlocked()) {
        setTimeUntilLock(getFormattedTimeUntilLock());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get user email
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || null);
    };
    getUser();
  }, []);

  const handleLock = () => {
    lockVault();
    toast({
      title: 'Vault Locked',
      description: 'Your vault has been securely locked',
    });
    onLock();
  };

  const handleLogout = async () => {
    if (loggingOut) return;
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
    <header className="sticky top-0 z-50 border-b border-border/50 glass">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-primary/10 glow-ring">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">ZK Vault</h1>
            {isVaultUnlocked() && timeUntilLock && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />
                <span>Auto-lock in {timeUntilLock}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Lock Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLock}
            className="gap-2 hover-scale"
          >
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Lock</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 hover-scale">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  {userEmail && (
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {userEmail}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLock}>
                <Lock className="h-4 w-4 mr-2" />
                Lock Vault
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {loggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
