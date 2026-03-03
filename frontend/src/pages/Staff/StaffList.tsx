import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiUsers, FiUserCheck, FiUser, FiUserPlus, FiSearch, FiFilter, FiRefreshCw, FiShield, FiClock, FiX, FiMessageSquare, FiTrash2, FiCheckSquare } from 'react-icons/fi';
import { showToast } from '../../utils/showToast';
import { Avatar, DataTable, type Column } from '../../components/ui';
import { ActionMenuButton } from '../../components/shared';
import { SendMessageModal, ConfirmDeleteModal, type UserActionTarget } from '../../components/shared/UserActionModals';
import { useClickOutside } from '../../hooks';
import EnhancedStaffActionModal from '../../components/StaffActionModal/EnhancedStaffActionModal';
import CreateActionModal from '../../components/CreateActionModal/CreateActionModal';
import api from '../../services/api';
import type { Staff as StaffType } from '../../types/user';
import { getOrCreateAppId } from '../../utils/appId';
import '../../styles/page-common.css';
import '../../styles/page-list-common.css';
import './StaffList.css';

type StatusFilter = 'all' | 'active' | 'inactive';


const useAutoPageSize = (headerRef: React.RefObject<HTMLElement | null>, minRows = 5, maxRows = 50) => {
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => {
    const calculate = () => {
      const headerHeight = headerRef.current?.getBoundingClientRect().bottom ?? 160;
      const available = window.innerHeight - headerHeight - 48 - 36 - 24;
      const rowH = window.innerWidth < 768 ? 80 : 44;
      setPageSize(Math.max(minRows, Math.min(maxRows, Math.floor(available / rowH))));
    };
    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [headerRef, minRows, maxRows]);
  return pageSize;
};

