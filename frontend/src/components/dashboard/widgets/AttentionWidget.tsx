import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WidgetPanel from '../shared/WidgetPanel';
import type { ExpiringMember, OverduePayment } from '../types';

interface AttentionWidgetProps {
    expiringMembers: ExpiringMember[];
    overduePayments: OverduePayment[];
    variants?: any;
    className?: string;
}

const AttentionWidget: React.FC<AttentionWidgetProps> = ({
    expiringMembers,
    overduePayments,
    variants,
    className
}) => {
    const navigate = useNavigate();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(value)
    }

    return (
        <WidgetPanel
            title="Attention Required"
            icon={AlertCircle}
            onAction={() => navigate('/members')}
            actionLabel="View Members"
            className={["dash-section--alerts", className].filter(Boolean).join(" ")}
            variants={variants}
        >
            <div className="alert-group">
                <div className="alert-group__header">
                    <Clock size={14} />
                    <span>Expiring Soon</span>
                    <span className="alert-group__badge">{expiringMembers.length}</span>
                </div>
                {expiringMembers.map((member, idx) => (
                    <div key={idx} className="alert-row">
                        <span className="alert-row__name">{member.name}</span>
                        <span className="alert-row__plan">{member.plan}</span>
                        <span className={`alert-row__days ${member.daysLeft <= 3 ? 'urgent' : 'warning'}`}>
                            {member.daysLeft}d
                        </span>
                    </div>
                ))}
            </div>
            <div className="alert-group alert-group--urgent">
                <div className="alert-group__header">
                    <AlertCircle size={14} />
                    <span>Overdue Payments</span>
                    <span className="alert-group__badge alert-group__badge--urgent">{overduePayments.length}</span>
                </div>
                {overduePayments.map((payment, idx) => (
                    <div key={idx} className="alert-row">
                        <span className="alert-row__name">{payment.name}</span>
                        <span className="alert-row__amount">{formatCurrency(payment.amount)}</span>
                    </div>
                ))}
            </div>
        </WidgetPanel>
    );
};

export default AttentionWidget;
