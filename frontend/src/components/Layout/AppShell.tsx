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
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapsed = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed }}>
            <div className={`app-shell ${isCollapsed ? 'app-shell--collapsed' : ''}`}>
                <CommandRail isCollapsed={isCollapsed} onToggle={toggleCollapsed} />
                <div className="app-shell__main">
                    <UtilityBar />
                    <main className="app-shell__content">
                        {children || <Outlet />}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

export default AppShell;
