/**
 * Zod Validation Schemas
 * Simplified auth - single password for both auth and encryption
 */

import { z } from 'zod';

// Auth Schemas - Simplified (single password)
export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password is too long')
    .regex(/[a-z]/, 'Include at least one lowercase letter')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/\d/, 'Include at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// Unlock schema (same as login password)
export const unlockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

// Vault Item Schemas
export const vaultItemExtraSchema = z.object({
  key: z.string().min(1, 'Key is required').max(100),
  value: z.string().max(1000),
});

export const vaultItemPayloadSchema = z.object({
  username: z.string().max(255).optional(),
  password: z.string().min(1, 'Password is required').max(1000),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(10000).optional(),
  extras: z.array(vaultItemExtraSchema).optional(),
});

export const createVaultItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  username: z.string().max(255).optional(),
  password: z.string().min(1, 'Password is required').max(1000),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(10000).optional(),
  extras: z.array(vaultItemExtraSchema).optional().default([]),
});

export const updateVaultItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255),
  username: z.string().max(255).optional(),
  password: z.string().min(1, 'Password is required').max(1000),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(10000).optional(),
  extras: z.array(vaultItemExtraSchema).optional().default([]),
});

// Password Generator Schema
export const passwordGeneratorSchema = z.object({
  length: z.number().min(8).max(128).default(16),
  lowercase: z.boolean().default(true),
  uppercase: z.boolean().default(true),
  digits: z.boolean().default(true),
  symbols: z.boolean().default(true),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UnlockInput = z.infer<typeof unlockSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VaultItemPayload = z.infer<typeof vaultItemPayloadSchema>;
export type VaultItemExtra = z.infer<typeof vaultItemExtraSchema>;
export type CreateVaultItemInput = z.infer<typeof createVaultItemSchema>;
export type UpdateVaultItemInput = z.infer<typeof updateVaultItemSchema>;
export type PasswordGeneratorOptions = z.infer<typeof passwordGeneratorSchema>;

// Database types
export interface UserKeys {
  user_id: string;
  kdf: string;
  kdf_iterations?: number; // Optional for Argon2
  salt: string;
  vault_key_wrapped: string;
  vk_iv: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface VaultItem {
  id: string;
  user_id: string;
  title: string;
  enc_payload: string;
  iv: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DecryptedVaultItem extends VaultItemPayload {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}
