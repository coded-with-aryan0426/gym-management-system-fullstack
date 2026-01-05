import React, { useState } from 'react';
import { X, User, Mail, Phone, Edit2, Save, Calendar, Award, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User as UserType } from '../../types/user';
import './StaffActionModal.css';

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
    onUpdate
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
            >
                <motion.div
                    className="staff-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="staff-modal__header">
                        <h2>Staff Details</h2>
                        <button className="staff-modal__close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="staff-modal__content">
                        <div className="staff-modal__profile">
                            <div className="staff-modal__avatar">
                                {staff.fullName?.charAt(0) || 'S'}
                            </div>
                            <div className="staff-modal__info">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.fullName || ''}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="staff-modal__input"
                                    />
                                ) : (
                                    <h3>{staff.fullName}</h3>
                                )}
                                <span className="staff-modal__role">{role}</span>
                            </div>
                        </div>

                        <div className="staff-modal__details">
                            <div className="staff-modal__detail">
                                <Mail size={16} />
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="staff-modal__input"
                                    />
                                ) : (
                                    <span>{staff.email}</span>
                                )}
                            </div>
                            <div className="staff-modal__detail">
                                <Phone size={16} />
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber || ''}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="staff-modal__input"
                                        placeholder="Phone number"
                                    />
                                ) : (
                                    <span>{staff.phoneNumber || staff.phone || 'Not provided'}</span>
                                )}
                            </div>
                            <div className="staff-modal__detail">
                                <Calendar size={16} />
                                <span>Joined: {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="staff-modal__detail">
                                <Briefcase size={16} />
                                <span>Employee ID: #{staff.userId.toString().padStart(4, '0')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="staff-modal__footer">
                        {isEditing ? (
                            <>
                                <button className="staff-modal__btn staff-modal__btn--secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                                <button className="staff-modal__btn staff-modal__btn--primary" onClick={handleSave}>
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="staff-modal__btn staff-modal__btn--secondary" onClick={onClose}>
                                    Close
                                </button>
                                <button className="staff-modal__btn staff-modal__btn--primary" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} />
                                    Edit Profile
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
