import React, { useEffect, useState } from 'react';
import { Button, Card, Avatar, Badge } from '../../components/ui';
import api from '../../services/api';
import './Classes.css';

interface GymClass {
    id: number;
    name: string;
    trainer: string;
    time: string;
    day: string;
    capacity: number;
    enrolled: number;
    status: 'Available' | 'Busy' | 'Full';
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

const Classes: React.FC = () => {
    const [classes, setClasses] = useState<GymClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string>('all');

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        setLoading(true);
        try {
            // Load PT sessions and transform them
            const sessions = await api.getPTSessions();
            const transformed: GymClass[] = sessions.slice(0, 12).map((s: any, idx: number) => ({
                id: s.sessionId || idx,
                name: ['HIIT Burn', 'Yoga Flow', 'Spin Cycle', 'CrossFit', 'Pilates'][idx % 5],
                trainer: s.trainerName || 'Mike T.',
                time: `${9 + (idx % 6)}:00 AM`,
                day: DAYS[idx % 5],
                capacity: 20,
                enrolled: 10 + (idx % 10),
                status: idx % 3 === 0 ? 'Full' : idx % 2 === 0 ? 'Busy' : 'Available',
            }));
            setClasses(transformed);
        } catch (err) {
            console.error('Failed to load classes:', err);
            // Mock data for demo
            setClasses([
                { id: 1, name: 'HIIT Burn', trainer: 'Mike T.', time: '06:00 AM', day: 'Mon', capacity: 20, enrolled: 20, status: 'Full' },
                { id: 2, name: 'Yoga Flow', trainer: 'Anya S.', time: '07:30 AM', day: 'Mon', capacity: 15, enrolled: 10, status: 'Available' },
                { id: 3, name: 'Spin Cycle', trainer: 'Chris E.', time: '09:00 AM', day: 'Tue', capacity: 20, enrolled: 18, status: 'Busy' },
                { id: 4, name: 'CrossFit', trainer: 'John D.', time: '10:00 AM', day: 'Wed', capacity: 15, enrolled: 12, status: 'Busy' },
                { id: 5, name: 'Pilates', trainer: 'Sarah C.', time: '11:00 AM', day: 'Thu', capacity: 12, enrolled: 6, status: 'Available' },
                { id: 6, name: 'HIIT Burn', trainer: 'Mike T.', time: '12:00 PM', day: 'Fri', capacity: 20, enrolled: 20, status: 'Full' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getCapacityPercent = (enrolled: number, capacity: number) =>
        Math.round((enrolled / capacity) * 100);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Full': return 'var(--color-crimson)';
            case 'Busy': return 'var(--color-amber)';
            default: return 'var(--color-emerald)';
        }
    };

    const getClassesForDay = (day: string) =>
        classes.filter(c => c.day === day);

    const todayClasses = classes.filter(c =>
        selectedDay === 'all' || c.day === selectedDay
    );

    return (
        <div className="classes-page">
            {/* Header */}
            <div className="classes-page__header">
                <div className="classes-page__title-section">
                    <h1 className="classes-page__title">Class Schedule</h1>
                    <span className="classes-page__count">Upcoming: {classes.length} Classes Today</span>
                </div>
                <div className="classes-page__actions">
                    <Button variant="secondary" icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </svg>
                    }>
                        Filter by Trainer/Type
                    </Button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="classes-page__grid">
                {/* Weekly View */}
                <Card title="Weekly View" className="classes-page__weekly">
                    <div className="weekly-calendar">
                        <div className="weekly-header">
                            {DAYS.map(day => (
                                <div key={day} className="weekly-day-header">{day}</div>
                            ))}
                        </div>
                        <div className="weekly-body">
                            {TIMES.map(time => (
                                <div key={time} className="weekly-row">
                                    <div className="weekly-time">{time}</div>
                                    {DAYS.map(day => {
                                        const classesAtTime = classes.filter(c =>
                                            c.day === day && c.time.includes(time.split(':')[0])
                                        );
                                        return (
                                            <div key={`${day}-${time}`} className="weekly-cell">
                                                {classesAtTime.map(cls => (
                                                    <div
                                                        key={cls.id}
                                                        className="weekly-class"
                                                        style={{ backgroundColor: getStatusColor(cls.status) }}
                                                    >
                                                        {cls.name}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Today's Classes */}
                <Card title="Today's Classes" className="classes-page__today">
                    <div className="today-list">
                        <div className="today-header">
                            <span>Time</span>
                            <span>Class</span>
                            <span>Trainer</span>
                            <span>Capacity</span>
                            <span>Actions</span>
                        </div>
                        {todayClasses.map(cls => (
                            <div key={cls.id} className="today-row">
                                <span className="today-time">{cls.time}</span>
                                <span className="today-class">{cls.name}</span>
                                <span className="today-trainer">{cls.trainer}</span>
                                <div className="today-capacity">
                                    <span className="capacity-text">{cls.status}</span>
                                    <div
                                        className="capacity-bar"
                                        style={{
                                            '--capacity-width': `${getCapacityPercent(cls.enrolled, cls.capacity)}%`,
                                            '--capacity-color': getStatusColor(cls.status)
                                        } as React.CSSProperties}
                                    />
                                </div>
                                <button className="action-menu-btn">•••</button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Classes;
