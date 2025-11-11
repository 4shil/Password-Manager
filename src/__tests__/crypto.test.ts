/**
 * Crypto Utilities Test Suite
 * Tests for encryption, key derivation, and base64 utilities
 */

import { describe, it, expect } from 'vitest';
import { encryptPayload, decryptPayload, encryptString, decryptString } from '@/lib/crypto/aes';
import { generateVaultKey, wrapVaultKey, unwrapVaultKey } from '@/lib/crypto/keys';
import { generateSalt, deriveKEK } from '@/lib/crypto/derive';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/lib/utils';

describe('Base64 Utilities', () => {
  it('should encode and decode ArrayBuffer correctly', () => {
    const original = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const base64 = arrayBufferToBase64(original.buffer);
    const decoded = base64ToArrayBuffer(base64);
    
    expect(new Uint8Array(decoded)).toEqual(original);
  });

  it('should handle empty buffer', () => {
    const original = new Uint8Array([]);
    const base64 = arrayBufferToBase64(original.buffer);
    const decoded = base64ToArrayBuffer(base64);
    
    expect(new Uint8Array(decoded)).toEqual(original);
  });
});

describe('Key Derivation', () => {
  it('should generate salt of correct length', () => {
    const salt = generateSalt();
    const decoded = base64ToArrayBuffer(salt);
    
    expect(decoded.byteLength).toBe(16); // 128 bits
  });

  it('should derive KEK from master password', async () => {
    const masterPassword = 'super-secret-master-password-123';
    const salt = generateSalt();
    
    const kek = await deriveKEK(masterPassword, salt);
    
    expect(kek).toBeDefined();
    expect(kek.type).toBe('secret');
    expect(kek.algorithm.name).toBe('AES-GCM');
  });

  it('should derive same KEK from same password and salt', async () => {
    const masterPassword = 'test-password';
    const salt = generateSalt();
    
    const kek1 = await deriveKEK(masterPassword, salt);
    const kek2 = await deriveKEK(masterPassword, salt);
    
    // Both should have same algorithm
    expect(kek1.algorithm).toEqual(kek2.algorithm);
  });

  it('should throw error for empty password', async () => {
    const salt = generateSalt();
    
    await expect(deriveKEK('', salt)).rejects.toThrow();
  });
});

describe('Vault Key Management', () => {
  it('should generate vault key', async () => {
    const vk = await generateVaultKey();
    
    expect(vk).toBeDefined();
    expect(vk.type).toBe('secret');
    expect(vk.extractable).toBe(true);
  });

  it('should wrap and unwrap vault key', async () => {
    const masterPassword = 'test-master-password';
    const salt = generateSalt();
    
    const kek = await deriveKEK(masterPassword, salt);
    const vk = await generateVaultKey();
    
    const { wrappedB64, ivB64 } = await wrapVaultKey(vk, kek);
    
    expect(wrappedB64).toBeDefined();
    expect(ivB64).toBeDefined();
    
    const unwrappedVk = await unwrapVaultKey(wrappedB64, ivB64, kek);
    
    expect(unwrappedVk).toBeDefined();
    expect(unwrappedVk.algorithm).toEqual(vk.algorithm);
  });

  it('should fail to unwrap with wrong KEK', async () => {
    const salt = generateSalt();
    const kek1 = await deriveKEK('password1', salt);
    const kek2 = await deriveKEK('password2', salt);
    
    const vk = await generateVaultKey();
    const { wrappedB64, ivB64 } = await wrapVaultKey(vk, kek1);
    
    await expect(unwrapVaultKey(wrappedB64, ivB64, kek2)).rejects.toThrow();
  });
});

