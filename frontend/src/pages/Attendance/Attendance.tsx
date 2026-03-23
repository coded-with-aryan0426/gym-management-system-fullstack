import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, Clock, TrendingUp, TrendingDown,
  Zap, Calendar, Search, RefreshCw, UserCheck,
  ChevronLeft, ChevronRight, BarChart3, Filter,
  Download, ArrowUpRight, ArrowDownRight, Database,
  UserCircle2, ShieldCheck, Dumbbell, X, Plus,
  LogOut, History, ChevronDown, SortAsc, SortDesc,
  FileSpreadsheet, Loader2, AlertCircle, CheckCircle2,
  UserPlus, Eye
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import { attendanceApi } from '../../services/attendanceTaskApi';
import type { AttendanceTrendPoint, HeatmapCell, TodayCheckIn, AttendanceStats, MemberSearchResult } from '../../services/attendanceTaskApi';
import './Attendance.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD: any = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }
  })
};

const PAGE_SIZES = [10, 25, 50, 100];

const PERIOD_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

const ROLE_TABS = [
  { id: 'all', label: 'All Users', icon: <Activity size={14} />, color: 'var(--accent-crimson)' },
  { id: 'MEMBER', label: 'Members', icon: <Users size={14} />, color: '#10B981' },
  { id: 'TRAINER', label: 'Trainers', icon: <Dumbbell size={14} />, color: '#A78BFA' },
  { id: 'STAFF', label: 'Staff', icon: <ShieldCheck size={14} />, color: '#3B82F6' },
];

const DAYS_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5);

