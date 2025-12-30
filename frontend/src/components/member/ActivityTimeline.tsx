import React from 'react';
import { Calendar, CheckCircle, Trophy, UserPlus } from 'lucide-react';

interface ActivityItem {
    id: number;
    type: 'ATTENDANCE' | 'BOOKING' | 'ACHIEVEMENT' | 'MEMBERSHIP';
    title: string;
    timestamp: string;
}

const ActivityTimeline: React.FC = () => {
    // Mock data for now
    const activities: ActivityItem[] = [
        { id: 1, type: 'ATTENDANCE', title: 'Attended Yoga Class', timestamp: 'Today, 9:00 AM' },
        { id: 2, type: 'BOOKING', title: 'Booked HIIT Training', timestamp: 'Yesterday' },
        { id: 3, type: 'MEMBERSHIP', title: 'Membership Renewed', timestamp: 'Mar 1, 2024' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'ATTENDANCE': return <CheckCircle size={14} className="text-green-500" />;
            case 'BOOKING': return <Calendar size={14} className="text-blue-500" />;
            case 'ACHIEVEMENT': return <Trophy size={14} className="text-amber-500" />;
            default: return <UserPlus size={14} className="text-purple-500" />;
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {activities.map((item, index) => (
                    <div key={item.id} className="relative pl-6">
                        {/* Vertical Line */}
                        {index !== activities.length - 1 && (
                            <div className="absolute left-[7px] top-6 bottom-[-16px] w-[2px] bg-zinc-800"></div>
                        )}

                        {/* Dot */}
                        <div className="absolute left-0 top-1 p-1 bg-zinc-800 rounded-full border border-zinc-700">
                            {getIcon(item.type)}
                        </div>

                        <div>
                            <div className="text-sm font-medium text-white">{item.title}</div>
                            <div className="text-xs text-zinc-500">{item.timestamp}</div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 text-xs text-zinc-500 hover:text-white transition-colors py-2 border-t border-zinc-800">
                View All Activity
            </button>
        </div>
    );
};

export default ActivityTimeline;
