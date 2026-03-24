import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import type { FeedbackSeverity, FeedbackCategory, FeedbackStatus } from '../../types/feedback.types';
import './feedback-dashboard.css';

interface FeedbackFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  allPages?: string[];
  allTesters?: string[];
}

export interface FilterValues {
  search: string;
  severity: FeedbackSeverity[];
  category: FeedbackCategory[];
  status: FeedbackStatus[];
  pageRoute: string;
  testerEmail: string;
  dateFrom: string;
  dateTo: string;
}

export const FeedbackFilters: React.FC<FeedbackFiltersProps> = ({
  onFiltersChange,
  allPages = [],
  allTesters = [],
}) => {
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    severity: [],
    category: [],
    status: [],
    pageRoute: '',
    testerEmail: '',
    dateFrom: '',
    dateTo: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleSeverityToggle = (severity: FeedbackSeverity) => {
    setFilters(prev => ({
      ...prev,
      severity: prev.severity.includes(severity)
        ? prev.severity.filter(s => s !== severity)
        : [...prev.severity, severity]
    }));
  };

  const handleCategoryChange = (category: FeedbackCategory) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const handleStatusChange = (status: FeedbackStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      severity: [],
      category: [],
      status: [],
      pageRoute: '',
      testerEmail: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = filters.search || filters.severity.length > 0 ||
    filters.category.length > 0 || filters.status.length > 0 ||
    filters.pageRoute || filters.testerEmail || filters.dateFrom || filters.dateTo;

  const severityOptions: FeedbackSeverity[] = ['BUG', 'UI_ISSUE', 'SUGGESTION', 'IMPROVEMENT', 'QUESTION'];
  const categoryOptions: FeedbackCategory[] = ['UI', 'PERFORMANCE', 'LOGIC', 'FEATURE', 'SECURITY', 'DATA'];
  const statusOptions: FeedbackStatus[] = ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'];

  return (
    <div className="feedback-filters-section">
      {/* Search Bar */}
      <div className="filter-search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search by subject or description..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange('')}
            className="clear-search-btn"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Toggles */}
      <button
        className="filter-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Filter size={16} />
        <span>Filters</span>
        {hasActiveFilters && <span className="filter-badge">{
          filters.severity.length + filters.category.length + filters.status.length +
          (filters.pageRoute ? 1 : 0) + (filters.testerEmail ? 1 : 0) +
          (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)
        }</span>}
      </button>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="filters-expanded">
          {/* Severity Filters */}
          <div className="filter-group">
            <label className="filter-group-label">Severity</label>
            <div className="checkbox-group">
              {severityOptions.map(severity => (
                <label key={severity} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.severity.includes(severity)}
                    onChange={() => handleSeverityToggle(severity)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">{severity.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div className="filter-group">
            <label className="filter-group-label">Category</label>
            <div className="checkbox-group">
              {categoryOptions.map(category => (
                <label key={category} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="filter-group">
            <label className="filter-group-label">Status</label>
            <div className="checkbox-group">
              {statusOptions.map(status => (
                <label key={status} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleStatusChange(status)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Page Route Filter */}
          {allPages.length > 0 && (
            <div className="filter-group">
              <label className="filter-group-label">Page Route</label>
              <select
                value={filters.pageRoute}
                onChange={(e) => setFilters(prev => ({ ...prev, pageRoute: e.target.value }))}
                className="filter-select"
              >
                <option value="">All Pages</option>
                {allPages.map(page => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tester Filter */}
          {allTesters.length > 0 && (
            <div className="filter-group">
              <label className="filter-group-label">Tester</label>
              <select
                value={filters.testerEmail}
                onChange={(e) => setFilters(prev => ({ ...prev, testerEmail: e.target.value }))}
                className="filter-select"
              >
                <option value="">All Testers</option>
                {allTesters.map(tester => (
                  <option key={tester} value={tester}>{tester}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Filters */}
          <div className="filter-group">
            <label className="filter-group-label">Date Range</label>
            <div className="date-range">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="date-input"
                placeholder="From"
              />
              <span className="date-separator">→</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="date-input"
                placeholder="To"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="clear-filters-btn"
            >
              <X size={16} />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackFilters;
