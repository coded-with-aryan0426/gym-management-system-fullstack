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
import './Trainers.css';
import {
  Search, Filter, UserPlus, TrendingUp, Users, Activity, Clock,
  Star, ChevronDown, Download, MoreHorizontal, RefreshCw, Zap,
  Award, Target, Calendar, DollarSign, BarChart3
} from 'lucide-react';
import DataTable, { type Column } from '../../components/ui/DataTable';

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

/* Mini sparkline SVG */
const MiniBar: React.FC<{ values: number[]; color: string; height?: number }> = ({ values, color, height = 20 }) => {
  const max = Math.max(...values, 1);
  const w = values.length * 5;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ display: 'block' }}>
      {values.map((v, i) => {
        const h = (v / max) * height;
        return <rect key={i} x={i * 5} y={height - h} width={3.5} height={h} rx={1} fill={color} opacity={0.7 + (i / values.length) * 0.3} />;
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

const Trainers: React.FC = () => {
  const [trainers, setTrainers] = useState<User[]>([]);
  const [performanceData, setPerformanceData] = useState<Record<number, TrainerPerformance>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<Set<string | number>>(new Set());
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortType, setSortType] = useState<'newest' | 'alphabetical'>('newest');

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

  const handleResetFilters = () => setFilters({ role: '', status: '' });
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

  // Compute aggregate performance
  const totalRevenue = useMemo(() =>
    Object.values(performanceData).reduce((s, p) => s + (p.monthlyRevenue || 0), 0), [performanceData]);
  const totalClients = useMemo(() =>
    Object.values(performanceData).reduce((s, p) => s + (p.clientCount || 0), 0), [performanceData]);
  const totalSessions = useMemo(() =>
    Object.values(performanceData).reduce((s, p) => s + (p.completedSessions || 0), 0), [performanceData]);
  const avgRating = 4.6; // placeholder until API provides this

  const kpis = [
    { key: 'total', label: 'Total Staff', value: stats.total, icon: <Users size={16} />, color: '#6366f1', change: `+${stats.hiredThisMonth} this mo` },
    { key: 'active', label: 'Active Now', value: stats.active, icon: <Zap size={16} />, color: '#10b981', change: `${stats.utilizationRate}% rate` },
    { key: 'revenue', label: 'Monthly Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <DollarSign size={16} />, color: '#f59e0b', change: 'All trainers' },
    { key: 'sessions', label: 'Sessions Done', value: totalSessions, icon: <Target size={16} />, color: '#3b82f6', change: `${totalClients} clients` },
    { key: 'rating', label: 'Avg Rating', value: avgRating.toFixed(1), icon: <Star size={16} />, color: '#ec4899', change: 'Team avg' },
  ];

  /* helper: generate fake weekly bars from performance data */
  const getSparkData = (uid: number): number[] => {
    const perf = performanceData[uid];
    if (!perf) return [1, 2, 1, 3, 2, 1, 2];
    const base = perf.completedSessions || 3;
    return [0.4, 0.6, 0.8, 0.5, 0.9, 0.7, 1].map(m => Math.round(base * m));
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
        const rating = perf ? Math.min(5, 3.5 + (perf.clientCount || 0) * 0.1) : 4.0;

        return (
          <div className="t-trainer-cell" onClick={(e) => { e.stopPropagation(); handleActionClick(member); }}>
            <div className="t-trainer-cell__avatar">
              <Avatar name={member.fullName} size="sm" avatarId={savedAvatarId || member.avatarId} userId={member.userId} />
              <span className={`t-trainer-cell__dot ${isActive ? 't-trainer-cell__dot--on' : 't-trainer-cell__dot--off'}`} />
            </div>
            <div className="t-trainer-cell__info">
              <span className="t-trainer-cell__name">{member.fullName}</span>
              <span className="t-trainer-cell__email">{member.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Role',
      width: '100px',
      render: (member) => {
        const role = member.roles?.[0]?.roleName || 'TRAINER';
        const cls = role.toLowerCase() === 'admin' ? 't-role--admin' :
          role.toLowerCase() === 'manager' ? 't-role--manager' : 't-role--trainer';
        return <span className={`t-role ${cls}`}>{role}</span>;
      },
    },
    {
      key: 'performance',
      header: 'Performance',
      width: '160px',
      render: (member) => {
        const perf = performanceData[member.userId];
        const clients = perf?.clientCount || 0;
        const sessions = perf?.completedSessions || 0;
        return (
          <div className="t-perf">
            <div className="t-perf__bars">
              <MiniBar values={getSparkData(member.userId)} color="#6366f1" />
            </div>
            <div className="t-perf__nums">
              <span className="t-perf__num"><Users size={10} /> {clients}</span>
              <span className="t-perf__num"><Target size={10} /> {sessions}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'revenue',
      header: 'Revenue',
      width: '100px',
      render: (member) => {
        const perf = performanceData[member.userId];
        const rev = perf?.monthlyRevenue || 0;
        return (
          <span className="t-revenue">
            <DollarSign size={11} />
            ₹{rev.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '85px',
      render: (member) => {
        const status = (member as any).status || 'Active';
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
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
    <div className="t-page">
      {/* === Top Bar === */}
      <header className="t-header">
        <div className="t-header__left">
          <h1 className="t-header__title">Trainers</h1>
          <span className="t-header__count">{totalCount}</span>
          {sortType === 'newest'
            ? <span className="t-sort t-sort--new">Newest</span>
            : <span className="t-sort t-sort--az">A-Z</span>
          }
        </div>

        <div className="t-header__right">
          {/* Quick stat pills */}
          <div className="t-header__pills">
            <span className="t-pill t-pill--green"><span className="t-pill__dot" style={{ background: '#10b981' }} />{stats.active} Active</span>
            <span className="t-pill t-pill--amber"><span className="t-pill__dot" style={{ background: '#f59e0b' }} />{stats.onLeave} Leave</span>
            <span className="t-pill t-pill--red"><span className="t-pill__dot" style={{ background: '#ef4444' }} />{stats.inactive} Inactive</span>
          </div>

          {/* Search */}
          <div className="t-search">
            <Search size={14} className="t-search__icon" />
            <input
              type="text"
              placeholder="Search trainers..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="t-search__input"
            />
          </div>

          {/* Filter */}
          <div className="t-filter-wrap" ref={filterRef}>
            <button
              className={`t-btn t-btn--filter ${isFilterOpen ? 't-btn--active' : ''} ${activeFilterCount > 0 ? 't-btn--has-filter' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={13} />
              {activeFilterCount > 0 && <span className="t-btn__badge">{activeFilterCount}</span>}
            </button>

            {isFilterOpen && (
              <div className="t-filter-panel">
                <div className="t-filter-panel__head">
                  <span>Filters</span>
                  {activeFilterCount > 0 && <button className="t-filter-panel__clear" onClick={handleResetFilters}>Clear</button>}
                </div>
                <div className="t-filter-panel__body">
                  <label className="t-filter-label">Role</label>
                  <select className="t-filter-select" value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                  <label className="t-filter-label">Status</label>
                  <select className="t-filter-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button className={`t-btn t-btn--icon ${refreshing ? 't-btn--spin' : ''}`} onClick={handleRefresh} title="Refresh">
            <RefreshCw size={14} />
          </button>

          <button className="t-btn t-btn--primary" onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus size={14} />
            <span>Add Trainer</span>
          </button>
        </div>
      </header>

      {/* === Active Filter Chips === */}
      {activeFilterCount > 0 && (
        <div className="t-chips">
          {filters.role && <span className="t-chip">Role: {filters.role}<button onClick={() => handleFilterChange('role', '')}>×</button></span>}
          {filters.status && <span className="t-chip">Status: {filters.status}<button onClick={() => handleFilterChange('status', '')}>×</button></span>}
          <button className="t-chip-clear" onClick={handleResetFilters}>Clear All</button>
        </div>
      )}

      {/* === KPI Cards === */}
      <div className="t-kpis">
        {kpis.map(kpi => (
          <div key={kpi.key} className="t-kpi" style={{ '--kpi-color': kpi.color } as React.CSSProperties}>
            <div className="t-kpi__icon">{kpi.icon}</div>
            <div className="t-kpi__body">
              <span className="t-kpi__value">{kpi.value}</span>
              <span className="t-kpi__label">{kpi.label}</span>
            </div>
            <span className="t-kpi__change">{kpi.change}</span>
          </div>
        ))}
      </div>

      {/* === Batch Actions === */}
      {selectedTrainerIds.size > 0 && (
        <div className="t-batch">
          <span className="t-batch__count">{selectedTrainerIds.size} selected</span>
          <button className="t-batch__btn" onClick={() => { showToast(`Messaging ${selectedTrainerIds.size} trainers`, 'success'); setSelectedTrainerIds(new Set()); }}>Message</button>
          <button className="t-batch__btn" onClick={() => { showToast(`Exporting ${selectedTrainerIds.size} trainers`, 'success'); setSelectedTrainerIds(new Set()); }}>Export</button>
          <button className="t-batch__btn t-batch__btn--danger" onClick={() => { if (window.confirm(`Delete ${selectedTrainerIds.size} trainers?`)) { showToast(`Deleted`, 'success'); setSelectedTrainerIds(new Set()); } }}>Delete</button>
          <button className="t-batch__clear" onClick={() => setSelectedTrainerIds(new Set())}>×</button>
        </div>
      )}

      {/* === Table === */}
      <div className="t-table-wrap">
        <DataTable
          columns={columns}
          data={trainers}
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
            return (
              <div className="t-mobile-card">
                <div className="t-mobile-card__top">
                  <Avatar name={member.fullName} size="md" />
                  <div className="t-mobile-card__info">
                    <span className="t-mobile-card__name">{member.fullName}</span>
                    <span className="t-mobile-card__role">{role}</span>
                  </div>
                  <Badge variant={getStatusVariant((member as any).status || 'Active')}>{(member as any).status || 'Active'}</Badge>
                </div>
                <div className="t-mobile-card__stats">
                  <div className="t-mobile-card__stat">
                    <Users size={12} /> {perf?.clientCount || 0} clients
                  </div>
                  <div className="t-mobile-card__stat">
                    <DollarSign size={12} /> ₹{(perf?.monthlyRevenue || 0).toLocaleString()}
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
        initialView="staffForm"
      />
    </div>
  );
};

export default Trainers;
