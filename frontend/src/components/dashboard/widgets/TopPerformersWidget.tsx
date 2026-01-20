import React from 'react';
import { BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WidgetPanel from '../shared/WidgetPanel';
import type { TopTrainer } from '../types';

interface TopPerformersWidgetProps {
    trainers: TopTrainer[];
    variants?: any;
    className?: string;
}

const TopPerformersWidget: React.FC<TopPerformersWidgetProps> = ({ trainers, variants, className }) => {
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
            title="Top Performers"
            icon={BarChart3}
            onAction={() => navigate('/trainers')}
            actionLabel="All Trainers"
            className="dash-section--performance"
            variants={variants}
        >
            {trainers.map((trainer, idx) => (
                <div key={idx} className="performer-row">
                    <div className={`performer-row__rank rank--${idx + 1}`}>{idx + 1}</div>
                    <div className="performer-row__info">
                        <span className="performer-row__name">{trainer.name}</span>
                        <span className="performer-row__role">{trainer.role}</span>
                    </div>
                    <div className="performer-row__stats">
                        <span className="performer-row__revenue">{formatCurrency(trainer.revenue)}</span>
                        <span className="performer-row__sessions">{trainer.sessions} sessions</span>
                    </div>
                </div>
            ))}
        </WidgetPanel>
    );
};

export default TopPerformersWidget;
