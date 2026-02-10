import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, UserCheck, Shield, Clock, Calendar, DollarSign, Award, UserPlus, Fingerprint, BookOpen, Gift, Bell, FileCheck, Briefcase, Target, Medal, ClipboardCheck, Heart, CreditCard, MapPin, Dumbbell } from 'lucide-react';
import api from '../../../services/api';

type UserRole = 'staff' | 'trainer' | 'member';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const UserRulesSection: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('staff');
  const [activeTab, setActiveTab] = useState<string>('');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Staff tabs
  const staffTabs: TabConfig[] = [
    { id: 'access', label: 'Access & Security', icon: <Shield size={14} /> },
    { id: 'shifts', label: 'Shifts & Scheduling', icon: <Clock size={14} /> },
    { id: 'attendance', label: 'Attendance', icon: <Fingerprint size={14} /> },
    { id: 'leave', label: 'Leave Policy', icon: <Calendar size={14} /> },
    { id: 'compensation', label: 'Compensation', icon: <DollarSign size={14} /> },
    { id: 'performance', label: 'Performance', icon: <Award size={14} /> },
  ];

  // Trainer tabs
  const trainerTabs: TabConfig[] = [
    { id: 'scheduling', label: 'Scheduling', icon: <Clock size={14} /> },
    { id: 'sessions', label: 'Sessions', icon: <Dumbbell size={14} /> },
    { id: 'compensation', label: 'Compensation', icon: <DollarSign size={14} /> },
    { id: 'performance', label: 'Performance', icon: <Target size={14} /> },
    { id: 'certification', label: 'Certification', icon: <Medal size={14} /> },
    { id: 'clients', label: 'Clients', icon: <Users size={14} /> },
  ];

  // Member tabs
  const memberTabs: TabConfig[] = [
    { id: 'registration', label: 'Registration', icon: <UserPlus size={14} /> },
    { id: 'checkin', label: 'Check-in & Access', icon: <Fingerprint size={14} /> },
    { id: 'booking', label: 'Booking & Classes', icon: <BookOpen size={14} /> },
    { id: 'rewards', label: 'Rewards & Referrals', icon: <Gift size={14} /> },
    { id: 'communication', label: 'Communication', icon: <Bell size={14} /> },
    { id: 'compliance', label: 'Compliance', icon: <FileCheck size={14} /> },
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
    // Set first tab when role changes
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
      
      // Merge with defaults for all roles
      const allDefaults = {
        ...getDefaultSettings('staff'),
        ...getDefaultSettings('trainer'),
        ...getDefaultSettings('member'),
      };
      
      const merged = { ...allDefaults, ...data };
      setSettings(merged);
      setOriginalSettings(merged);
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

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getChanges = () => {
    const changes: { key: string; label: string; oldValue: any; newValue: any }[] = [];
    Object.keys(settings).forEach(key => {
      if (JSON.stringify(settings[key]) !== JSON.stringify(originalSettings[key])) {
        changes.push({
          key,
          label: key.replace(/^(staff_|trainer_|member_)/, '').replace(/([A-Z])/g, ' $1').trim(),
          oldValue: originalSettings[key],
          newValue: settings[key]
        });
      }
    });
    return changes;
  };

  const hasChanges = getChanges().length > 0;

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings/gym', settings);
      setOriginalSettings({ ...settings });
      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  // Render staff content
  const renderStaffContent = () => {
    switch (activeTab) {
      case 'access':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Two-Factor Authentication</label>
              <p className="input-hint">Require 2FA for all staff logins</p>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_require2FA || false} onChange={e => handleChange('staff_require2FA', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Session Timeout (minutes)</label>
              <input type="number" value={settings.staff_sessionTimeout || 30} onChange={e => handleChange('staff_sessionTimeout', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Max Login Attempts</label>
              <input type="number" value={settings.staff_maxLoginAttempts || 5} onChange={e => handleChange('staff_maxLoginAttempts', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Password Expiry (days)</label>
              <input type="number" value={settings.staff_passwordExpiry || 90} onChange={e => handleChange('staff_passwordExpiry', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>IP Restriction</label>
              <p className="input-hint">Restrict access to specific IP addresses</p>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_ipRestriction || false} onChange={e => handleChange('staff_ipRestriction', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'shifts':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Shift Start Time</label>
              <input type="time" value={settings.staff_shiftStartTime || '06:00'} onChange={e => handleChange('staff_shiftStartTime', e.target.value)} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Shift End Time</label>
              <input type="time" value={settings.staff_shiftEndTime || '22:00'} onChange={e => handleChange('staff_shiftEndTime', e.target.value)} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Max Hours Per Week</label>
              <input type="number" value={settings.staff_maxHoursPerWeek || 48} onChange={e => handleChange('staff_maxHoursPerWeek', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Break Duration (minutes)</label>
              <input type="number" value={settings.staff_breakDuration || 30} onChange={e => handleChange('staff_breakDuration', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Allow Overtime</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_overtimeAllowed || false} onChange={e => handleChange('staff_overtimeAllowed', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Clock-In Grace Period (minutes)</label>
              <input type="number" value={settings.staff_clockInGracePeriod || 15} onChange={e => handleChange('staff_clockInGracePeriod', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Geo-Fencing</label>
              <p className="input-hint">Require staff to be at gym location to clock in</p>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_geoFencing || false} onChange={e => handleChange('staff_geoFencing', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Auto Clock-Out</label>
              <p className="input-hint">Automatically clock out at end of shift</p>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_autoClockOut || false} onChange={e => handleChange('staff_autoClockOut', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'leave':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Annual Leave (days)</label>
              <input type="number" value={settings.staff_annualLeave || 21} onChange={e => handleChange('staff_annualLeave', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Sick Leave (days)</label>
              <input type="number" value={settings.staff_sickLeave || 10} onChange={e => handleChange('staff_sickLeave', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Casual Leave (days)</label>
              <input type="number" value={settings.staff_casualLeave || 5} onChange={e => handleChange('staff_casualLeave', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Allow Carry Forward</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_carryForward || false} onChange={e => handleChange('staff_carryForward', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.staff_carryForward && (
              <div className="settings-form-group">
                <label>Max Carry Forward (days)</label>
                <input type="number" value={settings.staff_maxCarryForward || 5} onChange={e => handleChange('staff_maxCarryForward', parseInt(e.target.value))} className="settings-input" />
              </div>
            )}
          </div>
        );
      case 'compensation':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Base Hourly Rate (₹)</label>
              <input type="number" value={settings.staff_baseHourlyRate || 15} onChange={e => handleChange('staff_baseHourlyRate', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Overtime Multiplier</label>
              <input type="number" step="0.1" value={settings.staff_overtimeMultiplier || 1.5} onChange={e => handleChange('staff_overtimeMultiplier', parseFloat(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Holiday Multiplier</label>
              <input type="number" step="0.1" value={settings.staff_holidayMultiplier || 2} onChange={e => handleChange('staff_holidayMultiplier', parseFloat(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Performance Bonus</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_performanceBonus || false} onChange={e => handleChange('staff_performanceBonus', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Review Frequency</label>
              <select value={settings.staff_reviewFrequency || 'quarterly'} onChange={e => handleChange('staff_reviewFrequency', e.target.value)} className="settings-select">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannual">Bi-Annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div className="settings-form-group">
              <label>Self Assessment</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_selfAssessment || false} onChange={e => handleChange('staff_selfAssessment', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>KPI Tracking</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.staff_kpiTracking || false} onChange={e => handleChange('staff_kpiTracking', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
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
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Working Hours Start</label>
              <input type="time" value={settings.trainer_workingHoursStart || '06:00'} onChange={e => handleChange('trainer_workingHoursStart', e.target.value)} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Working Hours End</label>
              <input type="time" value={settings.trainer_workingHoursEnd || '22:00'} onChange={e => handleChange('trainer_workingHoursEnd', e.target.value)} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Max Sessions Per Day</label>
              <input type="number" value={settings.trainer_maxSessionsPerDay || 8} onChange={e => handleChange('trainer_maxSessionsPerDay', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Min Break Between Sessions (min)</label>
              <input type="number" value={settings.trainer_minBreakBetweenSessions || 15} onChange={e => handleChange('trainer_minBreakBetweenSessions', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Advance Booking (days)</label>
              <input type="number" value={settings.trainer_advanceBookingDays || 14} onChange={e => handleChange('trainer_advanceBookingDays', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Cancellation Window (hours)</label>
              <input type="number" value={settings.trainer_cancellationWindow || 24} onChange={e => handleChange('trainer_cancellationWindow', parseInt(e.target.value))} className="settings-input" />
            </div>
          </div>
        );
      case 'sessions':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Default Session Duration (min)</label>
              <input type="number" value={settings.trainer_sessionDuration || 60} onChange={e => handleChange('trainer_sessionDuration', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Max Group Class Size</label>
              <input type="number" value={settings.trainer_groupClassSize || 15} onChange={e => handleChange('trainer_groupClassSize', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Session Notes Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.trainer_sessionNotesRequired || false} onChange={e => handleChange('trainer_sessionNotesRequired', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'compensation':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Base Hourly Rate (₹)</label>
              <input type="number" value={settings.trainer_baseRate || 25} onChange={e => handleChange('trainer_baseRate', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>PT Session Rate (₹)</label>
              <input type="number" value={settings.trainer_ptSessionRate || 50} onChange={e => handleChange('trainer_ptSessionRate', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Group Class Rate (₹)</label>
              <input type="number" value={settings.trainer_groupClassRate || 75} onChange={e => handleChange('trainer_groupClassRate', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Commission Enabled</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.trainer_commissionEnabled || false} onChange={e => handleChange('trainer_commissionEnabled', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.trainer_commissionEnabled && (
              <div className="settings-form-group">
                <label>Commission Percentage (%)</label>
                <input type="number" value={settings.trainer_commissionPercent || 10} onChange={e => handleChange('trainer_commissionPercent', parseInt(e.target.value))} className="settings-input" />
              </div>
            )}
            <div className="settings-form-group">
              <label>Performance Bonus</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.trainer_performanceBonus || false} onChange={e => handleChange('trainer_performanceBonus', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Min Clients Target</label>
              <input type="number" value={settings.trainer_minClientsTarget || 20} onChange={e => handleChange('trainer_minClientsTarget', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Retention Target (%)</label>
              <input type="number" value={settings.trainer_retentionTarget || 80} onChange={e => handleChange('trainer_retentionTarget', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Minimum Rating Required</label>
              <input type="number" step="0.1" min="1" max="5" value={settings.trainer_minRating || 4.0} onChange={e => handleChange('trainer_minRating', parseFloat(e.target.value))} className="settings-input" />
            </div>
          </div>
        );
      case 'certification':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Certification Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.trainer_certificationRequired || false} onChange={e => handleChange('trainer_certificationRequired', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Expiry Warning (days before)</label>
              <input type="number" value={settings.trainer_certExpiryWarning || 30} onChange={e => handleChange('trainer_certExpiryWarning', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Continuing Education Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.trainer_continuingEducation || false} onChange={e => handleChange('trainer_continuingEducation', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'clients':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Max Clients Per Trainer</label>
              <input type="number" value={settings.trainer_maxClients || 30} onChange={e => handleChange('trainer_maxClients', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Trial Sessions Allowed</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.trainer_trialSessionsAllowed || false} onChange={e => handleChange('trainer_trialSessionsAllowed', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.trainer_trialSessionsAllowed && (
              <div className="settings-form-group">
                <label>Trial Session Limit</label>
                <input type="number" value={settings.trainer_trialSessionLimit || 1} onChange={e => handleChange('trainer_trialSessionLimit', parseInt(e.target.value))} className="settings-input" />
              </div>
            )}
          </div>
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
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Phone Verification Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_requirePhoneVerification || false} onChange={e => handleChange('member_requirePhoneVerification', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Email Verification Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_requireEmailVerification || false} onChange={e => handleChange('member_requireEmailVerification', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Emergency Contact Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_requireEmergencyContact || false} onChange={e => handleChange('member_requireEmergencyContact', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Health Declaration Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_requireHealthDeclaration || false} onChange={e => handleChange('member_requireHealthDeclaration', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Photo ID Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_requirePhotoID || false} onChange={e => handleChange('member_requirePhotoID', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Minimum Age</label>
              <input type="number" value={settings.member_minAge || 16} onChange={e => handleChange('member_minAge', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Trial Period (days)</label>
              <input type="number" value={settings.member_trialPeriodDays || 7} onChange={e => handleChange('member_trialPeriodDays', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Send Welcome Email</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_sendWelcomeEmail || false} onChange={e => handleChange('member_sendWelcomeEmail', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'checkin':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Check-In Method</label>
              <select value={settings.member_checkInMethod || 'qr'} onChange={e => handleChange('member_checkInMethod', e.target.value)} className="settings-select">
                <option value="qr">QR Code</option>
                <option value="fingerprint">Fingerprint</option>
                <option value="card">Access Card</option>
                <option value="pin">PIN Code</option>
                <option value="face">Face Recognition</option>
              </select>
            </div>
            <div className="settings-form-group">
              <label>Allow Multiple Check-Ins/Day</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_allowMultipleCheckIns || false} onChange={e => handleChange('member_allowMultipleCheckIns', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Check-In Cooldown (minutes)</label>
              <input type="number" value={settings.member_checkInCooldown || 60} onChange={e => handleChange('member_checkInCooldown', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Require Check-Out</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_requireCheckOut || false} onChange={e => handleChange('member_requireCheckOut', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Allow Guest Access</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_allowGuestAccess || false} onChange={e => handleChange('member_allowGuestAccess', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.member_allowGuestAccess && (
              <div className="settings-form-group">
                <label>Guest Fee (₹)</label>
                <input type="number" value={settings.member_guestFee || 10} onChange={e => handleChange('member_guestFee', parseInt(e.target.value))} className="settings-input" />
              </div>
            )}
          </div>
        );
      case 'booking':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Max Bookings Per Week</label>
              <input type="number" value={settings.member_maxBookingsPerWeek || 10} onChange={e => handleChange('member_maxBookingsPerWeek', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Booking Window (days)</label>
              <input type="number" value={settings.member_bookingWindowDays || 7} onChange={e => handleChange('member_bookingWindowDays', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Cancellation Window (hours)</label>
              <input type="number" value={settings.member_cancellationWindowHours || 4} onChange={e => handleChange('member_cancellationWindowHours', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>No-Show Penalty</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_noShowPenalty || false} onChange={e => handleChange('member_noShowPenalty', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.member_noShowPenalty && (
              <div className="settings-form-group">
                <label>Suspension After (no-shows)</label>
                <input type="number" value={settings.member_noShowSuspensionThreshold || 3} onChange={e => handleChange('member_noShowSuspensionThreshold', parseInt(e.target.value))} className="settings-input" />
              </div>
            )}
            <div className="settings-form-group">
              <label>Waitlist Enabled</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_waitlistEnabled || false} onChange={e => handleChange('member_waitlistEnabled', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'rewards':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Family Membership</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_familyMembershipEnabled || false} onChange={e => handleChange('member_familyMembershipEnabled', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.member_familyMembershipEnabled && (
              <div className="settings-form-group">
                <label>Family Discount (%)</label>
                <input type="number" value={settings.member_familyDiscount || 15} onChange={e => handleChange('member_familyDiscount', parseInt(e.target.value))} className="settings-input" />
              </div>
            )}
            <div className="settings-form-group">
              <label>Referral Program</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_referralEnabled || false} onChange={e => handleChange('member_referralEnabled', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.member_referralEnabled && (
              <>
                <div className="settings-form-group">
                  <label>Referral Reward Type</label>
                  <select value={settings.member_referralReward || 'credit'} onChange={e => handleChange('member_referralReward', e.target.value)} className="settings-select">
                    <option value="credit">Account Credit</option>
                    <option value="discount">Discount</option>
                    <option value="cash">Cash</option>
                    <option value="freeMonth">Free Month</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>Referral Amount (₹)</label>
                  <input type="number" value={settings.member_referralAmount || 500} onChange={e => handleChange('member_referralAmount', parseInt(e.target.value))} className="settings-input" />
                </div>
              </>
            )}
            <div className="settings-form-group">
              <label>Loyalty Points</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_loyaltyPointsEnabled || false} onChange={e => handleChange('member_loyaltyPointsEnabled', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.member_loyaltyPointsEnabled && (
              <div className="settings-form-group">
                <label>Points Per ₹ Spent</label>
                <input type="number" value={settings.member_pointsPerRupee || 1} onChange={e => handleChange('member_pointsPerRupee', parseInt(e.target.value))} className="settings-input" />
              </div>
            )}
          </div>
        );
      case 'communication':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>SMS Notifications</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_smsNotifications || false} onChange={e => handleChange('member_smsNotifications', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Email Notifications</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_emailNotifications || false} onChange={e => handleChange('member_emailNotifications', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Push Notifications</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_pushNotifications || false} onChange={e => handleChange('member_pushNotifications', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Marketing Opt-In Default</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_marketingOptIn || false} onChange={e => handleChange('member_marketingOptIn', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        );
      case 'compliance':
        return (
          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label>Auto-Suspend on Payment Failure</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_autoSuspendOnPaymentFailure || false} onChange={e => handleChange('member_autoSuspendOnPaymentFailure', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-form-group">
              <label>Payment Grace Period (days)</label>
              <input type="number" value={settings.member_paymentGracePeriod || 7} onChange={e => handleChange('member_paymentGracePeriod', parseInt(e.target.value))} className="settings-input" />
            </div>
            <div className="settings-form-group">
              <label>Waiver Required</label>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.member_waiverRequired || false} onChange={e => handleChange('member_waiverRequired', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            {settings.member_waiverRequired && (
              <div className="settings-form-group">
                <label>Waiver Expiry (months)</label>
                <input type="number" value={settings.member_waiverExpiryMonths || 12} onChange={e => handleChange('member_waiverExpiryMonths', parseInt(e.target.value))} className="settings-input" />
              </div>
            )}
          </div>
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
        <div className="settings-section__header">
          <div className="settings-section__title-group">
            <div className="settings-section__icon"><Users size={20} /></div>
            <div>
              <h2 className="settings-section__title">User Rules</h2>
              <p className="settings-section__description">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon"><Users size={20} /></div>
          <div>
            <h2 className="settings-section__title">User Rules</h2>
            <p className="settings-section__description">Manage rules for staff, trainers, and members</p>
          </div>
        </div>
        {hasChanges && (
          <button className="settings-save-btn" onClick={() => setShowConfirm(true)}>
            Save Changes
          </button>
        )}
      </div>

      <div className="settings-section__content">
        {/* Role Switcher */}
        <div className="role-switcher">
          <div className="role-switcher__track">
            <div 
              className="role-switcher__indicator" 
              style={{ transform: `translateX(${activeRole === 'staff' ? 0 : activeRole === 'trainer' ? 100 : 200}%)` }}
            />
            <button 
              className={`role-switcher__btn ${activeRole === 'staff' ? 'active' : ''}`}
              onClick={() => handleRoleChange('staff')}
            >
              <Briefcase size={16} />
              <span>Staff</span>
            </button>
            <button 
              className={`role-switcher__btn ${activeRole === 'trainer' ? 'active' : ''}`}
              onClick={() => handleRoleChange('trainer')}
            >
              <GraduationCap size={16} />
              <span>Trainer</span>
            </button>
            <button 
              className={`role-switcher__btn ${activeRole === 'member' ? 'active' : ''}`}
              onClick={() => handleRoleChange('member')}
            >
              <UserCheck size={16} />
              <span>Member</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`role-content ${slideDirection ? `slide-${slideDirection}` : ''}`}>
          <div className="settings-tabs">
            {currentTabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="settings-tab-content">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="confirm-dialog-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-dialog__header">
              <h3>Confirm Changes</h3>
              <button className="confirm-dialog__close" onClick={() => setShowConfirm(false)}>×</button>
            </div>
            <div className="confirm-dialog__body">
              <div className="changes-summary">
                <span className="changes-count">{getChanges().length} change{getChanges().length !== 1 ? 's' : ''}</span>
              </div>
              <div className="changes-list">
                {getChanges().map(change => (
                  <div key={change.key} className="change-item">
                    <span className="change-label">{change.label}</span>
                    <div className="change-values">
                      <span className="change-old">{formatValue(change.oldValue)}</span>
                      <span className="change-arrow">→</span>
                      <span className="change-new">{formatValue(change.newValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="confirm-dialog__footer">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleSave} disabled={saving}>
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
