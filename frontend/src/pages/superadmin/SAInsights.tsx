import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BetaFeedback, PageFeedbackBreakdown } from '../../types/feedback.types';
import { betaFeedbackApi } from '../../services/api';
import './superadmin.css';

export const SAInsights: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [pageBreakdown, setPageBreakdown] = useState<PageFeedbackBreakdown[]>([]);
  const [sortBy, setSortBy] = useState<'issues' | 'bugs' | 'health'>('issues');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch stats
      const statsData = await betaFeedbackApi.getStats();
      setStats(statsData);

      // Fetch all feedback to build page breakdown
      const feedback = await betaFeedbackApi.getAllFeedback(0, 1000);

      if (feedback.content && feedback.content.length > 0) {
        const pageMap = new Map<string, PageFeedbackBreakdown>();

        feedback.content.forEach((fb: BetaFeedback) => {
          if (!pageMap.has(fb.pageRoute)) {
            pageMap.set(fb.pageRoute, {
              pageRoute: fb.pageRoute,
              totalIssues: 0,
              bugCount: 0,
              uiIssueCount: 0,
              suggestionCount: 0,
              improvementCount: 0,
              questionCount: 0,
              healthScore: 100,
            });
          }

          const pageData = pageMap.get(fb.pageRoute)!;
          pageData.totalIssues++;

          if (fb.severity === 'BUG') pageData.bugCount++;
          else if (fb.severity === 'UI_ISSUE') pageData.uiIssueCount++;
          else if (fb.severity === 'SUGGESTION') pageData.suggestionCount++;
          else if (fb.severity === 'IMPROVEMENT') pageData.improvementCount++;
          else if (fb.severity === 'QUESTION') pageData.questionCount++;

          // Calculate health score: 100 - (bugs*5 + uiIssues*3 + suggestions*1)
          pageData.healthScore = Math.max(
            0,
            100 - (pageData.bugCount * 5 + pageData.uiIssueCount * 3 + pageData.suggestionCount * 1)
          );
        });

        const breakdown = Array.from(pageMap.values());

        // Sort based on selection
        if (sortBy === 'issues') {
          breakdown.sort((a, b) => b.totalIssues - a.totalIssues);
        } else if (sortBy === 'bugs') {
          breakdown.sort((a, b) => b.bugCount - a.bugCount);
        } else {
          breakdown.sort((a, b) => a.healthScore - b.healthScore);
        }

        setPageBreakdown(breakdown);
      }
    } catch (err) {
      setError('Failed to load insights');
      console.error('Error fetching insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getHealthLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const topProblematicPages = pageBreakdown.slice(0, 5);
  const overallHealthScore = pageBreakdown.length > 0
    ? Math.round(pageBreakdown.reduce((sum, p) => sum + p.healthScore, 0) / pageBreakdown.length)
    : 100;

  return (
    <div className="sa-insights-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Beta Feedback Insights</h1>
          <p className="page-description">Page-by-page feedback analysis and health metrics</p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="action-button primary"
        >
          <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          Refresh Insights
        </button>
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

      {/* Overview Section */}
      <div className="insights-overview">
        <motion.div
          className="overview-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="card-title">Overall Platform Health</h3>
          <div className="health-display">
            <div
              className="health-score-circle"
              style={{ borderColor: getHealthColor(overallHealthScore) }}
            >
              <span className="health-score-value">{overallHealthScore}</span>
            </div>
            <div className="health-info">
              <p className="health-label">{getHealthLabel(overallHealthScore)}</p>
              <p className="health-pages">{pageBreakdown.length} pages analyzed</p>
            </div>
          </div>
        </motion.div>

        {stats && (
          <>
            <motion.div
              className="overview-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="card-title">Critical Issues</h3>
              <div className="stat-display">
                <AlertCircle size={32} className="stat-icon bugs" />
                <div className="stat-text">
                  <p className="stat-value">{stats.bugCount}</p>
                  <p className="stat-label">Bugs Found</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="overview-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="card-title">Total Feedback</h3>
              <div className="stat-display">
                <BarChart3 size={32} className="stat-icon" />
                <div className="stat-text">
                  <p className="stat-value">{stats.totalCount}</p>
                  <p className="stat-label">Total Submissions</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="overview-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="card-title">Resolution Rate</h3>
              <div className="stat-display">
                <TrendingUp size={32} className="stat-icon resolved" />
                <div className="stat-text">
                  <p className="stat-value">
                    {stats.totalCount > 0 ? Math.round((stats.resolvedCount / stats.totalCount) * 100) : 0}%
                  </p>
                  <p className="stat-label">{stats.resolvedCount} Resolved</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Sort Controls */}
      <div className="sort-controls">
        <label className="sort-label">Sort by:</label>
        <div className="sort-buttons">
          {[
            { value: 'issues' as const, label: 'Most Issues' },
            { value: 'bugs' as const, label: 'Most Bugs' },
            { value: 'health' as const, label: 'Lowest Health' },
          ].map(option => (
            <button
              key={option.value}
              className={`sort-button ${sortBy === option.value ? 'active' : ''}`}
              onClick={() => setSortBy(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Breakdown Table */}
      <div className="insights-table-section">
        <h2 className="section-heading">Page-by-Page Breakdown</h2>

        {isLoading ? (
          <div className="loading-skeleton">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        ) : pageBreakdown.length > 0 ? (
          <div className="table-wrapper">
            <table className="insights-table">
              <thead>
                <tr>
                  <th>Page Route</th>
                  <th>Total Issues</th>
                  <th>Bugs</th>
                  <th>UI Issues</th>
                  <th>Suggestions</th>
                  <th>Improvements</th>
                  <th>Health Score</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageBreakdown.map((page, index) => (
                  <motion.tr
                    key={page.pageRoute}
                    className="page-row"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() =>
                      navigate(`/superadmin/feedback?pageRoute=${encodeURIComponent(page.pageRoute)}`)
                    }
                  >
                    <td className="page-route">{page.pageRoute}</td>
                    <td className="total-issues">
                      <span className="issue-badge">{page.totalIssues}</span>
                    </td>
                    <td className="bug-count">
                      <span className="severity-badge bug">{page.bugCount}</span>
                    </td>
                    <td className="ui-count">
                      <span className="severity-badge ui">{page.uiIssueCount}</span>
                    </td>
                    <td className="suggestion-count">
                      <span className="severity-badge suggestion">{page.suggestionCount}</span>
                    </td>
                    <td className="improvement-count">
                      <span className="severity-badge improvement">{page.improvementCount}</span>
                    </td>
                    <td className="health-score">
                      <div className="health-score-badge" style={{
                        backgroundColor: getHealthColor(page.healthScore) + '20',
                        color: getHealthColor(page.healthScore),
                        borderColor: getHealthColor(page.healthScore),
                      }}>
                        {page.healthScore}
                      </div>
                    </td>
                    <td className="action-cell">
                      <TrendingDown size={16} className="action-icon" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No page data available. Submit feedback to see insights.</p>
          </div>
        )}
      </div>

      {/* Top Problematic Pages */}
      {topProblematicPages.length > 0 && (
        <div className="top-problematic-section">
          <h2 className="section-heading">Top 5 Problematic Pages</h2>
          <div className="problematic-grid">
            {topProblematicPages.map((page, index) => (
              <motion.div
                key={page.pageRoute}
                className="problematic-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  navigate(`/superadmin/feedback?pageRoute=${encodeURIComponent(page.pageRoute)}`)
                }
              >
                <div className="card-rank">#{index + 1}</div>
                <h3 className="card-page-route">{page.pageRoute}</h3>
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Issues</span>
                    <span className="stat-value">{page.totalIssues}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Bugs</span>
                    <span className="stat-value bugs">{page.bugCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Health</span>
                    <span
                      className="stat-value"
                      style={{ color: getHealthColor(page.healthScore) }}
                    >
                      {page.healthScore}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SAInsights;
