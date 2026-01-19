import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMultiRoleAuth, usePermissionBasedNavigation } from '../../contexts/MultiRoleAuthContext';
import {
  Users,
  Calendar,
  IndianRupee,
  TrendingUp,
  Activity,
  UserCheck,
  CreditCard,
  BarChart3,
  Settings,
  Dumbbell,
  Target,
  Clock,
  AlertCircle,
  UserPlus,
  CalendarPlus
} from 'lucide-react';
import './MultiRoleDashboard.css';

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  requiredPermissions?: string[];
  color?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  requiredPermissions?: string[];
  color?: string;
}

interface RecentActivity {
  id: string;
  type: 'member' | 'session' | 'payment' | 'staff' | 'system';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  requiredPermissions?: string[];
}

const MultiRoleDashboard: React.FC = () => {
  const { user, hasPermission, hasRole } = useMultiRoleAuth();
  const { getNavigationByCategory } = usePermissionBasedNavigation();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Dashboard configuration based on primary role
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load metrics based on user permissions
        const dashboardMetrics = getDashboardMetrics();
        const actions = getQuickActions();
        const activities = getRecentActivity();

        setMetrics(dashboardMetrics);
        setQuickActions(actions);
        setRecentActivity(activities);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getDashboardMetrics = (): DashboardMetric[] => {
    const baseMetrics: DashboardMetric[] = [];

    // Member metrics (everyone can see basic member count)
    if (hasPermission('MEMBER_VIEW')) {
      baseMetrics.push({
        id: 'total-members',
        title: 'Total Members',
        value: '1,248',
        change: '+12%',
        changeType: 'increase',
        icon: <Users size={20} />,
        color: '#3b82f6'
      });
    }

    // Session metrics (trainers and above)
    if (hasPermission('SESSION_VIEW')) {
      baseMetrics.push({
        id: 'today-sessions',
        title: "Today's Sessions",
        value: '24',
        change: '+8%',
        changeType: 'increase',
        icon: <Calendar size={20} />,
        color: '#10b981'
      });
    }

    // Financial metrics (billing permissions)
    if (hasPermission('BILLING_VIEW')) {
      baseMetrics.push({
        id: 'monthly-revenue',
        title: 'Monthly Revenue',
        value: '₹48,650',
        change: '+15%',
        changeType: 'increase',
        icon: <IndianRupee size={20} />,
        color: '#8b5cf6'
      });
    }

    // Performance metrics (trainer and admin)
    if (hasPermission('PERFORMANCE_VIEW')) {
      baseMetrics.push({
        id: 'trainer-performance',
        title: 'Avg. Performance',
        value: '4.8',
        change: '+0.2',
        changeType: 'increase',
        icon: <TrendingUp size={20} />,
        color: '#f59e0b'
      });
    }

    // Equipment status (facilities access)
    if (hasPermission('EQUIPMENT_VIEW')) {
      baseMetrics.push({
        id: 'equipment-status',
        title: 'Equipment Active',
        value: '92%',
        change: '-2%',
        changeType: 'decrease',
        icon: <Activity size={20} />,
        color: '#ef4444'
      });
    }

    return baseMetrics;
  };

  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    // Member management actions
    if (hasPermission('MEMBER_CREATE')) {
      actions.push({
        id: 'register-member',
        title: 'Register Member',
        description: 'Add a new member to the gym',
        icon: <UserPlus size={20} />,
        path: '/members/register',
        color: '#3b82f6'
      });
    }

    // Session scheduling
    if (hasPermission('SESSION_CREATE')) {
      actions.push({
        id: 'schedule-session',
        title: 'Schedule Session',
        description: 'Book a personal training session',
        icon: <CalendarPlus size={20} />,
        path: '/pt-sessions/schedule',
        color: '#10b981'
      });
    }

    // Staff management
    if (hasPermission('STAFF_CREATE')) {
      actions.push({
        id: 'hire-staff',
        title: 'Hire Staff',
        description: 'Add new trainer or staff member',
        icon: <UserCheck size={20} />,
        path: '/staff/hire',
        color: '#8b5cf6'
      });
    }

    // Payment processing
    if (hasPermission('PAYMENTS_PROCESS')) {
      actions.push({
        id: 'process-payment',
        title: 'Process Payment',
        description: 'Handle member payments',
        icon: <CreditCard size={20} />,
        path: '/billing/process',
        color: '#f59e0b'
      });
    }

    // Equipment maintenance
    if (hasPermission('EQUIPMENT_MAINTENANCE')) {
      actions.push({
        id: 'maintenance',
        title: 'Schedule Maintenance',
        description: 'Book equipment maintenance',
        icon: <Settings size={20} />,
        path: '/equipment/maintenance',
        color: '#ef4444'
      });
    }

    return actions;
  };

  const getRecentActivity = (): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Member activities
    if (hasPermission('MEMBER_VIEW')) {
      activities.push(
        {
          id: 'new-member',
          type: 'member',
          title: 'New Member Registered',
          description: 'John Smith joined with Gold Plan',
          time: '2 minutes ago',
          icon: <Users size={16} />
        },
        {
          id: 'member-expiry',
          type: 'member',
          title: 'Membership Expiring Soon',
          description: '5 members have expiring memberships this week',
          time: '1 hour ago',
          icon: <AlertCircle size={16} />
        }
      );
    }

    // Session activities
    if (hasPermission('SESSION_VIEW')) {
      activities.push(
        {
          id: 'session-completed',
          type: 'session',
          title: 'PT Session Completed',
          description: 'Sarah completed session with Mike Johnson',
          time: '3 hours ago',
          icon: <Calendar size={16} />
        },
        {
          id: 'session-scheduled',
          type: 'session',
          title: 'New Session Scheduled',
          description: 'Tomorrow at 10:00 AM - Upper Body Training',
          time: '4 hours ago',
          icon: <Clock size={16} />
        }
      );
    }

    // Payment activities
    if (hasPermission('BILLING_VIEW')) {
      activities.push(
        {
          id: 'payment-received',
          type: 'payment',
          title: 'Payment Received',
          description: '₹150 from Emily Davis - Monthly membership',
          time: '5 hours ago',
          icon: <IndianRupee size={16} />
        }
      );
    }

    // Staff activities
    if (hasPermission('STAFF_VIEW')) {
      activities.push(
        {
          id: 'staff-performance',
          type: 'staff',
          title: 'Performance Review Completed',
          description: 'Mike Johnson - Excellent performance this month',
          time: '6 hours ago',
          icon: <UserCheck size={16} />
        }
      );
    }

    return activities;
  };

  const getWelcomeMessage = () => {
    if (!user) return 'Welcome back!';

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const roleMessage = user.primaryRole ? `, ${user.primaryRole.toLowerCase()}` : '';

    return `${timeOfDay}, ${user.fullName}${roleMessage}!`;
  };

  const getRoleSpecificInsights = () => {
    if (!user) return [];

    const insights = [];

    if (user.roles.includes('OWNER')) {
      insights.push({
        title: 'Business Overview',
        description: 'Your gym is performing 15% better than last month',
        icon: <BarChart3 size={16} />,
        color: '#10b981'
      });
    }

    if (user.roles.includes('TRAINER')) {
      insights.push({
        title: 'Training Schedule',
        description: 'You have 6 sessions scheduled for today',
        icon: <Target size={16} />,
        color: '#3b82f6'
      });
    }

    if (user.roles.includes('MEMBER')) {
      insights.push({
        title: 'Membership Status',
        description: 'Your membership is active until Dec 2024',
        icon: <CreditCard size={16} />,
        color: '#8b5cf6'
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="multi-role-dashboard loading">
        <div className="loading-spinner">
          <Dumbbell className="animate-spin" size={32} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="multi-role-dashboard">
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dashboard-welcome">
          <h1>{getWelcomeMessage()}</h1>
          <p>
            {user?.roles && user.roles.length > 1
              ? `You have access as: ${user.roles.join(', ')}`
              : `Managing your gym with ${user?.primaryRole || 'user'} privileges`
            }
          </p>
        </div>

        {/* Role-specific insights */}
        {getRoleSpecificInsights().map((insight, index) => (
          <motion.div
            key={index}
            className="role-insight"
            style={{ borderColor: insight.color }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <div className="insight-icon" style={{ color: insight.color }}>
              {insight.icon}
            </div>
            <div className="insight-content">
              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        className="metrics-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            className="metric-card"
            style={{ borderTopColor: metric.color }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
          >
            <div className="metric-icon" style={{ color: metric.color }}>
              {metric.icon}
            </div>
            <div className="metric-content">
              <h3>{metric.title}</h3>
              <div className="metric-value">
                <span className="value">{metric.value}</span>
                {metric.change && (
                  <span className={`change ${metric.changeType}`}>
                    {metric.changeType === 'increase' && '↑'}
                    {metric.changeType === 'decrease' && '↓'}
                    {metric.change}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <motion.div
          className="quick-actions-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                className="quick-action-card"
                style={{ borderTopColor: action.color }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="action-icon" style={{ color: action.color }}>
                  {action.icon}
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <motion.div
          className="activity-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <div className={`activity-icon activity-icon--${activity.type}`}>
                  {activity.icon}
                </div>
                <div className="activity-content">
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MultiRoleDashboard;
