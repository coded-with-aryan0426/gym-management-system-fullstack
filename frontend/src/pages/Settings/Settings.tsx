"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User,
    Shield,
    Users,
    CreditCard,
    ClipboardList,
    Briefcase,
    Bell,
    FileText,
    Settings as SettingsIcon,
    ChevronRight
} from "lucide-react"
import "./Settings.css"

import OwnerProfileSection from "./sections/OwnerProfileSection"
import SecuritySection from "./sections/SecuritySection"
import RolesSection from "./sections/RolesSection"
import BillingRulesSection from "./sections/BillingRulesSection"
import MembershipPoliciesSection from "./sections/MembershipPoliciesSection"
import StaffRulesSection from "./sections/StaffRulesSection"
import NotificationsSection from "./sections/NotificationsSection"
import AuditLogSection from "./sections/AuditLogSection"

const settingsCategories = [
    { id: 'profile', label: 'Owner Profile', icon: User, desc: 'Personal & Gym details' },
    { id: 'security', label: 'Security & Access', icon: Shield, desc: 'Login & Data safety' },
    { id: 'roles', label: 'Roles & Permissions', icon: Users, desc: 'Access control matrix' },
    { id: 'billing', label: 'Billing Rules', icon: CreditCard, desc: 'Taxes & Late fees' },
    { id: 'membership', label: 'Membership Policies', icon: ClipboardList, desc: 'Freezes & Cancellations' },
    { id: 'staff', label: 'Staff & Trainer Rules', icon: Briefcase, desc: 'Operations & Attendance' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & Reminders' },
    { id: 'audit', label: 'Audit Logs', icon: FileText, desc: 'System activity history' },
]

const Settings: React.FC = () => {
    const [activeSection, setActiveSection] = useState('profile')

    const renderSection = () => {
        switch (activeSection) {
            case 'profile': return <OwnerProfileSection />
            case 'security': return <SecuritySection />
            case 'roles': return <RolesSection />
            case 'billing': return <BillingRulesSection />
            case 'membership': return <MembershipPoliciesSection />
            case 'staff': return <StaffRulesSection />
            case 'notifications': return <NotificationsSection />
            case 'audit': return <AuditLogSection />
            default: return <OwnerProfileSection />
        }
    }

    return (
        <div className="settings-page">
            <header className="settings-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <SettingsIcon size={24} color="var(--settings-accent-green)" />
                    <h1 className="settings-header__title">Control Center</h1>
                </div>
                <p className="settings-header__subtitle">
                    Manage your gym's operations, security policies, and administrative configurations
                </p>
            </header>

            <div className="settings-layout">
                <aside className="settings-sidebar">
                    {settingsCategories.map((category) => {
                        const Icon = category.icon
                        const isActive = activeSection === category.id
                        return (
                            <button
                                key={category.id}
                                className={`settings-nav-item ${isActive ? 'settings-nav-item--active' : ''}`}
                                onClick={() => setActiveSection(category.id)}
                            >
                                <div className="settings-nav-item__icon">
                                    <Icon size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500' }}>{category.label}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>{category.desc}</div>
                                </div>
                                {isActive && <ChevronRight size={14} />}
                            </button>
                        )
                    })}
                </aside>

                <main className="settings-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderSection()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

export default Settings
