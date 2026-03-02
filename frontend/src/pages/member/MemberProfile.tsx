import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, Lock, Activity, Save, Camera, Mail, Phone, Calendar,
    Shield, Heart, MapPin, Droplet, Target, Award, Sparkles,
    ChevronRight, Edit3, X, Zap, TrendingUp, Clock,
    AlertCircle, CheckCircle2, CreditCard, History,
    Trophy, Star, Download, QrCode, ArrowUpRight, Check, Ruler,
    Scale, Percent, Users, MessageSquare, Info, Loader2, Eye, EyeOff,
    Smartphone, Fingerprint
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { memberProfileApi, type MemberProfileData, type MemberProfileUpdate } from '../../api/memberProfileApi';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
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
    const navigate = useNavigate();
    const { openAuthModal } = useAuthModal();
    const [profile, setProfile] = useState<MemberProfileData | null>(null);
    const [assignedTrainer, setAssignedTrainer] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [trainerLoading, setTrainerLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [editMode, setEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalFormData, setOriginalFormData] = useState<any | null>(null);

    // Change password modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

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

    const parseFitnessGoals = (goalsData: any): string[] => {
        if (!goalsData) return [];
        if (Array.isArray(goalsData)) return goalsData;
        if (typeof goalsData === 'string') {
            // Clean up common stringified formats
            let cleaned = goalsData.trim();
            
            try {
                const parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // If JSON parse fails, check if it's a string representation of an array
                if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
                    cleaned = cleaned.substring(1, cleaned.length - 1);
                }
                
                // Split by comma and clean up quotes and whitespace
                return cleaned.split(',')
                    .map(g => g.trim().replace(/^["']|["']$/g, ''))
                    .filter(Boolean);
            }
        }
        return [];
    };

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
                const parsedGoals = parseFitnessGoals(data.fitnessGoals);
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
                    fitnessGoals: parsedGoals,
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

        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

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
            
            const parsedUpdatedGoals = parseFitnessGoals(updated.fitnessGoals);
            const finalFormData = {
                ...formData,
                fitnessGoals: parsedUpdatedGoals
            };
            
            setFormData(finalFormData);
            setOriginalFormData(finalFormData);
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

    const validateForm = (): string | null => {
        if (formData.phone && !/^\+?[\d\s\-()]{7,15}$/.test(formData.phone)) {
            return 'Please enter a valid phone number';
        }
        if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
            return 'Date of birth cannot be in the future';
        }
        if (formData.bodyFat !== null && (formData.bodyFat < 0 || formData.bodyFat > 100)) {
            return 'Body fat must be between 0 and 100%';
        }
        if (formData.height !== null && formData.height <= 0) {
            return 'Height must be a positive value';
        }
        if (formData.weight !== null && formData.weight <= 0) {
            return 'Weight must be a positive value';
        }
        return null;
    };

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error('All password fields are required');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (!profile?.email) return;

        setPasswordSaving(true);
        try {
            await api.post('/auth/change-password', {
                email: profile.email,
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Password changed successfully');
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Failed to change password';
            toast.error(msg);
        } finally {
            setPasswordSaving(false);
        }
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
        { name: 'Weight Loss', icon: <TrendingUp size={18} />, color: '#FF9500', rgb: '255, 149, 0' },
        { name: 'Lean Muscle', icon: <Zap size={18} />, color: '#FF3B30', rgb: '255, 59, 48' },
        { name: 'Improve Endurance', icon: <Activity size={18} />, color: '#007AFF', rgb: '0, 122, 255' },
        { name: 'Athletic Performance', icon: <Award size={18} />, color: '#AF52DE', rgb: '175, 82, 222' },
        { name: 'Flexibility', icon: <Sparkles size={18} />, color: '#5AC8FA', rgb: '90, 200, 250' },
        { name: 'General Fitness', icon: <Heart size={18} />, color: '#34C759', rgb: '52, 199, 89' }
    ];

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Not set';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                    <Loader2 size={32} />
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
                    onClick={() => { navigate('/'); openAuthModal('login'); }}
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

    // Computed BMI
    const bmi = (formData.height && formData.weight && formData.height > 0)
        ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
        : null;
    const bmiCategory = bmi
        ? Number(bmi) < 18.5 ? 'Underweight'
            : Number(bmi) < 25 ? 'Normal'
            : Number(bmi) < 30 ? 'Overweight'
            : 'Obese'
        : null;

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
                                    <Loader2 size={14} />
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
                        <button className="profile-avatar__edit" title="Upload Photo" onClick={() => toast('Photo upload coming soon', { icon: '📸' })}>
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
                                                        <span className="summary-value"><User size={14} color="#007AFF" /> {formData.fullName || 'Not set'}</span>
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
                                                        <span className="summary-value"><Calendar size={14} color="#007AFF" /> {formatDate(formData.dateOfBirth)}</span>
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
                                                        <span className="summary-value"><User size={14} color="#007AFF" /> {formData.gender || 'Not set'}</span>
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
                                                        <span className="summary-value"><Droplet size={14} color="#FF3B30" /> {formData.bloodType || 'Not set'}</span>
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
                                                        <span><Zap size={12} color="#FF9500" /> Workout Streak</span>
                                                        <span style={{ fontWeight: '700' }}>{stats?.currentStreak || 0} days</span>
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${Math.min((stats?.currentStreak || 0) * 10, 100)}%`, background: 'linear-gradient(90deg, #FF9500, #FFCC00)' }} />
                                                    </div>
                                                </div>
                                                <div className="progress-item">
                                                    <div className="progress-item__header">
                                                        <span><Activity size={12} color="#007AFF" /> Total Workouts</span>
                                                        <span style={{ fontWeight: '700' }}>{stats?.totalWorkouts || 0}</span>
                                                    </div>
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${Math.min((stats?.totalWorkouts || 0) / 2, 100)}%`, background: 'linear-gradient(90deg, #007AFF, #5AC8FA)' }} />
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
                                                            style={{ 
                                                                '--goal-color': goal.color,
                                                                '--goal-color-rgb': goal.rgb
                                                            } as React.CSSProperties}
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
                                                                <span 
                                                                    key={goal} 
                                                                    className="goal-tag" 
                                                                    style={{ 
                                                                        '--goal-color': goalOption?.color || '#8E8E93',
                                                                        '--goal-color-rgb': goalOption?.rgb || '142, 142, 147'
                                                                    } as React.CSSProperties}
                                                                >
                                                                    {goalOption?.icon || <Target size={12} />}
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
                                                <label className="profile-field-compact__label"><User size={12} color="#007AFF" />Full Name</label>
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
                                                <label className="profile-field-compact__label"><Calendar size={12} color="#007AFF" />Date of Birth</label>
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
                                                <label className="profile-field-compact__label"><User size={12} color="#007AFF" />Gender</label>
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
                                                <label className="profile-field-compact__label"><Droplet size={12} color="#FF3B30" />Blood Type</label>
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
                                                <label className="profile-field-compact__label"><Ruler size={12} color="#007AFF" />Height (cm)</label>
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
                                                <label className="profile-field-compact__label"><Scale size={12} color="#007AFF" />Weight (kg)</label>
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
                                                  <label className="profile-field-compact__label"><Percent size={12} color="#007AFF" />Body Fat (%)</label>
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
                                              {bmi && (
                                                  <div className="profile-field-compact">
                                                      <label className="profile-field-compact__label"><Activity size={12} color="#007AFF" />BMI (computed)</label>
                                                      <div className="profile-field-compact__input-wrapper">
                                                          <div className="profile-field-compact__input profile-field-compact__input--readonly" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                              <span style={{ fontWeight: '700', fontSize: '16px' }}>{bmi}</span>
                                                              <span className="bmi-category-badge" style={{ 
                                                                  backgroundColor: Number(bmi) < 18.5 ? 'rgba(90, 200, 250, 0.15)' : Number(bmi) < 25 ? 'rgba(52, 199, 89, 0.15)' : Number(bmi) < 30 ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                                                                  color: Number(bmi) < 18.5 ? '#5AC8FA' : Number(bmi) < 25 ? '#34C759' : Number(bmi) < 30 ? '#FF9500' : '#FF3B30'
                                                              }}>
                                                                  {bmiCategory}
                                                              </span>
                                                          </div>
                                                      </div>
                                                  </div>
                                              )}
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
                                                    style={{ 
                                                        '--goal-accent': goal.color,
                                                        '--goal-accent-rgb': goal.rgb
                                                    } as React.CSSProperties}
                                                >                                                    <div className="goal-option-card__icon" style={{ color: goal.color }}>
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
                                                  <button
                                                      className="profile-btn-compact profile-btn-compact--secondary"
                                                      type="button"
                                                      onClick={() => setShowPasswordModal(true)}
                                                  >
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
                                                  <PulsingBadge color="#8E8E93">Coming Soon</PulsingBadge>
                                              </div>
                                              <div className="security-item">
                                                  <div className="security-item__content">
                                                      <Fingerprint size={20} />
                                                      <div>
                                                          <div className="security-item__title">Biometric Login</div>
                                                          <div className="security-item__subtitle">Use fingerprint or face ID to sign in</div>
                                                      </div>
                                                  </div>
                                                  <PulsingBadge color="#8E8E93">Coming Soon</PulsingBadge>
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
                                      <Loader2 size={16} />
                                  </motion.div>
                              </div>
                        ) : assignedTrainer ? (
                            <div className="membership-card" style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #007AFF, #5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                        {assignedTrainer.name?.[0] ?? '?'}
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
                              {bmi && (
                                  <div className="body-stat-item">
                                      <span className="stat-label">BMI</span>
                                      <span className="stat-value" style={{ color: Number(bmi) < 18.5 ? '#5AC8FA' : Number(bmi) < 25 ? '#34C759' : Number(bmi) < 30 ? '#FF9500' : '#FF3B30' }}>
                                          {bmi} <span style={{ fontSize: '10px', opacity: 0.7 }}>({bmiCategory})</span>
                                      </span>
                                  </div>
                              )}
                          </div>
                          <button className="widget-action-btn" onClick={() => { setActiveTab('personal'); setEditMode(true); }}>Update Stats</button>
                      </div>
                </div>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            style={{ background: 'var(--macos-surface)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '17px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Lock size={18} /> Change Password
                                </h3>
                                <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--macos-text-secondary)' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Current Password */}
                                <div className="profile-field-compact profile-field-compact--full">
                                    <label className="profile-field-compact__label"><Lock size={12} />Current Password</label>
                                    <div className="profile-field-compact__input-wrapper" style={{ position: 'relative' }}>
                                        <input
                                            type={showCurrentPw ? 'text' : 'password'}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                                            className="profile-field-compact__input"
                                            placeholder="Enter current password"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPw(v => !v)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--macos-text-secondary)', padding: 0 }}
                                        >
                                            {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="profile-field-compact profile-field-compact--full">
                                    <label className="profile-field-compact__label"><Lock size={12} />New Password</label>
                                    <div className="profile-field-compact__input-wrapper" style={{ position: 'relative' }}>
                                        <input
                                            type={showNewPw ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                            className="profile-field-compact__input"
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPw(v => !v)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--macos-text-secondary)', padding: 0 }}
                                        >
                                            {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="profile-field-compact profile-field-compact--full">
                                    <label className="profile-field-compact__label"><Lock size={12} />Confirm New Password</label>
                                    <div className="profile-field-compact__input-wrapper" style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPw ? 'text' : 'password'}
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                            className="profile-field-compact__input"
                                            placeholder="Repeat new password"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPw(v => !v)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--macos-text-secondary)', padding: 0 }}
                                        >
                                            {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Strength hint */}
                                {passwordForm.newPassword.length > 0 && (
                                    <div style={{ fontSize: '12px', color: passwordForm.newPassword.length < 6 ? '#FF3B30' : passwordForm.newPassword.length < 10 ? '#FF9500' : '#34C759' }}>
                                        Strength: {passwordForm.newPassword.length < 6 ? 'Too short' : passwordForm.newPassword.length < 10 ? 'Fair' : 'Strong'}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                                <button
                                    className="profile-btn-compact profile-btn-compact--secondary"
                                    style={{ flex: 1 }}
                                    onClick={() => { setShowPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                                    disabled={passwordSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="profile-btn-compact profile-btn-compact--primary"
                                    style={{ flex: 1 }}
                                    onClick={handleChangePassword}
                                    disabled={passwordSaving}
                                >
                                    {passwordSaving ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-flex' }}>
                                            <Loader2 size={14} />
                                        </motion.div>
                                    ) : (
                                        <><CheckCircle2 size={14} /> Update Password</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MemberProfile;
