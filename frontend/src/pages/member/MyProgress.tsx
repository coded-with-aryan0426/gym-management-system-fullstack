import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import ContentCard from '../../components/shared/ContentCard';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { Scale, Activity, TrendingDown, TrendingUp, Dumbbell, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './MyProgress.css';

interface ProgressNote {
    id: number;
    note: string;
    createdAt: string;
    trainer: {
        userId: number;
        fullName: string;
        avatarId?: string;
    };
}

const MyProgress: React.FC = () => {
    const [notes, setNotes] = useState<ProgressNote[]>([]);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchNotes = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/member/progress-notes?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setNotes(data);
                }
            } catch (error) {
                console.error('Failed to fetch progress notes:', error);
                toast.error("Failed to load progress notes");
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [user?.id]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Mock Chart Data
    const chartData = [
        { date: 'Jan 1', weight: 85, bodyFat: 22 },
        { date: 'Jan 15', weight: 84.2, bodyFat: 21.5 },
        { date: 'Feb 1', weight: 83.5, bodyFat: 21 },
        { date: 'Feb 15', weight: 82.8, bodyFat: 20.2 },
        { date: 'Mar 1', weight: 81.5, bodyFat: 19.5 },
        { date: 'Mar 15', weight: 79.8, bodyFat: 18.8 },
        { date: 'Apr 1', weight: 78.0, bodyFat: 18 },
    ];

    // Mock Active Goals
    const activeGoals = [
        { id: 1, title: 'Reach 75kg Weight', current: 78, target: 75, unit: 'kg', progress: 70 },
        { id: 2, title: 'Attend 20 Classes', current: 12, target: 20, unit: 'classes', progress: 60 },
    ];

    if (loading) {
        return <div className="p-8 text-zinc-400">Loading progress...</div>;
    }

    return (
        <div className="space-y-8 fade-in">
            <PageHeader
                title="My Progress"
                subtitle="Track your fitness journey, measurements, and trainer notes."
            />

            {/* Metrics Grid */}
            <div className="measurements-grid">
                <div className="measurement-card">
                    <div className="flex justify-between items-start">
                        <span className="measurement-label">Current Weight</span>
                        <Scale size={16} className="text-zinc-500" />
                    </div>
                    <div className="measurement-value-group">
                        <span className="measurement-value">78.0</span>
                        <span className="measurement-unit">kg</span>
                    </div>
                    <div className="measurement-change change-positive">
                        <TrendingDown size={14} /> 7.0 kg lost
                    </div>
                </div>

                <div className="measurement-card">
                    <div className="flex justify-between items-start">
                        <span className="measurement-label">Body Fat %</span>
                        <Activity size={16} className="text-zinc-500" />
                    </div>
                    <div className="measurement-value-group">
                        <span className="measurement-value">18.0</span>
                        <span className="measurement-unit">%</span>
                    </div>
                    <div className="measurement-change change-positive">
                        <TrendingDown size={14} /> 4.0% lost
                    </div>
                </div>

                <div className="measurement-card">
                    <div className="flex justify-between items-start">
                        <span className="measurement-label">Muscle Mass</span>
                        <Dumbbell size={16} className="text-zinc-500" />
                    </div>
                    <div className="measurement-value-group">
                        <span className="measurement-value">62.5</span>
                        <span className="measurement-unit">kg</span>
                    </div>
                    <div className="measurement-change change-positive">
                        <TrendingUp size={14} /> 1.2 kg gained
                    </div>
                </div>

                <div className="measurement-card">
                    <div className="flex justify-between items-start">
                        <span className="measurement-label">BMI Score</span>
                        <Activity size={16} className="text-zinc-500" />
                    </div>
                    <div className="measurement-value-group">
                        <span className="measurement-value">22.4</span>
                        <span className="measurement-unit">Normal</span>
                    </div>
                    <div className="measurement-change change-neutral">
                        <span className="mx-1">•</span> Healthy
                    </div>
                </div>
            </div>

            {/* Progress Chart */}
            <div className="chart-container">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Weight Progress</h3>
                    <div className="flex gap-2">
                        {['1M', '3M', '6M', '1Y'].map(period => (
                            <button
                                key={period}
                                className={`text-xs px-3 py-1 rounded-full ${period === '3M' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#71717a"
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#71717a"
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#fafafa' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="#dc2626"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorWeight)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="progress-container">
                {/* Left Column: Trainer Notes timeline */}
                <div>
                    <ContentCard title="Trainer Notes" padded>
                        {notes.length === 0 ? (
                            <div className="py-8 text-center text-zinc-500 text-sm">
                                <div className="mb-2 bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl">📝</div>
                                No notes from your trainer yet.
                            </div>
                        ) : (
                            <div className="notes-timeline">
                                {notes.map(note => (
                                    <div key={note.id} className="note-card">
                                        <div className="note-avatar">
                                            {note.trainer.avatarId ? (
                                                <img src={note.trainer.avatarId} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-zinc-500" />
                                            )}
                                        </div>
                                        <div className="note-content">
                                            <div className="note-header">
                                                <div className="note-author">
                                                    {note.trainer.fullName}
                                                    <span className="note-role-badge">Trainer</span>
                                                </div>
                                                <div className="note-date">{formatDate(note.createdAt)}</div>
                                            </div>
                                            <p className="note-text">{note.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ContentCard>
                </div>

                {/* Right Column: Active Goals */}
                <div className="space-y-6">
                    <ContentCard title="Active Goals" padded>
                        <div className="goals-list">
                            {activeGoals.map(goal => (
                                <div key={goal.id} className="goal-item">
                                    <div className="goal-header">
                                        <div className="goal-title">{goal.title}</div>
                                        <div className="goal-status goal-status--active">On Track</div>
                                    </div>
                                    <div className="goal-progress">
                                        <div className="goal-progress-bar" style={{ width: `${goal.progress}%` }}></div>
                                    </div>
                                    <div className="goal-stats">
                                        <span>Current: {goal.current} {goal.unit}</span>
                                        <span>Target: {goal.target} {goal.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ContentCard>

                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
                        <h4 className="text-zinc-200 font-semibold mb-2">Want to set new goals?</h4>
                        <p className="text-zinc-400 text-sm mb-3">Discuss with your trainer to create a personalized plan.</p>
                        <button className="text-red-500 text-sm font-medium hover:text-red-400 transition-colors">
                            Contact Trainer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProgress;
