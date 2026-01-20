import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  IndianRupee,
  Users,
  LogIn,
  CreditCard,
} from 'lucide-react'
import api from "../../services/api"
import { KPIGrid } from "../../components/dashboard/KPIGrid"
import "./Dashboard.css"

// Types
import type {
  TrainerSchedule, ExpiringMember, OverduePayment,
  TopTrainer, MembershipPlan, StockItem, Cancellation, Birthday
} from "../../components/dashboard/types"

// Shared Components
import DashboardStatCard from "../../components/dashboard/shared/DashboardStatCard"

// Widgets
import DashOverviewWidget from "../../components/dashboard/widgets/DashOverviewWidget"
import TrainerScheduleWidget from "../../components/dashboard/widgets/TrainerScheduleWidget"
import AttentionWidget from "../../components/dashboard/widgets/AttentionWidget"
import TopPerformersWidget from "../../components/dashboard/widgets/TopPerformersWidget"
import BestPlansWidget from "../../components/dashboard/widgets/BestPlansWidget"
import RecentActivityWidget from "../../components/dashboard/widgets/RecentActivityWidget"
import BirthdaysWidget from "../../components/dashboard/widgets/BirthdaysWidget"
import StockAlertsWidget from "../../components/dashboard/widgets/StockAlertsWidget"

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)

  // Stats State
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

  // Widget State
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
      // Fetch Real Data from Owner Dashboard API
      const data = await api.getOwnerDashboard()

      // Map API Response to State
      setTodayRevenue(data.todayRevenue)
      setRevenueChange(data.revenueChange)
      setLiveMembers(data.liveMembers)
      setCheckIns(data.checkIns)
      setPendingPayments(data.pendingPaymentsAmount)

      setTotalMembers(data.totalMembers)
      setNewSignups(data.newSignups)
      setTotalTrainers(data.totalTrainers)
      setMonthlyRevenue(data.monthlyRevenue)

      setTrainerSchedule(data.trainerSchedule)
      setExpiringMembers(data.expiringMembers)
      setOverduePayments(data.overduePayments)
      setTopTrainers(data.topTrainers)
      setBestPlans(data.bestPlans)
      setStockAlerts(data.stockAlerts)
      setCancellations(data.recentActivity) // Mapping recentActivity to cancellations/activity widget
      setBirthdays(data.birthdays)

    } catch (err) {
      console.error("[Dashboard] Failed to fetch data", err)
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
      <KPIGrid
        stats={{
          revenue: todayRevenue,
          revenueChange: revenueChange,
          activeMembers: liveMembers,
          maxCapacity: maxCapacity,
          checkIns: checkIns,
          pendingPayments: pendingPayments,
          pendingCount: overduePayments.length
        }}
        loading={loading}
      />

      {/* DASHBOARD OVERVIEW WIDGET */}
      <DashOverviewWidget
        totalMembers={totalMembers}
        newSignups={newSignups}
        totalTrainers={totalTrainers}
        sessionsToday={trainerSchedule.reduce((a, t) => a + t.sessionsToday, 0)}
        monthlyRevenue={monthlyRevenue}
        variants={itemVariants}
      />

      {/* MAIN CONTENT GRID (4-Column Layout - 1 Col Per Widget) */}
      <section className="dash-content-grid">
        <TrainerScheduleWidget className="col-span-1" schedule={trainerSchedule} variants={itemVariants} />
        <AttentionWidget className="col-span-1" expiringMembers={expiringMembers} overduePayments={overduePayments} variants={itemVariants} />
        <RecentActivityWidget className="col-span-1" cancellations={cancellations} variants={itemVariants} />
        <TopPerformersWidget className="col-span-1" trainers={topTrainers} variants={itemVariants} />

        <BestPlansWidget className="col-span-1" plans={bestPlans} variants={itemVariants} />
        <StockAlertsWidget className="col-span-1" alerts={stockAlerts} variants={itemVariants} />
        <BirthdaysWidget className="col-span-1" birthdays={birthdays} variants={itemVariants} />
      </section>
    </motion.div>
  )
}

export default Dashboard
