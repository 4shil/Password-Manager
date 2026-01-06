'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy, RefreshCw, Check, Sparkles, Settings2 } from 'lucide-react';
import { toast } from './ui/use-toast';
import { generateRandomBytes } from '@/lib/utils';

interface PasswordGeneratorProps {
  onGenerate?: (password: string) => void;
}

export function PasswordGenerator({ onGenerate }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.digits) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one character type',
        variant: 'destructive',
      });
      return;
    }

    const randomBytes = generateRandomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset[randomBytes[i] % charset.length];
    }

    setPassword(result);
    if (onGenerate) {
      onGenerate(result);
    }
  };

  const copyPassword = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Password copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy password',
        variant: 'destructive',
      });
    }
  };

  // Calculate password entropy
  const getEntropy = () => {
    let poolSize = 0;
    if (options.lowercase) poolSize += 26;
    if (options.uppercase) poolSize += 26;
    if (options.digits) poolSize += 10;
    if (options.symbols) poolSize += 28;
    return Math.round(Math.log2(Math.pow(poolSize, length)));
  };

  const entropy = getEntropy();
  const entropyLabel = entropy < 40 ? 'Weak' : entropy < 60 ? 'Fair' : entropy < 80 ? 'Good' : 'Strong';
  const entropyColor = entropy < 40 ? 'text-destructive' : entropy < 60 ? 'text-warning' : entropy < 80 ? 'text-accent' : 'text-success';

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Password Generator
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowOptions(!showOptions)}
            className="h-8 gap-1"
          >
            <Settings2 className="h-4 w-4" />
            {showOptions ? 'Hide' : 'Options'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="length" className="text-sm">Length</Label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{length}</span>
              <span className="text-xs text-muted-foreground">characters</span>
            </div>
          </div>
          <input
            id="length"
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>8</span>
            <span>64</span>
          </div>
        </div>

        {/* Options */}
        {showOptions && (
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-background/50 border border-border/50">
            {[
              { key: 'lowercase', label: 'Lowercase (a-z)' },
              { key: 'uppercase', label: 'Uppercase (A-Z)' },
              { key: 'digits', label: 'Numbers (0-9)' },
              { key: 'symbols', label: 'Symbols (!@#$)' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <Label htmlFor={key} className="text-xs">{label}</Label>
                <Switch
                  id={key}
                  checked={options[key as keyof typeof options]}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, [key]: checked })
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Generated Password Display */}
        {password && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border/50">
              <code className="flex-1 text-sm font-mono break-all">{password}</code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={copyPassword}
                className={`h-8 w-8 shrink-0 ${copied ? 'text-success' : ''}`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Entropy Indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Entropy: {entropy} bits</span>
              <span className={`font-medium ${entropyColor}`}>{entropyLabel}</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          type="button"
          onClick={generatePassword}
          className="w-full gradient-primary hover-scale press"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${password ? '' : ''}`} />
          {password ? 'Regenerate' : 'Generate Password'}
        </Button>

        {/* Use Button (when onGenerate is provided) */}
        {password && onGenerate && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onGenerate(password);
              toast({
                title: 'Password applied',
                description: 'The generated password has been filled in',
              });
            }}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Use This Password
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
