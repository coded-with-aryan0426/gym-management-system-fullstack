import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiUser, FiCalendar, FiCreditCard, FiTrendingUp,
  FiClock, FiFileText, FiActivity, FiPhone, FiMail, FiHome,
  FiEdit2, FiMessageSquare, FiPrinter, FiRefreshCw, FiMapPin
} from 'react-icons/fi';
import { showToast } from '../../utils/showToast';
import { Avatar, Badge, getStatusVariant, Button } from '../../components/ui';
import api from '../../services/api';
import { memberProgressApi } from '../../services/api';
import type { MemberDTO } from '../../types';
import './MemberDetail.css';

type TabType = 'overview' | 'attendance' | 'payments' | 'progress' | 'sessions' | 'notes' | 'activity';

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [progressSummary, setProgressSummary] = useState<any>(null);
  const [progressMetrics, setProgressMetrics] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [personalBests, setPersonalBests] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadMember();
    }
  }, [id]);

  const loadMember = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const user = await api.getUserById(parseInt(id));
      setMember(user as unknown as MemberDTO);

      // Load additional data in parallel
      const [attendanceData, paymentsData, sessionsData, notesData, summaryData, metricsData, measurementData, goalsData, pbData, workoutData] = await Promise.all([
        api.getMemberAttendance(parseInt(id)).catch(() => []),
        api.getMemberPayments(parseInt(id)).catch(() => []),
        api.getMemberSessions(parseInt(id)).catch(() => []),
        api.getMemberNotes(parseInt(id)).catch(() => []),
        memberProgressApi.getSummary(parseInt(id)).catch(() => null),
        memberProgressApi.getMetrics(parseInt(id), '3months').catch(() => []),
        memberProgressApi.getMeasurements(parseInt(id), '3months').catch(() => []),
        memberProgressApi.getGoals(parseInt(id)).catch(() => []),
        memberProgressApi.getPersonalBests(parseInt(id)).catch(() => []),
        memberProgressApi.getWorkouts(parseInt(id), '1month').catch(() => [])
      ]);

      setAttendance(attendanceData);
      setPayments(paymentsData);
      setSessions(sessionsData);
      setNotes(notesData);
      setProgressSummary(summaryData);
      setProgressMetrics(metricsData);
      setMeasurements(measurementData);
      setGoals(goalsData);
      setPersonalBests(pbData);
      setWorkoutLogs(workoutData);
    } catch (err) {
      console.error('Failed to load member:', err);
      showToast('Failed to load member details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate membership stats
  const membershipStats = useMemo(() => {
    if (!member) return null;

    const memberAny = member as any;

    // Timestamp-first: use endDateTime for sub-second precision
    if (memberAny.endDateTime) {
      const expiryDate = new Date(memberAny.endDateTime);
      const startDate = memberAny.startDateTime
        ? new Date(memberAny.startDateTime)
        : member.startDate ? new Date(member.startDate) : null;
      const now = new Date();
      const msLeft = expiryDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      const isExpired = msLeft < 0;
      return {
        startDate,
        expiryDate,
        daysLeft: Math.abs(daysLeft),
        msLeft,
        isExpired,
        planName: member.planName || 'No Plan',
        status: member.status || 'Unknown',
      };
    }

    // Fallback: endDate only
    if (member.endDate) {
      const expiryDate = new Date(member.endDate);
      const startDate = member.startDate ? new Date(member.startDate) : null;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const target = new Date(expiryDate);
      target.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = daysLeft < 0;
      return {
        startDate,
        expiryDate,
        daysLeft: Math.abs(daysLeft),
        msLeft: null,
        isExpired,
        planName: member.planName || 'No Plan',
        status: member.status || 'Unknown',
      };
    }

    // Last resort: derive from startDate + planDuration
    const startDate = member.startDate ? new Date(member.startDate) : null;
    let expiryDate = null;
    let daysLeft = 0;
    let isExpired = false;

    if (startDate && member.planDuration) {
      expiryDate = new Date(startDate);
      const durationStr = member.planDuration.toLowerCase();
      if (durationStr.includes('year')) {
        expiryDate.setMonth(expiryDate.getMonth() + (parseInt(durationStr) || 1) * 12);
      } else if (durationStr.includes('month')) {
        expiryDate.setMonth(expiryDate.getMonth() + (parseInt(durationStr) || 1));
      } else if (durationStr.includes('day')) {
        expiryDate.setDate(expiryDate.getDate() + (parseInt(durationStr) || 30));
      }
      const now = new Date();
      daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      isExpired = daysLeft < 0;
    }

    return {
      startDate,
      expiryDate,
      daysLeft: Math.abs(daysLeft),
      msLeft: null,
      isExpired,
      planName: member.planName || 'No Plan',
      status: member.status || 'Unknown',
    };
  }, [member]);

  // Get status badge
  const getStatusBadge = () => {
    if (!membershipStats) return null;

    if (membershipStats.isExpired) {
      return <Badge variant="expired">Expired</Badge>;
    }
    if (membershipStats.daysLeft !== undefined && membershipStats.daysLeft <= 7) {
      return <Badge variant="pending">Expiring Soon</Badge>;
    }
    return <Badge variant="active">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="member-detail">
        <div className="member-detail__loading">
          <div className="loading-spinner"></div>
          <span>Loading member details...</span>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-detail">
        <div className="member-detail__error">
          <h2>Member not found</h2>
          <Button variant="primary" onClick={() => navigate('/members')}>
            Back to Members
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
          <div className="member-detail__overview">
            {/* Personal Info Card */}
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiUser size={16} /> Personal Information</h3>
              </div>
              <div className="detail-card__body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{member.fullName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{member.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{member.phone || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member ID</span>
                    <span className="info-value">#{member.userId.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Join Date</span>
                    <span className="info-value">
                      {member.joinDate || member.createdAt
                        ? new Date(member.joinDate || member.createdAt || '').toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })
                        : '—'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className="info-value">{getStatusBadge()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Card */}
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiCreditCard size={16} /> Membership Details</h3>
              </div>
              <div className="detail-card__body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Current Plan</span>
                    <span className="info-value plan-name">{membershipStats?.planName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{member.planDuration || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">
                      {membershipStats?.startDate
                        ? membershipStats.startDate.toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })
                        : '—'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Expiry Date</span>
                    <span className="info-value">
                      {membershipStats?.expiryDate
                        ? membershipStats.expiryDate.toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })
                        : '—'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Days Remaining</span>
                    <span className={`info-value days-remaining ${membershipStats?.isExpired ? 'expired' : (membershipStats?.daysLeft ?? 99) <= 7 ? 'warning' : 'active'}`}>
                      {membershipStats?.isExpired
                        ? `Expired ${membershipStats.daysLeft ?? 0} days ago`
                        : membershipStats
                          ? `${membershipStats.daysLeft ?? 0} days`
                          : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trainer Card */}
            {member.trainerId && (
              <div className="detail-card">
                <div className="detail-card__header">
                  <h3><FiTrendingUp size={16} /> Assigned Trainer</h3>
                </div>
                <div className="detail-card__body">
                  <div className="trainer-info">
                    <Avatar name={member.trainerName || 'Trainer'} size="lg" />
                    <div className="trainer-details">
                      <span className="trainer-name">{member.trainerName || 'Assigned Trainer'}</span>
                      <Button variant="secondary" size="sm">View Profile</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'attendance':
        return (
          <div className="member-detail__attendance">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiClock size={16} /> Check-in History</h3>
                <span className="record-count">{attendance.length} records</span>
              </div>
              <div className="detail-card__body">
                {attendance.length === 0 ? (
                  <div className="empty-state">
                    <FiActivity size={32} />
                    <p>No check-in history yet</p>
                  </div>
                ) : (
                  <div className="attendance-list">
                    {attendance.map((record: any, index: number) => (
                      <div key={index} className="attendance-item">
                        <div className="attendance-date">
                          {new Date(record.checkInTime).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </div>
                        <div className="attendance-time">
                          <span className="check-in">
                            In: {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          {record.checkOutTime && (
                            <span className="check-out">
                              Out: {new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        <div className="attendance-duration">
                          {record.duration ? `${Math.round(record.duration)} min` : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="member-detail__payments">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiCreditCard size={16} /> Payment History</h3>
                <span className="record-count">{payments.length} records</span>
              </div>
              <div className="detail-card__body">
                {payments.length === 0 ? (
                  <div className="empty-state">
                    <FiCreditCard size={32} />
                    <p>No payment history yet</p>
                  </div>
                ) : (
                  <div className="payments-list">
                    {payments.map((payment: any, index: number) => (
                      <div key={index} className="payment-item">
                        <div className="payment-info">
                          <span className="payment-date">
                            {new Date(payment.date || payment.createdAt).toLocaleDateString('en-US', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                          <span className="payment-desc">{payment.description}</span>
                        </div>
                        <div className="payment-amount">
                          <span className={`amount ${payment.type === 'INCOME' ? 'income' : 'expense'}`}>
                            {payment.type === 'INCOME' ? '+' : '-'}₹{payment.amount?.toLocaleString() || 0}
                          </span>
                          <Badge
                            variant={payment.status === 'Completed' ? 'active' : 'pending'} size="sm"
                          > {payment.status || 'Pending'}
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

      case 'progress':
        return (
          <div className="member-detail__progress">
            {/* Summary Stats */}
            {progressSummary && (
              <div className="detail-card">
                <div className="detail-card__header">
                  <h3><FiTrendingUp size={16} /> Progress Summary</h3>
                </div>
                <div className="detail-card__body">
                  <div className="progress-stats-grid">
                    <div className="progress-stat-card">
                      <span className="progress-stat-label">Current Weight</span>
                      <span className="progress-stat-value">{progressSummary.currentWeight ? `${progressSummary.currentWeight} kg` : '—'}</span>
                      {progressSummary.weightChange != null && (
                        <span className={`progress-stat-change ${progressSummary.weightChange < 0 ? 'positive' : progressSummary.weightChange > 0 ? 'negative' : ''}`}>
                          {progressSummary.weightChange > 0 ? '+' : ''}{progressSummary.weightChange} kg
                        </span>
                      )}
                    </div>
                    <div className="progress-stat-card">
                      <span className="progress-stat-label">Body Fat</span>
                      <span className="progress-stat-value">{progressSummary.currentBodyFat ? `${progressSummary.currentBodyFat}%` : '—'}</span>
                      {progressSummary.bodyFatChange != null && (
                        <span className={`progress-stat-change ${progressSummary.bodyFatChange < 0 ? 'positive' : ''}`}>
                          {progressSummary.bodyFatChange > 0 ? '+' : ''}{progressSummary.bodyFatChange}%
                        </span>
                      )}
                    </div>
                    <div className="progress-stat-card">
                      <span className="progress-stat-label">BMI</span>
                      <span className="progress-stat-value">{progressSummary.currentBmi || '—'}</span>
                      {progressSummary.bmiCategory && (
                        <span className="progress-stat-sub">{progressSummary.bmiCategory}</span>
                      )}
                    </div>
                    <div className="progress-stat-card">
                      <span className="progress-stat-label">Workouts (Month)</span>
                      <span className="progress-stat-value">{progressSummary.workoutsThisMonth ?? 0}</span>
                      <span className="progress-stat-sub">{progressSummary.currentStreak ?? 0} day streak</span>
                    </div>
                    <div className="progress-stat-card">
                      <span className="progress-stat-label">Consistency</span>
                      <span className="progress-stat-value">{progressSummary.consistencyRate ? `${Math.round(progressSummary.consistencyRate)}%` : '—'}</span>
                    </div>
                    <div className="progress-stat-card">
                      <span className="progress-stat-label">Personal Bests</span>
                      <span className="progress-stat-value">{progressSummary.totalPersonalBests ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Goals */}
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiTrendingUp size={16} /> Goals</h3>
                <span className="record-count">{goals.length} goals</span>
              </div>
              <div className="detail-card__body">
                {goals.length === 0 ? (
                  <div className="empty-state">
                    <FiTrendingUp size={32} />
                    <p>No goals set yet</p>
                  </div>
                ) : (
                  <div className="goals-list">
                    {goals.map((goal: any, index: number) => (
                      <div key={index} className="goal-item">
                        <div className="goal-info">
                          <span className="goal-title">{goal.goalType || goal.title || 'Goal'}</span>
                          <span className="goal-desc">{goal.description || `Target: ${goal.targetValue ?? '—'}`}</span>
                        </div>
                        <div className="goal-progress">
                          <div className="goal-bar">
                            <div className="goal-bar-fill" style={{ width: `${Math.min(100, goal.progressPercent || 0)}%` }} />
                          </div>
                          <span className="goal-pct">{Math.round(goal.progressPercent || 0)}%</span>
                        </div>
                        <Badge
                          variant={goal.status === 'COMPLETED' ? 'active' : goal.status === 'IN_PROGRESS' ? 'info' : 'default'}
                          size="sm"
                        >
                          {goal.status || 'Active'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Personal Bests */}
            {personalBests.length > 0 && (
              <div className="detail-card">
                <div className="detail-card__header">
                  <h3><FiTrendingUp size={16} /> Personal Bests</h3>
                </div>
                <div className="detail-card__body">
                  <div className="pb-grid">
                    {personalBests.map((pb: any, index: number) => (
                      <div key={index} className="pb-item">
                        <span className="pb-exercise">{pb.exerciseName || pb.exercise}</span>
                        <span className="pb-value">{pb.value} {pb.unit || 'kg'}</span>
                        {pb.achievedDate && (
                          <span className="pb-date">{new Date(pb.achievedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Workouts */}
            {workoutLogs.length > 0 && (
              <div className="detail-card">
                <div className="detail-card__header">
                  <h3><FiActivity size={16} /> Recent Workouts</h3>
                  <span className="record-count">{workoutLogs.length} logs</span>
                </div>
                <div className="detail-card__body">
                  <div className="workouts-list">
                    {workoutLogs.slice(0, 10).map((log: any, index: number) => (
                      <div key={index} className="workout-item">
                        <div className="workout-date">
                          {new Date(log.workoutDate || log.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </div>
                        <div className="workout-info">
                          <span className="workout-type">{log.workoutType || log.type || 'Workout'}</span>
                          {log.duration && <span className="workout-duration">{log.duration} min</span>}
                        </div>
                        {log.caloriesBurned && (
                          <span className="workout-calories">{log.caloriesBurned} kcal</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Body Measurements */}
            {measurements.length > 0 && (
              <div className="detail-card">
                <div className="detail-card__header">
                  <h3><FiUser size={16} /> Body Measurements</h3>
                  <span className="record-count">{measurements.length} records</span>
                </div>
                <div className="detail-card__body">
                  <div className="measurements-list">
                    {measurements.slice(0, 8).map((m: any, index: number) => (
                      <div key={index} className="measurement-item">
                        <div className="measurement-date">
                          {new Date(m.recordDate || m.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                        <div className="measurement-values">
                          {m.weight && <span>Weight: {m.weight}kg</span>}
                          {m.bodyFatPercentage && <span>BF: {m.bodyFatPercentage}%</span>}
                          {m.chest && <span>Chest: {m.chest}cm</span>}
                          {m.waist && <span>Waist: {m.waist}cm</span>}
                          {m.hips && <span>Hips: {m.hips}cm</span>}
                          {m.biceps && <span>Biceps: {m.biceps}cm</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!progressSummary && goals.length === 0 && personalBests.length === 0 && workoutLogs.length === 0 && measurements.length === 0 && (
              <div className="detail-card">
                <div className="detail-card__body">
                  <div className="empty-state">
                    <FiTrendingUp size={32} />
                    <p>No progress data yet</p>
                    <span className="empty-hint">Track weight, measurements, goals, and workouts over time</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'sessions':
        return (
          <div className="member-detail__sessions">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiCalendar size={16} /> PT Sessions</h3>
                <span className="record-count">{sessions.length} sessions</span>
              </div>
              <div className="detail-card__body">
                {sessions.length === 0 ? (
                  <div className="empty-state">
                    <FiCalendar size={32} />
                    <p>No PT sessions yet</p>
                  </div>
                ) : (
                  <div className="sessions-list">
                    {sessions.map((session: any, index: number) => (
                      <div key={index} className="session-item">
                        <div className="session-info">
                          <span className="session-date">
                            {new Date(session.sessionDate).toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric'
                            })}
                          </span>
                          <span className="session-time">
                            {new Date(session.sessionDate).toLocaleTimeString('en-US', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          <span className="session-trainer">{session.trainerName}</span>
                        </div>
                        <Badge
                          variant={session.status === 'COMPLETED' ? 'active' : session.status === 'SCHEDULED' ? 'info' : 'default'}
                          size="sm"
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

      case 'notes':
        return (
          <div className="member-detail__notes">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiFileText size={16} /> Notes</h3>
                <Button variant="primary" size="sm">Add Note</Button>
              </div>
              <div className="detail-card__body">
                {notes.length === 0 ? (
                  <div className="empty-state">
                    <FiFileText size={32} />
                    <p>No notes yet</p>
                  </div>
                ) : (
                  <div className="notes-list">
                    {notes.map((note: any, index: number) => (
                      <div key={index} className="note-item">
                        <div className="note-content">{note.content}</div>
                        <div className="note-meta">
                          <span className="note-author">{note.authorName}</span>
                          <span className="note-date">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'activity':
        const activityItems: { date: string; type: string; icon: React.ReactNode; description: string; meta?: string }[] = [];

        // Build timeline from check-ins
        attendance.slice(0, 15).forEach((record: any) => {
          activityItems.push({
            date: record.checkInTime || record.createdAt,
            type: 'checkin',
            icon: <FiClock size={14} />,
            description: 'Checked in at the gym',
            meta: record.duration ? `${Math.round(record.duration)} min session` : undefined
          });
        });

        // Build timeline from payments
        payments.slice(0, 10).forEach((payment: any) => {
          activityItems.push({
            date: payment.date || payment.createdAt,
            type: 'payment',
            icon: <FiCreditCard size={14} />,
            description: payment.description || 'Payment made',
            meta: `₹${payment.amount?.toLocaleString() || 0}`
          });
        });

        // Build timeline from sessions
        sessions.slice(0, 10).forEach((session: any) => {
          activityItems.push({
            date: session.sessionDate || session.createdAt,
            type: 'session',
            icon: <FiCalendar size={14} />,
            description: `PT Session${session.trainerName ? ` with ${session.trainerName}` : ''}`,
            meta: session.status
          });
        });

        // Sort by date descending
        activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
          <div className="member-detail__activity">
            <div className="detail-card">
              <div className="detail-card__header">
                <h3><FiActivity size={16} /> Activity Log</h3>
                <span className="record-count">{activityItems.length} events</span>
              </div>
              <div className="detail-card__body">
                {activityItems.length === 0 ? (
                  <div className="empty-state">
                    <FiActivity size={32} />
                    <p>No activity recorded yet</p>
                  </div>
                ) : (
                  <div className="activity-timeline">
                    {activityItems.slice(0, 30).map((item, index) => (
                      <div key={index} className={`activity-item activity-item--${item.type}`}>
                        <div className="activity-icon">{item.icon}</div>
                        <div className="activity-line" />
                        <div className="activity-content">
                          <span className="activity-desc">{item.description}</span>
                          {item.meta && <span className="activity-meta">{item.meta}</span>}
                          <span className="activity-date">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
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
    <div className="member-detail">
      {/* Header */}
      <div className="member-detail__header">
        <button className="back-btn" onClick={() => navigate('/members')}>
          <FiArrowLeft size={20} />
        </button>

        <div className="member-detail__title-section">
          <Avatar name={member.fullName} size="lg" />
          <div className="member-detail__title-info">
            <h1>{member.fullName}</h1>
            <div className="member-detail__meta">
              <span className="member-id">#{member.userId.toString().padStart(4, '0')}</span>
              <span className="separator">•</span>
              <span className="member-email">{member.email}</span>
              {member.phone && (
                <>
                  <span className="separator">•</span>
                  <span className="member-phone">{member.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="member-detail__actions">
          <Button variant="secondary" onClick={() => { }}>
            <FiMessageSquare size={14} /> Message
          </Button>
          <Button variant="secondary" onClick={() => { }}>
            <FiPrinter size={14} /> Print Card
          </Button>
          <Button variant="primary" onClick={() => { }}>
            <FiEdit2 size={14} /> Edit
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="member-detail__quick-stats">
        <div className="quick-stat">
          <span className="quick-stat__label">Membership Status</span>
          <span className="quick-stat__value">{getStatusBadge()}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat__label">Current Plan</span>
          <span className="quick-stat__value">{membershipStats?.planName || 'No Plan'}</span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat__label">Days Remaining</span>
          <span className={`quick-stat__value ${membershipStats?.isExpired ? 'expired' : (membershipStats?.daysLeft ?? 99) <= 7 ? 'warning' : ''}`}>
            {membershipStats?.isExpired
              ? `Expired ${membershipStats.daysLeft ?? 0}d ago`
              : membershipStats
                ? `${membershipStats.daysLeft ?? 0} days`
                : '—'}
          </span>
        </div>
        <div className="quick-stat">
          <span className="quick-stat__label">Trainer</span>
          <span className="quick-stat__value">{member.trainerName || 'Not Assigned'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="member-detail__tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiUser size={14} /> Overview
        </button>
        <button
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <FiClock size={14} /> Attendance
        </button>
        <button
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <FiCreditCard size={14} /> Payments
        </button>
        <button
          className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <FiTrendingUp size={14} /> Progress
        </button>
        <button
          className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <FiCalendar size={14} /> Sessions
        </button>
        <button
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <FiFileText size={14} /> Notes
        </button>
        <button
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <FiActivity size={14} /> Activity
        </button>
      </div>

      {/* Tab Content */}
      <div className="member-detail__content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MemberDetail;
