import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, Moon, Sun, Save, Check, X, Eye, EyeOff,
    Smartphone, Laptop, Monitor, LogOut, Trash2, Download, Upload,
    Volume2, VolumeX, Vibrate, Clock, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './TrainerSettings.css';

const TrainerSettings: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(!document.documentElement.classList.contains('theme-light'));
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
        bio: 'Certified personal trainer with 8 years experience in strength training, HIIT, and functional fitness.',
    });

    const sections = [
        { 
            id: 'profile', 
            label: 'Profile', 
            icon: '👤',
            gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            desc: 'Name, photo, bio'
        },
        { 
            id: 'notifications', 
            label: 'Notifications', 
            icon: '🔔',
            gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
            desc: 'Alerts and sounds'
        },
        { 
            id: 'appearance', 
            label: 'Appearance', 
            icon: '🎨',
            gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            desc: 'Theme and display'
        },
        { 
            id: 'security', 
            label: 'Security', 
            icon: '🔐',
            gradient: 'linear-gradient(135deg, #10B981, #059669)',
            desc: 'Password and 2FA'
        },
        { 
            id: 'privacy', 
            label: 'Privacy', 
            icon: '🛡️',
            gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
            desc: 'Data and visibility'
        },
        { 
            id: 'language', 
            label: 'Language & Region', 
            icon: '🌍',
            gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
            desc: 'Time zone, format'
        },
        { 
            id: 'sessions', 
            label: 'Active Sessions', 
            icon: '📱',
            gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            desc: 'Logged in devices'
        },
        { 
            id: 'data', 
            label: 'Data & Storage', 
            icon: '💾',
            gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
            desc: 'Export and backup'
        },
        { 
            id: 'about', 
            label: 'About', 
            icon: 'ℹ️',
            gradient: 'linear-gradient(135deg, #64748B, #475569)',
            desc: 'Version and legal'
        },
    ];

    const activeSessions = [
        { id: 1, device: 'iPhone 15 Pro', location: 'Mumbai, India', lastActive: 'Active now', icon: Smartphone, current: true },
        { id: 2, device: 'MacBook Pro', location: 'Mumbai, India', lastActive: '2 hours ago', icon: Laptop, current: false },
        { id: 3, device: 'Chrome on Windows', location: 'Delhi, India', lastActive: '3 days ago', icon: Monitor, current: false },
    ];

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    const toggleTheme = (isDark: boolean) => {
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.remove('theme-light');
        } else {
            document.documentElement.classList.add('theme-light');
        }
        toast.success(`${isDark ? 'Dark' : 'Light'} mode enabled`);
    };

    const handleLogoutDevice = (deviceId: number) => {
        toast.success('Device logged out successfully');
    };

    useEffect(() => {
        setDarkMode(!document.documentElement.classList.contains('theme-light'));
    }, []);

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Profile</h2>
                            <button className="ts-detail__save" onClick={handleSave}>Save</button>
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-profile-photo">
                                <div className="ts-profile-photo__avatar">
                                    <span>JS</span>
                                </div>
                                <button className="ts-profile-photo__edit">Edit Photo</button>
                            </div>

                            <div className="ts-form-group">
                                <label>First Name</label>
                                <input 
                                    type="text" 
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                                />
                            </div>

                            <div className="ts-form-group">
                                <label>Last Name</label>
                                <input 
                                    type="text" 
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                                />
                            </div>

                            <div className="ts-form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    value={profile.email}
                                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                                />
                            </div>

                            <div className="ts-form-group">
                                <label>Phone</label>
                                <input 
                                    type="tel" 
                                    value={profile.phone}
                                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                />
                            </div>

                            <div className="ts-form-group">
                                <label>Bio</label>
                                <textarea 
                                    rows={4}
                                    value={profile.bio}
                                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Notifications</h2>
                            <div />
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                                        📧
                                    </span>
                                    <span>Push Notifications</span>
                                </div>
                                
                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Allow Notifications</span>
                                        <span className="ts-toggle-row__desc">Receive alerts on your device</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.push}
                                            onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Email Notifications</span>
                                        <span className="ts-toggle-row__desc">Get updates via email</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                            </div>

                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                                        📅
                                    </span>
                                    <span>Activity Alerts</span>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Booking Alerts</span>
                                        <span className="ts-toggle-row__desc">When someone books your class</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.bookings}
                                            onChange={(e) => setNotifications({...notifications, bookings: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Session Reminders</span>
                                        <span className="ts-toggle-row__desc">Before your scheduled sessions</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.reminders}
                                            onChange={(e) => setNotifications({...notifications, reminders: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Marketing</span>
                                        <span className="ts-toggle-row__desc">Promotional content and offers</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.marketing}
                                            onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                            </div>

                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                                        🔊
                                    </span>
                                    <span>Sounds & Haptics</span>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Sound</span>
                                        <span className="ts-toggle-row__desc">Play notification sounds</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.sound}
                                            onChange={(e) => setNotifications({...notifications, sound: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Vibration</span>
                                        <span className="ts-toggle-row__desc">Haptic feedback for alerts</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.vibration}
                                            onChange={(e) => setNotifications({...notifications, vibration: e.target.checked})}
                                        />
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
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Appearance</h2>
                            <div />
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
                                        🎨
                                    </span>
                                    <span>Theme</span>
                                </div>

                                <div className="ts-theme-grid">
                                    <button 
                                        className={`ts-theme-card ${darkMode ? 'ts-theme-card--active' : ''}`}
                                        onClick={() => toggleTheme(true)}
                                    >
                                        <div className="ts-theme-card__preview ts-theme-card__preview--dark">
                                            <Moon size={24} />
                                        </div>
                                        <span>Dark</span>
                                        {darkMode && <Check size={16} className="ts-theme-card__check" />}
                                    </button>
                                    <button 
                                        className={`ts-theme-card ${!darkMode ? 'ts-theme-card--active' : ''}`}
                                        onClick={() => toggleTheme(false)}
                                    >
                                        <div className="ts-theme-card__preview ts-theme-card__preview--light">
                                            <Sun size={24} />
                                        </div>
                                        <span>Light</span>
                                        {!darkMode && <Check size={16} className="ts-theme-card__check" />}
                                    </button>
                                </div>
                            </div>

                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)' }}>
                                        ❤️
                                    </span>
                                    <span>Accent Color</span>
                                </div>

                                <div className="ts-color-grid">
                                    {['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map((color) => (
                                        <button 
                                            key={color}
                                            className="ts-color-btn"
                                            style={{ background: color }}
                                        >
                                            {color === '#DC2626' && <Check size={16} />}
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
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Security</h2>
                            <div />
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                                        🔑
                                    </span>
                                    <span>Password</span>
                                </div>

                                <div className="ts-form-group">
                                    <label>Current Password</label>
                                    <div className="ts-input-with-icon">
                                        <input type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                                        <button onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="ts-form-group">
                                    <label>New Password</label>
                                    <input type="password" placeholder="Enter new password" />
                                </div>

                                <div className="ts-form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" placeholder="Confirm new password" />
                                </div>

                                <button className="ts-btn ts-btn--primary">Update Password</button>
                            </div>

                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                                        🔐
                                    </span>
                                    <span>Two-Factor Authentication</span>
                                </div>

                                <div className="ts-2fa-status">
                                    <div className="ts-2fa-status__badge ts-2fa-status__badge--enabled">
                                        <Check size={14} />
                                        Enabled
                                    </div>
                                    <p>Your account is protected with 2FA via authenticator app.</p>
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
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Privacy</h2>
                            <div />
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)' }}>
                                        👁️
                                    </span>
                                    <span>Visibility</span>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Profile Visibility</span>
                                        <span className="ts-toggle-row__desc">Allow members to view your profile</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={privacy.profileVisible}
                                            onChange={(e) => setPrivacy({...privacy, profileVisible: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Activity Status</span>
                                        <span className="ts-toggle-row__desc">Show when you're online</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={privacy.activityStatus}
                                            onChange={(e) => setPrivacy({...privacy, activityStatus: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>
                            </div>

                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #14B8A6, #0D9488)' }}>
                                        📊
                                    </span>
                                    <span>Data & Analytics</span>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Usage Analytics</span>
                                        <span className="ts-toggle-row__desc">Help improve the app with anonymous data</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={privacy.analytics}
                                            onChange={(e) => setPrivacy({...privacy, analytics: e.target.checked})}
                                        />
                                        <span className="ts-switch__slider" />
                                    </label>
                                </div>

                                <div className="ts-toggle-row">
                                    <div className="ts-toggle-row__info">
                                        <span className="ts-toggle-row__label">Location Services</span>
                                        <span className="ts-toggle-row__desc">Allow access to your location</span>
                                    </div>
                                    <label className="ts-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={privacy.locationServices}
                                            onChange={(e) => setPrivacy({...privacy, locationServices: e.target.checked})}
                                        />
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
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Language & Region</h2>
                            <button className="ts-detail__save" onClick={handleSave}>Save</button>
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)' }}>
                                        🌐
                                    </span>
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
                                        <option value="ja">🇯🇵 Japanese</option>
                                    </select>
                                </div>
                            </div>

                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                                        🕐
                                    </span>
                                    <span>Regional Settings</span>
                                </div>

                                <div className="ts-select-group">
                                    <label>Time Zone</label>
                                    <select defaultValue="ist">
                                        <option value="ist">IST (UTC+5:30) - India</option>
                                        <option value="pst">PST (UTC-8) - Pacific</option>
                                        <option value="est">EST (UTC-5) - Eastern</option>
                                        <option value="utc">UTC - Universal</option>
                                        <option value="gmt">GMT - Greenwich</option>
                                    </select>
                                </div>

                                <div className="ts-select-group">
                                    <label>Date Format</label>
                                    <select defaultValue="dd/mm/yyyy">
                                        <option value="dd/mm/yyyy">DD/MM/YYYY (31/12/2024)</option>
                                        <option value="mm/dd/yyyy">MM/DD/YYYY (12/31/2024)</option>
                                        <option value="yyyy-mm-dd">YYYY-MM-DD (2024-12-31)</option>
                                    </select>
                                </div>

                                <div className="ts-select-group">
                                    <label>Time Format</label>
                                    <select defaultValue="12h">
                                        <option value="12h">12-hour (2:30 PM)</option>
                                        <option value="24h">24-hour (14:30)</option>
                                    </select>
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
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Active Sessions</h2>
                            <div />
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
                                        📱
                                    </span>
                                    <span>Logged In Devices</span>
                                </div>

                                <div className="ts-devices-list">
                                    {activeSessions.map((session) => (
                                        <div key={session.id} className={`ts-device-item ${session.current ? 'ts-device-item--current' : ''}`}>
                                            <div className="ts-device-item__icon">
                                                <session.icon size={20} />
                                            </div>
                                            <div className="ts-device-item__info">
                                                <span className="ts-device-item__name">
                                                    {session.device}
                                                    {session.current && <span className="ts-device-item__badge">This Device</span>}
                                                </span>
                                                <span className="ts-device-item__meta">
                                                    {session.location} • {session.lastActive}
                                                </span>
                                            </div>
                                            {!session.current && (
                                                <button 
                                                    className="ts-device-item__logout"
                                                    onClick={() => handleLogoutDevice(session.id)}
                                                >
                                                    <LogOut size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button className="ts-btn ts-btn--danger">
                                    <LogOut size={16} />
                                    Log Out All Other Devices
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>Data & Storage</h2>
                            <div />
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #14B8A6, #0D9488)' }}>
                                        📤
                                    </span>
                                    <span>Export Data</span>
                                </div>

                                <p className="ts-settings-card__desc">
                                    Download a copy of your data including profile, sessions, and activity.
                                </p>

                                <button className="ts-btn ts-btn--secondary">
                                    <Download size={16} />
                                    Request Data Export
                                </button>
                            </div>

                            <div className="ts-settings-card">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                                        ☁️
                                    </span>
                                    <span>Backup</span>
                                </div>

                                <div className="ts-backup-status">
                                    <div className="ts-backup-status__info">
                                        <span>Last backup: Today, 2:30 PM</span>
                                        <span className="ts-backup-status__auto">Auto-backup enabled</span>
                                    </div>
                                    <button className="ts-btn ts-btn--ghost">
                                        <Upload size={16} />
                                        Backup Now
                                    </button>
                                </div>
                            </div>

                            <div className="ts-settings-card ts-settings-card--danger">
                                <div className="ts-settings-card__header">
                                    <span className="ts-settings-card__icon" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                                        ⚠️
                                    </span>
                                    <span>Danger Zone</span>
                                </div>

                                <p className="ts-settings-card__desc">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>

                                <button className="ts-btn ts-btn--danger">
                                    <Trash2 size={16} />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'about':
                return (
                    <div className="ts-detail">
                        <div className="ts-detail__header">
                            <button className="ts-detail__back" onClick={() => setActiveSection(null)}>
                                <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <h2>About</h2>
                            <div />
                        </div>
                        
                        <div className="ts-detail__content">
                            <div className="ts-about-logo">
                                <div className="ts-about-logo__icon">
                                    <span>A</span>
                                </div>
                                <h3>AthlonX Trainer</h3>
                                <span>Version 2.4.1 (Build 2024.12.01)</span>
                            </div>

                            <div className="ts-settings-card">
                                <div className="ts-link-list">
                                    <a href="#" className="ts-link-item">
                                        <span>📄</span>
                                        <span>Terms of Service</span>
                                        <ChevronRight size={16} />
                                    </a>
                                    <a href="#" className="ts-link-item">
                                        <span>🔒</span>
                                        <span>Privacy Policy</span>
                                        <ChevronRight size={16} />
                                    </a>
                                    <a href="#" className="ts-link-item">
                                        <span>📋</span>
                                        <span>Licenses</span>
                                        <ChevronRight size={16} />
                                    </a>
                                    <a href="#" className="ts-link-item">
                                        <span>💬</span>
                                        <span>Send Feedback</span>
                                        <ChevronRight size={16} />
                                    </a>
                                    <a href="#" className="ts-link-item">
                                        <span>❓</span>
                                        <span>Help Center</span>
                                        <ChevronRight size={16} />
                                    </a>
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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span 
                                        className="ts-section-item__icon"
                                        style={{ background: section.gradient }}
                                    >
                                        {section.icon}
                                    </span>
                                    <div className="ts-section-item__text">
                                        <span className="ts-section-item__label">{section.label}</span>
                                        <span className="ts-section-item__desc">{section.desc}</span>
                                    </div>
                                    <ChevronRight size={18} className="ts-section-item__arrow" />
                                </motion.button>
                            ))}
                        </div>

                        <div className="ts-footer">
                            <button className="ts-logout-btn">
                                <LogOut size={18} />
                                <span>Log Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrainerSettings;
