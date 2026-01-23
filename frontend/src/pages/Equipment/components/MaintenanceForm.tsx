import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Shield, Wrench, ClipboardCheck, Loader2 } from 'lucide-react';
import type { MaintenanceType, MaintenanceStatus } from '../../../types/equipmentMaintenance';

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
    const [showSuccess, setShowSuccess] = useState(false);

    const getTypeStyles = (type: MaintenanceType) => {
        const colors: Record<string, string> = {
            PREVENTIVE: 'var(--modal-success)',
            REPAIR: 'var(--modal-danger)',
            INSPECTION: 'var(--accent-primary)'
        };
        const bgs: Record<string, string> = {
            PREVENTIVE: 'var(--modal-success-bg)',
            REPAIR: 'var(--modal-danger-bg)',
            INSPECTION: 'var(--modal-info-bg)'
        };
        return { color: colors[type] || 'var(--text-secondary)', bg: bgs[type] || 'var(--bg-surface-secondary)' };
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onSubmit={onSubmit}
            className="p-6 h-full flex flex-col"
        >
            <div className="flex items-center gap-2 mb-6">
                <button type="button" onClick={onCancel} className="p-2 hover:bg-[var(--bg-surface-secondary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <h2 className="text-base font-bold text-[var(--text-primary)]">New Maintenance Log</h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                {/* Type Selector */}
                <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Maintenance Type</label>
                    <div className="grid grid-cols-3 gap-4">
                        {(['PREVENTIVE', 'REPAIR', 'INSPECTION'] as MaintenanceType[]).map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setNewLog({ ...newLog, maintenanceType: type })}
                                className={`py-4 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all flex flex-col items-center justify-center gap-3 ${newLog.maintenanceType === type
                                    ? 'border-transparent shadow-lg scale-[1.02]'
                                    : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                style={newLog.maintenanceType === type ? { backgroundColor: getTypeStyles(type).bg, color: getTypeStyles(type).color, borderColor: getTypeStyles(type).color } : {}}
                            >
                                {type === 'PREVENTIVE' && <Shield size={24} />}
                                {type === 'REPAIR' && <Wrench size={24} />}
                                {type === 'INSPECTION' && <ClipboardCheck size={24} />}
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Description *</label>
                    <textarea
                        value={newLog.description}
                        onChange={e => setNewLog({ ...newLog, description: e.target.value })}
                        placeholder="Describe the maintenance work performed in detail..."
                        className="w-full p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent-primary)]/20 outline-none transition-all placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--accent-primary)]"
                        style={{ resize: 'none', height: '120px' }}
                        required
                    />
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Technician</label>
                        <input
                            type="text"
                            value={newLog.technicianName}
                            onChange={e => setNewLog({ ...newLog, technicianName: e.target.value })}
                            placeholder="Name"
                            className="w-full h-11 px-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent-primary)]/20 outline-none transition-all focus:border-[var(--accent-primary)]"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Cost ($)</label>
                        <input
                            type="number"
                            value={newLog.cost}
                            onChange={e => setNewLog({ ...newLog, cost: Number(e.target.value) })}
                            placeholder="0"
                            className="w-full h-11 px-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent-primary)]/20 outline-none transition-all focus:border-[var(--accent-primary)]"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Date</label>
                        <input
                            type="date"
                            value={newLog.maintenanceDate}
                            onChange={e => setNewLog({ ...newLog, maintenanceDate: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent-primary)]/20 outline-none transition-all focus:border-[var(--accent-primary)]"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">Status</label>
                        <select
                            value={newLog.status}
                            onChange={e => setNewLog({ ...newLog, status: e.target.value as MaintenanceStatus })}
                            className="w-full h-11 px-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--accent-primary)]/20 outline-none transition-all focus:border-[var(--accent-primary)] cursor-pointer"
                        >
                            <option value="COMPLETED">Completed</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="OVERDUE">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-6 mt-2 border-t border-[var(--border-color)]">
                <motion.button
                    whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-primary)]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                <Loader2 size={20} className="animate-spin" /> Saving...
                            </motion.span>
                        ) : (
                            <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                <CheckCircle size={20} /> Save Maintenance Record
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.form>
    );
};
