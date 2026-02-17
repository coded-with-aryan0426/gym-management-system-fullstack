import React from 'react';
import {
  Calendar,
  Clock,
  Users,
  Activity,
  Zap,
  Award,
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

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  const {
    todayTotal,
    todayOccupancy,
    weekTotal,
    occupancyRate,
    upcomingToday,
    inProgressNow,
    mostPopularType,
    availableSpots,
    fullClasses,
    uniqueTrainers
  } = stats;

  return (
    <div className="compact-stats-bar">
      {/* Today */}
      <div className="compact-stat">
        <div className="compact-stat__icon compact-stat__icon--green">
          <Calendar size={14} />
        </div>
        <div className="compact-stat__info">
          <span className="compact-stat__value">{todayTotal}</span>
          <span className="compact-stat__label">Today</span>
        </div>
        {inProgressNow > 0 && (
          <span className="compact-stat__live">
            <span className="compact-stat__live-dot" />
            {inProgressNow} Live
          </span>
        )}
      </div>

      <div className="compact-stat-divider" />

      {/* This Week */}
      <div className="compact-stat">
        <div className="compact-stat__icon compact-stat__icon--blue">
          <Clock size={14} />
        </div>
        <div className="compact-stat__info">
          <span className="compact-stat__value">{weekTotal}</span>
          <span className="compact-stat__label">This Week</span>
        </div>
      </div>

      <div className="compact-stat-divider" />

      {/* Occupancy */}
      <div className="compact-stat">
        <div className="compact-stat__icon compact-stat__icon--purple">
          <Users size={14} />
        </div>
        <div className="compact-stat__info">
          <span className="compact-stat__value">{occupancyRate}%</span>
          <span className="compact-stat__label">Occupancy</span>
        </div>
        <div className="compact-stat__mini-bar">
          <div
            className="compact-stat__mini-fill"
            style={{
              width: `${occupancyRate}%`,
              background: occupancyRate > 80
                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                : occupancyRate > 50
                  ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                  : 'linear-gradient(90deg, #10b981, #3b82f6)',
            }}
          />
        </div>
      </div>

      <div className="compact-stat-divider" />

      {/* Upcoming */}
      <div className="compact-stat">
        <div className="compact-stat__icon compact-stat__icon--amber">
          <Zap size={14} />
        </div>
        <div className="compact-stat__info">
          <span className="compact-stat__value">{upcomingToday}</span>
          <span className="compact-stat__label">Upcoming</span>
        </div>
      </div>

      <div className="compact-stat-divider" />

      {/* Available Spots */}
      <div className="compact-stat">
        <div className="compact-stat__icon compact-stat__icon--emerald">
          <Activity size={14} />
        </div>
        <div className="compact-stat__info">
          <span className="compact-stat__value">{availableSpots}</span>
          <span className="compact-stat__label">Open Spots</span>
        </div>
      </div>

      <div className="compact-stat-divider" />

      {/* Trainers */}
      <div className="compact-stat">
        <div className="compact-stat__icon compact-stat__icon--rose">
          <Award size={14} />
        </div>
        <div className="compact-stat__info">
          <span className="compact-stat__value">{uniqueTrainers}</span>
          <span className="compact-stat__label">Trainers</span>
        </div>
      </div>

      {fullClasses > 0 && (
        <>
          <div className="compact-stat-divider" />
          <div className="compact-stat compact-stat--alert">
            <span className="compact-stat__alert-value">{fullClasses} Full</span>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsDashboard;
