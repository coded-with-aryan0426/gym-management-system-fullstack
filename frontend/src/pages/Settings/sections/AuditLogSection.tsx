"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  History, Search, Download, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Loader2, Calendar, User, Activity, Shield, LogIn, LogOut, Clock,
  Monitor, RefreshCw, Eye, AlertTriangle, CheckCircle2, XCircle,
  Settings, CreditCard, Users, UserPlus, UserMinus, Edit3, Trash2, Plus,
  Key, Lock, Mail, Bell, Database, ArrowRight, FileText, BarChart3, Wifi, TrendingUp
} from "lucide-react"
import api from "../../../services/api"

// ── Types ──────────────────────────────────────────────────────────────────

type ActionType =
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT'
  | 'PASSWORD_CHANGE' | 'PASSWORD_RESET'
  | 'PERMISSION_CHANGE' | 'ROLE_CHANGE'
  | 'PAYMENT_RECEIVED' | 'REFUND_ISSUED'
  | 'MEMBER_CHECKIN' | 'MEMBER_CHECKOUT' | 'MEMBERSHIP_ACTIVATED' | 'MEMBERSHIP_EXPIRED'
  | 'SETTINGS_CHANGE'
  | 'EMAIL_SENT' | 'NOTIFICATION_SENT'
  | 'ERROR' | 'WARNING' | 'SECURITY_ALERT'

type EntityType =
  | 'USER' | 'MEMBER' | 'TRAINER' | 'STAFF' | 'ADMIN'
  | 'MEMBERSHIP' | 'PAYMENT' | 'INVOICE' | 'CLASS' | 'BOOKING'
  | 'SETTINGS' | 'SYSTEM' | 'SECURITY' | 'NOTIFICATION'
  | 'REPORT' | 'EQUIPMENT' | 'SCHEDULE' | 'PROFILE'

type SeverityLevel = 'info' | 'low' | 'medium' | 'high' | 'critical'

interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: string
  action: ActionType
  entity: EntityType
  entityId?: string
  entityName?: string
  details: string
  changes?: any
  ipAddress: string
  severity: SeverityLevel
}

interface AuditFilters {
  search: string
  action: string
  severity: string
  dateFrom: string
  dateTo: string
}

interface AuditStats {
  totalLogs: number
  todayLogs: number
  onlineUsers: number
  avgSessionTime: string
  securityAlerts: number
  topActions: { action: string; count: number }[]
  actionCounts: Record<string, number>
  severityCounts: Record<string, number>
  dailyActivity: Record<string, number>
}

// ── Helpers ────────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  'LOGIN':               { icon: <LogIn size={14} />,         label: 'Logged In',           color: 'var(--settings-accent-success)' },
  'LOGOUT':              { icon: <LogOut size={14} />,        label: 'Logged Out',          color: 'var(--settings-text-tertiary)' },
  'LOGIN_FAILED':        { icon: <XCircle size={14} />,       label: 'Login Failed',        color: 'var(--settings-accent-danger)' },
  'CREATE':              { icon: <Plus size={14} />,          label: 'Created',             color: 'var(--settings-accent-success)' },
  'UPDATE':              { icon: <Edit3 size={14} />,         label: 'Updated',             color: 'var(--settings-accent-blue)' },
  'DELETE':              { icon: <Trash2 size={14} />,        label: 'Deleted',             color: 'var(--settings-accent-danger)' },
  'VIEW':                { icon: <Eye size={14} />,           label: 'Viewed',              color: 'var(--settings-text-tertiary)' },
  'EXPORT':              { icon: <Download size={14} />,      label: 'Exported',            color: 'var(--settings-accent-blue)' },
  'PASSWORD_CHANGE':     { icon: <Key size={14} />,           label: 'Password Changed',    color: 'var(--settings-accent-amber)' },
  'PASSWORD_RESET':      { icon: <Lock size={14} />,          label: 'Password Reset',      color: 'var(--settings-accent-amber)' },
  'PERMISSION_CHANGE':   { icon: <Shield size={14} />,        label: 'Permission Changed',  color: 'var(--settings-accent-purple)' },
  'ROLE_CHANGE':         { icon: <Shield size={14} />,        label: 'Role Changed',        color: 'var(--settings-accent-purple)' },
  'PAYMENT_RECEIVED':    { icon: <CreditCard size={14} />,    label: 'Payment Received',    color: 'var(--settings-accent-success)' },
  'REFUND_ISSUED':       { icon: <CreditCard size={14} />,    label: 'Refund Issued',       color: 'var(--settings-accent-amber)' },
  'MEMBER_CHECKIN':      { icon: <UserPlus size={14} />,      label: 'Checked In',          color: 'var(--settings-accent-success)' },
  'MEMBER_CHECKOUT':     { icon: <UserMinus size={14} />,     label: 'Checked Out',         color: 'var(--settings-text-tertiary)' },
  'MEMBERSHIP_ACTIVATED':{ icon: <CheckCircle2 size={14} />,  label: 'Membership Active',   color: 'var(--settings-accent-success)' },
  'MEMBERSHIP_EXPIRED':  { icon: <AlertTriangle size={14} />, label: 'Membership Expired',  color: 'var(--settings-accent-amber)' },
  'SETTINGS_CHANGE':     { icon: <Settings size={14} />,      label: 'Settings Changed',    color: 'var(--settings-accent-blue)' },
  'EMAIL_SENT':          { icon: <Mail size={14} />,          label: 'Email Sent',          color: 'var(--settings-accent-teal)' },
  'NOTIFICATION_SENT':   { icon: <Bell size={14} />,          label: 'Notification Sent',   color: 'var(--settings-accent-teal)' },
  'SECURITY_ALERT':      { icon: <AlertTriangle size={14} />, label: 'Security Alert',      color: 'var(--settings-accent-danger)' },
  'ERROR':               { icon: <XCircle size={14} />,       label: 'Error',               color: 'var(--settings-accent-danger)' },
  'WARNING':             { icon: <AlertTriangle size={14} />, label: 'Warning',             color: 'var(--settings-accent-amber)' },
}

