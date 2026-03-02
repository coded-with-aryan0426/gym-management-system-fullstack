import React from 'react';
import { Calendar, MapPin, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MemberComponents.css';

interface ClassSession {
    id: number;
    title: string;
    time: string;
    date: string;
    location: string;
    trainerName: string;
    type: string;
}

interface UpcomingClassesListProps {
    classes: ClassSession[];
}

const getClassEmoji = (type: string): string => {
    switch (type) {
        case 'Yoga': return '🧘';
        case 'HIIT': return '🏃';
        case 'Spin': return '🚴';
        default: return '💪';
    }
};

const UpcomingClassesList: React.FC<UpcomingClassesListProps> = ({ classes }) => {
    const navigate = useNavigate();

    return (
        <div className="upcoming-classes">
            <div className="upcoming-classes__header">
                <h3 className="upcoming-classes__title">Upcoming Classes</h3>
                <button
                    onClick={() => navigate('/member/classes')}
                    className="upcoming-classes__link"
                >
                    View All <ChevronRight size={14} />
                </button>
            </div>

            <div className="upcoming-classes__list">
                {classes.length === 0 ? (
                    <div className="upcoming-classes__empty">
                        <Calendar className="upcoming-classes__empty-icon" size={32} />
                        <p className="upcoming-classes__empty-text">No upcoming classes</p>
                        <button
                            onClick={() => navigate('/member/classes')}
                            style={{ marginTop: '0.5rem', color: '#dc2626', fontWeight: 500 }}
                        >
                            Book a Class
                        </button>
                    </div>
                ) : (
                    classes.map((cls, ci) => (
                        <div key={`cls-${ci}-${cls.id ?? ''}`} className="class-item">
                            <div className="class-item__content">
                                <div className="class-item__icon">
                                    {getClassEmoji(cls.type)}
                                </div>
                                <div className="class-item__info">
                                    <div className="class-item__time">{cls.date} • {cls.time}</div>
                                    <div className="class-item__name">{cls.title}</div>
                                    <div className="class-item__details">
                                        <span className="class-item__detail">
                                            <MapPin size={12} /> {cls.location}
                                        </span>
                                        <span className="class-item__detail">
                                            <User size={12} /> {cls.trainerName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UpcomingClassesList;
