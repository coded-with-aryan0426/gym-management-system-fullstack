import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Moon, Sun, Check, Eye, EyeOff,
    Smartphone, Laptop, Monitor, LogOut, Trash2, Download, Upload,
    CheckCircle2, AlertCircle, Info, X, Bell, CreditCard, Target,
    Heart, Shield, Calendar, Dumbbell
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import './MemberSettings.css';

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', description?: string) => {
    const icons = {
        success: <CheckCircle2 size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />
    };
    const colors = {
        success: { bg: 'linear-gradient(135deg, #34C759, #28A745)', border: 'rgba(52, 199, 89, 0.3)' },
        error: { bg: 'linear-gradient(135deg, #FF3B30, #DC2626)', border: 'rgba(255, 59, 48, 0.3)' },
        info: { bg: 'linear-gradient(135deg, #007AFF, #0055FF)', border: 'rgba(0, 122, 255, 0.3)' }
    };

    toast.custom((t) => (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                background: 'rgba(20, 20, 24, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '14px',
                border: `1px solid ${colors[type].border}`,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                maxWidth: '360px',
                opacity: t.visible ? 1 : 0,
                transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <div
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: colors[type].bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                }}
            >
                {icons[type]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{message}</span>
                {description && <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>{description}</span>}
            </div>
            <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.6)',
                }}
            >
                <X size={14} />
            </button>
        </div>
    ), { duration: 1500 });
};

