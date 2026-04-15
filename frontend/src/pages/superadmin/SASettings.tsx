import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Settings, CreditCard, Users, Server, Shield, BarChart3,
  Save, X, Globe, Bell, Mail, Key, Lock, Eye,
  Copy, RefreshCw, TrendingUp, TrendingDown,
  Activity, Zap, Database, Info, Check,
  ToggleLeft, Loader
} from 'lucide-react';
import { superAdminApi } from '../../services/superAdminApi';
import { subscriptionApi, type PlanConfig } from '../../services/subscriptionApi';
import type {
  SuperAdminUser, SuperAdminRevenueData, SuperAdminAnalyticsData,
  SuperAdminAuditLogEntry, SuperAdminDashboardData
} from '../../services/superAdminApi';
import './SASettings.css';

// ── Storage helpers for creator settings persistence ──
const SA_SETTINGS_KEY = 'sa_creator_settings';

interface CreatorSettings {
  appConfig: {
    appName: string;
    tagline: string;
    domain: string;
    logoUrl: string;
    primaryColor: string;
    maintenanceMode: boolean;
    signupEnabled: boolean;
    trialDays: number;
  };
  systemConfig: {
    apiRateLimit: string;
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    welcomeEmailEnabled: boolean;
    paymentReminderEnabled: boolean;
    weeklyReportEnabled: boolean;
  };
  securityConfig: {
    passwordAuth: boolean;
    googleAuth: boolean;
    otpAuth: boolean;
    twoFactorRequired: boolean;
    sessionTimeout: string;
    maxLoginAttempts: string;
  };
}

const defaultSettings: CreatorSettings = {
  appConfig: {
    appName: 'AthlonX',
    tagline: 'Gym Management Platform',
    domain: 'app.athlonx.com',
    logoUrl: '',
    primaryColor: '#DC2626',
    maintenanceMode: false,
    signupEnabled: true,
    trialDays: 14,
  },
  systemConfig: {
    apiRateLimit: '1000',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@athlonx.com',
    welcomeEmailEnabled: true,
    paymentReminderEnabled: true,
    weeklyReportEnabled: false,
  },
  securityConfig: {
    passwordAuth: true,
    googleAuth: true,
    otpAuth: false,
    twoFactorRequired: false,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
  },
};

function loadSettings(): CreatorSettings {
  try {
    const stored = localStorage.getItem(SA_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        appConfig: { ...defaultSettings.appConfig, ...parsed.appConfig },
        systemConfig: { ...defaultSettings.systemConfig, ...parsed.systemConfig },
        securityConfig: { ...defaultSettings.securityConfig, ...parsed.securityConfig },
      };
    }
  } catch { /* ignore parse errors */ }
  return { ...defaultSettings };
}

function saveSettings(settings: CreatorSettings): void {
  localStorage.setItem(SA_SETTINGS_KEY, JSON.stringify(settings));
}

// ── Tab definitions ──
const settingsTabs = [
  { id: 'app-config', label: 'App Config', desc: 'Branding & domain', icon: Settings, color: '#f87171' },
  { id: 'subscription', label: 'Subscription', desc: 'Plans & billing', icon: CreditCard, color: '#10b981' },
  { id: 'users', label: 'User Mgmt', desc: 'Roles & accounts', icon: Users, color: '#8b5cf6' },
  { id: 'system', label: 'System', desc: 'API & email', icon: Server, color: '#3b82f6' },
  { id: 'security', label: 'Security', desc: 'Auth & keys', icon: Shield, color: '#f59e0b' },
  { id: 'analytics', label: 'Analytics', desc: 'Revenue & perf', icon: BarChart3, color: '#06b6d4' },
];

