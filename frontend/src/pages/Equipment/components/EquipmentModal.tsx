import React, { useState, useEffect } from 'react';
import type { Equipment, EquipmentCategory, EquipmentStatus, EquipmentCondition } from '../../../types/equipment';
import { X, Dumbbell, Heart, Zap, Flower2, Sparkles, Package, MapPin, Calendar, DollarSign, Hash, Check, Plus } from 'lucide-react';
import '../EquipmentModals.css';

interface EquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Equipment>) => void;
    initialData?: Equipment | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT MODAL - Using Common CSS
// ═══════════════════════════════════════════════════════════════════════════

const EquipmentModal: React.FC<EquipmentModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<Equipment>>({
        name: '',
        brand: '',
        model: '',
        category: 'STRENGTH',
        status: 'ACTIVE',
        condition: 'GOOD',
        location: '',
        quantity: 1,
        purchaseCost: 0,
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                brand: '',
                model: '',
                category: 'STRENGTH',
                status: 'ACTIVE',
                condition: 'GOOD',
                location: '',
                quantity: 1,
                purchaseCost: 0,
                purchaseDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (field: keyof Equipment, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    // ─────────────────────────────────────────────────────────────────────────
    // CONFIG
    // ─────────────────────────────────────────────────────────────────────────
    const categories: { value: EquipmentCategory; label: string; icon: React.ReactNode; color: string }[] = [
        { value: 'STRENGTH', label: 'Strength', icon: <Dumbbell size={20} />, color: '#ef4444' },
        { value: 'CARDIO', label: 'Cardio', icon: <Heart size={20} />, color: '#f97316' },
        { value: 'FUNCTIONAL', label: 'Functional', icon: <Zap size={20} />, color: '#eab308' },
        { value: 'YOGA', label: 'Yoga', icon: <Flower2 size={20} />, color: '#22c55e' },
        { value: 'RECOVERY', label: 'Recovery', icon: <Sparkles size={20} />, color: '#3b82f6' },
        { value: 'OTHER', label: 'Other', icon: <Package size={20} />, color: '#8b5cf6' }
    ];

    const statuses: { value: EquipmentStatus; label: string; color: string }[] = [
        { value: 'ACTIVE', label: 'Active', color: '#22c55e' },
        { value: 'MAINTENANCE', label: 'Maintenance', color: '#eab308' },
        { value: 'OUT_OF_ORDER', label: 'Out of Order', color: '#ef4444' },
        { value: 'RETIRED', label: 'Retired', color: '#6b7280' }
    ];

    const conditions: { value: EquipmentCondition; label: string; color: string }[] = [
        { value: 'NEW', label: 'New', color: '#22c55e' },
        { value: 'GOOD', label: 'Good', color: '#3b82f6' },
        { value: 'FAIR', label: 'Fair', color: '#eab308' },
        { value: 'POOR', label: 'Poor', color: '#ef4444' }
    ];

    if (!isOpen) return null;

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div className="eq-modal-overlay" onClick={onClose}>
            <div className="eq-modal eq-modal--md" onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <header className="eq-modal__header">
                    <h1 className="eq-modal__title">
                        {initialData ? 'Edit Equipment' : 'Add New Equipment'}
                    </h1>
                    <button onClick={onClose} className="eq-modal__close">
                        <X size={18} />
                    </button>
                </header>

                {/* BODY */}
                <form onSubmit={handleSubmit} className="eq-modal__body">

                    {/* CATEGORY */}
                    <div className="eq-modal__section">
                        <label className="eq-label">Select Category</label>
                        <div className="eq-category-grid">
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => handleChange('category', cat.value)}
                                    className={`eq-category-btn ${formData.category === cat.value ? 'eq-category-btn--active' : ''}`}
                                    style={formData.category === cat.value ? {
                                        backgroundColor: `${cat.color}15`,
                                        borderColor: cat.color,
                                        color: cat.color
                                    } : {}}
                                >
                                    <span className="eq-category-btn__icon">{cat.icon}</span>
                                    <span className="eq-category-btn__label">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* NAME & QUANTITY */}
                    <div className="eq-modal__section eq-grid eq-grid--2-1">
                        <div>
                            <label className="eq-label">Equipment Name *</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => handleChange('name', e.target.value)}
                                placeholder="e.g. Treadmill Pro X1"
                                className="eq-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="eq-label">Quantity</label>
                            <div className="eq-input-wrapper">
                                <Hash size={16} className="eq-input-icon" />
                                <input
                                    type="number"
                                    value={formData.quantity || 1}
                                    onChange={e => handleChange('quantity', parseInt(e.target.value) || 1)}
                                    className="eq-input eq-input--with-icon"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* BRAND, MODEL, LOCATION */}
                    <div className="eq-modal__section eq-grid eq-grid--3">
                        <div>
                            <label className="eq-label">Brand</label>
                            <input
                                type="text"
                                value={formData.brand || ''}
                                onChange={e => handleChange('brand', e.target.value)}
                                placeholder="e.g. Life Fitness"
                                className="eq-input"
                            />
                        </div>
                        <div>
                            <label className="eq-label">Model</label>
                            <input
                                type="text"
                                value={formData.model || ''}
                                onChange={e => handleChange('model', e.target.value)}
                                placeholder="e.g. T-2000"
                                className="eq-input"
                            />
                        </div>
                        <div>
                            <label className="eq-label">Location</label>
                            <div className="eq-input-wrapper">
                                <MapPin size={16} className="eq-input-icon" />
                                <input
                                    type="text"
                                    value={formData.location || ''}
                                    onChange={e => handleChange('location', e.target.value)}
                                    placeholder="e.g. Floor 1"
                                    className="eq-input eq-input--with-icon"
                                />
                            </div>
                        </div>
                    </div>

                    {/* STATUS & CONDITION */}
                    <div className="eq-modal__section eq-modal__section--bordered eq-grid eq-grid--2">
                        <div>
                            <label className="eq-label">Status</label>
                            <div className="eq-pill-group">
                                {statuses.map(s => (
                                    <button
                                        key={s.value}
                                        type="button"
                                        onClick={() => handleChange('status', s.value)}
                                        className={`eq-pill ${formData.status === s.value ? 'eq-pill--active' : ''}`}
                                        style={formData.status === s.value ? {
                                            backgroundColor: `${s.color}15`,
                                            borderColor: s.color,
                                            color: s.color
                                        } : {}}
                                    >
                                        {formData.status === s.value && <Check size={14} className="eq-pill__check" />}
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="eq-label">Condition</label>
                            <div className="eq-pill-group">
                                {conditions.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => handleChange('condition', c.value)}
                                        className={`eq-pill ${formData.condition === c.value ? 'eq-pill--active' : ''}`}
                                        style={formData.condition === c.value ? {
                                            backgroundColor: `${c.color}15`,
                                            borderColor: c.color,
                                            color: c.color
                                        } : {}}
                                    >
                                        {formData.condition === c.value && <Check size={14} className="eq-pill__check" />}
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PURCHASE INFO */}
                    <div className="eq-modal__section eq-modal__section--bordered eq-grid eq-grid--2">
                        <div>
                            <label className="eq-label">Purchase Date</label>
                            <div className="eq-input-wrapper">
                                <Calendar size={16} className="eq-input-icon" />
                                <input
                                    type="date"
                                    value={formData.purchaseDate || ''}
                                    onChange={e => handleChange('purchaseDate', e.target.value)}
                                    className="eq-input eq-input--with-icon"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="eq-label">Purchase Cost ($)</label>
                            <div className="eq-input-wrapper">
                                <DollarSign size={16} className="eq-input-icon" />
                                <input
                                    type="number"
                                    value={formData.purchaseCost || 0}
                                    onChange={e => handleChange('purchaseCost', parseFloat(e.target.value) || 0)}
                                    className="eq-input eq-input--with-icon"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* FOOTER */}
                <footer className="eq-modal__footer">
                    <button type="button" onClick={onClose} className="eq-btn eq-btn--secondary">
                        Cancel
                    </button>
                    <button type="submit" onClick={handleSubmit} className="eq-btn eq-btn--primary">
                        <Plus size={18} />
                        {initialData ? 'Save Changes' : 'Add Equipment'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default EquipmentModal;