const ACTION_COLORS: Record<string, string> = {
  'LOGIN': '#10b981', 'LOGOUT': '#6b7280', 'LOGIN_FAILED': '#ef4444',
  'CREATE': '#10b981', 'UPDATE': '#3b82f6', 'DELETE': '#ef4444',
  'VIEW': '#6b7280', 'EXPORT': '#3b82f6',
  'PASSWORD_CHANGE': '#f59e0b', 'PASSWORD_RESET': '#f59e0b',
  'PERMISSION_CHANGE': '#8b5cf6', 'ROLE_CHANGE': '#8b5cf6',
  'SETTINGS_CHANGE': '#3b82f6', 'SECURITY_ALERT': '#ef4444',
}

const SEVERITY_COLORS: Record<string, string> = {
  'info': '#3b82f6', 'low': '#10b981', 'medium': '#f59e0b', 'high': '#f97316', 'critical': '#ef4444',
}

const ENTITY_LABELS: Record<string, string> = {
  'USER': 'User', 'MEMBER': 'Member', 'TRAINER': 'Trainer', 'STAFF': 'Staff', 'ADMIN': 'Admin',
  'MEMBERSHIP': 'Membership', 'PAYMENT': 'Payment', 'INVOICE': 'Invoice', 'CLASS': 'Class',
  'BOOKING': 'Booking', 'SETTINGS': 'Settings', 'SYSTEM': 'System', 'SECURITY': 'Security',
  'NOTIFICATION': 'Notification', 'REPORT': 'Report', 'EQUIPMENT': 'Equipment', 'SCHEDULE': 'Schedule',
  'PROFILE': 'Profile',
}

const SEVERITY_CONFIG: Record<string, { label: string; dotClass: string }> = {
  'info':     { label: 'Info',     dotClass: 'al-severity-dot--info' },
  'low':      { label: 'Low',      dotClass: 'al-severity-dot--low' },
  'medium':   { label: 'Medium',   dotClass: 'al-severity-dot--medium' },
  'high':     { label: 'High',     dotClass: 'al-severity-dot--high' },
  'critical': { label: 'Critical', dotClass: 'al-severity-dot--critical' },
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 172800000) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  })
}

function formatFullTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function getActionMeta(action: string) {
  return ACTION_META[action] || { icon: <Activity size={14} />, label: action.replace(/_/g, ' '), color: 'var(--settings-text-tertiary)' }
}

// ── Bar Chart Component (pure CSS) ─────────────────────────────────────────

