import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiUser, FiCalendar, FiCreditCard, FiTrendingUp,
  FiClock, FiDollarSign, FiMail, FiPhone, FiAward,
  FiEdit2, FiMessageSquare, FiActivity, FiBriefcase
} from 'react-icons/fi';
import { showToast } from '../../utils/showToast';
import { Avatar, Badge, Button } from '../../components/ui';
import api from '../../services/api';
import type { User } from '../../types/user';
import './StaffDetail.css';

type TabType = 'overview' | 'attendance' | 'schedule' | 'compensation';

const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [compensation, setCompensation] = useState<any[]>([]);

  useEffect(() => {
    if (id) loadStaff();
  }, [id]);

  const loadStaff = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const user = await api.getUserById(parseInt(id));
      setStaff(user);

      const [attendData, compData] = await Promise.all([
        api.getTrainerAttendance(parseInt(id)).catch(() => []),
        api.getTrainerCompensation(parseInt(id)).catch(() => []),
      ]);

      setAttendance(attendData);
      setCompensation(compData);
    } catch (err) {
      console.error('Failed to load staff:', err);
      showToast('Failed to load staff details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!staff) return null;
    const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
    const totalDays = attendance.length;
    return {
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      presentDays,
      totalDays,
      totalComp: compensation.reduce((s, c) => s + (c.amount || 0), 0),
    };
  }, [staff, attendance, compensation]);

  if (loading) {
    return (
      <div className="staff-detail">
        <div className="staff-detail__loading">
          <div className="loading-spinner" />
          <span>Loading staff details...</span>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="staff-detail">
        <div className="staff-detail__error">
          <h2>Staff member not found</h2>
          <Button variant="primary" onClick={() => navigate('/staff')}>Back to Staff</Button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="staff-detail__overview">
            <div className="detail-card">
              <div className="detail-card__header"><h3><FiUser size={16} /> Personal Information</h3></div>
              <div className="detail-card__body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{staff.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{staff.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{staff.phone || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Staff ID</span>
                    <span className="info-value">#{staff.userId.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Role</span>
                    <span className="info-value">{staff.roles?.[0]?.roleName || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Joined</span>
                    <span className="info-value">
                      {staff.createdAt
                        ? new Date(staff.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-card__header"><h3><FiTrendingUp size={16} /> Summary</h3></div>
              <div className="detail-card__body">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-icon"><FiActivity size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">{stats?.attendanceRate || 0}%</span>
                      <span className="stat-label">Attendance Rate</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon"><FiCalendar size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">{stats?.presentDays || 0}</span>
                      <span className="stat-label">Days Present</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon"><FiDollarSign size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">₹{(stats?.totalComp || 0).toLocaleString()}</span>
                      <span className="stat-label">Total Compensation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="staff-detail__attendance">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiActivity size={16} /> Attendance Log</h3>
                <span className="record-count">{attendance.length} records</span>
              </div>
              <div className="detail-card__body">
                {attendance.length === 0 ? (
                  <div className="empty-state">
                    <FiActivity size={32} />
                    <p>No attendance records</p>
                    <span className="empty-hint">Attendance history will appear here</span>
                  </div>
                ) : (
                  <div className="attendance-list">
                    {attendance.map((record: any, index: number) => (
                      <div key={index} className="attendance-item">
                        <div className="attendance-date">
                          {new Date(record.date || record.checkInTime).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </div>
                        <div className="attendance-time">
                          <span>In: {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                          <span>Out: {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                        </div>
                        <Badge variant={record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'danger' : 'warning'} size="sm">
                          {record.status || 'Unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="staff-detail__schedule">
            <div className="detail-card">
              <div className="detail-card__header"><h3><FiCalendar size={16} /> Work Schedule</h3></div>
              <div className="detail-card__body">
                <div className="empty-state">
                  <FiCalendar size={32} />
                  <p>Shift scheduling coming soon</p>
                  <span className="empty-hint">Shift assignments and scheduling will be managed here</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'compensation':
        return (
          <div className="staff-detail__compensation">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiDollarSign size={16} /> Compensation History</h3>
              </div>
              <div className="detail-card__body">
                {compensation.length === 0 ? (
                  <div className="empty-state">
                    <FiDollarSign size={32} />
                    <p>No compensation records</p>
                    <span className="empty-hint">Compensation history will appear here</span>
                  </div>
                ) : (
                  <div className="compensation-list">
                    {compensation.map((item: any, index: number) => (
                      <div key={index} className="compensation-item">
                        <div className="comp-info">
                          <span className="comp-date">{new Date(item.date || item.createdAt).toLocaleDateString()}</span>
                          <span className="comp-desc">{item.description}</span>
                        </div>
                        <div className="comp-amount">
                          <span className="amount">₹{item.amount?.toLocaleString()}</span>
                          <Badge variant={item.status === 'PAID' ? 'success' : 'warning'} size="sm">
                            {item.status || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="staff-detail">
      <div className="staff-detail__header">
        <button className="back-btn" onClick={() => navigate('/staff')}>
          <FiArrowLeft size={20} />
        </button>

        <div className="staff-detail__title-section">
          <Avatar name={staff.fullName} size="xl" />
          <div className="staff-detail__title-info">
            <h1>{staff.fullName}</h1>
            <div className="staff-detail__meta">
              <span className="staff-id">#{staff.userId.toString().padStart(4, '0')}</span>
              <span className="separator">•</span>
              <span className="staff-role">{staff.roles?.[0]?.roleName || 'Staff'}</span>
              <span className="separator">•</span>
              <span className="staff-email">{staff.email}</span>
              {staff.phone && (
                <>
                  <span className="separator">•</span>
                  <span className="staff-phone">{staff.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="staff-detail__actions">
          <Button variant="secondary" onClick={() => { }}>
            <FiMessageSquare size={14} /> Message
          </Button>
          <Button variant="primary" onClick={() => { }}>
            <FiEdit2 size={14} /> Edit
          </Button>
        </div>
      </div>

      <div className="staff-detail__quick-stats">
        <div className="quick-stat">
          <span className="quick-stat__label">Attendance</span>
          <span className="quick-stat__value">{stats?.attendanceRate || 0}%</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat__label">Days Present</span>
          <span className="quick-stat__value">{stats?.presentDays || 0}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat__label">Total Comp</span>
          <span className="quick-stat__value">₹{(stats?.totalComp || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="staff-detail__tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <FiUser size={14} /> Overview
        </button>
        <button className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <FiActivity size={14} /> Attendance
        </button>
        <button className={`tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          <FiCalendar size={14} /> Schedule
        </button>
        <button className={`tab ${activeTab === 'compensation' ? 'active' : ''}`} onClick={() => setActiveTab('compensation')}>
          <FiDollarSign size={14} /> Compensation
        </button>
      </div>

      <div className="staff-detail__content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StaffDetail;
