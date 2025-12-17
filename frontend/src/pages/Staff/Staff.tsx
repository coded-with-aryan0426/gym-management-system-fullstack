import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Badge, getStatusVariant, Avatar, DataTable, type Column } from '../../components/ui';
import EnhancedStaffActionModal from '../../components/StaffActionModal/EnhancedStaffActionModal';
import api from '../../services/api';
import type { User } from '../../types/user';
import './Staff.css';

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Deep linking for Global Search
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });

  const filteredStaff = React.useMemo(() => {
    return staff.filter(member => {
      // Access role correctly. Note: API might return roles array.
      const roleName = member.roles?.[0]?.roleName || member.role || 'TRAINER';
      const matchesRole = filters.role === "" || roleName === filters.role;
      // Mock status check since data is hardcoded active
      const matchesStatus = filters.status === "" || "Active" === filters.status;
      return matchesRole && matchesStatus;
    });
  }, [staff, filters]);

  const handleResetFilters = () => {
    setFilters({ role: "", status: "" });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      // Create a PT session with this trainer
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
      render: (member) => (
        <div
          className="staff-cell"
          onClick={(e) => { e.stopPropagation(); handleActionClick(member); }}
          style={{ cursor: 'pointer' }}
        >
          <Avatar name={member.fullName} size="md" />
          <span className="staff-name">{member.fullName}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (member) => <span className="staff-role">{member.roles?.[0]?.roleName || 'TRAINER'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: () => {
        const status = 'Active';
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      render: (member) => (
        <div className="staff-actions">
          <button
            className="action-menu-btn"
            onClick={() => handleActionClick(member)}
          >
            •••
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="staff-page">
      {/* Header - Matching Members Page */}
      <div className="staff-page__header">
        <div className="staff-page__title-section">
          <h1 className="staff-page__title">Staff Directory</h1>
          <span className="staff-page__subtitle">Manage your team members</span>
        </div>
        <div className="staff-page__header-right">
          <div className="staff-stats-badge">
            <span className="staff-stat-pill">
              <strong>{staff.length}</strong> Total
            </span>
            <span className="staff-stat-divider" />
            <span className="staff-stat-pill staff-stat-pill--active">
              <strong>{filteredStaff.length}</strong> Active
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar - Compact */}
      <div className="staff-filter-bar">
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

        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {(filters.role || filters.status) && (
          <button className="staff-reset-btn" onClick={handleResetFilters}>
            Reset
          </button>
        )}
      </div>

      {/* Staff List */}
      <div className="staff-page__grid">
        <DataTable
          columns={columns}
          data={filteredStaff}
          keyExtractor={(s) => s.userId}
          loading={loading}
          emptyMessage="No staff found"
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
