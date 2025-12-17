import React from 'react';
import './FinancialAlerts.css';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

const FinancialAlerts: React.FC = () => {
    // Mock Alerts - In prod, these would be derived from data
    const alerts: Alert[] = [
        {
            id: '1',
            type: 'critical',
            message: '3 Invoices are overdue by > 7 days',
            actionLabel: 'View Invoices'
        },
        {
            id: '2',
            type: 'warning',
            message: 'Utility expense is 18% higher than last month',
            actionLabel: 'Check Usage'
        }
    ];

    return (
        <div className="financial-alerts-container">
            {alerts.map(alert => (
                <div key={alert.id} className={`financial-alert alert--${alert.type}`}>
                    <div className="alert-content">
                        <span className="alert-icon">
                            {alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <span className="alert-message">{alert.message}</span>
                    </div>
                    {alert.actionLabel && (
                        <button className="alert-action-btn">
                            {alert.actionLabel} →
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FinancialAlerts;
