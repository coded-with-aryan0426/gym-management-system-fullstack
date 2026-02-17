import React, { useState, useEffect } from 'react';
import { ptSessionApi } from '../../services/api';
import { showToast } from '../../utils/toast';
import type { User } from '../../types/user';
import type { PTSessionDTO, AvailableSlotDTO, RecurringFrequency } from '../../types/ptSession';
import Modal from '../Modal/Modal';
import Button from '../base/Button';
import './ScheduleSessionModal.css';

interface ScheduleSessionModalProps {
  trainers: User[];
  members: User[];
  onClose: () => void;
  onSuccess: () => void;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 min', icon: '⚡' },
  { value: 45, label: '45 min', icon: '🏃' },
  { value: 60, label: '60 min', icon: '💪' },
  { value: 90, label: '90 min', icon: '🔥' },
];

const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  trainers,
  members,
  onClose,
  onSuccess
}) => {
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [sessionDate, setSessionDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('WEEKLY');
  const [occurrences, setOccurrences] = useState(4);

  const [availableSlots, setAvailableSlots] = useState<AvailableSlotDTO[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trainerId && sessionDate) {
      loadAvailableSlots();
    }
  }, [trainerId, sessionDate]);

  const generateDefaultSlots = (): AvailableSlotDTO[] => {
    const slots: AvailableSlotDTO[] = [];
    const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    hours.forEach(hour => {
      [0, 30].forEach(minute => {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          startTime: `${sessionDate}T${timeStr}:00`,
          endTime: `${sessionDate}T${(hour + 1).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
          isAvailable: true,
          durationMinutes: 60
        });
      });
    });
    return slots;
  };

  const loadAvailableSlots = async () => {
    if (!trainerId || !sessionDate) return;
    try {
      setLoadingSlots(true);
      const slots = await ptSessionApi.getAvailableSlots(trainerId, sessionDate);
      setAvailableSlots(slots.length > 0 ? slots : generateDefaultSlots());
    } catch (err) {
      console.error('Error loading slots, using default slots:', err);
      setAvailableSlots(generateDefaultSlots());
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerId || !memberId || !sessionDate || !selectedTime) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const sessionDateTime = `${sessionDate}T${selectedTime}:00`;
      if (isRecurring) {
        await ptSessionApi.createRecurringSessions({
          trainerId,
          memberId,
          startDate: sessionDateTime,
          durationMinutes,
          frequency: recurringFrequency,
          occurrences
        });
        showToast.success(`${occurrences} recurring sessions scheduled successfully!`);
      } else {
        const session: PTSessionDTO = {
          trainerId,
          memberId,
          sessionDate: sessionDateTime,
          durationMinutes,
          status: 'SCHEDULED',
          progressNotes: notes || undefined
        };
        await ptSessionApi.createSession(session);
        showToast.success('Session scheduled successfully!');
      }
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to schedule session';
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const selectedTrainer = trainers.find(t => t.userId === trainerId);
  const selectedMember = members.find(m => m.userId === memberId);

  const formatSlotTime = (slot: AvailableSlotDTO) =>
    slot.startTime.split('T')[1].substring(0, 5);

  const getTimeLabel = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const isPeakHour = (time: string) => {
    const h = parseInt(time.split(':')[0]);
    return (h >= 7 && h <= 9) || (h >= 17 && h <= 19);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Schedule PT Session">
      <form onSubmit={handleSubmit} className="ssm">
        {error && (
          <div className="ssm-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
          </div>
        )}

        {/* Section 1: People */}
        <div className="ssm-section ssm-section--people">
          <div className="ssm-section__header">
            <span className="ssm-section__icon ssm-section__icon--people">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span className="ssm-section__title">People</span>
          </div>
          <div className="ssm-section__body">
            <div className="ssm-people-grid">
              <div className="ssm-person-pick">
                <label className="ssm-label">Trainer <span className="ssm-req">*</span></label>
                <select
                  className="ssm-select"
                  value={trainerId || ''}
                  onChange={(e) => setTrainerId(Number(e.target.value))}
                  required
                >
                  <option value="">Choose a trainer...</option>
                  {trainers.map(trainer => (
                    <option key={trainer.userId} value={trainer.userId}>
                      {trainer.fullName}
                    </option>
                  ))}
                </select>
                {selectedTrainer && (
                  <div className="ssm-person-badge ssm-person-badge--trainer">
                    <div className="ssm-person-avatar ssm-person-avatar--trainer">
                      {selectedTrainer.fullName.charAt(0)}
                    </div>
                    <span>{selectedTrainer.fullName}</span>
                  </div>
                )}
              </div>

              <div className="ssm-people-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>

              <div className="ssm-person-pick">
                <label className="ssm-label">Member <span className="ssm-req">*</span></label>
                <select
                  className="ssm-select"
                  value={memberId || ''}
                  onChange={(e) => setMemberId(Number(e.target.value))}
                  required
                >
                  <option value="">Choose a member...</option>
                  {members.map(member => (
                    <option key={member.userId} value={member.userId}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
                {selectedMember && (
                  <div className="ssm-person-badge ssm-person-badge--member">
                    <div className="ssm-person-avatar ssm-person-avatar--member">
                      {selectedMember.fullName.charAt(0)}
                    </div>
                    <span>{selectedMember.fullName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Date & Duration */}
        <div className="ssm-section ssm-section--schedule">
          <div className="ssm-section__header">
            <span className="ssm-section__icon ssm-section__icon--schedule">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            <span className="ssm-section__title">Date & Duration</span>
          </div>
          <div className="ssm-section__body">
            <div className="ssm-date-dur-row">
              <div className="ssm-field">
                <label className="ssm-label">Date <span className="ssm-req">*</span></label>
                <input
                  type="date"
                  className="ssm-input"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  min={getTodayDate()}
                  required
                />
              </div>
              <div className="ssm-field ssm-field--duration">
                <label className="ssm-label">Duration</label>
                <div className="ssm-duration-chips">
                  {DURATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`ssm-dur-chip ${durationMinutes === opt.value ? 'ssm-dur-chip--active' : ''}`}
                      onClick={() => setDurationMinutes(opt.value)}
                    >
                      <span className="ssm-dur-chip__icon">{opt.icon}</span>
                      <span className="ssm-dur-chip__label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Time Selection */}
        <div className="ssm-section ssm-section--time">
          <div className="ssm-section__header">
            <span className="ssm-section__icon ssm-section__icon--time">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <span className="ssm-section__title">Time</span>
            {selectedTime && (
              <span className="ssm-section__badge">{getTimeLabel(selectedTime)}</span>
            )}
          </div>
          <div className="ssm-section__body">
            <div className="ssm-field">
              <label className="ssm-label">Pick a time <span className="ssm-req">*</span></label>
              <input
                type="time"
                className="ssm-input ssm-input--time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              />
            </div>

            {trainerId && sessionDate && (
              <div className="ssm-slots-section">
                <label className="ssm-label ssm-label--slots">
                  Or pick a quick slot
                  {loadingSlots && <span className="ssm-loading-dot" />}
                </label>
                {!loadingSlots && availableSlots.length > 0 && (
                  <div className="ssm-slots-grid">
                    {availableSlots.slice(0, 16).map((slot, idx) => {
                      const time = formatSlotTime(slot);
                      const isSelected = selectedTime === time;
                      const peak = isPeakHour(time);
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`ssm-slot ${isSelected ? 'ssm-slot--selected' : ''} ${peak ? 'ssm-slot--peak' : ''} ${!slot.isAvailable ? 'ssm-slot--disabled' : ''}`}
                          onClick={() => slot.isAvailable && setSelectedTime(time)}
                          disabled={!slot.isAvailable}
                        >
                          <span className="ssm-slot__time">{getTimeLabel(time)}</span>
                          {peak && <span className="ssm-slot__peak-tag">Peak</span>}
                          {!slot.isAvailable && <span className="ssm-slot__unavail">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="ssm-section ssm-section--notes">
          <div className="ssm-section__header">
            <span className="ssm-section__icon ssm-section__icon--notes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </span>
            <span className="ssm-section__title">Notes</span>
            <span className="ssm-section__optional">Optional</span>
          </div>
          <div className="ssm-section__body">
            <textarea
              className="ssm-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Goals, focus areas, injuries to watch for..."
              rows={3}
            />
          </div>
        </div>

        {/* Section 5: Recurring Toggle */}
        <div className="ssm-section ssm-section--recurring">
          <div
            className={`ssm-recurring-toggle ${isRecurring ? 'ssm-recurring-toggle--on' : ''}`}
            onClick={() => setIsRecurring(!isRecurring)}
          >
            <div className="ssm-recurring-toggle__left">
              <span className="ssm-section__icon ssm-section__icon--recurring">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              </span>
              <div>
                <span className="ssm-recurring-toggle__title">Recurring Session</span>
                <span className="ssm-recurring-toggle__desc">Automatically repeat this session</span>
              </div>
            </div>
            <div className={`ssm-switch ${isRecurring ? 'ssm-switch--on' : ''}`}>
              <div className="ssm-switch__thumb" />
            </div>
          </div>

          {isRecurring && (
            <div className="ssm-recurring-opts">
              <div className="ssm-recurring-row">
                <div className="ssm-field">
                  <label className="ssm-label">Frequency</label>
                  <div className="ssm-freq-chips">
                    {(['WEEKLY', 'BIWEEKLY'] as RecurringFrequency[]).map(freq => (
                      <button
                        key={freq}
                        type="button"
                        className={`ssm-freq-chip ${recurringFrequency === freq ? 'ssm-freq-chip--active' : ''}`}
                        onClick={() => setRecurringFrequency(freq)}
                      >
                        {freq === 'WEEKLY' ? 'Every Week' : 'Every 2 Weeks'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ssm-field">
                  <label className="ssm-label">Sessions</label>
                  <div className="ssm-occ-stepper">
                    <button type="button" className="ssm-occ-btn" onClick={() => setOccurrences(Math.max(2, occurrences - 1))}>−</button>
                    <span className="ssm-occ-value">{occurrences}</span>
                    <button type="button" className="ssm-occ-btn" onClick={() => setOccurrences(Math.min(52, occurrences + 1))}>+</button>
                  </div>
                </div>
              </div>
              <div className="ssm-recurring-summary">
                {occurrences} sessions, {recurringFrequency === 'WEEKLY' ? 'every week' : 'every 2 weeks'}
                {sessionDate && selectedTime && (
                  <> starting {new Date(sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {getTimeLabel(selectedTime)}</>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary bar */}
        {trainerId && memberId && sessionDate && selectedTime && (
          <div className="ssm-summary">
            <div className="ssm-summary__left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>
                <strong>{selectedTrainer?.fullName}</strong> with <strong>{selectedMember?.fullName}</strong>
                {' · '}
                {new Date(sessionDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {' · '}
                {getTimeLabel(selectedTime)} · {durationMinutes}min
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="ssm-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Scheduling...' : isRecurring ? `Schedule ${occurrences} Sessions` : 'Schedule Session'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleSessionModal;
