import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define User Type
export interface User {
    id: string; // Changed to string to support "dev-admin" etc
    username: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'TRAINER' | 'MEMBER' | 'OWNER';
    token?: string;
    avatar?: string;
    context?: string;      // Added for compatibility with backend responses
    staffRole?: string;    // Added for compatibility
    activeGymId?: number;  // Added for compatibility
    activeGymName?: string;// Added for compatibility
}

export type DevRole = 'ADMIN' | 'TRAINER' | 'MEMBER';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    devLogin: (role: DevRole, targetPath?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const devMode = localStorage.getItem('dev_mode_active');

        // DEV Mode Restore
        if (devMode === 'true' && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to restore dev user", e);
            }
            setIsLoading(false);
            return;
        }

        // Normal Auth Restore
        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('dev_mode_active');
        localStorage.removeItem('dev_role');
        localStorage.removeItem('devNavPosition');
        setUser(null);
        window.location.href = '/login';
    };

    const devLogin = (role: DevRole, targetPath?: string) => {
        localStorage.removeItem('token'); // Clear real token

        // Map roles to exact backend expectations
        const mappedRole = role === 'ADMIN' ? 'OWNER' : role;

        const mockUser: User = {
            id: `dev-${role.toLowerCase()}`,
            username: `dev_${role.toLowerCase()}`,
            email: `dev.${role.toLowerCase()}@gym.local`,
            fullName: `Dev ${role.charAt(0) + role.slice(1).toLowerCase()}`,
            role: mappedRole,
            context: role === 'MEMBER' ? 'MEMBER' : 'STAFF',
            staffRole: mappedRole,
            token: `DEV_TOKEN_${role}` // BE-compatible token
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockUser.token!);
        localStorage.setItem('dev_mode_active', 'true');
        localStorage.setItem('dev_role', role);

        setUser(mockUser);

        // Redirect to target path if provided, otherwise default for role
        if (targetPath) {
            window.location.href = targetPath;
        } else {
            if (role === 'ADMIN') window.location.href = '/dashboard';
            else if (role === 'TRAINER') window.location.href = '/trainer';
            else window.location.href = '/member';
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, devLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
