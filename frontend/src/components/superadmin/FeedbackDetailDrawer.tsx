import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, CheckCircle, Share2, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { BetaFeedback, FeedbackStatus } from '../../types/feedback.types';
import { betaFeedbackApi } from '../../services/api';
import './feedback-dashboard.css';

interface FeedbackDetailDrawerProps {
  feedback: BetaFeedback | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedFeedback: BetaFeedback) => void;
}

export const FeedbackDetailDrawer: React.FC<FeedbackDetailDrawerProps> = ({
  feedback,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState({
    status: '' as FeedbackStatus,
    priorityScore: 0,
    adminNotes: '',
  });

  useEffect(() => {
    if (feedback) {
      setEditValues({
        status: feedback.status,
        priorityScore: feedback.priorityScore ?? 0,
        adminNotes: feedback.adminNotes ?? '',
      });
    }
  }, [feedback]);

  const handleSaveChanges = async () => {
    if (!feedback) return;

    try {
      setIsSaving(true);
      const updated = await betaFeedbackApi.updateFeedbackStatus(feedback.id, {
        status: editValues.status,
        priorityScore: editValues.priorityScore,
        adminNotes: editValues.adminNotes,
      });

      onUpdate?.(updated);
      setEditMode(false);
      // Toast notification would go here
    } catch (error) {
      console.error('Error updating feedback:', error);
      // Toast error notification would go here
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!feedback) return;

    try {
      setIsSaving(true);
      const updated = await betaFeedbackApi.updateFeedbackStatus(feedback.id, {
        status: 'RESOLVED',
      });

      onUpdate?.(updated);
      // Toast notification would go here
    } catch (error) {
      console.error('Error marking as resolved:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!feedback) return;

    const csv = `ID,Tester,Email,Role,Page,Section,Severity,Category,Subject,Description,Status,Priority,Submitted
${feedback.id},"${feedback.testerName}","${feedback.testerEmail}","${feedback.testerRole}","${feedback.pageRoute}","${feedback.section}","${feedback.severity}","${feedback.category}","${feedback.subject}","${feedback.description}","${feedback.status}",${feedback.priorityScore},"${format(new Date(feedback.submittedAt), 'yyyy-MM-dd HH:mm:ss')}"`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${feedback.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="feedback-detail-drawer"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="drawer-header">
              <h2 className="drawer-title">Feedback Details</h2>
              <button onClick={onClose} className="drawer-close-btn">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="drawer-content">
              {feedback ? (
                <>
                  {/* Basic Info */}
                  <section className="info-section">
                    <h3 className="section-title">Feedback Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>ID</label>
                        <span>#{feedback.id}</span>
                      </div>
                      <div className="info-item">
                        <label>Tester</label>
                        <span>{feedback.testerName}</span>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <span>{feedback.testerEmail}</span>
                      </div>
                      <div className="info-item">
                        <label>Role</label>
                        <span>{feedback.testerRole}</span>
                      </div>
                    </div>
                  </section>

                  {/* Page Context */}
                  <section className="info-section">
                    <h3 className="section-title">Page Context</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Page Route</label>
                        <span className="code-text">{feedback.pageRoute}</span>
                      </div>
                      <div className="info-item">
                        <label>Section</label>
                        <span>{feedback.section || 'General'}</span>
                      </div>
                      <div className="info-item">
                        <label>Browser</label>
                        <span className="code-text">{feedback.browser}</span>
                      </div>
                      <div className="info-item">
                        <label>Screen Size</label>
                        <span>{feedback.screenSize}</span>
                      </div>
                    </div>
                  </section>

                  {/* Issue Details */}
                  <section className="info-section">
                    <h3 className="section-title">Issue Details</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Severity</label>
                        <span className="chip-text">{feedback.severity.replace('_', ' ')}</span>
                      </div>
                      <div className="info-item">
                        <label>Category</label>
                        <span className="chip-text">{feedback.category}</span>
                      </div>
                    </div>

                    <div className="info-item full-width">
                      <label>Subject</label>
                      <p className="text-content">{feedback.subject}</p>
                    </div>

                    <div className="info-item full-width">
                      <label>Description</label>
                      <p className="text-content">{feedback.description}</p>
                    </div>

                    {feedback.stepsToReproduce && (
                      <div className="info-item full-width">
                        <label>Steps to Reproduce</label>
                        <p className="text-content whitespace-pre-wrap">
                          {feedback.stepsToReproduce}
                        </p>
                      </div>
                    )}

                    {feedback.screenshotUrl && (
                      <div className="info-item full-width">
                        <label>Screenshot</label>
                        <a
                          href={feedback.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="screenshot-link"
                        >
                          View Screenshot →
                        </a>
                      </div>
                    )}
                  </section>

                  {/* Metadata */}
                  <section className="info-section">
                    <h3 className="section-title">Metadata</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Submitted</label>
                        <span>{format(new Date(feedback.submittedAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                      </div>
                      <div className="info-item">
                        <label>Session ID</label>
                        <span className="code-text">{feedback.sessionId}</span>
                      </div>
                    </div>
                  </section>

                  {/* Edit Section */}
                  <section className="edit-section">
                    <h3 className="section-title">Admin Actions</h3>

                    {!editMode ? (
                      <div className="edit-view">
                        <div className="info-item">
                          <label>Status</label>
                          <span className="chip-text">{feedback.status.replace('_', ' ')}</span>
                        </div>
                        <div className="info-item">
                          <label>Priority Score</label>
                          <span>{feedback.priorityScore ?? 0}/10</span>
                        </div>
                        {feedback.adminNotes && (
                          <div className="info-item full-width">
                            <label>Admin Notes</label>
                            <p className="text-content">{feedback.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="edit-form">
                        <div className="form-group">
                          <label className="form-label">Status</label>
                          <select
                            value={editValues.status}
                            onChange={(e) => setEditValues(prev => ({
                              ...prev,
                              status: e.target.value as FeedbackStatus
                            }))}
                            className="form-select"
                          >
                            <option value="NEW">New</option>
                            <option value="ACKNOWLEDGED">Acknowledged</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="WONT_FIX">Won't Fix</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Priority Score (0-10)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={editValues.priorityScore}
                            onChange={(e) => setEditValues(prev => ({
                              ...prev,
                              priorityScore: Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
                            }))}
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Admin Notes</label>
                          <textarea
                            value={editValues.adminNotes}
                            onChange={(e) => setEditValues(prev => ({
                              ...prev,
                              adminNotes: e.target.value
                            }))}
                            rows={4}
                            className="form-textarea"
                            placeholder="Add admin notes..."
                          />
                        </div>
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <div className="drawer-empty">
                  <p>No feedback selected</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {feedback && (
              <div className="drawer-footer">
                {!editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="action-btn primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleMarkResolved}
                      disabled={isSaving || feedback.status === 'RESOLVED'}
                      className="action-btn secondary"
                    >
                      <CheckCircle size={16} />
                      Mark Resolved
                    </button>
                    <button
                      onClick={handleExport}
                      className="action-btn secondary"
                    >
                      <Download size={16} />
                      Export
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="action-btn secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="action-btn primary"
                    >
                      <Save size={16} />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeedbackDetailDrawer;
