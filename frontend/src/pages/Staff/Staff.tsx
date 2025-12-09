import React, { useEffect, useState } from 'react';
import { Button, Badge, getStatusVariant, Avatar, Card, DataTable, type Column } from '../../components/ui';
import { StaffActionModal } from '../../components/StaffActionModal';
import api from '../../services/api';
import type { User } from '../../types/user';
import './Staff.css';

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

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

  const handleEditProfile = (member: User) => {
    console.log('[Beta] Profile updated for:', member.fullName);
    loadStaff(); // Refresh list
    handleCloseActionModal();
  };

  const handleScheduleSession = (member: User) => {
    console.log('[Beta] Schedule session with:', member.fullName);
    handleCloseActionModal();
  };

  const handleMessageStaff = (member: User) => {
    console.log('[Beta] Send message to:', member.fullName);
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
          <span className="staff-page__count">Total Active Staff: {staff.length}</span>
        </div>
        <div className="staff-page__actions">
          <Button variant="secondary" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
          }>
            Filter by Role
          </Button>
        </div>
      </div>

      {/* Content Grid - Full Width */}
      <div className="staff-page__grid">
        {/* Staff List */}
        <Card
          title="Staff List"
          className="staff-page__list"
          noPadding
        >
          <DataTable
            columns={columns}
            data={staff}
            keyExtractor={(s) => s.userId}
            loading={loading}
            emptyMessage="No staff found"
          />
        </Card>
      </div>

      {/* Staff Action Modal */}
      <StaffActionModal
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
