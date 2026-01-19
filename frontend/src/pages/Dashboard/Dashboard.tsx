import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  IndianRupee,
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
  ChevronRight,
  CreditCard,
  Dumbbell,
  BarChart3,
  ArrowRight
} from 'lucide-react'
import api from "../../services/api"

import { KPIGrid } from "../../components/dashboard/KPIGrid"
import "./Dashboard.css"

interface TrainerSlot {
  time: string
  status: 'available' | 'limited' | 'booked'
  memberName?: string
}

interface TrainerSchedule {
  name: string
  initials: string
  slots: TrainerSlot[]
  sessionsToday: number
  totalRevenue: number
  availableSlots: number
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
  sessions: number
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

  const [todayRevenue, setTodayRevenue] = useState(0)
  const [revenueChange, setRevenueChange] = useState(0)
  const [liveMembers, setLiveMembers] = useState(0)
  const [maxCapacity] = useState(100)
  const [newSignups, setNewSignups] = useState(0)
  const [checkIns, setCheckIns] = useState(0)
  const [totalMembers, setTotalMembers] = useState(0)
  const [totalTrainers, setTotalTrainers] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [pendingPayments, setPendingPayments] = useState(0)

  const [trainerSchedule, setTrainerSchedule] = useState<TrainerSchedule[]>([])
  const [expiringMembers, setExpiringMembers] = useState<ExpiringMember[]>([])
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([])
  const [topTrainers, setTopTrainers] = useState<TopTrainer[]>([])
  const [bestPlans, setBestPlans] = useState<MembershipPlan[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockItem[]>([])
  const [cancellations, setCancellations] = useState<Cancellation[]>([])
  const [birthdays, setBirthdays] = useState<Birthday[]>([])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.allSettled([api.getStats(), api.getUsers('CUSTOMER')])

      setTodayRevenue(51500)
      setRevenueChange(12.5)
      setLiveMembers(Math.floor(Math.random() * 20 + 35))
      setNewSignups(8)
      setCheckIns(127)
      setTotalMembers(342)
      setTotalTrainers(12)
      setMonthlyRevenue(485000)
      setPendingPayments(10500)

      setTrainerSchedule([
        {
          name: 'Rahul Sharma',
          initials: 'RS',
          slots: [
            { time: '6:00 AM', status: 'booked', memberName: 'Vikram K.' },
            { time: '7:00 AM', status: 'booked', memberName: 'Anita M.' },
            { time: '8:00 AM', status: 'limited' },
            { time: '9:00 AM', status: 'available' },
            { time: '10:00 AM', status: 'booked', memberName: 'Raj P.' },
            { time: '5:00 PM', status: 'booked', memberName: 'Priya S.' },
            { time: '6:00 PM', status: 'booked', memberName: 'Deepak V.' },
            { time: '7:00 PM', status: 'limited' },
          ],
          sessionsToday: 6,
          totalRevenue: 82500,
          availableSlots: 2
        },
        {
          name: 'Priya Patel',
          initials: 'PP',
          slots: [
            { time: '7:00 AM', status: 'booked', memberName: 'Sneha R.' },
            { time: '8:00 AM', status: 'booked', memberName: 'Amit K.' },
            { time: '9:00 AM', status: 'booked', memberName: 'Ravi M.' },
            { time: '10:00 AM', status: 'limited' },
            { time: '4:00 PM', status: 'available' },
            { time: '5:00 PM', status: 'booked', memberName: 'Kavita S.' },
            { time: '6:00 PM', status: 'booked', memberName: 'Arjun M.' },
          ],
          sessionsToday: 5,
          totalRevenue: 67200,
          availableSlots: 2
        },
        {
          name: 'Amit Kumar',
          initials: 'AK',
          slots: [
            { time: '6:00 AM', status: 'booked', memberName: 'Neha T.' },
            { time: '8:00 AM', status: 'available' },
            { time: '9:00 AM', status: 'booked', memberName: 'Sanjay P.' },
            { time: '10:00 AM', status: 'booked', memberName: 'Meera K.' },
            { time: '5:00 PM', status: 'booked', memberName: 'Rohit S.' },
            { time: '6:00 PM', status: 'limited' },
            { time: '7:00 PM', status: 'available' },
          ],
          sessionsToday: 4,
          totalRevenue: 54800,
          availableSlots: 3
        },
      ])

      setExpiringMembers([
        { name: 'Arjun Mehta', plan: 'Gold', daysLeft: 2 },
        { name: 'Kavita Singh', plan: 'Platinum', daysLeft: 3 },
        { name: 'Raj Patel', plan: 'Silver', daysLeft: 5 },
      ])

      setOverduePayments([
        { name: 'Deepak Verma', amount: 4500, daysPast: 15 },
        { name: 'Sunita Rao', amount: 2800, daysPast: 8 },
      ])

      setTopTrainers([
        { name: 'Rahul Sharma', role: 'Senior Trainer', revenue: 82500, sessions: 45 },
        { name: 'Priya Patel', role: 'PT Specialist', revenue: 67200, sessions: 38 },
        { name: 'Amit Kumar', role: 'Fitness Coach', revenue: 54800, sessions: 32 },
      ])

      setBestPlans([
        { name: 'Gold Annual', sold: 45, revenue: 225000 },
        { name: 'Platinum Monthly', sold: 38, revenue: 152000 },
        { name: 'Silver 6-Month', sold: 62, revenue: 124000 },
      ])

      setStockAlerts([
        { name: 'Towels', level: 15, icon: 'towel' },
        { name: 'Protein Powder', level: 42, icon: 'protein' },
        { name: 'Water Bottles', level: 8, icon: 'water' }
      ])

      setCancellations([
        { name: 'Ananya Desai', type: 'cancel', date: 'Dec 22', reason: 'Relocating' },
        { name: 'Rohit Sharma', type: 'freeze', date: 'Dec 21', reason: 'Medical' },
      ])

      setBirthdays([
        { name: 'Vikram Rao', initials: 'VR' },
        { name: 'Priya Singh', initials: 'PS' },
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


      {/* KPI Grid - Enhanced Metrics */}
      <KPIGrid />

      <section className="dash-overview">
        <motion.div
          className="dash-overview-card dash-overview-card--members"
          variants={itemVariants}
          onClick={() => navigate('/members')}
        >
          <div className="dash-overview-card__icon">
            <Users size={24} />
          </div>
          <div className="dash-overview-card__content">
            <span className="dash-overview-card__label">Total Members</span>
            <span className="dash-overview-card__value">{totalMembers}</span>
            <span className="dash-overview-card__highlight">+{newSignups} today</span>
          </div>
          <ChevronRight className="dash-overview-card__arrow" size={20} />
        </motion.div>

        <motion.div
          className="dash-overview-card dash-overview-card--trainers"
          variants={itemVariants}
          onClick={() => navigate('/trainers')}
        >
          <div className="dash-overview-card__icon">
            <Dumbbell size={24} />
          </div>
          <div className="dash-overview-card__content">
            <span className="dash-overview-card__label">Active Trainers</span>
            <span className="dash-overview-card__value">{totalTrainers}</span>
            <span className="dash-overview-card__highlight">{trainerSchedule.reduce((a, t) => a + t.sessionsToday, 0)} sessions today</span>
          </div>
          <ChevronRight className="dash-overview-card__arrow" size={20} />
        </motion.div>

        <motion.div
          className="dash-overview-card dash-overview-card--revenue"
          variants={itemVariants}
          onClick={() => navigate('/financials')}
        >
          <div className="dash-overview-card__icon">
            <IndianRupee size={24} />
          </div>
          <div className="dash-overview-card__content">
            <span className="dash-overview-card__label">Monthly Revenue</span>
            <span className="dash-overview-card__value">{formatCurrency(monthlyRevenue)}</span>
            <span className="dash-overview-card__highlight dash-overview-card__highlight--positive">
              <TrendingUp size={12} /> 12% vs last month
            </span>
          </div>
          <ChevronRight className="dash-overview-card__arrow" size={20} />
        </motion.div>

        <motion.div
          className="dash-overview-card dash-overview-card--sessions"
          variants={itemVariants}
          onClick={() => navigate('/pt-sessions')}
        >
          <div className="dash-overview-card__icon">
            <Calendar size={24} />
          </div>
          <div className="dash-overview-card__content">
            <span className="dash-overview-card__label">PT Sessions</span>
            <span className="dash-overview-card__value">24</span>
            <span className="dash-overview-card__highlight">Scheduled today</span>
          </div>
          <ChevronRight className="dash-overview-card__arrow" size={20} />
        </motion.div>
      </section>

      <section className="dash-stats">
        <motion.div className="dash-stat-card" variants={itemVariants}>
          <div className="dash-stat-card__header">
            <IndianRupee size={16} />
            <span>Today's Revenue</span>
          </div>
          <div className="dash-stat-card__value">{formatCurrency(todayRevenue)}</div>
          <div className="dash-stat-card__change positive">
            <TrendingUp size={12} /> {revenueChange}% vs yesterday
          </div>
        </motion.div>

        <motion.div className="dash-stat-card" variants={itemVariants}>
          <div className="dash-stat-card__header">
            <Users size={16} />
            <span>Active Now</span>
          </div>
          <div className="dash-stat-card__value">{liveMembers}</div>
          <div className="capacity-bar">
            <div
              className={`capacity-bar__fill ${getCapacityClass(liveMembers, maxCapacity)}`}
              style={{ width: `${(liveMembers / maxCapacity) * 100}%` }}
            />
          </div>
          <span className="dash-stat-card__sub">{Math.round((liveMembers / maxCapacity) * 100)}% capacity</span>
        </motion.div>

        <motion.div className="dash-stat-card" variants={itemVariants}>
          <div className="dash-stat-card__header">
            <LogIn size={16} />
            <span>Check-ins Today</span>
          </div>
          <div className="dash-stat-card__value">{checkIns}</div>
          <div className="dash-stat-card__change positive">
            <TrendingUp size={12} /> 8% vs yesterday
          </div>
        </motion.div>

        <motion.div className="dash-stat-card" variants={itemVariants}>
          <div className="dash-stat-card__header">
            <CreditCard size={16} />
            <span>Pending Payments</span>
          </div>
          <div className="dash-stat-card__value">{formatCurrency(pendingPayments)}</div>
          <div className="dash-stat-card__sub">{overduePayments.length} overdue</div>
        </motion.div>
      </section>

      <section className="dash-grid">
        <motion.div className="dash-section dash-section--trainers" variants={itemVariants}>
          <div className="dash-section__header">
            <div className="dash-section__title">
              <Calendar size={18} />
              <h2>Trainer Schedule Today</h2>
            </div>
            <button className="dash-section__link" onClick={() => navigate('/pt-sessions')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="dash-section__content">
            <div className="trainer-cards">
              {trainerSchedule.map((trainer, idx) => (
                <div key={idx} className="trainer-card">
                  <div className="trainer-card__header">
                    <div className="trainer-card__avatar">{trainer.initials}</div>
                    <div className="trainer-card__info">
                      <span className="trainer-card__name">{trainer.name}</span>
                      <span className="trainer-card__meta">
                        {trainer.sessionsToday} sessions · {trainer.availableSlots} slots free
                      </span>
                    </div>
                    <div className="trainer-card__revenue">
                      {formatCurrency(trainer.totalRevenue)}
                    </div>
                  </div>
                  <div className="trainer-card__slots">
                    {trainer.slots.map((slot, i) => (
                      <div key={i} className={`trainer-slot trainer-slot--${slot.status}`}>
                        <span className="trainer-slot__time">{slot.time}</span>
                        <span className="trainer-slot__status">
                          {slot.status === 'booked' ? slot.memberName : slot.status === 'limited' ? '1 Left' : 'Open'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="trainer-schedule__legend">
              <span><span className="legend-dot legend-dot--available" /> Available</span>
              <span><span className="legend-dot legend-dot--limited" /> 1 Left</span>
              <span><span className="legend-dot legend-dot--booked" /> Booked</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="dash-section dash-section--alerts" variants={itemVariants}>
          <div className="dash-section__header">
            <div className="dash-section__title">
              <AlertCircle size={18} />
              <h2>Attention Required</h2>
            </div>
            <button className="dash-section__link" onClick={() => navigate('/members')}>
              View Members <ArrowRight size={14} />
            </button>
          </div>
          <div className="dash-section__content">
            <div className="alert-group">
              <div className="alert-group__header">
                <Clock size={14} />
                <span>Expiring Soon</span>
                <span className="alert-group__badge">{expiringMembers.length}</span>
              </div>
              {expiringMembers.map((member, idx) => (
                <div key={idx} className="alert-row">
                  <span className="alert-row__name">{member.name}</span>
                  <span className="alert-row__plan">{member.plan}</span>
                  <span className={`alert-row__days ${member.daysLeft <= 3 ? 'urgent' : 'warning'}`}>
                    {member.daysLeft}d
                  </span>
                </div>
              ))}
            </div>
            <div className="alert-group alert-group--urgent">
              <div className="alert-group__header">
                <AlertCircle size={14} />
                <span>Overdue Payments</span>
                <span className="alert-group__badge alert-group__badge--urgent">{overduePayments.length}</span>
              </div>
              {overduePayments.map((payment, idx) => (
                <div key={idx} className="alert-row">
                  <span className="alert-row__name">{payment.name}</span>
                  <span className="alert-row__amount">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="dash-section dash-section--performance" variants={itemVariants}>
          <div className="dash-section__header">
            <div className="dash-section__title">
              <BarChart3 size={18} />
              <h2>Top Performers</h2>
            </div>
            <button className="dash-section__link" onClick={() => navigate('/trainers')}>
              All Trainers <ArrowRight size={14} />
            </button>
          </div>
          <div className="dash-section__content">
            {topTrainers.map((trainer, idx) => (
              <div key={idx} className="performer-row">
                <div className={`performer-row__rank rank--${idx + 1}`}>{idx + 1}</div>
                <div className="performer-row__info">
                  <span className="performer-row__name">{trainer.name}</span>
                  <span className="performer-row__role">{trainer.role}</span>
                </div>
                <div className="performer-row__stats">
                  <span className="performer-row__revenue">{formatCurrency(trainer.revenue)}</span>
                  <span className="performer-row__sessions">{trainer.sessions} sessions</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="dash-section dash-section--plans" variants={itemVariants}>
          <div className="dash-section__header">
            <div className="dash-section__title">
              <CreditCard size={18} />
              <h2>Best Selling Plans</h2>
            </div>
            <button className="dash-section__link" onClick={() => navigate('/financials')}>
              Financials <ArrowRight size={14} />
            </button>
          </div>
          <div className="dash-section__content">
            {bestPlans.map((plan, idx) => (
              <div key={idx} className="plan-row">
                <div className={`plan-row__rank rank--${idx + 1}`}>{idx + 1}</div>
                <div className="plan-row__info">
                  <span className="plan-row__name">{plan.name}</span>
                  <span className="plan-row__sold">{plan.sold} sold</span>
                </div>
                <span className="plan-row__revenue">{formatCurrency(plan.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="dash-bottom-row">
        <motion.div className="dash-section dash-section--activity" variants={itemVariants}>
          <div className="dash-section__header">
            <div className="dash-section__title">
              <Clock size={18} />
              <h2>Recent Activity</h2>
            </div>
          </div>
          <div className="dash-section__content">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {cancellations.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>
                      <span className={`activity-badge activity-badge--${item.type}`}>
                        {item.type === 'cancel' ? 'Cancelled' : 'Frozen'}
                      </span>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div className="dash-section dash-section--birthdays" variants={itemVariants}>
          <div className="dash-section__header">
            <div className="dash-section__title">
              <Cake size={18} />
              <h2>Birthdays Today</h2>
            </div>
          </div>
          <div className="dash-section__content">
            <div className="birthday-list">
              {birthdays.map((member, idx) => (
                <div key={idx} className="birthday-row">
                  <div className="birthday-row__avatar">{member.initials}</div>
                  <span className="birthday-row__name">{member.name}</span>
                </div>
              ))}
            </div>
            <button className="btn-action">
              <MessageSquare size={14} />
              Send Birthday Wishes
            </button>
          </div>
        </motion.div>

        <motion.div className="dash-section dash-section--stock" variants={itemVariants}>
          <div className="dash-section__header">
            <div className="dash-section__title">
              <Package size={18} />
              <h2>Stock Alerts</h2>
            </div>
          </div>
          <div className="dash-section__content">
            {stockAlerts.map((item, idx) => (
              <div key={idx} className="stock-row">
                <div className={`stock-row__icon ${item.level < 20 ? 'stock-row__icon--low' : ''}`}>
                  <Package size={16} />
                </div>
                <div className="stock-row__info">
                  <span className="stock-row__name">{item.name}</span>
                  <div className="stock-row__bar">
                    <div
                      className={`stock-row__fill ${item.level < 20 ? 'stock-row__fill--low' : ''}`}
                      style={{ width: `${item.level}%` }}
                    />
                  </div>
                </div>
                <span className={`stock-row__percent ${item.level < 20 ? 'stock-row__percent--low' : ''}`}>
                  {item.level}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </motion.div>
  )
}

export default Dashboard
