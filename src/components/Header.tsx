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
    <header className="sticky top-0 z-40 w-full border-b-[3px] border-[#1a1a1a] bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/app" className="flex items-center gap-3 group">
            <div className="w-10 h-10 flex items-center justify-center bg-[#FFE156] border-[3px] border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0_#1a1a1a]">
              <Shield className="h-5 w-5 text-[#1a1a1a]" />
            </div>
            <span className="text-lg font-bold text-[#1a1a1a] hidden sm:block">
              Password<span className="text-[#FF6B9D]">Vault</span>
            </span>
          </Link>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Auto-lock timer */}
            {remainingTime > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#FEF9EF] border-[2px] border-[#1a1a1a]">
                <Clock className="h-4 w-4 text-[#666666]" />
                <span className="text-sm text-[#666666]">
                  Auto-lock: <span className="font-bold text-[#1a1a1a]">{formatTime(remainingTime)}</span>
                </span>
              </div>
            )}

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
              <DropdownMenuContent align="end" className="w-56 bg-white border-[3px] border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a]">
                <div className="px-3 py-2 border-b-[2px] border-[#e5e5e5]">
                  <p className="text-xs text-[#666666]">Signed in as</p>
                  <p className="text-sm font-bold text-[#1a1a1a] truncate">{email}</p>
                </div>
                <DropdownMenuItem onClick={() => router.push('/app/settings')} className="gap-2 cursor-pointer font-medium">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#e5e5e5]" />
                <DropdownMenuItem onClick={handleLock} className="gap-2 cursor-pointer font-medium">
                  <Lock className="h-4 w-4" />
                  <span>Lock Vault</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer font-medium text-[#FF8A80]">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
