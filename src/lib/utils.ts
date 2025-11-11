/**
 * Base64 encoding/decoding utilities
 */

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Safe JSON stringify/parse with error handling
 */

export function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    throw new Error('Failed to stringify object');
  }
}

export function safeParse<T = unknown>(str: string): T {
  try {
    return JSON.parse(str) as T;
  } catch (err) {
    throw new Error('Failed to parse JSON');
  }
}

/**
 * Generate random bytes
 */

export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Timing-safe comparison
 */

export function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
