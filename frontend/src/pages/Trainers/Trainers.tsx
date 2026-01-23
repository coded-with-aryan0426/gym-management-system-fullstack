import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/showToast';
import { Badge, getStatusVariant, Avatar, PageStatsBar } from '../../components/ui';
import CreateActionModal from '../../components/CreateActionModal/CreateActionModal';
import { ActionMenuButton } from '../../components/shared';
import { useClickOutside } from '../../hooks';
import EnhancedTrainerActionModal from '../../components/TrainerActionModal/EnhancedTrainerActionModal';
import api from '../../services/api';
import type { User, Role, TrainerPerformance } from '../../types';
import "../../styles/pageHeader.css";
import './Trainers.css';
import { FiFilter, FiSearch, FiUserPlus, FiTrendingUp, FiUsers, FiActivity } from "react-icons/fi";
import { Plus, Search, Filter, MoreHorizontal, MessageSquare, X, Check } from "lucide-react";
import DataTable, { type Column } from "../../components/ui/DataTable";
import Editable from '../../components/editor/Editable';

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

const Trainers: React.FC = () => {
  const [trainers, setTrainers] = useState<User[]>([]);
  const [performanceData, setPerformanceData] = useState<Record<number, TrainerPerformance>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<Set<string | number>>(new Set());
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortType, setSortType] = useState<'newest' | 'alphabetical'>('newest');

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filterRef = useRef<HTMLDivElement>(null);

  useClickOutside(filterRef as React.RefObject<HTMLElement>, () => setIsFilterOpen(false), isFilterOpen);

  const [searchParams, setSearchParams] = useSearchParams();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Word limit helper
  const handleSearchChange = (value: string) => {
    const words = value.trim() === '' ? [] : value.trim().split(/\s+/)
    if (words.length <= 6) {
      setSearchQuery(value)
    }
  }

  const getWordCount = (text: string) => {
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/)
    return words.length
  }

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });

  const [globalStats, setGlobalStats] = useState<StaffStats | null>(null);
  const [globalStatsLoading, setGlobalStatsLoading] = useState(false);
  const [globalStatsError, setGlobalStatsError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadTrainersPaginated = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const response = await api.getTrainersPaginated(
          currentPage,
          pageSize,
          debouncedSearch || undefined,
          filters.role || undefined
        );
        setTrainers(response.content);
        setTotalCount(response.totalCount);
        setSortType(response.sortType as 'newest' | 'alphabetical');

        // Fetch performance data for loaded trainers
        try {
          const perfData = await api.getAllTrainersPerformance();
          setPerformanceData(perfData);
        } catch (err) {
          console.error("Failed to load trainer performance", err);
        }
      } catch {
        const allTrainers = await api.getUsers('TRAINER');
        let filtered = allTrainers;
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          filtered = filtered.filter(t =>
            t.fullName?.toLowerCase().includes(q) ||
            t.email?.toLowerCase().includes(q)
          );
        }
        if (filters.role) {
          filtered = filtered.filter(t =>
            t.roles?.some((r: Role) => r.roleName === filters.role)
          );
        }
        const start = currentPage * pageSize;
        const paged = filtered.slice(start, start + pageSize);
        setTrainers(paged);
        setTotalCount(filtered.length);
      }
    } catch (err) {
      console.error('[Trainers] Failed to load trainers:', err);
      showToast('Failed to load trainers', 'error');
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, filters.role]);

  const loadGlobalStats = useCallback(async () => {
    setGlobalStatsLoading(true);
    setGlobalStatsError(null);
    try {
      const pageSizeForStats = 200;
      const first = await api.getTrainersPaginated(0, pageSizeForStats);
      const totalPages = Math.max(1, Math.ceil(first.totalCount / pageSizeForStats));
      const all: User[] = [...(first.content || [])];

      for (let p = 1; p < totalPages; p++) {
        const resp = await api.getTrainersPaginated(p, pageSizeForStats);
        all.push(...(resp.content || []));
      }

      setGlobalStats(computeStaffStats(all));
    } catch (e: any) {
      setGlobalStats(null);
      setGlobalStatsError(e?.message || 'Failed to load stats');
    } finally {
      setGlobalStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrainersPaginated();
  }, [loadTrainersPaginated]);

  useEffect(() => {
    loadGlobalStats();
    const interval = setInterval(loadGlobalStats, 60000);
    return () => clearInterval(interval);
  }, [loadGlobalStats]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, filters]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  const activeFilterCount = [filters.role, filters.status].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilters({ role: "", status: "" });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: typeof filters) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && trainers.length > 0) {
      const trainer = trainers.find(t => t.userId.toString() === userId);
      if (trainer) {
        handleActionClick(trainer);
      }
    }
  }, [searchParams, trainers]);

  const pageStats = useMemo(() => computeStaffStats(trainers), [trainers])
  const stats = globalStats ?? pageStats

  const handleActionClick = (trainer: User) => {
    setSelectedTrainer(trainer);
    setIsActionModalOpen(true);
  };

  // --- Handlers ---

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedTrainer(null);
  };

  const handleEditProfile = async (trainer: User) => {
    // Modal already called the API - just refresh the list
    // Do NOT close modal - let user close manually
    showToast(`Profile updated for ${trainer.fullName}`, 'success');
    loadTrainersPaginated();
  };

  const columns: Column<User>[] = [
    {
      key: 'trainer',
      header: 'Trainer',
      width: 'auto',
      render: (member) => {
        const savedAvatarId = typeof window !== 'undefined'
          ? localStorage.getItem(`avatar_${member.userId} `)
          : null;
        const status = ((member as any).status || 'Active').toLowerCase();
        const isActive = status === 'active';

        return (
          <div
            className="trainer-cell"
            onClick={(e) => { e.stopPropagation(); handleActionClick(member); }}
            style={{ cursor: 'pointer' }}
          >
            <div className="trainer-cell__avatar-wrapper">
              <Avatar
                name={member.fullName}
                size="sm"
                avatarId={savedAvatarId || member.avatarId}
                userId={member.userId}
              />
              <span className={`trainer - cell__status - dot ${isActive ? 'trainer-cell__status-dot--active' : 'trainer-cell__status-dot--inactive'} `} />
            </div>
            <div className="trainer-cell__info">
              <span className="trainer-cell__name">{member.fullName}</span>
              <span className="trainer-cell__email">{member.email}</span>
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
        const roleClass = role.toLowerCase() === 'admin' ? 'trainer-role--admin' :
          role.toLowerCase() === 'manager' ? 'trainer-role--manager' : 'trainer-role--trainer';
        return (
          <span className={`trainer - role ${roleClass} `}>{role}</span>
        );
      },
    },
    {
      key: "metrics",
      header: "Performance",
      width: "180px",
      render: (member) => {
        const perf = performanceData[member.userId];
        const clients = perf?.clientCount || 0;
        const revenue = perf?.monthlyRevenue || 0;

        return (
          <div className="trainer-metrics">
            <div className="trainer-metric">
              <span className="metric-label">Clients</span>
              <span className="metric-value">{clients}</span>
            </div>
            <div className="trainer-metric-divider"></div>
            <div className="trainer-metric">
              <span className="metric-label">Revenue</span>
              <span className="metric-value text-green">
                ₹{typeof revenue === 'number' ? revenue.toLocaleString() : revenue}
              </span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '90px',
      render: (member) => {
        const status = (member as any).status || 'Active';
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: (member) => (
        <div className="trainer-actions">
          <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
        </div>
      ),
    },
  ];

  return (
    <div className="staff-page">
      {/* Header with Search and Actions */}
      <div className="staff-page__header page-header">
        <div className="staff-page__title-section page-header__title">
          <h1 className="staff-page__title">Trainers & Staff</h1>
          <div className="staff-page__sort-indicator">
            {sortType === 'newest' ? (
              <span className="sort-badge sort-badge--newest">Newest</span>
            ) : (
              <span className="sort-badge sort-badge--alpha">A → Z</span>
            )}
          </div>
        </div>

        {/* Quick Actions - Owner Centric */}
        <div className="staff-quick-actions page-header__quick">
          <button className="staff-quick-btn">
            <FiTrendingUp size={13} />
            <span>Active</span>
            <span className="staff-quick-btn__count">{stats.active}</span>
          </button>
          <button className="staff-quick-btn">
            <FiActivity size={13} />
            <span>On Leave</span>
            <span className="staff-quick-btn__count">{stats.onLeave}</span>
          </button>
          <button className="staff-quick-btn">
            <FiUsers size={13} />
            <span>Inactive</span>
            <span className="staff-quick-btn__count staff-quick-btn__count--warning">{stats.inactive}</span>
          </button>
        </div>

        <div className="staff-page__header-right page-header__actions">
          <div className="staff-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <div className={`search-word-count ${getWordCount(searchQuery) >= 6 ? 'search-word-count--limit' : ''}`} style={{ fontSize: '10px', marginLeft: '6px', whiteSpace: 'nowrap', fontWeight: 600, opacity: 0.6 }}>
              {getWordCount(searchQuery)}/6
            </div>
          </div>

          <div className="staff-filter-container" ref={filterRef}>
            <button
              className={`btn-filters ${isFilterOpen ? 'btn-filters--active' : ''} ${activeFilterCount > 0 ? 'btn-filters--has-filters' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>

            {isFilterOpen && (
              <div className="staff-filter-panel">
                <div className="filter-panel__header">
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <button className="filter-clear-btn" onClick={handleResetFilters}>
                      Clear all
                    </button>
                  )}
                </div>

                <div className="filter-panel__content">
                  <div className="filter-group">
                    <label className="filter-label">Role</label>
                    <select
                      className="filter-select"
                      value={filters.role}
                      onChange={(e) => handleFilterChange("role", e.target.value)}
                    >
                      <option value="">All Roles</option>
                      <option value="TRAINER">Trainer</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select
                      className="filter-select"
                      value={filters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="staff-action-btn" onClick={() => setIsCreateModalOpen(true)}>
            <FiUserPlus size={14} />
            <span>Add Trainer</span>
          </button>
        </div>
      </div>

      {/* Titan Batch Action Bar */}
      {selectedTrainerIds.size > 0 && (
        <div className="staff-batch-actions">
          <div className="batch-actions__info">
            <span className="batch-actions__count">{selectedTrainerIds.size} selected</span>
            <button className="batch-actions__clear" onClick={() => setSelectedTrainerIds(new Set())}>
              Clear selection
            </button>
          </div>
          <div className="batch-actions__buttons">
            <button className="batch-btn batch-btn--message" onClick={() => {
              showToast(`Messaging ${selectedTrainerIds.size} trainers`, 'success');
              setSelectedTrainerIds(new Set());
            }}>
              <span className="batch-btn__icon">✉️</span>
              Message
            </button>
            <button className="batch-btn batch-btn--export" onClick={() => {
              showToast(`Exporting ${selectedTrainerIds.size} trainers`, 'success');
              setSelectedTrainerIds(new Set());
            }}>
              <span className="batch-btn__icon">⬇️</span>
              Export
            </button>
            <button className="batch-btn batch-btn--danger" onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selectedTrainerIds.size} trainers ? `)) {
                showToast(`Deleted ${selectedTrainerIds.size} trainers`, 'success');
                setSelectedTrainerIds(new Set());
              }
            }}>
              <span className="batch-btn__icon">🗑️</span>
              Delete
            </button>
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className="staff-active-filters" style={{ display: 'flex', gap: '8px', padding: '0 16px', marginBottom: '8px' }}>
          {filters.role && (
            <span className="filter-chip">
              Role: {filters.role}
              <button onClick={() => handleFilterChange('role', '')}>×</button>
            </span>
          )}
          {filters.status && (
            <span className="filter-chip">
              Status: {filters.status}
              <button onClick={() => handleFilterChange('status', '')}>×</button>
            </span>
          )}
          <button className="filter-clear-all" onClick={() => {
            handleFilterChange('role', '');
            handleFilterChange('status', '');
          }}>Clear All</button>
        </div>
      )}

      <div className="staff-page__content page-content-with-stats">
        <Editable id="trainers-page-table" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
        <div className="staff-page__table">
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
              onPageSizeChange: (size) => {
                setPageSize(size);
                setCurrentPage(0);
              },
            }}
            mobileCardRender={(member, index) => {
              const date = member.createdAt ? new Date(member.createdAt) : new Date();
              const dateStr = `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${date.getFullYear()} `;
              const role = member.roles?.[0]?.roleName || 'TRAINER';
              return (
                <div className="mobile-card">
                  <div className="mobile-card__header">
                    <div className="mobile-card__user">
                      <Avatar name={member.fullName} size="md" />
                      <div className="mobile-card__info">
                        <span className="mobile-card__name">{member.fullName}</span>
                        <span className="mobile-card__email">{member.email}</span>
                      </div>
                    </div>
                    <div className="mobile-card__status">
                      <Badge variant={getStatusVariant('Active')}>Active</Badge>
                    </div>
                  </div>
                  <div className="mobile-card__details">
                    <div className="mobile-card__detail">
                      <span className="mobile-card__detail-label">Role</span>
                      <span className="mobile-card__detail-value">{role}</span>
                    </div>
                    <div className="mobile-card__detail">
                      <span className="mobile-card__detail-label">Employee ID</span>
                      <span className="mobile-card__detail-value">#{member.userId.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="mobile-card__detail">
                      <span className="mobile-card__detail-label">Joined</span>
                      <span className="mobile-card__detail-value">{dateStr}</span>
                    </div>
                  </div>
                  <div className="mobile-card__actions">
                    <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
                  </div>
                </div>
              )
            }}
          />
        </div>
        </Editable>

        {/* Vertical Stats Bar - Right Side */}
        <Editable id="trainers-page-stats" config={{ allowLayout: true, allowStyle: true, allowVisibility: true }}>
        <PageStatsBar
          variant="trainers"
          title="Staff"
          showProgress
          loading={globalStatsLoading && !globalStats}
          error={globalStatsError}
          activePercent={stats.utilizationRate}
          stats={[
            { key: 'total', label: 'Total', value: stats.total },
            { key: 'active', label: 'Working', value: stats.active, variant: 'active' },
            { key: 'inactive', label: 'Inactive', value: stats.inactive, variant: 'inactive' },
            { key: 'onleave', label: 'Leave', value: stats.onLeave, variant: 'warning' },
            { key: 'new', label: 'Hired', value: stats.hiredThisMonth, variant: 'new' },
          ]}
        />
        </Editable>
      </div>

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
          setIsCreateModalOpen(false)
          setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.delete('action')
            return newParams
          })
          loadTrainersPaginated()
        }}
        initialView="staffForm"
      />
    </div>
  );
};

export default Trainers;
