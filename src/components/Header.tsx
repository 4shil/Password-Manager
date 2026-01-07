'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { lockVault, getRemainingTime, formatTime } from '@/lib/crypto/memory';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from './ui/use-toast';
import { Shield, Lock, LogOut, User, Clock, Settings, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onLock: () => void;
}

export function Header({ onLock }: HeaderProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setEmail(data.user.email ?? null);
      }
    };
    getUser();
  }, []);

  // Update remaining time every second
  useEffect(() => {
    const updateTime = () => {
      setRemainingTime(getRemainingTime());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLock = () => {
    lockVault();
    onLock();
    toast({
      title: 'Vault locked',
      description: 'Your session has been secured',
    });
  };

  const handleLogout = async () => {
    lockVault();
    await supabase.auth.signOut();
    router.push('/login');
    toast({
      title: 'Signed out',
      description: 'See you next time!',
    });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 w-full border-b-[3px] border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/app" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 flex items-center justify-center bg-[var(--yellow)] border-[3px] border-[var(--border)] shadow-[2px_2px_0_var(--shadow-color)]"
              whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0 var(--shadow-color)' }}
              whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0 var(--shadow-color)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Shield className="h-5 w-5 text-[#1a1a1a]" />
            </motion.div>
            <span className="text-lg font-bold text-[var(--text)] hidden sm:block">
              Password<span className="text-[var(--pink)]">Vault</span>
            </span>
          </Link>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Auto-lock timer */}
            {remainingTime > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[var(--muted)] border-[2px] border-[var(--border)]"
              >
                <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-muted)]">
                  Auto-lock: <span className="font-bold text-[var(--text)]">{formatTime(remainingTime)}</span>
                </span>
              </motion.div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Lock button */}
            <Button variant="outline" size="sm" onClick={handleLock}>
              <Lock className="h-4 w-4 mr-2" />
              Lock
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline max-w-[120px] truncate text-sm">
                    {email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[var(--surface)] border-[3px] border-[var(--border)] shadow-[4px_4px_0_var(--shadow-color)]">
                <div className="px-3 py-2 border-b-[2px] border-[var(--border-light)]">
                  <p className="text-xs text-[var(--text-muted)]">Signed in as</p>
                  <p className="text-sm font-bold text-[var(--text)] truncate">{email}</p>
                </div>
                <DropdownMenuItem onClick={() => router.push('/app/settings')} className="gap-2 cursor-pointer font-medium">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--border-light)]" />
                <DropdownMenuItem onClick={handleLock} className="gap-2 cursor-pointer font-medium">
                  <Lock className="h-4 w-4" />
                  <span>Lock Vault</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer font-medium text-[var(--coral)]">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
