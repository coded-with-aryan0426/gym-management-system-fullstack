import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Users, UserCheck, ArrowUpRight, DollarSign, Target } from 'lucide-react';
import { Card } from '../../components/base';
import { ErrorMessage, EmptyState, Skeleton } from '../../components/utilities';
import StatCard from '../../components/StatCard/StatCard';
import ActivityFeed from '../../components/ActivityFeed/ActivityFeed';
import RevenueChart from '../../components/charts/RevenueChart';
import MemberGrowthChart from '../../components/charts/MemberGrowthChart';
import SessionStatsChart from '../../components/charts/SessionStatsChart';
import { pageTransition, staggerContainer, staggerItem, fadeInUp, scaleIn } from '../../utils/animations';
import api from '../../services/api';
import './Dashboard.css';

interface UserSummary {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface CategoryData {
  count: number;
  users: UserSummary[];
}

interface DashboardStats {
  owners: CategoryData;
  trainers: CategoryData;
  staff: CategoryData;
  customers: CategoryData;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    owners: { count: 0, users: [] },
    trainers: { count: 0, users: [] },
    staff: { count: 0, users: [] },
    customers: { count: 0, users: [] },
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [owners, trainers, staffUsers, customers] = await Promise.all([
        api.getUsers('OWNER'),
        api.getUsers('TRAINER'),
        api.getUsers('STAFF'),
        api.getUsers('CUSTOMER'),
      ]);

      const mapUsers = (users: any[]): UserSummary[] =>
        users.map(u => ({
          id: u.userId || u.id,
          name: u.fullName || u.username || 'Unknown User',
          email: u.email || 'no-email@gym.com',
          avatarUrl: u.avatarUrl,
        }));

