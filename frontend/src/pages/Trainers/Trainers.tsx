import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { showToast } from '../../utils/showToast';
import { Badge, getStatusVariant, Avatar } from '../../components/ui';
import CreateActionModal from '../../components/CreateActionModal/CreateActionModal';
import { ActionMenuButton } from '../../components/shared';
import { useClickOutside } from '../../hooks';
import EnhancedTrainerActionModal from '../../components/TrainerActionModal/EnhancedTrainerActionModal';
import api from '../../services/api';
import type { User, Role, TrainerPerformance } from '../../types';
import '../../styles/page-common.css';
import './Trainers.css';
import {
  Search, Filter, UserPlus, TrendingUp, Users, Activity, Clock,
  Star, ChevronDown, Download, MoreHorizontal, RefreshCw, Zap,
  Award, Target, Calendar, DollarSign, BarChart3, UserCheck, AlertTriangle, UserX, Percent, X,
  Mail, Phone, Briefcase
} from 'lucide-react';
import DataTable, { type Column } from '../../components/ui/DataTable';

  type StatusFilter = 'all' | 'active' | 'inactive' | 'onLeave';

  type StaffStats = {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    hiredThisMonth: number;
    utilizationRate: number;
  };

const computeStaffStats = (list: User[]): StaffStats => {
  const active = list.filter(t => (t as any).status?.toLowerCase() === 'active' || !(t as any).status).length;
  const inactive = list.filter(t => (t as any).status?.toLowerCase() === 'inactive').length;
  const onLeave = list.filter(t => {
    const s = (t as any).status?.toLowerCase();
    return s === 'on_leave' || s === 'leave';
  }).length;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const hiredThisMonth = list.filter(t => {
    const joinDate = (t as any).joinDate || (t as any).createdAt;
    if (!joinDate) return false;
    return new Date(joinDate) >= startOfMonth;
  }).length;
  const utilizationRate = list.length > 0 ? Math.round((active / list.length) * 100) : 100;
  return { total: list.length, active, inactive, onLeave, hiredThisMonth, utilizationRate };
};

/* Mini sparkline SVG - enhanced with gradient */
const MiniBar: React.FC<{ values: number[]; color: string; height?: number }> = ({ values, color, height = 24 }) => {
  const max = Math.max(...values, 1);
  const w = values.length * 6;
  const id = `grad-${color.replace('#', '')}`;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {values.map((v, i) => {
        const h = (v / max) * height;
        return <rect key={i} x={i * 6} y={height - h} width={4} height={h} rx={2} fill={`url(#${id})`} opacity={0.6 + (i / values.length) * 0.4} />;
      })}
    </svg>
  );
};

/* Rating stars */
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="t-rating">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={11}
          fill={i < full ? '#f59e0b' : i === full && half ? 'url(#half)' : 'none'}
          stroke={i < full || (i === full && half) ? '#f59e0b' : 'var(--text-tertiary)'}
          strokeWidth={1.5}
        />
      ))}
      <span className="t-rating__value">{rating.toFixed(1)}</span>
    </span>
  );
};

/* Dynamic row count based on available viewport height */
const useAutoPageSize = (headerRef: React.RefObject<HTMLElement | null>, minRows: number = 5, maxRows: number = 50) => {
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const calculate = () => {
      const headerHeight = headerRef.current?.getBoundingClientRect().bottom ?? 160;
      const viewportHeight = window.innerHeight;
      const paginationHeight = 48;
      const tableHeaderHeight = 36;
      const bufferPadding = 24;
      const availableHeight = viewportHeight - headerHeight - paginationHeight - tableHeaderHeight - bufferPadding;
      const rowHeight = window.innerWidth < 768 ? 80 : 44;
      const rows = Math.max(minRows, Math.min(maxRows, Math.floor(availableHeight / rowHeight)));
      setPageSize(rows);
    };

    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [headerRef, minRows, maxRows]);

  return pageSize;
};

