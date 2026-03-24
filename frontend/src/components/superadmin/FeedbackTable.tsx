import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, AlertCircle } from 'lucide-react';
import type { BetaFeedback } from '../../types/feedback.types';
import './feedback-dashboard.css';

interface FeedbackTableProps {
  feedbackList: BetaFeedback[];
  isLoading?: boolean;
  onRowClick: (feedback: BetaFeedback) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    'BUG': '#ef4444',
    'UI_ISSUE': '#f97316',
    'SUGGESTION': '#3b82f6',
    'IMPROVEMENT': '#10b981',
    'QUESTION': '#8b5cf6',
  };
  return colors[severity] || '#6b7280';
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'NEW': '#3b82f6',
    'ACKNOWLEDGED': '#f59e0b',
    'IN_PROGRESS': '#8b5cf6',
    'RESOLVED': '#10b981',
    'WONT_FIX': '#6b7280',
  };
  return colors[status] || '#6b7280';
};

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  feedbackList,
  isLoading = false,
  onRowClick,
  page,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="feedback-table-container">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tester</th>
              <th>Page</th>
              <th>Severity</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Priority</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td className="skeleton-cell" />
                <td className="skeleton-cell" />
                <td className="skeleton-cell" />
                <td className="skeleton-cell" />
                <td className="skeleton-cell" />
                <td className="skeleton-cell" />
                <td className="skeleton-cell" />
                <td className="skeleton-cell" />
                <td className="skeleton-cell" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!feedbackList || feedbackList.length === 0) {
    return (
      <div className="feedback-table-empty">
        <AlertCircle size={48} className="empty-icon" />
        <h3>No Feedback Found</h3>
        <p>Try adjusting your filters or check back later</p>
      </div>
    );
  }

  return (
    <div className="feedback-table-container">
      <div className="table-wrapper">
        <table className="feedback-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th style={{ width: '140px' }}>Tester</th>
              <th style={{ width: '150px' }}>Page</th>
              <th style={{ width: '110px' }}>Severity</th>
              <th style={{ width: '200px' }}>Subject</th>
              <th style={{ width: '120px' }}>Status</th>
              <th style={{ width: '140px' }}>Submitted</th>
              <th style={{ width: '80px' }}>Priority</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.map((feedback, index) => (
              <motion.tr
                key={feedback.id}
                className="feedback-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onRowClick(feedback)}
              >
                <td className="cell-id">
                  <span className="id-badge">{feedback.id}</span>
                </td>
                <td className="cell-tester">
                  <div className="tester-info">
                    <p className="tester-name">{feedback.testerName}</p>
                    <p className="tester-role">{feedback.testerRole}</p>
                  </div>
                </td>
                <td className="cell-page">
                  <span className="page-route">{feedback.pageRoute}</span>
                </td>
                <td className="cell-severity">
                  <span
                    className="severity-chip"
                    style={{
                      backgroundColor: getSeverityColor(feedback.severity) + '20',
                      color: getSeverityColor(feedback.severity),
                      borderColor: getSeverityColor(feedback.severity),
                    }}
                  >
                    {feedback.severity.replace('_', ' ')}
                  </span>
                </td>
                <td className="cell-subject">
                  <span className="subject-truncated" title={feedback.subject}>
                    {feedback.subject.length > 50
                      ? `${feedback.subject.substring(0, 50)}...`
                      : feedback.subject}
                  </span>
                </td>
                <td className="cell-status">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(feedback.status) + '20',
                      color: getStatusColor(feedback.status),
                      borderColor: getStatusColor(feedback.status),
                    }}
                  >
                    {feedback.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="cell-submitted">
                  <span className="submitted-time">
                    {formatDistanceToNow(new Date(feedback.submittedAt), { addSuffix: true })}
                  </span>
                </td>
                <td className="cell-priority">
                  <span className="priority-score">
                    {feedback.priorityScore ?? 0}/10
                  </span>
                </td>
                <td className="cell-action">
                  <ChevronRight size={18} className="action-icon" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="pagination-btn"
          >
            Previous
          </button>

          <div className="pagination-info">
            Page {page + 1} of {totalPages}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackTable;