      setStats({
        owners: { count: owners.length, users: mapUsers(owners) },
        trainers: { count: trainers.length, users: mapUsers(trainers) },
        staff: { count: staffUsers.length, users: mapUsers(staffUsers) },
        customers: { count: customers.length, users: mapUsers(customers) },
      });
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <Skeleton width="200px" height="32px" />
          <Skeleton width="300px" height="20px" />
        </div>
        <div className="dashboard__grid">
          <div className="dashboard__main">
            <div className="stats-row">
              <Skeleton height="120px" />
              <Skeleton height="120px" />
            </div>
            <Skeleton height="400px" />
          </div>
          <div className="dashboard__sidebar">
            <Skeleton height="300px" />
            <Skeleton height="400px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <ErrorMessage message={error} onRetry={fetchStats} />
      </div>
    );
  }

  const totalMembers = stats.customers.count;

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 15200 },
    { month: 'Mar', revenue: 14800 },
    { month: 'Apr', revenue: 18900 },
    { month: 'May', revenue: 21300 },
    { month: 'Jun', revenue: 24500 },
  ];

  const memberGrowthData = [
    { month: 'Jan', members: 45 },
    { month: 'Feb', members: 52 },
    { month: 'Mar', members: 58 },
    { month: 'Apr', members: 65 },
    { month: 'May', members: 72 },
    { month: 'Jun', members: totalMembers },
  ];

  const sessionStatsData = [
    { day: 'Mon', completed: 12, scheduled: 15, missed: 2 },
    { day: 'Tue', completed: 15, scheduled: 18, missed: 1 },
    { day: 'Wed', completed: 10, scheduled: 14, missed: 3 },
    { day: 'Thu', completed: 18, scheduled: 20, missed: 1 },
    { day: 'Fri', completed: 14, scheduled: 16, missed: 2 },
    { day: 'Sat', completed: 8, scheduled: 10, missed: 1 },
    { day: 'Sun', completed: 5, scheduled: 6, missed: 0 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'member_joined' as const,
      title: 'New Member Joined',
      description: 'John Doe signed up for Gold Plan',
      timestamp: '2 minutes ago',
    },
    {
      id: 2,
      type: 'session_completed' as const,
      title: 'PT Session Completed',
      description: 'Sarah Williams completed session with Mike Johnson',
      timestamp: '15 minutes ago',
    },
    {
      id: 3,
      type: 'payment_received' as const,
      title: 'Payment Received',
      description: '₹12,500 payment from Emily Davis',
      timestamp: '1 hour ago',
    },
    {
      id: 4,
      type: 'staff_checkin' as const,
      title: 'Staff Check-in',
      description: 'Rocky Balboa checked in for shift',
      timestamp: '2 hours ago',
    },
    {
      id: 5,
      type: 'membership_expiring' as const,
      title: 'Membership Expiring Soon',
      description: 'Alice Smith membership expires in 3 days',
      timestamp: '3 hours ago',
    },
  ];

  return (
    <motion.div
      className="dashboard-new"
      {...pageTransition}
    >
      <Toaster />

      {/* Compact Header */}
      <motion.div
        className="dashboard-new__header"
        {...fadeInUp}
      >
        <div>
          <h1 className="dashboard-new__title">Dashboard</h1>
          <p className="dashboard-new__subtitle">Welcome back! Here's your gym overview.</p>
        </div>
      </motion.div>

      {/* Stats Cards Grid - 4 columns */}
      <motion.div
        className="dashboard-new__stats-grid"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            title="Total Members"
            value={totalMembers}
            icon={<Users size={24} />}
            trend={{ value: 12, isPositive: true }}
            subtitle="vs last month"
            color="primary"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Active Trainers"
            value={stats.trainers.count}
            icon={<UserCheck size={24} />}
            trend={{ value: 5, isPositive: true }}
            subtitle="vs last month"
            color="success"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Monthly Revenue"
            value={`₹${revenueData[revenueData.length - 1].revenue.toLocaleString('en-IN')}`}
            icon={<DollarSign size={24} />}
            trend={{ value: 15, isPositive: true }}
            subtitle="vs last month"
            color="info"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Sessions This Week"
            value="87"
            icon={<Target size={24} />}
            trend={{ value: 8, isPositive: true }}
            subtitle="vs last week"
            color="warning"
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid - 3 columns */}
      <div className="dashboard-new__content-grid">

        {/* Left Column - Charts (2 columns wide) */}
        <motion.div
          className="dashboard-new__charts"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Revenue Chart */}
          <motion.div variants={staggerItem}>
            <Card elevation="2" className="chart-card">
              <div className="chart-card__header">
                <h3 className="chart-card__title">Revenue Trend</h3>
                <p className="chart-card__subtitle">Last 6 months</p>
              </div>
              <div className="chart-card__body">
                <RevenueChart data={revenueData} />
              </div>
            </Card>
          </motion.div>

          {/* Member Growth Chart */}
          <motion.div variants={staggerItem}>
            <Card elevation="2" className="chart-card">
              <div className="chart-card__header">
                <h3 className="chart-card__title">Member Growth</h3>
                <p className="chart-card__subtitle">Last 6 months</p>
              </div>
              <div className="chart-card__body">
                <MemberGrowthChart data={memberGrowthData} />
              </div>
            </Card>
          </motion.div>

          {/* Session Stats Chart */}
          <motion.div variants={staggerItem}>
            <Card elevation="2" className="chart-card">
              <div className="chart-card__header">
                <h3 className="chart-card__title">Weekly Session Stats</h3>
                <p className="chart-card__subtitle">This week's performance</p>
              </div>
              <div className="chart-card__body">
                <SessionStatsChart data={sessionStatsData} />
              </div>
            </Card>
          </motion.div>

          {/* Recent Members */}
          <motion.div variants={staggerItem}>
            <Card elevation="2" className="members-card">
              <div className="members-card__header">
                <h3 className="members-card__title">Recent Members</h3>
                <motion.button
                  className="link-button"
                  onClick={() => navigate('/members')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All <ArrowUpRight size={16} />
                </motion.button>
              </div>
              <div className="members-card__list">
                <AnimatePresence>
                  {stats.customers.users.length > 0 ? (
                    stats.customers.users.slice(0, 10).map((user, index) => (
                      <motion.div
                        key={user.id}
                        className="member-list-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="member-list-item__avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="member-list-item__info">
                          <p className="member-list-item__name">{user.name}</p>
                          <p className="member-list-item__email">{user.email}</p>
                        </div>
                        <div className="member-list-item__badge">Active</div>
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<Users size={32} />}
                      title="No members yet"
                      description="Add your first member"
                    />
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Right Column - Activity Feed */}
        <motion.div
          className="dashboard-new__activity"
          {...scaleIn}
        >
          <ActivityFeed activities={recentActivities} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
