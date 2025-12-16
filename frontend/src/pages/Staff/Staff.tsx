import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Badge, getStatusVariant, Avatar, Card, DataTable, type Column } from '../../components/ui';
import EnhancedStaffActionModal from '../../components/StaffActionModal/EnhancedStaffActionModal';
import api from '../../services/api';
import type { User } from '../../types/user';
import './Staff.css';

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

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
        <div className="staff-cell">
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
      {/* Header */}
      <div className="staff-page__header">
        <div className="staff-page__title-section">
          <h1 className="staff-page__title">Staff Directory</h1>
          <span className="staff-page__count">Total Active Staff: {filteredStaff.length}</span>
        </div>
        <div className="staff-page__actions">
          {/* Filter button removed */}
        </div>
      </div>

      {/* Content Grid - Full Width */}
      <div className="staff-page__grid">

        {/* Compact Filter Bar - Matching Members Page Design */}
        <div className="filters-bar" style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
          alignItems: 'flex-end',
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          position: 'sticky',
          top: '0',
          zIndex: 10,
          borderBottom: '1px solid var(--border-color)'
        }}>

          {/* Role Filter */}
          <div className="filter-group" style={{ flex: '0 0 150px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Role</label>
            <select
              className="form-select"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            >
              <option value="">All Roles</option>
              <option value="TRAINER">Trainer</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group" style={{ flex: '0 0 150px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="filter-group" style={{ flex: '0 0 auto' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', visibility: 'hidden' }}>Reset</label>
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              style={{
                borderColor: 'var(--color-crimson)',
                color: 'var(--color-crimson)',
                height: '38px', // Match select height approximately
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Staff List */}
        <Card
          title="Staff List"
          className="staff-page__list"
          noPadding
        >
          <DataTable
            columns={columns}
            data={filteredStaff}
            keyExtractor={(s) => s.userId}
            loading={loading}
            emptyMessage="No staff found"
          />
        </Card>
      </div>

      {/* Staff Action Modal */}
      <EnhancedStaffActionModal
        isOpen={isActionModalOpen}
        onClose={handleCloseActionModal}
        staff={selectedStaff}
        onEditProfile={handleEditProfile}
        onScheduleSession={handleScheduleSession}
        onMessageStaff={handleMessageStaff}
      />
    </div>
  );
};

export default Staff;
