'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getVaultKey } from '@/lib/crypto/memory';
import { decryptPayload } from '@/lib/crypto/aes';
import { VaultItemCard } from './VaultItemCard';
import { VaultEditorDialog } from './VaultEditorDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from './ui/use-toast';
import { Search, Plus, Loader2 } from 'lucide-react';
import type { VaultItem, DecryptedVaultItem, VaultItemPayload } from '@/lib/validators';

export function VaultList() {
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadVaultItems();
  }, []);

  const loadVaultItems = async () => {
    try {
      setLoading(true);
      const vaultKey = getVaultKey();
      
      if (!vaultKey) {
        toast({
          title: 'Error',
          description: 'Vault is locked',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Decrypt all items
      const decrypted = await Promise.all(
        (data as VaultItem[]).map(async (item) => {
          const payload = await decryptPayload<VaultItemPayload>(
            vaultKey,
            item.enc_payload,
            item.iv
          );
          return {
            id: item.id,
            title: item.title,
            created_at: item.created_at,
            updated_at: item.updated_at,
            ...payload,
          } as DecryptedVaultItem;
        })
      );

      setItems(decrypted);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load vault items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery
              ? 'No items match your search'
              : 'No vault items yet. Click "Add Item" to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <VaultItemCard
              key={item.id}
              item={item}
              onEdit={(item) => setEditingItem(item)}
              onDelete={() => loadVaultItems()}
            />
          ))}
        </div>
      )}

      {showAddDialog && (
        <VaultEditorDialog
          open={showAddDialog}
          onClose={() => {
            setShowAddDialog(false);
            loadVaultItems();
          }}
        />
      )}

      {editingItem && (
        <VaultEditorDialog
          open={!!editingItem}
          item={editingItem}
          onClose={() => {
            setEditingItem(null);
            loadVaultItems();
          }}
        />
      )}
    </div>
  );
}
