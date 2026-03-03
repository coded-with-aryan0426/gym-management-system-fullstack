import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiUsers, FiUserCheck, FiUserPlus, FiSearch, FiFilter, FiRefreshCw, FiShield, FiClock, FiX } from 'react-icons/fi';
import { showToast } from '../../utils/showToast';
import { Badge, getStatusVariant, Avatar, DataTable, type Column } from '../../components/ui';
import { ActionMenuButton } from '../../components/shared';
import { useClickOutside } from '../../hooks';
import EnhancedStaffActionModal from '../../components/StaffActionModal/EnhancedStaffActionModal';
import CreateActionModal from '../../components/CreateActionModal/CreateActionModal';
import api from '../../services/api';
import type { Staff as StaffType } from '../../types/user';
import '../../styles/page-common.css';
import './Staff.css';

type StatusFilter = 'all' | 'active' | 'inactive';



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

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all');

  const headerRef = useRef<HTMLElement>(null);
  const autoPageSize = useAutoPageSize(headerRef);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Sync autoPageSize → pageSize
  useEffect(() => {
    setPageSize(autoPageSize);
    setCurrentPage(0);
  }, [autoPageSize]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef as React.RefObject<HTMLElement>, () => setIsFilterOpen(false), isFilterOpen);

  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ role: '', status: '' });

  // Global stats across all pages (like Trainers page)
  const [globalTotalCount, setGlobalTotalCount] = useState<number | null>(null);

  const stats = useMemo(() => {
    const activeCount = staff.filter(s => (s as any).status === 'Active' || !(s as any).status).length;
    const inactiveCount = staff.filter(s => (s as any).status === 'Inactive').length;
    const total = globalTotalCount ?? totalCount;
    return { total, activeCount, inactiveCount };
  }, [staff, totalCount, globalTotalCount]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadStaffPaginated = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getStaffPaginated(
        currentPage, pageSize,
        debouncedSearch || undefined,
        filters.role || undefined
      );
      setStaff(response.content);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('[Staff] Failed to load paginated staff:', err);
      showToast('Failed to load staff', 'error');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, filters.role]);

  // Load total count for stat cards (unfiltered)
  const loadGlobalCount = useCallback(async () => {
    try {
      const response = await api.getStaffPaginated(0, 1);
      setGlobalTotalCount(response.totalCount);
    } catch {
      setGlobalTotalCount(null);
    }
  }, []);

  useEffect(() => { loadStaffPaginated(); }, [loadStaffPaginated]);
  useEffect(() => { loadGlobalCount(); }, [loadGlobalCount]);
  useEffect(() => { setCurrentPage(0); }, [debouncedSearch, filters, activeStatusFilter]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const activeFilterCount = [filters.role, filters.status].filter(Boolean).length;

  const handleResetFilters = () => { setFilters({ role: '', status: '' }); setActiveStatusFilter('all'); };
  const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && staff.length > 0) {
      const member = staff.find(s => s.userId.toString() === userId);
      if (member) handleActionClick(member);
    }
  }, [searchParams, staff]);

  const handleActionClick = (member: StaffType) => {
    setSelectedStaff(member);
    setIsActionModalOpen(true);
  };

  const handleCloseActionModal = () => { setIsActionModalOpen(false); setSelectedStaff(null); };

  const handleEditProfile = async (member: StaffType) => {
    try {
      await api.updateStaffDetails(member.userId, {
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
      });
      showToast(`Profile updated for ${member.fullName}`, 'success');
      loadStaffPaginated();
      handleCloseActionModal();
    } catch (err) {
      console.error('Failed to update staff profile:', err);
      showToast('Failed to update profile', 'error');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStaffPaginated(), loadGlobalCount()]);
    setTimeout(() => setRefreshing(false), 600);
  };

  const getStatus = (s: StaffType) => (s as any).status || 'Active';

  const filteredStaff = useMemo(() => {
    if (activeStatusFilter === 'all') return staff;
    return staff.filter(s => {
      const status = getStatus(s);
      if (activeStatusFilter === 'active') return status === 'Active';
      if (activeStatusFilter === 'inactive') return status === 'Inactive';
      return true;
    });
  }, [staff, activeStatusFilter]);

  const columns: Column<StaffType>[] = [
    {
      key: 'index', header: '#', width: '44px',
      render: (_, index) => <span className="staff-index">{currentPage * pageSize + index + 1}</span>,
    },
    {
      key: 'member', header: 'Staff Member', width: 'auto',
      render: (s) => (
        <div className="staff-cell" onClick={(e) => { e.stopPropagation(); handleActionClick(s); }} style={{ cursor: 'pointer' }}>
          <Avatar name={s.fullName} size="sm" userId={s.userId} />
          <div className="staff-cell__info">
            <span className="staff-name">{s.fullName}</span>
            <span className="staff-email">{(s as any).jobTitle || s.email}</span>
          </div>
        </div>
      ),
    },

    {
      key: 'department', header: 'Department', width: '130px',
      render: (s) => <span className="staff-dept">{(s as any).department || '—'}</span>,
    },
    {
      key: 'shift', header: 'Shift', width: '150px',
      render: (s) => (
        <span className="staff-shift">
          <FiClock size={12} />
          {(s as any).shiftTiming || '—'}
        </span>
      ),
    },
    {
      key: 'phone', header: 'Phone', width: '140px',
      render: (s) => <span className="staff-phone">{s.phone || '—'}</span>,
    },
    {
      key: 'empId', header: 'Emp ID', width: '90px',
      render: (s) => <span className="staff-id">{(s as any).employeeIdCode || `#${s.userId.toString().padStart(4, '0')}`}</span>,
    },
    {
      key: 'status', header: 'Status', width: '90px',
      render: (s) => {
        const status = getStatus(s);
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      key: 'actions', header: '', width: '50px',
      render: (s) => (
        <div className="staff-actions">
          <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(s); }} />
        </div>
      ),
    },
  ];

  return (
    <div className="pg-page">
      {/* === Header === */}
      <header className="pg-header pg-header--single-line" ref={headerRef}>
        {/* Title */}
        <div className="pg-header__title-group">
          <div className="pg-header__icon"><FiShield size={18} /></div>
          <div>
            <h1 className="pg-header__title">Staff Directory</h1>
            <span className="pg-header__subtitle">{stats.total} operations personnel</span>
          </div>
        </div>

        {/* Stat Cards — double as filter buttons */}
        <div className="pg-stats">
          <button
            className={`pg-stat-card ${activeStatusFilter === 'all' ? 'pg-stat-card--active' : ''}`}
            onClick={() => setActiveStatusFilter('all')}
          >
            <div className="pg-stat-card__icon pg-stat-card__icon--total"><FiUsers size={14} /></div>
            <div className="pg-stat-card__data">
              <span className="pg-stat-card__value">{stats.total}</span>
              <span className="pg-stat-card__label">Total</span>
            </div>
          </button>
          <button
            className={`pg-stat-card ${activeStatusFilter === 'active' ? 'pg-stat-card--active' : ''}`}
            onClick={() => setActiveStatusFilter('active')}
          >
            <div className="pg-stat-card__icon pg-stat-card__icon--active"><FiUserCheck size={14} /></div>
            <div className="pg-stat-card__data">
              <span className="pg-stat-card__value pg-stat-card__value--green">{stats.activeCount}</span>
              <span className="pg-stat-card__label">Active</span>
            </div>
          </button>
          <button
            className={`pg-stat-card ${activeStatusFilter === 'inactive' ? 'pg-stat-card--active' : ''}`}
            onClick={() => setActiveStatusFilter('inactive')}
          >
            <div className="pg-stat-card__icon pg-stat-card__icon--inactive"><FiUserPlus size={14} /></div>
            <div className="pg-stat-card__data">
              <span className="pg-stat-card__value pg-stat-card__value--red">{stats.inactiveCount}</span>
              <span className="pg-stat-card__label">Inactive</span>
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="pg-search">
          <FiSearch className="pg-search__icon" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pg-search__input"
          />
          {searchQuery && (
            <button className="pg-search__clear" onClick={() => setSearchQuery('')}>
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Filter + Refresh + Add */}
        <div className="pg-header__actions">
          <div className="pg-filter-wrap" ref={filterRef}>
            <button
              className={`pg-btn pg-btn--icon ${isFilterOpen ? 'pg-btn--active' : ''} ${activeFilterCount > 0 ? 'pg-btn--has-filter' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter size={14} />
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
                    <label className="pg-filter-dropdown__label">Filter disabled</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            className={`pg-btn pg-btn--icon ${refreshing ? 'pg-btn--spin' : ''}`}
            onClick={handleRefresh}
            title="Refresh"
          >
            <FiRefreshCw size={14} />
          </button>

          <button className="pg-btn pg-btn--primary" onClick={() => setIsCreateModalOpen(true)}>
            <FiUserPlus size={14} /><span>Add Staff</span>
          </button>
        </div>
      </header>

      {/* === Active Filter Chips === */}
      {activeFilterCount > 0 && (
        <div className="pg-chips">
          <button className="pg-chips__clear" onClick={handleResetFilters}>Clear All</button>
        </div>
      )}

      {/* === Table === */}
      <div className="pg-table-wrap staff-table-wrap">
        <DataTable
          columns={columns}
          data={filteredStaff}
          keyExtractor={(s) => s.userId}
          loading={loading}
          emptyMessage={searchQuery || activeFilterCount > 0 ? 'No staff match your filters' : 'No staff found. Add your first staff member!'}
          onRowClick={(s: StaffType) => handleActionClick(s)}
          compact
          stickyHeader
          pagination={{
            currentPage, totalPages, totalCount, pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => { setPageSize(size); setCurrentPage(0); },
          }}
          mobileCardRender={(s) => {
            const status = getStatus(s);
            return (
              <div className="staff-mobile-card">
                <div className="staff-mobile-card__top">
                  <Avatar name={s.fullName} size="md" userId={s.userId} />
                  <div className="staff-mobile-card__info">
                    <span className="staff-mobile-card__name">{s.fullName}</span>
                  </div>
                  <Badge variant={getStatusVariant(status)}>{status}</Badge>
                </div>
                <div className="staff-mobile-card__details">
                  {(s as any).department && (
                    <div className="staff-mobile-card__detail">
                      <span className="staff-mobile-card__detail-label">Dept</span>
                      <span className="staff-mobile-card__detail-value">{(s as any).department}</span>
                    </div>
                  )}
                  {(s as any).shiftTiming && (
                    <div className="staff-mobile-card__detail">
                      <FiClock size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
                      <span className="staff-mobile-card__detail-value">{(s as any).shiftTiming}</span>
                    </div>
                  )}
                  {(s as any).employeeIdCode && (
                    <div className="staff-mobile-card__detail">
                      <span className="staff-mobile-card__detail-label">ID</span>
                      <span className="staff-mobile-card__detail-value staff-mobile-card__detail-value--mono">{(s as any).employeeIdCode}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        />
      </div>

      <EnhancedStaffActionModal
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        staff={selectedStaff}
        onEditProfile={handleEditProfile}
        onUpdate={loadStaffPaginated}
      />

      <CreateActionModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); loadStaffPaginated(); }}
        initialView="staffForm"
      />
    </div>
  );
};

export default Staff;
