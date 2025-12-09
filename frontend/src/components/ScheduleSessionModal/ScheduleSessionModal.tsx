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
      // If backend fails, use default time slots
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
      console.error('Error scheduling session:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Schedule PT Session"
    >
      <form onSubmit={handleSubmit} className="schedule-session-modal__content">
        {error && (
          <div style={{ 
            padding: 'var(--spacing-3)', 
            background: 'var(--color-error-50)', 
            color: 'var(--color-error-700)',
            borderRadius: 'var(--radius-base)',
            fontSize: 'var(--font-size-sm)'
          }}>
            {error}
          </div>
        )}

        <div className="schedule-session-modal__row">
          <div className="schedule-session-modal__form-group">
            <label className="schedule-session-modal__label">
              Trainer <span className="schedule-session-modal__required">*</span>
            </label>
            <select
              className="schedule-session-modal__select"
              value={trainerId || ''}
              onChange={(e) => setTrainerId(Number(e.target.value))}
              required
            >
              <option value="">Select Trainer</option>
              {trainers.map(trainer => (
                <option key={trainer.userId} value={trainer.userId}>
                  {trainer.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="schedule-session-modal__form-group">
            <label className="schedule-session-modal__label">
              Member <span className="schedule-session-modal__required">*</span>
            </label>
            <select
              className="schedule-session-modal__select"
              value={memberId || ''}
              onChange={(e) => setMemberId(Number(e.target.value))}
              required
            >
              <option value="">Select Member</option>
              {members.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="schedule-session-modal__row">
          <div className="schedule-session-modal__form-group">
            <label className="schedule-session-modal__label">
              Date <span className="schedule-session-modal__required">*</span>
            </label>
            <input
              type="date"
              className="schedule-session-modal__input"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              min={getTodayDate()}
              required
            />
          </div>

          <div className="schedule-session-modal__form-group">
            <label className="schedule-session-modal__label">
              Duration (minutes) <span className="schedule-session-modal__required">*</span>
            </label>
            <select
              className="schedule-session-modal__select"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>
        </div>

        <div className="schedule-session-modal__form-group">
          <label className="schedule-session-modal__label">
            Time <span className="schedule-session-modal__required">*</span>
          </label>
          <input
            type="time"
            className="schedule-session-modal__input"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
          />
        </div>

        {trainerId && sessionDate && availableSlots.length > 0 && (
          <div className="schedule-session-modal__available-slots">
            <label className="schedule-session-modal__label">
              Quick Select Time Slots
            </label>
            {loadingSlots ? (
              <div className="schedule-session-modal__loading">Loading available slots...</div>
            ) : (
              <div className="schedule-session-modal__slots-grid">
                {availableSlots.slice(0, 12).map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`schedule-session-modal__slot-btn ${
                      selectedTime === slot.startTime.split('T')[1].substring(0, 5) ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedTime(slot.startTime.split('T')[1].substring(0, 5))}
                    disabled={!slot.isAvailable}
                  >
                    {slot.startTime.split('T')[1].substring(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="schedule-session-modal__form-group">
          <label className="schedule-session-modal__label">Session Notes</label>
          <textarea
            className="schedule-session-modal__textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this session..."
          />
        </div>

        <div className="schedule-session-modal__checkbox-group">
          <input
            type="checkbox"
            id="recurring"
            className="schedule-session-modal__checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          <label htmlFor="recurring" className="schedule-session-modal__checkbox-label">
            Make this a recurring session
          </label>
        </div>

        {isRecurring && (
          <div className="schedule-session-modal__recurring-options">
            <div className="schedule-session-modal__row">
              <div className="schedule-session-modal__form-group">
                <label className="schedule-session-modal__label">Frequency</label>
                <select
                  className="schedule-session-modal__select"
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as RecurringFrequency)}
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                </select>
              </div>

              <div className="schedule-session-modal__form-group">
                <label className="schedule-session-modal__label">Number of Sessions</label>
                <input
                  type="number"
                  className="schedule-session-modal__input"
                  value={occurrences}
                  onChange={(e) => setOccurrences(Number(e.target.value))}
                  min={2}
                  max={52}
                />
              </div>
            </div>
          </div>
        )}

        <div className="schedule-session-modal__actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Scheduling...' : isRecurring ? 'Schedule Sessions' : 'Schedule Session'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleSessionModal;
