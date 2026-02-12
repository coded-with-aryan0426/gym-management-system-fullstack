import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Shield, Wrench, ClipboardCheck, Loader2, IndianRupee, Calendar, User, FileText, Check } from 'lucide-react';
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
    const getTypeStyles = (type: MaintenanceType) => {
        const styles: Record<MaintenanceType, { color: string; bg: string; icon: React.ReactNode; desc: string }> = {
            PREVENTIVE: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <Shield size={18} />, desc: 'Routine maintenance to prevent issues' },
            REPAIR: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <Wrench size={18} />, desc: 'Fix existing issues or broken parts' },
            INSPECTION: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <ClipboardCheck size={18} />, desc: 'Evaluate equipment condition' }
        };
        return styles[type];
    };

    const getStatusStyles = (status: MaintenanceStatus) => {
        const map: Record<MaintenanceStatus, { color: string }> = {
            COMPLETED: { color: '#22c55e' },
            SCHEDULED: { color: '#3b82f6' },
            OVERDUE: { color: '#ef4444' },
            CANCELLED: { color: '#64748b' }
        };
        return map[status] || { color: '#64748b' };
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-[var(--bg-surface)]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center mb-4"
                >
                    <CheckCircle size={32} className="text-green-500" />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-base font-bold text-[var(--text-primary)]"
                >
                    Maintenance Logged!
                </motion.p>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-[var(--text-secondary)] mt-1"
                >
                    Record saved successfully
                </motion.p>
            </div>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col h-full bg-[var(--bg-surface)]"
        >
            {/* Header */}
            <div className="eq-modal__header">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={onCancel} className="eq-modal__close">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h2 className="eq-modal__title">New Maintenance Record</h2>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Fill in the details below</p>
                    </div>
                </div>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-5 space-y-5 max-w-3xl mx-auto">
                    {/* Type Selection */}
                    <div className="eq-modal__section">
                        <h3 className="eq-section-title">Service Type</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {(['PREVENTIVE', 'REPAIR', 'INSPECTION'] as MaintenanceType[]).map(type => {
                                const styles = getTypeStyles(type);
                                const isActive = newLog.maintenanceType === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNewLog({ ...newLog, maintenanceType: type })}
                                        className={`eq-category-card ${isActive ? 'eq-category-card--active' : ''}`}
                                        style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '14px 10px', gap: '8px' }}
                                    >
                                        <div className="eq-category-card__icon" style={{
                                            backgroundColor: isActive ? styles.bg : 'var(--bg-surface-secondary)',
                                            color: isActive ? styles.color : 'var(--text-secondary)',
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '10px'
                                        }}>
                                            {styles.icon}
                                        </div>
                                        <div>
                                            <span className="eq-category-card__label block">{type}</span>
                                            <span className="text-[9px] text-[var(--text-secondary)] mt-0.5 block leading-tight">{styles.desc}</span>
                                        </div>
                                        {isActive && (
                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: styles.color }}>
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="eq-modal__section">
                        <h3 className="eq-section-title">Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="eq-label">Description *</label>
                                <div className="eq-input-wrapper" style={{ alignItems: 'flex-start' }}>
                                    <FileText size={14} className="eq-input-icon" style={{ top: '10px' }} />
                                    <textarea
                                        value={newLog.description}
                                        onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                        placeholder="Describe the maintenance work performed..."
                                        className="eq-input eq-input--with-icon"
                                        style={{ height: '80px', resize: 'none', paddingTop: '8px', paddingBottom: '8px' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="eq-label">Technician *</label>
                                    <div className="eq-input-wrapper">
                                        <User size={14} className="eq-input-icon" />
                                        <input
                                            type="text"
                                            value={newLog.technicianName}
                                            onChange={e => setNewLog({ ...newLog, technicianName: e.target.value })}
                                            placeholder="Full Name"
                                            className="eq-input eq-input--with-icon"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="eq-label">Cost (INR)</label>
                                    <div className="eq-input-wrapper">
                                        <IndianRupee size={14} className="eq-input-icon" />
                                        <input
                                            type="number"
                                            value={newLog.cost}
                                            onChange={e => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                                            placeholder="0"
                                            className="eq-input eq-input--with-icon"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="eq-label">Date *</label>
                                    <div className="eq-input-wrapper">
                                        <Calendar size={14} className="eq-input-icon" />
                                        <input
                                            type="date"
                                            value={newLog.maintenanceDate}
                                            onChange={e => setNewLog({ ...newLog, maintenanceDate: e.target.value })}
                                            className="eq-input eq-input--with-icon"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="eq-label">Status</label>
                                    <div className="eq-pill-group mt-1">
                                        {(['COMPLETED', 'SCHEDULED', 'OVERDUE'] as MaintenanceStatus[]).map(status => {
                                            const sStyles = getStatusStyles(status);
                                            return (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setNewLog({ ...newLog, status })}
                                                    className={`eq-pill ${newLog.status === status ? 'eq-pill--active' : ''}`}
                                                    style={newLog.status === status ? {
                                                        borderColor: sStyles.color,
                                                        color: sStyles.color
                                                    } : {}}
                                                >
                                                    {newLog.status === status && <Check size={12} />}
                                                    {status}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="eq-modal__footer">
                <button type="button" onClick={onCancel} className="eq-btn eq-btn--secondary">
                    Cancel
                </button>
                <button type="submit" disabled={isLoading || !newLog.description || !newLog.technicianName} className="eq-btn eq-btn--primary">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                <Loader2 size={15} className="animate-spin" /> Saving...
                            </motion.span>
                        ) : (
                            <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                <CheckCircle size={15} /> Save Record
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </form>
    );
};
