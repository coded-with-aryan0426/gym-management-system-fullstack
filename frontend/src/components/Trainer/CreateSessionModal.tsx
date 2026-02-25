import React, { useState, useEffect } from 'react';
import {
    X, Calendar, Clock, User, FileText, CheckCircle,
    AlertCircle, Repeat, Zap, ChevronDown
} from 'lucide-react';
import { trainerApi, type TrainerMember } from '../../services/trainerApi';
import './CreateSessionModal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: Date;
    initialTime?: number;
}

const DURATION_PRESETS = [30, 45, 60, 90, 120];

const CreateSessionModal: React.FC<Props> = ({
    isOpen, onClose, onSuccess, initialDate, initialTime
}) => {
    const [members, setMembers]           = useState<TrainerMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [memberId, setMemberId]         = useState('');
    const [date, setDate]                 = useState('');
    const [time, setTime]                 = useState('');
    const [duration, setDuration]         = useState(60);
    const [notes, setNotes]               = useState('');
    const [isRecurring, setIsRecurring]   = useState(false);
    const [submitting, setSubmitting]     = useState(false);
    const [error, setError]               = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        fetchMembers();
        if (initialDate) {
            setDate(initialDate.toISOString().split('T')[0]);
            if (initialTime !== undefined) {
                const h = String(initialTime).padStart(2, '0');
                setTime(`${h}:00`);
            }
        } else {
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, initialDate, initialTime]);

    const fetchMembers = async () => {
        setLoadingMembers(true);
        try {
            const data = await trainerApi.getAssignedMembers();
            setMembers(data);
        } catch {
            setError('Failed to load members');
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); setSubmitting(true);
        try {
            if (!memberId) throw new Error('Please select a member');
            if (!date)     throw new Error('Please select a date');
            if (!time)     throw new Error('Please select a time');
            const sessionDateTime = `${date}T${time}:00`;
            if (new Date(sessionDateTime) < new Date()) throw new Error('Cannot schedule in the past');
            await trainerApi.createPTSession({
                memberId: parseInt(memberId),
                sessionDate: sessionDateTime,
                durationMinutes: duration,
                notes,
                isRecurring,
            });
            onSuccess(); onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create session');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedMember = members.find(m => String(m.id) === memberId);
    const endTime = (() => {
        if (!time) return '';
        const [hh, mm] = time.split(':').map(Number);
        const total = hh * 60 + mm + duration;
        return `${String(Math.floor(total / 60) % 24).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
    })();

    if (!isOpen) return null;

    return (
        <div className="csm-overlay" onClick={onClose}>
            <div className="csm-modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="csm-header">
                    <div className="csm-header__glow"/>
                    <div className="csm-header__left">
                        <div className="csm-header__icon">
                            <Zap size={18}/>
                        </div>
                        <div>
                            <p className="csm-header__sub">Personal Training</p>
                            <h2 className="csm-header__title">Schedule PT Session</h2>
                        </div>
                    </div>
                    <button className="csm-close" onClick={onClose}><X size={16}/></button>
                </div>

                {/* Error */}
                {error && (
                    <div className="csm-error">
                        <AlertCircle size={14}/>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="csm-form">
                    <div className="csm-body">

                        {/* Member selector */}
                        <div className="csm-section">
                            <div className="csm-section__label"><User size={12}/> Member</div>
                            <div className="csm-select-wrap">
                                <select
                                    className="csm-select"
                                    value={memberId}
                                    onChange={e => setMemberId(e.target.value)}
                                    disabled={loadingMembers}
                                    required
                                >
                                    <option value="">{loadingMembers ? 'Loading members…' : 'Select a member…'}</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="csm-select-icon"/>
                            </div>
                            {selectedMember && (
                                <div className="csm-member-tag">
                                    <div className="csm-member-avatar">
                                        {selectedMember.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{selectedMember.name}</span>
                                    <CheckCircle size={12} style={{ color: '#10B981', marginLeft: 'auto' }}/>
                                </div>
                            )}
                        </div>

                        {/* Date + Time */}
                        <div className="csm-row">
                            <div className="csm-section">
                                <div className="csm-section__label"><Calendar size={12}/> Date</div>
                                <input
                                    className="csm-input"
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="csm-section">
                                <div className="csm-section__label"><Clock size={12}/> Start Time</div>
                                <input
                                    className="csm-input"
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Duration presets */}
                        <div className="csm-section">
                            <div className="csm-section__label">
                                <Clock size={12}/> Duration
                                {endTime && time && (
                                    <span className="csm-end-time">ends {endTime}</span>
                                )}
                            </div>
                            <div className="csm-duration-grid">
                                {DURATION_PRESETS.map(d => (
                                    <button
                                        type="button"
                                        key={d}
                                        className={`csm-dur-chip ${duration === d ? 'active' : ''}`}
                                        onClick={() => setDuration(d)}
                                    >
                                        {d < 60 ? `${d}m` : `${d/60}h${d%60 ? d%60+'m' : ''}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="csm-section">
                            <div className="csm-section__label"><FileText size={12}/> Notes</div>
                            <textarea
                                className="csm-textarea"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Session goals, focus areas, or preparation notes…"
                                rows={3}
                            />
                        </div>

                        {/* Recurring toggle */}
                        <div
                            className={`csm-recurring-card ${isRecurring ? 'active' : ''}`}
                            onClick={() => setIsRecurring(p => !p)}
                        >
                            <div className={`csm-recurring-icon ${isRecurring ? 'active' : ''}`}>
                                <Repeat size={15}/>
                            </div>
                            <div className="csm-recurring-text">
                                <span className="csm-recurring-title">Recurring Weekly</span>
                                <span className="csm-recurring-sub">Repeat this session every week</span>
                            </div>
                            <div className={`csm-toggle ${isRecurring ? 'on' : ''}`}>
                                <div className="csm-toggle-thumb"/>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="csm-footer">
                        {/* Preview */}
                        {(memberId || date || time) && (
                            <div className="csm-preview">
                                {selectedMember && <span>{selectedMember.name}</span>}
                                {date && <span>{new Date(date + 'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>}
                                {time && <span>{time}{endTime ? ` – ${endTime}` : ''}</span>}
                                <span>{duration < 60 ? `${duration}m` : `${duration/60}h`}</span>
                                {isRecurring && <span className="csm-preview__recurring"><Repeat size={10}/> Weekly</span>}
                            </div>
                        )}
                        <div className="csm-footer-actions">
                            <button type="button" className="csm-btn csm-btn--ghost" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="csm-btn csm-btn--primary" disabled={submitting}>
                                {submitting
                                    ? <><span className="csm-spinner"/> Scheduling…</>
                                    : <><CheckCircle size={14}/> Schedule Session</>
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSessionModal;
