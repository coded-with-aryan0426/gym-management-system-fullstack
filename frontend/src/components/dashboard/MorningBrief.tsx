import React, { useState, useEffect } from 'react';
import { AlertCard } from './AlertCard';
import api from '../../services/api';

interface Alert {
    alertId: number;
    type: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'danger';
    createdAt: string;
    isRead: boolean;
}

interface MorningBriefProps {
    onNavigateToMembers?: () => void;
    onNavigateToPayments?: () => void;
}

export const MorningBrief: React.FC<MorningBriefProps> = ({
    onNavigateToMembers,
    onNavigateToPayments
}) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [alertsRes, metricsRes] = await Promise.all([
                    api.get('/dashboard/alerts'),
                    api.get('/dashboard/metrics')
                ]);
                setAlerts(alertsRes.data || []);
                setMetrics(metricsRes.data || {});
            } catch (err) {
                console.error('Failed to fetch morning brief:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Generate smart alerts based on metrics
    const smartAlerts = [
        ...(metrics.unreadAlerts > 0 ? [{
            type: 'system' as const,
            title: 'Unread Alerts',
            count: metrics.unreadAlerts,
            severity: 'info' as const,
            message: 'You have pending notifications'
        }] : []),
        ...alerts.slice(0, 3).map(alert => ({
            type: alert.type?.toLowerCase() as 'expiring' | 'overdue' | 'attendance' | 'system' | 'info',
            title: alert.title,
            message: alert.message,
            severity: alert.severity,
            count: undefined
        }))
    ];

    const unreadCount = alerts.filter(a => !a.isRead).length;
    const criticalCount = alerts.filter(a => a.severity === 'danger').length;

    if (isLoading) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24
            }}>
                <div style={{ color: 'rgba(249, 250, 251, 0.5)', textAlign: 'center' }}>
                    Loading morning brief...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(30, 30, 30, 0.9) 100%)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            borderRadius: 16,
            padding: isCollapsed ? '12px 20px' : 20,
            marginBottom: 24,
            transition: 'all 0.3s ease'
        }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    marginBottom: isCollapsed ? 0 : 16
                }}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>☀️</span>
                    <div>
                        <h3 style={{
                            margin: 0,
                            color: '#F9FAFB',
                            fontSize: 18,
                            fontWeight: 700
                        }}>
                            Morning Brief
                        </h3>
                        {isCollapsed && (
                            <span style={{
                                fontSize: 12,
                                color: 'rgba(249, 250, 251, 0.5)'
                            }}>
                                {unreadCount} alerts • {criticalCount} critical
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {criticalCount > 0 && (
                        <span style={{
                            background: '#DC2626',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 700
                        }}>
                            {criticalCount} Critical
                        </span>
                    )}
                    <span style={{
                        color: 'rgba(249, 250, 251, 0.5)',
                        transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                        transition: 'transform 0.2s ease'
                    }}>
                        ▼
                    </span>
                </div>
            </div>

            {/* Alert Cards */}
            {!isCollapsed && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 12
                }}>
                    {smartAlerts.length > 0 ? (
                        smartAlerts.map((alert, index) => (
                            <AlertCard
                                key={index}
                                type={alert.type || 'info'}
                                title={alert.title}
                                count={alert.count}
                                message={alert.message}
                                severity={alert.severity}
                                actionLabel={alert.type === 'expiring' ? 'View' : undefined}
                                onAction={alert.type === 'expiring' ? onNavigateToMembers : undefined}
                            />
                        ))
                    ) : (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: 24,
                            color: 'rgba(249, 250, 251, 0.5)'
                        }}>
                            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>✅</span>
                            All clear! No alerts this morning.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MorningBrief;