const Trainers: React.FC = () => {
  const [trainers, setTrainers] = useState<User[]>([]);
  const [performanceData, setPerformanceData] = useState<Record<number, TrainerPerformance>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<Set<string | number>>(new Set());
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all');

  const headerRef = useRef<HTMLElement>(null);
  const autoPageSize = useAutoPageSize(headerRef);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortType, setSortType] = useState<'newest' | 'alphabetical'>('newest');

  // Sync autoPageSize with pageSize
  useEffect(() => {
    setPageSize(autoPageSize);
    setCurrentPage(0);
  }, [autoPageSize]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef as React.RefObject<HTMLElement>, () => setIsFilterOpen(false), isFilterOpen);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    const words = value.trim() === '' ? [] : value.trim().split(/\s+/);
    if (words.length <= 6) setSearchQuery(value);
  };

  useEffect(() => {
    if (searchParams.get('action') === 'create') setIsCreateModalOpen(true);
  }, [searchParams]);

  const [filters, setFilters] = useState({ role: '', status: '' });
  const [globalStats, setGlobalStats] = useState<StaffStats | null>(null);
  const [globalStatsLoading, setGlobalStatsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTrainersPaginated = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const response = await api.getTrainersPaginated(currentPage, pageSize, debouncedSearch || undefined, filters.role || undefined);
        setTrainers(response.content);
        setTotalCount(response.totalCount);
        setSortType(response.sortType as 'newest' | 'alphabetical');
        try {
          const perfData = await api.getAllTrainersPerformance();
          setPerformanceData(perfData);
        } catch { /* ignore */ }
      } catch {
        const allTrainers = await api.getUsers('TRAINER');
        let filtered = allTrainers;
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          filtered = filtered.filter(t => t.fullName?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q));
        }
        if (filters.role) {
          filtered = filtered.filter(t => t.roles?.some((r: Role) => r.roleName === filters.role));
        }
        const start = currentPage * pageSize;
        setTrainers(filtered.slice(start, start + pageSize));
        setTotalCount(filtered.length);
      }
    } catch (err) {
      console.error('[Trainers] Failed to load:', err);
      showToast('Failed to load trainers', 'error');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, filters.role]);

  const loadGlobalStats = useCallback(async () => {
    setGlobalStatsLoading(true);
    try {
      const first = await api.getTrainersPaginated(0, 200);
      const totalPages = Math.max(1, Math.ceil(first.totalCount / 200));
      const all: User[] = [...(first.content || [])];
      for (let p = 1; p < totalPages; p++) {
        const resp = await api.getTrainersPaginated(p, 200);
        all.push(...(resp.content || []));
      }
      setGlobalStats(computeStaffStats(all));
    } catch {
      setGlobalStats(null);
    } finally {
      setGlobalStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadTrainersPaginated(); }, [loadTrainersPaginated]);
  useEffect(() => { loadGlobalStats(); const iv = setInterval(loadGlobalStats, 60000); return () => clearInterval(iv); }, [loadGlobalStats]);
  useEffect(() => { setCurrentPage(0); }, [debouncedSearch, filters]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const activeFilterCount = [filters.role, filters.status].filter(Boolean).length;

  const handleResetFilters = () => { setFilters({ role: '', status: '' }); setActiveStatusFilter('all'); };
  const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && trainers.length > 0) {
      const trainer = trainers.find(t => t.userId.toString() === userId);
      if (trainer) handleActionClick(trainer);
    }
  }, [searchParams, trainers]);

  const pageStats = useMemo(() => computeStaffStats(trainers), [trainers]);
  const stats = globalStats ?? pageStats;

  const handleActionClick = (trainer: User) => { setSelectedTrainer(trainer); setIsActionModalOpen(true); };
  const handleCloseActionModal = () => { setIsActionModalOpen(false); setSelectedTrainer(null); };
  const handleEditProfile = async (trainer: User) => {
    showToast(`Profile updated for ${trainer.fullName}`, 'success');
    loadTrainersPaginated();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTrainersPaginated(), loadGlobalStats()]);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Filter trainers by active status tab
  const filteredTrainers = useMemo(() => {
    if (activeStatusFilter === 'all') return trainers;
    return trainers.filter(t => {
      const status = ((t as any).status || 'active').toLowerCase();
      switch (activeStatusFilter) {
        case 'active': return status === 'active' || !status;
        case 'inactive': return status === 'inactive';
        case 'onLeave': return status === 'on_leave' || status === 'leave';
        default: return true;
      }
    });
  }, [trainers, activeStatusFilter]);

  /* helper: derive sparkline bars from real performance metrics */
  const getSparkData = (uid: number): number[] => {
    const perf = performanceData[uid];
    if (!perf) return [0, 0, 0, 0, 0, 0, 0];
    // Use real metrics: completed, cancelled, rating, revenue, clients as 7 data points
    const completed = perf.completedSessions || 0;
    const cancelled = perf.cancelledSessions || 0;
    const rating = (perf.avgRating || 0) * 2; // scale 0-10
    const revenue = Math.min((perf.revenue || 0) / 1000, 10); // normalize
    const clients = perf.activeClients || 0;
    const total = completed + cancelled;
    const successRate = total > 0 ? Math.round((completed / total) * 10) : 0;
    return [completed, clients, Math.round(rating), Math.round(revenue), successRate, cancelled, completed];
  };

  /* 3D Status Badge */
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const s = status.toLowerCase();
    const isActive = s === 'active' || !s;
    const isLeave = s === 'on_leave' || s === 'leave';
    const cls = isActive ? 't-status--active' : isLeave ? 't-status--leave' : 't-status--inactive';
    const label = isActive ? 'Active' : isLeave ? 'On Leave' : 'Inactive';
    return (
      <span className={`t-status ${cls}`}>
        <span className="t-status__dot" />
        {label}
      </span>
    );
  };

  const columns: Column<User>[] = [
    {
      key: 'trainer',
      header: 'Trainer',
      width: 'auto',
      render: (member) => {
        const savedAvatarId = typeof window !== 'undefined' ? localStorage.getItem(`avatar_${member.userId}`) : null;
        const status = ((member as any).status || 'Active').toLowerCase();
        const isActive = status === 'active';
        const perf = performanceData[member.userId];
        const joinDate = (member as any).joinDate || (member as any).createdAt;
        const joinStr = joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

        return (
          <div className="t-trainer-cell" onClick={(e) => { e.stopPropagation(); handleActionClick(member); }}>
            <div className="t-trainer-cell__avatar-wrap">
              <Avatar name={member.fullName} size="sm" avatarId={savedAvatarId || member.avatarId} userId={member.userId} />
              <span className={`t-trainer-cell__dot ${isActive ? 't-trainer-cell__dot--on' : 't-trainer-cell__dot--off'}`} />
            </div>
            <div className="t-trainer-cell__info">
              <span className="t-trainer-cell__name">{member.fullName}</span>
              <span className="t-trainer-cell__meta">
                <Mail size={9} />
                {member.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      width: '110px',
      render: (member) => {
        const role = member.roles?.[0]?.roleName || 'TRAINER';
        const cls = role.toLowerCase() === 'admin' ? 't-role--admin' :
          role.toLowerCase() === 'manager' ? 't-role--manager' : 't-role--trainer';
        return (
          <span className={`t-role ${cls}`}>
            <Briefcase size={10} />
            {role}
          </span>
        );
      },
    },
    {
      key: 'performance',
      header: 'Performance',
      width: '170px',
      render: (member) => {
        const perf = performanceData[member.userId];
        const clients = perf?.clientCount || 0;
        const sessions = perf?.completedSessions || 0;
        const rating = Math.min(5, 3.5 + clients * 0.1);
        return (
          <div className="t-perf">
            <div className="t-perf__chart">
              <MiniBar values={getSparkData(member.userId)} color="#818cf8" />
            </div>
            <div className="t-perf__data">
              <div className="t-perf__row">
                <Users size={10} className="t-perf__icon t-perf__icon--clients" />
                <span className="t-perf__val">{clients}</span>
                <span className="t-perf__label">clients</span>
              </div>
              <div className="t-perf__row">
                <Target size={10} className="t-perf__icon t-perf__icon--sessions" />
                <span className="t-perf__val">{sessions}</span>
                <span className="t-perf__label">sessions</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'revenue',
      header: 'Revenue',
      width: '110px',
      render: (member) => {
        const perf = performanceData[member.userId];
        const rev = perf?.monthlyRevenue || 0;
        return (
          <div className="t-revenue-cell">
            <span className="t-revenue-cell__amount">
              <DollarSign size={12} />
              ₹{rev.toLocaleString()}
            </span>
            <span className="t-revenue-cell__period">this month</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (member) => {
        const status = (member as any).status || 'Active';
        return <StatusBadge status={status} />;
      },
    },
    {
      key: 'actions',
      header: '',
      width: '44px',
      render: (member) => (
        <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
      ),
    },
  ];

      return (
        <div className="pg-page">
          {/* === Header: single-line responsive (same pattern as Members) === */}
          <header className="pg-header pg-header--single-line" ref={headerRef}>

            {/* Title group */}
            <div className="pg-header__title-group">
              <div className="pg-header__icon t-header-icon">
                <Users size={18} />
              </div>
              <div className="pg-header__title-stack">
                <h1 className="pg-header__title">Trainers</h1>
                <span className="pg-header__month-badge">+{stats.hiredThisMonth} this month</span>
              </div>
            </div>

            {/* Stat Cards — clickable filters */}
            <div className="pg-stats">
              <button
                className={`pg-stat-card t-stat-card ${activeStatusFilter === 'all' ? 'pg-stat-card--active t-stat-card--active' : ''}`}
                onClick={() => setActiveStatusFilter('all')}
              >
                <div className="pg-stat-card__icon pg-stat-card__icon--total"><Users size={14} /></div>
                <div className="pg-stat-card__data">
                  <span className="pg-stat-card__value">{stats.total}</span>
                  <span className="pg-stat-card__label">Total</span>
                </div>
              </button>
              <button
                className={`pg-stat-card t-stat-card ${activeStatusFilter === 'active' ? 'pg-stat-card--active t-stat-card--active' : ''}`}
                onClick={() => setActiveStatusFilter('active')}
              >
                <div className="pg-stat-card__icon pg-stat-card__icon--active"><UserCheck size={14} /></div>
                <div className="pg-stat-card__data">
                  <span className="pg-stat-card__value pg-stat-card__value--green">{stats.active}</span>
                  <span className="pg-stat-card__label">Active</span>
                </div>
              </button>
              <button
                className={`pg-stat-card t-stat-card ${activeStatusFilter === 'onLeave' ? 'pg-stat-card--active t-stat-card--active' : ''}`}
                onClick={() => setActiveStatusFilter('onLeave')}
              >
                <div className="pg-stat-card__icon pg-stat-card__icon--expiring"><AlertTriangle size={14} /></div>
                <div className="pg-stat-card__data">
                  <span className="pg-stat-card__value pg-stat-card__value--amber">{stats.onLeave}</span>
                  <span className="pg-stat-card__label">On Leave</span>
                </div>
                {stats.onLeave > 0 && <span className="pg-stat-card__pulse" />}
              </button>
              <button
                className={`pg-stat-card t-stat-card ${activeStatusFilter === 'inactive' ? 'pg-stat-card--active t-stat-card--active' : ''}`}
                onClick={() => setActiveStatusFilter('inactive')}
              >
                <div className="pg-stat-card__icon pg-stat-card__icon--inactive"><UserX size={14} /></div>
                <div className="pg-stat-card__data">
                  <span className="pg-stat-card__value pg-stat-card__value--red">{stats.inactive}</span>
                  <span className="pg-stat-card__label">Inactive</span>
                </div>
              </button>
              <div className="pg-stat-card pg-stat-card--no-click t-stat-card">
                <div className="pg-stat-card__icon pg-stat-card__icon--special"><Percent size={14} /></div>
                <div className="pg-stat-card__data">
                  <span className="pg-stat-card__value pg-stat-card__value--indigo">{stats.utilizationRate}%</span>
                  <span className="pg-stat-card__label">Utilization</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="pg-search t-search">
              <Search size={14} className="pg-search__icon" />
              <input
                type="text"
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pg-search__input"
              />
              {searchQuery && (
                <button className="pg-search__clear" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="pg-filter-wrap" ref={filterRef}>
              <button
                className={`pg-btn pg-btn--icon ${isFilterOpen ? 'pg-btn--active' : ''} ${activeFilterCount > 0 ? 'pg-btn--has-filter' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={13} />
                {activeFilterCount > 0 && <span className="pg-btn__badge">{activeFilterCount}</span>}
              </button>

              {isFilterOpen && (
                <div className="pg-filter-dropdown">
                  <div className="pg-filter-dropdown__header">
                    <span>Filters</span>
                    {activeFilterCount > 0 && <button className="pg-filter-dropdown__clear" onClick={handleResetFilters}>Clear</button>}
                  </div>
                  <div className="pg-filter-dropdown__body">
                    <div className="pg-filter-dropdown__row">
                      <label className="pg-filter-dropdown__label">Role</label>
                      <select className="pg-filter-dropdown__select" value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)}>
                        <option value="">All Roles</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </div>
                    <div className="pg-filter-dropdown__row">
                      <label className="pg-filter-dropdown__label">Status</label>
                      <select className="pg-filter-dropdown__select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button className={`pg-btn pg-btn--icon ${refreshing ? 'pg-btn--spin' : ''}`} onClick={handleRefresh} title="Refresh">
              <RefreshCw size={14} />
            </button>

            {/* Primary action */}
            <div className="pg-header__actions">
              <button className="pg-btn pg-btn--primary t-btn-add" onClick={() => setIsCreateModalOpen(true)}>
                <UserPlus size={14} />
                <span>Add Trainer</span>
              </button>
            </div>
          </header>

        {/* === Active Filter Chips === */}
        {activeFilterCount > 0 && (
          <div className="pg-chips">
            {filters.role && <span className="pg-chip">Role: {filters.role}<button onClick={() => handleFilterChange('role', '')}>&times;</button></span>}
            {filters.status && <span className="pg-chip">Status: {filters.status}<button onClick={() => handleFilterChange('status', '')}>&times;</button></span>}
            <button className="pg-chips__clear" onClick={handleResetFilters}>Clear All</button>
          </div>
        )}

        {/* === Batch Actions === */}
        {selectedTrainerIds.size > 0 && (
          <div className="pg-batch t-batch">
            <span className="pg-batch__count">{selectedTrainerIds.size} selected</span>
            <button className="pg-batch__btn" onClick={() => { showToast(`Messaging ${selectedTrainerIds.size} trainers`, 'success'); setSelectedTrainerIds(new Set()); }}>Message</button>
            <button className="pg-batch__btn" onClick={() => { showToast(`Exporting ${selectedTrainerIds.size} trainers`, 'success'); setSelectedTrainerIds(new Set()); }}>Export</button>
            <button className="pg-batch__btn pg-batch__btn--danger" onClick={() => { if (window.confirm(`Delete ${selectedTrainerIds.size} trainers?`)) { showToast(`Deleted`, 'success'); setSelectedTrainerIds(new Set()); } }}>Delete</button>
            <button className="pg-batch__clear" onClick={() => setSelectedTrainerIds(new Set())}>&times;</button>
          </div>
        )}

        {/* === Table === */}
        <div className="pg-table-wrap t-table-wrap">
        <DataTable
          columns={columns}
          data={filteredTrainers}
          keyExtractor={(t) => t.userId}
          loading={loading}
          emptyMessage="No trainers found"
          onRowClick={handleActionClick}
          compact
          selectable
          stickyHeader
          selectedIds={selectedTrainerIds}
          onSelectionChange={setSelectedTrainerIds}
          pagination={{
            currentPage,
            totalPages,
            totalCount,
            pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => { setPageSize(size); setCurrentPage(0); },
          }}
          mobileCardRender={(member, index) => {
            const role = member.roles?.[0]?.roleName || 'TRAINER';
            const perf = performanceData[member.userId];
            const status = (member as any).status || 'Active';
            const rev = perf?.monthlyRevenue || 0;
            const clients = perf?.clientCount || 0;
            const sessions = perf?.completedSessions || 0;
            const savedAvatarId = typeof window !== 'undefined' ? localStorage.getItem(`avatar_${member.userId}`) : null;
            return (
              <div className="t-mobile-card">
                <div className="t-mobile-card__top">
                  <div className="t-mobile-card__avatar-wrap">
                    <Avatar name={member.fullName} size="md" avatarId={savedAvatarId || member.avatarId} userId={member.userId} />
                    <span className={`t-trainer-cell__dot ${status.toLowerCase() === 'active' ? 't-trainer-cell__dot--on' : 't-trainer-cell__dot--off'}`} />
                  </div>
                  <div className="t-mobile-card__info">
                    <span className="t-mobile-card__name">{member.fullName}</span>
                    <span className="t-mobile-card__role">{role}</span>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <div className="t-mobile-card__stats">
                  <div className="t-mobile-card__stat t-mobile-card__stat--clients">
                    <Users size={12} /> {clients} clients
                  </div>
                  <div className="t-mobile-card__stat t-mobile-card__stat--sessions">
                    <Target size={12} /> {sessions} sessions
                  </div>
                  <div className="t-mobile-card__stat t-mobile-card__stat--revenue">
                    <DollarSign size={12} /> ₹{rev.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>

      {/* === Modals === */}
      <EnhancedTrainerActionModal
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        trainer={selectedTrainer as unknown as User}
        onEditProfile={handleEditProfile}
        onUpdate={loadTrainersPaginated}
      />
      <CreateActionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('action'); return p; });
          loadTrainersPaginated();
        }}
        initialView="trainerForm"
      />
    </div>
  );
};

export default Trainers;
