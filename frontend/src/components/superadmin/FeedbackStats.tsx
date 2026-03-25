import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import type { FeedbackStats } from '../../types/feedback.types';
import { superAdminApi } from '../../services/superAdminApi';
import './feedback-dashboard.css';

interface FeedbackStatsProps {
  onFilterChange?: (filterType: string, value: string) => void;
}

export const FeedbackStatsComponent: React.FC<FeedbackStatsProps> = ({ onFilterChange }) => {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getBetaFeedbackStats();
      setStats(data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError(null);
        setStats({
          totalCount: 0,
          openCount: 0,
          resolvedCount: 0,
          bugCount: 0,
          uiIssueCount: 0,
          suggestionCount: 0,
          improvementCount: 0,
          questionCount: 0,
          byPage: {},
          byStatus: {
            NEW: 0,
            ACKNOWLEDGED: 0,
            IN_PROGRESS: 0,
            RESOLVED: 0,
            WONT_FIX: 0
          },
          bySeverity: {
            BUG: 0,
            UI_ISSUE: 0,
            SUGGESTION: 0,
            IMPROVEMENT: 0,
            QUESTION: 0
          },
          byCategory: {
            UI: 0,
            PERFORMANCE: 0,
            LOGIC: 0,
            FEATURE: 0,
            SECURITY: 0,
            DATA: 0
          }
        });
      } else {
        setError('Unable to load statistics right now');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="feedback-stats-container">
        <div className="stats-skeleton">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="feedback-stats-container">
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error || 'No statistics available'}</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Feedback',
      value: stats.totalCount,
      icon: BarChart3,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
    },
    {
      title: 'Open Issues',
      value: stats.openCount,
      icon: Clock,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Resolved',
      value: stats.resolvedCount,
      icon: CheckCircle,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Bugs',
      value: stats.bugCount,
      icon: AlertCircle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  const severityChips = [
    { label: 'BUG', value: stats.bugCount, color: '#ef4444' },
    { label: 'UI Issues', value: stats.uiIssueCount, color: '#f97316' },
    { label: 'Suggestions', value: stats.suggestionCount, color: '#3b82f6' },
    { label: 'Improvements', value: stats.improvementCount, color: '#10b981' },
    { label: 'Questions', value: stats.questionCount, color: '#8b5cf6' },
  ];

  return (
    <div className="feedback-stats-container">
      {/* Main Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                borderLeft: `4px solid ${card.color}`,
              }}
            >
              <div className="stat-header">
                <div className="stat-icon" style={{ backgroundColor: card.bgColor }}>
                  <Icon size={24} color={card.color} />
                </div>
                <h3 className="stat-title">{card.title}</h3>
              </div>
              <div className="stat-value">{Number(card.value ?? 0).toLocaleString()}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Severity Filter Chips */}
      <div className="severity-chips-section">
        <h4 className="section-title">By Severity</h4>
        <div className="chips-container">
          {severityChips.map((chip, index) => (
            <motion.button
              key={index}
              className="severity-chip"
              style={{
                backgroundColor: chip.color + '15',
                borderColor: chip.color,
                color: chip.color,
              }}
              onClick={() => onFilterChange?.('severity', chip.label.replace(' ', '_').toUpperCase())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="chip-value">{chip.value}</span>
              <span className="chip-label">{chip.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="status-breakdown-section">
        <h4 className="section-title">By Status</h4>
        <div className="status-bars">
          {Object.entries(stats.byStatus || {}).map(([status, count], index) => {
            const total = stats.totalCount || 1;
            const percentage = (count / total) * 100;
            const statusColors: Record<string, string> = {
              'NEW': '#3b82f6',
              'ACKNOWLEDGED': '#f59e0b',
              'IN_PROGRESS': '#8b5cf6',
              'RESOLVED': '#10b981',
              'WONT_FIX': '#6b7280',
            };

            return (
              <div key={index} className="status-bar-item">
                <div className="status-label-row">
                  <span className="status-label">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ backgroundColor: statusColors[status] || '#6b7280' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="stats-footer">
        <button
          className="refresh-button"
          onClick={fetchStats}
          disabled={loading}
        >
          <TrendingUp size={16} />
          Refresh Stats
        </button>
      </div>
    </div>
  );
};

export default FeedbackStatsComponent;
