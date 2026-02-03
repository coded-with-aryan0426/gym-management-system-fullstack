import React, { createContext, useContext, useState, useCallback } from 'react';

type AuthModalTab = 'login' | 'signup';

interface AuthModalContextType {
  isOpen: boolean;
  activeTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  setActiveTab: (tab: AuthModalTab) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthModalTab>('login');

  const openAuthModal = useCallback((tab: AuthModalTab = 'login') => {
    setActiveTab(tab);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        activeTab,
        openAuthModal,
        closeAuthModal,
        setActiveTab,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
