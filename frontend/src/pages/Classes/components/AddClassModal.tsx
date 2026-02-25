import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Users, Calendar, ChevronDown, Check } from 'lucide-react';
import type { ClassData } from './index';
import './AddClassModal.css';

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<ClassData>) => void;
    classData: ClassData | null;
    trainers: string[];
    classTypes: string[];
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
    isOpen,
    onClose,
    onSave,
    classData,
    trainers,
    classTypes,
}) => {
    const [formData, setFormData] = useState<Partial<ClassData>>({
        name: '',
        trainer: '',
        startTime: '09:00',
        endTime: '10:00',
        date: new Date().toISOString().split('T')[0],
        capacity: 15,
        room: 'Studio A',
        type: 'General',
    });

    useEffect(() => {
        if (classData) {
            setFormData(classData);
        } else {
            setFormData({
                name: '',
                trainer: trainers[0] || '',
                startTime: '09:00',
                endTime: '10:00',
                date: new Date().toISOString().split('T')[0],
                capacity: 15,
                room: 'Studio A',
                type: classTypes[0] || 'General',
            });
        }
    }, [classData, isOpen, trainers, classTypes]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <>
            {isOpen && (
                <div className="add-class-modal-overlay">
                    {/* Backdrop */}
                    <div
                        onClick={onClose}
                        className="add-class-modal-backdrop"
                    />

                    {/* Modal Content */}
                    <div
                        className="add-class-modal-content"
                    >
                        {/* Header */}
                        <div className="add-class-modal-header">
                            <h2 className="add-class-modal-title">
                                {classData ? 'Edit Class' : 'Add New Class'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="add-class-modal-close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="add-class-modal-body">
                            <form onSubmit={handleSubmit} className="add-class-form">

                                {/* Class Name & Type */}
                                <div className="form-row form-row--2-col">
                                    <div className="form-group">
                                        <label className="form-label">Class Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Morning Yoga"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <div className="form-input-wrapper">
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                className="form-input form-select"
                                            >
                                                {classTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="form-select-arrow" />
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="form-row form-row--3-col">
                                    <div className="form-group">
                                        <label className="form-label"><Calendar size={14} className="form-icon" />Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label"><Clock size={14} className="form-icon" />Start</label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label"><Clock size={14} className="form-icon" />End</label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Trainer & Room */}
                                <div className="form-row form-row--half">
                                    <div className="form-group">
                                        <label className="form-label"><Users size={14} className="form-icon" />Trainer</label>
                                        <div className="form-input-wrapper">
                                            <select
                                                value={formData.trainer}
                                                onChange={e => setFormData({ ...formData, trainer: e.target.value })}
                                                className="form-input form-select"
                                            >
                                                <option value="" disabled>Select Trainer</option>
                                                {trainers.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="form-select-arrow" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label"><MapPin size={14} className="form-icon" />Room</label>
                                        <div className="form-input-wrapper">
                                            <select
                                                value={formData.room}
                                                onChange={e => setFormData({ ...formData, room: e.target.value })}
                                                className="form-input form-select"
                                            >
                                                {['Studio A', 'Studio B', 'Main Hall', 'Gym Floor'].map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="form-select-arrow" />
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity */}
                                <div className="form-group">
                                    <label className="form-label">Capacity</label>
                                    <div className="range-wrapper">
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={formData.capacity}
                                            onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                            className="range-input"
                                        />
                                        <span className="range-value">
                                            {formData.capacity}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                    >
                                        <Check size={16} strokeWidth={2.5} />
                                        Save Class
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
