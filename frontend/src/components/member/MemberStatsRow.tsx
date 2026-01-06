import React from 'react';
import { CreditCard, Calendar, CheckCircle, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MemberComponents.css';

interface MemberStatsProps {
    membership: {
        status: string;
        daysRemaining?: number;
        isExpired?: boolean;
    } | null;
    stats: {
        classesThisWeek: number;
        attendedThisMonth: number;
        streakDays: number;
    };
}

const MemberStatsRow: React.FC<MemberStatsProps> = ({ membership, stats }) => {
    const navigate = useNavigate();
    const isExpired = membership?.isExpired;

    return (
        <div className="member-stats-grid">
            {/* Membership Card */}
            <div
                onClick={() => navigate('/member/membership')}
                className={`member-stat-card ${isExpired ? 'member-stat-card--expired' : 'member-stat-card--active'}`}
            >
                <div className="member-stat-card__header">
                    <div className="member-stat-card__icon">
                        <CreditCard size={20} />
                    </div>
                    <span className={`member-stat-card__badge ${isExpired ? 'member-stat-card__badge--expired' : 'member-stat-card__badge--active'}`}>
                        {isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>
                </div>
                <div className="member-stat-card__label">Membership</div>
                <div className="member-stat-card__value">
                    {isExpired ? 'Expired' : 'Premium'}
                </div>
                <div className="member-stat-card__subtext">
                    {membership?.daysRemaining !== undefined
                        ? `${membership.daysRemaining} days left`
                        : 'Check status'}
                </div>
            </div>

            {/* Classes This Week */}
            <div
                onClick={() => navigate('/member/classes')}
                className="member-stat-card"
            >
                <div className="member-stat-card__header">
                    <div className="member-stat-card__icon">
                        <Calendar size={20} />
                    </div>
                </div>
                <div className="member-stat-card__label">Classes</div>
                <div className="member-stat-card__value">{stats.classesThisWeek}</div>
                <div className="member-stat-card__subtext">This Week</div>
            </div>

            {/* Attendance This Month */}
            <div className="member-stat-card">
                <div className="member-stat-card__header">
                    <div className="member-stat-card__icon">
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div className="member-stat-card__label">Attended</div>
                <div className="member-stat-card__value">{stats.attendedThisMonth}</div>
                <div className="member-stat-card__subtext">This Month</div>
            </div>

            {/* Streak */}
            <div className="member-stat-card">
                <div className="member-stat-card__header">
                    <div className="member-stat-card__icon">
                        <Flame size={20} />
                    </div>
                </div>
                <div className="member-stat-card__label">Day Streak</div>
                <div className="member-stat-card__value">{stats.streakDays}</div>
                <div className="member-stat-card__subtext">Keep it up!</div>
            </div>
        </div>
    );
};

export default MemberStatsRow;
