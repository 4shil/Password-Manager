-- Zero-Knowledge Password Manager Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USER KEYS TABLE
-- Stores wrapped vault key + KDF parameters
-- No plaintext secrets stored here!
-- ============================================
create table if not exists public.user_keys (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kdf text not null default 'pbkdf2-sha256',
  kdf_iterations integer not null default 200000,
  salt text not null,                -- base64-encoded salt for KEK derivation
  vault_key_wrapped text not null,   -- base64-encoded wrapped vault key (AES-GCM)
  vk_iv text not null,               -- base64-encoded IV used for wrapping VK
  version integer not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- VAULT ITEMS TABLE
-- Stores encrypted password entries
-- Only 'title' is plaintext for UX; all sensitive data is encrypted
-- ============================================
create table if not exists public.vault_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,               -- Plaintext for search/display (or encrypt for full ZK)
  enc_payload text not null,         -- base64 AES-GCM encrypted JSON payload
  iv text not null,                  -- base64-encoded IV for this item
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz             -- Soft delete support
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_vault_items_user on public.vault_items(user_id);
create index if not exists idx_vault_items_title on public.vault_items(title);
create index if not exists idx_vault_items_deleted on public.vault_items(deleted_at) where deleted_at is null;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS to ensure users can only access their own data
-- ============================================
alter table public.user_keys enable row level security;
alter table public.vault_items enable row level security;

-- User Keys Policies
drop policy if exists "uk_select" on public.user_keys;
drop policy if exists "uk_insert" on public.user_keys;
drop policy if exists "uk_update" on public.user_keys;

create policy "uk_select" on public.user_keys
  for select using (auth.uid() = user_id);

create policy "uk_insert" on public.user_keys
  for insert with check (auth.uid() = user_id);

create policy "uk_update" on public.user_keys
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Vault Items Policies
drop policy if exists "vi_select" on public.vault_items;
drop policy if exists "vi_insert" on public.vault_items;
drop policy if exists "vi_update" on public.vault_items;
drop policy if exists "vi_delete" on public.vault_items;

create policy "vi_select" on public.vault_items
  for select using (auth.uid() = user_id);

create policy "vi_insert" on public.vault_items
  for insert with check (auth.uid() = user_id);

create policy "vi_update" on public.vault_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "vi_delete" on public.vault_items
  for delete using (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- Auto-update the 'updated_at' timestamp
-- ============================================
create or replace function public.set_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; 
$$ language plpgsql;

drop trigger if exists set_updated_at_vault_items on public.vault_items;
create trigger set_updated_at_vault_items
  before update on public.vault_items
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_user_keys on public.user_keys;
create trigger set_updated_at_user_keys
  before update on public.user_keys
  for each row execute procedure public.set_updated_at();

-- ============================================
-- SECURITY NOTES
-- ============================================
-- 1. All sensitive data (passwords, usernames, notes) are encrypted client-side
-- 2. The vault key (VK) is wrapped with a key derived from the master password (KEK)
-- 3. The master password NEVER leaves the browser and is NEVER stored
-- 4. Only encrypted ciphertext is transmitted to/stored on Supabase
-- 5. RLS policies ensure users can only access their own data
-- 6. For full zero-knowledge, encrypt 'title' field as well
