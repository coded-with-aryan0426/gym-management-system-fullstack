import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, RefreshCw, AlertCircle,
  Search, Filter, X, ChevronRight, ExternalLink,
  User, Calendar, Crosshair, MapPin, FileText, MessageSquare,
  Mail, Clipboard, CheckCircle
} from 'lucide-react';
import type { BetaFeedback, FeedbackStatus } from '../../types/feedback.types';
import { betaFeedbackApi } from '../../services/api';
import { superAdminApi } from '../../services/superAdminApi';
import '../../styles/page-common.css';
import './superadmin.css';

const SEVERITIES = ['BUG', 'UI_ISSUE', 'SUGGESTION', 'IMPROVEMENT', 'QUESTION'];
const STATUSES = ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'];
const CATEGORIES = ['UI', 'PERFORMANCE', 'LOGIC', 'FEATURE', 'SECURITY', 'DATA'];

type SortField = 'pageRoute' | 'section' | 'elementPath' | 'severity' | 'status' | 'submittedAt';
type SortDirection = 'asc' | 'desc';

const severityColor = (s: string) =>
  s === 'BUG' ? '#ef4444' : s === 'UI_ISSUE' ? '#f97316' : s === 'SUGGESTION' ? '#3b82f6' : s === 'IMPROVEMENT' ? '#10b981' : '#8b5cf6';

const statusColor = (s: string) =>
  s === 'NEW' ? '#3b82f6' : s === 'ACKNOWLEDGED' ? '#f59e0b' : s === 'IN_PROGRESS' ? '#8b5cf6' : s === 'RESOLVED' ? '#10b981' : '#6b7280';

const severityBg = (s: string) =>
  s === 'BUG' ? 'rgba(239,68,68,0.1)' : s === 'UI_ISSUE' ? 'rgba(249,115,22,0.1)' : s === 'SUGGESTION' ? 'rgba(59,130,246,0.1)' : s === 'IMPROVEMENT' ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

