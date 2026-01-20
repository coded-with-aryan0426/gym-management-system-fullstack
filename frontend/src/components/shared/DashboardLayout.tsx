import React from 'react';
import AppShell from '../Layout/AppShell';
import type { NavItem } from '../Layout/CommandRail';

interface DashboardLayoutProps {
    children: React.ReactNode;
    navItems?: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, navItems }) => {
    return (
        <AppShell navItems={navItems}>
            {children}
        </AppShell>
    );
};

export default DashboardLayout;
