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

type SeverityLevel = 'info' | 'info' | 'low' | 'medium' | 'high' | 'critical';

type SessionStatus = 'online' | 'offline' | 'idle' | 'away';

// Component to display field-level changes
const FieldChangesDisplay: React.FC<{ changes: any[] | Record<string, any> }> = ({ changes }) => {
  const renderFieldChange = (fieldName: string, change: any) => {
    const isSensitive = change.sensitive || fieldName.toLowerCase().includes('password') || fieldName.toLowerCase().includes('secret');
    
    return (
      <div key={fieldName} className={`audit-field-change ${change.changed ? 'audit-field-change--modified' : ''} ${isSensitive ? 'audit-field-change--sensitive' : ''}`}>
        <div className="audit-field-change-header">
          <span className="audit-field-name">{fieldName}</span>
          {change.type && <span className="audit-field-type">({change.type})</span>}
          {isSensitive && <span className="audit-sensitive-badge">SENSITIVE</span>}
        </div>
        <div className="audit-field-change-values">
          <div className="audit-field-value audit-field-value--old">
            <span className="audit-value-label">Old:</span>
            <span className="audit-value-content">
              {isSensitive ? '***MASKED***' : (change.oldValue ?? 'null')}
            </span>
          </div>
          <div className="audit-field-value audit-field-value--new">
            <span className="audit-value-label">New:</span>
            <span className="audit-value-content">
              {isSensitive ? '***MASKED***' : (change.newValue ?? 'null')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Handle different change formats
  if (Array.isArray(changes)) {
    return (
      <div className="audit-field-changes-list">
        {changes.map((change, index) => renderFieldChange(change.field || `field_${index}`, change))}
      </div>
    );
  } else if (typeof changes === 'object') {
    // Handle object format where keys are field names
    return (
      <div className="audit-field-changes-list">
        {Object.entries(changes).map(([fieldName, change]) => {
          if (typeof change === 'object' && change !== null) {
            return renderFieldChange(fieldName, change);
          } else {
            // Handle simple key-value format
            return renderFieldChange(fieldName, { oldValue: change, newValue: change, changed: true });
          }
        })}
      </div>
    );
  }
  
  return (
    <div className="audit-field-changes-empty">
      <span className="audit-changes-empty-text">No detailed changes available</span>
    </div>
  );
};

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
    type?: string;
    changed?: boolean;
    sensitive?: boolean;
  }[] | Record<string, any>;
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
  executionTime?: number;
  requestId?: string;
  businessContext?: {
    operation: string;
    impact: string;
    affectedEntities: string[];
  };
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
      
      // Get gym ID from localStorage or context
      const gymId = localStorage.getItem('activeGymId') || '41';
      
        // Fetch audit logs
        try {
          const logsResponse = await api.get(`/audit-logs?gymId=${gymId}&page=${page - 1}&size=${itemsPerPage}&includeChanges=true&includeMetrics=true`);
          if (logsResponse.data && logsResponse.data.logs && logsResponse.data.logs.length > 0) {
            const mappedLogs = logsResponse.data.logs.map((log: any) => ({
              id: log.id?.toString() || `log-${Math.random()}`,
              timestamp: log.timestamp,
              userId: log.userId?.toString() || '',
              userName: log.userName || 'Unknown',
              userRole: log.userRole || 'Unknown',
              userAvatar: log.userAvatar,
              action: log.action || 'UNKNOWN',
              entity: log.entity || 'SYSTEM',
              entityId: log.entityId,
              entityName: log.entityName,
              details: log.details || '',
              changes: log.changes ? (() => {
                try {
                  return JSON.parse(log.changes);
                } catch {
                  // Handle Java Map.toString() format like {key=value}
                  return { raw: log.changes };
                }
              })() : undefined,
              ipAddress: log.ipAddress || 'Unknown',
              location: log.location,
              device: log.deviceType ? {
                type: log.deviceType,
                browser: log.browser || 'Unknown',
                os: log.os || 'Unknown'
              } : undefined,
              sessionId: log.sessionId,
              severity: log.severity || 'info',
              metadata: log.metadata ? (() => {
                try {
                  return JSON.parse(log.metadata);
                } catch {
                  return { raw: log.metadata };
                }
              })() : undefined,
              // Enhanced audit log fields
              executionTime: log.executionTime || log.execution_time,
              requestId: log.requestId || log.request_id,
              businessContext: log.businessContext || log.business_context ? (() => {
                try {
                  return JSON.parse(log.businessContext || log.business_context);
                } catch {
                  return log.businessContext || log.business_context;
                }
              })() : undefined,
            }));
            setLogs(mappedLogs);
          } else {
            // No logs from API - show empty state
            setLogs([]);
          }
        } catch (err) {
          console.error('Failed to fetch audit logs:', err);
          // API failed - show empty state instead of mock data
          setLogs([]);
        }
      
        // Fetch user sessions
        try {
          const sessionsResponse = await api.get(`/audit-logs/sessions?gymId=${gymId}`);
          if (sessionsResponse.data && sessionsResponse.data.length > 0) {
            const mappedSessions = sessionsResponse.data.map((session: any) => ({
              id: session.id?.toString() || `session-${Math.random()}`,
              odId: session.userId?.toString() || '',
              userName: session.userName || 'Unknown',
              userRole: session.userRole || 'Unknown',
              status: session.status || 'offline',
              loginTime: session.loginTime,
              lastActivity: session.lastActivityTime || session.loginTime,
              duration: typeof session.duration === 'string' ? parseDuration(session.duration) : (session.duration || 0),
              ipAddress: session.ipAddress || 'Unknown',
              location: session.location,
              device: session.deviceType ? {
                type: session.deviceType,
                browser: session.browser || 'Unknown',
                os: session.os || 'Unknown'
              } : undefined,
            }));
            setSessions(mappedSessions);
          } else {
            // No sessions from API - show empty state
            setSessions([]);
          }
        } catch (err) {
          console.error('Failed to fetch sessions:', err);
          // API failed - show empty state instead of mock data
          setSessions([]);
        }

      // Fetch stats
      try {
        const statsResponse = await api.get(`/audit-logs/stats?gymId=${gymId}`);
        if (statsResponse.data) {
          const apiStats = statsResponse.data;
          setStats({
            totalLogs: apiStats.totalLogs || 0,
            todayLogs: apiStats.todayLogs || 0,
            loginCount: 0,
            errorCount: 0,
            activeUsers: apiStats.onlineUsers || 0,
            avgSessionDuration: typeof apiStats.avgSessionTime === 'string' ? parseDuration(apiStats.avgSessionTime) : (apiStats.avgSessionTime || 0),
            topActions: (apiStats.topActions || []).map((a: any) => ({ action: a.action, count: a.count })),
            securityAlerts: apiStats.securityAlerts || 0,
          });
        }
      } catch (err) {
        console.log('Stats fetch failed, calculating from logs:', err);
        calculateStats();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to parse duration string (e.g., "2h 30m") to minutes
  const parseDuration = (durationStr: string): number => {
    if (!durationStr) return 0;
    let minutes = 0;
    const hoursMatch = durationStr.match(/(\d+)h/);
    const minsMatch = durationStr.match(/(\d+)m/);
    const daysMatch = durationStr.match(/(\d+)d/);
    if (daysMatch) minutes += parseInt(daysMatch[1]) * 24 * 60;
    if (hoursMatch) minutes += parseInt(hoursMatch[1]) * 60;
    if (minsMatch) minutes += parseInt(minsMatch[1]);
    return minutes;
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
                        {log.executionTime && (
                          <div className="audit-detail-item">
                            <Timer size={12} />
                            <span className="audit-detail-label">Execution Time</span>
                            <span className="audit-detail-value">{log.executionTime}ms</span>
                          </div>
                        )}
                        {log.requestId && (
                          <div className="audit-detail-item">
                            <Key size={12} />
                            <span className="audit-detail-label">Request ID</span>
                            <span className="audit-detail-value">{log.requestId}</span>
                          </div>
                        )}
                        <div className="audit-detail-item">
                          <Calendar size={12} />
                          <span className="audit-detail-label">Full Timestamp</span>
                          <span className="audit-detail-value">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* Business Context */}
                      {log.businessContext && (
                        <div className="audit-business-context">
                          <h4 className="audit-context-title">Business Context</h4>
                          <div className="audit-context-grid">
                            <div className="audit-context-item">
                              <span className="audit-context-label">Operation</span>
                              <span className="audit-context-value">{log.businessContext.operation}</span>
                            </div>
                            <div className="audit-context-item">
                              <span className="audit-context-label">Impact</span>
                              <span className="audit-context-value">{log.businessContext.impact}</span>
                            </div>
                            {log.businessContext.affectedEntities.length > 0 && (
                              <div className="audit-context-item">
                                <span className="audit-context-label">Affected Entities</span>
                                <span className="audit-context-value">{log.businessContext.affectedEntities.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Field-level Changes */}
                      {log.changes && (
                        <div className="audit-field-changes">
                          <h4 className="audit-changes-title">Field Changes</h4>
                          <FieldChangesDisplay changes={log.changes} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
                {paginatedLogs.length === 0 && (
                  <div className="audit-empty-state">
                    <History size={48} />
                    <h3>No audit logs yet</h3>
                    <p>Audit logs will appear here as users interact with the system. Login events, data changes, and security events will be tracked automatically.</p>
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
                {sessions.length === 0 ? (
                  <div className="audit-empty-state">
                    <Users size={48} />
                    <h3>No active sessions</h3>
                    <p>User sessions will appear here when users log in to the system.</p>
                  </div>
                ) : (
                  sessions.map(session => (
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
                  ))
                )}
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
