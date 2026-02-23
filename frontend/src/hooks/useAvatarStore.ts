import { useState, useEffect, useCallback } from 'react';

const KEY_PREFIX = 'avatar_';

/**
 * Returns the stored avatarId for a userId (from localStorage),
 * and re-renders whenever ANY tab updates localStorage — keeping all
 * tabs/windows perfectly in sync.
 */
export function useAvatarStore(userId: number | undefined): [string | null, (avatarId: string | null) => void] {
    const key = userId != null ? `${KEY_PREFIX}${userId}` : null;

    const [avatarId, setAvatarIdState] = useState<string | null>(() => {
        if (!key) return null;
        return localStorage.getItem(key);
    });

    // Listen for storage changes from OTHER tabs
    useEffect(() => {
        if (!key) return;

        const handler = (e: StorageEvent) => {
            if (e.key === key) {
                setAvatarIdState(e.newValue);
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [key]);

    const setAvatarId = useCallback((id: string | null) => {
        if (!key) return;
        if (id) {
            localStorage.setItem(key, id);
        } else {
            localStorage.removeItem(key);
        }
        setAvatarIdState(id);
    }, [key]);

    return [avatarId, setAvatarId];
}

/** Read-only snapshot of ALL stored avatars keyed by userId — re-renders on any storage event */
export function useAllAvatars(): Record<number, string> {
    const [avatars, setAvatars] = useState<Record<number, string>>(() => readAll());

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key?.startsWith(KEY_PREFIX)) {
                setAvatars(readAll());
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    return avatars;
}

function readAll(): Record<number, string> {
    const result: Record<number, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(KEY_PREFIX)) {
            const uid = parseInt(k.slice(KEY_PREFIX.length), 10);
            if (!isNaN(uid)) {
                const val = localStorage.getItem(k);
                if (val) result[uid] = val;
            }
        }
    }
    return result;
}

/** Write an avatar to localStorage and notify same-tab listeners */
export function saveAvatar(userId: number, avatarId: string | null) {
    const key = `${KEY_PREFIX}${userId}`;
    if (avatarId) {
        localStorage.setItem(key, avatarId);
    } else {
        localStorage.removeItem(key);
    }
    // Manually dispatch for same-tab listeners (storage event only fires for OTHER tabs)
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: avatarId }));
}
