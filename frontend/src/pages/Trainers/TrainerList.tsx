import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { showToast } from '../../utils/showToast';
import { Avatar } from '../../components/ui';
import CreateActionModal from '../../components/CreateActionModal/CreateActionModal';
import { ActionMenuButton } from '../../components/shared';
import { SendMessageModal, ConfirmDeleteModal, type UserActionTarget } from '../../components/shared/UserActionModals';
import { useClickOutside } from '../../hooks';
import EnhancedTrainerActionModal from '../../components/TrainerActionModal/EnhancedTrainerActionModal';
import api from '../../services/api';
import type { User, Role, TrainerPerformance } from '../../types';
import '../../styles/page-common.css';
import '../../styles/page-list-common.css';
import './TrainerList.css';
import {
  Search, Filter, UserPlus, Users, RefreshCw,
    Star, Target, DollarSign, UserCheck, AlertTriangle, UserX, Percent, X,
    Mail, MessageSquare, Trash2
} from 'lucide-react';
import DataTable, { type Column } from '../../components/ui/DataTable';
import { getOrCreateAppId } from '../../utils/appId';

type StatusFilter = 'all' | 'active' | 'inactive' | 'onLeave';

type StaffStats = {
  total: number; active: number; inactive: number; onLeave: number;
  hiredThisMonth: number; utilizationRate: number;
};

const computeStaffStats = (list: User[]): StaffStats => {
  const active = list.filter(t => (t as any).status?.toLowerCase() === 'active' || !(t as any).status).length;
  const inactive = list.filter(t => (t as any).status?.toLowerCase() === 'inactive').length;
  const onLeave = list.filter(t => { const s = (t as any).status?.toLowerCase(); return s==='on_leave'||s==='leave'; }).length;
  const now = new Date(); const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const hiredThisMonth = list.filter(t => { const d = (t as any).joinDate||(t as any).createdAt; return d && new Date(d) >= startOfMonth; }).length;
  const utilizationRate = list.length > 0 ? Math.round((active/list.length)*100) : 100;
  return { total: list.length, active, inactive, onLeave, hiredThisMonth, utilizationRate };
};

/* Mini sparkline SVG */
const MiniBar: React.FC<{ values: number[]; color: string; height?: number }> = ({ values, color, height = 24 }) => {
  const max = Math.max(...values, 1);
  const w = values.length * 6;
  const id = `grad-${color.replace('#','')}`;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ display:'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {values.map((v, i) => { const h = (v/max)*height; return <rect key={i} x={i*6} y={height-h} width={4} height={h} rx={2} fill={`url(#${id})`} opacity={0.6+(i/values.length)*0.4} />; })}
    </svg>
  );
};

/* Rating stars */
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating); const half = rating - full >= 0.5;
  return (
    <span className="t-rating">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={11}
          fill={i < full ? '#f59e0b' : i===full&&half ? 'url(#half)' : 'none'}
          stroke={i < full || (i===full&&half) ? '#f59e0b' : 'var(--text-tertiary)'}
          strokeWidth={1.5}
        />
      ))}
      <span className="t-rating__value">{rating.toFixed(1)}</span>
    </span>
  );
};

/* Auto page size */
const useAutoPageSize = (headerRef: React.RefObject<HTMLElement | null>, minRows = 5, maxRows = 50) => {
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => {
    const calculate = () => {
      const headerHeight = headerRef.current?.getBoundingClientRect().bottom ?? 160;
      const available = window.innerHeight - headerHeight - 48 - 36 - 24;
      const rowH = window.innerWidth < 768 ? 80 : 44;
      setPageSize(Math.max(minRows, Math.min(maxRows, Math.floor(available/rowH))));
    };
    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [headerRef, minRows, maxRows]);
  return pageSize;
};

/* Status badge using pl-status */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toLowerCase();
  const isActive = s === 'active' || !s;
  const isLeave = s === 'on_leave' || s === 'leave';
  const cls = isActive ? 'pl-status--active' : isLeave ? 'pl-status--leave' : 'pl-status--inactive';
  const label = isActive ? 'Active' : isLeave ? 'On Leave' : 'Inactive';
  return (
    <span className={`pl-status ${cls}`}>
      <span className="pl-status__dot" />
      {label}
    </span>
  );
};

