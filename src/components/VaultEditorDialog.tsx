'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from './ui/use-toast';
import { PasswordGenerator } from './PasswordGenerator';
import { getVaultKey } from '@/lib/crypto/memory';
import { encryptPayload } from '@/lib/crypto/aes';
import { supabase } from '@/lib/supabase/client';
import {
  createVaultItemSchema,
  type CreateVaultItemInput,
  type DecryptedVaultItem,
  type VaultItemExtra,
} from '@/lib/validators';
import { Plus, Trash2 } from 'lucide-react';

interface VaultEditorDialogProps {
  open: boolean;
  item?: DecryptedVaultItem;
  onClose: () => void;
}

export function VaultEditorDialog({ open, item, onClose }: VaultEditorDialogProps) {
  const [saving, setSaving] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [extras, setExtras] = useState<VaultItemExtra[]>(item?.extras || []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateVaultItemInput>({
    resolver: zodResolver(createVaultItemSchema),
    defaultValues: item
      ? {
          title: item.title,
          username: item.username || '',
          password: item.password,
          url: item.url || '',
          notes: item.notes || '',
          extras: item.extras || [],
        }
      : undefined,
  });

  const onSubmit = async (data: CreateVaultItemInput) => {
    setSaving(true);

    try {
      const vaultKey = getVaultKey();
      if (!vaultKey) {
        toast({
          title: 'Error',
          description: 'Vault is locked',
          variant: 'destructive',
        });
        return;
      }

      // Prepare payload for encryption
      const payload = {
        username: data.username || undefined,
        password: data.password,
        url: data.url || undefined,
        notes: data.notes || undefined,
        extras: extras.length > 0 ? extras : undefined,
      };

      const { cipherB64, ivB64 } = await encryptPayload(vaultKey, payload);

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('vault_items')
          .update({
            title: data.title,
            enc_payload: cipherB64,
            iv: ivB64,
          })
          .eq('id', item.id);

        if (error) throw error;

        toast({
          title: 'Updated',
          description: 'Vault item updated successfully',
        });
      } else {
        // Create new item
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('Not authenticated');

        const { error } = await supabase.from('vault_items').insert({
          user_id: userData.user.id,
          title: data.title,
          enc_payload: cipherB64,
          iv: ivB64,
        });

        if (error) throw error;

        toast({
          title: 'Created',
          description: 'Vault item created successfully',
        });
      }

      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save vault item',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addExtra = () => {
    setExtras([...extras, { key: '', value: '' }]);
  };

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const updateExtra = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...extras];
    updated[index][field] = value;
    setExtras(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'New Vault Item'}</DialogTitle>
          <DialogDescription>
            {item
              ? 'Update your vault item details'
              : 'Add a new password to your vault'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Gmail, Bank Account"
              {...register('title')}
              disabled={saving}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username / Email</Label>
            <Input
              id="username"
              placeholder="user@example.com"
              {...register('username')}
              disabled={saving}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password *</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setShowGenerator(!showGenerator)}
              >
                {showGenerator ? 'Hide' : 'Generate'}
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              {...register('password')}
              disabled={saving}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {showGenerator && (
            <PasswordGenerator
              onGenerate={(password) => {
                setValue('password', password);
                setShowGenerator(false);
              }}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              {...register('url')}
              disabled={saving}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Additional information..."
              {...register('notes')}
              disabled={saving}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Custom Fields</Label>
              <Button type="button" variant="outline" size="sm" onClick={addExtra}>
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>
            {extras.map((extra, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Field name"
                  value={extra.key}
                  onChange={(e) => updateExtra(index, 'key', e.target.value)}
                  disabled={saving}
                />
                <Input
                  placeholder="Value"
                  value={extra.value}
                  onChange={(e) => updateExtra(index, 'value', e.target.value)}
                  disabled={saving}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExtra(index)}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : item ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
