import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Users, Calendar, ChevronDown, Check } from 'lucide-react';
import type { ClassData } from './index';

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

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: 'spring' as const, damping: 25, stiffness: 300 }
        },
        exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                }}>
                    {/* Backdrop */}
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={onClose}
                        className="modal-backdrop"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="modal-content"
                        style={{
                            width: '100%',
                            maxWidth: '520px',
                            backgroundColor: '#1C1C1E', // Apple Dark Gray
                            borderRadius: '20px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            position: 'relative',
                            zIndex: 10,
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 600,
                                color: 'white',
                                letterSpacing: '-0.01em'
                            }}>
                                {classData ? 'Edit Class' : 'Add New Class'}
                            </h2>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <div style={{ padding: '24px' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Class Name & Type */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '16px' }}>
                                    <div className="form-group">
                                        <label style={labelStyle}>Class Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Morning Yoga"
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={labelStyle}>Type</label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                                            >
                                                {classTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                            <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 14, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label style={labelStyle}><Calendar size={14} style={{ marginRight: 6, display: 'inline' }} />Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={labelStyle}><Clock size={14} style={{ marginRight: 6, display: 'inline' }} />Start</label>
                                        <input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={labelStyle}><Clock size={14} style={{ marginRight: 6, display: 'inline' }} />End</label>
                                        <input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Trainer & Room */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label style={labelStyle}><Users size={14} style={{ marginRight: 6, display: 'inline' }} />Trainer</label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                value={formData.trainer}
                                                onChange={e => setFormData({ ...formData, trainer: e.target.value })}
                                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                                            >
                                                <option value="" disabled>Select Trainer</option>
                                                {trainers.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 14, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label style={labelStyle}><MapPin size={14} style={{ marginRight: 6, display: 'inline' }} />Room</label>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                value={formData.room}
                                                onChange={e => setFormData({ ...formData, room: e.target.value })}
                                                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                                            >
                                                {['Studio A', 'Studio B', 'Main Hall', 'Gym Floor'].map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 14, color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity */}
                                <div className="form-group">
                                    <label style={labelStyle}>Capacity</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={formData.capacity}
                                            onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                            style={{
                                                flex: 1,
                                                accentColor: '#0A84FF',
                                                height: '4px',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '2px',
                                                appearance: 'none'
                                            }}
                                        />
                                        <span style={{
                                            fontVariantNumeric: 'tabular-nums',
                                            color: 'white',
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}>
                                            {formData.capacity}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px',
                                    marginTop: '12px'
                                }}>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: 'rgba(255,255,255,0.08)',
                                            color: 'white',
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '12px 32px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: '#0A84FF', // Apple Blue
                                            color: 'white',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3)',
                                            transition: 'transform 0.1s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Check size={16} strokeWidth={2.5} />
                                        Save Class
                                    </button>
                                </div>

                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'rgba(0,0,0,0.2)', // Darker input bg
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
};
