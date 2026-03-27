import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, X, ThumbsUp,
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle,
  BarChart3, ArrowUpRight, RefreshCw, User, Star, Send,
  ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { superAdminApi, type SuperAdminFeatureFlag } from '../../services/superAdminApi';
import type { BetaFeedback, FeedbackStats, FeedbackSeverity } from '../../types/feedback.types';
import './superadmin.css';

type Sentiment = 'positive' | 'neutral' | 'negative';

interface FeedbackItem {
  id: number;
  content: string;
  sentiment: Sentiment;
  sentimentScore: number;
  category: string[];
  userEmail?: string;
  userPlan?: string;
  gymName?: string;
  rating?: number;
  createdAt: string;
  status: string;
  upvotes: number;
  hasUpvoted?: boolean;
  severity?: string;
  subject?: string;
  adminNotes?: string;
}

interface SentimentTrend {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface CategoryCount {
  category: string;
  count: number;
  color: string;
}

const SEVERITY_TO_SENTIMENT: Record<FeedbackSeverity, Sentiment> = {
  'BUG': 'negative',
  'UI_ISSUE': 'negative',
  'SUGGESTION': 'positive',
  'IMPROVEMENT': 'positive',
  'QUESTION': 'neutral'
};

const CATEGORY_COLORS: Record<string, string> = {
  'UI': '#8b5cf6',
  'PERFORMANCE': '#3b82f6',
  'LOGIC': '#f59e0b',
  'FEATURE': '#10b981',
  'SECURITY': '#ef4444',
  'DATA': '#ec4899'
};

const SENTIMENT_CONFIG: Record<Sentiment, { color: string; bg: string; icon: string }> = {
  positive: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '😊' },
  neutral: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: '😐' },
  negative: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '😠' }
};

const MOCK_SENTIMENT_TREND: SentimentTrend[] = [
  { date: 'Jan 1', positive: 45, neutral: 35, negative: 20 },
  { date: 'Jan 8', positive: 48, neutral: 33, negative: 19 },
  { date: 'Jan 15', positive: 52, neutral: 30, negative: 18 },
  { date: 'Jan 22', positive: 55, neutral: 28, negative: 17 },
  { date: 'Jan 29', positive: 58, neutral: 27, negative: 15 },
  { date: 'Feb 5', positive: 62, neutral: 25, negative: 13 },
];

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
};

const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

function useContainerDimensions(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  return dimensions;
}

function mapBetaFeedbackToItem(feedback: BetaFeedback): FeedbackItem {
  const sentiment = SEVERITY_TO_SENTIMENT[feedback.severity] || 'neutral';
  return {
    id: feedback.id,
    content: feedback.description || feedback.subject || '',
    sentiment,
    sentimentScore: feedback.priorityScore ? feedback.priorityScore / 100 : 0.5,
    category: [feedback.category],
    userEmail: feedback.testerEmail,
    userPlan: feedback.testerRole,
    gymName: undefined,
    createdAt: feedback.submittedAt,
    status: feedback.status.toLowerCase(),
    upvotes: Math.floor(Math.random() * 100) + 10,
    hasUpvoted: false,
    severity: feedback.severity,
    subject: feedback.subject,
    adminNotes: feedback.adminNotes
  };
}

const SentimentBadge: React.FC<{ sentiment: Sentiment; score: number; showScore?: boolean }> = ({
  sentiment,
  score,
  showScore = false
}) => {
  const config = SENTIMENT_CONFIG[sentiment];
  return (
    <span
      className="sentiment-badge"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.icon} {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      {showScore && <span className="sentiment-badge__score">({Math.round(score * 100)}%)</span>}
    </span>
  );
};

const CategoryTag: React.FC<{ category: string }> = ({ category }) => {
  const color = CATEGORY_COLORS[category] || '#6b7280';
  return (
    <span
      className="category-tag"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {category.replace('_', ' ')}
    </span>
  );
};

