import React, { useState, useEffect } from 'react';
import { X, Check, UserX, Clock, Save, Loader2, AlertCircle } from 'lucide-react';
import { trainerApi } from '../../services/trainerApi';
import type { ClassAttendee } from '../../services/trainerApi';
import './ClassAttendanceModal.css';

interface ClassAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: number | null;
    classTitle: string;
    onSave: () => void;
}

const ClassAttendanceModal: React.FC<ClassAttendanceModalProps> = ({
    isOpen,
    onClose,
    classId,
    classTitle,
    onSave
}) => {
    const [attendees, setAttendees] = useState<ClassAttendee[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial fetch when modal opens
    useEffect(() => {
        if (isOpen && classId) {
            fetchAttendees(classId);
        } else {
            setAttendees([]);
        }
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

    const handleStatusChange = (memberId: number, newStatus: 'CONFIRMED' | 'PENDING' | 'ABSENT') => {
        setAttendees(prev => prev.map(a =>
            a.memberId === memberId ? { ...a, status: newStatus } : a
        ));
    };

    const handleSave = async () => {
        if (!classId) return;
        setSaving(true);
        try {
            // Prepare updates payload
            const updates = attendees.map(a => ({
                attendeeId: a.id,
                status: a.status
            }));
            await trainerApi.updateAttendance(classId, updates);
            onSave(); // Trigger parent refresh
            onClose();
        } catch (err) {
            console.error('Failed to save attendance:', err);
            setError('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Calculate summary stats
    const stats = {
        confirmed: attendees.filter(a => a.status === 'CONFIRMED').length,
        pending: attendees.filter(a => a.status === 'PENDING').length,
        absent: attendees.filter(a => a.status === 'ABSENT').length
    };

    if (!isOpen) return null;

    return (
        <div className="attendance-modal-overlay">
            <div className="attendance-modal">
                <div className="attendance-modal__header">
                    <div className="attendance-modal__title">
                        <h2>Class Attendance</h2>
                        <p className="attendance-modal__subtitle">
                            {classTitle}
                        </p>
                    </div>
                    <button className="attendance-modal__close" onClick={onClose}>
                        <X size={20} />
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
                            <div className="attendance-summary">
                                <div className="summary-item">
                                    <span className="summary-value confirmed">{stats.confirmed}</span>
                                    <span className="summary-label">Present</span>
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
                                                <span className="attendee-status-label">
                                                    {attendee.status.toLowerCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="attendee-actions">
                                            <button
                                                className={`status-btn confirmed ${attendee.status === 'CONFIRMED' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(attendee.memberId, 'CONFIRMED')}
                                                title="Mark Present"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                className={`status-btn pending ${attendee.status === 'PENDING' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(attendee.memberId, 'PENDING')}
                                                title="Mark Pending"
                                            >
                                                <Clock size={16} />
                                            </button>
                                            <button
                                                className={`status-btn absent ${attendee.status === 'ABSENT' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(attendee.memberId, 'ABSENT')}
                                                title="Mark Absent"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="attendance-modal__footer">
                    <button className="btn-secondary" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving || loading}>
                        {saving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassAttendanceModal;
