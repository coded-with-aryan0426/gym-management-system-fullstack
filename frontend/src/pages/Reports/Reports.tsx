import React, { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import { analyticsApi } from "../../services/api"
import type {
  FullAnalyticsDashboard,
  DateRange,
  ActionableInsight,
  StaffAttendanceRecord,
  TrainerPerformanceInsight,
  ProductRevenue,
  MonthlyTrend,
  MemberRevenueInsight
} from "../../types/analytics"
import {
  Users,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Activity,
  Clock,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Minus,
  Flame,
  Snowflake,
  BarChart3,
  Target,
  Zap
} from "lucide-react"
import "./Reports.css"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)

const formatPercent = (value: number) => `${value.toFixed(1)}%`

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>("30d")
  const [activeTab, setActiveTab] = useState<"overview" | "pt-revenue" | "attendance" | "insights">("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [dashboard, setDashboard] = useState<FullAnalyticsDashboard | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await analyticsApi.getFullDashboard(dateRange)
      setDashboard(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (isLoading || !dashboard) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="loading-spinner" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  const { ptRevenue, staffAttendance, insights, trafficHeatmap, membershipMovement, trainerPerformance } = dashboard

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="page-title">Analytics & Insights</h1>
            <p className="page-subtitle">Business intelligence for growth decisions</p>
          </div>
          <div className="header-controls">
            <div className="tab-nav">
              {(["overview", "pt-revenue", "attendance", "insights"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "tab-btn--active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "overview" && "Overview"}
                  {tab === "pt-revenue" && "PT Revenue"}
                  {tab === "attendance" && "Staff Attendance"}
                  {tab === "insights" && "Insights"}
                </button>
              ))}
            </div>
            <div className="date-toggle">
              {(["7d", "30d", "90d", "year"] as DateRange[]).map((range) => (
                <button
                  key={range}
                  className={`date-btn ${dateRange === range ? "date-btn--active" : ""}`}
                  onClick={() => setDateRange(range)}
                >
                  {range === "7d" ? "7D" : range === "30d" ? "30D" : range === "90d" ? "90D" : "1Y"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {activeTab === "overview" && (
        <OverviewTab
          insights={insights}
          membershipMovement={membershipMovement}
          trainerPerformance={trainerPerformance}
          trafficHeatmap={trafficHeatmap}
        />
      )}

      {activeTab === "pt-revenue" && (
        <PTRevenueTab ptRevenue={ptRevenue} />
      )}

      {activeTab === "attendance" && (
        <AttendanceTab
          staffAttendance={staffAttendance}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      )}

      {activeTab === "insights" && (
        <InsightsTab insights={insights} />
      )}
    </div>
  )
}

interface OverviewTabProps {
  insights: FullAnalyticsDashboard["insights"]
  membershipMovement: FullAnalyticsDashboard["membershipMovement"]
  trainerPerformance: TrainerPerformanceInsight[]
  trafficHeatmap: FullAnalyticsDashboard["trafficHeatmap"]
}

const OverviewTab: React.FC<OverviewTabProps> = ({ insights, membershipMovement, trainerPerformance, trafficHeatmap }) => {
  const { performanceSummary } = insights

  return (
    <div className="analytics-content">
      <section className="kpi-strip">
        <div className="kpi-card kpi-card--retention">
          <div className="kpi-icon">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Retention Rate</span>
            <span className="kpi-value">{formatPercent(performanceSummary.retentionRate)}</span>
            <span className={`kpi-change ${performanceSummary.retentionChange >= 0 ? "positive" : "negative"}`}>
              {performanceSummary.retentionChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(performanceSummary.retentionChange)}%
            </span>
          </div>
        </div>

        <div className="kpi-card kpi-card--utilization">
          <div className="kpi-icon">
            <Calendar size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Class Utilization</span>
            <span className="kpi-value">{formatPercent(performanceSummary.classUtilization)}</span>
            <span className={`kpi-change ${performanceSummary.utilizationChange >= 0 ? "positive" : "negative"}`}>
              {performanceSummary.utilizationChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(performanceSummary.utilizationChange)}%
            </span>
          </div>
        </div>

        <div className="kpi-card kpi-card--nps">
          <div className="kpi-icon">
            <Star size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Trainer NPS</span>
            <span className="kpi-value">{performanceSummary.trainerNPS}</span>
            <span className="kpi-subtext">Top: {performanceSummary.topTrainer}</span>
          </div>
        </div>

        <div className="kpi-card kpi-card--growth">
          <div className="kpi-icon">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Net Member Growth</span>
            <span className="kpi-value">+{membershipMovement.netGrowth}</span>
            <span className="kpi-subtext">{membershipMovement.newJoins} new, {membershipMovement.churned} churned</span>
          </div>
        </div>
      </section>

      <div className="analytics-grid">
        <section className="card membership-movement-card">
          <div className="card-header">
            <h3>Membership Movement</h3>
            <span className="badge badge--success">+{membershipMovement.netGrowth} net</span>
          </div>
          <div className="movement-bars">
            {[
              { label: "New Joins", value: membershipMovement.newJoins, change: membershipMovement.newJoinsChange, color: "var(--reports-neon-green)" },
              { label: "Renewals", value: membershipMovement.renewals, change: membershipMovement.renewalsChange, color: "var(--reports-neon-blue)" },
              { label: "Reactivations", value: membershipMovement.reactivations, change: membershipMovement.reactivationsChange, color: "var(--reports-amber)" },
              { label: "Churned", value: -membershipMovement.churned, change: membershipMovement.churnedChange, color: "var(--reports-red)" }
            ].map((item, idx) => (
              <div key={idx} className="movement-row">
                <div className="movement-label">
                  <span className="movement-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                </div>
                <div className="movement-bar-wrapper">
                  <div
                    className="movement-bar"
                    style={{
                      width: `${Math.min(Math.abs(item.value) * 2, 100)}%`,
                      background: item.color
                    }}
                  />
                </div>
                <div className="movement-stats">
                  <span className="movement-value" style={{ color: item.color }}>
                    {item.value > 0 ? "+" : ""}{item.value}
                  </span>
                  <span className={`movement-change ${item.change >= 0 ? "positive" : "negative"}`}>
                    {item.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(item.change)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card trainer-impact-card">
          <div className="card-header">
            <h3>Trainer Business Impact</h3>
            <span className="card-subtitle">Revenue & retention by trainer</span>
          </div>
          <div className="trainer-list">
            {trainerPerformance.slice(0, 5).map((trainer, idx) => (
              <div key={trainer.trainerId} className={`trainer-row trainer-row--${trainer.impactLevel}`}>
                <div className="trainer-rank">{idx + 1}</div>
                <div className="trainer-info">
                  <span className="trainer-name">{trainer.trainerName}</span>
                  <span className={`impact-badge impact-badge--${trainer.impactLevel}`}>
                    {trainer.impactLevel === "high" ? "High Impact" : trainer.impactLevel === "medium" ? "Growing" : "New"}
                  </span>
                </div>
                <div className="trainer-metrics">
                  <div className="metric">
                    <span className="metric-value">{trainer.sessionsCompleted}</span>
                    <span className="metric-label">Sessions</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value text-emerald">{formatCurrency(trainer.revenueGenerated)}</span>
                    <span className="metric-label">Revenue</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">{formatPercent(trainer.retentionRate)}</span>
                    <span className="metric-label">Retention</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card traffic-heatmap-card">
        <div className="card-header">
          <h3>Traffic Patterns</h3>
          <div className="pattern-summary">
            <span className="pattern-item"><span className="pattern-icon hot" /> Peak: {trafficHeatmap.peakTime}</span>
            <span className="pattern-item"><span className="pattern-icon cold" /> Low: {trafficHeatmap.lowUtilizationTime}</span>
            <span className="pattern-item"><Flame size={14} /> Weekend: {trafficHeatmap.weekendPattern}</span>
          </div>
        </div>
        <div className="heatmap-container">
          <div className="heatmap-grid">
            <div className="heatmap-row heatmap-header">
              <div className="heatmap-label" />
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="heatmap-hour">{i}h</div>
              ))}
            </div>
            {trafficHeatmap.weeklyPattern.map((day) => (
              <div key={day.dayOfWeek} className="heatmap-row">
                <div className="heatmap-label">{day.dayOfWeek.slice(0, 3)}</div>
                {day.hourlyData.map((hour) => (
                  <div
                    key={hour.hour}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: getHeatColor(hour.utilizationPercent)
                    }}
                    title={`${day.dayOfWeek} ${hour.label}: ${hour.memberTraffic} visitors`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Low</span>
            <div className="legend-gradient" />
            <span>High</span>
          </div>
        </div>
      </section>

      <section className="card quick-insights-card">
        <div className="card-header">
          <h3>Quick Insights</h3>
        </div>
        <div className="insights-grid">
          {[...insights.criticalInsights, ...insights.warningInsights, ...insights.opportunityInsights]
            .slice(0, 4)
            .map((insight) => (
              <InsightCard key={insight.id} insight={insight} compact />
            ))}
        </div>
      </section>
    </div>
  )
}

interface PTRevenueTabProps {
  ptRevenue: FullAnalyticsDashboard["ptRevenue"]
}

const PTRevenueTab: React.FC<PTRevenueTabProps> = ({ ptRevenue }) => {
  return (
    <div className="analytics-content">
      <div className="pt-kpi-strip">
        <div className="pt-kpi">
          <span className="pt-kpi-label">Total PT Revenue</span>
          <span className="pt-kpi-value">{formatCurrency(ptRevenue.totalPTRevenue)}</span>
        </div>
        <div className="pt-kpi">
          <span className="pt-kpi-label">Avg per Member</span>
          <span className="pt-kpi-value">{formatCurrency(ptRevenue.averageRevenuePerMember)}</span>
        </div>
        <div className="pt-kpi">
          <span className="pt-kpi-label">PT Members</span>
          <span className="pt-kpi-value">{ptRevenue.totalPTMembers}</span>
          <span className="pt-kpi-sub">{ptRevenue.activePTMembers} active</span>
        </div>
        <div className="pt-kpi">
          <span className="pt-kpi-label">Renewal Rate</span>
          <span className="pt-kpi-value">{formatPercent(ptRevenue.renewalRate)}</span>
        </div>
      </div>

      <div className="analytics-grid">
        <section className="card product-breakdown-card">
          <div className="card-header">
            <h3>Product Revenue Breakdown</h3>
          </div>
          <div className="product-chart">
            <div className="donut-chart">
              <DonutChart data={ptRevenue.productBreakdown} />
            </div>
            <div className="product-legend">
              {ptRevenue.productBreakdown.map((product, idx) => (
                <div key={idx} className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ background: getProductColor(idx) }}
                  />
                  <span className="legend-label">{product.productName}</span>
                  <span className="legend-value">{formatCurrency(product.revenue)}</span>
                  <span className={`legend-growth ${product.growthRate >= 0 ? "positive" : "negative"}`}>
                    {product.growthRate >= 0 ? "+" : ""}{product.growthRate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card top-spenders-card">
          <div className="card-header">
            <h3>Top Spending Members</h3>
            <span className="card-subtitle">Highest revenue PT members</span>
          </div>
          <div className="spenders-table">
            <div className="spenders-header">
              <span>Member</span>
              <span>Total Spent</span>
              <span>Sessions</span>
              <span>Supp. Prob</span>
              <span>Renewal</span>
            </div>
            {ptRevenue.topSpenders.slice(0, 8).map((member) => (
              <MemberSpenderRow key={member.memberId} member={member} />
            ))}
          </div>
        </section>
      </div>

      <section className="card monthly-trends-card">
        <div className="card-header">
          <h3>Monthly Revenue Trends</h3>
        </div>
        <div className="trends-chart">
          <TrendChart data={ptRevenue.monthlyTrends} />
        </div>
      </section>

      <section className="card age-analysis-card">
        <div className="card-header">
          <h3>Spending by Age Group</h3>
        </div>
        <div className="age-grid">
          {ptRevenue.ageGroupAnalysis.map((group) => (
            <div key={group.ageGroup} className="age-card">
              <div className="age-header">
                <span className="age-label">{group.ageGroup}</span>
                <span className="age-count">{group.memberCount} members</span>
              </div>
              <div className="age-stats">
                <div className="age-stat">
                  <span className="stat-value">{formatCurrency(group.averageSpend)}</span>
                  <span className="stat-label">Avg Spend</span>
                </div>
                <div className="age-stat">
                  <span className="stat-value text-blue">{group.topProduct}</span>
                  <span className="stat-label">Top Product</span>
                </div>
              </div>
              <div className="age-total">
                Total: {formatCurrency(group.totalSpend)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

interface AttendanceTabProps {
  staffAttendance: FullAnalyticsDashboard["staffAttendance"]
  selectedMonth: string
  onMonthChange: (month: string) => void
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({ staffAttendance, selectedMonth, onMonthChange }) => {
  return (
    <div className="analytics-content">
      <div className="attendance-header">
        <div className="attendance-stats">
          <div className="att-stat att-stat--present">
            <span className="att-stat-value">{staffAttendance.staffRecords.reduce((a, s) => a + s.presentDays, 0)}</span>
            <span className="att-stat-label">Present Days</span>
          </div>
          <div className="att-stat att-stat--late">
            <span className="att-stat-value">{staffAttendance.totalLateArrivals}</span>
            <span className="att-stat-label">Late Arrivals</span>
          </div>
          <div className="att-stat att-stat--absent">
            <span className="att-stat-value">{staffAttendance.totalAbsences}</span>
            <span className="att-stat-label">Absences</span>
          </div>
          <div className="att-stat att-stat--overtime">
            <span className="att-stat-value">{staffAttendance.overtimeHours.toFixed(1)}h</span>
            <span className="att-stat-label">Overtime</span>
          </div>
        </div>
        <div className="month-selector">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="month-input"
          />
        </div>
      </div>

      <section className="card attendance-grid-card">
        <div className="card-header">
          <h3>Staff Attendance Grid</h3>
          <div className="attendance-legend">
            <span className="legend-item"><span className="legend-box present" /> On Time</span>
            <span className="legend-item"><span className="legend-box late" /> Late</span>
            <span className="legend-item"><span className="legend-box absent" /> Absent</span>
            <span className="legend-item"><span className="legend-box weekend" /> Weekend</span>
          </div>
        </div>
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th className="sticky-col">Staff</th>
                {staffAttendance.monthlyCalendar.slice(0, 31).map((day, idx) => (
                  <th
                    key={idx}
                    className={`day-header ${day.isWeekend ? "weekend" : ""} ${day.isToday ? "today" : ""}`}
                  >
                    {new Date(day.date).getDate()}
                  </th>
                ))}
                <th className="stats-col">Score</th>
              </tr>
            </thead>
            <tbody>
              {staffAttendance.staffRecords.map((staff) => (
                <AttendanceRow key={staff.staffId} staff={staff} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="analytics-grid">
        <section className="card late-employees-card">
          <div className="card-header">
            <h3>Top Late Arrivals</h3>
          </div>
          <div className="late-list">
            {staffAttendance.topLateEmployees.map((emp, idx) => (
              <div key={emp.staffId} className="late-row">
                <span className="late-rank">{idx + 1}</span>
                <span className="late-name">{emp.staffName}</span>
                <span className="late-count">{emp.lateCount} times</span>
                <span className="late-avg">Avg: {emp.avgLateMinutes.toFixed(0)} min</span>
              </div>
            ))}
            {staffAttendance.topLateEmployees.length === 0 && (
              <div className="empty-state">No late arrivals this month</div>
            )}
          </div>
        </section>

        <section className="card attendance-summary-card">
          <div className="card-header">
            <h3>Attendance Summary</h3>
          </div>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="summary-label">Average Arrival</span>
              <span className="summary-value">
                {staffAttendance.averageArrivalTime > 0
                  ? `+${staffAttendance.averageArrivalTime.toFixed(0)} min`
                  : "On time"}
              </span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Total Staff</span>
              <span className="summary-value">{staffAttendance.staffRecords.length}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Avg Punctuality</span>
              <span className="summary-value">
                {(staffAttendance.staffRecords.reduce((a, s) => a + s.punctualityScore, 0) / 
                  Math.max(1, staffAttendance.staffRecords.length)).toFixed(1)}%
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

interface InsightsTabProps {
  insights: FullAnalyticsDashboard["insights"]
}

const InsightsTab: React.FC<InsightsTabProps> = ({ insights }) => {
  return (
    <div className="analytics-content">
      <section className="insights-section">
        <div className="insights-category">
          <div className="category-header category-header--critical">
            <span className="category-icon">
              <AlertCircle size={18} />
            </span>
            <h3>Critical Actions Required</h3>
          </div>
          <div className="insights-list">
            {insights.criticalInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
            {insights.criticalInsights.length === 0 && (
              <div className="empty-insight">No critical issues at this time</div>
            )}
          </div>
        </div>

        <div className="insights-category">
          <div className="category-header category-header--warning">
            <span className="category-icon">
              <AlertTriangle size={18} />
            </span>
            <h3>Warnings & Attention</h3>
          </div>
          <div className="insights-list">
            {insights.warningInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>

        <div className="insights-category">
          <div className="category-header category-header--opportunity">
            <span className="category-icon">
              <Zap size={18} />
            </span>
            <h3>Growth Opportunities</h3>
          </div>
          <div className="insights-list">
            {insights.opportunityInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

interface InsightCardProps {
  insight: ActionableInsight
  compact?: boolean
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, compact }) => {
  const getInsightIcon = (icon: string, priority: string) => {
    const color = priority === "critical" 
      ? "var(--reports-red)" 
      : priority === "warning" 
        ? "var(--reports-amber)" 
        : "var(--reports-neon-green)"
    
    switch (icon) {
      case "warning":
        return <AlertTriangle size={18} color={color} />
      case "activity":
        return <Activity size={18} color={color} />
      case "trending-up":
        return <TrendingUp size={18} color={color} />
      case "star":
        return <Star size={18} color={color} />
      case "clock":
        return <Clock size={18} color={color} />
      case "target":
        return <Target size={18} color={color} />
      case "bar-chart":
        return <BarChart3 size={18} color={color} />
      default:
        return <Lightbulb size={18} color={color} />
    }
  }

  if (compact) {
    return (
      <div className={`insight-card insight-card--compact insight-card--${insight.priority}`}>
        <div className="insight-icon">
          {getInsightIcon(insight.icon, insight.priority)}
        </div>
        <div className="insight-content">
          <span className="insight-title">{insight.title}</span>
          <span className="insight-desc">{insight.description}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`insight-card insight-card--${insight.priority}`}>
      <div className="insight-header">
        <span className="insight-category">{insight.category}</span>
        <span className={`insight-priority priority--${insight.priority}`}>{insight.priority}</span>
      </div>
      <h4 className="insight-title">{insight.title}</h4>
      <p className="insight-description">{insight.description}</p>
      <div className="insight-impact">
        <strong>Impact:</strong> {insight.impact}
      </div>
      <div className="insight-action">
        <strong>Action:</strong> {insight.action}
      </div>
    </div>
  )
}

interface MemberSpenderRowProps {
  member: MemberRevenueInsight
}

const MemberSpenderRow: React.FC<MemberSpenderRowProps> = ({ member }) => {
  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return "var(--reports-neon-green)"
    if (prob >= 0.4) return "var(--reports-amber)"
    return "var(--reports-text-muted)"
  }

  return (
    <div className="spender-row">
      <div className="spender-info">
        <span className="spender-name">{member.memberName}</span>
        <span className="spender-plan">{member.membershipPlan}</span>
      </div>
      <span className="spender-spent">{formatCurrency(member.totalSpent)}</span>
      <span className="spender-sessions">{member.sessionsCompleted}</span>
      <div className="spender-prob">
        <div className="prob-bar">
          <div
            className="prob-fill"
            style={{
              width: `${member.supplementProbability * 100}%`,
              background: getProbabilityColor(member.supplementProbability)
            }}
          />
        </div>
        <span>{(member.supplementProbability * 100).toFixed(0)}%</span>
      </div>
      <span className={`renewal-badge renewal-badge--${member.renewalLikelihood.toLowerCase()}`}>
        {member.renewalLikelihood}
      </span>
    </div>
  )
}

interface AttendanceRowProps {
  staff: StaffAttendanceRecord
}

const AttendanceRow: React.FC<AttendanceRowProps> = ({ staff }) => {
  return (
    <tr>
      <td className="sticky-col staff-cell">
        <div className="staff-info">
          <span className="staff-name">{staff.staffName}</span>
          <span className="staff-role">{staff.role}</span>
        </div>
      </td>
      {staff.dailyRecords.slice(0, 31).map((day, idx) => (
        <td
          key={idx}
          className={`day-cell ${day.status} ${day.isToday ? "today" : ""}`}
          title={`${day.status}${day.lateMinutes > 0 ? ` (+${day.lateMinutes}min)` : ""}`}
        >
          {day.status === "present" && <Check size={14} />}
          {day.status === "late" && "L"}
          {day.status === "absent" && <X size={14} />}
          {day.status === "leave" && <Minus size={14} />}
          {day.status === "weekend" && ""}
        </td>
      ))}
      <td className="stats-col">
        <span className={`score ${staff.punctualityScore >= 90 ? "good" : staff.punctualityScore >= 70 ? "medium" : "poor"}`}>
          {staff.punctualityScore.toFixed(0)}%
        </span>
      </td>
    </tr>
  )
}

interface DonutChartProps {
  data: ProductRevenue[]
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.percentageShare, 0)
  let currentAngle = 0

  return (
    <svg viewBox="0 0 100 100" className="donut-svg">
      {data.map((item, idx) => {
        const angle = (item.percentageShare / total) * 360
        const startAngle = currentAngle
        currentAngle += angle

        const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180)
        const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180)
        const x2 = 50 + 40 * Math.cos((Math.PI * (startAngle + angle)) / 180)
        const y2 = 50 + 40 * Math.sin((Math.PI * (startAngle + angle)) / 180)
        const largeArc = angle > 180 ? 1 : 0

        return (
          <path
            key={idx}
            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={getProductColor(idx)}
            stroke="var(--reports-bg-primary)"
            strokeWidth="1"
          />
        )
      })}
      <circle cx="50" cy="50" r="25" fill="var(--reports-bg-primary)" />
      <text x="50" y="48" textAnchor="middle" className="donut-total-label">Total</text>
      <text x="50" y="58" textAnchor="middle" className="donut-total-value">
        {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0))}
      </text>
    </svg>
  )
}

interface TrendChartProps {
  data: MonthlyTrend[]
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const chartHeight = 200

  return (
    <div className="trend-chart-container">
      <div className="trend-bars">
        {data.map((item, idx) => {
          const ptHeight = (item.ptRevenue / maxRevenue) * chartHeight
          const suppHeight = (item.supplementRevenue / maxRevenue) * chartHeight
          const otherHeight = ((item.revenue - item.ptRevenue - item.supplementRevenue) / maxRevenue) * chartHeight

          return (
            <div key={idx} className="trend-bar-group">
              <div className="trend-bar-stack" style={{ height: `${chartHeight}px` }}>
                <div
                  className="trend-bar trend-bar--pt"
                  style={{ height: `${ptHeight}px` }}
                  title={`PT: ${formatCurrency(item.ptRevenue)}`}
                />
                <div
                  className="trend-bar trend-bar--supp"
                  style={{ height: `${suppHeight}px` }}
                  title={`Supplements: ${formatCurrency(item.supplementRevenue)}`}
                />
                <div
                  className="trend-bar trend-bar--other"
                  style={{ height: `${Math.max(0, otherHeight)}px` }}
                  title={`Other: ${formatCurrency(Math.max(0, item.revenue - item.ptRevenue - item.supplementRevenue))}`}
                />
              </div>
              <span className="trend-label">{item.month.split(" ")[0]}</span>
            </div>
          )
        })}
      </div>
      <div className="trend-legend">
        <span className="trend-legend-item"><span className="legend-box pt" /> PT Revenue</span>
        <span className="trend-legend-item"><span className="legend-box supp" /> Supplements</span>
        <span className="trend-legend-item"><span className="legend-box other" /> Other</span>
      </div>
    </div>
  )
}

function getHeatColor(value: number): string {
  if (value < 20) return "rgba(20, 184, 166, 0.15)"
  if (value < 40) return "rgba(20, 184, 166, 0.35)"
  if (value < 60) return "rgba(245, 158, 11, 0.5)"
  if (value < 80) return "rgba(245, 158, 11, 0.7)"
  return "rgba(239, 68, 68, 0.8)"
}

function getProductColor(index: number): string {
  const colors = [
    "var(--reports-neon-green)",
    "var(--reports-neon-blue)",
    "var(--reports-amber)",
    "var(--reports-red)",
    "var(--reports-neon-purple)",
    "var(--reports-neon-cyan)",
    "var(--reports-neon-teal)",
    "var(--reports-orange)"
  ]
  return colors[index % colors.length]
}

export default Reports
