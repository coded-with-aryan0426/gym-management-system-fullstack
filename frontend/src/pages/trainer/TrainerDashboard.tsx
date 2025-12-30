import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, Bell } from 'lucide-react';
import StatCard from '../../components/shared/StatCard';
import ContentCard from '../../components/shared/ContentCard';
import PageHeader from '../../components/shared/PageHeader';
import './Trainer.css'; // Keep for any specific styles not covered by shared (though we should minimize this)

interface DashboardData {
    trainerId: number;
    trainerName: string;
    assignedMembersCount: number;
    todaysSessionsCount: number;
    upcomingSessionsCount: number;
    unreadNotificationsCount: number;
}

const TrainerDashboard: React.FC = () => {
    const navigate = useNavigate();
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
        return <div className="p-8">Loading dashboard...</div>;
    }

    const trainerName = dashboard?.trainerName || user?.fullName || 'Trainer';

    return (
        <div className="trainer-dashboard fade-in">
            <PageHeader
                title={`Welcome back, ${trainerName}! 👋`}
                subtitle="Here's what's happening with your members today."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Assigned Members"
                    value={dashboard?.assignedMembersCount || 0}
                    icon={<Users size={24} />}
                    color="crimson"
                    onClick={() => navigate('/trainer/members')}
                />
                <StatCard
                    label="Today's Sessions"
                    value={dashboard?.todaysSessionsCount || 0}
                    icon={<Calendar size={24} />}
                    color="amber"
                    onClick={() => navigate('/trainer/schedule')}
                />
                <StatCard
                    label="Upcoming Sessions"
                    value={dashboard?.upcomingSessionsCount || 0}
                    icon={<Clock size={24} />}
                    color="emerald"
                    onClick={() => navigate('/trainer/schedule')}
                />
                <StatCard
                    label="Notifications"
                    value={dashboard?.unreadNotificationsCount || 0}
                    icon={<Bell size={24} />}
                    color="ocean"
                    onClick={() => navigate('/trainer/notifications')}
                />
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <ContentCard
                        title="Quick Actions"
                        padded
                    >
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/trainer/members')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                View My Members
                            </button>
                            <button
                                onClick={() => navigate('/trainer/schedule')}
                                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium border border-zinc-700"
                            >
                                Check Schedule
                            </button>
                            <button
                                onClick={() => navigate('/trainer/classes')}
                                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium border border-zinc-700"
                            >
                                Manage Classes
                            </button>
                        </div>
                    </ContentCard>
                </div>

                {/* Right Column - Secondary Content */}
                <div className="space-y-8">
                    {/* Placeholder for Recent Activity or similar */}
                    <ContentCard title="Recent Activity" padded>
                        <div className="text-zinc-500 text-sm">
                            No recent activity found.
                        </div>
                    </ContentCard>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
