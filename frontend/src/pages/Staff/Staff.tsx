import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Badge, getStatusVariant, Avatar, DataTable, type Column } from '../../components/ui';
import { ActionMenuButton, SortButton, StatsBadge } from '../../components/shared';
import { useClickOutside, useAlphabeticalSort } from '../../hooks';
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filterRef = useRef<HTMLDivElement>(null);

  // Shared hooks for unified behavior
  const { sortOrder, toggleSort, sortItems } = useAlphabeticalSort<User>();

  // Click outside to close filter panel
  useClickOutside(filterRef as React.RefObject<HTMLElement>, () => setIsFilterOpen(false), isFilterOpen);

  // Deep linking for Global Search
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });

  // Filter staff
  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const roleName = member.roles?.[0]?.roleName || member.role || 'TRAINER';
      const matchesRole = filters.role === "" || roleName === filters.role;
      const matchesStatus = filters.status === "" || "Active" === filters.status;
      return matchesRole && matchesStatus;
    });
  }, [staff, filters]);

  // Apply sorting using shared hook
  const sortedStaff = useMemo(() => {
    return sortItems(filteredStaff, (m) => m.fullName);
  }, [filteredStaff, sortItems]);

  // Client-side pagination
  const paginatedStaff = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return sortedStaff.slice(start, end);
  }, [sortedStaff, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedStaff.length / pageSize);
  }, [sortedStaff.length, pageSize]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  const activeFilterCount = [filters.role, filters.status].filter(Boolean).length;

  const handleResetFilters = () => {
    setFilters({ role: "", status: "" });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: typeof filters) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // Handle Search Param Navigation
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId && staff.length > 0) {
      const member = staff.find(s => s.userId.toString() === userId);
      if (member) {
        handleActionClick(member);
      }
    }
  }, [searchParams, staff]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers('TRAINER');
      setStaff(data);
    } catch (err) {
      console.error('[Beta] Failed to load staff:', err);
      toast.error('Failed to load staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

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
        phoneNumber: member.phoneNumber,
      });
      toast.success(`Profile updated for ${member.fullName}`);
      loadStaff();
      handleCloseActionModal();
    } catch (err) {
      console.error('Failed to update staff profile:', err);
      toast.error('Failed to update profile');
      handleCloseActionModal();
    }
  };

  const handleScheduleSession = async (member: User) => {
    try {
      await api.createPTSession({
        trainerId: member.userId,
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        notes: 'Scheduled session',
      });
      toast.success(`Session scheduled with ${member.fullName}`);
      handleCloseActionModal();
    } catch (err) {
      console.error('Failed to schedule session:', err);
      toast.error('Failed to schedule session');
      handleCloseActionModal();
    }
  };

  const handleMessageStaff = async (member: User) => {
    toast.success(`Message sent to ${member.fullName}`);
    handleCloseActionModal();
  };

  const columns: Column<User>[] = [
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
      width: '120px',
      render: (member) => (
        <span className="staff-role-badge">{member.roles?.[0]?.roleName || 'TRAINER'}</span>
      ),
    },
    {
      key: 'joinDate',
      header: 'Joined',
      width: '100px',
      render: (member) => {
        const date = member.createdAt ? new Date(member.createdAt) : new Date();
        return <span className="staff-date">{date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>;
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
      {/* Header - Matching Members Layout */}
      <div className="staff-page__header">
        <div className="staff-page__title-section">
          <h1 className="staff-page__title">Staff Directory</h1>
          <span className="staff-page__subtitle">Manage your team members</span>
        </div>

        <div className="staff-page__header-right">
          {/* Active Filter Chips - Before Filter Button */}
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

          {/* Filter Button with Dropdown */}
          <div className="staff-filter-container" ref={filterRef}>
            <button
              className={`btn-filters ${isFilterOpen ? 'btn-filters--active' : ''} ${activeFilterCount > 0 ? 'btn-filters--has-filters' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
              {activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>

            {/* Filter Dropdown Panel */}
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

          {/* Sort Button - Unified */}
          <SortButton sortOrder={sortOrder} onToggle={toggleSort} />

          {/* Stats Badge - Matching Members Style */}
          <div className="staff-stats-badge">
            <button
              className={`stat-pill stat-pill--active ${filters.status === 'Active' ? 'selected' : ''}`}
              onClick={() => handleFilterChange('status', 'Active')}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              <span className="stat-dot active"></span>
              <span>{sortedStaff.length} Active</span>
            </button>
            <div className="stat-divider"></div>
            <button
              className={`stat-pill ${filters.status === 'Inactive' ? 'selected' : ''}`}
              onClick={() => handleFilterChange('status', 'Inactive')}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              <span className="stat-dot inactive"></span>
              <span>0 Inactive</span>
            </button>
            <div className="stat-divider"></div>
            <button
              className={`stat-pill ${filters.status === '' ? 'selected' : ''}`}
              onClick={() => handleFilterChange('status', '')}
              style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              <span>{staff.length} Total</span>
            </button>
          </div>
        </div>
      </div>



      <div className="staff-page__table">
        <DataTable
          columns={columns}
          data={paginatedStaff}
          keyExtractor={(s) => s.userId}
          loading={loading}
          emptyMessage="No staff found"
          pagination={{
            currentPage,
            totalPages,
            totalCount: sortedStaff.length,
            pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(0);
            },
          }}
        />
      </div>

      {/* Staff Action Modal */}
      <EnhancedStaffActionModal
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        staff={selectedStaff}
        onEditProfile={handleEditProfile}
        onUpdate={loadStaff}
      />
    </div>
  );
};

export default Staff;
