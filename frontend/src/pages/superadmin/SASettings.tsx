import React, { useState, useCallback } from 'react';
import {
  Settings, CreditCard, Users, Server, Shield, BarChart3,
  Save, X, Globe, Palette, Bell, Mail, Key, Lock, Eye,
  EyeOff, Copy, RefreshCw, TrendingUp, TrendingDown,
  Activity, Zap, Database, Info, Check, AlertTriangle,
  Smartphone, ToggleLeft
} from 'lucide-react';
import './SASettings.css';

// ── Tab definitions ──
const settingsTabs = [
  { id: 'app-config', label: 'App Config', desc: 'Branding & domain', icon: Settings, color: '#f87171' },
  { id: 'subscription', label: 'Subscription', desc: 'Plans & billing', icon: CreditCard, color: '#10b981' },
  { id: 'users', label: 'User Mgmt', desc: 'Roles & accounts',  icon: Users, color: '#8b5cf6' },
  { id: 'system', label: 'System', desc: 'API & email', icon: Server, color: '#3b82f6' },
  { id: 'security', label: 'Security', desc: 'Auth & keys', icon: Shield, color: '#f59e0b' },
  { id: 'analytics', label: 'Analytics', desc: 'Revenue & perf', icon: BarChart3, color: '#06b6d4' },
];

// ── Mock data ──
const mockGymOwners = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@fitzone.com', gym: 'FitZone Gym', plan: 'Pro', status: 'active' },
  { id: 2, name: 'Priya Sharma', email: 'priya@ironfit.com', gym: 'IronFit Studio', plan: 'Starter', status: 'active' },
  { id: 3, name: 'Amit Patel', email: 'amit@powerhouse.com', gym: 'PowerHouse', plan: 'Enterprise', status: 'trial' },
  { id: 4, name: 'Sneha Reddy', email: 'sneha@flexgym.com', gym: 'Flex Gym', plan: 'Pro', status: 'expired' },
];

const mockApiKeys = [
  { id: 1, name: 'Production API', key: 'sk_live_••••••••••••4f2d', created: '2026-01-15', lastUsed: '2 hours ago', status: 'active' },
  { id: 2, name: 'Staging API', key: 'sk_test_••••••••••••8a1c', created: '2026-02-20', lastUsed: '3 days ago', status: 'active' },
  { id: 3, name: 'Webhook Secret', key: 'whsec_••••••••••••6b3e', created: '2026-01-15', lastUsed: '1 hour ago', status: 'active' },
];

const mockAuditLogs = [
  { id: 1, action: 'Plan Updated', user: 'admin@titan.io', target: 'Pro Plan pricing', time: '2 hours ago', type: 'billing' },
  { id: 2, action: 'API Key Created', user: 'admin@titan.io', target: 'Staging API', time: '3 days ago', type: 'security' },
  { id: 3, action: 'User Suspended', user: 'admin@titan.io', target: 'sneha@flexgym.com', time: '5 days ago', type: 'user' },
  { id: 4, action: 'Maintenance Window', user: 'system', target: 'Database backup', time: '1 week ago', type: 'system' },
];

