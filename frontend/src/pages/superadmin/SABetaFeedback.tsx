import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import FeedbackStatsComponent from '../../components/superadmin/FeedbackStats';
import FeedbackFilters, { type FilterValues } from '../../components/superadmin/FeedbackFilters';
import FeedbackTable from '../../components/superadmin/FeedbackTable';
import FeedbackDetailDrawer from '../../components/superadmin/FeedbackDetailDrawer';
import type { BetaFeedback } from '../../types/feedback.types';
import { betaFeedbackApi } from '../../services/api';
import './superadmin.css';

export const SABetaFeedback: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [feedbackList, setFeedbackList] = useState<BetaFeedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<BetaFeedback | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterValues>({
    search: searchParams.get('search') || '',
    severity: [],
    category: [],
    status: [],
    pageRoute: searchParams.get('pageRoute') || '',
    testerEmail: '',
    dateFrom: '',
    dateTo: '',
  });

  const [allPages, setAllPages] = useState<string[]>([]);
  const [allTesters, setAllTesters] = useState<string[]>([]);

  // Fetch feedback with current filters
  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filterObject: Record<string, any> = {};

      if (filters.search) filterObject.search = filters.search;
      if (filters.severity.length > 0) filterObject.severity = filters.severity;
      if (filters.category.length > 0) filterObject.category = filters.category;
      if (filters.status.length > 0) filterObject.status = filters.status;
      if (filters.pageRoute) filterObject.page_route = filters.pageRoute;
      if (filters.testerEmail) filterObject.tester_email = filters.testerEmail;
      if (filters.dateFrom) filterObject.date_from = filters.dateFrom;
      if (filters.dateTo) filterObject.date_to = filters.dateTo;

      const data = await betaFeedbackApi.filterFeedback(filterObject, page, 20);

      setFeedbackList(data.content || []);
      setTotalPages(data.totalPages || 1);

      // Extract unique pages and testers
      const uniquePages = new Set<string>();
      const uniqueTesters = new Set<string>();

      if (data.content) {
        data.content.forEach((fb: BetaFeedback) => {
          uniquePages.add(fb.pageRoute);
          uniqueTesters.add(fb.testerEmail);
        });
      }

      setAllPages(Array.from(uniquePages).sort());
      setAllTesters(Array.from(uniqueTesters).sort());
    } catch (err) {
      setError('Failed to load feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    setPage(0);
  }, [filters]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(0);

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.pageRoute) params.set('pageRoute', newFilters.pageRoute);
    setSearchParams(params);
  };

  const handleRowClick = (feedback: BetaFeedback) => {
    setSelectedFeedback(feedback);
    setIsDrawerOpen(true);
  };

  const handleFeedbackUpdate = (updated: BetaFeedback) => {
    setFeedbackList(prev =>
      prev.map(f => f.id === updated.id ? updated : f)
    );
    setSelectedFeedback(updated);
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
    } catch (err) {
      console.error('Error exporting feedback:', err);
      setError('Failed to export feedback');
    }
  };

  return (
    <div className="sa-beta-feedback-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Beta Feedback Management</h1>
          <p className="page-description">Review and manage user feedback from beta testing</p>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchFeedback}
            disabled={isLoading}
            className="action-button secondary"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="action-button primary"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <FeedbackStatsComponent onFilterChange={handleFiltersChange} />
      </div>

      {/* Filters */}
      <div className="filters-section">
        <FeedbackFilters
          onFiltersChange={handleFiltersChange}
          allPages={allPages}
          allTesters={allTesters}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          className="error-alert"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Feedback Table */}
      <div className="table-section">
        <FeedbackTable
          feedbackList={feedbackList}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Detail Drawer */}
      <FeedbackDetailDrawer
        feedback={selectedFeedback}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedFeedback(null);
        }}
        onUpdate={handleFeedbackUpdate}
      />
    </div>
  );
};

export default SABetaFeedback;
