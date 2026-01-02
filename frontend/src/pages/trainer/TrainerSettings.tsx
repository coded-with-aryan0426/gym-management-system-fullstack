import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, Moon, Sun, Check, Eye, EyeOff,
    Smartphone, Laptop, Monitor, LogOut, Trash2, Download, Upload,
    CheckCircle2, AlertCircle, Info, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import './TrainerSettings.css';

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', description?: string) => {
    const icons = {
        success: <CheckCircle2 size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />
    };
    const colors = {
        success: { bg: 'linear-gradient(135deg, #10B981, #059669)', border: 'rgba(16, 185, 129, 0.3)' },
        error: { bg: 'linear-gradient(135deg, #EF4444, #DC2626)', border: 'rgba(239, 68, 68, 0.3)' },
        info: { bg: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'rgba(59, 130, 246, 0.3)' }
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
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
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
                    boxShadow: `0 4px 12px ${type === 'success' ? 'rgba(16, 185, 129, 0.4)' : type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
                }}
            >
                {icons[type]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600, letterSpacing: '-0.2px' }}>
                    {message}
                </span>
                {description && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                        {description}
                    </span>
                )}
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
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }}
            >
                <X size={14} />
            </button>
        </div>
    ), { duration: 1500 });
};

const TrainerSettings: React.FC = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        bookings: true,
        reminders: true,
        marketing: false,
        sound: true,
        vibration: true,
    });
    const [privacy, setPrivacy] = useState({
        profileVisible: true,
        activityStatus: true,
        analytics: false,
        locationServices: true,
    });
    const [profile, setProfile] = useState({
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@athlonx.com',
        phone: '+91 98765 43210',
        bio: 'Certified personal trainer with 8 years experience.',
    });

    const sections = [
        { id: 'profile', label: 'Profile', icon: '👤', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', desc: 'Name, photo, bio' },
        { id: 'notifications', label: 'Notifications', icon: '🔔', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', desc: 'Alerts and sounds' },
        { id: 'appearance', label: 'Appearance', icon: '🎨', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', desc: 'Theme and display' },
        { id: 'security', label: 'Security', icon: '🔐', gradient: 'linear-gradient(135deg, #10B981, #059669)', desc: 'Password and 2FA' },
        { id: 'privacy', label: 'Privacy', icon: '🛡️', gradient: 'linear-gradient(135deg, #EC4899, #DB2777)', desc: 'Data and visibility' },
        { id: 'language', label: 'Language & Region', icon: '🌍', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)', desc: 'Time zone, format' },
        { id: 'sessions', label: 'Active Sessions', icon: '📱', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)', desc: 'Logged in devices' },
        { id: 'data', label: 'Data & Storage', icon: '💾', gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)', desc: 'Export and backup' },
        { id: 'about', label: 'About', icon: 'ℹ️', gradient: 'linear-gradient(135deg, #64748B, #475569)', desc: 'Version and legal' },
    ];

    const activeSessions = [
        { id: 1, device: 'iPhone 15 Pro', location: 'Mumbai, India', lastActive: 'Active now', icon: Smartphone, current: true },
        { id: 2, device: 'MacBook Pro', location: 'Mumbai, India', lastActive: '2 hours ago', icon: Laptop, current: false },
        { id: 3, device: 'Chrome on Windows', location: 'Delhi, India', lastActive: '3 days ago', icon: Monitor, current: false },
    ];

    const darkMode = theme === 'dark';

    const handleSave = () => showToast('Settings Saved', 'success', 'Your changes have been applied');

    const toggleTheme = (isDark: boolean) => {
        setTheme(isDark ? 'dark' : 'light');
        showToast(`${isDark ? 'Dark' : 'Light'} Mode`, 'success', 'Theme updated successfully');
    };

    const handleLogoutDevice = () => showToast('Device Removed', 'success', 'Session terminated securely');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        sessionStorage.clear();
        showToast('Signed Out', 'info', 'See you next time!');
        setTimeout(() => navigate('/login'), 800);
    };

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Profile</h2>
                            <button className="ts-detail__save" onClick={handleSave}>Save</button>
                        </div>
                        <div className="ts-detail__content ts-detail__content--single">
                            <div className="ts-settings-card ts-settings-card--full">
                                <div className="ts-profile-photo">
                                    <div className="ts-profile-photo__avatar"><span>JS</span></div>
                                    <button className="ts-profile-photo__edit">Edit Photo</button>
                                </div>
                                <div className="ts-form-row">
                                    <div className="ts-form-group">
                                        <label>First Name</label>
                                        <input type="text" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} />
                                    </div>
                                    <div className="ts-form-group">
                                        <label>Last Name</label>
                                        <input type="text" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ts-form-row">
                                    <div className="ts-form-group">
                                        <label>Email</label>
                                        <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                                    </div>
                                    <div className="ts-form-group">
                                        <label>Phone</label>
                                        <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                                    </div>
                                </div>
                                <div className="ts-form-group">
                                    <label>Bio</label>
                                    <textarea rows={2} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Notifications</h2>
                            <div />
                        </div>
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>📧</span>
                                    <span>Push Notifications</span>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Allow Notifications</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({...notifications, push: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Email Notifications</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({...notifications, email: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                            </div>
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>📅</span>
                                    <span>Activity Alerts</span>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Booking Alerts</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={notifications.bookings} onChange={(e) => setNotifications({...notifications, bookings: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Session Reminders</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={notifications.reminders} onChange={(e) => setNotifications({...notifications, reminders: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Marketing</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={notifications.marketing} onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                            </div>
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>🔊</span>
                                    <span>Sounds & Haptics</span>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Sound</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={notifications.sound} onChange={(e) => setNotifications({...notifications, sound: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Vibration</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={notifications.vibration} onChange={(e) => setNotifications({...notifications, vibration: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Appearance</h2>
                            <div />
                        </div>
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>🎨</span>
                                    <span>Theme</span>
                                </div>
                                <div className="ts-theme-grid">
                                    <button className={`ts-theme-card ${darkMode ? 'ts-theme-card--active' : ''}`} onClick={() => toggleTheme(true)}>
                                        <div className="ts-theme-card__preview ts-theme-card__preview--dark"><Moon size={20} /></div>
                                        <span>Dark</span>
                                        {darkMode && <Check size={14} className="ts-theme-card__check" />}
                                    </button>
                                    <button className={`ts-theme-card ${!darkMode ? 'ts-theme-card--active' : ''}`} onClick={() => toggleTheme(false)}>
                                        <div className="ts-theme-card__preview ts-theme-card__preview--light"><Sun size={20} /></div>
                                        <span>Light</span>
                                        {!darkMode && <Check size={14} className="ts-theme-card__check" />}
                                    </button>
                                </div>
                            </div>
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)' }}>❤️</span>
                                    <span>Accent Color</span>
                                </div>
                                <div className="ts-color-grid">
                                    {['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map((color) => (
                                        <button key={color} className="ts-color-btn" style={{ background: color }}>
                                            {color === '#DC2626' && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Security</h2>
                            <div />
                        </div>
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>🔑</span>
                                    <span>Password</span>
                                </div>
                                <div className="ts-form-group">
                                    <label>Current Password</label>
                                    <div className="ts-input-with-icon">
                                        <input type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                                        <button onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="ts-form-row">
                                    <div className="ts-form-group">
                                        <label>New Password</label>
                                        <input type="password" placeholder="New password" />
                                    </div>
                                    <div className="ts-form-group">
                                        <label>Confirm Password</label>
                                        <input type="password" placeholder="Confirm password" />
                                    </div>
                                </div>
                                <button className="ts-btn ts-btn--primary">Update Password</button>
                            </div>
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>🔐</span>
                                    <span>Two-Factor Authentication</span>
                                </div>
                                <div className="ts-2fa-status">
                                    <div className="ts-2fa-status__badge ts-2fa-status__badge--enabled">
                                        <Check size={12} />Enabled
                                    </div>
                                    <p>Protected with 2FA via authenticator app.</p>
                                </div>
                                <div className="ts-action-row">
                                    <button className="ts-btn ts-btn--secondary">Manage 2FA</button>
                                    <button className="ts-btn ts-btn--ghost">Recovery Codes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Privacy</h2>
                            <div />
                        </div>
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)' }}>👁️</span>
                                    <span>Visibility</span>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Profile Visibility</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={privacy.profileVisible} onChange={(e) => setPrivacy({...privacy, profileVisible: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Activity Status</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={privacy.activityStatus} onChange={(e) => setPrivacy({...privacy, activityStatus: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                            </div>
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #14B8A6, #0D9488)' }}>📊</span>
                                    <span>Data & Analytics</span>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Usage Analytics</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={privacy.analytics} onChange={(e) => setPrivacy({...privacy, analytics: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Location Services</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input type="checkbox" checked={privacy.locationServices} onChange={(e) => setPrivacy({...privacy, locationServices: e.target.checked})} />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'language':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Language & Region</h2>
                            <button className="ts-detail__save" onClick={handleSave}>Save</button>
                        </div>
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>🌐</span>
                                    <span>Language</span>
                                </div>
                                <div className="ts-select-group">
                                    <label>App Language</label>
                                    <select defaultValue="en">
                                        <option value="en">🇺🇸 English</option>
                                        <option value="es">🇪🇸 Spanish</option>
                                        <option value="fr">🇫🇷 French</option>
                                        <option value="de">🇩🇪 German</option>
                                        <option value="hi">🇮🇳 Hindi</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>🕐</span>
                                    <span>Regional Settings</span>
                                </div>
                                <div className="ts-select-group">
                                    <label>Time Zone</label>
                                    <select defaultValue="ist">
                                        <option value="ist">IST (UTC+5:30) - India</option>
                                        <option value="pst">PST (UTC-8) - Pacific</option>
                                        <option value="est">EST (UTC-5) - Eastern</option>
                                    </select>
                                </div>
                                <div className="ts-form-row">
                                    <div className="ts-select-group">
                                        <label>Date Format</label>
                                        <select defaultValue="dd/mm/yyyy">
                                            <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                            <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                        </select>
                                    </div>
                                    <div className="ts-select-group">
                                        <label>Time Format</label>
                                        <select defaultValue="12h">
                                            <option value="12h">12-hour</option>
                                            <option value="24h">24-hour</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'sessions':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Active Sessions</h2>
                            <div />
                        </div>
                        <div className="ts-detail__content ts-detail__content--single">
                            <div className="ts-settings-card ts-settings-card--full">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>📱</span>
                                    <span>Logged In Devices</span>
                                </div>
                                <div className="ts-devices-list">
                                    {activeSessions.map((session) => (
                                        <div key={session.id} className={`ts-device-item ${session.current ? 'ts-device-item--current' : ''}`}>
                                            <div className="ts-device-item__icon"><session.icon size={18} /></div>
                                            <div className="ts-device-item__info">
                                                <span className="ts-device-item__name">
                                                    {session.device}
                                                    {session.current && <span className="ts-device-item__badge">This Device</span>}
                                                </span>
                                                <span className="ts-device-item__meta">{session.location} • {session.lastActive}</span>
                                            </div>
                                            {!session.current && (
                                                <button className="ts-device-item__logout" onClick={() => handleLogoutDevice()}>
                                                    <LogOut size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button className="ts-btn ts-btn--danger"><LogOut size={14} />Log Out All Other Devices</button>
                            </div>
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Data & Storage</h2>
                            <div />
                        </div>
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #14B8A6, #0D9488)' }}>📤</span>
                                    <span>Export Data</span>
                                </div>
                                <p className="ts-settings-card__desc">Download a copy of your data.</p>
                                <button className="ts-btn ts-btn--secondary"><Download size={14} />Request Export</button>
                            </div>
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>☁️</span>
                                    <span>Backup</span>
                                </div>
                                <div className="ts-backup-status">
                                    <div className="ts-backup-status__info">
                                        <span>Last backup: Today, 2:30 PM</span>
                                        <span className="ts-backup-status__auto">Auto-backup enabled</span>
                                    </div>
                                    <button className="ts-btn ts-btn--ghost"><Upload size={14} />Backup</button>
                                </div>
                            </div>
                            <div className="ts-settings-card ts-settings-card--danger">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>⚠️</span>
                                    <span>Danger Zone</span>
                                </div>
                                <p className="ts-settings-card__desc">Permanently delete your account.</p>
                                <button className="ts-btn ts-btn--danger"><Trash2 size={14} />Delete Account</button>
                            </div>
                        </div>
                    </div>
                );

            case 'about':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>About</h2>
                            <div />
                        </div>
                        <div className="ts-detail__content ts-detail__content--single">
                            <div className="ts-about-logo">
                                <div className="ts-about-logo__icon"><span>A</span></div>
                                <h3>AthlonX Trainer</h3>
                                <span>Version 2.4.1</span>
                            </div>
                            <div className="ts-settings-card ts-settings-card--full">
                                <div className="ts-link-list">
                                    <a href="#" className="ts-link-item"><span>📄</span><span>Terms of Service</span><ChevronRight size={14} /></a>
                                    <a href="#" className="ts-link-item"><span>🔒</span><span>Privacy Policy</span><ChevronRight size={14} /></a>
                                    <a href="#" className="ts-link-item"><span>📋</span><span>Licenses</span><ChevronRight size={14} /></a>
                                    <a href="#" className="ts-link-item"><span>💬</span><span>Send Feedback</span><ChevronRight size={14} /></a>
                                    <a href="#" className="ts-link-item"><span>❓</span><span>Help Center</span><ChevronRight size={14} /></a>
                                </div>
                            </div>
                            <div className="ts-about-footer">
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
        <div className="trainer-settings">
            <AnimatePresence mode="wait">
                {activeSection ? (
                    <motion.div
                        key="detail"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="ts-detail-wrapper"
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
                        className="ts-list-wrapper"
                    >
                        <div className="ts-header">
                            <h1>Settings</h1>
                        </div>
                        <div className="ts-sections">
                            {sections.map((section, index) => (
                                <motion.button
                                    key={section.id}
                                    className="ts-section-item"
                                    onClick={() => setActiveSection(section.id)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="ts-section-item__icon" style={{ background: section.gradient }}>{section.icon}</span>
                                    <div className="ts-section-item__text">
                                        <span className="ts-section-item__label">{section.label}</span>
                                        <span className="ts-section-item__desc">{section.desc}</span>
                                    </div>
                                    <ChevronRight size={16} className="ts-section-item__arrow" />
                                </motion.button>
                            ))}
                        </div>
<div className="ts-footer">
                              <button className="ts-logout-btn" onClick={handleLogout}><LogOut size={16} /><span>Log Out</span></button>
                          </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrainerSettings;
