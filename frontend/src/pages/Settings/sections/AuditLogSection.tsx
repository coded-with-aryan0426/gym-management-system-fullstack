"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { 
  History, Search, Download, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Loader2, Calendar, User, Activity, Info, Shield, LogIn, LogOut, Clock, Globe,
  Monitor, Smartphone, RefreshCw, Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle,
  Settings, Database, CreditCard, Users, UserPlus, UserMinus, Edit3, Trash2, Plus,
  Key, Lock, Unlock, Mail, Bell, FileText, BarChart3, Wifi, WifiOff, Timer, TrendingUp,
  MapPin, Fingerprint, Server, HardDrive, Zap, AlertCircle
} from "lucide-react"
import api from "../../../services/api"

// Types
type ActionType = 
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'SESSION_START' | 'SESSION_END' | 'SESSION_TIMEOUT'
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'IMPORT'
  | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' | 'MFA_ENABLED' | 'MFA_DISABLED'
  | 'PERMISSION_CHANGE' | 'ROLE_CHANGE' | 'ACCESS_GRANTED' | 'ACCESS_REVOKED'
  | 'PAYMENT_RECEIVED' | 'REFUND_ISSUED' | 'INVOICE_GENERATED'
  | 'MEMBER_CHECKIN' | 'MEMBER_CHECKOUT' | 'MEMBERSHIP_ACTIVATED' | 'MEMBERSHIP_EXPIRED'
  | 'SETTINGS_CHANGE' | 'SYSTEM_CONFIG' | 'BACKUP_CREATED' | 'DATA_EXPORT'
  | 'NOTIFICATION_SENT' | 'EMAIL_SENT' | 'SMS_SENT'
  | 'ERROR' | 'WARNING' | 'SECURITY_ALERT';

type EntityType = 
  | 'USER' | 'MEMBER' | 'TRAINER' | 'STAFF' | 'ADMIN'
  | 'MEMBERSHIP' | 'PAYMENT' | 'INVOICE' | 'CLASS' | 'BOOKING'
  | 'SETTINGS' | 'SYSTEM' | 'SECURITY' | 'NOTIFICATION'
  | 'REPORT' | 'EQUIPMENT' | 'SCHEDULE';

type SeverityLevel = 'info' | 'low' | 'medium' | 'high' | 'critical';

type SessionStatus = 'online' | 'offline' | 'idle' | 'away';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  action: ActionType;
  entity: EntityType;
  entityId?: string;
  entityName?: string;
  details: string;
  changes?: {
    field: string;
    oldValue: string | number | boolean;
    newValue: string | number | boolean;
  }[];
  ipAddress: string;
  location?: string;
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
  sessionId?: string;
  severity: SeverityLevel;
  metadata?: Record<string, any>;
}

interface UserSession {
  id: string;
  odId: string;
  userName: string;
  userRole: string;
  status: SessionStatus;
  loginTime: string;
  lastActivity: string;
  duration: number;
  ipAddress: string;
  location?: string;
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  loginCount: number;
  errorCount: number;
  activeUsers: number;
  avgSessionDuration: number;
  topActions: { action: string; count: number }[];
  securityAlerts: number;
}

interface AuditFilters {
  search: string;
  actions: ActionType[];
  entities: EntityType[];
  severity: SeverityLevel[];
  users: string[];
  dateFrom: string;
  dateTo: string;
}

type TabType = 'activity' | 'sessions' | 'security' | 'analytics';

