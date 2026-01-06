import React, { useState } from 'react';
import { X, Mail, Phone, Edit2, Save, Calendar, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType } from '../../types/user';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    staff: UserType | null;
    onEditProfile?: (staff: UserType) => void;
    onUpdate?: () => void;
}

const EnhancedStaffActionModal: React.FC<Props> = ({
    isOpen,
    onClose,
    staff,
    onEditProfile,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<UserType>>({});

    React.useEffect(() => {
        if (staff) {
            setFormData({
                fullName: staff.fullName,
                email: staff.email,
                phoneNumber: staff.phoneNumber || staff.phone,
            });
        }
    }, [staff]);

    if (!isOpen || !staff) return null;

    const handleSave = () => {
        if (onEditProfile && staff) {
            onEditProfile({ ...staff, ...formData });
        }
        setIsEditing(false);
    };

    const role = staff.roles?.[0]?.roleName || 'TRAINER';

    return (
        <AnimatePresence>
            <motion.div
                className="staff-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                }}
            >
                <motion.div
                    className="staff-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-secondary, #1a1a1a)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '420px',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                    }}
                >
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Trainer Details</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '20px',
                                fontWeight: 600,
                            }}>
                                {staff.fullName?.charAt(0) || 'T'}
                            </div>
                            <div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.fullName || ''}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                ) : (
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{staff.fullName}</h3>
                                )}
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{role}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <Mail size={16} />
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    />
                                ) : (
                                    <span>{staff.email}</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <Phone size={16} />
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber || ''}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                        placeholder="Phone number"
                                    />
                                ) : (
                                    <span>{staff.phoneNumber || staff.phone || 'Not provided'}</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <Calendar size={16} />
                                <span>Joined: {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <Briefcase size={16} />
                                <span>Employee ID: #{staff.userId.toString().padStart(4, '0')}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '8px', background: '#DC2626', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={16} />
                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    Close
                                </button>
                                <button onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#DC2626', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EnhancedStaffActionModal;
