"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
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
  Legend,
  Line
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  UserMinus,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Target,
  Award,
  Calendar,
  RefreshCw,
  X,
  Zap,
  ShoppingBag,
  CreditCard,
  BarChart3,
  PieChart as PieChartIcon,
  Dumbbell,
  MapPin,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import api from "../../services/api"
import "./Dashboard.css"

interface FinancialMetrics {
  todayRevenue: number
  revenueChange: number
  monthlyRevenue: number
  monthlyTarget: number
  netProfit: number
  profitMargin: number
  outstandingDues: number
  duesCount: number
  ptRevenue: number
  ptChange: number
}

interface MembershipMetrics {
  totalActive: number
  newSignups: number
  renewals: number
  churned: number
  frozen: number
  churnRate: number
  conversionRate: number
}

interface MembershipDistribution {
  name: string
  value: number
  count: number
  color: string
}

interface TrainerData {
  name: string
  role: string
  revenue: number
  sessions: number
  retention: number
}

interface FloorMember {
  id: number
  name: string
  type: string
  checkIn: string
  duration: string
  status: 'active' | 'denied'
}

interface ClassData {
  time: string
  name: string
  trainer: string
  enrolled: number
  capacity: number
  status: 'in-progress' | 'upcoming'
}

interface Alert {
  id: number
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  description: string
  time: string
}

interface Insight {
  type: 'critical' | 'warning' | 'opportunity' | 'info'
  category: string
  title: string
  description: string
}

interface RevenueData {
  date: string
  memberships: number
  ptSessions: number
  retail: number
  total: number
}

interface GymStatus {
  currentOccupancy: number
  maxCapacity: number
  peakHour: string
  avgStayTime: number
  equipmentUtil: number
}

