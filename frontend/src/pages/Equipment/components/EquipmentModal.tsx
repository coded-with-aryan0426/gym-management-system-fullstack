import React, { useState, useEffect } from 'react';
import type { Equipment, EquipmentCategory, EquipmentStatus, EquipmentCondition } from '../../../types/equipment';
import { X, Dumbbell, Heart, Zap, Flower2, Sparkles, Package, MapPin, Calendar, IndianRupee, Hash, Check, Save, Plus, Tag, Info, Settings, CircleDot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../EquipmentModals.css';

interface EquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Equipment>) => void;
    initialData?: Equipment | null;
}

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

    const categories: { value: EquipmentCategory; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
        { value: 'STRENGTH', label: 'Strength', desc: 'Weights & resistance', icon: <Dumbbell size={20} />, color: '#ef4444' },
        { value: 'CARDIO', label: 'Cardio', desc: 'Treadmills & bikes', icon: <Heart size={20} />, color: '#f97316' },
        { value: 'FUNCTIONAL', label: 'Functional', desc: 'Cross-training gear', icon: <Zap size={20} />, color: '#eab308' },
        { value: 'YOGA', label: 'Yoga', desc: 'Mats & blocks', icon: <Flower2 size={20} />, color: '#22c55e' },
          { value: 'RECOVERY', label: 'Recovery', desc: 'Foam rollers & bands', icon: <Sparkles size={20} />, color: '#64748b' },
        { value: 'OTHER', label: 'Other', desc: 'Miscellaneous items', icon: <Package size={20} />, color: '#8b5cf6' }
    ];

    const statuses: { value: EquipmentStatus; label: string; color: string; icon: React.ReactNode }[] = [
        { value: 'ACTIVE', label: 'Active', color: '#22c55e', icon: <CircleDot size={13} /> },
        { value: 'MAINTENANCE', label: 'Maintenance', color: '#eab308', icon: <Settings size={13} /> },
        { value: 'OUT_OF_ORDER', label: 'Out of Order', color: '#ef4444', icon: <X size={13} /> },
        { value: 'RETIRED', label: 'Retired', color: '#6b7280', icon: <Package size={13} /> }
    ];

    const conditions: { value: EquipmentCondition; label: string; color: string }[] = [
        { value: 'NEW', label: 'New', color: '#22c55e' },
          { value: 'GOOD', label: 'Good', color: '#64748b' },
        { value: 'FAIR', label: 'Fair', color: '#eab308' },
        { value: 'POOR', label: 'Poor', color: '#ef4444' }
    ];

    const isEditing = !!initialData;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="eq-modal-overlay" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="eq-modal eq-modal--compact"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <header className="eqform-header">
                            <div className="eqform-header__left">
                                <div className="eqform-header__icon-wrap">
                                    {isEditing ? <Settings size={20} /> : <Plus size={20} />}
                                </div>
                                <div>
                                    <h1 className="eqform-header__title">
                                        {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
                                    </h1>
                                    <p className="eqform-header__subtitle">
                                        {isEditing
                                            ? `Updating "${initialData?.name}"`
                                            : 'Fill in the details to register new equipment'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="maint-btn-close">
                                <X size={16} />
                            </button>
                        </header>

                        {/* SCROLLABLE BODY */}
                        <form onSubmit={handleSubmit} className="eqform-body custom-scrollbar">
                            <div className="eqform-content">

                                {/* SECTION 1: CATEGORY */}
                                <section className="eqform-section">
                                    <div className="eqform-section__head">
                                        <span className="eqform-section__num">1</span>
                                        <span className="eqform-section__label">Equipment Category</span>
                                    </div>
                                    <div className="eqform-cat-grid">
                                        {categories.map(cat => {
                                            const active = formData.category === cat.value;
                                            return (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => handleChange('category', cat.value)}
                                                    className={`eqform-cat-card ${active ? 'eqform-cat-card--active' : ''}`}
                                                    style={{
                                                        '--cat-color': cat.color,
                                                        '--cat-bg': `${cat.color}12`,
                                                        '--cat-border': `${cat.color}30`,
                                                    } as React.CSSProperties}
                                                >
                                                    <div className={`eqform-cat-card__icon ${active ? 'eqform-cat-card__icon--active' : ''}`}>
                                                        {cat.icon}
                                                    </div>
                                                    <div className="eqform-cat-card__text">
                                                        <span className="eqform-cat-card__label">{cat.label}</span>
                                                        <span className="eqform-cat-card__desc">{cat.desc}</span>
                                                    </div>
                                                    {active && (
                                                        <div className="eqform-cat-card__check" style={{ background: cat.color }}>
                                                            <Check size={10} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* SECTION 2: STATUS & CONDITION */}
                                <section className="eqform-section">
                                    <div className="eqform-section__head">
                                        <span className="eqform-section__num">2</span>
                                        <span className="eqform-section__label">Status & Condition</span>
                                    </div>
                                    <div className="eqform-row-2col">
                                        <div className="eqform-field-group">
                                            <label className="eqform-field-label">
                                                <Info size={12} />
                                                Current Status
                                            </label>
                                            <div className="eqform-pills">
                                                {statuses.map(s => {
                                                    const active = formData.status === s.value;
                                                    return (
                                                        <button
                                                            key={s.value}
                                                            type="button"
                                                            onClick={() => handleChange('status', s.value)}
                                                            className={`eqform-pill ${active ? 'eqform-pill--active' : ''}`}
                                                            style={active ? {
                                                                color: s.color,
                                                                borderColor: s.color,
                                                                background: `${s.color}10`,
                                                                boxShadow: `0 0 12px ${s.color}15`
                                                            } : {}}
                                                        >
                                                            {active && s.icon}
                                                            {s.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="eqform-field-group">
                                            <label className="eqform-field-label">
                                                <Tag size={12} />
                                                Condition
                                            </label>
                                            <div className="eqform-pills">
                                                {conditions.map(c => {
                                                    const active = formData.condition === c.value;
                                                    return (
                                                        <button
                                                            key={c.value}
                                                            type="button"
                                                            onClick={() => handleChange('condition', c.value)}
                                                            className={`eqform-pill ${active ? 'eqform-pill--active' : ''}`}
                                                            style={active ? {
                                                                color: c.color,
                                                                borderColor: c.color,
                                                                background: `${c.color}10`,
                                                                boxShadow: `0 0 12px ${c.color}15`
                                                            } : {}}
                                                        >
                                                            {active && <Check size={12} />}
                                                            {c.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION 3: IDENTIFICATION */}
                                <section className="eqform-section">
                                    <div className="eqform-section__head">
                                        <span className="eqform-section__num">3</span>
                                        <span className="eqform-section__label">Identification</span>
                                    </div>

                                    <div className="eqform-field">
                                        <label className="eqform-field-label">
                                            Equipment Name <span className="eqform-req">*</span>
                                        </label>
                                        <div className="eqform-input-wrap">
                                            <Dumbbell size={15} className="eqform-input-icon" />
                                            <input
                                                type="text"
                                                value={formData.name || ''}
                                                onChange={e => handleChange('name', e.target.value)}
                                                placeholder="e.g. LifeFitness Treadmill Pro"
                                                className="eqform-input"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="eqform-row-3col">
                                        <div className="eqform-field">
                                            <label className="eqform-field-label">Brand</label>
                                            <div className="eqform-input-wrap">
                                                <Tag size={14} className="eqform-input-icon" />
                                                <input
                                                    type="text"
                                                    value={formData.brand || ''}
                                                    onChange={e => handleChange('brand', e.target.value)}
                                                    placeholder="Brand name"
                                                    className="eqform-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="eqform-field">
                                            <label className="eqform-field-label">Model</label>
                                            <div className="eqform-input-wrap">
                                                <Hash size={14} className="eqform-input-icon" />
                                                <input
                                                    type="text"
                                                    value={formData.model || ''}
                                                    onChange={e => handleChange('model', e.target.value)}
                                                    placeholder="Model number"
                                                    className="eqform-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="eqform-field">
                                            <label className="eqform-field-label">Quantity</label>
                                            <div className="eqform-input-wrap">
                                                <Package size={14} className="eqform-input-icon" />
                                                <input
                                                    type="number"
                                                    value={formData.quantity || 1}
                                                    onChange={e => handleChange('quantity', parseInt(e.target.value) || 1)}
                                                    className="eqform-input"
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION 4: LOGISTICS */}
                                <section className="eqform-section">
                                    <div className="eqform-section__head">
                                        <span className="eqform-section__num">4</span>
                                        <span className="eqform-section__label">Logistics & Procurement</span>
                                    </div>
                                    <div className="eqform-row-3col">
                                        <div className="eqform-field">
                                            <label className="eqform-field-label">Location</label>
                                            <div className="eqform-input-wrap">
                                                <MapPin size={14} className="eqform-input-icon" />
                                                <input
                                                    type="text"
                                                    value={formData.location || ''}
                                                    onChange={e => handleChange('location', e.target.value)}
                                                    placeholder="Floor / Zone"
                                                    className="eqform-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="eqform-field">
                                            <label className="eqform-field-label">Purchase Cost</label>
                                            <div className="eqform-input-wrap">
                                                <IndianRupee size={14} className="eqform-input-icon" />
                                                <input
                                                    type="number"
                                                    value={formData.purchaseCost || 0}
                                                    onChange={e => handleChange('purchaseCost', parseFloat(e.target.value) || 0)}
                                                    className="eqform-input"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="eqform-field">
                                            <label className="eqform-field-label">Purchase Date</label>
                                            <div className="eqform-input-wrap">
                                                <Calendar size={14} className="eqform-input-icon" />
                                                <input
                                                    type="date"
                                                    value={formData.purchaseDate || ''}
                                                    onChange={e => handleChange('purchaseDate', e.target.value)}
                                                    className="eqform-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </div>
                        </form>

                        {/* FOOTER */}
                        <footer className="eqform-footer">
                            <div className="eqform-footer__hint">
                                <Info size={13} />
                                <span>{isEditing ? 'Changes will be saved immediately' : 'Fields marked * are required'}</span>
                            </div>
                            <div className="eqform-footer__actions">
                                <button type="button" onClick={onClose} className="eq-btn eq-btn--secondary">
                                    Cancel
                                </button>
                                <button type="submit" onClick={handleSubmit} className="eq-btn eq-btn--primary">
                                    {isEditing ? <Save size={15} /> : <Plus size={15} />}
                                    {isEditing ? 'Save Changes' : 'Add Equipment'}
                                </button>
                            </div>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EquipmentModal;
