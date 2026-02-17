import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

const DEPT_ICONS: Record<string, string> = {
  'Front Desk': '🏢', 'Gym Floor': '🏋️', 'Maintenance': '🔧',
  'Housekeeping': '🧹', 'Operations': '⚙️', 'Sales': '📈',
  'Administration': '📋', 'Management': '👔',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onEditProfile?: (staff: Staff) => void;
  onUpdate?: () => void;
}

type NavTab = 'overview' | 'job' | 'schedule' | 'edit' | 'delete';

const NAV_ITEMS: { id: NavTab; label: string; icon: string; section?: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'user', section: 'OVERVIEW' },
  { id: 'job', label: 'Job Details', icon: 'briefcase' },
  { id: 'schedule', label: 'Schedule & Pay', icon: 'clock' },
  { id: 'edit', label: 'Edit Profile', icon: 'edit', section: 'ACTIONS' },
  { id: 'delete', label: 'Deactivate', icon: 'trash', section: 'DANGER' },
];

const EnhancedStaffActionModal: React.FC<Props> = ({ isOpen, onClose, staff, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [localStaff, setLocalStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setLocalStaff({ ...staff });
      setFormData({
        fullName: staff.fullName || '',
        email: staff.email || '',
        phone: staff.phone || staff.phoneNumber || '',
        gender: staff.gender || '',
        dateOfBirth: staff.dateOfBirth || '',
        address: staff.address || '',
        city: staff.city || '',
        state: staff.state || '',
        zipCode: staff.zipCode || '',
        jobTitle: staff.jobTitle || '',
        department: staff.department || '',
        shiftTiming: staff.shiftTiming || '',
        salary: staff.salary || '',
        employeeIdCode: staff.employeeIdCode || '',
        emergencyContactName: staff.emergencyContactName || '',
        emergencyContactPhone: staff.emergencyContactPhone || '',
        emergencyContactRelation: staff.emergencyContactRelation || '',
      });
      setActiveTab('overview');
    }
  }, [staff]);

  if (!isOpen || !localStaff) return null;

  const role = localStaff.staffRole || 'STAFF';
  const statusRaw = localStaff.status || 'Active';
  const statusLower = statusRaw.toLowerCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await api.updateStaffDetails(localStaff.userId, formData);
      setLocalStaff({ ...localStaff, ...result });
      setActiveTab('overview');
      showToast('Staff details updated', 'success');
      onUpdate?.();
    } catch {
      showToast('Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const joinDate = localStaff.createdAt
    ? new Date(localStaff.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const tenure = localStaff.createdAt
    ? (() => {
        const months = Math.floor((Date.now() - new Date(localStaff.createdAt).getTime()) / (30.44 * 24 * 60 * 60 * 1000));
        return months < 12 ? `${months}mo` : `${Math.floor(months / 12)}y ${months % 12}mo`;
      })()
    : '—';

  const salaryFormatted = localStaff.salary ? `₹${Number(localStaff.salary).toLocaleString('en-IN')}` : '—';
  const annualCTC = localStaff.salary ? `₹${(Number(localStaff.salary) * 12).toLocaleString('en-IN')}` : '—';
  const deptIcon = DEPT_ICONS[localStaff.department || ''] || '🏢';

  // SVG Icons
  const Icon = ({ type, size = 16 }: { type: string; size?: number }) => {
    const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    switch (type) {
      case 'user': return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
      case 'briefcase': return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
      case 'clock': return <svg {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
      case 'alert': return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
      case 'edit': return <svg {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
      case 'trash': return <svg {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
      case 'mail': return <svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
      case 'phone': return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
      case 'map': return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
      case 'calendar': return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
      case 'dollar': return <svg {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
      case 'shield': return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
      case 'hash': return <svg {...p}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>;
      case 'save': return <svg {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
      case 'x': return <svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
      default: return null;
    }
  };

  const EditField = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        className="form-input"
        value={formData[field] || ''}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="smod-content-scroll">
            {/* Quick Stats Row */}
            <div className="smod-quick-stats">
              <div className="smod-qstat">
                <div className="smod-qstat__icon smod-qstat__icon--purple"><Icon type="briefcase" size={18} /></div>
                <div className="smod-qstat__info">
                  <span className="smod-qstat__value">{localStaff.jobTitle || '—'}</span>
                  <span className="smod-qstat__label">Job Title</span>
                </div>
              </div>
              <div className="smod-qstat">
                <div className="smod-qstat__icon smod-qstat__icon--blue"><Icon type="hash" size={18} /></div>
                <div className="smod-qstat__info">
                  <span className="smod-qstat__value">{localStaff.employeeIdCode || `EMP-${localStaff.userId}`}</span>
                  <span className="smod-qstat__label">Employee ID</span>
                </div>
              </div>
              <div className="smod-qstat">
                <div className="smod-qstat__icon smod-qstat__icon--green"><Icon type="calendar" size={18} /></div>
                <div className="smod-qstat__info">
                  <span className="smod-qstat__value">{tenure}</span>
                  <span className="smod-qstat__label">Tenure</span>
                </div>
              </div>
              <div className="smod-qstat">
                <div className="smod-qstat__icon smod-qstat__icon--amber"><Icon type="dollar" size={18} /></div>
                <div className="smod-qstat__info">
                  <span className="smod-qstat__value">{salaryFormatted}</span>
                  <span className="smod-qstat__label">Monthly Salary</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="smod-two-col">
              {/* Left: Contact Info */}
              <div className="smod-card">
                <div className="smod-card__header">
                  <Icon type="user" size={16} />
                  <span>Contact Information</span>
                </div>
                <div className="smod-card__body">
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="mail" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Email</span>
                      <span className="smod-detail-row__value">{localStaff.email || '—'}</span>
                    </div>
                  </div>
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="phone" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Phone</span>
                      <span className="smod-detail-row__value">{localStaff.phone || localStaff.phoneNumber || '—'}</span>
                    </div>
                  </div>
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="user" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Gender</span>
                      <span className="smod-detail-row__value">{localStaff.gender || '—'}</span>
                    </div>
                  </div>
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="calendar" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Date of Birth</span>
                      <span className="smod-detail-row__value">{localStaff.dateOfBirth || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Address */}
              <div className="smod-card">
                <div className="smod-card__header">
                  <Icon type="map" size={16} />
                  <span>Address</span>
                </div>
                <div className="smod-card__body">
                  <div className="smod-address-block">
                    {localStaff.address ? (
                      <>
                        <p className="smod-address-block__line">{localStaff.address}</p>
                        <p className="smod-address-block__line">
                          {[localStaff.city, localStaff.state].filter(Boolean).join(', ')}
                          {localStaff.zipCode ? ` - ${localStaff.zipCode}` : ''}
                        </p>
                      </>
                    ) : (
                      <p className="smod-address-block__empty">No address on file</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="smod-card smod-card--emergency">
              <div className="smod-card__header smod-card__header--emergency">
                <Icon type="shield" size={16} />
                <span>Emergency Contact</span>
              </div>
              <div className="smod-card__body">
                {localStaff.emergencyContactName ? (
                  <div className="smod-emergency-grid">
                    <div className="smod-detail-row">
                      <div className="smod-detail-row__icon"><Icon type="user" size={14} /></div>
                      <div className="smod-detail-row__content">
                        <span className="smod-detail-row__label">Name</span>
                        <span className="smod-detail-row__value">{localStaff.emergencyContactName}</span>
                      </div>
                    </div>
                    <div className="smod-detail-row">
                      <div className="smod-detail-row__icon"><Icon type="phone" size={14} /></div>
                      <div className="smod-detail-row__content">
                        <span className="smod-detail-row__label">Phone</span>
                        <span className="smod-detail-row__value">{localStaff.emergencyContactPhone || '—'}</span>
                      </div>
                    </div>
                    <div className="smod-detail-row">
                      <div className="smod-detail-row__icon"><Icon type="user" size={14} /></div>
                      <div className="smod-detail-row__content">
                        <span className="smod-detail-row__label">Relationship</span>
                        <span className="smod-detail-row__value">{localStaff.emergencyContactRelation || '—'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="smod-empty-inline">
                    <Icon type="alert" size={16} />
                    <span>No emergency contact added. Use Edit Profile to add one.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'job':
        return (
          <div className="smod-content-scroll">
            {/* Department Banner */}
            <div className="smod-dept-banner">
              <span className="smod-dept-banner__icon">{deptIcon}</span>
              <div className="smod-dept-banner__info">
                <span className="smod-dept-banner__dept">{localStaff.department || 'Unassigned'}</span>
                <span className="smod-dept-banner__title">{localStaff.jobTitle || 'No title'}</span>
              </div>
              <div className="smod-dept-banner__badge">
                <span className={`smod-role-pill smod-role-pill--${role.toLowerCase()}`}>
                  {ROLE_LABELS[role] || role}
                </span>
              </div>
            </div>

            {/* Job Info Grid */}
            <div className="smod-two-col">
              <div className="smod-card">
                <div className="smod-card__header">
                  <Icon type="briefcase" size={16} />
                  <span>Position Details</span>
                </div>
                <div className="smod-card__body">
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="briefcase" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Job Title</span>
                      <span className="smod-detail-row__value">{localStaff.jobTitle || '—'}</span>
                    </div>
                  </div>
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="user" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Staff Role</span>
                      <span className="smod-detail-row__value">{ROLE_LABELS[role] || role}</span>
                    </div>
                  </div>
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="hash" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Employee ID</span>
                      <span className="smod-detail-row__value smod-detail-row__value--mono">{localStaff.employeeIdCode || `EMP-${localStaff.userId}`}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="smod-card">
                <div className="smod-card__header">
                  <Icon type="calendar" size={16} />
                  <span>Employment Timeline</span>
                </div>
                <div className="smod-card__body">
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="calendar" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Joined On</span>
                      <span className="smod-detail-row__value">{joinDate}</span>
                    </div>
                  </div>
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="clock" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Total Tenure</span>
                      <span className="smod-detail-row__value">{tenure}</span>
                    </div>
                  </div>
                  <div className="smod-detail-row">
                    <div className="smod-detail-row__icon"><Icon type="shield" size={14} /></div>
                    <div className="smod-detail-row__content">
                      <span className="smod-detail-row__label">Current Status</span>
                      <span className={`modal-status-badge modal-status-badge--${statusLower}`}>
                        <span className="modal-status-badge__dot"></span> {statusRaw}
                      </span>
                    </div>
                  </div>
                  {localStaff.leavingDate && (
                    <div className="smod-detail-row">
                      <div className="smod-detail-row__icon" style={{ color: '#ef4444' }}><Icon type="alert" size={14} /></div>
                      <div className="smod-detail-row__content">
                        <span className="smod-detail-row__label">Leaving Date</span>
                        <span className="smod-detail-row__value" style={{ color: '#ef4444' }}>{localStaff.leavingDate}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="smod-content-scroll">
            {/* Compensation Summary Cards */}
            <div className="smod-pay-cards">
              <div className="smod-pay-card smod-pay-card--monthly">
                <div className="smod-pay-card__header">Monthly Salary</div>
                <div className="smod-pay-card__amount">{salaryFormatted}</div>
                <div className="smod-pay-card__sub">Per month, before deductions</div>
              </div>
              <div className="smod-pay-card smod-pay-card--annual">
                <div className="smod-pay-card__header">Annual CTC</div>
                <div className="smod-pay-card__amount">{annualCTC}</div>
                <div className="smod-pay-card__sub">Gross annual compensation</div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="smod-card">
              <div className="smod-card__header">
                <Icon type="clock" size={16} />
                <span>Work Schedule</span>
              </div>
              <div className="smod-card__body">
                <div className="smod-schedule-display">
                  <div className="smod-schedule-display__current">
                    <div className="smod-schedule-display__label">Current Shift</div>
                    <div className="smod-schedule-display__value">{localStaff.shiftTiming || 'Not assigned'}</div>
                  </div>
                  <div className="smod-schedule-display__meta">
                    <div className="smod-schedule-display__item">
                      <span className="smod-schedule-display__item-label">Department</span>
                      <span className="smod-schedule-display__item-value">{deptIcon} {localStaff.department || '—'}</span>
                    </div>
                    <div className="smod-schedule-display__item">
                      <span className="smod-schedule-display__item-label">Status</span>
                      <span className={`modal-status-badge modal-status-badge--${statusLower}`}>
                        <span className="modal-status-badge__dot"></span> {statusRaw}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'edit':
        return (
          <div className="smod-content-scroll">
            <div className="content-panel content-panel--constrained">
              <h3 className="content-panel__title">
                <Icon type="edit" size={18} />
                Edit Staff Profile
              </h3>
              <div className="content-panel__body">
                <div className="smod-form-section-label">Personal Information</div>
                <div className="form-row-2-col">
                  <EditField label="Full Name" field="fullName" />
                  <EditField label="Email" field="email" type="email" />
                </div>
                <div className="form-row-2-col">
                  <EditField label="Phone" field="phone" type="tel" />
                  <EditField label="Gender" field="gender" placeholder="Male / Female" />
                </div>
                <EditField label="Date of Birth" field="dateOfBirth" type="date" />

                <div className="smod-form-section-label">Job Details</div>
                <div className="form-row-2-col">
                  <EditField label="Job Title" field="jobTitle" />
                  <EditField label="Department" field="department" />
                </div>
                <div className="form-row-2-col">
                  <EditField label="Shift Timing" field="shiftTiming" placeholder="e.g. 6:00 AM - 2:00 PM" />
                  <EditField label="Salary (per month)" field="salary" type="number" />
                </div>
                <EditField label="Employee ID Code" field="employeeIdCode" />

                <div className="smod-form-section-label">Address</div>
                <div className="form-row-2-col">
                  <EditField label="Street Address" field="address" />
                  <EditField label="City" field="city" />
                </div>
                <div className="form-row-2-col">
                  <EditField label="State" field="state" />
                  <EditField label="ZIP Code" field="zipCode" />
                </div>

                <div className="smod-form-section-label">Emergency Contact</div>
                <div className="form-row-2-col">
                  <EditField label="Contact Name" field="emergencyContactName" />
                  <EditField label="Contact Phone" field="emergencyContactPhone" type="tel" />
                </div>
                <EditField label="Relationship" field="emergencyContactRelation" placeholder="e.g. Spouse, Parent" />

                <div className="form-actions">
                  <button className="btn btn--secondary" onClick={() => setActiveTab('overview')}>Cancel</button>
                  <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
                    <Icon type="save" size={14} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className="smod-content-scroll">
            <div className="content-panel">
              <h3 className="content-panel__title content-panel__title--danger">
                <Icon type="alert" size={18} />
                Danger Zone
              </h3>
              <div className="delete-warning">
                <div className="delete-warning__icon">
                  <Icon type="alert" size={32} />
                </div>
                <h5>Deactivate {localStaff.fullName}?</h5>
                <p>This will mark the staff member as inactive. They will no longer be able to access the system.</p>
                <p className="delete-warning__note">This action can be reversed by reactivating the account.</p>
                <div className="delete-actions">
                  <button className="btn btn--secondary" onClick={() => setActiveTab('overview')}>Cancel</button>
                  <button className="btn btn--danger">Deactivate Staff</button>
                </div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  let currentSection = '';

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="staff-action-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="staff-action-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Profile Header */}
            <div className="staff-action-modal__profile-header">
              <div className="profile-header__avatar">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStaff.fullName}`} alt={localStaff.fullName} />
              </div>
              <div className="profile-header__info">
                <h2 className="profile-header__name">{localStaff.fullName}</h2>
                <div className="profile-header__meta">
                  <span className={`smod-role-pill smod-role-pill--${role.toLowerCase()}`}>{ROLE_LABELS[role] || role}</span>
                  <span className={`modal-status-badge modal-status-badge--${statusLower}`}>
                    <span className="modal-status-badge__dot"></span> {statusRaw}
                  </span>
                </div>
              </div>
              <div className="profile-header__stats">
                <div className="stat-item">
                  <span className="stat-value">{localStaff.employeeIdCode || `#${localStaff.userId}`}</span>
                  <span className="stat-label">EMP ID</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{tenure}</span>
                  <span className="stat-label">Tenure</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{localStaff.salary ? `₹${(Number(localStaff.salary) / 1000).toFixed(0)}k` : '—'}</span>
                  <span className="stat-label">Salary</span>
                </div>
              </div>
              <button className="member-action-modal__close-inline" onClick={onClose}>
                <Icon type="x" size={16} />
              </button>
            </div>

            {/* Main Content Grid */}
            <div className="staff-action-modal__content-grid">
              {/* Left Sidebar Navigation */}
              <div className="staff-action-modal__nav-column">
                <nav className="side-panel-nav">
                  {NAV_ITEMS.map((item) => {
                    let sectionLabel = null;
                    if (item.section && item.section !== currentSection) {
                      currentSection = item.section;
                      if (item.section !== 'OVERVIEW') {
                        sectionLabel = <div key={`div-${item.section}`} className="side-panel-nav__divider" />;
                      }
                    }
                    return (
                      <React.Fragment key={item.id}>
                        {sectionLabel}
                        <button
                          className={`side-panel-nav__item ${activeTab === item.id ? 'side-panel-nav__item--active' : ''} ${item.id === 'delete' ? 'side-panel-nav__item--danger' : ''}`}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <div className="nav-icon-wrap"><Icon type={item.icon} /></div>
                          <span>{item.label}</span>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </nav>
              </div>

              {/* Right Content Panel */}
              <div className="staff-action-modal__content-panel">
                {renderContent()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default EnhancedStaffActionModal;
