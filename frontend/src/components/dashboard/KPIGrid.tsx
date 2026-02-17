import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    trendLabel?: string;
    icon: string;
    tier: 1 | 2;
    color?: string;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    trend,
    trendLabel,
    icon,
    tier,
    color = '#DC2626'
}) => {
    const isPositive = trend !== undefined && trend >= 0;
    const trendColor = isPositive ? '#10B981' : '#EF4444';

    return (
        <div style={{
            background: tier === 1
                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(30, 30, 30, 0.95) 100%)'
                : 'rgba(255, 255, 255, 0.02)',
            border: tier === 1
                ? '1px solid rgba(220, 38, 38, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: tier === 1 ? '20px 24px' : '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: tier === 1 ? 12 : 8,
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Icon & Title */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10
            }}>
                <span style={{
                    fontSize: tier === 1 ? 24 : 18,
                    opacity: 0.9
                }}>
                    {icon}
                </span>
                <div>
                    <h4 style={{
                        margin: 0,
                        color: 'rgba(249, 250, 251, 0.7)',
                        fontSize: tier === 1 ? 13 : 11,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {title}
                    </h4>
                    {subtitle && (
                        <span style={{
                            fontSize: 10,
                            color: 'rgba(249, 250, 251, 0.4)'
                        }}>
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            {/* Value */}
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8
            }}>
                <span style={{
                    fontSize: tier === 1 ? 36 : 24,
                    fontWeight: 700,
                    color: '#F9FAFB',
                    letterSpacing: '-1px'
                }}>
                    {value}
                </span>

                {trend !== undefined && (
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        fontSize: tier === 1 ? 13 : 11,
                        color: trendColor,
                        fontWeight: 600
                    }}>
                        {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
                        {trendLabel && (
                            <span style={{
                                color: 'rgba(249, 250, 251, 0.5)',
                                fontWeight: 400,
                                marginLeft: 4
                            }}>
                                {trendLabel}
                            </span>
                        )}
                    </span>
                )}
            </div>

            {/* Sparkline (simplified visual) */}
            {tier === 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 2,
                    height: 24,
                    marginTop: 4
                }}>
                    {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90].map((h, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: `${h}%`,
                                background: i === 9
                                    ? color
                                    : `rgba(${color === '#10B981' ? '16, 185, 129' : '220, 38, 38'}, 0.3)`,
                                borderRadius: 2,
                                transition: 'height 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Accent line for Tier 1 */}
            {tier === 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: color
                }} />
            )}
        </div>
    );
};

interface KPIGridProps {
    className?: string;
    stats: {
        revenue: number;
        revenueChange: number;
        activeMembers: number;
        maxCapacity: number;
        checkIns: number;
        pendingPayments: number;
        pendingCount: number;
    };
    loading?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ className, stats, loading = false }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className={className} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', // 4 columns
                gap: 16,
                marginBottom: 24
            }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 16,
                        height: 120, // Slightly shorter for 4-up
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                ))}
            </div>
        );
    }

    return (
        <div className={`kpi-grid ${className || ''}`}>
            {/* 1. Revenue */}
            <KPICard
                title="Today's Revenue"
                value={formatCurrency(stats.revenue)}
                trend={stats.revenueChange}
                trendLabel="vs yesterday"
                icon="💰"
                tier={1}
                color="#10B981" // Emerald
            />

            {/* 2. Active Now */}
            <KPICard
                title="Active Now"
                subtitle={`${Math.round((stats.activeMembers / stats.maxCapacity) * 100)}% Capacity`}
                value={stats.activeMembers}
                icon="🏃"
                tier={1}
                color="#3B82F6" // Blue
            />

            {/* 3. Check-ins */}
            <KPICard
                title="Check-ins Today"
                value={stats.checkIns}
                trend={8} // Mock trend for checkins if not available
                trendLabel="vs yesterday"
                icon="📍"
                tier={1}
                color="#F59E0B" // Amber
            />

            {/* 4. Pending Payments */}
            <KPICard
                title="Pending Payments"
                subtitle={`${stats.pendingCount} Overdue`}
                value={formatCurrency(stats.pendingPayments)}
                icon="💳"
                tier={1}
                color="#EF4444" // Red
            />
        </div>
    );
};

export default KPIGrid;

