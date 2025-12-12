"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MetricCard, Card, Avatar } from "../../components/ui"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import api from "../../services/api"
import "./Dashboard.css"

interface DashboardMetrics {
  todayRevenue: number
  revenueChange: number
  liveCheckIns: number
  newSignups: number
  signupsGoal: number
  criticalTasks: number
  totalMembers: number
  activeMembers: number
  monthlyRevenue: number
  averageSessionDuration: number
}

interface FloorStatus {
  memberId: number
  memberName: string
  timeIn: string
  status: "check-in" | "access denied" | "status"
  duration?: string
  membershipType?: string
}

interface ClassManifest {
  time: string
  name: string
  trainer: string
  capacity: number
  enrolled: number
  status: "upcoming" | "in-progress" | "completed"
}

interface Alert {
  id: number
  type: "warning" | "danger" | "info" | "success"
  title: string
  time: string
  description?: string
}

interface RevenueData {
  date: string
  memberships: number
  retail: number
  ptSessions: number
  total: number
}

interface MembershipDistribution {
  name: string
  value: number
  color: string
  [key: string]: any // Allow additional properties for chart compatibility
}

interface HourlyActivity {
  hour: string
  checkIns: number
  checkOuts: number
}

interface PerformanceMetric {
  name: string
  current: number
  target: number
  trend: 'up' | 'down' | 'neutral'
  percentage: number
}

interface RealtimeStats {
  currentOccupancy: number
  maxCapacity: number
  peakHour: string
  averageStayTime: number
  equipmentUtilization: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Banner state for membership status
  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState("")
  const [bannerType, setBannerType] = useState<"info" | "warning">("info")

