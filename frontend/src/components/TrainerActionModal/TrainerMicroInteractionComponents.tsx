// Staff-Specific Micro-Interaction Components

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Role Badge Component
interface RoleBadgeProps {
  role: string;
  isActive?: boolean;
  permissions?: string[];
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  isActive = true,
  permissions = []
}) => {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'trainer':
        return 'bg-blue-500';
      case 'manager':
        return 'bg-purple-500';
      case 'admin':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      className={`role-badge ${getRoleColor(role)} ${!isActive ? 'role-badge--inactive' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={permissions.length > 0 ? `Permissions: ${permissions.join(', ')}` : undefined}
    >
      <span className="role-badge__text">{role}</span>
      {!isActive && <span className="role-badge__inactive-indicator">●</span>}
    </motion.div>
  );
};

// Schedule Availability Indicator
interface ScheduleAvailabilityProps {
  isAvailable: boolean;
  nextAvailableSlot?: string;
  currentSession?: {
    memberName: string;
    endTime: string;
  };
}

export const ScheduleAvailability: React.FC<ScheduleAvailabilityProps> = ({
  isAvailable,
  nextAvailableSlot,
  currentSession
}) => {
  return (
    <motion.div
      className="schedule-availability"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className={`availability-status ${isAvailable ? 'available' : 'busy'}`}>
        <div className="status-indicator" />
        <span className="status-text">
          {isAvailable ? 'Available' : 'In Session'}
        </span>
      </div>
      
      {currentSession && (
        <motion.div
          className="current-session"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="session-member">{currentSession.memberName}</span>
          <span className="session-end">Until {currentSession.endTime}</span>
        </motion.div>
      )}
      
      {nextAvailableSlot && !isAvailable && (
        <motion.div
          className="next-available"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Next available: {nextAvailableSlot}
        </motion.div>
      )}
    </motion.div>
  );
};

// Performance Metrics Widget
interface PerformanceMetricsProps {
  metrics: {
    sessionsThisWeek: number;
    customerSatisfaction: number;
    attendanceRate: number;
  };
  isLoading?: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  isLoading = false
}) => {
  const [animatedMetrics, setAnimatedMetrics] = useState({
    sessionsThisWeek: 0,
    customerSatisfaction: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    if (!isLoading) {
      // Animate metrics counting up
      const duration = 1000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedMetrics({
          sessionsThisWeek: Math.floor(metrics.sessionsThisWeek * progress),
          customerSatisfaction: Math.floor(metrics.customerSatisfaction * progress),
          attendanceRate: Math.floor(metrics.attendanceRate * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedMetrics(metrics);
        }
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [metrics, isLoading]);

  if (isLoading) {
    return (
      <div className="performance-metrics performance-metrics--loading">
        <div className="metrics-skeleton">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="metric-skeleton">
              <div className="metric-skeleton__value" />
              <div className="metric-skeleton__label" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="performance-metrics"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="metrics-title">This Week</h4>
      <div className="metrics-grid">
        <motion.div
          className="metric-item"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="metric-value">{animatedMetrics.sessionsThisWeek}</div>
          <div className="metric-label">Sessions</div>
        </motion.div>
        
        <motion.div
          className="metric-item"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="metric-value">{animatedMetrics.customerSatisfaction}%</div>
          <div className="metric-label">Satisfaction</div>
        </motion.div>
        
        <motion.div
          className="metric-item"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="metric-value">{animatedMetrics.attendanceRate}%</div>
          <div className="metric-label">Attendance</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Quick Actions Toolbar
interface QuickActionsToolbarProps {
  actions: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    badge?: number;
  }>;
}

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  actions
}) => {
  return (
    <motion.div
      className="quick-actions-toolbar"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, staggerChildren: 0.1 }}
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          className={`toolbar-action ${action.disabled ? 'disabled' : ''}`}
          onClick={action.onClick}
          disabled={action.disabled}
          whileHover={action.disabled ? {} : { scale: 1.1, y: -2 }}
          whileTap={action.disabled ? {} : { scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="toolbar-action__icon">
            {action.icon}
            {action.badge && action.badge > 0 && (
              <motion.div
                className="toolbar-action__badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {action.badge > 99 ? '99+' : action.badge}
              </motion.div>
            )}
          </div>
          <span className="toolbar-action__label">{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

// Customer Assignment Progress
interface CustomerAssignmentProgressProps {
  totalCustomers: number;
  assignedCustomers: number;
  maxCapacity: number;
}

export const CustomerAssignmentProgress: React.FC<CustomerAssignmentProgressProps> = ({
  totalCustomers,
  assignedCustomers,
  maxCapacity
}) => {
  const progressPercentage = (assignedCustomers / maxCapacity) * 100;
  const isNearCapacity = progressPercentage > 80;
  const isAtCapacity = progressPercentage >= 100;

  return (
    <motion.div
      className="customer-assignment-progress"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="progress-header">
        <span className="progress-label">Customer Load</span>
        <span className={`progress-value ${isAtCapacity ? 'at-capacity' : isNearCapacity ? 'near-capacity' : ''}`}>
          {assignedCustomers}/{maxCapacity}
        </span>
      </div>
      
      <div className="progress-bar-container">
        <motion.div
          className={`progress-bar ${isAtCapacity ? 'at-capacity' : isNearCapacity ? 'near-capacity' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      
      {isAtCapacity && (
        <motion.div
          className="capacity-warning"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          ⚠️ At maximum capacity
        </motion.div>
      )}
    </motion.div>
  );
};

// Contextual Help Tooltip
interface ContextualHelpProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  children: React.ReactNode;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  content,
  position = 'top',
  trigger = 'hover',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div
      className="contextual-help"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`help-tooltip help-tooltip--${position}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="help-tooltip__content">{content}</div>
            <div className="help-tooltip__arrow" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notification Bell
interface NotificationBellProps {
  count: number;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: Date;
  }>;
  onNotificationClick: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count,
  notifications,
  onNotificationClick,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notification-bell">
      <motion.button
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={count > 0 ? { rotate: [0, 15, -15, 0] } : {}}
        transition={{ duration: 0.5, repeat: count > 0 ? Infinity : 0, repeatDelay: 3 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <motion.div
            className="notification-count"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {count > 99 ? '99+' : count}
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notification-header">
              <span>Notifications ({count})</span>
              {count > 0 && (
                <button className="clear-all-btn" onClick={onClearAll}>
                  Clear All
                </button>
              )}
            </div>
            
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">No new notifications</div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`notification-item notification-item--${notification.type}`}
                    onClick={() => onNotificationClick(notification.id)}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                    layout
                  >
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {notification.timestamp.toLocaleTimeString()}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};