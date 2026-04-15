import React, { useState, useCallback, useMemo } from 'react';
import {
  Bell, Server, CreditCard, Users, Wrench, AlertTriangle,
  Check, CheckCheck, X, Clock, TrendingUp, Shield, Zap
} from 'lucide-react';
import './SANotifications.css';

// ── Types ──
type NotificationType = 'system' | 'billing' | 'user' | 'maintenance' | 'critical';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
}

// ── Mock Data ──
const initialNotifications: Notification[] = [
  // Today
  {
    id: 1, type: 'critical', title: 'API Error Rate Spike',
    message: 'Error rate exceeded 1% threshold for endpoint /api/members. Current rate: 2.3%. Auto-scaling triggered.',
    time: '12 min ago', date: 'Today', read: false,
  },
  {
    id: 2, type: 'billing', title: 'New Subscription: PowerHouse Gym',
    message: 'Amit Patel upgraded from Trial to Enterprise plan. Monthly revenue impact: +₹4,999/mo.',
    time: '1 hour ago', date: 'Today', read: false,
  },
  {
    id: 3, type: 'user', title: 'New Gym Registered',
    message: 'FlexFit Studio (Delhi) registered by Vikram Singh. Auto-assigned 14-day trial on Starter plan.',
    time: '3 hours ago', date: 'Today', read: false,
  },
  {
    id: 4, type: 'system', title: 'Database Backup Completed',
    message: 'Daily automated backup completed successfully. Size: 2.4 GB. Stored in S3 bucket ap-south-1.',
    time: '5 hours ago', date: 'Today', read: true,
  },
  // Yesterday
  {
    id: 5, type: 'billing', title: 'Payment Failed: IronFit Studio',
    message: 'Recurring payment of ₹2,499 failed for Priya Sharma (IronFit Studio). Card ending 4242 declined. Retry scheduled in 24h.',
    time: '1 day ago', date: 'Yesterday', read: true,
  },
  {
    id: 6, type: 'maintenance', title: 'Scheduled Maintenance Window',
    message: 'Planned database maintenance on April 20, 2:00 AM - 4:00 AM IST. Expected downtime: ~15 minutes.',
    time: '1 day ago', date: 'Yesterday', read: true,
  },
  {
    id: 7, type: 'user', title: 'Owner Account Deactivated',
    message: 'Account for Sneha Reddy (Flex Gym) auto-deactivated due to subscription expiry after 30-day grace period.',
    time: '1 day ago', date: 'Yesterday', read: true,
  },
  {
    id: 8, type: 'system', title: 'SSL Certificate Renewal',
    message: 'SSL certificate for api.athlonx.com renewed successfully. New expiry: October 14, 2026.',
    time: '1 day ago', date: 'Yesterday', read: true,
  },
  // This Week
  {
    id: 9, type: 'billing', title: 'Monthly Revenue Report Ready',
    message: 'March 2026 revenue summary: ₹2,45,000 MRR (+12.5%). 142 active subscriptions. Export available.',
    time: '3 days ago', date: 'This Week', read: true,
  },
  {
    id: 10, type: 'critical', title: 'Security: Brute Force Detected',
    message: 'Multiple failed login attempts detected from IP 103.21.xx.xx targeting admin accounts. IP temporarily blocked.',
    time: '4 days ago', date: 'This Week', read: true,
  },
  {
    id: 11, type: 'system', title: 'Feature Flag Updated',
    message: 'Feature "diet-management" rolled out to 100% of Pro and Enterprise users by admin@titan.io.',
    time: '5 days ago', date: 'This Week', read: true,
  },
  {
    id: 12, type: 'maintenance', title: 'Infrastructure Upgrade Complete',
    message: 'Oracle DB upgraded to 21c. Connection pool increased from 50 to 100. All health checks passing.',
    time: '6 days ago', date: 'This Week', read: true,
  },
];

const typeConfig: Record<NotificationType, { icon: typeof Bell; label: string }> = {
  system: { icon: Server, label: 'System' },
  billing: { icon: CreditCard, label: 'Billing' },
  user: { icon: Users, label: 'Users' },
  maintenance: { icon: Wrench, label: 'Maintenance' },
  critical: { icon: AlertTriangle, label: 'Critical' },
};

type FilterType = 'all' | NotificationType;

export default function SANotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

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

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filteredNotifications.forEach(n => {
      if (!groups[n.date]) groups[n.date] = [];
      groups[n.date].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleDismiss = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleMarkRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

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
          <p>System alerts, billing updates, and activity feed</p>
        </div>
        <div className="sa__header-right">
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
            <span className="sa__kpi-label">This Week</span>
            <span className="sa__kpi-value">{notifications.length}</span>
          </div>
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="sa-notif-header-row">
        <div className="sa-notif-filters">
          {filters.map(f => (
            <button
              key={f.id}
              className={`sa-notif-filter ${activeFilter === f.id ? 'sa-notif-filter--active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
              {typeCounts[f.id] ? (
                <span className="sa-notif-filter__count">{typeCounts[f.id]}</span>
              ) : null}
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

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
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
                  <div
                    key={notification.id}
                    className={`sa-notif-item ${!notification.read ? 'sa-notif-item--unread' : ''}`}
                    onClick={() => handleMarkRead(notification.id)}
                  >
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
                        <span className="sa-notif-time">{notification.time}</span>
                      </div>
                    </div>
                    <button
                      className="sa-notif-dismiss"
                      onClick={e => {
                        e.stopPropagation();
                        handleDismiss(notification.id);
                      }}
                      title="Dismiss"
                    >
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
