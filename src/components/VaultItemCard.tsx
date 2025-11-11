'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CopyButton } from './CopyButton';
import { Eye, EyeOff, Edit, Trash2, ExternalLink } from 'lucide-react';
import type { DecryptedVaultItem } from '@/lib/validators';
import { toast } from './ui/use-toast';
import { supabase } from '@/lib/supabase/client';

interface VaultItemCardProps {
  item: DecryptedVaultItem;
  onEdit: (item: DecryptedVaultItem) => void;
  onDelete: () => void;
}

export function VaultItemCard({ item, onEdit, onDelete }: VaultItemCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Auto-hide password after 10 seconds
  useState(() => {
    if (showPassword) {
      const timer = setTimeout(() => setShowPassword(false), 10000);
      return () => clearTimeout(timer);
    }
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.username && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-sm font-mono truncate">{item.username}</p>
            </div>
            <CopyButton text={item.username} label="Username" />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Password</p>
            <p className="text-sm font-mono truncate">
              {showPassword ? item.password : '••••••••••••'}
            </p>
          </div>
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

        {item.url && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">URL</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate flex items-center gap-1"
              >
                <span className="truncate">{item.url}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
            <CopyButton text={item.url} label="URL" />
          </div>
        )}

        {item.notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.notes}
            </p>
          </div>
        )}

        {item.extras && item.extras.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Custom Fields</p>
            <div className="space-y-2">
              {item.extras.map((extra, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{extra.key}</p>
                    <p className="text-sm font-mono truncate">{extra.value}</p>
                  </div>
                  <CopyButton text={extra.value} label={extra.key} />
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground pt-2">
          Updated: {new Date(item.updated_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
