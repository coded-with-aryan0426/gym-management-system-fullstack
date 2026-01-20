import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export interface ActivityItem {
    id: string | number;
    name: string;
    type: 'cancel' | 'freeze' | 'signup' | 'checkin';
    date: string;
    reason?: string;
}

interface ActivityFeedProps {
    items: ActivityItem[];
    title?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
    items, 
    title = "Recent Activity" 
}) => {
    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const getTypeLabel = (type: string) => {
        switch(type) {
            case 'cancel': return 'Cancelled';
            case 'freeze': return 'Frozen';
            case 'signup': return 'New Member';
            case 'checkin': return 'Checked In';
            default: return type;
        }
    };

    return (
        <motion.div className="dash-section dash-section--activity" variants={itemVariants}>
            <div className="dash-section__header">
                <div className="dash-section__title">
                    <Clock size={18} />
                    <h2>{title}</h2>
                </div>
            </div>
            <div className="dash-section__content">
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Action</th>
                            <th>Date</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.name}</td>
                                <td>
                                    <span className={`activity-badge activity-badge--${item.type}`}>
                                        {getTypeLabel(item.type)}
                                    </span>
                                </td>
                                <td>{item.date}</td>
                                <td>{item.reason || '-'}</td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center text-muted">No recent activity</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default ActivityFeed;
