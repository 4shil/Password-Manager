/**
 * Key Derivation Functions
 * Derives encryption keys from passwords using Argon2id
 * 
 * Uses hash-wasm for WebAssembly-based Argon2id implementation
 * that works seamlessly with Next.js
 */

import { argon2id } from 'hash-wasm';
import { arrayBufferToBase64, base64ToArrayBuffer, generateRandomBytes } from '../utils';

// Argon2id parameters (OWASP recommended for password hashing)
// These provide strong security while keeping derivation time reasonable (~1 second)
const ARGON2_TIME_COST = 3;        // Number of iterations
const ARGON2_MEMORY_COST = 65536;  // 64 MB of memory
const ARGON2_PARALLELISM = 4;      // Parallel threads
const SALT_LENGTH = 16;            // 128 bits
const KEY_LENGTH = 32;             // 256 bits for AES-256

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  const salt = generateRandomBytes(SALT_LENGTH);
  return arrayBufferToBase64(salt);
}

/**
 * Derive a Key Encryption Key (KEK) from a password using Argon2id
 * This key is used to wrap/unwrap the vault key
 * 
 * @param password - The user's password (never stored/sent)
 * @param saltB64 - Base64-encoded salt
 * @returns CryptoKey suitable for AES-GCM encryption
 */
export async function deriveKEK(
  password: string,
  saltB64: string,
  // Legacy parameter for backwards compatibility with PBKDF2
  _iterations?: number
): Promise<CryptoKey> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  // Convert salt from base64
  const saltBuffer = base64ToArrayBuffer(saltB64);
  const salt = new Uint8Array(saltBuffer);

  try {
    // Derive key using Argon2id via hash-wasm
    const hash = await argon2id({
      password: password,
      salt: salt,
      iterations: ARGON2_TIME_COST,
      memorySize: ARGON2_MEMORY_COST,
      parallelism: ARGON2_PARALLELISM,
      hashLength: KEY_LENGTH,
      outputType: 'binary',
    });

    // Import the derived hash as a CryptoKey for AES-GCM
    const kek = await crypto.subtle.importKey(
      'raw',
      hash as unknown as BufferSource,
      { name: 'AES-GCM', length: KEY_LENGTH * 8 },
      false, // Not extractable
      ['wrapKey', 'unwrapKey']
    );

    return kek;
  } catch (error) {
    console.error('Argon2 derivation failed:', error);
    throw new Error('Failed to derive encryption key');
  }
}

/**
 * Derive a key for encrypting/decrypting vault items
 * 
 * @param password - The user's password
 * @param saltB64 - Base64-encoded salt
 * @returns CryptoKey suitable for AES-GCM encryption/decryption
 */
export async function deriveEncryptionKey(
  password: string,
  saltB64: string
): Promise<CryptoKey> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  const saltBuffer = base64ToArrayBuffer(saltB64);
  const salt = new Uint8Array(saltBuffer);

  const hash = await argon2id({
    password: password,
    salt: salt,
    iterations: ARGON2_TIME_COST,
    memorySize: ARGON2_MEMORY_COST,
    parallelism: ARGON2_PARALLELISM,
    hashLength: KEY_LENGTH,
    outputType: 'binary',
  });

  return await crypto.subtle.importKey(
    'raw',
    hash as unknown as BufferSource,
    { name: 'AES-GCM', length: KEY_LENGTH * 8 },
    true, // Extractable for encryption/decryption
    ['encrypt', 'decrypt']
  );
}

/**
 * Get Argon2 parameters for storage
 * These are stored alongside the salt to allow verification
 */
export function getArgon2Params() {
  return {
    algorithm: 'argon2id',
    timeCost: ARGON2_TIME_COST,
    memoryCost: ARGON2_MEMORY_COST,
    parallelism: ARGON2_PARALLELISM,
  };
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
    { name: algorithm, length: KEY_LENGTH * 8 },
    true,
    usages
  );
}