interface RetailProduct {
  name: string
  sold: number
  revenue: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [showBanner, setShowBanner] = useState(false)
  const [bannerMessage, setBannerMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24H' | '7D' | '30D'>('30D')

  const [financial, setFinancial] = useState<FinancialMetrics>({
    todayRevenue: 0,
    revenueChange: 0,
    monthlyRevenue: 0,
    monthlyTarget: 200000,
    netProfit: 0,
    profitMargin: 0,
    outstandingDues: 0,
    duesCount: 0,
    ptRevenue: 0,
    ptChange: 0
  })

  const [membership, setMembership] = useState<MembershipMetrics>({
    totalActive: 0,
    newSignups: 0,
    renewals: 0,
    churned: 0,
    frozen: 0,
    churnRate: 0,
    conversionRate: 0
  })

  const [distribution, setDistribution] = useState<MembershipDistribution[]>([])
  const [trainers, setTrainers] = useState<TrainerData[]>([])
  const [floorMembers, setFloorMembers] = useState<FloorMember[]>([])
  const [classes, setClasses] = useState<ClassData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [gymStatus, setGymStatus] = useState<GymStatus>({
    currentOccupancy: 0,
    maxCapacity: 100,
    peakHour: '6:00 PM',
    avgStayTime: 65,
    equipmentUtil: 78
  })
  const [retailProducts, setRetailProducts] = useState<RetailProduct[]>([])

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.membershipStatus === "PENDING") {
          setShowBanner(true)
          setBannerMessage("Your membership is pending approval.")
        }
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
  }, [searchParams])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, membersData] = await Promise.allSettled([
        api.getStats(),
        api.getUsers('CUSTOMER')
      ])

      let memberCount = 450
      let activeCount = 420
      if (membersData.status === "fulfilled" && Array.isArray(membersData.value)) {
        memberCount = membersData.value.length
        activeCount = membersData.value.filter((m: any) => m.status === 'ACTIVE').length
      }

      setFinancial({
        todayRevenue: 5150,
        revenueChange: 12.5,
        monthlyRevenue: 154500,
        monthlyTarget: 200000,
        netProfit: 42350,
        profitMargin: 27.4,
        outstandingDues: 18500,
        duesCount: 12,
        ptRevenue: 45200,
        ptChange: 8.3
      })

      setMembership({
        totalActive: activeCount,
        newSignups: 28,
        renewals: 45,
        churned: 8,
        frozen: 15,
        churnRate: 1.9,
        conversionRate: 68
      })

      setDistribution([
        { name: 'Platinum', value: 22, count: 92, color: '#a855f7' },
        { name: 'Gold', value: 35, count: 147, color: '#f59e0b' },
        { name: 'Silver', value: 28, count: 118, color: '#64748b' },
        { name: 'Basic', value: 15, count: 63, color: '#3b82f6' }
      ])

      setTrainers([
        { name: 'Rahul Sharma', role: 'Senior Trainer', revenue: 82500, sessions: 156, retention: 94 },
        { name: 'Priya Patel', role: 'PT Specialist', revenue: 67200, sessions: 128, retention: 91 },
        { name: 'Amit Kumar', role: 'Fitness Coach', revenue: 54800, sessions: 112, retention: 88 },
        { name: 'Sneha Gupta', role: 'Yoga Instructor', revenue: 42100, sessions: 98, retention: 92 }
      ])

      setFloorMembers([
        { id: 1, name: 'Arjun Mehta', type: 'Platinum', checkIn: '03:18 PM', duration: '45m', status: 'active' },
        { id: 2, name: 'Kavita Singh', type: 'Gold', checkIn: '03:56 PM', duration: '38m', status: 'active' },
        { id: 3, name: 'Raj Patel', type: 'Basic', checkIn: '04:09 PM', duration: '15m', status: 'active' },
        { id: 4, name: 'Meera Joshi', type: 'Silver', checkIn: '03:31 PM', duration: '52m', status: 'denied' },
        { id: 5, name: 'Vikram Rao', type: 'Gold', checkIn: '03:47 PM', duration: '42m', status: 'active' }
      ])

      setClasses([
        { time: '9:00 AM', name: 'HIIT Burn', trainer: 'Rahul Sharma', enrolled: 18, capacity: 20, status: 'in-progress' },
        { time: '11:00 AM', name: 'Yoga Flow', trainer: 'Sneha Gupta', enrolled: 12, capacity: 15, status: 'upcoming' },
        { time: '2:00 PM', name: 'Strength Training', trainer: 'Amit Kumar', enrolled: 22, capacity: 25, status: 'upcoming' },
        { time: '6:00 PM', name: 'Cardio Blast', trainer: 'Priya Patel', enrolled: 28, capacity: 30, status: 'upcoming' }
      ])

      setAlerts([
        { id: 1, type: 'critical', title: 'Churn Risk Detected', description: '5 high-value members showing low engagement', time: '10 min ago' },
        { id: 2, type: 'warning', title: 'Equipment Maintenance Due', description: 'Treadmill #3 requires scheduled maintenance', time: '25 min ago' },
        { id: 3, type: 'info', title: '12 Memberships Expiring', description: 'Members need renewal reminders this week', time: '1 hour ago' },
        { id: 4, type: 'success', title: 'Revenue Target 77% Complete', description: 'On track to exceed monthly goal', time: '2 hours ago' }
      ])

      setInsights([
        { type: 'critical', category: 'Retention', title: 'Churn spike in Silver tier', description: '3x higher churn than last month. Consider targeted retention offers.' },
        { type: 'warning', category: 'Revenue', title: '9 AM classes underperforming', description: 'Move popular classes to 7 AM slot based on traffic patterns.' },
        { type: 'opportunity', category: 'Upsell', title: '45 members ready for PT upgrade', description: 'High engagement members likely to convert to PT packages.' },
        { type: 'info', category: 'Operations', title: 'Peak hour shifting earlier', description: 'Evening rush now starts at 5 PM instead of 6 PM.' }
      ])

      setRevenueData(generateRevenueData(selectedTimeRange))

      setGymStatus({
        currentOccupancy: Math.floor(Math.random() * 30 + 35),
        maxCapacity: 100,
        peakHour: '6:00 PM',
        avgStayTime: 71,
        equipmentUtil: 73
      })

      setRetailProducts([
        { name: 'Whey Protein', sold: 45, revenue: 67500 },
        { name: 'Creatine', sold: 32, revenue: 25600 },
        { name: 'Energy Bars', sold: 128, revenue: 12800 },
        { name: 'BCAA', sold: 28, revenue: 22400 }
      ])

    } catch (err) {
      console.log("[Dashboard] Using demo data")
    } finally {
      setLoading(false)
    }
  }, [selectedTimeRange])

  const generateRevenueData = (timeRange: '24H' | '7D' | '30D'): RevenueData[] => {
    const data = []
    const days = timeRange === '24H' ? 24 : timeRange === '7D' ? 7 : 30
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      if (timeRange === '24H') {
        date.setHours(date.getHours() - i)
      } else {
        date.setDate(date.getDate() - i)
      }
      
      const mult = timeRange === '24H' ? 0.1 : 1
      const weekend = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1
      
      data.push({
        date: timeRange === '24H'
          ? date.toLocaleTimeString('en-US', { hour: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        memberships: Math.floor((Math.random() * 3000 + 2000) * mult * weekend),
        ptSessions: Math.floor((Math.random() * 1500 + 800) * mult * weekend),
        retail: Math.floor((Math.random() * 800 + 300) * mult * weekend),
        total: 0
      })
    }
    return data.map(item => ({ ...item, total: item.memberships + item.ptSessions + item.retail }))
  }

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [loadDashboardData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return "#ef4444"
    if (percent >= 70) return "#f59e0b"
    return "#00ff88"
  }

  const getOccupancyColor = (current: number, max: number) => {
    const pct = (current / max) * 100
    if (pct > 80) return '#ef4444'
    if (pct > 60) return '#f59e0b'
    return '#00ff88'
  }

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle />
      case 'warning': return <AlertTriangle />
      case 'success': return <CheckCircle />
      default: return <Info />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle />
      case 'warning': return <AlertTriangle />
      case 'opportunity': return <TrendingUp />
      default: return <Info />
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__title-section">
          <h1 className="dashboard__title">Business Dashboard</h1>
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
          <RefreshCw className={loading ? 'spinning' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {showBanner && (
        <div className="dashboard__banner">
          <span>{bannerMessage}</span>
          <button onClick={() => navigate("/gyms")} className="banner-action-btn">
            Find Gyms
          </button>
        </div>
      )}

      <div className="financial-strip">
        <div className="financial-card financial-card--revenue">
          <div className="financial-icon">
            <DollarSign />
          </div>
          <div className="financial-content">
            <span className="financial-label">Today's Revenue</span>
            <span className="financial-value">{formatCurrency(financial.todayRevenue)}</span>
            <span className={`financial-change ${financial.revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {financial.revenueChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(financial.revenueChange)}% vs yesterday
            </span>
          </div>
        </div>

        <div className="financial-card financial-card--monthly">
          <div className="financial-icon">
            <BarChart3 />
          </div>
          <div className="financial-content">
            <span className="financial-label">Monthly Revenue</span>
            <span className="financial-value">{formatCurrency(financial.monthlyRevenue)}</span>
            <span className="financial-sub">{Math.round((financial.monthlyRevenue / financial.monthlyTarget) * 100)}% of target</span>
          </div>
        </div>

        <div className="financial-card financial-card--profit">
          <div className="financial-icon">
            <TrendingUp />
          </div>
          <div className="financial-content">
            <span className="financial-label">Net Profit</span>
            <span className="financial-value">{formatCurrency(financial.netProfit)}</span>
            <span className="financial-change positive">
              <ArrowUpRight size={14} /> {financial.profitMargin}% margin
            </span>
          </div>
        </div>

        <div className="financial-card financial-card--dues">
          <div className="financial-icon">
            <CreditCard />
          </div>
          <div className="financial-content">
            <span className="financial-label">Outstanding Dues</span>
            <span className="financial-value">{formatCurrency(financial.outstandingDues)}</span>
            <span className="financial-sub">{financial.duesCount} members pending</span>
          </div>
        </div>

        <div className="financial-card financial-card--pt">
          <div className="financial-icon">
            <Dumbbell />
          </div>
          <div className="financial-content">
            <span className="financial-label">PT Revenue</span>
            <span className="financial-value">{formatCurrency(financial.ptRevenue)}</span>
            <span className={`financial-change ${financial.ptChange >= 0 ? 'positive' : 'negative'}`}>
              {financial.ptChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(financial.ptChange)}% this month
            </span>
          </div>
        </div>
      </div>

      <div className="insights-strip">
        {insights.map((insight, idx) => (
          <div key={idx} className={`insight-card insight-card--${insight.type}`}>
            <div className="insight-card__header">
              <div className="insight-card__icon">
                {getInsightIcon(insight.type)}
              </div>
              <span className="insight-card__category">{insight.category}</span>
            </div>
            <div className="insight-card__title">{insight.title}</div>
            <div className="insight-card__desc">{insight.description}</div>
          </div>
        ))}
      </div>

      <div className="dashboard__grid">
        <div className="dash-card">
          <div className="dash-card__header">
            <div className="dash-card__title">
              <Activity size={18} />
              Live Gym Status
            </div>
            <span className="dash-card__badge">{gymStatus.currentOccupancy} Active</span>
          </div>
          <div className="gym-status">
            <div className="occupancy-display">
              <div className="occupancy-number" style={{ color: getOccupancyColor(gymStatus.currentOccupancy, gymStatus.maxCapacity) }}>
                {gymStatus.currentOccupancy}
              </div>
              <div className="occupancy-label">Current Occupancy</div>
              <div className="occupancy-bar">
                <div
                  className="occupancy-fill"
                  style={{
                    width: `${(gymStatus.currentOccupancy / gymStatus.maxCapacity) * 100}%`,
                    backgroundColor: getOccupancyColor(gymStatus.currentOccupancy, gymStatus.maxCapacity)
                  }}
                />
              </div>
            </div>
            <div className="gym-stats">
              <div className="gym-stat">
                <div className="gym-stat__value">{gymStatus.maxCapacity}</div>
                <div className="gym-stat__label">Capacity</div>
              </div>
              <div className="gym-stat">
                <div className="gym-stat__value">{gymStatus.peakHour}</div>
                <div className="gym-stat__label">Peak Hour</div>
              </div>
              <div className="gym-stat">
                <div className="gym-stat__value">{gymStatus.avgStayTime}m</div>
                <div className="gym-stat__label">Avg Stay</div>
              </div>
              <div className="gym-stat">
                <div className="gym-stat__value">{gymStatus.equipmentUtil}%</div>
                <div className="gym-stat__label">Equipment</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <div className="dash-card__title">
              <Users size={18} />
              Membership Performance
            </div>
          </div>
          <div className="membership-grid">
            <div className="membership-stat membership-stat--active">
              <div className="membership-stat__value">{membership.totalActive}</div>
              <div className="membership-stat__label">Active Members</div>
              <div className="membership-stat__change positive">
                <ArrowUpRight size={12} /> {membership.conversionRate}% conversion
              </div>
            </div>
            <div className="membership-stat membership-stat--new">
              <div className="membership-stat__value">{membership.newSignups}</div>
              <div className="membership-stat__label">New Signups</div>
              <div className="membership-stat__change positive">This month</div>
            </div>
            <div className="membership-stat membership-stat--churn">
              <div className="membership-stat__value">{membership.churned}</div>
              <div className="membership-stat__label">Churned</div>
              <div className="membership-stat__change negative">
                <ArrowDownRight size={12} /> {membership.churnRate}% rate
              </div>
            </div>
            <div className="membership-stat membership-stat--freeze">
              <div className="membership-stat__value">{membership.frozen}</div>
              <div className="membership-stat__label">Frozen</div>
              <div className="membership-stat__change">Active freezes</div>
            </div>
          </div>
        </div>

        <div className="dash-card dash-card--span2">
          <div className="dash-card__header">
            <div className="dash-card__title">
              <TrendingUp size={18} />
              Revenue Analytics
            </div>
            <div className="chart-controls">
              <button className={`chart-btn ${selectedTimeRange === '30D' ? 'chart-btn--active' : ''}`} onClick={() => setSelectedTimeRange('30D')}>30D</button>
              <button className={`chart-btn ${selectedTimeRange === '7D' ? 'chart-btn--active' : ''}`} onClick={() => setSelectedTimeRange('7D')}>7D</button>
              <button className={`chart-btn ${selectedTimeRange === '24H' ? 'chart-btn--active' : ''}`} onClick={() => setSelectedTimeRange('24H')}>24H</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', color: '#fff' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Legend />
              <Area type="monotone" dataKey="total" stroke="#00ff88" fillOpacity={1} fill="url(#colorTotal)" name="Total Revenue" />
              <Line type="monotone" dataKey="memberships" stroke="#3b82f6" name="Memberships" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ptSessions" stroke="#a855f7" name="PT Sessions" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <div className="dash-card__title">
              <PieChartIcon size={18} />
              Membership Distribution
            </div>
          </div>
          <div className="distribution-chart">
            <div className="pie-container">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '10px', color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="distribution-legend">
              {distribution.map((item, idx) => (
                <div key={idx} className="legend-row">
                  <div className="legend-dot" style={{ backgroundColor: item.color }} />
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-value">{item.count}</span>
                  <span className="legend-percent">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <div className="dash-card__title">
              <Award size={18} />
              Trainer Leaderboard
            </div>
          </div>
          <div className="trainer-list">
            {trainers.map((trainer, idx) => (
              <div key={idx} className={`trainer-row ${idx === 0 ? 'trainer-row--gold' : idx === 1 ? 'trainer-row--silver' : idx === 2 ? 'trainer-row--bronze' : ''}`}>
                <div className="trainer-rank">{idx + 1}</div>
                <div className="trainer-info">
                  <span className="trainer-name">{trainer.name}</span>
                  <span className="trainer-role">{trainer.role}</span>
                </div>
                <div className="trainer-metrics">
                  <div className="trainer-metric">
                    <span className="trainer-metric__value revenue">{formatCurrency(trainer.revenue)}</span>
                    <span className="trainer-metric__label">Revenue</span>
                  </div>
                  <div className="trainer-metric">
                    <span className="trainer-metric__value sessions">{trainer.sessions}</span>
                    <span className="trainer-metric__label">Sessions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <div className="dash-card__title">
              <MapPin size={18} />
              Live Floor Status
            </div>
            <span className="dash-card__badge">{floorMembers.filter(m => m.status === 'active').length} Active</span>
          </div>
          <div className="floor-list">
            {floorMembers.map((member) => (
              <div key={member.id} className="floor-member">
                <div className="floor-member__info">
                  <div className="floor-member__avatar">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="floor-member__details">
                    <span className="floor-member__name">{member.name}</span>
                    <span className="floor-member__type">{member.type}</span>
                  </div>
                </div>
                <div className="floor-member__time">
                  <span className="floor-member__checkin">{member.checkIn}</span>
                  <span className="floor-member__duration">{member.duration}</span>
                </div>
                <div className={`floor-member__status floor-member__status--${member.status}`}>
                  <span className="status-dot" />
                  {member.status === 'active' ? 'check-in' : 'denied'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <div className="dash-card__title">
              <Calendar size={18} />
              Today's Classes
            </div>
            <button className="dash-card__action">View All</button>
          </div>
          <div className="classes-list">
            {classes.map((cls, idx) => (
              <div key={idx} className={`class-item class-item--${cls.status === 'in-progress' ? 'progress' : 'upcoming'}`}>
                <div className="class-item__header">
                  <div className="class-item__time-section">
                    <span className="class-item__time">{cls.time}</span>
                    <span className={`class-item__badge class-item__badge--${cls.status === 'in-progress' ? 'progress' : 'upcoming'}`}>
                      {cls.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>
                  <div className="class-item__capacity">
                    <span className="class-item__count">{cls.enrolled}/{cls.capacity}</span>
                    <div className="capacity-bar">
                      <div
                        className="capacity-fill"
                        style={{
                          width: `${(cls.enrolled / cls.capacity) * 100}%`,
                          backgroundColor: getCapacityColor((cls.enrolled / cls.capacity) * 100)
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="class-item__details">
                  <span className="class-item__name">{cls.name}</span>
                  <span className="class-item__trainer">with {cls.trainer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <div className="alerts-header">
              <div className="dash-card__title">
                <AlertTriangle size={18} />
                System Alerts
              </div>
              <span className="alerts-count">{alerts.filter(a => a.type === 'critical' || a.type === 'warning').length}</span>
            </div>
          </div>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-item alert-item--${alert.type}`}>
                <div className="alert-item__header">
                  <div className="alert-item__icon">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="alert-item__content">
                    <div className="alert-item__title">{alert.title}</div>
                    <div className="alert-item__desc">{alert.description}</div>
                    <div className="alert-item__time">{alert.time}</div>
                  </div>
                  <button className="alert-item__dismiss" onClick={() => dismissAlert(alert.id)}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <div className="dash-card__title">
              <ShoppingBag size={18} />
              Supplement Sales
            </div>
          </div>
          <div className="retail-stats">
            <div className="retail-stat">
              <div className="retail-stat__value">{formatCurrency(retailProducts.reduce((sum, p) => sum + p.revenue, 0))}</div>
              <div className="retail-stat__label">Total Revenue</div>
            </div>
            <div className="retail-stat">
              <div className="retail-stat__value">{retailProducts.reduce((sum, p) => sum + p.sold, 0)}</div>
              <div className="retail-stat__label">Units Sold</div>
            </div>
            <div className="retail-stat">
              <div className="retail-stat__value">{retailProducts.length}</div>
              <div className="retail-stat__label">Products</div>
            </div>
          </div>
          <div className="retail-products">
            {retailProducts.map((product, idx) => (
              <div key={idx} className="retail-product">
                <span className="retail-product__name">{product.name}</span>
                <span className="retail-product__sold">{product.sold} sold</span>
                <span className="retail-product__revenue">{formatCurrency(product.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
