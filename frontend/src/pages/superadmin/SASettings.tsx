import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  Settings, CreditCard, Users, Server, Shield, BarChart3,
  Save, X, Globe, Bell, Mail, Key, Lock, Eye,
  Copy, RefreshCw, TrendingUp, TrendingDown,
  Activity, Zap, Database, Info,
  ToggleLeft, Loader, AlertTriangle, CheckCircle,
  Wifi, WifiOff
} from 'lucide-react';
import { superAdminApi } from '../../services/superAdminApi';
import { subscriptionApi, type PlanConfig } from '../../services/subscriptionApi';
import { useSuperAdminSSE } from '../../services/useSuperAdminSSE';
import type {
  SuperAdminUser, SuperAdminRevenueData, SuperAdminAnalyticsData,
  SuperAdminAuditLogEntry, SuperAdminDashboardData, SuperAdminFeatureFlag
} from '../../services/superAdminApi';
import './SASettings.css';

// ── Serialization helpers ─────────────────────────────────────────────────────

interface CreatorSettings {
  appName: string; tagline: string; domain: string; logoUrl: string;
  primaryColor: string; maintenanceMode: boolean; signupEnabled: boolean; trialDays: number;
  smtpHost: string; smtpPort: string; smtpUser: string; smtpPassword: string;
  fromEmail: string; apiRateLimit: string;
  welcomeEmailEnabled: boolean; paymentReminderEnabled: boolean; weeklyReportEnabled: boolean;
  passwordAuth: boolean; googleAuth: boolean; otpAuth: boolean;
  twoFactorRequired: boolean; sessionTimeout: string; maxLoginAttempts: string;
  ownerCanManageStaff: boolean; ownerCanExportData: boolean; ownerCanAccessApi: boolean;
}

const DEFAULTS: CreatorSettings = {
  appName: 'AthlonX', tagline: 'Gym Management Platform', domain: 'app.athlonx.com',
  logoUrl: '', primaryColor: '#DC2626', maintenanceMode: false, signupEnabled: true, trialDays: 14,
  smtpHost: 'smtp.gmail.com', smtpPort: '587', smtpUser: '', smtpPassword: '',
  fromEmail: 'noreply@athlonx.com', apiRateLimit: '1000',
  welcomeEmailEnabled: true, paymentReminderEnabled: true, weeklyReportEnabled: false,
  passwordAuth: true, googleAuth: true, otpAuth: false,
  twoFactorRequired: false, sessionTimeout: '30', maxLoginAttempts: '5',
  ownerCanManageStaff: true, ownerCanExportData: true, ownerCanAccessApi: false,
};

function toRecord(s: CreatorSettings): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(s)) out[k] = String(v);
  return out;
}

function fromRecord(raw: Record<string, string>): CreatorSettings {
  const booleans = new Set([
    'maintenanceMode','signupEnabled','welcomeEmailEnabled','paymentReminderEnabled',
    'weeklyReportEnabled','passwordAuth','googleAuth','otpAuth','twoFactorRequired',
    'ownerCanManageStaff','ownerCanExportData','ownerCanAccessApi',
  ]);
  const numbers = new Set(['trialDays']);
  const result = { ...DEFAULTS } as any;
  for (const [k, v] of Object.entries(raw)) {
    if (k in result) {
      if (booleans.has(k)) result[k] = v === 'true';
      else if (numbers.has(k)) result[k] = parseInt(v, 10) || 0;
      else result[k] = v;
    }
  }
  return result as CreatorSettings;
}

// ── Validation ────────────────────────────────────────────────────────────────

type ValidationErrors = Partial<Record<keyof CreatorSettings, string>>;

function validate(s: CreatorSettings): ValidationErrors {
  const errs: ValidationErrors = {};
  if (!s.appName.trim()) errs.appName = 'App name is required';
  if (s.domain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(s.domain))
    errs.domain = 'Invalid domain format';
  if (s.fromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.fromEmail))
    errs.fromEmail = 'Invalid email address';
  if (s.smtpPort && (isNaN(Number(s.smtpPort)) || Number(s.smtpPort) < 1 || Number(s.smtpPort) > 65535))
    errs.smtpPort = 'Port must be 1–65535';
  if (Number(s.apiRateLimit) < 10 || Number(s.apiRateLimit) > 100000)
    errs.apiRateLimit = 'Rate limit must be 10–100,000';
  if (Number(s.sessionTimeout) < 5 || Number(s.sessionTimeout) > 1440)
    errs.sessionTimeout = 'Timeout must be 5–1440 min';
  if (Number(s.maxLoginAttempts) < 1 || Number(s.maxLoginAttempts) > 20)
    errs.maxLoginAttempts = 'Must be 1–20 attempts';
  if (s.trialDays < 0 || s.trialDays > 90)
    errs.trialDays = 'Trial must be 0–90 days';
  return errs;
}

