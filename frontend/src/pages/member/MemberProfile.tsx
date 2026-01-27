import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Activity, Save, Camera, Mail, Phone, Calendar,
    Shield, Heart, MapPin, Droplet, Target, Award, Sparkles, 
    ChevronRight, Edit3, X, Zap, TrendingUp, Clock, Fingerprint, 
    Smartphone, AlertCircle, CheckCircle2, CreditCard, History, 
    Trophy, Star, Download, QrCode, ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { memberProfileApi, MemberProfileData, MemberProfileUpdate } from '../../api/memberProfileApi';
import '../../styles/macos-member.css';
import './MemberProfile.css';

type TabType = 'overview' | 'personal' | 'contact' | 'emergency' | 'preferences' | 'security';

const PulsingBadge: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
    <motion.span
        className="profile-badge"
        style={{ background: `${color}15`, color }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
    >
        {children}
    </motion.span>
);

const StatMini: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="profile-stat-mini">
        <div className="profile-stat-mini__header">
            <span className="profile-stat-mini__value">{value}</span>
            {icon && <span className="profile-stat-mini__icon">{icon}</span>}
        </div>
        <span className="profile-stat-mini__label">{label}</span>
    </div>
);

const AchievementCard: React.FC<{ title: string; date: string; icon: React.ReactNode; color: string }> = ({ title, date, icon, color }) => (
    <div className="achievement-card">
        <div className="achievement-card__icon" style={{ background: `${color}15`, color }}>
            {icon}
        </div>
        <div className="achievement-card__info">
            <div className="achievement-card__title">{title}</div>
            <div className="achievement-card__date">{date}</div>
        </div>
    </div>
);