const MemberSettings: React.FC = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        classReminders: true,
        membershipAlerts: true,
        promotions: false,
        trainerMessages: true,
        achievementAlerts: true,
        weeklyProgress: true,
    });
    const [privacy, setPrivacy] = useState({
        profileVisible: true,
        showProgress: false,
        shareAchievements: true,
        allowTrainerAccess: true,
    });
    const [fitness, setFitness] = useState({
        weightUnit: 'kg',
        distanceUnit: 'km',
        reminderTime: '07:00',
        weeklyGoal: 4,
        showCalories: true,
    });
    const [profile, setProfile] = useState({
        firstName: 'Alex',
        lastName: 'Member',
        email: 'alex.member@email.com',
        phone: '+91 98765 43210',
        emergencyContact: '+91 87654 32109',
        dateOfBirth: '1995-06-15',
    });

    const sections = [
        { id: 'profile', label: 'Profile', icon: '👤', gradient: 'linear-gradient(135deg, #007AFF, #0055FF)', desc: 'Name, contact info' },
        { id: 'notifications', label: 'Notifications', icon: '🔔', gradient: 'linear-gradient(135deg, #FF9500, #FF7700)', desc: 'Alerts & reminders' },
        { id: 'fitness', label: 'Fitness Goals', icon: '🎯', gradient: 'linear-gradient(135deg, #34C759, #28A745)', desc: 'Goals & preferences' },
        { id: 'appearance', label: 'Appearance', icon: '🎨', gradient: 'linear-gradient(135deg, #AF52DE, #9B30FF)', desc: 'Theme & display' },
        { id: 'membership', label: 'Membership', icon: '💳', gradient: 'linear-gradient(135deg, #5856D6, #4A47CC)', desc: 'Plan & billing' },
        { id: 'security', label: 'Security', icon: '🔐', gradient: 'linear-gradient(135deg, #34C759, #28A745)', desc: 'Password & 2FA' },
        { id: 'privacy', label: 'Privacy', icon: '🛡️', gradient: 'linear-gradient(135deg, #FF2D55, #FF1744)', desc: 'Data & visibility' },
        { id: 'sessions', label: 'Active Sessions', icon: '📱', gradient: 'linear-gradient(135deg, #5856D6, #4A47CC)', desc: 'Logged in devices' },
        { id: 'about', label: 'About', icon: 'ℹ️', gradient: 'linear-gradient(135deg, #8E8E93, #636366)', desc: 'Version & help' },
    ];

    const activeSessions = [
        { id: 1, device: 'iPhone 15', location: 'Mumbai, India', lastActive: 'Active now', icon: Smartphone, current: true },
        { id: 2, device: 'MacBook Air', location: 'Mumbai, India', lastActive: '1 hour ago', icon: Laptop, current: false },
        { id: 3, device: 'Chrome on Windows', location: 'Pune, India', lastActive: '2 days ago', icon: Monitor, current: false },
    ];

    const darkMode = theme === 'dark';

    const handleSave = () => showToast('Settings Saved', 'success', 'Your changes have been applied');

    const toggleTheme = (isDark: boolean) => {
        setTheme(isDark ? 'dark' : 'light');
        showToast(`${isDark ? 'Dark' : 'Light'} Mode`, 'success', 'Theme updated');
    };

    const handleLogoutDevice = () => showToast('Device Removed', 'success', 'Session terminated');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.clear();
        showToast('Signed Out', 'info', 'See you next time!');
        setTimeout(() => navigate('/login'), 800);
    };

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Profile</h2>
                            <button className="ms-detail__save" onClick={handleSave}>Save</button>
                        </div>
                        <div className="ms-detail__content ms-detail__content--single">
                            <div className="ms-settings-card ms-settings-card--full">
                                <div className="ms-profile-photo">
                                    <div className="ms-profile-photo__avatar"><span>AM</span></div>
                                    <button className="ms-profile-photo__edit">Edit Photo</button>
                                </div>
                                <div className="ms-form-row">
                                    <div className="ms-form-group">
                                        <label>First Name</label>
                                        <input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                                    </div>
                                    <div className="ms-form-group">
                                        <label>Last Name</label>
                                        <input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="ms-form-row">
                                    <div className="ms-form-group">
                                        <label>Email</label>
                                        <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                                    </div>
                                    <div className="ms-form-group">
                                        <label>Phone</label>
                                        <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                                    </div>
                                </div>
                                <div className="ms-form-row">
                                    <div className="ms-form-group">
                                        <label>Date of Birth</label>
                                        <input type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} />
                                    </div>
                                    <div className="ms-form-group">
                                        <label>Emergency Contact</label>
                                        <input type="tel" value={profile.emergencyContact} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Notifications</h2>
                            <div />
                        </div>
                        <div className="ms-detail__content">
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #007AFF, #0055FF)' }}>📧</span>
                                    <span>General</span>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Push Notifications</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Email Notifications</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                            </div>
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #34C759, #28A745)' }}>📅</span>
                                    <span>Activity Alerts</span>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Class Reminders</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={notifications.classReminders} onChange={(e) => setNotifications({ ...notifications, classReminders: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Trainer Messages</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={notifications.trainerMessages} onChange={(e) => setNotifications({ ...notifications, trainerMessages: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Achievement Alerts</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={notifications.achievementAlerts} onChange={(e) => setNotifications({ ...notifications, achievementAlerts: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                            </div>
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #5856D6, #4A47CC)' }}>💳</span>
                                    <span>Membership</span>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Membership Alerts</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={notifications.membershipAlerts} onChange={(e) => setNotifications({ ...notifications, membershipAlerts: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Weekly Progress Report</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={notifications.weeklyProgress} onChange={(e) => setNotifications({ ...notifications, weeklyProgress: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Promotions & Offers</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={notifications.promotions} onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'fitness':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Fitness Goals</h2>
                            <button className="ms-detail__save" onClick={handleSave}>Save</button>
                        </div>
                        <div className="ms-detail__content">
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #34C759, #28A745)' }}>🎯</span>
                                    <span>Weekly Goal</span>
                                </div>
                                <div className="ms-goal-selector">
                                    {[2, 3, 4, 5, 6, 7].map((num) => (
                                        <button
                                            key={num}
                                            className={`ms-goal-btn ${fitness.weeklyGoal === num ? 'ms-goal-btn--active' : ''}`}
                                            onClick={() => setFitness({ ...fitness, weeklyGoal: num })}
                                        >
                                            {num} days
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #007AFF, #0055FF)' }}>⏰</span>
                                    <span>Reminder Time</span>
                                </div>
                                <div className="ms-form-group">
                                    <label>Daily Workout Reminder</label>
                                    <input type="time" value={fitness.reminderTime} onChange={(e) => setFitness({ ...fitness, reminderTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #FF9500, #FF7700)' }}>📏</span>
                                    <span>Units</span>
                                </div>
                                <div className="ms-select-group">
                                    <label>Weight Unit</label>
                                    <select value={fitness.weightUnit} onChange={(e) => setFitness({ ...fitness, weightUnit: e.target.value })}>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="lbs">Pounds (lbs)</option>
                                    </select>
                                </div>
                                <div className="ms-select-group">
                                    <label>Distance Unit</label>
                                    <select value={fitness.distanceUnit} onChange={(e) => setFitness({ ...fitness, distanceUnit: e.target.value })}>
                                        <option value="km">Kilometers (km)</option>
                                        <option value="mi">Miles (mi)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #FF2D55, #FF1744)' }}>🔥</span>
                                    <span>Display</span>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Show Calories Burned</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={fitness.showCalories} onChange={(e) => setFitness({ ...fitness, showCalories: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Appearance</h2>
                            <div />
                        </div>
                        <div className="ms-detail__content">
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #AF52DE, #9B30FF)' }}>🎨</span>
                                    <span>Theme</span>
                                </div>
                                <div className="ms-theme-grid">
                                    <button className={`ms-theme-card ${darkMode ? 'ms-theme-card--active' : ''}`} onClick={() => toggleTheme(true)}>
                                        <div className="ms-theme-card__preview ms-theme-card__preview--dark"><Moon size={20} /></div>
                                        <span>Dark</span>
                                        {darkMode && <Check size={14} className="ms-theme-card__check" />}
                                    </button>
                                    <button className={`ms-theme-card ${!darkMode ? 'ms-theme-card--active' : ''}`} onClick={() => toggleTheme(false)}>
                                        <div className="ms-theme-card__preview ms-theme-card__preview--light"><Sun size={20} /></div>
                                        <span>Light</span>
                                        {!darkMode && <Check size={14} className="ms-theme-card__check" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'membership':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Membership</h2>
                            <div />
                        </div>
                        <div className="ms-detail__content ms-detail__content--single">
                            <div className="ms-settings-card ms-settings-card--full">
                                <div className="ms-membership-card">
                                    <div className="ms-membership-card__badge">Premium</div>
                                    <h3 className="ms-membership-card__title">Premium Monthly</h3>
                                    <p className="ms-membership-card__price">₹2,999/month</p>
                                    <div className="ms-membership-card__info">
                                        <span><Calendar size={14} /> Started: Jan 1, 2024</span>
                                        <span><Calendar size={14} /> Expires: Feb 1, 2024</span>
                                    </div>
                                </div>
                                <div className="ms-membership-features">
                                    <div className="ms-feature"><Check size={14} /> Unlimited gym access</div>
                                    <div className="ms-feature"><Check size={14} /> All group classes</div>
                                    <div className="ms-feature"><Check size={14} /> 4 PT sessions/month</div>
                                    <div className="ms-feature"><Check size={14} /> Locker access</div>
                                </div>
                                <div className="ms-action-row">
                                    <button className="ms-btn ms-btn--primary" onClick={() => navigate('/member/membership')}>Manage Plan</button>
                                    <button className="ms-btn ms-btn--secondary">View History</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Security</h2>
                            <div />
                        </div>
                        <div className="ms-detail__content">
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #34C759, #28A745)' }}>🔑</span>
                                    <span>Password</span>
                                </div>
                                <div className="ms-form-group">
                                    <label>Current Password</label>
                                    <div className="ms-input-with-icon">
                                        <input type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                                        <button onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="ms-form-row">
                                    <div className="ms-form-group">
                                        <label>New Password</label>
                                        <input type="password" placeholder="New password" />
                                    </div>
                                    <div className="ms-form-group">
                                        <label>Confirm Password</label>
                                        <input type="password" placeholder="Confirm password" />
                                    </div>
                                </div>
                                <button className="ms-btn ms-btn--primary">Update Password</button>
                            </div>
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Privacy</h2>
                            <div />
                        </div>
                        <div className="ms-detail__content">
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #FF2D55, #FF1744)' }}>👁️</span>
                                    <span>Profile Visibility</span>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Public Profile</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={privacy.profileVisible} onChange={(e) => setPrivacy({ ...privacy, profileVisible: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Share Progress</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={privacy.showProgress} onChange={(e) => setPrivacy({ ...privacy, showProgress: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Share Achievements</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={privacy.shareAchievements} onChange={(e) => setPrivacy({ ...privacy, shareAchievements: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                            </div>
                            <div className="ms-settings-card">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #34C759, #28A745)' }}>🏋️</span>
                                    <span>Trainer Access</span>
                                </div>
                                <div className="ms-toggle-row">
                                    <div className="ms-toggle-row__info"><span className="ms-toggle-row__label">Allow Trainer to View Progress</span></div>
                                    <label className="ms-switch">
                                        <input type="checkbox" checked={privacy.allowTrainerAccess} onChange={(e) => setPrivacy({ ...privacy, allowTrainerAccess: e.target.checked })} />
                                        <span className="ms-switch__slider" />
                                    </label>
                                </div>
                            </div>
                            <div className="ms-settings-card ms-settings-card--danger">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #FF3B30, #DC2626)' }}>⚠️</span>
                                    <span>Danger Zone</span>
                                </div>
                                <p className="ms-settings-card__desc">Permanently delete your account and all data.</p>
                                <button className="ms-btn ms-btn--danger"><Trash2 size={14} />Delete Account</button>
                            </div>
                        </div>
                    </div>
                );

            case 'sessions':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Active Sessions</h2>
                            <div />
                        </div>
                        <div className="ms-detail__content ms-detail__content--single">
                            <div className="ms-settings-card ms-settings-card--full">
                                <div className="ms-settings-card__header">
                                    <span className="ms-settings-card__icon" style={{ background: 'linear-gradient(135deg, #5856D6, #4A47CC)' }}>📱</span>
                                    <span>Logged In Devices</span>
                                </div>
                                <div className="ms-devices-list">
                                    {activeSessions.map((session) => (
                                        <div key={session.id} className={`ms-device-item ${session.current ? 'ms-device-item--current' : ''}`}>
                                            <div className="ms-device-item__icon"><session.icon size={18} /></div>
                                            <div className="ms-device-item__info">
                                                <span className="ms-device-item__name">
                                                    {session.device}
                                                    {session.current && <span className="ms-device-item__badge">This Device</span>}
                                                </span>
                                                <span className="ms-device-item__meta">{session.location} • {session.lastActive}</span>
                                            </div>
                                            {!session.current && (
                                                <button className="ms-device-item__logout" onClick={() => handleLogoutDevice()}>
                                                    <LogOut size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button className="ms-btn ms-btn--danger"><LogOut size={14} />Log Out All Other Devices</button>
                            </div>
                        </div>
                    </div>
                );

            case 'about':
                return (
                    <div className="ms-detail">
                        <div className="ms-detail__header">
                            <button className="ms-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>About</h2>
                            <div />
                        </div>
                        <div className="ms-detail__content ms-detail__content--single">
                            <div className="ms-about-logo">
                                <div className="ms-about-logo__icon"><span>A</span></div>
                                <h3>AthlonX Member</h3>
                                <span>Version 2.4.1</span>
                            </div>
                            <div className="ms-settings-card ms-settings-card--full">
                                <div className="ms-link-list">
                                    <a href="#" className="ms-link-item"><span>📄</span><span>Terms of Service</span><ChevronRight size={14} /></a>
                                    <a href="#" className="ms-link-item"><span>🔒</span><span>Privacy Policy</span><ChevronRight size={14} /></a>
                                    <a href="#" className="ms-link-item"><span>💬</span><span>Send Feedback</span><ChevronRight size={14} /></a>
                                    <a href="#" className="ms-link-item"><span>❓</span><span>Help Center</span><ChevronRight size={14} /></a>
                                </div>
                            </div>
                            <div className="ms-about-footer">
                                <p>Made with ❤️ by AthlonX Team</p>
                                <p>© 2024 AthlonX. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="member-settings">
            <AnimatePresence mode="wait">
                {activeSection ? (
                    <motion.div
                        key="detail"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="ms-detail-wrapper"
                    >
                        {renderSectionContent()}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="ms-list-wrapper"
                    >
                        <div className="ms-header">
                            <h1>Settings</h1>
                        </div>
                        <div className="ms-sections">
                            {sections.map((section, index) => (
                                <motion.button
                                    key={section.id}
                                    className="ms-section-item"
                                    onClick={() => setActiveSection(section.id)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="ms-section-item__icon" style={{ background: section.gradient }}>{section.icon}</span>
                                    <div className="ms-section-item__text">
                                        <span className="ms-section-item__label">{section.label}</span>
                                        <span className="ms-section-item__desc">{section.desc}</span>
                                    </div>
                                    <ChevronRight size={16} className="ms-section-item__arrow" />
                                </motion.button>
                            ))}
                        </div>
                        <div className="ms-footer">
                            <button className="ms-logout-btn" onClick={handleLogout}><LogOut size={16} /><span>Log Out</span></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemberSettings;
