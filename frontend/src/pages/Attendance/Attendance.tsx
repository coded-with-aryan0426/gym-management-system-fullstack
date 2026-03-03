import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, Clock, TrendingUp, TrendingDown,
  Zap, Calendar, Search, RefreshCw, UserCheck,
  ChevronLeft, ChevronRight, BarChart3, Filter,
  Download, ArrowUpRight, ArrowDownRight, Database,
  UserCircle2, ShieldCheck, Dumbbell
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import { attendanceApi } from '../../services/attendanceTaskApi';
import type { AttendanceTrendPoint, HeatmapCell, TodayCheckIn, AttendanceStats } from '../../services/attendanceTaskApi';
import './Attendance.css';

// ─── Card animation variants ─────────────────────────────────────────────────
const CARD: any = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }
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

const ROLE_TABS = [
  { id: 'all', label: 'All Users', icon: <Activity size={14} />, color: 'var(--accent-crimson)' },
  { id: 'MEMBER', label: 'Members', icon: <Users size={14} />, color: '#10B981' },
  { id: 'TRAINER', label: 'Trainers', icon: <Dumbbell size={14} />, color: '#A78BFA' },
  { id: 'STAFF', label: 'Staff', icon: <ShieldCheck size={14} />, color: '#3B82F6' },
];

const DAYS_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5..23

function buildHeatmapMatrix(cells: HeatmapCell[]) {
  const map: Record<string, number> = {};
  cells.forEach(c => { map[`${c.day}_${c.hour}`] = c.count; });
  const max = Math.max(...Object.values(map), 1);
  return { map, max };
}

