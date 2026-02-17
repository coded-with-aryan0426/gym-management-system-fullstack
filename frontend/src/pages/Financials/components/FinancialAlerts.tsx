import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import './FinancialAlerts.css';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    actionLabel?: string;
}

interface FinancialAlertsProps {
    pendingCount: number;
    pendingAmount: number;
}

const FinancialAlerts: React.FC<FinancialAlertsProps> = ({ pendingCount, pendingAmount }) => {
    const alerts: Alert[] = [];

    if (pendingCount > 0) {
        alerts.push({
            id: '1',
            type: 'critical',
            title: 'Overdue Payments',
            message: `${pendingCount} invoices totaling ${formatCurrency(pendingAmount)} are pending`,
            actionLabel: 'Collect Now'
        });
    }

    alerts.push({
        id: '2',
        type: 'warning',
        title: 'Expense Alert',
        message: 'Utility costs are 18% above last month',
        actionLabel: 'Review'
    });

    alerts.push({
        id: '3',
        type: 'info',
        title: 'Revenue Milestone',
        message: 'Monthly target 78% achieved',
        actionLabel: 'View Stats'
    });

    const getIcon = (type: Alert['type']) => {
        switch (type) {
            case 'critical':
                return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                );
            case 'warning':
                return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                );
            default:
                return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                );
        }
    };

    return (
        <div className="alerts-list">
            {alerts.map(alert => (
                <div key={alert.id} className={`alert-item alert-item--${alert.type}`}>
                    <div className={`alert-icon alert-icon--${alert.type}`}>
                        {getIcon(alert.type)}
                    </div>
                    <div className="alert-content">
                        <span className="alert-title">{alert.title}</span>
                        <span className="alert-message">{alert.message}</span>
                    </div>
                    {alert.actionLabel && (
                        <button className={`alert-action alert-action--${alert.type}`}>
                            {alert.actionLabel}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FinancialAlerts;
