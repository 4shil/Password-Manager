/**
 * Supabase Database Types
 * Auto-generated types for database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_keys: {
        Row: {
          user_id: string;
          kdf: string;
          kdf_iterations: number;
          salt: string;
          vault_key_wrapped: string;
          vk_iv: string;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          kdf?: string;
          kdf_iterations?: number;
          salt: string;
          vault_key_wrapped: string;
          vk_iv: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          kdf?: string;
          kdf_iterations?: number;
          salt?: string;
          vault_key_wrapped?: string;
          vk_iv?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      vault_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          enc_payload: string;
          iv: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          enc_payload: string;
          iv: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          enc_payload?: string;
          iv?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
