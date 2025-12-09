import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Users, FileText, CheckCircle, XCircle, AlertCircle, Repeat, Loader2, Edit2, Save } from 'lucide-react';
import { ptSessionApi } from '../../services/api';
import type { PTSessionDTO } from '../../types/ptSession';
import Modal from '../Modal/Modal';
import Button from '../base/Button';
import Badge from '../base/Badge';
import { showToast } from '../../utils/toast';
import './SessionDetailsModal.css';

interface SessionDetailsModalProps {
  session: PTSessionDTO;
  onClose: () => void;
  onUpdate: () => void;
}

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  onClose,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<any>(session.status);
  const [progressNotes, setProgressNotes] = useState(session.progressNotes || '');
  const [workoutPlan, setWorkoutPlan] = useState(session.workoutPlan || '');
  const [dietPlan, setDietPlan] = useState(session.dietPlan || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateSession = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const updatedSession: PTSessionDTO = {
        ...session,
        status: status as any,
        progressNotes: progressNotes.trim(),
        workoutPlan: workoutPlan.trim() || undefined,
        dietPlan: dietPlan.trim() || undefined,
        memberAttended: status === 'COMPLETED'
      };

      await ptSessionApi.updateSession(session.sessionId!, updatedSession);
      showToast.success('Session updated successfully!');
      onUpdate();
      setIsEditing(false);
    } catch (err: any) {
      console.error('Update session error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update session';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      SCHEDULED: 'info',
      COMPLETED: 'success',
      MISSED: 'warning',
      CANCELLED: 'error'
    };
    return statusMap[status as keyof typeof statusMap] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      SCHEDULED: <Clock size={16} />,
      COMPLETED: <CheckCircle size={16} />,
      MISSED: <AlertCircle size={16} />,
      CANCELLED: <XCircle size={16} />
    };
    return icons[status as keyof typeof icons] || <Clock size={16} />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const { date, time } = formatDateTime(session.sessionDate);

  const statusOptions = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'MISSED', label: 'Missed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Session Details"
    >
      <div className="session-details-modal__content">
        <AnimatePresence>
          {error && (
            <motion.div
              className="session-details-modal__error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError(null)}><XCircle size={16} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="session-details-modal__layout-grid">
          {/* Left Column: Status & Info */}
          <div className="session-details-modal__left-col">
            <div className="session-details-modal__header">
              <div className="session-details-modal__status">
                {isEditing ? (
                  <select
                    className="session-details-modal__status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge variant={getStatusBadge(session.status) as any}>
                    {getStatusIcon(session.status)}
                    <span>{session.status}</span>
                  </Badge>
                )}
              </div>
              {session.isRecurring && (
                <motion.span
                  className="session-details-modal__recurring"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Repeat size={14} />
                  Recurring ({session.recurringFrequency})
                </motion.span>
              )}
            </div>

            <div className="session-details-modal__section">
              <h3 className="session-details-modal__section-title">
                <Calendar size={18} />
                Session Information
              </h3>
              <div className="session-details-modal__info-grid">
                <motion.div
                  className="session-details-modal__info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="session-details-modal__info-label">
                    <Calendar size={14} /> Date
                  </span>
                  <span className="session-details-modal__info-value">{date}</span>
                </motion.div>
                <motion.div
                  className="session-details-modal__info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <span className="session-details-modal__info-label">
                    <Clock size={14} /> Time
                  </span>
                  <span className="session-details-modal__info-value">{time}</span>
                </motion.div>
                <motion.div
                  className="session-details-modal__info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="session-details-modal__info-label">
                    <Clock size={14} /> Duration
                  </span>
                  <span className="session-details-modal__info-value">{session.durationMinutes} minutes</span>
                </motion.div>
                <motion.div
                  className="session-details-modal__info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className="session-details-modal__info-label">
                    <User size={14} /> Trainer
                  </span>
                  <span className="session-details-modal__info-value">{session.trainerName}</span>
                </motion.div>
                <motion.div
                  className="session-details-modal__info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="session-details-modal__info-label">
                    <Users size={14} /> Member
                  </span>
                  <span className="session-details-modal__info-value">{session.memberName}</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Column: Notes & Plans */}
          <div className="session-details-modal__right-col">
            <div className="session-details-modal__section">
              <h3 className="session-details-modal__section-title">
                <FileText size={18} />
                Progress Notes
              </h3>
              {isEditing ? (
                <textarea
                  className="session-details-modal__textarea"
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Describe the member's progress, exercises completed, and any observations..."
                  rows={4}
                />
              ) : (
                <p className="session-details-modal__text">
                  {session.progressNotes || 'No progress notes'}
                </p>
              )}
            </div>

            <div className="session-details-modal__plans-row">
              <div className="session-details-modal__section">
                <h3 className="session-details-modal__section-title">
                  <FileText size={18} />
                  Workout Plan
                </h3>
                {isEditing ? (
                  <textarea
                    className="session-details-modal__textarea"
                    value={workoutPlan}
                    onChange={(e) => setWorkoutPlan(e.target.value)}
                    placeholder="List exercises, sets, reps, weights used..."
                    rows={3}
                  />
                ) : (
                  <p className="session-details-modal__text">
                    {session.workoutPlan || 'No workout plan'}
                  </p>
                )}
              </div>

              <div className="session-details-modal__section">
                <h3 className="session-details-modal__section-title">
                  <FileText size={18} />
                  Diet Plan
                </h3>
                {isEditing ? (
                  <textarea
                    className="session-details-modal__textarea"
                    value={dietPlan}
                    onChange={(e) => setDietPlan(e.target.value)}
                    placeholder="Dietary recommendations, meal suggestions..."
                    rows={3}
                  />
                ) : (
                  <p className="session-details-modal__text">
                    {session.dietPlan || 'No diet plan'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="session-details-modal__actions">
          {!isEditing ? (
            <>
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={16} />
                Edit Details
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setStatus(session.status);
                  setProgressNotes(session.progressNotes || '');
                  setWorkoutPlan(session.workoutPlan || '');
                  setDietPlan(session.dietPlan || '');
                  setError(null);
                }}
                disabled={submitting}
              >
                Cancel Edit
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateSession}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SessionDetailsModal;
