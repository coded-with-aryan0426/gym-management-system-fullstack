import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiUser, FiCalendar, FiCreditCard, FiTrendingUp, 
  FiClock, FiDollarSign, FiStar, FiMail, FiPhone, FiAward,
  FiEdit2, FiMessageSquare, FiUsers, FiActivity
} from 'react-icons/fi';
import { showToast } from '../../utils/showToast';
import { Avatar, Badge, Button } from '../../components/ui';
import api from '../../services/api';
import type { User } from '../../types/user';
import './TrainerDetail.css';

type TabType = 'overview' | 'schedule' | 'members' | 'performance' | 'compensation' | 'attendance' | 'reviews';

const TrainerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [performance, setPerformance] = useState<any>(null);
  const [compensation, setCompensation] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [assignedMembers, setAssignedMembers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadTrainer();
    }
  }, [id]);

  const loadTrainer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const user = await api.getUserById(parseInt(id));
      setTrainer(user);
      
      // Load additional data in parallel
      const [perfData, compData, attendData, membersData, sessionsData] = await Promise.all([
        api.getTrainerDetails(parseInt(id)).catch(() => null),
        api.getTrainerCompensation(parseInt(id)).catch(() => []),
        api.getTrainerAttendance(parseInt(id)).catch(() => []),
        api.getTrainerCustomers(parseInt(id)).catch(() => []),
        api.getMemberSessions(parseInt(id)).catch(() => [])
      ]);
      
      setPerformance(perfData);
      setCompensation(compData);
      setAttendance(attendData);
      setAssignedMembers(membersData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Failed to load trainer:', err);
      showToast('Failed to load trainer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate trainer stats
  const trainerStats = useMemo(() => {
    if (!trainer) return null;
    
    return {
      clientCount: assignedMembers.length,
      completedSessions: sessions.filter(s => s.status === 'COMPLETED').length,
      totalRevenue: performance?.totalRevenue || 0,
      rating: performance?.rating || 0,
      attendanceRate: attendance.length > 0 
        ? Math.round((attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100)
        : 0
    };
  }, [trainer, assignedMembers, sessions, performance, attendance]);

  if (loading) {
    return (
      <div className="trainer-detail">
        <div className="trainer-detail__loading">
          <div className="loading-spinner"></div>
          <span>Loading trainer details...</span>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="trainer-detail">
        <div className="trainer-detail__error">
          <h2>Trainer not found</h2>
          <Button variant="primary" onClick={() => navigate('/trainers')}>
            Back to Trainers
          </Button>
        </div>
      </div>
    );
  }

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="trainer-detail__overview">
            {/* Personal Info Card */}
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiUser size={16} /> Personal Information</h3>
              </div>
              <div className="detail-card__body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{trainer.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{trainer.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{trainer.phone || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Trainer ID</span>
                    <span className="info-value">#{trainer.userId.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Joined</span>
                    <span className="info-value">
                      {trainer.createdAt 
                        ? new Date(trainer.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) 
                        : '—'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Specialization</span>
                    <span className="info-value">{trainerStats?.clientCount > 0 ? 'Personal Training' : 'General Fitness'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiTrendingUp size={16} /> Performance Summary</h3>
              </div>
              <div className="detail-card__body">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-icon"><FiUsers size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">{trainerStats?.clientCount || 0}</span>
                      <span className="stat-label">Active Clients</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon"><FiCalendar size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">{trainerStats?.completedSessions || 0}</span>
                      <span className="stat-label">Sessions Completed</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon"><FiDollarSign size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">₹{(trainerStats?.totalRevenue || 0).toLocaleString()}</span>
                      <span className="stat-label">Revenue Generated</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon"><FiStar size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">{trainerStats?.rating || 0}</span>
                      <span className="stat-label">Average Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Members Card */}
            {assignedMembers.length > 0 && (
              <div className="detail-card">
                <div className="detail-card__header">
                  <h3><FiUsers size={16} /> Assigned Members</h3>
                  <span className="record-count">{assignedMembers.length} members</span>
                </div>
                <div className="detail-card__body">
                  <div className="members-list">
                    {assignedMembers.slice(0, 5).map((member: any) => (
                      <div key={member.userId} className="member-row">
                        <Avatar name={member.fullName} size="sm" />
                        <div className="member-info">
                          <span className="member-name">{member.fullName}</span>
                          <span className="member-email">{member.email}</span>
                        </div>
                      </div>
                    ))}
                    {assignedMembers.length > 5 && (
                      <Button variant="secondary" size="sm" onClick={() => setActiveTab('members')}>
                        View All {assignedMembers.length} Members
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="trainer-detail__schedule">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiCalendar size={16} /> Weekly Schedule</h3>
              </div>
              <div className="detail-card__body">
                {sessions.length === 0 ? (
                  <div className="empty-state">
                    <FiCalendar size={32} />
                    <p>No scheduled sessions</p>
                    <span className="empty-hint">This trainer has no upcoming sessions</span>
                  </div>
                ) : (
                  <div className="schedule-list">
                    {sessions.slice(0, 10).map((session: any, index: number) => (
                      <div key={index} className="schedule-item">
                        <div className="schedule-date">
                          <span className="day">{new Date(session.sessionDate).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="date">{new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="schedule-time">
                          {new Date(session.sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="schedule-member">
                          {session.memberName || 'Member'}
                        </div>
                        <Badge 
                          variant={session.status === 'COMPLETED' ? 'success' : session.status === 'SCHEDULED' ? 'info' : 'default'}
                        >
                          {session.status || 'Scheduled'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="trainer-detail__members">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiUsers size={16} /> Assigned Members</h3>
                <span className="record-count">{assignedMembers.length} members</span>
              </div>
              <div className="detail-card__body">
                {assignedMembers.length === 0 ? (
                  <div className="empty-state">
                    <FiUsers size={32} />
                    <p>No assigned members</p>
                    <span className="empty-hint">This trainer has no assigned members yet</span>
                  </div>
                ) : (
                  <div className="members-table">
                    {assignedMembers.map((member: any) => (
                      <div key={member.userId} className="member-row">
                        <Avatar name={member.fullName} size="md" />
                        <div className="member-info">
                          <span className="member-name">{member.fullName}</span>
                          <span className="member-email">{member.email}</span>
                        </div>
                        <div className="member-phone">{member.phone || '—'}</div>
                        <Button variant="secondary" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="trainer-detail__performance">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiTrendingUp size={16} /> Performance Metrics</h3>
              </div>
              <div className="detail-card__body">
                <div className="performance-grid">
                  <div className="perf-card">
                    <span className="perf-label">Session Completion Rate</span>
                    <span className="perf-value">
                      {sessions.length > 0 
                        ? Math.round((sessions.filter(s => s.status === 'COMPLETED').length / sessions.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="perf-card">
                    <span className="perf-label">Monthly Revenue</span>
                    <span className="perf-value">₹{(performance?.monthlyRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="perf-card">
                    <span className="perf-label">Attendance Rate</span>
                    <span className="perf-value">{trainerStats?.attendanceRate || 0}%</span>
                  </div>
                  <div className="perf-card">
                    <span className="perf-label">Client Satisfaction</span>
                    <span className="perf-value">{trainerStats?.rating || 0}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'compensation':
        return (
          <div className="trainer-detail__compensation">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiDollarSign size={16} /> Compensation History</h3>
                <Button variant="primary" size="sm">Add Payment</Button>
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
                          <span className="comp-date">
                            {new Date(item.date || item.createdAt).toLocaleDateString()}
                          </span>
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

      case 'attendance':
        return (
          <div className="trainer-detail__attendance">
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
                          <span>Check-in: {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                          <span>Check-out: {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
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

      case 'reviews':
        return (
          <div className="trainer-detail__reviews">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiStar size={16} /> Member Reviews</h3>
              </div>
              <div className="detail-card__body">
                <div className="empty-state">
                  <FiStar size={32} />
                  <p>No reviews yet</p>
                  <span className="empty-hint">Member reviews and ratings will appear here</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="trainer-detail">
      {/* Header */}
      <div className="trainer-detail__header">
        <button className="back-btn" onClick={() => navigate('/trainers')}>
          <FiArrowLeft size={20} />
        </button>
        
        <div className="trainer-detail__title-section">
          <Avatar name={trainer.fullName} size="xl" />
          <div className="trainer-detail__title-info">
            <h1>{trainer.fullName}</h1>
            <div className="trainer-detail__meta">
              <span className="trainer-id">#{trainer.userId.toString().padStart(4, '0')}</span>
              <span className="separator">•</span>
              <span className="trainer-email">{trainer.email}</span>
              {trainer.phone && (
                <>
                  <span className="separator">•</span>
                  <span className="trainer-phone">{trainer.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="trainer-detail__actions">
          <Button variant="secondary" onClick={() => {}}>
            <FiMessageSquare size={14} /> Message
          </Button>
          <Button variant="primary" onClick={() => {}}>
            <FiEdit2 size={14} /> Edit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="trainer-detail__quick-stats">
        <div className="quick-stat">
          <span className="quick-stat__label">Clients</span>
          <span className="quick-stat__value">{trainerStats?.clientCount || 0}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat__label">Sessions</span>
          <span className="quick-stat__value">{trainerStats?.completedSessions || 0}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat__label">Revenue</span>
          <span className="quick-stat__value">₹{(trainerStats?.totalRevenue || 0).toLocaleString()}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat__label">Rating</span>
          <span className="quick-stat__value">{trainerStats?.rating || 0} ★</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="trainer-detail__tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiUser size={14} /> Overview
        </button>
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <FiCalendar size={14} /> Schedule
        </button>
        <button 
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <FiUsers size={14} /> Members
        </button>
        <button 
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <FiTrendingUp size={14} /> Performance
        </button>
        <button 
          className={`tab ${activeTab === 'compensation' ? 'active' : ''}`}
          onClick={() => setActiveTab('compensation')}
        >
          <FiDollarSign size={14} /> Compensation
        </button>
        <button 
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <FiActivity size={14} /> Attendance
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <FiStar size={14} /> Reviews
        </button>
      </div>

      {/* Tab Content */}
      <div className="trainer-detail__content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TrainerDetail;
