'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { lockVault, getRemainingTime, formatTime } from '@/lib/crypto/memory';
import { Button } from './ui/button';
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
      title: 'VAULT LOCKED',
      description: 'Session terminated. Memory wiped.',
    });
  };

  const handleLogout = async () => {
    lockVault();
    await supabase.auth.signOut();
    router.push('/login');
    toast({
      title: 'DISCONNECTED',
      description: 'Session terminated.',
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-[oklch(0.20_0.02_270)] bg-[oklch(0.05_0.005_270)/0.9] backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/app" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.55_0.28_280)] to-[oklch(0.50_0.30_300)] blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-9 h-9 flex items-center justify-center border-2 border-[oklch(0.55_0.28_280)]">
                <Shield className="h-4 w-4 text-[oklch(0.75_0.18_195)]" />
              </div>
            </div>
            <span className="text-lg font-bold uppercase tracking-[0.15em] text-white hidden sm:block">
              VAULT<span className="text-[oklch(0.75_0.18_195)]">_X</span>
            </span>
          </Link>

          {/* Status & Actions */}
          <div className="flex items-center gap-4">
            {/* Auto-lock timer */}
            {remainingTime > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[oklch(0.25_0.02_270)] bg-[oklch(0.08_0.01_270)]">
                <Clock className="h-3 w-3 text-[oklch(0.75_0.18_195)]" />
                <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">
                  AUTO-LOCK: <span className="text-white">{formatTime(remainingTime)}</span>
                </span>
              </div>
            )}

            {/* Lock button */}
            <Button variant="ghost" size="sm" onClick={handleLock}>
              <Lock className="h-4 w-4 mr-2" />
              LOCK
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline max-w-[120px] truncate font-mono text-xs">
                    {email?.split('@')[0] || 'OPERATOR'}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[oklch(0.08_0.01_270)] border-2 border-[oklch(0.25_0.02_270)]">
                <div className="px-3 py-2 border-b border-[oklch(0.20_0.02_270)]">
                  <p className="text-xs font-mono text-[oklch(0.45_0.02_270)]">OPERATOR</p>
                  <p className="text-sm font-mono text-white truncate">{email}</p>
                </div>
                <DropdownMenuItem onClick={() => router.push('/app/settings')} className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span className="uppercase tracking-wide text-xs">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[oklch(0.20_0.02_270)]" />
                <DropdownMenuItem onClick={handleLock} className="gap-2 cursor-pointer">
                  <Lock className="h-4 w-4" />
                  <span className="uppercase tracking-wide text-xs">Lock Vault</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-[oklch(0.60_0.25_25)]">
                  <LogOut className="h-4 w-4" />
                  <span className="uppercase tracking-wide text-xs">Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
