/**
 * Vault Key Management
 * Generate, wrap, and unwrap vault keys
 */

import { generateRandomBytes, arrayBufferToBase64, base64ToArrayBuffer } from '../utils';

const AES_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // 256 bits for AES-256
const IV_LENGTH = 12; // 96 bits

export interface WrappedKey {
  wrappedB64: string;
  ivB64: string;
}

/**
 * Generate a new random Vault Key (VK)
 * This is the master key used to encrypt all vault items
 * 
 * @returns CryptoKey for AES-GCM encryption/decryption
 */
export async function generateVaultKey(): Promise<CryptoKey> {
  const vaultKey = await crypto.subtle.generateKey(
    {
      name: AES_ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // Extractable (needed for wrapping)
    ['encrypt', 'decrypt']
  );

  return vaultKey;
}

/**
 * Wrap (encrypt) the vault key with a KEK
 * The wrapped key can be safely stored on the server
 * 
 * @param vaultKey - The vault key to wrap
 * @param kek - Key Encryption Key (derived from master password)
 * @returns Wrapped key and IV in base64
 */
export async function wrapVaultKey(
  vaultKey: CryptoKey,
  kek: CryptoKey
): Promise<WrappedKey> {
  if (!vaultKey || !kek) {
    throw new Error('Both vault key and KEK are required');
  }

  // Generate random IV for wrapping
  const iv = generateRandomBytes(IV_LENGTH);

  // Wrap the vault key
  const wrappedKey = await crypto.subtle.wrapKey(
    'raw',
    vaultKey,
    kek,
    {
      name: AES_ALGORITHM,
      iv: iv as unknown as BufferSource,
    }
  );

  return {
    wrappedB64: arrayBufferToBase64(wrappedKey),
    ivB64: arrayBufferToBase64(iv),
  };
}

/**
 * Unwrap (decrypt) the vault key with a KEK
 * This happens client-side when the user enters their master password
 * 
 * @param wrappedB64 - Base64-encoded wrapped key
 * @param ivB64 - Base64-encoded IV
 * @param kek - Key Encryption Key (derived from master password)
 * @returns Unwrapped vault key
 */
export async function unwrapVaultKey(
  wrappedB64: string,
  ivB64: string,
  kek: CryptoKey
): Promise<CryptoKey> {
  if (!wrappedB64 || !ivB64 || !kek) {
    throw new Error('Wrapped key, IV, and KEK are required');
  }

  try {
    const wrappedKey = base64ToArrayBuffer(wrappedB64);
    const iv = base64ToArrayBuffer(ivB64);

    // Unwrap the vault key
    const vaultKey = await crypto.subtle.unwrapKey(
      'raw',
      wrappedKey,
      kek,
      {
        name: AES_ALGORITHM,
        iv: iv,
      },
      {
        name: AES_ALGORITHM,
        length: KEY_LENGTH,
      },
      true, // Extractable
      ['encrypt', 'decrypt']
    );

    return vaultKey;
  } catch (err) {
    throw new Error('Failed to unwrap vault key - incorrect master password');
  }
}

/**
 * Export vault key to raw bytes (for backup purposes)
 * WARNING: Only use for encrypted backups!
 */
export async function exportVaultKey(vaultKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', vaultKey);
  return arrayBufferToBase64(exported);
}

/**
 * Import a vault key from raw bytes
 * Used for restoring from encrypted backups
 */
export async function importVaultKey(keyB64: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyB64);
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: AES_ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}
