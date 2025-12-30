import React, { useEffect, useState } from 'react';
import './Trainer.css';

interface DashboardData {
    trainerId: number;
    trainerName: string;
    assignedMembersCount: number;
    todaysSessionsCount: number;
    upcomingSessionsCount: number;
    unreadNotificationsCount: number;
}

const TrainerDashboard: React.FC = () => {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/trainer/dashboard?trainerId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setDashboard(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="trainer-dashboard">
                <div className="trainer-dashboard__header">
                    <h1 className="trainer-dashboard__welcome">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="trainer-dashboard">
            <div className="trainer-dashboard__header">
                <h1 className="trainer-dashboard__welcome">
                    Welcome back, {dashboard?.trainerName || user?.fullName || 'Trainer'}! 👋
                </h1>
                <p className="trainer-dashboard__subtitle">
                    Here's what's happening with your members today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="trainer-stats-grid">
                <div className="trainer-stat-card">
                    <div className="trainer-stat-card__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="trainer-stat-card__content">
                        <div className="trainer-stat-card__value">{dashboard?.assignedMembersCount || 0}</div>
                        <div className="trainer-stat-card__label">Assigned Members</div>
                    </div>
                </div>

                <div className="trainer-stat-card">
                    <div className="trainer-stat-card__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="trainer-stat-card__content">
                        <div className="trainer-stat-card__value">{dashboard?.todaysSessionsCount || 0}</div>
                        <div className="trainer-stat-card__label">Today's Sessions</div>
                    </div>
                </div>

                <div className="trainer-stat-card">
                    <div className="trainer-stat-card__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className="trainer-stat-card__content">
                        <div className="trainer-stat-card__value">{dashboard?.upcomingSessionsCount || 0}</div>
                        <div className="trainer-stat-card__label">Upcoming Sessions</div>
                    </div>
                </div>

                <div className="trainer-stat-card">
                    <div className="trainer-stat-card__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                    <div className="trainer-stat-card__content">
                        <div className="trainer-stat-card__value">{dashboard?.unreadNotificationsCount || 0}</div>
                        <div className="trainer-stat-card__label">Notifications</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="trainer-section">
                <div className="trainer-section__header">
                    <h2 className="trainer-section__title">Quick Actions</h2>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a href="/trainer/members" className="trainer-btn trainer-btn--primary" style={{ textDecoration: 'none' }}>
                        View My Members
                    </a>
                    <a href="/trainer/schedule" className="trainer-btn trainer-btn--primary" style={{ textDecoration: 'none' }}>
                        Check Schedule
                    </a>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
