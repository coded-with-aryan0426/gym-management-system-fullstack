import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Dumbbell,
  CreditCard,
  Zap,
  Eye,
  Gift,
  Wallet,
  UserCheck,
  Timer,
  RefreshCw,
  CircleDot,
  AlertTriangle,
  Target,
  Flame,
  ShieldAlert,
  Layers,
  BarChart3
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import api from "../../services/api"
import { useCurrency } from "../../contexts/CurrencyContext"
import "./Dashboard.css"

interface DashboardData {
  todayRevenue: number
  revenueChange: number
  liveMembers: number
  checkIns: number
  pendingPaymentsAmount: number
  pendingPaymentsCount?: number
  totalMembers: number
  newSignups: number
  totalTrainers: number
  totalSessionsToday?: number
  monthlyRevenue: number
  trainerSchedule: any[]
  expiringMembers: any[]
  overduePayments?: any[]
  topTrainers?: any[]
  bestPlans?: any[]
  stockAlerts?: any[]
  recentActivity: any[]
  birthdays: any[]
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [now, setNow] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()

  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true)
      setError(null)
      const response = await api.getOwnerDashboard()
      setData(response)

      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      const fromDate = weekAgo.toISOString().split('T')[0]
      const toDate = today.toISOString().split('T')[0]
      const monthFromDate = monthAgo.toISOString().split('T')[0]

      const results = await Promise.allSettled([
        api.getDailyRevenue(fromDate, toDate),
        api.getDailyAttendance(fromDate, toDate),
        api.getMembershipBreakdown(),
        api.getRevenueBySource(monthFromDate, toDate),
        api.getOverduePayments(5),
        api.getTodaysClasses(),
        api.getOccupancy(),
        api.getMonthlyProgress()
      ])

      const getValue = (r: PromiseSettledResult<any>) => r.status === 'fulfilled' ? r.value : null

      setAnalyticsData({
        dailyRevenue: getValue(results[0]),
        dailyAttendance: getValue(results[1]),
        membershipBreakdown: getValue(results[2]),
        revenueBySource: getValue(results[3]),
        overduePayments: getValue(results[4]),
        todaysClasses: getValue(results[5]),
        occupancy: getValue(results[6]),
        monthlyProgress: getValue(results[7])
      })
    } catch (err) {
      console.error("[Dashboard] Failed to fetch data", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [loadDashboardData])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const greeting = useMemo(() => {
    const h = now.getHours()
    if (h < 12) return "Good Morning"
    if (h < 17) return "Good Afternoon"
    return "Good Evening"
  }, [now])

  const dateStr = useMemo(() => {
    return now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  }, [now])

  // Revenue sparkline data
  const revenueSparkline = useMemo(() => {
    if (analyticsData?.dailyRevenue) {
      return analyticsData.dailyRevenue.map((item: any) => ({
        day: item.day,
        value: Math.round(item.revenue)
      }))
    }
    const base = data?.monthlyRevenue || 50000
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({
      day: d,
      value: Math.round(base / 7 * (0.6 + Math.random() * 0.8))
    }))
  }, [analyticsData?.dailyRevenue, data?.monthlyRevenue])

  // Membership distribution
  const membershipDistribution = useMemo(() => {
    if (analyticsData?.membershipBreakdown) {
      const b = analyticsData.membershipBreakdown
      return [
        { name: 'Active', value: b.active || 0, color: '#10b981' },
        { name: 'Expiring', value: b.expiring || 0, color: '#f59e0b' },
        { name: 'Frozen', value: b.frozen || 0, color: '#6366f1' },
        { name: 'Expired', value: b.expired || 0, color: '#ef4444' },
      ]
    }
    return [
      { name: 'Active', value: data?.totalMembers ? Math.round(data.totalMembers * 0.72) : 65, color: '#10b981' },
      { name: 'Expiring', value: data?.expiringMembers?.length || 8, color: '#f59e0b' },
      { name: 'Frozen', value: data?.totalMembers ? Math.round(data.totalMembers * 0.08) : 5, color: '#6366f1' },
      { name: 'Expired', value: data?.totalMembers ? Math.round(data.totalMembers * 0.12) : 12, color: '#ef4444' },
    ]
  }, [analyticsData?.membershipBreakdown, data])

  // Attendance trend
  const attendanceTrend = useMemo(() => {
    if (analyticsData?.dailyAttendance) {
      return analyticsData.dailyAttendance.map((item: any) => ({
        day: item.day,
        count: item.checkIns || 0
      }))
    }
    const base = data?.checkIns || 30
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({
      day: d,
      count: Math.round(base * (0.5 + Math.random() * 1))
    }))
  }, [analyticsData?.dailyAttendance, data?.checkIns])

  // Revenue breakdown — capped to top 6
  const revenueBreakdown = useMemo(() => {
    if (!analyticsData?.revenueBySource || analyticsData.revenueBySource.length === 0) return []
    const sources = analyticsData.revenueBySource.slice(0, 6)
    const total = sources.reduce((s: number, r: any) => s + (r.total || 0), 0)
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4']
    return sources.map((s: any, i: number) => ({
      label: s.category || 'Other',
      value: s.total || 0,
      pct: total > 0 ? Math.round((s.total / total) * 100) : 0,
      color: colors[i % colors.length]
    }))
  }, [analyticsData?.revenueBySource])

  const revenueTotal = useMemo(() => {
    return revenueBreakdown.reduce((s: number, r: any) => s + r.value, 0)
  }, [revenueBreakdown])

  const isPositive = (data?.revenueChange || 0) >= 0

  // Occupancy helpers
  const occupancy = analyticsData?.occupancy
  const occPct = occupancy ? Math.round(occupancy.percentage) : 0
  const occLevel = occPct < 60 ? 'low' : occPct < 80 ? 'medium' : 'high'

  // Monthly progress
  const progress = analyticsData?.monthlyProgress
  const progressPct = progress ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0

  if (loading && !data) {
    return (
      <div className="dash-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="dash-loading__spinner"
        />
        <span>Loading Dashboard...</span>
      </div>
    )
  }

  return (
    <div className="dash">
      {/* Header */}
      <header className="dash__header">
        <div className="dash__header-left">
          <h1 className="dash__greeting">{greeting}</h1>
          <p className="dash__date">{dateStr}</p>
        </div>
        <div className="dash__header-right">
          <button
            className={`dash__refresh-btn ${refreshing ? 'dash__refresh-btn--spinning' : ''}`}
            onClick={loadDashboardData}
            title="Refresh"
            disabled={refreshing}
          >
            <RefreshCw size={14} />
          </button>
          <div className="dash__live-pill">
            <span className="dash__live-dot" />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="dash__error">
          <AlertCircle size={14} />
          <span>{error}</span>
          <button onClick={loadDashboardData}>Retry</button>
        </div>
      )}

      {/* KPI Row */}
      <div className="dash__kpi-row">
        <KPICard icon={<Wallet size={18} />} label="Today's Revenue" value={formatPrice(data?.todayRevenue || 0)} change={data?.revenueChange || 0} color="emerald" />
        <KPICard icon={<Eye size={18} />} label="Live on Floor" value={String(data?.liveMembers || 0)} sub={`${data?.checkIns || 0} check-ins today`} color="blue" />
        <KPICard icon={<Users size={18} />} label="Total Members" value={String(data?.totalMembers || 0)} sub={`+${data?.newSignups || 0} new today`} color="violet" />
        <KPICard icon={<Dumbbell size={18} />} label="Sessions Today" value={String(data?.totalSessionsToday || 0)} sub={`${data?.totalTrainers || 0} trainers active`} color="amber" />
        <KPICard icon={<CreditCard size={18} />} label="Pending Dues" value={formatPrice(data?.pendingPaymentsAmount || 0)} sub={`${data?.pendingPaymentsCount || 0} members`} color="rose" alert />
      </div>

      {/* ── 12-column grid ── */}
      <div className="dash__grid">

        {/* Occupancy Gauge — 3 cols */}
        {occupancy && (
          <section className="dash__card dash__card--occupancy">
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--violet"><Activity size={14} /></div>
              <div>
                <h3 className="dash__card-title">Gym Occupancy</h3>
                <p className="dash__card-sub">Current capacity usage</p>
              </div>
            </div>
            <div className="dash__occ-body">
              <div className="dash__occ-gauge">
                <svg viewBox="0 0 120 120" className="dash__occ-ring">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={occLevel === 'low' ? '#10b981' : occLevel === 'medium' ? '#f59e0b' : '#f43f5e'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${occPct * 3.27} 327`}
                    transform="rotate(-90 60 60)"
                    className="dash__occ-ring-fill"
                  />
                </svg>
                <div className="dash__occ-center">
                  <span className={`dash__occ-pct dash__occ-pct--${occLevel}`}>{occPct}%</span>
                </div>
              </div>
              <div className="dash__occ-meta">
                <div className="dash__occ-stat">
                  <span className="dash__occ-stat-label">Current</span>
                  <span className="dash__occ-stat-value">{occupancy.currentCount}</span>
                </div>
                <div className="dash__occ-stat">
                  <span className="dash__occ-stat-label">Capacity</span>
                  <span className="dash__occ-stat-value">{occupancy.maxCapacity}</span>
                </div>
                <div className="dash__occ-stat">
                  <span className="dash__occ-stat-label">Trend</span>
                  <span className={`dash__occ-trend dash__occ-trend--${occupancy.trend}`}>
                    {occupancy.trend === 'rising' && <TrendingUp size={11} />}
                    {occupancy.trend === 'falling' && <TrendingDown size={11} />}
                    {occupancy.trend === 'stable' && <CircleDot size={11} />}
                    {occupancy.trend}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Monthly Progress — 3 cols */}
        {progress && (
          <section className="dash__card dash__card--progress">
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--cyan"><Target size={14} /></div>
              <div>
                <h3 className="dash__card-title">Monthly Progress</h3>
                <p className="dash__card-sub">Revenue target tracking</p>
              </div>
              <span className={`dash__status-chip dash__status-chip--${(progress.status || 'behind').toLowerCase().replace(' ', '_')}`}>
                {progress.status?.replace('_', ' ') || 'Behind'}
              </span>
            </div>
            <div className="dash__prog-body">
              <div className="dash__prog-bar-wrap">
                <div className="dash__prog-bar">
                  <div className="dash__prog-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="dash__prog-pct">{progressPct}%</span>
              </div>
              <div className="dash__prog-stats">
                <div className="dash__prog-stat">
                  <span className="dash__prog-stat-label">Current</span>
                  <span className="dash__prog-stat-value">{formatPrice(progress.current)}</span>
                </div>
                <div className="dash__prog-stat">
                  <span className="dash__prog-stat-label">Target</span>
                  <span className="dash__prog-stat-value">{formatPrice(progress.target)}</span>
                </div>
                <div className="dash__prog-stat">
                  <span className="dash__prog-stat-label">Days Left</span>
                  <span className="dash__prog-stat-value">{progress.daysRemaining}</span>
                </div>
              </div>
              {progress.projectedEnd && (
                <div className="dash__prog-projected">
                  Projected: <strong>{formatPrice(progress.projectedEnd)}</strong>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Revenue Breakdown — 3 cols, CAPPED */}
        {revenueBreakdown.length > 0 && (
          <section className="dash__card dash__card--breakdown">
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--indigo"><Layers size={14} /></div>
              <div>
                <h3 className="dash__card-title">Revenue Breakdown</h3>
                <p className="dash__card-sub">By source &middot; Last 30 days</p>
              </div>
              <span className="dash__bkdn-total">{formatPrice(revenueTotal)}</span>
            </div>
            <div className="dash__bkdn-list">
              {revenueBreakdown.map((item: any, i: number) => (
                <div key={i} className="dash__bkdn-row">
                  <span className="dash__bkdn-dot" style={{ background: item.color }} />
                  <span className="dash__bkdn-label">{item.label}</span>
                  <div className="dash__bkdn-bar-track">
                    <div className="dash__bkdn-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                  <span className="dash__bkdn-pct">{item.pct}%</span>
                  <span className="dash__bkdn-amount">{formatPrice(item.value)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Attendance Bar Chart — 3 cols */}
        <section className="dash__card dash__card--attendance">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--blue"><BarChart3 size={14} /></div>
            <div>
              <h3 className="dash__card-title">Attendance</h3>
              <p className="dash__card-sub">Daily check-ins this week</p>
            </div>
            <div className="dash__card-highlight">
              <Activity size={13} />
              <span>{data?.checkIns || 0} today</span>
            </div>
          </div>
          <div className="dash__chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[5, 5, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Revenue Area Chart — 6 cols */}
        <section className="dash__card dash__card--revenue">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--emerald"><TrendingUp size={14} /></div>
            <div>
              <h3 className="dash__card-title">Revenue Overview</h3>
              <p className="dash__card-sub">Weekly earnings trend</p>
            </div>
            <div className="dash__card-stat">
              <span className="dash__card-stat-value">{formatPrice(data?.monthlyRevenue || 0)}</span>
              <span className={`dash__card-stat-badge ${isPositive ? 'pos' : 'neg'}`}>
                {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(data?.revenueChange || 0).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="dash__chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSparkline} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} formatter={(val: number | undefined) => [formatPrice(val ?? 0), 'Revenue']} cursor={{ stroke: 'rgba(16,185,129,0.2)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Membership Breakdown — 7 cols, big & informative */}
        <section className="dash__card dash__card--membership">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--emerald"><Users size={14} /></div>
            <div>
              <h3 className="dash__card-title">Membership Breakdown</h3>
              <p className="dash__card-sub">Current status distribution</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate('/members')}>
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="dash__mem-body">
            <div className="dash__mem-chart">
              <div className="dash__mem-donut-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={membershipDistribution}
                      cx="50%" cy="50%"
                      innerRadius={62} outerRadius={90}
                      paddingAngle={3} dataKey="value" strokeWidth={0}
                    >
                      {membershipDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dash__donut-center">
                  <span className="dash__donut-total">{data?.totalMembers || 0}</span>
                  <span className="dash__donut-label">TOTAL</span>
                </div>
              </div>
            </div>
            <div className="dash__mem-stats">
              {membershipDistribution.map(item => {
                const total = data?.totalMembers || 1
                const pct = Math.round((item.value / total) * 100)
                return (
                  <div key={item.name} className="dash__mem-stat-row">
                    <div className="dash__mem-stat-head">
                      <span className="dash__mem-stat-dot" style={{ background: item.color }} />
                      <span className="dash__mem-stat-name">{item.name}</span>
                      <span className="dash__mem-stat-count">{item.value}</span>
                      <span className="dash__mem-stat-pct" style={{ color: item.color }}>{pct}%</span>
                    </div>
                    <div className="dash__mem-stat-bar">
                      <div className="dash__mem-stat-fill" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                )
              })}
              <div className="dash__mem-summary">
                <div className="dash__mem-summary-item">
                  <span className="dash__mem-summary-label">New this month</span>
                  <span className="dash__mem-summary-val">+{data?.newSignups || 0}</span>
                </div>
                <div className="dash__mem-summary-item">
                  <span className="dash__mem-summary-label">Expiring soon</span>
                  <span className="dash__mem-summary-val dash__mem-summary-val--warn">{data?.expiringMembers?.length || 0}</span>
                </div>
                <div className="dash__mem-summary-item">
                  <span className="dash__mem-summary-label">Retention rate</span>
                  <span className="dash__mem-summary-val dash__mem-summary-val--good">
                    {data?.totalMembers ? Math.round(((membershipDistribution[0]?.value || 0) / data.totalMembers) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trainer Schedule — 5 cols */}
        <section className="dash__card dash__card--trainers">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--violet"><Dumbbell size={14} /></div>
            <div>
              <h3 className="dash__card-title">Trainer Schedule</h3>
              <p className="dash__card-sub">Today's sessions</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate('/trainers')}>
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="dash__list-scroll">
            {data?.trainerSchedule?.map((trainer, i) => (
              <div key={i} className="dash__trainer-row">
                <div className="dash__trainer-avatar">{trainer.initials}</div>
                <div className="dash__trainer-info">
                  <span className="dash__trainer-name">{trainer.name}</span>
                  <span className="dash__trainer-meta">{trainer.sessionsToday} sessions &middot; {trainer.availableSlots} slots free</span>
                </div>
                <div className="dash__trainer-slots">
                  {trainer.slots?.slice(0, 3).map((slot: any, j: number) => (
                    <span key={j} className={`dash__slot dash__slot--${slot.status}`} title={slot.memberName || slot.time}>
                      {slot.time?.replace(' AM', 'a').replace(' PM', 'p')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {(!data?.trainerSchedule || data.trainerSchedule.length === 0) && (
              <div className="dash__empty">No trainers scheduled today</div>
            )}
          </div>
        </section>

        {/* Expiring Memberships — 4 cols */}
        <section className="dash__card dash__card--expiring">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--amber"><AlertTriangle size={14} /></div>
            <div>
              <h3 className="dash__card-title">Expiring Soon</h3>
              <p className="dash__card-sub">Next 7 days</p>
            </div>
            <span className="dash__count-badge">{data?.expiringMembers?.length || 0}</span>
          </div>
          <div className="dash__list-scroll">
            {data?.expiringMembers?.slice(0, 6).map((member, i) => (
              <div key={i} className="dash__expire-row">
                <div className="dash__expire-info">
                  <span className="dash__expire-name">{member.name}</span>
                  <span className="dash__expire-plan">{member.plan}</span>
                </div>
                <span className={`dash__expire-days ${member.daysLeft <= 2 ? 'urgent' : member.daysLeft <= 4 ? 'warn' : ''}`}>
                  {member.daysLeft}d
                </span>
              </div>
            ))}
            {(!data?.expiringMembers || data.expiringMembers.length === 0) && (
              <div className="dash__empty">No memberships expiring</div>
            )}
          </div>
        </section>

        {/* Today's Schedule — 4 cols - REPLACES Live Activity */}
        <section className="dash__card dash__card--schedule">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--cyan"><Calendar size={14} /></div>
            <div>
              <h3 className="dash__card-title">Today's Schedule</h3>
              <p className="dash__card-sub">Upcoming classes & sessions</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate('/classes')}>
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="dash__list-scroll">
            {analyticsData?.todaysClasses?.slice(0, 5).map((cls: any, i: number) => (
              <div key={i} className="dash__schedule-row">
                <div className="dash__schedule-time">
                  {new Date(cls.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="dash__schedule-info">
                  <span className="dash__schedule-name">{cls.name}</span>
                  <span className="dash__schedule-meta">{cls.trainer}</span>
                </div>
                <div className={`dash__schedule-status dash__schedule-status--${cls.status?.toLowerCase() || 'upcoming'}`}>
                  {cls.status === 'IN_PROGRESS' ? 'LIVE' : cls.status === 'COMPLETED' ? 'Done' : 'Upcoming'}
                </div>
              </div>
            ))}
            {(!analyticsData?.todaysClasses || analyticsData.todaysClasses.length === 0) && (
              <div className="dash__empty">No classes scheduled today</div>
            )}
          </div>
        </section>

        {/* Staff On Duty — 4 cols - REPLACES Birthdays */}
        <section className="dash__card dash__card--staff">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--amber"><ShieldAlert size={14} /></div>
            <div>
              <h3 className="dash__card-title">Staff On Duty</h3>
              <p className="dash__card-sub">Today's team</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate('/staff')}>
              View All <ArrowRight size={11} />
            </button>
          </div>
          <div className="dash__list-scroll">
            {data?.trainerSchedule?.slice(0, 4).map((trainer: any, i: number) => (
              <div key={i} className="dash__staff-row">
                <div className="dash__staff-avatar">{trainer.initials}</div>
                <div className="dash__staff-info">
                  <span className="dash__staff-name">{trainer.name}</span>
                  <span className="dash__staff-role">{trainer.sessionsToday} sessions</span>
                </div>
                <div className="dash__staff-status dash__staff-status--on">
                  <CircleDot size={8} /> On Duty
                </div>
              </div>
            ))}
            {(!data?.trainerSchedule || data.trainerSchedule.length === 0) && (
              <div className="dash__empty">No staff on duty</div>
            )}
          </div>
        </section>

        {/* Quick Actions — 4 cols */}
        <section className="dash__card dash__card--quick-actions">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--blue"><Flame size={14} /></div>
            <div>
              <h3 className="dash__card-title">Quick Actions</h3>
            </div>
          </div>
          <div className="dash__action-grid">
            <button className="dash__action-btn dash__action-btn--primary" onClick={() => navigate('/members?action=create')}>
              <UserPlus size={18} /><span>Add Member</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/check-in')}>
              <CheckCircle2 size={18} /><span>Check-in</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/financials')}>
              <Wallet size={18} /><span>Payments</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/classes')}>
              <Calendar size={18} /><span>Classes</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/trainers')}>
              <Dumbbell size={18} /><span>Trainers</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/equipment')}>
              <Zap size={18} /><span>Equipment</span>
            </button>
          </div>
        </section>

        {/* Overdue Payments — if present, 4 cols */}
        {analyticsData?.overduePayments && analyticsData.overduePayments.length > 0 && (
          <section className="dash__card dash__card--overdue">
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--rose"><ShieldAlert size={14} /></div>
              <div>
                <h3 className="dash__card-title">Overdue Payments</h3>
                <p className="dash__card-sub">Members with pending dues</p>
              </div>
              <span className="dash__count-badge dash__count-badge--rose">{analyticsData.overduePayments.length}</span>
            </div>
            <div className="dash__list-scroll">
              {analyticsData.overduePayments.slice(0, 5).map((payment: any, i: number) => (
                <div key={i} className="dash__overdue-row">
                  <div className="dash__overdue-info">
                    <span className="dash__overdue-name">{payment.memberName}</span>
                    <span className="dash__overdue-plan">{payment.planName}</span>
                  </div>
                  <div className="dash__overdue-right">
                    <span className="dash__overdue-days">{payment.daysOverdue}d overdue</span>
                    <span className="dash__overdue-price">{formatPrice(payment.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
            {analyticsData.overduePayments.length > 5 && (
              <button className="dash__link-btn dash__link-btn--bottom" onClick={() => navigate('/financials?filter=overdue')}>
                View All Overdue <ArrowRight size={11} />
              </button>
            )}
          </section>
        )}

        {/* Duplicate "Today's Classes" widget removed — already shown in "Today's Schedule" above */}

      </div>
    </div>
  )
}

/* ── Sub-components ── */

interface KPICardProps {
  icon: React.ReactNode
  label: string
  value: string
  change?: number
  sub?: string
  color: string
  alert?: boolean
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, change, sub, color, alert: isAlert }) => {
  const hasChange = change !== undefined && change !== null
  const isPos = (change || 0) >= 0

  return (
    <motion.div
      className={`dash__kpi dash__kpi--${color} ${isAlert ? 'dash__kpi--alert' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="dash__kpi-icon">{icon}</div>
      <div className="dash__kpi-body">
        <span className="dash__kpi-value">{value}</span>
        <span className="dash__kpi-label">{label}</span>
        {hasChange && (
          <span className={`dash__kpi-change ${isPos ? 'pos' : 'neg'}`}>
            {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
        {sub && <span className="dash__kpi-sub">{sub}</span>}
      </div>
    </motion.div>
  )
}

export default Dashboard
