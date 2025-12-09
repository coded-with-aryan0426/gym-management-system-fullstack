import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Calendar, DollarSign, UserCheck, AlertCircle } from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp } from '../../utils/animations';
import './ActivityFeed.css';

interface Activity {
  id: number;
  type: 'member_joined' | 'session_completed' | 'payment_received' | 'staff_checkin' | 'membership_expiring';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'member_joined':
        return <UserPlus size={16} />;
      case 'session_completed':
        return <Calendar size={16} />;
      case 'payment_received':
        return <DollarSign size={16} />;
      case 'staff_checkin':
        return <UserCheck size={16} />;
      case 'membership_expiring':
        return <AlertCircle size={16} />;
      default:
        return <UserPlus size={16} />;
    }
  };

  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'member_joined':
        return 'success';
      case 'session_completed':
        return 'info';
      case 'payment_received':
        return 'success';
      case 'staff_checkin':
        return 'primary';
      case 'membership_expiring':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <motion.div 
      className="activity-feed"
      {...fadeInUp}
    >
      <div className="activity-feed__header">
        <h3 className="activity-feed__title">Recent Activity</h3>
      </div>
      
      <motion.div 
        className="activity-feed__list"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence>
          {activities.length === 0 ? (
            <motion.div 
              className="activity-feed__empty"
              {...fadeInUp}
            >
              <p>No recent activity</p>
            </motion.div>
          ) : (
            activities.map((activity, index) => (
              <motion.div 
                key={activity.id} 
                className="activity-item"
                variants={staggerItem}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.02, x: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <motion.div 
                  className={`activity-item__icon activity-item__icon--${getColor(activity.type)}`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring' }}
                >
                  {getIcon(activity.type)}
                </motion.div>
                
                <div className="activity-item__content">
                  <div className="activity-item__title">{activity.title}</div>
                  <div className="activity-item__description">{activity.description}</div>
                  <div className="activity-item__timestamp">{activity.timestamp}</div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ActivityFeed;