  // Enhanced dashboard state
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayRevenue: 0,
    revenueChange: 0,
    liveCheckIns: 0,
    newSignups: 0,
    signupsGoal: 150,
    criticalTasks: 0,
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    averageSessionDuration: 0,
  })

  const [floorStatus, setFloorStatus] = useState<FloorStatus[]>([])
  const [classManifest, setClassManifest] = useState<ClassManifest[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [membershipDistribution, setMembershipDistribution] = useState<MembershipDistribution[]>([])
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
    currentOccupancy: 0,
    maxCapacity: 100,
    peakHour: '6:00 PM',
    averageStayTime: 65,
    equipmentUtilization: 78
  })
  const [loading, setLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24H' | '7D' | '30D'>('30D')

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
      // Try to fetch real data from backend with enhanced analytics
      const [statsData, floorData, alertsData, transactionsData, metricsData, membersData, sessionsData] = await Promise.allSettled([
        api.getStats(),
        api.getFloorStatus(),
        api.getDashboardAlerts(),
        api.getDashboardTransactions(),
        api.getDashboardMetrics(),
        api.getUsers('CUSTOMER'), // Get members for analytics
        api.getStats(), // Get additional stats for analytics
      ])

      // Update metrics with real-time calculations
      if (statsData.status === "fulfilled") {
        const stats = statsData.value
        
        // Calculate real-time metrics from actual data
        let realTimeRevenue = 2450.0
        let realTimeMembers = 450
        let realTimeActive = 38
        
        // If we have members data, calculate real metrics
        if (membersData.status === "fulfilled" && Array.isArray(membersData.value)) {
          const members = membersData.value
          realTimeMembers = members.length
          realTimeActive = members.filter((m: any) => m.status === 'ACTIVE').length
          
          // Calculate revenue based on membership types (mock calculation)
          realTimeRevenue = members.reduce((total: number, member: any) => {
            const membershipValue = member.membershipType === 'GOLD' ? 150 : 
                                  member.membershipType === 'SILVER' ? 100 : 
                                  member.membershipType === 'PLATINUM' ? 200 : 50
            return total + membershipValue
          }, 0)
        }
        
        setMetrics(prev => ({
          ...prev,
          todayRevenue: realTimeRevenue,
          revenueChange: 12.5,
          liveCheckIns: realTimeActive,
          newSignups: Math.floor(realTimeMembers * 0.1), // 10% new this month
          signupsGoal: 150,
          criticalTasks: stats.pendingSessions || 2,
          totalMembers: realTimeMembers,
          activeMembers: realTimeActive,
          monthlyRevenue: realTimeRevenue * 30, // Monthly projection
          averageSessionDuration: 65, // Mock value for now
        }))
      }

      // Generate enhanced floor status data
      if (floorData.status === "fulfilled" && Array.isArray(floorData.value)) {
        const mappedFloor: FloorStatus[] = floorData.value.map((item: any, idx: number) => ({
          memberId: item.userId || idx,
          memberName: item.memberName || item.fullName || `Member ${idx + 1}`,
          timeIn: item.checkInTime || new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: (item.status === "CHECKED_IN" ? "check-in" : item.status === "DENIED" ? "access denied" : "check-in") as FloorStatus["status"],
          duration: `${Math.floor(Math.random() * 120 + 15)}m`,
          membershipType: ['Gold', 'Silver', 'Platinum', 'Basic'][Math.floor(Math.random() * 4)]
        }))
        setFloorStatus(mappedFloor.length > 0 ? mappedFloor : generateMockFloorData())
      } else {
        setFloorStatus(generateMockFloorData())
      }

      // Generate enhanced alerts
      if (alertsData.status === "fulfilled" && Array.isArray(alertsData.value)) {
        const mappedAlerts: Alert[] = alertsData.value.map((item: any, idx: number) => ({
          id: item.id || idx,
          type: (item.severity === "HIGH" ? "danger" : item.severity === "MEDIUM" ? "warning" : "info") as Alert["type"],
          title: item.message || item.title || "System Alert",
          time: item.createdAt || "Recently",
          description: item.description
        }))
        setAlerts(mappedAlerts.length > 0 ? mappedAlerts : generateMockAlerts())
      } else {
        setAlerts(generateMockAlerts())
      }

      // Generate enhanced analytics data
      setRevenueData(generateRevenueData(selectedTimeRange))
      setMembershipDistribution(generateMembershipDistribution())
      setHourlyActivity(generateHourlyActivity())
      setClassManifest(generateClassManifest())
      setPerformanceMetrics(generatePerformanceMetrics())
      setRealtimeStats(generateRealtimeStats())

    } catch (err) {
      console.log("[Dashboard] Using demo data - backend may not be running")
      // Load demo data
      loadDemoData()
    setPerformanceMetrics(generatePerformanceMetrics())
    setRealtimeStats(generateRealtimeStats())
    } finally {
      setLoading(false)
    }
  }, [])

  // Generate mock data functions
  const generateMockFloorData = (): FloorStatus[] => {
    const names = ['John Smith', 'Sarah Wilson', 'Mike Johnson', 'Emily Davis', 'Alex Chen', 'Lisa Brown', 'David Miller', 'Jessica Taylor']
    return names.slice(0, 6).map((name, idx) => ({
      memberId: idx + 1,
      memberName: name,
      timeIn: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: Math.random() > 0.1 ? "check-in" : "access denied" as FloorStatus["status"],
      duration: `${Math.floor(Math.random() * 120 + 15)}m`,
      membershipType: ['Gold', 'Silver', 'Platinum', 'Basic'][Math.floor(Math.random() * 4)]
    }))
  }

  const generateMockAlerts = (): Alert[] => [
    { id: 1, type: "warning", title: "Equipment Maintenance Due", time: "15 min ago", description: "Treadmill #3 requires scheduled maintenance" },
    { id: 2, type: "info", title: "New Member Registration", time: "32 min ago", description: "Sarah Connor joined with Gold membership" },
    { id: 3, type: "success", title: "Monthly Target Achieved", time: "1 hour ago", description: "Revenue target for December reached" },
    { id: 4, type: "danger", title: "Payment Failed", time: "2 hours ago", description: "Auto-renewal failed for 3 members" }
  ]

  const generateRevenueData = (timeRange: '24H' | '7D' | '30D'): RevenueData[] => {
    const data = []
    const days = timeRange === '24H' ? 1 : timeRange === '7D' ? 7 : 30
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Generate more realistic data with trends
      const baseMultiplier = timeRange === '24H' ? 0.1 : 1
      const weekendBoost = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1
      
      data.push({
        date: timeRange === '24H' 
          ? date.toLocaleTimeString('en-US', { hour: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        memberships: Math.floor((Math.random() * 2000 + 1000) * baseMultiplier * weekendBoost),
        retail: Math.floor((Math.random() * 500 + 200) * baseMultiplier * weekendBoost),
        ptSessions: Math.floor((Math.random() * 800 + 300) * baseMultiplier * weekendBoost),
        total: 0
      })
    }
    return data.map(item => ({ ...item, total: item.memberships + item.retail + item.ptSessions }))
  }

  const generatePerformanceMetrics = (): PerformanceMetric[] => [
    { name: 'Member Retention', current: 92, target: 95, trend: 'up', percentage: 3.2 },
    { name: 'Equipment Uptime', current: 98, target: 99, trend: 'up', percentage: 1.5 },
    { name: 'Class Attendance', current: 85, target: 90, trend: 'down', percentage: -2.1 },
    { name: 'Revenue Growth', current: 112, target: 110, trend: 'up', percentage: 8.7 },
  ]

  const generateRealtimeStats = (): RealtimeStats => ({
    currentOccupancy: Math.floor(Math.random() * 80 + 20),
    maxCapacity: 100,
    peakHour: ['6:00 PM', '7:00 AM', '12:00 PM', '8:00 PM'][Math.floor(Math.random() * 4)],
    averageStayTime: Math.floor(Math.random() * 30 + 45),
    equipmentUtilization: Math.floor(Math.random() * 20 + 70)
  })

  const generateMembershipDistribution = (): MembershipDistribution[] => [
    { name: 'Gold', value: 35, color: '#DC2626' },
    { name: 'Silver', value: 28, color: '#F59E0B' },
    { name: 'Platinum', value: 22, color: '#10B981' },
    { name: 'Basic', value: 15, color: '#3B82F6' }
  ]

  const generateHourlyActivity = (): HourlyActivity[] => {
    const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM']
    return hours.map(hour => ({
      hour,
      checkIns: Math.floor(Math.random() * 15 + 5),
      checkOuts: Math.floor(Math.random() * 12 + 3)
    }))
  }

  const generateClassManifest = (): ClassManifest[] => [
    { time: "9:00 AM", name: "HIIT Burn", trainer: "Sarah Wilson", capacity: 20, enrolled: 18, status: "in-progress" },
    { time: "11:00 AM", name: "Yoga Flow", trainer: "Mike Johnson", capacity: 15, enrolled: 12, status: "upcoming" },
    { time: "2:00 PM", name: "Strength Training", trainer: "Emily Davis", capacity: 25, enrolled: 22, status: "upcoming" },
    { time: "6:00 PM", name: "Cardio Blast", trainer: "Alex Chen", capacity: 30, enrolled: 28, status: "upcoming" }
  ]

  const loadDemoData = () => {
    setMetrics({
      todayRevenue: 2450,
      revenueChange: 12.5,
      liveCheckIns: 38,
      newSignups: 127,
      signupsGoal: 150,
      criticalTasks: 2,
      totalMembers: 450,
      activeMembers: 38,
      monthlyRevenue: 45000,
      averageSessionDuration: 65,
    })
    setFloorStatus(generateMockFloorData())
    setAlerts(generateMockAlerts())
    setRevenueData(generateRevenueData('30D'))
    setMembershipDistribution(generateMembershipDistribution())
    setHourlyActivity(generateHourlyActivity())
    setClassManifest(generateClassManifest())
    setPerformanceMetrics(generatePerformanceMetrics())
    setRealtimeStats(generateRealtimeStats())
  }

  useEffect(() => {
    loadDashboardData()
    
    // Set up real-time updates every 15 seconds for more responsive data
    const interval = setInterval(() => {
      loadDashboardData()
    }, 15000)
    
    setRefreshInterval(interval)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loadDashboardData, selectedTimeRange])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) clearInterval(refreshInterval)
    }
  }, [refreshInterval])

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

  // Get user role for RBAC
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      // V1 Pivot: Only handle STAFF context
      if (user.context === 'STAFF') return user.staffRole || 'TRAINER';
      return 'TRAINER'; // Default
    } catch (e) { return 'TRAINER'; }
  };
  const role = getUserRole();
  const isOwner = role === 'OWNER';
  const isStaff = true; // Always true for V1 Dashboard access

  return (
    <div className="dashboard">
      {/* Page Header with Real-time Indicator */}
      <div className="dashboard__header">
        <div className="dashboard__title-section">
          <h1 className="dashboard__title">Analytics Dashboard</h1>
          <div className="dashboard__live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">Live Data</span>
            <span className="last-updated">Updated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <button 
          className={`dashboard__refresh-btn ${loading ? 'loading' : ''}`}
          onClick={() => loadDashboardData()}
          disabled={loading}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={loading ? 'spinning' : ''}
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Membership Status Banner */}
      {showBanner && (
        <div className="dashboard__banner">
          <span>{bannerMessage}</span>
          {bannerType === "info" && (
            <button onClick={() => navigate("/gyms")} className="banner-action-btn">
              Find Gyms
            </button>
          )}
        </div>
      )}

      {/* Enhanced Metrics Row */}
      <div className="dashboard__metrics">
        {isOwner && (
          <>
            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(metrics.todayRevenue)}
              trend={{ value: `${metrics.revenueChange}% vs yesterday`, direction: "up" }}
            />
            <MetricCard
              title="Monthly Revenue"
              value={formatCurrency(metrics.monthlyRevenue)}
              subtitle="December 2024"
            />
          </>
        )}
        
        {isStaff && (
          <>
            <MetricCard 
              title="Live Check-ins" 
              value={metrics.liveCheckIns} 
              subtitle="Currently active"
              trend={{ value: `${metrics.activeMembers} total active`, direction: "neutral" }}
            />
            <MetricCard
              title="New Signups (MTD)"
              value={metrics.newSignups}
              subtitle={`Goal: ${metrics.signupsGoal}`}
              progress={{ current: metrics.newSignups, goal: metrics.signupsGoal }}
            />
            <MetricCard
              title="Avg Session Duration"
              value={`${metrics.averageSessionDuration}m`}
              subtitle="This month"
              trend={{ value: "+5m vs last month", direction: "up" }}
            />
          </>
        )}
      </div>

      {/* Real-time Performance Metrics */}
      {isStaff && (
        <Card
          title="Real-time Performance"
          className="dashboard__performance-metrics"
        >
          <div className="performance-grid">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="performance-card">
                <div className="performance-header">
                  <span className="performance-name">{metric.name}</span>
                  <span className={`performance-trend performance-trend--${metric.trend}`}>
                    {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.percentage}%
                  </span>
                </div>
                <div className="performance-value">
                  {metric.current}%
                </div>
                <div className="performance-progress">
                  <div 
                    className="performance-progress-fill"
                    style={{ width: `${(metric.current / metric.target) * 100}%` }}
                  />
                </div>
                <div className="performance-target">Target: {metric.target}%</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Real-time Occupancy Widget */}
      {isStaff && (
        <Card
          title="Live Gym Status"
          className="dashboard__occupancy-widget"
        >
          <div className="occupancy-display">
            <div className="occupancy-main">
              <div className="occupancy-number">{realtimeStats.currentOccupancy}</div>
              <div className="occupancy-label">Current Occupancy</div>
            </div>
            <div className="occupancy-stats">
              <div className="occupancy-stat">
                <span className="stat-label">Capacity</span>
                <span className="stat-value">{realtimeStats.maxCapacity}</span>
              </div>
              <div className="occupancy-stat">
                <span className="stat-label">Peak Hour</span>
                <span className="stat-value">{realtimeStats.peakHour}</span>
              </div>
              <div className="occupancy-stat">
                <span className="stat-label">Avg Stay</span>
                <span className="stat-value">{realtimeStats.averageStayTime}m</span>
              </div>
              <div className="occupancy-stat">
                <span className="stat-label">Equipment</span>
                <span className="stat-value">{realtimeStats.equipmentUtilization}%</span>
              </div>
            </div>
            <div className="occupancy-bar">
              <div 
                className="occupancy-fill"
                style={{ 
                  width: `${(realtimeStats.currentOccupancy / realtimeStats.maxCapacity) * 100}%`,
                  backgroundColor: realtimeStats.currentOccupancy > 80 ? '#DC2626' : 
                                 realtimeStats.currentOccupancy > 60 ? '#F59E0B' : '#10B981'
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Main Content Grid */}
      <div className="dashboard__enhanced-grid">
        {/* Revenue Analytics Chart - OWNER ONLY */}
        {isOwner && (
          <Card
            title="Revenue Analytics"
            action={
              <div className="chart-controls">
                <button 
                  className={`chart-control-btn ${selectedTimeRange === '30D' ? 'active' : ''}`}
                  onClick={() => setSelectedTimeRange('30D')}
                >
                  30D
                </button>
                <button 
                  className={`chart-control-btn ${selectedTimeRange === '7D' ? 'active' : ''}`}
                  onClick={() => setSelectedTimeRange('7D')}
                >
                  7D
                </button>
                <button 
                  className={`chart-control-btn ${selectedTimeRange === '24H' ? 'active' : ''}`}
                  onClick={() => setSelectedTimeRange('24H')}
                >
                  24H
                </button>
              </div>
            }
            className="dashboard__revenue-chart"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value: number, name: string) => [`₹${value}`, name]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#DC2626"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Revenue"
                />
                <Line type="monotone" dataKey="memberships" stroke="#10B981" name="Memberships" />
                <Line type="monotone" dataKey="ptSessions" stroke="#F59E0B" name="PT Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Membership Distribution - OWNER ONLY */}
        {isOwner && (
          <Card
            title="Membership Distribution"
            className="dashboard__membership-pie"
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={membershipDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {membershipDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Hourly Activity Chart - STAFF ONLY */}
        {isStaff && (
          <Card
            title="Today's Activity Pattern"
            className="dashboard__activity-chart"
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Legend />
                <Bar dataKey="checkIns" fill="#10B981" name="Check-ins" />
                <Bar dataKey="checkOuts" fill="#F59E0B" name="Check-outs" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Enhanced Live Floor Status - STAFF ONLY */}
        {isStaff && (
          <Card
            title="Live Floor Status"
            action={
              <div className="floor-status-controls">
                <span className="active-count">{floorStatus.length} Active</span>
                <button className="card-action-btn">•••</button>
              </div>
            }
            className="dashboard__floor-status"
          >
            <div className="floor-status-enhanced">
              {floorStatus.map((item) => (
                <div key={item.memberId} className="floor-member-card">
                  <div className="member-info">
                    <Avatar name={item.memberName} size="sm" />
                    <div className="member-details">
                      <span className="member-name">{item.memberName}</span>
                      <span className="member-type">{item.membershipType}</span>
                    </div>
                  </div>
                  <div className="member-activity">
                    <span className="check-in-time">{item.timeIn}</span>
                    <span className="duration">{item.duration}</span>
                  </div>
                  <span className={`member-status member-status--${item.status.replace(" ", "-")}`}>
                    <span className="status-dot"></span>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Enhanced Class Schedule */}
        <Card
          title="Today's Classes"
          action={<button className="card-action-btn">View All</button>}
          className="dashboard__class-schedule"
        >
          <div className="class-schedule-enhanced">
            {classManifest.map((cls, index) => (
              <div key={index} className={`class-card class-card--${cls.status}`}>
                <div className="class-header">
                  <div className="class-time-info">
                    <span className="class-time">{cls.time}</span>
                    <span className={`class-status-badge class-status-badge--${cls.status}`}>
                      {cls.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="class-capacity-info">
                    <span className="capacity-text">{cls.enrolled}/{cls.capacity}</span>
                    <div className="capacity-bar">
                      <div 
                        className="capacity-fill" 
                        style={{ 
                          width: `${getCapacityPercent(cls.enrolled, cls.capacity)}%`,
                          backgroundColor: getCapacityColor(getCapacityPercent(cls.enrolled, cls.capacity))
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="class-details">
                  <h4 className="class-name">{cls.name}</h4>
                  <span className="class-trainer">with {cls.trainer}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Enhanced Alerts & Notifications */}
        <Card
          title="System Alerts"
          action={
            <div className="alerts-controls">
              <span className="alert-count">{alerts.filter(a => a.type === 'danger' || a.type === 'warning').length} Active</span>
              <button className="card-action-btn">•••</button>
            </div>
          }
          className="dashboard__alerts-enhanced"
        >
          <div className="alerts-enhanced">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-card alert-card--${alert.type}`}>
                <div className="alert-header">
                  <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                  <div className="alert-info">
                    <span className="alert-title">{alert.title}</span>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                  <button className="alert-dismiss">×</button>
                </div>
                {alert.description && (
                  <p className="alert-description">{alert.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
