"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import api from "../../services/api"
import "./Settings.css"

// Section imports
import OwnerProfileSection from "./sections/OwnerProfileSection"
import SecuritySection from "./sections/SecuritySection"
import RolesSection from "./sections/RolesSection"
import BillingRulesSection from "./sections/BillingRulesSection"
import MembershipPoliciesSection from "./sections/MembershipPoliciesSection"
import StaffRulesSection from "./sections/StaffRulesSection"
import NotificationsSection from "./sections/NotificationsSection"
import AuditLogSection from "./sections/AuditLogSection"

// Settings categories
const settingsCategories = [
  { id: 'profile', label: 'Owner Profile', icon: 'user' },
  { id: 'security', label: 'Security & Access', icon: 'shield' },
  { id: 'roles', label: 'Roles & Permissions', icon: 'users' },
  { id: 'billing', label: 'Billing Rules', icon: 'credit-card' },
  { id: 'membership', label: 'Membership Policies', icon: 'clipboard' },
  { id: 'staff', label: 'Staff & Trainer Rules', icon: 'briefcase' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'audit', label: 'Audit Logs', icon: 'file-text' },
]

// Icon component for sidebar
const CategoryIcon: React.FC<{ name: string }> = ({ name }) => {
  const icons: Record<string, React.ReactNode> = {
    'user': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    'shield': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    'users': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    'credit-card': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    'clipboard': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    ),
    'briefcase': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    'bell': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    'file-text': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  }
  return <>{icons[name] || null}</>
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)

  // Render active section
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
      {/* Settings Layout: Sidebar + Content */}
      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            {settingsCategories.map((category) => (
              <button
                key={category.id}
                className={`settings-nav__item ${activeSection === category.id ? 'settings-nav__item--active' : ''}`}
                onClick={() => setActiveSection(category.id)}
              >
                <span className="settings-nav__icon">
                  <CategoryIcon name={category.icon} />
                </span>
                <span className="settings-nav__label">{category.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Panel */}
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