export default function SASettings() {
  const [activeTab, setActiveTab] = useState('app-config');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── App Config State ──
  const [appConfig, setAppConfig] = useState({
    appName: 'AthlonX',
    tagline: 'Gym Management Platform',
    domain: 'app.athlonx.com',
    logoUrl: '',
    primaryColor: '#DC2626',
    maintenanceMode: false,
    signupEnabled: true,
    trialDays: 14,
  });

  // ── System Settings State ──
  const [systemConfig, setSystemConfig] = useState({
    apiRateLimit: '1000',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@athlonx.com',
    welcomeEmailEnabled: true,
    paymentReminderEnabled: true,
    weeklyReportEnabled: false,
  });

  // ── Security State ──
  const [securityConfig, setSecurityConfig] = useState({
    passwordAuth: true,
    googleAuth: true,
    otpAuth: false,
    twoFactorRequired: false,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
  });

  const handleFieldChange = useCallback((setter: Function, field: string, value: any) => {
    setter((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    // Simulate API save
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setHasChanges(false);
  }, []);

  const handleCancel = useCallback(() => {
    setHasChanges(false);
  }, []);

  // ── Render Sections ──
  const renderAppConfig = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--red">
            <Settings size={16} />
          </div>
          <div>
            <h2 className="sa-settings-section__title">Application Configuration</h2>
            <p className="sa-settings-section__desc">App name, branding, and domain settings</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Globe size={12} />
            <span>Branding</span>
          </div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">
                  App Name <span className="sa-settings-label__required">*</span>
                </label>
                <input
                  className="sa-settings-input"
                  value={appConfig.appName}
                  onChange={e => handleFieldChange(setAppConfig, 'appName', e.target.value)}
                  placeholder="Your app name"
                />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Tagline</label>
                <input
                  className="sa-settings-input"
                  value={appConfig.tagline}
                  onChange={e => handleFieldChange(setAppConfig, 'tagline', e.target.value)}
                  placeholder="Short description"
                />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Custom Domain</label>
                <input
                  className="sa-settings-input"
                  value={appConfig.domain}
                  onChange={e => handleFieldChange(setAppConfig, 'domain', e.target.value)}
                  placeholder="app.yourdomain.com"
                />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Brand Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={appConfig.primaryColor}
                    onChange={e => handleFieldChange(setAppConfig, 'primaryColor', e.target.value)}
                    style={{ width: 32, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                  />
                  <input
                    className="sa-settings-input"
                    value={appConfig.primaryColor}
                    onChange={e => handleFieldChange(setAppConfig, 'primaryColor', e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div className="sa-settings-field sa-settings-field--full">
                <label className="sa-settings-label">Logo URL</label>
                <input
                  className="sa-settings-input"
                  value={appConfig.logoUrl}
                  onChange={e => handleFieldChange(setAppConfig, 'logoUrl', e.target.value)}
                  placeholder="https://yourdomain.com/logo.svg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <ToggleLeft size={12} />
            <span>Platform Controls</span>
          </div>
          <div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Maintenance Mode</span>
                <span className="sa-settings-toggle-desc">Show maintenance page to all users</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={appConfig.maintenanceMode}
                  onChange={e => handleFieldChange(setAppConfig, 'maintenanceMode', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Allow New Signups</span>
                <span className="sa-settings-toggle-desc">Enable gym owner registration</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={appConfig.signupEnabled}
                  onChange={e => handleFieldChange(setAppConfig, 'signupEnabled', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Default Trial Period</span>
                <span className="sa-settings-toggle-desc">Days given to new signups</span>
              </div>
              <input
                className="sa-settings-input"
                type="number"
                value={appConfig.trialDays}
                onChange={e => handleFieldChange(setAppConfig, 'trialDays', parseInt(e.target.value) || 0)}
                style={{ width: 72, textAlign: 'center' }}
                min={0}
              />
            </div>
          </div>
        </div>
      </div>
      {hasChanges && (
        <div className="sa-settings-save-bar">
          <button className="sa-settings-cancel-btn" onClick={handleCancel}><X size={13} /> Discard</button>
          <button className="sa-settings-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><RefreshCw size={13} className="sa__refresh-btn--spinning" /> Saving...</> : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      )}
    </div>
  );

  const renderSubscription = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--emerald">
            <CreditCard size={16} />
          </div>
          <div>
            <h2 className="sa-settings-section__title">Subscription & Billing Management</h2>
            <p className="sa-settings-section__desc">Pricing tiers, payment gateway, and subscription analytics</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        {/* Subscription Analytics */}
        <div className="sa-settings-stats-grid">
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">Monthly Recurring Revenue</span>
            <span className="sa-settings-stat-card__value">₹2,45,000</span>
            <span className="sa-settings-stat-card__trend sa-settings-stat-card__trend--up">
              <TrendingUp size={11} /> +12.5% vs last month
            </span>
          </div>
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">Active Subscriptions</span>
            <span className="sa-settings-stat-card__value">142</span>
            <span className="sa-settings-stat-card__trend sa-settings-stat-card__trend--up">
              <TrendingUp size={11} /> +8 this month
            </span>
          </div>
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">Churn Rate</span>
            <span className="sa-settings-stat-card__value">2.3%</span>
            <span className="sa-settings-stat-card__trend sa-settings-stat-card__trend--down">
              <TrendingDown size={11} /> -0.5% vs last month
            </span>
          </div>
        </div>

        {/* Payment Gateway */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <CreditCard size={12} />
            <span>Payment Gateway</span>
          </div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">Gateway Provider</label>
                <select
                  className="sa-settings-select"
                  defaultValue="stripe"
                >
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Environment</label>
                <select className="sa-settings-select" defaultValue="live">
                  <option value="test">Test / Sandbox</option>
                  <option value="live">Live / Production</option>
                </select>
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Publishable Key</label>
                <input className="sa-settings-input" placeholder="pk_live_••••••••" defaultValue="" type="password" />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Secret Key</label>
                <input className="sa-settings-input" placeholder="sk_live_••••••••" defaultValue="" type="password" />
              </div>
              <div className="sa-settings-field sa-settings-field--full">
                <label className="sa-settings-label">Webhook Endpoint URL</label>
                <input className="sa-settings-input" value="https://api.athlonx.com/webhooks/stripe" readOnly
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tiers Summary */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Zap size={12} />
            <span>Pricing Tiers</span>
          </div>
          <div className="sa-settings-group__body">
            <table className="sa-settings-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Monthly</th>
                  <th>Yearly</th>
                  <th>Members</th>
                  <th>Subscribers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Starter</td>
                  <td>₹999</td>
                  <td>₹9,990</td>
                  <td>50</td>
                  <td style={{ color: '#10b981' }}>45</td>
                  <td><span className="sa__badge sa__badge--green">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Pro</td>
                  <td>₹2,499</td>
                  <td>₹24,990</td>
                  <td>200</td>
                  <td style={{ color: '#10b981' }}>78</td>
                  <td><span className="sa__badge sa__badge--green">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Enterprise</td>
                  <td>₹4,999</td>
                  <td>₹49,990</td>
                  <td>Unlimited</td>
                  <td style={{ color: '#10b981' }}>19</td>
                  <td><span className="sa__badge sa__badge--green">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--violet">
            <Users size={16} />
          </div>
          <div>
            <h2 className="sa-settings-section__title">User Management</h2>
            <p className="sa-settings-section__desc">Role-based permissions and account management</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        {/* Role Stats */}
        <div className="sa-settings-stats-grid">
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">Total Gym Owners</span>
            <span className="sa-settings-stat-card__value">156</span>
            <span className="sa-settings-stat-card__trend sa-settings-stat-card__trend--up">
              <TrendingUp size={11} /> +12 this month
            </span>
          </div>
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">Creator Accounts</span>
            <span className="sa-settings-stat-card__value">3</span>
          </div>
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">Pending Invites</span>
            <span className="sa-settings-stat-card__value">5</span>
          </div>
        </div>

        {/* Gym Owners Table */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Users size={12} />
            <span>Gym Owner Accounts</span>
          </div>
          <div className="sa-settings-group__body" style={{ padding: 0 }}>
            <table className="sa-settings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Gym</th>
                  <th>Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockGymOwners.map(owner => (
                  <tr key={owner.id}>
                    <td style={{ fontWeight: 600 }}>{owner.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{owner.email}</td>
                    <td>{owner.gym}</td>
                    <td><span className="sa__badge sa__badge--blue">{owner.plan}</span></td>
                    <td>
                      <span className={`sa__badge ${
                        owner.status === 'active' ? 'sa__badge--green' :
                        owner.status === 'trial' ? 'sa__badge--amber' : 'sa__badge--red'
                      }`}>
                        {owner.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Shield size={12} />
            <span>Role Permissions</span>
          </div>
          <div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Owner can manage staff</span>
                <span className="sa-settings-toggle-desc">Allow gym owners to add/remove staff accounts</span>
              </div>
              <label className="sa-settings-switch">
                <input type="checkbox" defaultChecked />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Owner can export data</span>
                <span className="sa-settings-toggle-desc">Allow CSV/PDF export of member and financial data</span>
              </div>
              <label className="sa-settings-switch">
                <input type="checkbox" defaultChecked />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Owner can access API</span>
                <span className="sa-settings-toggle-desc">Enable API access for enterprise plan owners</span>
              </div>
              <label className="sa-settings-switch">
                <input type="checkbox" />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--blue">
            <Server size={16} />
          </div>
          <div>
            <h2 className="sa-settings-section__title">System Settings</h2>
            <p className="sa-settings-section__desc">API configurations, email templates, and notification preferences</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        {/* API Config */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Database size={12} />
            <span>API Configuration</span>
          </div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">Rate Limit (req/min)</label>
                <input
                  className="sa-settings-input"
                  type="number"
                  value={systemConfig.apiRateLimit}
                  onChange={e => handleFieldChange(setSystemConfig, 'apiRateLimit', e.target.value)}
                />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">API Version</label>
                <select className="sa-settings-select" defaultValue="v3">
                  <option value="v2">v2 (Legacy)</option>
                  <option value="v3">v3 (Current)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SMTP */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Mail size={12} />
            <span>Email / SMTP Configuration</span>
          </div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">SMTP Host</label>
                <input
                  className="sa-settings-input"
                  value={systemConfig.smtpHost}
                  onChange={e => handleFieldChange(setSystemConfig, 'smtpHost', e.target.value)}
                />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Port</label>
                <input
                  className="sa-settings-input"
                  value={systemConfig.smtpPort}
                  onChange={e => handleFieldChange(setSystemConfig, 'smtpPort', e.target.value)}
                />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Username</label>
                <input
                  className="sa-settings-input"
                  value={systemConfig.smtpUser}
                  onChange={e => handleFieldChange(setSystemConfig, 'smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Password</label>
                <input
                  className="sa-settings-input"
                  type="password"
                  value={systemConfig.smtpPassword}
                  onChange={e => handleFieldChange(setSystemConfig, 'smtpPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="sa-settings-field sa-settings-field--full">
                <label className="sa-settings-label">From Email Address</label>
                <input
                  className="sa-settings-input"
                  value={systemConfig.fromEmail}
                  onChange={e => handleFieldChange(setSystemConfig, 'fromEmail', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Bell size={12} />
            <span>Notification Templates</span>
          </div>
          <div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Welcome Email</span>
                <span className="sa-settings-toggle-desc">Send welcome email on gym owner signup</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={systemConfig.welcomeEmailEnabled}
                  onChange={e => handleFieldChange(setSystemConfig, 'welcomeEmailEnabled', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Payment Reminders</span>
                <span className="sa-settings-toggle-desc">Auto-send 3-day and 1-day reminders before renewal</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={systemConfig.paymentReminderEnabled}
                  onChange={e => handleFieldChange(setSystemConfig, 'paymentReminderEnabled', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Weekly Analytics Report</span>
                <span className="sa-settings-toggle-desc">Send weekly summary to creator admins</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={systemConfig.weeklyReportEnabled}
                  onChange={e => handleFieldChange(setSystemConfig, 'weeklyReportEnabled', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
          </div>
        </div>
      </div>
      {hasChanges && (
        <div className="sa-settings-save-bar">
          <button className="sa-settings-cancel-btn" onClick={handleCancel}><X size={13} /> Discard</button>
          <button className="sa-settings-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><RefreshCw size={13} /> Saving...</> : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--amber">
            <Shield size={16} />
          </div>
          <div>
            <h2 className="sa-settings-section__title">Security Settings</h2>
            <p className="sa-settings-section__desc">Authentication methods, API keys, and audit logs</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        {/* Auth Methods */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Lock size={12} />
            <span>Authentication Methods</span>
          </div>
          <div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Password Authentication</span>
                <span className="sa-settings-toggle-desc">Standard email + password login</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={securityConfig.passwordAuth}
                  onChange={e => handleFieldChange(setSecurityConfig, 'passwordAuth', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Google OAuth</span>
                <span className="sa-settings-toggle-desc">Sign in with Google account</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={securityConfig.googleAuth}
                  onChange={e => handleFieldChange(setSecurityConfig, 'googleAuth', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">OTP / SMS Authentication</span>
                <span className="sa-settings-toggle-desc">One-time password via SMS</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={securityConfig.otpAuth}
                  onChange={e => handleFieldChange(setSecurityConfig, 'otpAuth', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Require 2FA for Owners</span>
                <span className="sa-settings-toggle-desc">Force two-factor on all owner accounts</span>
              </div>
              <label className="sa-settings-switch">
                <input
                  type="checkbox"
                  checked={securityConfig.twoFactorRequired}
                  onChange={e => handleFieldChange(setSecurityConfig, 'twoFactorRequired', e.target.checked)}
                />
                <span className="sa-settings-switch__track" />
                <span className="sa-settings-switch__thumb" />
              </label>
            </div>
          </div>
        </div>

        {/* Session Controls */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Activity size={12} />
            <span>Session Controls</span>
          </div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">Session Timeout (minutes)</label>
                <input
                  className="sa-settings-input"
                  type="number"
                  value={securityConfig.sessionTimeout}
                  onChange={e => handleFieldChange(setSecurityConfig, 'sessionTimeout', e.target.value)}
                />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Max Login Attempts</label>
                <input
                  className="sa-settings-input"
                  type="number"
                  value={securityConfig.maxLoginAttempts}
                  onChange={e => handleFieldChange(setSecurityConfig, 'maxLoginAttempts', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Key size={12} />
            <span>API Keys</span>
          </div>
          <div className="sa-settings-group__body" style={{ padding: 0 }}>
            <table className="sa-settings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockApiKeys.map(key => (
                  <tr key={key.id}>
                    <td style={{ fontWeight: 600 }}>{key.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, opacity: 0.7 }}>{key.key}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{key.created}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{key.lastUsed}</td>
                    <td><span className="sa__badge sa__badge--green">{key.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Eye size={12} />
            <span>Recent Audit Log</span>
          </div>
          <div className="sa-settings-group__body" style={{ padding: 0 }}>
            <table className="sa-settings-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Target</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.action}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{log.user}</td>
                    <td>{log.target}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {hasChanges && (
        <div className="sa-settings-save-bar">
          <button className="sa-settings-cancel-btn" onClick={handleCancel}><X size={13} /> Discard</button>
          <button className="sa-settings-save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><RefreshCw size={13} /> Saving...</> : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--cyan">
            <BarChart3 size={16} />
          </div>
          <div>
            <h2 className="sa-settings-section__title">Analytics Dashboard</h2>
            <p className="sa-settings-section__desc">Revenue metrics, user engagement, and system performance</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        {/* Revenue Metrics */}
        <div className="sa-settings-stats-grid">
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">Total Revenue (YTD)</span>
            <span className="sa-settings-stat-card__value">₹28.4L</span>
            <span className="sa-settings-stat-card__trend sa-settings-stat-card__trend--up">
              <TrendingUp size={11} /> +34% vs last year
            </span>
          </div>
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">Avg Revenue Per User</span>
            <span className="sa-settings-stat-card__value">₹1,725</span>
            <span className="sa-settings-stat-card__trend sa-settings-stat-card__trend--up">
              <TrendingUp size={11} /> +8% vs last quarter
            </span>
          </div>
          <div className="sa-settings-stat-card">
            <span className="sa-settings-stat-card__label">LTV (Lifetime Value)</span>
            <span className="sa-settings-stat-card__value">₹18,500</span>
          </div>
        </div>

        {/* User Engagement */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Activity size={12} />
            <span>User Engagement</span>
          </div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Daily Active Users</span>
                <span className="sa-settings-stat-card__value">89</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Weekly Active Users</span>
                <span className="sa-settings-stat-card__value">134</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Feature Adoption</span>
                <span className="sa-settings-stat-card__value">72%</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Avg Session Duration</span>
                <span className="sa-settings-stat-card__value">12m</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header">
            <Smartphone size={12} />
            <span>System Performance</span>
          </div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">API Uptime</span>
                <span className="sa-settings-stat-card__value" style={{ color: '#10b981' }}>99.97%</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Avg Response Time</span>
                <span className="sa-settings-stat-card__value">142ms</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Error Rate (24h)</span>
                <span className="sa-settings-stat-card__value" style={{ color: '#10b981' }}>0.02%</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">DB Connections</span>
                <span className="sa-settings-stat-card__value">23/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sa-settings-info">
          <Info size={14} />
          <span>
            <strong>Real-time metrics:</strong> For detailed analytics with interactive charts and custom date ranges,
            visit the dedicated <strong>Analytics</strong> page from the sidebar navigation.
          </span>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'app-config': return renderAppConfig();
      case 'subscription': return renderSubscription();
      case 'users': return renderUsers();
      case 'system': return renderSystem();
      case 'security': return renderSecurity();
      case 'analytics': return renderAnalytics();
      default: return renderAppConfig();
    }
  };

  return (
    <div className="sa">
      <div className="sa__header">
        <div className="sa__header-left">
          <h1>Creator Settings</h1>
          <p>Manage your SaaS platform configuration</p>
        </div>
      </div>

      <div className="sa-settings-layout">
        <aside className="sa-settings-sidebar">
          {settingsTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`sa-settings-tab ${isActive ? 'sa-settings-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div
                  className="sa-settings-tab__icon"
                  style={!isActive ? { background: `${tab.color}18`, color: tab.color } : undefined}
                >
                  <Icon size={14} />
                </div>
                <div className="sa-settings-tab__text">
                  <span className="sa-settings-tab__label">{tab.label}</span>
                  <span className="sa-settings-tab__desc">{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </aside>

        <main className="sa-settings-content">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
