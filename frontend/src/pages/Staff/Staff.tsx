import React, { useEffect, useState, useMemo } from 'react';
import { Button, Badge, getStatusVariant, Avatar, Card, DataTable, type Column } from '../../components/ui';
import api from '../../services/api';
import './Staff.css';

interface StaffMember {
  userId: number;
  fullName: string;
  email: string;
  role?: string;
  status?: string;
  performance?: number;
  trend?: number;
}

const Staff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers('TRAINER');
      // Add mock data for demo
      const staffWithDetails = data.map((user, idx) => ({
        ...user,
        role: idx === 2 ? 'Manager' : idx === 3 ? 'Front Desk' : 'Trainer',
        status: idx === 3 ? 'On Leave' : 'Active',
        performance: 90 + Math.floor(Math.random() * 8),
        trend: 2,
      }));
      setStaff(staffWithDetails);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<StaffMember>[] = [
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
      render: (member) => <span className="staff-role">{member.role}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (member) => {
        const status = member.status || 'Active';
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (member) => (
        <div className="staff-performance">
          <span className="performance-icon">↗</span>
          <span className="performance-value">{member.performance}%</span>
          <span className="performance-trend text-success">+{member.trend}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '80px',
      render: () => (
        <div className="staff-actions">
          <button className="action-menu-btn">•••</button>
        </div>
      ),
    },
  ];

  // Get performance data for chart
  const performanceData = useMemo(() => {
    return staff.slice(0, 6).map(s => ({
      name: s.fullName.split(' ')[0].slice(0, 2).toUpperCase(),
      value: s.performance || 0,
    }));
  }, [staff]);

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

      {/* Content Grid */}
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

        {/* Performance Overview */}
        <Card
          title="Staff Performance Overview"
          subtitle="Client Retention by Trainer"
          className="staff-page__performance"
        >
          <div className="performance-chart">
            {performanceData.map((item, idx) => (
              <div key={idx} className="performance-bar-container">
                <div
                  className="performance-bar"
                  style={{ height: `${item.value}%` }}
                />
                <span className="performance-label">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="performance-scale">
            <span>70%</span>
            <span>50%</span>
            <span>30%</span>
            <span>10%</span>
            <span>0%</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Staff;
