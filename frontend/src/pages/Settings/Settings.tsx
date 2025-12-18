"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Shield,
  Users,
  CreditCard,
  ClipboardList,
  Briefcase,
  Bell,
  FileText,
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
  { id: 'profile', label: 'Owner Profile', icon: User },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'roles', label: 'Roles & Permissions', icon: Users },
  { id: 'billing', label: 'Billing Rules', icon: CreditCard },
  { id: 'membership', label: 'Membership Policies', icon: ClipboardList },
  { id: 'staff', label: 'Staff & Trainer Rules', icon: Briefcase },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
]

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile')

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <OwnerProfileSection />
      case 'security':
        return <SecuritySection />
      case 'roles':
        return <RolesSection />
      case 'billing':
        return <BillingRulesSection />
      case 'membership':
        return <MembershipPoliciesSection />
      case 'staff':
        return <StaffRulesSection />
      case 'notifications':
        return <NotificationsSection />
      case 'audit':
        return <AuditLogSection />
      default:
        return <OwnerProfileSection />
    }
  }

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div
      className="settings-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      <div className="settings-layout">
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            {settingsCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  className={`settings-nav__item ${activeSection === category.id ? 'settings-nav__item--active' : ''}`}
                  onClick={() => setActiveSection(category.id)}
                >
                  <span className="settings-nav__icon">
                    <IconComponent size={18} />
                  </span>
                  <span className="settings-nav__label">{category.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="settings-content">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>
    </motion.div>
  )
}

export default Settings
