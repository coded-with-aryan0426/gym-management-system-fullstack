import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Bell, Server, CreditCard, Users, Wrench, AlertTriangle,
  CheckCheck, X, Clock, TrendingUp, Shield, Loader, RefreshCw,
  Activity, Info
} from 'lucide-react';
import { superAdminApi } from '../../services/superAdminApi';
import type {
  SuperAdminAlert, SuperAdminActivityItem, SuperAdminAuditLogEntry
} from '../../services/superAdminApi';
import './SANotifications.css';

// ── Types ──
type NotificationType = 'system' | 'billing' | 'user' | 'maintenance' | 'critical';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
  source: 'alert' | 'activity' | 'audit';
  severity?: string;
}

// ── Persistence for read/dismissed state ──
const SA_NOTIF_READ_KEY = 'sa_notifications_read';
const SA_NOTIF_DISMISSED_KEY = 'sa_notifications_dismissed';

function getReadIds(): Set<string> {
  try {
    const stored = localStorage.getItem(SA_NOTIF_READ_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch { return new Set(); }
}

function getDismissedIds(): Set<string> {
  try {
    const stored = localStorage.getItem(SA_NOTIF_DISMISSED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch { return new Set(); }
}

function persistReadIds(ids: Set<string>) {
  localStorage.setItem(SA_NOTIF_READ_KEY, JSON.stringify([...ids]));
}

function persistDismissedIds(ids: Set<string>) {
  localStorage.setItem(SA_NOTIF_DISMISSED_KEY, JSON.stringify([...ids]));
}

// ── Map alert severity to notification type ──
function mapAlertToType(alert: SuperAdminAlert): NotificationType {
  if (alert.severity === 'critical') return 'critical';
  if (alert.source?.toLowerCase().includes('security') || alert.affectedService?.toLowerCase().includes('auth')) return 'critical';
  if (alert.source?.toLowerCase().includes('billing') || alert.source?.toLowerCase().includes('payment')) return 'billing';
  if (alert.source?.toLowerCase().includes('user')) return 'user';
  if (alert.severity === 'warning') return 'maintenance';
  return 'system';
}

function mapActivityToType(item: SuperAdminActivityItem): NotificationType {
  const msg = (item.message || '').toLowerCase();
  const type = (item.type || '').toLowerCase();
  if (item.severity === 'critical' || item.severity === 'high') return 'critical';
  if (type.includes('billing') || type.includes('payment') || msg.includes('subscription') || msg.includes('payment')) return 'billing';
  if (type.includes('user') || type.includes('registration') || msg.includes('registered') || msg.includes('login')) return 'user';
  if (type.includes('maintenance') || msg.includes('maintenance') || msg.includes('backup')) return 'maintenance';
  return 'system';
}

function mapAuditToType(log: SuperAdminAuditLogEntry): NotificationType {
  const action = (log.action || '').toLowerCase();
  if (log.severity === 'critical' || log.severity === 'high') return 'critical';
  if (action.includes('payment') || action.includes('subscription') || action.includes('billing')) return 'billing';
  if (action.includes('user') || action.includes('login') || action.includes('register')) return 'user';
  return 'system';
}

// ── Relative time helper ──
function getRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return timestamp || 'Unknown';
  }
}

function getDateGroup(timestamp: string, fallbackTime?: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This Week';
    return 'Earlier';
  } catch {
    if (fallbackTime?.includes('hour') || fallbackTime?.includes('min')) return 'Today';
    if (fallbackTime?.includes('day') && fallbackTime?.includes('1')) return 'Yesterday';
    return 'This Week';
  }
}

const typeConfig: Record<NotificationType, { icon: typeof Bell; label: string }> = {
  system: { icon: Server, label: 'System' },
  billing: { icon: CreditCard, label: 'Billing' },
  user: { icon: Users, label: 'Users' },
  maintenance: { icon: Wrench, label: 'Maintenance' },
  critical: { icon: AlertTriangle, label: 'Critical' },
};

type FilterType = 'all' | NotificationType;

export default function SANotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(getDismissedIds);

  // ── Load notifications from real APIs ──
  const loadNotifications = useCallback(async (showRefreshToast = false) => {
    try {
      const [dashboardData, auditLogs] = await Promise.all([
        superAdminApi.getDashboard().catch(() => null),
        superAdminApi.getAuditLogs(30).catch(() => []),
      ]);

      const allNotifications: Notification[] = [];

      // Map dashboard alerts
      if (dashboardData?.alerts) {
        dashboardData.alerts.forEach((alert, idx) => {
          allNotifications.push({
            id: `alert-${alert.id || idx}`,
            type: mapAlertToType(alert),
            title: alert.title,
            message: alert.description || `${alert.metric} — ${alert.affectedService}`,
            time: getRelativeTime(alert.time),
            date: getDateGroup(alert.time, alert.time),
            read: readIds.has(`alert-${alert.id || idx}`),
            source: 'alert',
            severity: alert.severity,
          });
        });
      }

      // Map dashboard activity stream
      if (dashboardData?.activityStream) {
        dashboardData.activityStream.forEach((item, idx) => {
          allNotifications.push({
            id: `activity-${idx}`,
            type: mapActivityToType(item),
            title: item.type ? `${item.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : 'System Activity',
            message: item.message,
            time: getRelativeTime(item.time),
            date: getDateGroup(item.time, item.time),
            read: readIds.has(`activity-${idx}`),
            source: 'activity',
            severity: item.severity,
          });
        });
      }

      // Map audit logs
      if (auditLogs.length > 0) {
        auditLogs.forEach(log => {
          allNotifications.push({
            id: `audit-${log.id}`,
            type: mapAuditToType(log),
            title: `${log.action}: ${log.entityName || log.entity}`,
            message: `${log.details || ''} — by ${log.userName} (${log.userRole})`,
            time: getRelativeTime(log.timestamp),
            date: getDateGroup(log.timestamp),
            read: readIds.has(`audit-${log.id}`),
            source: 'audit',
            severity: log.severity,
          });
        });
      }

      // Filter out dismissed, sort by date relevance
      const dateOrder: Record<string, number> = { 'Today': 0, 'Yesterday': 1, 'This Week': 2, 'Earlier': 3 };
      allNotifications.sort((a, b) => (dateOrder[a.date] ?? 99) - (dateOrder[b.date] ?? 99));

      setNotifications(allNotifications.filter(n => !dismissedIds.has(n.id)));

      if (showRefreshToast) {
        toast.success(`Loaded ${allNotifications.length} notifications`);
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      toast.error('Failed to load notifications');
    }
  }, [readIds, dismissedIds]);

  useEffect(() => {
    setIsLoading(true);
    loadNotifications().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadNotifications(true);
    setIsRefreshing(false);
  }, [loadNotifications]);

  // ── Filtered & computed ──
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    notifications.forEach(n => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];
    order.forEach(date => {
      const items = filteredNotifications.filter(n => n.date === date);
      if (items.length > 0) groups[date] = items;
    });
    return groups;
  }, [filteredNotifications]);

  // ── Actions (persisted) ──
  const handleMarkAllRead = useCallback(() => {
    const newReadIds = new Set(readIds);
    notifications.forEach(n => newReadIds.add(n.id));
    setReadIds(newReadIds);
    persistReadIds(newReadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  }, [notifications, readIds]);

  const handleDismiss = useCallback((id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    persistDismissedIds(newDismissed);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [dismissedIds]);

  const handleMarkRead = useCallback((id: string) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    persistReadIds(newReadIds);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, [readIds]);

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: 'Critical' },
    { id: 'system', label: 'System' },
    { id: 'billing', label: 'Billing' },
    { id: 'user', label: 'Users' },
    { id: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <div className="sa">
      <div className="sa__header">
        <div className="sa__header-left">
          <h1>Notifications</h1>
          <p>System alerts, billing updates, and activity feed — live from backend</p>
        </div>
        <div className="sa__header-right">
          <button
            className="sa-notif-mark-read"
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ gap: 5 }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'sa__refresh-btn--spinning' : ''} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <span className="sa__live-pill">
              <span className="sa__live-dot" />
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="sa__kpi-row">
        <div className="sa__kpi sa__kpi--rose">
          <div className="sa__kpi-icon"><Bell size={14} /></div>
          <div className="sa__kpi-body">
            <span className="sa__kpi-label">Unread</span>
            <span className="sa__kpi-value">{unreadCount}</span>
          </div>
        </div>
        <div className="sa__kpi sa__kpi--blue">
          <div className="sa__kpi-icon"><Clock size={14} /></div>
          <div className="sa__kpi-body">
            <span className="sa__kpi-label">Today</span>
            <span className="sa__kpi-value">{notifications.filter(n => n.date === 'Today').length}</span>
          </div>
        </div>
        <div className="sa__kpi sa__kpi--red">
          <div className="sa__kpi-icon"><AlertTriangle size={14} /></div>
          <div className="sa__kpi-body">
            <span className="sa__kpi-label">Critical</span>
            <span className="sa__kpi-value">{notifications.filter(n => n.type === 'critical').length}</span>
          </div>
        </div>
        <div className="sa__kpi sa__kpi--emerald">
          <div className="sa__kpi-icon"><TrendingUp size={14} /></div>
          <div className="sa__kpi-body">
            <span className="sa__kpi-label">Total</span>
            <span className="sa__kpi-value">{notifications.length}</span>
          </div>
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="sa-notif-header-row">
        <div className="sa-notif-filters">
          {filters.map(f => (
            <button key={f.id}
              className={`sa-notif-filter ${activeFilter === f.id ? 'sa-notif-filter--active' : ''}`}
              onClick={() => setActiveFilter(f.id)}>
              {f.label}
              {(typeCounts[f.id] || 0) > 0 && (
                <span className="sa-notif-filter__count">{typeCounts[f.id]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="sa-notif-actions">
          {unreadCount > 0 && (
            <button className="sa-notif-mark-read" onClick={handleMarkAllRead}>
              <CheckCheck size={13} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 10, color: 'var(--text-muted)' }}>
          <Loader size={18} className="sa__refresh-btn--spinning" />
          <span>Loading notifications from backend...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="sa-notif-empty">
          <Bell size={36} />
          <span className="sa-notif-empty__title">No notifications</span>
          <span className="sa-notif-empty__desc">
            {activeFilter === 'all'
              ? 'All caught up! No notifications to display.'
              : `No ${activeFilter} notifications found.`}
          </span>
        </div>
      ) : (
        <div className="sa-notif-list">
          {Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date} className="sa-notif-date-group">
              <div className="sa-notif-date-label">{date}</div>
              {items.map(notification => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                return (
                  <div key={notification.id}
                    className={`sa-notif-item ${!notification.read ? 'sa-notif-item--unread' : ''}`}
                    onClick={() => handleMarkRead(notification.id)}>
                    <div className={`sa-notif-icon sa-notif-icon--${notification.type}`}>
                      <Icon size={15} />
                    </div>
                    <div className="sa-notif-content">
                      <div className="sa-notif-title">{notification.title}</div>
                      <div className="sa-notif-message">{notification.message}</div>
                      <div className="sa-notif-meta">
                        <span className={`sa-notif-type-badge sa-notif-type-badge--${notification.type}`}>
                          {config.label}
                        </span>
                        <span className={`sa-notif-type-badge sa-notif-type-badge--${notification.source === 'alert' ? 'critical' : notification.source === 'audit' ? 'system' : 'user'}`}>
                          {notification.source}
                        </span>
                        <span className="sa-notif-time">{notification.time}</span>
                      </div>
                    </div>
                    <button className="sa-notif-dismiss"
                      onClick={e => { e.stopPropagation(); handleDismiss(notification.id); }}
                      title="Dismiss">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
