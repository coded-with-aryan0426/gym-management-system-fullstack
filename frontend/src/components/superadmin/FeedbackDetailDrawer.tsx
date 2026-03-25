import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, CheckCircle, Share2, Download, ExternalLink, Copy, MapPin } from 'lucide-react';
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
  const [showJsonPayload, setShowJsonPayload] = useState(false);

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

    try {
      const feedbackId = String(feedback.id || '');
      const submittedDate = format(new Date(feedback.submittedAt || new Date()), 'yyyy-MM-dd HH:mm:ss');
      const csv = `ID,Tester,Email,Role,Page,Section,Severity,Category,Subject,Description,Status,Priority,Submitted
${feedbackId},"${(feedback.testerName || '').replace(/"/g, '""')}","${(feedback.testerEmail || '').replace(/"/g, '""')}","${(feedback.testerRole || '').replace(/"/g, '""')}","${(feedback.pageRoute || '').replace(/"/g, '""')}","${(feedback.section || '').replace(/"/g, '""')}","${(feedback.severity || '').replace(/"/g, '""')}","${(feedback.category || '').replace(/"/g, '""')}","${(feedback.subject || '').replace(/"/g, '""')}","${(feedback.description || '').replace(/"/g, '""')}","${(feedback.status || '').replace(/"/g, '""')}",${Number(feedback.priorityScore) || 0},"${submittedDate}"`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-${feedbackId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting feedback:', error);
    }
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
                        <span>#{String(feedback.id)}</span>
                      </div>
                      <div className="info-item">
                        <label>Tester</label>
                        <span>{feedback.testerName || '—'}</span>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <span>{feedback.testerEmail || '—'}</span>
                      </div>
                      <div className="info-item">
                        <label>Role</label>
                        <span>{feedback.testerRole || '—'}</span>
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
                        <span className="chip-text">{(feedback.severity || '').replace('_', ' ')}</span>
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
                        <span>{feedback.submittedAt ? format(new Date(feedback.submittedAt), 'MMM dd, yyyy HH:mm:ss') : '—'}</span>
                      </div>
                      <div className="info-item">
                        <label>Session ID</label>
                        <span className="code-text">{feedback.sessionId || '—'}</span>
                      </div>
                    </div>
                  </section>

                  {/* Element Information */}
                  {feedback.elementPath && (
                    <section className="info-section">
                      <h3 className="section-title">
                        <MapPin size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Selected Element
                      </h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Semantic Label</label>
                          <span>{feedback.elementSemanticLabel || '—'}</span>
                        </div>
                        <div className="info-item">
                          <label>Element Path</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="code-text" style={{ fontSize: '11px', wordBreak: 'break-all', maxWidth: '300px' }}>
                              {feedback.elementPath}
                            </span>
                            <button
                              onClick={() => navigator.clipboard.writeText(feedback.elementPath || '')}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: '#3b82f6',
                              }}
                              title="Copy element path"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="info-item">
                          <label>CSS Selector</label>
                          <span className="code-text">{feedback.elementSelector || '—'}</span>
                        </div>
                        <div className="info-item">
                          <label>Bounding Box</label>
                          <span className="code-text">{feedback.elementBoundingBox || '—'}</span>
                        </div>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <a
                          href={`${feedback.pageRoute}?highlight=${encodeURIComponent(feedback.elementPath || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-link"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            borderRadius: '6px',
                            fontSize: '12px',
                            textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={14} />
                          View in Context
                        </a>
                        <button
                          onClick={() => setShowJsonPayload(!showJsonPayload)}
                          className="action-link"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: '#8b5cf6',
                            borderRadius: '6px',
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Copy size={14} />
                          {showJsonPayload ? 'Hide' : 'Show'} JSON
                        </button>
                      </div>
                      {showJsonPayload && (
                        <pre style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          overflow: 'auto',
                          maxHeight: '200px',
                        }}>
                          {JSON.stringify({
                            page: feedback.pageRoute,
                            section: feedback.section,
                            elementPath: feedback.elementPath,
                            elementSelector: feedback.elementSelector,
                            elementSemanticLabel: feedback.elementSemanticLabel,
                            elementBoundingBox: feedback.elementBoundingBox,
                            severity: feedback.severity,
                            category: feedback.category,
                            subject: feedback.subject,
                            description: feedback.description,
                            tester: {
                              name: feedback.testerName,
                              email: feedback.testerEmail,
                              role: feedback.testerRole,
                            },
                            browser: feedback.browser,
                            screenSize: feedback.screenSize,
                          }, null, 2)}
                        </pre>
                      )}
                    </section>
                  )}

                  {/* Edit Section */}
                  <section className="edit-section">
                    <h3 className="section-title">Admin Actions</h3>

                    {!editMode ? (
                      <div className="edit-view">
                        <div className="info-item">
                          <label>Status</label>
                          <span className="chip-text">{(feedback.status || '').replace('_', ' ')}</span>
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