function heatColor(count: number, max: number) {
  const t = count / max;
  if (t === 0) return 'rgba(255,255,255,0.03)';
  if (t < 0.25) return 'rgba(220,38,38,0.15)';
  if (t < 0.5) return 'rgba(220,38,38,0.35)';
  if (t < 0.75) return 'rgba(220,38,38,0.60)';
  return 'rgba(220,38,38,0.90)';
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="att-tooltip">
      <p className="att-tooltip__label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="att-tooltip__val" style={{ color: p.color }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

const AttendancePage: React.FC = () => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [trends, setTrends] = useState<AttendanceTrendPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [todayList, setTodayList] = useState<TodayCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(30);
  const [activeRole, setActiveRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'checked-out'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [seeding, setSeeding] = useState(false);

  const loadData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    else setRefreshing(true);

    const today = new Date();
    const from = new Date(today.getTime() - period * 86400000).toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

    const roleParam = activeRole === 'all' ? undefined : activeRole;

    try {
      const [statsRes, trendsRes, heatmapRes, todayRes] = await Promise.allSettled([
        attendanceApi.getStats(roleParam),
        attendanceApi.getTrends(from, to, roleParam),
        attendanceApi.getHeatmap(Math.ceil(period / 7), roleParam),
        attendanceApi.getToday(roleParam),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value);
      if (heatmapRes.status === 'fulfilled') setHeatmap(heatmapRes.value);
      if (todayRes.status === 'fulfilled') setTodayList(todayRes.value);
    } catch (err) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, activeRole]);

  useEffect(() => { loadData(); }, [period, activeRole]);

  const handleSeedData = async () => {
    if (!window.confirm('This will generate mock check-ins for the last 30 days. Proceed?')) return;
    setSeeding(true);
    const t = toast.loading('Seeding demo data...');
    try {
      const res = await attendanceApi.seedAttendance();
      toast.success(res.message, { id: t });
      loadData();
    } catch (err) {
      toast.error('Failed to seed data', { id: t });
    } finally {
      setSeeding(false);
    }
  };

  // ─── Derived ────────────────────────────────────────────────────────────────
  const { map: heatMap, max: heatMax } = buildHeatmapMatrix(heatmap);

  const filteredToday = todayList.filter(c => {
    const matchSearch = !searchQuery ||
      c.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !c.checkOutTime) ||
      (statusFilter === 'checked-out' && c.checkOutTime);
    return matchSearch && matchStatus;
  });

  const avgCheckIns = trends.length
    ? Math.round(trends.reduce((s, t) => s + t.checkIns, 0) / trends.length)
    : 0;
  const maxDay = trends.length
    ? trends.reduce((a, b) => a.checkIns > b.checkIns ? a : b)
    : null;

  const trendChange = trends.length >= 2
    ? Math.round(((trends[trends.length - 1].checkIns - trends[0].checkIns) / Math.max(trends[0].checkIns, 1)) * 100)
    : 0;

  const kpis = stats ? [
    {
      label: "Today's Volume", value: fmt(stats.todayCheckIns),
      icon: <UserCheck size={18} />, color: '#10B981',
      sub: `${stats.liveNow} active now`, trend: null,
    },
    {
      label: 'Weekly Flow', value: fmt(stats.weekCheckIns),
      icon: <Calendar size={18} />, color: '#3B82F6',
      sub: `Avg ${Math.round(stats.weekCheckIns / 7)}/day`, trend: null,
    },
    {
      label: 'Monthly Stats', value: fmt(stats.monthCheckIns),
      icon: <BarChart3 size={18} />, color: '#A78BFA',
      sub: `Avg ${Math.round(stats.monthCheckIns / 30)}/day`, trend: trendChange,
    },
    {
      label: 'Avg Duration', value: fmtDuration(stats.avgSessionMinutes),
      icon: <Clock size={18} />, color: '#F59E0B',
      sub: `System Capacity: ${stats.peakCapacity}`, trend: null,
    },
  ] : [];

  if (loading && !refreshing) {
    return (
      <div className="att-loading">
        <div className="att-loading__spinner" />
        <p>Analyzing floor activity…</p>
      </div>
    );
  }

  return (
    <div className="att-page shadow-blur">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="att-header">
        <div className="att-header__left">
          <div className="att-header__icon">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="att-header__title">Attendance Analytics</h1>
            <p className="att-header__sub">Managing flow for {activeRole === 'all' ? 'All Roles' : activeRole + 's'}</p>
          </div>
        </div>

        <div className="att-header__center">
          <div className="att-role-tabs">
            {ROLE_TABS.map(tab => (
              <button
                key={tab.id}
                className={`att-role-tab ${activeRole === tab.id ? 'active' : ''}`}
                onClick={() => setActiveRole(tab.id)}
                style={{ '--tab-color': tab.color } as any}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
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
          <div className="att-header__actions">
            <button
              className="att-seed-btn"
              onClick={handleSeedData}
              disabled={seeding}
              title="Seed Mock Data"
            >
              <Database size={15} />
            </button>
            <button
              className="att-refresh-btn"
              onClick={() => loadData(true)}
              title="Refresh Stats"
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'att-icon-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────────────── */}
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
            <div className="att-kpi-card__glow" style={{ background: kpi.color }} />
            <div className="att-kpi-card__inner">
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
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Section ─────────────────────────────────────────────── */}
      <div className="att-charts-row">
        <motion.div
          className="att-card att-chart-card"
          variants={CARD} initial="hidden" animate="visible" custom={4}
        >
          <div className="att-card__header">
            <div>
              <h3 className="att-card__title">Activity Momentum</h3>
              <p className="att-card__sub">Daily {activeRole.toLowerCase()} entries over {period} days</p>
            </div>
            <div className="att-chart-controls">
              <div className="att-toggle-group">
                <button className={chartType === 'area' ? 'active' : ''} onClick={() => setChartType('area')}>Area</button>
                <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')}>Bar</button>
              </div>
            </div>
          </div>

          <div className="att-chart-container">
            <ResponsiveContainer width="100%" height={260}>
              {chartType === 'area' ? (
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="checkIns"
                    name="Volume"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#momentumGrad)"
                    activeDot={{ r: 6, fill: '#fff', stroke: '#ef4444', strokeWidth: 3 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                  <Bar dataKey="checkIns" name="Volume" radius={[4, 4, 0, 0]}>
                    {trends.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === trends.length - 1 ? '#ef4444' : 'rgba(239, 68, 68, 0.5)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="att-card att-summary-card"
          variants={CARD} initial="hidden" animate="visible" custom={5}
        >
          <div className="att-card__header">
            <h3 className="att-card__title">Insights</h3>
          </div>
          <div className="att-insight-list">
            <div className="att-insight-item">
              <div className="att-insight-item__icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <TrendingUp size={16} />
              </div>
              <div className="att-insight-item__content">
                <div className="att-insight-item__label">Total Participation</div>
                <div className="att-insight-item__value">{fmt(trends.reduce((s, t) => s + t.checkIns, 0))} entries</div>
              </div>
            </div>
            <div className="att-insight-item">
              <div className="att-insight-item__icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <Users size={16} />
              </div>
              <div className="att-insight-item__content">
                <div className="att-insight-item__label">Peak Day Volume</div>
                <div className="att-insight-item__value">{maxDay ? `${maxDay.day} (${fmt(maxDay.checkIns)})` : '—'}</div>
              </div>
            </div>
            <div className="att-insight-item">
              <div className="att-insight-item__icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <Clock size={16} />
              </div>
              <div className="att-insight-item__content">
                <div className="att-insight-item__label">Average Session</div>
                <div className="att-insight-item__value">{fmtDuration(stats?.avgSessionMinutes ?? 0)}</div>
              </div>
            </div>
            <div className="att-insight-item">
              <div className="att-insight-item__icon" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                <Zap size={16} />
              </div>
              <div className="att-insight-item__content">
                <div className="att-insight-item__label">Utilization Rate</div>
                <div className="att-insight-item__value">
                  {stats ? Math.round((stats.liveNow / stats.peakCapacity) * 100) : 0}% capacity
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Heatmap ────────────────────────────────────────────────────── */}
      <motion.div
        className="att-card att-heatmap-card"
        variants={CARD} initial="hidden" animate="visible" custom={6}
      >
        <div className="att-card__header">
          <div>
            <h3 className="att-card__title">Density Map</h3>
            <p className="att-card__sub">Hour × Day intensity spectrum</p>
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

        <div className="att-heatmap-scroll">
          <div className="att-heatmap">
            <div className="att-heatmap__hours-row">
              <div className="att-heatmap__day-label" />
              {HOURS.map(h => (
                <div key={h} className="att-heatmap__hour-label">
                  {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
                </div>
              ))}
            </div>

            {DAYS_ORDER.map(day => (
              <div key={day} className="att-heatmap__row">
                <div className="att-heatmap__day-label">{day}</div>
                {HOURS.map(hour => {
                  const count = heatMap[`${day}_${hour}`] ?? 0;
                  return (
                    <motion.div
                      key={hour}
                      className="att-heatmap__cell"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ background: heatColor(count, heatMax) }}
                      title={`${day} ${hour}:00 — ${count} logs`}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Log Table ──────────────────────────────────────────────────── */}
      <motion.div
        className="att-card att-log-card"
        variants={CARD} initial="hidden" animate="visible" custom={7}
      >
        <div className="att-card__header">
          <div>
            <h3 className="att-card__title">Live Floor Log</h3>
            <p className="att-card__sub">{filteredToday.length} logs matching current filters</p>
          </div>
          <div className="att-log-controls">
            <div className="att-search">
              <Search size={14} className="att-search__icon" />
              <input
                className="att-search__input"
                placeholder="Search name or email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="att-filter-chips">
              {(['all', 'active', 'checked-out'] as const).map(s => (
                <button
                  key={s}
                  className={`att-filter-chip ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'active' ? 'Inside' : s === 'checked-out' ? 'Checked Out' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="att-table-viewport">
          <table className="att-table">
            <thead>
              <tr>
                <th>User Identity</th>
                <th>Role</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredToday.length === 0 ? (
                <tr>
                  <td colSpan={6} className="att-table__empty">
                    <div className="att-empty-state">
                      <Filter size={32} />
                      <p>{searchQuery ? 'No matches found' : 'No activity recorded yet today'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredToday.map(c => (
                  <tr key={c.checkInId}>
                    <td>
                      <div className="att-user-cell">
                        <div className="att-user-cell__avatar">
                          {c.memberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="att-user-cell__info">
                          <div className="att-user-cell__name">{c.memberName}</div>
                          <div className="att-user-cell__email">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`att-role-badge att-role-badge--${c.role?.toLowerCase()}`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="att-table__time">{fmtTime(c.checkInTime)}</td>
                    <td className="att-table__time text-dim">
                      {c.checkOutTime ? fmtTime(c.checkOutTime) : <span className="att-pulse">Current</span>}
                    </td>
                    <td className="att-table__duration">{fmtDuration(c.durationMinutes)}</td>
                    <td>
                      <div className={`att-status-indicator ${c.checkOutTime ? 'is-out' : 'is-in'}`}>
                        <span className="att-status-indicator__dot" />
                        <span className="att-status-indicator__label">
                          {c.checkOutTime ? 'Checked Out' : 'Inside'}
                        </span>
                      </div>
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