// Mock data generators
const generateMockLogs = (): AuditLogEntry[] => {
  const actions: { action: ActionType; entity: EntityType; details: string; severity: SeverityLevel }[] = [
    { action: 'LOGIN', entity: 'USER', details: 'User logged in successfully', severity: 'info' },
    { action: 'LOGOUT', entity: 'USER', details: 'User logged out', severity: 'info' },
    { action: 'LOGIN_FAILED', entity: 'SECURITY', details: 'Failed login attempt - invalid password', severity: 'high' },
    { action: 'CREATE', entity: 'MEMBER', details: 'New member registration: John Doe', severity: 'low' },
    { action: 'UPDATE', entity: 'MEMBER', details: 'Member profile updated', severity: 'low' },
    { action: 'DELETE', entity: 'MEMBER', details: 'Member account deleted', severity: 'medium' },
    { action: 'PAYMENT_RECEIVED', entity: 'PAYMENT', details: 'Payment of ₹5,000 received for Premium membership', severity: 'info' },
    { action: 'MEMBERSHIP_ACTIVATED', entity: 'MEMBERSHIP', details: 'Premium membership activated for 12 months', severity: 'info' },
    { action: 'MEMBERSHIP_EXPIRED', entity: 'MEMBERSHIP', details: 'Membership expired for member #1234', severity: 'medium' },
    { action: 'SETTINGS_CHANGE', entity: 'SETTINGS', details: 'Notification settings updated', severity: 'low' },
    { action: 'PASSWORD_CHANGE', entity: 'SECURITY', details: 'User password changed', severity: 'medium' },
    { action: 'PERMISSION_CHANGE', entity: 'SECURITY', details: 'User role changed from Staff to Trainer', severity: 'high' },
    { action: 'MEMBER_CHECKIN', entity: 'MEMBER', details: 'Member check-in at Main Entrance', severity: 'info' },
    { action: 'CREATE', entity: 'CLASS', details: 'New class "Morning Yoga" created', severity: 'low' },
    { action: 'BACKUP_CREATED', entity: 'SYSTEM', details: 'Automated backup completed successfully', severity: 'info' },
    { action: 'SECURITY_ALERT', entity: 'SECURITY', details: 'Multiple failed login attempts detected', severity: 'critical' },
    { action: 'EMAIL_SENT', entity: 'NOTIFICATION', details: 'Bulk email sent to 150 members', severity: 'info' },
    { action: 'REFUND_ISSUED', entity: 'PAYMENT', details: 'Refund of ₹2,500 processed', severity: 'medium' },
  ];

  const users = [
    { id: '1', name: 'Rahul Sharma', role: 'Owner' },
    { id: '2', name: 'Priya Patel', role: 'Admin' },
    { id: '3', name: 'Amit Kumar', role: 'Trainer' },
    { id: '4', name: 'Neha Singh', role: 'Staff' },
    { id: '5', name: 'Vikram Reddy', role: 'Manager' },
  ];

  const devices = [
    { type: 'desktop' as const, browser: 'Chrome 120', os: 'Windows 11' },
    { type: 'mobile' as const, browser: 'Safari 17', os: 'iOS 17' },
    { type: 'tablet' as const, browser: 'Firefox 121', os: 'Android 14' },
    { type: 'desktop' as const, browser: 'Edge 120', os: 'macOS 14' },
  ];

  const locations = ['Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India', 'Pune, India'];

  const logs: AuditLogEntry[] = [];
  const now = new Date();

  for (let i = 0; i < 100; i++) {
    const actionData = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    logs.push({
      id: `log-${i + 1}`,
      timestamp: timestamp.toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: actionData.action,
      entity: actionData.entity,
      details: actionData.details,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      location,
      device,
      sessionId: `session-${Math.floor(Math.random() * 1000)}`,
      severity: actionData.severity,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateMockSessions = (): UserSession[] => {
  const users = [
    { id: '1', name: 'Rahul Sharma', role: 'Owner' },
    { id: '2', name: 'Priya Patel', role: 'Admin' },
    { id: '3', name: 'Amit Kumar', role: 'Trainer' },
    { id: '4', name: 'Neha Singh', role: 'Staff' },
  ];

  const statuses: SessionStatus[] = ['online', 'offline', 'idle', 'away'];
  const devices = [
    { type: 'desktop' as const, browser: 'Chrome 120', os: 'Windows 11' },
    { type: 'mobile' as const, browser: 'Safari 17', os: 'iOS 17' },
  ];

  return users.map((user, index) => ({
    id: `session-${index}`,
    odId: user.id,
    userName: user.name,
    userRole: user.role,
    status: statuses[index % statuses.length],
    loginTime: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
    duration: Math.floor(Math.random() * 480),
    ipAddress: `192.168.1.${100 + index}`,
    location: 'Mumbai, India',
    device: devices[index % devices.length],
  }));
};

const AuditLogSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<AuditFilters>({
    search: '',
    actions: [],
    entities: [],
    severity: [],
    users: [],
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  
  // Stats
  const [stats, setStats] = useState<AuditStats>({
    totalLogs: 0,
    todayLogs: 0,
    loginCount: 0,
    errorCount: 0,
    activeUsers: 0,
    avgSessionDuration: 0,
    topActions: [],
    securityAlerts: 0,
  });

  // Settings
  const [auditSettings, setAuditSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    retentionDays: 90,
    trackLogins: true,
    trackLogouts: true,
    trackPageViews: false,
    trackDataChanges: true,
    trackSecurityEvents: true,
    trackPayments: true,
    alertOnFailedLogins: true,
    failedLoginThreshold: 3,
    alertOnPermissionChanges: true,
    exportFormat: 'csv' as 'csv' | 'json' | 'pdf',
  });

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'activity', label: 'Activity Log', icon: <Activity size={14} /> },
    { id: 'sessions', label: 'User Sessions', icon: <Users size={14} /> },
    { id: 'security', label: 'Security Events', icon: <Shield size={14} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (auditSettings.autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, auditSettings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [auditSettings.autoRefresh, auditSettings.refreshInterval]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from backend
      try {
        const response = await api.get('/audit-logs');
        if (response.data && response.data.length > 0) {
          const mappedLogs = response.data.map((log: any) => ({
            ...log,
            severity: log.severity || 'info',
          }));
          setLogs(mappedLogs);
        } else {
          setLogs(generateMockLogs());
        }
      } catch {
        setLogs(generateMockLogs());
      }
      
      setSessions(generateMockSessions());
      calculateStats();
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const calculateStats = useCallback(() => {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
    const loginLogs = logs.filter(log => log.action === 'LOGIN');
    const errorLogs = logs.filter(log => log.severity === 'high' || log.severity === 'critical');
    const securityLogs = logs.filter(log => log.entity === 'SECURITY' && log.severity !== 'info');
    
    const actionCounts: Record<string, number> = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalLogs: logs.length,
      todayLogs: todayLogs.length,
      loginCount: loginLogs.length,
      errorCount: errorLogs.length,
      activeUsers: sessions.filter(s => s.status === 'online').length,
      avgSessionDuration: sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length || 0,
      topActions,
      securityAlerts: securityLogs.length,
    });
  }, [logs, sessions]);

  useEffect(() => {
    calculateStats();
  }, [logs, sessions, calculateStats]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!log.details.toLowerCase().includes(search) &&
            !log.userName.toLowerCase().includes(search) &&
            !log.action.toLowerCase().includes(search)) {
          return false;
        }
      }
      
      // Action filter
      if (filters.actions.length > 0 && !filters.actions.includes(log.action)) {
        return false;
      }
      
      // Entity filter
      if (filters.entities.length > 0 && !filters.entities.includes(log.entity)) {
        return false;
      }
      
      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(log.severity)) {
        return false;
      }
      
      // Date filter
      if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(log.timestamp) > new Date(filters.dateTo)) {
        return false;
      }
      
      return true;
    });
  }, [logs, filters]);

  // Security logs
  const securityLogs = useMemo(() => {
    return logs.filter(log => 
      log.entity === 'SECURITY' || 
      log.action.includes('LOGIN') || 
      log.action.includes('PASSWORD') ||
      log.action.includes('PERMISSION') ||
      log.severity === 'high' ||
      log.severity === 'critical'
    );
  }, [logs]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getActionIcon = (action: ActionType) => {
    const icons: Record<string, React.ReactNode> = {
      'LOGIN': <LogIn size={14} />,
      'LOGOUT': <LogOut size={14} />,
      'LOGIN_FAILED': <XCircle size={14} />,
      'CREATE': <Plus size={14} />,
      'UPDATE': <Edit3 size={14} />,
      'DELETE': <Trash2 size={14} />,
      'VIEW': <Eye size={14} />,
      'PASSWORD_CHANGE': <Key size={14} />,
      'PASSWORD_RESET': <Lock size={14} />,
      'PERMISSION_CHANGE': <Shield size={14} />,
      'PAYMENT_RECEIVED': <CreditCard size={14} />,
      'REFUND_ISSUED': <CreditCard size={14} />,
      'MEMBER_CHECKIN': <UserPlus size={14} />,
      'MEMBER_CHECKOUT': <UserMinus size={14} />,
      'MEMBERSHIP_ACTIVATED': <CheckCircle2 size={14} />,
      'MEMBERSHIP_EXPIRED': <AlertTriangle size={14} />,
      'SETTINGS_CHANGE': <Settings size={14} />,
      'BACKUP_CREATED': <Database size={14} />,
      'SECURITY_ALERT': <AlertCircle size={14} />,
      'EMAIL_SENT': <Mail size={14} />,
      'NOTIFICATION_SENT': <Bell size={14} />,
    };
    return icons[action] || <Activity size={14} />;
  };

  const getSeverityClass = (severity: SeverityLevel) => {
    const classes: Record<SeverityLevel, string> = {
      'info': 'audit-severity--info',
      'low': 'audit-severity--low',
      'medium': 'audit-severity--medium',
      'high': 'audit-severity--high',
      'critical': 'audit-severity--critical',
    };
    return classes[severity];
  };

  const getSessionStatusClass = (status: SessionStatus) => {
    const classes: Record<SessionStatus, string> = {
      'online': 'session-status--online',
      'offline': 'session-status--offline',
      'idle': 'session-status--idle',
      'away': 'session-status--away',
    };
    return classes[status];
  };

  const getDeviceIcon = (type?: string) => {
    if (type === 'mobile') return <Smartphone size={14} />;
    if (type === 'tablet') return <Smartphone size={14} />;
    return <Monitor size={14} />;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return 'Yesterday';
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportLogs = (format: 'csv' | 'json') => {
    const dataToExport = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      user: log.userName,
      role: log.userRole,
      action: log.action,
      entity: log.entity,
      details: log.details,
      severity: log.severity,
      ipAddress: log.ipAddress,
      location: log.location || '',
      device: log.device ? `${log.device.browser} on ${log.device.os}` : '',
    }));

    if (format === 'csv') {
      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map(row => Object.values(row).map(v => `"${v}"`).join(','));
      const csv = [headers, ...rows].join('\n');
      downloadFile(csv, 'audit-log.csv', 'text/csv');
    } else {
      const json = JSON.stringify(dataToExport, null, 2);
      downloadFile(json, 'audit-log.json', 'application/json');
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="settings-section">
        <div className="settings-loading">
          <Loader2 className="spin" size={24} />
          <span>Loading audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon">
            <History size={20} />
          </div>
          <div>
            <h2 className="settings-section__title">System Audit Log</h2>
            <p className="settings-section__description">
              Track all changes, logins, sessions, and security events
            </p>
          </div>
        </div>
        <div className="audit-header-actions">
          <button 
            className="audit-action-btn"
            onClick={refreshData}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          </button>
          <button 
            className="audit-action-btn"
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <Filter size={14} />
          </button>
          <div className="audit-export-dropdown">
            <button className="settings-save-btn" style={{ background: 'transparent', border: '1px solid var(--settings-border)', color: 'var(--settings-text-secondary)' }}>
              <Download size={14} />
              Export
            </button>
            <div className="audit-export-menu">
              <button onClick={() => exportLogs('csv')}>Export as CSV</button>
              <button onClick={() => exportLogs('json')}>Export as JSON</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="audit-stats-grid">
        <div className="audit-stat-card">
          <div className="audit-stat-icon"><Activity size={16} /></div>
          <div className="audit-stat-content">
            <span className="audit-stat-value">{stats.totalLogs}</span>
            <span className="audit-stat-label">Total Logs</span>
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-icon"><Calendar size={16} /></div>
          <div className="audit-stat-content">
            <span className="audit-stat-value">{stats.todayLogs}</span>
            <span className="audit-stat-label">Today</span>
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--success"><Wifi size={16} /></div>
          <div className="audit-stat-content">
            <span className="audit-stat-value">{stats.activeUsers}</span>
            <span className="audit-stat-label">Online Users</span>
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-icon"><Timer size={16} /></div>
          <div className="audit-stat-content">
            <span className="audit-stat-value">{formatDuration(Math.round(stats.avgSessionDuration))}</span>
            <span className="audit-stat-label">Avg. Session</span>
          </div>
        </div>
        <div className="audit-stat-card">
          <div className="audit-stat-icon audit-stat-icon--warning"><AlertTriangle size={16} /></div>
          <div className="audit-stat-content">
            <span className="audit-stat-value">{stats.securityAlerts}</span>
            <span className="audit-stat-label">Security Alerts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs-wrapper">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section__content">
        {/* Filters Panel */}
        {showFilters && (
          <div className="audit-filters-panel">
            <div className="audit-filters-grid">
              <div className="config-field">
                <label>Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search logs..."
                />
              </div>
              <div className="config-field">
                <label>Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div className="config-field">
                <label>Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
              <div className="config-field">
                <label>Severity</label>
                <select
                  value={filters.severity[0] || ''}
                  onChange={e => setFilters({ ...filters, severity: e.target.value ? [e.target.value as SeverityLevel] : [] })}
                >
                  <option value="">All Severities</option>
                  <option value="info">Info</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <button 
              className="audit-clear-filters"
              onClick={() => setFilters({ search: '', actions: [], entities: [], severity: [], users: [], dateFrom: '', dateTo: '' })}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div className="audit-activity-tab">
            <div className="audit-log-list">
              {paginatedLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`audit-log-item ${expandedLog === log.id ? 'expanded' : ''}`}
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="audit-log-main">
                    <div className={`audit-log-severity ${getSeverityClass(log.severity)}`} />
                    <div className="audit-log-icon">{getActionIcon(log.action)}</div>
                    <div className="audit-log-content">
                      <div className="audit-log-header">
                        <span className="audit-log-user">{log.userName}</span>
                        <span className="audit-log-role">{log.userRole}</span>
                        <span className="audit-log-action">{log.action.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="audit-log-details">{log.details}</p>
                    </div>
                    <div className="audit-log-meta">
                      <span className="audit-log-time">{formatTimestamp(log.timestamp)}</span>
                      {expandedLog === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                  
                  {expandedLog === log.id && (
                    <div className="audit-log-expanded">
                      <div className="audit-log-details-grid">
                        <div className="audit-detail-item">
                          <Globe size={12} />
                          <span className="audit-detail-label">IP Address</span>
                          <span className="audit-detail-value">{log.ipAddress}</span>
                        </div>
                        {log.location && (
                          <div className="audit-detail-item">
                            <MapPin size={12} />
                            <span className="audit-detail-label">Location</span>
                            <span className="audit-detail-value">{log.location}</span>
                          </div>
                        )}
                        {log.device && (
                          <div className="audit-detail-item">
                            {getDeviceIcon(log.device.type)}
                            <span className="audit-detail-label">Device</span>
                            <span className="audit-detail-value">{log.device.browser} / {log.device.os}</span>
                          </div>
                        )}
                        {log.sessionId && (
                          <div className="audit-detail-item">
                            <Fingerprint size={12} />
                            <span className="audit-detail-label">Session ID</span>
                            <span className="audit-detail-value">{log.sessionId}</span>
                          </div>
                        )}
                        <div className="audit-detail-item">
                          <Calendar size={12} />
                          <span className="audit-detail-label">Full Timestamp</span>
                          <span className="audit-detail-value">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {paginatedLogs.length === 0 && (
                <div className="audit-empty-state">
                  <History size={48} />
                  <h3>No logs found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="audit-pagination">
              <span className="audit-pagination-info">
                Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
              </span>
              <div className="audit-pagination-controls">
                <select
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                  className="audit-page-size"
                >
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <button 
                  className="audit-page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="audit-page-number">{page} / {totalPages}</span>
                <button 
                  className="audit-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="audit-sessions-tab">
            <div className="audit-sessions-list">
              {sessions.map(session => (
                <div key={session.id} className="audit-session-card">
                  <div className="audit-session-header">
                    <div className="audit-session-user">
                      <div className="audit-session-avatar">
                        {session.userName.charAt(0)}
                      </div>
                      <div className="audit-session-info">
                        <span className="audit-session-name">{session.userName}</span>
                        <span className="audit-session-role">{session.userRole}</span>
                      </div>
                    </div>
                    <div className={`audit-session-status ${getSessionStatusClass(session.status)}`}>
                      {session.status === 'online' && <Wifi size={10} />}
                      {session.status === 'offline' && <WifiOff size={10} />}
                      {session.status === 'idle' && <Clock size={10} />}
                      {session.status === 'away' && <Eye size={10} />}
                      {session.status}
                    </div>
                  </div>
                  <div className="audit-session-details">
                    <div className="audit-session-detail">
                      <LogIn size={12} />
                      <span>Login: {formatTimestamp(session.loginTime)}</span>
                    </div>
                    <div className="audit-session-detail">
                      <Activity size={12} />
                      <span>Last Activity: {formatTimestamp(session.lastActivity)}</span>
                    </div>
                    <div className="audit-session-detail">
                      <Timer size={12} />
                      <span>Duration: {formatDuration(session.duration)}</span>
                    </div>
                    <div className="audit-session-detail">
                      <Globe size={12} />
                      <span>{session.ipAddress}</span>
                    </div>
                    {session.device && (
                      <div className="audit-session-detail">
                        {getDeviceIcon(session.device.type)}
                        <span>{session.device.browser} / {session.device.os}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="audit-security-tab">
            <div className="form-group">
              <div className="form-group__header">
                <Shield size={16} />
                <h4 className="form-group__title">Security Event Tracking</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><LogIn size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Track Login Events</span>
                    <span className="policy-toggle-row__hint">Log all login attempts and successes</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${auditSettings.trackLogins ? 'policy-toggle--active' : ''}`}
                  onClick={() => setAuditSettings({ ...auditSettings, trackLogins: !auditSettings.trackLogins })}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><LogOut size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Track Logout Events</span>
                    <span className="policy-toggle-row__hint">Log all logout and session end events</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${auditSettings.trackLogouts ? 'policy-toggle--active' : ''}`}
                  onClick={() => setAuditSettings({ ...auditSettings, trackLogouts: !auditSettings.trackLogouts })}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Database size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Track Data Changes</span>
                    <span className="policy-toggle-row__hint">Log all create, update, delete operations</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${auditSettings.trackDataChanges ? 'policy-toggle--active' : ''}`}
                  onClick={() => setAuditSettings({ ...auditSettings, trackDataChanges: !auditSettings.trackDataChanges })}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CreditCard size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Track Payment Events</span>
                    <span className="policy-toggle-row__hint">Log all payment transactions</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${auditSettings.trackPayments ? 'policy-toggle--active' : ''}`}
                  onClick={() => setAuditSettings({ ...auditSettings, trackPayments: !auditSettings.trackPayments })}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-group__header">
                <AlertTriangle size={16} />
                <h4 className="form-group__title">Security Alerts</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><XCircle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Alert on Failed Logins</span>
                    <span className="policy-toggle-row__hint">Notify when multiple login attempts fail</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${auditSettings.alertOnFailedLogins ? 'policy-toggle--active' : ''}`}
                  onClick={() => setAuditSettings({ ...auditSettings, alertOnFailedLogins: !auditSettings.alertOnFailedLogins })}
                />
              </div>
              
              {auditSettings.alertOnFailedLogins && (
                <div className="inline-config">
                  <label>Alert after</label>
                  <input
                    type="number"
                    value={auditSettings.failedLoginThreshold}
                    onChange={e => setAuditSettings({ ...auditSettings, failedLoginThreshold: parseInt(e.target.value) || 3 })}
                    min={1}
                    max={10}
                    className="inline-input"
                  />
                  <span>failed attempts</span>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Alert on Permission Changes</span>
                    <span className="policy-toggle-row__hint">Notify when user roles or permissions change</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${auditSettings.alertOnPermissionChanges ? 'policy-toggle--active' : ''}`}
                  onClick={() => setAuditSettings({ ...auditSettings, alertOnPermissionChanges: !auditSettings.alertOnPermissionChanges })}
                />
              </div>
            </div>

            {/* Recent Security Events */}
            <div className="form-group">
              <div className="form-group__header">
                <Activity size={16} />
                <h4 className="form-group__title">Recent Security Events</h4>
              </div>
              
              <div className="audit-security-events">
                {securityLogs.slice(0, 10).map(log => (
                  <div key={log.id} className={`audit-security-event ${getSeverityClass(log.severity)}`}>
                    <div className="audit-security-event-icon">{getActionIcon(log.action)}</div>
                    <div className="audit-security-event-content">
                      <span className="audit-security-event-action">{log.action.replace(/_/g, ' ')}</span>
                      <span className="audit-security-event-details">{log.details}</span>
                    </div>
                    <div className="audit-security-event-meta">
                      <span>{log.userName}</span>
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="audit-analytics-tab">
            <div className="form-group">
              <div className="form-group__header">
                <TrendingUp size={16} />
                <h4 className="form-group__title">Top Actions</h4>
              </div>
              
              <div className="audit-top-actions">
                {stats.topActions.map((item, index) => (
                  <div key={item.action} className="audit-top-action-item">
                    <span className="audit-top-action-rank">#{index + 1}</span>
                    <span className="audit-top-action-name">{item.action.replace(/_/g, ' ')}</span>
                    <div className="audit-top-action-bar">
                      <div 
                        className="audit-top-action-fill"
                        style={{ width: `${(item.count / stats.topActions[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="audit-top-action-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="form-group__header">
                <Settings size={16} />
                <h4 className="form-group__title">Audit Settings</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><RefreshCw size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Auto Refresh</span>
                    <span className="policy-toggle-row__hint">Automatically refresh logs periodically</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${auditSettings.autoRefresh ? 'policy-toggle--active' : ''}`}
                  onClick={() => setAuditSettings({ ...auditSettings, autoRefresh: !auditSettings.autoRefresh })}
                />
              </div>
              
              {auditSettings.autoRefresh && (
                <div className="inline-config">
                  <label>Refresh every</label>
                  <select
                    value={auditSettings.refreshInterval}
                    onChange={e => setAuditSettings({ ...auditSettings, refreshInterval: parseInt(e.target.value) })}
                    className="inline-input"
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </div>
              )}

              <div className="channel-config-grid" style={{ marginTop: '16px' }}>
                <div className="config-field">
                  <label>Log Retention (Days)</label>
                  <input
                    type="number"
                    value={auditSettings.retentionDays}
                    onChange={e => setAuditSettings({ ...auditSettings, retentionDays: parseInt(e.target.value) || 90 })}
                    min={30}
                    max={365}
                  />
                </div>
                <div className="config-field">
                  <label>Default Export Format</label>
                  <select
                    value={auditSettings.exportFormat}
                    onChange={e => setAuditSettings({ ...auditSettings, exportFormat: e.target.value as 'csv' | 'json' | 'pdf' })}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="policy-toggle-row" style={{ background: 'rgba(255, 255, 255, 0.03)', borderStyle: 'dashed' }}>
              <div className="policy-toggle-row__info">
                <div className="policy-toggle-row__icon"><Info size={16} /></div>
                <div className="policy-toggle-row__text">
                  <span className="policy-toggle-row__label">Data Retention Policy</span>
                  <span className="policy-toggle-row__hint">
                    Audit logs are automatically archived after {auditSettings.retentionDays} days. Contact support for historical data requests.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogSection;
