import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  IndianRupee,
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MoreVertical,
  Plus,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  PieChart as PieChartIcon,
  ShoppingCart,
  Printer,
  Bell,
  Search,
  ChevronDown,
  Facebook,
  Linkedin,
  Instagram,
  Ghost,
  Target,
  Globe
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
  Bar,
  LineChart,
  Line
} from 'recharts'
import api from "../../services/api"
import { toast } from "react-hot-toast"
import "./Dashboard.css"

// Types
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
  monthlyRevenue: number
  trainerSchedule: any[]
  expiringMembers: any[]
  recentActivity: any[]
  birthdays: any[]
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [activeTab, setActiveTab] = useState<'revenue' | 'attendance'>('revenue')
  const navigate = useNavigate()

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await api.getOwnerDashboard()
      setData(response)
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

  const handleQuickCheckIn = () => {
    toast.success("Quick Check-in initiated. Scan QR code or enter Member ID.")
  }

  const handleAddMember = () => {
    navigate('/members?action=create')
  }

  // Mock data for charts to match "Enterprise" look
  const weeklySalesData = useMemo(() => [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ], [])

  const salesViewsData = useMemo(() => [
    { name: 'Jan', sales: 40, views: 24 },
    { name: 'Feb', sales: 30, views: 13 },
    { name: 'Mar', sales: 20, views: 98 },
    { name: 'Apr', sales: 27, views: 39 },
    { name: 'May', sales: 18, views: 48 },
    { name: 'Jun', sales: 23, views: 38 },
    { name: 'Jul', sales: 34, views: 43 },
    { name: 'Aug', sales: 20, views: 30 },
    { name: 'Sep', sales: 30, views: 40 },
  ], [])

  const campaignData = [
    { name: 'Facebook', value: 55, color: '#3B82F6', icon: Facebook },
    { name: 'LinkedIn', value: 67, color: '#0A66C2', icon: Linkedin },
    { name: 'Instagram', value: 78, color: '#E1306C', icon: Instagram },
    { name: 'Snapchat', value: 46, color: '#FFFC00', icon: Ghost },
    { name: 'Google', value: 38, color: '#4285F4', icon: Target },
    { name: 'Website', value: 15, color: '#10B981', icon: Globe },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading && !data) {
    return (
      <div className="dashboard-loading">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="loading-spinner"
        />
        <span>Initializing Enterprise Analytics...</span>
      </div>
    )
  }

  return (
    <div className="dashboard-v4">
      <div className="dash-content">
        {/* ROW 1: LARGE KPI + MINI KPI GRID */}
        <div className="main-grid">
          <div className="card-large-kpi glass">
            <div className="kpi-header">
              <div className="kpi-info">
                <h2>{formatCurrency(data?.monthlyRevenue || 0)}</h2>
                <span className="label">Avg Monthly Revenue</span>
              </div>
              <div className="kpi-trend neg">
                <ArrowDownRight size={14} /> 8.6%
              </div>
            </div>
            <div className="kpi-chart">
              <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={weeklySalesData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpi-mini-grid">
            <MiniKPICard icon={ShoppingCart} label="Daily Sales" value={formatCurrency(data?.todayRevenue || 0)} color="blue" />
            <MiniKPICard icon={Printer} label="Monthly Goal" value="₹96,147" color="emerald" />
            <MiniKPICard icon={Bell} label="Notifications" value="846" color="rose" />
            <MiniKPICard icon={CreditCard} label="Pending Dues" value={formatCurrency(data?.pendingPaymentsAmount || 0)} color="cyan" />
          </div>

          {/* ROW 2: STATS & CHARTS */}
          <div className="card-users-stats glass">
            <div className="card-header">
              <div className="header-info">
                <h3>{data?.totalMembers || 0}</h3>
                <span className="label">Total Members</span>
              </div>
              <MoreVertical size={16} />
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={salesViewsData.slice(0, 7)}>
                  <Bar dataKey="sales" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card-footer">
              <span className="trend pos">12.5%</span> from last month
            </div>
          </div>

          <div className="card-active-users glass">
            <div className="card-header">
              <div className="header-info">
                <h3>{data?.liveMembers || 0}</h3>
                <span className="label">Active Now</span>
              </div>
              <MoreVertical size={16} />
            </div>
            <div className="gauge-wrapper">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[
                      { value: data?.liveMembers || 0 },
                      { value: (data?.totalMembers || 100) - (data?.liveMembers || 0) }
                    ]}
                    cx="50%"
                    cy="80%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill="url(#gaugeGradient)" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </PieChart>
              </ResponsiveContainer>
              <div className="gauge-value">
                {Math.round(((data?.liveMembers || 0) / (data?.totalMembers || 1)) * 100)}%
              </div>
            </div>
            <div className="card-footer">
              {data?.newSignups || 0} new signups today
            </div>
          </div>

          <div className="card-sales-views glass col-span-2">
            <div className="card-header">
              <h3>Sales & Views</h3>
              <MoreVertical size={16} />
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesViewsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="views" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={6} />
                  <Bar dataKey="sales" fill="#1D4ED8" radius={[2, 2, 0, 0]} barSize={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="sales-summary-footer">
              <div className="sum-item">
                <span className="label">Monthly</span>
                <div className="val">₹{data?.monthlyRevenue?.toLocaleString()} <span className="trend pos">16.5%</span></div>
              </div>
              <div className="sum-divider" />
              <div className="sum-item">
                <span className="label">Yearly</span>
                <div className="val">₹{(data?.monthlyRevenue || 0) * 12 + 500000} <span className="trend pos">24.9%</span></div>
              </div>
            </div>
          </div>

          {/* ROW 3: CAMPAIGNS & ACTIVITIES */}
          <div className="card-campaign glass">
            <div className="card-header">
              <h3>Campaign</h3>
              <MoreVertical size={16} />
            </div>
            <div className="campaign-list">
              {campaignData.map(item => (
                <div key={item.name} className="campaign-item">
                  <div className="item-left">
                    <div className="icon-box" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                      <item.icon size={14} />
                    </div>
                    <span className="name">{item.name}</span>
                  </div>
                  <div className="item-right">
                    <span className="percentage">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className="activity-section glass">
            <div className="section-header">
              <h3><Clock size={16} /> Live Activity</h3>
              <button className="view-all" onClick={() => navigate('/reports')}>View All</button>
            </div>
            <div className="activity-list compact">
              {data?.recentActivity?.slice(0, 4).map((activity, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    {activity.type === 'checkin' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  </div>
                  <div className="activity-content">
                    <p><strong>{activity.name}</strong> {activity.type === 'checkin' ? 'in' : 'alert'}</p>
                    <span>{activity.date}</span>
                  </div>
                </div>
              ))}
              {(!data?.recentActivity || data.recentActivity.length === 0) && (
                <div className="empty-state">No activity</div>
              )}
            </div>
          </section>

          <section className="expiring-section glass">
            <div className="section-header">
              <h3><AlertCircle size={16} /> Expiring</h3>
              <span className="badge">7 Days</span>
            </div>
            <div className="member-list compact">
              {data?.expiringMembers?.slice(0, 4).map((member, i) => (
                <div key={i} className="member-item-v3">
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
                    <span className="member-plan">{member.plan}</span>
                  </div>
                  <div className={`days-left ${member.daysLeft <= 2 ? 'urgent' : ''}`}>
                    {member.daysLeft}d
                  </div>
                </div>
              ))}
              {(!data?.expiringMembers || data.expiringMembers.length === 0) && (
                <div className="empty-state">No expirations</div>
              )}
            </div>
          </section>

          <section className="quick-actions glass">
             <div className="section-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="action-grid-compact">
               <button className="action-btn-sm" onClick={handleAddMember} title="Add Member">
                  <UserPlus size={18} />
               </button>
               <button className="action-btn-sm" onClick={handleQuickCheckIn} title="Check-in">
                  <CheckCircle2 size={18} />
               </button>
               <button className="action-btn-sm" onClick={() => navigate('/financials')} title="Payments">
                  <IndianRupee size={18} />
               </button>
               <button className="action-btn-sm" onClick={() => navigate('/settings')} title="Settings">
                  <MoreVertical size={18} />
               </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

interface MiniKPICardProps {
  icon: any
  label: string
  value: string
  color: string
}

const MiniKPICard: React.FC<MiniKPICardProps> = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="mini-kpi-card glass">
      <div className={`icon-wrapper ${color}`}>
        <Icon size={20} />
      </div>
      <div className="kpi-content">
        <h3>{value}</h3>
        <span className="label">{label}</span>
      </div>
    </div>
  )
}

export default Dashboard
