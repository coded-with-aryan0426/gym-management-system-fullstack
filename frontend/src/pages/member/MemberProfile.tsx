import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Activity, Save, Camera, Mail, Phone, Calendar,
    Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/macos-member.css';
import './MemberProfile.css';

interface ProfileData {
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt?: string;
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    fitnessGoals?: string[];
    healthConditions?: string;
}

type TabType = 'personal' | 'contact' | 'emergency' | 'preferences' | 'security';

const MemberProfile: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('personal');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        fitnessGoals: [] as string[],
        healthConditions: '',
    });

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) {
                setLoading(false);
                // Set mock data for development
                const mockProfile: ProfileData = {
                    fullName: user?.fullName || 'Sarah Wilson',
                    email: user?.email || 'sarah.wilson@email.com',
                    phoneNumber: '+1 (555) 123-4567',
                    createdAt: '2024-01-15',
                    dateOfBirth: '1995-01-15',
                    gender: 'Female',
                    bloodType: 'O+',
                    address: '123 Main Street, New York, NY 10001',
                    emergencyContact: 'John Wilson',
                    emergencyPhone: '+1 (555) 987-6543',
                    fitnessGoals: ['Weight Loss', 'General Fitness'],
                    healthConditions: ''
                };
                setProfile(mockProfile);
                setFormData({
                    fullName: mockProfile.fullName,
                    phoneNumber: mockProfile.phoneNumber || '',
                    dateOfBirth: mockProfile.dateOfBirth || '',
                    gender: mockProfile.gender || '',
                    bloodType: mockProfile.bloodType || '',
                    address: mockProfile.address || '',
                    emergencyContact: mockProfile.emergencyContact || '',
                    emergencyPhone: mockProfile.emergencyPhone || '',
                    fitnessGoals: mockProfile.fitnessGoals || [],
                    healthConditions: mockProfile.healthConditions || '',
                });
                return;
            }

            try {
                const response = await fetch(`/api/member/profile?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                    setFormData({
                        fullName: data.fullName || '',
                        phoneNumber: data.phoneNumber || '',
                        dateOfBirth: data.dateOfBirth || '',
                        gender: data.gender || '',
                        bloodType: data.bloodType || '',
                        address: data.address || '',
                        emergencyContact: data.emergencyContact || '',
                        emergencyPhone: data.emergencyPhone || '',
                        fitnessGoals: data.fitnessGoals || [],
                        healthConditions: data.healthConditions || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 800));
        toast.success('Profile updated successfully!');
        setSaving(false);
    };

    const handleGoalToggle = (goal: string) => {
        setFormData(prev => ({
            ...prev,
            fitnessGoals: prev.fitnessGoals.includes(goal)
                ? prev.fitnessGoals.filter(g => g !== goal)
                : [...prev.fitnessGoals, goal]
        }));
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'personal', label: 'Basic Info', icon: <User size={18} /> },
        { id: 'contact', label: 'Contact', icon: <Phone size={18} /> },
        { id: 'emergency', label: 'Emergency', icon: <Heart size={18} /> },
        { id: 'preferences', label: 'Preferences', icon: <Activity size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    ];

    const fitnessGoalOptions = [
        'Weight Loss', 'Muscle Gain', 'General Fitness',
        'Athletic Performance', 'Flexibility', 'Stress Relief'
    ];

    if (loading) {
        return (
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <User size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    const memberInitials = formData.fullName
        ? formData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'M';

    return (
        <motion.div
            className="macos-page member-profile-macos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header */}
            <header className="member-profile__header">
                <h1 className="macos-heading-xl">My Profile</h1>
                <p className="macos-text-md">Manage your personal information and account settings</p>
            </header>

            {/* Profile Card */}
            <motion.div
                className="glass-card glass-card--lg member-profile__hero"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="member-profile__avatar-section">
                    <div className="member-profile__avatar">
                        {memberInitials}
                        <button className="member-profile__avatar-edit" onClick={() => toast.success('Avatar upload coming soon!')}>
                            <Camera size={16} />
                        </button>
                    </div>
                    <div className="member-profile__user-info">
                        <h2 className="macos-heading-lg">{formData.fullName}</h2>
                        <div className="member-profile__user-meta">
                            <span className="macos-badge macos-badge--green">Active Member</span>
                            <span className="macos-text-sm">Member ID: #12345</span>
                        </div>
                        <p className="macos-text-sm" style={{ marginTop: '8px' }}>
                            <Mail size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                            {profile?.email}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="member-profile__tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`member-profile__tab ${activeTab === tab.id ? 'member-profile__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    className="glass-card glass-card--lg member-profile__content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <form onSubmit={handleSubmit}>
                        {activeTab === 'personal' && (
                            <div className="member-profile__form-grid">
                                <div className="macos-form-group">
                                    <label className="macos-form-label">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="macos-form-input"
                                        required
                                    />
                                </div>
                                <div className="macos-form-group">
                                    <label className="macos-form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="macos-form-input"
                                    />
                                </div>
                                <div className="macos-form-group">
                                    <label className="macos-form-label">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="macos-form-input"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="macos-form-group">
                                    <label className="macos-form-label">Blood Type</label>
                                    <select
                                        value={formData.bloodType}
                                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                        className="macos-form-input"
                                    >
                                        <option value="">Select blood type</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="member-profile__form-grid">
                                <div className="macos-form-group macos-form-group--full">
                                    <label className="macos-form-label">Email Address</label>
                                    <input
                                        type="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="macos-form-input macos-form-input--disabled"
                                    />
                                    <span className="macos-form-hint">Contact support to change email</span>
                                </div>
                                <div className="macos-form-group">
                                    <label className="macos-form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="macos-form-input"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                <div className="macos-form-group macos-form-group--full">
                                    <label className="macos-form-label">Address</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="macos-form-input"
                                        placeholder="123 Main Street, City, State 12345"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'emergency' && (
                            <div className="member-profile__form-grid">
                                <div className="member-profile__emergency-notice">
                                    <AlertCircle size={20} />
                                    <p>Emergency contact information is critical for your safety during workouts.</p>
                                </div>
                                <div className="macos-form-group">
                                    <label className="macos-form-label">Emergency Contact Name</label>
                                    <input
                                        type="text"
                                        value={formData.emergencyContact}
                                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                        className="macos-form-input"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="macos-form-group">
                                    <label className="macos-form-label">Emergency Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.emergencyPhone}
                                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                        className="macos-form-input"
                                        placeholder="+1 (555) 987-6543"
                                    />
                                </div>
                                <div className="macos-form-group macos-form-group--full">
                                    <label className="macos-form-label">Health Conditions / Notes</label>
                                    <textarea
                                        value={formData.healthConditions}
                                        onChange={(e) => setFormData({ ...formData, healthConditions: e.target.value })}
                                        className="macos-form-input macos-form-textarea"
                                        rows={3}
                                        placeholder="Any health conditions, allergies, or special notes for trainers..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="member-profile__form-grid">
                                <div className="macos-form-group macos-form-group--full">
                                    <label className="macos-form-label">Fitness Goals</label>
                                    <p className="macos-form-hint" style={{ marginBottom: '12px' }}>Select all that apply</p>
                                    <div className="member-profile__goals-grid">
                                        {fitnessGoalOptions.map((goal) => (
                                            <button
                                                key={goal}
                                                type="button"
                                                className={`member-profile__goal-chip ${formData.fitnessGoals.includes(goal) ? 'member-profile__goal-chip--active' : ''}`}
                                                onClick={() => handleGoalToggle(goal)}
                                            >
                                                {formData.fitnessGoals.includes(goal) && <CheckCircle2 size={14} />}
                                                {goal}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="member-profile__form-grid">
                                <div className="member-profile__security-card">
                                    <div className="member-profile__security-icon">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="macos-heading-sm">Password</h3>
                                        <p className="macos-text-sm">Last changed 30 days ago</p>
                                    </div>
                                    <button type="button" className="macos-btn macos-btn--secondary macos-btn--sm">
                                        Change Password
                                    </button>
                                </div>
                                <div className="member-profile__security-card">
                                    <div className="member-profile__security-icon member-profile__security-icon--success">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="macos-heading-sm">Two-Factor Authentication</h3>
                                        <p className="macos-text-sm">Enabled via SMS</p>
                                    </div>
                                    <button type="button" className="macos-btn macos-btn--ghost macos-btn--sm">
                                        Manage
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab !== 'security' && (
                            <div className="member-profile__form-actions">
                                <button type="button" className="macos-btn macos-btn--secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="macos-btn macos-btn--primary" disabled={saving}>
                                    <Save size={16} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default MemberProfile;
