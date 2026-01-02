import React, { useState } from 'react';
import { 
    User, Bell, Lock, Palette, Globe, Shield, 
    ChevronRight, Moon, Sun, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './TrainerSettings.css';

const TrainerSettings: React.FC = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        bookings: true,
        reminders: true,
        marketing: false,
    });

    const sections = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'language', label: 'Language & Region', icon: Globe },
        { id: 'privacy', label: 'Privacy', icon: Shield },
    ];

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('theme-light', darkMode);
    };

    return (
        <div className="trainer-settings">
            <div className="trainer-settings__header">
                <div className="trainer-settings__header-content">
                    <h1>Settings</h1>
                    <p>Manage your account preferences</p>
                </div>
            </div>

            <div className="trainer-settings__content">
                <div className="trainer-settings__sidebar">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`trainer-settings__nav-item ${activeSection === section.id ? 'trainer-settings__nav-item--active' : ''}`}
                        >
                            <section.icon size={18} />
                            <span>{section.label}</span>
                            <ChevronRight size={16} />
                        </button>
                    ))}
                </div>

                <div className="trainer-settings__main">
                    {activeSection === 'profile' && (
                        <div className="trainer-settings__section">
                            <h2>Profile Settings</h2>
                            <p className="trainer-settings__section-desc">Update your personal information</p>
                            
                            <div className="trainer-settings__form">
                                <div className="trainer-settings__form-row">
                                    <div className="trainer-settings__field">
                                        <label>First Name</label>
                                        <input type="text" defaultValue="John" />
                                    </div>
                                    <div className="trainer-settings__field">
                                        <label>Last Name</label>
                                        <input type="text" defaultValue="Smith" />
                                    </div>
                                </div>
                                <div className="trainer-settings__field">
                                    <label>Email Address</label>
                                    <input type="email" defaultValue="john.smith@athlonx.com" />
                                </div>
                                <div className="trainer-settings__field">
                                    <label>Phone Number</label>
                                    <input type="tel" defaultValue="+91 98765 43210" />
                                </div>
                                <div className="trainer-settings__field">
                                    <label>Bio</label>
                                    <textarea rows={4} defaultValue="Certified personal trainer with 8 years experience..." />
                                </div>
                            </div>

                            <button className="trainer-settings__save-btn" onClick={handleSave}>
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="trainer-settings__section">
                            <h2>Notification Preferences</h2>
                            <p className="trainer-settings__section-desc">Choose how you want to be notified</p>

                            <div className="trainer-settings__toggles">
                                <div className="trainer-settings__toggle-item">
                                    <div className="trainer-settings__toggle-info">
                                        <span className="trainer-settings__toggle-label">Email Notifications</span>
                                        <span className="trainer-settings__toggle-desc">Receive notifications via email</span>
                                    </div>
                                    <label className="trainer-settings__switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.email}
                                            onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                                        />
                                        <span className="trainer-settings__slider" />
                                    </label>
                                </div>

                                <div className="trainer-settings__toggle-item">
                                    <div className="trainer-settings__toggle-info">
                                        <span className="trainer-settings__toggle-label">Push Notifications</span>
                                        <span className="trainer-settings__toggle-desc">Receive push notifications on your device</span>
                                    </div>
                                    <label className="trainer-settings__switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.push}
                                            onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                                        />
                                        <span className="trainer-settings__slider" />
                                    </label>
                                </div>

                                <div className="trainer-settings__toggle-item">
                                    <div className="trainer-settings__toggle-info">
                                        <span className="trainer-settings__toggle-label">Booking Alerts</span>
                                        <span className="trainer-settings__toggle-desc">Get notified when someone books your class</span>
                                    </div>
                                    <label className="trainer-settings__switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.bookings}
                                            onChange={(e) => setNotifications({...notifications, bookings: e.target.checked})}
                                        />
                                        <span className="trainer-settings__slider" />
                                    </label>
                                </div>

                                <div className="trainer-settings__toggle-item">
                                    <div className="trainer-settings__toggle-info">
                                        <span className="trainer-settings__toggle-label">Session Reminders</span>
                                        <span className="trainer-settings__toggle-desc">Receive reminders before sessions</span>
                                    </div>
                                    <label className="trainer-settings__switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.reminders}
                                            onChange={(e) => setNotifications({...notifications, reminders: e.target.checked})}
                                        />
                                        <span className="trainer-settings__slider" />
                                    </label>
                                </div>

                                <div className="trainer-settings__toggle-item">
                                    <div className="trainer-settings__toggle-info">
                                        <span className="trainer-settings__toggle-label">Marketing Emails</span>
                                        <span className="trainer-settings__toggle-desc">Receive updates and promotional content</span>
                                    </div>
                                    <label className="trainer-settings__switch">
                                        <input 
                                            type="checkbox" 
                                            checked={notifications.marketing}
                                            onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
                                        />
                                        <span className="trainer-settings__slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="trainer-settings__section">
                            <h2>Appearance</h2>
                            <p className="trainer-settings__section-desc">Customize how the app looks</p>

                            <div className="trainer-settings__theme-selector">
                                <button 
                                    className={`trainer-settings__theme-option ${darkMode ? 'trainer-settings__theme-option--active' : ''}`}
                                    onClick={() => { setDarkMode(true); document.documentElement.classList.remove('theme-light'); }}
                                >
                                    <Moon size={24} />
                                    <span>Dark Mode</span>
                                </button>
                                <button 
                                    className={`trainer-settings__theme-option ${!darkMode ? 'trainer-settings__theme-option--active' : ''}`}
                                    onClick={() => { setDarkMode(false); document.documentElement.classList.add('theme-light'); }}
                                >
                                    <Sun size={24} />
                                    <span>Light Mode</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="trainer-settings__section">
                            <h2>Security</h2>
                            <p className="trainer-settings__section-desc">Manage your account security</p>

                            <div className="trainer-settings__security-items">
                                <div className="trainer-settings__security-item">
                                    <div className="trainer-settings__security-info">
                                        <span className="trainer-settings__security-label">Change Password</span>
                                        <span className="trainer-settings__security-desc">Last changed 30 days ago</span>
                                    </div>
                                    <button className="trainer-settings__security-btn">Update</button>
                                </div>

                                <div className="trainer-settings__security-item">
                                    <div className="trainer-settings__security-info">
                                        <span className="trainer-settings__security-label">Two-Factor Authentication</span>
                                        <span className="trainer-settings__security-desc trainer-settings__security-desc--success">Enabled</span>
                                    </div>
                                    <button className="trainer-settings__security-btn">Manage</button>
                                </div>

                                <div className="trainer-settings__security-item">
                                    <div className="trainer-settings__security-info">
                                        <span className="trainer-settings__security-label">Active Sessions</span>
                                        <span className="trainer-settings__security-desc">2 devices currently logged in</span>
                                    </div>
                                    <button className="trainer-settings__security-btn">View All</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'language' && (
                        <div className="trainer-settings__section">
                            <h2>Language & Region</h2>
                            <p className="trainer-settings__section-desc">Set your language and regional preferences</p>

                            <div className="trainer-settings__form">
                                <div className="trainer-settings__field">
                                    <label>Language</label>
                                    <select defaultValue="en">
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                                <div className="trainer-settings__field">
                                    <label>Time Zone</label>
                                    <select defaultValue="ist">
                                        <option value="ist">IST (UTC+5:30)</option>
                                        <option value="pst">PST (UTC-8)</option>
                                        <option value="est">EST (UTC-5)</option>
                                        <option value="utc">UTC</option>
                                    </select>
                                </div>
                                <div className="trainer-settings__field">
                                    <label>Date Format</label>
                                    <select defaultValue="dd/mm/yyyy">
                                        <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                                        <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                                        <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>

                            <button className="trainer-settings__save-btn" onClick={handleSave}>
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeSection === 'privacy' && (
                        <div className="trainer-settings__section">
                            <h2>Privacy</h2>
                            <p className="trainer-settings__section-desc">Control your privacy settings</p>

                            <div className="trainer-settings__toggles">
                                <div className="trainer-settings__toggle-item">
                                    <div className="trainer-settings__toggle-info">
                                        <span className="trainer-settings__toggle-label">Profile Visibility</span>
                                        <span className="trainer-settings__toggle-desc">Allow members to view your profile</span>
                                    </div>
                                    <label className="trainer-settings__switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="trainer-settings__slider" />
                                    </label>
                                </div>

                                <div className="trainer-settings__toggle-item">
                                    <div className="trainer-settings__toggle-info">
                                        <span className="trainer-settings__toggle-label">Show Activity Status</span>
                                        <span className="trainer-settings__toggle-desc">Let others see when you're online</span>
                                    </div>
                                    <label className="trainer-settings__switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="trainer-settings__slider" />
                                    </label>
                                </div>

                                <div className="trainer-settings__toggle-item">
                                    <div className="trainer-settings__toggle-info">
                                        <span className="trainer-settings__toggle-label">Data Analytics</span>
                                        <span className="trainer-settings__toggle-desc">Help improve the app by sharing usage data</span>
                                    </div>
                                    <label className="trainer-settings__switch">
                                        <input type="checkbox" />
                                        <span className="trainer-settings__slider" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerSettings;
