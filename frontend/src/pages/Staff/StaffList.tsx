import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiUserCheck, FiUser, FiUserPlus, FiSearch, FiFilter, FiRefreshCw, FiShield, FiClock } from 'react-icons/fi';
import { showToast } from '../../utils/showToast';
import { Badge, getStatusVariant, Avatar, DataTable, type Column, Button } from '../../components/ui';
import { ActionMenuButton } from '../../components/shared';
import { useClickOutside } from '../../hooks';
import EnhancedStaffActionModal from '../../components/StaffActionModal/EnhancedStaffActionModal';
import CreateActionModal from '../../components/CreateActionModal/CreateActionModal';
import api from '../../services/api';
import type { Staff as StaffType } from '../../types/user';
import './StaffList.css';

type StatusFilter = 'all' | 'active' | 'inactive';

const ROLE_LABELS: Record<string, string> = {
  RECEPTIONIST: 'Receptionist', FLOOR_MANAGER: 'Floor Manager', MAINTENANCE: 'Maintenance',
  CLEANING: 'Housekeeping', OPERATIONS: 'Operations', SALES: 'Sales',
  ADMIN: 'Admin', MANAGER: 'Manager', STAFF: 'Staff',
};

const ROLE_COLORS: Record<string, string> = {
  RECEPTIONIST: '#3b82f6', FLOOR_MANAGER: '#8b5cf6', MAINTENANCE: '#f59e0b',
  CLEANING: '#10b981', OPERATIONS: '#6366f1', SALES: '#ec4899',
  ADMIN: '#ef4444', MANAGER: '#f97316', STAFF: '#6b7280',
};