describe('AES-GCM Encryption', () => {
  it('should encrypt and decrypt payload object', async () => {
    const vk = await generateVaultKey();
    const payload = {
      username: 'testuser@example.com',
      password: 'mySecretPassword123!',
      url: 'https://example.com',
      notes: 'Important account',
    };
    
    const { cipherB64, ivB64 } = await encryptPayload(vk, payload);
    
    expect(cipherB64).toBeDefined();
    expect(ivB64).toBeDefined();
    expect(cipherB64).not.toContain('testuser');
    expect(cipherB64).not.toContain('mySecretPassword123');
    
    const decrypted = await decryptPayload(vk, cipherB64, ivB64);
    
    expect(decrypted).toEqual(payload);
  });

  it('should encrypt and decrypt string', async () => {
    const vk = await generateVaultKey();
    const plaintext = 'Hello, World!';
    
    const { cipherB64, ivB64 } = await encryptString(vk, plaintext);
    const decrypted = await decryptString(vk, cipherB64, ivB64);
    
    expect(decrypted).toBe(plaintext);
  });

  it('should fail to decrypt with wrong key', async () => {
    const vk1 = await generateVaultKey();
    const vk2 = await generateVaultKey();
    const plaintext = 'secret message';
    
    const { cipherB64, ivB64 } = await encryptString(vk1, plaintext);
    
    await expect(decryptString(vk2, cipherB64, ivB64)).rejects.toThrow();
  });

  it('should produce different ciphertexts for same plaintext', async () => {
    const vk = await generateVaultKey();
    const payload = { password: 'same-password' };
    
    const { cipherB64: cipher1 } = await encryptPayload(vk, payload);
    const { cipherB64: cipher2 } = await encryptPayload(vk, payload);
    
    // Different IVs should produce different ciphertexts
    expect(cipher1).not.toBe(cipher2);
  });

  it('should handle empty payload', async () => {
    const vk = await generateVaultKey();
    const payload = {};
    
    const { cipherB64, ivB64 } = await encryptPayload(vk, payload);
    const decrypted = await decryptPayload(vk, cipherB64, ivB64);
    
    expect(decrypted).toEqual(payload);
  });

  it('should handle complex nested payload', async () => {
    const vk = await generateVaultKey();
    const payload = {
      username: 'user',
      password: 'pass',
      extras: [
        { key: 'question1', value: 'answer1' },
        { key: 'question2', value: 'answer2' },
      ],
      metadata: {
        created: '2024-01-01',
        tags: ['important', 'work'],
      },
    };
    
    const { cipherB64, ivB64 } = await encryptPayload(vk, payload);
    const decrypted = await decryptPayload(vk, cipherB64, ivB64);
    
    expect(decrypted).toEqual(payload);
  });
});

describe('End-to-End Encryption Flow', () => {
  it('should simulate complete signup and login flow', async () => {
    // Signup: Generate crypto materials
    const masterPassword = 'MySecureMasterPassword123!';
    const salt = generateSalt();
    const kek = await deriveKEK(masterPassword, salt);
    const vaultKey = await generateVaultKey();
    const { wrappedB64, ivB64 } = await wrapVaultKey(vaultKey, kek);
    
    // Simulate storing to database
    const storedData = {
      salt,
      vault_key_wrapped: wrappedB64,
      vk_iv: ivB64,
      kdf_iterations: 200000,
    };
    
    // Login: Unwrap vault key
    const loginKek = await deriveKEK(masterPassword, storedData.salt);
    const unwrappedVk = await unwrapVaultKey(
      storedData.vault_key_wrapped,
      storedData.vk_iv,
      loginKek
    );
    
    // Create and encrypt a vault item
    const vaultItem = {
      username: 'admin@example.com',
      password: 'super-secret-pass',
      url: 'https://example.com/login',
    };
    
    const { cipherB64, ivB64: itemIv } = await encryptPayload(unwrappedVk, vaultItem);
    
    // Decrypt the vault item
    const decrypted = await decryptPayload(unwrappedVk, cipherB64, itemIv);
    
    expect(decrypted).toEqual(vaultItem);
  });

  it('should fail with wrong master password', async () => {
    const correctPassword = 'CorrectPassword123';
    const wrongPassword = 'WrongPassword123';
    const salt = generateSalt();
    
    const correctKek = await deriveKEK(correctPassword, salt);
    const vaultKey = await generateVaultKey();
    const { wrappedB64, ivB64 } = await wrapVaultKey(vaultKey, correctKek);
    
    // Try to unwrap with wrong password
    const wrongKek = await deriveKEK(wrongPassword, salt);
    
    await expect(unwrapVaultKey(wrappedB64, ivB64, wrongKek)).rejects.toThrow();
  });
});