// ── Tab defs ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'app-config',   label: 'App Config',    desc: 'Branding & domain',  icon: Settings,  color: '#f87171' },
  { id: 'subscription', label: 'Subscription',  desc: 'Plans & billing',    icon: CreditCard,color: '#10b981' },
  { id: 'users',        label: 'User Mgmt',     desc: 'Roles & accounts',   icon: Users,     color: '#8b5cf6' },
  { id: 'system',       label: 'System',        desc: 'API & email',        icon: Server,    color: '#3b82f6' },
  { id: 'security',     label: 'Security',      desc: 'Auth & keys',        icon: Shield,    color: '#f59e0b' },
  { id: 'analytics',    label: 'Analytics',     desc: 'Revenue & perf',     icon: BarChart3, color: '#06b6d4' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
const fmtN = (n: number) => new Intl.NumberFormat('en-IN').format(n);

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span style={{ fontSize: 10, color: '#f87171', marginTop: 2 }}>{msg}</span>;
}

function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 8, color: 'var(--text-muted)' }}>
      <Loader size={16} className="sa__refresh-btn--spinning" />{label}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SASettings() {
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('sa_settings_tab') || 'app-config');

  // Settings state
  const [settings, setSettings] = useState<CreatorSettings>({ ...DEFAULTS });
  const [saved, setSaved]       = useState<CreatorSettings>({ ...DEFAULTS });
  const [errors, setErrors]     = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(saved);

  // Live data state
  const [plans, setPlans]         = useState<PlanConfig[]>([]);
  const [users, setUsers]         = useState<SuperAdminUser[]>([]);
  const [revenue, setRevenue]     = useState<SuperAdminRevenueData | null>(null);
  const [analytics, setAnalytics] = useState<SuperAdminAnalyticsData | null>(null);
  const [dashboard, setDashboard] = useState<SuperAdminDashboardData | null>(null);
  const [auditLogs, setAuditLogs] = useState<SuperAdminAuditLogEntry[]>([]);
  const [features, setFeatures]   = useState<SuperAdminFeatureFlag[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError]     = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // SSE for real-time updates
  const { isConnected } = useSuperAdminSSE({
    enabled: true,
    onNewGym: () => {
      if (activeTab === 'users' || activeTab === 'analytics') refreshTab(activeTab);
    },
    onCriticalError: (evt) => {
      toast.error(`Critical: ${evt.data?.message || 'System error'}`, { duration: 8000 });
      if (activeTab === 'analytics') refreshTab('analytics');
    },
    onSecurityAlert: (evt) => {
      toast.error(`Security: ${evt.data?.description || 'Alert detected'}`, { duration: 8000 });
      if (activeTab === 'security') refreshTab('security');
    },
    onSystemWarning: (evt) => {
      toast(`System warning: ${evt.data?.message || ''}`, { icon: '⚠️' });
    },
  });

  // ── Persist active tab ──
  useEffect(() => { sessionStorage.setItem('sa_settings_tab', activeTab); }, [activeTab]);

  // ── Load creator settings from backend on mount ──
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const raw = await superAdminApi.getCreatorSettings();
        const loaded = fromRecord(raw);
        setSettings(loaded);
        setSaved(loaded);
      } catch (e: any) {
        // If 404 or empty, keep defaults — first time setup
        if (!e?.response || e.response.status !== 401) {
          console.info('No creator settings found, using defaults');
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Load tab-specific live data ──
  const refreshTab = useCallback(async (tab: string) => {
    setTabLoading(true);
    setTabError(null);
    try {
      switch (tab) {
        case 'subscription': {
          const [plansRes, revRes] = await Promise.all([
            subscriptionApi.getAllPlans().catch(() => ({ data: [] as PlanConfig[] })),
            superAdminApi.getRevenue().catch(() => null),
          ]);
          setPlans(plansRes.data || []);
          if (revRes) setRevenue(revRes);
          break;
        }
        case 'users': {
          const [usersData, dashData] = await Promise.all([
            superAdminApi.getUsers().catch(() => [] as SuperAdminUser[]),
            superAdminApi.getDashboard().catch(() => null),
          ]);
          setUsers(usersData);
          if (dashData) setDashboard(dashData);
          break;
        }
        case 'security': {
          const [logs, flags] = await Promise.all([
            superAdminApi.getAuditLogs(15).catch(() => [] as SuperAdminAuditLogEntry[]),
            superAdminApi.getFeatureFlags().catch(() => [] as SuperAdminFeatureFlag[]),
          ]);
          setAuditLogs(logs);
          setFeatures(flags);
          break;
        }
        case 'analytics': {
          const [revRes, anRes, dashData] = await Promise.all([
            superAdminApi.getRevenue().catch(() => null),
            superAdminApi.getAnalytics().catch(() => null),
            superAdminApi.getDashboard().catch(() => null),
          ]);
          if (revRes) setRevenue(revRes);
          if (anRes) setAnalytics(anRes);
          if (dashData) setDashboard(dashData);
          break;
        }
      }
    } catch (e: any) {
      setTabError(e?.message || 'Failed to load data');
    } finally {
      setTabLoading(false);
    }
  }, []);

  useEffect(() => {
    if (['subscription','users','security','analytics'].includes(activeTab)) {
      refreshTab(activeTab);
    }
  }, [activeTab, refreshTab]);

  // ── Setting mutations ──
  const set = useCallback(<K extends keyof CreatorSettings>(key: K, value: CreatorSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  }, []);

  // ── Save to backend ──
  const handleSave = useCallback(async () => {
    const errs = validate(settings);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix validation errors before saving');
      return;
    }
    setIsSaving(true);
    try {
      await superAdminApi.saveCreatorSettings(toRecord(settings));
      setSaved({ ...settings });
      toast.success('Settings saved to database');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const handleDiscard = useCallback(() => {
    setSettings({ ...saved });
    setErrors({});
    toast('Changes discarded', { icon: '↩️' });
  }, [saved]);

  // ── User actions ──
  const handleBanUser = useCallback(async (userId: number, currentStatus: string) => {
    const key = `user-${userId}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      if (currentStatus === 'banned') {
        await superAdminApi.unbanUser(userId);
        toast.success('User unbanned successfully');
      } else {
        await superAdminApi.banUser(userId, 'Banned by creator admin');
        toast.success('User banned successfully');
      }
      await refreshTab('users');
    } catch (e: any) {
      toast.error(e?.message || 'Action failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [refreshTab]);

  // ── Feature flag toggle ──
  const handleFeatureToggle = useCallback(async (flag: SuperAdminFeatureFlag) => {
    const key = `flag-${flag.key}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      await superAdminApi.updateFeatureFlag(flag.key, { enabled: !flag.enabled });
      setFeatures(prev => prev.map(f => f.key === flag.key ? { ...f, enabled: !f.enabled } : f));
      toast.success(`${flag.name} ${!flag.enabled ? 'enabled' : 'disabled'}`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update feature flag');
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied!'))
      .catch(() => toast.error('Copy failed'));
  }, []);

  // ── Reusable UI parts ──
  const SaveBar = () => hasChanges ? (
    <div className="sa-settings-save-bar">
      <button className="sa-settings-cancel-btn" onClick={handleDiscard} disabled={isSaving}>
        <X size={13} /> Discard
      </button>
      <button className="sa-settings-save-btn" onClick={handleSave} disabled={isSaving}>
        {isSaving
          ? <><RefreshCw size={13} className="sa__refresh-btn--spinning" /> Saving to DB...</>
          : <><Save size={13} /> Save to Database</>}
      </button>
    </div>
  ) : null;

  const Toggle = ({ field }: { field: keyof CreatorSettings }) => (
    <label className="sa-settings-switch">
      <input type="checkbox" checked={Boolean(settings[field])}
        onChange={e => set(field, e.target.checked as any)} />
      <span className="sa-settings-switch__track" />
      <span className="sa-settings-switch__thumb" />
    </label>
  );

  // ── Section: App Config ──
  const renderAppConfig = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--red"><Settings size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">Application Configuration</h2>
            <p className="sa-settings-section__desc">Branding, domain, and platform controls — saved to database</p>
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
                <input className={`sa-settings-input ${errors.appName ? 'sa-settings-input--error' : ''}`}
                  value={settings.appName} onChange={e => set('appName', e.target.value)} />
                <FieldError msg={errors.appName} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Tagline</label>
                <input className="sa-settings-input" value={settings.tagline}
                  onChange={e => set('tagline', e.target.value)} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Custom Domain</label>
                <input className={`sa-settings-input ${errors.domain ? 'sa-settings-input--error' : ''}`}
                  value={settings.domain} onChange={e => set('domain', e.target.value)}
                  placeholder="app.yourdomain.com" />
                <FieldError msg={errors.domain} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Brand Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={settings.primaryColor}
                    onChange={e => set('primaryColor', e.target.value)}
                    style={{ width: 32, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
                  <input className="sa-settings-input" value={settings.primaryColor}
                    onChange={e => set('primaryColor', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
              <div className="sa-settings-field sa-settings-field--full">
                <label className="sa-settings-label">Logo URL</label>
                <input className="sa-settings-input" value={settings.logoUrl}
                  onChange={e => set('logoUrl', e.target.value)} placeholder="https://yourdomain.com/logo.svg" />
              </div>
            </div>
          </div>
        </div>

        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><ToggleLeft size={12} /><span>Platform Controls</span></div>
          <div>
            {[
              { field: 'maintenanceMode' as const, title: 'Maintenance Mode', desc: 'Show maintenance page to all users — applies immediately' },
              { field: 'signupEnabled' as const,   title: 'Allow New Signups',  desc: 'Enable gym owner self-registration' },
            ].map(item => (
              <div key={item.field} className="sa-settings-toggle-row">
                <div className="sa-settings-toggle-info">
                  <span className="sa-settings-toggle-title">{item.title}</span>
                  <span className="sa-settings-toggle-desc">{item.desc}</span>
                </div>
                <Toggle field={item.field} />
              </div>
            ))}
            <div className="sa-settings-toggle-row">
              <div className="sa-settings-toggle-info">
                <span className="sa-settings-toggle-title">Default Trial Period</span>
                <span className="sa-settings-toggle-desc">Days given to new signups (0–90)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <input className="sa-settings-input" type="number" value={settings.trialDays}
                  onChange={e => set('trialDays', parseInt(e.target.value) || 0)}
                  style={{ width: 72, textAlign: 'center' }} min={0} max={90} />
                <FieldError msg={errors.trialDays} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <SaveBar />
    </div>
  );

  // ── Section: Subscription ──
  const renderSubscription = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--emerald"><CreditCard size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">Subscription & Billing Management</h2>
            <p className="sa-settings-section__desc">Live pricing tiers and revenue analytics from database</p>
          </div>
        </div>
        <button className="sa-settings-cancel-btn" onClick={() => refreshTab('subscription')} disabled={tabLoading}>
          <RefreshCw size={12} className={tabLoading ? 'sa__refresh-btn--spinning' : ''} /> Refresh
        </button>
      </div>
      <div className="sa-settings-section__body">
        {tabLoading ? <LoadingSpinner /> : (
          <>
            <div className="sa-settings-stats-grid">
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Monthly Recurring Revenue</span>
                <span className="sa-settings-stat-card__value">{revenue ? fmt(revenue.mrr) : '—'}</span>
                {revenue?.mrrChange !== 0 && revenue && (
                  <span className={`sa-settings-stat-card__trend ${(revenue.mrrChange ?? 0) > 0 ? 'sa-settings-stat-card__trend--up' : 'sa-settings-stat-card__trend--down'}`}>
                    {(revenue.mrrChange ?? 0) > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {(revenue.mrrChange ?? 0) > 0 ? '+' : ''}{(revenue.mrrChange ?? 0).toFixed(1)}% vs last month
                  </span>
                )}
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Annual Run Rate</span>
                <span className="sa-settings-stat-card__value">{revenue ? fmt(revenue.arr) : '—'}</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Active Plans</span>
                <span className="sa-settings-stat-card__value">{plans.filter(p => p.isActive).length}</span>
              </div>
            </div>

            <div className="sa-settings-group">
              <div className="sa-settings-group__header"><Zap size={12} /><span>Pricing Tiers — Live from DB</span></div>
              <div style={{ padding: 0 }}>
                {plans.length === 0
                  ? <p style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No plans found</p>
                  : (
                    <table className="sa-settings-table">
                      <thead><tr><th>Plan</th><th>Monthly</th><th>Yearly</th><th>Max Members</th><th>Trial</th><th>Status</th></tr></thead>
                      <tbody>
                        {plans.map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>{p.displayName || p.name}</td>
                            <td>{fmt(p.prices?.monthly || 0)}</td>
                            <td>{fmt(p.prices?.yearly || 0)}</td>
                            <td>{p.maxMembers === -1 ? 'Unlimited' : fmtN(p.maxMembers)}</td>
                            <td>{p.trialDays}d</td>
                            <td><span className={`sa__badge ${p.isActive ? 'sa__badge--green' : 'sa__badge--red'}`}>{p.isActive ? 'Active' : 'Off'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>

            {revenue?.planDistribution && Object.keys(revenue.planDistribution).length > 0 && (
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

  // ── Section: Users ──
  const renderUsers = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--violet"><Users size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">User Management</h2>
            <p className="sa-settings-section__desc">Live user list with ban/unban actions</p>
          </div>
        </div>
        <button className="sa-settings-cancel-btn" onClick={() => refreshTab('users')} disabled={tabLoading}>
          <RefreshCw size={12} className={tabLoading ? 'sa__refresh-btn--spinning' : ''} /> Refresh
        </button>
      </div>
      <div className="sa-settings-section__body">
        {tabLoading ? <LoadingSpinner /> : (
          <>
            <div className="sa-settings-stats-grid">
              {[
                { label: 'Total Users',  value: fmtN(users.length) },
                { label: 'Owners',       value: users.filter(u => u.role === 'OWNER').length },
                { label: 'Active',       value: users.filter(u => u.status === 'active').length },
              ].map(s => (
                <div key={s.label} className="sa-settings-stat-card">
                  <span className="sa-settings-stat-card__label">{s.label}</span>
                  <span className="sa-settings-stat-card__value">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="sa-settings-group">
              <div className="sa-settings-group__header"><Users size={12} /><span>User Accounts — Live</span></div>
              <div style={{ padding: 0 }}>
                {users.length === 0
                  ? <p style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No users</p>
                  : (
                    <table className="sa-settings-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>2FA</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {users.slice(0, 20).map(u => {
                          const loading = actionLoading[`user-${u.id}`];
                          return (
                            <tr key={u.id}>
                              <td style={{ fontWeight: 600 }}>{u.name}</td>
                              <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{u.email}</td>
                              <td><span className="sa__badge sa__badge--blue">{u.role}</span></td>
                              <td>{u.twoFA ? <span className="sa__badge sa__badge--green">On</span> : <span className="sa__badge sa__badge--gray">Off</span>}</td>
                              <td>
                                <span className={`sa__badge ${u.status === 'active' ? 'sa__badge--green' : u.status === 'banned' ? 'sa__badge--red' : 'sa__badge--amber'}`}>
                                  {u.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => handleBanUser(u.id, u.status)}
                                  disabled={loading}
                                  style={{
                                    padding: '3px 8px', borderRadius: 5, border: '1px solid',
                                    fontSize: 10, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                                    background: 'transparent',
                                    borderColor: u.status === 'banned' ? '#10b981' : '#ef4444',
                                    color: u.status === 'banned' ? '#10b981' : '#ef4444',
                                    opacity: loading ? 0.5 : 1,
                                  }}
                                >
                                  {loading ? '...' : u.status === 'banned' ? 'Unban' : 'Ban'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>

            <div className="sa-settings-group">
              <div className="sa-settings-group__header"><Shield size={12} /><span>Role Permissions — Persisted</span></div>
              <div>
                {([
                  { field: 'ownerCanManageStaff' as const, title: 'Owner can manage staff', desc: 'Allow gym owners to add/remove staff' },
                  { field: 'ownerCanExportData'  as const, title: 'Owner can export data',   desc: 'Allow CSV/PDF export of member and financial data' },
                  { field: 'ownerCanAccessApi'   as const, title: 'Owner can access API',     desc: 'Enable API access for enterprise plan owners' },
                ] as const).map(item => (
                  <div key={item.field} className="sa-settings-toggle-row">
                    <div className="sa-settings-toggle-info">
                      <span className="sa-settings-toggle-title">{item.title}</span>
                      <span className="sa-settings-toggle-desc">{item.desc}</span>
                    </div>
                    <Toggle field={item.field} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <SaveBar />
    </div>
  );

  // ── Section: System ──
  const renderSystem = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--blue"><Server size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">System Settings</h2>
            <p className="sa-settings-section__desc">API, email, and notification configuration — saved to database</p>
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
                <input className={`sa-settings-input ${errors.apiRateLimit ? 'sa-settings-input--error' : ''}`}
                  type="number" value={settings.apiRateLimit}
                  onChange={e => set('apiRateLimit', e.target.value)} />
                <FieldError msg={errors.apiRateLimit} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">API Base URL (read-only)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="sa-settings-input" value={`${window.location.protocol}//${window.location.hostname}:8080/api`}
                    readOnly style={{ flex: 1, opacity: 0.6 }} />
                  <button onClick={() => handleCopy(`${window.location.protocol}//${window.location.hostname}:8080/api`)}
                    style={{ padding: '0 8px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)' }}>
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
                <input className="sa-settings-input" value={settings.smtpHost}
                  onChange={e => set('smtpHost', e.target.value)} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Port</label>
                <input className={`sa-settings-input ${errors.smtpPort ? 'sa-settings-input--error' : ''}`}
                  type="number" value={settings.smtpPort}
                  onChange={e => set('smtpPort', e.target.value)} />
                <FieldError msg={errors.smtpPort} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Username</label>
                <input className="sa-settings-input" value={settings.smtpUser}
                  onChange={e => set('smtpUser', e.target.value)} placeholder="your-email@gmail.com" />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Password</label>
                <input className="sa-settings-input" type="password" value={settings.smtpPassword}
                  onChange={e => set('smtpPassword', e.target.value)} placeholder="••••••••" />
              </div>
              <div className="sa-settings-field sa-settings-field--full">
                <label className="sa-settings-label">From Address</label>
                <input className={`sa-settings-input ${errors.fromEmail ? 'sa-settings-input--error' : ''}`}
                  value={settings.fromEmail} onChange={e => set('fromEmail', e.target.value)} />
                <FieldError msg={errors.fromEmail} />
              </div>
            </div>
          </div>
        </div>

        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Bell size={12} /><span>Notification Preferences</span></div>
          <div>
            {[
              { field: 'welcomeEmailEnabled'      as const, title: 'Welcome Email',         desc: 'Send welcome email on gym owner signup' },
              { field: 'paymentReminderEnabled'   as const, title: 'Payment Reminders',     desc: 'Auto-send 3-day and 1-day reminders before renewal' },
              { field: 'weeklyReportEnabled'      as const, title: 'Weekly Analytics Report', desc: 'Send weekly summary to creator admins' },
            ].map(item => (
              <div key={item.field} className="sa-settings-toggle-row">
                <div className="sa-settings-toggle-info">
                  <span className="sa-settings-toggle-title">{item.title}</span>
                  <span className="sa-settings-toggle-desc">{item.desc}</span>
                </div>
                <Toggle field={item.field} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <SaveBar />
    </div>
  );

  // ── Section: Security ──
  const renderSecurity = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--amber"><Shield size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">Security Settings</h2>
            <p className="sa-settings-section__desc">Auth methods, session controls, feature flags, and live audit log</p>
          </div>
        </div>
        <button className="sa-settings-cancel-btn" onClick={() => refreshTab('security')} disabled={tabLoading}>
          <RefreshCw size={12} className={tabLoading ? 'sa__refresh-btn--spinning' : ''} /> Refresh
        </button>
      </div>
      <div className="sa-settings-section__body">
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Lock size={12} /><span>Authentication Methods — Persisted</span></div>
          <div>
            {[
              { field: 'passwordAuth'     as const, title: 'Password Authentication',  desc: 'Standard email + password login' },
              { field: 'googleAuth'       as const, title: 'Google OAuth',              desc: 'Sign in with Google account' },
              { field: 'otpAuth'          as const, title: 'OTP / SMS Authentication',  desc: 'One-time password via SMS' },
              { field: 'twoFactorRequired'as const, title: 'Require 2FA for Owners',    desc: 'Force two-factor on all owner accounts' },
            ].map(item => (
              <div key={item.field} className="sa-settings-toggle-row">
                <div className="sa-settings-toggle-info">
                  <span className="sa-settings-toggle-title">{item.title}</span>
                  <span className="sa-settings-toggle-desc">{item.desc}</span>
                </div>
                <Toggle field={item.field} />
              </div>
            ))}
          </div>
        </div>

        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Activity size={12} /><span>Session Controls — Persisted</span></div>
          <div className="sa-settings-group__body">
            <div className="sa-settings-form-grid">
              <div className="sa-settings-field">
                <label className="sa-settings-label">Session Timeout (minutes)</label>
                <input className={`sa-settings-input ${errors.sessionTimeout ? 'sa-settings-input--error' : ''}`}
                  type="number" value={settings.sessionTimeout}
                  onChange={e => set('sessionTimeout', e.target.value)} />
                <FieldError msg={errors.sessionTimeout} />
              </div>
              <div className="sa-settings-field">
                <label className="sa-settings-label">Max Login Attempts</label>
                <input className={`sa-settings-input ${errors.maxLoginAttempts ? 'sa-settings-input--error' : ''}`}
                  type="number" value={settings.maxLoginAttempts}
                  onChange={e => set('maxLoginAttempts', e.target.value)} />
                <FieldError msg={errors.maxLoginAttempts} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Feature Flags */}
        {features.length > 0 && (
          <div className="sa-settings-group">
            <div className="sa-settings-group__header"><Key size={12} /><span>Feature Flags — Live (real API)</span></div>
            <div>
              {features.map(flag => {
                const loading = actionLoading[`flag-${flag.key}`];
                return (
                  <div key={flag.key} className="sa-settings-toggle-row">
                    <div className="sa-settings-toggle-info">
                      <span className="sa-settings-toggle-title">
                        {flag.name}
                        {flag.critical && <span style={{ marginLeft: 6, fontSize: 9, color: '#f87171', fontWeight: 700, textTransform: 'uppercase' }}>critical</span>}
                      </span>
                      <span className="sa-settings-toggle-desc">{flag.description} — {flag.rolloutPercentage}% rollout</span>
                    </div>
                    {loading
                      ? <Loader size={14} className="sa__refresh-btn--spinning" style={{ color: 'var(--text-muted)' }} />
                      : (
                        <label className="sa-settings-switch">
                          <input type="checkbox" checked={flag.enabled}
                            onChange={() => handleFeatureToggle(flag)} />
                          <span className="sa-settings-switch__track" />
                          <span className="sa-settings-switch__thumb" />
                        </label>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Audit Log */}
        <div className="sa-settings-group">
          <div className="sa-settings-group__header"><Eye size={12} /><span>Recent Audit Log — Live from DB</span></div>
          <div style={{ padding: 0 }}>
            {tabLoading ? <LoadingSpinner label="Loading audit logs..." /> : auditLogs.length === 0
              ? <p style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No audit logs</p>
              : (
                <table className="sa-settings-table">
                  <thead><tr><th>Action</th><th>User</th><th>Target</th><th>Severity</th><th>Time</th></tr></thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 600 }}>{log.action}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{log.userName}</td>
                        <td>{log.entityName || log.entity}</td>
                        <td>
                          <span className={`sa__badge ${log.severity === 'critical' || log.severity === 'high' ? 'sa__badge--red' : log.severity === 'medium' ? 'sa__badge--amber' : 'sa__badge--green'}`}>
                            {log.severity}
                          </span>
                        </td>
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

  // ── Section: Analytics ──
  const renderAnalytics = () => (
    <div className="sa-settings-section">
      <div className="sa-settings-section__header">
        <div className="sa-settings-section__title-group">
          <div className="sa-settings-section__icon sa-settings-section__icon--cyan"><BarChart3 size={16} /></div>
          <div>
            <h2 className="sa-settings-section__title">Analytics Overview</h2>
            <p className="sa-settings-section__desc">Live revenue, platform health, and service status from backend</p>
          </div>
        </div>
        <button className="sa-settings-cancel-btn" onClick={() => refreshTab('analytics')} disabled={tabLoading}>
          <RefreshCw size={12} className={tabLoading ? 'sa__refresh-btn--spinning' : ''} /> Refresh
        </button>
      </div>
      <div className="sa-settings-section__body">
        {tabLoading ? <LoadingSpinner /> : (
          <>
            <div className="sa-settings-stats-grid">
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">MRR</span>
                <span className="sa-settings-stat-card__value">{revenue ? fmt(revenue.mrr) : '—'}</span>
                {revenue?.mrrChange !== undefined && (
                  <span className={`sa-settings-stat-card__trend ${(revenue.mrrChange ?? 0) > 0 ? 'sa-settings-stat-card__trend--up' : 'sa-settings-stat-card__trend--down'}`}>
                    {(revenue.mrrChange ?? 0) > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {(revenue.mrrChange ?? 0).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">ARR</span>
                <span className="sa-settings-stat-card__value">{revenue ? fmt(revenue.arr) : '—'}</span>
              </div>
              <div className="sa-settings-stat-card">
                <span className="sa-settings-stat-card__label">Total Users</span>
                <span className="sa-settings-stat-card__value">
                  {analytics ? fmtN(analytics.health.totalUsers) : '—'}
                </span>
              </div>
            </div>

            {analytics && (
              <div className="sa-settings-group">
                <div className="sa-settings-group__header"><Activity size={12} /><span>Platform Health — Live</span></div>
                <div className="sa-settings-group__body">
                  <div className="sa-settings-form-grid">
                    {[
                      { label: 'Total Gyms',     value: fmtN(analytics.health.totalGyms) },
                      { label: 'Active Members', value: fmtN(analytics.health.activeMembers) },
                      { label: 'Audit Events',   value: fmtN(analytics.health.totalAuditEvents) },
                      { label: 'Security Alerts',value: analytics.health.securityAlerts, alert: analytics.health.securityAlerts > 0 },
                    ].map(s => (
                      <div key={s.label} className="sa-settings-stat-card">
                        <span className="sa-settings-stat-card__label">{s.label}</span>
                        <span className="sa-settings-stat-card__value" style={s.alert ? { color: '#ef4444' } : undefined}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {dashboard?.serviceStatus && dashboard.serviceStatus.length > 0 && (
              <div className="sa-settings-group">
                <div className="sa-settings-group__header"><Server size={12} /><span>Service Status — Live</span></div>
                <div style={{ padding: 0 }}>
                  <table className="sa-settings-table">
                    <thead><tr><th>Service</th><th>Status</th><th>Uptime</th><th>Latency</th></tr></thead>
                    <tbody>
                      {dashboard.serviceStatus.map((svc, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{svc.name}</td>
                          <td><span className={`sa__badge ${svc.status === 'operational' ? 'sa__badge--green' : svc.status === 'degraded' ? 'sa__badge--amber' : 'sa__badge--red'}`}>{svc.status}</span></td>
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
              <span>All metrics fetched live from backend. For interactive charts, visit the <strong>Analytics</strong> and <strong>Revenue</strong> pages.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeTab) {
      case 'app-config':   return renderAppConfig();
      case 'subscription': return renderSubscription();
      case 'users':        return renderUsers();
      case 'system':       return renderSystem();
      case 'security':     return renderSecurity();
      case 'analytics':    return renderAnalytics();
      default:             return renderAppConfig();
    }
  };

  if (isLoading) {
    return (
      <div className="sa">
        <div className="sa__header"><div className="sa__header-left"><h1>Creator Settings</h1></div></div>
        <LoadingSpinner label="Loading settings from database..." />
      </div>
    );
  }

  return (
    <div className="sa">
      <div className="sa__header">
        <div className="sa__header-left">
          <h1>Creator Settings</h1>
          <p>All changes persist to database · SSE connected for real-time alerts</p>
        </div>
        <div className="sa__header-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* SSE connection indicator */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: isConnected ? '#10b981' : 'var(--text-muted)' }}>
            {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isConnected ? 'Live' : 'Offline'}
          </span>
          {hasChanges && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#fbbf24' }}>
              <AlertTriangle size={13} /> Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Tab error banner */}
      {tabError && (
        <div className="sa-settings-info" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', marginBottom: 12 }}>
          <Info size={14} style={{ color: '#ef4444' }} />
          <span>Failed to load data: {tabError} — <button onClick={() => refreshTab(activeTab)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Retry</button></span>
        </div>
      )}

      <div className="sa-settings-layout">
        <aside className="sa-settings-sidebar">
          {TABS.map(tab => {
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
        <main className="sa-settings-content">{renderSection()}</main>
      </div>
    </div>
  );
}
