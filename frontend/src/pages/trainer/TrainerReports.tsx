import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    TrendingUp, TrendingDown, Users, Calendar, Clock, Download, ChevronDown,
    BarChart3, PieChart, Activity, Award, Target, RefreshCw,
    IndianRupee, Heart, Zap, Star, ArrowUpRight, ArrowDownRight,
    Info, Eye, FileText,
    CheckCircle, XCircle, AlertCircle, Flame, Trophy, Medal, Crown, Loader2,
    type LucideIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './TrainerReports.css';
import { trainerReportsApi } from '../../services/trainerReportsApi';
import type {
    ReportOverview,
    WeeklyActivity,
    SessionTypesData,
    PerformanceMetrics,
    Achievement,
    SessionReport,
    MemberProgress,
    Earnings
} from '../../services/trainerReportsApi';

// Icon mapping for dynamic icons from backend
const iconMap: Record<string, LucideIcon> = {
    Trophy, Star, Flame, Medal, Crown, CheckCircle, Target, Clock, Heart, Zap
};

const TrainerReports: React.FC = () => {
    const [period, setPeriod] = useState('This Month');
    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'members' | 'earnings'>('overview');
    const [sessionFilter, setSessionFilter] = useState<'all' | 'completed' | 'cancelled' | 'no-show'>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const reportRef = useRef<HTMLDivElement>(null);

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Data states
    const [overview, setOverview] = useState<ReportOverview | null>(null);
    const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity | null>(null);
    const [sessionTypes, setSessionTypes] = useState<SessionTypesData | null>(null);
    const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [sessions, setSessions] = useState<SessionReport[]>([]);
    const [membersProgress, setMembersProgress] = useState<MemberProgress[]>([]);
    const [earnings, setEarnings] = useState<Earnings | null>(null);

    // Fetch data based on active tab
    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        // When period is 'Custom' pass explicit date bounds
        const isCustom = period === 'Custom';
        const sd = isCustom ? customStartDate : undefined;
        const ed = isCustom ? customEndDate : undefined;

        try {
            if (activeTab === 'overview') {
                const [overviewData, weeklyData, typesData, perfData, achieveData] = await Promise.all([
                    trainerReportsApi.getOverview(period, sd, ed),
                    trainerReportsApi.getWeeklyActivity(period, sd, ed),
                    trainerReportsApi.getSessionTypes(period, sd, ed),
                    trainerReportsApi.getPerformance(period, sd, ed),
                    trainerReportsApi.getAchievements()
                ]);
                setOverview(overviewData);
                setWeeklyActivity(weeklyData);
                setSessionTypes(typesData);
                setPerformance(perfData);
                setAchievements(achieveData);
            } else if (activeTab === 'sessions') {
                const sessionsData = await trainerReportsApi.getSessions({
                    period,
                    status: sessionFilter,
                    size: 50,
                    startDate: sd,
                    endDate: ed,
                });
                setSessions(sessionsData.items);
            } else if (activeTab === 'members') {
                const membersData = await trainerReportsApi.getMembersProgress();
                setMembersProgress(membersData);
            } else if (activeTab === 'earnings') {
                const earningsData = await trainerReportsApi.getEarnings(period, sd, ed);
                setEarnings(earningsData);
            }
        } catch (err: any) {
            console.error('Failed to fetch report data:', err);
            setError(err.message || 'Failed to load report data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, period, sessionFilter, customStartDate, customEndDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData(true);
    };

    const handleExport = async (type: 'sessions' | 'earnings') => {
        const isCustom = period === 'Custom';
        const sd = isCustom ? customStartDate : undefined;
        const ed = isCustom ? customEndDate : undefined;
        try {
            const blob = await trainerReportsApi.exportCSV(type, period, sd, ed);
            trainerReportsApi.downloadCSV(blob, `${type}_report_${period.replace(' ', '_').toLowerCase()}.csv`);
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const handleExportPDF = async () => {
        if (!reportRef.current) return;
        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`trainer_report_${period.replace(' ', '_').toLowerCase()}.pdf`);
        } catch (err) {
            console.error('Client-side PDF export failed:', err);
            alert('Failed to generate PDF report on the client.');
        }
    };

    // Build stats from real data
    const stats = useMemo(() => {
        if (!overview) return [];
        return [
            {
                label: 'Total Sessions',
                value: String(overview.totalSessions),
                change: overview.totalSessionsChange,
                changeType: overview.totalSessionsChangeType,
                icon: Calendar,
                color: '#8B5CF6',
                subtext: 'vs last period'
            },
            {
                label: 'Active Members',
                value: String(overview.activeMembers),
                change: overview.activeMembersChange,
                changeType: 'positive' as const,
                icon: Users,
                color: '#3B82F6',
                subtext: overview.activeMembersSubtext
            },
            {
                label: 'Avg. Attendance',
                value: `${overview.avgAttendance}%`,
                change: overview.avgAttendanceChange,
                changeType: overview.avgAttendanceChangeType,
                icon: Activity,
                color: '#10B981',
                subtext: 'Industry avg: 78%'
            },
            {
                label: 'Client Rating',
                value: overview.clientRating > 0 ? String(overview.clientRating) : 'N/A',
                change: overview.reviewCount > 0 ? `${overview.reviewCount} reviews` : 'No reviews',
                changeType: 'neutral' as const,
                icon: Star,
                color: '#F59E0B',
                subtext: overview.clientRatingSubtext
            },
        ];
    }, [overview]);

    // Performance data from API
    const performanceData = useMemo(() => {
        if (!performance) return [];
        return performance.metrics.map(m => ({
            label: m.label,
            value: m.value,
            max: m.max,
            percent: m.percent,
            icon: iconMap[m.icon] || CheckCircle,
            color: m.color,
            confidence: m.confidence,
            confidenceNote: m.confidenceNote
        }));
    }, [performance]);

    // Weekly session data from API
    const weeklySessionData = useMemo(() => {
        if (!weeklyActivity) return [];
        return weeklyActivity.days;
    }, [weeklyActivity]);

    // Session type breakdown from API
    const sessionTypeBreakdown = useMemo(() => {
        if (!sessionTypes) return [];
        return sessionTypes.types;
    }, [sessionTypes]);

    // Compute max for chart scaling
    const maxSessions = useMemo(() => {
        if (!weeklySessionData.length) return 10;
        return Math.max(...weeklySessionData.map(d => Math.max(d.sessions, d.target)));
    }, [weeklySessionData]);

    // Session stats
    const sessionStats = useMemo(() => ({
        total: sessions.length,
        completed: sessions.filter(s => s.status === 'completed').length,
        cancelled: sessions.filter(s => s.status === 'cancelled').length,
        noShow: sessions.filter(s => s.status === 'no-show').length,
        rescheduled: sessions.filter(s => s.status === 'rescheduled').length,
    }), [sessions]);

    // Earnings data
    const earningsData = useMemo(() => {
        if (!earnings) return [];
        return earnings.breakdown;
    }, [earnings]);

    const totalEarnings = earnings?.totalEarnings || 0;

    const getStatusBadge = (status: SessionReport['status']) => {
        const badges = {
            completed: { icon: CheckCircle, label: 'Completed', class: 'completed' },
            cancelled: { icon: XCircle, label: 'Cancelled', class: 'cancelled' },
            'no-show': { icon: AlertCircle, label: 'No Show', class: 'no-show' },
            rescheduled: { icon: RefreshCw, label: 'Rescheduled', class: 'rescheduled' },
        };
        return badges[status] || badges.completed;
    };

    // Loading state
    if (loading && !refreshing) {
        return (
            <div className="trainer-reports">
                <div className="trainer-reports__loading">
                    <Loader2 className="trainer-reports__spinner" size={48} />
                    <p>Loading report data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !loading) {
        return (
            <div className="trainer-reports">
                <div className="trainer-reports__error">
                    <AlertCircle size={48} />
                    <p>{error}</p>
                    <button onClick={() => fetchData()}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="trainer-reports" ref={reportRef}>
            <div className="trainer-reports__header">
                <div className="trainer-reports__header-content">
                    <div className="trainer-reports__title-section">
                        <h1>Performance Reports</h1>
                        <p>Track your performance, earnings, and member progress</p>
                    </div>
                    <div className="trainer-reports__header-actions">
                        <div className="trainer-reports__period-select">
                            <Calendar size={14} />
                            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last 3 Months</option>
                                <option>This Year</option>
                                <option>Custom</option>
                            </select>
                            <ChevronDown size={14} />
                        </div>
                        {period === 'Custom' && (
                            <div className="trainer-reports__custom-range">
                                <input
                                    type="date"
                                    className="trainer-reports__date-input"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    placeholder="Start date"
                                />
                                <span className="trainer-reports__date-separator">to</span>
                                <input
                                    type="date"
                                    className="trainer-reports__date-input"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    placeholder="End date"
                                />
                                <button
                                    className="trainer-reports__apply-btn"
                                    onClick={() => fetchData()}
                                    disabled={!customStartDate || !customEndDate}
                                    title="Apply date range"
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                        <button
                            className={`trainer-reports__refresh-btn ${refreshing ? 'refreshing' : ''}`}
                            title="Refresh Data"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
                        </button>
                        <div className="trainer-reports__export-dropdown">
                            <button
                                className="trainer-reports__export-btn"
                                onClick={() => handleExport(activeTab === 'earnings' ? 'earnings' : 'sessions')}
                            >
                                <Download size={16} />
                                CSV
                            </button>
                            <button
                                className="trainer-reports__export-btn trainer-reports__export-btn--pdf"
                                onClick={handleExportPDF}
                                title="Export as PDF"
                            >
                                <FileText size={16} />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="trainer-reports__tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    <BarChart3 size={16} /> Overview
                </button>
                <button
                    className={activeTab === 'sessions' ? 'active' : ''}
                    onClick={() => setActiveTab('sessions')}
                >
                    <Calendar size={16} /> Sessions
                </button>
                <button
                    className={activeTab === 'members' ? 'active' : ''}
                    onClick={() => setActiveTab('members')}
                >
                    <Users size={16} /> Members
                </button>
                <button
                    className={activeTab === 'earnings' ? 'active' : ''}
                    onClick={() => setActiveTab('earnings')}
                >
                    <IndianRupee size={16} /> Earnings
                </button>
            </div>

            <div className="trainer-reports__content">
                {activeTab === 'overview' && (
                    <>
                        <div className="trainer-reports__stats">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="trainer-reports__stat-card">
                                    <div className="trainer-reports__stat-header">
                                        <div
                                            className="trainer-reports__stat-icon"
                                            style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                                        >
                                            <stat.icon size={18} />
                                        </div>
                                        <div className={`trainer-reports__stat-trend trainer-reports__stat-trend--${stat.changeType}`}>
                                            {stat.changeType === 'positive' && <ArrowUpRight size={14} />}
                                            {stat.changeType === 'negative' && <ArrowDownRight size={14} />}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="trainer-reports__stat-value">{stat.value}</div>
                                    <div className="trainer-reports__stat-label">{stat.label}</div>
                                    <div className="trainer-reports__stat-subtext">{stat.subtext}</div>
                                </div>
                            ))}
                        </div>

                        <div className="trainer-reports__grid">
                            <div className="trainer-reports__card trainer-reports__card--chart">
                                <div className="trainer-reports__card-header">
                                    <h2><Activity size={18} /> Weekly Session Activity</h2>
                                    <div className="trainer-reports__chart-legend">
                                        <span><span className="trainer-reports__legend-dot trainer-reports__legend-dot--actual"></span> Actual</span>
                                        <span><span className="trainer-reports__legend-dot trainer-reports__legend-dot--target"></span> Target</span>
                                    </div>
                                </div>
                                <div className="trainer-reports__card-content">
                                    {weeklySessionData.length > 0 ? (
                                        <>
                                            <div className="trainer-reports__bar-chart">
                                                {weeklySessionData.map((day, idx) => (
                                                    <div key={idx} className="trainer-reports__bar-group">
                                                        <div className="trainer-reports__bar-container">
                                                            <div
                                                                className="trainer-reports__bar trainer-reports__bar--target"
                                                                style={{ height: `${(day.target / maxSessions) * 100}%` }}
                                                            />
                                                            <div
                                                                className="trainer-reports__bar trainer-reports__bar--actual"
                                                                style={{ height: `${(day.sessions / maxSessions) * 100}%` }}
                                                            >
                                                                <span className="trainer-reports__bar-value">{day.sessions}</span>
                                                            </div>
                                                        </div>
                                                        <span className="trainer-reports__bar-label">{day.day}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="trainer-reports__chart-summary">
                                                <div className="trainer-reports__summary-item">
                                                    <span className="trainer-reports__summary-value">{weeklyActivity?.totalSessions || 0}</span>
                                                    <span className="trainer-reports__summary-label">Total Sessions</span>
                                                </div>
                                                <div className="trainer-reports__summary-item">
                                                    <span className="trainer-reports__summary-value">{weeklyActivity?.dailyAverage || 0}</span>
                                                    <span className="trainer-reports__summary-label">Daily Average</span>
                                                </div>
                                                <div className="trainer-reports__summary-item">
                                                    <span className={`trainer-reports__summary-value trainer-reports__summary-value--${weeklyActivity?.vsLastWeekType || 'neutral'}`}>
                                                        {weeklyActivity?.vsLastWeek || '0%'}
                                                    </span>
                                                    <span className="trainer-reports__summary-label">vs Last Week</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="trainer-reports__empty-state">
                                            <Calendar size={32} />
                                            <p>No session data for this period</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="trainer-reports__card trainer-reports__card--breakdown">
                                <div className="trainer-reports__card-header">
                                    <h2><PieChart size={18} /> Session Type Breakdown</h2>
                                </div>
                                <div className="trainer-reports__card-content">
                                    {sessionTypeBreakdown.length > 0 ? (
                                        <>
                                            <div className="trainer-reports__donut-chart">
                                                <div className="trainer-reports__donut">
                                                    <svg viewBox="0 0 36 36">
                                                        {sessionTypeBreakdown.reduce((acc, item, idx) => {
                                                            const offset = acc.offset;
                                                            const dash = item.percent;
                                                            acc.elements.push(
                                                                <circle
                                                                    key={idx}
                                                                    cx="18"
                                                                    cy="18"
                                                                    r="15.9"
                                                                    fill="none"
                                                                    stroke={item.color}
                                                                    strokeWidth="3.8"
                                                                    strokeDasharray={`${dash} ${100 - dash}`}
                                                                    strokeDashoffset={-offset}
                                                                    strokeLinecap="round"
                                                                />
                                                            );
                                                            acc.offset += dash;
                                                            return acc;
                                                        }, { offset: 25, elements: [] as React.ReactNode[] }).elements}
                                                    </svg>
                                                    <div className="trainer-reports__donut-center">
                                                        <span className="trainer-reports__donut-value">{sessionTypes?.totalSessions || 0}</span>
                                                        <span className="trainer-reports__donut-label">Sessions</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="trainer-reports__breakdown-list">
                                                {sessionTypeBreakdown.map((item, idx) => (
                                                    <div key={idx} className="trainer-reports__breakdown-item">
                                                        <div className="trainer-reports__breakdown-color" style={{ backgroundColor: item.color }} />
                                                        <span className="trainer-reports__breakdown-type">{item.type}</span>
                                                        <span className="trainer-reports__breakdown-count">{item.count}</span>
                                                        <span className="trainer-reports__breakdown-percent">{item.percent}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="trainer-reports__empty-state">
                                            <PieChart size={32} />
                                            <p>No session type data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="trainer-reports__card trainer-reports__card--performance">
                                <div className="trainer-reports__card-header">
                                    <h2><Target size={18} /> Performance Metrics</h2>
                                    <button className="trainer-reports__info-btn" title="Metrics include confidence levels">
                                        <Info size={14} />
                                    </button>
                                </div>
                                <div className="trainer-reports__card-content">
                                    {performanceData.length > 0 ? (
                                        <div className="trainer-reports__metrics">
                                            {performanceData.map((metric, idx) => (
                                                <div key={idx} className="trainer-reports__metric">
                                                    <div className="trainer-reports__metric-header">
                                                        <div className="trainer-reports__metric-title">
                                                            <metric.icon size={14} style={{ color: metric.color }} />
                                                            <span className="trainer-reports__metric-label">
                                                                {metric.label}
                                                                {metric.confidence === 'ESTIMATED' && (
                                                                    <span className="trainer-reports__metric-estimated" title={metric.confidenceNote}>*</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <span className="trainer-reports__metric-value" style={{ color: metric.color }}>
                                                            {metric.percent}%
                                                        </span>
                                                    </div>
                                                    <div className="trainer-reports__metric-bar">
                                                        <div
                                                            className="trainer-reports__metric-progress"
                                                            style={{ width: `${metric.percent}%`, backgroundColor: metric.color }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="trainer-reports__empty-state">
                                            <Target size={32} />
                                            <p>No performance data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="trainer-reports__card trainer-reports__card--achievements">
                                <div className="trainer-reports__card-header">
                                    <h2><Award size={18} /> Recent Achievements</h2>
                                </div>
                                <div className="trainer-reports__card-content">
                                    {achievements.length > 0 ? (
                                        <div className="trainer-reports__achievements">
                                            {achievements.map((achievement, idx) => {
                                                const IconComponent = iconMap[achievement.icon] || Trophy;
                                                return (
                                                    <div key={idx} className="trainer-reports__achievement">
                                                        <div
                                                            className="trainer-reports__achievement-icon"
                                                            style={{ backgroundColor: `${achievement.color}15`, color: achievement.color }}
                                                        >
                                                            <IconComponent size={18} />
                                                        </div>
                                                        <div className="trainer-reports__achievement-info">
                                                            <span className="trainer-reports__achievement-label">{achievement.label}</span>
                                                            <span className="trainer-reports__achievement-date">{achievement.date}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="trainer-reports__empty-state">
                                            <Award size={32} />
                                            <p>Complete milestones to earn achievements!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'sessions' && (
                    <>
                        <div className="trainer-reports__session-stats">
                            <div className="trainer-reports__session-stat">
                                <span className="trainer-reports__session-stat-value">{sessionStats.total}</span>
                                <span className="trainer-reports__session-stat-label">Total</span>
                            </div>
                            <div className="trainer-reports__session-stat trainer-reports__session-stat--completed">
                                <span className="trainer-reports__session-stat-value">{sessionStats.completed}</span>
                                <span className="trainer-reports__session-stat-label">Completed</span>
                            </div>
                            <div className="trainer-reports__session-stat trainer-reports__session-stat--cancelled">
                                <span className="trainer-reports__session-stat-value">{sessionStats.cancelled}</span>
                                <span className="trainer-reports__session-stat-label">Cancelled</span>
                            </div>
                            <div className="trainer-reports__session-stat trainer-reports__session-stat--no-show">
                                <span className="trainer-reports__session-stat-value">{sessionStats.noShow}</span>
                                <span className="trainer-reports__session-stat-label">No Show</span>
                            </div>
                        </div>

                        <div className="trainer-reports__sessions-toolbar">
                            <div className="trainer-reports__sessions-filter">
                                <button
                                    className={sessionFilter === 'all' ? 'active' : ''}
                                    onClick={() => setSessionFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={sessionFilter === 'completed' ? 'active' : ''}
                                    onClick={() => setSessionFilter('completed')}
                                >
                                    Completed
                                </button>
                                <button
                                    className={sessionFilter === 'cancelled' ? 'active' : ''}
                                    onClick={() => setSessionFilter('cancelled')}
                                >
                                    Cancelled
                                </button>
                            </div>
                        </div>

                        <div className="trainer-reports__card trainer-reports__card--full">
                            {sessions.length > 0 ? (
                                <div className="trainer-reports__sessions-table">
                                    <div className="trainer-reports__table-header">
                                        <span>Member</span>
                                        <span>Type</span>
                                        <span>Date</span>
                                        <span>Time</span>
                                        <span>Duration</span>
                                        <span>Status</span>
                                        <span>Rating</span>
                                    </div>
                                    {sessions.map((session) => {
                                        const badge = getStatusBadge(session.status);
                                        return (
                                            <div key={session.id} className="trainer-reports__table-row">
                                                <div className="trainer-reports__session-member">
                                                    <div className="trainer-reports__member-avatar-small">
                                                        {session.memberAvatar}
                                                    </div>
                                                    <span>{session.memberName}</span>
                                                </div>
                                                <span>{session.type}</span>
                                                <span>{session.date}</span>
                                                <span>{session.time}</span>
                                                <span>{session.duration}</span>
                                                <span className={`trainer-reports__session-status trainer-reports__session-status--${badge.class}`}>
                                                    <badge.icon size={12} />
                                                    {badge.label}
                                                </span>
                                                <span className="trainer-reports__session-rating">
                                                    {session.rating ? (
                                                        <>
                                                            <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
                                                            {session.rating}.0
                                                        </>
                                                    ) : '-'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="trainer-reports__empty-state">
                                    <Calendar size={48} />
                                    <p>No sessions found for this period</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'members' && (
                    <>
                        <div className="trainer-reports__members-header">
                            <h2>Member Progress Overview</h2>
                            <p>Track how your members are progressing towards their goals</p>
                        </div>

                        {membersProgress.length > 0 ? (
                            <div className="trainer-reports__members-grid">
                                {membersProgress.map((member, idx) => (
                                    <div key={member.id} className="trainer-reports__member-card">
                                        <div className="trainer-reports__member-card-header">
                                            {idx < 3 && (
                                                <div className={`trainer-reports__member-badge trainer-reports__member-badge--${idx + 1}`}>
                                                    {idx === 0 && <Crown size={12} />}
                                                    {idx === 1 && <Medal size={12} />}
                                                    {idx === 2 && <Award size={12} />}
                                                    #{idx + 1}
                                                </div>
                                            )}
                                            <img src={member.avatar} alt={member.name} className="trainer-reports__member-avatar-large" />
                                            <h3>{member.name}</h3>
                                            <span className="trainer-reports__member-goal">{member.goal}</span>
                                        </div>
                                        <div className="trainer-reports__member-stats">
                                            <div className="trainer-reports__member-stat">
                                                <span className="trainer-reports__member-stat-value">{member.sessions}</span>
                                                <span className="trainer-reports__member-stat-label">Sessions</span>
                                            </div>
                                            <div className="trainer-reports__member-stat">
                                                <span className="trainer-reports__member-stat-value">{member.attendance}%</span>
                                                <span className="trainer-reports__member-stat-label">Attendance</span>
                                            </div>
                                            <div className="trainer-reports__member-stat">
                                                <span className={`trainer-reports__member-stat-value trainer-reports__member-stat-value--${member.trend}`}>
                                                    {member.trend === 'up' && <TrendingUp size={12} />}
                                                    {member.trend === 'down' && <TrendingDown size={12} />}
                                                    {member.goalProgress}%
                                                </span>
                                                <span className="trainer-reports__member-stat-label">Goal Progress</span>
                                            </div>
                                        </div>
                                        <div className="trainer-reports__member-progress-bar">
                                            <div className="trainer-reports__member-progress-track">
                                                <div
                                                    className="trainer-reports__member-progress-fill"
                                                    style={{ width: `${member.goalProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="trainer-reports__member-footer">
                                            <span>Last session: {member.lastSession}</span>
                                            <button className="trainer-reports__view-member-btn">
                                                <Eye size={14} /> View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="trainer-reports__empty-state-full">
                                <Users size={48} />
                                <p>No assigned members found</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'earnings' && (
                    <>
                        {earnings ? (
                            <>
                                <div className="trainer-reports__earnings-summary">
                                    <div className="trainer-reports__earnings-total">
                                        <span className="trainer-reports__earnings-label">Total Earnings</span>
                                        <span className="trainer-reports__earnings-value">${totalEarnings.toLocaleString()}</span>
                                        <span className="trainer-reports__earnings-period">{period}</span>
                                    </div>
                                    <div className={`trainer-reports__earnings-trend trainer-reports__earnings-trend--${earnings.changeType}`}>
                                        {earnings.changeType === 'positive' && <ArrowUpRight size={20} />}
                                        {earnings.changeType === 'negative' && <ArrowDownRight size={20} />}
                                        <span>{earnings.changePercent} vs last period</span>
                                    </div>
                                </div>

                                <div className="trainer-reports__earnings-grid">
                                    <div className="trainer-reports__card">
                                        <div className="trainer-reports__card-header">
                                            <h2><IndianRupee size={18} /> Earnings Breakdown</h2>
                                        </div>
                                        <div className="trainer-reports__card-content">
                                            {earningsData.length > 0 ? (
                                                <div className="trainer-reports__earnings-breakdown">
                                                    {earningsData.map((item, idx) => (
                                                        <div key={idx} className="trainer-reports__earnings-item">
                                                            <div className="trainer-reports__earnings-item-header">
                                                                <div
                                                                    className="trainer-reports__earnings-dot"
                                                                    style={{ backgroundColor: item.color }}
                                                                />
                                                                <span className="trainer-reports__earnings-category">{item.category}</span>
                                                            </div>
                                                            <div className="trainer-reports__earnings-item-details">
                                                                <span className="trainer-reports__earnings-amount">${item.amount}</span>
                                                                {item.sessions > 0 && (
                                                                    <span className="trainer-reports__earnings-sessions">{item.sessions} sessions</span>
                                                                )}
                                                            </div>
                                                            <div className="trainer-reports__earnings-bar">
                                                                <div
                                                                    className="trainer-reports__earnings-bar-fill"
                                                                    style={{
                                                                        width: `${totalEarnings > 0 ? (item.amount / totalEarnings) * 100 : 0}%`,
                                                                        backgroundColor: item.color
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="trainer-reports__empty-state">
                                                    <IndianRupee size={32} />
                                                    <p>No earnings data available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="trainer-reports__card">
                                        <div className="trainer-reports__card-header">
                                            <h2><TrendingUp size={18} /> Rate Analysis</h2>
                                        </div>
                                        <div className="trainer-reports__card-content">
                                            <div className="trainer-reports__rate-cards">
                                                <div className="trainer-reports__rate-card">
                                                    <span className="trainer-reports__rate-value">${earnings.avgPerSession.toFixed(0)}</span>
                                                    <span className="trainer-reports__rate-label">Avg. per Session</span>
                                                </div>
                                                <div className="trainer-reports__rate-card">
                                                    <span className="trainer-reports__rate-value">${earnings.avgDailyEarnings.toFixed(0)}</span>
                                                    <span className="trainer-reports__rate-label">Avg. Daily Earnings</span>
                                                </div>
                                                <div className="trainer-reports__rate-card">
                                                    <span className="trainer-reports__rate-value">{earnings.paidSessions}</span>
                                                    <span className="trainer-reports__rate-label">Paid Sessions</span>
                                                </div>
                                                <div className="trainer-reports__rate-card">
                                                    <span className="trainer-reports__rate-value">${earnings.projectedMonthly.toLocaleString()}</span>
                                                    <span className="trainer-reports__rate-label">Projected Monthly</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="trainer-reports__empty-state-full">
                                <IndianRupee size={48} />
                                <p>No earnings data available</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TrainerReports;
