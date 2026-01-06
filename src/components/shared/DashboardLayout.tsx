import React from 'react';
import AppShell from '../Layout/AppShell';
import type { NavItem } from '../Layout/CommandRail';

interface DashboardLayoutProps {
    children: React.ReactNode;
    navItems?: NavItem[];
    showUtilityBar?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navItems, showUtilityBar = true }) => {
    return (
        <AppShell navItems={navItems} showUtilityBar={showUtilityBar}>
            {children}
        </AppShell>
    );
};

export default DashboardLayout;
