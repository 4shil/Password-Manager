'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { decryptPayload } from '@/lib/crypto/aes';
import { getVaultKey } from '@/lib/crypto/memory';
import { VaultItemCard } from './VaultItemCard';
import { VaultEditorDialog } from './VaultEditorDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from './ui/use-toast';
import { Plus, Search, Grid3X3, List, Shield, Loader2, X, Archive } from 'lucide-react';
import type { VaultItem, DecryptedVaultItem } from '@/lib/validators';

export function VaultList() {
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);

  const fetchAndDecrypt = async () => {
    setLoading(true);
    try {
      const vaultKey = getVaultKey();
      if (!vaultKey) {
        toast({
          title: 'VAULT LOCKED',
          description: 'Unlock vault to access credentials.',
          variant: 'destructive',
        });
        return;
      }

      const { data: rawItems, error } = await supabase
        .from('vault_items')
        .select('*')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const decrypted: DecryptedVaultItem[] = [];
      for (const item of rawItems ?? []) {
        try {
          const payload = await decryptPayload(item.encrypted_data, vaultKey);
          decrypted.push({
            id: item.id,
            user_id: item.user_id,
            title: item.title,
            ...payload,
            created_at: item.created_at,
            updated_at: item.updated_at,
          });
        } catch (e) {
          console.error('Decryption failed for item:', item.id);
        }
      }

      setItems(decrypted);
    } catch (err) {
      toast({
        title: 'LOAD FAILED',
        description: 'Unable to fetch vault data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndDecrypt();
  }, []);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.username?.toLowerCase().includes(search.toLowerCase()) ||
    item.url?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (item: DecryptedVaultItem) => {
    setEditingItem(item);
    setEditorOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setEditorOpen(true);
  };

  const handleClose = () => {
    setEditorOpen(false);
    setEditingItem(null);
    fetchAndDecrypt();
  };

  // Skeleton loader
  const Skeleton = () => (
    <div className="skeleton-cyber h-64" />
  );

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="relative mb-8">
          <div className="w-24 h-24 flex items-center justify-center border-2 border-[oklch(0.25_0.02_270)]">
            <Archive className="h-12 w-12 text-[oklch(0.35_0.02_270)]" />
          </div>
          <div className="absolute inset-0 animate-pulse-glow" style={{ boxShadow: '0 0 40px oklch(0.55 0.28 280 / 0.2)' }} />
        </div>
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-3">
          VAULT EMPTY
        </h2>
        <p className="text-sm font-mono text-[oklch(0.45_0.02_270)] mb-8 text-center max-w-md">
          No credentials stored. Initialize your first secure entry.
        </p>
        <Button onClick={handleAdd} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          ADD CREDENTIAL
        </Button>

        <VaultEditorDialog
          open={editorOpen}
          onClose={handleClose}
          item={editingItem}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.45_0.02_270)]" />
          <Input
            type="text"
            placeholder="SEARCH VAULT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.45_0.02_270)] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border-2 border-[oklch(0.25_0.02_270)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid'
                  ? 'bg-[oklch(0.55_0.28_280)] text-white'
                  : 'text-[oklch(0.45_0.02_270)] hover:text-white'
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list'
                  ? 'bg-[oklch(0.55_0.28_280)] text-white'
                  : 'text-[oklch(0.45_0.02_270)] hover:text-white'
                }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Add button */}
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            ADD
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 px-4 py-3 bg-[oklch(0.08_0.01_270)] border border-[oklch(0.20_0.02_270)]">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[oklch(0.55_0.28_280)]" />
          <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">
            TOTAL: <span className="text-white">{items.length}</span>
          </span>
        </div>
        {search && (
          <span className="text-xs font-mono text-[oklch(0.45_0.02_270)]">
            FILTERED: <span className="text-[oklch(0.75_0.18_195)]">{filteredItems.length}</span>
          </span>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* No results */}
          {filteredItems.length === 0 && search && (
            <div className="text-center py-16">
              <p className="text-sm font-mono text-[oklch(0.45_0.02_270)]">
                NO MATCHES FOR "<span className="text-white">{search}</span>"
              </p>
            </div>
          )}

          {/* Items grid/list */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className="animate-decrypt"
              >
                <VaultItemCard
                  item={item}
                  onEdit={handleEdit}
                  onDelete={fetchAndDecrypt}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Editor dialog */}
      <VaultEditorDialog
        open={editorOpen}
        onClose={handleClose}
        item={editingItem}
      />
    </div>
  );
}
