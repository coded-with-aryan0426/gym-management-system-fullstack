import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Activity, Save, Camera, Mail, Phone, Calendar,
    Shield, Heart, MapPin, Droplet, Target, Award, Sparkles,
    ChevronRight, Edit3, X, Zap, TrendingUp, Clock, Fingerprint,
    Smartphone, AlertCircle, CheckCircle2, CreditCard, History,
    Trophy, Star, Download, QrCode, ArrowUpRight, Check, Ruler,
    Scale, Percent, Users, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { memberProfileApi, type MemberProfileData, type MemberProfileUpdate } from '../../api/memberProfileApi';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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
    const [assignedTrainer, setAssignedTrainer] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [trainerLoading, setTrainerLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [editMode, setEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalFormData, setOriginalFormData] = useState<any | null>(null);

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

    const { user, isLoading: authLoading } = useAuth();

    const checkForChanges = useCallback((newData: typeof formData, original: typeof formData | null) => {
        if (!original) return false;
        return JSON.stringify(newData) !== JSON.stringify(original);
    }, []);

    const updateFormData = useCallback((updates: Partial<typeof formData>) => {
        setFormData(prev => {
            const newData = { ...prev, ...updates };
            setHasChanges(checkForChanges(newData, originalFormData));
            return newData;
        });
    }, [originalFormData, checkForChanges]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (authLoading) return;
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                const data = await memberProfileApi.getProfile(Number(user.id));
                setProfile(data);
                const initialFormData = {
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
                };
                setFormData(initialFormData);
                setOriginalFormData(initialFormData);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        const fetchAssignedTrainer = async () => {
            if (authLoading || !user?.id) return;
            try {
                const response = await api.get('/member/trainers/assigned');
                if (response.data && response.data.length > 0) {
                    setAssignedTrainer(response.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch assigned trainer:', error);
            } finally {
                setTrainerLoading(false);
            }
        };

        fetchProfile();
        fetchAssignedTrainer();
    }, [user?.id, authLoading]);

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

            const updated = await memberProfileApi.updateProfile(Number(user.id), updateData);
            setProfile(updated);
            setOriginalFormData({ ...formData });
            setHasChanges(false);
            toast.success('Profile updated successfully!');
            setEditMode(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (originalFormData) {
            setFormData(originalFormData);
        }
        setHasChanges(false);
        setEditMode(false);
    };

    const handleGoalToggle = (goal: string) => {
        setFormData(prev => {
            const newGoals = prev.fitnessGoals.includes(goal)
                ? prev.fitnessGoals.filter(g => g !== goal)
                : [...prev.fitnessGoals, goal];
            const newData = { ...prev, fitnessGoals: newGoals };
            setHasChanges(checkForChanges(newData, originalFormData));
            return newData;
        });
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
        { name: 'Weight Loss', icon: <TrendingUp size={18} />, color: '#FF9500' },
        { name: 'Muscle Gain', icon: <Zap size={18} />, color: '#FF3B30' },
        { name: 'General Fitness', icon: <Activity size={18} />, color: '#007AFF' },
        { name: 'Athletic Performance', icon: <Award size={18} />, color: '#AF52DE' },
        { name: 'Flexibility', icon: <Sparkles size={18} />, color: '#5AC8FA' },
        { name: 'Stress Relief', icon: <Heart size={18} />, color: '#34C759' }
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

    if (authLoading || loading) {
        return (
            <div className="profile-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Activity size={32} />
                </motion.div>
                <p>{authLoading ? 'Verifying session...' : 'Loading profile...'}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-loading">
                <AlertCircle size={32} />
                <p>Please log in to view your profile</p>
                <button 
                    className="macos-btn macos-btn--primary" 
                    onClick={() => window.location.href = '/login'}
                    style={{ marginTop: '16px' }}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-loading">
                <AlertCircle size={32} />
                <p>Unable to load profile data</p>
                <button 
                    className="macos-btn macos-btn--secondary" 
                    onClick={() => window.location.reload()}
                    style={{ marginTop: '16px' }}
                >
                    Retry
                </button>
            </div>
        );
    }


    const memberInitials = formData.fullName
        ? formData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'M';

    const stats = profile.stats;
    const membership = profile.membership;
    const achievements = profile.achievements || [];

    const renderSectionHeader = (title: string, icon: React.ReactNode, showEditHint?: boolean) => (
        <div className="section-header">
            <h3 className="section-title">
                {icon}
                <span>{title}</span>
            </h3>
            {editMode && showEditHint && (
                <span className="section-edit-hint">Click fields to edit</span>
            )}
        </div>
    );

    const renderSaveBar = () => (
        editMode && hasChanges && (
            <motion.div
                className="section-save-bar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    type="button"
                    className="section-save-btn section-save-btn--cancel"
                    onClick={handleCancelEdit}
                >
                    <X size={14} />
                    Discard Changes
                </button>
                <button
                    type="button"
                    className="section-save-btn section-save-btn--save"
                    onClick={() => handleSubmit()}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Activity size={14} />
                            </motion.div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={14} />
                            Save Changes
                        </>
                    )}
                </button>
            </motion.div>
        )
    );

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
                            <h1 className="profile-hero__name">{formData.fullName || 'Member'}</h1>
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
                        className={`profile-hero__edit-btn ${editMode ? 'profile-hero__edit-btn--active' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => editMode ? handleCancelEdit() : setEditMode(true)}
                    >
                        {editMode ? <X size={16} /> : <Edit3 size={16} />}
                        {editMode ? 'Cancel Edit' : 'Edit Profile'}
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
                            className={`profile-content-mini ${editMode ? 'profile-content-mini--edit-mode' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <form onSubmit={handleSubmit}>
                                {activeTab === 'overview' && (
                                    <div className="profile-overview-tab">
                                        <div className="overview-section">
                                            {renderSectionHeader('Personal Profile', <User size={14} />, true)}
                                            <div className="profile-summary-grid">
                                                <div className="summary-item">
                                                    <span className="summary-label">Full Name</span>
                                                    {editMode ? (
                                                        <input
                                                            type="text"
                                                            value={formData.fullName}
                                                            onChange={(e) => updateFormData({ fullName: e.target.value })}
                                                            className="summary-input"
                                                            placeholder="Enter your name"
                                                        />
                                                    ) : (
                                                        <span className="summary-value">{formData.fullName || 'Not set'}</span>
                                                    )}
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Birthday</span>
                                                    {editMode ? (
                                                        <input
                                                            type="date"
                                                            value={formData.dateOfBirth}
                                                            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                                                            className="summary-input"
                                                        />
                                                    ) : (
                                                        <span className="summary-value">{formData.dateOfBirth || 'Not set'}</span>
                                                    )}
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Gender</span>
                                                    {editMode ? (
                                                        <select
                                                            value={formData.gender}
                                                            onChange={(e) => updateFormData({ gender: e.target.value })}
                                                            className="summary-input"
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    ) : (
                                                        <span className="summary-value">{formData.gender || 'Not set'}</span>
                                                    )}
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Blood Type</span>
                                                    {editMode ? (
                                                        <select
                                                            value={formData.bloodType}
                                                            onChange={(e) => updateFormData({ bloodType: e.target.value })}
                                                            className="summary-input"
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
                                                    ) : (
                                                        <span className="summary-value"><Droplet size={12} color="#FF3B30" /> {formData.bloodType || 'Not set'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="overview-section">
                                            {renderSectionHeader('Recent Achievements', <Award size={14} />)}
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
                                                        <AchievementCard
                                                            title="First Week"
                                                            date="Train for 7 days"
                                                            icon={<Calendar size={16} />}
                                                            color="#8E8E93"
                                                        />
                                                        <AchievementCard
                                                            title="Profile Complete"
                                                            date="Fill in all details"
                                                            icon={<CheckCircle2 size={16} />}
                                                            color="#8E8E93"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="overview-section">
                                            {renderSectionHeader('Fitness Progress', <TrendingUp size={14} />)}
                                            <div className="progress-mini-grid">
                                                <div className="progress-item">
                                                    <div className="progress-item__header">
                                                        <span>Workout Streak</span>
                                                        <span>{stats?.currentStreak || 0} days</span>
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${Math.min((stats?.currentStreak || 0) * 10, 100)}%`, background: 'linear-gradient(90deg, #007AFF, #5AC8FA)' }} />
                                                    </div>
                                                </div>
                                                <div className="progress-item">
                                                    <div className="progress-item__header">
                                                        <span>Total Workouts</span>
                                                        <span>{stats?.totalWorkouts || 0}</span>
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${Math.min((stats?.totalWorkouts || 0) / 2, 100)}%`, background: 'linear-gradient(90deg, #AF52DE, #FF9500)' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="overview-section">
                                            {renderSectionHeader('Active Goals', <Target size={14} />, editMode)}
                                            {editMode ? (
                                                <div className="goals-selection-inline">
                                                    {fitnessGoalOptions.map((goal) => (
                                                        <button
                                                            key={goal.name}
                                                            type="button"
                                                            className={`goal-chip ${formData.fitnessGoals.includes(goal.name) ? 'goal-chip--active' : ''}`}
                                                            onClick={() => handleGoalToggle(goal.name)}
                                                            style={{ '--goal-color': goal.color } as React.CSSProperties}
                                                        >
                                                            {goal.icon}
                                                            {goal.name}
                                                            {formData.fitnessGoals.includes(goal.name) && <Check size={14} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="goals-tags">
                                                    {formData.fitnessGoals.length > 0 ? (
                                                        formData.fitnessGoals.map(goal => {
                                                            const goalOption = fitnessGoalOptions.find(g => g.name === goal);
                                                            return (
                                                                <span key={goal} className="goal-tag" style={{ borderColor: goalOption?.color }}>
                                                                    {goalOption?.icon}
                                                                    {goal}
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="goal-tag" style={{ opacity: 0.5 }}>No active goals - click Edit to add</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {renderSaveBar()}
                                    </div>
                                )}

                                {activeTab === 'personal' && (
                                    <div className="tab-content-section">
                                        {renderSectionHeader('Personal Information', <User size={14} />, editMode)}
                                        <div className="profile-form-grid-compact">
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><User size={12} />Full Name</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="text"
                                                        value={formData.fullName}
                                                        onChange={(e) => updateFormData({ fullName: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        placeholder="Enter your full name"
                                                        readOnly={!editMode}
                                                    />
                                                </div>
                                            </div>
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><Calendar size={12} />Date of Birth</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="date"
                                                        value={formData.dateOfBirth}
                                                        onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
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
                                                        onChange={(e) => updateFormData({ gender: e.target.value })}
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
                                                <label className="profile-field-compact__label"><Droplet size={12} />Blood Type</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <select
                                                        value={formData.bloodType}
                                                        onChange={(e) => updateFormData({ bloodType: e.target.value })}
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

                                        <div className="section-divider" />

                                        {renderSectionHeader('Body Measurements', <Activity size={14} />, editMode)}
                                        <div className="profile-form-grid-compact">
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><Ruler size={12} />Height (cm)</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="number"
                                                        value={formData.height || ''}
                                                        onChange={(e) => updateFormData({ height: e.target.value ? Number(e.target.value) : null })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        placeholder="e.g., 175"
                                                        readOnly={!editMode}
                                                    />
                                                </div>
                                            </div>
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><Scale size={12} />Weight (kg)</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="number"
                                                        value={formData.weight || ''}
                                                        onChange={(e) => updateFormData({ weight: e.target.value ? Number(e.target.value) : null })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        placeholder="e.g., 70"
                                                        readOnly={!editMode}
                                                    />
                                                </div>
                                            </div>
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><Percent size={12} />Body Fat (%)</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="number"
                                                        value={formData.bodyFat || ''}
                                                        onChange={(e) => updateFormData({ bodyFat: e.target.value ? Number(e.target.value) : null })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        placeholder="e.g., 15"
                                                        readOnly={!editMode}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {renderSaveBar()}
                                    </div>
                                )}

                                {activeTab === 'contact' && (
                                    <div className="tab-content-section">
                                        {renderSectionHeader('Contact Information', <Phone size={14} />, editMode)}
                                        <div className="profile-form-grid-compact">
                                            <div className="profile-field-compact profile-field-compact--full">
                                                <label className="profile-field-compact__label"><Mail size={12} />Email Address</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="email"
                                                        value={profile?.email || ''}
                                                        className="profile-field-compact__input profile-field-compact__input--readonly"
                                                        readOnly
                                                    />
                                                    <span className="field-note">Email cannot be changed</span>
                                                </div>
                                            </div>
                                            <div className="profile-field-compact profile-field-compact--full">
                                                <label className="profile-field-compact__label"><Phone size={12} />Phone Number</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => updateFormData({ phone: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        readOnly={!editMode}
                                                        placeholder="Enter your phone number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="section-divider" />

                                        {renderSectionHeader('Address', <MapPin size={14} />, editMode)}
                                        <div className="profile-form-grid-compact">
                                            <div className="profile-field-compact profile-field-compact--full">
                                                <label className="profile-field-compact__label"><MapPin size={12} />Street Address</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={(e) => updateFormData({ address: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        readOnly={!editMode}
                                                        placeholder="Enter your street address"
                                                    />
                                                </div>
                                            </div>
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><MapPin size={12} />City</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="text"
                                                        value={formData.city}
                                                        onChange={(e) => updateFormData({ city: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        readOnly={!editMode}
                                                        placeholder="Enter city"
                                                    />
                                                </div>
                                            </div>
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><MapPin size={12} />State / Province</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="text"
                                                        value={formData.state}
                                                        onChange={(e) => updateFormData({ state: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        readOnly={!editMode}
                                                        placeholder="Enter state"
                                                    />
                                                </div>
                                            </div>
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><MapPin size={12} />Zip / Postal Code</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="text"
                                                        value={formData.zipCode}
                                                        onChange={(e) => updateFormData({ zipCode: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        readOnly={!editMode}
                                                        placeholder="Enter zip code"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {renderSaveBar()}
                                    </div>
                                )}

                                {activeTab === 'emergency' && (
                                    <div className="tab-content-section">
                                        {renderSectionHeader('Emergency Contact', <Heart size={14} />, editMode)}
                                        <p className="section-description">This information will be used in case of emergency during your workouts.</p>
                                        <div className="profile-form-grid-compact">
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><User size={12} />Contact Name</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="text"
                                                        value={formData.emergencyContactName}
                                                        onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        readOnly={!editMode}
                                                        placeholder="Enter emergency contact name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="profile-field-compact">
                                                <label className="profile-field-compact__label"><Phone size={12} />Contact Phone</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <input
                                                        type="tel"
                                                        value={formData.emergencyContactPhone}
                                                        onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        readOnly={!editMode}
                                                        placeholder="Enter emergency contact phone"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="section-divider" />

                                        {renderSectionHeader('Health Information', <AlertCircle size={14} />, editMode)}
                                        <p className="section-description">Share any health conditions, allergies, or important medical information.</p>
                                        <div className="profile-form-grid-compact">
                                            <div className="profile-field-compact profile-field-compact--full">
                                                <label className="profile-field-compact__label"><AlertCircle size={12} />Health Notes & Allergies</label>
                                                <div className="profile-field-compact__input-wrapper">
                                                    <textarea
                                                        value={formData.healthNotes}
                                                        onChange={(e) => updateFormData({ healthNotes: e.target.value })}
                                                        className={`profile-field-compact__input ${!editMode ? 'profile-field-compact__input--readonly' : ''}`}
                                                        readOnly={!editMode}
                                                        rows={4}
                                                        style={{ resize: 'none' }}
                                                        placeholder="Enter any health conditions, allergies, injuries, or other medical information that trainers should know about..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {renderSaveBar()}
                                    </div>
                                )}

                                {activeTab === 'preferences' && (
                                    <div className="tab-content-section">
                                        {renderSectionHeader('Fitness Goals', <Target size={14} />)}
                                        <p className="section-description">Select your fitness goals to help us personalize your experience.</p>
                                        <div className="goals-selection-grid">
                                            {fitnessGoalOptions.map((goal) => (
                                                <button
                                                    key={goal.name}
                                                    type="button"
                                                    className={`goal-option-card ${formData.fitnessGoals.includes(goal.name) ? 'goal-option-card--active' : ''}`}
                                                    onClick={() => editMode && handleGoalToggle(goal.name)}
                                                    disabled={!editMode}
                                                    style={{ '--goal-accent': goal.color } as React.CSSProperties}
                                                >
                                                    <div className="goal-option-card__icon" style={{ color: goal.color }}>
                                                        {goal.icon}
                                                    </div>
                                                    <span className="goal-option-card__name">{goal.name}</span>
                                                    {formData.fitnessGoals.includes(goal.name) && (
                                                        <Check size={16} className="goal-option-card__check" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        {!editMode && (
                                            <p className="edit-prompt">Click "Edit Profile" to modify your goals</p>
                                        )}

                                        {renderSaveBar()}
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="tab-content-section">
                                        {renderSectionHeader('Account Security', <Shield size={14} />)}
                                        <div className="security-options">
                                            <div className="security-item">
                                                <div className="security-item__content">
                                                    <Lock size={20} />
                                                    <div>
                                                        <div className="security-item__title">Password</div>
                                                        <div className="security-item__subtitle">Change your account password</div>
                                                    </div>
                                                </div>
                                                <button className="profile-btn-compact profile-btn-compact--secondary" type="button">
                                                    Change Password
                                                </button>
                                            </div>
                                            <div className="security-item">
                                                <div className="security-item__content">
                                                    <Shield size={20} />
                                                    <div>
                                                        <div className="security-item__title">Two-Factor Authentication</div>
                                                        <div className="security-item__subtitle">Add an extra layer of security to your account</div>
                                                    </div>
                                                </div>
                                                <PulsingBadge color={profile.twoFactorEnabled ? '#34C759' : '#FF9500'}>
                                                    {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                                </PulsingBadge>
                                            </div>
                                            <div className="security-item">
                                                <div className="security-item__content">
                                                    <Smartphone size={20} />
                                                    <div>
                                                        <div className="security-item__title">Active Sessions</div>
                                                        <div className="security-item__subtitle">Manage your logged-in devices</div>
                                                    </div>
                                                </div>
                                                <button className="profile-btn-compact profile-btn-compact--secondary" type="button">
                                                    View Sessions
                                                </button>
                                            </div>
                                            <div className="security-item">
                                                <div className="security-item__content">
                                                    <Fingerprint size={20} />
                                                    <div>
                                                        <div className="security-item__title">Biometric Login</div>
                                                        <div className="security-item__subtitle">Use fingerprint or face ID to sign in</div>
                                                    </div>
                                                </div>
                                                <button className="profile-btn-compact profile-btn-compact--secondary" type="button">
                                                    Setup
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="profile-sidebar">
                    {/* Your Trainer Widget */}
                    <div className="sidebar-widget">
                        <div className="widget-header">
                            <h3 className="widget-title"><Users size={14} /> Your Trainer</h3>
                            <ChevronRight size={14} className="widget-icon-link" />
                        </div>
                        {trainerLoading ? (
                            <div className="membership-card" style={{ padding: '12px', textAlign: 'center' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                    <Activity size={16} />
                                </motion.div>
                            </div>
                        ) : assignedTrainer ? (
                            <div className="membership-card" style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #007AFF, #5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                        {assignedTrainer.name[0]}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{assignedTrainer.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--macos-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={10} fill="#FFCC00" color="#FFCC00" /> {assignedTrainer.stats.rating} • {assignedTrainer.stats.experience}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                                    <button className="macos-btn macos-btn--secondary" style={{ flex: 1, padding: '6px', fontSize: '12px' }}>
                                        <MessageSquare size={14} /> Message
                                    </button>
                                    <button className="macos-btn macos-btn--secondary" style={{ flex: 1, padding: '6px', fontSize: '12px' }}>
                                        <Info size={14} /> Details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="membership-card" style={{ padding: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '13px', color: 'var(--macos-text-secondary)', marginBottom: '8px' }}>
                                    No trainer assigned yet
                                </div>
                                <button className="widget-action-btn primary" onClick={() => window.location.href = '/member/trainer'}>
                                    Find a Trainer
                                </button>
                            </div>
                        )}
                    </div>

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
                        <button className="widget-action-btn" onClick={() => { setActiveTab('personal'); setEditMode(true); }}>Update Stats</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MemberProfile;
