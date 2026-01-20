import React from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WidgetPanel from '../shared/WidgetPanel';
import type { TrainerSchedule } from '../types';

interface TrainerScheduleWidgetProps {
    schedule: TrainerSchedule[];
    variants?: any;
    className?: string;
}

const TrainerScheduleWidget: React.FC<TrainerScheduleWidgetProps> = ({ schedule, variants, className }) => {
    const navigate = useNavigate();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(value)
    }

    return (
        <WidgetPanel
            title="Trainer Schedule Today"
            icon={Calendar}
            onAction={() => navigate('/pt-sessions')}
            className={`dash-section--trainers ${className || ''}`}
            variants={variants}
        >
            <div className="trainer-cards">
                {schedule.map((trainer, idx) => (
                    <div key={idx} className="trainer-card">
                        <div className="trainer-card__header">
                            <div className="trainer-card__avatar">{trainer.initials}</div>
                            <div className="trainer-card__info">
                                <span className="trainer-card__name">{trainer.name}</span>
                                <span className="trainer-card__meta">
                                    {trainer.sessionsToday} sessions · {trainer.availableSlots} slots free
                                </span>
                            </div>
                            <div className="trainer-card__revenue">
                                {formatCurrency(trainer.totalRevenue)}
                            </div>
                        </div>
                        <div className="trainer-card__slots">
                            {trainer.slots.map((slot, i) => (
                                <div key={i} className={`trainer-slot trainer-slot--${slot.status}`}>
                                    <span className="trainer-slot__time">{slot.time}</span>
                                    <span className="trainer-slot__status">
                                        {slot.status === 'booked' ? slot.memberName : slot.status === 'limited' ? '1 Left' : 'Open'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="trainer-schedule__legend">
                <span><span className="legend-dot legend-dot--available" /> Available</span>
                <span><span className="legend-dot legend-dot--limited" /> 1 Left</span>
                <span><span className="legend-dot legend-dot--booked" /> Booked</span>
            </div>
        </WidgetPanel>
    );
};

export default TrainerScheduleWidget;
