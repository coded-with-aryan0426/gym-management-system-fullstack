import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Users, Activity, TrendingUp, TrendingDown, ArrowRight,
  Calendar, UserPlus, CheckCircle2, AlertCircle, Dumbbell,
  CreditCard, Zap, Eye, Wallet, UserCheck, RefreshCw,
  CircleDot, AlertTriangle, Target, ShieldAlert, Layers,
  BarChart3, Clock, Flame, Star, Award, Wrench, CheckCircle, XCircle, Settings,
  Crown, AlertOctagon,
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  LineChart, Line,
} from "recharts"
import api from "../../services/api"
import { equipmentApi } from "../../services/equipmentApi"
import { subscriptionApi } from "../../services/subscriptionApi"
import { useCurrency } from "../../contexts/CurrencyContext"
import { 
  SkeletonKPIGrid, SkeletonChart, SkeletonCard, SkeletonTable,
  SkeletonPageHeader, SkeletonActivityFeed
} from "../../components/ui/Skeleton"
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
  const [financeData, setFinanceData]   = useState<any>(null)
  const [equipmentData, setEquipmentData] = useState<{ stats: any; list: any[] } | null>(null)
  const [now, setNow]                   = useState(new Date())
  const [refreshing, setRefreshing]     = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [chartPeriod, setChartPeriod]   = useState<'day'|'week'|'month'|'6month'|'year'>('month')
  const [chartLoading, setChartLoading] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ isActive: boolean; daysLeft: number | null; planName: string | null; isInGracePeriod: boolean } | null>(null)
  const navigate  = useNavigate()
  const { formatPrice } = useCurrency()

  const checkSubscriptionStatus = useCallback(async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    try {
      const response = await subscriptionApi.getStatus(userId)
      const sub = response.data
      if (sub) {
        const now = new Date()
        const endDate = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null
        const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
        setSubscriptionStatus({
          isActive: sub.status?.toUpperCase() === 'ACTIVE',
          daysLeft,
          planName: sub.planName || null,
          isInGracePeriod: sub.isInGracePeriod || false,
        })
      }
    } catch (err) {
      console.warn('[Dashboard] Could not fetch subscription status:', err)
    }
  }, [])

  useEffect(() => {
    checkSubscriptionStatus()
  }, [checkSubscriptionStatus])

  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true); setError(null)
      const response = await api.getOwnerDashboard()
      setData(response)

      const today         = new Date()
      const from7         = new Date(today.getTime() -  7 * 86400000).toISOString().split("T")[0]
      const toDate        = today.toISOString().split("T")[0]

        const results = await Promise.allSettled([
          api.getDailyAttendance(from7, toDate),              // 0
          api.getMembershipBreakdown(),                        // 1
          api.getOverduePayments(8),                           // 2
          api.getTodaysClasses(),                              // 3
          api.getOccupancy(),                                  // 4
          api.getMonthlyProgress(),                            // 5
          api.getFinanceCategoryStats('INCOME', 'month'),      // 6 — income by category
          api.getFinanceCategoryStats('EXPENSE', 'month'),     // 7 — expense by category
        ])
        const get = (r: PromiseSettledResult<any>) => r.status === "fulfilled" ? r.value : null
        setAnalyticsData({
          dailyAttendance:     get(results[0]),
          membershipBreakdown: get(results[1]),
          overduePayments:     get(results[2]),
          todaysClasses:       get(results[3]),
          occupancy:           get(results[4]),
          monthlyProgress:     get(results[5]),
        })
        // Only set category stats here; do NOT overwrite dailyTrend/overview
        // (those are managed by loadChartForPeriod to avoid resetting user's period selection)
        setFinanceData((prev: any) => ({
          ...prev,
          categoryStats: get(results[6]),
          expenseStats:  get(results[7]),
        }))

        // Equipment data
        try {
          const [eqStats, eqList] = await Promise.all([
            equipmentApi.getStats(),
            equipmentApi.getAll(),
          ])
          setEquipmentData({ stats: eqStats, list: eqList || [] })
        } catch { /* equipment non-critical */ }
    } catch (err) {
      console.error("[Dashboard]", err)
      setError("Failed to load")
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  const loadChartForPeriod = useCallback(async (period: string) => {
    setChartLoading(true)
    try {
      const [trend, overview] = await Promise.all([
        api.getFinanceDailyTrend(period),
        api.getFinanceOverview(period),
      ])
      setFinanceData((prev: any) => ({ ...prev, dailyTrend: trend, overview }))
    } catch (e) {
      console.error("[Chart period]", e)
    } finally {
      setChartLoading(false)
    }
  }, [])

  // Load dashboard data on mount + every 30s — does NOT touch chart/finance trend
  useEffect(() => {
    loadDashboardData()
    const t = setInterval(loadDashboardData, 30000)
    return () => clearInterval(t)
  }, [loadDashboardData])

  // Always load chart data for the selected period (including initial 'month')
  useEffect(() => {
    loadChartForPeriod(chartPeriod)
  }, [chartPeriod, loadChartForPeriod])

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])

  const greeting = useMemo(() => {
    const h = now.getHours()
    if (h < 12) return { text: "Good Morning", emoji: "☀️" }
    if (h < 17) return { text: "Good Afternoon", emoji: "⚡" }
    return { text: "Good Evening", emoji: "🌙" }
  }, [now])

  const dateStr = useMemo(() =>
    now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }), [now])

    const revenueChart = useMemo(() => {
      const raw: any[] = financeData?.dailyTrend?.length
        ? financeData.dailyTrend
        : financeData?.chartFallback?.length
          ? financeData.chartFallback
          : []

      // ── Build a lookup of real data: key → {income, expenses} ──
      // Key for day = "HH" (hour), week/month = "YYYY-MM-DD", 6month/year = "YYYY-MM"
      const lookup = new Map<string, { inc: number; exp: number }>()
      for (const item of raw) {
        const ds = String(item.date ?? item.name ?? "")
        let key = ds
        try {
          const d = new Date(ds.length === 10 ? ds + "T00:00:00" : ds)
          if (!isNaN(d.getTime())) {
            if (chartPeriod === 'day') {
              key = String(d.getHours()).padStart(2, "0")
            } else if (chartPeriod === 'week' || chartPeriod === 'month') {
              key = d.toISOString().slice(0, 10)
            } else {
              key = d.toISOString().slice(0, 7) // YYYY-MM
            }
          }
        } catch { /* keep raw key */ }
        const inc = Math.round(Number(item.revenue) || 0)
        const exp = Math.round(Number(item.expenses) || 0)
        // accumulate (multiple transactions can share same key)
        const existing = lookup.get(key)
        if (existing) { existing.inc += inc; existing.exp += exp }
        else lookup.set(key, { inc, exp })
      }

      // ── Generate full time skeleton ──
      const now2 = new Date()
      const skeleton: { key: string; label: string }[] = []

      if (chartPeriod === 'day') {
        // 6 AM → midnight in 2-hour steps → 10 ticks
        for (let h = 6; h <= 22; h += 2) {
          const ampm = h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`
          skeleton.push({ key: String(h).padStart(2, "0"), label: ampm })
        }
      } else if (chartPeriod === 'week') {
        // Last 7 days: Mon 24 … Sun 24
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now2); d.setDate(d.getDate() - i)
          const key = d.toISOString().slice(0, 10)
          const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }) // "Mon 24"
          skeleton.push({ key, label })
        }
      } else if (chartPeriod === 'month') {
        // All days 1–31 of current month
        const year = now2.getFullYear(); const month = now2.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(year, month, d)
          const key = dt.toISOString().slice(0, 10)
          skeleton.push({ key, label: String(d) }) // just the day number: 1 2 3 … 31
        }
      } else if (chartPeriod === '6month') {
        // Last 6 months: "Feb", "Mar" …
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1)
          const key = d.toISOString().slice(0, 7)
          const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }) // "Feb 25"
          skeleton.push({ key, label })
        }
      } else {
        // year — all 12 months: Jan Feb … Dec
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1)
          const key = d.toISOString().slice(0, 7)
          const label = d.toLocaleDateString("en-IN", { month: "short" }) // "Jan"
          skeleton.push({ key, label })
        }
      }

      // ── Merge lookup into skeleton ──
      if (skeleton.length > 0) {
        return skeleton.map(({ key, label }) => {
          const d = lookup.get(key) ?? { inc: 0, exp: 0 }
          return { day: label, value: d.inc, expenses: d.exp, profit: d.inc - d.exp }
        })
      }

      // Fallback: demo data
      return DEMO_REVENUE.map(d => ({ day: d.day, value: d.value, expenses: Math.round(d.value * 0.3), profit: Math.round(d.value * 0.7) }))
    }, [financeData?.dailyTrend, financeData?.chartFallback, chartPeriod])

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
    const prettifyCategory = (raw: string) => {
      if (!raw) return "Other"
      // Already title-cased (e.g. "Membership") — return as-is
      if (raw === raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()) return raw
      // All caps short codes (e.g. "POS", "EMI") — keep uppercase
      if (raw.length <= 4 && raw === raw.toUpperCase()) return raw
      // All-caps long strings — title case them
      if (raw === raw.toUpperCase()) return raw.charAt(0) + raw.slice(1).toLowerCase()
      return raw
    }
    // Primary: real income category stats from /finance/category-stats
    const stats = financeData?.categoryStats
    if (stats?.length) {
      const total = stats.reduce((s: number, c: any) => s + Number(c.total || 0), 0)
      const colors = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#f43f5e","#06b6d4"]
      return stats.slice(0, 6).map((c: any, i: number) => ({
        label: prettifyCategory(c.category || ""),
        value: Number(c.total || 0),
        pct: total > 0 ? Math.round((Number(c.total) / total) * 100) : 0,
        color: colors[i % colors.length],
      }))
    }
    return []
  }, [financeData?.categoryStats])

  const occupancy    = analyticsData?.occupancy
  const occPct       = occupancy ? Math.round(occupancy.percentage) : 0
  const occLevel     = occPct < 50 ? "low" : occPct < 75 ? "medium" : "high"
  const progress     = analyticsData?.monthlyProgress
  const progressPct  = progress ? Math.min(100, Math.round((progress.current / progress.target) * 100)) : 0
  const totalMembers = data?.totalMembers || 0
  const retentionPct = totalMembers > 0 ? Math.round(((membershipDist[0]?.value || 0) / totalMembers) * 100) : 0

  // ── Real finance figures from /api/finance/overview ──
  const finOvr          = financeData?.overview
  const monthlyRevenue  = finOvr ? Number(finOvr.totalRevenue   || 0) : (data?.monthlyRevenue   || 0)
  const totalExpenses   = finOvr ? Number(finOvr.totalExpenses  || 0) : 0
  const netProfit       = finOvr ? Number(finOvr.netProfit      || 0) : 0
  const profitMargin    = finOvr ? Number(finOvr.profitMargin   || 0) : 0
  const pendingDues     = finOvr ? Number(finOvr.pendingPayments || 0) : (data?.pendingPaymentsAmount || 0)
  const pendingCount    = finOvr ? Number(finOvr.pendingCount   || 0) : (data?.pendingPaymentsCount  || 0)
  const revenueChange   = finOvr ? Number(finOvr.revenueChange  || 0) : (data?.revenueChange        || 0)
  const isPositive      = revenueChange >= 0

    const isRealRevenue    = !!(financeData?.dailyTrend?.length || financeData?.chartFallback?.length)
    const isRealAttendance = !!analyticsData?.dailyAttendance?.length
    const isChartAllZero   = revenueChart.every(d => d.value === 0 && d.expenses === 0)

  // ─── Skeleton Loading State ───────────────────────────────────────────────
  if (loading && !data) return (
    <div className="dash" role="main" aria-busy="true" aria-label="Loading dashboard">
      <SkeletonPageHeader />
      
      {/* KPI Strip */}
      <div className="dash__header" style={{ marginTop: '16px' }}>
        <SkeletonKPIGrid count={5} />
      </div>

      <div className="dash__grid">
        {/* Finance Section */}
        <div className="dash__row-label">
          <span className="dash__row-label-icon"><TrendingUp size={11} /></span>
          Finance &amp; Money Flow
        </div>
        
        <div style={{ gridColumn: 'span 8' }}>
          <SkeletonChart type="area" height={280} />
        </div>
        
        <div style={{ gridColumn: 'span 4' }}>
          <SkeletonCard hasImage={false} lines={6} />
        </div>

        {/* Analytics Section */}
        <div className="dash__row-label" style={{ marginTop: '16px' }}>
          <span className="dash__row-label-icon"><BarChart3 size={11} /></span>
          Analytics &amp; Member Insights
        </div>
        
        <div style={{ gridColumn: 'span 4' }}>
          <SkeletonChart type="bar" height={240} />
        </div>
        
        <div style={{ gridColumn: 'span 4' }}>
          <SkeletonChart type="pie" height={240} />
        </div>
        
        <div style={{ gridColumn: 'span 4' }}>
          <SkeletonCard hasImage={false} lines={5} />
        </div>

        {/* Activity Section */}
        <div className="dash__row-label" style={{ marginTop: '16px' }}>
          <span className="dash__row-label-icon"><Activity size={11} /></span>
          Activity Feed &amp; Notifications
        </div>
        
        <div style={{ gridColumn: 'span 6' }}>
          <SkeletonCard hasImage={false} lines={2} />
          <div style={{ marginTop: '12px' }}>
            <SkeletonActivityFeed count={5} />
          </div>
        </div>
        
        <div style={{ gridColumn: 'span 3' }}>
          <SkeletonCard hasImage={false} lines={2} />
          <div style={{ marginTop: '12px' }}>
            <SkeletonActivityFeed count={4} />
          </div>
        </div>
        
        <div style={{ gridColumn: 'span 3' }}>
          <SkeletonCard hasImage={false} lines={2} />
          <div style={{ marginTop: '12px' }}>
            <SkeletonActivityFeed count={4} />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="dash">

      {/* ══ HEADER — greeting + KPI chips + actions all in one line ══ */}
      <header className="dash__header">
        {/* greeting block */}
        <div className="dash__header-greet">
          <span className="dash__greeting-emoji">{greeting.emoji}</span>
          <div>
            <h1 className="dash__greeting">{greeting.text}, <span className="dash__greeting-name">Owner</span></h1>
            <p className="dash__date">{dateStr}</p>
          </div>
        </div>

        {/* KPI chips — flex-grow to fill remaining space */}
        <div className="dash__kpi-row">
          {([
            {
              icon: <Wallet size={13} />, label: "Revenue",
              value: formatPrice(monthlyRevenue),
              sub: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(0)}% vs last mo`,
              change: revenueChange, color: "emerald",
              spark: revenueChart.slice(-7).map(d => ({ v: d.value })),
            },
            {
              icon: <Eye size={13} />, label: "On Floor",
              value: String(data?.liveMembers || 0),
              sub: `${data?.checkIns || 0} ins`,
              color: "blue", spark: null,
            },
            {
              icon: <Users size={13} />, label: "Members",
              value: String(totalMembers),
              sub: `+${data?.newSignups || 0} today`,
              color: "violet", spark: null,
            },
            {
              icon: <Dumbbell size={13} />, label: "Sessions",
              value: String(data?.totalSessionsToday || 0),
              sub: `${data?.totalTrainers || 0} trainers`,
              color: "amber", spark: null,
            },
            {
              icon: <CreditCard size={13} />, label: "Dues",
              value: formatPrice(pendingDues),
              sub: `${pendingCount} pending`,
              color: "rose", alert: true, spark: null,
            },
          ] as any[]).map((kpi, i) => (
            <KPICard key={i} index={i} {...kpi} />
          ))}
        </div>

        {/* right actions */}
        <div className="dash__header-right">
          {error && (
            <div className="dash__inline-error">
              <AlertCircle size={12} />
              <span>Error</span>
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

      {subscriptionStatus && !subscriptionStatus.isActive && (
        <div className={`dash__sub-alert ${subscriptionStatus.isInGracePeriod ? 'dash__sub-alert--grace' : 'dash__sub-alert--expired'}`}>
          <div className="dash__sub-alert-icon">
            {subscriptionStatus.isInGracePeriod ? <AlertOctagon size={18} /> : <AlertOctagon size={18} />}
          </div>
          <div className="dash__sub-alert-content">
            <strong>{subscriptionStatus.isInGracePeriod ? 'Grace Period Active' : 'Subscription Expired'}</strong>
            <span>
              {subscriptionStatus.isInGracePeriod
                ? `Your subscription is in grace period. ${subscriptionStatus.daysLeft} days remaining to renew.`
                : 'Your SaaS subscription has expired. Please renew to continue accessing premium features.'}
            </span>
          </div>
          <button className="dash__sub-alert-btn" onClick={() => navigate('/settings')}>
            {subscriptionStatus.isInGracePeriod ? 'Renew Now' : 'Reactivate'}
          </button>
        </div>
      )}

      {/* ══ MAIN GRID ══ */}
      <div className="dash__grid">

        {/* ══ ROW LABEL: FINANCE ══ */}
        <div className="dash__row-label">
          <span className="dash__row-label-icon"><TrendingUp size={11} /></span>
          Finance &amp; Money Flow
        </div>

          {/* Money Flow Overview — 8 col */}
          <motion.section className="dash__card dash__card--revenue dash__card--span8" custom={0} variants={CARD_VARIANTS} initial="hidden" animate="visible">
          <div className="dash__card-glow dash__card-glow--emerald" />

          {/* ── Single header row: icon · title/sub · tabs · stats · badge ── */}
          <div className="dash__mf-header">
            <div className="dash__card-icon dash__card-icon--emerald" style={{ flexShrink: 0 }}><TrendingUp size={15} /></div>
            <div className="dash__mf-title-block">
              <h3 className="dash__card-title">Money Flow Overview</h3>
              <p className="dash__card-sub">Income vs Expenses · real transactions</p>
            </div>

            {/* period tabs */}
            <div className="dash__period-tabs">
              {([ ['day','1D'], ['week','1W'], ['month','1M'], ['6month','6M'], ['year','1Y'] ] as [typeof chartPeriod, string][]).map(([p, label]) => (
                <button
                  key={p}
                  className={`dash__period-tab ${chartPeriod === p ? 'dash__period-tab--active' : ''}`}
                  onClick={() => setChartPeriod(p)}
                >{label}</button>
              ))}
            </div>

            {/* summary stats */}
            <div className="dash__rev-stats">
              <div className="dash__rev-stat">
                <span className="dash__rev-stat-lbl">Income</span>
                <span className="dash__rev-stat-val dash__rev-stat-val--green">{formatPrice(monthlyRevenue)}</span>
              </div>
              <div className="dash__rev-stat">
                <span className="dash__rev-stat-lbl">Expenses</span>
                <span className="dash__rev-stat-val dash__rev-stat-val--red">{formatPrice(totalExpenses)}</span>
              </div>
              <div className="dash__rev-stat">
                <span className="dash__rev-stat-lbl">Profit</span>
                <span className={`dash__rev-stat-val ${netProfit >= 0 ? "dash__rev-stat-val--green" : "dash__rev-stat-val--red"}`}>{formatPrice(netProfit)}</span>
              </div>
              <div className="dash__rev-stat" style={{ borderRight: 'none', paddingRight: 0 }}>
                <span className="dash__rev-stat-lbl">Margin</span>
                <span className="dash__rev-stat-val">{profitMargin.toFixed(0)}%</span>
              </div>
            </div>

            {/* change badge */}
            <span className={`dash__badge ${isPositive ? "dash__badge--pos" : "dash__badge--neg"}`} style={{ flexShrink: 0 }}>
              {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {Math.abs(revenueChange).toFixed(1)}%
            </span>
            {chartLoading && <span className="dash__chart-loading-pill" style={{ flexShrink: 0 }}>…</span>}
          </div>

          {/* ── Legend ── */}
          <div className="dash__chart-legend">
            <span className="dash__chart-legend-item dash__chart-legend-item--income">
              <span className="dash__chart-legend-dot" style={{ background: '#10b981' }} />
              Income
            </span>
            <span className="dash__chart-legend-item dash__chart-legend-item--expense">
              <span className="dash__chart-legend-dot" style={{ background: '#f43f5e' }} />
              Expenses
            </span>
            <span className="dash__chart-legend-item">
              <span className="dash__chart-legend-dot" style={{ background: '#6366f1' }} />
              Net Profit
            </span>
            {chartLoading && <span className="dash__chart-loading-pill">Loading…</span>}
          </div>

          {/* ── Chart ── */}
          <div className="dash__chart-area" style={{ opacity: chartLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {isRealRevenue && isChartAllZero && !chartLoading ? (
              <EmptyState
                icon={<TrendingUp size={26} />}
                label="No transactions this period"
                hint="Record income or expenses to see the chart populate"
                color="emerald"
              />
            ) : null}
            <ResponsiveContainer width="100%" height={200} style={{ display: isRealRevenue && isChartAllZero && !chartLoading ? 'none' : undefined }}>
              <AreaChart
                data={revenueChart}
                  margin={{ top: 8, right: 12, left: -10, bottom: chartPeriod === 'month' ? 42 : 20 }}
              >
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f43f5e" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "rgba(255,255,255,0.7)",
                      fontSize: chartPeriod === 'month' ? 9 : 10,
                      fontWeight: 500
                    }}
                    interval={0}
                    minTickGap={
                      chartPeriod === 'day'    ? 2 :
                      chartPeriod === 'week'   ? 2 :
                      chartPeriod === 'month'  ? 4 :
                      chartPeriod === '6month' ? 2 : 2
                    }
                    angle={chartPeriod === 'month' ? -45 : 0}
                    textAnchor={chartPeriod === 'month' ? "end" : "middle"}
                    dy={chartPeriod === 'month' ? 0 : 4}
                    height={chartPeriod === 'month' ? 48 : 36}
                  />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                  tickFormatter={(v: number) =>
                    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` :
                    v >= 1000   ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                  }
                  width={52}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d0d12",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, fontSize: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4, fontSize: 11 }}
                  formatter={(val: number, name: string) => [
                    formatPrice(val),
                    name === 'value' ? '💚 Income' : name === 'expenses' ? '🔴 Expenses' : '🔵 Net Profit'
                  ]}
                  cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                />
                {/* Income area */}
                <Area type="monotone" dataKey="value" name="value"
                  stroke="#10b981" strokeWidth={2.5} fill="url(#incGrad)" dot={false}
                  activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                {/* Expenses area */}
                <Area type="monotone" dataKey="expenses" name="expenses"
                  stroke="#f43f5e" strokeWidth={2} fill="url(#expGrad)" dot={false}
                  activeDot={{ r: 5, fill: "#f43f5e", stroke: "#fff", strokeWidth: 2 }} />
                {/* Net profit line */}
                <Area type="monotone" dataKey="profit" name="profit"
                  stroke="#6366f1" strokeWidth={1.5} fill="url(#profGrad)" dot={false} strokeDasharray="5 3"
                  activeDot={{ r: 4, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          </motion.section>

          {/* Revenue Sources — 4 col · Finance row */}
          <motion.section className="dash__card dash__card--breakdown dash__card--span4" custom={1} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--indigo" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--indigo"><Layers size={15} /></div>
              <div>
                <h3 className="dash__card-title">Revenue Sources</h3>
                <p className="dash__card-sub">Income by category</p>
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

            {/* ══ ROW LABEL: MEMBERS ══ */}
          <div className="dash__row-label">
            <span className="dash__row-label-icon"><Users size={11} /></span>
            Members
          </div>

          {/* Membership donut — 3 col */}
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
                <ResponsiveContainer width="100%" height={156}>
                    <PieChart>
                      <Pie data={membershipDist} cx="50%" cy="50%" innerRadius={46} outerRadius={70}
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

          {/* Expiring Memberships — 3 col */}
          <motion.section className="dash__card dash__card--expiring" custom={2} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--amber" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--amber"><AlertTriangle size={15} /></div>
              <div>
                <h3 className="dash__card-title">Expiring Soon</h3>
                <p className="dash__card-sub">Next 7 days</p>
              </div>
              <span className="dash__count-badge">{data?.expiringMembers?.length || 0}</span>
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

          {/* Overdue Payments — 3 col (always visible) */}
          <motion.section className="dash__card dash__card--overdue" custom={3} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--rose" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--rose"><ShieldAlert size={15} /></div>
              <div>
                <h3 className="dash__card-title">Overdue Payments</h3>
                <p className="dash__card-sub">Requires attention</p>
              </div>
              <span className="dash__count-badge dash__count-badge--rose">{analyticsData?.overduePayments?.length || 0}</span>
            </div>
            <div className="dash__list-scroll">
              {analyticsData?.overduePayments?.length ? (
                analyticsData.overduePayments.slice(0, 6).map((p: any, i: number) => (
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
                ))
              ) : (
                <EmptyState icon={<ShieldAlert size={22} />} label="No overdue payments" hint="All members are up to date" color="rose" />
              )}
              {(analyticsData?.overduePayments?.length || 0) > 6 && (
                <button className="dash__view-all-btn" onClick={() => navigate("/financials?filter=overdue")}>
                  View all {analyticsData.overduePayments.length} overdue <ArrowRight size={12} />
                </button>
              )}
            </div>
          </motion.section>

          {/* Recent Activity — 3 col (always visible) */}
          <motion.section className="dash__card dash__card--activity" custom={4} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--blue" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--blue"><Clock size={15} /></div>
              <div>
                <h3 className="dash__card-title">Recent Activity</h3>
                <p className="dash__card-sub">Latest check-ins &amp; signups</p>
              </div>
            </div>
            <div className="dash__list-scroll">
              {data?.recentActivity?.length ? (
                data.recentActivity.slice(0, 7).map((item: any, i: number) => (
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
                ))
              ) : (
                <EmptyState icon={<Clock size={22} />} label="No recent activity" hint="Check-ins and signups appear here" color="blue" />
              )}
            </div>
          </motion.section>

          {/* ══ ROW LABEL: TRAINERS ══ */}
          <div className="dash__row-label">
            <span className="dash__row-label-icon"><Dumbbell size={11} /></span>
            Trainers &amp; Classes
          </div>

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

          {/* Top Trainers performance — 4 col (always visible) */}
          <motion.section className="dash__card dash__card--top-trainers" custom={6} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--amber" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--amber"><Star size={15} /></div>
              <div>
                <h3 className="dash__card-title">Top Trainers</h3>
                <p className="dash__card-sub">This month's performance</p>
              </div>
              <button className="dash__link-btn" onClick={() => navigate("/trainers")}>
                All <ArrowRight size={11} />
              </button>
            </div>
            <div className="dash__list-scroll">
              {data?.topTrainers?.length ? (
                data.topTrainers.slice(0, 5).map((t: any, i: number) => (
                  <div key={i} className="dash__top-trainer-row">
                    <span className="dash__top-trainer-rank">{i + 1}</span>
                    <div className="dash__trainer-avatar dash__trainer-avatar--sm">{t.initials || t.name?.charAt(0)}</div>
                    <div className="dash__trainer-info">
                      <span className="dash__trainer-name">{t.name}</span>
                      <span className="dash__trainer-meta">{t.sessions} sessions</span>
                    </div>
                    <span className="dash__top-trainer-revenue">{formatPrice(t.revenue || 0)}</span>
                  </div>
                ))
              ) : (
                <EmptyState icon={<Star size={22} />} label="No trainer data yet" hint="Session data will populate this month" color="amber" />
              )}
            </div>
          </motion.section>

          {/* Today's Classes — 4 col */}
          <motion.section className="dash__card dash__card--schedule" custom={7} variants={CARD_VARIANTS} initial="hidden" animate="visible">
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

          {/* ══ ROW LABEL: EQUIPMENT ══ */}
          <div className="dash__row-label">
            <span className="dash__row-label-icon"><Layers size={11} /></span>
            Equipment
            <span className="dash__row-label-tag">Go to Equipment page to manage</span>
          </div>

          {/* Equipment Status — 4 col */}
          <motion.section className="dash__card dash__card--equip-status" custom={8} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--cyan" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--cyan"><Layers size={15} /></div>
              <div>
                <h3 className="dash__card-title">Equipment Status</h3>
                <p className="dash__card-sub">Total inventory health</p>
              </div>
              <button className="dash__link-btn" onClick={() => navigate("/equipment")}>
                Manage <ArrowRight size={11} />
              </button>
            </div>
            {equipmentData ? (
              <div className="dash__equip-status-grid">
                {[
                  { label: "Active",       value: equipmentData.stats.active,      icon: <CheckCircle size={16}/>,  color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
                  { label: "Maintenance",  value: equipmentData.stats.maintenance, icon: <Wrench size={16}/>,       color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
                  { label: "Out of Order", value: equipmentData.stats.outOfOrder,  icon: <XCircle size={16}/>,      color: "#f43f5e", bg: "rgba(244,63,94,0.12)"   },
                  { label: "Total",        value: equipmentData.stats.total,       icon: <Layers size={16}/>,       color: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
                ].map((s, i) => (
                  <div key={i} className="dash__equip-stat-box" style={{ borderColor: s.color + "30", background: s.bg }}>
                    <span className="dash__equip-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                    <span className="dash__equip-stat-val" style={{ color: s.color }}>{s.value}</span>
                    <span className="dash__equip-stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Layers size={22}/>} label="Loading equipment…" hint="Fetching equipment data" color="cyan" />
            )}
          </motion.section>

          {/* Maintenance Due — 4 col */}
          <motion.section className="dash__card dash__card--equip-maintenance" custom={9} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--amber" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--amber"><Wrench size={15} /></div>
              <div>
                <h3 className="dash__card-title">Maintenance Due</h3>
                <p className="dash__card-sub">Needs service soon</p>
              </div>
              <span className="dash__count-badge dash__count-badge--amber">
                {equipmentData?.list.filter(e => e.status === 'MAINTENANCE' || e.status === 'OUT_OF_ORDER').length ?? 0}
              </span>
            </div>
            <div className="dash__list-scroll">
              {(() => {
                const due = equipmentData?.list.filter(e =>
                  e.status === 'MAINTENANCE' || e.status === 'OUT_OF_ORDER' ||
                  (e.nextMaintenanceDueDate && new Date(e.nextMaintenanceDueDate) <= new Date(Date.now() + 7 * 86400000))
                ) ?? []
                return due.length ? due.slice(0, 6).map((eq: any, i: number) => (
                  <div key={i} className="dash__equip-row">
                    <div className={`dash__equip-status-dot dash__equip-status-dot--${eq.status === 'OUT_OF_ORDER' ? 'red' : 'amber'}`} />
                    <div className="dash__equip-info">
                      <span className="dash__equip-name">{eq.name}</span>
                      <span className="dash__equip-meta">{eq.category} · {eq.location}</span>
                    </div>
                    <span className={`dash__equip-badge dash__equip-badge--${eq.status === 'OUT_OF_ORDER' ? 'red' : 'amber'}`}>
                      {eq.status === 'OUT_OF_ORDER' ? 'Broken' : eq.status === 'MAINTENANCE' ? 'In Service' : 'Due Soon'}
                    </span>
                  </div>
                )) : <EmptyState icon={<Wrench size={22}/>} label="No maintenance due" hint="All equipment is in good condition" color="amber" />
              })()}
            </div>
          </motion.section>

          {/* Equipment Utilization — 4 col */}
          <motion.section className="dash__card dash__card--equip-util" custom={10} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--violet" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--violet"><BarChart3 size={15} /></div>
              <div>
                <h3 className="dash__card-title">Equipment by Category</h3>
                <p className="dash__card-sub">Inventory breakdown</p>
              </div>
            </div>
            {equipmentData?.list.length ? (
              <div className="dash__bkdn-list">
                {Object.entries(
                  equipmentData.list.reduce((acc: any, eq: any) => {
                    acc[eq.category] = (acc[eq.category] || 0) + 1; return acc
                  }, {})
                ).sort((a: any, b: any) => b[1] - a[1]).slice(0, 6).map(([cat, count]: any, i: number) => {
                  const total = equipmentData.list.length
                  const pct = Math.round((count / total) * 100)
                  const colors = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#f43f5e","#06b6d4"]
                  const col = colors[i % colors.length]
                  return (
                    <div key={cat} className="dash__bkdn-row">
                      <div className="dash__bkdn-info">
                        <span className="dash__bkdn-dot" style={{ background: col }}/>
                        <span className="dash__bkdn-label">{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                      </div>
                      <div className="dash__bkdn-track">
                        <div className="dash__bkdn-fill" style={{ width: `${pct}%`, background: col }}/>
                      </div>
                      <span className="dash__bkdn-amount">{count} pcs</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState icon={<BarChart3 size={22}/>} label="No equipment added" hint="Add equipment to see category breakdown" color="violet" />
            )}
          </motion.section>

          {/* ══ ROW LABEL: GYM OPERATIONS ══ */}
          <div className="dash__row-label">
            <span className="dash__row-label-icon"><Activity size={11} /></span>
            Gym Operations
          </div>

          {/* Occupancy + Progress — 3 col */}
          <motion.section className="dash__card dash__card--metrics" custom={11} variants={CARD_VARIANTS} initial="hidden" animate="visible">
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

          {/* Attendance bar — 3 col */}
          <motion.section className="dash__card dash__card--attendance" custom={12} variants={CARD_VARIANTS} initial="hidden" animate="visible">
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
              <ResponsiveContainer width="100%" height={110}>
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

            {/* ══ ROW LABEL: ALERTS & EVENTS ══ */}
          <div className="dash__row-label">
            <span className="dash__row-label-icon"><Flame size={11} /></span>
            Alerts &amp; Events
          </div>

          {/* Birthdays — 4 col (always visible) */}
          <motion.section className="dash__card dash__card--birthdays" custom={15} variants={CARD_VARIANTS} initial="hidden" animate="visible">
            <div className="dash__card-glow dash__card-glow--rose" />
            <div className="dash__card-head">
              <div className="dash__card-icon dash__card-icon--rose"><Flame size={15} /></div>
              <div>
                <h3 className="dash__card-title">Birthdays Today</h3>
                <p className="dash__card-sub">Reach out &amp; retain</p>
              </div>
              {data?.birthdays?.length ? <span className="dash__count-badge dash__count-badge--rose">{data.birthdays.length}</span> : null}
            </div>
            <div className="dash__list-scroll">
              {data?.birthdays?.length ? (
                data.birthdays.map((b: any, i: number) => (
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
                ))
              ) : (
                <EmptyState icon={<Flame size={22} />} label="No birthdays today" hint="Members with today's birthday appear here" color="rose" />
              )}
            </div>
            </motion.section>

            {/* Quick Actions — 4 col · Alerts row */}
            <motion.section className="dash__card dash__card--actions" custom={16} variants={CARD_VARIANTS} initial="hidden" animate="visible">
              <div className="dash__card-head">
                <div className="dash__card-icon dash__card-icon--rose"><Zap size={15} /></div>
                <div><h3 className="dash__card-title">Quick Actions</h3><p className="dash__card-sub">Shortcuts to key pages</p></div>
              </div>
              <div className="dash__action-grid">
                {([
                  { icon: <UserPlus size={18} />,     label: "Add Member",  path: "/members?action=create", color: "blue"    },
                  { icon: <CheckCircle2 size={18} />, label: "Check-in",    path: "/check-in",               color: "emerald" },
                  { icon: <Wallet size={18} />,       label: "Payments",    path: "/financials",             color: "violet"  },
                  { icon: <Calendar size={18} />,     label: "Classes",     path: "/classes",                color: "cyan"    },
                  { icon: <Dumbbell size={18} />,     label: "Trainers",    path: "/trainers",               color: "amber"   },
                  { icon: <BarChart3 size={18} />,    label: "Reports",     path: "/financials",             color: "rose"    },
                ] as any[]).map((a, i) => (
                  <button key={i} className={`dash__action-btn dash__action-btn--${a.color}`} onClick={() => navigate(a.path)}>
                    <span className="dash__action-icon">{a.icon}</span>
                    <span className="dash__action-label">{a.label}</span>
                  </button>
                ))}
              </div>
            </motion.section>

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
      {/* icon */}
      <div className="dash__kpi-icon">{icon}</div>
      {/* body */}
      <div className="dash__kpi-body">
        <span className="dash__kpi-label">{label}</span>
        <span className="dash__kpi-value">{value || '—'}</span>
        {sub && <span className="dash__kpi-sub">{sub}</span>}
      </div>
      {/* change badge */}
      {hasChange && (
        <span className={`dash__badge ${isPos ? "dash__badge--pos" : "dash__badge--neg"}`}>
          {isPos ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {Math.abs(change!).toFixed(1)}%
        </span>
      )}
      {/* sparkline */}
      {spark && spark.length > 0 && (
        <div className="dash__kpi-spark">
          <ResponsiveContainer width="100%" height={28} minWidth={40}>
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
