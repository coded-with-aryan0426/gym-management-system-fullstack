import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  DollarSign,
  Users,
  UserPlus,
  LogIn,
  Calendar,
  AlertCircle,
  Clock,
  Package,
  Cake,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Dumbbell
} from 'lucide-react'
import api from "../../services/api"
import "./Dashboard.css"

// === INTERFACES ===
interface TrainerSchedule {
  name: string
  slots: ('available' | 'limited' | 'booked' | 'empty')[]
}

interface ExpiringMember {
  name: string
  plan: string
  daysLeft: number
}

interface OverduePayment {
  name: string
  amount: number
  daysPast: number
}

interface TopTrainer {
  name: string
  role: string
  revenue: number
}

interface MembershipPlan {
  name: string
  sold: number
  revenue: number
}

interface StockItem {
  name: string
  level: number
  icon: 'towel' | 'protein' | 'water'
}

interface Cancellation {
  name: string
  type: 'cancel' | 'freeze'
  date: string
  reason: string
}

interface Birthday {
  name: string
  initials: string
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  // Row 1 & 2: Header & Hero KPIs
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [revenueChange, setRevenueChange] = useState(0)
  const [liveMembers, setLiveMembers] = useState(0)
  const [maxCapacity] = useState(100)
  const [newSignups, setNewSignups] = useState(0)
  const [checkIns, setCheckIns] = useState(0)

  // Row 3: Trainer Heatmap & Alerts
  const [trainerSchedule, setTrainerSchedule] = useState<TrainerSchedule[]>([])
  const [expiringMembers, setExpiringMembers] = useState<ExpiringMember[]>([])
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([])

