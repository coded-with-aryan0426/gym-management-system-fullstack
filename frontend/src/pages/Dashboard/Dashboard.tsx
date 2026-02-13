import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
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
  BarChart3,
  ArrowRight,
  Sparkles,
  CircleDot,
  Crown,
  Star,
  AlertTriangle,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RefreshCw
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
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await api.getOwnerDashboard()
      setData(response)
      
      // Load real analytics data
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const fromDate = weekAgo.toISOString().split('T')[0]
      const toDate = today.toISOString().split('T')[0]
      const monthFromDate = monthAgo.toISOString().split('T')[0]
      
      const [
        dailyRevenue,
        dailyAttendance,
        membershipBreakdown,
        revenueBySource,
        overduePayments,
        todaysClasses,
        occupancy,
        monthlyProgress
      ] = await Promise.all([
        api.getDailyRevenue(fromDate, toDate),
        api.getDailyAttendance(fromDate, toDate),
        api.getMembershipBreakdown(),
        api.getRevenueBySource(monthFromDate, toDate),
        api.getOverduePayments(5),
        api.getTodaysClasses(),
        api.getOccupancy(),
        api.getMonthlyProgress()
      ])
      
      setAnalyticsData({
        dailyRevenue,
        dailyAttendance,
        membershipBreakdown,
        revenueBySource,
        overduePayments,
        todaysClasses,
        occupancy,
        monthlyProgress
      })
    } catch (err) {
      console.error("[Dashboard] Failed to fetch data", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 15000)
    return () => clearInterval(interval)
  }, [loadDashboardData])

  // Live clock
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

  // Revenue sparkline data (real weekly trend)
  const revenueSparkline = useMemo(() => {
    if (analyticsData?.dailyRevenue) {
      return analyticsData.dailyRevenue.map((item: any) => ({
        day: item.day,
        value: Math.round(item.revenue)
      }))
    }
    // Fallback to mock data if analytics not loaded yet
    const base = data?.monthlyRevenue || 50000
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
      day: d,
      value: Math.round(base / 7 * (0.6 + Math.random() * 0.8))
    }))
  }, [analyticsData?.dailyRevenue, data?.monthlyRevenue])

  // Membership distribution for donut (real data)
  const membershipDistribution = useMemo(() => {
    if (analyticsData?.membershipBreakdown) {
      const breakdown = analyticsData.membershipBreakdown
      return [
        { name: 'Active', value: breakdown.active || 0, color: '#10b981' },
        { name: 'Expiring', value: breakdown.expiring || 0, color: '#f59e0b' },
        { name: 'Frozen', value: breakdown.frozen || 0, color: '#6366f1' },
        { name: 'Expired', value: breakdown.expired || 0, color: '#ef4444' },
      ]
    }
    // Fallback to mock data if analytics not loaded yet
    return [
      { name: 'Active', value: data?.totalMembers ? Math.round(data.totalMembers * 0.72) : 65, color: '#10b981' },
      { name: 'Expiring', value: data?.expiringMembers?.length || 8, color: '#f59e0b' },
      { name: 'Frozen', value: data?.totalMembers ? Math.round(data.totalMembers * 0.08) : 5, color: '#6366f1' },
      { name: 'Expired', value: data?.totalMembers ? Math.round(data.totalMembers * 0.12) : 12, color: '#ef4444' },
    ]
  }, [analyticsData?.membershipBreakdown, data])

  // Attendance trend (real data)
  const attendanceTrend = useMemo(() => {
    if (analyticsData?.dailyAttendance) {
      return analyticsData.dailyAttendance.map((item: any) => ({
        day: item.day,
        count: item.checkIns || 0
      }))
    }
    // Fallback to mock data if analytics not loaded yet
    const base = data?.checkIns || 30
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({
      day: d,
      count: Math.round(base * (0.5 + Math.random() * 1))
    }))
  }, [analyticsData?.dailyAttendance, data?.checkIns])

  const isPositive = (data?.revenueChange || 0) >= 0

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
          <button className="dash__refresh-btn" onClick={loadDashboardData} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <div className="dash__live-badge">
            <span className="dash__live-dot" /> Live
          </div>
        </div>
      </header>

      {/* KPI Row */}
      <div className="dash__kpi-row">
        <KPICard
          icon={<Wallet size={18} />}
          label="Today's Revenue"
          value={formatPrice(data?.todayRevenue || 0)}
          change={data?.revenueChange || 0}
          color="emerald"
        />
        <KPICard
          icon={<Eye size={18} />}
          label="Live on Floor"
          value={String(data?.liveMembers || 0)}
          sub={`${data?.checkIns || 0} check-ins today`}
          color="blue"
        />
        <KPICard
          icon={<Users size={18} />}
          label="Total Members"
          value={String(data?.totalMembers || 0)}
          sub={`+${data?.newSignups || 0} new today`}
          color="violet"
        />
        <KPICard
          icon={<Dumbbell size={18} />}
          label="Sessions Today"
          value={String(data?.totalSessionsToday || 0)}
          sub={`${data?.totalTrainers || 0} trainers active`}
          color="amber"
        />
        <KPICard
          icon={<CreditCard size={18} />}
          label="Pending Dues"
          value={formatPrice(data?.pendingPaymentsAmount || 0)}
          sub={`${data?.pendingPaymentsCount || 0} members`}
          color="rose"
          alert
        />
      </div>

      {/* Main Grid */}
      <div className="dash__grid">
        {/* Overdue Payments Widget */}
        {analyticsData?.overduePayments && analyticsData.overduePayments.length > 0 && (
          <section className="dash__card dash__card--overdue">
            <div className="dash__card-head">
              <div>
                <h3 className="dash__card-title">
                  <AlertCircle size={14} className="dash__icon-alert" /> Overdue Payments
                </h3>
                <p className="dash__card-sub">Members with pending dues</p>
              </div>
              <span className="dash__badge-count">{analyticsData.overduePayments.length}</span>
            </div>
            <div className="dash__overdue-list">
              {analyticsData.overduePayments.slice(0, 3).map((payment: any, i: number) => (
                <div key={i} className="dash__overdue-row">
                  <div className="dash__overdue-info">
                    <span className="dash__overdue-name">{payment.memberName}</span>
                    <span className="dash__overdue-plan">{payment.planName}</span>
                  </div>
                  <div className="dash__overdue-amount">
                    <span className="dash__overdue-days">{payment.daysOverdue}d overdue</span>
                    <span className="dash__overdue-price">{formatPrice(payment.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
            {analyticsData.overduePayments.length > 3 && (
              <button className="dash__link-btn" onClick={() => navigate('/financials?filter=overdue')}>
                View All <ArrowRight size={12} />
              </button>
            )}
          </section>
        )}

        {/* Today's Classes Widget */}
        {analyticsData?.todaysClasses && analyticsData.todaysClasses.length > 0 && (
          <section className="dash__card dash__card--classes">
            <div className="dash__card-head">
              <div>
                <h3 className="dash__card-title">
                  <Calendar size={14} /> Today's Classes
                </h3>
                <p className="dash__card-sub">Group fitness sessions</p>
              </div>
              <span className="dash__badge-count">{analyticsData.todaysClasses.length}</span>
            </div>
            <div className="dash__classes-list">
              {analyticsData.todaysClasses.slice(0, 3).map((classItem: any, i: number) => (
                <div key={i} className={`dash__class-row dash__class-row--${classItem.status.toLowerCase()}`}>
                  <div className="dash__class-time">
                    {new Date(classItem.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="dash__class-info">
                    <span className="dash__class-name">{classItem.name}</span>
                    <span className="dash__class-meta">{classItem.trainer} &middot; {classItem.enrolled}/{classItem.capacity}</span>
                  </div>
                  <div className="dash__class-status">
                    {classItem.status === 'IN_PROGRESS' && <span className="dash__live-badge">LIVE</span>}
                    {classItem.status === 'UPCOMING' && <span className="dash__upcoming-badge">Upcoming</span>}
                    {classItem.status === 'COMPLETED' && <span className="dash__completed-badge">Done</span>}
                  </div>
                </div>
              ))}
            </div>
            {analyticsData.todaysClasses.length > 3 && (
              <button className="dash__link-btn" onClick={() => navigate('/classes')}>
                View All <ArrowRight size={12} />
              </button>
            )}
          </section>
        )}

        {/* Occupancy Meter */}
        {analyticsData?.occupancy && (
          <section className="dash__card dash__card--occupancy">
            <div className="dash__card-head">
              <div>
                <h3 className="dash__card-title">
                  <Activity size={14} /> Gym Occupancy
                </h3>
                <p className="dash__card-sub">Current capacity usage</p>
              </div>
              <div className="dash__occupancy-gauge">
                <div className={`dash__occupancy-percentage dash__occupancy-percentage--${
                  analyticsData.occupancy.percentage < 60 ? 'low' : 
                  analyticsData.occupancy.percentage < 80 ? 'medium' : 'high'
                }`}>
                  {Math.round(analyticsData.occupancy.percentage)}%
                </div>
              </div>
            </div>
            <div className="dash__occupancy-details">
              <div className="dash__occupancy-item">
                <span className="dash__occupancy-label">Current</span>
                <span className="dash__occupancy-value">{analyticsData.occupancy.currentCount}</span>
              </div>
              <div className="dash__occupancy-item">
                <span className="dash__occupancy-label">Capacity</span>
                <span className="dash__occupancy-value">{analyticsData.occupancy.maxCapacity}</span>
              </div>
              <div className="dash__occupancy-item">
                <span className="dash__occupancy-label">Trend</span>
                <span className={`dash__occupancy-trend dash__occupancy-trend--${analyticsData.occupancy.trend}`}>
                  {analyticsData.occupancy.trend === 'rising' && <TrendingUp size={12} />}
                  {analyticsData.occupancy.trend === 'falling' && <TrendingDown size={12} />}
                  {analyticsData.occupancy.trend === 'stable' && <CircleDot size={12} />}
                  {analyticsData.occupancy.trend}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Monthly Progress */}
        {analyticsData?.monthlyProgress && (
          <section className="dash__card dash__card--progress">
            <div className="dash__card-head">
              <div>
                <h3 className="dash__card-title">
                  <TrendingUp size={14} /> Monthly Progress
                </h3>
                <p className="dash__card-sub">Revenue target tracking</p>
              </div>
              <div className="dash__progress-status">
                <span className={`dash__progress-badge dash__progress-badge--${analyticsData.monthlyProgress.status.toLowerCase()}`}>
                  {analyticsData.monthlyProgress.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="dash__progress-bar">
              <div 
                className="dash__progress-fill" 
                style={{ width: `${Math.min(100, (analyticsData.monthlyProgress.current / analyticsData.monthlyProgress.target) * 100)}%` }}
              />
            </div>
            <div className="dash__progress-details">
              <div className="dash__progress-item">
                <span className="dash__progress-label">Current</span>
                <span className="dash__progress-value">{formatPrice(analyticsData.monthlyProgress.current)}</span>
              </div>
              <div className="dash__progress-item">
                <span className="dash__progress-label">Target</span>
                <span className="dash__progress-value">{formatPrice(analyticsData.monthlyProgress.target)}</span>
              </div>
              <div className="dash__progress-item">
                <span className="dash__progress-label">Days Left</span>
                <span className="dash__progress-value">{analyticsData.monthlyProgress.daysRemaining}</span>
              </div>
            </div>
            {analyticsData.monthlyProgress.projectedEnd && (
              <div className="dash__progress-projection">
                <span className="dash__progress-projection-label">Projected:</span>
                <span className="dash__progress-projection-value">{formatPrice(analyticsData.monthlyProgress.projectedEnd)}</span>
              </div>
            )}
          </section>
        )}

        {/* Revenue Breakdown */}
        {analyticsData?.revenueBySource && analyticsData.revenueBySource.length > 0 && (
          <section className="dash__card dash__card--breakdown">
            <div className="dash__card-head">
              <div>
                <h3 className="dash__card-title">
                  <Wallet size={14} /> Revenue Breakdown
                </h3>
                <p className="dash__card-sub">By source - Last 30 days</p>
              </div>
            </div>
            <div className="dash__breakdown-chart">
              {analyticsData.revenueBySource.map((source: any, i: number) => (
                <div key={i} className="dash__breakdown-item">
                  <div className="dash__breakdown-bar" style={{ width: `${(source.total / Math.max(...analyticsData.revenueBySource.map((s: any) => s.total))) * 100}%` }}>
                    <span className="dash__breakdown-label">{source.category || 'Other'}</span>
                    <span className="dash__breakdown-value">{formatPrice(source.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Revenue Chart */}
        <section className="dash__card dash__card--revenue">
          <div className="dash__card-head">
            <div>
              <h3 className="dash__card-title">Revenue Overview</h3>
              <p className="dash__card-sub">Weekly earnings trend</p>
            </div>
            <div className="dash__card-stat">
              <span className="dash__card-stat-value">{formatPrice(data?.monthlyRevenue || 0)}</span>
              <span className={`dash__card-stat-badge ${isPositive ? 'pos' : 'neg'}`}>
                {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(data?.revenueChange || 0).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="dash__chart">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueSparkline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  formatter={(val: number) => [formatPrice(val), 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Attendance Chart */}
        <section className="dash__card dash__card--attendance">
          <div className="dash__card-head">
            <div>
              <h3 className="dash__card-title">Attendance</h3>
              <p className="dash__card-sub">Daily check-ins this week</p>
            </div>
            <div className="dash__card-highlight">
              <Activity size={14} />
              <span>{data?.checkIns || 0} today</span>
            </div>
          </div>
          <div className="dash__chart">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={attendanceTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Membership Donut */}
        <section className="dash__card dash__card--membership">
          <div className="dash__card-head">
            <div>
              <h3 className="dash__card-title">Membership Mix</h3>
              <p className="dash__card-sub">Current status breakdown</p>
            </div>
          </div>
          <div className="dash__donut-wrap">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={membershipDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {membershipDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="dash__donut-center">
              <span className="dash__donut-total">{data?.totalMembers || 0}</span>
              <span className="dash__donut-label">Total</span>
            </div>
          </div>
          <div className="dash__legend">
            {membershipDistribution.map(item => (
              <div key={item.name} className="dash__legend-item">
                <span className="dash__legend-dot" style={{ background: item.color }} />
                <span className="dash__legend-name">{item.name}</span>
                <span className="dash__legend-val">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trainer Schedule */}
        <section className="dash__card dash__card--trainers">
          <div className="dash__card-head">
            <div>
              <h3 className="dash__card-title">Trainer Schedule</h3>
              <p className="dash__card-sub">Today's sessions</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate('/trainers')}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="dash__trainer-list">
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

        {/* Expiring Memberships */}
        <section className="dash__card dash__card--expiring">
          <div className="dash__card-head">
            <div>
              <h3 className="dash__card-title">
                <AlertTriangle size={14} className="dash__icon-warn" /> Expiring Soon
              </h3>
              <p className="dash__card-sub">Next 7 days</p>
            </div>
            <span className="dash__badge-count">{data?.expiringMembers?.length || 0}</span>
          </div>
          <div className="dash__expire-list">
            {data?.expiringMembers?.slice(0, 5).map((member, i) => (
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

        {/* Live Activity Feed */}
        <section className="dash__card dash__card--activity">
          <div className="dash__card-head">
            <div>
              <h3 className="dash__card-title">
                <Zap size={14} className="dash__icon-zap" /> Live Activity
              </h3>
              <p className="dash__card-sub">Real-time updates</p>
            </div>
            <button className="dash__link-btn" onClick={() => navigate('/reports')}>
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="dash__activity-list">
            {data?.recentActivity?.slice(0, 5).map((act, i) => (
              <div key={i} className="dash__activity-row">
                <div className={`dash__activity-icon dash__activity-icon--${act.type}`}>
                  {act.type === 'checkin' && <UserCheck size={12} />}
                  {act.type === 'signup' && <UserPlus size={12} />}
                  {act.type === 'cancel' && <AlertCircle size={12} />}
                  {(!act.type || act.type === 'freeze') && <Timer size={12} />}
                </div>
                <div className="dash__activity-content">
                  <span className="dash__activity-name">{act.name}</span>
                  <span className="dash__activity-desc">
                    {act.type === 'checkin' && 'Checked in'}
                    {act.type === 'signup' && 'New signup'}
                    {act.type === 'cancel' && 'Cancelled'}
                    {act.type === 'freeze' && 'Membership frozen'}
                  </span>
                </div>
                <span className="dash__activity-time">{act.date}</span>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <div className="dash__empty">No recent activity</div>
            )}
          </div>
        </section>

        {/* Birthdays */}
        <section className="dash__card dash__card--birthdays">
          <div className="dash__card-head">
            <div>
              <h3 className="dash__card-title">
                <Gift size={14} className="dash__icon-gift" /> Birthdays Today
              </h3>
            </div>
          </div>
          <div className="dash__birthday-list">
            {data?.birthdays?.map((b, i) => (
              <div key={i} className="dash__birthday-chip">
                <div className="dash__birthday-avatar">{b.initials}</div>
                <span>{b.name}</span>
              </div>
            ))}
            {(!data?.birthdays || data.birthdays.length === 0) && (
              <div className="dash__empty">No birthdays today</div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dash__card dash__card--actions">
          <div className="dash__card-head">
            <div>
              <h3 className="dash__card-title">Quick Actions</h3>
            </div>
          </div>
          <div className="dash__action-grid">
            <button className="dash__action-btn dash__action-btn--primary" onClick={() => navigate('/members?action=create')}>
              <UserPlus size={16} />
              <span>Add Member</span>
            </button>
            <button className="dash__action-btn" onClick={() => { navigate('/members') }}>
              <CheckCircle2 size={16} />
              <span>Check-in</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/financials')}>
              <Wallet size={16} />
              <span>Payments</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/reports')}>
              <BarChart3 size={16} />
              <span>Reports</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/classes')}>
              <Calendar size={16} />
              <span>Classes</span>
            </button>
            <button className="dash__action-btn" onClick={() => navigate('/equipment')}>
              <Dumbbell size={16} />
              <span>Equipment</span>
            </button>
          </div>
        </section>
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
