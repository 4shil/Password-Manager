'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from './ui/use-toast';
import { cn } from '@/lib/cn';

interface CopyButtonProps {
  text: string;
  label?: string;
  onCopy?: () => void;
  className?: string;
}

export function CopyButton({ text, label = 'Copy', onCopy, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (onCopy) {
        onCopy();
      }

      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      aria-label={label}
      className={cn('h-8 w-8', className)}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
