'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = stored || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!mounted) {
    return (
      <div className="w-12 h-12 bg-[var(--muted)] border-[3px] border-[var(--border)]" />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-12 h-12 flex items-center justify-center bg-[var(--surface)] border-[3px] border-[var(--border)] shadow-[var(--shadow-brutal)] overflow-hidden"
      whileHover={{
        x: -2,
        y: -2,
        boxShadow: 'var(--shadow-brutal-hover)'
      }}
      whileTap={{
        x: 1,
        y: 1,
        boxShadow: 'var(--shadow-brutal-active)'
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 90, scale: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            <Sun className="h-5 w-5 text-[var(--text)]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -90, scale: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            <Moon className="h-5 w-5 text-[var(--text)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple effect background */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: theme === 'light' ? '#1a1a1a' : '#FFE156' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: 0.2 }}
        transition={{ duration: 0.4 }}
      />
    </motion.button>
  );
}
