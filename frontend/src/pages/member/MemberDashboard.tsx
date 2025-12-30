import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import MemberStatsRow from '../../components/member/MemberStatsRow';
import UpcomingClassesList from '../../components/member/UpcomingClassesList';
import MemberTrainerCard from '../../components/member/MemberTrainerCard';
import ProgressSnapshot from '../../components/member/ProgressSnapshot';
import ActivityTimeline from '../../components/member/ActivityTimeline';
import { toast } from 'react-hot-toast';
import './Member.css';

interface DashboardData {
    memberId: number;
    memberName: string;
    membership: {
        status: string;
        packageName?: string;
        endDate?: string;
        daysRemaining?: number;
        isExpired?: boolean;
    } | null;
    assignedTrainer: {
        id: number;
        fullName: string;
        specialization?: string;
        nextSession?: string;
    } | null;
    bookedClassesCount: number;
    unreadNotificationsCount: number;
}

const MemberDashboard: React.FC = () => {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/member/dashboard?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setDashboard(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard:', error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user?.id]);

    if (loading) {
        return <div className="p-8 text-zinc-400">Loading dashboard...</div>;
    }

    const memberName = dashboard?.memberName || user?.fullName || 'Member';

    // Mock stats for now (to be connected to backend later)
    const stats = {
        classesThisWeek: 3,
        attendedThisMonth: 18,
        streakDays: 7
    };

    // Mock upcoming classes
    const upcomingClasses = [
        { id: 1, title: 'Yoga Class', time: '9:00 AM', date: 'Tomorrow', location: 'Room A', trainerName: 'Sarah J', type: 'Yoga' },
        { id: 2, title: 'HIIT Training', time: '6:00 PM', date: 'Tue, Mar 26', location: 'Main Studio', trainerName: 'Mike C', type: 'HIIT' },
    ];

    return (
        <div className="member-dashboard fade-in space-y-8">
            <PageHeader
                title={`Welcome Back, ${memberName}! 👋`}
                subtitle="Your last visit: Yesterday at 6:00 PM"
            />

            {/* Quick Stats Row */}
            <MemberStatsRow membership={dashboard?.membership || null} stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upcoming Classes */}
                    <UpcomingClassesList classes={upcomingClasses} />

                    {/* Recent Activity */}
                    <ActivityTimeline />
                </div>

                {/* Sidebar Area (Right 1/3) */}
                <div className="space-y-6">
                    <div className="h-auto">
                        <MemberTrainerCard trainer={dashboard?.assignedTrainer || null} />
                    </div>
                    <div className="h-auto">
                        <ProgressSnapshot />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
