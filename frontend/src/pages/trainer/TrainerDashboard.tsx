import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, Calendar, Clock, Activity, Bell, FileText, 
    MessageSquare, TrendingUp, ChevronRight, Plus, 
    BarChart3, Dumbbell, Timer
} from 'lucide-react';
import './TrainerDashboard.css';

interface DashboardData {
    trainerName: string;
    assignedMembers: number;
    todaysClasses: number;
    upcomingSessions: number;
    attendanceRate: number;
}

const TrainerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);

    useEffect(() => {
        setData({
            trainerName: 'John',
            assignedMembers: 12,
            todaysClasses: 3,
            upcomingSessions: 5,
            attendanceRate: 94
        });
    }, []);

    if (!data) return <div className="trainer-loading">Loading...</div>;

    const stats = [
        { 
            label: 'Assigned Members', 
            value: data.assignedMembers, 
            change: '+2 this week', 
            changeType: 'positive',
            icon: Users, 
            color: '#4F46E5',
            onClick: () => navigate('/trainer/members') 
        },
        { 
            label: "Today's Classes", 
            value: data.todaysClasses, 
            sub: 'Next: 9:00 AM', 
            icon: Calendar, 
            color: '#10B981',
            onClick: () => navigate('/trainer/classes') 
        },
        { 
            label: 'Upcoming Sessions', 
            value: data.upcomingSessions, 
            sub: 'This Week', 
            icon: Clock, 
            color: '#F59E0B',
            onClick: () => navigate('/trainer/schedule') 
        },
        { 
            label: 'Attendance Rate', 
            value: `${data.attendanceRate}%`, 
            change: '+3% from last', 
            changeType: 'positive',
            icon: Activity, 
            color: '#EF4444',
            onClick: () => navigate('/trainer/reports') 
        },
    ];

    const schedule = [
        { time: '9:00 AM', title: 'Yoga Class', room: 'Room A', enrolled: 8, capacity: 15, icon: '🧘' },
        { time: '11:00 AM', title: 'HIIT Session', room: 'Studio 2', enrolled: 12, capacity: 15, icon: '💪' },
        { time: '2:00 PM', title: 'Personal Training', room: 'Gym Floor', enrolled: 1, capacity: 1, icon: '🏋️' },
    ];

    const activities = [
        { text: 'Sarah Wilson booked your Yoga class', time: '2 hours ago', type: 'success', icon: '✅' },
        { text: 'Mike Johnson cancelled session', time: '4 hours ago', type: 'danger', icon: '❌' },
        { text: 'Progress note added for David Lee', time: 'Yesterday', type: 'info', icon: '📝' },
        { text: 'New member assigned: Emma Davis', time: 'Yesterday', type: 'success', icon: '👤' },
    ];

    const quickActions = [
        { icon: Bell, label: 'Send Notification', desc: 'Notify members', color: '#4F46E5', path: '/trainer/notifications' },
        { icon: FileText, label: 'Add Progress Note', desc: 'Document progress', color: '#10B981', path: '/trainer/progress-notes' },
        { icon: Calendar, label: 'Schedule PT', desc: 'Personal training', color: '#F59E0B', path: '/trainer/schedule' },
        { icon: MessageSquare, label: 'Message Member', desc: 'Send message', color: '#3B82F6', path: '/trainer/messages' },
    ];

    return (
        <div className="trainer-dashboard">
            {/* Page Header */}
            <div className="trainer-dashboard__header">
                <div className="trainer-dashboard__header-content">
                    <div className="trainer-dashboard__welcome">
                        <h1>Welcome back, {data.trainerName}! 👋</h1>
                        <p>Here's what's happening with your members today</p>
                    </div>
                </div>
            </div>

            <div className="trainer-dashboard__content">
                {/* Stats Cards */}
                <div className="trainer-dashboard__stats">
                    {stats.map((stat, idx) => (
                        <button
                            key={idx}
                            onClick={stat.onClick}
                            className="trainer-stat-card"
                        >
                            <div 
                                className="trainer-stat-card__icon"
                                style={{ backgroundColor: `${stat.color}15` }}
                            >
                                <stat.icon size={24} style={{ color: stat.color }} />
                            </div>
                            <div className="trainer-stat-card__value">{stat.value}</div>
                            <div className="trainer-stat-card__label">{stat.label}</div>
                            {stat.change && (
                                <div className={`trainer-stat-card__change trainer-stat-card__change--${stat.changeType}`}>
                                    <TrendingUp size={12} />
                                    {stat.change}
                                </div>
                            )}
                            {stat.sub && (
                                <div className="trainer-stat-card__sub">{stat.sub}</div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="trainer-dashboard__grid">
                    {/* Left Column */}
                    <div className="trainer-dashboard__main">
                        {/* Today's Schedule */}
                        <div className="trainer-card">
                            <div className="trainer-card__header">
                                <h2>Today's Schedule</h2>
                                <button 
                                    className="trainer-card__link"
                                    onClick={() => navigate('/trainer/schedule')}
                                >
                                    View All <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="trainer-card__content">
                                {schedule.length === 0 ? (
                                    <div className="trainer-empty">
                                        <Calendar size={48} />
                                        <p>No Classes Today</p>
                                        <span>You don't have any classes scheduled</span>
                                    </div>
                                ) : (
                                    <div className="trainer-schedule-list">
                                        {schedule.map((item, idx) => (
                                            <div key={idx} className="trainer-schedule-item">
                                                <div className="trainer-schedule-item__icon">
                                                    {item.icon}
                                                </div>
                                                <div className="trainer-schedule-item__info">
                                                    <div className="trainer-schedule-item__title">
                                                        {item.time} - {item.title}
                                                    </div>
                                                    <div className="trainer-schedule-item__meta">
                                                        {item.room} • {item.enrolled}/{item.capacity} enrolled
                                                    </div>
                                                </div>
                                                <button className="trainer-schedule-item__btn">
                                                    View Details
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="trainer-card">
                            <div className="trainer-card__header">
                                <h2>Recent Activity</h2>
                                <button className="trainer-card__link">
                                    View All <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="trainer-card__content">
                                <div className="trainer-activity-timeline">
                                    {activities.map((activity, idx) => (
                                        <div key={idx} className="trainer-activity-item">
                                            <div className={`trainer-activity-item__dot trainer-activity-item__dot--${activity.type}`} />
                                            <div className="trainer-activity-item__content">
                                                <p>{activity.text}</p>
                                                <span>{activity.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="trainer-dashboard__sidebar">
                        {/* Quick Actions */}
                        <div className="trainer-card">
                            <div className="trainer-card__header">
                                <h2>Quick Actions</h2>
                            </div>
                            <div className="trainer-card__content">
                                <div className="trainer-quick-actions">
                                    {quickActions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => navigate(action.path)}
                                            className="trainer-quick-action"
                                        >
                                            <div 
                                                className="trainer-quick-action__icon"
                                                style={{ backgroundColor: `${action.color}15` }}
                                            >
                                                <action.icon size={20} style={{ color: action.color }} />
                                            </div>
                                            <div className="trainer-quick-action__text">
                                                <span className="trainer-quick-action__label">{action.label}</span>
                                                <span className="trainer-quick-action__desc">{action.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div className="trainer-card">
                            <div className="trainer-card__header">
                                <h2>This Week's Performance</h2>
                            </div>
                            <div className="trainer-card__content">
                                <div className="trainer-performance">
                                    <div className="trainer-performance__item">
                                        <span className="trainer-performance__label">Sessions Completed</span>
                                        <span className="trainer-performance__value">18/20</span>
                                    </div>
                                    <div className="trainer-performance__bar">
                                        <div className="trainer-performance__progress" style={{ width: '90%' }} />
                                    </div>
                                    
                                    <div className="trainer-performance__item">
                                        <span className="trainer-performance__label">Client Retention</span>
                                        <span className="trainer-performance__value trainer-performance__value--success">96%</span>
                                    </div>
                                    
                                    <div className="trainer-performance__item">
                                        <span className="trainer-performance__label">Avg. Rating</span>
                                        <span className="trainer-performance__value trainer-performance__value--warning">4.9 ⭐</span>
                                    </div>
                                    
                                    <div className="trainer-performance__item">
                                        <span className="trainer-performance__label">New Members</span>
                                        <span className="trainer-performance__value">+3</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reports Link */}
                        <button
                            onClick={() => navigate('/trainer/reports')}
                            className="trainer-reports-link"
                        >
                            <div className="trainer-reports-link__icon">
                                <BarChart3 size={20} />
                            </div>
                            <div className="trainer-reports-link__text">
                                <span>View Full Reports</span>
                                <span>Detailed performance analytics</span>
                            </div>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
