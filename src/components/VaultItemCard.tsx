'use client';

import { useState, useEffect } from 'react';
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
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('vault_items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Item removed from your vault',
      });

      onDelete();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: 'Could not remove item',
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
    <div className="p-6 bg-white border-[3px] border-[#1a1a1a] shadow-[6px_6px_0_#1a1a1a] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_#1a1a1a] group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          {/* Icon */}
          <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#FFE156] border-[3px] border-[#1a1a1a] shadow-[2px_2px_0_#1a1a1a] overflow-hidden">
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
            <Globe className={`h-5 w-5 text-[#1a1a1a] ${faviconUrl ? 'hidden' : ''}`} />
          </div>

          {/* Title */}
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#1a1a1a] truncate">
              {item.title}
            </h3>
            {item.username && (
              <p className="text-sm text-[#666666] truncate mt-1">
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
          <DropdownMenuContent align="end" className="w-40 bg-white border-[3px] border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a]">
            <DropdownMenuItem onClick={() => onEdit(item)} className="gap-2 cursor-pointer font-medium">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1a1a1a]" />
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 cursor-pointer font-medium text-[#FF8A80]"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Password field */}
      <div className="space-y-3">
        <div className="p-4 bg-[#FEF9EF] border-[3px] border-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4 text-[#FF6B9D]" />
            <span className="text-sm font-bold text-[#1a1a1a]">Password</span>
          </div>
          <div className="flex items-center gap-3">
            <code className={`flex-1 text-sm font-mono truncate ${showPassword ? 'text-[#1a1a1a]' : 'text-[#999999]'}`}>
              {showPassword ? item.password : '••••••••••••••••'}
            </code>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <CopyButton text={item.password} label="Password" />
            </div>
          </div>
        </div>

        {/* Username */}
        {item.username && (
          <div className="flex items-center justify-between p-3 bg-white border-[2px] border-[#1a1a1a]">
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-4 w-4 text-[#666666] shrink-0" />
              <span className="text-sm text-[#1a1a1a] truncate">{item.username}</span>
            </div>
            <CopyButton text={item.username} label="Username" />
          </div>
        )}

        {/* URL */}
        {item.url && (
          <div className="flex items-center justify-between p-3 bg-white border-[2px] border-[#1a1a1a]">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-w-0 text-sm text-[#7DD3FC] hover:underline truncate font-medium"
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
            </a>
            <CopyButton text={item.url} label="URL" />
          </div>
        )}

        {/* Notes preview */}
        {item.notes && (
          <div className="p-3 bg-[#E8FFF5] border-[2px] border-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-[#1a1a1a]" />
              <span className="text-sm font-bold text-[#1a1a1a]">Notes</span>
            </div>
            <p className="text-sm text-[#666666] line-clamp-2">
              {item.notes}
            </p>
          </div>
        )}

        {/* Custom fields */}
        {item.extras && item.extras.length > 0 && (
          <div className="pt-4 border-t-[2px] border-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-4 w-4 text-[#666666]" />
              <span className="text-sm font-bold text-[#1a1a1a]">Custom Fields</span>
            </div>
            <div className="space-y-2">
              {item.extras.map((extra, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#F5F5F5] border-[2px] border-[#1a1a1a]">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#666666] font-medium">{extra.key}</p>
                    <p className="text-sm text-[#1a1a1a] truncate">{extra.value}</p>
                  </div>
                  <CopyButton text={extra.value} label={extra.key} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t-[2px] border-[#e5e5e5]">
        <p className="text-xs text-[#999999]">
          Updated: {new Date(item.updated_at).toLocaleDateString()}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(item)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  );
}
