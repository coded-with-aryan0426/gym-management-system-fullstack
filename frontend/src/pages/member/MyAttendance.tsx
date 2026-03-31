import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Calendar, Clock, TrendingUp, MapPin, CheckCircle2,
  ChevronLeft, ChevronRight, RefreshCw, Loader2,
  UserCheck, History, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import { attendanceApi } from '../../services/attendanceTaskApi';
import { useAuth } from '../../contexts/AuthContext';
import './MyAttendance.css';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  visitsThisMonth: number;
  totalVisits: number;
}

interface CheckInRecord {
  checkInId: number;
  userId: number;
  checkInTime: string;
  checkOutTime: string | null;
  status: string;
}

const DAYS_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const CARD: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }
  })
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const fmtDuration = (mins: number | null) => {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function buildCalendarMatrix(year: number, month: number, visitedDays: Set<number>) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: { day: number | null; visited: boolean; isToday: boolean }[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, visited: false, isToday: false });
  }
  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      visited: visitedDays.has(d),
      isToday: d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    });
  }
  return cells;
}

const MyAttendance: React.FC = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState<CheckInRecord | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [geoStatus, setGeoStatus] = useState<'unknown' | 'inside' | 'outside'>('unknown');

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [historyRes, streakRes] = await Promise.all([
        attendanceApi.getMyHistory?.()
          .catch(() => []),
        attendanceApi.getMyStreak?.()
          .catch(() => null),
      ]);
      setHistory(Array.isArray(historyRes) ? historyRes : []);

      setStreak(streakRes ?? {
        currentStreak: 0,
        longestStreak: 0,
        visitsThisMonth: 0,
        totalVisits: historyRes?.length || 0
      });

      const active = historyRes?.find?.((r: CheckInRecord) => !r.checkOutTime);
      setIsInside(!!active);
      setCurrentCheckIn(active || null);
    } catch {
      setHistory([]);
      setStreak({ currentStreak: 0, longestStreak: 0, visitsThisMonth: 0, totalVisits: 0 });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelfCheckIn = async () => {
    if (geoStatus === 'outside') {
      toast.error("You're not at the gym. Please be within the gym premises to check in.");
      return;
    }
    if (isInside) {
      toast.error("You're already checked in!");
      return;
    }
    setCheckingIn(true);
    try {
      const result = await (attendanceApi as any).selfCheckIn?.() || await (attendanceApi as any).checkIn?.(user?.id);
      toast.success('Checked in successfully!');
      setIsInside(true);
      setCurrentCheckIn(result);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const visitedDays = useMemo(() => {
    const days = new Set<number>();
    history.forEach(r => {
      const d = new Date(r.checkInTime);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        days.add(d.getDate());
      }
    });
    return days;
  }, [history, currentMonth, currentYear]);

  const calendarCells = useMemo(
    () => buildCalendarMatrix(currentYear, currentMonth, visitedDays),
    [currentYear, currentMonth, visitedDays]
  );

  const recentVisits = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
      .slice(0, 10);
  }, [history]);

  const frequencyData = useMemo(() => {
    const weeks: { label: string; visits: number }[] = [];
    const now = new Date();
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (w * 7 + now.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = history.filter(r => {
        const d = new Date(r.checkInTime);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeks.push({ label: `W${12 - w}`, visits: count });
    }
    return weeks;
  }, [history]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  if (loading) {
    return (
      <div className="myatt-page">
        <div className="myatt-loading">
          <Loader2 size={40} className="myatt-spin" />
          <p>Loading your attendance…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="myatt-page">
      <div className="myatt-header">
        <div className="myatt-header__icon"><Calendar size={22} /></div>
        <div>
          <h1 className="myatt-header__title">My Attendance</h1>
          <p className="myatt-header__sub">Track your visits and stay consistent</p>
        </div>
        <button className="myatt-refresh-btn" onClick={loadData} aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ── Streak Banner ── */}
      <motion.section className="myatt-streak-banner" variants={CARD} initial="hidden" animate="visible" custom={0}>
        <div className="myatt-streak-banner__flame" aria-hidden="true">
          <Flame size={28} />
        </div>
        <div className="myatt-streak-stats">
          <div className="myatt-streak-stat">
            <span className="myatt-streak-stat__value">{streak?.currentStreak ?? 0}</span>
            <span className="myatt-streak-stat__label">Current Streak</span>
          </div>
          <div className="myatt-streak-divider" aria-hidden="true" />
          <div className="myatt-streak-stat">
            <span className="myatt-streak-stat__value">{streak?.longestStreak ?? 0}</span>
            <span className="myatt-streak-stat__label">Longest Streak</span>
          </div>
          <div className="myatt-streak-divider" aria-hidden="true" />
          <div className="myatt-streak-stat">
            <span className="myatt-streak-stat__value">{streak?.visitsThisMonth ?? 0}</span>
            <span className="myatt-streak-stat__label">This Month</span>
          </div>
        </div>
      </motion.section>

      <div className="myatt-body">
        {/* ── Left Column ── */}
        <div className="myatt-left">
          {/* Check-In Button */}
          <motion.div className="myatt-card myatt-checkin-card" variants={CARD} initial="hidden" animate="visible" custom={1}>
            {isInside && currentCheckIn ? (
              <div className="myatt-inside-state">
                <div className="myatt-inside-state__icon"><CheckCircle2 size={28} /></div>
                <div className="myatt-inside-state__text">
                  <p className="myatt-inside-state__title">You're checked in</p>
                  <p className="myatt-inside-state__sub">
                    Since {fmtTime(currentCheckIn.checkInTime)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="myatt-checkin-action">
                <div className="myatt-checkin-btn-wrap">
                  <motion.button
                    className="myatt-checkin-btn"
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSelfCheckIn}
                    disabled={checkingIn || geoStatus === 'outside'}
                    aria-label="Check in now"
                  >
                    {checkingIn ? (
                      <Loader2 size={20} className="myatt-spin" />
                    ) : (
                      <><UserCheck size={20} /><span>Check In Now</span></>
                    )}
                  </motion.button>
                  {geoStatus === 'outside' && (
                    <p className="myatt-geo-warning">
                      <MapPin size={12} />
                      You're outside the gym — check-in disabled
                    </p>
                  )}
                  {geoStatus === 'unknown' && !isInside && (
                    <p className="myatt-geo-hint">
                      <MapPin size={12} />
                      Enable location to check in from the app
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Calendar */}
          <motion.div className="myatt-card myatt-calendar-card" variants={CARD} initial="hidden" animate="visible" custom={2}>
            <div className="myatt-calendar-nav">
              <button className="myatt-calendar-nav__btn" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <h2 className="myatt-calendar-title">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button className="myatt-calendar-nav__btn" onClick={nextMonth} aria-label="Next month">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="myatt-calendar-grid" role="grid" aria-label="Attendance calendar">
              {DAYS_ORDER.map(d => (
                <div key={d} className="myatt-calendar-day-label" role="columnheader">{d}</div>
              ))}
              {calendarCells.map((cell, i) => (
                <div
                  key={i}
                  className={`myatt-calendar-cell ${cell.day === null ? 'empty' : ''} ${cell.visited ? 'visited' : ''} ${cell.isToday ? 'today' : ''}`}
                  role="gridcell"
                  aria-label={cell.day ? `${cell.day} — ${cell.visited ? 'visited' : 'not visited'}` : undefined}
                >
                  {cell.day}
                </div>
              ))}
            </div>
            <div className="myatt-calendar-legend" aria-hidden="true">
              <span className="myatt-legend-item"><span className="myatt-legend-dot myatt-legend-dot--visited" />Visited</span>
              <span className="myatt-legend-item"><span className="myatt-legend-dot myatt-legend-dot--today" />Today</span>
            </div>
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="myatt-right">
          {/* Frequency Chart */}
          <motion.div className="myatt-card myatt-chart-card" variants={CARD} initial="hidden" animate="visible" custom={3}>
            <div className="myatt-card__header">
              <div>
                <h2 className="myatt-card__title"><TrendingUp size={16} /> Visit Frequency</h2>
                <p className="myatt-card__sub">Visits per week (last 12 weeks)</p>
              </div>
            </div>
            <div className="myatt-chart-container" role="img" aria-label="Weekly visit frequency chart">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={frequencyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="myatt-tooltip">
                          <p className="myatt-tooltip__label">{label}</p>
                          <p className="myatt-tooltip__val">{payload[0].value} visits</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                    {frequencyData.map((_, i) => (
                      <Cell key={i} fill={i === frequencyData.length - 1 ? '#10B981' : 'rgba(16, 185, 129, 0.4)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Visits */}
          <motion.div className="myatt-card myatt-history-card" variants={CARD} initial="hidden" animate="visible" custom={4}>
            <div className="myatt-card__header">
              <div>
                <h2 className="myatt-card__title"><History size={16} /> Recent Visits</h2>
                <p className="myatt-card__sub">{recentVisits.length} recent entries</p>
              </div>
            </div>
            {recentVisits.length === 0 ? (
              <div className="myatt-empty">
                <BarChart3 size={28} />
                <p>No visits recorded yet</p>
                <span>Check in at the gym to start tracking</span>
              </div>
            ) : (
              <div className="myatt-history-list">
                {recentVisits.map(record => {
                  const d = new Date(record.checkInTime);
                  const duration = record.checkOutTime
                    ? Math.round((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / 60000)
                    : null;
                  return (
                    <div key={record.checkInId} className="myatt-history-item">
                      <div className="myatt-history-item__date">
                        <span className="myatt-history-item__day">{d.toLocaleDateString('en-IN', { day: '2-digit' })}</span>
                        <span className="myatt-history-item__month">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </div>
                      <div className="myatt-history-item__times">
                        <span className="myatt-history-item__time">
                          <Clock size={11} /> {fmtTime(record.checkInTime)}
                        </span>
                        {record.checkOutTime && (
                          <span className="myatt-history-item__time">
                            → {fmtTime(record.checkOutTime)}
                          </span>
                        )}
                      </div>
                      <div className={`myatt-history-item__status ${record.checkOutTime ? 'checked-out' : 'inside'}`}>
                        {record.checkOutTime ? 'Out' : 'In'}
                      </div>
                      <span className="myatt-history-item__duration">{fmtDuration(duration)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
