import React, { useState, useEffect } from 'react';
import { Calendar, List, Plus, Repeat } from 'lucide-react';
import { ptSessionApi } from '../../services/api';
import api from '../../services/api';
import type { PTSessionDTO } from '../../types/ptSession';
import type { User } from '../../types/user';
import Button from '../../components/base/Button';
import Badge from '../../components/base/Badge';
import LoadingSpinner from '../../components/utilities/LoadingSpinner';
import ErrorMessage from '../../components/utilities/ErrorMessage';
import EmptyState from '../../components/utilities/EmptyState';
import ScheduleSessionModal from '../../components/ScheduleSessionModal/ScheduleSessionModal';
import SessionDetailsModal from '../../components/SessionDetailsModal/SessionDetailsModal';
import './PTSessions.css';

type ViewMode = 'calendar' | 'list';
type FilterMode = 'all' | 'trainer' | 'member';

const PTSessions: React.FC = () => {
  const [sessions, setSessions] = useState<PTSessionDTO[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PTSessionDTO | null>(null);

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

      // Load all sessions from database
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

  const loadSessionsForTrainers = async (trainersList: User[]) => {
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

  const loadSessions = async () => {
    try {
      let sessionsData: PTSessionDTO[] = [];

      if (filterMode === 'trainer' && selectedTrainerId) {
        sessionsData = await ptSessionApi.getTrainerSessions(selectedTrainerId);
      } else if (filterMode === 'member' && selectedMemberId) {
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
  };

  useEffect(() => {
    if (trainers.length > 0) {
      loadSessions();
    }
  }, [filterMode, selectedTrainerId, selectedMemberId]);

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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      SCHEDULED: 'info',
      COMPLETED: 'success',
      MISSED: 'warning',
      CANCELLED: 'error'
    };
    return statusMap[status as keyof typeof statusMap] || 'default';
  };

  // Filter sessions based on selected filter
  const getFilteredSessions = () => {
    if (filterMode === 'trainer' && selectedTrainerId) {
      return sessions.filter(s => s.trainerId === selectedTrainerId);
    }
    if (filterMode === 'member' && selectedMemberId) {
      return sessions.filter(s => s.memberId === selectedMemberId);
    }
    return sessions;
  };

  const filteredSessions = getFilteredSessions();

  const groupSessionsByDate = () => {
    const grouped: { [key: string]: PTSessionDTO[] } = {};

    filteredSessions.forEach(session => {
      const date = new Date(session.sessionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    return grouped;
  };

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

  const groupedSessions = groupSessionsByDate();

  return (
    <div className="pt-sessions">
      <div className="pt-sessions__header">
        <div className="pt-sessions__title-section">
          <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
            <Plus size={18} />
            Schedule Session
          </Button>
        </div>
      </div>

      <div className="pt-sessions__controls">
        <div className="pt-sessions__filters">
          <select
            className="pt-sessions__filter-select"
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value as FilterMode);
              setSelectedTrainerId(null);
              setSelectedMemberId(null);
            }}
          >
            <option value="all">All Sessions</option>
            <option value="trainer">By Trainer</option>
            <option value="member">By Member</option>
          </select>

          {filterMode === 'trainer' && (
            <select
              className="pt-sessions__filter-select"
              value={selectedTrainerId || ''}
              onChange={(e) => setSelectedTrainerId(Number(e.target.value))}
            >
              <option value="">Select Trainer</option>
              {trainers.map(trainer => (
                <option key={trainer.userId} value={trainer.userId}>
                  {trainer.fullName}
                </option>
              ))}
            </select>
          )}

          {filterMode === 'member' && (
            <select
              className="pt-sessions__filter-select"
              value={selectedMemberId || ''}
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="pt-sessions__view-toggle">
          <button
            className={`pt-sessions__view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
            List
          </button>
          <button
            className={`pt-sessions__view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={16} />
            Calendar
          </button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title="No sessions found"
          description={filterMode !== 'all' ? "No sessions match the selected filter" : "Schedule your first PT session to get started"}
          action={
            <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
              <Plus size={18} />
              Schedule Session
            </Button>
          }
        />
      ) : (
        <div className="pt-sessions__content">
          {viewMode === 'list' ? (
            <div className="pt-sessions__list">
              {Object.entries(groupedSessions).map(([date, dateSessions]) => (
                <div key={date} className="pt-sessions__date-group">
                  <h3 className="pt-sessions__date-header">{date}</h3>
                  <div className="pt-sessions__cards">
                    {dateSessions.map(session => (
                      <div
                        key={session.sessionId}
                        className="pt-session-card"
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="pt-session-card__header">
                          <span className="pt-session-card__time">
                            {new Date(session.sessionDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <Badge variant={getStatusBadge(session.status) as any}>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="pt-session-card__content">
                          <p className="pt-session-card__trainer">
                            <strong>Trainer:</strong> {session.trainerName}
                          </p>
                          <p className="pt-session-card__member">
                            <strong>Member:</strong> {session.memberName}
                          </p>
                          <p className="pt-session-card__duration">
                            {session.durationMinutes} minutes
                          </p>
                          {session.isRecurring && (
                            <span className="pt-session-card__recurring">
                              <Repeat size={14} />
                              {session.recurringFrequency}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-sessions__calendar">
              <p className="pt-sessions__calendar-placeholder">
                Calendar view - {filteredSessions.length} sessions
              </p>
            </div>
          )}
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
