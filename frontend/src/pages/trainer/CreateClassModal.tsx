import React, { useState, useEffect } from 'react';
import {
    X, Loader2, Calendar, Clock, MapPin, Users, FileText,
    Repeat, AlignLeft, Layers, Zap, UserCheck, Dumbbell,
    Wind, Footprints, Heart, CheckCircle2
} from 'lucide-react';
import { trainerApi } from '../../services/trainerApi';
import type { TrainerClassItem } from '../../services/trainerApi';
import './CreateClassModal.css';
import { showToast } from '../../utils/toast';

interface CreateClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClassCreated: () => void;
    editData?: TrainerClassItem | null;
}

const CLASS_TYPES = [
    { value: 'group',    label: 'Group',    icon: <Users size={16}/>,       gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#6366f1' },
    { value: 'pt',       label: 'PT',       icon: <UserCheck size={16}/>,   gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#f59e0b' },
    { value: 'hiit',     label: 'HIIT',     icon: <Zap size={16}/>,         gradient: 'linear-gradient(135deg,#ef4444,#f97316)', color: '#ef4444' },
    { value: 'yoga',     label: 'Yoga',     icon: <Wind size={16}/>,        gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', color: '#10b981' },
    { value: 'strength', label: 'Strength', icon: <Dumbbell size={16}/>,    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#3b82f6' },
    { value: 'cardio',   label: 'Cardio',   icon: <Heart size={16}/>,       gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)', color: '#ec4899' },
    { value: 'pilates',  label: 'Pilates',  icon: <Footprints size={16}/>,  gradient: 'linear-gradient(135deg,#14b8a6,#22d3ee)', color: '#14b8a6' },
];

const DURATION_PRESETS = [30, 45, 60, 75, 90];

const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onClassCreated, editData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        duration: 60,
        room: '',
        capacity: 20,
        type: 'group' as string,
        recurring: false,
        notes: ''
    });

    useEffect(() => {
        if (isOpen && editData) {
            setFormData({
                title: editData.title,
                date: editData.date,
                startTime: editData.startTime,
                duration: editData.duration,
                room: editData.room,
                capacity: editData.capacity,
                type: editData.type,
                recurring: editData.recurring,
                notes: editData.notes || ''
            });
        } else if (isOpen && !editData) {
            setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '10:00',
                duration: 60,
                room: '',
                capacity: 20,
                type: 'group',
                recurring: false,
                notes: ''
            });
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const [hours, mins] = formData.startTime.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours);
            endDate.setMinutes(mins + formData.duration);
            const endTime = endDate.toTimeString().slice(0, 5);

            const payload = {
                title: formData.title,
                date: formData.date,
                startTime: formData.startTime,
                endTime,
                duration: formData.duration,
                room: formData.room,
                capacity: formData.capacity,
                type: formData.type,
                recurring: formData.recurring,
                notes: formData.notes
            };

            if (editData) {
                await trainerApi.updateClass(editData.id, payload);
            } else {
                await trainerApi.createClass(payload);
            }
            onClassCreated();
            onClose();
        } catch (error) {
            console.error('Failed to save class:', error);
            showToast.error('Failed to save class. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const selectedType = CLASS_TYPES.find(t => t.value === formData.type) || CLASS_TYPES[0];

    // Compute end time for preview
    const computeEndTime = () => {
        try {
            const [h, m] = formData.startTime.split(':').map(Number);
            const d = new Date(); d.setHours(h); d.setMinutes(m + formData.duration);
            return d.toTimeString().slice(0, 5);
        } catch { return '--:--'; }
    };

    return (
        <div className="ccm-overlay" onClick={onClose}>
            <div className="ccm" onClick={e => e.stopPropagation()}>

                {/* ── Header ── */}
                <div className="ccm__header" style={{ '--header-gradient': selectedType.gradient } as React.CSSProperties}>
                    <div className="ccm__header-glow" />
                    <div className="ccm__header-left">
                        <div className="ccm__header-icon" style={{ background: selectedType.gradient }}>
                            {selectedType.icon}
                        </div>
                        <div>
                            <h2 className="ccm__title">{editData ? 'Edit Class' : 'Schedule New Class'}</h2>
                            <p className="ccm__subtitle">{editData ? 'Update your session details below' : 'Fill in the details to create a new session'}</p>
                        </div>
                    </div>
                    <button className="ccm__close" onClick={onClose}><X size={18}/></button>
                </div>

                <form onSubmit={handleSubmit} className="ccm__form">
                    <div className="ccm__body">

                        {/* ── Class Title ── */}
                        <div className="ccm__section">
                            <div className="ccm__section-label">
                                <FileText size={13}/>
                                <span>Class Title</span>
                            </div>
                            <div className="ccm__input-wrap">
                                <input
                                    type="text"
                                    name="title"
                                    className="ccm__input"
                                    placeholder="e.g. HIIT Morning Blast"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* ── Class Type selector ── */}
                        <div className="ccm__section">
                            <div className="ccm__section-label">
                                <Layers size={13}/>
                                <span>Class Type</span>
                            </div>
                            <div className="ccm__type-grid">
                                {CLASS_TYPES.map(t => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        className={`ccm__type-btn${formData.type === t.value ? ' ccm__type-btn--active' : ''}`}
                                        style={{ '--t-gradient': t.gradient, '--t-color': t.color } as React.CSSProperties}
                                        onClick={() => setFormData(p => ({ ...p, type: t.value }))}
                                    >
                                        <span className="ccm__type-icon">{t.icon}</span>
                                        <span className="ccm__type-label">{t.label}</span>
                                        {formData.type === t.value && <CheckCircle2 size={12} className="ccm__type-check"/>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Date / Time / Duration ── */}
                        <div className="ccm__section">
                            <div className="ccm__section-label">
                                <Calendar size={13}/>
                                <span>Schedule</span>
                            </div>
                            <div className="ccm__row-three">
                                <div className="ccm__field">
                                    <label className="ccm__field-label">Date</label>
                                    <div className="ccm__input-wrap ccm__input-wrap--icon">
                                        <Calendar size={13} className="ccm__input-ico"/>
                                        <input type="date" name="date" className="ccm__input ccm__input--has-icon"
                                            value={formData.date} onChange={handleChange} required/>
                                    </div>
                                </div>
                                <div className="ccm__field">
                                    <label className="ccm__field-label">Start Time</label>
                                    <div className="ccm__input-wrap ccm__input-wrap--icon">
                                        <Clock size={13} className="ccm__input-ico"/>
                                        <input type="time" name="startTime" className="ccm__input ccm__input--has-icon"
                                            value={formData.startTime} onChange={handleChange} required/>
                                    </div>
                                </div>
                                <div className="ccm__field">
                                    <label className="ccm__field-label">End Time</label>
                                    <div className="ccm__input-wrap">
                                        <input type="text" className="ccm__input ccm__input--readonly"
                                            value={computeEndTime()} readOnly/>
                                    </div>
                                </div>
                            </div>

                            {/* Duration presets */}
                            <div className="ccm__dur-row">
                                <span className="ccm__dur-label">Duration</span>
                                <div className="ccm__dur-presets">
                                    {DURATION_PRESETS.map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            className={`ccm__dur-chip${formData.duration === d ? ' ccm__dur-chip--active' : ''}`}
                                            onClick={() => setFormData(p => ({ ...p, duration: d }))}
                                        >{d}m</button>
                                    ))}
                                    <div className="ccm__dur-custom-wrap">
                                        <input
                                            type="number"
                                            name="duration"
                                            className="ccm__dur-custom"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            min="15" step="5"
                                            placeholder="Custom"
                                        />
                                        <span className="ccm__dur-unit">min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Location & Capacity ── */}
                        <div className="ccm__section">
                            <div className="ccm__section-label">
                                <MapPin size={13}/>
                                <span>Location & Capacity</span>
                            </div>
                            <div className="ccm__row-two">
                                <div className="ccm__field">
                                    <label className="ccm__field-label">Room / Location</label>
                                    <div className="ccm__input-wrap ccm__input-wrap--icon">
                                        <MapPin size={13} className="ccm__input-ico"/>
                                        <input type="text" name="room" className="ccm__input ccm__input--has-icon"
                                            placeholder="e.g. Studio A" value={formData.room}
                                            onChange={handleChange} required/>
                                    </div>
                                </div>
                                <div className="ccm__field">
                                    <label className="ccm__field-label">Max Capacity</label>
                                    <div className="ccm__input-wrap ccm__input-wrap--icon">
                                        <Users size={13} className="ccm__input-ico"/>
                                        <input type="number" name="capacity" className="ccm__input ccm__input--has-icon"
                                            value={formData.capacity} onChange={handleChange} min="1" required/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Notes & Recurring ── */}
                        <div className="ccm__section">
                            <div className="ccm__row-notes">
                                <div className="ccm__field ccm__field--grow">
                                    <div className="ccm__section-label">
                                        <AlignLeft size={13}/>
                                        <span>Notes</span>
                                    </div>
                                    <div className="ccm__input-wrap ccm__input-wrap--icon ccm__input-wrap--textarea">
                                        <AlignLeft size={13} className="ccm__input-ico ccm__input-ico--top"/>
                                        <textarea name="notes" className="ccm__input ccm__textarea ccm__input--has-icon"
                                            placeholder="Any special instructions or notes..." value={formData.notes}
                                            onChange={handleChange}/>
                                    </div>
                                </div>
                                <div className="ccm__field ccm__field--shrink">
                                    <div className="ccm__section-label">
                                        <Repeat size={13}/>
                                        <span>Recurring</span>
                                    </div>
                                    <label className="ccm__recurring">
                                        <input type="checkbox" name="recurring"
                                            checked={formData.recurring} onChange={handleChange}/>
                                        <div className="ccm__recurring-body">
                                            <div className="ccm__recurring-icon">
                                                <Repeat size={15}/>
                                            </div>
                                            <div className="ccm__recurring-text">
                                                <span className="ccm__recurring-title">Weekly</span>
                                                <span className="ccm__recurring-desc">Repeat every week</span>
                                            </div>
                                            <div className="ccm__toggle">
                                                <span className="ccm__toggle-track">
                                                    <span className="ccm__toggle-thumb"/>
                                                </span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── Footer ── */}
                    <div className="ccm__footer">
                        <div className="ccm__footer-preview">
                            <span className="ccm__footer-dot" style={{ background: selectedType.gradient }}/>
                            <span className="ccm__footer-info">
                                {formData.title || 'Untitled'} · {selectedType.label} · {formData.startTime}–{computeEndTime()} · {formData.duration}m
                            </span>
                        </div>
                        <div className="ccm__footer-actions">
                            <button type="button" className="ccm__btn-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="ccm__btn-submit" disabled={loading}
                                style={{ background: selectedType.gradient }}>
                                {loading
                                    ? <><Loader2 size={15} className="ccm__spin"/> Saving…</>
                                    : editData ? 'Save Changes' : 'Schedule Class'
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateClassModal;
