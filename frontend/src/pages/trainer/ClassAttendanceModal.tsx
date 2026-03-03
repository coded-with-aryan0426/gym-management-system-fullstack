import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, UserX, Clock, Save, Loader2, AlertCircle, Users } from 'lucide-react';
import { trainerApi } from '../../services/trainerApi';
import type { ClassAttendee } from '../../services/trainerApi';
import './ClassAttendanceModal.css';

type AttendanceStatus = 'CONFIRMED' | 'PENDING' | 'ABSENT' | 'LATE';

interface ClassAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: number | null;
    classTitle: string;
    onSave: () => void;
}

const ClassAttendanceModal: React.FC<ClassAttendanceModalProps> = ({
    isOpen, onClose, classId, classTitle, onSave
}) => {
    const [attendees, setAttendees] = useState<ClassAttendee[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && classId) fetchAttendees(classId);
        else setAttendees([]);
    }, [isOpen, classId]);

    const fetchAttendees = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await trainerApi.getClassAttendees(id);
            setAttendees(data);
        } catch (err) {
            console.error('Failed to fetch attendees:', err);
            setError('Failed to load attendee list');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = useCallback((memberId: number, newStatus: AttendanceStatus) => {
        setAttendees(prev => prev.map(a =>
            a.memberId === memberId ? { ...a, status: newStatus as any } : a
        ));
    }, []);

    // Bulk-mark all present (CONFIRMED)
    const handleMarkAllPresent = useCallback(() => {
        setAttendees(prev => prev.map(a => ({ ...a, status: 'CONFIRMED' as any })));
    }, []);

    const handleSave = async () => {
        if (!classId) return;
        setSaving(true);
        try {
            const updates = attendees.map(a => ({ attendeeId: a.id, status: a.status }));
            await trainerApi.updateAttendance(classId, updates);
            onSave();
            onClose();
        } catch (err) {
            console.error('Failed to save attendance:', err);
            setError('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        confirmed: attendees.filter(a => a.status === 'CONFIRMED').length,
        late: attendees.filter(a => a.status === 'LATE').length,
        pending: attendees.filter(a => a.status === 'PENDING').length,
        absent: attendees.filter(a => a.status === 'ABSENT').length,
    };

    if (!isOpen) return null;

    return (
        <div className="attendance-modal-overlay">
            <div className="attendance-modal">
                {/* Header */}
                <div className="attendance-modal__header">
                    <div className="attendance-modal__title">
                        <h2>Class Attendance</h2>
                        <p className="attendance-modal__subtitle">{classTitle}</p>
                    </div>
                    <button className="attendance-modal__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="attendance-modal__content">
                    {loading ? (
                        <div className="loading-container">
                            <Loader2 className="spinner" size={24} />
                            <span>Loading attendees...</span>
                        </div>
                    ) : error ? (
                        <div className="empty-state">
                            <AlertCircle size={32} style={{ marginBottom: '1rem', color: '#ef4444' }} />
                            <p>{error}</p>
                            <button className="btn-secondary" onClick={() => classId && fetchAttendees(classId)}>
                                Retry
                            </button>
                        </div>
                    ) : attendees.length === 0 ? (
                        <div className="empty-state">
                            <UserX size={32} style={{ marginBottom: '1rem' }} />
                            <p>No members enrolled in this class yet.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary stats */}
                            <div className="attendance-summary">
                                <div className="summary-item">
                                    <span className="summary-value confirmed">{stats.confirmed}</span>
                                    <span className="summary-label">Present</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-value late">{stats.late}</span>
                                    <span className="summary-label">Late</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-value pending">{stats.pending}</span>
                                    <span className="summary-label">Pending</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-value absent">{stats.absent}</span>
                                    <span className="summary-label">Absent</span>
                                </div>
                            </div>

                            {/* Bulk action toolbar */}
                            <div className="attendance-toolbar">
                                <span className="attendance-toolbar__count">
                                    {attendees.length} member{attendees.length !== 1 ? 's' : ''}
                                </span>
                                <button
                                    className="attendance-toolbar__bulk-btn"
                                    onClick={handleMarkAllPresent}
                                    title="Mark everyone present"
                                >
                                    <Users size={13} />
                                    Mark All Present
                                </button>
                            </div>

                            {/* Attendee list */}
                            <div className="attendance-list">
                                {attendees.map(attendee => (
                                    <div key={attendee.id} className="attendee-item">
                                        <div className="attendee-info">
                                            <div className="attendee-avatar">
                                                {attendee.memberName
                                                    ? attendee.memberName.substring(0, 2).toUpperCase()
                                                    : 'U'}
                                            </div>
                                            <div className="attendee-details">
                                                <span className="attendee-name">
                                                    {attendee.memberName || 'Unknown Member'}
                                                </span>
                                                <span className={`attendee-status-label attendee-status-label--${(attendee.status as string).toLowerCase()}`}>
                                                    {(attendee.status as string).toLowerCase()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status buttons: Present / Late / Pending / Absent */}
                                        <div className="attendee-actions">
                                            <button
                                                className={`status-btn confirmed ${attendee.status === 'CONFIRMED' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(attendee.memberId, 'CONFIRMED')}
                                                title="Mark Present"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                className={`status-btn late ${attendee.status === 'LATE' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(attendee.memberId, 'LATE')}
                                                title="Mark Late"
                                            >
                                                <Clock size={14} />
                                            </button>
                                            <button
                                                className={`status-btn absent ${attendee.status === 'ABSENT' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(attendee.memberId, 'ABSENT')}
                                                title="Mark Absent"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="attendance-modal__footer">
                    <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving || loading}>
                        {saving ? <Loader2 size={15} className="spinner" /> : <Save size={15} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassAttendanceModal;
