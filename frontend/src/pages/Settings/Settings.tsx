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
    Palette
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
import ThemeSection from "./sections/ThemeSection"

const settingsCategories = [
    { id: 'profile', label: 'Owner Profile', icon: User, desc: 'Personal & Gym details' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & Display' },
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
            case 'appearance': return <ThemeSection />
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
                                <div className="settings-nav-item__icon">
                                    <Icon size={18} />
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