  // Row 4: Secondary
  const [topTrainers, setTopTrainers] = useState<TopTrainer[]>([])
  const [bestPlans, setBestPlans] = useState<MembershipPlan[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockItem[]>([])

  // Row 5: Bottom
  const [cancellations, setCancellations] = useState<Cancellation[]>([])
  const [birthdays, setBirthdays] = useState<Birthday[]>([])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.allSettled([api.getStats(), api.getUsers('CUSTOMER')])

      // Hero KPIs
      setTodayRevenue(51500)
      setRevenueChange(12.5)
      setLiveMembers(Math.floor(Math.random() * 20 + 35))
      setNewSignups(8)
      setCheckIns(127)

      // Trainer Heatmap
      setTrainerSchedule([
        { name: 'Rahul Sharma', slots: ['booked', 'booked', 'limited', 'available', 'available', 'booked', 'booked', 'limited'] },
        { name: 'Priya Patel', slots: ['available', 'booked', 'booked', 'booked', 'limited', 'available', 'booked', 'booked'] },
        { name: 'Amit Kumar', slots: ['booked', 'available', 'available', 'booked', 'booked', 'booked', 'limited', 'available'] },
        { name: 'Sneha Gupta', slots: ['limited', 'limited', 'booked', 'available', 'booked', 'booked', 'available', 'limited'] },
        { name: 'Vikram Rao', slots: ['available', 'available', 'limited', 'booked', 'booked', 'available', 'booked', 'booked'] }
      ])

      // Expiring Memberships
      setExpiringMembers([
        { name: 'Arjun Mehta', plan: 'Gold', daysLeft: 2 },
        { name: 'Kavita Singh', plan: 'Platinum', daysLeft: 3 },
        { name: 'Raj Patel', plan: 'Silver', daysLeft: 5 },
        { name: 'Meera Joshi', plan: 'Gold', daysLeft: 6 }
      ])

      // Overdue Payments
      setOverduePayments([
        { name: 'Deepak Verma', amount: 4500, daysPast: 15 },
        { name: 'Sunita Rao', amount: 2800, daysPast: 8 },
        { name: 'Karan Malhotra', amount: 3200, daysPast: 5 }
      ])

      // Top Trainers
      setTopTrainers([
        { name: 'Rahul Sharma', role: 'Senior Trainer', revenue: 82500 },
        { name: 'Priya Patel', role: 'PT Specialist', revenue: 67200 },
        { name: 'Amit Kumar', role: 'Fitness Coach', revenue: 54800 }
      ])

      // Best Plans
      setBestPlans([
        { name: 'Gold Annual', sold: 45, revenue: 225000 },
        { name: 'Platinum Monthly', sold: 38, revenue: 152000 },
        { name: 'Silver 6-Month', sold: 62, revenue: 124000 }
      ])

      // Stock Alerts
      setStockAlerts([
        { name: 'Towels', level: 15, icon: 'towel' },
        { name: 'Protein Powder', level: 42, icon: 'protein' },
        { name: 'Water Bottles', level: 8, icon: 'water' }
      ])

      // Cancellations
      setCancellations([
        { name: 'Ananya Desai', type: 'cancel', date: 'Dec 22', reason: 'Relocating' },
        { name: 'Rohit Sharma', type: 'freeze', date: 'Dec 21', reason: 'Medical' },
        { name: 'Neha Kapoor', type: 'cancel', date: 'Dec 20', reason: 'Financial' }
      ])

      // Birthdays
      setBirthdays([
        { name: 'Vikram Rao', initials: 'VR' },
        { name: 'Priya Singh', initials: 'PS' },
        { name: 'Amit Joshi', initials: 'AJ' }
      ])

    } catch (err) {
      console.log("[Dashboard] Using demo data")
    } finally {
      setLoading(false)
    }
  }, [])

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

  const getCapacityClass = (current: number, max: number) => {
    const pct = (current / max) * 100
    if (pct > 80) return 'urgent'
    if (pct > 60) return 'warning'
    return ''
  }

  const timeSlots = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM']

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants: Variants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <motion.div
      className="dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      
      {/* === ROW 2: HERO KPI ROW === */}
      <section className="dash-hero">
        <motion.div className="dash-hero-card dash-hero-card--positive" variants={itemVariants}>
          <div className="dash-hero-card__header">
            <span className="dash-hero-card__label">Today's Revenue</span>
            <div className="dash-hero-card__icon dash-hero-card__icon--accent">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="dash-hero-card__value">{formatCurrency(todayRevenue)}</div>
          <div className="dash-hero-card__footer">
            <span className={`dash-hero-card__change ${revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {revenueChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(revenueChange)}%
            </span>
            <span className="dash-hero-card__sub">vs yesterday</span>
          </div>
        </motion.div>

        <motion.div className="dash-hero-card" variants={itemVariants}>
          <div className="dash-hero-card__header">
            <span className="dash-hero-card__label">Active Members Now</span>
            <div className="dash-hero-card__icon">
              <Users size={18} />
            </div>
          </div>
          <div className="dash-hero-card__value">{liveMembers}</div>
          <div className="capacity-bar">
            <div
              className={`capacity-bar__fill ${getCapacityClass(liveMembers, maxCapacity)}`}
              style={{ width: `${(liveMembers / maxCapacity) * 100}%` }}
            />
          </div>
          <span className="dash-hero-card__sub">{Math.round((liveMembers / maxCapacity) * 100)}% capacity</span>
        </motion.div>

        <motion.div className="dash-hero-card" variants={itemVariants}>
          <div className="dash-hero-card__header">
            <span className="dash-hero-card__label">New Sign-ups Today</span>
            <div className="dash-hero-card__icon">
              <UserPlus size={18} />
            </div>
          </div>
          <div className="dash-hero-card__value">{newSignups}</div>
          <div className="dash-hero-card__footer">
            <span className="dash-hero-card__change positive">
              <TrendingUp size={12} /> 33%
            </span>
            <span className="dash-hero-card__sub">vs last week avg</span>
          </div>
        </motion.div>

        <motion.div className="dash-hero-card" variants={itemVariants}>
          <div className="dash-hero-card__header">
            <span className="dash-hero-card__label">Check-ins Today</span>
            <div className="dash-hero-card__icon">
              <LogIn size={18} />
            </div>
          </div>
          <div className="dash-hero-card__value">{checkIns}</div>
          <div className="dash-hero-card__footer">
            <span className="dash-hero-card__change positive">
              <TrendingUp size={12} /> 8%
            </span>
            <span className="dash-hero-card__sub">vs yesterday</span>
          </div>
        </motion.div>
      </section>

      {/* === ROW 3: MAIN FOCUS ROW === */}
      <section className="dash-main">
        {/* Trainer Heatmap - Bold Card */}
        <motion.div className="dash-heatmap" variants={itemVariants}>
          <div className="dash-heatmap__header">
            <h2 className="dash-heatmap__title">
              <Calendar size={20} />
              Trainer Schedule & Occupancy
            </h2>
            <div className="dash-heatmap__legend">
              <div className="dash-heatmap__legend-item">
                <div className="legend-dot available" />
                Available
              </div>
              <div className="dash-heatmap__legend-item">
                <div className="legend-dot limited" />
                1 Slot Left
              </div>
              <div className="dash-heatmap__legend-item">
                <div className="legend-dot full" />
                Fully Booked
              </div>
            </div>
          </div>

          <div className="dash-heatmap__grid">
            {/* Time labels */}
            <div className="trainer-row" style={{ marginBottom: '8px' }}>
              <div className="trainer-row__name" style={{ color: 'var(--dash-text-muted)', fontSize: '10px' }}>TRAINER</div>
              <div className="trainer-row__slots">
                {timeSlots.map((slot, i) => (
                  <div key={i} className="slot-block empty" style={{ fontSize: '9px', background: 'transparent', color: 'var(--dash-text-muted)' }}>
                    {slot}
                  </div>
                ))}
              </div>
            </div>

            {trainerSchedule.map((trainer, idx) => (
              <div key={idx} className="trainer-row">
                <div className="trainer-row__name">{trainer.name}</div>
                <div className="trainer-row__slots">
                  {trainer.slots.map((status, i) => (
                    <div key={i} className={`slot-block ${status}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Stacked Alerts */}
        <div className="dash-alerts">
          <motion.div
            className={`dash-alert-card ${expiringMembers.length > 15 ? 'dash-alert-card--urgent' : ''}`}
            variants={itemVariants}
          >
            <div className="dash-alert-card__header">
              <h3 className="dash-alert-card__title">
                <Clock size={16} />
                Expiring This Week
              </h3>
              {expiringMembers.length > 0 && (
                <span className="dash-alert-card__badge">{expiringMembers.length}</span>
              )}
            </div>
            <div className="alert-list">
              {expiringMembers.slice(0, 4).map((member, idx) => (
                <div key={idx} className="alert-item">
                  <span className="alert-item__name">{member.name}</span>
                  <span className={`alert-item__value ${member.daysLeft <= 3 ? '' : 'warning'}`}>
                    {member.daysLeft}d left
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={`dash-alert-card ${overduePayments.length > 0 ? 'dash-alert-card--urgent' : ''}`}
            variants={itemVariants}
          >
            <div className="dash-alert-card__header">
              <h3 className="dash-alert-card__title">
                <AlertCircle size={16} />
                Overdue Payments
              </h3>
              {overduePayments.length > 0 && (
                <span className="dash-alert-card__badge">{overduePayments.length}</span>
              )}
            </div>
            <div className="alert-list">
              {overduePayments.slice(0, 3).map((payment, idx) => (
                <div key={idx} className="alert-item">
                  <span className="alert-item__name">{payment.name}</span>
                  <span className="alert-item__value">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* === ROW 4: SECONDARY ROW === */}
      <section className="dash-secondary">
        <motion.div className="dash-card" variants={itemVariants}>
          <div className="dash-card__header">
            <h3 className="dash-card__title">Top Trainers This Month</h3>
          </div>
          <div className="dash-card__content">
            {topTrainers.map((trainer, idx) => (
              <div key={idx} className="ranking-item">
                <div className={`ranking-item__rank ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze'}`}>
                  {idx + 1}
                </div>
                <div className="ranking-item__info">
                  <div className="ranking-item__name">{trainer.name}</div>
                  <div className="ranking-item__sub">{trainer.role}</div>
                </div>
                <div className="ranking-item__value">{formatCurrency(trainer.revenue)}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="dash-card" variants={itemVariants}>
          <div className="dash-card__header">
            <h3 className="dash-card__title">Best Selling Plans (30d)</h3>
          </div>
          <div className="dash-card__content">
            {bestPlans.map((plan, idx) => (
              <div key={idx} className="ranking-item">
                <div className={`ranking-item__rank ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze'}`}>
                  {idx + 1}
                </div>
                <div className="ranking-item__info">
                  <div className="ranking-item__name">{plan.name}</div>
                  <div className="ranking-item__sub">{plan.sold} sold</div>
                </div>
                <div className="ranking-item__value">{formatCurrency(plan.revenue)}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="dash-card" variants={itemVariants}>
          <div className="dash-card__header">
            <h3 className="dash-card__title">Stock Alerts</h3>
          </div>
          <div className="dash-card__content">
            {stockAlerts.map((item, idx) => (
              <div key={idx} className="stock-item">
                <div className={`stock-item__icon ${item.level < 20 ? 'low' : ''}`}>
                  <Package size={16} />
                </div>
                <div className="stock-item__info">
                  <div className="stock-item__name">{item.name}</div>
                  <div className="stock-item__level">{item.level}% remaining</div>
                </div>
                <div className={`stock-item__percent ${item.level < 20 ? 'low' : 'ok'}`}>
                  {item.level}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === ROW 5: BOTTOM ROW (CALM ZONE) === */}
      <section className="dash-bottom">
        <motion.div className="dash-table-card" variants={itemVariants}>
          <div className="dash-table-card__header">
            <h3 className="dash-table-card__title">Recent Cancellations & Freeze Requests</h3>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Type</th>
                <th>Date</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {cancellations.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>
                    <span className={`type-badge ${item.type}`}>
                      {item.type === 'cancel' ? 'Cancel' : 'Freeze'}
                    </span>
                  </td>
                  <td>{item.date}</td>
                  <td>{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div className="dash-birthday-card" variants={itemVariants}>
          <div className="dash-birthday-card__header">
            <h3 className="dash-birthday-card__title">
              <Cake size={16} />
              Birthdays Today
            </h3>
          </div>
          <div className="birthday-list">
            {birthdays.map((member, idx) => (
              <div key={idx} className="birthday-item">
                <div className="birthday-item__avatar">{member.initials}</div>
                <span className="birthday-item__name">{member.name}</span>
              </div>
            ))}
          </div>
          <button className="btn-sms">
            <MessageSquare size={14} style={{ marginRight: 6 }} />
            Send Birthday SMS
          </button>
        </motion.div>
      </section>
    </motion.div>
  )
}

export default Dashboard
