import React from 'react';
import { Calendar, CheckCircle, Trophy, UserPlus } from 'lucide-react';
import './MemberComponents.css';

interface ActivityItem {
    id: number;
    type: 'ATTENDANCE' | 'BOOKING' | 'ACHIEVEMENT' | 'MEMBERSHIP';
    title: string;
    timestamp: string;
}

const ActivityTimeline: React.FC = () => {
    const activities: ActivityItem[] = [
        { id: 1, type: 'ATTENDANCE', title: 'Attended Yoga Class', timestamp: 'Today, 9:00 AM' },
        { id: 2, type: 'BOOKING', title: 'Booked HIIT Training', timestamp: 'Yesterday' },
        { id: 3, type: 'MEMBERSHIP', title: 'Membership Renewed', timestamp: 'Mar 1, 2024' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'ATTENDANCE': return <CheckCircle size={14} style={{ color: '#22c55e' }} />;
            case 'BOOKING': return <Calendar size={14} style={{ color: '#3b82f6' }} />;
            case 'ACHIEVEMENT': return <Trophy size={14} style={{ color: '#f59e0b' }} />;
            default: return <UserPlus size={14} style={{ color: '#a855f7' }} />;
        }
    };

    return (
        <div className="activity-timeline">
            <h3 className="activity-timeline__title">Recent Activity</h3>
            <div className="activity-timeline__list">
                {activities.map((item, ai) => (
                    <div key={`activity-${ai}-${item.id ?? ''}`} className="activity-item">
                        <div className="activity-item__icon">
                            {getIcon(item.type)}
                        </div>
                        <div className="activity-item__title">{item.title}</div>
                        <div className="activity-item__time">{item.timestamp}</div>
                    </div>
                ))}
            </div>
            <button className="activity-timeline__footer">
                View All Activity
            </button>
        </div>
    );
};

export default ActivityTimeline;
