import React, { useState, useEffect } from 'react';
import type { Equipment, EquipmentCategory, EquipmentStatus, EquipmentCondition } from '../../../types/equipment';
import { X, Dumbbell, Heart, Zap, Flower2, Sparkles, Package, MapPin, Calendar, IndianRupee, Hash, Check, Save, Plus, Info, Activity, ShieldCheck } from 'lucide-react';
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
        { value: 'STRENGTH', label: 'Strength', desc: 'Weights, racks, benches', icon: <Dumbbell size={24} />, color: '#ef4444' },
        { value: 'CARDIO', label: 'Cardio', desc: 'Treadmills, bikes, rowers', icon: <Heart size={24} />, color: '#f97316' },
        { value: 'FUNCTIONAL', label: 'Functional', desc: 'Kettlebells, ropes, boxes', icon: <Zap size={24} />, color: '#eab308' },
        { value: 'YOGA', label: 'Yoga', desc: 'Mats, blocks, bolsters', icon: <Flower2 size={24} />, color: '#22c55e' },
        { value: 'RECOVERY', label: 'Recovery', desc: 'Rollers, massage guns', icon: <Sparkles size={24} />, color: '#3b82f6' },
        { value: 'OTHER', label: 'Other', desc: 'Miscellaneous gear', icon: <Package size={24} />, color: '#8b5cf6' }
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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="eq-modal eq-modal--compact"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="eq-modal__header">
                            <div>
                                <h1 className="eq-modal__title">
                                    {initialData ? 'Edit Equipment' : 'Add New Equipment'}
                                </h1>
                                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Fill in the details below to manage your fitness asset.</p>
                            </div>
                            <button onClick={onClose} className="eq-modal__close">
                                <X size={20} />
                            </button>
                        </header>

                        <div className="eq-modal-layout">
                            {/* SIDEBAR */}
                            <aside className="eq-modal-sidebar">
                                <section>
                                    <h3 className="eq-section-title"><Activity size={14} /> Status & Vitality</h3>
                                    <div className="flex flex-col gap-4 mt-4">
                                        <div>
                                            <label className="eq-label">Current Status</label>
                                            <div className="eq-pill-group">
                                                {statuses.map(s => (
                                                    <button
                                                        key={s.value}
                                                        type="button"
                                                        onClick={() => handleChange('status', s.value)}
                                                        className={`eq-pill ${formData.status === s.value ? 'eq-pill--active' : ''}`}
                                                        style={formData.status === s.value ? { color: s.color, borderColor: s.color } : {}}
                                                    >
                                                        {formData.status === s.value && <Check size={14} />}
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
                                                        style={formData.condition === c.value ? { color: c.color, borderColor: c.color } : {}}
                                                    >
                                                        {formData.condition === c.value && <Check size={14} />}
                                                        {c.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="eq-section-title"><ShieldCheck size={14} /> Verification</h3>
                                    <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-color)] mt-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                <Info size={16} />
                                            </div>
                                            <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                                                Ensure all required fields marked with * are filled accurately for proper fleet tracking.
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </aside>

                            {/* MAIN CONTENT */}
                            <main className="eq-modal-main custom-scrollbar">
                                <form onSubmit={handleSubmit} className="eq-modal__body">
                                    {/* CATEGORY SELECTOR */}
                                    <div className="eq-modal__section">
                                        <h3 className="eq-section-title">Equipment Category</h3>
                                        <div className="eq-category-grid">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => handleChange('category', cat.value)}
                                                    className={`eq-category-card ${formData.category === cat.value ? 'eq-category-card--active' : ''}`}
                                                >
                                                    <div className="eq-category-card__icon" style={{ 
                                                        backgroundColor: formData.category === cat.value ? `${cat.color}15` : 'var(--bg-surface)',
                                                        color: formData.category === cat.value ? cat.color : 'var(--text-secondary)'
                                                    }}>
                                                        {cat.icon}
                                                    </div>
                                                    <span className="eq-category-card__label">{cat.label}</span>
                                                    <span className="eq-category-card__desc">{cat.desc}</span>
                                                    {formData.category === cat.value && (
                                                        <motion.div 
                                                            layoutId="active-cat"
                                                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                        >
                                                            <Check size={12} strokeWidth={3} />
                                                        </motion.div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* IDENTIFICATION */}
                                    <div className="eq-modal__section">
                                        <h3 className="eq-section-title">Identification & Model</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2">
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
                                                    placeholder="Brand Name"
                                                    className="eq-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="eq-label">Model Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.model || ''}
                                                    onChange={e => handleChange('model', e.target.value)}
                                                    placeholder="e.g. T-9000"
                                                    className="eq-input"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* LOGISTICS & PROCUREMENT */}
                                    <div className="eq-modal__section">
                                        <h3 className="eq-section-title">Logistics & Procurement</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="eq-label">Floor Location</label>
                                                <div className="eq-input-wrapper">
                                                    <MapPin size={18} className="eq-input-icon" />
                                                    <input
                                                        type="text"
                                                        value={formData.location || ''}
                                                        onChange={e => handleChange('location', e.target.value)}
                                                        placeholder="e.g. Level 2, Cardio Zone"
                                                        className="eq-input eq-input--with-icon"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="eq-label">Total Quantity</label>
                                                <div className="eq-input-wrapper">
                                                    <Hash size={18} className="eq-input-icon" />
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
                                                <label className="eq-label">Purchase Cost (INR)</label>
                                                <div className="eq-input-wrapper">
                                                    <IndianRupee size={18} className="eq-input-icon" />
                                                    <input
                                                        type="number"
                                                        value={formData.purchaseCost || 0}
                                                        onChange={e => handleChange('purchaseCost', parseFloat(e.target.value) || 0)}
                                                        className="eq-input eq-input--with-icon"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="eq-label">Procurement Date</label>
                                                <div className="eq-input-wrapper">
                                                    <Calendar size={18} className="eq-input-icon" />
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
                            </main>
                        </div>

                        <footer className="eq-modal__footer">
                            <button type="button" onClick={onClose} className="eq-btn eq-btn--secondary">
                                Cancel
                            </button>
                            <button type="submit" onClick={handleSubmit} className="eq-btn eq-btn--primary">
                                {initialData ? <Save size={18} /> : <Plus size={18} />}
                                {initialData ? 'Save Changes' : 'Register Equipment'}
                            </button>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EquipmentModal;
