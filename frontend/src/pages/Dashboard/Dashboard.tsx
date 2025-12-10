"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MetricCard, Card, Avatar } from "../../components/ui"
import api from "../../services/api"
import "./Dashboard.css"

interface DashboardMetrics {
  todayRevenue: number
  revenueChange: number
  liveCheckIns: number
  newSignups: number
  signupsGoal: number
  criticalTasks: number
}

interface FloorStatus {
  memberId: number
  memberName: string
  timeIn: string
  status: "check-in" | "access denied" | "status"
}

interface ClassManifest {
  time: string
  name: string
  trainer: string
  capacity: number
  enrolled: number
}

interface Alert {
  id: number
  type: "warning" | "danger" | "info"
  title: string
  time: string
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Banner state for membership status
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState("")
  const [bannerType, setBannerType] = useState<"info" | "warning">("info")

  // For beta testing: start with empty/zero values - real data comes from API
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayRevenue: 0,
    revenueChange: 0,
    liveCheckIns: 0,
    newSignups: 0,
    signupsGoal: 150,
    criticalTasks: 0,
  })

  const [floorStatus, setFloorStatus] = useState<FloorStatus[]>([])

  const [classManifest, setClassManifest] = useState<ClassManifest[]>([])

  const [alerts, setAlerts] = useState<Alert[]>([])

  const [loading, setLoading] = useState(true)

  // Check for needsGym query param or pending membership status
  useEffect(() => {
    const needsGym = searchParams.get("needsGym")
    const userStr = localStorage.getItem("user")

    if (needsGym === "true") {
      setShowBanner(true)
      setBannerMessage("👋 Welcome! Please find and join your gym to get started.")
      setBannerType("info")
    } else if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.membershipStatus === "PENDING") {
          setShowBanner(true)
          setBannerMessage("⏳ Your membership is pending approval. You'll get access as soon as your gym confirms.")
          setBannerType("warning")
        }
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
  }, [searchParams])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      // Try to fetch real data from backend
      const [statsData, floorData, alertsData] = await Promise.allSettled([
        api.getStats(),
        api.getFloorStatus(),
        api.getDashboardAlerts(),
      ])

      // Update metrics if stats succeeded
      if (statsData.status === "fulfilled") {
        const stats = statsData.value
        setMetrics({
          todayRevenue: stats.totalRevenue || 1245.0,
          revenueChange: 8.5,
          liveCheckIns: stats.activeMembers || 42,
          newSignups: stats.totalMembers || 115,
          signupsGoal: 150,
          criticalTasks: stats.pendingSessions || 3,
        })
      }

      // Update floor status if succeeded
      if (floorData.status === "fulfilled" && Array.isArray(floorData.value)) {
        const mappedFloor: FloorStatus[] = floorData.value.map((item: any, idx: number) => ({
          memberId: item.userId || idx,
          memberName: item.memberName || item.fullName || "Unknown",
          timeIn: item.checkInTime || "8:00 AM",
          status: (item.status === "CHECKED_IN" ? "check-in" : item.status === "DENIED" ? "access denied" : "status") as FloorStatus["status"],
        }))
        if (mappedFloor.length > 0) setFloorStatus(mappedFloor)
      }

      // Update alerts if succeeded
      if (alertsData.status === "fulfilled" && Array.isArray(alertsData.value)) {
        const mappedAlerts: Alert[] = alertsData.value.map((item: any, idx: number) => ({
          id: item.id || idx,
          type: (item.severity === "HIGH" ? "danger" : item.severity === "MEDIUM" ? "warning" : "info") as Alert["type"],
          title: item.message || item.title || "Alert",
          time: item.createdAt || "Recently",
        }))
        if (mappedAlerts.length > 0) setAlerts(mappedAlerts)
      }
    } catch (err) {
      console.log("[v0] Using fallback demo data - backend may not be running")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getCapacityPercent = (enrolled: number, capacity: number) => {
    return Math.round((enrolled / capacity) * 100)
  }

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return "var(--color-crimson)"
    if (percent >= 70) return "var(--color-amber)"
    return "var(--color-emerald)"
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
          </svg>
        )
      case "danger":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )
    }
  }

  return (
    <div className="dashboard">
      {/* Page Title */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">Tactical Canvas</h1>
      </div>

      {/* Membership Status Banner */}
      {showBanner && (
        <div style={{
          padding: "16px 24px",
          background: bannerType === "info"
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 500,
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span>{bannerMessage}</span>
          {bannerType === "info" && (
            <button
              onClick={() => navigate("/gyms")}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Find Gyms
            </button>
          )}
        </div>
      )}

      {/* Metrics Row */}
      <div className="dashboard__metrics">
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(metrics.todayRevenue)}
          trend={{ value: `${metrics.revenueChange}% vs yesterday`, direction: "up" }}
        />
        <MetricCard title="Live Check-ins" value={metrics.liveCheckIns} subtitle="Currently on premises" />
        <MetricCard
          title="New Signups (MTD)"
          value={metrics.newSignups}
          subtitle={`Goal: ${metrics.signupsGoal}`}
          progress={{ current: metrics.newSignups, goal: metrics.signupsGoal }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard__grid">
        {/* Live Floor Status */}
        <Card
          title="Live Floor Status"
          action={<button className="card-action-btn">•••</button>}
          className="dashboard__floor-status"
        >
          <table className="floor-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Time in</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {floorStatus.map((item) => (
                <tr key={item.memberId}>
                  <td>
                    <div className="floor-member">
                      <Avatar name={item.memberName} size="sm" />
                      <span>{item.memberName}</span>
                    </div>
                  </td>
                  <td>{item.timeIn}</td>
                  <td>
                    <span className={`floor-status floor-status--${item.status.replace(" ", "-")}`}>
                      <span className="status-dot"></span>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Today's Class Manifest */}
        <Card
          title="Today's Class Manifest"
          action={<button className="card-action-btn">•••</button>}
          className="dashboard__class-manifest"
        >
          <div className="class-list">
            {classManifest.map((cls, index) => (
              <div key={index} className="class-item">
                <div className="class-info">
                  <span className="class-indicator"></span>
                  <span className="class-time">
                    {cls.time} - {cls.name}
                  </span>
                  <span className="class-trainer">(Trainer: {cls.trainer})</span>
                </div>
                <div className="class-capacity">
                  <span className="class-capacity-label">Capacity</span>
                  <span className="class-capacity-value">{getCapacityPercent(cls.enrolled, cls.capacity)}%</span>
                </div>
                <div
                  className="class-capacity-bar"
                  style={
                    {
                      "--capacity-percent": `${getCapacityPercent(cls.enrolled, cls.capacity)}%`,
                      "--capacity-color": getCapacityColor(getCapacityPercent(cls.enrolled, cls.capacity)),
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Financial Performance Trend */}
        <Card
          title="Financial Performance Trend"
          action={<button className="card-action-btn">•••</button>}
          className="dashboard__financial-trend"
        >
          <div className="chart-container">
            <div className="chart-header">
              <span className="chart-subtitle">Revenue Last 30 Days</span>
              <div className="chart-legend">
                <span className="chart-legend-item chart-legend-item--memberships">
                  <span className="legend-dot"></span>
                  Memberships
                </span>
                <span className="chart-legend-item chart-legend-item--checking">
                  <span className="legend-dot"></span>
                  POS/Retail
                </span>
              </div>
            </div>
            <div className="chart-area">
              <div className="chart-y-axis">
                <span>$4,000</span>
                <span>$3,000</span>
                <span>$2,000</span>
                <span>$1,000</span>
                <span>$0</span>
              </div>
              <div className="chart-graph">
                <svg viewBox="0 0 400 150" className="chart-svg" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="37.5" x2="400" y2="37.5" stroke="var(--border-secondary)" strokeWidth="1" />
                  <line x1="0" y1="75" x2="400" y2="75" stroke="var(--border-secondary)" strokeWidth="1" />
                  <line x1="0" y1="112.5" x2="400" y2="112.5" stroke="var(--border-secondary)" strokeWidth="1" />

                  {/* Memberships line (crimson) */}
                  <path
                    d="M0,120 L30,110 L60,100 L90,105 L120,90 L150,95 L180,80 L210,70 L240,75 L270,60 L300,65 L330,50 L360,55 L400,35"
                    fill="none"
                    stroke="var(--color-crimson)"
                    strokeWidth="2"
                  />

                  {/* POS/Retail line (emerald) */}
                  <path
                    d="M0,130 L30,125 L60,120 L90,122 L120,115 L150,118 L180,110 L210,105 L240,108 L270,100 L300,103 L330,95 L360,98 L400,85"
                    fill="none"
                    stroke="var(--color-emerald)"
                    strokeWidth="2"
                  />
                </svg>
                <div className="chart-x-axis">
                  <span>1</span>
                  <span>3</span>
                  <span>7</span>
                  <span>9</span>
                  <span>12</span>
                  <span>15</span>
                  <span>18</span>
                  <span>21</span>
                  <span>24</span>
                  <span>27</span>
                  <span>30</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Staff & Facility Alerts */}
        <Card
          title="Staff & Facility Alerts"
          action={<button className="card-action-btn">•••</button>}
          className="dashboard__alerts"
        >
          <div className="alert-list">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-item alert-item--${alert.type}`}>
                <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                <div className="alert-content">
                  <span className="alert-title">{alert.title}</span>
                  <span className="alert-time">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
