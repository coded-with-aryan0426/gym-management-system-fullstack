import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import CommandRail from './CommandRail';
import UtilityBar from './UtilityBar';
import './AppShell.css';

// Create context for sidebar state
interface SidebarContextType {
    isCollapsed: boolean;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: false,
    toggleCollapsed: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

interface AppShellProps {
    children?: React.ReactNode;
    navItems?: any[]; // Using any[] to avoid circular dependency for now, or import NavItem
    showUtilityBar?: boolean;
}

const AppShell: React.FC<AppShellProps> = ({ children, navItems, showUtilityBar = true }) => {
    // Persist sidebar collapsed state across refreshes
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebar-collapsed') === 'true';
        } catch {
            return false;
        }
    });

    const toggleCollapsed = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            try {
                localStorage.setItem('sidebar-collapsed', String(next));
            } catch { /* ignore */ }
            return next;
        });
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed }}>
            <div className={`app-shell ${isCollapsed ? 'app-shell--collapsed' : ''}`}>
                <CommandRail isCollapsed={isCollapsed} onToggle={toggleCollapsed} navItems={navItems} />
                <div className="app-shell__main">
                    {showUtilityBar && <UtilityBar />}
                    <main className="app-shell__content">
                        {children || <Outlet />}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

export default AppShell;
