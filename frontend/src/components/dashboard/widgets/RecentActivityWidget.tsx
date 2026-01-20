import React from 'react';
import { Clock } from 'lucide-react';
import WidgetPanel from '../shared/WidgetPanel';
import type { Cancellation } from '../types';

interface RecentActivityWidgetProps {
    cancellations: Cancellation[];
    variants?: any;
    className?: string;
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ cancellations, variants, className }) => {
    return (
        <WidgetPanel
            title="Recent Activity"
            icon={Clock}
            className={`dash-section--activity ${className || ''}`}
            variants={variants}
        >
            <table className="activity-table">
                <thead>
                    <tr>
                        <th>Member</th>
                        <th>Action</th>
                        <th>Date</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {cancellations.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.name}</td>
                            <td>
                                <span className={`activity-badge activity-badge--${item.type}`}>
                                    {item.type === 'cancel' ? 'Cancelled' : 'Frozen'}
                                </span>
                            </td>
                            <td>{item.date}</td>
                            <td>{item.reason}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </WidgetPanel>
    );
};

export default RecentActivityWidget;