const TrainerList: React.FC = () => {
  const [trainers, setTrainers] = useState<User[]>([]);
  const [performanceData, setPerformanceData] = useState<Record<number, TrainerPerformance>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all');

  // Select mode + modals
  const [selectMode, setSelectMode] = useState(false);
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<Set<string | number>>(new Set());
  const [messageTarget, setMessageTarget] = useState<UserActionTarget | null>(null);
  const [messageTargets, setMessageTargets] = useState<UserActionTarget[]>([]);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserActionTarget | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<UserActionTarget[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openMessageSingle = (t: User) => {
    setMessageTargets([]);
    setMessageTarget({ userId: t.userId, fullName: t.fullName, email: t.email, userType: 'trainer' });
    setIsMsgModalOpen(true);
  };
  const openMessageBatch = (list: User[]) => {
    const targets = list.filter(t => selectedTrainerIds.has(t.userId))
      .map(t => ({ userId: t.userId, fullName: t.fullName, email: t.email, userType: 'trainer' as const }));
    setMessageTarget(null); setMessageTargets(targets); setIsMsgModalOpen(true);
  };
  const openDeleteSingle = (t: User) => {
    setDeleteTargets([]);
    setDeleteTarget({ userId: t.userId, fullName: t.fullName, email: t.email, userType: 'trainer' });
    setIsDeleteModalOpen(true);
  };
  const openDeleteBatch = (list: User[]) => {
    const targets = list.filter(t => selectedTrainerIds.has(t.userId))
      .map(t => ({ userId: t.userId, fullName: t.fullName, email: t.email, userType: 'trainer' as const }));
    setDeleteTarget(null); setDeleteTargets(targets); setIsDeleteModalOpen(true);
  };
  const toggleSelectMode = () => {
    setSelectMode(prev => { if (prev) setSelectedTrainerIds(new Set()); return !prev; });
  };

  const headerRef = useRef<HTMLElement>(null);
  const autoPageSize = useAutoPageSize(headerRef);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => { setPageSize(autoPageSize); setCurrentPage(0); }, [autoPageSize]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef as React.RefObject<HTMLElement>, () => setIsFilterOpen(false), isFilterOpen);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [globalStats, setGlobalStats] = useState<StaffStats | null>(null);
  const [globalStatsLoading, setGlobalStatsLoading] = useState(false);

  const handleSearchChange = (value: string) => {
    if (value.trim().split(/\s+/).length <= 6) setSearchQuery(value);
  };

  useEffect(() => { if (searchParams.get('action') === 'create') setIsCreateModalOpen(true); }, [searchParams]);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(t); }, [searchQuery]);

  const loadTrainersPaginated = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const response = await api.getTrainersPaginated(currentPage, pageSize, debouncedSearch||undefined, filters.role||undefined);
        setTrainers(response.content);
        setTotalCount(response.totalCount);
        try { const perf = await api.getAllTrainersPerformance(); setPerformanceData(perf); } catch { /* ignore */ }
      } catch {
        const all = await api.getUsers('TRAINER');
        let filtered = all;
        if (debouncedSearch) { const q = debouncedSearch.toLowerCase(); filtered = filtered.filter(t => t.fullName?.toLowerCase().includes(q)||t.email?.toLowerCase().includes(q)); }
        if (filters.role) filtered = filtered.filter(t => t.roles?.some((r: Role) => r.roleName === filters.role));
        const start = currentPage * pageSize;
        setTrainers(filtered.slice(start, start+pageSize));
        setTotalCount(filtered.length);
      }
    } catch (err) {
      console.error('[Trainers] Failed to load:', err);
      showToast('Failed to load trainers', 'error');
      setTrainers([]);
    } finally { setLoading(false); }
  }, [currentPage, pageSize, debouncedSearch, filters.role]);

  const loadGlobalStats = useCallback(async () => {
    setGlobalStatsLoading(true);
    try {
      const first = await api.getTrainersPaginated(0, 200);
      const totalP = Math.max(1, Math.ceil(first.totalCount / 200));
      const all: User[] = [...(first.content||[])];
      for (let p = 1; p < totalP; p++) { const r = await api.getTrainersPaginated(p, 200); all.push(...(r.content||[])); }
      setGlobalStats(computeStaffStats(all));
    } catch { setGlobalStats(null); } finally { setGlobalStatsLoading(false); }
  }, []);

  useEffect(() => { loadTrainersPaginated(); }, [loadTrainersPaginated]);
  useEffect(() => { loadGlobalStats(); const iv = setInterval(loadGlobalStats, 60000); return () => clearInterval(iv); }, [loadGlobalStats]);
  useEffect(() => { setCurrentPage(0); }, [debouncedSearch, filters]);

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && trainers.length > 0) { const t = trainers.find(t => t.userId.toString()===userId); if (t) handleActionClick(t); }
  }, [searchParams, trainers]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const activeFilterCount = [filters.role, filters.status].filter(Boolean).length;
  const pageStats = useMemo(() => computeStaffStats(trainers), [trainers]);
  const stats = globalStats ?? pageStats;

  const handleActionClick = (trainer: User) => { setSelectedTrainer(trainer); setIsActionModalOpen(true); };
  const handleCloseActionModal = () => { setIsActionModalOpen(false); setSelectedTrainer(null); };
  const handleEditProfile = async (trainer: User) => { showToast(`Profile updated for ${trainer.fullName}`, 'success'); loadTrainersPaginated(); };
  const handleResetFilters = () => { setFilters({ role: '', status: '' }); setActiveStatusFilter('all'); };
  const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleRefresh = async () => { setRefreshing(true); await Promise.all([loadTrainersPaginated(), loadGlobalStats()]); setTimeout(() => setRefreshing(false), 600); };

  const filteredTrainers = useMemo(() => {
    if (activeStatusFilter === 'all') return trainers;
    return trainers.filter(t => {
      const status = ((t as any).status || 'active').toLowerCase();
      switch (activeStatusFilter) {
        case 'active': return status==='active'||!status;
        case 'inactive': return status==='inactive';
        case 'onLeave': return status==='on_leave'||status==='leave';
        default: return true;
      }
    });
  }, [trainers, activeStatusFilter]);

  const getSparkData = (uid: number): number[] => {
    const perf = performanceData[uid];
    if (!perf) return [0,0,0,0,0,0,0];
    const completed = perf.completedSessions||0, cancelled = perf.cancelledSessions||0;
    const rating = (perf.avgRating||0)*2, revenue = Math.min((perf.revenue||0)/1000, 10);
    const clients = perf.activeClients||0, total = completed+cancelled;
    const successRate = total > 0 ? Math.round((completed/total)*10) : 0;
    return [completed, clients, Math.round(rating), Math.round(revenue), successRate, cancelled, completed];
  };

  /* Role pill using pl-role */

  const columns: Column<User>[] = [
    {
      key: 'trainer', header: 'Trainer', width: 'auto',
      render: (member) => {
        const savedAvatarId = typeof window !== 'undefined' ? localStorage.getItem(`avatar_${member.userId}`) : null;
        const status = ((member as any).status || 'Active').toLowerCase();
        const isActive = status === 'active';
        return (
          <div className="pl-user-cell" onClick={(e) => { e.stopPropagation(); handleActionClick(member); }}>
            <div className="pl-user-cell__avatar-wrap">
              <Avatar name={member.fullName} size="sm" avatarId={savedAvatarId||member.avatarId} userId={member.userId} />
              <span className={`pl-dot ${isActive ? 'pl-dot--active' : 'pl-dot--inactive'}`} />
            </div>
            <div className="pl-user-cell__info">
              <span className="pl-user-cell__name">{member.fullName}</span>
              <span className="pl-user-cell__sub"><Mail size={9} style={{display:'inline',marginRight:3}} />{member.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'trainerId', header: 'Trainer ID', width: '140px',
      render: (member) => {
        const id = getOrCreateAppId(member.userId, 'TRAINER', member.createdAt);
        return <span className="app-id-badge" title={id}>{id}</span>;
      },
    },
      {
        key: 'role', header: 'Type', width: '140px',
          render: (member) => {
            const jobTitle = (member as any).jobTitle || '';
            const typeMap: Record<string, { label: string; color: string; icon: string }> = {
              'gym trainer':      { label: 'Gym Trainer',      color: '#3b82f6', icon: '🏋️' },
              'personal trainer': { label: 'Personal Trainer', color: '#8b5cf6', icon: '🎯' },
              'member manager':   { label: 'Member Manager',   color: '#ec4899', icon: '👥' },
            };
            const key = jobTitle.toLowerCase();
            const type = typeMap[key] || (jobTitle
              ? { label: jobTitle, color: '#6366f1', icon: '✏️' }
              : { label: 'Gym Trainer', color: '#3b82f6', icon: '🏋️' });
            return (
              <span className="t-type-badge" style={{ '--type-color': type.color } as React.CSSProperties}>
                <span className="t-type-badge__icon">{type.icon}</span>
                {type.label}
              </span>
            );
          },
        },
    {
      key: 'performance', header: 'Performance', width: '170px',
      render: (member) => {
        const perf = performanceData[member.userId];
        const clients = perf?.clientCount||0, sessions = perf?.completedSessions||0;
          return (
            <div className="t-perf">
              <div className="t-perf__data">
                <div className="t-perf__row"><Users size={10} className="t-perf__icon t-perf__icon--clients" /><span className="t-perf__val">{clients}</span><span className="t-perf__label">clients</span></div>
                <div className="t-perf__row"><Target size={10} className="t-perf__icon t-perf__icon--sessions" /><span className="t-perf__val">{sessions}</span><span className="t-perf__label">sessions</span></div>
              </div>
            </div>
          );
      },
    },
    {
      key: 'revenue', header: 'Revenue', width: '110px',
      render: (member) => {
        const rev = performanceData[member.userId]?.monthlyRevenue || 0;
        return (
          <div className="t-revenue-cell">
            <span className="t-revenue-cell__amount"><DollarSign size={12} />₹{rev.toLocaleString()}</span>
            <span className="t-revenue-cell__period">this month</span>
          </div>
        );
      },
    },
    {
      key: 'status', header: 'Status', width: '100px',
      render: (member) => <StatusBadge status={(member as any).status||'Active'} />,
    },
      {
        key: 'actions',
        header: (
          <button
            className={`dt-select-toggle-btn${selectMode ? ' dt-select-toggle-btn--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleSelectMode(); }}
            title={selectMode ? 'Exit selection mode' : 'Select rows'}
          >
            {selectMode ? '✕ Done' : '☑ Select'}
          </button>
        ),
        width: '90px',
        render: (member) => {
          if (selectMode) {
            const isChecked = selectedTrainerIds.has(member.userId);
            return (
              <div className="pl-actions pl-actions--checkbox" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="pl-row-checkbox"
                  checked={isChecked}
                  onChange={() => {
                    setSelectedTrainerIds(prev => {
                      const next = new Set(prev);
                      isChecked ? next.delete(member.userId) : next.add(member.userId);
                      return next;
                    });
                  }}
                />
              </div>
            );
          }
          return (
            <div className="pl-actions">
              <div className="pl-quick-actions">
                <button className="pl-quick-btn pl-quick-btn--indigo" onClick={(e) => { e.stopPropagation(); openMessageSingle(member); }} title="Send Message">
                  <MessageSquare size={13} />
                </button>
                <button className="pl-quick-btn pl-quick-btn--danger" onClick={(e) => { e.stopPropagation(); openDeleteSingle(member); }} title="Delete Trainer">
                  <Trash2 size={13} />
                </button>
              </div>
              <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
            </div>
          );
        },
      },
    ];

  return (
    <div className="pg-page">
      {/* ── Single-line header ── */}
      <header className="pg-header pg-header--single-line" ref={headerRef}>

        <div className="pg-header__title-group">
          <div className="pg-header__icon t-header-icon"><Users size={18} /></div>
          <div className="pg-header__title-stack">
            <h1 className="pg-header__title">Trainers</h1>
            <span className="pg-header__month-badge">+{stats.hiredThisMonth} this month</span>
          </div>
        </div>

        <div className="pg-stats">
          <button className={`pg-stat-card t-stat-card ${activeStatusFilter==='all' ? 'pg-stat-card--active t-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('all')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--total"><Users size={14} /></div>
            <div className="pg-stat-card__data"><span className="pg-stat-card__value">{stats.total}</span><span className="pg-stat-card__label">Total</span></div>
          </button>
          <button className={`pg-stat-card t-stat-card ${activeStatusFilter==='active' ? 'pg-stat-card--active t-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('active')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--active"><UserCheck size={14} /></div>
            <div className="pg-stat-card__data"><span className="pg-stat-card__value pg-stat-card__value--green">{stats.active}</span><span className="pg-stat-card__label">Active</span></div>
          </button>
          <button className={`pg-stat-card t-stat-card ${activeStatusFilter==='onLeave' ? 'pg-stat-card--active t-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('onLeave')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--expiring"><AlertTriangle size={14} /></div>
            <div className="pg-stat-card__data"><span className="pg-stat-card__value pg-stat-card__value--amber">{stats.onLeave}</span><span className="pg-stat-card__label">On Leave</span></div>
            {stats.onLeave > 0 && <span className="pg-stat-card__pulse" />}
          </button>
          <button className={`pg-stat-card t-stat-card ${activeStatusFilter==='inactive' ? 'pg-stat-card--active t-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('inactive')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--inactive"><UserX size={14} /></div>
            <div className="pg-stat-card__data"><span className="pg-stat-card__value pg-stat-card__value--red">{stats.inactive}</span><span className="pg-stat-card__label">Inactive</span></div>
          </button>
          <div className="pg-stat-card pg-stat-card--no-click t-stat-card">
            <div className="pg-stat-card__icon pg-stat-card__icon--special"><Percent size={14} /></div>
            <div className="pg-stat-card__data"><span className="pg-stat-card__value pg-stat-card__value--indigo">{stats.utilizationRate}%</span><span className="pg-stat-card__label">Utilization</span></div>
          </div>
        </div>

        <div className="pg-search t-search">
          <Search size={14} className="pg-search__icon" />
          <input type="text" placeholder="Search trainers..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="pg-search__input" />
          {searchQuery && <button className="pg-search__clear" onClick={() => setSearchQuery('')}><X size={14} /></button>}
        </div>

        <div className="pg-filter-wrap" ref={filterRef}>
          <button className={`pg-btn pg-btn--icon ${isFilterOpen ? 'pg-btn--active' : ''} ${activeFilterCount > 0 ? 'pg-btn--has-filter' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
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
                    <option value="">All Roles</option><option value="TRAINER">Trainer</option><option value="ADMIN">Admin</option><option value="MANAGER">Manager</option>
                  </select>
                </div>
                <div className="pg-filter-dropdown__row">
                  <label className="pg-filter-dropdown__label">Status</label>
                  <select className="pg-filter-dropdown__select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                    <option value="">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

          <button className={`pg-btn pg-btn--icon ${refreshing ? 'pg-btn--spin' : ''}`} onClick={handleRefresh} title="Refresh"><RefreshCw size={14} /></button>

          <div className="pg-header__actions">
            <button className="pg-btn pg-btn--primary t-btn-add" onClick={() => setIsCreateModalOpen(true)}><UserPlus size={14} /><span>Add Trainer</span></button>
          </div>
        </header>

        {/* Filter chips */}
        {activeFilterCount > 0 && (
          <div className="pg-chips">
            {filters.role && <span className="pg-chip">Role: {filters.role}<button onClick={() => handleFilterChange('role', '')}>&times;</button></span>}
            {filters.status && <span className="pg-chip">Status: {filters.status}<button onClick={() => handleFilterChange('status', '')}>&times;</button></span>}
            <button className="pg-chips__clear" onClick={handleResetFilters}>Clear All</button>
          </div>
        )}

        {/* Batch actions */}
        {selectMode && selectedTrainerIds.size > 0 && (
          <div className="pg-batch">
            <span className="pg-batch__count">{selectedTrainerIds.size} selected</span>
            <button className="pg-batch__btn" onClick={() => openMessageBatch(filteredTrainers)}>
              <MessageSquare size={13} /> Message
            </button>
            <button className="pg-batch__btn pg-batch__btn--danger" onClick={() => openDeleteBatch(filteredTrainers)}>
              <Trash2 size={13} /> Delete
            </button>
            <button className="pg-batch__clear" onClick={() => setSelectedTrainerIds(new Set())}>&times;</button>
          </div>
        )}

        {/* Table */}
        <div className="pg-table-wrap pl-table-wrap t-table-wrap">
          <DataTable
            columns={columns} data={filteredTrainers}
              keyExtractor={(t) => t.userId} loading={loading}
              emptyMessage="No trainers found" onRowClick={handleActionClick}
                compact stickyHeader showRowNumbers
                pagination={{ currentPage, totalPages, totalCount, pageSize, onPageChange: setCurrentPage, onPageSizeChange: (size) => { setPageSize(size); setCurrentPage(0); } }}
            mobileCardRender={(member) => {
              const role = member.roles?.[0]?.roleName || 'TRAINER';
              const perf = performanceData[member.userId];
              const status = (member as any).status || 'Active';
              const rev = perf?.monthlyRevenue||0, clients = perf?.clientCount||0, sessions = perf?.completedSessions||0;
              const savedAvatarId = typeof window !== 'undefined' ? localStorage.getItem(`avatar_${member.userId}`) : null;
              const appId = getOrCreateAppId(member.userId, 'TRAINER', member.createdAt);
              const isActive = status.toLowerCase() === 'active';
              return (
                <div className="pl-mobile-card">
                  <div className="pl-mobile-card__top">
                    <div className="pl-user-cell__avatar-wrap">
                      <Avatar name={member.fullName} size="md" avatarId={savedAvatarId||member.avatarId} userId={member.userId} />
                      <span className={`pl-dot ${isActive ? 'pl-dot--active' : 'pl-dot--inactive'}`} />
                    </div>
                    <div className="pl-mobile-card__info">
                      <span className="pl-mobile-card__name">{member.fullName}</span>
                      <span className="app-id-badge app-id-badge--card">{appId}</span>
                      <span className="pl-mobile-card__sub">{role}</span>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="pl-mobile-card__stats">
                    <div className="pl-mobile-card__stat" style={{ '--stat-color': '#818cf8' } as React.CSSProperties}><Users size={12} /> {clients} clients</div>
                    <div className="pl-mobile-card__stat" style={{ '--stat-color': '#f59e0b' } as React.CSSProperties}><Target size={12} /> {sessions} sessions</div>
                    <div className="pl-mobile-card__stat" style={{ '--stat-color': '#34d399', color:'#34d399' } as React.CSSProperties}><DollarSign size={12} /> ₹{rev.toLocaleString()}</div>
                  </div>
                  <div className="pl-mobile-card__actions">
                    <button className="pl-mobile-card__action" onClick={(e) => { e.stopPropagation(); openMessageSingle(member); }}><MessageSquare size={14} />Message</button>
                  </div>
                </div>
              );
            }}
          />
        </div>

        {/* Modals */}
        <EnhancedTrainerActionModal isOpen={isActionModalOpen} onClose={handleCloseActionModal} trainer={selectedTrainer as unknown as User} onEditProfile={handleEditProfile} onUpdate={loadTrainersPaginated} />
        <CreateActionModal
          isOpen={isCreateModalOpen}
          onClose={() => { setIsCreateModalOpen(false); setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('action'); return p; }); loadTrainersPaginated(); }}
          initialView="trainerForm"
        />

        <SendMessageModal
          isOpen={isMsgModalOpen}
          onClose={() => setIsMsgModalOpen(false)}
          target={messageTarget}
          targets={messageTargets.length > 0 ? messageTargets : undefined}
        />
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          target={deleteTarget}
          targets={deleteTargets.length > 0 ? deleteTargets : undefined}
          onDeleted={() => { loadTrainersPaginated(); setSelectedTrainerIds(new Set()); setSelectMode(false); }}
        />
      </div>
    );
  };

  export default TrainerList;
