"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Card, Button } from "../../components/ui"
import api from "../../services/api"
import "./Reports.css"

interface ReportMetric {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
}

interface MembershipBreakdown {
  planName: string
  count: number
  revenue: number
  percentage: number
  color: string
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "year">("30d")
  const [metrics, setMetrics] = useState<ReportMetric[]>([])
  const [membershipBreakdown, setMembershipBreakdown] = useState<MembershipBreakdown[]>([])

  const loadReportData = useCallback(async () => {
    setLoading(true)
    try {
      const stats = await api.getStats()
      
      setMetrics([
        { label: "Total Members", value: stats.totalMembers || 0, change: "+12%", trend: "up" },
        { label: "Active Memberships", value: stats.activeMembers || 0, change: "+8%", trend: "up" },
        { label: "Total Revenue", value: formatCurrency(stats.totalRevenue || 0), change: "+15%", trend: "up" },
        { label: "Avg Session Rating", value: "4.8", change: "+0.3", trend: "up" },
        { label: "Retention Rate", value: "87%", change: "+5%", trend: "up" },
        { label: "New Signups (MTD)", value: stats.totalMembers || 0, change: "+22%", trend: "up" },
      ])

      // Membership breakdown by plan type
      setMembershipBreakdown([
        { planName: "Gold Premium", count: 45, revenue: 67500, percentage: 40, color: "#F59E0B" },
        { planName: "Silver Standard", count: 38, revenue: 38000, percentage: 30, color: "#9CA3AF" },
        { planName: "Student Plan", count: 25, revenue: 12500, percentage: 20, color: "#10B981" },
        { planName: "Day Pass", count: 12, revenue: 3600, percentage: 10, color: "#3B82F6" },
      ])
    } catch (err) {
      console.error("Failed to load report data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReportData()
  }, [loadReportData, dateRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
    if (trend === "up") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      )
    }
    if (trend === "down") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-crimson)" strokeWidth="2">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
          <polyline points="17 18 23 18 23 12" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-page__header">
        <div className="reports-page__title-section">
          <h1 className="reports-page__title">Analytics & Reports</h1>
          <span className="reports-page__subtitle">Comprehensive insights into your gym's performance</span>
        </div>
        <div className="reports-page__actions">
          <div className="reports-page__date-toggle">
            {(["7d", "30d", "90d", "year"] as const).map((range) => (
              <button
                key={range}
                className={`date-toggle-btn ${dateRange === range ? "date-toggle-btn--active" : ""}`}
                onClick={() => setDateRange(range)}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "Year"}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="reports-page__metrics">
        {metrics.map((metric, idx) => (
          <div key={idx} className="metric-card">
            <span className="metric-card__label">{metric.label}</span>
            <div className="metric-card__value-row">
              <span className="metric-card__value">{metric.value}</span>
              {metric.change && (
                <span className={`metric-card__change metric-card__change--${metric.trend}`}>
                  {getTrendIcon(metric.trend)}
                  {metric.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="reports-page__grid">
        {/* Revenue Trend */}
        <Card title="Revenue Trend" className="reports-page__chart">
          <div className="chart-container">
            <svg viewBox="0 0 500 200" className="revenue-chart">
              {/* Grid */}
              <g className="chart-grid">
                {[0, 40, 80, 120, 160].map((y) => (
                  <line key={y} x1="40" y1={y + 20} x2="480" y2={y + 20} stroke="var(--border-primary)" strokeWidth="1" />
                ))}
              </g>
              {/* Revenue area */}
              <defs>
                <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-crimson)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-crimson)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M40,160 L80,140 L120,150 L160,120 L200,130 L240,100 L280,110 L320,80 L360,90 L400,60 L440,70 L480,40 L480,180 L40,180 Z"
                fill="url(#revenueGradient)"
              />
              <path
                d="M40,160 L80,140 L120,150 L160,120 L200,130 L240,100 L280,110 L320,80 L360,90 L400,60 L440,70 L480,40"
                fill="none"
                stroke="var(--color-crimson)"
                strokeWidth="2"
              />
              {/* Data points */}
              {[
                [40, 160], [80, 140], [120, 150], [160, 120], [200, 130], [240, 100],
                [280, 110], [320, 80], [360, 90], [400, 60], [440, 70], [480, 40]
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="var(--color-crimson)" />
              ))}
            </svg>
          </div>
        </Card>

        {/* Membership Distribution */}
        <Card title="Membership Distribution" className="reports-page__distribution">
          <div className="distribution-content">
            <div className="donut-chart">
              <svg viewBox="0 0 100 100" className="donut-svg">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="12" strokeDasharray="100 155" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#9CA3AF" strokeWidth="12" strokeDasharray="75 180" strokeDashoffset="-100" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray="50 205" strokeDashoffset="-175" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="12" strokeDasharray="25 230" strokeDashoffset="-225" transform="rotate(-90 50 50)" />
              </svg>
              <div className="donut-center">
                <span className="donut-value">120</span>
                <span className="donut-label">Total</span>
              </div>
            </div>
            <div className="distribution-legend">
              {membershipBreakdown.map((item, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: item.color }} />
                  <span className="legend-label">{item.planName}</span>
                  <span className="legend-count">{item.count}</span>
                  <span className="legend-percentage">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Attendance Heatmap */}
        <Card title="Weekly Attendance Pattern" className="reports-page__heatmap">
          <div className="heatmap-container">
            <div className="heatmap-y-axis">
              {["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"].map((time) => (
                <span key={time}>{time}</span>
              ))}
            </div>
            <div className="heatmap-grid">
              <div className="heatmap-x-axis">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="heatmap-cells">
                {Array.from({ length: 42 }).map((_, i) => {
                  const intensity = Math.random()
                  return (
                    <div
                      key={i}
                      className="heatmap-cell"
                      style={{
                        backgroundColor: `rgba(220, 38, 38, ${0.1 + intensity * 0.7})`,
                      }}
                      title={`${Math.floor(intensity * 50)} check-ins`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Top Trainers */}
        <Card title="Top Performing Trainers" className="reports-page__trainers">
          <div className="trainers-list">
            {[
              { name: "Alex Johnson", sessions: 48, rating: 4.9, revenue: 72000 },
              { name: "Sarah Miller", sessions: 42, rating: 4.8, revenue: 63000 },
              { name: "Mike Chen", sessions: 38, rating: 4.7, revenue: 57000 },
              { name: "Emma Wilson", sessions: 35, rating: 4.9, revenue: 52500 },
            ].map((trainer, idx) => (
              <div key={idx} className="trainer-row">
                <div className="trainer-rank">#{idx + 1}</div>
                <div className="trainer-info">
                  <span className="trainer-name">{trainer.name}</span>
                  <span className="trainer-sessions">{trainer.sessions} sessions</span>
                </div>
                <div className="trainer-rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-amber)">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {trainer.rating}
                </div>
                <div className="trainer-revenue">{formatCurrency(trainer.revenue)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Reports