/* Unified status badge using pl-status */
const StaffStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toLowerCase();
  const isActive = s === 'active' || !s;
  const cls = isActive ? 'pl-status--active' : 'pl-status--inactive';
  return (
    <span className={`pl-status ${cls}`}>
      <span className="pl-status__dot" />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

const StaffList: React.FC = () => {
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all');

  // Message / Delete modals
  const [messageTarget, setMessageTarget] = useState<UserActionTarget | null>(null);
  const [messageTargets, setMessageTargets] = useState<UserActionTarget[]>([]);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserActionTarget | null>(null);
  const [deleteTargets, setDeleteTargets] = useState<UserActionTarget[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string | number>>(new Set());

  const toggleSelectMode = () => {
    setSelectMode(prev => { if (prev) setSelectedStaffIds(new Set()); return !prev; });
  };

  const openMessageSingle = (s: StaffType) => {
    setMessageTargets([]);
    setMessageTarget({ userId: s.userId, fullName: s.fullName, email: s.email, userType: 'staff' });
    setIsMsgModalOpen(true);
  };
  const openMessageBatch = (list: StaffType[]) => {
    const targets = list.filter(s => selectedStaffIds.has(s.userId))
      .map(s => ({ userId: s.userId, fullName: s.fullName, email: s.email, userType: 'staff' as const }));
    setMessageTarget(null); setMessageTargets(targets); setIsMsgModalOpen(true);
  };
  const openDeleteSingle = (s: StaffType) => {
    setDeleteTargets([]);
    setDeleteTarget({ userId: s.userId, fullName: s.fullName, email: s.email, userType: 'staff' });
    setIsDeleteModalOpen(true);
  };
  const openDeleteBatch = (list: StaffType[]) => {
    const targets = list.filter(s => selectedStaffIds.has(s.userId))
      .map(s => ({ userId: s.userId, fullName: s.fullName, email: s.email, userType: 'staff' as const }));
    setDeleteTarget(null); setDeleteTargets(targets); setIsDeleteModalOpen(true);
  };

  const headerRef = useRef<HTMLElement>(null);
  const autoPageSize = useAutoPageSize(headerRef);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [globalTotalCount, setGlobalTotalCount] = useState<number | null>(null);

  useEffect(() => { setPageSize(autoPageSize); setCurrentPage(0); }, [autoPageSize]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef as React.RefObject<HTMLElement>, () => setIsFilterOpen(false), isFilterOpen);

  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ role: '', status: '' });

  const stats = useMemo(() => {
    const activeCount = staff.filter(s => (s as any).status === 'Active' || !(s as any).status).length;
    const inactiveCount = staff.filter(s => (s as any).status === 'Inactive').length;
    const total = globalTotalCount ?? totalCount;
    return { total, activeCount, inactiveCount };
  }, [staff, totalCount, globalTotalCount]);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(t); }, [searchQuery]);

  const loadStaffPaginated = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getStaffPaginated(currentPage, pageSize, debouncedSearch || undefined);
      setStaff(response.content);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('[Staff] Failed to load paginated staff:', err);
      showToast('Failed to load staff', 'error');
      setStaff([]);
    } finally { setLoading(false); }
  }, [currentPage, pageSize, debouncedSearch]);

  const loadGlobalCount = useCallback(async () => {
    try { const r = await api.getStaffPaginated(0, 1); setGlobalTotalCount(r.totalCount); }
    catch { setGlobalTotalCount(null); }
  }, []);

  useEffect(() => { loadStaffPaginated(); }, [loadStaffPaginated]);
  useEffect(() => { loadGlobalCount(); }, [loadGlobalCount]);
  useEffect(() => { setCurrentPage(0); }, [debouncedSearch, filters, activeStatusFilter]);

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && staff.length > 0) { const m = staff.find(s => s.userId.toString() === userId); if (m) handleActionClick(m); }
  }, [searchParams, staff]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const activeFilterCount = [filters.role, filters.status].filter(Boolean).length;

  const handleResetFilters = () => { setFilters({ role: '', status: '' }); setActiveStatusFilter('all'); };
  const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));

  const handleActionClick = (member: StaffType) => { setSelectedStaff(member); setIsActionModalOpen(true); };
  const handleCloseActionModal = () => { setIsActionModalOpen(false); setSelectedStaff(null); };

  const handleEditProfile = async (member: StaffType) => {
    try {
      await api.updateStaffDetails(member.userId, { fullName: member.fullName, email: member.email, phone: member.phone });
      showToast(`Profile updated for ${member.fullName}`, 'success');
      loadStaffPaginated(); handleCloseActionModal();
    } catch (err) { console.error('Failed to update staff profile:', err); showToast('Failed to update profile', 'error'); }
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
      key: 'member', header: 'Staff Member', width: 'auto',
      render: (s) => (
        <div className="pl-user-cell" onClick={(e) => { e.stopPropagation(); handleActionClick(s); }}>
          <div className="pl-user-cell__avatar-wrap">
            <Avatar name={s.fullName} size="sm" />
            <span className={`pl-dot ${getStatus(s) === 'Active' ? 'pl-dot--active' : 'pl-dot--inactive'}`} />
          </div>
          <div className="pl-user-cell__info">
            <span className="pl-user-cell__name">{s.fullName}</span>
            <span className="pl-user-cell__sub">{(s as any).jobTitle || s.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'empId', header: 'Staff ID', width: '140px',
      render: (s) => {
        const id = getOrCreateAppId(s.userId, 'STAFF', s.createdAt);
        return <span className="app-id-badge" title={id}>{id}</span>;
      },
    },

    {
      key: 'department', header: 'Department', width: '130px',
      render: (s) => <span className="staff-dept">{(s as any).department || '—'}</span>,
    },
    {
      key: 'shift', header: 'Shift', width: '160px',
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
      key: 'status', header: 'Status', width: '100px',
      render: (s) => <StaffStatusBadge status={getStatus(s)} />,
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
      render: (s) => {
        if (selectMode) {
          const isChecked = selectedStaffIds.has(s.userId);
          return (
            <div className="pl-actions pl-actions--checkbox" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="pl-row-checkbox"
                checked={isChecked}
                onChange={() => {
                  setSelectedStaffIds(prev => {
                    const next = new Set(prev);
                    isChecked ? next.delete(s.userId) : next.add(s.userId);
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
              <button className="pl-quick-btn pl-quick-btn--indigo" onClick={(e) => { e.stopPropagation(); openMessageSingle(s); }} title="Send Message">
                <FiMessageSquare size={13} />
              </button>
              <button className="pl-quick-btn pl-quick-btn--danger" onClick={(e) => { e.stopPropagation(); openDeleteSingle(s); }} title="Delete Staff">
                <FiTrash2 size={13} />
              </button>
            </div>
            <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(s); }} />
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
          <div className="pg-header__icon"><FiShield size={18} /></div>
          <div className="pg-header__title-stack">
            <h1 className="pg-header__title">Staff Directory</h1>
            <span className="pg-header__month-badge">{stats.total} personnel</span>
          </div>
        </div>

        <div className="pg-stats">
          <button className={`pg-stat-card ${activeStatusFilter === 'all' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('all')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--total"><FiUsers size={14} /></div>
            <div className="pg-stat-card__data"><span className="pg-stat-card__value">{stats.total}</span><span className="pg-stat-card__label">Total</span></div>
          </button>
          <button className={`pg-stat-card ${activeStatusFilter === 'active' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('active')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--active"><FiUserCheck size={14} /></div>
            <div className="pg-stat-card__data"><span className="pg-stat-card__value pg-stat-card__value--green">{stats.activeCount}</span><span className="pg-stat-card__label">Active</span></div>
          </button>
          <button className={`pg-stat-card ${activeStatusFilter === 'inactive' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('inactive')}>
            <div className="pg-stat-card__icon pg-stat-card__icon--inactive"><FiUser size={14} /></div>
            <div className="pg-stat-card__data"><span className="pg-stat-card__value pg-stat-card__value--red">{stats.inactiveCount}</span><span className="pg-stat-card__label">Inactive</span></div>
          </button>
        </div>

        <div className="pg-search">
          <FiSearch className="pg-search__icon" />
          <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pg-search__input" />
          {searchQuery && <button className="pg-search__clear" onClick={() => setSearchQuery('')}><FiX size={14} /></button>}
        </div>

        <div className="pg-header__actions">
          <div className="pg-filter-wrap" ref={filterRef}>
            <button className={`pg-btn pg-btn--icon ${isFilterOpen ? 'pg-btn--active' : ''} ${activeFilterCount > 0 ? 'pg-btn--has-filter' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
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
                </div>
              </div>
            )}
          </div>
          <button className={`pg-btn pg-btn--icon ${refreshing ? 'pg-btn--spin' : ''}`} onClick={handleRefresh} title="Refresh"><FiRefreshCw size={14} /></button>
          <button className="pg-btn pg-btn--primary" onClick={() => setIsCreateModalOpen(true)}><FiUserPlus size={14} /><span>Add Staff</span></button>
        </div>
      </header>

      {/* Filter chips */}
      {activeFilterCount > 0 && (
        <div className="pg-chips">
          <button className="pg-chips__clear" onClick={handleResetFilters}>Clear All</button>
        </div>
      )}

      {/* Batch actions — shown when in select mode with selections */}
      {selectMode && selectedStaffIds.size > 0 && (
        <div className="pg-batch">
          <span className="pg-batch__count">{selectedStaffIds.size} selected</span>
          <button className="pg-batch__btn" onClick={() => openMessageBatch(filteredStaff)}>
            <FiMessageSquare size={13} /> Message
          </button>
          <button className="pg-batch__btn pg-batch__btn--danger" onClick={() => openDeleteBatch(filteredStaff)}>
            <FiTrash2 size={13} /> Delete
          </button>
          <button className="pg-batch__clear" onClick={() => setSelectedStaffIds(new Set())}>&times;</button>
        </div>
      )}

      {/* Table */}
      <div className="pg-table-wrap pl-table-wrap">
        <DataTable
          columns={columns} data={filteredStaff}
          keyExtractor={(s) => s.userId} loading={loading}
          emptyMessage={searchQuery || activeFilterCount > 0 ? 'No staff match your filters' : 'No staff found. Add your first staff member!'}
          onRowClick={(s: StaffType) => handleActionClick(s)}
          compact stickyHeader showRowNumbers
          pagination={{ currentPage, totalPages, totalCount, pageSize, onPageChange: setCurrentPage, onPageSizeChange: (size) => { setPageSize(size); setCurrentPage(0); } }}
          mobileCardRender={(s) => {
            const status = getStatus(s);
            const appId = getOrCreateAppId(s.userId, 'STAFF', s.createdAt);
            return (
              <div className="pl-mobile-card">
                <div className="pl-mobile-card__top">
                  <div className="pl-user-cell__avatar-wrap">
                    <Avatar name={s.fullName} size="md" />
                    <span className={`pl-dot ${status === 'Active' ? 'pl-dot--active' : 'pl-dot--inactive'}`} />
                  </div>
                  <div className="pl-mobile-card__info">
                    <span className="pl-mobile-card__name">{s.fullName}</span>
                    <span className="app-id-badge app-id-badge--card">{appId}</span>
                    <span className="pl-mobile-card__sub">{(s as any).jobTitle || s.email}</span>
                  </div>
                  <StaffStatusBadge status={status} />
                </div>
                <div className="pl-mobile-card__stats" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                  <div className="pl-mobile-card__stat"><span className="mobile-card__detail-label">Dept</span><span className="mobile-card__detail-value">{(s as any).department || '—'}</span></div>
                  <div className="pl-mobile-card__stat"><span className="mobile-card__detail-label">Shift</span><span className="mobile-card__detail-value">{(s as any).shiftTiming || '—'}</span></div>
                </div>
                <div className="pl-mobile-card__actions">
                  <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(s); }} />
                </div>
              </div>
            );
          }}
        />
      </div>

      <EnhancedStaffActionModal isOpen={isActionModalOpen} onClose={handleCloseActionModal} staff={selectedStaff} onEditProfile={handleEditProfile} onUpdate={loadStaffPaginated} />
      <CreateActionModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); loadStaffPaginated(); }} initialView="staffForm" />

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
        onDeleted={() => { loadStaffPaginated(); setSelectedStaffIds(new Set()); setSelectMode(false); }}
      />
    </div>
  );
};

export default StaffList;
