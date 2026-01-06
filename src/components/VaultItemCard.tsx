'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CopyButton } from './CopyButton';
import { Eye, EyeOff, Edit, Trash2, ExternalLink, Globe, User, Key, FileText, MoreVertical } from 'lucide-react';
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
  const [copied, setCopied] = useState<string | null>(null);

  // Auto-hide password after 10 seconds
  useEffect(() => {
    if (showPassword) {
      const timer = setTimeout(() => setShowPassword(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showPassword]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('vault_items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Vault item deleted successfully',
      });

      onDelete();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Get favicon URL from domain
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
    <Card className="vault-card group relative overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon/Favicon */}
            <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
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
              <Globe className={`h-5 w-5 text-primary vault-card-icon ${faviconUrl ? 'hidden' : ''}`} />
            </div>

            {/* Title */}
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{item.title}</CardTitle>
              {item.username && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {item.username}
                </p>
              )}
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Password Field - Always visible */}
        <div className="relative group/password">
          <div className="flex items-center gap-2 mb-1.5">
            <Key className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 group-hover/password:border-primary/30 transition-colors">
            <code className="flex-1 text-sm font-mono truncate">
              {showPassword ? item.password : '••••••••••••'}
            </code>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-background"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
              <CopyButton
                text={item.password}
                label="Password"
                onCopy={() => handleCopy(item.password, 'password')}
                className={copied === 'password' ? 'copy-success text-success' : ''}
              />
            </div>
          </div>
        </div>

        {/* Username Field */}
        {item.username && (
          <div className="group/field">
            <div className="flex items-center gap-2 mb-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Username</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-transparent group-hover/field:border-border/50 transition-colors">
              <span className="flex-1 text-sm font-mono truncate">{item.username}</span>
              <CopyButton
                text={item.username}
                label="Username"
                onCopy={() => handleCopy(item.username!, 'username')}
                className={copied === 'username' ? 'copy-success text-success' : ''}
              />
            </div>
          </div>
        )}

        {/* URL Field */}
        {item.url && (
          <div className="group/field">
            <div className="flex items-center gap-2 mb-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Website</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-transparent group-hover/field:border-border/50 transition-colors">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-primary hover:underline truncate flex items-center gap-2"
              >
                <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
              </a>
              <CopyButton
                text={item.url}
                label="URL"
                onCopy={() => handleCopy(item.url!, 'url')}
                className={copied === 'url' ? 'copy-success text-success' : ''}
              />
            </div>
          </div>
        )}

        {/* Notes Preview */}
        {item.notes && (
          <div className="group/field">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 p-3 rounded-lg bg-muted/30">
              {item.notes}
            </p>
          </div>
        )}

        {/* Custom Fields */}
        {item.extras && item.extras.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Custom Fields
            </p>
            <div className="space-y-2">
              {item.extras.map((extra, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{extra.key}</p>
                    <p className="text-sm font-mono truncate">{extra.value}</p>
                  </div>
                  <CopyButton
                    text={extra.value}
                    label={extra.key}
                    onCopy={() => handleCopy(extra.value, extra.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Updated {new Date(item.updated_at).toLocaleDateString()}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