const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filterRef = useRef<HTMLDivElement>(null);
  useClickOutside(filterRef as React.RefObject<HTMLElement>, () => setIsFilterOpen(false), isFilterOpen);

  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ role: "", status: "" });

  const stats = useMemo(() => {
    const activeCount = staff.filter(s => (s as any).status === 'Active' || !(s as any).status).length;
    const inactiveCount = staff.filter(s => (s as any).status === 'Inactive').length;
    return { total: totalCount, activeCount, inactiveCount };
  }, [staff, totalCount]);

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

  useEffect(() => { loadStaffPaginated(); }, [loadStaffPaginated]);
  useEffect(() => { setCurrentPage(0); }, [debouncedSearch, filters, activeStatusFilter]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const activeFilterCount = [filters.role, filters.status].filter(Boolean).length;

  const handleResetFilters = () => { setFilters({ role: "", status: "" }); setActiveStatusFilter('all'); };
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
          <Avatar name={s.fullName} size="md" />
          <div className="staff-cell__info">
            <span className="staff-name">{s.fullName}</span>
            <span className="staff-email">{(s as any).jobTitle || s.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role', header: 'Role', width: '130px',
      render: (s) => {
        const role = (s as any).staffRole || 'STAFF';
        return (
          <span className="staff-role-pill" style={{ '--role-color': ROLE_COLORS[role] || '#6b7280' } as React.CSSProperties}>
            {ROLE_LABELS[role] || role}
          </span>
        );
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
      <header className="pg-header">
        <div className="pg-header__row-1">
          <div className="pg-header__title-group">
            <div className="pg-header__icon"><FiShield size={18} /></div>
            <div>
              <h1 className="pg-header__title">Staff Directory</h1>
              <span className="pg-header__subtitle">{stats.total} gym operations personnel</span>
            </div>
          </div>

          <div className="pg-stats">
            <button className={`pg-stat-card ${activeStatusFilter === 'all' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('all')}>
              <div className="pg-stat-card__icon pg-stat-card__icon--total"><FiUsers size={14} /></div>
              <div className="pg-stat-card__data">
                <span className="pg-stat-card__value">{stats.total}</span>
                <span className="pg-stat-card__label">Total</span>
              </div>
            </button>
            <button className={`pg-stat-card ${activeStatusFilter === 'active' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('active')}>
              <div className="pg-stat-card__icon pg-stat-card__icon--active"><FiUserCheck size={14} /></div>
              <div className="pg-stat-card__data">
                <span className="pg-stat-card__value pg-stat-card__value--green">{stats.activeCount}</span>
                <span className="pg-stat-card__label">Active</span>
              </div>
            </button>
            <button className={`pg-stat-card ${activeStatusFilter === 'inactive' ? 'pg-stat-card--active' : ''}`} onClick={() => setActiveStatusFilter('inactive')}>
              <div className="pg-stat-card__icon pg-stat-card__icon--inactive"><FiUser size={14} /></div>
              <div className="pg-stat-card__data">
                <span className="pg-stat-card__value pg-stat-card__value--red">{stats.inactiveCount}</span>
                <span className="pg-stat-card__label">Inactive</span>
              </div>
            </button>
          </div>

          <div className="pg-header__actions">
            <button className="pg-btn pg-btn--primary" onClick={() => setIsCreateModalOpen(true)}>
              <FiUserPlus size={14} /><span>Add Staff</span>
            </button>
          </div>
        </div>

        <div className="pg-header__row-2">
          <div className="pg-tabs">
            <button className={`pg-tab ${activeStatusFilter === 'all' ? 'pg-tab--active' : ''}`} onClick={() => setActiveStatusFilter('all')}>
              All<span className="pg-tab__count">{stats.total}</span>
            </button>
            <button className={`pg-tab ${activeStatusFilter === 'active' ? 'pg-tab--active' : ''}`} onClick={() => setActiveStatusFilter('active')}>
              Active<span className="pg-tab__count pg-tab__count--active">{stats.activeCount}</span>
            </button>
            <button className={`pg-tab ${activeStatusFilter === 'inactive' ? 'pg-tab--active' : ''}`} onClick={() => setActiveStatusFilter('inactive')}>
              Inactive<span className="pg-tab__count pg-tab__count--muted">{stats.inactiveCount}</span>
            </button>
          </div>

          <div className="pg-header__right">
            <div className="pg-search">
              <FiSearch className="pg-search__icon" />
              <input type="text" placeholder="Search by name, job title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pg-search__input" />
              {searchQuery && <button className="pg-search__clear" onClick={() => setSearchQuery('')}>&times;</button>}
            </div>

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
                    <div className="pg-filter-dropdown__row">
                      <label className="pg-filter-dropdown__label">Department</label>
                      <select className="pg-filter-dropdown__select" value={filters.role} onChange={(e) => handleFilterChange("role", e.target.value)}>
                        <option value="">All Departments</option>
                        <option value="RECEPTIONIST">Reception</option>
                        <option value="FLOOR_MANAGER">Floor Management</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="CLEANING">Housekeeping</option>
                        <option value="OPERATIONS">Operations</option>
                        <option value="SALES">Sales</option>
                        <option value="ADMIN">Administration</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="pg-btn pg-btn--icon" onClick={() => loadStaffPaginated()} title="Refresh">
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      {activeFilterCount > 0 && (
        <div className="pg-chips">
          {filters.role && (
            <span className="pg-chip">
              Dept: {ROLE_LABELS[filters.role] || filters.role}
              <button onClick={() => handleFilterChange('role', '')}>&times;</button>
            </span>
          )}
          <button className="pg-chips__clear" onClick={handleResetFilters}>Clear All</button>
        </div>
      )}

      <div className="pg-table-wrap staff-table-wrapper">
        <DataTable
          columns={columns}
          data={filteredStaff}
          keyExtractor={(s) => s.userId}
          loading={loading}
          emptyMessage={searchQuery || activeFilterCount > 0 ? "No staff match your filters" : "No staff found. Add your first staff member!"}
          onRowClick={(s: StaffType) => handleActionClick(s)}
          pagination={{
            currentPage, totalPages, totalCount, pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => { setPageSize(size); setCurrentPage(0); },
          }}
          mobileCardRender={(s) => {
            const role = (s as any).staffRole || 'STAFF';
            const status = getStatus(s);
            return (
              <div className="mobile-card">
                <div className="mobile-card__header">
                  <div className="mobile-card__user">
                    <Avatar name={s.fullName} size="md" />
                    <div className="mobile-card__info">
                      <span className="mobile-card__name">{s.fullName}</span>
                      <span className="mobile-card__email">{(s as any).jobTitle || s.email}</span>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(status)}>{status}</Badge>
                </div>
                <div className="mobile-card__details">
                  <div className="mobile-card__detail">
                    <span className="mobile-card__detail-label">Role</span>
                    <span className="mobile-card__detail-value">{ROLE_LABELS[role] || role}</span>
                  </div>
                  <div className="mobile-card__detail">
                    <span className="mobile-card__detail-label">Department</span>
                    <span className="mobile-card__detail-value">{(s as any).department || '—'}</span>
                  </div>
                  <div className="mobile-card__detail">
                    <span className="mobile-card__detail-label">Shift</span>
                    <span className="mobile-card__detail-value">{(s as any).shiftTiming || '—'}</span>
                  </div>
                </div>
                <div className="mobile-card__actions">
                  <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(s); }} />
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
        onClose={() => setIsCreateModalOpen(false)}
        initialView="staffForm"
      />
    </div>
  );
};

export default StaffList;