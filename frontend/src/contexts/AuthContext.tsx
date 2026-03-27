import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// ==================== TYPES ====================

export interface User {
    id: string;
    userId?: number; // Added for compatibility with backend DTOs
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    role: 'ADMIN' | 'TRAINER' | 'MEMBER' | 'OWNER';
    token?: string;
    avatar?: string;
    context?: string;
    activeGymId?: number;
    activeGymName?: string;
    height?: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    getStorageKey: (key: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== PORT-SCOPED STORAGE ====================

/**
 * Generate a storage key scoped to the current port.
 * This ensures session isolation when running multiple frontend instances:
 * - Port 5173 → token_port_5173, user_port_5173
 * - Port 5174 → token_port_5174, user_port_5174
 * - Port 5175 → token_port_5175, user_port_5175
 */
const getStorageKey = (key: string): string => {
    const port = typeof window !== 'undefined' ? window.location.port || '5173' : '5173';
    return `${key}_port_${port}`;
};

/**
 * Check if a JWT token is expired by decoding the payload.
 * Returns true if expired or invalid.
 */
const isTokenExpired = (token: string): boolean => {
    if (!token) return true;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const payload = JSON.parse(atob(parts[1]));
        const expMs = payload.exp * 1000;
        return Date.now() >= expMs;
    } catch {
        return true;
    }
};

// ==================== PROVIDER ====================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Clear all auth data for this port
    const clearAuth = useCallback(() => {
        localStorage.removeItem(getStorageKey('token'));
        localStorage.removeItem(getStorageKey('user'));
        setUser(null);
    }, []);

    // Initialize auth state from storage
    useEffect(() => {
        const token = localStorage.getItem(getStorageKey('token'));
        const storedUser = localStorage.getItem(getStorageKey('user'));

        // Normal Auth Restore with expiry check
        if (token && storedUser) {
            if (isTokenExpired(token)) {
                console.warn(`[Auth] Token expired for port ${window.location.port}, clearing session`);
                clearAuth();
            } else {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Failed to parse stored user:', error);
                    clearAuth();
                }
            }
        }
        setIsLoading(false);
    }, [clearAuth]);

    /**
     * Login with a real JWT token (from backend auth)
     */
    const login = useCallback((token: string, userData: User) => {
        localStorage.setItem(getStorageKey('token'), token);
        localStorage.setItem(getStorageKey('user'), JSON.stringify({ ...userData, token }));
        setUser({ ...userData, token });
    }, []);

    /**
     * Update user data in state + storage (e.g. after profile edit)
     */
    const updateUser = useCallback((updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            localStorage.setItem(getStorageKey('user'), JSON.stringify(updated));
            return updated;
        });
    }, []);

    /**
     * Logout - clears only THIS port's session (other ports remain logged in)
     */
    const logout = useCallback(() => {
        clearAuth();
        window.location.replace('/');
    }, [clearAuth]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        getStorageKey,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ==================== HOOK ====================

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export helper for use in non-React contexts (like API services)
export { getStorageKey };
