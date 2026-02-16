import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiUsers, FiUserCheck, FiUser, FiUserPlus, FiSearch, FiFilter, FiRefreshCw, FiShield } from 'react-icons/fi';
import { showToast } from '../../utils/showToast';
import { Badge, getStatusVariant, Avatar, DataTable, type Column, Button } from '../../components/ui';
import { ActionMenuButton } from '../../components/shared';
import { useClickOutside } from '../../hooks';
import EnhancedStaffActionModal from '../../components/StaffActionModal/EnhancedStaffActionModal';
import CreateActionModal from '../../components/CreateActionModal/CreateActionModal';
import api from '../../services/api';
import type { User } from '../../types/user';
import './StaffList.css';

type StatusFilter = 'all' | 'active' | 'inactive';

const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>('all');

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortType, setSortType] = useState<'newest' | 'alphabetical'>('newest');

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filterRef = useRef<HTMLDivElement>(null);

  useClickOutside(filterRef as React.RefObject<HTMLElement>, () => setIsFilterOpen(false), isFilterOpen);

  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });

  // Calculate stats from loaded staff
  const stats = useMemo(() => {
    const activeCount = staff.filter(s => (s as any).status === 'Active' || !(s as any).status).length;
    const inactiveCount = staff.filter(s => (s as any).status === 'Inactive').length;
    return {
      total: totalCount,
      activeCount,
      inactiveCount,
      trainersCount: staff.filter(s => s.roles?.[0]?.roleName === 'TRAINER').length,
      adminCount: staff.filter(s => s.roles?.[0]?.roleName === 'ADMIN' || s.roles?.[0]?.roleName === 'MANAGER').length,
    };
  }, [staff, totalCount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadStaffPaginated = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getStaffPaginated(
        currentPage,
        pageSize,
        debouncedSearch || undefined,
        filters.role || undefined
      );

      setStaff(response.content);
      setTotalCount(response.totalCount);
      setSortType(response.sortType as 'newest' | 'alphabetical');
    } catch (err) {
      console.error('[Staff] Failed to load paginated staff:', err);
      showToast('Failed to load staff', 'error');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, filters.role]);

  useEffect(() => {
    loadStaffPaginated();
  }, [loadStaffPaginated]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, filters, activeStatusFilter]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  const activeFilterCount = [filters.role, filters.status].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilters({ role: "", status: "" });
    setActiveStatusFilter('all');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: typeof filters) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && staff.length > 0) {
      const member = staff.find(s => s.userId.toString() === userId);
      if (member) {
        handleActionClick(member);
      }
    }
  }, [searchParams, staff]);

  const handleActionClick = (member: User) => {
    setSelectedStaff(member);
    setIsActionModalOpen(true);
  };

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedStaff(null);
  };

  const handleEditProfile = async (member: User) => {
    try {
      await api.updateUser(member.userId, {
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
      handleCloseActionModal();
    }
  };

  // Get status from member data
  const getMemberStatus = (member: User) => {
    return (member as any).status || 'Active';
  };

  // Filter staff based on status filter
  const filteredStaff = useMemo(() => {
    if (activeStatusFilter === 'all') return staff;
    return staff.filter(s => {
      const status = getMemberStatus(s);
      if (activeStatusFilter === 'active') return status === 'Active';
      if (activeStatusFilter === 'inactive') return status === 'Inactive';
      return true;
    });
  }, [staff, activeStatusFilter]);

  const columns: Column<User>[] = [
    {
      key: 'index',
      header: '#',
      width: '50px',
      render: (_, index) => (
        <span className="staff-index">{currentPage * pageSize + index + 1}</span>
      ),
    },
    {
      key: 'member',
      header: 'Staff Member',
      width: 'auto',
      render: (member) => (
        <div
          className="staff-cell"
          onClick={(e) => { e.stopPropagation(); handleActionClick(member); }}
          style={{ cursor: 'pointer' }}
        >
          <Avatar name={member.fullName} size="md" />
          <div className="staff-cell__info">
            <span className="staff-name">{member.fullName}</span>
            <span className="staff-email">{member.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      width: '130px',
      render: (member) => (
        <span className="staff-phone">{member.phone || '—'}</span>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      width: '120px',
      render: (member) => (
        <span className="staff-id">#{member.userId.toString().padStart(4, '0')}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: '100px',
      render: (member) => (
        <span className="staff-role-badge">{member.roles?.[0]?.roleName || 'TRAINER'}</span>
      ),
    },
    {
      key: 'joinDate',
      header: 'Joined',
      width: '130px',
      render: (member) => {
        const date = member.createdAt ? new Date(member.createdAt) : new Date();
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const year = date.getFullYear();
        return <span className="staff-date">{day} {month} {year}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (member) => {
        const status = getMemberStatus(member);
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (member) => (
        <div className="staff-actions">
          <ActionMenuButton onClick={(e) => { e.stopPropagation(); handleActionClick(member); }} />
        </div>
      ),
    },
  ];

  return (
    <div className="pg-page">
      {/* Header - Following Members page pattern */}
      <header className="pg-header">
        <div className="pg-header__row-1">
          <div className="pg-header__title-group">
            <div className="pg-header__icon">
              <FiShield size={18} />
            </div>
            <div>
              <h1 className="pg-header__title">Staff Directory</h1>
              <span className="pg-header__subtitle">{stats.total} total staff members</span>
            </div>
          </div>

          {/* Stats Cards - Following Members page pattern */}
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
              <div className="pg-stat-card__icon pg-stat-card__icon--inactive"><FiUser size={14} /></div>
              <div className="pg-stat-card__data">
                <span className="pg-stat-card__value pg-stat-card__value--red">{stats.inactiveCount}</span>
                <span className="pg-stat-card__label">Inactive</span>
              </div>
            </button>
          </div>

          <div className="pg-header__actions">
            <button className="pg-btn pg-btn--primary" onClick={() => setIsCreateModalOpen(true)}>
              <FiUserPlus size={14} />
              <span>Add Staff</span>
            </button>
          </div>
        </div>

        {/* Row 2: Tabs + Search + Filters */}
        <div className="pg-header__row-2">
          <div className="pg-tabs">
            <button
              className={`pg-tab ${activeStatusFilter === 'all' ? 'pg-tab--active' : ''}`}
              onClick={() => setActiveStatusFilter('all')}
            >
              All
              <span className="pg-tab__count">{stats.total}</span>
            </button>
            <button
              className={`pg-tab ${activeStatusFilter === 'active' ? 'pg-tab--active' : ''}`}
              onClick={() => setActiveStatusFilter('active')}
            >
              Active
              <span className="pg-tab__count pg-tab__count--active">{stats.activeCount}</span>
            </button>
            <button
              className={`pg-tab ${activeStatusFilter === 'inactive' ? 'pg-tab--active' : ''}`}
              onClick={() => setActiveStatusFilter('inactive')}
            >
              Inactive
              <span className="pg-tab__count pg-tab__count--muted">{stats.inactiveCount}</span>
            </button>
          </div>

          <div className="pg-header__right">
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
                  ×
                </button>
              )}
            </div>

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
                    {activeFilterCount > 0 && (
                      <button className="pg-filter-dropdown__clear" onClick={handleResetFilters}>
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="pg-filter-dropdown__body">
                    <div className="pg-filter-dropdown__row">
                      <label className="pg-filter-dropdown__label">Role</label>
                      <select
                        className="pg-filter-dropdown__select"
                        value={filters.role}
                        onChange={(e) => handleFilterChange("role", e.target.value)}
                      >
                        <option value="">All Roles</option>
                        <option value="TRAINER">Trainer</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="pg-btn pg-btn--icon"
              onClick={() => loadStaffPaginated()}
              title="Refresh"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="pg-chips">
          {filters.role && (
            <span className="pg-chip">
              Role: {filters.role}
              <button onClick={() => handleFilterChange('role', '')}>
                &times;
              </button>
            </span>
          )}
          <button className="pg-chips__clear" onClick={handleResetFilters}>
            Clear All
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="pg-table-wrap staff-table-wrapper">
        <DataTable
          columns={columns}
          data={filteredStaff}
          keyExtractor={(s) => s.userId}
          loading={loading}
          emptyMessage={searchQuery || activeFilterCount > 0 ? "No staff match your filters" : "No staff found. Add your first staff member!"}
          onRowClick={(member: User) => navigate(`/staff/${member.userId}`)}
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
            const dateStr = `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${date.getFullYear()}`;
            const role = member.roles?.[0]?.roleName || 'TRAINER';
            const status = getMemberStatus(member);
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
                    <Badge variant={getStatusVariant(status)}>{status}</Badge>
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
