import React, { useState } from 'react';
import { 
    TrendingUp, Users, Calendar, Clock, Download, ChevronDown,
    BarChart3, PieChart, Activity, Award, Target
} from 'lucide-react';
import './TrainerReports.css';

const TrainerReports: React.FC = () => {
    const [period, setPeriod] = useState('This Month');

    const stats = [
        { label: 'Total Sessions', value: '156', change: '+12%', changeType: 'positive', icon: Calendar },
        { label: 'Active Members', value: '24', change: '+3', changeType: 'positive', icon: Users },
        { label: 'Avg. Attendance', value: '94%', change: '+5%', changeType: 'positive', icon: Activity },
        { label: 'Client Rating', value: '4.9', change: 'Excellent', changeType: 'neutral', icon: Award },
    ];

    const performanceData = [
        { label: 'Sessions Completed', value: 42, max: 48, percent: 87 },
        { label: 'Client Goals Met', value: 18, max: 24, percent: 75 },
        { label: 'On-Time Rate', value: 98, max: 100, percent: 98 },
        { label: 'Member Retention', value: 96, max: 100, percent: 96 },
    ];

    const recentSessions = [
        { member: 'Sarah Wilson', type: 'Personal Training', date: 'Mar 25', duration: '60 min', status: 'Completed' },
        { member: 'Mike Johnson', type: 'HIIT Class', date: 'Mar 25', duration: '45 min', status: 'Completed' },
        { member: 'Emma Davis', type: 'Yoga Session', date: 'Mar 24', duration: '60 min', status: 'Completed' },
        { member: 'James Wilson', type: 'Strength Training', date: 'Mar 24', duration: '90 min', status: 'Cancelled' },
    ];

    const topMembers = [
        { name: 'Sarah Wilson', sessions: 18, progress: 95 },
        { name: 'Emma Davis', sessions: 15, progress: 88 },
        { name: 'Mike Johnson', sessions: 12, progress: 72 },
        { name: 'Lisa Chen', sessions: 10, progress: 65 },
    ];

    return (
        <div className="trainer-reports">
            <div className="trainer-reports__header">
                <div className="trainer-reports__header-content">
                    <div className="trainer-reports__title-section">
                        <h1>Performance Reports</h1>
                        <p>Track your performance and member progress</p>
                    </div>
                    <div className="trainer-reports__header-actions">
                        <div className="trainer-reports__period-select">
                            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last 3 Months</option>
                                <option>This Year</option>
                            </select>
                            <ChevronDown size={14} />
                        </div>
                        <button className="trainer-reports__export-btn">
                            <Download size={16} />
                            Export Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="trainer-reports__content">
                <div className="trainer-reports__stats">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="trainer-reports__stat-card">
                            <div className="trainer-reports__stat-icon">
                                <stat.icon size={20} />
                            </div>
                            <div className="trainer-reports__stat-value">{stat.value}</div>
                            <div className="trainer-reports__stat-label">{stat.label}</div>
                            <div className={`trainer-reports__stat-change trainer-reports__stat-change--${stat.changeType}`}>
                                {stat.changeType === 'positive' && <TrendingUp size={12} />}
                                {stat.change}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="trainer-reports__grid">
                    <div className="trainer-reports__card trainer-reports__card--performance">
                        <div className="trainer-reports__card-header">
                            <h2><BarChart3 size={20} /> Performance Metrics</h2>
                        </div>
                        <div className="trainer-reports__card-content">
                            <div className="trainer-reports__metrics">
                                {performanceData.map((metric, idx) => (
                                    <div key={idx} className="trainer-reports__metric">
                                        <div className="trainer-reports__metric-header">
                                            <span className="trainer-reports__metric-label">{metric.label}</span>
                                            <span className="trainer-reports__metric-value">{metric.value}/{metric.max}</span>
                                        </div>
                                        <div className="trainer-reports__metric-bar">
                                            <div 
                                                className="trainer-reports__metric-progress" 
                                                style={{ width: `${metric.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="trainer-reports__card trainer-reports__card--members">
                        <div className="trainer-reports__card-header">
                            <h2><Target size={20} /> Top Performing Members</h2>
                        </div>
                        <div className="trainer-reports__card-content">
                            <div className="trainer-reports__top-members">
                                {topMembers.map((member, idx) => (
                                    <div key={idx} className="trainer-reports__member">
                                        <div className="trainer-reports__member-rank">{idx + 1}</div>
                                        <div className="trainer-reports__member-avatar">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="trainer-reports__member-info">
                                            <span className="trainer-reports__member-name">{member.name}</span>
                                            <span className="trainer-reports__member-sessions">{member.sessions} sessions</span>
                                        </div>
                                        <div className="trainer-reports__member-progress">
                                            <span>{member.progress}%</span>
                                            <div className="trainer-reports__mini-bar">
                                                <div style={{ width: `${member.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="trainer-reports__card trainer-reports__card--sessions">
                        <div className="trainer-reports__card-header">
                            <h2><Clock size={20} /> Recent Sessions</h2>
                            <button className="trainer-reports__view-all">View All</button>
                        </div>
                        <div className="trainer-reports__card-content">
                            <div className="trainer-reports__sessions-table">
                                <div className="trainer-reports__table-header">
                                    <span>Member</span>
                                    <span>Type</span>
                                    <span>Date</span>
                                    <span>Duration</span>
                                    <span>Status</span>
                                </div>
                                {recentSessions.map((session, idx) => (
                                    <div key={idx} className="trainer-reports__table-row">
                                        <span className="trainer-reports__session-member">{session.member}</span>
                                        <span>{session.type}</span>
                                        <span>{session.date}</span>
                                        <span>{session.duration}</span>
                                        <span className={`trainer-reports__session-status trainer-reports__session-status--${session.status.toLowerCase()}`}>
                                            {session.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerReports;
