'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CopyButton } from './CopyButton';
import { Eye, EyeOff, Edit, Trash2, ExternalLink, Globe, User, Key, FileText, MoreVertical, Hash } from 'lucide-react';
import type { DecryptedVaultItem } from '@/lib/validators';
import { toast } from './ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface VaultItemCardProps {
  item: DecryptedVaultItem;
  onEdit: (item: DecryptedVaultItem) => void;
  onDelete: () => void;
}

export function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auto-hide password after 10 seconds
  useEffect(() => {
    if (showPassword) {
      const timer = setTimeout(() => setShowPassword(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showPassword]);

  const handleDelete = async () => {
    if (!confirm('CONFIRM DELETION: This action cannot be undone.')) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('vault_items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'ITEM DELETED',
        description: 'Record purged from vault.',
      });

      onDelete();
    } catch (err) {
      toast({
        title: 'DELETE FAILED',
        description: 'Unable to purge record.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Get favicon URL
  const getFaviconUrl = (url: string | undefined) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(item.url);

  return (
    <div className="vault-item group">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[oklch(0.55_0.28_280)] to-[oklch(0.50_0.30_300)] opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          {/* Icon */}
          <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-[oklch(0.25_0.02_270)] bg-[oklch(0.08_0.01_270)] overflow-hidden">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <Globe className={`h-5 w-5 text-[oklch(0.45_0.02_270)] ${faviconUrl ? 'hidden' : ''}`} />
          </div>

          {/* Title */}
          <div className="min-w-0">
            <h3 className="text-lg font-bold uppercase tracking-widest text-white truncate">
              {item.title}
            </h3>
            {item.username && (
              <p className="text-xs font-mono text-[oklch(0.45_0.02_270)] truncate mt-1">
                @{item.username}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-[oklch(0.08_0.01_270)] border-2 border-[oklch(0.25_0.02_270)]">
            <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              <span className="uppercase tracking-wide text-xs">Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[oklch(0.20_0.02_270)]" />
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 cursor-pointer text-[oklch(0.60_0.25_25)]"
            >
              <Trash2 className="h-4 w-4" />
              <span className="uppercase tracking-wide text-xs">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Password field */}
      <div className="space-y-4">
        <div className="p-4 bg-[oklch(0.05_0.005_270)] border border-[oklch(0.20_0.02_270)]">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-3 w-3 text-[oklch(0.55_0.28_280)]" />
            <span className="text-xs uppercase tracking-widest text-[oklch(0.55_0.28_280)]">Password</span>
          </div>
          <div className="flex items-center gap-3">
            <code className={`flex-1 text-sm font-mono truncate ${showPassword ? 'text-[oklch(0.72_0.19_155)]' : 'text-[oklch(0.45_0.02_270)]'}`}>
              {showPassword ? item.password : '••••••••••••••••'}
            </code>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
              <CopyButton text={item.password} label="Password" />
            </div>
          </div>
        </div>

        {/* Username */}
        {item.username && (
          <div className="flex items-center justify-between p-3 border border-[oklch(0.15_0.02_270)]">
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-3 w-3 text-[oklch(0.45_0.02_270)] shrink-0" />
              <span className="text-sm font-mono text-[oklch(0.75_0.02_270)] truncate">{item.username}</span>
            </div>
            <CopyButton text={item.username} label="Username" />
          </div>
        )}

        {/* URL */}
        {item.url && (
          <div className="flex items-center justify-between p-3 border border-[oklch(0.15_0.02_270)]">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-w-0 text-sm font-mono text-[oklch(0.75_0.18_195)] hover:underline truncate"
            >
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
            </a>
            <CopyButton text={item.url} label="URL" />
          </div>
        )}

        {/* Notes preview */}
        {item.notes && (
          <div className="p-3 border border-[oklch(0.15_0.02_270)]">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-3 w-3 text-[oklch(0.45_0.02_270)]" />
              <span className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)]">Notes</span>
            </div>
            <p className="text-sm font-mono text-[oklch(0.45_0.02_270)] line-clamp-2">
              {item.notes}
            </p>
          </div>
        )}

        {/* Custom fields */}
        {item.extras && item.extras.length > 0 && (
          <div className="pt-4 border-t border-[oklch(0.15_0.02_270)]">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-3 w-3 text-[oklch(0.45_0.02_270)]" />
              <span className="text-xs uppercase tracking-widest text-[oklch(0.45_0.02_270)]">Custom Fields</span>
            </div>
            <div className="space-y-2">
              {item.extras.map((extra, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[oklch(0.08_0.01_270)]">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[oklch(0.35_0.02_270)] uppercase tracking-wide">{extra.key}</p>
                    <p className="text-sm font-mono text-[oklch(0.75_0.02_270)] truncate">{extra.value}</p>
                  </div>
                  <CopyButton text={extra.value} label={extra.key} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[oklch(0.15_0.02_270)]">
        <p className="text-xs font-mono text-[oklch(0.35_0.02_270)]">
          UPDATED: {new Date(item.updated_at).toLocaleDateString()}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(item)}
        >
          <Edit className="h-3 w-3 mr-1" />
          EDIT
        </Button>
      </div>
    </div>
  );
}