type SortField = 'memberName' | 'role' | 'checkInTime' | 'checkOutTime' | 'durationMinutes' | 'status';
type SortDirection = 'asc' | 'desc';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('en-IN');
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const fmtDuration = (mins: number | null) => {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

function buildHeatmapMatrix(cells: HeatmapCell[]) {
  const map: Record<string, number> = {};
  cells.forEach(c => { map[`${c.day}_${c.hour}`] = c.count; });
  const max = Math.max(...Object.values(map), 1);
  return { map, max };
}

function heatColor(count: number, max: number) {
  const t = count / max;
  if (t === 0) return 'rgba(255,255,255,0.03)';
  if (t < 0.25) return 'rgba(220,38,38,0.15)';
  if (t < 0.5) return 'rgba(220,38,38,0.35)';
  if (t < 0.75) return 'rgba(220,38,38,0.60)';
  return 'rgba(220,38,38,0.90)';
}

function exportToCSV(data: TodayCheckIn[], filename: string) {
  const headers = ['Name', 'Email', 'Role', 'Check-in', 'Check-out', 'Duration (min)', 'Status'];
  const rows = data.map(c => [
    c.memberName,
    c.email,
    c.role,
    c.checkInTime ? new Date(c.checkInTime).toLocaleString() : '',
    c.checkOutTime ? new Date(c.checkOutTime).toLocaleString() : '',
    c.durationMinutes ?? '',
    c.checkOutTime ? 'Checked Out' : 'Inside'
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ─── Skeleton Components ──────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="att-kpi-card att-skeleton">
    <div className="att-kpi-card__inner">
      <div className="att-skeleton__line att-skeleton__line--short" />
      <div className="att-skeleton__line att-skeleton__line--large" />
      <div className="att-skeleton__line att-skeleton__line--medium" />
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="att-table-viewport">
    <table className="att-table">
      <thead>
        <tr>
          <th>User Identity</th>
          <th>Role</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Duration</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map(i => (
          <tr key={i} className="att-skeleton-row">
            <td><div className="att-skeleton__line" style={{ width: '70%' }} /></td>
            <td><div className="att-skeleton__line" style={{ width: '60px' }} /></td>
            <td><div className="att-skeleton__line" style={{ width: '80px' }} /></td>
            <td><div className="att-skeleton__line" style={{ width: '80px' }} /></td>
            <td><div className="att-skeleton__line" style={{ width: '60px' }} /></td>
            <td><div className="att-skeleton__line" style={{ width: '90px' }} /></td>
            <td><div className="att-skeleton__line" style={{ width: '40px' }} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="att-tooltip" role="tooltip">
      <p className="att-tooltip__label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="att-tooltip__val" style={{ color: p.color }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Check-In Modal ───────────────────────────────────────────────────────────
interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemberSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await attendanceApi.searchMembers(searchQuery);
        setSearchResults(results);
      } catch (err) {
        toast.error('Failed to search members');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleCheckIn = async (userId: number, memberName: string) => {
    setIsCheckingIn(userId);
    try {
      await attendanceApi.checkIn(userId);
      toast.success(`${memberName} checked in successfully`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check in');
    } finally {
      setIsCheckingIn(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="att-modal-overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-modal-title"
    >
      <motion.div 
        className="att-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="att-modal__header">
          <div className="att-modal__header-content">
            <div className="att-modal__icon">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 id="checkin-modal-title" className="att-modal__title">Manual Check-In</h2>
              <p className="att-modal__subtitle">Search and check in a member</p>
            </div>
          </div>
          <button 
            className="att-modal__close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="att-modal__body">
          <div className="att-modal__search">
            <Search size={18} className="att-modal__search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="att-modal__search-input"
              aria-label="Search members"
            />
            {isSearching && <Loader2 size={18} className="att-modal__search-spinner" />}
          </div>

          <div className="att-modal__results">
            {searchResults.length === 0 && searchQuery && !isSearching ? (
              <div className="att-modal__empty">
                <AlertCircle size={32} />
                <p>No members found for "{searchQuery}"</p>
              </div>
            ) : searchResults.length === 0 && !searchQuery ? (
              <div className="att-modal__empty">
                <Users size={32} />
                <p>Start typing to search members</p>
              </div>
            ) : (
              <ul className="att-modal__member-list" role="listbox">
                {searchResults.map(member => (
                  <li key={member.userId} className="att-modal__member-item" role="option">
                    <div className="att-modal__member-info">
                      <div className="att-modal__member-avatar">
                        {member.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="att-modal__member-details">
                        <span className="att-modal__member-name">{member.fullName}</span>
                        <span className="att-modal__member-email">{member.email}</span>
                      </div>
                      <span className={`att-role-badge att-role-badge--${member.role?.toLowerCase()}`}>
                        {member.role}
                      </span>
                    </div>
                    <button
                      className="att-modal__checkin-btn"
                      onClick={() => handleCheckIn(member.userId, member.fullName)}
                      disabled={isCheckingIn === member.userId}
                      aria-label={`Check in ${member.fullName}`}
                    >
                      {isCheckingIn === member.userId ? (
                        <Loader2 size={16} className="att-icon-spin" />
                      ) : (
                        <>
                          <UserCheck size={16} />
                          <span>Check In</span>
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Member Detail Modal ──────────────────────────────────────────────────────
interface MemberDetailModalProps {
  isOpen: boolean;
  member: TodayCheckIn | null;
  onClose: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ isOpen, member, onClose }) => {
  if (!isOpen || !member) return null;

  return (
    <div 
      className="att-modal-overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-detail-title"
    >
      <motion.div 
        className="att-modal att-modal--detail"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="att-modal__header">
          <div className="att-modal__header-content">
            <div className="att-modal__member-avatar att-modal__member-avatar--large">
              {member.memberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h2 id="member-detail-title" className="att-modal__title">{member.memberName}</h2>
              <p className="att-modal__subtitle">{member.email}</p>
            </div>
          </div>
          <button className="att-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="att-modal__body">
          <div className="att-detail-grid">
            <div className="att-detail-item">
              <span className="att-detail-item__label">Role</span>
              <span className={`att-role-badge att-role-badge--${member.role?.toLowerCase()}`}>
                {member.role}
              </span>
            </div>
            <div className="att-detail-item">
              <span className="att-detail-item__label">Status</span>
              <div className={`att-status-indicator ${member.checkOutTime ? 'is-out' : 'is-in'}`}>
                <span className="att-status-indicator__dot" />
                <span>{member.checkOutTime ? 'Checked Out' : 'Inside'}</span>
              </div>
            </div>
            <div className="att-detail-item">
              <span className="att-detail-item__label">Check-in Time</span>
              <span className="att-detail-item__value">{fmtTime(member.checkInTime)}</span>
            </div>
            <div className="att-detail-item">
              <span className="att-detail-item__label">Check-out Time</span>
              <span className="att-detail-item__value">
                {member.checkOutTime ? fmtTime(member.checkOutTime) : '—'}
              </span>
            </div>
            <div className="att-detail-item att-detail-item--full">
              <span className="att-detail-item__label">Session Duration</span>
              <span className="att-detail-item__value att-detail-item__value--large">
                {fmtDuration(member.durationMinutes)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AttendancePage: React.FC = () => {
  // Data state
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [trends, setTrends] = useState<AttendanceTrendPoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);
  const [todayList, setTodayList] = useState<TodayCheckIn[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(30);
  const [activeRole, setActiveRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'checked-out'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [seeding, setSeeding] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('checkInTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Modal state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showMemberDetail, setShowMemberDetail] = useState<TodayCheckIn | null>(null);
  
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Data Loading ─────────────────────────────────────────────────────────
  const loadData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    else setRefreshing(true);

    const today = new Date();
    const from = new Date(today.getTime() - period * 86400000).toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];
    const roleParam = activeRole === 'all' ? undefined : activeRole;

    try {
      // Parallel data fetching (Vercel best practice)
      const [statsRes, trendsRes, heatmapRes, todayRes] = await Promise.all([
        attendanceApi.getStats(roleParam).catch(() => null),
        attendanceApi.getTrends(from, to, roleParam).catch(() => []),
        attendanceApi.getHeatmap(Math.ceil(period / 7), roleParam).catch(() => []),
        attendanceApi.getToday(roleParam).catch(() => []),
      ]);

      if (statsRes) setStats(statsRes);
      setTrends(trendsRes);
      setHeatmap(heatmapRes);
      setTodayList(todayRes);
    } catch (err) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, activeRole]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        loadData(true);
      }, 30000); // Refresh every 30 seconds
    } else {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    }
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [autoRefresh, loadData]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSeedData = async () => {
    if (!window.confirm('This will generate mock check-ins for the last 30 days. Proceed?')) return;
    setSeeding(true);
    const t = toast.loading('Seeding demo data...');
    try {
      const res = await attendanceApi.seedAttendance();
      toast.success(res.message, { id: t });
      loadData();
    } catch (err) {
      toast.error('Failed to seed data', { id: t });
    } finally {
      setSeeding(false);
    }
  };

  const handleCheckOut = async (checkInId: number, memberName: string) => {
    const t = toast.loading(`Checking out ${memberName}...`);
    try {
      await attendanceApi.checkOut(checkInId);
      toast.success(`${memberName} checked out successfully`, { id: t });
      loadData(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to check out', { id: t });
    }
  };

  const handleExport = () => {
    const filename = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filteredAndSortedData, filename);
    toast.success('Attendance data exported successfully');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // ─── Derived Data ─────────────────────────────────────────────────────────
  const { map: heatMap, max: heatMax } = useMemo(() => buildHeatmapMatrix(heatmap), [heatmap]);

  const filteredAndSortedData = useMemo(() => {
    let result = todayList.filter(c => {
      const matchSearch = !searchQuery ||
        c.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && !c.checkOutTime) ||
        (statusFilter === 'checked-out' && c.checkOutTime);
      return matchSearch && matchStatus;
    });

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'memberName':
          comparison = a.memberName.localeCompare(b.memberName);
          break;
        case 'role':
          comparison = (a.role || '').localeCompare(b.role || '');
          break;
        case 'checkInTime':
          comparison = new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
          break;
        case 'checkOutTime':
          const aTime = a.checkOutTime ? new Date(a.checkOutTime).getTime() : 0;
          const bTime = b.checkOutTime ? new Date(b.checkOutTime).getTime() : 0;
          comparison = aTime - bTime;
          break;
        case 'durationMinutes':
          comparison = (a.durationMinutes || 0) - (b.durationMinutes || 0);
          break;
        case 'status':
          comparison = (a.checkOutTime ? 1 : 0) - (b.checkOutTime ? 1 : 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [todayList, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeRole]);

  const avgCheckIns = trends.length
    ? Math.round(trends.reduce((s, t) => s + t.checkIns, 0) / trends.length)
    : 0;
  const maxDay = trends.length
    ? trends.reduce((a, b) => a.checkIns > b.checkIns ? a : b)
    : null;
  const trendChange = trends.length >= 2
    ? Math.round(((trends[trends.length - 1].checkIns - trends[0].checkIns) / Math.max(trends[0].checkIns, 1)) * 100)
    : 0;

  const kpis = stats ? [
    {
      label: "Today's Volume", value: fmt(stats.todayCheckIns),
      icon: <UserCheck size={18} />, color: '#10B981',
      sub: `${stats.liveNow} active now`, trend: null,
    },
    {
      label: 'Weekly Flow', value: fmt(stats.weekCheckIns),
      icon: <Calendar size={18} />, color: '#3B82F6',
      sub: `Avg ${Math.round(stats.weekCheckIns / 7)}/day`, trend: null,
    },
    {
      label: 'Monthly Stats', value: fmt(stats.monthCheckIns),
      icon: <BarChart3 size={18} />, color: '#A78BFA',
      sub: `Avg ${Math.round(stats.monthCheckIns / 30)}/day`, trend: trendChange,
    },
    {
      label: 'Avg Duration', value: fmtDuration(stats.avgSessionMinutes),
      icon: <Clock size={18} />, color: '#F59E0B',
      sub: `Capacity: ${stats.peakCapacity}`, trend: null,
    },
  ] : [];

  // ─── Render Helper: Sort Header ───────────────────────────────────────────
  const SortableHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <th 
      className="att-table__sortable"
      onClick={() => handleSort(field)}
      role="columnheader"
      aria-sort={sortField === field ? sortDirection : 'none'}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleSort(field)}
    >
      <span>{label}</span>
      {sortField === field ? (
        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
      ) : (
        <ChevronDown size={14} className="att-sort-icon--inactive" />
      )}
    </th>
  );

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <div className="att-page shadow-blur">
        <div className="att-header">
          <div className="att-header__left">
            <div className="att-header__icon"><Activity size={24} /></div>
            <div>
              <h1 className="att-header__title">Attendance Analytics</h1>
              <p className="att-header__sub">Loading data...</p>
            </div>
          </div>
        </div>
        <div className="att-kpi-grid">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="att-page shadow-blur">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="att-header">
        <div className="att-header__left">
          <div className="att-header__icon" aria-hidden="true">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="att-header__title">Attendance Analytics</h1>
            <p className="att-header__sub">
              Managing flow for {activeRole === 'all' ? 'All Roles' : activeRole + 's'}
              {autoRefresh && <span className="att-auto-refresh-badge">● Auto-refresh</span>}
            </p>
          </div>
        </div>

        <nav className="att-header__center" aria-label="Role filter">
          <div className="att-role-tabs" role="tablist">
            {ROLE_TABS.map(tab => (
              <button
                key={tab.id}
                className={`att-role-tab ${activeRole === tab.id ? 'active' : ''}`}
                onClick={() => setActiveRole(tab.id)}
                style={{ '--tab-color': tab.color } as any}
                role="tab"
                aria-selected={activeRole === tab.id}
                aria-controls="attendance-table"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="att-header__right">
          <div className="att-period-tabs" role="group" aria-label="Period filter">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.days}
                className={`att-period-tab ${period === opt.days ? 'att-period-tab--active' : ''}`}
                onClick={() => setPeriod(opt.days)}
                aria-pressed={period === opt.days}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="att-header__actions">
            <button
              className={`att-action-btn ${autoRefresh ? 'att-action-btn--active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh (30s)'}
              aria-pressed={autoRefresh}
            >
              <RefreshCw size={15} className={autoRefresh ? 'att-icon-spin' : ''} />
            </button>
            <button
              className="att-action-btn att-action-btn--primary"
              onClick={() => setShowCheckInModal(true)}
              title="Manual Check-In"
              aria-label="Open manual check-in"
            >
              <Plus size={15} />
            </button>
            <button
              className="att-action-btn"
              onClick={handleExport}
              title="Export to CSV"
              aria-label="Export attendance data"
            >
              <Download size={15} />
            </button>
            <button
              className="att-seed-btn"
              onClick={handleSeedData}
              disabled={seeding}
              title="Seed Mock Data"
              aria-label="Generate test data"
            >
              <Database size={15} />
            </button>
            <button
              className="att-refresh-btn"
              onClick={() => loadData(true)}
              title="Refresh Stats"
              disabled={refreshing}
              aria-label="Refresh data"
            >
              <RefreshCw size={15} className={refreshing ? 'att-icon-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* ── KPI Grid ────────────────────────────────────────────────────── */}
      <section className="att-kpi-grid" aria-label="Key metrics">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="att-kpi-card"
            variants={CARD}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="att-kpi-card__glow" style={{ background: kpi.color }} aria-hidden="true" />
            <div className="att-kpi-card__inner">
              <div className="att-kpi-card__top">
                <span className="att-kpi-card__label">{kpi.label}</span>
                <span className="att-kpi-card__icon" style={{ background: `${kpi.color}18`, color: kpi.color }} aria-hidden="true">
                  {kpi.icon}
                </span>
              </div>
              <div className="att-kpi-card__value">{kpi.value}</div>
              <div className="att-kpi-card__bottom">
                <span className="att-kpi-card__sub">{kpi.sub}</span>
                {kpi.trend !== null && (
                  <span className={`att-kpi-card__trend ${kpi.trend >= 0 ? 'att-kpi-card__trend--up' : 'att-kpi-card__trend--down'}`}>
                    {kpi.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(kpi.trend)}%
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Charts Section ─────────────────────────────────────────────── */}
      <div className="att-charts-row">
        <motion.div
          className="att-card att-chart-card"
          variants={CARD} initial="hidden" animate="visible" custom={4}
        >
          <div className="att-card__header">
            <div>
              <h2 className="att-card__title">Activity Momentum</h2>
              <p className="att-card__sub">Daily entries over {period} days</p>
            </div>
            <div className="att-chart-controls">
              <div className="att-toggle-group" role="group" aria-label="Chart type">
                <button 
                  className={chartType === 'area' ? 'active' : ''} 
                  onClick={() => setChartType('area')}
                  aria-pressed={chartType === 'area'}
                >
                  Area
                </button>
                <button 
                  className={chartType === 'bar' ? 'active' : ''} 
                  onClick={() => setChartType('bar')}
                  aria-pressed={chartType === 'bar'}
                >
                  Bar
                </button>
              </div>
            </div>
          </div>

          <div className="att-chart-container" role="img" aria-label="Attendance trend chart">
            <ResponsiveContainer width="100%" height={260}>
              {chartType === 'area' ? (
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="momentumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="checkIns"
                    name="Volume"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#momentumGrad)"
                    activeDot={{ r: 6, fill: '#fff', stroke: '#ef4444', strokeWidth: 3 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                  <Bar dataKey="checkIns" name="Volume" radius={[4, 4, 0, 0]}>
                    {trends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === trends.length - 1 ? '#ef4444' : 'rgba(239, 68, 68, 0.5)'} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="att-card att-summary-card"
          variants={CARD} initial="hidden" animate="visible" custom={5}
        >
          <div className="att-card__header">
            <h2 className="att-card__title">Insights</h2>
          </div>
          <div className="att-insight-list">
            <div className="att-insight-item">
              <div className="att-insight-item__icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <TrendingUp size={16} />
              </div>
              <div className="att-insight-item__content">
                <div className="att-insight-item__label">Total Participation</div>
                <div className="att-insight-item__value">{fmt(trends.reduce((s, t) => s + t.checkIns, 0))} entries</div>
              </div>
            </div>
            <div className="att-insight-item">
              <div className="att-insight-item__icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <Users size={16} />
              </div>
              <div className="att-insight-item__content">
                <div className="att-insight-item__label">Peak Day Volume</div>
                <div className="att-insight-item__value">{maxDay ? `${maxDay.day} (${fmt(maxDay.checkIns)})` : '—'}</div>
              </div>
            </div>
            <div className="att-insight-item">
              <div className="att-insight-item__icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <Clock size={16} />
              </div>
              <div className="att-insight-item__content">
                <div className="att-insight-item__label">Average Session</div>
                <div className="att-insight-item__value">{fmtDuration(stats?.avgSessionMinutes ?? 0)}</div>
              </div>
            </div>
            <div className="att-insight-item">
              <div className="att-insight-item__icon" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#DC2626' }}>
                <Zap size={16} />
              </div>
              <div className="att-insight-item__content">
                <div className="att-insight-item__label">Utilization Rate</div>
                <div className="att-insight-item__value">
                  {stats ? Math.round((stats.liveNow / Math.max(stats.peakCapacity, 1)) * 100) : 0}% capacity
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Heatmap ────────────────────────────────────────────────────── */}
      <motion.section
        className="att-card att-heatmap-card"
        variants={CARD} initial="hidden" animate="visible" custom={6}
        aria-label="Attendance density heatmap"
      >
        <div className="att-card__header">
          <div>
            <h2 className="att-card__title">Density Map</h2>
            <p className="att-card__sub">Hour × Day intensity spectrum</p>
          </div>
          <div className="att-heatmap-legend" aria-hidden="true">
            <span className="att-heatmap-legend__label">Low</span>
            {[0.1, 0.3, 0.6, 0.9].map((t, i) => (
              <span key={i} className="att-heatmap-legend__swatch" style={{ background: heatColor(t * heatMax, heatMax) }} />
            ))}
            <span className="att-heatmap-legend__label">High</span>
          </div>
        </div>

        <div className="att-heatmap-scroll">
          <div className="att-heatmap" role="grid" aria-label="Attendance heatmap by day and hour">
            <div className="att-heatmap__hours-row" role="row">
              <div className="att-heatmap__day-label" role="columnheader" />
              {HOURS.map(h => (
                <div key={h} className="att-heatmap__hour-label" role="columnheader">
                  {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
                </div>
              ))}
            </div>

            {DAYS_ORDER.map(day => (
              <div key={day} className="att-heatmap__row" role="row">
                <div className="att-heatmap__day-label" role="rowheader">{day}</div>
                {HOURS.map(hour => {
                  const count = heatMap[`${day}_${hour}`] ?? 0;
                  return (
                    <motion.div
                      key={hour}
                      className="att-heatmap__cell"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ background: heatColor(count, heatMax) }}
                      title={`${day} ${hour}:00 — ${count} logs`}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                      role="gridcell"
                      aria-label={`${day} ${hour}:00, ${count} check-ins`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Log Table ──────────────────────────────────────────────────── */}
      <motion.section
        className="att-card att-log-card"
        variants={CARD} initial="hidden" animate="visible" custom={7}
        aria-label="Live floor log"
      >
        <div className="att-card__header">
          <div>
            <h2 className="att-card__title">Live Floor Log</h2>
            <p className="att-card__sub">{filteredAndSortedData.length} entries • Page {currentPage} of {Math.max(totalPages, 1)}</p>
          </div>
          <div className="att-log-controls">
            <div className="att-search">
              <Search size={14} className="att-search__icon" aria-hidden="true" />
              <input
                className="att-search__input"
                placeholder="Search name or email…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search attendance records"
              />
            </div>
            <div className="att-filter-chips" role="group" aria-label="Status filter">
              {(['all', 'active', 'checked-out'] as const).map(s => (
                <button
                  key={s}
                  className={`att-filter-chip ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                  aria-pressed={statusFilter === s}
                >
                  {s === 'active' ? 'Inside' : s === 'checked-out' ? 'Checked Out' : 'All'}
                </button>
              ))}
            </div>
            <div className="att-page-size">
              <label htmlFor="page-size" className="att-page-size__label">Show:</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="att-page-size__select"
              >
                {PAGE_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="att-table-viewport" id="attendance-table">
          <table className="att-table" role="grid">
            <thead>
              <tr>
                <SortableHeader field="memberName" label="User Identity" />
                <SortableHeader field="role" label="Role" />
                <SortableHeader field="checkInTime" label="Check-in" />
                <SortableHeader field="checkOutTime" label="Check-out" />
                <SortableHeader field="durationMinutes" label="Duration" />
                <SortableHeader field="status" label="Status" />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="att-table__empty">
                    <div className="att-empty-state">
                      <Filter size={32} aria-hidden="true" />
                      <p>{searchQuery ? 'No matches found' : 'No activity recorded yet today'}</p>
                      <button 
                        className="att-empty-state__action"
                        onClick={() => setShowCheckInModal(true)}
                      >
                        <Plus size={16} /> Manual Check-In
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map(c => (
                  <tr key={c.checkInId} className="att-table__row">
                    <td>
                      <div className="att-user-cell">
                        <div className="att-user-cell__avatar">
                          {c.memberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="att-user-cell__info">
                          <div className="att-user-cell__name">{c.memberName}</div>
                          <div className="att-user-cell__email">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`att-role-badge att-role-badge--${c.role?.toLowerCase()}`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="att-table__time">{fmtTime(c.checkInTime)}</td>
                    <td className="att-table__time text-dim">
                      {c.checkOutTime ? fmtTime(c.checkOutTime) : <span className="att-pulse">Current</span>}
                    </td>
                    <td className="att-table__duration">{fmtDuration(c.durationMinutes)}</td>
                    <td>
                      <div className={`att-status-indicator ${c.checkOutTime ? 'is-out' : 'is-in'}`}>
                        <span className="att-status-indicator__dot" aria-hidden="true" />
                        <span className="att-status-indicator__label">
                          {c.checkOutTime ? 'Checked Out' : 'Inside'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="att-table__actions">
                        <button
                          className="att-table__action-btn"
                          onClick={() => setShowMemberDetail(c)}
                          title="View details"
                          aria-label={`View details for ${c.memberName}`}
                        >
                          <Eye size={14} />
                        </button>
                        {!c.checkOutTime && (
                          <button
                            className="att-table__action-btn att-table__action-btn--checkout"
                            onClick={() => handleCheckOut(c.checkInId, c.memberName)}
                            title="Check out"
                            aria-label={`Check out ${c.memberName}`}
                          >
                            <LogOut size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="att-pagination" role="navigation" aria-label="Table pagination">
            <button
              className="att-pagination__btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <ChevronLeft size={14} />
              <ChevronLeft size={14} style={{ marginLeft: -8 }} />
            </button>
            <button
              className="att-pagination__btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            
            <div className="att-pagination__pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`att-pagination__page ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className="att-pagination__btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              className="att-pagination__btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <ChevronRight size={14} />
              <ChevronRight size={14} style={{ marginLeft: -8 }} />
            </button>
          </div>
        )}
      </motion.section>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckInModal && (
          <CheckInModal
            isOpen={showCheckInModal}
            onClose={() => setShowCheckInModal(false)}
            onSuccess={() => loadData(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMemberDetail && (
          <MemberDetailModal
            isOpen={!!showMemberDetail}
            member={showMemberDetail}
            onClose={() => setShowMemberDetail(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendancePage;