const BarChart: React.FC<{
  data: { label: string; value: number; color: string }[]
  maxBars?: number
}> = ({ data, maxBars = 8 }) => {
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, maxBars)
  const max = Math.max(...sorted.map(d => d.value), 1)

  return (
    <div className="al-chart-bars">
      {sorted.map((item, i) => (
        <div key={i} className="al-chart-bar-row">
          <span className="al-chart-bar-label" title={item.label}>{item.label}</span>
          <div className="al-chart-bar-track">
            <div
              className="al-chart-bar-fill"
              style={{ width: `${(item.value / max) * 100}%`, background: item.color }}
            />
          </div>
          <span className="al-chart-bar-value">{item.value}</span>
        </div>
      ))}
      {sorted.length === 0 && (
        <div className="al-chart-empty">No data available</div>
      )}
    </div>
  )
}

// ── Activity Sparkline (last 14 days) ──────────────────────────────────────

const ActivitySparkline: React.FC<{ dailyActivity: Record<string, number> }> = ({ dailyActivity }) => {
  // Build last 14 days
  const days: { date: string; label: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    days.push({ date: key, label, count: dailyActivity[key] || 0 })
  }
  const max = Math.max(...days.map(d => d.count), 1)

  return (
    <div className="al-sparkline">
      <div className="al-sparkline-bars">
        {days.map((day, i) => (
          <div key={i} className="al-sparkline-col" title={`${day.label}: ${day.count} events`}>
            <div className="al-sparkline-bar-wrapper">
              <div
                className="al-sparkline-bar"
                style={{ height: `${Math.max((day.count / max) * 100, 3)}%` }}
              />
            </div>
            <span className="al-sparkline-label">{day.label.split(' ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Changes Display ────────────────────────────────────────────────────────

const ChangesDisplay: React.FC<{ changes: any }> = ({ changes }) => {
  let entries: { field: string; oldValue: any; newValue: any }[] = []

  if (Array.isArray(changes)) {
    entries = changes.map(c => ({ field: c.field || 'unknown', oldValue: c.oldValue, newValue: c.newValue }))
  } else if (typeof changes === 'object' && changes !== null) {
    if (changes.raw) {
      return (
        <div className="al-changes-raw">
          <code>{String(changes.raw)}</code>
        </div>
      )
    }
    entries = Object.entries(changes).map(([field, val]: [string, any]) => {
      if (typeof val === 'object' && val !== null && ('oldValue' in val || 'newValue' in val)) {
        return { field, oldValue: val.oldValue, newValue: val.newValue }
      }
      return { field, oldValue: '-', newValue: String(val) }
    })
  }

  if (entries.length === 0) return null

  return (
    <div className="al-changes-table">
      <div className="al-changes-header">
        <span>Field</span>
        <span>Before</span>
        <span></span>
        <span>After</span>
      </div>
      {entries.map((entry, i) => {
        const isSensitive = entry.field.toLowerCase().includes('password') || entry.field.toLowerCase().includes('secret')
        return (
          <div key={i} className="al-changes-row">
            <span className="al-changes-field">{entry.field}</span>
            <span className="al-changes-old">{isSensitive ? '********' : (entry.oldValue ?? '-')}</span>
            <span className="al-changes-arrow"><ArrowRight size={12} /></span>
            <span className="al-changes-new">{isSensitive ? '********' : (entry.newValue ?? '-')}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

const AuditLogSection: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [page, setPage] = useState(1)
  const [totalFromApi, setTotalFromApi] = useState(0)
  const itemsPerPage = 20

  const [apiStats, setApiStats] = useState<AuditStats | null>(null)

  const [filters, setFilters] = useState<AuditFilters>({
    search: '', action: '', severity: '', dateFrom: '', dateTo: '',
  })

  const gymId = localStorage.getItem('activeGymId') || '41'

  // ── Data Fetching ──────────────────────────────────────────────────────

  const fetchLogs = useCallback(async () => {
    try {
      const response = await api.get(`/audit-logs?gymId=${gymId}&page=${page - 1}&size=${itemsPerPage}&includeChanges=true`)
      if (response.data?.logs?.length > 0) {
        const mapped: AuditLogEntry[] = response.data.logs.map((log: any) => ({
          id: log.id?.toString() || `log-${Math.random()}`,
          timestamp: log.timestamp,
          userId: log.userId?.toString() || '',
          userName: log.userName || 'System',
          userRole: log.userRole || '',
          action: log.action || 'UPDATE',
          entity: log.entity || 'SYSTEM',
          entityId: log.entityId,
          entityName: log.entityName,
          details: log.details || '',
          changes: log.changes ? (() => { try { return JSON.parse(log.changes) } catch { return { raw: log.changes } } })() : undefined,
          ipAddress: log.ipAddress || '',
          severity: log.severity || 'info',
        }))
        setLogs(mapped)
        setTotalFromApi(response.data.totalElements || response.data.total || mapped.length)
      } else {
        setLogs([])
        setTotalFromApi(0)
      }
    } catch {
      setLogs([])
      setTotalFromApi(0)
    }
  }, [page, itemsPerPage, gymId])

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get(`/audit-logs/stats?gymId=${gymId}`)
      setApiStats(response.data)
    } catch {
      // stats are optional, don't fail
    }
  }, [gymId])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchLogs(), fetchStats()]).finally(() => setLoading(false))
  }, [fetchLogs, fetchStats])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchLogs(), fetchStats()])
    setRefreshing(false)
  }

  // ── Filtering ──────────────────────────────────────────────────────────

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filters.search) {
        const s = filters.search.toLowerCase()
        if (!log.details.toLowerCase().includes(s) && !log.userName.toLowerCase().includes(s) && !log.action.toLowerCase().includes(s) && !log.entity.toLowerCase().includes(s)) return false
      }
      if (filters.action && log.action !== filters.action) return false
      if (filters.severity && log.severity !== filters.severity) return false
      if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(log.timestamp) > new Date(filters.dateTo + 'T23:59:59')) return false
      return true
    })
  }, [logs, filters])

  // ── Computed Stats ─────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayCount = apiStats?.todayLogs ?? logs.filter(l => new Date(l.timestamp).toDateString() === today).length
    const uniqueUsers = new Set(logs.map(l => l.userName)).size
    const securityCount = apiStats?.securityAlerts ?? logs.filter(l =>
      l.action.includes('LOGIN') || l.action.includes('PASSWORD') || l.action.includes('PERMISSION') || l.entity === 'SECURITY'
    ).length
    const onlineUsers = apiStats?.onlineUsers ?? 0
    return {
      total: apiStats?.totalLogs ?? totalFromApi ?? logs.length,
      todayCount,
      uniqueUsers,
      securityCount,
      onlineUsers,
    }
  }, [logs, totalFromApi, apiStats])

  // ── Analytics Data ─────────────────────────────────────────────────────

  const actionChartData = useMemo(() => {
    const counts = apiStats?.actionCounts || {}
    // If no API data, compute from current logs
    const finalCounts = Object.keys(counts).length > 0
      ? counts
      : logs.reduce((acc, l) => { acc[l.action] = (acc[l.action] || 0) + 1; return acc }, {} as Record<string, number>)

    return Object.entries(finalCounts).map(([action, count]) => ({
      label: ACTION_META[action]?.label || action.replace(/_/g, ' '),
      value: count as number,
      color: ACTION_COLORS[action] || '#6b7280',
    }))
  }, [apiStats, logs])

  const severityChartData = useMemo(() => {
    const counts = apiStats?.severityCounts || {}
    const finalCounts = Object.keys(counts).length > 0
      ? counts
      : logs.reduce((acc, l) => { acc[l.severity] = (acc[l.severity] || 0) + 1; return acc }, {} as Record<string, number>)

    return Object.entries(finalCounts).map(([severity, count]) => ({
      label: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count as number,
      color: SEVERITY_COLORS[severity] || '#6b7280',
    }))
  }, [apiStats, logs])

  const dailyActivity = useMemo(() => {
    if (apiStats?.dailyActivity && Object.keys(apiStats.dailyActivity).length > 0) {
      return apiStats.dailyActivity
    }
    // Fallback: compute from current page logs
    const activity: Record<string, number> = {}
    logs.forEach(l => {
      const day = new Date(l.timestamp).toISOString().slice(0, 10)
      activity[day] = (activity[day] || 0) + 1
    })
    return activity
  }, [apiStats, logs])

  // ── Export ─────────────────────────────────────────────────────────────

  const exportLogs = (format: 'csv' | 'json') => {
    if (filteredLogs.length === 0) return
    const rows = filteredLogs.map(l => ({
      timestamp: l.timestamp, user: l.userName, role: l.userRole,
      action: l.action, entity: l.entity, details: l.details, severity: l.severity,
    }))
    let content: string, mime: string, ext: string
    if (format === 'csv') {
      const headers = Object.keys(rows[0]).join(',')
      const body = rows.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n')
      content = headers + '\n' + body; mime = 'text/csv'; ext = 'csv'
    } else {
      content = JSON.stringify(rows, null, 2); mime = 'application/json'; ext = 'json'
    }
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.${ext}`
    a.click(); URL.revokeObjectURL(url)
  }

  // ── Pagination ─────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil((totalFromApi || filteredLogs.length) / itemsPerPage))
  const hasActiveFilters = filters.search || filters.action || filters.severity || filters.dateFrom || filters.dateTo
  const clearFilters = () => setFilters({ search: '', action: '', severity: '', dateFrom: '', dateTo: '' })

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="settings-section">
        <div className="settings-loading">
          <Loader2 className="spin" size={24} />
          <span>Loading audit logs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-section" style={{ "--section-accent": "#14b8a6" } as React.CSSProperties}>
      {/* Header */}
      <div className="settings-section__header">
        <div className="settings-section__title-group">
            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
              <History size={20} />
          </div>
          <div>
            <h2 className="settings-section__title">System Audit Log</h2>
            <p className="settings-section__description">
              Track every action, login, change, and security event across your system
            </p>
          </div>
        </div>
        <div className="al-header-actions">
          <button className="al-icon-btn" onClick={handleRefresh} disabled={refreshing} title="Refresh">
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
          </button>
          <button
            className={`al-icon-btn ${showAnalytics ? 'al-icon-btn--active' : ''}`}
            onClick={() => setShowAnalytics(!showAnalytics)}
            title="Analytics"
          >
            <BarChart3 size={15} />
          </button>
          <button className={`al-icon-btn ${showFilters ? 'al-icon-btn--active' : ''}`} onClick={() => setShowFilters(!showFilters)} title="Filters">
            <Filter size={15} />
            {hasActiveFilters && <span className="al-filter-badge" />}
          </button>
          <div className="al-export-dropdown">
            <button className="al-icon-btn" title="Export">
              <Download size={15} />
            </button>
            <div className="al-export-menu">
              <button onClick={() => exportLogs('csv')}>
                <FileText size={14} /> Export CSV
              </button>
              <button onClick={() => exportLogs('json')}>
                <Database size={14} /> Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats - 5 cards */}
      <div className="al-stats-row">
        <div className="al-stat">
          <div className="al-stat-icon"><Activity size={15} /></div>
          <div className="al-stat-info">
            <span className="al-stat-number">{stats.total}</span>
            <span className="al-stat-label">Total Events</span>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat-icon al-stat-icon--blue"><Calendar size={15} /></div>
          <div className="al-stat-info">
            <span className="al-stat-number">{stats.todayCount}</span>
            <span className="al-stat-label">Today</span>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat-icon al-stat-icon--teal">
            <Wifi size={15} />
          </div>
          <div className="al-stat-info">
            <span className="al-stat-number">{stats.onlineUsers}</span>
            <span className="al-stat-label">Online Now</span>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat-icon al-stat-icon--purple"><Users size={15} /></div>
          <div className="al-stat-info">
            <span className="al-stat-number">{stats.uniqueUsers}</span>
            <span className="al-stat-label">Active Users</span>
          </div>
        </div>
        <div className="al-stat">
          <div className="al-stat-icon al-stat-icon--amber"><Shield size={15} /></div>
          <div className="al-stat-info">
            <span className="al-stat-number">{stats.securityCount}</span>
            <span className="al-stat-label">Security Events</span>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="al-analytics">
          <div className="al-analytics-header">
            <TrendingUp size={16} />
            <h3>Activity Analytics</h3>
            <span className="al-analytics-subtitle">Overview of system activity patterns</span>
          </div>

          {/* Daily Activity Chart */}
          <div className="al-analytics-card al-analytics-card--full">
            <div className="al-analytics-card-header">
              <Calendar size={14} />
              <h4>Daily Activity</h4>
              <span className="al-analytics-card-sub">Last 14 days</span>
            </div>
            <ActivitySparkline dailyActivity={dailyActivity} />
          </div>

          <div className="al-analytics-grid">
            {/* Action Breakdown */}
            <div className="al-analytics-card">
              <div className="al-analytics-card-header">
                <Activity size={14} />
                <h4>Actions Breakdown</h4>
              </div>
              <BarChart data={actionChartData} maxBars={8} />
            </div>

            {/* Severity Distribution */}
            <div className="al-analytics-card">
              <div className="al-analytics-card-header">
                <Shield size={14} />
                <h4>Severity Distribution</h4>
              </div>
              <BarChart data={severityChartData} maxBars={5} />
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="al-filters">
          <div className="al-filters-row">
            <div className="al-filter-field al-filter-field--search">
              <Search size={14} className="al-filter-search-icon" />
              <input
                type="text"
                placeholder="Search by user, action, details..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            <div className="al-filter-field">
              <select value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}>
                <option value="">All Actions</option>
                {Object.entries(ACTION_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>
            <div className="al-filter-field">
              <select value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}>
                <option value="">All Severity</option>
                <option value="info">Info</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="al-filter-field">
              <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            </div>
            <div className="al-filter-field">
              <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
            </div>
            {hasActiveFilters && (
              <button className="al-clear-filters" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>
      )}

      {/* Log Timeline */}
      <div className="settings-section__content">
        <div className="al-timeline">
          {filteredLogs.length === 0 ? (
            <div className="al-empty">
              <div className="al-empty-icon"><History size={40} /></div>
              <h3>No audit logs found</h3>
              <p>
                {hasActiveFilters
                  ? 'No logs match your current filters. Try adjusting or clearing them.'
                  : 'Audit logs will appear here as users interact with your system.'}
              </p>
              {hasActiveFilters && (
                <button className="al-empty-action" onClick={clearFilters}>Clear Filters</button>
              )}
            </div>
          ) : (
            filteredLogs.map(log => {
              const meta = getActionMeta(log.action)
              const isExpanded = expandedLog === log.id
              const severityCfg = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info

              return (
                <div
                  key={log.id}
                  className={`al-entry ${isExpanded ? 'al-entry--expanded' : ''}`}
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <div className="al-entry-row">
                    <div className="al-entry-indicator" style={{ background: meta.color }} />
                    <div className="al-entry-icon" style={{ color: meta.color }}>{meta.icon}</div>
                    <div className="al-entry-body">
                      <div className="al-entry-headline">
                        <span className="al-entry-user">{log.userName}</span>
                        <span className="al-entry-action" style={{ color: meta.color }}>{meta.label}</span>
                        <span className="al-entry-entity">{ENTITY_LABELS[log.entity] || log.entity}</span>
                        {log.entityId && <span className="al-entry-entity-id">#{log.entityId}</span>}
                      </div>
                      {log.details && <p className="al-entry-details">{log.details}</p>}
                    </div>
                    <div className="al-entry-right">
                      <div className={`al-severity-dot ${severityCfg.dotClass}`} title={severityCfg.label} />
                      <span className="al-entry-time" title={formatFullTimestamp(log.timestamp)}>
                        {formatRelativeTime(log.timestamp)}
                      </span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="al-entry-expanded" onClick={e => e.stopPropagation()}>
                      <div className="al-detail-grid">
                        <div className="al-detail-item">
                          <Clock size={13} />
                          <span className="al-detail-label">Time</span>
                          <span className="al-detail-value">{formatFullTimestamp(log.timestamp)}</span>
                        </div>
                        <div className="al-detail-item">
                          <User size={13} />
                          <span className="al-detail-label">User</span>
                          <span className="al-detail-value">{log.userName} {log.userRole ? `(${log.userRole})` : ''}</span>
                        </div>
                        <div className="al-detail-item">
                          <Activity size={13} />
                          <span className="al-detail-label">Action</span>
                          <span className="al-detail-value">{meta.label}</span>
                        </div>
                        <div className="al-detail-item">
                          <Database size={13} />
                          <span className="al-detail-label">Entity</span>
                          <span className="al-detail-value">{ENTITY_LABELS[log.entity] || log.entity}{log.entityId ? ` #${log.entityId}` : ''}</span>
                        </div>
                        {log.ipAddress && (
                          <div className="al-detail-item">
                            <Monitor size={13} />
                            <span className="al-detail-label">IP Address</span>
                            <span className="al-detail-value">{log.ipAddress}</span>
                          </div>
                        )}
                        <div className="al-detail-item">
                          <Shield size={13} />
                          <span className="al-detail-label">Severity</span>
                          <span className="al-detail-value">{severityCfg.label}</span>
                        </div>
                      </div>

                      {log.changes && (
                        <div className="al-changes-section">
                          <h4 className="al-changes-heading">
                            <Edit3 size={14} />
                            What Changed
                          </h4>
                          <ChangesDisplay changes={log.changes} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="al-pagination">
            <span className="al-pagination-info">
              Showing {filteredLogs.length} of {stats.total} events
              {hasActiveFilters ? ' (filtered)' : ''}
            </span>
            <div className="al-pagination-controls">
              <button className="al-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              <span className="al-page-indicator">Page {page} of {totalPages}</span>
              <button className="al-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLogSection
