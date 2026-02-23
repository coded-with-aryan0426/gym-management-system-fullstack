import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Users, Activity, TrendingUp, TrendingDown, ArrowRight,
  Calendar, UserPlus, CheckCircle2, AlertCircle, Dumbbell,
  CreditCard, Zap, Eye, Wallet, UserCheck, RefreshCw,
  CircleDot, AlertTriangle, Target, ShieldAlert, Layers,
  BarChart3, Clock, Flame, Star, Award,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  LineChart, Line,
} from "recharts"
import api from "../../services/api"
import { useCurrency } from "../../contexts/CurrencyContext"
import "./Dashboard.css"

/* ── Dummy sparkline so KPI cards always show a trend shape ── */
const DEMO_SPARK = [
  { v: 40 }, { v: 55 }, { v: 45 }, { v: 70 }, { v: 60 }, { v: 80 }, { v: 75 },
]
const DEMO_REVENUE = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  value: 8000 + Math.sin(i * 0.5) * 4000 + Math.random() * 2000,
}))
const DEMO_ATTENDANCE = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  count: Math.floor(15 + Math.random() * 30),
}))

interface DashboardData {
  todayRevenue: number; revenueChange: number; liveMembers: number
  checkIns: number; pendingPaymentsAmount: number; pendingPaymentsCount?: number
  totalMembers: number; newSignups: number; totalTrainers: number
  totalSessionsToday?: number; monthlyRevenue: number
  trainerSchedule: any[]; expiringMembers: any[]
  overduePayments?: any[]; recentActivity: any[]; birthdays: any[]
}

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }
  })
}

const Dashboard: React.FC = () => {
  const [loading, setLoading]           = useState(true)
  const [data, setData]                 = useState<DashboardData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [now, setNow]                   = useState(new Date())
  const [refreshing, setRefreshing]     = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const navigate  = useNavigate()
  const { formatPrice } = useCurrency()

  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true); setError(null)
      const response = await api.getOwnerDashboard()
      setData(response)

      const today         = new Date()
      const from30        = new Date(today.getTime() - 30 * 86400000).toISOString().split("T")[0]
      const from7         = new Date(today.getTime() -  7 * 86400000).toISOString().split("T")[0]
      const toDate        = today.toISOString().split("T")[0]

      const results = await Promise.allSettled([
        api.getDailyRevenue(from30, toDate),
        api.getDailyAttendance(from7, toDate),
        api.getMembershipBreakdown(),
        api.getRevenueBySource(from30, toDate),
        api.getOverduePayments(8),
        api.getTodaysClasses(),
        api.getOccupancy(),
        api.getMonthlyProgress(),
      ])
      const get = (r: PromiseSettledResult<any>) => r.status === "fulfilled" ? r.value : null
      setAnalyticsData({
        dailyRevenue:        get(results[0]),
        dailyAttendance:     get(results[1]),
        membershipBreakdown: get(results[2]),
        revenueBySource:     get(results[3]),
        overduePayments:     get(results[4]),
        todaysClasses:       get(results[5]),
        occupancy:           get(results[6]),
        monthlyProgress:     get(results[7]),
      })
    } catch (err) {
      console.error("[Dashboard]", err)
      setError("Failed to load")
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadDashboardData(); const t = setInterval(loadDashboardData, 30000); return () => clearInterval(t) }, [loadDashboardData])
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])

  const greeting = useMemo(() => {
    const h = now.getHours()
    if (h < 12) return { text: "Good Morning", emoji: "☀️" }
    if (h < 17) return { text: "Good Afternoon", emoji: "⚡" }
    return { text: "Good Evening", emoji: "🌙" }
  }, [now])

  const dateStr = useMemo(() =>
    now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }), [now])

  /* ── Chart data (real or demo) ── */
  const revenueChart = useMemo(() => {
    if (analyticsData?.dailyRevenue?.length) {
      return analyticsData.dailyRevenue.map((item: any) => ({
        day: String(item.day ?? "").slice(5),
        value: Math.round(item.revenue ?? 0),
      }))
    }
    return DEMO_REVENUE
  }, [analyticsData?.dailyRevenue])

  const attendanceChart = useMemo(() => {
    if (analyticsData?.dailyAttendance?.length) {
      return analyticsData.dailyAttendance.map((item: any) => ({
        day: String(item.day ?? "").slice(5),
        count: item.checkIns ?? 0,
      }))
    }
    return DEMO_ATTENDANCE
  }, [analyticsData?.dailyAttendance])

  const membershipDist = useMemo(() => {
    const b = analyticsData?.membershipBreakdown
    const t = data?.totalMembers || 0
    if (b) return [
      { name: "Active",   value: b.active   || 0, color: "#10b981" },
      { name: "Expiring", value: b.expiring  || 0, color: "#f59e0b" },
      { name: "Frozen",   value: b.frozen    || 0, color: "#6366f1" },
      { name: "Expired",  value: b.expired   || 0, color: "#ef4444" },
    ]
    return [
      { name: "Active",   value: Math.round(t * 0.80), color: "#10b981" },
      { name: "Expiring", value: data?.expiringMembers?.length || 2, color: "#f59e0b" },
      { name: "Frozen",   value: Math.round(t * 0.07), color: "#6366f1" },
      { name: "Expired",  value: Math.round(t * 0.05), color: "#ef4444" },
    ]
  }, [analyticsData?.membershipBreakdown, data])

  const revenueBreakdown = useMemo(() => {
    if (!analyticsData?.revenueBySource?.length) return []
    const sources = analyticsData.revenueBySource.slice(0, 6)
    const total   = sources.reduce((s: number, r: any) => s + (r.total || 0), 0)
    const colors  = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#f43f5e","#06b6d4"]
    return sources.map((s: any, i: number) => ({
      label: s.category || s.source || s.planName || s.plan || "Other",
      value: s.total || 0,
      pct: total > 0 ? Math.round((s.total / total) * 100) : 0,
      color: colors[i % colors.length],
    }))
  }, [analyticsData?.revenueBySource])

  const occupancy    = analyticsData?.occupancy
  const occPct       = occupancy ? Math.round(occupancy.percentage) : 0
  const occLevel     = occPct < 50 ? "low" : occPct < 75 ? "medium" : "high"
  const progress     = analyticsData?.monthlyProgress
  const progressPct  = progress ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0
  const isPositive   = (data?.revenueChange || 0) >= 0
  const totalMembers = data?.totalMembers || 0
  const retentionPct = totalMembers > 0 ? Math.round(((membershipDist[0]?.value || 0) / totalMembers) * 100) : 0

  const isRealRevenue = !!analyticsData?.dailyRevenue?.length
  const isRealAttendance = !!analyticsData?.dailyAttendance?.length

  if (loading && !data) return (
    <div className="dash-loading">
      <div className="dash-loading__ring" />
      <span>Loading Dashboard…</span>
    </div>
  )

  return (
    <div className="dash">

      {/* ══ HEADER ══ */}
      <header className="dash__header">
        <div className="dash__header-left">
          <span className="dash__greeting-emoji">{greeting.emoji}</span>
          <div>
            <h1 className="dash__greeting">{greeting.text}, <span className="dash__greeting-name">Owner</span></h1>
            <p className="dash__date">{dateStr}</p>
          </div>
        </div>
        <div className="dash__header-right">
          {error && (
            <div className="dash__inline-error">
              <AlertCircle size={12} />
              <span>Error loading</span>
              <button onClick={loadDashboardData}>Retry</button>
            </div>
          )}
          <button
            className={`dash__refresh-btn ${refreshing ? "spin" : ""}`}
            onClick={loadDashboardData} disabled={refreshing}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <div className="dash__live-pill">
            <span className="dash__live-dot" />
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* ══ KPI STRIP ══ */}
      <div className="dash__kpi-row">
        {([
          {
            icon: <Wallet size={20} />, label: "Today's Revenue",
            value: formatPrice(data?.todayRevenue || 0),
            change: data?.revenueChange,
            sub: `${formatPrice(data?.monthlyRevenue || 0)} this month`,
            color: "emerald", spark: revenueChart.slice(-7).map(d => ({ v: d.value })),
          },
          {
            icon: <Eye size={20} />, label: "Live on Floor",
            value: String(data?.liveMembers || 0),
            sub: `${data?.checkIns || 0} check-ins today`,
            color: "blue", spark: DEMO_SPARK,
          },
          {
            icon: <Users size={20} />, label: "Total Members",
            value: String(totalMembers),
            sub: `+${data?.newSignups || 0} new today`,
            color: "violet", spark: DEMO_SPARK.map(d => ({ v: d.v * 1.2 })),
          },
          {
            icon: <Dumbbell size={20} />, label: "Sessions Today",
            value: String(data?.totalSessionsToday || 0),
            sub: `${data?.totalTrainers || 0} trainers active`,
            color: "amber", spark: DEMO_SPARK.map(d => ({ v: d.v * 0.8 })),
          },
          {
            icon: <CreditCard size={20} />, label: "Pending Dues",
            value: formatPrice(data?.pendingPaymentsAmount || 0),
            sub: `${data?.pendingPaymentsCount || 0} members`,
            color: "rose", alert: true, spark: null,
          },
        ] as any[]).map((kpi, i) => (
          <KPICard key={i} index={i} {...kpi} />
        ))}
      </div>

      {/* ══ MAIN GRID ══ */}
      <div className="dash__grid">

        {/* Revenue chart — 8 col */}
        <motion.section className="dash__card dash__card--revenue" custom={0} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-glow dash__card-glow--emerald" />
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--emerald"><TrendingUp size={15} /></div>
            <div>
              <h3 className="dash__card-title">Revenue Overview</h3>
              <p className="dash__card-sub">Last 30 days · daily earnings{!isRealRevenue && <span className="dash__demo-tag">demo</span>}</p>
            </div>
            <div className="dash__card-stat ml-auto">
              <span className="dash__card-stat-value">{formatPrice(data?.monthlyRevenue || 0)}</span>
              <span className={`dash__badge ${isPositive ? "dash__badge--pos" : "dash__badge--neg"}`}>
                {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {Math.abs(data?.revenueChange || 0).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="dash__chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} interval={Math.max(1, Math.floor(revenueChart.length / 7))} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#0d0d12", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                  formatter={(v: number) => [formatPrice(v), "Revenue"]}
                  cursor={{ stroke: "rgba(16,185,129,0.25)", strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={false}
                  activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Membership donut — 4 col */}
        <motion.section className="dash__card dash__card--membership" custom={1} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-glow dash__card-glow--violet" />
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--violet"><Users size={15} /></div>
            <div>
              <h3 className="dash__card-title">Membership Status</h3>
              <p className="dash__card-sub">Distribution breakdown</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate("/members")}>
              View all <ArrowRight size={11} />
            </button>
          </div>
          <div className="dash__donut-wrap">
            <div className="dash__donut-chart">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={membershipDist} cx="50%" cy="50%" innerRadius={48} outerRadius={76}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {membershipDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#111116", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash__donut-center">
                <span className="dash__donut-total">{totalMembers}</span>
                <span className="dash__donut-label">TOTAL</span>
              </div>
            </div>
            <div className="dash__donut-legend">
              {membershipDist.map(item => {
                const pct = totalMembers > 0 ? Math.round((item.value / totalMembers) * 100) : 0
                return (
                  <div key={item.name} className="dash__legend-row">
                    <span className="dash__legend-dot" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                    <span className="dash__legend-name">{item.name}</span>
                    <span className="dash__legend-count">{item.value}</span>
                    <span className="dash__legend-pct" style={{ color: item.color }}>{pct}%</span>
                  </div>
                )
              })}
              <div className="dash__donut-footer">
                <div className="dash__donut-metric">
                  <span className="dash__donut-metric-label">Retention</span>
                  <span className="dash__donut-metric-val dash__donut-metric-val--green">{retentionPct}%</span>
                </div>
                <div className="dash__donut-metric">
                  <span className="dash__donut-metric-label">Expiring</span>
                  <span className="dash__donut-metric-val dash__donut-metric-val--amber">{data?.expiringMembers?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Attendance bar — 4 col */}
        <motion.section className="dash__card dash__card--attendance" custom={2} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-glow dash__card-glow--blue" />
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--blue"><BarChart3 size={15} /></div>
            <div>
              <h3 className="dash__card-title">Attendance</h3>
              <p className="dash__card-sub">Daily check-ins · 7 days{!isRealAttendance && <span className="dash__demo-tag">demo</span>}</p>
            </div>
            <div className="dash__highlight-pill">
              <Activity size={11} />
              <span>{data?.checkIns || 0} today</span>
            </div>
          </div>
          <div className="dash__chart-area dash__chart-area--sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChart} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0d0d12", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[5, 5, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Revenue Breakdown — 4 col */}
        <motion.section className="dash__card dash__card--breakdown" custom={3} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-glow dash__card-glow--indigo" />
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--indigo"><Layers size={15} /></div>
            <div>
              <h3 className="dash__card-title">Revenue Sources</h3>
              <p className="dash__card-sub">Last 30 days breakdown</p>
            </div>
          </div>
          {revenueBreakdown.length > 0 ? (
            <div className="dash__bkdn-list">
              {revenueBreakdown.map((item: any, i: number) => (
                <div key={i} className="dash__bkdn-row">
                  <div className="dash__bkdn-info">
                    <span className="dash__bkdn-dot" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                    <span className="dash__bkdn-label">{item.label}</span>
                  </div>
                  <div className="dash__bkdn-track">
                    <div className="dash__bkdn-fill" style={{ width: `${item.pct}%`, background: item.color, boxShadow: `0 0 8px ${item.color}50` }} />
                  </div>
                  <span className="dash__bkdn-amount">{formatPrice(item.value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Layers size={22} />}
              label="No revenue sources yet"
              hint="Revenue breakdown appears once payments are recorded"
              color="indigo"
            />
          )}
        </motion.section>

        {/* Occupancy + Progress — 4 col */}
        <motion.section className="dash__card dash__card--metrics" custom={4} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          {/* Occupancy */}
          <div className="dash__metric-block">
            <div className="dash__card-head dash__card-head--tight">
              <div className="dash__card-icon dash__card-icon--cyan"><Activity size={13} /></div>
              <div>
                <h3 className="dash__card-title">Occupancy</h3>
                <p className="dash__card-sub">Current capacity</p>
              </div>
              <span className={`dash__badge dash__badge--${occLevel === "low" ? "pos" : occLevel === "medium" ? "warn" : "neg"} ml-auto`}>
                {occLevel.toUpperCase()}
              </span>
            </div>
            {occupancy ? (
              <div className="dash__occ-row">
                <div className="dash__occ-gauge">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={occLevel === "low" ? "#10b981" : occLevel === "medium" ? "#f59e0b" : "#f43f5e"}
                      strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={`${occPct * 2.64} 264`}
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dasharray 0.7s ease", filter: `drop-shadow(0 0 4px ${occLevel === "low" ? "#10b981" : occLevel === "medium" ? "#f59e0b" : "#f43f5e"})` }}
                    />
                  </svg>
                  <span className={`dash__occ-pct dash__occ-pct--${occLevel}`}>{occPct}%</span>
                </div>
                <div className="dash__occ-stats">
                  {[
                    { lbl: "Current",  val: occupancy.currentCount },
                    { lbl: "Capacity", val: occupancy.maxCapacity },
                    { lbl: "Trend",    val: null },
                  ].map((s, i) => (
                    <div key={i} className="dash__occ-stat">
                      <span className="dash__occ-stat-lbl">{s.lbl}</span>
                      {s.val !== null
                        ? <span className="dash__occ-stat-val">{s.val}</span>
                        : <span className={`dash__occ-trend dash__occ-trend--${occupancy.trend}`}>
                            {occupancy.trend === "rising"  && <TrendingUp size={10} />}
                            {occupancy.trend === "falling" && <TrendingDown size={10} />}
                            {occupancy.trend === "stable"  && <CircleDot size={10} />}
                            {occupancy.trend}
                          </span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState icon={<Activity size={18} />} label="No occupancy data" hint="Check-ins will populate this" color="cyan" compact />
            )}
          </div>

          {/* Monthly Progress */}
          <div className="dash__metric-block dash__metric-block--sep">
            <div className="dash__card-head dash__card-head--tight">
              <div className="dash__card-icon dash__card-icon--amber"><Target size={13} /></div>
              <div>
                <h3 className="dash__card-title">Monthly Goal</h3>
                <p className="dash__card-sub">Revenue target</p>
              </div>
              {progress && (
                <span className={`dash__badge ml-auto ${progress.status === "on_track" || progress.status === "ahead" ? "dash__badge--pos" : "dash__badge--neg"}`}>
                  {(progress.status || "BEHIND").replace("_", " ").toUpperCase()}
                </span>
              )}
            </div>
            {progress ? (
              <div className="dash__prog-body">
                <div className="dash__prog-bar-wrap">
                  <div className="dash__prog-bar">
                    <div className="dash__prog-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="dash__prog-pct">{progressPct}%</span>
                </div>
                <div className="dash__prog-row">
                  {[
                    { lbl: "Earned",    val: formatPrice(progress.current) },
                    { lbl: "Target",    val: formatPrice(progress.target) },
                    { lbl: "Days Left", val: progress.daysRemaining },
                  ].map((item, i) => (
                    <div key={i} className="dash__prog-item">
                      <span className="dash__prog-lbl">{item.lbl}</span>
                      <span className="dash__prog-val">{item.val}</span>
                    </div>
                  ))}
                </div>
                {progress.projectedEnd != null && (
                  <p className="dash__prog-projected">Projected: <strong>{formatPrice(progress.projectedEnd)}</strong></p>
                )}
              </div>
            ) : (
              <EmptyState icon={<Target size={18} />} label="No target set" hint="Set a monthly revenue goal in Settings" color="amber" compact />
            )}
          </div>
        </motion.section>

        {/* Trainer Schedule — 4 col */}
        <motion.section className="dash__card dash__card--trainers" custom={5} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-glow dash__card-glow--violet" />
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--violet"><Dumbbell size={15} /></div>
            <div>
              <h3 className="dash__card-title">Trainer Schedule</h3>
              <p className="dash__card-sub">Today's sessions</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate("/trainers")}>
              All <ArrowRight size={11} />
            </button>
          </div>
          <div className="dash__list-scroll">
            {data?.trainerSchedule?.length ? (
              data.trainerSchedule.map((trainer, i) => (
                <div key={i} className="dash__trainer-row">
                  <div className="dash__trainer-avatar">{trainer.initials}</div>
                  <div className="dash__trainer-info">
                    <span className="dash__trainer-name">{trainer.name}</span>
                    <span className="dash__trainer-meta">{trainer.sessionsToday} sessions · {trainer.availableSlots} free</span>
                  </div>
                  <div className="dash__trainer-slots">
                    {trainer.slots?.slice(0, 2).map((slot: any, j: number) => (
                      <span key={j} className={`dash__slot dash__slot--${slot.status}`}>
                        {String(slot.time || "").replace(" AM", "a").replace(" PM", "p")}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={<Dumbbell size={22} />} label="No sessions today" hint="Trainer schedules will appear here" color="violet" />
            )}
          </div>
        </motion.section>

        {/* Today's Classes — 4 col */}
        <motion.section className="dash__card dash__card--schedule" custom={6} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-glow dash__card-glow--cyan" />
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--cyan"><Calendar size={15} /></div>
            <div>
              <h3 className="dash__card-title">Today's Classes</h3>
              <p className="dash__card-sub">Upcoming sessions</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate("/classes")}>
              All <ArrowRight size={11} />
            </button>
          </div>
          <div className="dash__list-scroll">
            {analyticsData?.todaysClasses?.length ? (
              analyticsData.todaysClasses.slice(0, 6).map((cls: any, i: number) => {
                const status = cls.status?.toLowerCase() || "upcoming"
                const isLive = status === "in_progress"
                return (
                  <div key={i} className={`dash__class-row dash__class-row--${status}`}>
                    <div className="dash__class-time">
                      {new Date(cls.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="dash__class-info">
                      <span className="dash__class-name">{cls.name}</span>
                      <span className="dash__class-meta">{cls.trainer}</span>
                    </div>
                    <span className={`dash__class-badge dash__class-badge--${isLive ? "live" : status}`}>
                      {isLive ? "● LIVE" : status === "completed" ? "Done" : "Soon"}
                    </span>
                  </div>
                )
              })
            ) : (
              <EmptyState icon={<Calendar size={22} />} label="No classes today" hint="Schedule a class to see it here" color="cyan" />
            )}
          </div>
        </motion.section>

        {/* Quick Actions — 4 col */}
        <motion.section className="dash__card dash__card--actions" custom={7} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--rose"><Zap size={15} /></div>
            <div><h3 className="dash__card-title">Quick Actions</h3></div>
          </div>
          <div className="dash__action-grid">
            {([
              { icon: <UserPlus size={18} />,    label: "Add Member",  path: "/members?action=create", color: "blue"    },
              { icon: <CheckCircle2 size={18} />, label: "Check-in",   path: "/check-in",               color: "emerald" },
              { icon: <Wallet size={18} />,       label: "Payments",   path: "/financials",              color: "violet"  },
              { icon: <Calendar size={18} />,     label: "Classes",    path: "/classes",                 color: "cyan"    },
              { icon: <Dumbbell size={18} />,     label: "Trainers",   path: "/trainers",                color: "amber"   },
              { icon: <BarChart3 size={18} />,    label: "Reports",    path: "/financials",              color: "rose"    },
            ] as any[]).map((a, i) => (
              <button key={i} className={`dash__action-btn dash__action-btn--${a.color}`} onClick={() => navigate(a.path)}>
                <span className="dash__action-icon">{a.icon}</span>
                <span className="dash__action-label">{a.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Expiring Memberships — 4 col */}
        <motion.section className="dash__card dash__card--expiring" custom={8} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-glow dash__card-glow--amber" />
          <div className="dash__card-head">
            <div className="dash__card-icon dash__card-icon--amber"><AlertTriangle size={15} /></div>
            <div>
              <h3 className="dash__card-title">Expiring Soon</h3>
              <p className="dash__card-sub">Next 7 days</p>
            </div>
            {(data?.expiringMembers?.length || 0) > 0 && (
              <span className="dash__count-badge">{data!.expiringMembers.length}</span>
            )}
          </div>
          <div className="dash__list-scroll">
            {data?.expiringMembers?.length ? (
              data.expiringMembers.slice(0, 6).map((m, i) => (
                <div key={i} className={`dash__expire-row ${m.daysLeft <= 2 ? "dash__expire-row--urgent" : ""}`}>
                  <div className="dash__expire-avatar" style={{ background: m.daysLeft <= 2 ? "linear-gradient(135deg,#f43f5e,#e11d48)" : undefined }}>
                    {m.name?.charAt(0) || "?"}
                  </div>
                  <div className="dash__expire-info">
                    <span className="dash__expire-name">{m.name}</span>
                    <span className="dash__expire-plan">{m.plan}</span>
                  </div>
                  <span className={`dash__expire-days ${m.daysLeft <= 2 ? "urgent" : m.daysLeft <= 4 ? "warn" : ""}`}>
                    {m.daysLeft}d
                  </span>
                </div>
              ))
            ) : (
              <EmptyState icon={<Award size={22} />} label="All memberships current" hint="No expirations in the next 7 days" color="emerald" />
            )}
          </div>
        </motion.section>

        {/* Overdue Payments — 4 col (only when data exists) */}
        {analyticsData?.overduePayments?.length > 0 && (
          <motion.section className="dash__card dash__card--overdue" custom={9} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--rose" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--rose"><ShieldAlert size={15} /></div>
              <div>
                <h3 className="dash__card-title">Overdue Payments</h3>
                <p className="dash__card-sub">Requires attention</p>
              </div>
              <span className="dash__count-badge dash__count-badge--rose">{analyticsData.overduePayments.length}</span>
            </div>
            <div className="dash__list-scroll">
              {analyticsData.overduePayments.slice(0, 6).map((p: any, i: number) => (
                <div key={i} className="dash__overdue-row">
                  <div className="dash__overdue-avatar">{p.memberName?.charAt(0) || "?"}</div>
                  <div className="dash__overdue-info">
                    <span className="dash__overdue-name">{p.memberName}</span>
                    <span className="dash__overdue-plan">{p.planName}</span>
                  </div>
                  <div className="dash__overdue-right">
                    <span className="dash__overdue-days">{p.daysOverdue}d</span>
                    <span className="dash__overdue-amount">{formatPrice(p.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
            {analyticsData.overduePayments.length > 6 && (
              <button className="dash__view-all-btn" onClick={() => navigate("/financials?filter=overdue")}>
                View all {analyticsData.overduePayments.length} overdue <ArrowRight size={12} />
              </button>
            )}
          </motion.section>
        )}

        {/* Recent Activity — 4 col */}
        {data?.recentActivity?.length ? (
          <motion.section className="dash__card dash__card--activity" custom={10} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--blue" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--blue"><Clock size={15} /></div>
              <div>
                <h3 className="dash__card-title">Recent Activity</h3>
                <p className="dash__card-sub">Latest check-ins &amp; signups</p>
              </div>
            </div>
            <div className="dash__list-scroll">
              {data.recentActivity.slice(0, 7).map((item: any, i: number) => (
                <div key={i} className="dash__activity-row">
                  <div className={`dash__activity-icon dash__activity-icon--${item.type}`}>
                    {item.type === "checkin" ? <CheckCircle2 size={12} /> : <UserPlus size={12} />}
                  </div>
                  <div className="dash__activity-info">
                    <span className="dash__activity-name">{item.name}</span>
                    <span className="dash__activity-desc">{item.reason}</span>
                  </div>
                  <span className="dash__activity-time">{item.date}</span>
                </div>
              ))}
            </div>
          </motion.section>
        ) : null}

        {/* Top Trainers performance — 4 col */}
        {data?.topTrainers?.length ? (
          <motion.section className="dash__card dash__card--top-trainers" custom={11} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--amber" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--amber"><Star size={15} /></div>
              <div>
                <h3 className="dash__card-title">Top Trainers</h3>
                <p className="dash__card-sub">This month's performance</p>
              </div>
            </div>
            <div className="dash__list-scroll">
              {data.topTrainers.slice(0, 5).map((t: any, i: number) => (
                <div key={i} className="dash__top-trainer-row">
                  <span className="dash__top-trainer-rank">{i + 1}</span>
                  <div className="dash__trainer-avatar dash__trainer-avatar--sm">{t.initials || t.name?.charAt(0)}</div>
                  <div className="dash__trainer-info">
                    <span className="dash__trainer-name">{t.name}</span>
                    <span className="dash__trainer-meta">{t.sessions} sessions</span>
                  </div>
                  <span className="dash__top-trainer-revenue">{formatPrice(t.revenue || 0)}</span>
                </div>
              ))}
            </div>
          </motion.section>
        ) : null}

        {/* Birthdays — 4 col */}
        {data?.birthdays?.length ? (
          <motion.section className="dash__card dash__card--birthdays" custom={12} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--rose" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--rose"><Flame size={15} /></div>
              <div>
                <h3 className="dash__card-title">Birthdays Today</h3>
                <p className="dash__card-sub">Reach out &amp; retain</p>
              </div>
              <span className="dash__count-badge dash__count-badge--rose">{data.birthdays.length}</span>
            </div>
            <div className="dash__list-scroll">
              {data.birthdays.map((b: any, i: number) => (
                <div key={i} className="dash__birthday-row">
                  <div className="dash__expire-avatar" style={{ background: "linear-gradient(135deg,#f43f5e,#f97316)" }}>
                    {b.name?.charAt(0)}
                  </div>
                  <div className="dash__expire-info">
                    <span className="dash__expire-name">{b.name}</span>
                    <span className="dash__expire-plan">{b.phone}</span>
                  </div>
                  <span className="dash__birthday-badge">🎂</span>
                </div>
              ))}
            </div>
          </motion.section>
        ) : null}

      </div>
    </div>
  )
}

/* ════════ KPI CARD ════════ */
interface KPICardProps {
  icon: React.ReactNode; label: string; value: string
  change?: number; sub?: string; color: string; alert?: boolean
  spark?: { v: number }[] | null; index: number
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, change, sub, color, alert: isAlert, spark, index }) => {
  const hasChange = change !== undefined && change !== null
  const isPos     = (change || 0) >= 0
  return (
    <motion.div
      className={`dash__kpi dash__kpi--${color} ${isAlert ? "dash__kpi--alert" : ""}`}
      custom={index} variants={CARD_VARIANTS} initial="hidden" animate="visible"
    >
      <div className="dash__kpi-glow" />
      <div className="dash__kpi-top">
        <div className="dash__kpi-icon">{icon}</div>
        <div className="dash__kpi-header">
          <span className="dash__kpi-label">{label}</span>
          {hasChange && (
            <span className={`dash__badge ${isPos ? "dash__badge--pos" : "dash__badge--neg"}`}>
              {isPos ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {Math.abs(change!).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className="dash__kpi-value">{value}</div>
      {sub && <div className="dash__kpi-sub">{sub}</div>}
      {spark && spark.length > 0 && (
        <div className="dash__kpi-spark">
          <ResponsiveContainer width="100%" height={36} minWidth={40}>
            <LineChart data={spark} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line type="monotone" dataKey="v" stroke={`var(--kpi-${color})`}
                strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}

/* ════════ EMPTY STATE ════════ */
interface EmptyStateProps {
  icon: React.ReactNode; label: string; hint: string; color: string; compact?: boolean
}
const EmptyState: React.FC<EmptyStateProps> = ({ icon, label, hint, color, compact }) => (
  <div className={`dash__empty ${compact ? "dash__empty--compact" : ""}`}>
    <div className={`dash__empty-icon-wrap dash__empty-icon-wrap--${color}`}>{icon}</div>
    <span className="dash__empty-label">{label}</span>
    <span className="dash__empty-hint">{hint}</span>
  </div>
)

export default Dashboard
