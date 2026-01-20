import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { showToast } from '../../utils/showToast';
import { Badge, getStatusVariant, Avatar, DataTable, type Column } from '../../components/ui';
import { ActionMenuButton } from '../../components/shared';
import { useClickOutside } from '../../hooks';
import EnhancedStaffActionModal from '../../components/StaffActionModal/EnhancedStaffActionModal';
import api from '../../services/api';
import type { User } from '../../types/user';
import './Staff.css';

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
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

  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });

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
      render: () => {
        const status = 'Active';
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
    <div className="staff-page">
      <div className="staff-page__header">
        <div className="staff-page__title-section">
          <h1 className="staff-page__title">Staff Directory</h1>
          <div className="staff-page__sort-indicator">
            {sortType === 'newest' ? (
              <span className="sort-badge sort-badge--newest">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Newest
              </span>
            ) : (
              <span className="sort-badge sort-badge--alpha">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18M3 12h12M3 18h6" />
                </svg>
                A → Z
              </span>
            )}
          </div>
        </div>

        <div className="staff-page__header-right">
          {activeFilterCount > 0 && (
            <div className="staff-active-filters">
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
            </div>
          )}

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

          <div className="staff-stats-badge">
            <button
              className={`stat-pill stat-pill--active ${filters.status === 'Active' ? 'selected' : ''}`}
              onClick={() => handleFilterChange('status', 'Active')}
            >
              <span className="stat-dot active"></span>
              <span>{totalCount} Active</span>
            </button>
            <div className="stat-divider"></div>
            <button
              className={`stat-pill ${filters.status === 'Inactive' ? 'selected' : ''}`}
              onClick={() => handleFilterChange('status', 'Inactive')}
            >
              <span className="stat-dot inactive"></span>
              <span>0 Inactive</span>
            </button>
            <div className="stat-divider"></div>
            <button
              className={`stat-pill ${filters.status === '' ? 'selected' : ''}`}
              onClick={() => handleFilterChange('status', '')}
            >
              <span>{totalCount} Total</span>
            </button>
          </div>
        </div>
      </div>

      <div className="staff-page__table">
        <DataTable
          columns={columns}
          data={staff}
          keyExtractor={(s) => s.userId}
          loading={loading}
          emptyMessage="No staff found"
          onRowClick={handleActionClick}
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

      <EnhancedStaffActionModal
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        staff={selectedStaff}
        onEditProfile={handleEditProfile}
        onUpdate={loadStaffPaginated}
      />
    </div>
  );
};

export default Staff;
