/**
 * Rate Limiting for Master Password Unlock Attempts
 * Prevents brute force attacks by limiting failed attempts
 */

const ATTEMPT_KEY = 'zk_unlock_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptData {
    count: number;
    lockedUntil: number;
    lastAttempt: number;
}

/**
 * Get current attempt data from storage
 */
function getAttemptData(): AttemptData {
    if (typeof window === 'undefined') {
        return { count: 0, lockedUntil: 0, lastAttempt: 0 };
    }

    try {
        const stored = localStorage.getItem(ATTEMPT_KEY);
        if (!stored) {
            return { count: 0, lockedUntil: 0, lastAttempt: 0 };
        }
        return JSON.parse(stored) as AttemptData;
    } catch {
        return { count: 0, lockedUntil: 0, lastAttempt: 0 };
    }
}

/**
 * Save attempt data to storage
 */
function saveAttemptData(data: AttemptData): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(ATTEMPT_KEY, JSON.stringify(data));
    } catch {
        // Ignore storage errors
    }
}

/**
 * Check if the user is currently locked out
 */
export function isLockedOut(): { locked: boolean; remainingMs: number; remainingAttempts: number } {
    const data = getAttemptData();
    const now = Date.now();

    // Check if lockout has expired
    if (data.lockedUntil > 0 && now >= data.lockedUntil) {
        // Clear lockout
        saveAttemptData({ count: 0, lockedUntil: 0, lastAttempt: 0 });
        return { locked: false, remainingMs: 0, remainingAttempts: MAX_ATTEMPTS };
    }

    // Check if currently locked out
    if (data.lockedUntil > now) {
        return {
            locked: true,
            remainingMs: data.lockedUntil - now,
            remainingAttempts: 0
        };
    }

    return {
        locked: false,
        remainingMs: 0,
        remainingAttempts: MAX_ATTEMPTS - data.count
    };
}

/**
 * Record a failed unlock attempt
 * Returns the lockout status after recording
 */
export function recordFailedAttempt(): {
    locked: boolean;
    remainingMs: number;
    remainingAttempts: number;
    justLocked: boolean;
} {
    const data = getAttemptData();
    const now = Date.now();

    // If currently locked out, just return status
    if (data.lockedUntil > now) {
        return {
            locked: true,
            remainingMs: data.lockedUntil - now,
            remainingAttempts: 0,
            justLocked: false
        };
    }

    // Increment attempt count
    data.count++;
    data.lastAttempt = now;

    // Check if we've hit the limit
    if (data.count >= MAX_ATTEMPTS) {
        data.lockedUntil = now + LOCKOUT_DURATION_MS;
        data.count = 0; // Reset count after lockout
        saveAttemptData(data);

        return {
            locked: true,
            remainingMs: LOCKOUT_DURATION_MS,
            remainingAttempts: 0,
            justLocked: true
        };
    }

    saveAttemptData(data);

    return {
        locked: false,
        remainingMs: 0,
        remainingAttempts: MAX_ATTEMPTS - data.count,
        justLocked: false
    };
}

/**
 * Clear all attempts after successful unlock
 */
export function clearAttempts(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(ATTEMPT_KEY);
    } catch {
        // Ignore storage errors
    }
}

/**
 * Format remaining lockout time for display
 */
export function formatRemainingTime(ms: number): string {
    if (ms <= 0) return '';

    const minutes = Math.ceil(ms / 60000);
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
}

/**
 * Get a user-friendly message about the lockout status
 */
export function getLockoutMessage(remainingMs: number): string {
    const timeStr = formatRemainingTime(remainingMs);
    return `Too many failed attempts. Please wait ${timeStr} before trying again.`;
}
