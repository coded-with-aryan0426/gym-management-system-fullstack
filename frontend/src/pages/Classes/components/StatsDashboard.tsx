import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Zap,
  DoorOpen,
  Activity,
  Award
} from 'lucide-react';

interface StatsDashboardProps {
  stats: {
    todayTotal: number;
    todayEnrolled: number;
    todayCapacity: number;
    todayOccupancy: number;
    weekTotal: number;
    weekEnrolled: number;
    weekCapacity: number;
    occupancyRate: number;
    upcomingToday: number;
    inProgressNow: number;
    typeBreakdown: Record<string, number>;
    mostPopularType: string;
    availableSpots: number;
    fullClasses: number;
    uniqueTrainers: number;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const {
    todayTotal,
    todayEnrolled,
    todayCapacity,
    todayOccupancy,
    weekTotal,
    weekEnrolled,
    weekCapacity,
    occupancyRate,
    upcomingToday,
    inProgressNow,
    mostPopularType,
    availableSpots,
    fullClasses,
    uniqueTrainers
  } = stats;

  return (
    <div className="stats-dashboard">
      {/* Row 1: Primary Stats */}
      <div className="stats-dashboard__row">
        {/* Today's Classes */}
        <motion.div
          className="stats-card stats-card--today"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stats-card__header">
            <div className="stats-card__icon stats-card__icon--today">
              <Calendar size={18} />
            </div>
            <span className="stats-card__label">Today&apos;s Classes</span>
            {inProgressNow > 0 && (
              <div className="stats-card__live-badge">
                <span className="live-dot" />
                {inProgressNow} LIVE
              </div>
            )}
          </div>
          <div className="stats-card__content">
            <div className="stats-card__main-value">{todayTotal}</div>
            <span className="stats-card__sub-label">
              {upcomingToday > 0 ? `${upcomingToday} upcoming` : 'All done for today'}
            </span>
          </div>
          <div className="stats-card__footer">
            <div className="stats-card__detail">
              <span className="detail-value">{todayEnrolled}</span>
              <span className="detail-label">Booked</span>
            </div>
            <div className="stats-card__detail">
              <span className="detail-value">{todayCapacity - todayEnrolled}</span>
              <span className="detail-label">Available</span>
            </div>
            <div className="stats-card__progress-mini">
              <div className="progress-mini__bar">
                <div
                  className="progress-mini__fill"
                  style={{ width: `${todayOccupancy}%` }}
                />
              </div>
              <span className="progress-mini__text">{todayOccupancy}%</span>
            </div>
          </div>
        </motion.div>

        {/* Week Overview */}
        <motion.div
          className="stats-card stats-card--week"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stats-card__header">
            <div className="stats-card__icon stats-card__icon--week">
              <Clock size={18} />
            </div>
            <span className="stats-card__label">This Week</span>
          </div>
          <div className="stats-card__content">
            <div className="stats-card__main-value">{weekTotal}</div>
            <span className="stats-card__sub-label">
              {uniqueTrainers} trainer{uniqueTrainers !== 1 ? 's' : ''} scheduled
            </span>
          </div>
          <div className="stats-card__footer">
            <div className="stats-card__detail">
              <span className="detail-value">{weekEnrolled}</span>
              <span className="detail-label">Total Bookings</span>
            </div>
            <div className="stats-card__detail">
              <span className="detail-value">{fullClasses}</span>
              <span className="detail-label">Full Classes</span>
            </div>
          </div>
        </motion.div>

        {/* Occupancy Rate */}
        <motion.div
          className="stats-card stats-card--occupancy"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stats-card__header">
            <div className="stats-card__icon stats-card__icon--occupancy">
              <Users size={18} />
            </div>
            <span className="stats-card__label">Occupancy Rate</span>
          </div>
          <div className="stats-card__content">
            <div className="stats-card__main-value stats-card__main-value--gradient">
              {occupancyRate}%
            </div>
            <span className="stats-card__sub-label">
              {weekEnrolled} of {weekCapacity} spots filled
            </span>
          </div>
          <div className="stats-card__occupancy-bar">
            <div
              className="occupancy-bar__fill"
              style={{ width: `${occupancyRate}%` }}
            >
              {occupancyRate > 80 && <div className="occupancy-bar__glow" />}
            </div>
          </div>
        </motion.div>

        {/* Most Popular */}
        <motion.div
          className="stats-card stats-card--popular"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stats-card__header">
            <div className="stats-card__icon stats-card__icon--popular">
              <Award size={18} />
            </div>
            <span className="stats-card__label">Most Popular</span>
          </div>
          <div className="stats-card__content">
            <div className="stats-card__main-value stats-card__main-value--text">
              {mostPopularType}
            </div>
            <span className="stats-card__sub-label">
              {availableSpots} spots available across all classes
            </span>
          </div>
          <div className="stats-card__footer">
            <div className="stats-card__detail">
              <span className="detail-value">
                <DoorOpen size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                {' '}{availableSpots}
              </span>
              <span className="detail-label">Open Spots</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Live Activity & Quick Insights */}
      <div className="stats-dashboard__row stats-dashboard__row--compact">
        {/* Live Activity */}
        <motion.div
          className="stats-mini-card"
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stats-mini-card__icon">
            <Activity size={16} />
          </div>
          <div className="stats-mini-card__content">
            <span className="stats-mini-card__value">{inProgressNow}</span>
            <span className="stats-mini-card__label">In Progress</span>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="stats-mini-card"
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stats-mini-card__icon stats-mini-card__icon--success">
            <Zap size={16} />
          </div>
          <div className="stats-mini-card__content">
            <span className="stats-mini-card__value">{availableSpots}</span>
            <span className="stats-mini-card__label">Available Spots</span>
          </div>
        </motion.div>

        <motion.div
          className="stats-mini-card"
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="stats-mini-card__icon stats-mini-card__icon--warning">
            <TrendingUp size={16} />
          </div>
          <div className="stats-mini-card__content">
            <span className="stats-mini-card__value">{fullClasses}</span>
            <span className="stats-mini-card__label">Full Classes</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsDashboard;
