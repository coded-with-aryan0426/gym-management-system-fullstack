"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User,
    Shield,
    Users,
    CreditCard,
    ClipboardList,
    Bell,
    FileText,
    Palette,
    Building2,
} from "lucide-react"
import "./Settings.css"

import OwnerProfileSection from "./sections/OwnerProfileSection"
import SecuritySection from "./sections/SecuritySection"
import RolesSection from "./sections/RolesSection"
import BillingRulesSection from "./sections/BillingRulesSection"
import MembershipPoliciesSection from "./sections/MembershipPoliciesSection"
import UserRulesSection from "./sections/UserRulesSection"
import NotificationsSection from "./sections/NotificationsSection"
import AuditLogSection from "./sections/AuditLogSection"
import ThemeSection from "./sections/ThemeSection"
import GymProfileSection from "./sections/GymProfileSection"

const settingsCategories = [
    { id: 'profile', label: 'Owner Profile', icon: User, desc: 'Personal & Gym details', color: '#3b82f6' },
    { id: 'gymprofile', label: 'Gym Profile', icon: Building2, desc: 'Hours, PT config & holidays', color: '#10b981' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & Display', color: '#a855f7' },
    { id: 'security', label: 'Security & Access', icon: Shield, desc: 'Login & Data safety', color: '#ef4444' },
    { id: 'roles', label: 'Roles & Permissions', icon: Users, desc: 'Access control matrix', color: '#f59e0b' },
    { id: 'billing', label: 'Billing Rules', icon: CreditCard, desc: 'Taxes & Late fees', color: '#10b981' },
    { id: 'membership', label: 'Membership Policies', icon: ClipboardList, desc: 'Freezes & Cancellations', color: '#06b6d4' },
    { id: 'userrules', label: 'User Rules', icon: Users, desc: 'Staff, Trainer & Member policies', color: '#8b5cf6' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & Reminders', color: '#f97316' },
    { id: 'audit', label: 'Audit Logs', icon: FileText, desc: 'System activity history', color: '#14b8a6' },
]

const Settings: React.FC = () => {
    const [activeSection, setActiveSection] = useState(() => {
        // Restore last active section from sessionStorage
        return sessionStorage.getItem('settings_active_section') || 'profile'
    })

    // Persist active section to sessionStorage when it changes
    useEffect(() => {
        sessionStorage.setItem('settings_active_section', activeSection)
    }, [activeSection])

    const renderSection = () => {
        switch (activeSection) {
            case 'profile': return <OwnerProfileSection />
            case 'gymprofile': return <GymProfileSection />
            case 'appearance': return <ThemeSection />
            case 'security': return <SecuritySection />
            case 'roles': return <RolesSection />
            case 'billing': return <BillingRulesSection />
            case 'membership': return <MembershipPoliciesSection />
            case 'userrules': return <UserRulesSection />
            case 'notifications': return <NotificationsSection />
            case 'audit': return <AuditLogSection />
            default: return <OwnerProfileSection />
        }
    }

    return (
        <div className="settings-page">

            <div className="settings-layout">
                <aside className="settings-sidebar">
                    {settingsCategories.map((category) => {
                        const Icon = category.icon
                        const isActive = activeSection === category.id
                        return (
                            <motion.button
                                key={category.id}
                                className={`settings-nav-item ${isActive ? 'settings-nav-item--active' : ''}`}
                                onClick={() => setActiveSection(category.id)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <div
                                    className="settings-nav-item__icon"
                                    style={isActive ? {
                                        background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                                        color: '#fff',
                                        boxShadow: `0 3px 10px ${category.color}55`
                                    } : {
                                        color: category.color,
                                        background: `${category.color}15`
                                    }}
                                >
                                    <Icon size={16} />
                                </div>
                                <div className="settings-nav-item__text">
                                    <div className="settings-nav-item__label">{category.label}</div>
                                    <div className="settings-nav-item__desc">{category.desc}</div>
                                </div>
                            </motion.button>
                        )
                    })}
                </aside>

                <main className="settings-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
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
