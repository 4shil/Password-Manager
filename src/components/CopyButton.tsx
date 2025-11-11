'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from './ui/use-toast';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
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
      className="h-8 w-8"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