const UpvoteButton: React.FC<{
  feedbackId: number;
  upvotes: number;
  hasUpvoted: boolean;
  onUpvote: (id: number) => void;
}> = ({ feedbackId, upvotes, hasUpvoted, onUpvote }) => {
  const handleUpvote = () => {
    if (hasUpvoted) return;
    onUpvote(feedbackId);
  };

  return (
    <motion.button
      onClick={handleUpvote}
      disabled={hasUpvoted}
      whileTap={{ scale: 0.95 }}
      className={`upvote-button ${hasUpvoted ? 'upvote-button--active' : ''}`}
    >
      <motion.div
        animate={hasUpvoted ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <ThumbsUp size={14} fill={hasUpvoted ? 'currentColor' : 'none'} />
      </motion.div>
      <span>{formatNumber(upvotes)}</span>
    </motion.button>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, change, icon, color = '#3b82f6' }) => (
  <div className="feedback-stat-card">
    <div className="feedback-stat-card__icon" style={{ color }}>
      {icon}
    </div>
    <div className="feedback-stat-card__content">
      <span className="feedback-stat-card__value">{value}</span>
      <span className="feedback-stat-card__label">{label}</span>
      {change !== undefined && (
        <span className={`feedback-stat-card__change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
  </div>
);

const SentimentTrendChart: React.FC<{ data: SentimentTrend[]; containerRef: React.RefObject<HTMLDivElement | null> }> = ({
  data,
  containerRef
}) => {
  const dimensions = useContainerDimensions(containerRef);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div style={{ height: '100%', minHeight: 180 }} />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="positiveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="negativeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
        <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" strokeWidth={2} fill="url(#positiveGrad)" />
        <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" strokeWidth={1} fill="#6b7280" fillOpacity={0.3} />
        <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" strokeWidth={2} fill="url(#negativeGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const CategoryBarChart: React.FC<{ data: CategoryCount[]; containerRef: React.RefObject<HTMLDivElement | null> }> = ({
  data,
  containerRef
}) => {
  const dimensions = useContainerDimensions(containerRef);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div style={{ height: '100%', minHeight: 180 }} />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
        <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={100} />
        <Tooltip contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const FeedbackCard: React.FC<{
  feedback: FeedbackItem;
  onUpvote: (id: number) => void;
  onSelect: (feedback: FeedbackItem) => void;
  onStatusChange: (id: number, status: string) => void;
}> = ({ feedback, onUpvote, onSelect, onStatusChange }) => (
  <motion.div
    className="feedback-card"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    layout
  >
    <div className="feedback-card__header">
      <div className="feedback-card__source">
        <span className="feedback-card__source-label">{feedback.severity || 'General'}</span>
      </div>
      <div className="feedback-card__status">
        <select
          value={feedback.status.toUpperCase()}
          onChange={(e) => onStatusChange(feedback.id, e.target.value)}
          className="feedback-status-select"
        >
          <option value="NEW">New</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="WONT_FIX">Won't Fix</option>
        </select>
      </div>
      <span className="feedback-card__time">{formatTimeAgo(feedback.createdAt)}</span>
    </div>

    {feedback.subject && (
      <h4 className="feedback-card__subject" onClick={() => onSelect(feedback)}>
        {feedback.subject}
      </h4>
    )}

    <div className="feedback-card__content" onClick={() => onSelect(feedback)}>
      <p className="feedback-card__text">{feedback.content}</p>
    </div>

    <div className="feedback-card__meta">
      <div className="feedback-card__badges">
        <SentimentBadge sentiment={feedback.sentiment} score={feedback.sentimentScore} />
        {feedback.category.map(cat => <CategoryTag key={cat} category={cat} />)}
      </div>
      <div className="feedback-card__info">
        {feedback.userEmail && (
          <span className="feedback-card__user">
            <User size={12} />
            {feedback.userEmail}
          </span>
        )}
        {feedback.userPlan && (
          <span className="feedback-card__plan">
            <Star size={12} />
            {feedback.userPlan}
          </span>
        )}
      </div>
    </div>

    <div className="feedback-card__actions">
      <UpvoteButton
        feedbackId={feedback.id}
        upvotes={feedback.upvotes}
        hasUpvoted={feedback.hasUpvoted || false}
        onUpvote={onUpvote}
      />
      <button className="feedback-card__reply-btn" onClick={() => onSelect(feedback)}>
        <MessageSquare size={14} />
        View Details
      </button>
    </div>
  </motion.div>
);

const FeedbackDetailModal: React.FC<{
  feedback: FeedbackItem | null;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}> = ({ feedback, onClose, onStatusChange }) => {
  if (!feedback) return null;

  const statusOptions = ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'];

  return (
    <motion.div
      className="feedback-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="feedback-modal"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <div className="feedback-modal__header">
          <div className="feedback-modal__header-left">
            <h2>Feedback Details</h2>
            <span className="feedback-modal__id">#{feedback.id}</span>
          </div>
          <button className="feedback-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="feedback-modal__body">
          <div className="feedback-modal__section">
            <div className="feedback-modal__source-row">
              <span className="feedback-modal__source">
                {feedback.severity || 'General'}
              </span>
              <span className="feedback-modal__time">
                <Clock size={14} />
                {new Date(feedback.createdAt).toLocaleString()}
              </span>
            </div>

            {feedback.subject && (
              <h3 className="feedback-modal__subject">{feedback.subject}</h3>
            )}

            <p className="feedback-modal__content">{feedback.content}</p>

            <div className="feedback-modal__badges">
              <SentimentBadge sentiment={feedback.sentiment} score={feedback.sentimentScore} showScore />
              {feedback.category.map(cat => <CategoryTag key={cat} category={cat} />)}
            </div>
          </div>

          <div className="feedback-modal__section">
            <h3>User Information</h3>
            <div className="feedback-modal__info-grid">
              {feedback.userEmail && (
                <div className="feedback-modal__info-item">
                  <span className="feedback-modal__info-label">Email</span>
                  <span className="feedback-modal__info-value">{feedback.userEmail}</span>
                </div>
              )}
              {feedback.userPlan && (
                <div className="feedback-modal__info-item">
                  <span className="feedback-modal__info-label">Role</span>
                  <span className="feedback-modal__info-value">{feedback.userPlan}</span>
                </div>
              )}
              <div className="feedback-modal__info-item">
                <span className="feedback-modal__info-label">Submitted</span>
                <span className="feedback-modal__info-value">{formatTimeAgo(feedback.createdAt)}</span>
              </div>
            </div>
          </div>

          {feedback.adminNotes && (
            <div className="feedback-modal__section">
              <h3>Admin Notes</h3>
              <p className="feedback-modal__notes">{feedback.adminNotes}</p>
            </div>
          )}

          <div className="feedback-modal__section">
            <h3>Actions</h3>
            <div className="feedback-modal__status-row">
              <label>Status:</label>
              <select
                value={feedback.status.toUpperCase()}
                onChange={(e) => onStatusChange(feedback.id, e.target.value)}
                className="feedback-status-select feedback-status-select--large"
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="feedback-modal__actions">
              <button className="feedback-modal__action-btn feedback-modal__action-btn--primary">
                <CheckCircle size={16} />
                Mark as Actioned
              </button>
              <button className="feedback-modal__action-btn">
                <Send size={16} />
                Reply to User
              </button>
              <button className="feedback-modal__action-btn">
                <AlertCircle size={16} />
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const SAFeedback: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'requests' | 'analytics'>('inbox');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [featureFlag, setFeatureFlag] = useState<SuperAdminFeatureFlag | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const trendChartRef = React.useRef<HTMLDivElement>(null);
  const categoryChartRef = React.useRef<HTMLDivElement>(null);

  const FEATURE_FLAG_KEY = 'ENABLE_FEEDBACK_SYSTEM';

  const fetchFeedback = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const filterObject: Record<string, any> = {};
      if (statusFilter !== 'all') filterObject.status = statusFilter;
      if (categoryFilter !== 'all') filterObject.category = categoryFilter;
      if (search) filterObject.search = search;

      const [feedbackResponse, statsResponse, flagsResponse] = await Promise.all([
        superAdminApi.getBetaFeedback(filterObject, pageNum, 20),
        superAdminApi.getBetaFeedbackStats(),
        superAdminApi.getFeatureFlags()
      ]);

      const newItems = (feedbackResponse.content || []).map(mapBetaFeedbackToItem);

      if (append) {
        setFeedbackItems(prev => [...prev, ...newItems]);
      } else {
        setFeedbackItems(newItems);
      }

      setStats(statsResponse);
      setHasMore(pageNum < feedbackResponse.totalPages - 1);
      setPage(pageNum);

      if (flagsResponse && Array.isArray(flagsResponse)) {
        const flag = flagsResponse.find((f: any) => f.key === FEATURE_FLAG_KEY);
        setFeatureFlag(flag || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchFeedback(0, false);
  }, [fetchFeedback]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchFeedback(page + 1, true);
    }
  };

  const handleUpvote = useCallback(async (id: number) => {
    setFeedbackItems(prev =>
      prev.map(fb =>
        fb.id === id && !fb.hasUpvoted
          ? { ...fb, upvotes: fb.upvotes + 1, hasUpvoted: true }
          : fb
      )
    );
  }, []);

  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
    try {
      await superAdminApi.updateBetaFeedbackStatus(id, newStatus);
      setFeedbackItems(prev =>
        prev.map(fb =>
          fb.id === id ? { ...fb, status: newStatus.toLowerCase() } : fb
        )
      );
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(prev => prev ? { ...prev, status: newStatus.toLowerCase() } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }, [selectedFeedback]);

  const handleFeatureToggle = useCallback(async (enabled: boolean) => {
    setToggleLoading(true);
    try {
      await superAdminApi.updateFeatureFlag(FEATURE_FLAG_KEY, { enabled });
      setFeatureFlag(prev => prev ? { ...prev, enabled } : prev);
    } catch (err) {
      console.error('Failed to toggle feature flag:', err);
    } finally {
      setToggleLoading(false);
    }
  }, []);

  const filteredFeedback = useMemo(() => {
    return feedbackItems.filter(fb => {
      const matchSearch = !search ||
        fb.content.toLowerCase().includes(search.toLowerCase()) ||
        fb.subject?.toLowerCase().includes(search.toLowerCase()) ||
        fb.userEmail?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || fb.category.includes(categoryFilter);
      return matchSearch && matchCategory;
    });
  }, [feedbackItems, search, categoryFilter]);

  const featureRequests = useMemo(() => {
    return filteredFeedback
      .filter(fb => fb.sentiment === 'positive')
      .sort((a, b) => b.upvotes - a.upvotes);
  }, [filteredFeedback]);

  const sentimentTrend = MOCK_SENTIMENT_TREND;

  const categoryData: CategoryCount[] = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byCategory || {}).map(([category, count]) => ({
      category,
      count: count as number,
      color: CATEGORY_COLORS[category] || '#6b7280'
    }));
  }, [stats]);

  const dashboardStats = useMemo(() => ({
    newToday: stats?.openCount || 0,
    resolved: stats?.resolvedCount || 0,
    total: stats?.totalCount || 0,
    positivePercent: stats ? Math.round((stats.suggestionCount + stats.improvementCount) / Math.max(stats.totalCount, 1) * 100) : 0
  }), [stats]);

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: <MessageSquare size={16} /> },
    { id: 'requests', label: 'Feature Requests', icon: <Star size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> }
  ] as const;

  return (
    <div className="sa">
      {/* Single-line header */}
      <header className="pg-header feedback-header-single-line">
        <div className="feedback-header-left">
          <div className="pg-header__title-group">
            <div className="pg-header__icon">
              <MessageSquare size={18} />
            </div>
            <div>
              <h1 className="pg-header__title">Feedback Center</h1>
              <span className="feedback-header-stats">
                {dashboardStats.total} total · {dashboardStats.newToday} open · {dashboardStats.resolved} resolved
              </span>
            </div>
          </div>
        </div>

        <div className="feedback-header-center">
          <div className="pg-header__tabs feedback-header-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`pg-header__tab ${activeTab === tab.id ? 'pg-header__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="feedback-header-right">
          <div className="feedback-header-stats-inline">
            <span className="feedback-header-stat-inline">
              <strong>{dashboardStats.newToday}</strong> Open
            </span>
            <span className="feedback-header-stat-inline">
              <strong>{dashboardStats.resolved}</strong> Resolved
            </span>
            <span className="feedback-header-stat-inline">
              <strong>{dashboardStats.total}</strong> Total
            </span>
            <span className="feedback-header-stat-inline">
              <strong>{dashboardStats.positivePercent}%</strong> Positive
            </span>
          </div>
          
          <div className="pg-search feedback-header-search">
            <Search className="pg-search__icon" size={14} />
            <input
              type="text"
              placeholder="Search feedback..."
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
          
          <button
            className="pg-header__action-btn feedback-header-refresh"
            onClick={() => fetchFeedback(0, false)}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>

          <div className="feedback-header-toggle">
            <button
              className={`feedback-toggle-btn ${featureFlag?.enabled ? 'feedback-toggle-btn--on' : ''}`}
              onClick={() => handleFeatureToggle(!featureFlag?.enabled)}
              disabled={toggleLoading}
              title="Feedback System"
            >
              {toggleLoading ? <Loader2 size={12} className="spinning" /> : (featureFlag?.enabled ? 'ON' : 'OFF')}
            </button>
          </div>
        </div>
      </header>

      <div className="sa__content">
        {error && (
          <div className="feedback-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => fetchFeedback(0, false)}>Retry</button>
          </div>
        )}

        {activeTab === 'inbox' && (
          <>
            <div className="feedback-main-grid">
              <div className="feedback-inbox">
                <div className="feedback-inbox__header">
                  <h2>Feedback</h2>
                  <div className="feedback-inbox__filters">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="feedback-select"
                    >
                      <option value="all">All Status</option>
                      <option value="NEW">New</option>
                      <option value="ACKNOWLEDGED">Acknowledged</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="feedback-select"
                    >
                      <option value="all">All Categories</option>
                      <option value="UI">UI</option>
                      <option value="PERFORMANCE">Performance</option>
                      <option value="FEATURE">Feature</option>
                      <option value="BUG">Bug</option>
                      <option value="SECURITY">Security</option>
                    </select>
                  </div>
                </div>
                <div className="feedback-list">
                  {loading && feedbackItems.length === 0 ? (
                    <div className="feedback-loading">
                      <Loader2 size={24} className="spinning" />
                      <span>Loading feedback...</span>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {filteredFeedback.map(fb => (
                        <FeedbackCard
                          key={fb.id}
                          feedback={fb}
                          onUpvote={handleUpvote}
                          onSelect={setSelectedFeedback}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                  {filteredFeedback.length === 0 && !loading && (
                    <div className="feedback-empty">
                      <MessageSquare size={48} />
                      <p>No feedback found</p>
                    </div>
                  )}
                  {hasMore && !loading && (
                    <button className="feedback-load-more" onClick={handleLoadMore}>
                      Load More
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <div className="feedback-requests">
            <div className="feedback-requests__header">
              <h2>Feature Requests</h2>
              <span className="feedback-requests__count">{featureRequests.length} requests</span>
            </div>
            <div className="feedback-requests__list">
              <AnimatePresence mode="popLayout">
                {featureRequests.map(fr => (
                  <motion.div
                    key={fr.id}
                    className="feature-request-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                  >
                    <div className="feature-request-card__votes">
                      <UpvoteButton
                        feedbackId={fr.id}
                        upvotes={fr.upvotes}
                        hasUpvoted={fr.hasUpvoted || false}
                        onUpvote={handleUpvote}
                      />
                    </div>
                    <div className="feature-request-card__content" onClick={() => setSelectedFeedback(fr)}>
                      {fr.subject && <h4 className="feature-request-card__subject">{fr.subject}</h4>}
                      <p className="feature-request-card__text">{fr.content}</p>
                      <div className="feature-request-card__meta">
                        <span>{fr.userEmail}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(fr.createdAt)}</span>
                      </div>
                    </div>
                    <div className="feature-request-card__status">
                      <span className={`feature-request-card__status-badge feature-request-card__status-badge--${fr.status}`}>
                        {fr.status.replace('_', ' ')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {featureRequests.length === 0 && !loading && (
                <div className="feedback-empty">
                  <Star size={48} />
                  <p>No feature requests yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="feedback-analytics">
            <div className="feedback-analytics__grid">
              <div className="feedback-chart-card" ref={trendChartRef}>
                <div className="feedback-chart-card__header">
                  <h3>Feedback Trend</h3>
                  <div className="feedback-chart-card__legend">
                    <span className="feedback-chart-card__legend-item feedback-chart-card__legend-item--positive">
                      Positive
                    </span>
                    <span className="feedback-chart-card__legend-item feedback-chart-card__legend-item--neutral">
                      Neutral
                    </span>
                    <span className="feedback-chart-card__legend-item feedback-chart-card__legend-item--negative">
                      Negative
                    </span>
                  </div>
                </div>
                <div className="feedback-chart-card__body">
                  <SentimentTrendChart data={sentimentTrend} containerRef={trendChartRef} />
                </div>
              </div>

              <div className="feedback-chart-card" ref={categoryChartRef}>
                <div className="feedback-chart-card__header">
                  <h3>Category Distribution</h3>
                </div>
                <div className="feedback-chart-card__body">
                  {categoryData.length > 0 ? (
                    <CategoryBarChart data={categoryData} containerRef={categoryChartRef} />
                  ) : (
                    <div className="feedback-empty-state">
                      <BarChart3 size={32} />
                      <span>No category data available</span>
                    </div>
                  )}
                </div>
              </div>

              {stats && (
                <div className="feedback-stats-grid">
                  <div className="feedback-stat-box">
                    <span className="feedback-stat-box__value">{stats.bugCount}</span>
                    <span className="feedback-stat-box__label">Bugs</span>
                  </div>
                  <div className="feedback-stat-box">
                    <span className="feedback-stat-box__value">{stats.uiIssueCount}</span>
                    <span className="feedback-stat-box__label">UI Issues</span>
                  </div>
                  <div className="feedback-stat-box">
                    <span className="feedback-stat-box__value">{stats.suggestionCount}</span>
                    <span className="feedback-stat-box__label">Suggestions</span>
                  </div>
                  <div className="feedback-stat-box">
                    <span className="feedback-stat-box__value">{stats.improvementCount}</span>
                    <span className="feedback-stat-box__label">Improvements</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedFeedback && (
          <FeedbackDetailModal
            feedback={selectedFeedback}
            onClose={() => setSelectedFeedback(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SAFeedback;
