import React, { useState } from "react"
import { Card, Button } from "../../components/ui"
import RadialAttendance from "./components/RadialAttendance"
import "./Reports.css"

// ============================================================================
// ANALYTICS & INSIGHTS - Decision Support System
// ============================================================================

// Types
interface InsightCard {
  title: string
  metric: string
  trend: "up" | "down" | "neutral"
  trendValue: string
  reason: string
  action: string
  iconColor: string
}

interface MembershipSource {
  label: string
  value: number
  change: number
  color: string
}

interface TrainerImpact {
  name: string
  sessions: number
  revenue: number
  retention: string
  impact: "high" | "medium" | "low"
}

interface ActionableInsight {
  icon: string
  text: string
  priority: "critical" | "warning" | "info"
}

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<"30d" | "90d" | "year">("30d")

  // ========================================
  // A. INSIGHT CARDS (Replaces 5 shallow KPIs)
  // ========================================
  const insightCards: InsightCard[] = [
    {
      title: "Retention Quality",
      metric: "87%",
      trend: "up",
      trendValue: "+2.4%",
      reason: "Higher PT attendance this month",
      action: "Promote PT upsell to new members",
      iconColor: "var(--color-emerald)"
    },
    {
      title: "Class Utilization",
      metric: "78%",
      trend: "down",
      trendValue: "-2%",
      reason: "Morning slots (9-11 AM) are empty",
      action: "Reschedule or consolidate morning classes",
      iconColor: "var(--color-amber)"
    },
    {
      title: "Trainer Effectiveness",
      metric: "92 NPS",
      trend: "neutral",
      trendValue: "stable",
      reason: "Alex Johnson leads retention impact",
      action: "Allocate peak hours to top trainers",
      iconColor: "var(--color-blue)"
    }
  ]

  // ========================================
  // B. SUMMARY STRIP (Above Heatmap)
  // ========================================
  const patternSummary = [
    { label: "Peak Time", value: "6-8 PM", icon: "🔥" },
    { label: "Low Utilization", value: "9-11 AM", icon: "⚠️" },
    { label: "Weekend Pattern", value: "Stable", icon: "📊" }
  ]

  // ========================================
  // C. MEMBERSHIP SOURCES (Replaces simple growth chart)
  // ========================================
  const membershipSources: MembershipSource[] = [
    { label: "New Joins", value: 32, change: 12, color: "var(--color-emerald)" },
    { label: "Renewals", value: 45, change: 8, color: "var(--color-blue)" },
    { label: "Reactivations", value: 8, change: -2, color: "var(--color-amber)" },
    { label: "Churn", value: -12, change: 3, color: "var(--color-crimson)" }
  ]

  // ========================================
  // D. TRAINER BUSINESS IMPACT
  // ========================================
  const trainers: TrainerImpact[] = [
    { name: "Alex Johnson", sessions: 48, revenue: 125000, retention: "94%", impact: "high" },
    { name: "Sarah Miller", sessions: 42, revenue: 98000, retention: "91%", impact: "high" },
    { name: "Mike Chen", sessions: 56, revenue: 85000, retention: "88%", impact: "medium" },
    { name: "Emma Wilson", sessions: 35, revenue: 62000, retention: "85%", impact: "medium" }
  ]

  // ========================================
  // E. ACTIONABLE INSIGHTS PANEL
  // ========================================
  const actionableInsights: ActionableInsight[] = [
    { icon: "🔥", text: "HIIT classes overperform on Wed/Fri evenings — add more slots", priority: "critical" },
    { icon: "⚠️", text: "Morning slots (9-11 AM) are 40% underutilized", priority: "warning" },
    { icon: "⭐", text: "Alex Johnson drives highest member retention (94%)", priority: "info" },
    { icon: "📉", text: "Class Pack sales declining this month (-8%)", priority: "warning" },
    { icon: "📈", text: "Referral signups up 15% — consider referral bonus", priority: "info" }
  ]

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-page__header">
        <div className="reports-page__title-section">
          <h1 className="reports-page__title">Analytics & Insights</h1>
          <span className="reports-page__subtitle">Understand patterns. Make decisions. Grow your gym.</span>
        </div>
        <div className="reports-page__actions">
          <div className="reports-page__date-toggle">
            {(["30d", "90d", "year"] as const).map((range) => (
              <button
                key={range}
                className={`date-toggle-btn ${dateRange === range ? "date-toggle-btn--active" : ""}`}
                onClick={() => setDateRange(range)}
              >
                {range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "Year"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================
          A. INSIGHT CARDS (3 Cards, Narrative Style)
          ======================================== */}
      <div className="insight-cards-grid">
        {insightCards.map((card, idx) => (
          <div key={idx} className="insight-card">
            <div className="insight-card__header">
              <span className="insight-card__title">{card.title}</span>
              <span className={`insight-card__trend insight-card__trend--${card.trend}`}>
                {card.trend === "up" ? "↑" : card.trend === "down" ? "↓" : "−"} {card.trendValue}
              </span>
            </div>
            <div className="insight-card__metric" style={{ color: card.iconColor }}>
              {card.metric}
            </div>
            <div className="insight-card__reason">
              <span className="reason-label">Why:</span> {card.reason}
            </div>
            <div className="insight-card__action">
              <span className="action-label">→</span> {card.action}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================
          B. TRAFFIC & ATTENDANCE PATTERN
          ======================================== */}
      <Card className="traffic-section">
        <div className="traffic-header">
          <h3>Traffic & Attendance Pattern</h3>
          <Button variant="secondary" size="sm">
            Adjust Class Schedule
          </Button>
        </div>

        {/* Dual Radial Attendance Visualization (Side by Side) */}
        <div className="dual-radial-grid">
          <RadialAttendance
            title="Member Traffic"
            subtitle="Customer check-ins by day/time"
            colorPalette="blue-orange"
          />
          <RadialAttendance
            title="Trainer Activity"
            subtitle="Trainer sessions by day/time"
            colorPalette="purple-green"
          />
        </div>
      </Card>

      {/* ========================================
          C & D. MEMBERSHIP SOURCES + TRAINER IMPACT (Side by Side)
          ======================================== */}
      <div className="analytics-grid">
        {/* C. Membership Sources */}
        <Card className="sources-section">
          <h3>Membership Movement</h3>
          <p className="section-subtitle">Where members come from and go</p>
          <div className="sources-list">
            {membershipSources.map((source, idx) => (
              <div key={idx} className="source-row">
                <div className="source-bar" style={{ backgroundColor: source.color, width: `${Math.min(Math.abs(source.value) * 2, 100)}%` }} />
                <div className="source-info">
                  <span className="source-label">{source.label}</span>
                  <span className="source-value" style={{ color: source.color }}>
                    {source.value > 0 ? '+' : ''}{source.value}
                  </span>
                </div>
                <span className={`source-change ${source.change >= 0 ? 'positive' : 'negative'}`}>
                  {source.change >= 0 ? '↑' : '↓'} {Math.abs(source.change)} vs last
                </span>
              </div>
            ))}
          </div>
          <div className="sources-summary">
            <strong>Net Growth:</strong> <span className="text-emerald">+{membershipSources.reduce((acc, s) => acc + s.value, 0)} members</span>
          </div>
        </Card>

        {/* D. Trainer Business Impact */}
        <Card className="trainers-section">
          <h3>Trainer Business Impact</h3>
          <p className="section-subtitle">Who grows your gym?</p>
          <div className="trainers-impact-list">
            {trainers.map((trainer, idx) => (
              <div key={idx} className={`trainer-impact-row trainer-impact-row--${trainer.impact}`}>
                <div className="trainer-impact-rank">{idx + 1}</div>
                <div className="trainer-impact-info">
                  <span className="trainer-impact-name">{trainer.name}</span>
                  <span className={`impact-badge impact-badge--${trainer.impact}`}>
                    {trainer.impact === "high" ? "High Impact" : "Growing"}
                  </span>
                </div>
                <div className="trainer-impact-stats">
                  <div className="impact-stat">
                    <span className="impact-stat-label">Sessions</span>
                    <span className="impact-stat-value">{trainer.sessions}</span>
                  </div>
                  <div className="impact-stat">
                    <span className="impact-stat-label">Revenue</span>
                    <span className="impact-stat-value text-emerald">{formatCurrency(trainer.revenue)}</span>
                  </div>
                  <div className="impact-stat">
                    <span className="impact-stat-label">Retention</span>
                    <span className="impact-stat-value">{trainer.retention}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ========================================
          E. ACTIONABLE INSIGHTS PANEL (THE BRAIN)
          ======================================== */}
      <Card className="actionable-insights-panel">
        <div className="insights-panel-header">
          <h3>🧠 Actionable Insights</h3>
          <span className="insights-panel-subtitle">What to do next, in 30 seconds</span>
        </div>
        <div className="insights-list">
          {actionableInsights.map((insight, idx) => (
            <div key={idx} className={`insight-item insight-item--${insight.priority}`}>
              <span className="insight-icon">{insight.icon}</span>
              <span className="insight-text">{insight.text}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Reports
