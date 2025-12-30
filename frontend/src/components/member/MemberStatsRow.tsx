import React from 'react';
import { CreditCard, Calendar, CheckCircle, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Membership Card */}
            <div
                onClick={() => navigate('/member/membership')}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-zinc-700 transition-colors group relative overflow-hidden"
            >
                <div className={`absolute top-0 left-0 w-1 h-full ${membership?.isExpired ? 'bg-red-500' : 'bg-green-500'}`} />
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                        <CreditCard size={20} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${membership?.isExpired
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-green-500/10 text-green-500'
                        }`}>
                        {membership?.isExpired ? 'EXPIRED' : 'ACTIVE'}
                    </span>
                </div>
                <div>
                    <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Membership</div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {membership?.isExpired ? 'Expired' : 'Premium'}
                    </div>
                    <div className="text-sm text-zinc-500">
                        {membership?.daysRemaining !== undefined
                            ? `${membership.daysRemaining} days left`
                            : 'Check status'}
                    </div>
                </div>
            </div>

            {/* Classes This Week */}
            <div
                onClick={() => navigate('/member/classes')}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-zinc-700 transition-colors group"
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-blue-500 transition-colors">
                        <Calendar size={20} />
                    </div>
                </div>
                <div>
                    <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Classes</div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {stats.classesThisWeek}
                    </div>
                    <div className="text-sm text-zinc-500">
                        This Week
                    </div>
                </div>
            </div>

            {/* Attendance This Month */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 group">
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-purple-500 transition-colors">
                        <CheckCircle size={20} />
                    </div>
                </div>
                <div>
                    <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Attended</div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {stats.attendedThisMonth}
                    </div>
                    <div className="text-sm text-zinc-500">
                        This Month
                    </div>
                </div>
            </div>

            {/* Streak */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 group">
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-orange-500 transition-colors">
                        <Flame size={20} />
                    </div>
                </div>
                <div>
                    <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Day Streak</div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {stats.streakDays}
                    </div>
                    <div className="text-sm text-zinc-500">
                        Keep it up!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberStatsRow;
