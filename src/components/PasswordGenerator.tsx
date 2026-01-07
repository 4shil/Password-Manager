'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Copy, RefreshCw, Check, Zap, Settings2 } from 'lucide-react';
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

    setTimeout(() => {
      let charset = '';
      if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (options.digits) charset += '0123456789';
      if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (charset.length === 0) {
        toast({
          title: 'Oops!',
          description: 'Pick at least one character type',
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
        title: 'Copied!',
        description: 'Password copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not access clipboard',
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
    entropy < 40 ? { label: 'Weak', color: '#FF8A80', bg: '#FFE5E2' } :
      entropy < 60 ? { label: 'Okay', color: '#FFB74D', bg: '#FFF3E0' } :
        entropy < 80 ? { label: 'Strong', color: '#7DD3FC', bg: '#E0F7FF' } :
          { label: 'Super Strong', color: '#A0F5D3', bg: '#E8FFF5' };

  return (
    <div className="p-6 bg-white border-[3px] border-[#1a1a1a] shadow-[6px_6px_0_#1a1a1a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center bg-[#FFE156] border-[3px] border-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a]">
            <Zap className="h-6 w-6 text-[#1a1a1a]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1a1a1a]">
              Password Generator
            </h3>
            <p className="text-sm text-[#666666]">
              Create strong passwords instantly
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Settings2 className="h-4 w-4 mr-2" />
          {showOptions ? 'Hide' : 'Options'}
        </Button>
      </div>

      {/* Length slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#1a1a1a]">
            Length
          </span>
          <span className="text-2xl font-bold text-[#1a1a1a] bg-[#FFE156] px-3 py-1 border-[2px] border-[#1a1a1a]">
            {length}
          </span>
        </div>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="w-full h-3 bg-[#F5F5F5] appearance-none cursor-pointer border-[2px] border-[#1a1a1a]"
          style={{
            background: `linear-gradient(to right, #FFE156 0%, #FFE156 ${((length - 8) / 56) * 100}%, #F5F5F5 ${((length - 8) / 56) * 100}%, #F5F5F5 100%)`
          }}
        />
        <div className="flex justify-between mt-2 text-sm font-medium text-[#666666]">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      {/* Options */}
      {showOptions && (
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-[#FEF9EF] border-[3px] border-[#1a1a1a]">
          {[
            { key: 'lowercase', label: 'a-z', desc: 'Lowercase' },
            { key: 'uppercase', label: 'A-Z', desc: 'Uppercase' },
            { key: 'digits', label: '0-9', desc: 'Numbers' },
            { key: 'symbols', label: '!@#', desc: 'Symbols' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-2 bg-white border-[2px] border-[#1a1a1a]">
              <div>
                <span className="text-lg font-bold text-[#1a1a1a]">{label}</span>
                <p className="text-xs text-[#666666]">{desc}</p>
              </div>
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
          <div className="flex items-center gap-3 p-4 bg-[#FEF9EF] border-[3px] border-[#1a1a1a]">
            <code className={`flex-1 text-sm font-mono break-all ${generating ? 'opacity-50' : 'text-[#1a1a1a]'}`}>
              {generating ? '████████████████████' : password}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyPassword}
              className={`h-10 w-10 shrink-0 ${copied ? 'bg-[#A0F5D3]' : ''}`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Entropy indicator */}
          <div className="mt-4 p-3 border-[2px] border-[#1a1a1a]" style={{ backgroundColor: entropyLevel.bg }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1a1a1a]">
                Strength: <span className="font-bold">{entropy} bits</span>
              </span>
              <span
                className="px-3 py-1 text-sm font-bold border-[2px] border-[#1a1a1a]"
                style={{ backgroundColor: entropyLevel.color }}
              >
                {entropyLevel.label}
              </span>
            </div>
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
        {password ? 'Generate New' : 'Generate Password'}
      </Button>

      {/* Use button */}
      {password && onGenerate && (
        <Button
          variant="outline"
          onClick={() => {
            onGenerate(password);
            toast({
              title: 'Done!',
              description: 'Password added to form',
            });
          }}
          className="w-full mt-3"
        >
          <Check className="h-4 w-4 mr-2" />
          Use This Password
        </Button>
      )}
    </div>
  );
}
