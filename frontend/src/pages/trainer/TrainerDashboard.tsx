import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, Calendar, MessageSquare, TrendingUp, ChevronRight,
    CheckCircle, IndianRupee, Star, Dumbbell, FileText, AlertCircle, 
    Clock, Flame, Target, Trophy, Activity, BarChart3, Zap,
    MapPin, ArrowRight, CheckCircle2, RefreshCw
} from 'lucide-react';
import { format, differenceInMinutes, isToday } from 'date-fns';
import { 
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Avatar } from '../../components/shared/UnifiedComponents';
import { getAvatarUrl } from '../../components/ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useCurrency } from "../../contexts/CurrencyContext";
import { 
    SkeletonKPIGrid, SkeletonChart, SkeletonCard, 
    SkeletonPageHeader, SkeletonListItem, SkeletonActivityFeed
} from "../../components/ui/Skeleton";

// Import unified dashboard CSS
import '../../styles/dashboard/dashboard-core.css';
import '../../styles/dashboard/dashboard-trainers.css';

interface Session {
    id: string;
    title: string;
    type: 'class' | 'pt' | 'group';
    startTime: Date;
    endTime: Date;
    room: string;
    enrolled: number;
    capacity: number;
    status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
    memberName?: string;
}

interface DashboardAlert {
    id: string;
    type: 'MISSED_SESSION' | 'PENDING_NOTE' | 'UNREAD_MESSAGE';
    message: string;
    memberName: string;
    memberId: number;
    severity: 'high' | 'medium' | 'low';
    time: string;
}

interface ChartData {
    label: string;
    value: number;
    meta?: string;
}

interface DashboardData {
    trainerName: string;
    todayEarnings: number;
    monthEarnings: number;
    completedToday: number;
    totalToday: number;
    attendanceRate: number;
    activeMembers: number;
    totalMembers: number;
    sessions: Session[];
    alerts: DashboardAlert[];
    weeklyActivity: ChartData[];
    monthlyEarningsHistory: ChartData[];
    sessionDistribution: ChartData[];
}

const COLORS = {
    primary: '#DC2626',
    blue: '#3B82F6',
    green: '#10B981',
    violet: '#8B5CF6',
    amber: '#F59E0B',
    rose: '#F43F5E',
    cyan: '#06B6D4',
};

const CARD_VARIANTS = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }
    })
};

const TrainerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { formatPrice } = useCurrency();
    const [data, setData] = useState<DashboardData | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getMockData = useCallback((): DashboardData => ({
          trainerName: user?.fullName || 'John Smith',
          todayEarnings: 150,
          monthEarnings: 2500,
          completedToday: 3,
          totalToday: 4,
          attendanceRate: 85,
          activeMembers: 12,
          totalMembers: 15,
          sessions: [
              {
                  id: '1',
                  title: 'Emma Wilson - Strength Training',
                  type: 'pt',
                  startTime: new Date(new Date().setHours(9, 0)),
                  endTime: new Date(new Date().setHours(10, 0)),
                  room: 'Studio A',
                  enrolled: 1,
                  capacity: 1,
                  status: 'completed',
                  memberName: 'Emma Wilson'
              },
              {
                  id: '2',
                  title: 'Sarah Johnson - Cardio Session',
                  type: 'pt',
                  startTime: new Date(new Date().setHours(11, 0)),
                  endTime: new Date(new Date().setHours(12, 0)),
                  room: 'Studio B',
                  enrolled: 1,
                  capacity: 1,
                  status: 'completed',
                  memberName: 'Sarah Johnson'
              },
              {
                  id: '3',
                  title: 'Mike Davis - Boxing Class',
                  type: 'class',
                  startTime: new Date(new Date().setHours(14, 0)),
                  endTime: new Date(new Date().setHours(15, 0)),
                  room: 'Boxing Ring',
                  enrolled: 8,
                  capacity: 12,
                  status: 'completed',
                  memberName: 'Mike Davis'
              },
              {
                  id: '4',
                  title: 'Evening Yoga Class',
                  type: 'class',
                  startTime: new Date(new Date().setHours(18, 0)),
                  endTime: new Date(new Date().setHours(19, 30)),
                  room: 'Yoga Studio',
                  enrolled: 15,
                  capacity: 20,
                  status: 'upcoming'
              }
          ],
          alerts: [
              {
                  id: 'alert-1',
                  type: 'PENDING_NOTE',
                  message: 'Progress note missing',
                  memberName: 'Emma Wilson',
                  memberId: 1,
                  severity: 'medium',
                  time: '2 hours ago'
              },
              {
                  id: 'alert-2',
                  type: 'MISSED_SESSION',
                  message: 'Session missed',
                  memberName: 'John Doe',
                  memberId: 2,
                  severity: 'high',
                  time: '1 day ago'
              }
          ],
          weeklyActivity: [
              { label: 'Mon', value: 5, meta: COLORS.blue },
              { label: 'Tue', value: 6, meta: COLORS.blue },
              { label: 'Wed', value: 4, meta: COLORS.blue },
              { label: 'Thu', value: 7, meta: COLORS.blue },
              { label: 'Fri', value: 8, meta: COLORS.blue },
              { label: 'Sat', value: 5, meta: COLORS.blue },
              { label: 'Sun', value: 2, meta: COLORS.blue }
          ],
          monthlyEarningsHistory: [
              { label: 'Oct', value: 2000 },
              { label: 'Nov', value: 2500 },
              { label: 'Dec', value: 2200 },
              { label: 'Jan', value: 2800 },
              { label: 'Feb', value: 2500 },
              { label: 'Mar', value: 2500 }
          ],
            sessionDistribution: [
                { label: 'PT Sessions', value: 35, meta: COLORS.blue },
                { label: 'Classes', value: 15, meta: COLORS.violet }
            ]
        }), [user]);

    const fetchDashboard = useCallback(async () => {
        try {
            setRefreshing(true);
            setError(null);
            const response = await api.getTrainerDashboard();
            const apiData = response.data || response;

            if (apiData) {
                const transformedSessions = (apiData.sessions || []).map((s: any) => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: s.endTime ? new Date(s.endTime) : null,
                    status: s.status ? s.status.toLowerCase() : 'upcoming'
                }));

                setData({
                    ...apiData,
                    sessions: transformedSessions,
                    alerts: apiData.alerts || [],
                    weeklyActivity: apiData.weeklyActivity || [],
                    monthlyEarningsHistory: apiData.monthlyEarningsHistory || [],
                    sessionDistribution: apiData.sessionDistribution || []
                });
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            setError("Failed to load dashboard — retrying...");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, getMockData]);

    useEffect(() => {
        fetchDashboard();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [fetchDashboard]);

    const upcomingSessions = useMemo(() => 
        data?.sessions.filter(s => s.status === 'upcoming' || s.status === 'in-progress').slice(0, 5) || [],
        [data?.sessions]
    );

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const greeting = useMemo(() => {
        const h = currentTime.getHours();
        if (h < 12) return { text: "Good Morning", emoji: "☀️" };
        if (h < 17) return { text: "Good Afternoon", emoji: "⚡" };
        return { text: "Good Evening", emoji: "🌙" };
    }, [currentTime]);

    const dateStr = useMemo(() =>
        currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }), [currentTime]);

    const trainerFirstName = (user?.fullName || data?.trainerName || 'Trainer').split(' ')[0] || 'Trainer';

    // NEXT SESSION LOGIC
    const nextSession = useMemo(() => {
        if (!data?.sessions) return null;
        // Only upcoming sessions starting after now
        const now = new Date();
        return data.sessions
            .filter(s => s.status === 'upcoming' && s.startTime > now)
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0] || null;
    }, [data?.sessions]);

    const timeUntilNext = useMemo(() => {
        if (!nextSession) return null;
        const diff = differenceInMinutes(nextSession.startTime, currentTime);
        if (diff <= 0) return "Starting now";
        if (diff < 60) return `${diff}m`;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return `${h}h ${m}m`;
    }, [nextSession, currentTime]);

    // Loading skeleton
    if (loading && !data) {
        return (
            <div className="dash dash--trainer" role="main" aria-busy="true" aria-label="Loading dashboard">
                <SkeletonPageHeader />
                
                {/* KPI Strip */}
                <div className="dash__header" style={{ marginTop: '16px' }}>
                    <SkeletonKPIGrid count={4} />
                </div>

                <div className="dash__grid">
                    {/* Performance Section */}
                    <div className="dash__row-label" style={{ gridColumn: 'span 12' }}>
                        <span className="dash__row-label-icon"><TrendingUp size={11} /></span>
                        Performance &amp; Activity
                    </div>
                    
                    <div style={{ gridColumn: 'span 8' }}>
                        <SkeletonChart type="area" height={220} />
                    </div>
                    
                    <div style={{ gridColumn: 'span 4' }}>
                        <SkeletonChart type="pie" height={220} />
                    </div>

                    {/* Schedule Section */}
                    <div className="dash__row-label" style={{ gridColumn: 'span 12', marginTop: '16px' }}>
                        <span className="dash__row-label-icon"><Calendar size={11} /></span>
                        Today's Schedule &amp; Client Tasks
                    </div>
                    
                    <div style={{ gridColumn: 'span 8' }}>
                        <SkeletonCard hasImage={false} lines={5} />
                        <div style={{ marginTop: '12px' }}>
                            <SkeletonActivityFeed count={4} />
                        </div>
                    </div>
                    
                    <div style={{ gridColumn: 'span 4' }}>
                        <SkeletonCard hasImage={false} lines={4} />
                    </div>

                    {/* Financials Section */}
                    <div className="dash__row-label" style={{ gridColumn: 'span 12', marginTop: '16px' }}>
                        <span className="dash__row-label-icon"><IndianRupee size={11} /></span>
                        Financials &amp; Operations
                    </div>
                    
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ gridColumn: 'span 4' }}>
                            <SkeletonCard hasImage={false} lines={3} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="dash dash--trainer">
            {/* ══ HEADER ══ */}
            <header className="dash__header">
                <div className="dash__header-greet">
                    <div className="dash__header-avatar">
                        <Avatar 
                            name={user?.fullName || 'Trainer'} 
                            src={getAvatarUrl(user?.avatarId) || undefined}
                            size="md"
                        />
                        <span className="dash__greeting-emoji-abs">{greeting.emoji}</span>
                    </div>
                    <div>
                        <h1 className="dash__greeting">{greeting.text}, <span className="dash__greeting-name">{trainerFirstName}</span></h1>
                        <p className="dash__date">{dateStr}</p>
                    </div>
                </div>

                {/* KPI chips */}
                <div className="dash__kpi-row">
                    {data && ([
                        {
                            icon: <IndianRupee size={13} />, label: "Earnings",
                            value: formatPrice(data.todayEarnings),
                            color: "emerald",
                        },
                        {
                            icon: <Dumbbell size={13} />, label: "Sessions",
                            value: `${data.completedToday}/${data.totalToday}`,
                            color: "blue",
                        },
                        {
                            icon: <Users size={13} />, label: "Active Clients",
                            value: String(data.activeMembers),
                            color: "violet",
                        },
                        {
                            icon: <Star size={13} />, label: "Rating",
                            value: "4.9",
                            color: "amber", alert: false,
                        },
                    ] as any[]).map((kpi, i) => (
                        <KPICard key={i} index={i} {...kpi} />
                    ))}
                </div>

                {/* New Header Center Widgets */}
                <div className="dash-header-widgets">
                    {nextSession && (
                        <div className="dash-header-next" onClick={() => navigate(`/trainer/session/${nextSession.id}`)}>
                            <div className="dash-header-next__label">NEXT SESSION</div>
                            <div className="dash-header-next__info">
                                <span className="dash-header-next__name">
                                    {nextSession.memberName || nextSession.title.split(' - ')[0]}
                                </span>
                                <span className="dash-header-next__time">
                                    {timeUntilNext === "Starting now" ? (
                                        <span className="dash-header-next__live">
                                            <span className="dash-header-next__live-dot" />
                                            NOW
                                        </span>
                                    ) : (
                                        <>
                                            <Clock size={10} style={{ marginRight: 2 }} />
                                            {timeUntilNext ? `in ${timeUntilNext}` : format(nextSession.startTime, 'HH:mm')}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {data && (
                        <div className="dash-header-progress">
                            <div className="dash-header-progress__label">
                                <span>DAILY GOAL</span>
                                <span>{Math.round((data.completedToday / Math.max(1, data.totalToday)) * 100)}%</span>
                            </div>
                            <div className="dash-header-progress__bar-wrap">
                                <div 
                                    className="dash-header-progress__bar" 
                                    style={{ width: `${Math.min(100, (data.completedToday / Math.max(1, data.totalToday)) * 100)}%` }} 
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="dash__header-right">
                    {error && (
                        <div className="dash__inline-error">
                            <AlertCircle size={12} />
                            <span>Error</span>
                            <button onClick={fetchDashboard}>Retry</button>
                        </div>
                    )}
                    <button
                        className={`dash__refresh-btn ${refreshing ? "spin" : ""}`}
                        onClick={fetchDashboard} disabled={refreshing}
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

            {/* ══ MAIN GRID ══ */}
            <div className="dash__grid">

                {/* ══ ROW LABEL: PERFORMANCE ══ */}
                <div className="dash__row-label">
                    <span className="dash__row-label-icon"><TrendingUp size={11} /></span>
                    Performance &amp; Activity
                </div>

                {/* Weekly Performance — 8 col */}
                <motion.section className="dash__card dash__card--revenue dash__card--span8" custom={0} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--blue" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--blue"><Activity size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Weekly Performance</h3>
                            <p className="dash__card-sub">Session activity trends</p>
                        </div>
                        <div className="dash__highlight-pill">
                            <Activity size={11} />
                            <span>Active</span>
                        </div>
                    </div>
                    <div className="dash__chart-area">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={data?.weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.28}/>
                                        <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.02}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--t3)", fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--t3)", fontSize: 10 }} />
                                <Tooltip 
                                    contentStyle={{ background: "var(--s1)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 12, color: "var(--text)" }}
                                    itemStyle={{ color: "var(--text)" }}
                                    cursor={{ stroke: COLORS.blue, strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="value" stroke={COLORS.blue} strokeWidth={2.5} fill="url(#colorActivity)" dot={false} activeDot={{ r: 5, fill: COLORS.blue, stroke: "#fff", strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.section>

                {/* Session Distribution — 4 col */}
                <motion.section className="dash__card dash__card--breakdown dash__card--span4" custom={1} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--violet" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--violet"><Target size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Session Types</h3>
                            <p className="dash__card-sub">PT vs Classes distribution</p>
                        </div>
                    </div>
                    <div className="dash__donut-wrap">
                        <div className="dash__donut-chart">
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie 
                                        data={data?.sessionDistribution} 
                                        cx="50%" cy="50%" 
                                        innerRadius={40} outerRadius={60} 
                                        paddingAngle={5} dataKey="value" stroke="none"
                                    >
                                        {data?.sessionDistribution.map((e, i) => <Cell key={i} fill={[COLORS.blue, COLORS.violet, COLORS.amber][i % 3]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "var(--s1)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 12, color: "var(--text)" }} itemStyle={{ color: "var(--text)" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="dash__donut-center">
                                <span className="dash__donut-total">{data?.sessionDistribution.reduce((a, b) => a + b.value, 0)}</span>
                                <span className="dash__donut-label">TOTAL</span>
                            </div>
                        </div>
                        <div className="dash__donut-legend">
                            {data?.sessionDistribution.map((item, i) => (
                                <div key={i} className="dash__legend-row">
                                    <span className="dash__legend-dot" style={{ background: [COLORS.blue, COLORS.violet, COLORS.amber][i % 3] }} />
                                    <span className="dash__legend-name">{item.label}</span>
                                    <span className="dash__legend-count">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* ══ ROW LABEL: DAILY SCHEDULE ══ */}
                <div className="dash__row-label">
                    <span className="dash__row-label-icon"><Calendar size={11} /></span>
                    Today's Schedule &amp; Client Tasks
                </div>

                {/* Today's Schedule — 8 col */}
                <motion.section className="dash__card dash__card--schedule dash__card--span8" custom={2} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--emerald" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--emerald"><Calendar size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Today's Schedule</h3>
                            <p className="dash__card-sub">{data?.sessions.filter(s => isToday(s.startTime)).length} sessions scheduled today</p>
                        </div>
                        <button className="dash__link-btn" onClick={() => navigate("/trainer/schedule")}>
                            Full Schedule <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="dash__list-scroll">
                        {upcomingSessions.length > 0 ? (
                            upcomingSessions.map((session, idx) => (
                                <div key={idx} className={`dash-trainer__session dash-trainer__session--${session.status}`} onClick={() => navigate(`/trainer/session/${session.id}`)}>
                                    <div className="dash-trainer__session__time">
                                        <span className="dash-trainer__session__time-start">{format(session.startTime, 'HH:mm')}</span>
                                        <span className="dash-trainer__session__time-end">{session.endTime ? format(session.endTime, 'HH:mm') : '--:--'}</span>
                                    </div>
                                    <div className="dash-trainer__session__client">
                                        <div className="dash-trainer__session__avatar" style={{ background: session.type === 'pt' ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})` : `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.indigo})` }}>
                                            {session.memberName ? getInitials(session.memberName) : session.title.charAt(0)}
                                        </div>
                                        <div className="dash-trainer__session__info">
                                            <span className="dash-trainer__session__name">{session.title}</span>
                                            <span className="dash-trainer__session__type"><MapPin size={10} style={{ marginRight: 4 }} /> {session.room} • {session.enrolled}/{session.capacity} enrolled</span>
                                        </div>
                                    </div>
                                    <div className="dash-trainer__session__status">
                                        <span className={`dash-badge dash-badge--${session.status === 'completed' ? 'success' : session.status === 'in-progress' ? 'live' : 'neutral'}`}>
                                            {session.status === 'in-progress' ? <><span className="dash-badge--live-dot" /> LIVE</> : session.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={<CheckCircle size={22} />} label="No upcoming sessions" hint="Relax, your schedule is clear for now" color="emerald" />
                        )}
                    </div>
                </motion.section>

                {/* Needs Attention — 4 col */}
                <motion.section className="dash__card dash__card--activity dash__card--span4" custom={3} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--rose" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--rose"><AlertCircle size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Needs Attention</h3>
                            <p className="dash__card-sub">Alerts &amp; notifications</p>
                        </div>
                        {data && data.alerts.length > 0 && <span className="dash__count-badge dash__count-badge--rose">{data.alerts.length}</span>}
                    </div>
                    <div className="dash__list-scroll">
                        {data && data.alerts.length > 0 ? (
                            data.alerts.map((alert, idx) => (
                                <div key={idx} className="dash-trainer__client-row" onClick={() => navigate(alert.type === 'PENDING_NOTE' ? '/trainer/progress-notes' : '/trainer/schedule')}>
                                    <div className="dash-trainer__client__avatar" style={{ background: alert.severity === 'high' ? `linear-gradient(135deg, ${COLORS.rose}, ${COLORS.primary})` : `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.blue})` }}>
                                        {getInitials(alert.memberName)}
                                    </div>
                                    <div className="dash-trainer__client__info">
                                        <span className="dash-trainer__client__name">{alert.memberName}</span>
                                        <span className="dash-trainer__client__meta">{alert.message}</span>
                                    </div>
                                    <ChevronRight size={14} style={{ color: 'var(--t3)' }} />
                                </div>
                            ))
                        ) : (
                            <EmptyState icon={<CheckCircle2 size={22} />} label="All caught up!" hint="No pending alerts for today" color="rose" />
                        )}
                    </div>
                </motion.section>

                {/* ══ ROW LABEL: FINANCIALS & OPERATIONS ══ */}
                <div className="dash__row-label">
                    <span className="dash__row-label-icon"><IndianRupee size={11} /></span>
                    Financials &amp; Operations
                </div>

                {/* Monthly Earnings — 4 col */}
                <motion.section className="dash__card dash__card--schedule dash__card--span4" custom={4} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--emerald" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--emerald"><IndianRupee size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">Monthly Earnings</h3>
                            <p className="dash__card-sub">History for the last 6 months</p>
                        </div>
                    </div>
                    <div className="dash__chart-area dash__chart-area--sm">
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={data?.monthlyEarningsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--t3)", fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--t3)", fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "var(--s1)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 12, color: "var(--text)" }} itemStyle={{ color: "var(--text)" }} />
                                <Bar dataKey="value" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.section>

                {/* Quick Actions — 4 col */}
                <motion.section className="dash__card dash__card--actions dash__card--span4" custom={5} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--rose"><Zap size={15} /></div>
                        <div><h3 className="dash__card-title">Quick Actions</h3><p className="dash__card-sub">Shortcuts to key tasks</p></div>
                    </div>
                    <div className="dash-trainer__actions">
                        {[
                            { icon: <Calendar size={18} />, label: 'Schedule', path: '/trainer/schedule' },
                            { icon: <Users size={18} />, label: 'Clients', path: '/trainer/members' },
                            { icon: <MessageSquare size={18} />, label: 'Messages', path: '/trainer/messages' },
                            { icon: <FileText size={18} />, label: 'Notes', path: '/trainer/progress-notes' }
                        ].map((action, idx) => (
                            <button key={idx} className="dash-trainer__action-btn" onClick={() => navigate(action.path)}>
                                <div className="dash-trainer__action-btn__icon">{action.icon}</div>
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Performance Metrics — 4 col */}
                <motion.section className="dash__card dash__card--top-trainers dash__card--span4" custom={6} variants={CARD_VARIANTS} initial="hidden" animate="visible">
                    <div className="dash__card-glow dash__card-glow--amber" />
                    <div className="dash__card-head">
                        <div className="dash__card-icon dash__card-icon--amber"><BarChart3 size={15} /></div>
                        <div>
                            <h3 className="dash__card-title">This Month</h3>
                            <p className="dash__card-sub">Performance summary</p>
                        </div>
                    </div>
                    <div className="dash-trainer__performance">
                        <div className="dash-trainer__performance__metric">
                            <span className="dash-trainer__performance__label"><Target size={14} /> Total Sessions</span>
                            <span className="dash-trainer__performance__value">{data ? data.totalToday * 22 : 0}</span>
                        </div>
                        <div className="dash-trainer__performance__metric">
                            <span className="dash-trainer__performance__label"><Flame size={14} /> Attendance Rate</span>
                            <span className="dash-trainer__performance__value">{data?.attendanceRate ?? 0}%</span>
                        </div>
                        <div className="dash-trainer__performance__metric">
                            <span className="dash-trainer__performance__label"><Trophy size={14} /> Client Satisfaction</span>
                            <div className="dash-trainer__rating">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={14} className={i <= 4 ? 'dash-trainer__rating__star' : 'dash-trainer__rating__star--empty'} fill={i <= 4 ? 'currentColor' : 'none'} />
                                ))}
                            </div>
                        </div>
                        <div className="dash-trainer__performance__metric">
                            <span className="dash-trainer__performance__label"><IndianRupee size={14} /> Monthly Revenue</span>
                            <span className="dash-trainer__performance__value">{data ? formatCurrency(data.monthEarnings) : '₹0'}</span>
                        </div>
                    </div>
                </motion.section>

            </div>
        </div>
    );
};

/* ════════ KPI CARD ════════ */
interface KPICardProps {
  icon: React.ReactNode; label: string; value: string
  sub?: string; color: string; alert?: boolean
  index: number
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, sub, color, alert: isAlert, index }) => {
  return (
    <motion.div
      className={`dash__kpi dash__kpi--${color} ${isAlert ? "dash__kpi--alert" : ""}`}
      custom={index} variants={CARD_VARIANTS} initial="hidden" animate="visible"
    >
      <div className="dash__kpi-icon">{icon}</div>
      <div className="dash__kpi-body">
        <span className="dash__kpi-value">{value}</span>
      </div>
    </motion.div>
  )
}

/* ════════ EMPTY STATE ════════ */
interface EmptyStateProps {
  icon: React.ReactNode; label: string; hint: string; color: string; compact?: boolean
}
const EmptyState: React.FC<EmptyStateProps> = ({ icon, label, hint, color, compact }) => (
  <div className={`dash__empty ${compact ? "dash__empty--compact" : ""}`}>
    <div className={`dash__empty-icon-wrap dash__empty-icon-wrap--${color === 'emerald' ? 'green' : color}`}>{icon}</div>
    <span className="dash__empty-label">{label}</span>
    <span className="dash__empty-hint">{hint}</span>
  </div>
)

export default TrainerDashboard;
