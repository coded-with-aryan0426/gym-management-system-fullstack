import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, GraduationCap, UserCheck, Shield, Clock, Calendar, DollarSign, Award, 
  UserPlus, Fingerprint, BookOpen, Gift, Bell, FileCheck, Briefcase, Target, 
  Medal, Dumbbell, Save, Loader2, X
} from 'lucide-react';
import { showToast } from '../../../utils/showToast';
import api from '../../../services/api';

type UserRole = 'staff' | 'trainer' | 'member';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface ChangeItem {
  field: string;
  oldValue: string;
  newValue: string;
}

const UserRulesSection: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('staff');
  const [activeTab, setActiveTab] = useState<string>('');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<ChangeItem[]>([]);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Staff tabs
  const staffTabs: TabConfig[] = [
    { id: 'access', label: 'Access & Security', icon: Shield },
    { id: 'shifts', label: 'Shifts', icon: Clock },
    { id: 'attendance', label: 'Attendance', icon: Fingerprint },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'compensation', label: 'Pay', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: Award },
  ];

  // Trainer tabs
  const trainerTabs: TabConfig[] = [
    { id: 'scheduling', label: 'Schedule', icon: Clock },
    { id: 'sessions', label: 'Sessions', icon: Dumbbell },
    { id: 'compensation', label: 'Pay', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'certification', label: 'Certs', icon: Medal },
    { id: 'clients', label: 'Clients', icon: Users },
  ];

  // Member tabs
  const memberTabs: TabConfig[] = [
    { id: 'registration', label: 'Registration', icon: UserPlus },
    { id: 'checkin', label: 'Check-in', icon: Fingerprint },
    { id: 'booking', label: 'Booking', icon: BookOpen },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'communication', label: 'Comms', icon: Bell },
    { id: 'compliance', label: 'Compliance', icon: FileCheck },
  ];

  const getTabsForRole = (role: UserRole): TabConfig[] => {
    switch (role) {
      case 'staff': return staffTabs;
      case 'trainer': return trainerTabs;
      case 'member': return memberTabs;
    }
  };

  const currentTabs = getTabsForRole(activeRole);

  // Default settings for each role
  const getDefaultSettings = (role: UserRole): Record<string, any> => {
    if (role === 'staff') {
      return {
        staff_require2FA: false,
        staff_sessionTimeout: 30,
        staff_maxLoginAttempts: 5,
        staff_passwordExpiry: 90,
        staff_ipRestriction: false,
        staff_shiftStartTime: '06:00',
        staff_shiftEndTime: '22:00',
        staff_maxHoursPerWeek: 48,
        staff_breakDuration: 30,
        staff_overtimeAllowed: true,
        staff_clockInGracePeriod: 15,
        staff_geoFencing: false,
        staff_autoClockOut: true,
        staff_annualLeave: 21,
        staff_sickLeave: 10,
        staff_casualLeave: 5,
        staff_carryForward: true,
        staff_maxCarryForward: 5,
        staff_baseHourlyRate: 15,
        staff_overtimeMultiplier: 1.5,
        staff_holidayMultiplier: 2,
        staff_performanceBonus: true,
        staff_reviewFrequency: 'quarterly',
        staff_selfAssessment: true,
        staff_kpiTracking: true,
      };
    } else if (role === 'trainer') {
      return {
        trainer_workingHoursStart: '06:00',
        trainer_workingHoursEnd: '22:00',
        trainer_maxSessionsPerDay: 8,
        trainer_minBreakBetweenSessions: 15,
        trainer_advanceBookingDays: 14,
        trainer_cancellationWindow: 24,
        trainer_sessionDuration: 60,
        trainer_groupClassSize: 15,
        trainer_baseRate: 25,
        trainer_ptSessionRate: 50,
        trainer_groupClassRate: 75,
        trainer_commissionEnabled: true,
        trainer_commissionPercent: 10,
        trainer_performanceBonus: true,
        trainer_minClientsTarget: 20,
        trainer_retentionTarget: 80,
        trainer_sessionNotesRequired: true,
        trainer_minRating: 4.0,
        trainer_certificationRequired: true,
        trainer_certExpiryWarning: 30,
        trainer_continuingEducation: true,
        trainer_maxClients: 30,
        trainer_trialSessionsAllowed: true,
        trainer_trialSessionLimit: 1,
      };
    } else {
      return {
        member_requirePhoneVerification: true,
        member_requireEmailVerification: true,
        member_requireEmergencyContact: true,
        member_requireHealthDeclaration: false,
        member_requirePhotoID: false,
        member_minAge: 16,
        member_trialPeriodDays: 7,
        member_sendWelcomeEmail: true,
        member_checkInMethod: 'qr',
        member_allowMultipleCheckIns: false,
        member_checkInCooldown: 60,
        member_requireCheckOut: false,
        member_allowGuestAccess: true,
        member_guestFee: 10,
        member_maxBookingsPerWeek: 10,
        member_bookingWindowDays: 7,
        member_cancellationWindowHours: 4,
        member_noShowPenalty: true,
        member_noShowSuspensionThreshold: 3,
        member_waitlistEnabled: true,
        member_familyMembershipEnabled: true,
        member_familyDiscount: 15,
        member_referralEnabled: true,
        member_referralReward: 'credit',
        member_referralAmount: 500,
        member_loyaltyPointsEnabled: true,
        member_pointsPerRupee: 1,
        member_smsNotifications: true,
        member_emailNotifications: true,
        member_pushNotifications: true,
        member_marketingOptIn: false,
        member_autoSuspendOnPaymentFailure: true,
        member_paymentGracePeriod: 7,
        member_waiverRequired: true,
        member_waiverExpiryMonths: 12,
      };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const tabs = getTabsForRole(activeRole);
    if (tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [activeRole]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/gym');
      const data = response.data || {};
      
      const allDefaults = {
        ...getDefaultSettings('staff'),
        ...getDefaultSettings('trainer'),
        ...getDefaultSettings('member'),
      };
      
      // Parse booleans from string
      const parseBoolean = (val: any): boolean => val === true || val === 'true';
      const parseNumber = (val: any, defaultVal: number): number => {
        const num = parseFloat(val);
        return isNaN(num) ? defaultVal : num;
      };

      const parsed: Record<string, any> = {};
      Object.keys(allDefaults).forEach(key => {
        const defaultValue = allDefaults[key];
        const dataValue = data[key];
        
        if (dataValue !== undefined) {
          if (typeof defaultValue === 'boolean') {
            parsed[key] = parseBoolean(dataValue);
          } else if (typeof defaultValue === 'number') {
            parsed[key] = parseNumber(dataValue, defaultValue);
          } else {
            parsed[key] = dataValue;
          }
        } else {
          parsed[key] = defaultValue;
        }
      });
      
      setSettings(parsed);
      setOriginalSettings(parsed);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      const allDefaults = {
        ...getDefaultSettings('staff'),
        ...getDefaultSettings('trainer'),
        ...getDefaultSettings('member'),
      };
      setSettings(allDefaults);
      setOriginalSettings(allDefaults);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === activeRole) return;
    
    const roles: UserRole[] = ['staff', 'trainer', 'member'];
    const currentIndex = roles.indexOf(activeRole);
    const newIndex = roles.indexOf(newRole);
    
    setSlideDirection(newIndex > currentIndex ? 'left' : 'right');
    
    setTimeout(() => {
      setActiveRole(newRole);
      setTimeout(() => setSlideDirection(null), 300);
    }, 150);
  };

  const updateSetting = useCallback((key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const formatFieldName = (key: string): string => {
    return key
      .replace(/^(staff_|trainer_|member_)/, '')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const calculateChanges = (): ChangeItem[] => {
    const changes: ChangeItem[] = [];
    Object.keys(settings).forEach(key => {
      if (JSON.stringify(settings[key]) !== JSON.stringify(originalSettings[key])) {
        changes.push({
          field: formatFieldName(key),
          oldValue: formatValue(originalSettings[key]),
          newValue: formatValue(settings[key])
        });
      }
    });
    return changes;
  };

  const hasChanges = calculateChanges().length > 0;

  const handleSaveClick = () => {
    const changes = calculateChanges();
    if (changes.length === 0) {
      showToast("No changes to save", "info");
      return;
    }
    setPendingChanges(changes);
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      setShowConfirmDialog(false);
      
      // Convert to string format for backend
      const settingsToSave: Record<string, string> = {};
      Object.keys(settings).forEach(key => {
        const value = settings[key];
        if (typeof value === 'boolean') {
          settingsToSave[key] = String(value);
        } else if (typeof value === 'number') {
          settingsToSave[key] = String(value);
        } else if (Array.isArray(value)) {
          settingsToSave[key] = value.join(',');
        } else {
          settingsToSave[key] = String(value || '');
        }
      });
      
      await api.put('/settings/gym', settingsToSave);
      setOriginalSettings({ ...settings });
      showToast("User rules saved successfully", "success");
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      showToast(error.response?.data?.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // Render staff content
  const renderStaffContent = () => {
    switch (activeTab) {
      case 'access':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Shield size={16} />
                <h4 className="form-group__title">Security Settings</h4>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Two-Factor Authentication</span>
                    <span className="policy-toggle-row__hint">Require 2FA for all staff logins</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_require2FA ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_require2FA', !settings.staff_require2FA)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">IP Restriction</span>
                    <span className="policy-toggle-row__hint">Restrict access to specific IP addresses</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_ipRestriction ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_ipRestriction', !settings.staff_ipRestriction)}
                />
              </div>
              <div className="form-grid form-grid--3col">
                <div className="field-wrapper">
                  <label className="field-label">Session Timeout (min)</label>
                  <input type="number" className="dense-input" value={settings.staff_sessionTimeout || 30} onChange={e => updateSetting('staff_sessionTimeout', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Max Login Attempts</label>
                  <input type="number" className="dense-input" value={settings.staff_maxLoginAttempts || 5} onChange={e => updateSetting('staff_maxLoginAttempts', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Password Expiry (days)</label>
                  <input type="number" className="dense-input" value={settings.staff_passwordExpiry || 90} onChange={e => updateSetting('staff_passwordExpiry', parseInt(e.target.value))} />
                </div>
              </div>
            </div>
          </>
        );
      case 'shifts':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Clock size={16} />
                <h4 className="form-group__title">Shift Configuration</h4>
              </div>
              <div className="form-grid form-grid--2col">
                <div className="field-wrapper">
                  <label className="field-label">Shift Start Time</label>
                  <input type="time" className="dense-input" value={settings.staff_shiftStartTime || '06:00'} onChange={e => updateSetting('staff_shiftStartTime', e.target.value)} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Shift End Time</label>
                  <input type="time" className="dense-input" value={settings.staff_shiftEndTime || '22:00'} onChange={e => updateSetting('staff_shiftEndTime', e.target.value)} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Max Hours/Week</label>
                  <input type="number" className="dense-input" value={settings.staff_maxHoursPerWeek || 48} onChange={e => updateSetting('staff_maxHoursPerWeek', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Break Duration (min)</label>
                  <input type="number" className="dense-input" value={settings.staff_breakDuration || 30} onChange={e => updateSetting('staff_breakDuration', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Allow Overtime</span>
                    <span className="policy-toggle-row__hint">Staff can work beyond scheduled hours</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_overtimeAllowed ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_overtimeAllowed', !settings.staff_overtimeAllowed)}
                />
              </div>
            </div>
          </>
        );
      case 'attendance':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Fingerprint size={16} />
                <h4 className="form-group__title">Attendance Rules</h4>
              </div>
              <div className="form-grid form-grid--2col">
                <div className="field-wrapper">
                  <label className="field-label">Clock-In Grace Period (min)</label>
                  <input type="number" className="dense-input" value={settings.staff_clockInGracePeriod || 15} onChange={e => updateSetting('staff_clockInGracePeriod', parseInt(e.target.value))} />
                  <span className="field-hint">Minutes after shift start allowed</span>
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Fingerprint size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Geo-Fencing</span>
                    <span className="policy-toggle-row__hint">Require staff to be at gym location to clock in</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_geoFencing ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_geoFencing', !settings.staff_geoFencing)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Auto Clock-Out</span>
                    <span className="policy-toggle-row__hint">Automatically clock out at end of shift</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_autoClockOut ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_autoClockOut', !settings.staff_autoClockOut)}
                />
              </div>
            </div>
          </>
        );
      case 'leave':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Calendar size={16} />
                <h4 className="form-group__title">Leave Allowance</h4>
              </div>
              <div className="form-grid form-grid--3col">
                <div className="field-wrapper">
                  <label className="field-label">Annual Leave (days)</label>
                  <input type="number" className="dense-input" value={settings.staff_annualLeave || 21} onChange={e => updateSetting('staff_annualLeave', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Sick Leave (days)</label>
                  <input type="number" className="dense-input" value={settings.staff_sickLeave || 10} onChange={e => updateSetting('staff_sickLeave', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Casual Leave (days)</label>
                  <input type="number" className="dense-input" value={settings.staff_casualLeave || 5} onChange={e => updateSetting('staff_casualLeave', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Allow Carry Forward</span>
                    <span className="policy-toggle-row__hint">Unused leave can be carried to next year</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_carryForward ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_carryForward', !settings.staff_carryForward)}
                />
              </div>
              {settings.staff_carryForward && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Max Carry Forward (days)</label>
                    <input type="number" className="dense-input" value={settings.staff_maxCarryForward || 5} onChange={e => updateSetting('staff_maxCarryForward', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
          </>
        );
      case 'compensation':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <DollarSign size={16} />
                <h4 className="form-group__title">Compensation Rules</h4>
              </div>
              <div className="form-grid form-grid--3col">
                <div className="field-wrapper">
                  <label className="field-label">Base Hourly Rate (₹)</label>
                  <input type="number" className="dense-input" value={settings.staff_baseHourlyRate || 15} onChange={e => updateSetting('staff_baseHourlyRate', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Overtime Multiplier</label>
                  <input type="number" step="0.1" className="dense-input" value={settings.staff_overtimeMultiplier || 1.5} onChange={e => updateSetting('staff_overtimeMultiplier', parseFloat(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Holiday Multiplier</label>
                  <input type="number" step="0.1" className="dense-input" value={settings.staff_holidayMultiplier || 2} onChange={e => updateSetting('staff_holidayMultiplier', parseFloat(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Award size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Performance Bonus</span>
                    <span className="policy-toggle-row__hint">Enable performance-based bonus system</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_performanceBonus ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_performanceBonus', !settings.staff_performanceBonus)}
                />
              </div>
            </div>
          </>
        );
      case 'performance':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Award size={16} />
                <h4 className="form-group__title">Performance Management</h4>
              </div>
              <div className="form-grid form-grid--2col">
                <div className="field-wrapper">
                  <label className="field-label">Review Frequency</label>
                  <select className="dense-input" value={settings.staff_reviewFrequency || 'quarterly'} onChange={e => updateSetting('staff_reviewFrequency', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannual">Bi-Annual</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Award size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Self Assessment</span>
                    <span className="policy-toggle-row__hint">Allow staff to submit self-assessments</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_selfAssessment ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_selfAssessment', !settings.staff_selfAssessment)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Target size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">KPI Tracking</span>
                    <span className="policy-toggle-row__hint">Track key performance indicators</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.staff_kpiTracking ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('staff_kpiTracking', !settings.staff_kpiTracking)}
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Render trainer content
  const renderTrainerContent = () => {
    switch (activeTab) {
      case 'scheduling':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Clock size={16} />
                <h4 className="form-group__title">Schedule Settings</h4>
              </div>
              <div className="form-grid form-grid--2col">
                <div className="field-wrapper">
                  <label className="field-label">Working Hours Start</label>
                  <input type="time" className="dense-input" value={settings.trainer_workingHoursStart || '06:00'} onChange={e => updateSetting('trainer_workingHoursStart', e.target.value)} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Working Hours End</label>
                  <input type="time" className="dense-input" value={settings.trainer_workingHoursEnd || '22:00'} onChange={e => updateSetting('trainer_workingHoursEnd', e.target.value)} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Max Sessions/Day</label>
                  <input type="number" className="dense-input" value={settings.trainer_maxSessionsPerDay || 8} onChange={e => updateSetting('trainer_maxSessionsPerDay', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Min Break Between (min)</label>
                  <input type="number" className="dense-input" value={settings.trainer_minBreakBetweenSessions || 15} onChange={e => updateSetting('trainer_minBreakBetweenSessions', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Advance Booking (days)</label>
                  <input type="number" className="dense-input" value={settings.trainer_advanceBookingDays || 14} onChange={e => updateSetting('trainer_advanceBookingDays', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Cancellation Window (hrs)</label>
                  <input type="number" className="dense-input" value={settings.trainer_cancellationWindow || 24} onChange={e => updateSetting('trainer_cancellationWindow', parseInt(e.target.value))} />
                </div>
              </div>
            </div>
          </>
        );
      case 'sessions':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Dumbbell size={16} />
                <h4 className="form-group__title">Session Settings</h4>
              </div>
              <div className="form-grid form-grid--2col">
                <div className="field-wrapper">
                  <label className="field-label">Default Duration (min)</label>
                  <input type="number" className="dense-input" value={settings.trainer_sessionDuration || 60} onChange={e => updateSetting('trainer_sessionDuration', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Max Group Class Size</label>
                  <input type="number" className="dense-input" value={settings.trainer_groupClassSize || 15} onChange={e => updateSetting('trainer_groupClassSize', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><FileCheck size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Session Notes Required</span>
                    <span className="policy-toggle-row__hint">Trainers must submit notes after sessions</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.trainer_sessionNotesRequired ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('trainer_sessionNotesRequired', !settings.trainer_sessionNotesRequired)}
                />
              </div>
            </div>
          </>
        );
      case 'compensation':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <DollarSign size={16} />
                <h4 className="form-group__title">Pay Rates</h4>
              </div>
              <div className="form-grid form-grid--3col">
                <div className="field-wrapper">
                  <label className="field-label">Base Hourly Rate (₹)</label>
                  <input type="number" className="dense-input" value={settings.trainer_baseRate || 25} onChange={e => updateSetting('trainer_baseRate', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">PT Session Rate (₹)</label>
                  <input type="number" className="dense-input" value={settings.trainer_ptSessionRate || 50} onChange={e => updateSetting('trainer_ptSessionRate', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Group Class Rate (₹)</label>
                  <input type="number" className="dense-input" value={settings.trainer_groupClassRate || 75} onChange={e => updateSetting('trainer_groupClassRate', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><DollarSign size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Commission Enabled</span>
                    <span className="policy-toggle-row__hint">Trainers earn commission on memberships sold</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.trainer_commissionEnabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('trainer_commissionEnabled', !settings.trainer_commissionEnabled)}
                />
              </div>
              {settings.trainer_commissionEnabled && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Commission (%)</label>
                    <input type="number" className="dense-input" value={settings.trainer_commissionPercent || 10} onChange={e => updateSetting('trainer_commissionPercent', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Award size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Performance Bonus</span>
                    <span className="policy-toggle-row__hint">Enable performance-based bonuses</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.trainer_performanceBonus ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('trainer_performanceBonus', !settings.trainer_performanceBonus)}
                />
              </div>
            </div>
          </>
        );
      case 'performance':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Target size={16} />
                <h4 className="form-group__title">Performance Targets</h4>
              </div>
              <div className="form-grid form-grid--3col">
                <div className="field-wrapper">
                  <label className="field-label">Min Clients Target</label>
                  <input type="number" className="dense-input" value={settings.trainer_minClientsTarget || 20} onChange={e => updateSetting('trainer_minClientsTarget', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Retention Target (%)</label>
                  <input type="number" className="dense-input" value={settings.trainer_retentionTarget || 80} onChange={e => updateSetting('trainer_retentionTarget', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Min Rating Required</label>
                  <input type="number" step="0.1" min="1" max="5" className="dense-input" value={settings.trainer_minRating || 4.0} onChange={e => updateSetting('trainer_minRating', parseFloat(e.target.value))} />
                </div>
              </div>
            </div>
          </>
        );
      case 'certification':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Medal size={16} />
                <h4 className="form-group__title">Certification Requirements</h4>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Medal size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Certification Required</span>
                    <span className="policy-toggle-row__hint">Trainers must have valid certifications</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.trainer_certificationRequired ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('trainer_certificationRequired', !settings.trainer_certificationRequired)}
                />
              </div>
              <div className="form-grid form-grid--2col" style={{ marginTop: '12px' }}>
                <div className="field-wrapper">
                  <label className="field-label">Expiry Warning (days before)</label>
                  <input type="number" className="dense-input" value={settings.trainer_certExpiryWarning || 30} onChange={e => updateSetting('trainer_certExpiryWarning', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><BookOpen size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Continuing Education</span>
                    <span className="policy-toggle-row__hint">Require ongoing education credits</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.trainer_continuingEducation ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('trainer_continuingEducation', !settings.trainer_continuingEducation)}
                />
              </div>
            </div>
          </>
        );
      case 'clients':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Users size={16} />
                <h4 className="form-group__title">Client Management</h4>
              </div>
              <div className="form-grid form-grid--2col">
                <div className="field-wrapper">
                  <label className="field-label">Max Clients Per Trainer</label>
                  <input type="number" className="dense-input" value={settings.trainer_maxClients || 30} onChange={e => updateSetting('trainer_maxClients', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Trial Sessions Allowed</span>
                    <span className="policy-toggle-row__hint">Allow trainers to offer trial sessions</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.trainer_trialSessionsAllowed ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('trainer_trialSessionsAllowed', !settings.trainer_trialSessionsAllowed)}
                />
              </div>
              {settings.trainer_trialSessionsAllowed && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Trial Session Limit</label>
                    <input type="number" className="dense-input" value={settings.trainer_trialSessionLimit || 1} onChange={e => updateSetting('trainer_trialSessionLimit', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Render member content
  const renderMemberContent = () => {
    switch (activeTab) {
      case 'registration':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <UserPlus size={16} />
                <h4 className="form-group__title">Registration Requirements</h4>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Bell size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Phone Verification</span>
                    <span className="policy-toggle-row__hint">Require phone number verification</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_requirePhoneVerification ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_requirePhoneVerification', !settings.member_requirePhoneVerification)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Bell size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Email Verification</span>
                    <span className="policy-toggle-row__hint">Require email address verification</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_requireEmailVerification ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_requireEmailVerification', !settings.member_requireEmailVerification)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Emergency Contact</span>
                    <span className="policy-toggle-row__hint">Require emergency contact details</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_requireEmergencyContact ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_requireEmergencyContact', !settings.member_requireEmergencyContact)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><FileCheck size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Health Declaration</span>
                    <span className="policy-toggle-row__hint">Require health declaration form</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_requireHealthDeclaration ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_requireHealthDeclaration', !settings.member_requireHealthDeclaration)}
                />
              </div>
              <div className="form-grid form-grid--2col" style={{ marginTop: '12px' }}>
                <div className="field-wrapper">
                  <label className="field-label">Minimum Age</label>
                  <input type="number" className="dense-input" value={settings.member_minAge || 16} onChange={e => updateSetting('member_minAge', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Trial Period (days)</label>
                  <input type="number" className="dense-input" value={settings.member_trialPeriodDays || 7} onChange={e => updateSetting('member_trialPeriodDays', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Bell size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Send Welcome Email</span>
                    <span className="policy-toggle-row__hint">Automatically send welcome email</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_sendWelcomeEmail ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_sendWelcomeEmail', !settings.member_sendWelcomeEmail)}
                />
              </div>
            </div>
          </>
        );
      case 'checkin':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Fingerprint size={16} />
                <h4 className="form-group__title">Check-In Settings</h4>
              </div>
              <div className="form-grid form-grid--2col">
                <div className="field-wrapper">
                  <label className="field-label">Check-In Method</label>
                  <select className="dense-input" value={settings.member_checkInMethod || 'qr'} onChange={e => updateSetting('member_checkInMethod', e.target.value)}>
                    <option value="qr">QR Code</option>
                    <option value="fingerprint">Fingerprint</option>
                    <option value="card">Access Card</option>
                    <option value="pin">PIN Code</option>
                    <option value="face">Face Recognition</option>
                  </select>
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Check-In Cooldown (min)</label>
                  <input type="number" className="dense-input" value={settings.member_checkInCooldown || 60} onChange={e => updateSetting('member_checkInCooldown', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Fingerprint size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Multiple Check-Ins/Day</span>
                    <span className="policy-toggle-row__hint">Allow members to check in multiple times</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_allowMultipleCheckIns ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_allowMultipleCheckIns', !settings.member_allowMultipleCheckIns)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Fingerprint size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Require Check-Out</span>
                    <span className="policy-toggle-row__hint">Members must check out when leaving</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_requireCheckOut ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_requireCheckOut', !settings.member_requireCheckOut)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Allow Guest Access</span>
                    <span className="policy-toggle-row__hint">Members can bring guests</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_allowGuestAccess ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_allowGuestAccess', !settings.member_allowGuestAccess)}
                />
              </div>
              {settings.member_allowGuestAccess && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Guest Fee (₹)</label>
                    <input type="number" className="dense-input" value={settings.member_guestFee || 10} onChange={e => updateSetting('member_guestFee', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
          </>
        );
      case 'booking':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <BookOpen size={16} />
                <h4 className="form-group__title">Booking Rules</h4>
              </div>
              <div className="form-grid form-grid--3col">
                <div className="field-wrapper">
                  <label className="field-label">Max Bookings/Week</label>
                  <input type="number" className="dense-input" value={settings.member_maxBookingsPerWeek || 10} onChange={e => updateSetting('member_maxBookingsPerWeek', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Booking Window (days)</label>
                  <input type="number" className="dense-input" value={settings.member_bookingWindowDays || 7} onChange={e => updateSetting('member_bookingWindowDays', parseInt(e.target.value))} />
                </div>
                <div className="field-wrapper">
                  <label className="field-label">Cancel Window (hrs)</label>
                  <input type="number" className="dense-input" value={settings.member_cancellationWindowHours || 4} onChange={e => updateSetting('member_cancellationWindowHours', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><X size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">No-Show Penalty</span>
                    <span className="policy-toggle-row__hint">Penalize members who don't show up</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_noShowPenalty ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_noShowPenalty', !settings.member_noShowPenalty)}
                />
              </div>
              {settings.member_noShowPenalty && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Suspension After (no-shows)</label>
                    <input type="number" className="dense-input" value={settings.member_noShowSuspensionThreshold || 3} onChange={e => updateSetting('member_noShowSuspensionThreshold', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Waitlist Enabled</span>
                    <span className="policy-toggle-row__hint">Allow waitlist for full classes</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_waitlistEnabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_waitlistEnabled', !settings.member_waitlistEnabled)}
                />
              </div>
            </div>
          </>
        );
      case 'rewards':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Gift size={16} />
                <h4 className="form-group__title">Rewards & Referrals</h4>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Family Membership</span>
                    <span className="policy-toggle-row__hint">Enable family membership discounts</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_familyMembershipEnabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_familyMembershipEnabled', !settings.member_familyMembershipEnabled)}
                />
              </div>
              {settings.member_familyMembershipEnabled && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Family Discount (%)</label>
                    <input type="number" className="dense-input" value={settings.member_familyDiscount || 15} onChange={e => updateSetting('member_familyDiscount', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Gift size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Referral Program</span>
                    <span className="policy-toggle-row__hint">Reward members for referrals</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_referralEnabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_referralEnabled', !settings.member_referralEnabled)}
                />
              </div>
              {settings.member_referralEnabled && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Reward Type</label>
                    <select className="dense-input" value={settings.member_referralReward || 'credit'} onChange={e => updateSetting('member_referralReward', e.target.value)}>
                      <option value="credit">Account Credit</option>
                      <option value="discount">Discount</option>
                      <option value="cash">Cash</option>
                      <option value="freeMonth">Free Month</option>
                    </select>
                  </div>
                  <div className="field-wrapper">
                    <label className="field-label">Reward Amount (₹)</label>
                    <input type="number" className="dense-input" value={settings.member_referralAmount || 500} onChange={e => updateSetting('member_referralAmount', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Award size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Loyalty Points</span>
                    <span className="policy-toggle-row__hint">Enable loyalty points system</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_loyaltyPointsEnabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_loyaltyPointsEnabled', !settings.member_loyaltyPointsEnabled)}
                />
              </div>
              {settings.member_loyaltyPointsEnabled && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Points Per ₹ Spent</label>
                    <input type="number" className="dense-input" value={settings.member_pointsPerRupee || 1} onChange={e => updateSetting('member_pointsPerRupee', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
          </>
        );
      case 'communication':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <Bell size={16} />
                <h4 className="form-group__title">Notification Settings</h4>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Bell size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">SMS Notifications</span>
                    <span className="policy-toggle-row__hint">Send SMS notifications by default</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_smsNotifications ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_smsNotifications', !settings.member_smsNotifications)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Bell size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Email Notifications</span>
                    <span className="policy-toggle-row__hint">Send email notifications by default</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_emailNotifications ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_emailNotifications', !settings.member_emailNotifications)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Bell size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Push Notifications</span>
                    <span className="policy-toggle-row__hint">Send push notifications by default</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_pushNotifications ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_pushNotifications', !settings.member_pushNotifications)}
                />
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Bell size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Marketing Opt-In</span>
                    <span className="policy-toggle-row__hint">Opt-in to marketing by default</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_marketingOptIn ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_marketingOptIn', !settings.member_marketingOptIn)}
                />
              </div>
            </div>
          </>
        );
      case 'compliance':
        return (
          <>
            <div className="form-group">
              <div className="form-group__header">
                <FileCheck size={16} />
                <h4 className="form-group__title">Compliance Settings</h4>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><X size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Auto-Suspend on Payment Failure</span>
                    <span className="policy-toggle-row__hint">Automatically suspend account on failed payment</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_autoSuspendOnPaymentFailure ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_autoSuspendOnPaymentFailure', !settings.member_autoSuspendOnPaymentFailure)}
                />
              </div>
              <div className="form-grid form-grid--2col" style={{ marginTop: '12px' }}>
                <div className="field-wrapper">
                  <label className="field-label">Payment Grace Period (days)</label>
                  <input type="number" className="dense-input" value={settings.member_paymentGracePeriod || 7} onChange={e => updateSetting('member_paymentGracePeriod', parseInt(e.target.value))} />
                </div>
              </div>
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><FileCheck size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Waiver Required</span>
                    <span className="policy-toggle-row__hint">Require liability waiver signature</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member_waiverRequired ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSetting('member_waiverRequired', !settings.member_waiverRequired)}
                />
              </div>
              {settings.member_waiverRequired && (
                <div className="form-grid form-grid--2col" style={{ marginLeft: '40px', marginTop: '12px' }}>
                  <div className="field-wrapper">
                    <label className="field-label">Waiver Expiry (months)</label>
                    <input type="number" className="dense-input" value={settings.member_waiverExpiryMonths || 12} onChange={e => updateSetting('member_waiverExpiryMonths', parseInt(e.target.value))} />
                  </div>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeRole) {
      case 'staff': return renderStaffContent();
      case 'trainer': return renderTrainerContent();
      case 'member': return renderMemberContent();
    }
  };

  if (loading) {
    return (
      <div className="settings-section">
        <div className="settings-loading">
          <Loader2 className="settings-loading__spinner" />
          <span>Loading user rules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section" style={{ "--section-accent": "#8b5cf6" } as React.CSSProperties}>
      <div className="settings-section__header">
        <div className="settings-section__title-group">
            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Users size={20} /></div>
          <div>
            <h2 className="settings-section__title">User Rules</h2>
            <p className="settings-section__description">Configure rules for staff, trainers, and members</p>
          </div>
        </div>
        
        <div className="settings-section__header-actions">
          {/* Role Switcher */}
          <div className="role-switcher role-switcher--inline">
            <div className="role-switcher__track">
              <div 
                className="role-switcher__indicator" 
                style={{ transform: `translateX(${activeRole === 'staff' ? 0 : activeRole === 'trainer' ? 100 : 200}%)` }}
              />
              <button 
                className={`role-switcher__btn ${activeRole === 'staff' ? 'active' : ''}`}
                onClick={() => handleRoleChange('staff')}
              >
                <Briefcase size={14} />
                <span>Staff</span>
              </button>
              <button 
                className={`role-switcher__btn ${activeRole === 'trainer' ? 'active' : ''}`}
                onClick={() => handleRoleChange('trainer')}
              >
                <GraduationCap size={14} />
                <span>Trainer</span>
              </button>
              <button 
                className={`role-switcher__btn ${activeRole === 'member' ? 'active' : ''}`}
                onClick={() => handleRoleChange('member')}
              >
                <UserCheck size={14} />
                <span>Member</span>
              </button>
            </div>
          </div>

          {hasChanges && (
            <button className="settings-save-btn" onClick={handleSaveClick} disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {currentTabs.map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'settings-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="settings-section__content">
        <div className={`settings-tab-content ${slideDirection ? `slide-${slideDirection}` : ''}`}>
          {renderContent()}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay" onClick={() => setShowConfirmDialog(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-dialog__header">
              <h3>Confirm Changes</h3>
              <button className="confirm-dialog__close" onClick={() => setShowConfirmDialog(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="confirm-dialog__body">
              <div className="changes-summary">
                <span className="changes-count">{pendingChanges.length} change{pendingChanges.length !== 1 ? 's' : ''} to save</span>
              </div>
              <div className="changes-list">
                {pendingChanges.map((change, index) => (
                  <div key={index} className="change-item">
                    <span className="change-label">{change.field}</span>
                    <div className="change-values">
                      <span className="change-old">{change.oldValue}</span>
                      <span className="change-arrow">→</span>
                      <span className="change-new">{change.newValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="confirm-dialog__footer">
              <button className="btn-cancel" onClick={() => setShowConfirmDialog(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleConfirmSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRulesSection;
