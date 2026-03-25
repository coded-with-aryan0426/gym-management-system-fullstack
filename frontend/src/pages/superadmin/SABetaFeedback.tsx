import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Download, RefreshCw, AlertCircle, ToggleLeft, ToggleRight, Search, Filter, X } from 'lucide-react';
import type { BetaFeedback } from '../../types/feedback.types';
import { betaFeedbackApi } from '../../services/api';
import { superAdminApi } from '../../services/superAdminApi';
import './superadmin.css';

const SEVERITIES = ['BUG', 'UI_ISSUE', 'SUGGESTION', 'IMPROVEMENT', 'QUESTION'];
const STATUSES = ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'];
const CATEGORIES = ['UI', 'PERFORMANCE', 'LOGIC', 'FEATURE', 'SECURITY', 'DATA'];

const severityColor = (s: string) =>
  s === 'BUG' ? '#ef4444' : s === 'UI_ISSUE' ? '#f97316' : s === 'SUGGESTION' ? '#3b82f6' : s === 'IMPROVEMENT' ? '#10b981' : '#8b5cf6';

const statusColor = (s: string) =>
  s === 'NEW' ? '#3b82f6' : s === 'ACKNOWLEDGED' ? '#f59e0b' : s === 'IN_PROGRESS' ? '#8b5cf6' : s === 'RESOLVED' ? '#10b981' : '#6b7280';

const severityBg = (s: string) =>
  s === 'BUG' ? 'rgba(239,68,68,0.1)' : s === 'UI_ISSUE' ? 'rgba(249,115,22,0.1)' : s === 'SUGGESTION' ? 'rgba(59,130,246,0.1)' : s === 'IMPROVEMENT' ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)';

export const SABetaFeedback: React.FC = () => {
  const [allFeedback, setAllFeedback] = useState<BetaFeedback[]>([]);
  const [selected, setSelected] = useState<BetaFeedback | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminApi.getBetaFeedback({}, 0, 500);
      const feedback = Array.isArray(res.content) ? res.content : [];
      // Ensure all feedback items have valid primitive values
      const validatedFeedback = feedback.map(fb => ({
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

  // Client-side filter
  const filtered = useMemo(() => {
    return allFeedback.filter(fb => {
      const matchSearch =
        !search ||
        fb.subject?.toLowerCase().includes(search.toLowerCase()) ||
        fb.description?.toLowerCase().includes(search.toLowerCase()) ||
        fb.testerName?.toLowerCase().includes(search.toLowerCase()) ||
        fb.testerEmail?.toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severityFilter === 'all' || fb.severity === severityFilter;
      const matchStatus = statusFilter === 'all' || fb.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || fb.category === categoryFilter;
      return matchSearch && matchSeverity && matchStatus && matchCategory;
    });
  }, [allFeedback, search, severityFilter, statusFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: allFeedback.length,
    new: allFeedback.filter(f => f.status === 'NEW').length,
    open: allFeedback.filter(f => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(f.status || '')).length,
    resolved: allFeedback.filter(f => f.status === 'RESOLVED').length,
    bugs: allFeedback.filter(f => f.severity === 'BUG').length,
  }), [allFeedback]);

  const handleRowClick = (fb: BetaFeedback) => {
    setSelected(fb);
    setIsDrawerOpen(true);
  };

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
    } catch {
      setError('Export failed');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = search || severityFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="sa">
      {/* Header */}
      <header className="sa__header">
        <div className="sa__header-left">
          <h1>Beta Feedback</h1>
          <p>{stats.total} total · {stats.open} open · {stats.resolved} resolved</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sa__btn sa__btn--ghost sa__btn--sm" onClick={fetchAll} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh
          </button>
          <button className="sa__btn sa__btn--primary sa__btn--sm" onClick={handleExportCSV}>
            <Download size={14} /> Export
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <motion.div className="sa__alert sa__alert--error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </motion.div>
      )}

      {/* Widget Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Widget:</span>
        <button
          onClick={handleToggleWidget}
          disabled={toggling}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 700,
            background: widgetEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: widgetEnabled ? '#22c55e' : '#ef4444',
          }}
        >
          {widgetEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {widgetEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* KPI Row */}
      <div className="sa__kpi-row">
        {[
          { label: 'Total', value: stats.total, color: 'blue', icon: '📊' },
          { label: 'New', value: stats.new, color: 'cyan', icon: '🆕' },
          { label: 'Open', value: stats.open, color: 'amber', icon: '🔶' },
          { label: 'Resolved', value: stats.resolved, color: 'emerald', icon: '✅' },
          { label: 'Bugs', value: stats.bugs, color: 'red', icon: '🐛' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} className={`sa__kpi sa__kpi--${kpi.color}`}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="sa__kpi-icon"><span style={{ fontSize: 18 }}>{kpi.icon}</span></div>
            <div className="sa__kpi-body">
              <div className="sa__kpi-label">{kpi.label}</div>
              <div className="sa__kpi-value">{String(kpi.value)}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="sa__toolbar">
        <div className="sa__search">
          <Search size={14} />
          <input
            placeholder="Search subject, description, tester..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {['all', ...SEVERITIES].map(f => (
          <button key={f} className={`sa__filter ${severityFilter === f ? 'sa__filter--active' : ''}`}
            onClick={() => setSeverityFilter(f)}>
            {f === 'all' ? 'All Severity' : f.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="sa__toolbar" style={{ marginTop: -8 }}>
        {['all', ...STATUSES].map(f => (
          <button key={f} className={`sa__filter ${statusFilter === f ? 'sa__filter--active' : ''}`}
            onClick={() => setStatusFilter(f)}>
            {f === 'all' ? 'All Status' : f.replace('_', ' ')}
          </button>
        ))}
        {['all', ...CATEGORIES].map(f => (
          <button key={f} className={`sa__filter ${categoryFilter === f ? 'sa__filter--active' : ''}`}
            onClick={() => setCategoryFilter(f)}>
            {f === 'all' ? 'All Category' : f}
          </button>
        ))}
        {hasActiveFilters && (
          <button className="sa__filter sa__filter--active" style={{ color: '#ef4444', borderColor: '#ef4444' }}
            onClick={clearFilters}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="sa__card" style={{ padding: 0, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Loading feedback...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No feedback found</p>
            {hasActiveFilters && <button className="sa__btn sa__btn--ghost sa__btn--sm" style={{ marginTop: 8 }} onClick={clearFilters}>Clear filters</button>}
          </div>
        ) : (
          <table className="sa__table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Tester</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Category</th>
                <th>Page</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(fb => (
                <tr key={fb.id} onClick={() => handleRowClick(fb)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{fb.subject}</div>
                    {fb.description && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fb.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{fb.testerName}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fb.testerEmail}</div>
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
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fb.category || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fb.pageRoute}>{fb.pageRoute || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fb.submittedAt ? new Date(fb.submittedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
        Showing {filtered.length} of {allFeedback.length} feedback items
      </p>
    </div>
  );
};

export default SABetaFeedback;