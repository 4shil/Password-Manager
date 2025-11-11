/**
 * AES-GCM Encryption/Decryption
 * Symmetric encryption for vault item payloads
 */

import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateRandomBytes,
  safeStringify,
  safeParse,
} from '../utils';

const AES_ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96 bits (recommended for AES-GCM)
const TAG_LENGTH = 128; // 128 bits authentication tag

export interface EncryptedData {
  cipherB64: string;
  ivB64: string;
}

/**
 * Encrypt a payload object with AES-GCM
 * 
 * @param vaultKey - The vault key (CryptoKey)
 * @param data - Plain object to encrypt
 * @returns Object containing base64-encoded ciphertext and IV
 */
export async function encryptPayload(
  vaultKey: CryptoKey,
  data: unknown
): Promise<EncryptedData> {
  if (!vaultKey) {
    throw new Error('Vault key is required');
  }

  // Convert data to JSON string then to bytes
  const jsonString = safeStringify(data);
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(jsonString);

  // Generate random IV (must be unique for each encryption)
  const iv = generateRandomBytes(IV_LENGTH);

  // Encrypt with AES-GCM
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: AES_ALGORITHM,
      iv: iv,
      tagLength: TAG_LENGTH,
    },
    vaultKey,
    plaintext
  );

  return {
    cipherB64: arrayBufferToBase64(ciphertext),
    ivB64: arrayBufferToBase64(iv),
  };
}

/**
 * Decrypt an AES-GCM encrypted payload
 * 
 * @param vaultKey - The vault key (CryptoKey)
 * @param cipherB64 - Base64-encoded ciphertext
 * @param ivB64 - Base64-encoded IV
 * @returns Decrypted object
 */
export async function decryptPayload<T = unknown>(
  vaultKey: CryptoKey,
  cipherB64: string,
  ivB64: string
): Promise<T> {
  if (!vaultKey) {
    throw new Error('Vault key is required');
  }

  if (!cipherB64 || !ivB64) {
    throw new Error('Ciphertext and IV are required');
  }

  try {
    // Convert from base64
    const ciphertext = base64ToArrayBuffer(cipherB64);
    const iv = base64ToArrayBuffer(ivB64);

    // Decrypt with AES-GCM
    const plaintext = await crypto.subtle.decrypt(
      {
        name: AES_ALGORITHM,
        iv: iv,
        tagLength: TAG_LENGTH,
      },
      vaultKey,
      ciphertext
    );

    // Convert bytes to string and parse JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(plaintext);
    return safeParse<T>(jsonString);
  } catch (err) {
    // Authentication failed or decryption error
    throw new Error('Failed to decrypt payload - invalid key or corrupted data');
  }
}

/**
 * Encrypt a string value (for simpler use cases)
 */
export async function encryptString(
  key: CryptoKey,
  plaintext: string
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = generateRandomBytes(IV_LENGTH);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: AES_ALGORITHM,
      iv: iv,
      tagLength: TAG_LENGTH,
    },
    key,
    data
  );

  return {
    cipherB64: arrayBufferToBase64(ciphertext),
    ivB64: arrayBufferToBase64(iv),
  };
}

/**
 * Decrypt a string value
 */
export async function decryptString(
  key: CryptoKey,
  cipherB64: string,
  ivB64: string
): Promise<string> {
  const ciphertext = base64ToArrayBuffer(cipherB64);
  const iv = base64ToArrayBuffer(ivB64);

  const plaintext = await crypto.subtle.decrypt(
    {
      name: AES_ALGORITHM,
      iv: iv,
      tagLength: TAG_LENGTH,
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}
