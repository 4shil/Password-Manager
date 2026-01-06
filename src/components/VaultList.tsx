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
import { Search, Plus, Loader2, KeyRound, Sparkles, Filter, LayoutGrid, List } from 'lucide-react';
import type { VaultItem, DecryptedVaultItem, VaultItemPayload } from '@/lib/validators';

// Skeleton component for loading state
function VaultItemSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 rounded skeleton" />
          <div className="h-3 w-24 rounded skeleton" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-12 rounded-lg skeleton" />
        <div className="h-10 rounded-lg skeleton" />
      </div>
    </div>
  );
}

export function VaultList() {
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

          const payloadObj = (payload ?? {}) as VaultItemPayload;

          return {
            id: item.id,
            title: item.title,
            created_at: item.created_at,
            updated_at: item.updated_at,
            ...payloadObj,
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

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">{part}</mark>
        : part
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 page-enter">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="h-10 w-full max-w-md rounded-xl skeleton" />
          <div className="h-10 w-32 rounded-xl skeleton" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <VaultItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-colors"
          />
          {searchQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {filteredItems.length} found
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Button */}
          <Button
            onClick={() => setShowAddDialog(true)}
            className="gradient-primary hover-scale press shadow-lg gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Password</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 float">
            <KeyRound className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? 'No matches found' : 'Your vault is empty'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {searchQuery
              ? `No passwords match "${searchQuery}". Try a different search term.`
              : 'Start by adding your first password. All data is encrypted client-side.'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setShowAddDialog(true)}
              className="gradient-primary hover-scale press shadow-lg gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Add Your First Password
            </Button>
          )}
        </div>
      ) : (
        /* Items Grid/List */
        <div className={
          viewMode === 'grid'
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children"
            : "flex flex-col gap-4 stagger-children"
        }>
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

      {/* Stats Bar */}
      {items.length > 0 && (
        <div className="flex items-center justify-center gap-6 py-4 text-sm text-muted-foreground border-t border-border/50">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span>{items.length} {items.length === 1 ? 'password' : 'passwords'}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>All encrypted</span>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <VaultEditorDialog
          open={showAddDialog}
          onClose={() => {
            setShowAddDialog(false);
            loadVaultItems();
          }}
        />
      )}

      {/* Edit Dialog */}
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
