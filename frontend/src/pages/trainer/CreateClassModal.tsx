import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Clock, MapPin, Users, FileText, Repeat, AlignLeft, Layers } from 'lucide-react';
import { trainerApi } from '../../services/trainerApi';
import type { TrainerClassItem } from '../../services/trainerApi';
import './CreateClassModal.css';

interface CreateClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClassCreated: () => void;
    editData?: TrainerClassItem | null;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose, onClassCreated, editData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        duration: 60,
        room: '',
        capacity: 20,
        type: 'group' as 'group' | 'pt',
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
            // Reset for create mode
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
            // Calculate end time based on duration
            const [hours, mins] = formData.startTime.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours);
            endDate.setMinutes(mins + formData.duration);
            const endTime = endDate.toTimeString().slice(0, 5);

            const payload = {
                title: formData.title,
                date: formData.date,
                startTime: formData.startTime,
                endTime: endTime,
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
            alert('Failed to save class. Please try again.');
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

    return (
        <div className="create-modal-overlay" onClick={onClose}>
            <div className="create-modal" onClick={e => e.stopPropagation()}>
                <div className="create-modal__header">
                    <div className="create-modal__header-content">
                        <h2>{editData ? 'Edit Class' : 'Schedule New Class'}</h2>
                        <p>{editData ? 'Update session details' : 'Create a new session'}</p>
                    </div>
                    <button className="create-modal__close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="create-modal__form">
                    <div className="create-modal__body">
                        {/* Title Section - Single Row */}
                        <div className="form-group form-group--full">
                            <label>Class Title</label>
                            <div className="input-wrapper">
                                <FileText size={14} className="input-icon" />
                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    placeholder="e.g. HIIT Morning Blast"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Date / Time / Duration - 3 Columns */}
                        <div className="form-grid form-grid--three">
                            <div className="form-group">
                                <label>Date</label>
                                <div className="input-wrapper">
                                    <Calendar size={14} className="input-icon" />
                                    <input
                                        type="date"
                                        name="date"
                                        className="form-control"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Start</label>
                                <div className="input-wrapper">
                                    <Clock size={14} className="input-icon" />
                                    <input
                                        type="time"
                                        name="startTime"
                                        className="form-control"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Duration (m)</label>
                                <div className="input-wrapper">
                                    <Clock size={14} className="input-icon" />
                                    <input
                                        type="number"
                                        name="duration"
                                        className="form-control"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        min="15"
                                        step="15"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Room / Capacity / Type - 3 Columns */}
                        <div className="form-grid form-grid--three">
                            <div className="form-group">
                                <label>Room</label>
                                <div className="input-wrapper">
                                    <MapPin size={14} className="input-icon" />
                                    <input
                                        type="text"
                                        name="room"
                                        className="form-control"
                                        placeholder="Studio A"
                                        value={formData.room}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cap.</label>
                                <div className="input-wrapper">
                                    <Users size={14} className="input-icon" />
                                    <input
                                        type="number"
                                        name="capacity"
                                        className="form-control"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <div className="input-wrapper">
                                    <Layers size={14} className="input-icon" />
                                    <select
                                        name="type"
                                        className="form-control"
                                        value={formData.type}
                                        onChange={handleChange}
                                    >
                                        <option value="group">Group</option>
                                        <option value="pt">PT</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Recurring - Split Row */}
                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 180px' }}>
                            <div className="form-group">
                                <label>Notes</label>
                                <div className="input-wrapper input-wrapper--textarea">
                                    <AlignLeft size={14} className="input-icon input-icon--top" />
                                    <textarea
                                        name="notes"
                                        className="form-control"
                                        placeholder="Instructions..."
                                        value={formData.notes}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Options</label>
                                <label className="toggle-label">
                                    <div className="toggle-info">
                                        <Repeat size={16} className="toggle-icon" />
                                        <span className="toggle-title">Weekly</span>
                                    </div>
                                    <div className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            name="recurring"
                                            checked={formData.recurring}
                                            onChange={handleChange}
                                        />
                                        <span className="slider round"></span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="create-modal__footer">
                        <button type="button" className="btn-text" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary-large" disabled={loading}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : (editData ? 'Save Changes' : 'Schedule')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateClassModal;
