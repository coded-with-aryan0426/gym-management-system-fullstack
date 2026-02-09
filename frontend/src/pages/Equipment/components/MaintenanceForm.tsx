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
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ newLog, setNewLog, onSubmit, onCancel, isLoading = false }) => {
    const getTypeStyles = (type: MaintenanceType) => {
        const styles: Record<MaintenanceType, { color: string; bg: string; icon: React.ReactNode }> = {
            PREVENTIVE: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <Shield size={18} /> },
            REPAIR: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <Wrench size={18} /> },
            INSPECTION: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <ClipboardCheck size={18} /> }
        };
        return styles[type];
    };

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
                    <h2 className="eq-modal__title">New Maintenance Record</h2>
                </div>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-5 space-y-4 max-w-3xl mx-auto">
                    {/* Type Selection */}
                    <div className="eq-modal__section">
                        <h3 className="eq-section-title">Service Type</h3>
                        <div className="grid grid-cols-3 gap-2">
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
                                        {isActive && (
                                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="eq-modal__section">
                        <h3 className="eq-section-title">Details</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="eq-label">Description *</label>
                                <div className="eq-input-wrapper" style={{ alignItems: 'flex-start' }}>
                                    <FileText size={14} className="eq-input-icon" style={{ top: '10px' }} />
                                    <textarea
                                        value={newLog.description}
                                        onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                                        placeholder="Describe the work performed..."
                                        className="eq-input eq-input--with-icon"
                                        style={{ height: '72px', resize: 'none', paddingTop: '8px', paddingBottom: '8px' }}
                                        required
                                    />
                                </div>
                            </div>

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
                                            {newLog.status === status && <Check size={12} />}
                                            {status}
                                        </button>
                                    ))}
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
                <button type="submit" disabled={isLoading} className="eq-btn eq-btn--primary">
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
