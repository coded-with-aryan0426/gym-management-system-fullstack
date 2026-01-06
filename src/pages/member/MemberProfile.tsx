import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Activity, Save, Camera, Mail, Phone, Calendar,
    Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Heart,
    MapPin, Droplet, Target, Award, Sparkles, ChevronRight,
    Edit3, X, Zap, TrendingUp, Clock, Fingerprint, Smartphone,
    Bell, Moon, Sun, Globe, CreditCard, Key
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

const AnimatedIcon: React.FC<{ children: React.ReactNode; isActive?: boolean }> = ({ children, isActive }) => (
    <motion.div
        animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex' }}
    >
        {children}
    </motion.div>
);

const PulsingBadge: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
    <motion.span
        className="profile-badge"
        style={{ background: `${color}20`, color }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
    >
        <motion.span
            className="profile-badge__dot"
            style={{ background: color }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
        {children}
    </motion.span>
);

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <motion.div 
        className="profile-stat"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
    >
        <motion.div 
            className="profile-stat__icon" 
            style={{ background: `${color}15`, color }}
            whileHover={{ rotate: [0, -10, 10, 0] }}
        >
            {icon}
        </motion.div>
        <div className="profile-stat__content">
            <span className="profile-stat__value">{value}</span>
            <span className="profile-stat__label">{label}</span>
        </div>
    </motion.div>
);

