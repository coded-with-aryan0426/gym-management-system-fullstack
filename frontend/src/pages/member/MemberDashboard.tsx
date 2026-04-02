import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
    Calendar, Flame, ChevronRight, Clock, MapPin,
    Activity, Trophy, MessageSquare, Dumbbell, Zap, Heart,
    Target, TrendingUp, TrendingDown, Bell, Star, Award, User,
    BarChart3, Users, CreditCard, RefreshCw, AlertCircle,
    ArrowRight, CheckCircle2, UserPlus, Layers
} from "lucide-react"
import { format } from "date-fns"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    LineChart, Line, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar,
    BarChart, Bar
} from "recharts"
import { useAuth } from "../../contexts/AuthContext"
import { useCurrency } from "../../contexts/CurrencyContext"
import Avatar from "../../components/ui/Avatar"
import { apiClient } from "../../services/api"
import { 
    SkeletonKPIGrid, SkeletonChart, SkeletonCard, 
    SkeletonPageHeader, SkeletonListItem, SkeletonActivityFeed,
    SkeletonProfileSection
} from "../../components/ui/Skeleton"

import "../../styles/dashboard/dashboard-core.css"
import "../../styles/dashboard/dashboard-members.css"
import "../Dashboard/Dashboard.css"
import "./MemberDashboard.css"

/* ── Data interface (unchanged from original) ── */
interface DashboardData {
    memberId: number
    memberName: string
    email: string
    avatarId: string
    workoutsThisMonth: number
    streakDays: number
    bookedClassesCount: number
    unreadNotificationsCount: number
    caloriesBurned: number
    minutesActive: number
    totalPoints: number
    membership: {
        status: string
        packageName: string
        startDate: string
        endDate: string
        daysRemaining: number
        isExpired: boolean
        planPrice: number
        planDuration: string
        autoRenew: boolean
        isFrozen: boolean
    } | null
    assignedTrainer: {
        userId: number
        fullName: string
        email: string
        avatarId: string
        specialization: string
        nextSession: string
        sessionsCount: number
        rating: number
    } | null
    upcomingClasses: Array<{
        id: number
        title: string
        time: string
        date: string
        location: string
        trainer: string
        type: string
        capacity: number
        enrolled: number
    }>
    weeklyActivity: Array<{
        day: string
        workouts: number
        calories: number
    }>
    recentActivity: Array<{
        id: number
        name: string
        type: "checkin" | "workout" | "booking" | "payment"
        date: string
        reason: string
    }>
    fitnessMetrics: Array<{
        metric: string
        value: number
    }>
    weightProgress: Array<{
        week: string
        weight: number
        goal: number
    }>
    achievements: Array<{
        icon: string
        label: string
        color: string
    }>
}

/* ── FALLBACK must be defined BEFORE component ── */
const FALLBACK_DASHBOARD: DashboardData = {
    memberId: 0,
    memberName: "Member",
    email: "",
    avatarId: "",
    workoutsThisMonth: 0,
    streakDays: 0,
    bookedClassesCount: 0,
    unreadNotificationsCount: 0,
    caloriesBurned: 0,
    minutesActive: 0,
    totalPoints: 0,
    membership: null,
    assignedTrainer: null,
    upcomingClasses: [],
    weeklyActivity: [
        { day: "Mon", workouts: 0, calories: 0 },
        { day: "Tue", workouts: 0, calories: 0 },
        { day: "Wed", workouts: 0, calories: 0 },
        { day: "Thu", workouts: 0, calories: 0 },
        { day: "Fri", workouts: 0, calories: 0 },
        { day: "Sat", workouts: 0, calories: 0 },
        { day: "Sun", workouts: 0, calories: 0 }
    ],
    recentActivity: [],
    fitnessMetrics: [
        { metric: "Strength", value: 0 },
        { metric: "Endurance", value: 0 },
        { metric: "Flexibility", value: 0 },
        { metric: "Balance", value: 0 },
        { metric: "Speed", value: 0 }
    ],
    weightProgress: [],
    achievements: [
        { icon: "Trophy", label: "Get Started", color: "#F59E0B" },
        { icon: "Target", label: "Set Goals", color: "#10B981" },
        { icon: "Award", label: "Stay Active", color: "#8B5CF6" },
        { icon: "Star", label: "Keep Going", color: "#06B6D4" }
    ]
}

/* ── Demo sparkline data for KPI cards ── */
const DEMO_SPARK = [
    { v: 40 }, { v: 55 }, { v: 45 }, { v: 70 }, { v: 60 }, { v: 80 }, { v: 75 },
]