const MemberProfile: React.FC = () => {
    const [profile, setProfile] = useState<MemberProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [editMode, setEditMode] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        healthNotes: '',
        fitnessGoals: [] as string[],
        height: null as number | null,
        weight: null as number | null,
        bodyFat: null as number | null,
    });

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                const data = await memberProfileApi.getProfile(user.id);
                setProfile(data);
                setFormData({
                    fullName: data.fullName || '',
                    phone: data.phone || '',
                    dateOfBirth: data.dateOfBirth || '',
                    gender: data.gender || '',
                    bloodType: data.bloodType || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    zipCode: data.zipCode || '',
                    emergencyContactName: data.emergencyContactName || '',
                    emergencyContactPhone: data.emergencyContactPhone || '',
                    healthNotes: data.healthNotes || '',
                    fitnessGoals: data.fitnessGoals || [],
                    height: data.height,
                    weight: data.weight,
                    bodyFat: data.bodyFat,
                });
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user?.id]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user?.id) return;

        setSaving(true);
        try {
            const updateData: MemberProfileUpdate = {
                fullName: formData.fullName,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth || undefined,
                gender: formData.gender || undefined,
                bloodType: formData.bloodType || undefined,
                address: formData.address || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                zipCode: formData.zipCode || undefined,
                emergencyContactName: formData.emergencyContactName || undefined,
                emergencyContactPhone: formData.emergencyContactPhone || undefined,
                healthNotes: formData.healthNotes || undefined,
                fitnessGoals: formData.fitnessGoals,
                height: formData.height || undefined,
                weight: formData.weight || undefined,
                bodyFat: formData.bodyFat || undefined,
            };

            const updated = await memberProfileApi.updateProfile(user.id, updateData);
            setProfile(updated);
            toast.success('Profile updated successfully!');
            setEditMode(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
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
        { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
        { id: 'personal', label: 'Personal', icon: <User size={16} /> },
        { id: 'contact', label: 'Contact', icon: <Phone size={16} /> },
        { id: 'emergency', label: 'Emergency', icon: <Heart size={16} /> },
        { id: 'preferences', label: 'Goals', icon: <Target size={16} /> },
        { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    ];

    const fitnessGoalOptions = [
        { name: 'Weight Loss', icon: <TrendingUp size={14} />, color: '#FF9500' },
        { name: 'Muscle Gain', icon: <Zap size={14} />, color: '#FF3B30' },
        { name: 'General Fitness', icon: <Activity size={14} />, color: '#007AFF' },
        { name: 'Athletic Performance', icon: <Award size={14} />, color: '#AF52DE' },
        { name: 'Flexibility', icon: <Sparkles size={14} />, color: '#5AC8FA' },
        { name: 'Stress Relief', icon: <Heart size={14} />, color: '#34C759' }
    ];

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Not set';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Activity size={32} />
                </motion.div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-loading">
                <AlertCircle size={32} />
                <p>Please log in to view your profile</p>
            </div>
        );
    }

    const memberInitials = formData.fullName
        ? formData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'M';

    const stats = profile.stats;
    const membership = profile.membership;
    const achievements = profile.achievements || [];

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
                    <div className="profile-avatar">
                        <motion.div 
                            className="profile-avatar__ring"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="profile-avatar__image">{memberInitials}</div>
                        <button className="profile-avatar__edit" title="Upload Photo">
                            <Camera size={14} />
                        </button>
                        <div className="profile-avatar__status" />
                    </div>

                    <div className="profile-hero__info">
                        <div className="profile-hero__name-row">
                            <h1 className="profile-hero__name">{formData.fullName}</h1>
                            <PulsingBadge color={profile.status === 'Active' ? '#34C759' : '#FF9500'}>
                                {profile.status || 'Active'}
                            </PulsingBadge>
                        </div>
                        <p className="profile-hero__email">
                            <Mail size={12} />
                            {profile.email}
                        </p>
                        <p className="profile-hero__id">ID: #{profile.userId}</p>
                    </div>

                    <div className="profile-stats-inline">
                        <StatMini 
                            label="Joined" 
                            value={stats?.joinedDate ? formatDate(stats.joinedDate) : 'N/A'} 
                            icon={<Calendar size={12} />} 
                        />
                        <StatMini 
                            label="Workouts" 
                            value={String(stats?.totalWorkouts || 0)} 
                            icon={<Activity size={12} />} 
                        />
                        <StatMini 
                            label="Streak" 
                            value={`${stats?.currentStreak || 0}d`} 
                            icon={<Zap size={12} />} 
                        />
                        <StatMini 
                            label="Level" 
                            value={stats?.memberLevel || 'Beginner'} 
                            icon={<Trophy size={12} />} 
                        />
                    </div>

                    <motion.button
                        className="profile-hero__edit-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? <X size={16} /> : <Edit3 size={16} />}
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </motion.button>
                </div>
            </motion.div>

            <div className="profile-layout-grid">
                <div className="profile-main-content">
                    <div className="profile-tabs-compact">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`profile-tab-compact ${activeTab === tab.id ? 'profile-tab-compact--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            className="profile-content-mini"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <form onSubmit={handleSubmit}>
                                {activeTab === 'overview' && (
                                    <div className="profile-overview-tab">
                                        <div className="overview-section">
                                            <h3 className="section-title"><User size={14} /> Personal Profile</h3>
                                            <div className="profile-summary-grid">
                                                <div className="summary-item">
                                                    <span className="summary-label">Full Name</span>
                                                    <span className="summary-value">{formData.fullName}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Birthday</span>
                                                    <span className="summary-value">{formData.dateOfBirth || 'Not set'}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Gender</span>
                                                    <span className="summary-value">{formData.gender || 'Not set'}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Blood Type</span>
                                                    <span className="summary-value"><Droplet size={12} color="#FF3B30" /> {formData.bloodType || 'Not set'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="overview-section">
                                            <h3 className="section-title"><Award size={14} /> Recent Achievements</h3>
                                            <div className="achievements-grid">
                                                {achievements.length > 0 ? (
                                                    achievements.slice(0, 3).map((achievement) => (
                                                        <AchievementCard 
                                                            key={achievement.id}
                                                            title={achievement.name} 
                                                            date={getRelativeTime(achievement.earnedAt)} 
                                                            icon={<Trophy size={16} />} 
                                                            color="#FF9500" 
                                                        />
                                                    ))
                                                ) : (
                                                    <>
                                                        <AchievementCard 
                                                            title="Getting Started" 
                                                            date="Complete your first workout" 
                                                            icon={<Clock size={16} />} 
                                                            color="#8E8E93" 
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="overview-section">
                                            <h3 className="section-title"><TrendingUp size={14} /> Fitness Progress</h3>
                                            <div className="progress-mini-grid">
                                                <div className="progress-item">
                                                    <div className="progress-item__header">
                                                        <span>Workout Streak</span>
                                                        <span>{stats?.currentStreak || 0} days</span>
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${Math.min((stats?.currentStreak || 0) * 10, 100)}%`, background: '#007AFF' }} />
                                                    </div>
                                                </div>
                                                <div className="progress-item">
                                                    <div className="progress-item__header">
                                                        <span>Total Workouts</span>
                                                        <span>{stats?.totalWorkouts || 0}</span>
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${Math.min((stats?.totalWorkouts || 0) / 2, 100)}%`, background: '#AF52DE' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="overview-section">
                                            <h3 className="section-title"><Target size={14} /> Active Goals</h3>
                                            <div className="goals-tags">
                                                {formData.fitnessGoals.length > 0 ? (
                                                    formData.fitnessGoals.map(goal => (
                                                        <span key={goal} className="goal-tag">
                                                            {fitnessGoalOptions.find(g => g.name === goal)?.icon}
                                                            {goal}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="goal-tag" style={{ opacity: 0.5 }}>No active goals</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'personal' && (
                                    <div className="profile-form-grid-compact">
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><User size={12} />Name</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    placeholder="Full Name"
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><Calendar size={12} />Birthday</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><User size={12} />Gender</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <select
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    disabled={!editMode}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><Droplet size={12} />Blood</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <select
                                                    value={formData.bloodType}
                                                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    disabled={!editMode}
                                                >
                                                    <option value="">Select Blood Type</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'contact' && (
                                    <div className="profile-form-grid-compact">
                                        <div className="profile-field-compact profile-field-compact--full">
                                            <label className="profile-field-compact__label"><Mail size={12} />Email</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="email"
                                                    value={profile?.email || ''}
                                                    className="profile-field-compact__input profile-field-compact__input--readonly"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><Phone size={12} />Phone</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact profile-field-compact--full">
                                            <label className="profile-field-compact__label"><MapPin size={12} />Address</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><MapPin size={12} />City</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><MapPin size={12} />State</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="text"
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><MapPin size={12} />Zip Code</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="text"
                                                    value={formData.zipCode}
                                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'emergency' && (
                                    <div className="profile-form-grid-compact">
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><User size={12} />Contact Name</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="text"
                                                    value={formData.emergencyContactName}
                                                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact">
                                            <label className="profile-field-compact__label"><Phone size={12} />Contact Phone</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <input
                                                    type="tel"
                                                    value={formData.emergencyContactPhone}
                                                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                />
                                            </div>
                                        </div>
                                        <div className="profile-field-compact profile-field-compact--full">
                                            <label className="profile-field-compact__label"><AlertCircle size={12} />Health Notes</label>
                                            <div className="profile-field-compact__input-wrapper">
                                                <textarea
                                                    value={formData.healthNotes}
                                                    onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
                                                    className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                    readOnly={!editMode}
                                                    rows={2}
                                                    style={{ resize: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'preferences' && (
                                    <div className="goals-selection-grid">
                                        {fitnessGoalOptions.map((goal) => (
                                            <button
                                                key={goal.name}
                                                type="button"
                                                className={`goal-option-card ${formData.fitnessGoals.includes(goal.name) ? 'goal-option-card--active' : ''}`}
                                                onClick={() => handleGoalToggle(goal.name)}
                                            >
                                                <div className="goal-option-card__icon" style={{ color: goal.color }}>
                                                    {goal.icon}
                                                </div>
                                                {goal.name}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="profile-form-grid-compact">
                                        <div className="profile-field-compact profile-field-compact--full security-item">
                                            <div className="security-item__content">
                                                <Lock size={16} />
                                                <div>
                                                    <div className="security-item__title">Password</div>
                                                    <div className="security-item__subtitle">Change your password</div>
                                                </div>
                                            </div>
                                            <button className="profile-btn-compact profile-btn-compact--secondary" type="button">Change</button>
                                        </div>
                                        <div className="profile-field-compact profile-field-compact--full security-item">
                                            <div className="security-item__content">
                                                <Shield size={16} />
                                                <div>
                                                    <div className="security-item__title">Two-Factor Auth</div>
                                                    <div className="security-item__subtitle">Protect your account</div>
                                                </div>
                                            </div>
                                            <PulsingBadge color={profile.twoFactorEnabled ? '#34C759' : '#FF9500'}>
                                                {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                            </PulsingBadge>
                                        </div>
                                        <div className="profile-field-compact profile-field-compact--full security-item">
                                            <div className="security-item__content">
                                                <Smartphone size={16} />
                                                <div>
                                                    <div className="security-item__title">Authorized Devices</div>
                                                    <div className="security-item__subtitle">Manage your sessions</div>
                                                </div>
                                            </div>
                                            <button className="profile-btn-compact profile-btn-compact--secondary" type="button">Manage</button>
                                        </div>
                                    </div>
                                )}

                                {editMode && activeTab !== 'security' && activeTab !== 'overview' && activeTab !== 'preferences' && (
                                    <div className="profile-actions-compact">
                                        <button 
                                            type="button" 
                                            className="profile-btn-compact profile-btn-compact--secondary"
                                            onClick={() => setEditMode(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="profile-btn-compact profile-btn-compact--primary"
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                                
                                {activeTab === 'preferences' && (
                                    <div className="profile-actions-compact">
                                        <button 
                                            type="button"
                                            className="profile-btn-compact profile-btn-compact--primary"
                                            onClick={handleSubmit}
                                            disabled={saving}
                                        >
                                            {saving ? 'Updating Goals...' : 'Update Goals'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="profile-sidebar">
                    <div className="sidebar-widget membership-widget">
                        <div className="widget-header">
                            <h3 className="widget-title"><CreditCard size={14} /> Membership</h3>
                            <ArrowUpRight size={14} className="widget-icon-link" />
                        </div>
                        {membership ? (
                            <div className="membership-card">
                                <div className="membership-type">{membership.planName}</div>
                                <div className="membership-expiry">Expires: {new Date(membership.endDate).toLocaleDateString()}</div>
                                <div className="membership-status-bar">
                                    <div className="status-bar-fill" style={{ width: `${Math.min(Math.max(membership.daysRemaining / 365 * 100, 5), 100)}%` }} />
                                </div>
                                <div className="membership-days-left">{membership.daysRemaining} days remaining</div>
                            </div>
                        ) : (
                            <div className="membership-card">
                                <div className="membership-type">No Active Membership</div>
                                <div className="membership-expiry">Subscribe to get started</div>
                            </div>
                        )}
                        <button className="widget-action-btn primary">
                            {membership ? 'Renew Membership' : 'Get Membership'}
                        </button>
                    </div>

                    <div className="sidebar-widget quick-actions-widget">
                        <h3 className="widget-title"><Zap size={14} /> Quick Actions</h3>
                        <div className="quick-actions-grid">
                            <button className="action-btn">
                                <QrCode size={18} />
                                <span>Check-in QR</span>
                            </button>
                            <button className="action-btn">
                                <History size={18} />
                                <span>History</span>
                            </button>
                            <button className="action-btn">
                                <Download size={18} />
                                <span>ID Card</span>
                            </button>
                            <button className="action-btn">
                                <Star size={18} />
                                <span>Reviews</span>
                            </button>
                        </div>
                    </div>

                    <div className="sidebar-widget status-summary-widget">
                        <h3 className="widget-title"><Activity size={14} /> Body Stats</h3>
                        <div className="body-stats-list">
                            <div className="body-stat-item">
                                <span className="stat-label">Height</span>
                                <span className="stat-value">{formData.height ? `${formData.height} cm` : 'Not set'}</span>
                            </div>
                            <div className="body-stat-item">
                                <span className="stat-label">Weight</span>
                                <span className="stat-value">{formData.weight ? `${formData.weight} kg` : 'Not set'}</span>
                            </div>
                            <div className="body-stat-item">
                                <span className="stat-label">Body Fat</span>
                                <span className="stat-value">{formData.bodyFat ? `${formData.bodyFat}%` : 'Not set'}</span>
                            </div>
                        </div>
                        <button className="widget-action-btn" onClick={() => {setActiveTab('personal'); setEditMode(true);}}>Update Stats</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MemberProfile;
