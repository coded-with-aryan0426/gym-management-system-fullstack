import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  List, 
  Plus, 
  Repeat, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  User,
  Dumbbell
} from 'lucide-react';
import { ptSessionApi } from '../../services/api';
import api from '../../services/api';
import type { PTSessionDTO } from '../../types/ptSession';
import type { User as UserType } from '../../types/user';
import Button from '../../components/base/Button';
import Badge from '../../components/base/Badge';
import LoadingSpinner from '../../components/utilities/LoadingSpinner';
import ErrorMessage from '../../components/utilities/ErrorMessage';
import EmptyState from '../../components/utilities/EmptyState';
import ScheduleSessionModal from '../../components/ScheduleSessionModal/ScheduleSessionModal';
import SessionDetailsModal from '../../components/SessionDetailsModal/SessionDetailsModal';
import './PTSessions.css';

type ViewMode = 'calendar' | 'list';
type FilterStatus = 'all' | 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PTSessions: React.FC = () => {
  const [sessions, setSessions] = useState<PTSessionDTO[]>([]);
  const [trainers, setTrainers] = useState<UserType[]>([]);
  const [members, setMembers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PTSessionDTO | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [trainersData, membersData] = await Promise.all([
        api.getUsers('TRAINER'),
        api.getUsers('CUSTOMER')
      ]);

      setTrainers(trainersData);
      setMembers(membersData);

      if (trainersData.length > 0) {
        await loadSessionsForTrainers(trainersData);
      } else {
        setSessions([]);
      }
    } catch (err) {
      setError('Failed to load data. Please check if the backend is running.');
      console.error('Error loading data:', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsForTrainers = async (trainersList: UserType[]) => {
    try {
      const allSessions = await Promise.all(
        trainersList.map(trainer =>
          ptSessionApi.getTrainerSessions(trainer.userId!).catch(() => [])
        )
      );
      const flatSessions = allSessions.flat();
      setSessions(flatSessions.sort((a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      ));
    } catch (err) {
      console.error('Error loading sessions:', err);
      setSessions([]);
    }
  };

  const loadSessions = useCallback(async () => {
    try {
      let sessionsData: PTSessionDTO[] = [];

      if (selectedTrainerId) {
        sessionsData = await ptSessionApi.getTrainerSessions(selectedTrainerId);
      } else if (selectedMemberId) {
        sessionsData = await ptSessionApi.getMemberSessions(selectedMemberId);
      } else if (trainers.length > 0) {
        const allSessions = await Promise.all(
          trainers.map(trainer => ptSessionApi.getTrainerSessions(trainer.userId!).catch(() => []))
        );
        sessionsData = allSessions.flat();
      }

      setSessions(sessionsData.sort((a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      ));
    } catch (err) {
      console.error('Error loading sessions:', err);
      setSessions([]);
    }
  }, [selectedTrainerId, selectedMemberId, trainers]);

  useEffect(() => {
    if (trainers.length > 0) {
      loadSessions();
    }
  }, [loadSessions, trainers.length]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.sessionDate);
      return sessionDate >= today && sessionDate < tomorrow;
    });

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

    const weekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.sessionDate);
      return sessionDate >= thisWeekStart && sessionDate < thisWeekEnd;
    });

    return {
      total: sessions.length,
      today: todaySessions.length,
      thisWeek: weekSessions.length,
      scheduled: sessions.filter(s => s.status === 'SCHEDULED').length,
      completed: sessions.filter(s => s.status === 'COMPLETED').length,
      missed: sessions.filter(s => s.status === 'MISSED').length,
      cancelled: sessions.filter(s => s.status === 'CANCELLED').length,
      completionRate: sessions.length > 0 
        ? Math.round((sessions.filter(s => s.status === 'COMPLETED').length / sessions.length) * 100)
        : 0
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let result = sessions;

    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }

    if (selectedTrainerId) {
      result = result.filter(s => s.trainerId === selectedTrainerId);
    }

    if (selectedMemberId) {
      result = result.filter(s => s.memberId === selectedMemberId);
    }

    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      result = result.filter(s => s.sessionDate.startsWith(dateStr));
    }

    return result;
  }, [sessions, filterStatus, selectedTrainerId, selectedMemberId, selectedDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: { date: Date; isCurrentMonth: boolean; sessions: PTSessionDTO[] }[] = [];
    
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, sessions: [] });
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.sessionDate.startsWith(dateStr));
      days.push({ date, isCurrentMonth: true, sessions: daySessions });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, sessions: [] });
    }
    
    return days;
  }, [currentDate, sessions]);

  const handleScheduleSuccess = () => {
    setShowScheduleModal(false);
    loadSessions();
  };

  const handleSessionClick = (session: PTSessionDTO) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const handleSessionUpdate = () => {
    setShowDetailsModal(false);
    loadSessions();
  };

  const handleDateClick = (date: Date) => {
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'info';
      case 'COMPLETED': return 'success';
      case 'MISSED': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return <Clock size={14} />;
      case 'COMPLETED': return <CheckCircle size={14} />;
      case 'MISSED': return <AlertCircle size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
      default: return null;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setSelectedTrainerId(null);
    setSelectedMemberId(null);
    setSelectedDate(null);
  };

  const hasActiveFilters = filterStatus !== 'all' || selectedTrainerId || selectedMemberId || selectedDate;

  if (loading) {
    return (
      <div className="pt-sessions">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-sessions">
        <ErrorMessage message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="pt-sessions">
      <div className="pt-sessions__main">
        <div className="pt-sessions__toolbar">
          <div className="pt-sessions__toolbar-left">
            <div className="pt-sessions__view-toggle">
              <button
                className={`pt-view-btn ${viewMode === 'calendar' ? 'pt-view-btn--active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <Calendar size={16} />
                <span>Calendar</span>
              </button>
              <button
                className={`pt-view-btn ${viewMode === 'list' ? 'pt-view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
                <span>List</span>
              </button>
            </div>

            <div className="pt-sessions__filter-wrapper">
              <button 
                className={`pt-filter-btn ${isFilterOpen ? 'pt-filter-btn--active' : ''} ${hasActiveFilters ? 'pt-filter-btn--has-filters' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={14} />
                <span>Filters</span>
                {hasActiveFilters && <span className="pt-filter-count">!</span>}
              </button>

              {isFilterOpen && (
                <div className="pt-filter-dropdown">
                  <div className="pt-filter-dropdown__header">
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <button className="pt-filter-clear" onClick={clearFilters}>Clear all</button>
                    )}
                  </div>
                  
                  <div className="pt-filter-group">
                    <label>Status</label>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    >
                      <option value="all">All Status</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="MISSED">Missed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="pt-filter-group">
                    <label>Trainer</label>
                    <select 
                      value={selectedTrainerId || ''} 
                      onChange={(e) => setSelectedTrainerId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">All Trainers</option>
                      {trainers.map(trainer => (
                        <option key={trainer.userId} value={trainer.userId}>
                          {trainer.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-filter-group">
                    <label>Member</label>
                    <select 
                      value={selectedMemberId || ''} 
                      onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">All Members</option>
                      {members.map(member => (
                        <option key={member.userId} value={member.userId}>
                          {member.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              </div>

              {hasActiveFilters && (
                <div className="pt-sessions__active-filters">
                  {filterStatus !== 'all' && (
                    <span className="pt-filter-chip">
                      {filterStatus}
                      <button onClick={() => setFilterStatus('all')}>×</button>
                    </span>
                  )}
                  {selectedTrainerId && (
                    <span className="pt-filter-chip">
                      {trainers.find(t => t.userId === selectedTrainerId)?.fullName}
                      <button onClick={() => setSelectedTrainerId(null)}>×</button>
                    </span>
                  )}
                  {selectedMemberId && (
                    <span className="pt-filter-chip">
                      {members.find(m => m.userId === selectedMemberId)?.fullName}
                      <button onClick={() => setSelectedMemberId(null)}>×</button>
                    </span>
                  )}
                  {selectedDate && (
                    <span className="pt-filter-chip">
                      {selectedDate.toLocaleDateString()}
                      <button onClick={() => setSelectedDate(null)}>×</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-sessions__toolbar-right">
              <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
                <Plus size={16} />
                <span>Schedule Session</span>
              </Button>
            </div>
          </div>

        <div className="pt-sessions__content-wrapper">
          <div className="pt-sessions__calendar-area">
            {viewMode === 'calendar' ? (
              <div className="pt-calendar">
                <div className="pt-calendar__header">
                  <div className="pt-calendar__nav">
                    <button className="pt-calendar__nav-btn" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="pt-calendar__title">
                      {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <button className="pt-calendar__nav-btn" onClick={() => navigateMonth('next')}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <button className="pt-calendar__today-btn" onClick={goToToday}>
                    Today
                  </button>
                </div>

                <div className="pt-calendar__grid">
                  <div className="pt-calendar__weekdays">
                    {DAYS.map(day => (
                      <div key={day} className="pt-calendar__weekday">{day}</div>
                    ))}
                  </div>

                  <div className="pt-calendar__days">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`pt-calendar__day ${!day.isCurrentMonth ? 'pt-calendar__day--other' : ''} ${isToday(day.date) ? 'pt-calendar__day--today' : ''} ${selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'pt-calendar__day--selected' : ''} ${day.sessions.length > 0 ? 'pt-calendar__day--has-sessions' : ''}`}
                        onClick={() => handleDateClick(day.date)}
                      >
                        <span className="pt-calendar__day-number">{day.date.getDate()}</span>
                        {day.sessions.length > 0 && (
                          <div className="pt-calendar__day-sessions">
                            {day.sessions.slice(0, 3).map((session, i) => (
                              <div 
                                key={session.sessionId} 
                                className={`pt-calendar__session-dot pt-calendar__session-dot--${session.status.toLowerCase()}`}
                                title={`${session.trainerName} - ${session.memberName}`}
                              />
                            ))}
                            {day.sessions.length > 3 && (
                              <span className="pt-calendar__more">+{day.sessions.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className="pt-calendar__day-detail">
                    <h4 className="pt-calendar__day-detail-title">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h4>
                    {filteredSessions.length === 0 ? (
                      <p className="pt-calendar__no-sessions">No sessions scheduled</p>
                    ) : (
                      <div className="pt-calendar__day-sessions-list">
                        {filteredSessions.map(session => (
                          <div 
                            key={session.sessionId} 
                            className="pt-mini-session"
                            onClick={() => handleSessionClick(session)}
                          >
                            <div className="pt-mini-session__time">
                              {new Date(session.sessionDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="pt-mini-session__info">
                              <span className="pt-mini-session__trainer">
                                <Dumbbell size={12} /> {session.trainerName}
                              </span>
                              <span className="pt-mini-session__member">
                                <User size={12} /> {session.memberName}
                              </span>
                            </div>
                            <Badge variant={getStatusColor(session.status) as any} size="sm">
                              {getStatusIcon(session.status)}
                              {session.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-sessions__list">
                {filteredSessions.length === 0 ? (
                  <EmptyState
                    icon={<Calendar size={48} />}
                    title="No sessions found"
                    description={hasActiveFilters ? "No sessions match your filters" : "Schedule your first PT session to get started"}
                    action={
                      <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
                        <Plus size={18} />
                        Schedule Session
                      </Button>
                    }
                  />
                ) : (
                  <div className="pt-sessions__table-wrapper">
                    <table className="pt-sessions__table">
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Trainer</th>
                          <th>Member</th>
                          <th>Duration</th>
                          <th>Status</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSessions.map(session => (
                          <tr 
                            key={session.sessionId} 
                            onClick={() => handleSessionClick(session)}
                            className="pt-sessions__table-row"
                          >
                            <td>
                              <div className="pt-session-datetime">
                                <span className="pt-session-date">
                                  {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span className="pt-session-time">
                                  {new Date(session.sessionDate).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="pt-session-person">
                                <div className="pt-session-avatar pt-session-avatar--trainer">
                                  {session.trainerName?.charAt(0) || 'T'}
                                </div>
                                <span>{session.trainerName}</span>
                              </div>
                            </td>
                            <td>
                              <div className="pt-session-person">
                                <div className="pt-session-avatar pt-session-avatar--member">
                                  {session.memberName?.charAt(0) || 'M'}
                                </div>
                                <span>{session.memberName}</span>
                              </div>
                            </td>
                            <td>
                              <span className="pt-session-duration">{session.durationMinutes} min</span>
                            </td>
                            <td>
                              <Badge variant={getStatusColor(session.status) as any}>
                                {getStatusIcon(session.status)}
                                {session.status}
                              </Badge>
                            </td>
                            <td>
                              {session.isRecurring ? (
                                <span className="pt-session-recurring">
                                  <Repeat size={14} />
                                  {session.recurringFrequency}
                                </span>
                              ) : (
                                <span className="pt-session-single">One-time</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-sessions__stats-sidebar">
            <div className="pt-stat-card pt-stat-card--primary">
              <div className="pt-stat-card__icon">
                <Calendar size={18} />
              </div>
              <div className="pt-stat-card__content">
                <span className="pt-stat-card__value">{stats.today}</span>
                <span className="pt-stat-card__label">Today</span>
              </div>
            </div>

            <div className="pt-stat-card pt-stat-card--info">
              <div className="pt-stat-card__icon">
                <Clock size={18} />
              </div>
              <div className="pt-stat-card__content">
                <span className="pt-stat-card__value">{stats.scheduled}</span>
                <span className="pt-stat-card__label">Scheduled</span>
              </div>
            </div>

            <div className="pt-stat-card pt-stat-card--success">
              <div className="pt-stat-card__icon">
                <CheckCircle size={18} />
              </div>
              <div className="pt-stat-card__content">
                <span className="pt-stat-card__value">{stats.completed}</span>
                <span className="pt-stat-card__label">Completed</span>
              </div>
            </div>

            <div className="pt-stat-card pt-stat-card--warning">
              <div className="pt-stat-card__icon">
                <TrendingUp size={18} />
              </div>
              <div className="pt-stat-card__content">
                <span className="pt-stat-card__value">{stats.completionRate}%</span>
                <span className="pt-stat-card__label">Rate</span>
              </div>
            </div>

            <div className="pt-stat-card pt-stat-card--missed">
              <div className="pt-stat-card__icon">
                <AlertCircle size={18} />
              </div>
              <div className="pt-stat-card__content">
                <span className="pt-stat-card__value">{stats.missed}</span>
                <span className="pt-stat-card__label">Missed</span>
              </div>
            </div>

            <div className="pt-stat-card pt-stat-card--cancelled">
              <div className="pt-stat-card__icon">
                <XCircle size={18} />
              </div>
              <div className="pt-stat-card__content">
                <span className="pt-stat-card__value">{stats.cancelled}</span>
                <span className="pt-stat-card__label">Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-sessions__quick-stats">
        <div className="pt-quick-stat">
          <Users size={16} />
          <span><strong>{trainers.length}</strong> Trainers</span>
        </div>
        <div className="pt-quick-stat">
          <User size={16} />
          <span><strong>{members.length}</strong> Members</span>
        </div>
        <div className="pt-quick-stat">
          <Calendar size={16} />
          <span><strong>{stats.thisWeek}</strong> This Week</span>
        </div>
      </div>

      {showScheduleModal && (
        <ScheduleSessionModal
          trainers={trainers}
          members={members}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {showDetailsModal && selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={handleSessionUpdate}
        />
      )}
    </div>
  );
};

export default PTSessions;
