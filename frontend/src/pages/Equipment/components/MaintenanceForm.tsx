import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Shield, Wrench, ClipboardCheck, Loader2, IndianRupee, Calendar, User, FileText, Check, AlertCircle } from 'lucide-react';
import type { MaintenanceType, MaintenanceStatus } from '../../../types/equipmentMaintenance';
import '../EquipmentModals.css';

interface MaintenanceFormProps {
    newLog: {
        maintenanceType: MaintenanceType;
        description: string;
        technicianName: string;
        cost: number;
        maintenanceDate: string;
        status: MaintenanceStatus;
    };
    setNewLog: (log: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isLoading?: boolean;
    isSuccess?: boolean;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ newLog, setNewLog, onSubmit, onCancel, isLoading = false, isSuccess = false }) => {

    const typeCards: { type: MaintenanceType; color: string; bg: string; border: string; icon: React.ReactNode; label: string; desc: string }[] = [
        { type: 'PREVENTIVE', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.06)', border: 'rgba(34, 197, 94, 0.2)', icon: <Shield size={20} />, label: 'Preventive', desc: 'Routine maintenance to prevent issues' },
        { type: 'REPAIR', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.06)', border: 'rgba(239, 68, 68, 0.2)', icon: <Wrench size={20} />, label: 'Repair', desc: 'Fix existing issues or broken parts' },
          { type: 'INSPECTION', color: '#64748b', bg: 'rgba(100, 116, 139, 0.06)', border: 'rgba(100, 116, 139, 0.2)', icon: <ClipboardCheck size={20} />, label: 'Inspection', desc: 'Evaluate equipment condition' }
    ];

    const statusOptions: { status: MaintenanceStatus; color: string; label: string; icon: React.ReactNode }[] = [
        { status: 'COMPLETED', color: '#22c55e', label: 'Completed', icon: <CheckCircle size={12} /> },
          { status: 'SCHEDULED', color: '#64748b', label: 'Scheduled', icon: <Calendar size={12} /> },
        { status: 'OVERDUE', color: '#ef4444', label: 'Overdue', icon: <AlertCircle size={12} /> },
    ];

    if (isSuccess) {
        return (
            <div className="maint-form-success">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="maint-form-success__ring"
                >
                    <CheckCircle size={32} />
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="maint-form-success__title">
                    Maintenance Logged!
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="maint-form-success__sub">
                    Record saved successfully
                </motion.p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="maint-form">
            {/* Form Header */}
            <div className="maint-form__header">
                <button type="button" onClick={onCancel} className="maint-form__back">
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h2 className="maint-form__title">New Maintenance Record</h2>
                    <p className="maint-form__subtitle">Fill in the details below to log a maintenance activity</p>
                </div>
            </div>

            {/* Form Body */}
            <div className="maint-form__body custom-scrollbar">
                <div className="maint-form__content">

                    {/* Section 1: Service Type */}
                    <div className="maint-form__section">
                        <div className="maint-form__section-label">
                            <span className="maint-form__section-num">1</span>
                            <span>Service Type</span>
                        </div>
                        <div className="maint-form__type-grid">
                            {typeCards.map(t => {
                                const isActive = newLog.maintenanceType === t.type;
                                return (
                                    <button
                                        key={t.type}
                                        type="button"
                                        onClick={() => setNewLog({ ...newLog, maintenanceType: t.type })}
                                        className={`maint-type-card ${isActive ? 'maint-type-card--active' : ''}`}
                                        style={{
                                            '--type-color': t.color,
                                            '--type-bg': t.bg,
                                            '--type-border': t.border,
                                        } as React.CSSProperties}
                                    >
                                        <div className="maint-type-card__icon">
                                            {t.icon}
                                        </div>
                                        <div className="maint-type-card__text">
                                            <span className="maint-type-card__label">{t.label}</span>
                                            <span className="maint-type-card__desc">{t.desc}</span>
                                        </div>
                                        {isActive && (
                                            <div className="maint-type-card__check" style={{ backgroundColor: t.color }}>
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 2: Details */}
                    <div className="maint-form__section">
                        <div className="maint-form__section-label">
                            <span className="maint-form__section-num">2</span>
                            <span>Details</span>
                        </div>

                        <div className="maint-form__field">
                            <label className="maint-form__label">Description <span className="maint-form__req">*</span></label>
                            <div className="maint-form__input-wrap">
                                <FileText size={14} className="maint-form__input-icon" />
                                <textarea
                                    value={newLog.description}
                                    onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                    placeholder="Describe the maintenance work performed..."
                                    className="maint-form__textarea"
                                    required
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="maint-form__row">
                            <div className="maint-form__field">
                                <label className="maint-form__label">Technician <span className="maint-form__req">*</span></label>
                                <div className="maint-form__input-wrap">
                                    <User size={14} className="maint-form__input-icon" />
                                    <input
                                        type="text"
                                        value={newLog.technicianName}
                                        onChange={e => setNewLog({ ...newLog, technicianName: e.target.value })}
                                        placeholder="Technician name"
                                        className="maint-form__input"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="maint-form__field">
                                <label className="maint-form__label">Cost (INR)</label>
                                <div className="maint-form__input-wrap">
                                    <IndianRupee size={14} className="maint-form__input-icon" />
                                    <input
                                        type="number"
                                        value={newLog.cost}
                                        onChange={e => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                                        placeholder="0"
                                        className="maint-form__input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="maint-form__row">
                            <div className="maint-form__field">
                                <label className="maint-form__label">Date <span className="maint-form__req">*</span></label>
                                <div className="maint-form__input-wrap">
                                    <Calendar size={14} className="maint-form__input-icon" />
                                    <input
                                        type="date"
                                        value={newLog.maintenanceDate}
                                        onChange={e => setNewLog({ ...newLog, maintenanceDate: e.target.value })}
                                        className="maint-form__input"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="maint-form__field">
                                <label className="maint-form__label">Status</label>
                                <div className="maint-form__status-pills">
                                    {statusOptions.map(s => {
                                        const isActive = newLog.status === s.status;
                                        return (
                                            <button
                                                key={s.status}
                                                type="button"
                                                onClick={() => setNewLog({ ...newLog, status: s.status })}
                                                className={`maint-status-pill ${isActive ? 'maint-status-pill--active' : ''}`}
                                                style={isActive ? { color: s.color, borderColor: `${s.color}50`, backgroundColor: `${s.color}10` } : {}}
                                            >
                                                {s.icon}
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="maint-form__footer">
                <button type="button" onClick={onCancel} className="eq-btn eq-btn--secondary">Cancel</button>
                <button type="submit" disabled={isLoading || !newLog.description || !newLog.technicianName} className="eq-btn eq-btn--primary">
                    {isLoading ? (
                        <span className="maint-form__btn-content"><Loader2 size={15} className="animate-spin" /> Saving...</span>
                    ) : (
                        <span className="maint-form__btn-content"><CheckCircle size={15} /> Save Record</span>
                    )}
                </button>
            </div>
        </form>
    );
};
