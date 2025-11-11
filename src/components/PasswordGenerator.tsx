'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Copy, RefreshCw } from 'lucide-react';
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
      toast({
        title: 'Copied',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="length">Length: {length}</Label>
          <Input
            id="length"
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="lowercase">Lowercase (a-z)</Label>
            <Switch
              id="lowercase"
              checked={options.lowercase}
              onCheckedChange={(checked) =>
                setOptions({ ...options, lowercase: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
            <Switch
              id="uppercase"
              checked={options.uppercase}
              onCheckedChange={(checked) =>
                setOptions({ ...options, uppercase: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="digits">Digits (0-9)</Label>
            <Switch
              id="digits"
              checked={options.digits}
              onCheckedChange={(checked) =>
                setOptions({ ...options, digits: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="symbols">Symbols (!@#$...)</Label>
            <Switch
              id="symbols"
              checked={options.symbols}
              onCheckedChange={(checked) =>
                setOptions({ ...options, symbols: checked })
              }
            />
          </div>
        </div>

        {password && (
          <div className="space-y-2">
            <Label>Generated Password</Label>
            <div className="flex gap-2">
              <Input value={password} readOnly className="font-mono" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyPassword}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Button type="button" onClick={generatePassword} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Password
        </Button>
      </CardContent>
    </Card>
  );
}