export default function SASettings() {
  const [activeTab, setActiveTab] = useState(() =>
    sessionStorage.getItem('sa_settings_tab') || 'app-config'
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Persisted settings state ──
  const [settings, setSettings] = useState<CreatorSettings>(loadSettings);
  const [originalSettings, setOriginalSettings] = useState<CreatorSettings>(loadSettings);

  // ── Live data from APIs ──
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [revenue, setRevenue] = useState<SuperAdminRevenueData | null>(null);
  const [analytics, setAnalytics] = useState<SuperAdminAnalyticsData | null>(null);
  const [auditLogs, setAuditLogs] = useState<SuperAdminAuditLogEntry[]>([]);
  const [dashboard, setDashboard] = useState<SuperAdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Persist active tab
  useEffect(() => {
    sessionStorage.setItem('sa_settings_tab', activeTab);
  }, [activeTab]);

  // ── Load live data based on active tab ──
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        switch (activeTab) {
          case 'subscription': {
            const [plansRes, revRes] = await Promise.all([
              subscriptionApi.getAllPlans().catch(() => ({ data: [] })),
              superAdminApi.getRevenue().catch(() => null),
            ]);
            setPlans(plansRes.data || []);
            if (revRes) setRevenue(revRes);
            break;
          }
          case 'users': {
            const [usersData, dashData] = await Promise.all([
              superAdminApi.getUsers().catch(() => []),
              superAdminApi.getDashboard().catch(() => null),
            ]);
            setUsers(usersData);
            if (dashData) setDashboard(dashData);
            break;
          }
          case 'security': {
            const logs = await superAdminApi.getAuditLogs(10).catch(() => []);
            setAuditLogs(logs);
            break;
          }
          case 'analytics': {
            const [revRes, analyticsRes, dashData] = await Promise.all([
              superAdminApi.getRevenue().catch(() => null),
              superAdminApi.getAnalytics().catch(() => null),
              superAdminApi.getDashboard().catch(() => null),
            ]);
            if (revRes) setRevenue(revRes);
            if (analyticsRes) setAnalytics(analyticsRes);
            if (dashData) setDashboard(dashData);
            break;
          }
        }
      } catch (err: any) {
        console.error('Failed to load settings data:', err);
        setLoadError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (['subscription', 'users', 'security', 'analytics'].includes(activeTab)) {
      loadData();
    }
  }, [activeTab]);

  // ── Settings mutation helpers ──
  const updateAppConfig = useCallback((field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      appConfig: { ...prev.appConfig, [field]: value },
    }));
    setHasChanges(true);
  }, []);

  const updateSystemConfig = useCallback((field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      systemConfig: { ...prev.systemConfig, [field]: value },
    }));
    setHasChanges(true);
  }, []);

  const updateSecurityConfig = useCallback((field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      securityConfig: { ...prev.securityConfig, [field]: value },
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      saveSettings(settings);
      setOriginalSettings({ ...settings });
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const handleCancel = useCallback(() => {
    setSettings({ ...originalSettings });
    setHasChanges(false);
  }, [originalSettings]);

  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy');
    });
  }, []);

  // ── Format helpers ──
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('en-IN').format(num);

  // ── Loading indicator ──
  const LoadingSpinner = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 8, color: 'var(--text-muted)' }}>
      <Loader size={16} className="sa__refresh-btn--spinning" /> Loading...
    </div>
  );

  // ── Save bar (reusable) ──
  const SaveBar = () => hasChanges ? (
    <div className="sa-settings-save-bar">
      <button className="sa-settings-cancel-btn" onClick={handleCancel}><X size={13} /> Discard</button>
      <button className="sa-settings-save-btn" onClick={handleSave} disabled={isSaving}>
        {isSaving ? <><RefreshCw size={13} className="sa__refresh-btn--spinning" /> Saving...</> : <><Save size={13} /> Save Changes</>}
      </button>
    </div>
  ) : null;

  // ── Section Renderers ──

  const renderAppConfig = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--red"><Settings size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">Application Configuration</h2>
            <p className="sa-settings-section__desc">App name, branding, and domain settings</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Globe size={12} /><span>Branding</span></div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">App Name <span className="sa-settings-label__required">*</span></label>
                <input className="sa-settings-input" value={settings.appConfig.appName}
                  onChange={e => updateAppConfig('appName', e.target.value)} placeholder="Your app name" />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Tagline</label>
                <input className="sa-settings-input" value={settings.appConfig.tagline}
                  onChange={e => updateAppConfig('tagline', e.target.value)} placeholder="Short description" />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Custom Domain</label>
                <input className="sa-settings-input" value={settings.appConfig.domain}
                  onChange={e => updateAppConfig('domain', e.target.value)} placeholder="app.yourdomain.com" />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Brand Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={settings.appConfig.primaryColor}
                    onChange={e => updateAppConfig('primaryColor', e.target.value)}
                    style={{ width: 32, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
                  <input className="sa-settings-input" value={settings.appConfig.primaryColor}
                    onChange={e => updateAppConfig('primaryColor', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
              <div className="sa-settings-field sa-settings-field--full">
                <label className="sa-settings-label">Logo URL</label>
                <input className="sa-settings-input" value={settings.appConfig.logoUrl}
                  onChange={e => updateAppConfig('logoUrl', e.target.value)} placeholder="https://yourdomain.com/logo.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><ToggleLeft size={12} /><span>Platform Controls</span></div>
          <div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Maintenance Mode</span>
                <span className="sa-settings-toggle-desc">Show maintenance page to all users</span>
              </div>
              <label className="sa-settings-switch">
                <input type="checkbox" checked={settings.appConfig.maintenanceMode}
                  onChange={e => updateAppConfig('maintenanceMode', e.target.checked)} />
                <span className="sa-settings-switch__track" /><span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Allow New Signups</span>
                <span className="sa-settings-toggle-desc">Enable gym owner registration</span>
              </div>
              <label className="sa-settings-switch">
                <input type="checkbox" checked={settings.appConfig.signupEnabled}
                  onChange={e => updateAppConfig('signupEnabled', e.target.checked)} />
                <span className="sa-settings-switch__track" /><span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Default Trial Period</span>
                <span className="sa-settings-toggle-desc">Days given to new signups</span>
              </div>
              <input className="sa-settings-input" type="number" value={settings.appConfig.trialDays}
                onChange={e => updateAppConfig('trialDays', parseInt(e.target.value) || 0)}
                style={{ width: 72, textAlign: 'center' }} min={0} />
            </div>
          </div>
        </div>
      </div>
      <SaveBar />
    </div>
  );

  const renderSubscription = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--emerald"><CreditCard size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">Subscription & Billing Management</h2>
            <p className="sa-settings-section__desc">Pricing tiers, payment gateway, and subscription analytics</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        {isLoading ? <LoadingSpinner /> : (
          <>
            {/* Revenue Stats from real API */}
            <div className="sa-settings-stats-grid">
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Monthly Recurring Revenue</span>
                <span className="sa-settings-stat-card__value">{revenue ? formatCurrency(revenue.mrr) : '—'}</span>
                {revenue && revenue.mrrChange !== 0 && (
                  <span className={`sa-settings-stat-card__trend ${revenue.mrrChange > 0 ? 'sa-settings-stat-card__trend--up' : 'sa-settings-stat-card__trend--down'}`}>
                    {revenue.mrrChange > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {revenue.mrrChange > 0 ? '+' : ''}{revenue.mrrChange.toFixed(1)}% vs last month
                  </span>
                )}
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Annual Run Rate</span>
                <span className="sa-settings-stat-card__value">{revenue ? formatCurrency(revenue.arr) : '—'}</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Active Plans</span>
                <span className="sa-settings-stat-card__value">{plans.filter(p => p.isActive).length}</span>
              </div>
            </div>

            {/* Real Plans from subscription API */}
            <div className="sa-settings-group">
              <div className="sa-settings-group__header"><Zap size={12} /><span>Pricing Tiers (Live)</span></div>
              <div className="sa-settings-group__body" style={{ padding: 0 }}>
                {plans.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    No plans configured yet
                  </div>
                ) : (
                  <table className="sa-settings-table">
                    <thead>
                      <tr><th>Plan</th><th>Monthly</th><th>Yearly</th><th>Max Members</th><th>Trial Days</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {plans.map(plan => (
                        <tr key={plan.id}>
                          <td style={{ fontWeight: 600 }}>{plan.displayName || plan.name}</td>
                          <td>{formatCurrency(plan.prices?.monthly || 0)}</td>
                          <td>{formatCurrency(plan.prices?.yearly || 0)}</td>
                          <td>{plan.maxMembers === -1 ? 'Unlimited' : formatNumber(plan.maxMembers)}</td>
                          <td>{plan.trialDays} days</td>
                          <td><span className={`sa__badge ${plan.isActive ? 'sa__badge--green' : 'sa__badge--red'}`}>
                            {plan.isActive ? 'Active' : 'Disabled'}
                          </span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Revenue by Plan (from real data) */}
            {revenue && revenue.planDistribution && Object.keys(revenue.planDistribution).length > 0 && (
              <div className="sa-settings-group">
                <div className="sa-settings-group__header"><BarChart3 size={12} /><span>Subscribers by Plan</span></div>
                <div className="sa-settings-group__body">
                  <div className="sa-settings-stats-grid">
                    {Object.entries(revenue.planDistribution).map(([plan, count]) => (
                      <div key={plan} className="sa-settings-stat-card">
                        <span className="sa-settings-stat-card__label">{plan}</span>
                        <span className="sa-settings-stat-card__value">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--violet"><Users size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">User Management</h2>
            <p className="sa-settings-section__desc">Role-based permissions and account management</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        {isLoading ? <LoadingSpinner /> : (
          <>
            {/* Real user stats */}
            <div className="sa-settings-stats-grid">
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Total Users</span>
                <span className="sa-settings-stat-card__value">{formatNumber(users.length)}</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Owners</span>
                <span className="sa-settings-stat-card__value">
                  {users.filter(u => u.role === 'OWNER').length}
                </span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Active</span>
                <span className="sa-settings-stat-card__value">
                  {users.filter(u => u.status === 'active').length}
                </span>
              </div>
            </div>

            {/* Real users table */}
            <div className="sa-settings-group">
              <div className="sa-settings-group__header"><Users size={12} /><span>User Accounts (Live)</span></div>
              <div className="sa-settings-group__body" style={{ padding: 0 }}>
                {users.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    No users loaded
                  </div>
                ) : (
                  <table className="sa-settings-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Role</th><th>2FA</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 20).map(user => (
                        <tr key={user.id}>
                          <td style={{ fontWeight: 600 }}>{user.name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{user.email}</td>
                          <td><span className="sa__badge sa__badge--blue">{user.role}</span></td>
                          <td>
                            {user.twoFA ? (
                              <span className="sa__badge sa__badge--green">Enabled</span>
                            ) : (
                              <span className="sa__badge sa__badge--gray">Off</span>
                            )}
                          </td>
                          <td>
                            <span className={`sa__badge ${
                              user.status === 'active' ? 'sa__badge--green' :
                              user.status === 'banned' ? 'sa__badge--red' : 'sa__badge--amber'
                            }`}>{user.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Permissions toggles — persisted */}
            <div className="sa-settings-group">
              <div className="sa-settings-group__header"><Shield size={12} /><span>Role Permissions</span></div>
              <div>
                <div className="sa-settings-toggle-row">
                  <div className="sa-settings-toggle-info">
                    <span className="sa-settings-toggle-title">Owner can manage staff</span>
                    <span className="sa-settings-toggle-desc">Allow gym owners to add/remove staff accounts</span>
                  </div>
                  <label className="sa-settings-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="sa-settings-switch__track" /><span className="sa-settings-switch__thumb" />
                  </label>
                </div>
                <div className="sa-settings-toggle-row">
                  <div className="sa-settings-toggle-info">
                    <span className="sa-settings-toggle-title">Owner can export data</span>
                    <span className="sa-settings-toggle-desc">Allow CSV/PDF export of member and financial data</span>
                  </div>
                  <label className="sa-settings-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="sa-settings-switch__track" /><span className="sa-settings-switch__thumb" />
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--blue"><Server size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">System Settings</h2>
            <p className="sa-settings-section__desc">API configurations, email templates, and notification preferences</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Database size={12} /><span>API Configuration</span></div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">Rate Limit (req/min)</label>
                <input className="sa-settings-input" type="number" value={settings.systemConfig.apiRateLimit}
                  onChange={e => updateSystemConfig('apiRateLimit', e.target.value)} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">API Base URL</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input className="sa-settings-input" value={`${window.location.origin}/api`} readOnly style={{ opacity: 0.7, flex: 1 }} />
                  <button onClick={() => handleCopyToClipboard(`${window.location.origin}/api`)}
                    style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Mail size={12} /><span>Email / SMTP Configuration</span></div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">SMTP Host</label>
                <input className="sa-settings-input" value={settings.systemConfig.smtpHost}
                  onChange={e => updateSystemConfig('smtpHost', e.target.value)} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Port</label>
                <input className="sa-settings-input" value={settings.systemConfig.smtpPort}
                  onChange={e => updateSystemConfig('smtpPort', e.target.value)} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Username</label>
                <input className="sa-settings-input" value={settings.systemConfig.smtpUser}
                  onChange={e => updateSystemConfig('smtpUser', e.target.value)} placeholder="your-email@gmail.com" />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Password</label>
                <input className="sa-settings-input" type="password" value={settings.systemConfig.smtpPassword}
                  onChange={e => updateSystemConfig('smtpPassword', e.target.value)} placeholder="••••••••" />
              </div>
              <div className="sa-settings-field sa-settings-field--full">
                <label className="sa-settings-label">From Email Address</label>
                <input className="sa-settings-input" value={settings.systemConfig.fromEmail}
                  onChange={e => updateSystemConfig('fromEmail', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Bell size={12} /><span>Notification Preferences</span></div>
          <div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Welcome Email</span>
                <span className="sa-settings-toggle-desc">Send welcome email on gym owner signup</span>
              </div>
              <label className="sa-settings-switch">
                <input type="checkbox" checked={settings.systemConfig.welcomeEmailEnabled}
                  onChange={e => updateSystemConfig('welcomeEmailEnabled', e.target.checked)} />
                <span className="sa-settings-switch__track" /><span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Payment Reminders</span>
                <span className="sa-settings-toggle-desc">Auto-send 3-day and 1-day reminders before renewal</span>
              </div>
              <label className="sa-settings-switch">
                <input type="checkbox" checked={settings.systemConfig.paymentReminderEnabled}
                  onChange={e => updateSystemConfig('paymentReminderEnabled', e.target.checked)} />
                <span className="sa-settings-switch__track" /><span className="sa-settings-switch__thumb" />
              </label>
            </div>
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Weekly Analytics Report</span>
                <span className="sa-settings-toggle-desc">Send weekly summary to creator admins</span>
              </div>
              <label className="sa-settings-switch">
                <input type="checkbox" checked={settings.systemConfig.weeklyReportEnabled}
                  onChange={e => updateSystemConfig('weeklyReportEnabled', e.target.checked)} />
                <span className="sa-settings-switch__track" /><span className="sa-settings-switch__thumb" />
              </label>
            </div>
          </div>
        </div>
      </div>
      <SaveBar />
    </div>
  );

  const renderSecurity = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--amber"><Shield size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">Security Settings</h2>
            <p className="sa-settings-section__desc">Authentication methods, API keys, and audit logs</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Lock size={12} /><span>Authentication Methods</span></div>
          <div>
            {[
              { key: 'passwordAuth', title: 'Password Authentication', desc: 'Standard email + password login' },
              { key: 'googleAuth', title: 'Google OAuth', desc: 'Sign in with Google account' },
              { key: 'otpAuth', title: 'OTP / SMS Authentication', desc: 'One-time password via SMS' },
              { key: 'twoFactorRequired', title: 'Require 2FA for Owners', desc: 'Force two-factor on all owner accounts' },
            ].map(item => (
              <div key={item.key} className="sa-settings-toggle-row">
                <div className="sa-settings-toggle-info">
                  <span className="sa-settings-toggle-title">{item.title}</span>
                  <span className="sa-settings-toggle-desc">{item.desc}</span>
                </div>
                <label className="sa-settings-switch">
                  <input type="checkbox"
                    checked={(settings.securityConfig as any)[item.key]}
                    onChange={e => updateSecurityConfig(item.key, e.target.checked)} />
                  <span className="sa-settings-switch__track" /><span className="sa-settings-switch__thumb" />
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Activity size={12} /><span>Session Controls</span></div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">Session Timeout (minutes)</label>
                <input className="sa-settings-input" type="number" value={settings.securityConfig.sessionTimeout}
                  onChange={e => updateSecurityConfig('sessionTimeout', e.target.value)} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Max Login Attempts</label>
                <input className="sa-settings-input" type="number" value={settings.securityConfig.maxLoginAttempts}
                  onChange={e => updateSecurityConfig('maxLoginAttempts', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Real Audit Logs */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Eye size={12} /><span>Recent Audit Log (Live)</span></div>
          <div className="sa-settings-group__body" style={{ padding: 0 }}>
            {isLoading ? <LoadingSpinner /> : auditLogs.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                No audit logs available
              </div>
            ) : (
              <table className="sa-settings-table">
                <thead><tr><th>Action</th><th>User</th><th>Target</th><th>Severity</th><th>Time</th></tr></thead>
                <tbody>
                  {auditLogs.slice(0, 10).map(log => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{log.action}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{log.userName}</td>
                      <td>{log.entityName || log.entity}</td>
                      <td><span className={`sa__badge ${
                        log.severity === 'critical' || log.severity === 'high' ? 'sa__badge--red' :
                        log.severity === 'medium' ? 'sa__badge--amber' : 'sa__badge--green'
                      }`}>{log.severity}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                        {new Date(log.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <SaveBar />
    </div>
  );

  const renderAnalytics = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--cyan"><BarChart3 size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">Analytics Dashboard</h2>
            <p className="sa-settings-section__desc">Revenue metrics, user engagement, and system performance</p>
          </div>
        </div>
      </div>
      <div className="sa-settings-section__body">
        {isLoading ? <LoadingSpinner /> : (
          <>
            {/* Revenue from real API */}
            <div className="sa-settings-stats-grid">
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">MRR</span>
                <span className="sa-settings-stat-card__value">{revenue ? formatCurrency(revenue.mrr) : '—'}</span>
                {revenue && revenue.mrrChange !== 0 && (
                  <span className={`sa-settings-stat-card__trend ${revenue.mrrChange > 0 ? 'sa-settings-stat-card__trend--up' : 'sa-settings-stat-card__trend--down'}`}>
                    {revenue.mrrChange > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {revenue.mrrChange > 0 ? '+' : ''}{revenue.mrrChange.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">ARR</span>
                <span className="sa-settings-stat-card__value">{revenue ? formatCurrency(revenue.arr) : '—'}</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Total Users</span>
                <span className="sa-settings-stat-card__value">
                  {analytics ? formatNumber(analytics.health.totalUsers) : dashboard ? formatNumber(Number(dashboard.kpis.totalUsers.value)) : '—'}
                </span>
              </div>
            </div>

            {/* Real engagement stats */}
            {analytics && (
              <div className="sa-settings-group">
                <div className="sa-settings-group__header"><Activity size={12} /><span>Platform Health (Live)</span></div>
                <div className="sa-settings-group__body">
                  <div className="sa-settings-form-grid">
                    <div className="sa-settings-stat-card">
                      <span className="sa-settings-stat-card__label">Total Gyms</span>
                      <span className="sa-settings-stat-card__value">{formatNumber(analytics.health.totalGyms)}</span>
                    </div>
                    <div className="sa-settings-stat-card">
                      <span className="sa-settings-stat-card__label">Active Members</span>
                      <span className="sa-settings-stat-card__value">{formatNumber(analytics.health.activeMembers)}</span>
                    </div>
                    <div className="sa-settings-stat-card">
                      <span className="sa-settings-stat-card__label">Audit Events</span>
                      <span className="sa-settings-stat-card__value">{formatNumber(analytics.health.totalAuditEvents)}</span>
                    </div>
                    <div className="sa-settings-stat-card">
                      <span className="sa-settings-stat-card__label">Security Alerts</span>
                      <span className="sa-settings-stat-card__value" style={{ color: analytics.health.securityAlerts > 0 ? '#ef4444' : '#10b981' }}>
                        {analytics.health.securityAlerts}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System health from dashboard */}
            {dashboard && dashboard.serviceStatus && (
              <div className="sa-settings-group">
                <div className="sa-settings-group__header"><Server size={12} /><span>Service Status (Live)</span></div>
                <div className="sa-settings-group__body" style={{ padding: 0 }}>
                  <table className="sa-settings-table">
                    <thead><tr><th>Service</th><th>Status</th><th>Uptime</th><th>Latency</th></tr></thead>
                    <tbody>
                      {dashboard.serviceStatus.map((svc, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{svc.name}</td>
                          <td><span className={`sa__badge ${
                            svc.status === 'operational' ? 'sa__badge--green' :
                            svc.status === 'degraded' ? 'sa__badge--amber' : 'sa__badge--red'
                          }`}>{svc.status}</span></td>
                          <td>{svc.uptime}%</td>
                          <td style={{ color: 'var(--text-muted)' }}>{svc.latency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="sa-settings-info">
              <Info size={14} />
              <span>
                <strong>Live data:</strong> All metrics shown are fetched from real backend APIs. For interactive charts
                and custom date ranges, visit the dedicated <strong>Analytics</strong> and <strong>Revenue</strong> pages.
              </span>
            </div>
          </>
        )}
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
              <button key={tab.id}
                className={`sa-settings-tab ${isActive ? 'sa-settings-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <div className="sa-settings-tab__icon"
                  style={!isActive ? { background: `${tab.color}18`, color: tab.color } : undefined}>
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
          {loadError && (
            <div className="sa-settings-info" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.06)', marginBottom: 12 }}>
              <Info size={14} style={{ color: '#ef4444' }} />
              <span>Failed to load data: {loadError}. Showing cached/default values.</span>
            </div>
          )}
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}
