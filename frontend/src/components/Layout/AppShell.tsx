import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import CommandRail from './CommandRail';
import './AppShell.css';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: true,
    toggleCollapsed: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

interface AppShellProps {
    children?: React.ReactNode;
    navItems?: any[];
}

const AppShell: React.FC<AppShellProps> = ({ children, navItems }) => {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const stored = localStorage.getItem('sidebar-collapsed');
            return stored === null ? true : stored === 'true';
        } catch {
            return true;
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
                    <main className="app-shell__content">
                        {children || <Outlet />}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

export default AppShell;
