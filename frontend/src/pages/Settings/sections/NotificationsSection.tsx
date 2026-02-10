"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import { 
  Bell, Save, Loader2, Mail, Smartphone, MessageSquare, Clock, Calendar,
  AlertCircle, CheckCircle2, CreditCard, Zap, Users, GraduationCap, UserCheck,
  Settings, FileText, Send, Gift, Megaphone, Shield, Activity, Target,
  BellRing, MessageCircle, ChevronRight, Plus, Trash2, Edit3, Copy,
  Play, Pause, ToggleLeft, ToggleRight, Sparkles, Heart, Star, TrendingUp,
  AlertTriangle, Info, X, Check, RefreshCw, Eye, Volume2, VolumeX
} from "lucide-react"
import api from "../../../services/api"

// Types
type NotificationChannel = 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
type RecipientType = 'member' | 'trainer' | 'staff' | 'admin' | 'all';

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  channels: NotificationChannel[];
  variables: string[];
  isActive: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  channels: NotificationChannel[];
  recipients: RecipientType[];
  isActive: boolean;
  priority: NotificationPriority;
}

interface ChannelSettings {
  email: {
    enabled: boolean;
    provider: string;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    dailyLimit: number;
    footerText: string;
  };
  sms: {
    enabled: boolean;
    provider: string;
    senderId: string;
    dailyLimit: number;
    optOutMessage: string;
  };
  push: {
    enabled: boolean;
    icon: string;
    badge: boolean;
    sound: boolean;
    vibrate: boolean;
  };
  whatsapp: {
    enabled: boolean;
    businessNumber: string;
    apiKey: string;
  };
  inApp: {
    enabled: boolean;
    showBadge: boolean;
    playSound: boolean;
    autoMarkRead: number;
    retentionDays: number;
  };
}

interface MemberNotificationSettings {
  // Onboarding
  welcomeMessage: boolean;
  welcomeChannels: NotificationChannel[];
  orientationReminder: boolean;
  profileCompletionReminder: boolean;
  
  // Membership
  renewalReminder: boolean;
  renewalReminderDays: number[];
  expiryAlert: boolean;
  expiryAlertDays: number[];
  membershipUpgradePromo: boolean;
  
  // Payments
  paymentConfirmation: boolean;
  paymentReminder: boolean;
  paymentReminderDays: number[];
  paymentFailed: boolean;
  invoiceGenerated: boolean;
  
  // Classes & Bookings
  classBookingConfirmation: boolean;
  classReminder: boolean;
  classReminderHours: number;
  classCancellation: boolean;
  waitlistUpdate: boolean;
  trainerAssignment: boolean;
  
  // Engagement
  birthdayWish: boolean;
  birthdayOffer: boolean;
  anniversaryWish: boolean;
  inactivityReminder: boolean;
  inactivityDays: number;
  achievementUnlocked: boolean;
  milestoneReached: boolean;
  
  // Promotions
  promotionalOffers: boolean;
  referralUpdates: boolean;
  loyaltyPointsUpdate: boolean;
  newClassAnnouncement: boolean;
  
  // Account
  loginAlert: boolean;
  passwordChanged: boolean;
  profileUpdated: boolean;
  emergencyContactReminder: boolean;
}

interface StaffNotificationSettings {
  // Attendance
  shiftReminder: boolean;
  shiftReminderHours: number;
  shiftChange: boolean;
  clockInReminder: boolean;
  overtimeAlert: boolean;
  
  // Tasks
  taskAssignment: boolean;
  taskDeadline: boolean;
  taskDeadlineHours: number;
  
  // Performance
  performanceReview: boolean;
  targetAchieved: boolean;
  feedbackReceived: boolean;
  
  // Leave
  leaveApproval: boolean;
  leaveReminder: boolean;
  
  // Communication
  teamAnnouncement: boolean;
  policyUpdate: boolean;
  meetingReminder: boolean;
  meetingReminderHours: number;
  
  // Payroll
  salaryProcessed: boolean;
  payslipAvailable: boolean;
}

interface TrainerNotificationSettings {
  // Clients
  newClientAssigned: boolean;
  clientCancellation: boolean;
  clientNoShow: boolean;
  clientFeedback: boolean;
  clientMilestone: boolean;
  
  // Schedule
  sessionReminder: boolean;
  sessionReminderHours: number;
  scheduleChange: boolean;
  availabilityRequest: boolean;
  
  // Classes
  classReminder: boolean;
  classReminderHours: number;
  lowAttendanceAlert: boolean;
  classFullAlert: boolean;
  
  // Performance
  monthlyReport: boolean;
  ratingUpdate: boolean;
  bonusEarned: boolean;
  
  // Certification
  certificationExpiry: boolean;
  certificationExpiryDays: number[];
  trainingOpportunity: boolean;
}

interface SystemAlertSettings {
  // Dashboard Alerts
  showDashboardAlerts: boolean;
  alertPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  alertDuration: number;
  maxVisibleAlerts: number;
  
  // Critical Alerts
  serverDown: boolean;
  databaseError: boolean;
  paymentGatewayIssue: boolean;
  securityBreach: boolean;
  
  // Business Alerts
  newMemberRegistration: boolean;
  membershipExpiring: boolean;
  paymentReceived: boolean;
  paymentFailed: boolean;
  lowAttendance: boolean;
  capacityReached: boolean;
  
  // Inventory
  lowStock: boolean;
  lowStockThreshold: number;
  equipmentMaintenance: boolean;
  
  // Reports
  dailySummary: boolean;
  dailySummaryTime: string;
  weeklySummary: boolean;
  monthlySummary: boolean;
  
  // Admin Recipients
  adminEmailRecipients: string[];
  urgentAlertPhone: string;
}

interface NotificationSettings {
  channels: ChannelSettings;
  member: MemberNotificationSettings;
  staff: StaffNotificationSettings;
  trainer: TrainerNotificationSettings;
  system: SystemAlertSettings;
  templates: NotificationTemplate[];
  automationRules: AutomationRule[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    excludeUrgent: boolean;
  };
  globalSettings: {
    timezone: string;
    language: string;
    unsubscribeLink: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
  };
}

// Default templates
const defaultTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    type: 'welcome',
    subject: 'Welcome to {{gym_name}}, {{member_name}}!',
    body: 'Hi {{member_name}},\
\
Welcome to {{gym_name}}! We\'re excited to have you join our fitness family.\n\
Your membership starts on {{start_date}} and is valid until {{end_date}}.\n\
Best regards,\n{{gym_name}} Team',
    channels: ['email'],
    variables: ['gym_name', 'member_name', 'start_date', 'end_date'],
    isActive: true
  },
  {
    id: '2',
    name: 'Payment Reminder',
    type: 'payment_reminder',
    subject: 'Payment Due in {{days}} Days - {{gym_name}}',
    body: 'Hi {{member_name}},\
\
This is a friendly reminder that your payment of {{amount}} is due on {{due_date}}.\
\nPlease ensure timely payment to continue enjoying our services.\
\
Best regards,\
{{gym_name}} Team',
    channels: ['email', 'sms'],
    variables: ['member_name', 'gym_name', 'amount', 'due_date', 'days'],
    isActive: true
  },
  {
    id: '3',
    name: 'Class Reminder',
    type: 'class_reminder',
    subject: 'Reminder: {{class_name}} in {{hours}} hours',
    body: 'Hi {{member_name}},\
\
Just a reminder that you have {{class_name}} with {{trainer_name}} at {{class_time}} today.\
\
See you there!',
    channels: ['push', 'sms'],
    variables: ['member_name', 'class_name', 'trainer_name', 'class_time', 'hours'],
    isActive: true
  },
  {
    id: '4',
    name: 'Birthday Wish',
    type: 'birthday',
    subject: 'Happy Birthday, {{member_name}}! 🎂',
    body: 'Dear {{member_name}},\
\
Wishing you a very Happy Birthday from everyone at {{gym_name}}!\
\
As a special gift, enjoy {{offer_details}}.\
\
Have a fantastic day!',
    channels: ['email', 'sms', 'push'],
    variables: ['member_name', 'gym_name', 'offer_details'],
    isActive: true
  },
  {
    id: '5',
    name: 'Membership Expiry',
    type: 'expiry_reminder',
    subject: 'Your Membership Expires in {{days}} Days',
    body: 'Hi {{member_name}},\
\nYour {{membership_type}} membership at {{gym_name}} will expire on {{expiry_date}}.\
\
Renew now to continue your fitness journey with us!\n\
Renewal Amount: {{renewal_amount}}',
    channels: ['email', 'sms'],
    variables: ['member_name', 'gym_name', 'membership_type', 'expiry_date', 'days', 'renewal_amount'],
    isActive: true
  }
];

// Default automation rules
const defaultAutomationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Welcome New Members',
    trigger: 'member_registration',
    conditions: ['membership_confirmed'],
    actions: ['send_welcome_email', 'create_orientation_task'],
    channels: ['email', 'push'],
    recipients: ['member'],
    isActive: true,
    priority: 'high'
  },
  {
    id: '2',
    name: 'Payment Reminder Sequence',
    trigger: 'payment_due',
    conditions: ['days_before:7', 'days_before:3', 'days_before:1'],
    actions: ['send_payment_reminder'],
    channels: ['email', 'sms'],
    recipients: ['member'],
    isActive: true,
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Inactivity Re-engagement',
    trigger: 'member_inactive',
    conditions: ['inactive_days:14'],
    actions: ['send_reengagement_email', 'offer_discount'],
    channels: ['email', 'push'],
    recipients: ['member'],
    isActive: true,
    priority: 'low'
  },
  {
    id: '4',
    name: 'Birthday Automation',
    trigger: 'member_birthday',
    conditions: ['on_birthday'],
    actions: ['send_birthday_wish', 'apply_birthday_offer'],
    channels: ['email', 'sms', 'push'],
    recipients: ['member'],
    isActive: true,
    priority: 'medium'
  },
  {
    id: '5',
    name: 'Trainer Session Reminder',
    trigger: 'upcoming_session',
    conditions: ['hours_before:24', 'hours_before:2'],
    actions: ['send_session_reminder'],
    channels: ['push', 'sms'],
    recipients: ['member', 'trainer'],
    isActive: true,
    priority: 'high'
  }
];

const getDefaultSettings = (): NotificationSettings => ({
  channels: {
    email: {
      enabled: true,
      provider: 'smtp',
      fromName: 'Gym Management',
      fromEmail: 'noreply@gym.com',
      replyTo: 'support@gym.com',
      dailyLimit: 1000,
      footerText: '© 2024 Gym Management. All rights reserved.'
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      senderId: 'GYMFIT',
      dailyLimit: 500,
      optOutMessage: 'Reply STOP to unsubscribe'
    },
    push: {
      enabled: true,
      icon: '/icon.png',
      badge: true,
      sound: true,
      vibrate: true
    },
    whatsapp: {
      enabled: false,
      businessNumber: '',
      apiKey: ''
    },
    inApp: {
      enabled: true,
      showBadge: true,
      playSound: false,
      autoMarkRead: 30,
      retentionDays: 30
    }
  },
  member: {
    welcomeMessage: true,
    welcomeChannels: ['email', 'push'],
    orientationReminder: true,
    profileCompletionReminder: true,
    renewalReminder: true,
    renewalReminderDays: [7, 3, 1],
    expiryAlert: true,
    expiryAlertDays: [7, 3, 1],
    membershipUpgradePromo: true,
    paymentConfirmation: true,
    paymentReminder: true,
    paymentReminderDays: [7, 3, 1],
    paymentFailed: true,
    invoiceGenerated: true,
    classBookingConfirmation: true,
    classReminder: true,
    classReminderHours: 2,
    classCancellation: true,
    waitlistUpdate: true,
    trainerAssignment: true,
    birthdayWish: true,
    birthdayOffer: true,
    anniversaryWish: true,
    inactivityReminder: true,
    inactivityDays: 14,
    achievementUnlocked: true,
    milestoneReached: true,
    promotionalOffers: true,
    referralUpdates: true,
    loyaltyPointsUpdate: true,
    newClassAnnouncement: true,
    loginAlert: false,
    passwordChanged: true,
    profileUpdated: false,
    emergencyContactReminder: true
  },
  staff: {
    shiftReminder: true,
    shiftReminderHours: 12,
    shiftChange: true,
    clockInReminder: true,
    overtimeAlert: true,
    taskAssignment: true,
    taskDeadline: true,
    taskDeadlineHours: 24,
    performanceReview: true,
    targetAchieved: true,
    feedbackReceived: true,
    leaveApproval: true,
    leaveReminder: true,
    teamAnnouncement: true,
    policyUpdate: true,
    meetingReminder: true,
    meetingReminderHours: 1,
    salaryProcessed: true,
    payslipAvailable: true
  },
  trainer: {
    newClientAssigned: true,
    clientCancellation: true,
    clientNoShow: true,
    clientFeedback: true,
    clientMilestone: true,
    sessionReminder: true,
    sessionReminderHours: 2,
    scheduleChange: true,
    availabilityRequest: true,
    classReminder: true,
    classReminderHours: 1,
    lowAttendanceAlert: true,
    classFullAlert: true,
    monthlyReport: true,
    ratingUpdate: true,
    bonusEarned: true,
    certificationExpiry: true,
    certificationExpiryDays: [30, 14, 7],
    trainingOpportunity: true
  },
  system: {
    showDashboardAlerts: true,
    alertPosition: 'top-right',
    alertDuration: 5,
    maxVisibleAlerts: 5,
    serverDown: true,
    databaseError: true,
    paymentGatewayIssue: true,
    securityBreach: true,
    newMemberRegistration: true,
    membershipExpiring: true,
    paymentReceived: true,
    paymentFailed: true,
    lowAttendance: true,
    capacityReached: true,
    lowStock: true,
    lowStockThreshold: 10,
    equipmentMaintenance: true,
    dailySummary: true,
    dailySummaryTime: '20:00',
    weeklySummary: true,
    monthlySummary: true,
    adminEmailRecipients: [],
    urgentAlertPhone: ''
  },
  templates: defaultTemplates,
  automationRules: defaultAutomationRules,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    excludeUrgent: true
  },
  globalSettings: {
    timezone: 'Asia/Kolkata',
    language: 'en',
    unsubscribeLink: true,
    trackOpens: true,
    trackClicks: true
  }
});

type TabType = 'channels' | 'member' | 'staff' | 'templates' | 'automation' | 'system';

