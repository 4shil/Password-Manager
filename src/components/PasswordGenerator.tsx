'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy, RefreshCw, Check, Sparkles, Settings2, Zap } from 'lucide-react';
import { toast } from './ui/use-toast';
import { generateRandomBytes } from '@/lib/utils';

interface PasswordGeneratorProps {
  onGenerate?: (password: string) => void;
}

export function PasswordGenerator({ onGenerate }: PasswordGeneratorProps) {
  const [length, setLength] = useState(20);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generatePassword = () => {
    setGenerating(true);

    // Brief delay for visual effect
    setTimeout(() => {
      let charset = '';
      if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (options.digits) charset += '0123456789';
      if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (charset.length === 0) {
        toast({
          title: 'ERROR',
          description: 'Select at least one character type',
          variant: 'destructive',
        });
        setGenerating(false);
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
      setGenerating(false);
    }, 200);
  };

  const copyPassword = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'COPIED',
        description: 'Password copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'COPY FAILED',
        description: 'Unable to access clipboard',
        variant: 'destructive',
      });
    }
  };

  // Calculate entropy
  const getEntropy = () => {
    let poolSize = 0;
    if (options.lowercase) poolSize += 26;
    if (options.uppercase) poolSize += 26;
    if (options.digits) poolSize += 10;
    if (options.symbols) poolSize += 28;
    return Math.round(Math.log2(Math.pow(poolSize || 1, length)));
  };

  const entropy = getEntropy();
  const entropyLevel =
    entropy < 40 ? { label: 'WEAK', color: 'oklch(0.60 0.25 25)' } :
      entropy < 60 ? { label: 'FAIR', color: 'oklch(0.75 0.18 85)' } :
        entropy < 80 ? { label: 'STRONG', color: 'oklch(0.75 0.18 195)' } :
          { label: 'MAXIMUM', color: 'oklch(0.72 0.19 155)' };

  return (
    <div className="p-6 bg-[oklch(0.08_0.01_270)] border-2 border-[oklch(0.55_0.28_280)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center border-2 border-[oklch(0.55_0.28_280)]">
            <Zap className="h-5 w-5 text-[oklch(0.75_0.18_195)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-white">
              GENERATOR
            </h3>
            <p className="text-xs font-mono text-[oklch(0.45_0.02_270)]">
              CRYPTOGRAPHIC RANDOMNESS
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Settings2 className="h-4 w-4 mr-2" />
          {showOptions ? 'HIDE' : 'OPTIONS'}
        </Button>
      </div>

      {/* Length slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)]">
            LENGTH
          </span>
          <span className="text-2xl font-bold font-mono text-[oklch(0.75_0.18_195)]">
            {length}
          </span>
        </div>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="w-full h-2 bg-[oklch(0.15_0.02_270)] appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, oklch(0.55 0.28 280) 0%, oklch(0.55 0.28 280) ${((length - 8) / 56) * 100}%, oklch(0.15 0.02 270) ${((length - 8) / 56) * 100}%, oklch(0.15 0.02 270) 100%)`
          }}
        />
        <div className="flex justify-between mt-2 text-xs font-mono text-[oklch(0.35_0.02_270)]">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      {/* Options */}
      {showOptions && (
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[oklch(0.05_0.005_270)] border border-[oklch(0.20_0.02_270)]">
          {[
            { key: 'lowercase', label: 'a-z' },
            { key: 'uppercase', label: 'A-Z' },
            { key: 'digits', label: '0-9' },
            { key: 'symbols', label: '!@#$' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">{label}</span>
              <Switch
                checked={options[key as keyof typeof options]}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, [key]: checked })
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Generated password display */}
      {password && (
        <div className="mb-6">
          <div className="flex items-center gap-3 p-4 bg-[oklch(0.05_0.005_270)] border border-[oklch(0.20_0.02_270)]">
            <code className={`flex-1 text-sm font-mono break-all ${generating ? 'animate-shimmer text-[oklch(0.45_0.02_270)]' : 'text-[oklch(0.72_0.19_155)]'}`}>
              {generating ? '████████████████████' : password}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyPassword}
              className={`h-8 w-8 shrink-0 ${copied ? 'text-[oklch(0.72_0.19_155)]' : ''}`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Entropy indicator */}
          <div className="flex items-center justify-between mt-3 text-xs font-mono">
            <span className="text-[oklch(0.45_0.02_270)]">
              ENTROPY: <span className="text-white">{entropy}</span> bits
            </span>
            <span style={{ color: entropyLevel.color }}>
              {entropyLevel.label}
            </span>
          </div>
        </div>
      )}

      {/* Generate button */}
      <Button
        onClick={generatePassword}
        className="w-full"
        disabled={generating}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
        {password ? 'REGENERATE' : 'GENERATE'}
      </Button>

      {/* Use button */}
      {password && onGenerate && (
        <Button
          variant="outline"
          onClick={() => {
            onGenerate(password);
            toast({
              title: 'APPLIED',
              description: 'Password set in form',
            });
          }}
          className="w-full mt-3"
        >
          <Check className="h-4 w-4 mr-2" />
          USE THIS PASSWORD
        </Button>
      )}
    </div>
  );
}
