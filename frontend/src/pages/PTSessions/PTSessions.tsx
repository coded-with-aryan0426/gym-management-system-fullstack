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
  Dumbbell,
  X,
  Zap,
  Target,
  Eye
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

type ViewMode = 'calendar' | 'list' | 'packages';
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

  const getStatusBgClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'pt-session-card--scheduled';
      case 'COMPLETED': return 'pt-session-card--completed';
      case 'MISSED': return 'pt-session-card--missed';
      case 'CANCELLED': return 'pt-session-card--cancelled';
      default: return '';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
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
      {/* Stats Strip */}
      <div className="pt-stats-strip">
        <div className="pt-stats-strip__item pt-stats-strip__item--today">
          <Zap size={16} />
          <span className="pt-stats-strip__value">{stats.today}</span>
          <span className="pt-stats-strip__label">Today</span>
        </div>
        <div className="pt-stats-strip__divider" />
        <div className="pt-stats-strip__item pt-stats-strip__item--week">
          <Calendar size={16} />
          <span className="pt-stats-strip__value">{stats.thisWeek}</span>
          <span className="pt-stats-strip__label">This Week</span>
        </div>
        <div className="pt-stats-strip__divider" />
        <div className="pt-stats-strip__item pt-stats-strip__item--scheduled">
          <Clock size={16} />
          <span className="pt-stats-strip__value">{stats.scheduled}</span>
          <span className="pt-stats-strip__label">Upcoming</span>
        </div>
        <div className="pt-stats-strip__divider" />
        <div className="pt-stats-strip__item pt-stats-strip__item--completed">
          <CheckCircle size={16} />
          <span className="pt-stats-strip__value">{stats.completed}</span>
          <span className="pt-stats-strip__label">Done</span>
        </div>
        <div className="pt-stats-strip__divider" />
        <div className="pt-stats-strip__item pt-stats-strip__item--rate">
          <TrendingUp size={16} />
          <span className="pt-stats-strip__value">{stats.completionRate}%</span>
          <span className="pt-stats-strip__label">Rate</span>
          <div className="pt-stats-strip__bar">
            <div className="pt-stats-strip__bar-fill" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>
        <div className="pt-stats-strip__divider" />
        <div className="pt-stats-strip__item pt-stats-strip__item--missed">
          <AlertCircle size={16} />
          <span className="pt-stats-strip__value">{stats.missed}</span>
          <span className="pt-stats-strip__label">Missed</span>
        </div>
        <div className="pt-stats-strip__divider" />
        <div className="pt-stats-strip__item pt-stats-strip__item--people">
          <Users size={16} />
          <span className="pt-stats-strip__value">{trainers.length}</span>
          <span className="pt-stats-strip__label">Trainers</span>
        </div>
        <div className="pt-stats-strip__divider" />
        <div className="pt-stats-strip__item pt-stats-strip__item--people">
          <Target size={16} />
          <span className="pt-stats-strip__value">{members.length}</span>
          <span className="pt-stats-strip__label">Members</span>
        </div>
      </div>

      {/* Main Content */}
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
              <button
                className={`pt-view-btn ${viewMode === 'packages' ? 'pt-view-btn--active' : ''}`}
                onClick={() => setViewMode('packages')}
              >
                <Dumbbell size={16} />
                <span>Packages</span>
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
                    <button onClick={() => setFilterStatus('all')}><X size={12} /></button>
                  </span>
                )}
                {selectedTrainerId && (
                  <span className="pt-filter-chip">
                    {trainers.find(t => t.userId === selectedTrainerId)?.fullName}
                    <button onClick={() => setSelectedTrainerId(null)}><X size={12} /></button>
                  </span>
                )}
                {selectedMemberId && (
                  <span className="pt-filter-chip">
                    {members.find(m => m.userId === selectedMemberId)?.fullName}
                    <button onClick={() => setSelectedMemberId(null)}><X size={12} /></button>
                  </span>
                )}
                {selectedDate && (
                  <span className="pt-filter-chip">
                    {selectedDate.toLocaleDateString()}
                    <button onClick={() => setSelectedDate(null)}><X size={12} /></button>
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
                      className={`pt-calendar__day ${!day.isCurrentMonth ? 'pt-calendar__day--other' : ''} ${isToday(day.date) ? 'pt-calendar__day--today' : ''} ${selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'pt-calendar__day--selected' : ''} ${day.sessions.length > 0 ? 'pt-calendar__day--has-sessions' : ''} ${isPast(day.date) && !isToday(day.date) ? 'pt-calendar__day--past' : ''}`}
                      onClick={() => handleDateClick(day.date)}
                    >
                      <span className="pt-calendar__day-number">{day.date.getDate()}</span>
                      {day.sessions.length > 0 && (
                        <div className="pt-calendar__day-events">
                          {day.sessions.slice(0, 3).map((session) => (
                            <div
                              key={session.sessionId}
                              className={`pt-calendar__event-chip pt-calendar__event-chip--${session.status.toLowerCase()}`}
                              onClick={(e) => { e.stopPropagation(); handleSessionClick(session); }}
                              title={`${session.trainerName} with ${session.memberName}`}
                            >
                              <span className="pt-calendar__event-time">
                                {new Date(session.sessionDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </span>
                              <span className="pt-calendar__event-name">
                                {session.trainerName?.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                          {day.sessions.length > 3 && (
                            <span className="pt-calendar__more-badge">+{day.sessions.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Day Detail Panel */}
              {selectedDate && (
                <div className="pt-calendar__detail-panel">
                  <div className="pt-calendar__detail-header">
                    <h4>
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h4>
                    <span className="pt-calendar__detail-count">
                      {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {filteredSessions.length === 0 ? (
                    <div className="pt-calendar__detail-empty">
                      <Calendar size={24} />
                      <p>No sessions on this day</p>
                      <button className="pt-calendar__detail-add" onClick={() => setShowScheduleModal(true)}>
                        <Plus size={14} /> Schedule one
                      </button>
                    </div>
                  ) : (
                    <div className="pt-calendar__detail-list">
                      {filteredSessions.map(session => (
                        <div
                          key={session.sessionId}
                          className={`pt-session-card ${getStatusBgClass(session.status)}`}
                          onClick={() => handleSessionClick(session)}
                        >
                          <div className="pt-session-card__time-block">
                            <span className="pt-session-card__time">
                              {new Date(session.sessionDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="pt-session-card__duration">
                              {session.durationMinutes}m
                            </span>
                          </div>
                          <div className="pt-session-card__body">
                            <div className="pt-session-card__people">
                              <span className="pt-session-card__trainer">
                                <Dumbbell size={13} /> {session.trainerName}
                              </span>
                              <span className="pt-session-card__arrow">→</span>
                              <span className="pt-session-card__member">
                                <User size={13} /> {session.memberName}
                              </span>
                            </div>
                            {session.progressNotes && (
                              <p className="pt-session-card__notes">{session.progressNotes}</p>
                            )}
                          </div>
                          <div className="pt-session-card__status-area">
                            <Badge variant={getStatusColor(session.status) as any} size="sm">
                              {getStatusIcon(session.status)}
                              {session.status}
                            </Badge>
                            {session.isRecurring && (
                              <span className="pt-session-card__recurring">
                                <Repeat size={12} />
                              </span>
                            )}
                          </div>
                          <button className="pt-session-card__view" title="View details">
                            <Eye size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* List View */
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
                <div className="pt-sessions__list-grid">
                  {filteredSessions.map(session => (
                    <div
                      key={session.sessionId}
                      className={`pt-list-card ${getStatusBgClass(session.status)}`}
                      onClick={() => handleSessionClick(session)}
                    >
                      <div className="pt-list-card__left-accent" />
                      <div className="pt-list-card__content">
                        <div className="pt-list-card__top">
                          <div className="pt-list-card__datetime">
                            <span className="pt-list-card__date">
                              {new Date(session.sessionDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </span>
                            <span className="pt-list-card__time">
                              {new Date(session.sessionDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <Badge variant={getStatusColor(session.status) as any} size="sm">
                            {getStatusIcon(session.status)}
                            {session.status}
                          </Badge>
                        </div>
                        <div className="pt-list-card__people">
                          <div className="pt-list-card__person">
                            <div className="pt-list-card__avatar pt-list-card__avatar--trainer">
                              {session.trainerName?.charAt(0) || 'T'}
                            </div>
                            <div className="pt-list-card__person-info">
                              <span className="pt-list-card__person-role">Trainer</span>
                              <span className="pt-list-card__person-name">{session.trainerName}</span>
                            </div>
                          </div>
                          <div className="pt-list-card__connector">
                            <Dumbbell size={14} />
                          </div>
                          <div className="pt-list-card__person">
                            <div className="pt-list-card__avatar pt-list-card__avatar--member">
                              {session.memberName?.charAt(0) || 'M'}
                            </div>
                            <div className="pt-list-card__person-info">
                              <span className="pt-list-card__person-role">Member</span>
                              <span className="pt-list-card__person-name">{session.memberName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-list-card__bottom">
                          <span className="pt-list-card__duration">
                            <Clock size={12} /> {session.durationMinutes} min
                          </span>
                          {session.isRecurring && (
                            <span className="pt-list-card__recurring-badge">
                              <Repeat size={12} /> {session.recurringFrequency}
                            </span>
                          )}
                          {session.progressNotes && (
                            <span className="pt-list-card__has-notes" title={session.progressNotes}>
                              Notes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Packages View */}
      {viewMode === 'packages' && (
        <div className="pt-packages">
          {(() => {
            const memberGroups = new Map<string, { memberName: string; memberId: string; sessions: typeof filteredSessions }>();
            filteredSessions.forEach(s => {
              const key = s.memberId ? String(s.memberId) : (s.memberName || 'Unknown');
              if (!memberGroups.has(key)) {
                memberGroups.set(key, { memberName: s.memberName || 'Unknown', memberId: s.memberId ? String(s.memberId) : '', sessions: [] });
              }
              memberGroups.get(key)!.sessions.push(s);
            });
            const groups = Array.from(memberGroups.values()).sort((a, b) => b.sessions.length - a.sessions.length);
            if (groups.length === 0) {
              return (
                <div className="pt-empty">
                  <Dumbbell size={48} strokeWidth={1} />
                  <h3>No Session Packages</h3>
                  <p>Schedule sessions to see member packages here.</p>
                </div>
              );
            }
            return groups.map(group => {
              const completed = group.sessions.filter(s => s.status === 'COMPLETED').length;
              const scheduled = group.sessions.filter(s => s.status === 'SCHEDULED' || s.status === 'CONFIRMED').length;
              const cancelled = group.sessions.filter(s => s.status === 'CANCELLED' || s.status === 'NO_SHOW').length;
              const total = group.sessions.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;
              return (
                <div key={group.memberId} className="pt-package-card">
                  <div className="pt-package-card__summary">
                    <div className="pt-package-card__header">
                      <div className="pt-package-card__avatar">
                        {group.memberName.charAt(0)}
                      </div>
                      <div className="pt-package-card__info">
                        <h4 className="pt-package-card__name">{group.memberName}</h4>
                        <span className="pt-package-card__count">{total} sessions total</span>
                      </div>
                      <div className="pt-package-card__progress-ring">
                        <svg viewBox="0 0 36 36" className="pt-package-card__ring">
                          <path className="pt-package-card__ring-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path className="pt-package-card__ring-fill" strokeDasharray={`${progress}, 100`} d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="pt-package-card__progress-text">{Math.round(progress)}%</span>
                      </div>
                    </div>
                    <div className="pt-package-card__stats">
                      <div className="pt-package-card__stat">
                        <span className="pt-package-card__stat-value emerald">{completed}</span>
                        <span className="pt-package-card__stat-label">Completed</span>
                      </div>
                      <div className="pt-package-card__stat">
                        <span className="pt-package-card__stat-value blue">{scheduled}</span>
                        <span className="pt-package-card__stat-label">Upcoming</span>
                      </div>
                      <div className="pt-package-card__stat">
                        <span className="pt-package-card__stat-value crimson">{cancelled}</span>
                        <span className="pt-package-card__stat-label">Cancelled</span>
                      </div>
                    </div>
                    <div className="pt-package-card__progress-bar">
                      <div className="pt-package-card__progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="pt-package-card__sessions">
                    {group.sessions.slice(0, 5).map(session => (
                      <div
                        key={session.sessionId}
                        className={`pt-package-card__session-item pt-package-card__session-item--${session.status?.toLowerCase()}`}
                        onClick={() => { setSelectedSession(session); setShowDetailsModal(true); }}
                      >
                        <span className="pt-package-card__session-date">
                          {new Date(session.sessionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="pt-package-card__session-time">
                          {new Date(session.sessionDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="pt-package-card__session-trainer">{session.trainerName}</span>
                        <Badge variant={session.status === 'COMPLETED' ? 'success' : session.status === 'SCHEDULED' ? 'info' : session.status === 'CANCELLED' ? 'danger' : 'warning'}>
                          {session.status}
                        </Badge>
                      </div>
                    ))}
                    {group.sessions.length > 5 && (
                      <div className="pt-package-card__more">+{group.sessions.length - 5} more sessions</div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

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