const NotificationsSection: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(getDefaultSettings());
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('channels');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);
  
  // Template editor state
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  
  // Automation editor state
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'channels', label: 'Channels', icon: <Zap size={14} /> },
    { id: 'member', label: 'Members', icon: <Users size={14} /> },
    { id: 'staff', label: 'Staff & Trainers', icon: <UserCheck size={14} /> },
    { id: 'templates', label: 'Templates', icon: <FileText size={14} /> },
    { id: 'automation', label: 'Automation', icon: <Sparkles size={14} /> },
    { id: 'system', label: 'System Alerts', icon: <Bell size={14} /> },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/gym');
      if (response.data) {
        const fetched = response.data;
        // Merge fetched data with defaults
        const mergedSettings = {
          ...getDefaultSettings(),
          ...fetched.notificationSettings
        };
        setSettings(mergedSettings);
        setOriginalSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      setOriginalSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const detectChanges = useCallback((newSettings: NotificationSettings) => {
    if (!originalSettings) return [];
    const changes: string[] = [];
    
    // Compare channels
    Object.keys(newSettings.channels).forEach((channel) => {
      const key = channel as keyof ChannelSettings;
      if (JSON.stringify(newSettings.channels[key]) !== JSON.stringify(originalSettings.channels[key])) {
        changes.push(`${channel.charAt(0).toUpperCase() + channel.slice(1)} channel settings modified`);
      }
    });
    
    // Compare member settings
    if (JSON.stringify(newSettings.member) !== JSON.stringify(originalSettings.member)) {
      changes.push('Member notification preferences updated');
    }
    
    // Compare staff settings
    if (JSON.stringify(newSettings.staff) !== JSON.stringify(originalSettings.staff)) {
      changes.push('Staff notification preferences updated');
    }
    
    // Compare trainer settings
    if (JSON.stringify(newSettings.trainer) !== JSON.stringify(originalSettings.trainer)) {
      changes.push('Trainer notification preferences updated');
    }
    
    // Compare system settings
    if (JSON.stringify(newSettings.system) !== JSON.stringify(originalSettings.system)) {
      changes.push('System alert settings updated');
    }
    
    // Compare templates
    if (JSON.stringify(newSettings.templates) !== JSON.stringify(originalSettings.templates)) {
      changes.push('Notification templates modified');
    }
    
    // Compare automation rules
    if (JSON.stringify(newSettings.automationRules) !== JSON.stringify(originalSettings.automationRules)) {
      changes.push('Automation rules modified');
    }
    
    return changes;
  }, [originalSettings]);

  const updateSettings = useCallback(<K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      const changes = detectChanges(updated);
      setHasChanges(changes.length > 0);
      setPendingChanges(changes);
      return updated;
    });
  }, [detectChanges]);

  const updateNestedSetting = useCallback(<
    K extends keyof NotificationSettings,
    NK extends keyof NotificationSettings[K]
  >(
    parentKey: K,
    nestedKey: NK,
    value: NotificationSettings[K][NK]
  ) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [nestedKey]: value
        }
      };
      const changes = detectChanges(updated);
      setHasChanges(changes.length > 0);
      setPendingChanges(changes);
      return updated;
    });
  }, [detectChanges]);

  const handleSaveClick = () => {
    if (pendingChanges.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings/gym', { notificationSettings: settings });
      setOriginalSettings(settings);
      setHasChanges(false);
      setPendingChanges([]);
      setShowConfirmDialog(false);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  // Template management
  const handleSaveTemplate = (template: NotificationTemplate) => {
    const templates = [...settings.templates];
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push({ ...template, id: Date.now().toString() });
    }
    updateSettings('templates', templates);
    setShowTemplateEditor(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    const templates = settings.templates.filter(t => t.id !== id);
    updateSettings('templates', templates);
  };

  // Automation rule management
  const handleSaveRule = (rule: AutomationRule) => {
    const rules = [...settings.automationRules];
    const index = rules.findIndex(r => r.id === rule.id);
    if (index >= 0) {
      rules[index] = rule;
    } else {
      rules.push({ ...rule, id: Date.now().toString() });
    }
    updateSettings('automationRules', rules);
    setShowRuleEditor(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    const rules = settings.automationRules.filter(r => r.id !== id);
    updateSettings('automationRules', rules);
  };

  const toggleRuleActive = (id: string) => {
    const rules = settings.automationRules.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    updateSettings('automationRules', rules);
  };

  if (loading) {
    return (
      <div className="settings-section">
        <div className="settings-loading">
          <Loader2 className="spin" size={24} />
          <span>Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="settings-section__title">Notifications & Alerts</h2>
            <p className="settings-section__description">
              Manage all notification channels, templates and automation rules
            </p>
          </div>
        </div>
        {hasChanges && (
          <button 
            className="settings-save-btn"
            onClick={handleSaveClick}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="settings-tabs-wrapper">
        <div className="settings-tabs">
          {tabs.map(tab => (
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
      </div>

      {/* Tab Content */}
      <div className="settings-section__content">
        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="notification-channels-tab">
            {/* Email Channel */}
            <div className="form-group">
              <div className="form-group__header">
                <Mail size={16} />
                <h4 className="form-group__title">Email Notifications</h4>
                <button
                  className={`policy-toggle ${settings.channels.email.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'email', {
                    ...settings.channels.email,
                    enabled: !settings.channels.email.enabled
                  })}
                />
              </div>
              
              {settings.channels.email.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>From Name</label>
                    <input
                      type="text"
                      value={settings.channels.email.fromName}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        fromName: e.target.value
                      })}
                      placeholder="Gym Name"
                    />
                  </div>
                  <div className="config-field">
                    <label>From Email</label>
                    <input
                      type="email"
                      value={settings.channels.email.fromEmail}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        fromEmail: e.target.value
                      })}
                      placeholder="noreply@gym.com"
                    />
                  </div>
                  <div className="config-field">
                    <label>Reply To</label>
                    <input
                      type="email"
                      value={settings.channels.email.replyTo}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        replyTo: e.target.value
                      })}
                      placeholder="support@gym.com"
                    />
                  </div>
                  <div className="config-field">
                    <label>Daily Limit</label>
                    <input
                      type="number"
                      value={settings.channels.email.dailyLimit}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        dailyLimit: parseInt(e.target.value) || 0
                      })}
                      min={0}
                    />
                  </div>
                  <div className="config-field config-field--full">
                    <label>Email Footer Text</label>
                    <textarea
                      value={settings.channels.email.footerText}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        footerText: e.target.value
                      })}
                      rows={2}
                      placeholder="Footer text for all emails..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SMS Channel */}
            <div className="form-group">
              <div className="form-group__header">
                <Smartphone size={16} />
                <h4 className="form-group__title">SMS Notifications</h4>
                <button
                  className={`policy-toggle ${settings.channels.sms.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'sms', {
                    ...settings.channels.sms,
                    enabled: !settings.channels.sms.enabled
                  })}
                />
              </div>
              
              {settings.channels.sms.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Provider</label>
                    <select
                      value={settings.channels.sms.provider}
                      onChange={e => updateNestedSetting('channels', 'sms', {
                        ...settings.channels.sms,
                        provider: e.target.value
                      })}
                    >
                      <option value="twilio">Twilio</option>
                      <option value="messagebird">MessageBird</option>
                      <option value="nexmo">Nexmo</option>
                      <option value="custom">Custom API</option>
                    </select>
                  </div>
                  <div className="config-field">
                    <label>Sender ID</label>
                    <input
                      type="text"
                      value={settings.channels.sms.senderId}
                      onChange={e => updateNestedSetting('channels', 'sms', {
                        ...settings.channels.sms,
                        senderId: e.target.value
                      })}
                      placeholder="GYMFIT"
                      maxLength={11}
                    />
                  </div>
                  <div className="config-field">
                    <label>Daily Limit</label>
                    <input
                      type="number"
                      value={settings.channels.sms.dailyLimit}
                      onChange={e => updateNestedSetting('channels', 'sms', {
                        ...settings.channels.sms,
                        dailyLimit: parseInt(e.target.value) || 0
                      })}
                      min={0}
                    />
                  </div>
                  <div className="config-field">
                    <label>Opt-out Message</label>
                    <input
                      type="text"
                      value={settings.channels.sms.optOutMessage}
                      onChange={e => updateNestedSetting('channels', 'sms', {
                        ...settings.channels.sms,
                        optOutMessage: e.target.value
                      })}
                      placeholder="Reply STOP to unsubscribe"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Push Notifications */}
            <div className="form-group">
              <div className="form-group__header">
                <BellRing size={16} />
                <h4 className="form-group__title">Push Notifications</h4>
                <button
                  className={`policy-toggle ${settings.channels.push.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'push', {
                    ...settings.channels.push,
                    enabled: !settings.channels.push.enabled
                  })}
                />
              </div>
              
              {settings.channels.push.enabled && (
                <div className="push-options">
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Eye size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Show Badge Count</span>
                        <span className="policy-toggle-row__hint">Display unread count on app icon</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.push.badge ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'push', {
                        ...settings.channels.push,
                        badge: !settings.channels.push.badge
                      })}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Volume2 size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Notification Sound</span>
                        <span className="policy-toggle-row__hint">Play sound for new notifications</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.push.sound ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'push', {
                        ...settings.channels.push,
                        sound: !settings.channels.push.sound
                      })}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Activity size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Vibration</span>
                        <span className="policy-toggle-row__hint">Vibrate device on notification</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.push.vibrate ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'push', {
                        ...settings.channels.push,
                        vibrate: !settings.channels.push.vibrate
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div className="form-group">
              <div className="form-group__header">
                <MessageSquare size={16} />
                <h4 className="form-group__title">WhatsApp Business</h4>
                <button
                  className={`policy-toggle ${settings.channels.whatsapp.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'whatsapp', {
                    ...settings.channels.whatsapp,
                    enabled: !settings.channels.whatsapp.enabled
                  })}
                />
              </div>
              
              {settings.channels.whatsapp.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Business Phone Number</label>
                    <input
                      type="tel"
                      value={settings.channels.whatsapp.businessNumber}
                      onChange={e => updateNestedSetting('channels', 'whatsapp', {
                        ...settings.channels.whatsapp,
                        businessNumber: e.target.value
                      })}
                      placeholder="+91XXXXXXXXXX"
                    />
                  </div>
                  <div className="config-field">
                    <label>API Key</label>
                    <input
                      type="password"
                      value={settings.channels.whatsapp.apiKey}
                      onChange={e => updateNestedSetting('channels', 'whatsapp', {
                        ...settings.channels.whatsapp,
                        apiKey: e.target.value
                      })}
                      placeholder="Enter WhatsApp Business API key"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* In-App Notifications */}
            <div className="form-group">
              <div className="form-group__header">
                <MessageCircle size={16} />
                <h4 className="form-group__title">In-App Notifications</h4>
                <button
                  className={`policy-toggle ${settings.channels.inApp.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'inApp', {
                    ...settings.channels.inApp,
                    enabled: !settings.channels.inApp.enabled
                  })}
                />
              </div>
              
              {settings.channels.inApp.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Auto Mark as Read (seconds)</label>
                    <input
                      type="number"
                      value={settings.channels.inApp.autoMarkRead}
                      onChange={e => updateNestedSetting('channels', 'inApp', {
                        ...settings.channels.inApp,
                        autoMarkRead: parseInt(e.target.value) || 0
                      })}
                      min={0}
                      placeholder="0 to disable"
                    />
                  </div>
                  <div className="config-field">
                    <label>Retention Days</label>
                    <input
                      type="number"
                      value={settings.channels.inApp.retentionDays}
                      onChange={e => updateNestedSetting('channels', 'inApp', {
                        ...settings.channels.inApp,
                        retentionDays: parseInt(e.target.value) || 30
                      })}
                      min={1}
                      max={365}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Eye size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Show Badge</span>
                        <span className="policy-toggle-row__hint">Show notification count badge</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.inApp.showBadge ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'inApp', {
                        ...settings.channels.inApp,
                        showBadge: !settings.channels.inApp.showBadge
                      })}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Volume2 size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Play Sound</span>
                        <span className="policy-toggle-row__hint">Audio alert for new notifications</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.inApp.playSound ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'inApp', {
                        ...settings.channels.inApp,
                        playSound: !settings.channels.inApp.playSound
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quiet Hours */}
            <div className="form-group">
              <div className="form-group__header">
                <VolumeX size={16} />
                <h4 className="form-group__title">Quiet Hours</h4>
                <button
                  className={`policy-toggle ${settings.quietHours.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSettings('quietHours', {
                    ...settings.quietHours,
                    enabled: !settings.quietHours.enabled
                  })}
                />
              </div>
              
              {settings.quietHours.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={e => updateSettings('quietHours', {
                        ...settings.quietHours,
                        start: e.target.value
                      })}
                    />
                  </div>
                  <div className="config-field">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={e => updateSettings('quietHours', {
                        ...settings.quietHours,
                        end: e.target.value
                      })}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Exclude Urgent</span>
                        <span className="policy-toggle-row__hint">Still send urgent notifications during quiet hours</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.quietHours.excludeUrgent ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateSettings('quietHours', {
                        ...settings.quietHours,
                        excludeUrgent: !settings.quietHours.excludeUrgent
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Member Notifications Tab */}
        {activeTab === 'member' && (
          <div className="member-notifications-tab">
            {/* Onboarding */}
            <div className="form-group">
              <div className="form-group__header">
                <Sparkles size={16} />
                <h4 className="form-group__title">Onboarding & Welcome</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Mail size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Welcome Message</span>
                    <span className="policy-toggle-row__hint">Send welcome email/SMS on registration</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.welcomeMessage ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'welcomeMessage', !settings.member.welcomeMessage)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Orientation Reminder</span>
                    <span className="policy-toggle-row__hint">Remind new members about gym orientation</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.orientationReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'orientationReminder', !settings.member.orientationReminder)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Profile Completion</span>
                    <span className="policy-toggle-row__hint">Remind to complete profile details</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.profileCompletionReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'profileCompletionReminder', !settings.member.profileCompletionReminder)}
                />
              </div>
            </div>

            {/* Membership */}
            <div className="form-group">
              <div className="form-group__header">
                <CreditCard size={16} />
                <h4 className="form-group__title">Membership & Renewals</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><RefreshCw size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Renewal Reminders</span>
                    <span className="policy-toggle-row__hint">Remind before membership renewal date</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.renewalReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'renewalReminder', !settings.member.renewalReminder)}
                />
              </div>
              
              {settings.member.renewalReminder && (
                <div className="reminder-days-config">
                  <label>Reminder Days Before</label>
                  <div className="reminder-days-chips">
                    {[30, 14, 7, 3, 1].map(day => (
                      <button
                        key={day}
                        className={`reminder-day-chip ${settings.member.renewalReminderDays.includes(day) ? 'active' : ''}`}
                        onClick={() => {
                          const days = settings.member.renewalReminderDays.includes(day)
                            ? settings.member.renewalReminderDays.filter(d => d !== day)
                            : [...settings.member.renewalReminderDays, day].sort((a, b) => b - a);
                          updateNestedSetting('member', 'renewalReminderDays', days);
                        }}
                      >
                        {day}d
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertCircle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Expiry Alert</span>
                    <span className="policy-toggle-row__hint">Alert when membership is about to expire</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.expiryAlert ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'expiryAlert', !settings.member.expiryAlert)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><TrendingUp size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Upgrade Promotions</span>
                    <span className="policy-toggle-row__hint">Send membership upgrade offers</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.membershipUpgradePromo ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'membershipUpgradePromo', !settings.member.membershipUpgradePromo)}
                />
              </div>
            </div>

            {/* Payments */}
            <div className="form-group">
              <div className="form-group__header">
                <CreditCard size={16} />
                <h4 className="form-group__title">Payment Notifications</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Confirmation</span>
                    <span className="policy-toggle-row__hint">Confirm when payment is received</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.paymentConfirmation ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'paymentConfirmation', !settings.member.paymentConfirmation)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Reminders</span>
                    <span className="policy-toggle-row__hint">Remind about upcoming payments</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.paymentReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'paymentReminder', !settings.member.paymentReminder)}
                />
              </div>
              
              {settings.member.paymentReminder && (
                <div className="reminder-days-config">
                  <label>Reminder Days Before</label>
                  <div className="reminder-days-chips">
                    {[14, 7, 3, 1].map(day => (
                      <button
                        key={day}
                        className={`reminder-day-chip ${settings.member.paymentReminderDays.includes(day) ? 'active' : ''}`}
                        onClick={() => {
                          const days = settings.member.paymentReminderDays.includes(day)
                            ? settings.member.paymentReminderDays.filter(d => d !== day)
                            : [...settings.member.paymentReminderDays, day].sort((a, b) => b - a);
                          updateNestedSetting('member', 'paymentReminderDays', days);
                        }}
                      >
                        {day}d
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Failed</span>
                    <span className="policy-toggle-row__hint">Notify when auto-payment fails</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.paymentFailed ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'paymentFailed', !settings.member.paymentFailed)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Invoice Generated</span>
                    <span className="policy-toggle-row__hint">Send invoice when generated</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.invoiceGenerated ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'invoiceGenerated', !settings.member.invoiceGenerated)}
                />
              </div>
            </div>

            {/* Classes & Bookings */}
            <div className="form-group">
              <div className="form-group__header">
                <Calendar size={16} />
                <h4 className="form-group__title">Classes & Bookings</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Booking Confirmation</span>
                    <span className="policy-toggle-row__hint">Confirm class bookings</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.classBookingConfirmation ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'classBookingConfirmation', !settings.member.classBookingConfirmation)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Class Reminders</span>
                    <span className="policy-toggle-row__hint">Remind before scheduled class</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.classReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'classReminder', !settings.member.classReminder)}
                />
              </div>
              
              {settings.member.classReminder && (
                <div className="inline-config">
                  <label>Remind</label>
                  <input
                    type="number"
                    value={settings.member.classReminderHours}
                    onChange={e => updateNestedSetting('member', 'classReminderHours', parseInt(e.target.value) || 0)}
                    min={1}
                    max={48}
                    className="inline-input"
                  />
                  <span>hours before</span>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><X size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Class Cancellation</span>
                    <span className="policy-toggle-row__hint">Notify when class is cancelled</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.classCancellation ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'classCancellation', !settings.member.classCancellation)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Waitlist Updates</span>
                    <span className="policy-toggle-row__hint">Notify when spot becomes available</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.waitlistUpdate ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'waitlistUpdate', !settings.member.waitlistUpdate)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><GraduationCap size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Trainer Assignment</span>
                    <span className="policy-toggle-row__hint">Notify when trainer is assigned</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.trainerAssignment ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'trainerAssignment', !settings.member.trainerAssignment)}
                />
              </div>
            </div>

            {/* Engagement */}
            <div className="form-group">
              <div className="form-group__header">
                <Heart size={16} />
                <h4 className="form-group__title">Engagement & Milestones</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Gift size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Birthday Wishes</span>
                    <span className="policy-toggle-row__hint">Send birthday greetings</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.birthdayWish ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'birthdayWish', !settings.member.birthdayWish)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Gift size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Birthday Offers</span>
                    <span className="policy-toggle-row__hint">Send special offers on birthday</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.birthdayOffer ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'birthdayOffer', !settings.member.birthdayOffer)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Star size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Anniversary Wishes</span>
                    <span className="policy-toggle-row__hint">Celebrate membership anniversaries</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.anniversaryWish ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'anniversaryWish', !settings.member.anniversaryWish)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Activity size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Inactivity Reminder</span>
                    <span className="policy-toggle-row__hint">Re-engage inactive members</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.inactivityReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'inactivityReminder', !settings.member.inactivityReminder)}
                />
              </div>
              
              {settings.member.inactivityReminder && (
                <div className="inline-config">
                  <label>After</label>
                  <input
                    type="number"
                    value={settings.member.inactivityDays}
                    onChange={e => updateNestedSetting('member', 'inactivityDays', parseInt(e.target.value) || 0)}
                    min={1}
                    max={90}
                    className="inline-input"
                  />
                  <span>days of inactivity</span>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Award size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Achievements Unlocked</span>
                    <span className="policy-toggle-row__hint">Notify fitness achievements</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.achievementUnlocked ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'achievementUnlocked', !settings.member.achievementUnlocked)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Target size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Milestones Reached</span>
                    <span className="policy-toggle-row__hint">Celebrate workout milestones</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.milestoneReached ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'milestoneReached', !settings.member.milestoneReached)}
                />
              </div>
            </div>

            {/* Promotions */}
            <div className="form-group">
              <div className="form-group__header">
                <Megaphone size={16} />
                <h4 className="form-group__title">Promotions & Updates</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Megaphone size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Promotional Offers</span>
                    <span className="policy-toggle-row__hint">Send promotional messages</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.promotionalOffers ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'promotionalOffers', !settings.member.promotionalOffers)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Referral Updates</span>
                    <span className="policy-toggle-row__hint">Notify referral program activity</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.referralUpdates ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'referralUpdates', !settings.member.referralUpdates)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Star size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Loyalty Points</span>
                    <span className="policy-toggle-row__hint">Update on points earned/redeemed</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.loyaltyPointsUpdate ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'loyaltyPointsUpdate', !settings.member.loyaltyPointsUpdate)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">New Class Announcements</span>
                    <span className="policy-toggle-row__hint">Announce new classes</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.newClassAnnouncement ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'newClassAnnouncement', !settings.member.newClassAnnouncement)}
                />
              </div>
            </div>

            {/* Account Security */}
            <div className="form-group">
              <div className="form-group__header">
                <Shield size={16} />
                <h4 className="form-group__title">Account & Security</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Login Alerts</span>
                    <span className="policy-toggle-row__hint">Alert on new device login</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.loginAlert ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'loginAlert', !settings.member.loginAlert)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Password Changed</span>
                    <span className="policy-toggle-row__hint">Confirm password changes</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.passwordChanged ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'passwordChanged', !settings.member.passwordChanged)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertCircle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Emergency Contact Reminder</span>
                    <span className="policy-toggle-row__hint">Remind to update emergency contacts</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.emergencyContactReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'emergencyContactReminder', !settings.member.emergencyContactReminder)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Staff & Trainers Tab */}
        {activeTab === 'staff' && (
          <div className="staff-notifications-tab">
            {/* Staff Section */}
            <div className="notification-subsection">
              <h3 className="subsection-title"><UserCheck size={16} /> Staff Notifications</h3>
              
              {/* Attendance */}
              <div className="form-group">
                <div className="form-group__header">
                  <Clock size={16} />
                  <h4 className="form-group__title">Attendance & Shifts</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Shift Reminders</span>
                      <span className="policy-toggle-row__hint">Remind before shift starts</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.shiftReminder ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'shiftReminder', !settings.staff.shiftReminder)}
                  />
                </div>
                
                {settings.staff.shiftReminder && (
                  <div className="inline-config">
                    <label>Remind</label>
                    <input
                      type="number"
                      value={settings.staff.shiftReminderHours}
                      onChange={e => updateNestedSetting('staff', 'shiftReminderHours', parseInt(e.target.value) || 0)}
                      min={1}
                      max={48}
                      className="inline-input"
                    />
                    <span>hours before</span>
                  </div>
                )}
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><RefreshCw size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Shift Changes</span>
                      <span className="policy-toggle-row__hint">Notify schedule modifications</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.shiftChange ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'shiftChange', !settings.staff.shiftChange)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Activity size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Clock-in Reminder</span>
                      <span className="policy-toggle-row__hint">Remind if not clocked in</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.clockInReminder ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'clockInReminder', !settings.staff.clockInReminder)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Overtime Alert</span>
                      <span className="policy-toggle-row__hint">Alert on overtime hours</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.overtimeAlert ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'overtimeAlert', !settings.staff.overtimeAlert)}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="form-group">
                <div className="form-group__header">
                  <Target size={16} />
                  <h4 className="form-group__title">Tasks & Performance</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Target size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Task Assignment</span>
                      <span className="policy-toggle-row__hint">Notify new task assigned</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.taskAssignment ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'taskAssignment', !settings.staff.taskAssignment)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Task Deadline</span>
                      <span className="policy-toggle-row__hint">Remind before deadline</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.taskDeadline ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'taskDeadline', !settings.staff.taskDeadline)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Star size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Performance Review</span>
                      <span className="policy-toggle-row__hint">Notify scheduled reviews</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.performanceReview ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'performanceReview', !settings.staff.performanceReview)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Award size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Target Achieved</span>
                      <span className="policy-toggle-row__hint">Celebrate target completion</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.targetAchieved ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'targetAchieved', !settings.staff.targetAchieved)}
                  />
                </div>
              </div>

              {/* Leave & Communication */}
              <div className="form-group">
                <div className="form-group__header">
                  <Calendar size={16} />
                  <h4 className="form-group__title">Leave & Communication</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Leave Approval</span>
                      <span className="policy-toggle-row__hint">Notify leave status</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.leaveApproval ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'leaveApproval', !settings.staff.leaveApproval)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Megaphone size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Team Announcements</span>
                      <span className="policy-toggle-row__hint">Broadcast team messages</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.teamAnnouncement ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'teamAnnouncement', !settings.staff.teamAnnouncement)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Policy Updates</span>
                      <span className="policy-toggle-row__hint">Notify policy changes</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.policyUpdate ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'policyUpdate', !settings.staff.policyUpdate)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Meeting Reminders</span>
                      <span className="policy-toggle-row__hint">Remind scheduled meetings</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.meetingReminder ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'meetingReminder', !settings.staff.meetingReminder)}
                  />
                </div>
              </div>

              {/* Payroll */}
              <div className="form-group">
                <div className="form-group__header">
                  <CreditCard size={16} />
                  <h4 className="form-group__title">Payroll</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><CreditCard size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Salary Processed</span>
                      <span className="policy-toggle-row__hint">Notify salary credit</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.salaryProcessed ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'salaryProcessed', !settings.staff.salaryProcessed)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Payslip Available</span>
                      <span className="policy-toggle-row__hint">Notify payslip ready</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.payslipAvailable ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'payslipAvailable', !settings.staff.payslipAvailable)}
                  />
                </div>
              </div>
            </div>

            {/* Trainer Section */}
            <div className="notification-subsection">
              <h3 className="subsection-title"><GraduationCap size={16} /> Trainer Notifications</h3>
              
              {/* Clients */}
              <div className="form-group">
                <div className="form-group__header">
                  <Users size={16} />
                  <h4 className="form-group__title">Client Management</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Users size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">New Client Assigned</span>
                      <span className="policy-toggle-row__hint">Notify new PT client</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.newClientAssigned ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'newClientAssigned', !settings.trainer.newClientAssigned)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><X size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Client Cancellation</span>
                      <span className="policy-toggle-row__hint">Alert session cancellations</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.clientCancellation ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'clientCancellation', !settings.trainer.clientCancellation)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Client No-Show</span>
                      <span className="policy-toggle-row__hint">Alert missed sessions</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.clientNoShow ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'clientNoShow', !settings.trainer.clientNoShow)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Star size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Client Feedback</span>
                      <span className="policy-toggle-row__hint">Notify new feedback</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.clientFeedback ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'clientFeedback', !settings.trainer.clientFeedback)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Award size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Client Milestones</span>
                      <span className="policy-toggle-row__hint">Client achievement alerts</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.clientMilestone ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'clientMilestone', !settings.trainer.clientMilestone)}
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="form-group">
                <div className="form-group__header">
                  <Calendar size={16} />
                  <h4 className="form-group__title">Schedule & Classes</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Session Reminder</span>
                      <span className="policy-toggle-row__hint">Remind upcoming sessions</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.sessionReminder ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'sessionReminder', !settings.trainer.sessionReminder)}
                  />
                </div>
                
                {settings.trainer.sessionReminder && (
                  <div className="inline-config">
                    <label>Remind</label>
                    <input
                      type="number"
                      value={settings.trainer.sessionReminderHours}
                      onChange={e => updateNestedSetting('trainer', 'sessionReminderHours', parseInt(e.target.value) || 0)}
                      min={1}
                      max={24}
                      className="inline-input"
                    />
                    <span>hours before</span>
                  </div>
                )}
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Class Reminder</span>
                      <span className="policy-toggle-row__hint">Remind group classes</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.classReminder ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'classReminder', !settings.trainer.classReminder)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><AlertCircle size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Low Attendance Alert</span>
                      <span className="policy-toggle-row__hint">Alert low class bookings</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.lowAttendanceAlert ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'lowAttendanceAlert', !settings.trainer.lowAttendanceAlert)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Class Full Alert</span>
                      <span className="policy-toggle-row__hint">Notify when class is full</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.classFullAlert ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'classFullAlert', !settings.trainer.classFullAlert)}
                  />
                </div>
              </div>

              {/* Performance & Certification */}
              <div className="form-group">
                <div className="form-group__header">
                  <Award size={16} />
                  <h4 className="form-group__title">Performance & Certification</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Monthly Report</span>
                      <span className="policy-toggle-row__hint">Monthly performance summary</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.monthlyReport ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'monthlyReport', !settings.trainer.monthlyReport)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Star size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Rating Update</span>
                      <span className="policy-toggle-row__hint">Notify rating changes</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.ratingUpdate ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'ratingUpdate', !settings.trainer.ratingUpdate)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><CreditCard size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Bonus Earned</span>
                      <span className="policy-toggle-row__hint">Celebrate bonus payments</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.bonusEarned ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'bonusEarned', !settings.trainer.bonusEarned)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Certification Expiry</span>
                      <span className="policy-toggle-row__hint">Alert expiring certifications</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.certificationExpiry ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'certificationExpiry', !settings.trainer.certificationExpiry)}
                  />
                </div>
                
                {settings.trainer.certificationExpiry && (
                  <div className="reminder-days-config">
                    <label>Alert Days Before</label>
                    <div className="reminder-days-chips">
                      {[60, 30, 14, 7].map(day => (
                        <button
                          key={day}
                          className={`reminder-day-chip ${settings.trainer.certificationExpiryDays.includes(day) ? 'active' : ''}`}
                          onClick={() => {
                            const days = settings.trainer.certificationExpiryDays.includes(day)
                              ? settings.trainer.certificationExpiryDays.filter(d => d !== day)
                              : [...settings.trainer.certificationExpiryDays, day].sort((a, b) => b - a);
                            updateNestedSetting('trainer', 'certificationExpiryDays', days);
                          }}
                        >
                          {day}d
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><GraduationCap size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Training Opportunities</span>
                      <span className="policy-toggle-row__hint">New courses and workshops</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.trainingOpportunity ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'trainingOpportunity', !settings.trainer.trainingOpportunity)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="templates-tab">
            <div className="templates-header">
              <div className="templates-info">
                <Info size={16} />
                <span>Create and manage notification templates with dynamic variables</span>
              </div>
              <button 
                className="add-template-btn"
                onClick={() => {
                  setEditingTemplate({
                    id: '',
                    name: '',
                    type: 'custom',
                    subject: '',
                    body: '',
                    channels: ['email'],
                    variables: [],
                    isActive: true
                  });
                  setShowTemplateEditor(true);
                }}
              >
                <Plus size={14} />
                New Template
              </button>
            </div>
            
            <div className="templates-list">
              {settings.templates.map(template => (
                <div key={template.id} className={`template-card ${!template.isActive ? 'inactive' : ''}`}>
                  <div className="template-card__header">
                    <div className="template-card__title">
                      <FileText size={16} />
                      <span>{template.name}</span>
                      <span className="template-type-badge">{template.type}</span>
                    </div>
                    <div className="template-card__actions">
                      <button 
                        className="template-action-btn"
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateEditor(true);
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="template-action-btn"
                        onClick={() => {
                          const newTemplate = { ...template, id: Date.now().toString(), name: `${template.name} (Copy)` };
                          handleSaveTemplate(newTemplate);
                        }}
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        className="template-action-btn delete"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="template-card__subject">
                    <strong>Subject:</strong> {template.subject}
                  </div>
                  
                  <div className="template-card__preview">
                    {template.body.substring(0, 150)}...
                  </div>
                  
                  <div className="template-card__footer">
                    <div className="template-channels">
                      {template.channels.map(ch => (
                        <span key={ch} className="channel-badge">{ch}</span>
                      ))}
                    </div>
                    <div className="template-variables">
                      {template.variables.slice(0, 3).map(v => (
                        <span key={v} className="variable-badge">{`{{${v}}}`}</span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="variable-badge more">+{template.variables.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="automation-tab">
            <div className="automation-header">
              <div className="automation-info">
                <Sparkles size={16} />
                <span>Set up automated notification workflows based on triggers and conditions</span>
              </div>
              <button 
                className="add-rule-btn"
                onClick={() => {
                  setEditingRule({
                    id: '',
                    name: '',
                    trigger: 'custom',
                    conditions: [],
                    actions: [],
                    channels: ['email'],
                    recipients: ['member'],
                    isActive: true,
                    priority: 'medium'
                  });
                  setShowRuleEditor(true);
                }}
              >
                <Plus size={14} />
                New Rule
              </button>
            </div>
            
            <div className="automation-rules-list">
              {settings.automationRules.map(rule => (
                <div key={rule.id} className={`automation-rule-card ${!rule.isActive ? 'inactive' : ''}`}>
                  <div className="rule-card__header">
                    <div className="rule-card__title">
                      <Sparkles size={16} />
                      <span>{rule.name}</span>
                      <span className={`priority-badge priority-${rule.priority}`}>{rule.priority}</span>
                    </div>
                    <div className="rule-card__toggle">
                      <button
                        className={`rule-toggle ${rule.isActive ? 'active' : ''}`}
                        onClick={() => toggleRuleActive(rule.id)}
                      >
                        {rule.isActive ? <Play size={14} /> : <Pause size={14} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="rule-card__details">
                    <div className="rule-detail">
                      <span className="rule-detail__label">Trigger:</span>
                      <span className="rule-detail__value">{rule.trigger.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="rule-detail">
                      <span className="rule-detail__label">Conditions:</span>
                      <span className="rule-detail__value">{rule.conditions.join(', ') || 'None'}</span>
                    </div>
                    <div className="rule-detail">
                      <span className="rule-detail__label">Actions:</span>
                      <span className="rule-detail__value">{rule.actions.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="rule-card__footer">
                    <div className="rule-channels">
                      {rule.channels.map(ch => (
                        <span key={ch} className="channel-badge">{ch}</span>
                      ))}
                    </div>
                    <div className="rule-recipients">
                      {rule.recipients.map(r => (
                        <span key={r} className="recipient-badge">{r}</span>
                      ))}
                    </div>
                    <div className="rule-actions">
                      <button 
                        className="rule-action-btn"
                        onClick={() => {
                          setEditingRule(rule);
                          setShowRuleEditor(true);
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="rule-action-btn delete"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Alerts Tab */}
        {activeTab === 'system' && (
          <div className="system-alerts-tab">
            {/* Dashboard Settings */}
            <div className="form-group">
              <div className="form-group__header">
                <Activity size={16} />
                <h4 className="form-group__title">Dashboard Alert Settings</h4>
                <button
                  className={`policy-toggle ${settings.system.showDashboardAlerts ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'showDashboardAlerts', !settings.system.showDashboardAlerts)}
                />
              </div>
              
              {settings.system.showDashboardAlerts && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Alert Position</label>
                    <select
                      value={settings.system.alertPosition}
                      onChange={e => updateNestedSetting('system', 'alertPosition', e.target.value as any)}
                    >
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                  <div className="config-field">
                    <label>Alert Duration (seconds)</label>
                    <input
                      type="number"
                      value={settings.system.alertDuration}
                      onChange={e => updateNestedSetting('system', 'alertDuration', parseInt(e.target.value) || 0)}
                      min={1}
                      max={30}
                    />
                  </div>
                  <div className="config-field">
                    <label>Max Visible Alerts</label>
                    <input
                      type="number"
                      value={settings.system.maxVisibleAlerts}
                      onChange={e => updateNestedSetting('system', 'maxVisibleAlerts', parseInt(e.target.value) || 0)}
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Critical Alerts */}
            <div className="form-group">
              <div className="form-group__header">
                <AlertTriangle size={16} />
                <h4 className="form-group__title">Critical System Alerts</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Server Down</span>
                    <span className="policy-toggle-row__hint">Alert on server issues</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.serverDown ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'serverDown', !settings.system.serverDown)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Database Errors</span>
                    <span className="policy-toggle-row__hint">Alert on database issues</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.databaseError ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'databaseError', !settings.system.databaseError)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CreditCard size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Gateway Issues</span>
                    <span className="policy-toggle-row__hint">Alert on payment failures</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.paymentGatewayIssue ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'paymentGatewayIssue', !settings.system.paymentGatewayIssue)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Security Breach</span>
                    <span className="policy-toggle-row__hint">Alert suspicious activity</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.securityBreach ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'securityBreach', !settings.system.securityBreach)}
                />
              </div>
            </div>

            {/* Business Alerts */}
            <div className="form-group">
              <div className="form-group__header">
                <Activity size={16} />
                <h4 className="form-group__title">Business Activity Alerts</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">New Member Registration</span>
                    <span className="policy-toggle-row__hint">Alert new sign-ups</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.newMemberRegistration ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'newMemberRegistration', !settings.system.newMemberRegistration)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Membership Expiring</span>
                    <span className="policy-toggle-row__hint">Daily expiring memberships</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.membershipExpiring ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'membershipExpiring', !settings.system.membershipExpiring)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Received</span>
                    <span className="policy-toggle-row__hint">Alert successful payments</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.paymentReceived ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'paymentReceived', !settings.system.paymentReceived)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Failed</span>
                    <span className="policy-toggle-row__hint">Alert failed payments</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.paymentFailed ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'paymentFailed', !settings.system.paymentFailed)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><TrendingUp size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Low Attendance</span>
                    <span className="policy-toggle-row__hint">Alert low class attendance</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.lowAttendance ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'lowAttendance', !settings.system.lowAttendance)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Capacity Reached</span>
                    <span className="policy-toggle-row__hint">Alert gym at capacity</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.capacityReached ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'capacityReached', !settings.system.capacityReached)}
                />
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="form-group">
              <div className="form-group__header">
                <Settings size={16} />
                <h4 className="form-group__title">Inventory & Equipment</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertCircle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Low Stock Alert</span>
                    <span className="policy-toggle-row__hint">Alert when inventory is low</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.lowStock ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'lowStock', !settings.system.lowStock)}
                />
              </div>
              
              {settings.system.lowStock && (
                <div className="inline-config">
                  <label>Alert when stock below</label>
                  <input
                    type="number"
                    value={settings.system.lowStockThreshold}
                    onChange={e => updateNestedSetting('system', 'lowStockThreshold', parseInt(e.target.value) || 0)}
                    min={1}
                    className="inline-input"
                  />
                  <span>units</span>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Settings size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Equipment Maintenance</span>
                    <span className="policy-toggle-row__hint">Alert due maintenance</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.equipmentMaintenance ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'equipmentMaintenance', !settings.system.equipmentMaintenance)}
                />
              </div>
            </div>

            {/* Reports */}
            <div className="form-group">
              <div className="form-group__header">
                <FileText size={16} />
                <h4 className="form-group__title">Automated Reports</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Daily Summary</span>
                    <span className="policy-toggle-row__hint">End of day summary report</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.dailySummary ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'dailySummary', !settings.system.dailySummary)}
                />
              </div>
              
              {settings.system.dailySummary && (
                <div className="inline-config">
                  <label>Send at</label>
                  <input
                    type="time"
                    value={settings.system.dailySummaryTime}
                    onChange={e => updateNestedSetting('system', 'dailySummaryTime', e.target.value)}
                    className="inline-input time-input"
                  />
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Weekly Summary</span>
                    <span className="policy-toggle-row__hint">Weekly business overview</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.weeklySummary ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'weeklySummary', !settings.system.weeklySummary)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Monthly Summary</span>
                    <span className="policy-toggle-row__hint">Monthly performance report</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.monthlySummary ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'monthlySummary', !settings.system.monthlySummary)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog__header">
              <h3>Confirm Changes</h3>
              <button className="confirm-dialog__close" onClick={() => setShowConfirmDialog(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="confirm-dialog__body">
              <p>You are about to save the following changes:</p>
              <ul className="changes-list">
                {pendingChanges.map((change, i) => (
                  <li key={i}><CheckCircle2 size={14} /> {change}</li>
                ))}
              </ul>
            </div>
            <div className="confirm-dialog__actions">
              <button className="btn-cancel" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleConfirmSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {showTemplateEditor && editingTemplate && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog template-editor-dialog">
            <div className="confirm-dialog__header">
              <h3>{editingTemplate.id ? 'Edit Template' : 'New Template'}</h3>
              <button className="confirm-dialog__close" onClick={() => setShowTemplateEditor(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="confirm-dialog__body">
              <div className="template-editor">
                <div className="editor-field">
                  <label>Template Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="e.g., Welcome Email"
                  />
                </div>
                <div className="editor-field">
                  <label>Type</label>
                  <select
                    value={editingTemplate.type}
                    onChange={e => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                  >
                    <option value="welcome">Welcome</option>
                    <option value="payment_reminder">Payment Reminder</option>
                    <option value="class_reminder">Class Reminder</option>
                    <option value="birthday">Birthday</option>
                    <option value="expiry_reminder">Expiry Reminder</option>
                    <option value="promotional">Promotional</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="editor-field">
                  <label>Subject Line</label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    placeholder="e.g., Welcome to {{gym_name}}!"
                  />
                </div>
                <div className="editor-field">
                  <label>Message Body</label>
                  <textarea
                    value={editingTemplate.body}
                    onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                    rows={6}
                    placeholder="Write your message here. Use {{variable}} for dynamic content."
                  />
                </div>
                <div className="editor-field">
                  <label>Channels</label>
                  <div className="channel-selector">
                    {(['email', 'sms', 'push', 'whatsapp'] as NotificationChannel[]).map(ch => (
                      <button
                        key={ch}
                        className={`channel-option ${editingTemplate.channels.includes(ch) ? 'active' : ''}`}
                        onClick={() => {
                          const channels = editingTemplate.channels.includes(ch)
                            ? editingTemplate.channels.filter(c => c !== ch)
                            : [...editingTemplate.channels, ch];
                          setEditingTemplate({ ...editingTemplate, channels });
                        }}
                      >
                        {ch === 'email' && <Mail size={14} />}
                        {ch === 'sms' && <Smartphone size={14} />}
                        {ch === 'push' && <BellRing size={14} />}
                        {ch === 'whatsapp' && <MessageSquare size={14} />}
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="editor-field">
                  <label>Available Variables</label>
                  <div className="variables-list">
                    {['gym_name', 'member_name', 'amount', 'due_date', 'expiry_date', 'class_name', 'trainer_name', 'class_time'].map(v => (
                      <span 
                        key={v} 
                        className="variable-chip"
                        onClick={() => {
                          if (!editingTemplate.variables.includes(v)) {
                            setEditingTemplate({ ...editingTemplate, variables: [...editingTemplate.variables, v] });
                          }
                        }}
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="confirm-dialog__actions">
              <button className="btn-cancel" onClick={() => setShowTemplateEditor(false)}>
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => handleSaveTemplate(editingTemplate)}
                disabled={!editingTemplate.name || !editingTemplate.subject}
              >
                <Save size={16} />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automation Rule Editor Modal */}
      {showRuleEditor && editingRule && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog rule-editor-dialog">
            <div className="confirm-dialog__header">
              <h3>{editingRule.id ? 'Edit Automation Rule' : 'New Automation Rule'}</h3>
              <button className="confirm-dialog__close" onClick={() => setShowRuleEditor(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="confirm-dialog__body">
              <div className="rule-editor">
                <div className="editor-field">
                  <label>Rule Name</label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                    placeholder="e.g., Welcome New Members"
                  />
                </div>
                <div className="editor-field">
                  <label>Trigger Event</label>
                  <select
                    value={editingRule.trigger}
                    onChange={e => setEditingRule({ ...editingRule, trigger: e.target.value })}
                  >
                    <option value="member_registration">Member Registration</option>
                    <option value="payment_due">Payment Due</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="payment_failed">Payment Failed</option>
                    <option value="membership_expiring">Membership Expiring</option>
                    <option value="member_birthday">Member Birthday</option>
                    <option value="member_inactive">Member Inactive</option>
                    <option value="class_booked">Class Booked</option>
                    <option value="class_cancelled">Class Cancelled</option>
                    <option value="upcoming_session">Upcoming Session</option>
                    <option value="trainer_assigned">Trainer Assigned</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="editor-field">
                  <label>Priority</label>
                  <select
                    value={editingRule.priority}
                    onChange={e => setEditingRule({ ...editingRule, priority: e.target.value as NotificationPriority })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="editor-field">
                  <label>Channels</label>
                  <div className="channel-selector">
                    {(['email', 'sms', 'push', 'whatsapp', 'in_app'] as NotificationChannel[]).map(ch => (
                      <button
                        key={ch}
                        className={`channel-option ${editingRule.channels.includes(ch) ? 'active' : ''}`}
                        onClick={() => {
                          const channels = editingRule.channels.includes(ch)
                            ? editingRule.channels.filter(c => c !== ch)
                            : [...editingRule.channels, ch];
                          setEditingRule({ ...editingRule, channels });
                        }}
                      >
                        {ch === 'email' && <Mail size={14} />}
                        {ch === 'sms' && <Smartphone size={14} />}
                        {ch === 'push' && <BellRing size={14} />}
                        {ch === 'whatsapp' && <MessageSquare size={14} />}
                        {ch === 'in_app' && <MessageCircle size={14} />}
                        {ch.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="editor-field">
                  <label>Recipients</label>
                  <div className="recipient-selector">
                    {(['member', 'trainer', 'staff', 'admin'] as RecipientType[]).map(r => (
                      <button
                        key={r}
                        className={`recipient-option ${editingRule.recipients.includes(r) ? 'active' : ''}`}
                        onClick={() => {
                          const recipients = editingRule.recipients.includes(r)
                            ? editingRule.recipients.filter(rc => rc !== r)
                            : [...editingRule.recipients, r];
                          setEditingRule({ ...editingRule, recipients });
                        }}
                      >
                        {r === 'member' && <Users size={14} />}
                        {r === 'trainer' && <GraduationCap size={14} />}
                        {r === 'staff' && <UserCheck size={14} />}
                        {r === 'admin' && <Shield size={14} />}
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="confirm-dialog__actions">
              <button className="btn-cancel" onClick={() => setShowRuleEditor(false)}>
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => handleSaveRule(editingRule)}
                disabled={!editingRule.name || !editingRule.trigger}
              >
                <Save size={16} />
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSection"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "react-hot-toast"
import { 
  Bell, Save, Loader2, Mail, Smartphone, MessageSquare, Clock, Calendar,
  AlertCircle, CheckCircle2, CreditCard, Zap, Users, GraduationCap, UserCheck,
  Settings, FileText, Send, Gift, Megaphone, Shield, Activity, Target,
  BellRing, MessageCircle, ChevronRight, Plus, Trash2, Edit3, Copy,
  Play, Pause, ToggleLeft, ToggleRight, Sparkles, Heart, Star, TrendingUp,
  AlertTriangle, Info, X, Check, RefreshCw, Eye, Volume2, VolumeX, Award
} from "lucide-react"
import api from "../../../services/api"

// Types
type NotificationChannel = 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
type RecipientType = 'member' | 'trainer' | 'staff' | 'admin' | 'all';

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  channels: NotificationChannel[];
  variables: string[];
  isActive: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  channels: NotificationChannel[];
  recipients: RecipientType[];
  isActive: boolean;
  priority: NotificationPriority;
}

interface ChannelSettings {
  email: {
    enabled: boolean;
    provider: string;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    dailyLimit: number;
    footerText: string;
  };
  sms: {
    enabled: boolean;
    provider: string;
    senderId: string;
    dailyLimit: number;
    optOutMessage: string;
  };
  push: {
    enabled: boolean;
    icon: string;
    badge: boolean;
    sound: boolean;
    vibrate: boolean;
  };
  whatsapp: {
    enabled: boolean;
    businessNumber: string;
    apiKey: string;
  };
  inApp: {
    enabled: boolean;
    showBadge: boolean;
    playSound: boolean;
    autoMarkRead: number;
    retentionDays: number;
  };
}

interface MemberNotificationSettings {
  welcomeMessage: boolean;
  welcomeChannels: NotificationChannel[];
  orientationReminder: boolean;
  profileCompletionReminder: boolean;
  renewalReminder: boolean;
  renewalReminderDays: number[];
  expiryAlert: boolean;
  expiryAlertDays: number[];
  membershipUpgradePromo: boolean;
  paymentConfirmation: boolean;
  paymentReminder: boolean;
  paymentReminderDays: number[];
  paymentFailed: boolean;
  invoiceGenerated: boolean;
  classBookingConfirmation: boolean;
  classReminder: boolean;
  classReminderHours: number;
  classCancellation: boolean;
  waitlistUpdate: boolean;
  trainerAssignment: boolean;
  birthdayWish: boolean;
  birthdayOffer: boolean;
  anniversaryWish: boolean;
  inactivityReminder: boolean;
  inactivityDays: number;
  achievementUnlocked: boolean;
  milestoneReached: boolean;
  promotionalOffers: boolean;
  referralUpdates: boolean;
  loyaltyPointsUpdate: boolean;
  newClassAnnouncement: boolean;
  loginAlert: boolean;
  passwordChanged: boolean;
  profileUpdated: boolean;
  emergencyContactReminder: boolean;
}

interface StaffNotificationSettings {
  shiftReminder: boolean;
  shiftReminderHours: number;
  shiftChange: boolean;
  clockInReminder: boolean;
  overtimeAlert: boolean;
  taskAssignment: boolean;
  taskDeadline: boolean;
  taskDeadlineHours: number;
  performanceReview: boolean;
  targetAchieved: boolean;
  feedbackReceived: boolean;
  leaveApproval: boolean;
  leaveReminder: boolean;
  teamAnnouncement: boolean;
  policyUpdate: boolean;
  meetingReminder: boolean;
  meetingReminderHours: number;
  salaryProcessed: boolean;
  payslipAvailable: boolean;
}

interface TrainerNotificationSettings {
  newClientAssigned: boolean;
  clientCancellation: boolean;
  clientNoShow: boolean;
  clientFeedback: boolean;
  clientMilestone: boolean;
  sessionReminder: boolean;
  sessionReminderHours: number;
  scheduleChange: boolean;
  availabilityRequest: boolean;
  classReminder: boolean;
  classReminderHours: number;
  lowAttendanceAlert: boolean;
  classFullAlert: boolean;
  monthlyReport: boolean;
  ratingUpdate: boolean;
  bonusEarned: boolean;
  certificationExpiry: boolean;
  certificationExpiryDays: number[];
  trainingOpportunity: boolean;
}

interface SystemAlertSettings {
  showDashboardAlerts: boolean;
  alertPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  alertDuration: number;
  maxVisibleAlerts: number;
  serverDown: boolean;
  databaseError: boolean;
  paymentGatewayIssue: boolean;
  securityBreach: boolean;
  newMemberRegistration: boolean;
  membershipExpiring: boolean;
  paymentReceived: boolean;
  paymentFailed: boolean;
  lowAttendance: boolean;
  capacityReached: boolean;
  lowStock: boolean;
  lowStockThreshold: number;
  equipmentMaintenance: boolean;
  dailySummary: boolean;
  dailySummaryTime: string;
  weeklySummary: boolean;
  monthlySummary: boolean;
  adminEmailRecipients: string[];
  urgentAlertPhone: string;
}

interface NotificationSettings {
  channels: ChannelSettings;
  member: MemberNotificationSettings;
  staff: StaffNotificationSettings;
  trainer: TrainerNotificationSettings;
  system: SystemAlertSettings;
  templates: NotificationTemplate[];
  automationRules: AutomationRule[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    excludeUrgent: boolean;
  };
  globalSettings: {
    timezone: string;
    language: string;
    unsubscribeLink: boolean;
    trackOpens: boolean;
    trackClicks: boolean;
  };
}

// Default templates
const defaultTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    type: 'welcome',
    subject: 'Welcome to {{gym_name}}, {{member_name}}!',
    body: 'Hi {{member_name}},\
\
Welcome to {{gym_name}}! We\'re excited to have you join our fitness family.\n\
Your membership starts on {{start_date}} and is valid until {{end_date}}.\
\nBest regards,\
{{gym_name}} Team',
    channels: ['email'],
    variables: ['gym_name', 'member_name', 'start_date', 'end_date'],
    isActive: true
  },
  {
    id: '2',
    name: 'Payment Reminder',
    type: 'payment_reminder',
    subject: 'Payment Due in {{days}} Days - {{gym_name}}',
    body: 'Hi {{member_name}},\
\
This is a friendly reminder that your payment of {{amount}} is due on {{due_date}}.\
\nPlease ensure timely payment to continue enjoying our services.\
\
Best regards,\
{{gym_name}} Team',
    channels: ['email', 'sms'],
    variables: ['member_name', 'gym_name', 'amount', 'due_date', 'days'],
    isActive: true
  },
  {
    id: '3',
    name: 'Class Reminder',
    type: 'class_reminder',
    subject: 'Reminder: {{class_name}} in {{hours}} hours',
    body: 'Hi {{member_name}},\
\
Just a reminder that you have {{class_name}} with {{trainer_name}} at {{class_time}} today.\
\
See you there!',
    channels: ['push', 'sms'],
    variables: ['member_name', 'class_name', 'trainer_name', 'class_time', 'hours'],
    isActive: true
  },
  {
    id: '4',
    name: 'Birthday Wish',
    type: 'birthday',
    subject: 'Happy Birthday, {{member_name}}! 🎂',
    body: 'Dear {{member_name}},\
\
Wishing you a very Happy Birthday from everyone at {{gym_name}}!\
\
As a special gift, enjoy {{offer_details}}.\
\
Have a fantastic day!',
    channels: ['email', 'sms', 'push'],
    variables: ['member_name', 'gym_name', 'offer_details'],
    isActive: true
  },
  {
    id: '5',
    name: 'Membership Expiry',
    type: 'expiry_reminder',
    subject: 'Your Membership Expires in {{days}} Days',
    body: 'Hi {{member_name}},\
\nYour {{membership_type}} membership at {{gym_name}} will expire on {{expiry_date}}.\
\
Renew now to continue your fitness journey with us!\n\
Renewal Amount: {{renewal_amount}}',
    channels: ['email', 'sms'],
    variables: ['member_name', 'gym_name', 'membership_type', 'expiry_date', 'days', 'renewal_amount'],
    isActive: true
  }
];

// Default automation rules
const defaultAutomationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Welcome New Members',
    trigger: 'member_registration',
    conditions: ['membership_confirmed'],
    actions: ['send_welcome_email', 'create_orientation_task'],
    channels: ['email', 'push'],
    recipients: ['member'],
    isActive: true,
    priority: 'high'
  },
  {
    id: '2',
    name: 'Payment Reminder Sequence',
    trigger: 'payment_due',
    conditions: ['days_before:7', 'days_before:3', 'days_before:1'],
    actions: ['send_payment_reminder'],
    channels: ['email', 'sms'],
    recipients: ['member'],
    isActive: true,
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Inactivity Re-engagement',
    trigger: 'member_inactive',
    conditions: ['inactive_days:14'],
    actions: ['send_reengagement_email', 'offer_discount'],
    channels: ['email', 'push'],
    recipients: ['member'],
    isActive: true,
    priority: 'low'
  },
  {
    id: '4',
    name: 'Birthday Automation',
    trigger: 'member_birthday',
    conditions: ['on_birthday'],
    actions: ['send_birthday_wish', 'apply_birthday_offer'],
    channels: ['email', 'sms', 'push'],
    recipients: ['member'],
    isActive: true,
    priority: 'medium'
  },
  {
    id: '5',
    name: 'Trainer Session Reminder',
    trigger: 'upcoming_session',
    conditions: ['hours_before:24', 'hours_before:2'],
    actions: ['send_session_reminder'],
    channels: ['push', 'sms'],
    recipients: ['member', 'trainer'],
    isActive: true,
    priority: 'high'
  }
];

const getDefaultSettings = (): NotificationSettings => ({
  channels: {
    email: {
      enabled: true,
      provider: 'smtp',
      fromName: 'Gym Management',
      fromEmail: 'noreply@gym.com',
      replyTo: 'support@gym.com',
      dailyLimit: 1000,
      footerText: '© 2024 Gym Management. All rights reserved.'
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      senderId: 'GYMFIT',
      dailyLimit: 500,
      optOutMessage: 'Reply STOP to unsubscribe'
    },
    push: {
      enabled: true,
      icon: '/icon.png',
      badge: true,
      sound: true,
      vibrate: true
    },
    whatsapp: {
      enabled: false,
      businessNumber: '',
      apiKey: ''
    },
    inApp: {
      enabled: true,
      showBadge: true,
      playSound: false,
      autoMarkRead: 30,
      retentionDays: 30
    }
  },
  member: {
    welcomeMessage: true,
    welcomeChannels: ['email', 'push'],
    orientationReminder: true,
    profileCompletionReminder: true,
    renewalReminder: true,
    renewalReminderDays: [7, 3, 1],
    expiryAlert: true,
    expiryAlertDays: [7, 3, 1],
    membershipUpgradePromo: true,
    paymentConfirmation: true,
    paymentReminder: true,
    paymentReminderDays: [7, 3, 1],
    paymentFailed: true,
    invoiceGenerated: true,
    classBookingConfirmation: true,
    classReminder: true,
    classReminderHours: 2,
    classCancellation: true,
    waitlistUpdate: true,
    trainerAssignment: true,
    birthdayWish: true,
    birthdayOffer: true,
    anniversaryWish: true,
    inactivityReminder: true,
    inactivityDays: 14,
    achievementUnlocked: true,
    milestoneReached: true,
    promotionalOffers: true,
    referralUpdates: true,
    loyaltyPointsUpdate: true,
    newClassAnnouncement: true,
    loginAlert: false,
    passwordChanged: true,
    profileUpdated: false,
    emergencyContactReminder: true
  },
  staff: {
    shiftReminder: true,
    shiftReminderHours: 12,
    shiftChange: true,
    clockInReminder: true,
    overtimeAlert: true,
    taskAssignment: true,
    taskDeadline: true,
    taskDeadlineHours: 24,
    performanceReview: true,
    targetAchieved: true,
    feedbackReceived: true,
    leaveApproval: true,
    leaveReminder: true,
    teamAnnouncement: true,
    policyUpdate: true,
    meetingReminder: true,
    meetingReminderHours: 1,
    salaryProcessed: true,
    payslipAvailable: true
  },
  trainer: {
    newClientAssigned: true,
    clientCancellation: true,
    clientNoShow: true,
    clientFeedback: true,
    clientMilestone: true,
    sessionReminder: true,
    sessionReminderHours: 2,
    scheduleChange: true,
    availabilityRequest: true,
    classReminder: true,
    classReminderHours: 1,
    lowAttendanceAlert: true,
    classFullAlert: true,
    monthlyReport: true,
    ratingUpdate: true,
    bonusEarned: true,
    certificationExpiry: true,
    certificationExpiryDays: [30, 14, 7],
    trainingOpportunity: true
  },
  system: {
    showDashboardAlerts: true,
    alertPosition: 'top-right',
    alertDuration: 5,
    maxVisibleAlerts: 5,
    serverDown: true,
    databaseError: true,
    paymentGatewayIssue: true,
    securityBreach: true,
    newMemberRegistration: true,
    membershipExpiring: true,
    paymentReceived: true,
    paymentFailed: true,
    lowAttendance: true,
    capacityReached: true,
    lowStock: true,
    lowStockThreshold: 10,
    equipmentMaintenance: true,
    dailySummary: true,
    dailySummaryTime: '20:00',
    weeklySummary: true,
    monthlySummary: true,
    adminEmailRecipients: [],
    urgentAlertPhone: ''
  },
  templates: defaultTemplates,
  automationRules: defaultAutomationRules,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    excludeUrgent: true
  },
  globalSettings: {
    timezone: 'Asia/Kolkata',
    language: 'en',
    unsubscribeLink: true,
    trackOpens: true,
    trackClicks: true
  }
});

type TabType = 'channels' | 'member' | 'staff' | 'templates' | 'automation' | 'system';

const NotificationsSection: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>(getDefaultSettings());
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('channels');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);
  
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'channels', label: 'Channels', icon: <Zap size={14} /> },
    { id: 'member', label: 'Members', icon: <Users size={14} /> },
    { id: 'staff', label: 'Staff & Trainers', icon: <UserCheck size={14} /> },
    { id: 'templates', label: 'Templates', icon: <FileText size={14} /> },
    { id: 'automation', label: 'Automation', icon: <Sparkles size={14} /> },
    { id: 'system', label: 'System Alerts', icon: <Bell size={14} /> },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/gym');
      if (response.data) {
        const fetched = response.data;
        const mergedSettings = {
          ...getDefaultSettings(),
          ...fetched.notificationSettings
        };
        setSettings(mergedSettings);
        setOriginalSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      setOriginalSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const detectChanges = useCallback((newSettings: NotificationSettings) => {
    if (!originalSettings) return [];
    const changes: string[] = [];
    
    Object.keys(newSettings.channels).forEach((channel) => {
      const key = channel as keyof ChannelSettings;
      if (JSON.stringify(newSettings.channels[key]) !== JSON.stringify(originalSettings.channels[key])) {
        changes.push(`${channel.charAt(0).toUpperCase() + channel.slice(1)} channel settings modified`);
      }
    });
    
    if (JSON.stringify(newSettings.member) !== JSON.stringify(originalSettings.member)) {
      changes.push('Member notification preferences updated');
    }
    
    if (JSON.stringify(newSettings.staff) !== JSON.stringify(originalSettings.staff)) {
      changes.push('Staff notification preferences updated');
    }
    
    if (JSON.stringify(newSettings.trainer) !== JSON.stringify(originalSettings.trainer)) {
      changes.push('Trainer notification preferences updated');
    }
    
    if (JSON.stringify(newSettings.system) !== JSON.stringify(originalSettings.system)) {
      changes.push('System alert settings updated');
    }
    
    if (JSON.stringify(newSettings.templates) !== JSON.stringify(originalSettings.templates)) {
      changes.push('Notification templates modified');
    }
    
    if (JSON.stringify(newSettings.automationRules) !== JSON.stringify(originalSettings.automationRules)) {
      changes.push('Automation rules modified');
    }
    
    return changes;
  }, [originalSettings]);

  const updateSettings = useCallback(<K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      const changes = detectChanges(updated);
      setHasChanges(changes.length > 0);
      setPendingChanges(changes);
      return updated;
    });
  }, [detectChanges]);

  const updateNestedSetting = useCallback(<
    K extends keyof NotificationSettings,
    NK extends keyof NotificationSettings[K]
  >(
    parentKey: K,
    nestedKey: NK,
    value: NotificationSettings[K][NK]
  ) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [nestedKey]: value
        }
      };
      const changes = detectChanges(updated);
      setHasChanges(changes.length > 0);
      setPendingChanges(changes);
      return updated;
    });
  }, [detectChanges]);

  const handleSaveClick = () => {
    if (pendingChanges.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings/gym', { notificationSettings: settings });
      setOriginalSettings(settings);
      setHasChanges(false);
      setPendingChanges([]);
      setShowConfirmDialog(false);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = (template: NotificationTemplate) => {
    const templates = [...settings.templates];
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push({ ...template, id: Date.now().toString() });
    }
    updateSettings('templates', templates);
    setShowTemplateEditor(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    const templates = settings.templates.filter(t => t.id !== id);
    updateSettings('templates', templates);
  };

  const handleSaveRule = (rule: AutomationRule) => {
    const rules = [...settings.automationRules];
    const index = rules.findIndex(r => r.id === rule.id);
    if (index >= 0) {
      rules[index] = rule;
    } else {
      rules.push({ ...rule, id: Date.now().toString() });
    }
    updateSettings('automationRules', rules);
    setShowRuleEditor(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    const rules = settings.automationRules.filter(r => r.id !== id);
    updateSettings('automationRules', rules);
  };

  const toggleRuleActive = (id: string) => {
    const rules = settings.automationRules.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    );
    updateSettings('automationRules', rules);
  };

  if (loading) {
    return (
      <div className="settings-section">
        <div className="settings-loading">
          <Loader2 className="spin" size={24} />
          <span>Loading notification settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div className="settings-section__title-group">
          <div className="settings-section__icon">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="settings-section__title">Notifications & Alerts</h2>
            <p className="settings-section__description">
              Manage all notification channels, templates and automation rules
            </p>
          </div>
        </div>
        {hasChanges && (
          <button 
            className="settings-save-btn"
            onClick={handleSaveClick}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="settings-tabs-wrapper">
        <div className="settings-tabs">
          {tabs.map(tab => (
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
      </div>

      <div className="settings-section__content">
        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="notification-channels-tab">
            {/* Email Channel */}
            <div className="form-group">
              <div className="form-group__header">
                <Mail size={16} />
                <h4 className="form-group__title">Email Notifications</h4>
                <button
                  className={`policy-toggle ${settings.channels.email.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'email', {
                    ...settings.channels.email,
                    enabled: !settings.channels.email.enabled
                  })}
                />
              </div>
              
              {settings.channels.email.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>From Name</label>
                    <input
                      type="text"
                      value={settings.channels.email.fromName}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        fromName: e.target.value
                      })}
                      placeholder="Gym Name"
                    />
                  </div>
                  <div className="config-field">
                    <label>From Email</label>
                    <input
                      type="email"
                      value={settings.channels.email.fromEmail}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        fromEmail: e.target.value
                      })}
                      placeholder="noreply@gym.com"
                    />
                  </div>
                  <div className="config-field">
                    <label>Reply To</label>
                    <input
                      type="email"
                      value={settings.channels.email.replyTo}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        replyTo: e.target.value
                      })}
                      placeholder="support@gym.com"
                    />
                  </div>
                  <div className="config-field">
                    <label>Daily Limit</label>
                    <input
                      type="number"
                      value={settings.channels.email.dailyLimit}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        dailyLimit: parseInt(e.target.value) || 0
                      })}
                      min={0}
                    />
                  </div>
                  <div className="config-field config-field--full">
                    <label>Email Footer Text</label>
                    <textarea
                      value={settings.channels.email.footerText}
                      onChange={e => updateNestedSetting('channels', 'email', {
                        ...settings.channels.email,
                        footerText: e.target.value
                      })}
                      rows={2}
                      placeholder="Footer text for all emails..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SMS Channel */}
            <div className="form-group">
              <div className="form-group__header">
                <Smartphone size={16} />
                <h4 className="form-group__title">SMS Notifications</h4>
                <button
                  className={`policy-toggle ${settings.channels.sms.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'sms', {
                    ...settings.channels.sms,
                    enabled: !settings.channels.sms.enabled
                  })}
                />
              </div>
              
              {settings.channels.sms.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Provider</label>
                    <select
                      value={settings.channels.sms.provider}
                      onChange={e => updateNestedSetting('channels', 'sms', {
                        ...settings.channels.sms,
                        provider: e.target.value
                      })}
                    >
                      <option value="twilio">Twilio</option>
                      <option value="messagebird">MessageBird</option>
                      <option value="nexmo">Nexmo</option>
                      <option value="custom">Custom API</option>
                    </select>
                  </div>
                  <div className="config-field">
                    <label>Sender ID</label>
                    <input
                      type="text"
                      value={settings.channels.sms.senderId}
                      onChange={e => updateNestedSetting('channels', 'sms', {
                        ...settings.channels.sms,
                        senderId: e.target.value
                      })}
                      placeholder="GYMFIT"
                      maxLength={11}
                    />
                  </div>
                  <div className="config-field">
                    <label>Daily Limit</label>
                    <input
                      type="number"
                      value={settings.channels.sms.dailyLimit}
                      onChange={e => updateNestedSetting('channels', 'sms', {
                        ...settings.channels.sms,
                        dailyLimit: parseInt(e.target.value) || 0
                      })}
                      min={0}
                    />
                  </div>
                  <div className="config-field">
                    <label>Opt-out Message</label>
                    <input
                      type="text"
                      value={settings.channels.sms.optOutMessage}
                      onChange={e => updateNestedSetting('channels', 'sms', {
                        ...settings.channels.sms,
                        optOutMessage: e.target.value
                      })}
                      placeholder="Reply STOP to unsubscribe"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Push Notifications */}
            <div className="form-group">
              <div className="form-group__header">
                <BellRing size={16} />
                <h4 className="form-group__title">Push Notifications</h4>
                <button
                  className={`policy-toggle ${settings.channels.push.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'push', {
                    ...settings.channels.push,
                    enabled: !settings.channels.push.enabled
                  })}
                />
              </div>
              
              {settings.channels.push.enabled && (
                <div className="push-options">
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Eye size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Show Badge Count</span>
                        <span className="policy-toggle-row__hint">Display unread count on app icon</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.push.badge ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'push', {
                        ...settings.channels.push,
                        badge: !settings.channels.push.badge
                      })}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Volume2 size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Notification Sound</span>
                        <span className="policy-toggle-row__hint">Play sound for new notifications</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.push.sound ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'push', {
                        ...settings.channels.push,
                        sound: !settings.channels.push.sound
                      })}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Activity size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Vibration</span>
                        <span className="policy-toggle-row__hint">Vibrate device on notification</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.push.vibrate ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'push', {
                        ...settings.channels.push,
                        vibrate: !settings.channels.push.vibrate
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div className="form-group">
              <div className="form-group__header">
                <MessageSquare size={16} />
                <h4 className="form-group__title">WhatsApp Business</h4>
                <button
                  className={`policy-toggle ${settings.channels.whatsapp.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'whatsapp', {
                    ...settings.channels.whatsapp,
                    enabled: !settings.channels.whatsapp.enabled
                  })}
                />
              </div>
              
              {settings.channels.whatsapp.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Business Phone Number</label>
                    <input
                      type="tel"
                      value={settings.channels.whatsapp.businessNumber}
                      onChange={e => updateNestedSetting('channels', 'whatsapp', {
                        ...settings.channels.whatsapp,
                        businessNumber: e.target.value
                      })}
                      placeholder="+91XXXXXXXXXX"
                    />
                  </div>
                  <div className="config-field">
                    <label>API Key</label>
                    <input
                      type="password"
                      value={settings.channels.whatsapp.apiKey}
                      onChange={e => updateNestedSetting('channels', 'whatsapp', {
                        ...settings.channels.whatsapp,
                        apiKey: e.target.value
                      })}
                      placeholder="Enter WhatsApp Business API key"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* In-App Notifications */}
            <div className="form-group">
              <div className="form-group__header">
                <MessageCircle size={16} />
                <h4 className="form-group__title">In-App Notifications</h4>
                <button
                  className={`policy-toggle ${settings.channels.inApp.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('channels', 'inApp', {
                    ...settings.channels.inApp,
                    enabled: !settings.channels.inApp.enabled
                  })}
                />
              </div>
              
              {settings.channels.inApp.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Auto Mark as Read (seconds)</label>
                    <input
                      type="number"
                      value={settings.channels.inApp.autoMarkRead}
                      onChange={e => updateNestedSetting('channels', 'inApp', {
                        ...settings.channels.inApp,
                        autoMarkRead: parseInt(e.target.value) || 0
                      })}
                      min={0}
                      placeholder="0 to disable"
                    />
                  </div>
                  <div className="config-field">
                    <label>Retention Days</label>
                    <input
                      type="number"
                      value={settings.channels.inApp.retentionDays}
                      onChange={e => updateNestedSetting('channels', 'inApp', {
                        ...settings.channels.inApp,
                        retentionDays: parseInt(e.target.value) || 30
                      })}
                      min={1}
                      max={365}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Eye size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Show Badge</span>
                        <span className="policy-toggle-row__hint">Show notification count badge</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.inApp.showBadge ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'inApp', {
                        ...settings.channels.inApp,
                        showBadge: !settings.channels.inApp.showBadge
                      })}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><Volume2 size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Play Sound</span>
                        <span className="policy-toggle-row__hint">Audio alert for new notifications</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.channels.inApp.playSound ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateNestedSetting('channels', 'inApp', {
                        ...settings.channels.inApp,
                        playSound: !settings.channels.inApp.playSound
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quiet Hours */}
            <div className="form-group">
              <div className="form-group__header">
                <VolumeX size={16} />
                <h4 className="form-group__title">Quiet Hours</h4>
                <button
                  className={`policy-toggle ${settings.quietHours.enabled ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateSettings('quietHours', {
                    ...settings.quietHours,
                    enabled: !settings.quietHours.enabled
                  })}
                />
              </div>
              
              {settings.quietHours.enabled && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={e => updateSettings('quietHours', {
                        ...settings.quietHours,
                        start: e.target.value
                      })}
                    />
                  </div>
                  <div className="config-field">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={e => updateSettings('quietHours', {
                        ...settings.quietHours,
                        end: e.target.value
                      })}
                    />
                  </div>
                  <div className="policy-toggle-row">
                    <div className="policy-toggle-row__info">
                      <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                      <div className="policy-toggle-row__text">
                        <span className="policy-toggle-row__label">Exclude Urgent</span>
                        <span className="policy-toggle-row__hint">Still send urgent notifications during quiet hours</span>
                      </div>
                    </div>
                    <button
                      className={`policy-toggle ${settings.quietHours.excludeUrgent ? 'policy-toggle--active' : ''}`}
                      onClick={() => updateSettings('quietHours', {
                        ...settings.quietHours,
                        excludeUrgent: !settings.quietHours.excludeUrgent
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Member Notifications Tab */}
        {activeTab === 'member' && (
          <div className="member-notifications-tab">
            {/* Onboarding */}
            <div className="form-group">
              <div className="form-group__header">
                <Sparkles size={16} />
                <h4 className="form-group__title">Onboarding & Welcome</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Mail size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Welcome Message</span>
                    <span className="policy-toggle-row__hint">Send welcome email/SMS on registration</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.welcomeMessage ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'welcomeMessage', !settings.member.welcomeMessage)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Orientation Reminder</span>
                    <span className="policy-toggle-row__hint">Remind new members about gym orientation</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.orientationReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'orientationReminder', !settings.member.orientationReminder)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Profile Completion</span>
                    <span className="policy-toggle-row__hint">Remind to complete profile details</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.profileCompletionReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'profileCompletionReminder', !settings.member.profileCompletionReminder)}
                />
              </div>
            </div>

            {/* Membership */}
            <div className="form-group">
              <div className="form-group__header">
                <CreditCard size={16} />
                <h4 className="form-group__title">Membership & Renewals</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><RefreshCw size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Renewal Reminders</span>
                    <span className="policy-toggle-row__hint">Remind before membership renewal date</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.renewalReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'renewalReminder', !settings.member.renewalReminder)}
                />
              </div>
              
              {settings.member.renewalReminder && (
                <div className="reminder-days-config">
                  <label>Reminder Days Before</label>
                  <div className="reminder-days-chips">
                    {[30, 14, 7, 3, 1].map(day => (
                      <button
                        key={day}
                        className={`reminder-day-chip ${settings.member.renewalReminderDays.includes(day) ? 'active' : ''}`}
                        onClick={() => {
                          const days = settings.member.renewalReminderDays.includes(day)
                            ? settings.member.renewalReminderDays.filter(d => d !== day)
                            : [...settings.member.renewalReminderDays, day].sort((a, b) => b - a);
                          updateNestedSetting('member', 'renewalReminderDays', days);
                        }}
                      >
                        {day}d
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertCircle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Expiry Alert</span>
                    <span className="policy-toggle-row__hint">Alert when membership is about to expire</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.expiryAlert ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'expiryAlert', !settings.member.expiryAlert)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><TrendingUp size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Upgrade Promotions</span>
                    <span className="policy-toggle-row__hint">Send membership upgrade offers</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.membershipUpgradePromo ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'membershipUpgradePromo', !settings.member.membershipUpgradePromo)}
                />
              </div>
            </div>

            {/* Payments */}
            <div className="form-group">
              <div className="form-group__header">
                <CreditCard size={16} />
                <h4 className="form-group__title">Payment Notifications</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Confirmation</span>
                    <span className="policy-toggle-row__hint">Confirm when payment is received</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.paymentConfirmation ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'paymentConfirmation', !settings.member.paymentConfirmation)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Reminders</span>
                    <span className="policy-toggle-row__hint">Remind about upcoming payments</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.paymentReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'paymentReminder', !settings.member.paymentReminder)}
                />
              </div>
              
              {settings.member.paymentReminder && (
                <div className="reminder-days-config">
                  <label>Reminder Days Before</label>
                  <div className="reminder-days-chips">
                    {[14, 7, 3, 1].map(day => (
                      <button
                        key={day}
                        className={`reminder-day-chip ${settings.member.paymentReminderDays.includes(day) ? 'active' : ''}`}
                        onClick={() => {
                          const days = settings.member.paymentReminderDays.includes(day)
                            ? settings.member.paymentReminderDays.filter(d => d !== day)
                            : [...settings.member.paymentReminderDays, day].sort((a, b) => b - a);
                          updateNestedSetting('member', 'paymentReminderDays', days);
                        }}
                      >
                        {day}d
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Failed</span>
                    <span className="policy-toggle-row__hint">Notify when auto-payment fails</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.paymentFailed ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'paymentFailed', !settings.member.paymentFailed)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Invoice Generated</span>
                    <span className="policy-toggle-row__hint">Send invoice when generated</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.invoiceGenerated ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'invoiceGenerated', !settings.member.invoiceGenerated)}
                />
              </div>
            </div>

            {/* Classes & Bookings */}
            <div className="form-group">
              <div className="form-group__header">
                <Calendar size={16} />
                <h4 className="form-group__title">Classes & Bookings</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Booking Confirmation</span>
                    <span className="policy-toggle-row__hint">Confirm class bookings</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.classBookingConfirmation ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'classBookingConfirmation', !settings.member.classBookingConfirmation)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Class Reminders</span>
                    <span className="policy-toggle-row__hint">Remind before scheduled class</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.classReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'classReminder', !settings.member.classReminder)}
                />
              </div>
              
              {settings.member.classReminder && (
                <div className="inline-config">
                  <label>Remind</label>
                  <input
                    type="number"
                    value={settings.member.classReminderHours}
                    onChange={e => updateNestedSetting('member', 'classReminderHours', parseInt(e.target.value) || 0)}
                    min={1}
                    max={48}
                    className="inline-input"
                  />
                  <span>hours before</span>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><X size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Class Cancellation</span>
                    <span className="policy-toggle-row__hint">Notify when class is cancelled</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.classCancellation ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'classCancellation', !settings.member.classCancellation)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Waitlist Updates</span>
                    <span className="policy-toggle-row__hint">Notify when spot becomes available</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.waitlistUpdate ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'waitlistUpdate', !settings.member.waitlistUpdate)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><GraduationCap size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Trainer Assignment</span>
                    <span className="policy-toggle-row__hint">Notify when trainer is assigned</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.trainerAssignment ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'trainerAssignment', !settings.member.trainerAssignment)}
                />
              </div>
            </div>

            {/* Engagement */}
            <div className="form-group">
              <div className="form-group__header">
                <Heart size={16} />
                <h4 className="form-group__title">Engagement & Milestones</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Gift size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Birthday Wishes</span>
                    <span className="policy-toggle-row__hint">Send birthday greetings</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.birthdayWish ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'birthdayWish', !settings.member.birthdayWish)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Gift size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Birthday Offers</span>
                    <span className="policy-toggle-row__hint">Send special offers on birthday</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.birthdayOffer ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'birthdayOffer', !settings.member.birthdayOffer)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Star size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Anniversary Wishes</span>
                    <span className="policy-toggle-row__hint">Celebrate membership anniversaries</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.anniversaryWish ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'anniversaryWish', !settings.member.anniversaryWish)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Activity size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Inactivity Reminder</span>
                    <span className="policy-toggle-row__hint">Re-engage inactive members</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.inactivityReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'inactivityReminder', !settings.member.inactivityReminder)}
                />
              </div>
              
              {settings.member.inactivityReminder && (
                <div className="inline-config">
                  <label>After</label>
                  <input
                    type="number"
                    value={settings.member.inactivityDays}
                    onChange={e => updateNestedSetting('member', 'inactivityDays', parseInt(e.target.value) || 0)}
                    min={1}
                    max={90}
                    className="inline-input"
                  />
                  <span>days of inactivity</span>
                </div>
              )}
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Award size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Achievements Unlocked</span>
                    <span className="policy-toggle-row__hint">Notify fitness achievements</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.achievementUnlocked ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'achievementUnlocked', !settings.member.achievementUnlocked)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Target size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Milestones Reached</span>
                    <span className="policy-toggle-row__hint">Celebrate workout milestones</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.milestoneReached ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'milestoneReached', !settings.member.milestoneReached)}
                />
              </div>
            </div>

            {/* Promotions */}
            <div className="form-group">
              <div className="form-group__header">
                <Megaphone size={16} />
                <h4 className="form-group__title">Promotions & Updates</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Megaphone size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Promotional Offers</span>
                    <span className="policy-toggle-row__hint">Send promotional messages</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.promotionalOffers ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'promotionalOffers', !settings.member.promotionalOffers)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Referral Updates</span>
                    <span className="policy-toggle-row__hint">Notify referral program activity</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.referralUpdates ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'referralUpdates', !settings.member.referralUpdates)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Star size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Loyalty Points</span>
                    <span className="policy-toggle-row__hint">Update on points earned/redeemed</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.loyaltyPointsUpdate ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'loyaltyPointsUpdate', !settings.member.loyaltyPointsUpdate)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">New Class Announcements</span>
                    <span className="policy-toggle-row__hint">Announce new classes</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.newClassAnnouncement ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'newClassAnnouncement', !settings.member.newClassAnnouncement)}
                />
              </div>
            </div>

            {/* Account Security */}
            <div className="form-group">
              <div className="form-group__header">
                <Shield size={16} />
                <h4 className="form-group__title">Account & Security</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Login Alerts</span>
                    <span className="policy-toggle-row__hint">Alert on new device login</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.loginAlert ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'loginAlert', !settings.member.loginAlert)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Password Changed</span>
                    <span className="policy-toggle-row__hint">Confirm password changes</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.passwordChanged ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'passwordChanged', !settings.member.passwordChanged)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertCircle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Emergency Contact Reminder</span>
                    <span className="policy-toggle-row__hint">Remind to update emergency contacts</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.member.emergencyContactReminder ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('member', 'emergencyContactReminder', !settings.member.emergencyContactReminder)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Staff & Trainers Tab - Keeping it concise for brevity */}
        {activeTab === 'staff' && (
          <div className="staff-notifications-tab">
            <div className="notification-subsection">
              <h3 className="subsection-title"><UserCheck size={16} /> Staff Notifications</h3>
              
              <div className="form-group">
                <div className="form-group__header">
                  <Clock size={16} />
                  <h4 className="form-group__title">Attendance & Shifts</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Shift Reminders</span>
                      <span className="policy-toggle-row__hint">Remind before shift starts</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.shiftReminder ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'shiftReminder', !settings.staff.shiftReminder)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><RefreshCw size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Shift Changes</span>
                      <span className="policy-toggle-row__hint">Notify schedule modifications</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.shiftChange ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'shiftChange', !settings.staff.shiftChange)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Overtime Alert</span>
                      <span className="policy-toggle-row__hint">Alert on overtime hours</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.overtimeAlert ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'overtimeAlert', !settings.staff.overtimeAlert)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-group__header">
                  <Target size={16} />
                  <h4 className="form-group__title">Tasks & Performance</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Target size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Task Assignment</span>
                      <span className="policy-toggle-row__hint">Notify new task assigned</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.taskAssignment ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'taskAssignment', !settings.staff.taskAssignment)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Star size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Performance Review</span>
                      <span className="policy-toggle-row__hint">Notify scheduled reviews</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.performanceReview ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'performanceReview', !settings.staff.performanceReview)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-group__header">
                  <CreditCard size={16} />
                  <h4 className="form-group__title">Payroll</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><CreditCard size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Salary Processed</span>
                      <span className="policy-toggle-row__hint">Notify salary credit</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.salaryProcessed ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'salaryProcessed', !settings.staff.salaryProcessed)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Payslip Available</span>
                      <span className="policy-toggle-row__hint">Notify payslip ready</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.staff.payslipAvailable ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('staff', 'payslipAvailable', !settings.staff.payslipAvailable)}
                  />
                </div>
              </div>
            </div>

            <div className="notification-subsection">
              <h3 className="subsection-title"><GraduationCap size={16} /> Trainer Notifications</h3>
              
              <div className="form-group">
                <div className="form-group__header">
                  <Users size={16} />
                  <h4 className="form-group__title">Client Management</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Users size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">New Client Assigned</span>
                      <span className="policy-toggle-row__hint">Notify new PT client</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.newClientAssigned ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'newClientAssigned', !settings.trainer.newClientAssigned)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><X size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Client Cancellation</span>
                      <span className="policy-toggle-row__hint">Alert session cancellations</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.clientCancellation ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'clientCancellation', !settings.trainer.clientCancellation)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Star size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Client Feedback</span>
                      <span className="policy-toggle-row__hint">Notify new feedback</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.clientFeedback ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'clientFeedback', !settings.trainer.clientFeedback)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-group__header">
                  <Calendar size={16} />
                  <h4 className="form-group__title">Schedule & Classes</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Clock size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Session Reminder</span>
                      <span className="policy-toggle-row__hint">Remind upcoming sessions</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.sessionReminder ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'sessionReminder', !settings.trainer.sessionReminder)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Class Reminder</span>
                      <span className="policy-toggle-row__hint">Remind group classes</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.classReminder ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'classReminder', !settings.trainer.classReminder)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-group__header">
                  <Award size={16} />
                  <h4 className="form-group__title">Performance & Certification</h4>
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><FileText size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Monthly Report</span>
                      <span className="policy-toggle-row__hint">Monthly performance summary</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.monthlyReport ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'monthlyReport', !settings.trainer.monthlyReport)}
                  />
                </div>
                
                <div className="policy-toggle-row">
                  <div className="policy-toggle-row__info">
                    <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                    <div className="policy-toggle-row__text">
                      <span className="policy-toggle-row__label">Certification Expiry</span>
                      <span className="policy-toggle-row__hint">Alert expiring certifications</span>
                    </div>
                  </div>
                  <button
                    className={`policy-toggle ${settings.trainer.certificationExpiry ? 'policy-toggle--active' : ''}`}
                    onClick={() => updateNestedSetting('trainer', 'certificationExpiry', !settings.trainer.certificationExpiry)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="templates-tab">
            <div className="templates-header">
              <div className="templates-info">
                <Info size={16} />
                <span>Create and manage notification templates with dynamic variables</span>
              </div>
              <button 
                className="add-template-btn"
                onClick={() => {
                  setEditingTemplate({
                    id: '',
                    name: '',
                    type: 'custom',
                    subject: '',
                    body: '',
                    channels: ['email'],
                    variables: [],
                    isActive: true
                  });
                  setShowTemplateEditor(true);
                }}
              >
                <Plus size={14} />
                New Template
              </button>
            </div>
            
            <div className="templates-list">
              {settings.templates.map(template => (
                <div key={template.id} className={`template-card ${!template.isActive ? 'inactive' : ''}`}>
                  <div className="template-card__header">
                    <div className="template-card__title">
                      <FileText size={16} />
                      <span>{template.name}</span>
                      <span className="template-type-badge">{template.type}</span>
                    </div>
                    <div className="template-card__actions">
                      <button 
                        className="template-action-btn"
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateEditor(true);
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="template-action-btn"
                        onClick={() => {
                          const newTemplate = { ...template, id: Date.now().toString(), name: `${template.name} (Copy)` };
                          handleSaveTemplate(newTemplate);
                        }}
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        className="template-action-btn delete"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="template-card__subject">
                    <strong>Subject:</strong> {template.subject}
                  </div>
                  
                  <div className="template-card__preview">
                    {template.body.substring(0, 150)}...
                  </div>
                  
                  <div className="template-card__footer">
                    <div className="template-channels">
                      {template.channels.map(ch => (
                        <span key={ch} className="channel-badge">{ch}</span>
                      ))}
                    </div>
                    <div className="template-variables">
                      {template.variables.slice(0, 3).map(v => (
                        <span key={v} className="variable-badge">{`{{${v}}}`}</span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="variable-badge more">+{template.variables.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="automation-tab">
            <div className="automation-header">
              <div className="automation-info">
                <Sparkles size={16} />
                <span>Set up automated notification workflows based on triggers and conditions</span>
              </div>
              <button 
                className="add-rule-btn"
                onClick={() => {
                  setEditingRule({
                    id: '',
                    name: '',
                    trigger: 'custom',
                    conditions: [],
                    actions: [],
                    channels: ['email'],
                    recipients: ['member'],
                    isActive: true,
                    priority: 'medium'
                  });
                  setShowRuleEditor(true);
                }}
              >
                <Plus size={14} />
                New Rule
              </button>
            </div>
            
            <div className="automation-rules-list">
              {settings.automationRules.map(rule => (
                <div key={rule.id} className={`automation-rule-card ${!rule.isActive ? 'inactive' : ''}`}>
                  <div className="rule-card__header">
                    <div className="rule-card__title">
                      <Sparkles size={16} />
                      <span>{rule.name}</span>
                      <span className={`priority-badge priority-${rule.priority}`}>{rule.priority}</span>
                    </div>
                    <div className="rule-card__toggle">
                      <button
                        className={`rule-toggle ${rule.isActive ? 'active' : ''}`}
                        onClick={() => toggleRuleActive(rule.id)}
                      >
                        {rule.isActive ? <Play size={14} /> : <Pause size={14} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="rule-card__details">
                    <div className="rule-detail">
                      <span className="rule-detail__label">Trigger:</span>
                      <span className="rule-detail__value">{rule.trigger.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="rule-detail">
                      <span className="rule-detail__label">Conditions:</span>
                      <span className="rule-detail__value">{rule.conditions.join(', ') || 'None'}</span>
                    </div>
                    <div className="rule-detail">
                      <span className="rule-detail__label">Actions:</span>
                      <span className="rule-detail__value">{rule.actions.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="rule-card__footer">
                    <div className="rule-channels">
                      {rule.channels.map(ch => (
                        <span key={ch} className="channel-badge">{ch}</span>
                      ))}
                    </div>
                    <div className="rule-recipients">
                      {rule.recipients.map(r => (
                        <span key={r} className="recipient-badge">{r}</span>
                      ))}
                    </div>
                    <div className="rule-actions">
                      <button 
                        className="rule-action-btn"
                        onClick={() => {
                          setEditingRule(rule);
                          setShowRuleEditor(true);
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="rule-action-btn delete"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Alerts Tab */}
        {activeTab === 'system' && (
          <div className="system-alerts-tab">
            <div className="form-group">
              <div className="form-group__header">
                <Activity size={16} />
                <h4 className="form-group__title">Dashboard Alert Settings</h4>
                <button
                  className={`policy-toggle ${settings.system.showDashboardAlerts ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'showDashboardAlerts', !settings.system.showDashboardAlerts)}
                />
              </div>
              
              {settings.system.showDashboardAlerts && (
                <div className="channel-config-grid">
                  <div className="config-field">
                    <label>Alert Position</label>
                    <select
                      value={settings.system.alertPosition}
                      onChange={e => updateNestedSetting('system', 'alertPosition', e.target.value as any)}
                    >
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                  <div className="config-field">
                    <label>Alert Duration (seconds)</label>
                    <input
                      type="number"
                      value={settings.system.alertDuration}
                      onChange={e => updateNestedSetting('system', 'alertDuration', parseInt(e.target.value) || 0)}
                      min={1}
                      max={30}
                    />
                  </div>
                  <div className="config-field">
                    <label>Max Visible Alerts</label>
                    <input
                      type="number"
                      value={settings.system.maxVisibleAlerts}
                      onChange={e => updateNestedSetting('system', 'maxVisibleAlerts', parseInt(e.target.value) || 0)}
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <div className="form-group__header">
                <AlertTriangle size={16} />
                <h4 className="form-group__title">Critical System Alerts</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Server Down</span>
                    <span className="policy-toggle-row__hint">Alert on server issues</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.serverDown ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'serverDown', !settings.system.serverDown)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Shield size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Security Breach</span>
                    <span className="policy-toggle-row__hint">Alert suspicious activity</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.securityBreach ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'securityBreach', !settings.system.securityBreach)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CreditCard size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Gateway Issues</span>
                    <span className="policy-toggle-row__hint">Alert on payment failures</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.paymentGatewayIssue ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'paymentGatewayIssue', !settings.system.paymentGatewayIssue)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-group__header">
                <Activity size={16} />
                <h4 className="form-group__title">Business Activity Alerts</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Users size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">New Member Registration</span>
                    <span className="policy-toggle-row__hint">Alert new sign-ups</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.newMemberRegistration ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'newMemberRegistration', !settings.system.newMemberRegistration)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><CheckCircle2 size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Received</span>
                    <span className="policy-toggle-row__hint">Alert successful payments</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.paymentReceived ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'paymentReceived', !settings.system.paymentReceived)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><AlertTriangle size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Payment Failed</span>
                    <span className="policy-toggle-row__hint">Alert failed payments</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.paymentFailed ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'paymentFailed', !settings.system.paymentFailed)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-group__header">
                <FileText size={16} />
                <h4 className="form-group__title">Automated Reports</h4>
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Daily Summary</span>
                    <span className="policy-toggle-row__hint">End of day summary report</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.dailySummary ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'dailySummary', !settings.system.dailySummary)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Weekly Summary</span>
                    <span className="policy-toggle-row__hint">Weekly business overview</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.weeklySummary ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'weeklySummary', !settings.system.weeklySummary)}
                />
              </div>
              
              <div className="policy-toggle-row">
                <div className="policy-toggle-row__info">
                  <div className="policy-toggle-row__icon"><Calendar size={16} /></div>
                  <div className="policy-toggle-row__text">
                    <span className="policy-toggle-row__label">Monthly Summary</span>
                    <span className="policy-toggle-row__hint">Monthly performance report</span>
                  </div>
                </div>
                <button
                  className={`policy-toggle ${settings.system.monthlySummary ? 'policy-toggle--active' : ''}`}
                  onClick={() => updateNestedSetting('system', 'monthlySummary', !settings.system.monthlySummary)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog__header">
              <h3>Confirm Changes</h3>
              <button className="confirm-dialog__close" onClick={() => setShowConfirmDialog(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="confirm-dialog__body">
              <p>You are about to save the following changes:</p>
              <ul className="changes-list">
                {pendingChanges.map((change, i) => (
                  <li key={i}><CheckCircle2 size={14} /> {change}</li>
                ))}
              </ul>
            </div>
            <div className="confirm-dialog__actions">
              <button className="btn-cancel" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleConfirmSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {showTemplateEditor && editingTemplate && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog template-editor-dialog">
            <div className="confirm-dialog__header">
              <h3>{editingTemplate.id ? 'Edit Template' : 'New Template'}</h3>
              <button className="confirm-dialog__close" onClick={() => setShowTemplateEditor(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="confirm-dialog__body">
              <div className="template-editor">
                <div className="editor-field">
                  <label>Template Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="e.g., Welcome Email"
                  />
                </div>
                <div className="editor-field">
                  <label>Type</label>
                  <select
                    value={editingTemplate.type}
                    onChange={e => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                  >
                    <option value="welcome">Welcome</option>
                    <option value="payment_reminder">Payment Reminder</option>
                    <option value="class_reminder">Class Reminder</option>
                    <option value="birthday">Birthday</option>
                    <option value="expiry_reminder">Expiry Reminder</option>
                    <option value="promotional">Promotional</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="editor-field">
                  <label>Subject Line</label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    placeholder="e.g., Welcome to {{gym_name}}!"
                  />
                </div>
                <div className="editor-field">
                  <label>Message Body</label>
                  <textarea
                    value={editingTemplate.body}
                    onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                    rows={6}
                    placeholder="Write your message here. Use {{variable}} for dynamic content."
                  />
                </div>
                <div className="editor-field">
                  <label>Channels</label>
                  <div className="channel-selector">
                    {(['email', 'sms', 'push', 'whatsapp'] as NotificationChannel[]).map(ch => (
                      <button
                        key={ch}
                        className={`channel-option ${editingTemplate.channels.includes(ch) ? 'active' : ''}`}
                        onClick={() => {
                          const channels = editingTemplate.channels.includes(ch)
                            ? editingTemplate.channels.filter(c => c !== ch)
                            : [...editingTemplate.channels, ch];
                          setEditingTemplate({ ...editingTemplate, channels });
                        }}
                      >
                        {ch === 'email' && <Mail size={14} />}
                        {ch === 'sms' && <Smartphone size={14} />}
                        {ch === 'push' && <BellRing size={14} />}
                        {ch === 'whatsapp' && <MessageSquare size={14} />}
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="editor-field">
                  <label>Available Variables</label>
                  <div className="variables-list">
                    {['gym_name', 'member_name', 'amount', 'due_date', 'expiry_date', 'class_name', 'trainer_name', 'class_time'].map(v => (
                      <span 
                        key={v} 
                        className="variable-chip"
                        onClick={() => {
                          if (!editingTemplate.variables.includes(v)) {
                            setEditingTemplate({ ...editingTemplate, variables: [...editingTemplate.variables, v] });
                          }
                        }}
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="confirm-dialog__actions">
              <button className="btn-cancel" onClick={() => setShowTemplateEditor(false)}>
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => handleSaveTemplate(editingTemplate)}
                disabled={!editingTemplate.name || !editingTemplate.subject}
              >
                <Save size={16} />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automation Rule Editor Modal */}
      {showRuleEditor && editingRule && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog rule-editor-dialog">
            <div className="confirm-dialog__header">
              <h3>{editingRule.id ? 'Edit Automation Rule' : 'New Automation Rule'}</h3>
              <button className="confirm-dialog__close" onClick={() => setShowRuleEditor(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="confirm-dialog__body">
              <div className="rule-editor">
                <div className="editor-field">
                  <label>Rule Name</label>
                  <input
                    type="text"
                    value={editingRule.name}
                    onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                    placeholder="e.g., Welcome New Members"
                  />
                </div>
                <div className="editor-field">
                  <label>Trigger Event</label>
                  <select
                    value={editingRule.trigger}
                    onChange={e => setEditingRule({ ...editingRule, trigger: e.target.value })}
                  >
                    <option value="member_registration">Member Registration</option>
                    <option value="payment_due">Payment Due</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="payment_failed">Payment Failed</option>
                    <option value="membership_expiring">Membership Expiring</option>
                    <option value="member_birthday">Member Birthday</option>
                    <option value="member_inactive">Member Inactive</option>
                    <option value="class_booked">Class Booked</option>
                    <option value="class_cancelled">Class Cancelled</option>
                    <option value="upcoming_session">Upcoming Session</option>
                    <option value="trainer_assigned">Trainer Assigned</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="editor-field">
                  <label>Priority</label>
                  <select
                    value={editingRule.priority}
                    onChange={e => setEditingRule({ ...editingRule, priority: e.target.value as NotificationPriority })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="editor-field">
                  <label>Channels</label>
                  <div className="channel-selector">
                    {(['email', 'sms', 'push', 'whatsapp', 'in_app'] as NotificationChannel[]).map(ch => (
                      <button
                        key={ch}
                        className={`channel-option ${editingRule.channels.includes(ch) ? 'active' : ''}`}
                        onClick={() => {
                          const channels = editingRule.channels.includes(ch)
                            ? editingRule.channels.filter(c => c !== ch)
                            : [...editingRule.channels, ch];
                          setEditingRule({ ...editingRule, channels });
                        }}
                      >
                        {ch === 'email' && <Mail size={14} />}
                        {ch === 'sms' && <Smartphone size={14} />}
                        {ch === 'push' && <BellRing size={14} />}
                        {ch === 'whatsapp' && <MessageSquare size={14} />}
                        {ch === 'in_app' && <MessageCircle size={14} />}
                        {ch.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="editor-field">
                  <label>Recipients</label>
                  <div className="recipient-selector">
                    {(['member', 'trainer', 'staff', 'admin'] as RecipientType[]).map(r => (
                      <button
                        key={r}
                        className={`recipient-option ${editingRule.recipients.includes(r) ? 'active' : ''}`}
                        onClick={() => {
                          const recipients = editingRule.recipients.includes(r)
                            ? editingRule.recipients.filter(rc => rc !== r)
                            : [...editingRule.recipients, r];
                          setEditingRule({ ...editingRule, recipients });
                        }}
                      >
                        {r === 'member' && <Users size={14} />}
                        {r === 'trainer' && <GraduationCap size={14} />}
                        {r === 'staff' && <UserCheck size={14} />}
                        {r === 'admin' && <Shield size={14} />}
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="confirm-dialog__actions">
              <button className="btn-cancel" onClick={() => setShowRuleEditor(false)}>
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => handleSaveRule(editingRule)}
                disabled={!editingRule.name || !editingRule.trigger}
              >
                <Save size={16} />
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;