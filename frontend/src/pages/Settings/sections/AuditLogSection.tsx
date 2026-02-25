"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  History, Search, Download, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Loader2, Calendar, User, Activity, Shield, LogIn, LogOut, Clock,
  Monitor, RefreshCw, AlertTriangle, CheckCircle2, XCircle,
  Settings, CreditCard, Users, UserPlus, UserMinus, Edit3, Trash2, Plus,
  Key, Lock, Mail, Bell, Database, ArrowRight, FileText, BarChart3, TrendingUp,
  Laptop, MapPin, Globe, Terminal, Zap
} from "lucide-react"
import api from "../../../services/api"

// ── Types ──────────────────────────────────────────────────────────────────

type SeverityLevel = 'info' | 'low' | 'medium' | 'high' | 'critical'

interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userRole: string
  action: string
  entity: string
  entityId?: string
  entityName?: string
  details: string
  changes?: any
  ipAddress: string
  severity: SeverityLevel
  deviceType?: string
  browser?: string
  os?: string
  location?: string
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
  securityAlerts: number
  actionCounts: Record<string, number>
  severityCounts: Record<string, number>
  dailyActivity: Record<string, number>
}

// ── Action metadata ────────────────────────────────────────────────────────

const ACTION_META: Record<string, { icon: React.ReactNode; label: string; color: string; verb: string }> = {
  LOGIN:                { icon: <LogIn size={13} />,        label: 'Logged In',          color: '#10b981', verb: 'logged into' },
  LOGOUT:               { icon: <LogOut size={13} />,       label: 'Logged Out',         color: '#6b7280', verb: 'logged out of' },
  LOGIN_FAILED:         { icon: <XCircle size={13} />,      label: 'Login Failed',       color: '#ef4444', verb: 'failed to log into' },
  CREATE:               { icon: <Plus size={13} />,         label: 'Created',            color: '#10b981', verb: 'created' },
  UPDATE:               { icon: <Edit3 size={13} />,        label: 'Updated',            color: '#3b82f6', verb: 'updated' },
  DELETE:               { icon: <Trash2 size={13} />,       label: 'Deleted',            color: '#ef4444', verb: 'deleted' },
  VIEW:                 { icon: <History size={13} />,      label: 'Viewed',             color: '#6b7280', verb: 'viewed' },
  EXPORT:               { icon: <Download size={13} />,     label: 'Exported',           color: '#3b82f6', verb: 'exported' },
  PASSWORD_CHANGE:      { icon: <Key size={13} />,          label: 'Password Changed',   color: '#f59e0b', verb: 'changed password on' },
  PASSWORD_RESET:       { icon: <Lock size={13} />,         label: 'Password Reset',     color: '#f59e0b', verb: 'reset password on' },
  PERMISSION_CHANGE:    { icon: <Shield size={13} />,       label: 'Permission Changed', color: '#8b5cf6', verb: 'changed permissions on' },
  ROLE_CHANGE:          { icon: <Shield size={13} />,       label: 'Role Changed',       color: '#8b5cf6', verb: 'changed role on' },
  PAYMENT_RECEIVED:     { icon: <CreditCard size={13} />,   label: 'Payment Received',   color: '#10b981', verb: 'received payment on' },
  REFUND_ISSUED:        { icon: <CreditCard size={13} />,   label: 'Refund Issued',      color: '#f59e0b', verb: 'issued refund on' },
  MEMBER_CHECKIN:       { icon: <UserPlus size={13} />,     label: 'Member Check-In',    color: '#10b981', verb: 'checked in' },
  MEMBER_CHECKOUT:      { icon: <UserMinus size={13} />,    label: 'Member Check-Out',   color: '#6b7280', verb: 'checked out' },
  MEMBERSHIP_ACTIVATED: { icon: <CheckCircle2 size={13} />, label: 'Membership Active',  color: '#10b981', verb: 'activated membership for' },
  MEMBERSHIP_EXPIRED:   { icon: <AlertTriangle size={13} />,label: 'Membership Expired', color: '#f97316', verb: 'expired membership on' },
  SETTINGS_CHANGE:      { icon: <Settings size={13} />,     label: 'Settings Changed',   color: '#3b82f6', verb: 'changed settings on' },
  EMAIL_SENT:           { icon: <Mail size={13} />,         label: 'Email Sent',         color: '#14b8a6', verb: 'sent email regarding' },
  NOTIFICATION_SENT:    { icon: <Bell size={13} />,         label: 'Notification Sent',  color: '#14b8a6', verb: 'sent notification to' },
  SECURITY_ALERT:       { icon: <AlertTriangle size={13} />,label: 'Security Alert',     color: '#ef4444', verb: 'triggered security alert on' },
  ERROR:                { icon: <XCircle size={13} />,      label: 'Error',              color: '#ef4444', verb: 'encountered error on' },
  WARNING:              { icon: <AlertTriangle size={13} />,label: 'Warning',            color: '#f59e0b', verb: 'triggered warning on' },
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  info:     { label: 'Info',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  low:      { label: 'Low',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  medium:   { label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high:     { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

const ENTITY_LABELS: Record<string, string> = {
  USER: 'User', MEMBER: 'Member', TRAINER: 'Trainer', STAFF: 'Staff', ADMIN: 'Admin',
  MEMBERSHIP: 'Membership', PAYMENT: 'Payment', INVOICE: 'Invoice', CLASS: 'Class',
  BOOKING: 'Booking', SETTINGS: 'Settings', SYSTEM: 'System', SECURITY: 'Security',
  NOTIFICATION: 'Notification', REPORT: 'Report', EQUIPMENT: 'Equipment',
  SCHEDULE: 'Schedule', PROFILE: 'Profile',
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getActionMeta(action: string) {
  // Strip _COMPLETED / _STARTED / _FAILED suffixes that the AOP aspect appends
  const normalized = action.replace(/_(COMPLETED|STARTED|FAILED)$/, '')
  return ACTION_META[normalized] || {
    icon: <Activity size={13} />,
    label: normalized.replace(/_/g, ' '),
    color: '#6b7280',
    verb: 'performed',
  }
}

/** Build a human-readable one-liner:  "John Smith updated Member #42 (Jane Doe)" */
function buildHeadline(log: AuditLogEntry): { user: string; verb: string; target: string } {
  const meta = getActionMeta(log.action)
  const entity = ENTITY_LABELS[log.entity] || log.entity
  const name = log.entityName ? ` "${log.entityName}"` : ''
  const id   = log.entityId   ? ` #${log.entityId}` : ''
  const target = entity + id + name
  return {
    user: log.userName || 'System',
    verb: meta.verb,
    target,
  }
}

function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60_000)     return 'just now'
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 172_800_000) return 'yesterday'
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })
}

function formatFullTs(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function formatFieldName(raw: string): string {
  // "membershipType" → "Membership Type",  "maxSessions" → "Max Sessions"
  return raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function formatValue(v: any): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : 'No'
  if (typeof v === 'number') return String(v)
  const s = String(v).trim()
  if (!s) return '—'
  // Try to prettify ISO dates
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    try {
      return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch { /* */ }
  }
  return s
}

// ── Changes table ──────────────────────────────────────────────────────────

type ChangeRow = { field: string; oldValue: any; newValue: any }

const SKIP_FIELDS = new Set(['id','createdAt','updatedAt','gymId','entityType','timestamp','changed','type','sensitive'])
const isSensitiveField = (f: string) => /password|secret|token|pin|cvv|ssn|key/i.test(f)

/**
 * Parse the plain-text format that UserService.updateUser() writes:
 *   "Name: 'Old Name' → 'New Name'; Email: 'a@b.com' → 'c@d.com'; Phone: '123' → '456'"
 *   "Avatar updated"          ← no arrow, no quotes
 *   "Password changed"        ← masked by isSensitiveField
 * Also handles → (HTML entity) stored in DB.
 */
function parsePlainTextChanges(raw: string): ChangeRow[] | null {
  // Normalise HTML entity arrow
  const text = raw.replace(/→/g, '→')

  // Split on "; " boundary (the separator UserService uses)
  const parts = text.split(/;\s*/).map(s => s.trim()).filter(Boolean)
  if (parts.length === 0) return null

  const rows: ChangeRow[] = []
  for (const part of parts) {
    // Pattern 1:  "Field Name: 'old' → 'new'"  or  "Field: old → new"
    const arrowMatch = part.match(/^(.+?):\s*(.+?)\s*[→\-\>]+\s*(.+)$/)
    if (arrowMatch) {
      const field = arrowMatch[1].trim()
      const oldVal = arrowMatch[2].replace(/^['"]|['"]$/g, '').trim()
      const newVal = arrowMatch[3].replace(/^['"]|['"]$/g, '').trim()
      rows.push({ field, oldValue: oldVal === 'null' ? null : oldVal, newValue: newVal === 'null' ? null : newVal })
      continue
    }
    // Pattern 2:  "Field Name updated" / "Field Name changed"  — no before/after values
    const simpleMatch = part.match(/^(.+?)\s+(updated|changed|cleared|removed|set)$/i)
    if (simpleMatch) {
      rows.push({ field: simpleMatch[1].trim(), oldValue: undefined, newValue: simpleMatch[2] })
      continue
    }
    // Pattern 3:  "Field: value"  — create-style single value
    const colonMatch = part.match(/^(.+?):\s*(.+)$/)
    if (colonMatch) {
      rows.push({ field: colonMatch[1].trim(), oldValue: undefined, newValue: colonMatch[2].trim() })
      continue
    }
    // Fallback — treat entire segment as a description with no structured data
    rows.push({ field: part, oldValue: undefined, newValue: undefined })
  }
  return rows.length > 0 ? rows : null
}

/**
 * Normalise whatever `changes` arrives as into ChangeRow[].
 * Handles 5 formats actually produced by the backend:
 *
 *  A) Plain string  — "Name: 'x' → 'y'; Email: 'a' → 'b'"  (UserService)
 *  B) { result: "..." }  — AOP aspect wrapper around plain string or JSON
 *  C) { raw: "..." }     — raw fallback from old code
 *  D) { field: { field, oldValue, newValue, changed } }  — EntityChangeTracker JSON
 *  E) [{ field, oldValue, newValue }]  — array format
 */
function normaliseChanges(changes: any): ChangeRow[] {
  if (!changes) return []

  // ── A: plain string ───────────────────────────────────────────────────────
  if (typeof changes === 'string') {
    const trimmed = changes.trim()
    if (!trimmed || trimmed === 'null') return []
    const rows = parsePlainTextChanges(trimmed)
    return rows ?? [{ field: 'Details', oldValue: undefined, newValue: trimmed }]
  }

  // ── E: array ──────────────────────────────────────────────────────────────
  if (Array.isArray(changes)) {
    return changes.map((c: any) => ({
      field:    c.field    ?? c.key   ?? 'field',
      oldValue: c.oldValue ?? c.before ?? c.from,
      newValue: c.newValue ?? c.after  ?? c.to,
    }))
  }

  // ── Object formats ────────────────────────────────────────────────────────
  if (typeof changes === 'object' && changes !== null) {
    const keys = Object.keys(changes)

    // B: { result: "..." }
    if (keys.length === 1 && 'result' in changes) {
      const inner = String(changes.result).trim()
      if (!inner || inner === 'null') return []
      // Could be a JSON string inside result
      try {
        const parsed = JSON.parse(inner)
        return normaliseChanges(parsed)
      } catch {
        return parsePlainTextChanges(inner) ?? [{ field: 'Details', oldValue: undefined, newValue: inner }]
      }
    }

    // C: { raw: "..." }
    if ('raw' in changes) {
      return normaliseChanges(String(changes.raw))
    }

    // D: EntityChangeTracker — each value has { field, oldValue, newValue, changed }
    //    or plain { old, new } from logPermissionChange
    const rows: ChangeRow[] = []
    for (const [key, val] of Object.entries(changes) as [string, any][]) {
      if (SKIP_FIELDS.has(key)) continue
      if (typeof val === 'object' && val !== null) {
        if ('oldValue' in val || 'newValue' in val || 'before' in val || 'after' in val) {
          rows.push({ field: val.field ?? key, oldValue: val.oldValue ?? val.before, newValue: val.newValue ?? val.after })
        } else if ('old' in val || 'new' in val) {
          rows.push({ field: key, oldValue: val.old, newValue: val.new })
        } else {
          // Nested object — stringify it as a value
          rows.push({ field: key, oldValue: undefined, newValue: JSON.stringify(val) })
        }
      } else {
        rows.push({ field: key, oldValue: undefined, newValue: val })
      }
    }
    return rows
  }

  return []
}

const ChangesDisplay: React.FC<{ changes: any; action: string }> = ({ changes, action }) => {
  const rows = normaliseChanges(changes)
  if (rows.length === 0) return null

  const baseAction = action.replace(/_(COMPLETED|STARTED|FAILED)$/, '')
  // A "create" has no meaningful before values
  const isCreate = baseAction === 'CREATE' ||
    rows.every(r => r.oldValue === undefined || r.oldValue === null || r.oldValue === '')

  return (
    <div className="al-changes-table">
      <div className="al-changes-head">
        <span>Field</span>
        {!isCreate && <span>Before</span>}
        {!isCreate && <span></span>}
        <span>{isCreate ? 'Value' : 'After'}</span>
      </div>
      {rows.map((row, i) => {
        const sensitive = isSensitiveField(String(row.field))
        const oldVal = sensitive ? '••••••' : formatValue(row.oldValue)
        const newVal = sensitive ? '••••••' : formatValue(row.newValue)
        const changed = !isCreate && oldVal !== newVal && oldVal !== '—' && oldVal !== newVal
        return (
          <div key={i} className={`al-changes-row${changed ? ' al-changes-row--changed' : ''}`}>
            <span className="al-ch-field">{formatFieldName(String(row.field))}</span>
            {!isCreate && (
              <>
                <span className={`al-ch-old${changed ? ' al-ch-old--strike' : ''}`}>{oldVal}</span>
                <span className="al-ch-arrow"><ArrowRight size={11} /></span>
              </>
            )}
            <span className={`al-ch-new${changed ? ' al-ch-new--highlight' : ''}`}>{newVal}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Sparkline (14-day activity) ────────────────────────────────────────────

const Sparkline: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const key = d.toISOString().slice(0, 10)
    return { key, day: d.getDate(), count: data[key] || 0 }
  })
  const max = Math.max(...days.map(d => d.count), 1)
  return (
    <div className="al-sparkline">
      {days.map((day, i) => (
        <div key={i} className="al-spark-col" title={`${day.key}: ${day.count} events`}>
          <div className="al-spark-track">
            <div className="al-spark-bar" style={{ height: `${Math.max((day.count / max) * 100, 2)}%` }} />
          </div>
          {(i === 0 || i === 6 || i === 13) && (
            <span className="al-spark-label">{day.day}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Inline bar chart ───────────────────────────────────────────────────────

const MiniBarChart: React.FC<{ items: { label: string; value: number; color: string }[] }> = ({ items }) => {
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, 7)
  const max = Math.max(...sorted.map(d => d.value), 1)
  return (
    <div className="al-minibars">
      {sorted.map((item, i) => (
        <div key={i} className="al-minibar-row">
          <span className="al-minibar-label" title={item.label}>{item.label}</span>
          <div className="al-minibar-track">
            <div className="al-minibar-fill" style={{ width: `${(item.value / max) * 100}%`, background: item.color }} />
          </div>
          <span className="al-minibar-val">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

const AuditLogSection: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [page, setPage] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [apiStats, setApiStats] = useState<AuditStats | null>(null)
  const PER_PAGE = 25

  const [filters, setFilters] = useState<AuditFilters>({
    search: '', action: '', severity: '', dateFrom: '', dateTo: '',
  })
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const gymId = localStorage.getItem('activeGymId') || '41'

  // ── Filter handlers ──────────────────────────────────────────────────

  const handleSearch = (v: string) => {
    setFilters(f => ({ ...f, search: v }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebouncedSearch(v); setPage(1) }, 400)
  }

  const handleFilter = (k: keyof Omit<AuditFilters, 'search'>, v: string) => {
    setFilters(f => ({ ...f, [k]: v }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ search: '', action: '', severity: '', dateFrom: '', dateTo: '' })
    setDebouncedSearch('')
    setPage(1)
  }

  const hasFilters = !!(debouncedSearch || filters.action || filters.severity || filters.dateFrom || filters.dateTo)

  // ── Fetch ────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(async () => {
    try {
      const p = new URLSearchParams({ gymId, page: String(page - 1), size: String(PER_PAGE), includeChanges: 'true' })
      if (debouncedSearch)  p.set('search',    debouncedSearch)
      if (filters.action)   p.set('action',    filters.action)
      if (filters.severity) p.set('severity',  filters.severity)
      if (filters.dateFrom) p.set('startDate', `${filters.dateFrom}T00:00:00`)
      if (filters.dateTo)   p.set('endDate',   `${filters.dateTo}T23:59:59`)

      const res = await api.get(`/audit-logs?${p}`)
      const rawLogs: any[] = res.data?.logs ?? []
      const mapped: AuditLogEntry[] = rawLogs.map((l: any) => ({
        id:         l.id?.toString() || `${Math.random()}`,
        timestamp:  l.timestamp,
        userId:     l.userId?.toString() || '',
        userName:   l.userName || 'System',
        userRole:   l.userRole || '',
        action:     l.action || 'UPDATE',
        entity:     l.entity || 'SYSTEM',
        entityId:   l.entityId?.toString(),
        entityName: l.entityName,
        details:    l.details || '',
        changes:    l.changes ? (() => { try { return JSON.parse(l.changes) } catch { return { raw: l.changes } } })() : undefined,
        ipAddress:  l.ipAddress || '',
        severity:   l.severity || 'info',
        deviceType: l.deviceType,
        browser:    l.browser,
        os:         l.os,
        location:   l.location,
      }))
      setLogs(mapped)
      setTotalElements(res.data?.totalElements ?? res.data?.total ?? mapped.length)
      setTotalPages(res.data?.totalPages ?? Math.ceil((res.data?.totalElements ?? mapped.length) / PER_PAGE))
    } catch {
      setLogs([]); setTotalElements(0); setTotalPages(1)
    }
  }, [page, gymId, debouncedSearch, filters.action, filters.severity, filters.dateFrom, filters.dateTo])

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get(`/audit-logs/stats?gymId=${gymId}`)
      setApiStats(res.data)
    } catch { /* optional */ }
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

  // ── Export ───────────────────────────────────────────────────────────

  const exportCSV = async () => {
    try {
      const p = new URLSearchParams({ gymId })
      if (filters.dateFrom) p.set('startDate', `${filters.dateFrom}T00:00:00`)
      if (filters.dateTo)   p.set('endDate',   `${filters.dateTo}T23:59:59`)
      const res = await api.get(`/audit-logs/export/csv?${p}`, { responseType: 'text' })
      dl(new Blob([res.data], { type: 'text/csv' }), `audit-${today()}.csv`)
    } catch {
      // fallback
      const header = 'Timestamp,User,Role,Action,Entity,EntityID,Severity,IP,Details'
      const body = logs.map(l =>
        [l.timestamp, l.userName, l.userRole, l.action, l.entity, l.entityId ?? '', l.severity, l.ipAddress, `"${l.details.replace(/"/g, '""')}"`].join(',')
      ).join('\n')
      dl(new Blob([header + '\n' + body], { type: 'text/csv' }), `audit-${today()}.csv`)
    }
  }

  const exportJSON = () => {
    const data = logs.map(l => ({
      timestamp: l.timestamp, user: l.userName, role: l.userRole,
      action: l.action, entity: l.entity, entityId: l.entityId,
      severity: l.severity, ip: l.ipAddress, browser: l.browser,
      os: l.os, device: l.deviceType, details: l.details,
    }))
    dl(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `audit-${today()}.json`)
  }

  function dl(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url)
  }
  function today() { return new Date().toISOString().slice(0, 10) }

  // ── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString()
    return {
      total:    apiStats?.totalLogs    ?? totalElements,
      today:    apiStats?.todayLogs    ?? logs.filter(l => new Date(l.timestamp).toDateString() === todayStr).length,
      online:   apiStats?.onlineUsers  ?? 0,
      security: apiStats?.securityAlerts ?? logs.filter(l =>
        ['LOGIN_FAILED','SECURITY_ALERT','PERMISSION_CHANGE','ROLE_CHANGE'].some(a => l.action.startsWith(a))
      ).length,
      activeUsers: new Set(logs.map(l => l.userId)).size,
    }
  }, [logs, totalElements, apiStats])

  const actionChartData = useMemo(() => {
    const counts = apiStats?.actionCounts && Object.keys(apiStats.actionCounts).length > 0
      ? apiStats.actionCounts
      : logs.reduce((acc, l) => { acc[l.action] = (acc[l.action] || 0) + 1; return acc }, {} as Record<string, number>)
    return Object.entries(counts).map(([action, count]) => ({
      label: getActionMeta(action).label,
      value: count as number,
      color: getActionMeta(action).color,
    }))
  }, [apiStats, logs])

  const severityChartData = useMemo(() => {
    const counts = apiStats?.severityCounts && Object.keys(apiStats.severityCounts).length > 0
      ? apiStats.severityCounts
      : logs.reduce((acc, l) => { acc[l.severity] = (acc[l.severity] || 0) + 1; return acc }, {} as Record<string, number>)
    return Object.entries(counts).map(([sev, count]) => ({
      label: SEVERITY_CONFIG[sev]?.label ?? sev,
      value: count as number,
      color: SEVERITY_CONFIG[sev]?.color ?? '#6b7280',
    }))
  }, [apiStats, logs])

  const dailyActivity = useMemo(() => {
    if (apiStats?.dailyActivity && Object.keys(apiStats.dailyActivity).length > 0) return apiStats.dailyActivity
    const m: Record<string, number> = {}
    logs.forEach(l => { const k = new Date(l.timestamp).toISOString().slice(0, 10); m[k] = (m[k] || 0) + 1 })
    return m
  }, [apiStats, logs])

  // ── Render ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="settings-section">
        <div className="settings-loading">
          <Loader2 className="spin" size={22} />
          <span>Loading audit logs…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-section settings-section--teal">

      {/* ── Header ── */}
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon settings-section__icon--teal">
            <History size={18} />
          </div>
          <div>
            <h2 className="settings-section__title">System Audit Log</h2>
            <p className="settings-section__description">
              Every action, change, login and security event — who did it, when, and exactly what changed
            </p>
          </div>
        </div>
        <div className="al-header-actions">
          <button className="al-icon-btn" onClick={handleRefresh} disabled={refreshing} title="Refresh">
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          </button>
          <button
            className={`al-icon-btn${showAnalytics ? ' al-icon-btn--active' : ''}`}
            onClick={() => setShowAnalytics(v => !v)}
            title="Toggle analytics"
          >
            <BarChart3 size={14} />
          </button>
          <button
            className={`al-icon-btn${showFilters ? ' al-icon-btn--active' : ''}`}
            onClick={() => setShowFilters(v => !v)}
            title="Filters"
          >
            <Filter size={14} />
            {hasFilters && <span className="al-filter-dot" />}
          </button>
          <div className="al-export-wrap">
            <button className="al-icon-btn" title="Export">
              <Download size={14} />
            </button>
            <div className="al-export-menu">
              <button onClick={exportCSV}><FileText size={13} />Export CSV (all)</button>
              <button onClick={exportJSON}><Database size={13} />Export JSON (page)</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="al-stats">
        <div className="al-stat">
          <Activity size={14} className="al-stat-icon" />
          <span className="al-stat-num">{stats.total.toLocaleString()}</span>
          <span className="al-stat-lbl">Total Events</span>
        </div>
        <div className="al-stat-div" />
        <div className="al-stat">
          <Calendar size={14} className="al-stat-icon al-stat-icon--blue" />
          <span className="al-stat-num">{stats.today}</span>
          <span className="al-stat-lbl">Today</span>
        </div>
        <div className="al-stat-div" />
        <div className="al-stat">
          <Users size={14} className="al-stat-icon al-stat-icon--purple" />
          <span className="al-stat-num">{stats.activeUsers}</span>
          <span className="al-stat-lbl">Active Users</span>
        </div>
        <div className="al-stat-div" />
        <div className="al-stat">
          <Globe size={14} className="al-stat-icon al-stat-icon--teal" />
          <span className="al-stat-num">{stats.online}</span>
          <span className="al-stat-lbl">Online Now</span>
        </div>
        <div className="al-stat-div" />
        <div className="al-stat">
          <Shield size={14} className={`al-stat-icon${stats.security > 0 ? ' al-stat-icon--danger' : ' al-stat-icon--amber'}`} />
          <span className={`al-stat-num${stats.security > 0 ? ' al-stat-num--danger' : ''}`}>{stats.security}</span>
          <span className="al-stat-lbl">Security Events</span>
        </div>
      </div>

      {/* ── Analytics panel ── */}
      {showAnalytics && (
        <div className="al-analytics">
          <div className="al-analytics-title">
            <TrendingUp size={13} />
            Activity Analytics
            <span className="al-analytics-sub">based on current filters / visible data</span>
          </div>
          <div className="al-analytics-body">
            <div className="al-analytics-col al-analytics-col--wide">
              <div className="al-analytics-card-title"><Calendar size={12} />Daily Activity — last 14 days</div>
              <Sparkline data={dailyActivity} />
            </div>
            <div className="al-analytics-col">
              <div className="al-analytics-card-title"><Zap size={12} />Actions</div>
              <MiniBarChart items={actionChartData} />
            </div>
            <div className="al-analytics-col">
              <div className="al-analytics-card-title"><Shield size={12} />Severity</div>
              <MiniBarChart items={severityChartData} />
            </div>
          </div>
        </div>
      )}

      {/* ── Filters panel ── */}
      {showFilters && (
        <div className="al-filters">
          <div className="al-filter-search">
            <Search size={13} className="al-filter-search-icon" />
            <input
              type="text"
              placeholder="Search user, action, details, IP…"
              value={filters.search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select value={filters.action} onChange={e => handleFilter('action', e.target.value)}>
            <option value="">All actions</option>
            {Object.entries(ACTION_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={filters.severity} onChange={e => handleFilter('severity', e.target.value)}>
            <option value="">All severity</option>
            {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <div className="al-filter-date-range">
            <input type="date" value={filters.dateFrom} onChange={e => handleFilter('dateFrom', e.target.value)} title="From date" />
            <span>–</span>
            <input type="date" value={filters.dateTo} onChange={e => handleFilter('dateTo', e.target.value)} title="To date" />
          </div>
          {hasFilters && (
            <button className="al-clear-btn" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      )}

      {/* ── Log list ── */}
      <div className="settings-section__content">
        {logs.length === 0 ? (
          <div className="al-empty">
            <History size={36} className="al-empty-icon" />
            <p className="al-empty-title">No audit logs found</p>
            <p className="al-empty-desc">
              {hasFilters ? 'No logs match your filters — try adjusting or clearing them.' : 'Audit events will appear here as users interact with the system.'}
            </p>
            {hasFilters && <button className="al-clear-btn" onClick={clearFilters}>Clear filters</button>}
          </div>
        ) : (
          <div className="al-log-list">
            {logs.map(log => {
              const meta     = getActionMeta(log.action)
              const severity = SEVERITY_CONFIG[log.severity] ?? SEVERITY_CONFIG.info
              const headline = buildHeadline(log)
              const expanded = expandedId === log.id
              const hasChanges = !!log.changes

              return (
                <div
                  key={log.id}
                  className={`al-row${expanded ? ' al-row--open' : ''}`}
                  onClick={() => setExpandedId(expanded ? null : log.id)}
                >
                  {/* colour bar */}
                  <div className="al-row-bar" style={{ background: meta.color }} />

                  {/* action icon */}
                  <div className="al-row-icon" style={{ color: meta.color }}>
                    {meta.icon}
                  </div>

                  {/* main content */}
                  <div className="al-row-body">
                    {/* headline sentence */}
                    <div className="al-row-headline">
                      <span className="al-hl-user">{headline.user}</span>
                      <span className="al-hl-verb" style={{ color: meta.color }}>{headline.verb}</span>
                      <span className="al-hl-target">{headline.target}</span>
                      {hasChanges && <span className="al-changed-badge"><Edit3 size={10} /> changed</span>}
                    </div>
                    {/* details line — shown only when not expanded */}
                    {!expanded && log.details && (
                      <p className="al-row-detail">{log.details}</p>
                    )}
                  </div>

                  {/* right meta */}
                  <div className="al-row-meta">
                    {/* severity pill */}
                    <span
                      className="al-sev-pill"
                      style={{ color: severity.color, background: severity.bg }}
                    >
                      {severity.label}
                    </span>
                    {/* IP — always show if present */}
                    {log.ipAddress && (
                      <span className="al-row-ip" title="IP Address">
                        <Terminal size={10} />{log.ipAddress}
                      </span>
                    )}
                    <span className="al-row-time" title={formatFullTs(log.timestamp)}>
                      <Clock size={10} />{formatRelativeTime(log.timestamp)}
                    </span>
                    {expanded ? <ChevronUp size={13} className="al-row-chevron" /> : <ChevronDown size={13} className="al-row-chevron" />}
                  </div>

                  {/* expanded detail */}
                  {expanded && (
                    <div className="al-detail" onClick={e => e.stopPropagation()}>
                      {/* full details text */}
                      {log.details && (
                        <p className="al-detail-desc">{log.details}</p>
                      )}

                      {/* metadata grid */}
                      <div className="al-detail-grid">
                        <div className="al-detail-cell">
                          <Clock size={12} /><span className="al-dc-label">Time</span>
                          <span className="al-dc-value">{formatFullTs(log.timestamp)}</span>
                        </div>
                        <div className="al-detail-cell">
                          <User size={12} /><span className="al-dc-label">Performed by</span>
                          <span className="al-dc-value">
                            {log.userName}
                            {log.userRole && <span className="al-dc-role">{log.userRole}</span>}
                          </span>
                        </div>
                        <div className="al-detail-cell">
                          <Activity size={12} /><span className="al-dc-label">Action</span>
                          <span className="al-dc-value" style={{ color: meta.color }}>{meta.label}</span>
                        </div>
                        <div className="al-detail-cell">
                          <Database size={12} /><span className="al-dc-label">Entity</span>
                          <span className="al-dc-value">
                            {ENTITY_LABELS[log.entity] || log.entity}
                            {log.entityId && <span className="al-dc-id">#{log.entityId}</span>}
                            {log.entityName && <span className="al-dc-ename">"{log.entityName}"</span>}
                          </span>
                        </div>
                        {log.ipAddress && (
                          <div className="al-detail-cell">
                            <Globe size={12} /><span className="al-dc-label">IP Address</span>
                            <span className="al-dc-value al-dc-mono">{log.ipAddress}</span>
                          </div>
                        )}
                        {(log.browser || log.os || log.deviceType) && (
                          <div className="al-detail-cell">
                            <Laptop size={12} /><span className="al-dc-label">Device</span>
                            <span className="al-dc-value">
                              {[log.browser, log.os].filter(Boolean).join(', ')}
                              {log.deviceType && <span className="al-dc-device">{log.deviceType}</span>}
                            </span>
                          </div>
                        )}
                        {log.location && (
                          <div className="al-detail-cell">
                            <MapPin size={12} /><span className="al-dc-label">Location</span>
                            <span className="al-dc-value">{log.location}</span>
                          </div>
                        )}
                        <div className="al-detail-cell">
                          <Shield size={12} /><span className="al-dc-label">Severity</span>
                          <span className="al-dc-value" style={{ color: severity.color }}>{severity.label}</span>
                        </div>
                      </div>

                      {/* What changed */}
                      {hasChanges && (
                        <div className="al-changes-section">
                          <div className="al-changes-title">
                            <Edit3 size={12} />
                            What changed
                          </div>
                          <ChangesDisplay changes={log.changes} action={log.action} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* pagination */}
        {logs.length > 0 && (
          <div className="al-pagination">
            <span className="al-page-info">
              {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, totalElements)} of {totalElements.toLocaleString()} events
              {hasFilters && ' (filtered)'}
            </span>
            <div className="al-page-controls">
              <button className="al-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={13} />
              </button>
              <span className="al-page-label">Page {page} of {totalPages}</span>
              <button className="al-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLogSection
