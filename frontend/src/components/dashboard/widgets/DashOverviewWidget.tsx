import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    IndianRupee,
    Calendar,
    Dumbbell,
    TrendingUp,
    ChevronRight,
    type LucideIcon
} from 'lucide-react';

interface OverviewCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    highlight?: React.ReactNode;
    onClick: () => void;
    className?: string;
    variants?: any;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
    icon: Icon,
    label,
    value,
    highlight,
    onClick,
    className,
    variants
}) => (
    <motion.div
        className={`dash-overview-card ${className || ''}`}
        variants={variants}
        onClick={onClick}
    >
        <div className="dash-overview-card__icon">
            <Icon size={24} />
        </div>
        <div className="dash-overview-card__content">
            <span className="dash-overview-card__label">{label}</span>
            <span className="dash-overview-card__value">{value}</span>
            {highlight && <span className="dash-overview-card__highlight">{highlight}</span>}
        </div>
        <ChevronRight className="dash-overview-card__arrow" size={20} />
    </motion.div>
);

interface DashOverviewWidgetProps {
    totalMembers: number;
    newSignups: number;
    totalTrainers: number;
    sessionsToday: number;
    monthlyRevenue: number;
    variants?: any;
}

const DashOverviewWidget: React.FC<DashOverviewWidgetProps> = ({
    totalMembers,
    newSignups,
    totalTrainers,
    sessionsToday,
    monthlyRevenue,
    variants
}) => {
    const navigate = useNavigate();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(value)
    }

    return (
        <section className="dash-overview">
            <OverviewCard
                icon={Users}
                label="Total Members"
                value={totalMembers}
                highlight={`+${newSignups} today`}
                className="dash-overview-card--members"
                onClick={() => navigate('/members')}
                variants={variants}
            />

            <OverviewCard
                icon={Dumbbell}
                label="Active Trainers"
                value={totalTrainers}
                highlight={`${sessionsToday} sessions today`}
                className="dash-overview-card--trainers"
                onClick={() => navigate('/trainers')}
                variants={variants}
            />

            <OverviewCard
                icon={IndianRupee}
                label="Monthly Revenue"
                value={formatCurrency(monthlyRevenue)}
                highlight={
                    <span className="dash-overview-card__highlight--positive">
                        <TrendingUp size={12} /> 12% vs last month
                    </span>
                }
                className="dash-overview-card--revenue"
                onClick={() => navigate('/financials')}
                variants={variants}
            />

            <OverviewCard
                icon={Calendar}
                label="PT Sessions"
                value="24" // TODO: Add real data
                highlight="Scheduled today"
                className="dash-overview-card--sessions"
                onClick={() => navigate('/pt-sessions')}
                variants={variants}
            />
        </section>
    );
};

export default DashOverviewWidget;