/* ── Animation variants (matching owner) ── */
const CARD_VARIANTS = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: (i: number) => ({
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }
    })
}

/* ════════ EMPTY STATE (matching owner pattern) ════════ */
interface EmptyStateProps {
    icon: React.ReactNode
    label: string
    hint: string
    color: string
    compact?: boolean
}
const EmptyState: React.FC<EmptyStateProps> = ({ icon, label, hint, color, compact }) => (
    <div className={`dash__empty ${compact ? "dash__empty--compact" : ""}`}>
        <div className={`dash__empty-icon-wrap dash__empty-icon-wrap--${color}`}>{icon}</div>
        <span className="dash__empty-label">{label}</span>
        <span className="dash__empty-hint">{hint}</span>
    </div>
)

/* ════════ KPI CARD (matching owner pattern) ════════ */
interface KPICardProps {
    icon: React.ReactNode
    label: string
    value: string | number
    change?: number
    sub?: string
    color: string
    alert?: boolean
    spark?: { v: number }[] | null
    index: number
}
const KPICard: React.FC<KPICardProps> = ({ icon, label, value, change, sub, color, alert: isAlert, spark, index }) => {
    const hasChange = change !== undefined && change !== null
    const isPos = (change || 0) >= 0
    return (
        <motion.div
            className={`dash__kpi dash__kpi--${color} ${isAlert ? "dash__kpi--alert" : ""}`}
            custom={index} variants={CARD_VARIANTS} initial="hidden" animate="visible"
        >
            <div className="dash__kpi-glow" />
            <div className="dash__kpi-icon">{icon}</div>
            <div className="dash__kpi-body">
                <span className="dash__kpi-label">{label}</span>
                <span className="dash__kpi-value">{value}</span>
                {sub && <span className="dash__kpi-sub">{sub}</span>}
            </div>
            {hasChange && (
                <span className={`dash__badge ${isPos ? "dash__badge--pos" : "dash__badge--neg"}`}>
                    {isPos ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {Math.abs(change!).toFixed(1)}%
                </span>
            )}
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

/* ════════ HELPER: get icon component from string ════════ */
const getIconComponent = (iconName: string) => {
    switch (iconName) {
        case "Trophy": return Trophy
        case "Target": return Target
        case "Award": return Award
        case "Star": return Star
        default: return Star
    }
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case "checkin": return MapPin
        case "workout": return Dumbbell
        case "booking": return Calendar
        case "payment": return CreditCard
        default: return Activity
    }
}

/* ════════ MAIN COMPONENT ════════ */
const MemberDashboard: React.FC = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { formatPrice } = useCurrency()
    const [dashboard, setDashboard] = useState<DashboardData>(FALLBACK_DASHBOARD)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [now, setNow] = useState(new Date())
    const [chartPeriod, setChartPeriod] = useState<"week" | "month" | "3month">("month")
    const [chartLoading, setChartLoading] = useState(false)
    const [showRadarCompare, setShowRadarCompare] = useState(false)

    // Premium tooltip component
    const PremiumTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload) return null
        return (
            <div className="premium-tooltip">
                <div className="premium-tooltip-date">{label}</div>
                {payload.map((entry: any, idx: number) => (
                    <div key={idx} className="premium-tooltip-row">
                        <span className="premium-tooltip-dot" style={{ background: entry.color }} />
                        <span className="premium-tooltip-label">{entry.name}</span>
                        <span className="premium-tooltip-value">{entry.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        )
    }

    const loadDashboard = useCallback(async () => {
        try {
            setRefreshing(true)
            setError(null)
            const memberId = user?.userId || (user?.id ? Number(user.id) : null)
            if (!memberId) { setLoading(false); return }
            const response = await apiClient.get("/member/dashboard", { params: { memberId } })
            const data = response.data
            setDashboard({
                ...FALLBACK_DASHBOARD,
                ...data,
                memberName: data.memberName || user?.fullName || "Member",
                memberId,
                weeklyActivity: data.weeklyActivity?.length > 0 ? data.weeklyActivity : FALLBACK_DASHBOARD.weeklyActivity,
                fitnessMetrics: data.fitnessMetrics?.length > 0 ? data.fitnessMetrics : FALLBACK_DASHBOARD.fitnessMetrics,
                achievements: data.achievements?.length > 0 ? data.achievements : FALLBACK_DASHBOARD.achievements
            })
        } catch (err) {
            console.warn("[MemberDashboard]", err)
            setError("Failed to load dashboard — retrying...")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [user])

    useEffect(() => { loadDashboard(); const t = setInterval(loadDashboard, 30000); return () => clearInterval(t) }, [loadDashboard])
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t) }, [])

    const greeting = useMemo(() => {
        const h = now.getHours()
        if (h < 12) return { text: "Good Morning", emoji: "☀️" }
        if (h < 17) return { text: "Good Afternoon", emoji: "⚡" }
        return { text: "Good Evening", emoji: "🌙" }
    }, [now])

    const dateStr = useMemo(() =>
        now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }), [now])

    const firstName = (dashboard.memberName || user?.fullName || "Member").split(" ")[0]

    /* ── Chart data for weekly activity (AreaChart) ── */
    const activityChartData = useMemo(() => {
        return dashboard.weeklyActivity.map(d => ({
            day: d.day,
            workouts: d.workouts,
            calories: d.calories
        }))
    }, [dashboard.weeklyActivity])

    /* ── Weight progress chart data ── */
    const weightChartData = useMemo(() => {
        return dashboard.weightProgress.length > 0
            ? dashboard.weightProgress
            : [{ week: "W1", weight: 0, goal: 0 }, { week: "W2", weight: 0, goal: 0 }, { week: "W3", weight: 0, goal: 0 }]
    }, [dashboard.weightProgress])

    /* ── Membership donut data ── */
    const membershipDonut = useMemo(() => {
        const m = dashboard.membership
        if (!m) return [
            { name: "Active", value: 1, color: "#10b981" }
        ]
        const statusColor = m.isExpired ? "#ef4444" : m.isFrozen ? "#6366f1" : "#10b981"
        const statusName = m.isExpired ? "Expired" : m.isFrozen ? "Frozen" : "Active"
        return [
            { name: statusName, value: 1, color: statusColor },
            { name: "Remaining", value: Math.max(0, m.daysRemaining), color: "#3b82f6" }
        ]
    }, [dashboard.membership])

    /* ── Skeleton ── */
    if (loading && !dashboard.memberId) {
        return (
            <div className="dash dash--member" role="main" aria-busy="true">
                <SkeletonPageHeader />
                
                {/* KPI Strip Skeleton */}
                <div className="dash__header" style={{ marginTop: '16px' }}>
                    <SkeletonKPIGrid count={4} />
                </div>

                <div className="dash__grid">
                    {/* My Fitness Section */}
                    <div className="dash__row-label" style={{ gridColumn: "span 12" }}>
                        <span className="dash__row-label-icon"><Activity size={11} /></span>My Fitness
                    </div>
                    
                    {/* Weekly Activity Chart - 8 cols */}
                    <div style={{ gridColumn: 'span 8' }}>
                        <SkeletonChart type="bar" height={260} />
                    </div>
                    
                    {/* Fitness Profile Radar - 4 cols */}
                    <div style={{ gridColumn: 'span 4' }}>
                        <SkeletonCard hasImage={false} lines={4} />
                    </div>

                    {/* Membership Section */}
                    <div className="dash__row-label" style={{ gridColumn: "span 12", marginTop: '16px' }}>
                        <span className="dash__row-label-icon"><Users size={11} /></span>Membership
                    </div>
                    
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ gridColumn: 'span 3' }}>
                            <SkeletonCard hasImage={false} lines={3} />
                        </div>
                    ))}

                    {/* Progress Section */}
                    <div className="dash__row-label" style={{ gridColumn: "span 12", marginTop: '16px' }}>
                        <span className="dash__row-label-icon"><TrendingUp size={11} /></span>Progress
                    </div>
                    
                    <div style={{ gridColumn: 'span 6' }}>
                        <SkeletonChart type="line" height={220} />
                    </div>
                    
                    <div style={{ gridColumn: 'span 3' }}>
                        <SkeletonCard hasImage={false} lines={4} />
                    </div>
                    
                    <div style={{ gridColumn: 'span 3' }}>
                        <SkeletonCard hasImage={false} lines={4} />
                    </div>
                </div>
            </div>
        )
    }

    /* ── Render ── */
    return (
        <div className="dash dash--member">

            {/* ══ HEADER — greeting + KPI chips + actions ══ */}
            <header className="dash__header">
                <div className="dash__header-greet">
                    <span className="dash__greeting-emoji">{greeting.emoji}</span>
                    <div>
                        <h1 className="dash__greeting">{greeting.text}, <span className="dash__greeting-name">{firstName}</span></h1>
                        <p className="dash__date">{dateStr}</p>
                    </div>
                </div>

                {/* KPI chips */}
                <div className="dash__kpi-row">
                    {([
                        {
                            icon: <Dumbbell size={13} />, label: "Workouts",
                            value: dashboard.workoutsThisMonth,
                            sub: "This month",
                            color: "blue",
                            spark: null,
                        },
                        {
                            icon: <Flame size={13} />, label: "Streak",
                            value: `${dashboard.streakDays}d`,
                            sub: "Days active",
                            color: "amber",
                            spark: null,
                        },
                        {
                            icon: <Heart size={13} />, label: "Calories",
                            value: dashboard.caloriesBurned.toLocaleString(),
                            sub: "Total burn",
                            color: "rose",
                            spark: null,
                        },
                        {
                            icon: <Calendar size={13} />, label: "Booked",
                            value: dashboard.bookedClassesCount,
                            sub: "Classes",
                            color: "violet",
                            spark: null,
                        },
                    ] as any[]).map((kpi, i) => (
                        <KPICard key={i} index={i} {...kpi} />
                    ))}
                </div>

                {/* Right actions */}
                <div className="dash__header-right">
                    {error && (
                        <div className="dash__inline-error">
                            <AlertCircle size={12} />
                            <span>Error</span>
                            <button onClick={loadDashboard}>Retry</button>
                        </div>
                    )}
                    <button
                        className={`dash__refresh-btn ${refreshing ? "spin" : ""}`}
                        onClick={loadDashboard} disabled={refreshing}
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

            {/* ══ MAIN 12-COLUMN GRID ══ */}
            <div className="dash__grid">

                {/* ═══════════════════════════════════════════════════════
                   ROW 1: MY FITNESS
                   ═══════════════════════════════════════════════════════ */}
                <div className="dash__row-label" style={{ gridColumn: "span 12" }}>
                    <span className="dash__row-label-icon"><Activity size={11} /></span>
                    My Fitness
                </div>

                {/* Weekly Activity — 8 cols with premium stats */}
                <motion.section className="dash__card dash__card--span8 frosted-glass-card" custom={0} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--blue" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--blue"><BarChart3 size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Weekly Activity</h3>
                            <p className="dash__card-sub">Workouts & calories burned</p>
                        </div>
                        <div className="inline-compact-stats">
                            <div className="inline-compact-stat">
                                <div className="inline-compact-stat-icon"><Flame size={14} /></div>
                                <span className="inline-compact-stat-value">{dashboard.caloriesBurned.toLocaleString()}</span>
                                <span className="inline-compact-stat-label">cal</span>
                            </div>
                            <div className="inline-compact-stat">
                                <div className="inline-compact-stat-icon"><Clock size={14} /></div>
                                <span className="inline-compact-stat-value">{dashboard.minutesActive}</span>
                                <span className="inline-compact-stat-label">min</span>
                            </div>
                            <div className="inline-compact-stat">
                                <div className="inline-compact-stat-icon"><Calendar size={14} /></div>
                                <span className="inline-compact-stat-value">{dashboard.weeklyActivity.filter(d => d.workouts > 0).length}</span>
                                <span className="inline-compact-stat-label">days</span>
                            </div>
                        </div>
                        <div className="fitness-goals-row">
                            <div className="streak-badge">
                                <Flame size={12} className="streak-badge-icon" />
                                <span>{dashboard.streakDays} day streak</span>
                            </div>
                            <div className="goal-progress-ring">
                                <svg className="goal-ring-svg" viewBox="0 0 20 20">
                                    <circle className="goal-ring-bg" cx="10" cy="10" r="8" />
                                    <circle className="goal-ring-fill" cx="10" cy="10" r="8" 
                                        style={{ strokeDashoffset: 50 - (Math.min(dashboard.workoutsThisMonth / 5, 1) * 50) }} />
                                </svg>
                                <span className="goal-ring-text">{Math.min(dashboard.workoutsThisMonth, 5)}/5</span>
                            </div>
                        </div>
                        <div className="premium-period-toggle" data-active={["week", "month", "3month"].indexOf(chartPeriod)}>
                            {(["week", "month", "3month"] as const).map((p, i) => (
                                <button
                                    key={p}
                                    className={`premium-period-btn ${chartPeriod === p ? 'premium-period-btn--active' : ''}`}
                                    onClick={() => setChartPeriod(p)}
                                >
                                    {p === "3month" ? "3M" : p === "week" ? "1W" : "1M"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="premium-chart-container">
                        {activityChartData.every(d => d.workouts === 0 && d.calories === 0) ? (
                            <div className="premium-empty-state">
                                <div className="premium-empty-illustration">
                                    <div className="premium-empty-circle" />
                                    <Activity size={36} className="premium-empty-icon" />
                                </div>
                                <h4 className="premium-empty-title">Start Your Fitness Journey</h4>
                                <p className="premium-empty-hint">
                                    Complete workouts to track your progress. Watch your stats improve and earn achievements!
                                </p>
                                <button className="premium-empty-cta" onClick={() => navigate("/member/schedule")}>
                                    <Calendar size={14} /> Browse Classes
                                </button>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={activityChartData} margin={{ top: 8, right: 12, left: -10, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="workoutBarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                                        </linearGradient>
                                        <linearGradient id="calBarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#f97316" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 500 }} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} width={42} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} width={42} />
                                    <Tooltip
                                        content={<PremiumTooltip />}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar yAxisId="left" dataKey="workouts" name="Workouts" fill="url(#workoutBarGrad)" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="calories" name="Calories" fill="url(#calBarGrad)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.section>

                {/* Fitness Profile Radar — 4 col with premium styling */}
                <motion.section className="dash__card dash__card--span4 frosted-glass-card" custom={1} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--violet" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--violet"><Target size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Fitness Profile</h3>
                            <p className="dash__card-sub">Radar breakdown</p>
                        </div>
                        <button 
                            className={`premium-radar-compare-toggle ${showRadarCompare ? 'premium-radar-compare-toggle--active' : ''}`}
                            onClick={() => setShowRadarCompare(!showRadarCompare)}
                        >
                            <BarChart3 size={12} /> Compare
                        </button>
                    </div>
                    <div className="premium-radar-container">
                        {dashboard.fitnessMetrics.every(m => m.value === 0) ? (
                            <div className="premium-empty-state">
                                <div className="premium-empty-illustration">
                                    <div className="premium-empty-circle" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))' }} />
                                    <Target size={36} className="premium-empty-icon" />
                                </div>
                                <h4 className="premium-empty-title">Build Your Fitness Profile</h4>
                                <p className="premium-empty-hint">
                                    Complete workouts to see your strengths across different fitness dimensions.
                                </p>
                                <button className="premium-empty-cta" onClick={() => navigate("/member/schedule")}>
                                    <Dumbbell size={14} /> Start Training
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="premium-radar-chart">
                                    <div className="premium-radar-glow" />
                                    <ResponsiveContainer width="100%" height={180}>
                                        <RadarChart data={dashboard.fitnessMetrics}>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                            <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.6)" style={{ fontSize: 10, fontWeight: 600 }} />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={false} />
                                            {showRadarCompare && (
                                                <Radar name="Previous" dataKey="value" data={dashboard.fitnessMetrics.map(m => ({...m, value: Math.max(0, m.value - 15)}))} 
                                                    stroke="rgba(139,92,246,0.3)" fill="rgba(139,92,246,0.1)" strokeDasharray="3 3" />
                                            )}
                                            <Radar name="Current" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} 
                                                strokeWidth={2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="ranked-dimensions">
                                    {[...dashboard.fitnessMetrics]
                                        .sort((a, b) => b.value - a.value)
                                        .slice(0, 4)
                                        .map((metric, idx) => (
                                            <div key={metric.metric} className="dimension-rank-item">
                                                <span className={`dimension-rank-num dimension-rank-num--${idx + 1}`}>{idx + 1}</span>
                                                <div className="dimension-rank-info">
                                                    <div className="dimension-rank-header">
                                                        <span className="dimension-rank-name">{metric.metric}</span>
                                                        <span className="dimension-rank-score">{metric.value}%</span>
                                                    </div>
                                                    <div className="dimension-rank-bar">
                                                        <div className="dimension-rank-bar-fill" style={{ 
                                                            width: `${metric.value}%`,
                                                            background: `linear-gradient(90deg, #8b5cf6, ${metric.value > 70 ? '#34d399' : '#3b82f6'})`
                                                        }} />
                                                    </div>
                                                    <span className={`dimension-rank-insight dimension-rank-insight--${idx === 0 ? 'up' : 'neutral'}`}>
                                                        {idx === 0 ? '⭐ Your strongest area!' : `${metric.metric} at ${metric.value}% capacity`}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                </motion.section>

                {/* ═══════════════════════════════════════════════════════
                   ROW 2: MEMBERSHIP
                   ═══════════════════════════════════════════════════════ */}
                <div className="dash__row-label" style={{ gridColumn: "span 12" }}>
                    <span className="dash__row-label-icon"><Users size={11} /></span>
                    Membership
                </div>

                {/* Membership Donut — 3 col */}
                <motion.section className="dash__card dash__card--span3" custom={2} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--violet" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--violet"><Users size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Membership Status</h3>
                            <p className="dash__card-sub">Plan breakdown</p>
                        </div>
                        <button className="dash__link-btn" onClick={() => navigate("/member/membership")}>
                            Details <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="dash__donut-wrap">
                        <div className="dash__donut-chart">
                            <ResponsiveContainer width="100%" height={156}>
                                <PieChart>
                                    <Pie data={membershipDonut} cx="50%" cy="50%" innerRadius={46} outerRadius={70}
                                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                                        {membershipDonut.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "#111116", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="dash__donut-center">
                                <span className="dash__donut-total">{dashboard.membership?.packageName?.charAt(0) || "—"}</span>
                                <span className="dash__donut-label">PLAN</span>
                            </div>
                        </div>
                        <div className="dash__donut-legend">
                            {membershipDonut.map(item => (
                                <div key={item.name} className="dash__legend-row">
                                    <span className="dash__legend-dot" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                                    <span className="dash__legend-name">{item.name}</span>
                                    <span className="dash__legend-count">{item.value}</span>
                                </div>
                            ))}
                            <div className="dash__donut-footer">
                                {dashboard.membership && (
                                    <>
                                        <div className="dash__donut-metric">
                                            <span className="dash__donut-metric-label">Days Left</span>
                                            <span className="dash__donut-metric-val dash__donut-metric-val--green">{dashboard.membership.daysRemaining}</span>
                                        </div>
                                        <div className="dash__donut-metric">
                                            <span className="dash__donut-metric-label">Price</span>
                                            <span className="dash__donut-metric-val">{formatPrice(dashboard.membership.planPrice)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* My Trainer — 3 col */}
                <motion.section className="dash__card dash__card--span3" custom={3} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--amber" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--amber"><User size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">My Trainer</h3>
                            <p className="dash__card-sub">Assigned coach</p>
                        </div>
                    </div>
                    {dashboard.assignedTrainer ? (
                        <div className="dash__list-scroll">
                            <div className="dash__trainer-row">
                                <div className="dash__trainer-avatar">
                                    <Avatar name={dashboard.assignedTrainer.fullName} avatarId={dashboard.assignedTrainer.avatarId} size="sm" />
                                </div>
                                <div className="dash__trainer-info">
                                    <span className="dash__trainer-name">{dashboard.assignedTrainer.fullName}</span>
                                    <span className="dash__trainer-meta">{dashboard.assignedTrainer.specialization}</span>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                                <div className="dash__equip-stat-box" style={{ borderColor: "#3b82f630", background: "rgba(59,130,246,0.12)" }}>
                                    <span className="dash__equip-stat-val" style={{ color: "#3b82f6" }}>{dashboard.assignedTrainer.sessionsCount}</span>
                                    <span className="dash__equip-stat-lbl">Sessions</span>
                                </div>
                                <div className="dash__equip-stat-box" style={{ borderColor: "#f59e0b30", background: "rgba(245,158,11,0.12)" }}>
                                    <span className="dash__equip-stat-val" style={{ color: "#f59e0b" }}>{dashboard.assignedTrainer.rating}</span>
                                    <span className="dash__equip-stat-lbl">Rating</span>
                                </div>
                            </div>
                            {dashboard.assignedTrainer.nextSession && (
                                <div style={{ margin: "12px 0", fontSize: "12px", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "6px" }}>
                                    <Clock size={12} style={{ marginRight: "6px", display: "inline" }} />
                                    Next: {dashboard.assignedTrainer.nextSession}
                                </div>
                            )}
                            <button className="dash-btn dash-btn--primary" onClick={() => navigate("/member/trainer")} style={{ width: "100%", justifyContent: "center" }}>
                                <MessageSquare size={16} /> Message Trainer
                            </button>
                        </div>
                    ) : (
                        <EmptyState icon={<User size={22} />} label="No personal trainer assigned" hint="A dedicated trainer helps you achieve your fitness goals faster. Visit the front desk or request a trainer assignment through your membership portal to get personalized coaching and workout plans." color="amber" />
                    )}
                </motion.section>

                {/* Upcoming Classes — 3 col */}
                <motion.section className="dash__card dash__card--span3" custom={4} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--cyan" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--cyan"><Calendar size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Upcoming Classes</h3>
                            <p className="dash__card-sub">Next sessions</p>
                        </div>
                        <button className="dash__link-btn" onClick={() => navigate("/member/bookings")}>
                            All <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="dash__list-scroll">
                        {dashboard.upcomingClasses.length > 0 ? (
                            dashboard.upcomingClasses.slice(0, 6).map((cls) => (
                                <div key={cls.id} className="dash__class-row dash__class-row--upcoming">
                                    <div className="dash__class-time">
                                        {cls.time}
                                    </div>
                                    <div className="dash__class-info">
                                        <span className="dash__class-name">{cls.title}</span>
                                        <span className="dash__class-meta">{cls.trainer} · {cls.location}</span>
                                    </div>
                                    <span className="dash__class-badge dash__class-badge--upcoming">
                                        Soon
                                    </span>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={<Calendar size={22} />} label="No upcoming classes booked" hint="Browse the class schedule to find sessions that fit your routine. You can book yoga, HIIT, strength training, and more. Your upcoming classes will appear here with time, location, and trainer details." color="cyan" />
                        )}
                    </div>
                </motion.section>

                {/* Recent Activity — 3 col */}
                <motion.section className="dash__card dash__card--span3" custom={5} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--blue" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--blue"><Clock size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Recent Activity</h3>
                            <p className="dash__card-sub">Latest check-ins &amp; bookings</p>
                        </div>
                    </div>
                    <div className="dash__list-scroll">
                        {dashboard.recentActivity.length > 0 ? (
                            dashboard.recentActivity.slice(0, 7).map((item) => {
                                const Icon = getActivityIcon(item.type)
                                return (
                                    <div key={item.id} className="dash__activity-row">
                                        <div className={`dash__activity-icon dash__activity-icon--${item.type}`}>
                                            <Icon size={12} />
                                        </div>
                                        <div className="dash__activity-info">
                                            <span className="dash__activity-name">{item.name}</span>
                                            <span className="dash__activity-desc">{item.reason}</span>
                                        </div>
                                        <span className="dash__activity-time">{item.date}</span>
                                    </div>
                                )
                            })
                        ) : (
                            <EmptyState icon={<Clock size={22} />} label="No recent activity to show" hint="Your gym check-ins, workout completions, class bookings, and payment history will all appear here. Start by checking in at the gym or completing a workout session." color="blue" />
                        )}
                    </div>
                </motion.section>

                {/* ═══════════════════════════════════════════════════════
                   ROW 3: PROGRESS
                   ═══════════════════════════════════════════════════════ */}
                <div className="dash__row-label" style={{ gridColumn: "span 12" }}>
                    <span className="dash__row-label-icon"><TrendingUp size={11} /></span>
                    Progress
                </div>

                {/* Weight Progress LineChart — 6 col */}
                <motion.section className="dash__card dash__card--span6" custom={6} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--green" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--green"><TrendingUp size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Weight Progress</h3>
                            <p className="dash__card-sub">Tracking vs goal</p>
                        </div>
                    </div>
                    <div className="dash__chart-legend">
                        <span className="dash__chart-legend-item">
                            <span className="dash__chart-legend-dot" style={{ background: "#10b981" }} />
                            Weight
                        </span>
                        <span className="dash__chart-legend-item">
                            <span className="dash__chart-legend-dot" style={{ background: "#f59e0b" }} />
                            Goal
                        </span>
                    </div>
                    <div className="dash__chart-area">
                        {weightChartData.every(d => d.weight === 0 && d.goal === 0) ? (
                            <EmptyState
                                icon={<TrendingUp size={26} />}
                                label="No weight progress recorded"
                                hint="Regular weight tracking helps you visualize your fitness journey over time. Log your weight weekly to see trends, compare against your goals, and stay motivated with visual progress charts."
                                color="green"
                            />
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={weightChartData} margin={{ top: 8, right: 12, left: -10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 500 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} width={42} />
                                    <Tooltip
                                        contentStyle={{ background: "#0d0d12", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12 }}
                                        labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4, fontSize: 11 }}
                                    />
                                    <Line type="monotone" dataKey="weight" name="Weight" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                                    <Line type="monotone" dataKey="goal" name="Goal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.section>

                {/* Achievements — 3 col */}
                <motion.section className="dash__card dash__card--span3" custom={7} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--amber" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--amber"><Award size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Achievements</h3>
                            <p className="dash__card-sub">Badges earned</p>
                        </div>
                    </div>
                    <div className="dash__list-scroll">
                        {dashboard.achievements.length > 0 ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                                {dashboard.achievements.map((a, idx) => {
                                    const Icon = getIconComponent(a.icon)
                                    return (
                                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", gap: "6px" }}>
                                            <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${a.color}20`, color: a.color }}>
                                                <Icon size={20} />
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
                                                {a.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <EmptyState icon={<Award size={22} />} label="No achievements unlocked yet" hint="Stay consistent with your workouts to earn achievement badges. Complete your first workout, maintain a streak, attend classes regularly, and hit your fitness goals to collect trophies and track your milestones." color="amber" />
                        )}
                    </div>
                </motion.section>

                {/* Attendance Summary — 3 col */}
                <motion.section className="dash__card dash__card--span3" custom={8} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--blue" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--blue"><BarChart3 size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Attendance</h3>
                            <p className="dash__card-sub">Weekly check-ins</p>
                        </div>
                        <div className="dash__highlight-pill">
                            <Activity size={11} />
                            <span>{dashboard.workoutsThisMonth} this month</span>
                        </div>
                    </div>
                    <div className="dash__chart-area dash__chart-area--sm">
                        <ResponsiveContainer width="100%" height={110}>
                            <BarChart data={activityChartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="memberBarGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "#0d0d12", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                                <Bar dataKey="workouts" fill="url(#memberBarGrad)" radius={[5, 5, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.section>

                {/* ═══════════════════════════════════════════════════════
                   ROW 4: QUICK ACCESS
                   ═══════════════════════════════════════════════════════ */}
                <div className="dash__row-label" style={{ gridColumn: "span 12" }}>
                    <span className="dash__row-label-icon"><Zap size={11} /></span>
                    Quick Access
                </div>

                {/* Quick Actions — 4 col */}
                <motion.section className="dash__card dash__card--span4" custom={9} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--rose"><Zap size={15} /></div>
                        <div><h3 className="dash__card-title">Quick Actions</h3><p className="dash__card-sub">Shortcuts to key pages</p></div>
                    </div>
                    <div className="dash__action-grid">
                        {([
                            { icon: <Calendar size={18} />, label: "Book Class", path: "/member/classes", color: "blue" },
                            { icon: <Activity size={18} />, label: "My Progress", path: "/member/progress", color: "emerald" },
                            { icon: <MessageSquare size={18} />, label: "Chat Trainer", path: "/member/trainer", color: "violet" },
                            { icon: <Bell size={18} />, label: "Notifications", path: "/member/notifications", color: "amber" },
                            { icon: <Trophy size={18} />, label: "Achievements", path: "/member/achievements", color: "cyan" },
                            { icon: <CreditCard size={18} />, label: "Payments", path: "/member/payments", color: "rose" },
                        ] as any[]).map((a, i) => (
                            <button key={i} className={`dash__action-btn dash__action-btn--${a.color}`} onClick={() => navigate(a.path)}>
                                <span className="dash__action-icon">{a.icon}</span>
                                <span className="dash__action-label">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Bookings — 4 col */}
                <motion.section className="dash__card dash__card--span4" custom={10} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--cyan" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--cyan"><Calendar size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">My Bookings</h3>
                            <p className="dash__card-sub">Upcoming &amp; past</p>
                        </div>
                        <button className="dash__link-btn" onClick={() => navigate("/member/bookings")}>
                            View all <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="dash__list-scroll">
                        {dashboard.upcomingClasses.length > 0 ? (
                            dashboard.upcomingClasses.slice(0, 5).map((cls) => (
                                <div key={`booking-${cls.id}`} className="dash__class-row dash__class-row--upcoming">
                                    <div className="dash__class-time">{cls.time}</div>
                                    <div className="dash__class-info">
                                        <span className="dash__class-name">{cls.title}</span>
                                        <span className="dash__class-meta">{cls.type} · {cls.location}</span>
                                    </div>
                                    <span className="dash__class-badge dash__class-badge--upcoming">
                                        {cls.enrolled}/{cls.capacity}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={<Calendar size={22} />} label="No class bookings found" hint="Explore the class schedule to find group sessions, personal training, and specialty classes. Book in advance to reserve your spot. Your upcoming and past bookings will be listed here with all details." color="cyan" />
                        )}
                    </div>
                </motion.section>

                {/* Attendance Summary — 4 col */}
                <motion.section className="dash__card dash__card--span4" custom={11} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--green" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--green"><CheckCircle2 size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Attendance Summary</h3>
                            <p className="dash__card-sub">Monthly overview</p>
                        </div>
                    </div>
                    <div className="dash__equip-status-grid">
                        {[
                            { label: "Workouts", value: dashboard.workoutsThisMonth, icon: <Dumbbell size={16} />, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
                            { label: "Streak", value: `${dashboard.streakDays}d`, icon: <Flame size={16} />, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
                            { label: "Minutes", value: dashboard.minutesActive, icon: <Clock size={16} />, color: "#10b981", bg: "rgba(16,185,129,0.12)" },
                            { label: "Points", value: dashboard.totalPoints, icon: <Star size={16} />, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
                        ].map((s, i) => (
                            <div key={i} className="dash__equip-stat-box" style={{ borderColor: s.color + "30", background: s.bg }}>
                                <span className="dash__equip-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                                <span className="dash__equip-stat-val" style={{ color: s.color }}>{s.value}</span>
                                <span className="dash__equip-stat-lbl">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.section>

            </div>
        </div>
    )
}

export default MemberDashboard
