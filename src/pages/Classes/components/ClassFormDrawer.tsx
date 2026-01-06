import React, { useState, useEffect } from 'react'
import type { ClassData } from './ClassCard'

interface ClassFormDrawerProps {
    isOpen: boolean
    onClose: () => void
    onSave: (classData: Partial<ClassData>) => void
    classData?: ClassData | null
    trainers: string[]
    classTypes: string[]
}

const CLASS_ROOMS = ['Studio A', 'Studio B', 'Main Hall', 'Gym Floor', 'Outdoor']

const ClassFormDrawer: React.FC<ClassFormDrawerProps> = ({
    isOpen,
    onClose,
    onSave,
    classData,
    trainers,
    classTypes,
}) => {
    const isEditMode = !!classData

    const [formState, setFormState] = useState({
        name: '',
        type: '',
        trainer: '',
        date: '',
        startTime: '',
        endTime: '',
        room: '',
        capacity: 15,
        status: 'Available' as 'Available' | 'Full' | 'Cancelled',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Populate form when editing
    useEffect(() => {
        if (classData) {
            setFormState({
                name: classData.name || '',
                type: classData.type || '',
                trainer: classData.trainer || '',
                date: classData.date || '',
                startTime: classData.startTime || '',
                endTime: classData.endTime || '',
                room: classData.room || '',
                capacity: classData.capacity || 15,
                status: classData.status || 'Available',
            })
        } else {
            // Reset form for new class
            const today = new Date().toISOString().split('T')[0]
            setFormState({
                name: '',
                type: classTypes[0] || '',
                trainer: trainers[0] || '',
                date: today,
                startTime: '09:00',
                endTime: '10:00',
                room: CLASS_ROOMS[0],
                capacity: 15,
                status: 'Available',
            })
        }
        setErrors({})
    }, [classData, isOpen, trainers, classTypes])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormState(prev => ({
            ...prev,
            [name]: name === 'capacity' ? parseInt(value) || 0 : value,
        }))
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formState.name.trim()) newErrors.name = 'Class name is required'
        if (!formState.type) newErrors.type = 'Class type is required'
        if (!formState.trainer) newErrors.trainer = 'Trainer is required'
        if (!formState.date) newErrors.date = 'Date is required'
        if (!formState.startTime) newErrors.startTime = 'Start time is required'
        if (!formState.endTime) newErrors.endTime = 'End time is required'
        if (formState.startTime >= formState.endTime) newErrors.endTime = 'End time must be after start time'
        if (formState.capacity < 1) newErrors.capacity = 'Capacity must be at least 1'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        onSave({
            ...classData,
            ...formState,
            id: classData?.id || Date.now(),
            enrolled: classData?.enrolled || 0,
        })
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div className="drawer-backdrop" onClick={onClose} />

            {/* Drawer */}
            <div className="class-form-drawer">
                <div className="drawer-header">
                    <h2 className="drawer-title">
                        {isEditMode ? 'Edit Class' : 'Add New Class'}
                    </h2>
                    <button className="drawer-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form className="drawer-form" onSubmit={handleSubmit}>
                    {/* Class Name */}
                    <div className="form-group">
                        <label className="form-label">Class Name</label>
                        <input
                            type="text"
                            name="name"
                            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                            value={formState.name}
                            onChange={handleChange}
                            placeholder="e.g., Morning HIIT"
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    {/* Class Type */}
                    <div className="form-group">
                        <label className="form-label">Class Type</label>
                        <select
                            name="type"
                            className={`form-select ${errors.type ? 'form-input--error' : ''}`}
                            value={formState.type}
                            onChange={handleChange}
                        >
                            <option value="">Select type...</option>
                            {classTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {errors.type && <span className="form-error">{errors.type}</span>}
                    </div>

                    {/* Trainer */}
                    <div className="form-group">
                        <label className="form-label">Trainer</label>
                        <select
                            name="trainer"
                            className={`form-select ${errors.trainer ? 'form-input--error' : ''}`}
                            value={formState.trainer}
                            onChange={handleChange}
                        >
                            <option value="">Select trainer...</option>
                            {trainers.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {errors.trainer && <span className="form-error">{errors.trainer}</span>}
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            name="date"
                            className={`form-input ${errors.date ? 'form-input--error' : ''}`}
                            value={formState.date}
                            onChange={handleChange}
                        />
                        {errors.date && <span className="form-error">{errors.date}</span>}
                    </div>

                    {/* Time Range */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Start Time</label>
                            <input
                                type="time"
                                name="startTime"
                                className={`form-input ${errors.startTime ? 'form-input--error' : ''}`}
                                value={formState.startTime}
                                onChange={handleChange}
                            />
                            {errors.startTime && <span className="form-error">{errors.startTime}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Time</label>
                            <input
                                type="time"
                                name="endTime"
                                className={`form-input ${errors.endTime ? 'form-input--error' : ''}`}
                                value={formState.endTime}
                                onChange={handleChange}
                            />
                            {errors.endTime && <span className="form-error">{errors.endTime}</span>}
                        </div>
                    </div>

                    {/* Room */}
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <select
                            name="room"
                            className="form-select"
                            value={formState.room}
                            onChange={handleChange}
                        >
                            {CLASS_ROOMS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {/* Capacity */}
                    <div className="form-group">
                        <label className="form-label">Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            className={`form-input ${errors.capacity ? 'form-input--error' : ''}`}
                            value={formState.capacity}
                            onChange={handleChange}
                            min={1}
                            max={100}
                        />
                        {errors.capacity && <span className="form-error">{errors.capacity}</span>}
                    </div>

                    {/* Status (Edit mode only) */}
                    {isEditMode && (
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={formState.status}
                                onChange={handleChange}
                            >
                                <option value="Available">Available</option>
                                <option value="Full">Full</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="drawer-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {isEditMode ? 'Save Changes' : 'Create Class'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default ClassFormDrawer
