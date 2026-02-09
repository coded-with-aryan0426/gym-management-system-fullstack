import React, { useState, useEffect } from 'react';
import type { Equipment, EquipmentCategory, EquipmentStatus, EquipmentCondition } from '../../../types/equipment';
import { X, Dumbbell, Heart, Zap, Flower2, Sparkles, Package, MapPin, Calendar, IndianRupee, Hash, Check, Save, Plus } from 'lucide-react';
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

    const categories: { value: EquipmentCategory; label: string; icon: React.ReactNode; color: string }[] = [
        { value: 'STRENGTH', label: 'Strength', icon: <Dumbbell size={18} />, color: '#ef4444' },
        { value: 'CARDIO', label: 'Cardio', icon: <Heart size={18} />, color: '#f97316' },
        { value: 'FUNCTIONAL', label: 'Functional', icon: <Zap size={18} />, color: '#eab308' },
        { value: 'YOGA', label: 'Yoga', icon: <Flower2 size={18} />, color: '#22c55e' },
        { value: 'RECOVERY', label: 'Recovery', icon: <Sparkles size={18} />, color: '#3b82f6' },
        { value: 'OTHER', label: 'Other', icon: <Package size={18} />, color: '#8b5cf6' }
    ];

    const statuses: { value: EquipmentStatus; label: string; color: string }[] = [
        { value: 'ACTIVE', label: 'Active', color: '#22c55e' },
        { value: 'MAINTENANCE', label: 'Maintenance', color: '#eab308' },
        { value: 'OUT_OF_ORDER', label: 'Out of Order', color: '#ef4444' },
        { value: 'RETIRED', label: 'Retired', color: 'var(--text-secondary)' }
    ];

    const conditions: { value: EquipmentCondition; label: string; color: string }[] = [
        { value: 'NEW', label: 'New', color: '#22c55e' },
        { value: 'GOOD', label: 'Good', color: '#3b82f6' },
        { value: 'FAIR', label: 'Fair', color: '#eab308' },
        { value: 'POOR', label: 'Poor', color: '#ef4444' }
    ];

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
                        <header className="eq-modal__header">
                            <h1 className="eq-modal__title">
                                {initialData ? 'Edit Equipment' : 'Add New Equipment'}
                            </h1>
                            <button onClick={onClose} className="eq-modal__close">
                                <X size={16} />
                            </button>
                        </header>

                        {/* SCROLLABLE BODY */}
                        <form onSubmit={handleSubmit} className="eq-modal__body">
                            {/* CATEGORY */}
                            <div className="eq-modal__section">
                                <h3 className="eq-section-title">Category</h3>
                                <div className="eq-category-grid">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => handleChange('category', cat.value)}
                                            className={`eq-category-card ${formData.category === cat.value ? 'eq-category-card--active' : ''}`}
                                        >
                                            <div className="eq-category-card__icon" style={{
                                                backgroundColor: formData.category === cat.value ? `${cat.color}20` : 'var(--bg-surface)',
                                                color: formData.category === cat.value ? cat.color : 'var(--text-secondary)'
                                            }}>
                                                {cat.icon}
                                            </div>
                                            <span className="eq-category-card__label">{cat.label}</span>
                                            {formData.category === cat.value && (
                                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                    <Check size={10} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* STATUS & CONDITION - side by side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="eq-modal__section">
                                    <h3 className="eq-section-title">Status</h3>
                                    <div className="eq-pill-group">
                                        {statuses.map(s => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={() => handleChange('status', s.value)}
                                                className={`eq-pill ${formData.status === s.value ? 'eq-pill--active' : ''}`}
                                                style={formData.status === s.value ? { color: s.color, borderColor: s.color } : {}}
                                            >
                                                {formData.status === s.value && <Check size={12} />}
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="eq-modal__section">
                                    <h3 className="eq-section-title">Condition</h3>
                                    <div className="eq-pill-group">
                                        {conditions.map(c => (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => handleChange('condition', c.value)}
                                                className={`eq-pill ${formData.condition === c.value ? 'eq-pill--active' : ''}`}
                                                style={formData.condition === c.value ? { color: c.color, borderColor: c.color } : {}}
                                            >
                                                {formData.condition === c.value && <Check size={12} />}
                                                {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* IDENTIFICATION */}
                            <div className="eq-modal__section">
                                <h3 className="eq-section-title">Identification</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-3">
                                        <label className="eq-label">Equipment Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={e => handleChange('name', e.target.value)}
                                            placeholder="e.g. LifeFitness Treadmill Pro"
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
                                            placeholder="Brand"
                                            className="eq-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="eq-label">Model</label>
                                        <input
                                            type="text"
                                            value={formData.model || ''}
                                            onChange={e => handleChange('model', e.target.value)}
                                            placeholder="Model #"
                                            className="eq-input"
                                        />
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
                                </div>
                            </div>

                            {/* LOGISTICS */}
                            <div className="eq-modal__section">
                                <h3 className="eq-section-title">Logistics & Procurement</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="eq-label">Location</label>
                                        <div className="eq-input-wrapper">
                                            <MapPin size={14} className="eq-input-icon" />
                                            <input
                                                type="text"
                                                value={formData.location || ''}
                                                onChange={e => handleChange('location', e.target.value)}
                                                placeholder="Floor / Zone"
                                                className="eq-input eq-input--with-icon"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="eq-label">Purchase Cost</label>
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
                                        <label className="eq-label">Purchase Date</label>
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
                            </div>
                        </form>

                        {/* FOOTER */}
                        <footer className="eq-modal__footer">
                            <button type="button" onClick={onClose} className="eq-btn eq-btn--secondary">
                                Cancel
                            </button>
                            <button type="submit" onClick={handleSubmit} className="eq-btn eq-btn--primary">
                                {initialData ? <Save size={15} /> : <Plus size={15} />}
                                {initialData ? 'Save Changes' : 'Add Equipment'}
                            </button>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EquipmentModal;
