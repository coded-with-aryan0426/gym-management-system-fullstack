import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, Clock, TrendingUp, TrendingDown,
  Zap, Calendar, Search, RefreshCw, UserCheck,
  ChevronLeft, ChevronRight, BarChart3, Filter,
  Download, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { attendanceApi } from '../../services/attendanceTaskApi';
import type { AttendanceTrendPoint, HeatmapCell, TodayCheckIn, AttendanceStats } from '../../services/attendanceTaskApi';
import './Attendance.css';

// ─── Card animation variants ─────────────────────────────────────────────────
const CARD = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }
  })
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('en-IN');
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const fmtDuration = (mins: number | null) => {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const PERIOD_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

const DAYS_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5..23

// ─── Heatmap helpers ──────────────────────────────────────────────────────────
function buildHeatmapMatrix(cells: HeatmapCell[]) {
  const map: Record<string, number> = {};
  cells.forEach(c => { map[`${c.day}_${c.hour}`] = c.count; });
  const max = Math.max(...Object.values(map), 1);
  return { map, max };
}

function heatColor(count: number, max: number) {
  const t = count / max;
  if (t === 0) return 'var(--bg-elevated)';
  if (t < 0.25) return 'rgba(220,38,38,0.15)';
  if (t < 0.5) return 'rgba(220,38,38,0.35)';
  if (t < 0.75) return 'rgba(220,38,38,0.60)';
  return 'rgba(220,38,38,0.90)';
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="att-tooltip">
      <p className="att-tooltip__label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AttendancePage: React.FC = () => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [trends, setTrends] = useState<AttendanceTrendPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [todayList, setTodayList] = useState<TodayCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'checked-out'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const today = new Date();
    const from = new Date(today.getTime() - period * 86400000).toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

    const [statsRes, trendsRes, heatmapRes, todayRes] = await Promise.allSettled([
      attendanceApi.getStats(),
      attendanceApi.getTrends(from, to),
      attendanceApi.getHeatmap(Math.ceil(period / 7)),
      attendanceApi.getToday(),
    ]);

    if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value);
    if (heatmapRes.status === 'fulfilled') setHeatmap(heatmapRes.value);
    if (todayRes.status === 'fulfilled') setTodayList(todayRes.value);

    setLoading(false);
    setRefreshing(false);
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  // Reload heatmap when period changes
  useEffect(() => { if (!loading) loadData(true); }, [period]);

  // ─── Derived ────────────────────────────────────────────────────────────────
  const { map: heatMap, max: heatMax } = buildHeatmapMatrix(heatmap);

  const filteredToday = todayList.filter(c => {
    const matchSearch = !searchQuery ||
      c.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const avgCheckIns = trends.length
    ? Math.round(trends.reduce((s, t) => s + t.checkIns, 0) / trends.length)
    : 0;
  const maxDay = trends.length
    ? trends.reduce((a, b) => a.checkIns > b.checkIns ? a : b)
    : null;
  const minDay = trends.length
    ? trends.reduce((a, b) => a.checkIns < b.checkIns ? a : b)
    : null;

  const trendChange = trends.length >= 2
    ? Math.round(((trends[trends.length - 1].checkIns - trends[0].checkIns) / Math.max(trends[0].checkIns, 1)) * 100)
    : 0;

  // ─── KPI Cards config ───────────────────────────────────────────────────────
  const kpis = stats ? [
    {
      label: 'Today\'s Check-ins', value: fmt(stats.todayCheckIns),
      icon: <UserCheck size={18} />, color: '#10B981',
      sub: `${stats.liveNow} currently inside`, trend: null,
    },
    {
      label: 'This Week', value: fmt(stats.weekCheckIns),
      icon: <Calendar size={18} />, color: '#3B82F6',
      sub: `Avg ${Math.round(stats.weekCheckIns / 7)}/day`, trend: null,
    },
    {
      label: 'This Month', value: fmt(stats.monthCheckIns),
      icon: <BarChart3 size={18} />, color: '#A78BFA',
      sub: `Avg ${Math.round(stats.monthCheckIns / 30)}/day`, trend: trendChange,
    },
    {
      label: 'Avg Session', value: fmtDuration(stats.avgSessionMinutes),
      icon: <Clock size={18} />, color: '#F59E0B',
      sub: `Peak capacity: ${stats.peakCapacity}`, trend: null,
    },
  ] : [];

  if (loading) {
    return (
      <div className="att-loading">
        <div className="att-loading__spinner" />
        <p>Loading attendance data…</p>
      </div>
    );
  }

  return (
    <div className="att-page">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="att-header">
        <div className="att-header__left">
          <div className="att-header__icon">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="att-header__title">Attendance</h1>
            <p className="att-header__sub">Member check-in analytics &amp; live floor status</p>
          </div>
        </div>
        <div className="att-header__right">
          <div className="att-period-tabs">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.days}
                className={`att-period-tab ${period === opt.days ? 'att-period-tab--active' : ''}`}
                onClick={() => setPeriod(opt.days)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            className={`att-refresh-btn ${refreshing ? 'att-refresh-btn--spinning' : ''}`}
            onClick={() => loadData(true)}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="att-kpi-grid">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="att-kpi-card"
            variants={CARD}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="att-kpi-card__top">
              <span className="att-kpi-card__label">{kpi.label}</span>
              <span className="att-kpi-card__icon" style={{ background: `${kpi.color}18`, color: kpi.color }}>
                {kpi.icon}
              </span>
            </div>
            <div className="att-kpi-card__value">{kpi.value}</div>
            <div className="att-kpi-card__bottom">
              <span className="att-kpi-card__sub">{kpi.sub}</span>
              {kpi.trend !== null && (
                <span className={`att-kpi-card__trend ${kpi.trend >= 0 ? 'att-kpi-card__trend--up' : 'att-kpi-card__trend--down'}`}>
                  {kpi.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(kpi.trend)}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main chart + Heatmap row ─────────────────────────────────────── */}
      <div className="att-charts-row">
        {/* Trend Chart */}
        <motion.div
          className="att-chart-card att-chart-card--wide"
          variants={CARD} initial="hidden" animate="visible" custom={4}
        >
          <div className="att-chart-card__header">
            <div>
              <h3 className="att-chart-card__title">Daily Check-in Trend</h3>
              <p className="att-chart-card__sub">
                Avg <strong>{fmt(avgCheckIns)}</strong>/day ·
                Peak <strong>{maxDay?.day} ({fmt(maxDay?.checkIns ?? 0)})</strong>
              </p>
            </div>
            <div className="att-chart-type-toggle">
              <button
                className={`att-chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
                onClick={() => setChartType('area')}
              >Area</button>
              <button
                className={`att-chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >Bar</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {chartType === 'area' ? (
              <AreaChart data={trends} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.floor(trends.length / 8)} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="checkIns" name="Check-ins" stroke="#DC2626" strokeWidth={2} fill="url(#attGrad)" dot={false} activeDot={{ r: 4, fill: '#DC2626' }} />
              </AreaChart>
            ) : (
              <BarChart data={trends} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.floor(trends.length / 8)} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="checkIns" name="Check-ins" radius={[3, 3, 0, 0]}>
                  {trends.map((_, idx) => (
                    <Cell key={idx} fill={idx === trends.length - 1 ? '#DC2626' : 'rgba(220,38,38,0.5)'} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Peak Hours summary card */}
        <motion.div
          className="att-chart-card att-chart-card--narrow"
          variants={CARD} initial="hidden" animate="visible" custom={5}
        >
          <div className="att-chart-card__header">
            <h3 className="att-chart-card__title">Period Summary</h3>
          </div>
          <div className="att-summary-list">
            <div className="att-summary-item">
              <span className="att-summary-item__label">Total Check-ins</span>
              <span className="att-summary-item__value">{fmt(trends.reduce((s, t) => s + t.checkIns, 0))}</span>
            </div>
            <div className="att-summary-item">
              <span className="att-summary-item__label">Daily Average</span>
              <span className="att-summary-item__value">{fmt(avgCheckIns)}</span>
            </div>
            <div className="att-summary-item">
              <span className="att-summary-item__label">Peak Day</span>
              <span className="att-summary-item__value att-summary-item__value--highlight">
                {maxDay ? `${maxDay.day} · ${fmt(maxDay.checkIns)}` : '—'}
              </span>
            </div>
            <div className="att-summary-item">
              <span className="att-summary-item__label">Quietest Day</span>
              <span className="att-summary-item__value">{minDay ? `${minDay.day} · ${fmt(minDay.checkIns)}` : '—'}</span>
            </div>
            <div className="att-summary-item">
              <span className="att-summary-item__label">Trend</span>
              <span className={`att-summary-item__value ${trendChange >= 0 ? 'att-summary-item__value--green' : 'att-summary-item__value--red'}`}>
                {trendChange >= 0 ? '↑' : '↓'} {Math.abs(trendChange)}%
              </span>
            </div>
            <div className="att-summary-item">
              <span className="att-summary-item__label">Avg Session</span>
              <span className="att-summary-item__value">{fmtDuration(stats?.avgSessionMinutes ?? null)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Heatmap ──────────────────────────────────────────────────────── */}
      <motion.div
        className="att-heatmap-card"
        variants={CARD} initial="hidden" animate="visible" custom={6}
      >
        <div className="att-chart-card__header">
          <div>
            <h3 className="att-chart-card__title">Peak Hours Heatmap</h3>
            <p className="att-chart-card__sub">Day × Hour activity intensity over the past {period} days</p>
          </div>
          <div className="att-heatmap-legend">
            <span className="att-heatmap-legend__label">Low</span>
            {[0.1, 0.3, 0.6, 0.9].map((t, i) => (
              <span key={i} className="att-heatmap-legend__swatch"
                style={{ background: heatColor(t * heatMax, heatMax) }} />
            ))}
            <span className="att-heatmap-legend__label">High</span>
          </div>
        </div>

        <div className="att-heatmap">
          {/* Hour labels on top */}
          <div className="att-heatmap__hours-row">
            <div className="att-heatmap__day-label" />
            {HOURS.map(h => (
              <div key={h} className="att-heatmap__hour-label">
                {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAYS_ORDER.map(day => (
            <div key={day} className="att-heatmap__row">
              <div className="att-heatmap__day-label">{day}</div>
              {HOURS.map(hour => {
                const count = heatMap[`${day}_${hour}`] ?? 0;
                return (
                  <div
                    key={hour}
                    className="att-heatmap__cell"
                    style={{ background: heatColor(count, heatMax) }}
                    title={`${day} ${hour}:00 — ${count} check-ins`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Today's log table ─────────────────────────────────────────────── */}
      <motion.div
        className="att-log-card"
        variants={CARD} initial="hidden" animate="visible" custom={7}
      >
        <div className="att-log-card__header">
          <div>
            <h3 className="att-chart-card__title">Today's Check-in Log</h3>
            <p className="att-chart-card__sub">{todayList.length} members visited today</p>
          </div>
          <div className="att-log-card__controls">
            <div className="att-search-box">
              <Search size={14} className="att-search-box__icon" />
              <input
                className="att-search-box__input"
                placeholder="Search member…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="att-filter-tabs">
              {(['all', 'check-in', 'checked-out'] as const).map(s => (
                <button
                  key={s}
                  className={`att-filter-tab ${statusFilter === s ? 'att-filter-tab--active' : ''}`}
                  onClick={() => setStatusFilter(s === 'check-in' ? 'active' : s === 'all' ? 'all' : 'checked-out')}
                >
                  {s === 'check-in' ? 'Active' : s === 'checked-out' ? 'Checked Out' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="att-log-table-wrapper">
          <table className="att-log-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredToday.length === 0 ? (
                <tr>
                  <td colSpan={5} className="att-log-table__empty">
                    {searchQuery ? 'No members match your search' : 'No check-ins recorded today'}
                  </td>
                </tr>
              ) : (
                filteredToday.map(c => (
                  <tr key={c.checkInId}>
                    <td>
                      <div className="att-member-cell">
                        <div className="att-member-cell__avatar">
                          {c.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="att-member-cell__name">{c.memberName}</div>
                          <div className="att-member-cell__email">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="att-log-table__time">{fmtTime(c.checkInTime)}</td>
                    <td className="att-log-table__time">
                      {c.checkOutTime ? fmtTime(c.checkOutTime) : <span className="att-log-table__active">Active</span>}
                    </td>
                    <td>{fmtDuration(c.durationMinutes)}</td>
                    <td>
                      <span className={`att-status-badge att-status-badge--${c.checkOutTime ? 'out' : 'in'}`}>
                        {c.checkOutTime ? 'Checked Out' : 'Inside'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendancePage;