const MemberProfile: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('personal');
    const [showPassword, setShowPassword] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [hoveredGoal, setHoveredGoal] = useState<string | null>(null);

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
        await new Promise(resolve => setTimeout(resolve, 800));
        toast.success('Profile updated successfully!');
        setSaving(false);
        setEditMode(false);
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
        { id: 'personal', label: 'Personal', icon: <User size={18} /> },
        { id: 'contact', label: 'Contact', icon: <Phone size={18} /> },
        { id: 'emergency', label: 'Emergency', icon: <Heart size={18} /> },
        { id: 'preferences', label: 'Goals', icon: <Target size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    ];

    const fitnessGoalOptions = [
        { name: 'Weight Loss', icon: <TrendingUp size={16} />, color: '#FF9500' },
        { name: 'Muscle Gain', icon: <Zap size={16} />, color: '#FF3B30' },
        { name: 'General Fitness', icon: <Activity size={16} />, color: '#007AFF' },
        { name: 'Athletic Performance', icon: <Award size={16} />, color: '#AF52DE' },
        { name: 'Flexibility', icon: <Sparkles size={16} />, color: '#5AC8FA' },
        { name: 'Stress Relief', icon: <Heart size={16} />, color: '#34C759' }
    ];

    const memberStats = {
        memberSince: 'Jan 2024',
        workoutsCompleted: 156,
        streakDays: 7,
        achievements: 12
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <User size={32} />
                </motion.div>
            </div>
        );
    }

    const memberInitials = formData.fullName
        ? formData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'M';

    return (
        <motion.div
            className="member-profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div 
                className="profile-hero"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="profile-hero__bg" />
                <div className="profile-hero__pattern" />
                
                <div className="profile-hero__content">
                    <motion.div 
                        className="profile-avatar"
                        whileHover={{ scale: 1.05 }}
                    >
                        <motion.div 
                            className="profile-avatar__ring"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="profile-avatar__image">
                            {memberInitials}
                        </div>
                        <motion.button 
                            className="profile-avatar__edit"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toast.success('Avatar upload coming soon!')}
                        >
                            <Camera size={14} />
                        </motion.button>
                        <motion.div 
                            className="profile-avatar__status"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.div>

                    <div className="profile-hero__info">
                        <div className="profile-hero__name-row">
                            <h1 className="profile-hero__name">{formData.fullName}</h1>
                            <PulsingBadge color="#34C759">Active Member</PulsingBadge>
                        </div>
                        <p className="profile-hero__email">
                            <Mail size={14} />
                            {profile?.email}
                        </p>
                        <p className="profile-hero__id">Member ID: #12345</p>
                    </div>

                    <motion.button
                        className="profile-hero__edit-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? <X size={18} /> : <Edit3 size={18} />}
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </motion.button>
                </div>

                <div className="profile-stats">
                    <StatItem 
                        icon={<Calendar size={18} />} 
                        label="Member Since" 
                        value={memberStats.memberSince}
                        color="#007AFF"
                    />
                    <StatItem 
                        icon={<Activity size={18} />} 
                        label="Workouts" 
                        value={memberStats.workoutsCompleted.toString()}
                        color="#34C759"
                    />
                    <StatItem 
                        icon={<Zap size={18} />} 
                        label="Day Streak" 
                        value={memberStats.streakDays.toString()}
                        color="#FF9500"
                    />
                    <StatItem 
                        icon={<Award size={18} />} 
                        label="Achievements" 
                        value={memberStats.achievements.toString()}
                        color="#AF52DE"
                    />
                </div>
            </motion.div>

            <div className="profile-tabs">
                {tabs.map((tab, index) => (
                    <motion.button
                        key={tab.id}
                        className={`profile-tab ${activeTab === tab.id ? 'profile-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <AnimatedIcon isActive={activeTab === tab.id}>
                            {tab.icon}
                        </AnimatedIcon>
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div 
                                className="profile-tab__indicator"
                                layoutId="tabIndicator"
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    className="profile-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <form onSubmit={handleSubmit}>
                        {activeTab === 'personal' && (
                            <div className="profile-section">
                                <div className="profile-section__header">
                                    <h2 className="profile-section__title">
                                        <User size={20} />
                                        Personal Information
                                    </h2>
                                    <p className="profile-section__desc">Your basic personal details</p>
                                </div>

                                <div className="profile-form-grid">
                                    <motion.div 
                                        className="profile-field"
                                        whileHover={{ scale: editMode ? 1.01 : 1 }}
                                    >
                                        <label className="profile-field__label">
                                            <User size={14} />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className={`profile-field__input ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            readOnly={!editMode}
                                        />
                                    </motion.div>

                                    <motion.div 
                                        className="profile-field"
                                        whileHover={{ scale: editMode ? 1.01 : 1 }}
                                    >
                                        <label className="profile-field__label">
                                            <Calendar size={14} />
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                            className={`profile-field__input ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            readOnly={!editMode}
                                        />
                                    </motion.div>

                                    <motion.div 
                                        className="profile-field"
                                        whileHover={{ scale: editMode ? 1.01 : 1 }}
                                    >
                                        <label className="profile-field__label">
                                            <User size={14} />
                                            Gender
                                        </label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className={`profile-field__input ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            disabled={!editMode}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </motion.div>

                                    <motion.div 
                                        className="profile-field"
                                        whileHover={{ scale: editMode ? 1.01 : 1 }}
                                    >
                                        <label className="profile-field__label">
                                            <Droplet size={14} />
                                            Blood Type
                                        </label>
                                        <select
                                            value={formData.bloodType}
                                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                            className={`profile-field__input ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            disabled={!editMode}
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
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="profile-section">
                                <div className="profile-section__header">
                                    <h2 className="profile-section__title">
                                        <Phone size={20} />
                                        Contact Information
                                    </h2>
                                    <p className="profile-section__desc">How we can reach you</p>
                                </div>

                                <div className="profile-form-grid">
                                    <motion.div className="profile-field profile-field--full">
                                        <label className="profile-field__label">
                                            <Mail size={14} />
                                            Email Address
                                        </label>
                                        <div className="profile-field__locked">
                                            <input
                                                type="email"
                                                value={profile?.email || ''}
                                                className="profile-field__input profile-field__input--readonly"
                                                readOnly
                                            />
                                            <span className="profile-field__lock-badge">
                                                <Lock size={12} />
                                                Verified
                                            </span>
                                        </div>
                                        <span className="profile-field__hint">Contact support to change email</span>
                                    </motion.div>

                                    <motion.div 
                                        className="profile-field"
                                        whileHover={{ scale: editMode ? 1.01 : 1 }}
                                    >
                                        <label className="profile-field__label">
                                            <Phone size={14} />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className={`profile-field__input ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            readOnly={!editMode}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </motion.div>

                                    <motion.div className="profile-field profile-field--full">
                                        <label className="profile-field__label">
                                            <MapPin size={14} />
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className={`profile-field__input ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            readOnly={!editMode}
                                            placeholder="123 Main Street, City, State 12345"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'emergency' && (
                            <div className="profile-section">
                                <div className="profile-section__header">
                                    <h2 className="profile-section__title">
                                        <Heart size={20} />
                                        Emergency Information
                                    </h2>
                                    <p className="profile-section__desc">Critical info for your safety</p>
                                </div>

                                <motion.div 
                                    className="profile-alert"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <AlertCircle size={20} />
                                    </motion.div>
                                    <p>Emergency contact information is critical for your safety during workouts.</p>
                                </motion.div>

                                <div className="profile-form-grid">
                                    <motion.div 
                                        className="profile-field"
                                        whileHover={{ scale: editMode ? 1.01 : 1 }}
                                    >
                                        <label className="profile-field__label">
                                            <User size={14} />
                                            Emergency Contact Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.emergencyContact}
                                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                            className={`profile-field__input ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            readOnly={!editMode}
                                            placeholder="John Doe"
                                        />
                                    </motion.div>

                                    <motion.div 
                                        className="profile-field"
                                        whileHover={{ scale: editMode ? 1.01 : 1 }}
                                    >
                                        <label className="profile-field__label">
                                            <Phone size={14} />
                                            Emergency Contact Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.emergencyPhone}
                                            onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                            className={`profile-field__input ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            readOnly={!editMode}
                                            placeholder="+1 (555) 987-6543"
                                        />
                                    </motion.div>

                                    <motion.div className="profile-field profile-field--full">
                                        <label className="profile-field__label">
                                            <AlertCircle size={14} />
                                            Health Conditions / Notes
                                        </label>
                                        <textarea
                                            value={formData.healthConditions}
                                            onChange={(e) => setFormData({ ...formData, healthConditions: e.target.value })}
                                            className={`profile-field__input profile-field__textarea ${!editMode ? 'profile-field__input--readonly' : ''}`}
                                            readOnly={!editMode}
                                            rows={3}
                                            placeholder="Any health conditions, allergies, or special notes for trainers..."
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="profile-section">
                                <div className="profile-section__header">
                                    <h2 className="profile-section__title">
                                        <Target size={20} />
                                        Fitness Goals
                                    </h2>
                                    <p className="profile-section__desc">What you want to achieve</p>
                                </div>

                                <div className="profile-goals">
                                    {fitnessGoalOptions.map((goal, index) => {
                                        const isSelected = formData.fitnessGoals.includes(goal.name);
                                        return (
                                            <motion.button
                                                key={goal.name}
                                                type="button"
                                                className={`profile-goal ${isSelected ? 'profile-goal--active' : ''}`}
                                                onClick={() => editMode && handleGoalToggle(goal.name)}
                                                onHoverStart={() => setHoveredGoal(goal.name)}
                                                onHoverEnd={() => setHoveredGoal(null)}
                                                whileHover={{ scale: editMode ? 1.05 : 1, y: editMode ? -4 : 0 }}
                                                whileTap={{ scale: editMode ? 0.95 : 1 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                style={{
                                                    borderColor: isSelected ? goal.color : undefined,
                                                    background: isSelected ? `${goal.color}15` : undefined,
                                                    cursor: editMode ? 'pointer' : 'default'
                                                }}
                                            >
                                                <motion.div 
                                                    className="profile-goal__icon"
                                                    style={{ color: goal.color }}
                                                    animate={hoveredGoal === goal.name || isSelected ? { rotate: [0, -10, 10, 0] } : {}}
                                                >
                                                    {goal.icon}
                                                </motion.div>
                                                <span className="profile-goal__name">{goal.name}</span>
                                                {isSelected && (
                                                    <motion.div 
                                                        className="profile-goal__check"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        style={{ color: goal.color }}
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {!editMode && (
                                    <p className="profile-goals__hint">Click "Edit Profile" to change your goals</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="profile-section">
                                <div className="profile-section__header">
                                    <h2 className="profile-section__title">
                                        <Shield size={20} />
                                        Security Settings
                                    </h2>
                                    <p className="profile-section__desc">Protect your account</p>
                                </div>

                                <div className="profile-security">
                                    <motion.div 
                                        className="security-card"
                                        whileHover={{ scale: 1.01, x: 4 }}
                                    >
                                        <motion.div 
                                            className="security-card__icon"
                                            whileHover={{ rotate: [0, -10, 10, 0] }}
                                        >
                                            <Key size={22} />
                                        </motion.div>
                                        <div className="security-card__content">
                                            <h3 className="security-card__title">Password</h3>
                                            <p className="security-card__desc">Last changed 30 days ago</p>
                                        </div>
                                        <motion.button 
                                            className="security-card__btn"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Change
                                            <ChevronRight size={16} />
                                        </motion.button>
                                    </motion.div>

                                    <motion.div 
                                        className="security-card security-card--success"
                                        whileHover={{ scale: 1.01, x: 4 }}
                                    >
                                        <motion.div 
                                            className="security-card__icon security-card__icon--success"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Smartphone size={22} />
                                        </motion.div>
                                        <div className="security-card__content">
                                            <h3 className="security-card__title">Two-Factor Authentication</h3>
                                            <p className="security-card__desc">Enabled via SMS</p>
                                        </div>
                                        <motion.span className="security-card__status">
                                            <CheckCircle2 size={16} />
                                            Enabled
                                        </motion.span>
                                    </motion.div>

                                    <motion.div 
                                        className="security-card"
                                        whileHover={{ scale: 1.01, x: 4 }}
                                    >
                                        <motion.div 
                                            className="security-card__icon"
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Fingerprint size={22} />
                                        </motion.div>
                                        <div className="security-card__content">
                                            <h3 className="security-card__title">Biometric Login</h3>
                                            <p className="security-card__desc">Face ID / Touch ID</p>
                                        </div>
                                        <motion.button 
                                            className="security-card__btn"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Setup
                                            <ChevronRight size={16} />
                                        </motion.button>
                                    </motion.div>

                                    <motion.div 
                                        className="security-card"
                                        whileHover={{ scale: 1.01, x: 4 }}
                                    >
                                        <motion.div className="security-card__icon">
                                            <Clock size={22} />
                                        </motion.div>
                                        <div className="security-card__content">
                                            <h3 className="security-card__title">Login History</h3>
                                            <p className="security-card__desc">View recent activity</p>
                                        </div>
                                        <motion.button 
                                            className="security-card__btn"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            View
                                            <ChevronRight size={16} />
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {editMode && activeTab !== 'security' && (
                            <motion.div 
                                className="profile-actions"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <motion.button 
                                    type="button" 
                                    className="profile-btn profile-btn--secondary"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setEditMode(false)}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button 
                                    type="submit" 
                                    className="profile-btn profile-btn--primary"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Activity size={16} />
                                        </motion.div>
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </motion.button>
                            </motion.div>
                        )}
                    </form>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default MemberProfile;
