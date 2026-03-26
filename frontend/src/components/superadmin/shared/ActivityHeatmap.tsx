import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';
import './ActivityHeatmap.css';

export interface ActivityDay {
  date: string;
  count: number;
  level?: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmapProps {
  data: ActivityDay[];
  year?: number;
  cellSize?: number;
  cellGap?: number;
  showStats?: boolean;
  className?: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getLevel = (count: number, max: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  year = new Date().getFullYear(),
  cellSize = 10,
  cellGap = 2,
  showStats = true,
  className = ''
}) => {
  const { weeks, monthLabels, totalContributions, maxCount, currentStreak, longestStreak } = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const dataMap = new Map<string, number>();
    data.forEach(d => dataMap.set(d.date, d.count));

    let total = 0;
    let max = 0;
    data.forEach(d => {
      total += d.count;
      if (d.count > max) max = d.count;
    });

    const weeks: { date: Date; count: number; level: 0 | 1 | 2 | 3 | 4 }[][] = [];
    let currentWeek: { date: Date; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];

    const firstDay = startDate.getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: new Date(0), count: 0, level: 0 });
    }

    let streak = 0;
    let maxStreak = 0;
    let currStreak = 0;
    let longest = 0;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const count = dataMap.get(dateStr) || 0;
      const level = getLevel(count, max || 1);

      currentWeek.push({ date: new Date(d), count, level });

      if (count > 0) {
        streak++;
        currStreak++;
        if (currStreak > longest) longest = currStreak;
      } else {
        currStreak = 0;
      }

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(0), count: 0, level: 0 });
      }
      weeks.push(currentWeek);
    }

    const monthLabelPositions: { month: string; index: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const firstValidDay = week.find(d => d.date.getTime() > 0);
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== lastMonth) {
          monthLabelPositions.push({ month: MONTHS[month], index: i });
          lastMonth = month;
        }
      }
    });

    return {
      weeks,
      monthLabels: monthLabelPositions,
      totalContributions: total,
      maxCount: max,
      currentStreak: streak,
      longestStreak: longest
    };
  }, [data, year]);

  const levelColors = [
    'var(--heatmap-empty, rgba(255,255,255,0.05))',
    'rgba(16, 185, 129, 0.3)',
    'rgba(16, 185, 129, 0.5)',
    'rgba(16, 185, 129, 0.75)',
    'rgba(16, 185, 129, 1)'
  ];

  return (
    <div className={`activity-heatmap ${className}`}>
      {showStats && (
        <div className="activity-heatmap__stats">
          <div className="activity-heatmap__stat">
            <span className="activity-heatmap__stat-value">{totalContributions}</span>
            <span className="activity-heatmap__stat-label">contributions</span>
          </div>
          <div className="activity-heatmap__stat">
            <TrendingUp size={12} />
            <span className="activity-heatmap__stat-value">{currentStreak}</span>
            <span className="activity-heatmap__stat-label">day streak</span>
          </div>
          <div className="activity-heatmap__stat">
            <Calendar size={12} />
            <span className="activity-heatmap__stat-value">{longestStreak}</span>
            <span className="activity-heatmap__stat-label">longest</span>
          </div>
        </div>
      )}

      <div className="activity-heatmap__container">
        <div className="activity-heatmap__months">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="activity-heatmap__month-label"
              style={{ left: m.index * (cellSize + cellGap) }}
            >
              {m.month}
            </span>
          ))}
        </div>

        <div className="activity-heatmap__grid">
          <div className="activity-heatmap__days">
            {DAYS_OF_WEEK.map((day, i) => (
              <span key={day} className="activity-heatmap__day-label" style={{ top: i * (cellSize + cellGap) }}>
                {i % 2 === 1 ? day : ''}
              </span>
            ))}
          </div>

          <div className="activity-heatmap__weeks">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="activity-heatmap__week">
                {week.map((day, dayIndex) => (
                  day.date.getTime() === 0 ? (
                    <div
                      key={dayIndex}
                      className="activity-heatmap__cell activity-heatmap__cell--empty"
                      style={{ width: cellSize, height: cellSize, marginBottom: cellGap }}
                    />
                  ) : (
                    <motion.div
                      key={dayIndex}
                      className="activity-heatmap__cell"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        marginBottom: cellGap,
                        background: levelColors[day.level],
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                      title={`${day.date.toLocaleDateString()}: ${day.count} activities`}
                    />
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="activity-heatmap__legend">
        <span className="activity-heatmap__legend-label">Less</span>
        {levelColors.map((color, i) => (
          <div
            key={i}
            className="activity-heatmap__legend-cell"
            style={{ background: color, width: cellSize, height: cellSize }}
          />
        ))}
        <span className="activity-heatmap__legend-label">More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
