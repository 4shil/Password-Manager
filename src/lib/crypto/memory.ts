/**
 * In-Memory Vault Key Cache
 * Manages the vault key in memory with idle timeout protection
 */

const IDLE_TIMEOUT_MS =
  typeof window !== 'undefined'
    ? parseInt(
        (window as typeof window & { ENV?: { NEXT_PUBLIC_IDLE_TIMEOUT_MS?: string } })
          .ENV?.NEXT_PUBLIC_IDLE_TIMEOUT_MS || '900000',
        10
      )
    : 900000; // 15 minutes default

interface VaultKeyCache {
  key: CryptoKey | null;
  lastActivity: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

// Singleton cache instance
const cache: VaultKeyCache = {
  key: null,
  lastActivity: 0,
  timeoutId: null,
};

// Callbacks for lock event
type LockCallback = () => void;
const lockCallbacks: Set<LockCallback> = new Set();

/**
 * Store the vault key in memory
 * Automatically clears after idle timeout
 */
export function cacheVaultKey(key: CryptoKey): void {
  cache.key = key;
  cache.lastActivity = Date.now();
  
  // Clear existing timeout
  if (cache.timeoutId) {
    clearTimeout(cache.timeoutId);
  }

  // Set new timeout
  cache.timeoutId = setTimeout(() => {
    clearVaultKey();
    notifyLockCallbacks();
  }, IDLE_TIMEOUT_MS);
}

/**
 * Alias for cacheVaultKey (common usage pattern)
 */
export function setVaultKey(key: CryptoKey): void {
  cacheVaultKey(key);
}

/**
 * Retrieve the cached vault key
 * Updates last activity time to prevent idle timeout
 */
export function getVaultKey(): CryptoKey | null {
  if (cache.key) {
    cache.lastActivity = Date.now();
    
    // Reset timeout on activity
    if (cache.timeoutId) {
      clearTimeout(cache.timeoutId);
    }
    
    cache.timeoutId = setTimeout(() => {
      clearVaultKey();
      notifyLockCallbacks();
    }, IDLE_TIMEOUT_MS);
  }
  
  return cache.key;
}

/**
 * Check if vault key is currently cached
 */
export function isVaultUnlocked(): boolean {
  return cache.key !== null;
}

/**
 * Clear the vault key from memory (lock the vault)
 * Should be called on logout, idle timeout, or manual lock
 */
export function clearVaultKey(): void {
  // Clear the key reference
  cache.key = null;
  cache.lastActivity = 0;
  
  // Clear timeout
  if (cache.timeoutId) {
    clearTimeout(cache.timeoutId);
    cache.timeoutId = null;
  }
}

/**
 * Get time remaining until auto-lock (in milliseconds)
 */
export function getTimeUntilLock(): number {
  if (!cache.key) {
    return 0;
  }
  
  const elapsed = Date.now() - cache.lastActivity;
  const remaining = IDLE_TIMEOUT_MS - elapsed;
  
  return Math.max(0, remaining);
}

/**
 * Get formatted time remaining until auto-lock
 */
export function getFormattedTimeUntilLock(): string {
  const ms = getTimeUntilLock();
  
  if (ms === 0) {
    return 'Locked';
  }
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Register a callback to be notified when vault is locked
 */
export function onLock(callback: LockCallback): () => void {
  lockCallbacks.add(callback);
  
  // Return unsubscribe function
  return () => {
    lockCallbacks.delete(callback);
  };
}

/**
 * Notify all lock callbacks
 */
function notifyLockCallbacks(): void {
  lockCallbacks.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error('Error in lock callback:', err);
    }
  });
}

/**
 * Manually trigger a lock (useful for "Lock Now" button)
 */
export function lockVault(): void {
  clearVaultKey();
  notifyLockCallbacks();
}

/**
 * Update activity timestamp (call on user interaction)
 */
export function updateActivity(): void {
  if (cache.key) {
    cache.lastActivity = Date.now();
  }
}
