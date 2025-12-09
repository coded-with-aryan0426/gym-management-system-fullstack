import React, { useEffect, useState, useMemo } from 'react';
import { Button, Badge, getStatusVariant, Avatar, DataTable, type Column } from '../../components/ui';
import api from '../../services/api';
import type { User } from '../../types/user';
import './Members.css';

const Members: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState('');
  const [statusFilter] = useState<string>('all');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers('CUSTOMER');
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter members based on search and status
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (member as any).status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  // Table columns definition
  const columns: Column<User>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (member) => (
        <div className="member-cell">
          <Avatar name={member.fullName} size="md" />
          <span className="member-name">{member.fullName}</span>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (member) => (
        <span className="member-plan">{(member as any).plan || 'Gold'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (member) => {
        const status = (member as any).status || 'Active';
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      key: 'lastVisit',
      header: 'Last Visit',
      render: (member) => (
        <span className="member-last-visit">{(member as any).lastVisit || 'Today'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      render: () => (
        <div className="member-actions">
          <button className="action-menu-btn" title="Actions">
            •••
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="members-page">
      {/* Header */}
      <div className="members-page__header">
        <div className="members-page__title-section">
          <h1 className="members-page__title">Members Directory</h1>
          <span className="members-page__count">Total Members: {members.length}</span>
        </div>
        <div className="members-page__actions">
          <Button variant="secondary" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
          }>
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="members-page__table-container">
        <DataTable
          columns={columns}
          data={filteredMembers}
          keyExtractor={(member) => member.userId}
          loading={loading}
          emptyMessage="No members found"
        />
      </div>
    </div>
  );
};

export default Members;
