import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Edit2, Save, Calendar, Briefcase, Clock, MapPin, Shield, DollarSign, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../../utils/showToast';
import api from '../../services/api';
import type { Staff } from '../../types/user';
import './StaffActionModal.css';

const ROLE_LABELS: Record<string, string> = {
  RECEPTIONIST: 'Receptionist', FLOOR_MANAGER: 'Floor Manager', MAINTENANCE: 'Maintenance',
  CLEANING: 'Housekeeping', OPERATIONS: 'Operations', SALES: 'Sales',
  ADMIN: 'Admin', MANAGER: 'Manager', STAFF: 'Staff',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onEditProfile?: (staff: Staff) => void;
  onUpdate?: () => void;
}

type Tab = 'overview' | 'job' | 'emergency';

const EnhancedStaffActionModal: React.FC<Props> = ({ isOpen, onClose, staff, onEditProfile, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [localStaff, setLocalStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setLocalStaff({ ...staff } as Staff);
      setFormData({
        fullName: staff.fullName,
        email: staff.email,
        phone: staff.phone || '',
        gender: (staff as any).gender || '',
        dateOfBirth: (staff as any).dateOfBirth || '',
        address: (staff as any).address || '',
        city: (staff as any).city || '',
        state: (staff as any).state || '',
        zipCode: (staff as any).zipCode || '',
        jobTitle: (staff as any).jobTitle || '',
        department: (staff as any).department || '',
        shiftTiming: (staff as any).shiftTiming || '',
        salary: (staff as any).salary || '',
        employeeIdCode: (staff as any).employeeIdCode || '',
        emergencyContactName: (staff as any).emergencyContactName || '',
        emergencyContactPhone: (staff as any).emergencyContactPhone || '',
        emergencyContactRelation: (staff as any).emergencyContactRelation || '',
      });
      setActiveTab('overview');
      setIsEditing(false);
    }
  }, [staff]);

  if (!isOpen || !localStaff) return null;

  const s = localStaff as any;
  const role = s.staffRole || 'STAFF';

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await api.updateStaffDetails(localStaff.userId, formData);
      setLocalStaff({ ...localStaff, ...result } as Staff);
      setIsEditing(false);
      showToast('Staff details updated', 'success');
      onUpdate?.();
    } catch (err) {
      showToast('Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="smod-info-row">
      <div className="smod-info-row__icon"><Icon size={14} /></div>
      <div className="smod-info-row__content">
        <span className="smod-info-row__label">{label}</span>
        <span className="smod-info-row__value">{value || '—'}</span>
      </div>
    </div>
  );

  const EditRow = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div className="smod-edit-row">
      <label className="smod-edit-row__label">{label}</label>
      <input
        type={type}
        className="smod-edit-row__input"
        value={formData[field] || ''}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div className="smod-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="smod-panel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="smod-header">
            <div className="smod-header__profile">
              <div className="smod-avatar">{localStaff.fullName?.charAt(0) || 'S'}</div>
              <div className="smod-header__info">
                <h2 className="smod-header__name">{localStaff.fullName}</h2>
                <div className="smod-header__meta">
                  <span className="smod-role-badge" data-role={role}>{ROLE_LABELS[role] || role}</span>
                  <span className="smod-header__dept">{s.department || 'Staff'}</span>
                </div>
              </div>
            </div>
            <button className="smod-close" onClick={onClose}><X size={18} /></button>
          </div>

          {/* Quick Stats */}
          <div className="smod-quick-stats">
            <div className="smod-quick-stat">
              <span className="smod-quick-stat__label">Employee ID</span>
              <span className="smod-quick-stat__value">{s.employeeIdCode || `#${localStaff.userId.toString().padStart(4, '0')}`}</span>
            </div>
            <div className="smod-quick-stat">
              <span className="smod-quick-stat__label">Shift</span>
              <span className="smod-quick-stat__value">{s.shiftTiming || '—'}</span>
            </div>
            <div className="smod-quick-stat">
              <span className="smod-quick-stat__label">Status</span>
              <span className={`smod-quick-stat__value smod-quick-stat__value--${(s.status || 'Active').toLowerCase()}`}>{s.status || 'Active'}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="smod-tabs">
            <button className={`smod-tab ${activeTab === 'overview' ? 'smod-tab--active' : ''}`} onClick={() => setActiveTab('overview')}>
              <User size={14} /> Personal
            </button>
            <button className={`smod-tab ${activeTab === 'job' ? 'smod-tab--active' : ''}`} onClick={() => setActiveTab('job')}>
              <Briefcase size={14} /> Job Details
            </button>
            <button className={`smod-tab ${activeTab === 'emergency' ? 'smod-tab--active' : ''}`} onClick={() => setActiveTab('emergency')}>
              <AlertTriangle size={14} /> Emergency
            </button>
          </div>

          {/* Content */}
          <div className="smod-content">
            {activeTab === 'overview' && !isEditing && (
              <div className="smod-section">
                <InfoRow icon={User} label="Full Name" value={localStaff.fullName} />
                <InfoRow icon={Mail} label="Email" value={localStaff.email} />
                <InfoRow icon={Phone} label="Phone" value={localStaff.phone || ''} />
                <InfoRow icon={User} label="Gender" value={s.gender || ''} />
                <InfoRow icon={Calendar} label="Date of Birth" value={s.dateOfBirth || ''} />
                <InfoRow icon={MapPin} label="Address" value={[s.address, s.city, s.state].filter(Boolean).join(', ')} />
                <InfoRow icon={MapPin} label="ZIP Code" value={s.zipCode || ''} />
              </div>
            )}

            {activeTab === 'overview' && isEditing && (
              <div className="smod-section">
                <EditRow label="Full Name" field="fullName" />
                <EditRow label="Email" field="email" type="email" />
                <EditRow label="Phone" field="phone" type="tel" />
                <EditRow label="Gender" field="gender" placeholder="Male / Female" />
                <EditRow label="Date of Birth" field="dateOfBirth" type="date" />
                <EditRow label="Address" field="address" />
                <EditRow label="City" field="city" />
                <EditRow label="State" field="state" />
                <EditRow label="ZIP Code" field="zipCode" />
              </div>
            )}

            {activeTab === 'job' && !isEditing && (
              <div className="smod-section">
                <InfoRow icon={Briefcase} label="Job Title" value={s.jobTitle || ''} />
                <InfoRow icon={Shield} label="Role" value={ROLE_LABELS[role] || role} />
                <InfoRow icon={Briefcase} label="Department" value={s.department || ''} />
                <InfoRow icon={Clock} label="Shift Timing" value={s.shiftTiming || ''} />
                <InfoRow icon={DollarSign} label="Salary" value={s.salary ? `₹${Number(s.salary).toLocaleString()}/mo` : ''} />
                <InfoRow icon={Shield} label="Employee ID" value={s.employeeIdCode || ''} />
                <InfoRow icon={Calendar} label="Joined" value={localStaff.createdAt ? new Date(localStaff.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} />
              </div>
            )}

            {activeTab === 'job' && isEditing && (
              <div className="smod-section">
                <EditRow label="Job Title" field="jobTitle" />
                <EditRow label="Department" field="department" />
                <EditRow label="Shift Timing" field="shiftTiming" placeholder="e.g. 6:00 AM - 2:00 PM" />
                <EditRow label="Salary (₹/month)" field="salary" type="number" />
                <EditRow label="Employee ID Code" field="employeeIdCode" />
              </div>
            )}

            {activeTab === 'emergency' && !isEditing && (
              <div className="smod-section">
                <InfoRow icon={User} label="Contact Name" value={s.emergencyContactName || ''} />
                <InfoRow icon={Phone} label="Contact Phone" value={s.emergencyContactPhone || ''} />
                <InfoRow icon={User} label="Relationship" value={s.emergencyContactRelation || ''} />
              </div>
            )}

            {activeTab === 'emergency' && isEditing && (
              <div className="smod-section">
                <EditRow label="Contact Name" field="emergencyContactName" />
                <EditRow label="Contact Phone" field="emergencyContactPhone" type="tel" />
                <EditRow label="Relationship" field="emergencyContactRelation" placeholder="e.g. Spouse, Parent" />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="smod-footer">
            {isEditing ? (
              <>
                <button className="smod-btn smod-btn--ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="smod-btn smod-btn--primary" onClick={handleSave} disabled={saving}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button className="smod-btn smod-btn--ghost" onClick={onClose}>Close</button>
                <button className="smod-btn smod-btn--primary" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} /> Edit
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
