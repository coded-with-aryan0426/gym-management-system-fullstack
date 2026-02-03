import React, { useState, useEffect } from 'react';
import type { Equipment, EquipmentCategory, EquipmentStatus, EquipmentCondition } from '../../../types/equipment';
import { X, Dumbbell, Heart, Zap, Flower2, Sparkles, Package, MapPin, Calendar, IndianRupee, Hash, Check, Plus } from 'lucide-react';
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
    const categories: { value: EquipmentCategory; label: string; icon: React.ReactNode; colorVar: string; bgVar: string }[] = [
        { value: 'STRENGTH', label: 'Strength', icon: <Dumbbell size={20} />, colorVar: 'var(--modal-danger)', bgVar: 'var(--modal-danger-bg)' },
        { value: 'CARDIO', label: 'Cardio', icon: <Heart size={20} />, colorVar: 'var(--modal-orange)', bgVar: 'var(--modal-orange-bg)' },
        { value: 'FUNCTIONAL', label: 'Functional', icon: <Zap size={20} />, colorVar: 'var(--modal-warning)', bgVar: 'var(--modal-warning-bg)' },
        { value: 'YOGA', label: 'Yoga', icon: <Flower2 size={20} />, colorVar: 'var(--modal-success)', bgVar: 'var(--modal-success-bg)' },
        { value: 'RECOVERY', label: 'Recovery', icon: <Sparkles size={20} />, colorVar: 'var(--modal-info)', bgVar: 'var(--modal-info-bg)' },
        { value: 'OTHER', label: 'Other', icon: <Package size={20} />, colorVar: 'var(--modal-purple)', bgVar: 'var(--modal-purple-bg)' }
    ];

    const statuses: { value: EquipmentStatus; label: string; colorVar: string; bgVar: string }[] = [
        { value: 'ACTIVE', label: 'Active', colorVar: 'var(--modal-success)', bgVar: 'var(--modal-success-bg)' },
        { value: 'MAINTENANCE', label: 'Maintenance', colorVar: 'var(--modal-warning)', bgVar: 'var(--modal-warning-bg)' },
        { value: 'OUT_OF_ORDER', label: 'Out of Order', colorVar: 'var(--modal-danger)', bgVar: 'var(--modal-danger-bg)' },
        { value: 'RETIRED', label: 'Retired', colorVar: 'var(--modal-text-muted)', bgVar: 'var(--modal-surface-hover)' }
    ];

    const conditions: { value: EquipmentCondition; label: string; colorVar: string; bgVar: string }[] = [
        { value: 'NEW', label: 'New', colorVar: 'var(--modal-success)', bgVar: 'var(--modal-success-bg)' },
        { value: 'GOOD', label: 'Good', colorVar: 'var(--modal-info)', bgVar: 'var(--modal-info-bg)' },
        { value: 'FAIR', label: 'Fair', colorVar: 'var(--modal-warning)', bgVar: 'var(--modal-warning-bg)' },
        { value: 'POOR', label: 'Poor', colorVar: 'var(--modal-danger)', bgVar: 'var(--modal-danger-bg)' }
    ];

    if (!isOpen) return null;

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div className="eq-modal-overlay" onClick={onClose}>
            <div className="eq-modal eq-modal--compact" onClick={e => e.stopPropagation()}>

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
                        <label className="eq-label">Category</label>
                        <div className="eq-category-grid">
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => handleChange('category', cat.value)}
                                    className={`eq-category-btn ${formData.category === cat.value ? 'eq-category-btn--active' : ''}`}
                                    style={formData.category === cat.value ? {
                                        backgroundColor: cat.bgVar,
                                        borderColor: cat.colorVar,
                                        color: cat.colorVar
                                    } : {}}
                                >
                                    <span className="eq-category-btn__icon">{cat.icon}</span>
                                    <span className="eq-category-btn__label">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CORE INFO - ROW 1 */}
                    <div className="eq-modal__section eq-grid eq-grid--4">
                        <div style={{ gridColumn: 'span 2' }}>
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
                    </div>

                    {/* LOGISTICS - ROW 2 */}
                    <div className="eq-modal__section eq-grid eq-grid--4">
                        <div>
                            <label className="eq-label">Location</label>
                            <div className="eq-input-wrapper">
                                <MapPin size={14} className="eq-input-icon" />
                                <input
                                    type="text"
                                    value={formData.location || ''}
                                    onChange={e => handleChange('location', e.target.value)}
                                    placeholder="Location"
                                    className="eq-input eq-input--with-icon"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="eq-label">Quantity</label>
                            <div className="eq-input-wrapper">
                                <Hash size={14} className="eq-input-icon" />
                                <input
                                    type="number"
                                    value={formData.quantity || 1}
                                    onChange={e => handleChange('quantity', parseInt(e.target.value) || 1)}
                                    className="eq-input eq-input--with-icon"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="eq-label">Cost (₹)</label>
                            <div className="eq-input-wrapper">
                                <IndianRupee size={14} className="eq-input-icon" />
                                <input
                                    type="number"
                                    value={formData.purchaseCost || 0}
                                    onChange={e => handleChange('purchaseCost', parseFloat(e.target.value) || 0)}
                                    className="eq-input eq-input--with-icon"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="eq-label">Date</label>
                            <div className="eq-input-wrapper">
                                <Calendar size={14} className="eq-input-icon" />
                                <input
                                    type="date"
                                    value={formData.purchaseDate || ''}
                                    onChange={e => handleChange('purchaseDate', e.target.value)}
                                    className="eq-input eq-input--with-icon"
                                />
                            </div>
                        </div>
                    </div>

                    {/* STATE - ROW 3 */}
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
                                            backgroundColor: s.bgVar,
                                            borderColor: s.colorVar,
                                            color: s.colorVar
                                        } : {}}
                                    >
                                        {formData.status === s.value && <Check size={12} className="eq-pill__check" />}
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
                                            backgroundColor: c.bgVar,
                                            borderColor: c.colorVar,
                                            color: c.colorVar
                                        } : {}}
                                    >
                                        {formData.condition === c.value && <Check size={12} className="eq-pill__check" />}
                                        {c.label}
                                    </button>
                                ))}
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
