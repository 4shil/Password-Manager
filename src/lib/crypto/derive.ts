/**
 * Key Derivation Functions
 * Derives encryption keys from passwords using PBKDF2
 */

import { arrayBufferToBase64, base64ToArrayBuffer, generateRandomBytes } from '../utils';

const PBKDF2_ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-256';
const DEFAULT_ITERATIONS = 200000; // High iteration count for security
const SALT_LENGTH = 16; // 128 bits
const KEY_LENGTH = 256; // 256 bits for AES-256

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  const salt = generateRandomBytes(SALT_LENGTH);
  return arrayBufferToBase64(salt);
}

/**
 * Derive a Key Encryption Key (KEK) from a master password
 * This key is used to wrap/unwrap the vault key
 * 
 * @param masterPassword - The user's master password (never stored/sent)
 * @param saltB64 - Base64-encoded salt
 * @param iterations - PBKDF2 iteration count (default: 200000)
 * @returns CryptoKey suitable for AES-GCM encryption
 */
export async function deriveKEK(
  masterPassword: string,
  saltB64: string,
  iterations: number = DEFAULT_ITERATIONS
): Promise<CryptoKey> {
  if (!masterPassword || masterPassword.length === 0) {
    throw new Error('Master password cannot be empty');
  }

  if (iterations < 100000) {
    throw new Error('Iteration count too low (minimum 100,000)');
  }

  // Convert password to bytes
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(masterPassword);

  // Import password as a key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    PBKDF2_ALGORITHM,
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive KEK using PBKDF2
  const salt = base64ToArrayBuffer(saltB64);
  
  const kek = await crypto.subtle.deriveKey(
    {
      name: PBKDF2_ALGORITHM,
      salt: salt,
      iterations: iterations,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH,
    },
    false, // Not extractable (cannot be exported)
    ['wrapKey', 'unwrapKey']
  );

  return kek;
}

/**
 * Export a CryptoKey to raw format (for testing/verification)
 * Note: Only works with extractable keys
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import a raw key from base64
 * Used primarily for testing
 */
export async function importKey(
  keyB64: string,
  algorithm: string = 'AES-GCM',
  usages: KeyUsage[] = ['encrypt', 'decrypt']
): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyB64);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: algorithm, length: KEY_LENGTH },
    true,
    usages
  );
}