function FeedbackModal({ feedback, onClose, onUpdate }: {
  feedback: BetaFeedback;
  onClose: () => void;
  onUpdate?: (fb: BetaFeedback) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const [editValues, setEditValues] = useState({
    status: feedback.status as FeedbackStatus,
    priorityScore: feedback.priorityScore ?? 0,
    adminNotes: feedback.adminNotes ?? '',
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updated = await betaFeedbackApi.updateFeedbackStatus(feedback.id, {
        status: editValues.status,
        priorityScore: editValues.priorityScore,
        adminNotes: editValues.adminNotes,
      });
      onUpdate?.(updated);
      setEditMode(false);
    } catch {
      console.error('Failed to update feedback');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySessionId = () => {
    if (feedback.sessionId) {
      navigator.clipboard.writeText(feedback.sessionId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleMailto = () => {
    if (feedback.testerEmail) {
      const subject = encodeURIComponent(`Re: GymBeta Feedback #${feedback.id} - ${feedback.subject}`);
      const body = encodeURIComponent(`Hi ${feedback.testerName},\n\nRegarding your feedback:\n"${feedback.subject}"\n\n`);
      window.location.href = `mailto:${feedback.testerEmail}?subject=${subject}&body=${body}`;
    }
  };

  return (
    <motion.div
      className="fbmodal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="fbmodal"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <div className="fbmodal__header">
          <div className="fbmodal__header-left">
            <h2>Feedback Details</h2>
            <span className="fbmodal__id">#{feedback.id}</span>
          </div>
          <button className="fbmodal__close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="fbmodal__body">
          <div className="fbmodal__cards">
            {/* Card 1: Issue Summary */}
            <div className="fbcard fbcard--primary">
              <div className="fbcard__header">
                <FileText size={18} />
                <h3>Issue Summary</h3>
              </div>
              <div className="fbcard__body">
                <div className="fbmodal__subject">{feedback.subject}</div>
                <p className="fbmodal__description">{feedback.description || 'No description provided.'}</p>
                <div className="fbmodal__chips">
                  <span className="fbchip fbchip--category">{feedback.category || '—'}</span>
                  <span className="fbchip fbchip--priority">Priority: {feedback.priorityScore ?? '—'}/10</span>
                  <span className="fbchip fbchip--severity" style={{ background: severityBg(feedback.severity || ''), color: severityColor(feedback.severity || ''), border: `1px solid ${severityColor(feedback.severity || '')}` }}>
                    {(feedback.severity || '—').replace('_', ' ')}
                  </span>
                  <span className="fbchip fbchip--status" style={{ background: `${statusColor(feedback.status || '')}20`, color: statusColor(feedback.status || ''), border: `1px solid ${statusColor(feedback.status || '')}` }}>
                    {(feedback.status || '—').replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Tester Profile */}
            <div className="fbcard">
              <div className="fbcard__header">
                <User size={18} />
                <h3>Tester Profile</h3>
              </div>
              <div className="fbcard__body">
                <div className="fbfield">
                  <span className="fbfield__label">Name</span>
                  <span className="fbfield__value">{feedback.testerName || '—'}</span>
                </div>
                <div className="fbfield">
                  <span className="fbfield__label">Email</span>
                  <span className="fbfield__value fbfield__value--link">{feedback.testerEmail || '—'}</span>
                </div>
                <div className="fbfield">
                  <span className="fbfield__label">Role</span>
                  <span className="fbfield__value">{feedback.testerRole || '—'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Submission Metadata */}
            <div className="fbcard">
              <div className="fbcard__header">
                <Calendar size={18} />
                <h3>Submission Metadata</h3>
              </div>
              <div className="fbcard__body">
                <div className="fbfield">
                  <span className="fbfield__label">Submitted</span>
                  <span className="fbfield__value">{feedback.submittedAt ? new Date(feedback.submittedAt).toLocaleString() : '—'}</span>
                </div>
                <div className="fbfield">
                  <span className="fbfield__label">Session UUID</span>
                  <div className="fbfield__value fbfield__value--mono">
                    <span>{feedback.sessionId || '—'}</span>
                  </div>
                </div>
                <div className="fbfield">
                  <span className="fbfield__label">Environment</span>
                  <span className="fbfield__value fbfield__value--truncate" title={feedback.browser || '—'}>
                    {feedback.browser || '—'}
                  </span>
                </div>
                <div className="fbfield">
                  <span className="fbfield__label">Screen</span>
                  <span className="fbfield__value">{feedback.screenSize || '—'}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Admin Actions */}
            <div className="fbcard">
              <div className="fbcard__header">
                <MessageSquare size={18} />
                <h3>Admin Actions</h3>
              </div>
              <div className="fbcard__body">
                {!editMode ? (
                  <>
                    <div className="fbfield">
                      <span className="fbfield__label">Status</span>
                      <span className="fbfield__value">{editValues.status?.replace('_', ' ') || '—'}</span>
                    </div>
                    <div className="fbfield fbfield--notes">
                      <span className="fbfield__label">Notes</span>
                      <span className="fbfield__value fbfield__value--notes">{editValues.adminNotes || '—'}</span>
                    </div>
                    <button className="fbbtn fbbtn--primary fbbtn--sm" onClick={() => setEditMode(true)}>
                      Edit Status
                    </button>
                  </>
                ) : (
                  <div className="fbmodal__edit-form">
                    <div className="fbform-group">
                      <label>Status</label>
                      <select value={editValues.status} onChange={(e) => setEditValues(prev => ({ ...prev, status: e.target.value as FeedbackStatus }))}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div className="fbform-group">
                      <label>Priority Score</label>
                      <input type="number" min="0" max="10" value={editValues.priorityScore} onChange={(e) => setEditValues(prev => ({ ...prev, priorityScore: Number(e.target.value) }))} />
                    </div>
                    <div className="fbform-group">
                      <label>Admin Notes</label>
                      <textarea value={editValues.adminNotes} onChange={(e) => setEditValues(prev => ({ ...prev, adminNotes: e.target.value }))} rows={3} placeholder="Add notes about this feedback..." />
                    </div>
                    <div className="fbmodal__form-actions">
                      <button className="fbbtn fbbtn--ghost fbbtn--sm" onClick={() => setEditMode(false)}>Cancel</button>
                      <button className="fbbtn fbbtn--primary fbbtn--sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 5: Quick Utilities */}
            <div className="fbcard fbcard--utilities">
              <div className="fbcard__header">
                <Crosshair size={18} />
                <h3>Quick Utilities</h3>
              </div>
              <div className="fbcard__body">
                <button
                  className={`fbutil-btn ${copiedId ? 'fbutil-btn--success' : ''}`}
                  onClick={handleCopySessionId}
                  disabled={!feedback.sessionId}
                >
                  {copiedId ? <CheckCircle size={16} /> : <Clipboard size={16} />}
                  <span>{copiedId ? 'Copied!' : 'Copy Session ID'}</span>
                </button>
                <button
                  className="fbutil-btn fbutil-btn--mailto"
                  onClick={handleMailto}
                  disabled={!feedback.testerEmail}
                >
                  <Mail size={16} />
                  <span>Reply to Tester</span>
                </button>
                {feedback.elementPath && (
                  <a
                    href={`${feedback.pageRoute}?highlight=${encodeURIComponent(feedback.elementPath || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fbutil-btn fbutil-btn--external"
                  >
                    <ExternalLink size={16} />
                    <span>View Element in Context</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const SABetaFeedback: React.FC = () => {
  const [allFeedback, setAllFeedback] = useState<BetaFeedback[]>([]);
  const [selected, setSelected] = useState<BetaFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'submittedAt', direction: 'desc' });

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminApi.getBetaFeedback({}, 0, 500);
      const feedback: BetaFeedback[] = Array.isArray(res.content) ? res.content : [];
      const validatedFeedback = feedback.map((fb: BetaFeedback) => ({
        ...fb,
        id: typeof fb.id === 'number' ? fb.id : parseInt(String(fb.id), 10) || 0,
        severity: fb.severity || 'SUGGESTION',
        status: fb.status || 'NEW',
        submittedAt: fb.submittedAt ? String(fb.submittedAt) : new Date().toISOString(),
      }));
      setAllFeedback(validatedFeedback);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setAllFeedback([]);
      } else {
        console.error('Feedback fetch error:', err);
        setError('Failed to load feedback');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWidgetStatus = useCallback(async () => {
    try {
      const flags = await superAdminApi.getFeatureFlags();
      const fbFlag = flags.find((f: any) => f.key === 'feedback_widget');
      setWidgetEnabled(fbFlag?.enabled || false);
    } catch (err) {
      console.error('Error fetching widget status:', err);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchWidgetStatus();
  }, [fetchAll, fetchWidgetStatus]);

  const handleToggleWidget = async () => {
    try {
      setToggling(true);
      await superAdminApi.updateFeatureFlag('feedback_widget', { enabled: !widgetEnabled, rolloutPercentage: 100 });
      setWidgetEnabled(!widgetEnabled);
    } catch (err) {
      console.error('Error toggling widget:', err);
    } finally {
      setToggling(false);
    }
  };

  const filtered = useMemo(() => {
    let result = allFeedback.filter(fb => {
      const matchSearch = !search ||
        fb.subject?.toLowerCase().includes(search.toLowerCase()) ||
        fb.description?.toLowerCase().includes(search.toLowerCase()) ||
        fb.testerName?.toLowerCase().includes(search.toLowerCase()) ||
        fb.testerEmail?.toLowerCase().includes(search.toLowerCase()) ||
        fb.pageRoute?.toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severityFilter === 'all' || fb.severity === severityFilter;
      const matchStatus = statusFilter === 'all' || fb.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || fb.category === categoryFilter;
      return matchSearch && matchSeverity && matchStatus && matchCategory;
    });

    result.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortConfig.field) {
        case 'pageRoute': aVal = a.pageRoute || ''; bVal = b.pageRoute || ''; break;
        case 'section': aVal = a.section || ''; bVal = b.section || ''; break;
        case 'elementPath': aVal = a.elementPath || ''; bVal = b.elementPath || ''; break;
        case 'severity': aVal = a.severity || ''; bVal = b.severity || ''; break;
        case 'status': aVal = a.status || ''; bVal = b.status || ''; break;
        case 'submittedAt': aVal = new Date(a.submittedAt || 0).getTime(); bVal = new Date(b.submittedAt || 0).getTime(); break;
        default: return 0;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [allFeedback, search, severityFilter, statusFilter, categoryFilter, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({ field, direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };

  const stats = useMemo(() => ({
    total: allFeedback.length,
    new: allFeedback.filter(f => f.status === 'NEW').length,
    open: allFeedback.filter(f => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(f.status || '')).length,
    resolved: allFeedback.filter(f => f.status === 'RESOLVED').length,
    bugs: allFeedback.filter(f => f.severity === 'BUG').length,
  }), [allFeedback]);

  const handleRowClick = (fb: BetaFeedback) => setSelected(fb);

  const handleUpdate = (updated: BetaFeedback) => {
    setAllFeedback(prev => prev.map(f => f.id === updated.id ? updated : f));
    setSelected(updated);
  };

  const handleExportCSV = async () => {
    try {
      const csv = await betaFeedbackApi.exportFeedback();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError('Export failed'); }
  };

  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = search || severityFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all';

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="sort-icon">
      {sortConfig.field === field ? (sortConfig.direction === 'asc' ? <ChevronRight size={12} /> : <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />) : <ChevronRight size={12} style={{ opacity: 0.3 }} />}
    </span>
  );

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="sa">
      <header className="pg-header pg-header--single-line">
        <div className="pg-header__row-1">
          <div className="pg-header__title-group">
            <div className="pg-header__icon">
              <MessageSquare size={18} />
            </div>
            <div>
              <h1 className="pg-header__title">Beta Feedback</h1>
              <span className="pg-header__subtitle">Overview: {stats.total} total · {stats.new} new · {stats.open} in progress · {stats.resolved} resolved</span>
            </div>
          </div>

          <div className="pg-stats">
            <button className="pg-stat-card pg-stat-card--sm" onClick={() => setSeverityFilter(stats.bugs > 0 ? 'BUG' : 'all')} title="Show bug feedback">
              <span className="pg-stat-card__value" style={{ color: '#ef4444' }}>{stats.bugs}</span>
              <span className="pg-stat-card__label">Bugs</span>
            </button>
            <button className="pg-stat-card pg-stat-card--sm" onClick={() => setStatusFilter('NEW')} title="Show new feedback">
              <span className="pg-stat-card__value" style={{ color: '#22d3ee' }}>{stats.new}</span>
              <span className="pg-stat-card__label">New</span>
            </button>
            <button className="pg-stat-card pg-stat-card--sm" onClick={() => setStatusFilter('IN_PROGRESS')} title="Show in-progress feedback">
              <span className="pg-stat-card__value" style={{ color: '#a78bfa' }}>{stats.open}</span>
              <span className="pg-stat-card__label">In Progress</span>
            </button>
            <button className="pg-stat-card pg-stat-card--sm" onClick={() => setStatusFilter('RESOLVED')} title="Show resolved feedback">
              <span className="pg-stat-card__value" style={{ color: '#6ee7b7' }}>{stats.resolved}</span>
              <span className="pg-stat-card__label">Resolved</span>
            </button>
          </div>

          <div className="pg-header__right">
            <div className="pg-search">
              <Search className="pg-search__icon" size={14} />
              <input
                type="text"
                placeholder="Search by tester, subject, page..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pg-search__input"
              />
              {search && (
                <button className="pg-search__clear" onClick={() => setSearch('')}>
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="pg-filter-wrap">
              <button
                className={`pg-btn pg-btn--compact ${showFilters ? 'pg-btn--active' : ''} ${hasActiveFilters ? 'pg-btn--has-filter' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Open filters"
              >
                <Filter size={14} />
                <span>Filters</span>
                {hasActiveFilters && <span className="pg-btn__badge">{[severityFilter, statusFilter, categoryFilter].filter(f => f !== 'all').length}</span>}
              </button>

              {showFilters && (
                <div className="pg-filter-dropdown">
                  <div className="pg-filter-dropdown__header">
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <button className="pg-filter-dropdown__clear" onClick={clearFilters}>
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="pg-filter-dropdown__body">
                    <div className="pg-filter-dropdown__row">
                      <label className="pg-filter-dropdown__label">Severity</label>
                      <div className="pg-filter-pills">
                        {['all', ...SEVERITIES].map(f => (
                          <button key={f} className={`pg-filter-pill ${severityFilter === f ? 'pg-filter-pill--active' : ''}`} onClick={() => setSeverityFilter(f)}>
                            {f === 'all' ? 'All' : f.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pg-filter-dropdown__row">
                      <label className="pg-filter-dropdown__label">Status</label>
                      <div className="pg-filter-pills">
                        {['all', ...STATUSES].map(f => (
                          <button key={f} className={`pg-filter-pill ${statusFilter === f ? 'pg-filter-pill--active' : ''}`} onClick={() => setStatusFilter(f)}>
                            {f === 'all' ? 'All' : f.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pg-filter-dropdown__row">
                      <label className="pg-filter-dropdown__label">Category</label>
                      <div className="pg-filter-pills">
                        {['all', ...CATEGORIES].map(f => (
                          <button key={f} className={`pg-filter-pill ${categoryFilter === f ? 'pg-filter-pill--active' : ''}`} onClick={() => setCategoryFilter(f)}>
                            {f === 'all' ? 'All' : f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sa__widget-switch">
              <span className="sa__widget-label">Widget</span>
              <button
                onClick={handleToggleWidget}
                disabled={toggling}
                className={`sa__switch ${widgetEnabled ? 'sa__switch--on' : 'sa__switch--off'}`}
                aria-label="Toggle feedback widget"
              >
                <span className="sa__switch-thumb" />
              </button>
            </div>

            <button className="pg-btn pg-btn--icon" onClick={fetchAll} disabled={loading} aria-label="Refresh feedback">
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            </button>
            <button className="pg-btn pg-btn--icon" onClick={handleExportCSV} aria-label="Export feedback CSV">
              <Download size={14} />
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="pg-active-filters">
            {severityFilter !== 'all' && (
              <span className="pg-filter-tag" onClick={() => setSeverityFilter('all')}>
                {severityFilter.replace('_', ' ')} <X size={10} />
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="pg-filter-tag" onClick={() => setStatusFilter('all')}>
                {statusFilter.replace('_', ' ')} <X size={10} />
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="pg-filter-tag" onClick={() => setCategoryFilter('all')}>
                {categoryFilter} <X size={10} />
              </span>
            )}
          </div>
        )}
      </header>

      {error && (
        <motion.div className="sa__alert sa__alert--error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <AlertCircle size={16} /><span>{error}</span><button onClick={() => setError(null)}><X size={14} /></button>
        </motion.div>
      )}

      <div className="sa__card sa__card--table">
        {loading ? (
          <div className="sa__empty"><RefreshCw size={24} className="spinning" /><p>Loading feedback...</p></div>
        ) : filtered.length === 0 ? (
          <div className="sa__empty"><p>No feedback found</p>{hasActiveFilters && <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={clearFilters}>Clear filters</button>}</div>
        ) : (
          <table className="sa__table">
            <thead>
              <tr>
                <th onClick={() => handleSort('pageRoute')} className="sortable">Page <SortIcon field="pageRoute" /></th>
                <th>Tester</th>
                <th onClick={() => handleSort('severity')} className="sortable">Severity <SortIcon field="severity" /></th>
                <th onClick={() => handleSort('status')} className="sortable">Status <SortIcon field="status" /></th>
                <th>Subject</th>
                <th onClick={() => handleSort('submittedAt')} className="sortable">Submitted <SortIcon field="submittedAt" /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(fb => (
                <tr key={fb.id} onClick={() => handleRowClick(fb)} className="sa__table-row">
                  <td>
                    <div className="sa__page-path">
                      <span className="sa__page-route">{fb.pageRoute || '/'}</span>
                      {fb.section && <><ChevronRight size={12} /><span className="sa__page-section">{fb.section}</span></>}
                    </div>
                  </td>
                  <td>
                    <div className="sa__tester-name">{fb.testerName}</div>
                    <div className="sa__tester-email">{fb.testerEmail}</div>
                  </td>
                  <td>
                    <span className="sa__badge" style={{ background: severityBg(fb.severity || ''), color: severityColor(fb.severity || ''), border: `1px solid ${severityColor(fb.severity || '')}` }}>
                      {(fb.severity || '—').replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className="sa__badge" style={{ background: `${statusColor(fb.status || '')}20`, color: statusColor(fb.status || ''), border: `1px solid ${statusColor(fb.status || '')}` }}>
                      {(fb.status || '—').replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="sa__subject">{fb.subject}</div>
                    {fb.elementSemanticLabel && (
                      <div className="sa__element-label"><MapPin size={10} /> {fb.elementSemanticLabel}</div>
                    )}
                  </td>
                  <td className="sa__date">{fb.submittedAt ? new Date(fb.submittedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="sa__count">Showing {filtered.length} of {allFeedback.length} items</p>

      <AnimatePresence>
        {selected && <FeedbackModal feedback={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
      </AnimatePresence>
    </div>
  );
};

export default SABetaFeedback;
