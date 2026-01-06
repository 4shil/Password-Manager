'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
}

interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
}

/**
 * Hook to handle keyboard shortcuts
 * Supports Ctrl/Cmd key modifiers for cross-platform compatibility
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Don't trigger shortcuts when typing in an input
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                // Allow Escape key even in inputs
                if (event.key !== 'Escape') return;
            }

            for (const shortcut of shortcuts) {
                const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();

                // Check for Ctrl or Cmd (Meta) key - treat them as interchangeable
                const modifierMatches =
                    (shortcut.ctrlKey || shortcut.metaKey)
                        ? (event.ctrlKey || event.metaKey)
                        : (!event.ctrlKey && !event.metaKey);

                const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
                const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

                if (keyMatches && modifierMatches && shiftMatches && altMatches) {
                    event.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        },
        [shortcuts, enabled]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * Predefined shortcut keys for the app
 */
export const SHORTCUT_KEYS = {
    NEW_ITEM: { key: 'n', ctrlKey: true, description: 'Add new password' },
    LOCK_VAULT: { key: 'l', ctrlKey: true, description: 'Lock vault' },
    SEARCH: { key: 'k', ctrlKey: true, description: 'Focus search' },
    ESCAPE: { key: 'Escape', description: 'Close dialog / Clear search' },
} as const;

/**
 * Get a formatted shortcut key string for display
 */
export function formatShortcut(shortcut: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }): string {
    const parts: string[] = [];

    // Use ⌘ on Mac, Ctrl on others
    const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');

    if (shortcut.ctrlKey) {
        parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.shiftKey) {
        parts.push(isMac ? '⇧' : 'Shift');
    }
    if (shortcut.altKey) {
        parts.push(isMac ? '⌥' : 'Alt');
    }

    // Format the key name nicely
    let keyName = shortcut.key;
    if (keyName === ' ') keyName = 'Space';
    if (keyName === 'Escape') keyName = 'Esc';
    keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1);

    parts.push(keyName);

    return parts.join(isMac ? '' : '+');
}
