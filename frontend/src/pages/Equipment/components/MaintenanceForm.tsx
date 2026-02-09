import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Shield, Wrench, ClipboardCheck, Loader2, IndianRupee, Calendar, User, FileText, Check, AlertCircle, Sparkles } from 'lucide-react';
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
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ newLog, setNewLog, onSubmit, onCancel, isLoading = false }) => {
    const getTypeStyles = (type: MaintenanceType) => {
        const styles: Record<MaintenanceType, { color: string; bg: string; icon: React.ReactNode; desc: string }> = {
            PREVENTIVE: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <Shield size={24} />, desc: 'Routine checkups' },
            REPAIR: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <Wrench size={24} />, desc: 'Fixing malfunctions' },
            INSPECTION: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <ClipboardCheck size={24} />, desc: 'Detailed assessment' }
        };
        return styles[type];
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onSubmit={onSubmit}
            className="flex flex-col h-full bg-[var(--bg-surface)]"
        >
            <div className="eq-modal__header border-b border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="eq-modal__close">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="eq-modal__title">Create Maintenance Record</h2>
                        <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">Log a new service activity for this equipment.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <div className="max-w-4xl mx-auto space-y-10">
                    {/* TYPE SELECTION */}
                    <section className="eq-modal__section">
                        <h3 className="eq-section-title">Service Category</h3>
                        <div className="grid grid-cols-3 gap-6 mt-2">
                            {(['PREVENTIVE', 'REPAIR', 'INSPECTION'] as MaintenanceType[]).map(type => {
                                const styles = getTypeStyles(type);
                                const isActive = newLog.maintenanceType === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNewLog({ ...newLog, maintenanceType: type })}
                                        className={`eq-category-card ${isActive ? 'eq-category-card--active' : ''}`}
                                    >
                                        <div className="eq-category-card__icon" style={{ 
                                            backgroundColor: isActive ? styles.bg : 'var(--bg-surface-secondary)',
                                            color: isActive ? styles.color : 'var(--text-secondary)'
                                        }}>
                                            {styles.icon}
                                        </div>
                                        <span className="eq-category-card__label">{type}</span>
                                        <span className="eq-category-card__desc">{styles.desc}</span>
                                        {isActive && (
                                            <motion.div 
                                                layoutId="active-maint-cat"
                                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <Check size={12} strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* DETAILS */}
                    <section className="eq-modal__section">
                        <h3 className="eq-section-title">Record Details</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="eq-label">Service Description *</label>
                                <div className="eq-input-wrapper" style={{ alignItems: 'flex-start' }}>
                                    <FileText size={18} className="eq-input-icon" style={{ top: '15px' }} />
                                    <textarea
                                        value={newLog.description}
                                        onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                        placeholder="Briefly describe the work performed or the issue fixed..."
                                        className="eq-input eq-input--with-icon min-h-[100px] py-3 leading-relaxed"
                                        style={{ height: 'auto', resize: 'none' }}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="eq-label">Service Technician</label>
                                <div className="eq-input-wrapper">
                                    <User size={18} className="eq-input-icon" />
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
                                <label className="eq-label">Operational Cost (INR)</label>
                                <div className="eq-input-wrapper">
                                    <IndianRupee size={18} className="eq-input-icon" />
                                    <input
                                        type="number"
                                        value={newLog.cost}
                                        onChange={e => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                                        placeholder="0.00"
                                        className="eq-input eq-input--with-icon"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="eq-label">Activity Date</label>
                                <div className="eq-input-wrapper">
                                    <Calendar size={18} className="eq-input-icon" />
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
                                <label className="eq-label">Service Result</label>
                                <div className="eq-pill-group mt-1">
                                    {(['COMPLETED', 'SCHEDULED', 'OVERDUE'] as MaintenanceStatus[]).map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setNewLog({ ...newLog, status })}
                                            className={`eq-pill ${newLog.status === status ? 'eq-pill--active' : ''}`}
                                            style={newLog.status === status ? {
                                                borderColor: status === 'COMPLETED' ? '#22c55e' : status === 'SCHEDULED' ? '#3b82f6' : '#ef4444',
                                                color: status === 'COMPLETED' ? '#22c55e' : status === 'SCHEDULED' ? '#3b82f6' : '#ef4444'
                                            } : {}}
                                        >
                                            {newLog.status === status && <Check size={14} />}
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* PRO-TIP */}
                    <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-indigo-500">Maintenance Tip</h4>
                            <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium leading-relaxed">
                                Accurate cost logging helps in calculating the Total Cost of Ownership (TCO) for this asset. Detailed descriptions aid in predicting future failure points.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="eq-modal__footer p-8 bg-[var(--bg-surface-secondary)] border-t border-[var(--border-color)]">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="eq-btn eq-btn--primary px-10 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20"
                >
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                                <Loader2 size={20} className="animate-spin" /> <span className="font-bold">Saving Record...</span>
                            </motion.span>
                        ) : (
                            <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                                <CheckCircle size={20} strokeWidth={3} /> <span className="font-bold">Finalize Maintenance Log</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.form>
    );
};
