import React, { useState, useEffect } from 'react';
import {
    User, Heart, Calendar, Bell, Palette, Shield, CreditCard,
    Target, Activity, Save, Camera, Eye, EyeOff, Sun, Moon, Monitor,
    Mail, Clock, Dumbbell, Award, TrendingUp, AlertTriangle,
    MessageSquare, Info, ChevronDown, ChevronUp, Plus, X, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../Settings/Settings.css';

const SECTIONS = [
    { id: 'profile', label: 'My Profile', desc: 'Personal details & photo', icon: User, color: '#5856D6' },
    { id: 'fitness', label: 'Fitness Goals', desc: 'Goals, preferences & body stats', icon: Target, color: '#FF9500' },
    { id: 'membership', label: 'Membership', desc: 'Plan details & billing', icon: CreditCard, color: '#34C759' },
    { id: 'bookings', label: 'Booking Preferences', desc: 'Session & class settings', icon: Calendar, color: '#007AFF' },
    { id: 'health', label: 'Health & Wellness', desc: 'Health info & emergency contact', icon: Heart, color: '#FF2D55' },
    { id: 'appearance', label: 'Appearance', desc: 'Theme & display', icon: Palette, color: '#AF52DE' },
    { id: 'notifications', label: 'Notifications', desc: 'Alerts & reminders', icon: Bell, color: '#FF9500' },
    { id: 'security', label: 'Security', desc: 'Password & account safety', icon: Shield, color: '#FF3B30' },
];

const MemberSettings: React.FC = () => {
    const { themeMode, setThemeMode } = useTheme();
    const { user } = useAuth();

    const [activeSection, setActiveSection] = useState(() => {
        return sessionStorage.getItem('member_settings_section') || 'profile';
    });

    useEffect(() => {
        sessionStorage.setItem('member_settings_section', activeSection);
    }, [activeSection]);

    // Profile state
    const [profile, setProfile] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        bio: '',
    });

    // Fitness state
    const [fitness, setFitness] = useState({
        primaryGoal: 'weight_loss',
        fitnessLevel: 'intermediate',
        targetWeight: '',
        currentWeight: '',
        height: '',
        preferredWorkout: [] as string[],
        dietaryPreference: 'none',
        workoutFrequency: '4',
    });

    // Booking preferences
    const [bookingPrefs, setBookingPrefs] = useState({
        preferredTime: 'morning',
        preferredTrainer: '',
        autoBook: false,
        reminderBefore: '30',
        allowWaitlist: true,
        preferGroupClasses: false,
    });

    // Health state
    const [health, setHealth] = useState({
        bloodGroup: '',
        allergies: '',
        medicalConditions: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
    });

    // Notification state
    const [notifSettings, setNotifSettings] = useState({
        classReminders: true,
        bookingConfirmations: true,
        trainerMessages: true,
        promotions: false,
        progressUpdates: true,
        membershipAlerts: true,
        goalMilestones: true,
    });

    // Security state
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            toast.success('Settings saved successfully');
        } catch {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const workoutTypes = [
        'Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Pilates',
        'CrossFit', 'Swimming', 'Boxing', 'Zumba', 'Functional Training'
    ];

    const toggleWorkoutType = (type: string) => {
        setFitness(prev => ({
            ...prev,
            preferredWorkout: prev.preferredWorkout.includes(type)
                ? prev.preferredWorkout.filter(w => w !== type)
                : [...prev.preferredWorkout, type],
        }));
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="settings-section" style={{ '--section-accent': '#5856D6' } as React.CSSProperties}>
                        <div className="settings-section__header">
                            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #5856D6, #5856D6cc)' }}>
                                <User size={20} />
                            </div>
                            <div className="settings-section__title-group">
                                <h2 className="settings-section__title">My Profile</h2>
                                <p className="settings-section__description">Update your personal details and profile photo</p>
                            </div>
                            <div className="settings-section__actions">
                                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                        <div className="settings-section__content">
                            <div className="form-group">
                                <div className="form-group__header">
                                    <Camera size={16} style={{ color: '#5856D6' }} />
                                    <div className="form-group__title">Profile Photo</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #5856D6, #AF52DE)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '24px', fontWeight: 700, color: '#fff'
                                    }}>
                                        {(profile.fullName || 'M').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{profile.fullName || 'Member'}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{profile.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group__header">
                                    <User size={16} style={{ color: '#5856D6' }} />
                                    <div className="form-group__title">Personal Information</div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Full Name <span className="field-label__required">*</span></label>
                                        <input className="dense-input" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Email <span className="field-label__required">*</span></label>
                                        <input className="dense-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Phone</label>
                                        <input className="dense-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Date of Birth</label>
                                        <input className="dense-input" type="date" value={profile.dateOfBirth} onChange={e => setProfile(p => ({ ...p, dateOfBirth: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Gender</label>
                                        <select className="dense-input" value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not">Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Address</label>
                                        <input className="dense-input" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} placeholder="City, State" />
                                    </div>
                                </div>
                                <div className="field-wrapper" style={{ marginTop: '8px' }}>
                                    <label className="field-label">Bio</label>
                                    <textarea className="dense-input" rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself and your fitness journey..." style={{ resize: 'vertical', minHeight: '80px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'fitness':
                return (
                    <div className="settings-section" style={{ '--section-accent': '#FF9500' } as React.CSSProperties}>
                        <div className="settings-section__header">
                            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #FF9500, #FF9500cc)' }}>
                                <Target size={20} />
                            </div>
                            <div className="settings-section__title-group">
                                <h2 className="settings-section__title">Fitness Goals</h2>
                                <p className="settings-section__description">Set your goals, body stats, and workout preferences</p>
                            </div>
                            <div className="settings-section__actions">
                                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                        <div className="settings-section__content">
                            <div className="form-group">
                                <div className="form-group__header">
                                    <Target size={16} style={{ color: '#FF9500' }} />
                                    <div className="form-group__title">Goals & Level</div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Primary Goal <span className="field-label__required">*</span></label>
                                        <select className="dense-input" value={fitness.primaryGoal} onChange={e => setFitness(f => ({ ...f, primaryGoal: e.target.value }))}>
                                            <option value="weight_loss">Weight Loss</option>
                                            <option value="muscle_gain">Muscle Gain</option>
                                            <option value="endurance">Endurance & Stamina</option>
                                            <option value="flexibility">Flexibility</option>
                                            <option value="general_fitness">General Fitness</option>
                                            <option value="sports_performance">Sports Performance</option>
                                            <option value="rehabilitation">Rehabilitation</option>
                                        </select>
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Fitness Level</label>
                                        <select className="dense-input" value={fitness.fitnessLevel} onChange={e => setFitness(f => ({ ...f, fitnessLevel: e.target.value }))}>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="athlete">Athlete</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Workout Frequency (days/week)</label>
                                        <select className="dense-input" value={fitness.workoutFrequency} onChange={e => setFitness(f => ({ ...f, workoutFrequency: e.target.value }))}>
                                            {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                                <option key={n} value={String(n)}>{n} day{n > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Dietary Preference</label>
                                        <select className="dense-input" value={fitness.dietaryPreference} onChange={e => setFitness(f => ({ ...f, dietaryPreference: e.target.value }))}>
                                            <option value="none">No preference</option>
                                            <option value="vegetarian">Vegetarian</option>
                                            <option value="vegan">Vegan</option>
                                            <option value="keto">Keto</option>
                                            <option value="paleo">Paleo</option>
                                            <option value="high_protein">High Protein</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group__header">
                                    <Activity size={16} style={{ color: '#FF9500' }} />
                                    <div className="form-group__title">Body Stats</div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Current Weight (kg)</label>
                                        <input className="dense-input" type="number" value={fitness.currentWeight} onChange={e => setFitness(f => ({ ...f, currentWeight: e.target.value }))} placeholder="e.g. 75" />
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Target Weight (kg)</label>
                                        <input className="dense-input" type="number" value={fitness.targetWeight} onChange={e => setFitness(f => ({ ...f, targetWeight: e.target.value }))} placeholder="e.g. 68" />
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Height (cm)</label>
                                        <input className="dense-input" type="number" value={fitness.height} onChange={e => setFitness(f => ({ ...f, height: e.target.value }))} placeholder="e.g. 175" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group__header">
                                    <Dumbbell size={16} style={{ color: '#FF9500' }} />
                                    <div className="form-group__title">Preferred Workout Types</div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 0' }}>
                                    {workoutTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleWorkoutType(type)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                border: `1.5px solid ${fitness.preferredWorkout.includes(type) ? '#FF9500' : 'rgba(255,255,255,0.1)'}`,
                                                background: fitness.preferredWorkout.includes(type) ? 'rgba(255,149,0,0.15)' : 'rgba(255,255,255,0.03)',
                                                color: fitness.preferredWorkout.includes(type) ? '#FF9500' : 'inherit',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {fitness.preferredWorkout.includes(type) && '✓ '}{type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'membership':
                return (
                    <div className="settings-section" style={{ '--section-accent': '#34C759' } as React.CSSProperties}>
                        <div className="settings-section__header">
                            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #34C759, #34C759cc)' }}>
                                <CreditCard size={20} />
                            </div>
                            <div className="settings-section__title-group">
                                <h2 className="settings-section__title">Membership</h2>
                                <p className="settings-section__description">View your plan details and billing information</p>
                            </div>
                        </div>
                        <div className="settings-section__content">
                            <div className="form-group">
                                <div className="form-group__header">
                                    <CreditCard size={16} style={{ color: '#34C759' }} />
                                    <div className="form-group__title">Current Plan</div>
                                </div>
                                <div style={{
                                    padding: '20px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, rgba(52,199,89,0.1), rgba(52,199,89,0.03))',
                                    border: '1px solid rgba(52,199,89,0.2)',
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #34C759, #30D158)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Star size={22} color="#fff" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>Premium Membership</div>
                                        <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>Active - Renews on Mar 15, 2026</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: '18px', color: '#34C759' }}>$49.99</div>
                                        <div style={{ fontSize: '11px', opacity: 0.5 }}>/month</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.5, textAlign: 'center' }}>
                                    Contact the front desk or your trainer to manage your membership plan.
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'bookings':
                return (
                    <div className="settings-section" style={{ '--section-accent': '#007AFF' } as React.CSSProperties}>
                        <div className="settings-section__header">
                            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #007AFF, #007AFFcc)' }}>
                                <Calendar size={20} />
                            </div>
                            <div className="settings-section__title-group">
                                <h2 className="settings-section__title">Booking Preferences</h2>
                                <p className="settings-section__description">Set your preferred session times and booking settings</p>
                            </div>
                            <div className="settings-section__actions">
                                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                        <div className="settings-section__content">
                            <div className="form-group">
                                <div className="form-group__header">
                                    <Clock size={16} style={{ color: '#007AFF' }} />
                                    <div className="form-group__title">Session Preferences</div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Preferred Time</label>
                                        <select className="dense-input" value={bookingPrefs.preferredTime} onChange={e => setBookingPrefs(b => ({ ...b, preferredTime: e.target.value }))}>
                                            <option value="early_morning">Early Morning (5-7 AM)</option>
                                            <option value="morning">Morning (7-10 AM)</option>
                                            <option value="afternoon">Afternoon (12-3 PM)</option>
                                            <option value="evening">Evening (5-8 PM)</option>
                                            <option value="late_evening">Late Evening (8-10 PM)</option>
                                        </select>
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Reminder Before Session</label>
                                        <select className="dense-input" value={bookingPrefs.reminderBefore} onChange={e => setBookingPrefs(b => ({ ...b, reminderBefore: e.target.value }))}>
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="field-wrapper" style={{ marginTop: '8px' }}>
                                    <label className="field-label">Preferred Trainer</label>
                                    <input className="dense-input" value={bookingPrefs.preferredTrainer} onChange={e => setBookingPrefs(b => ({ ...b, preferredTrainer: e.target.value }))} placeholder="Enter trainer name (optional)" />
                                    <span className="field-hint">Leave empty for no preference</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group__header">
                                    <Calendar size={16} style={{ color: '#007AFF' }} />
                                    <div className="form-group__title">Booking Options</div>
                                </div>
                                {[
                                    { key: 'allowWaitlist', icon: Calendar, label: 'Join Waitlist Automatically', desc: 'Auto-join waitlist when a class is full' },
                                    { key: 'preferGroupClasses', icon: Calendar, label: 'Prefer Group Classes', desc: 'Show group classes first in search results' },
                                    { key: 'autoBook', icon: Calendar, label: 'Auto-Book Recurring Sessions', desc: 'Automatically book your regular weekly sessions' },
                                ].map(item => (
                                    <div className="policy-toggle-row" key={item.key}>
                                        <div className="policy-toggle-row__info">
                                            <div className="policy-toggle-row__icon"><item.icon size={16} /></div>
                                            <div className="policy-toggle-row__text">
                                                <span className="policy-toggle-row__label">{item.label}</span>
                                                <span className="policy-toggle-row__hint">{item.desc}</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`policy-toggle ${(bookingPrefs as any)[item.key] ? 'policy-toggle--active' : ''}`}
                                            onClick={() => setBookingPrefs(b => ({ ...b, [item.key]: !(b as any)[item.key] }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'health':
                return (
                    <div className="settings-section" style={{ '--section-accent': '#FF2D55' } as React.CSSProperties}>
                        <div className="settings-section__header">
                            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #FF2D55, #FF2D55cc)' }}>
                                <Heart size={20} />
                            </div>
                            <div className="settings-section__title-group">
                                <h2 className="settings-section__title">Health & Wellness</h2>
                                <p className="settings-section__description">Health info to help your trainer customize your program</p>
                            </div>
                            <div className="settings-section__actions">
                                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                        <div className="settings-section__content">
                            <div className="form-group">
                                <div className="form-group__header">
                                    <Heart size={16} style={{ color: '#FF2D55' }} />
                                    <div className="form-group__title">Health Information</div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Blood Group</label>
                                        <select className="dense-input" value={health.bloodGroup} onChange={e => setHealth(h => ({ ...h, bloodGroup: e.target.value }))}>
                                            <option value="">Select</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                <option key={bg} value={bg}>{bg}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="field-wrapper" style={{ marginTop: '8px' }}>
                                    <label className="field-label">Allergies</label>
                                    <textarea className="dense-input" rows={2} value={health.allergies} onChange={e => setHealth(h => ({ ...h, allergies: e.target.value }))} placeholder="List any allergies (food, medication, etc.)" style={{ resize: 'vertical' }} />
                                </div>
                                <div className="field-wrapper" style={{ marginTop: '8px' }}>
                                    <label className="field-label">Medical Conditions / Injuries</label>
                                    <textarea className="dense-input" rows={2} value={health.medicalConditions} onChange={e => setHealth(h => ({ ...h, medicalConditions: e.target.value }))} placeholder="Any conditions your trainer should know about..." style={{ resize: 'vertical' }} />
                                    <span className="field-hint">This helps trainers customize safe workout plans for you</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-group__header">
                                    <AlertTriangle size={16} style={{ color: '#FF2D55' }} />
                                    <div className="form-group__title">Emergency Contact</div>
                                </div>
                                <div className="form-grid">
                                    <div className="field-wrapper">
                                        <label className="field-label">Contact Name <span className="field-label__required">*</span></label>
                                        <input className="dense-input" value={health.emergencyName} onChange={e => setHealth(h => ({ ...h, emergencyName: e.target.value }))} placeholder="Full name" />
                                    </div>
                                    <div className="field-wrapper">
                                        <label className="field-label">Phone Number <span className="field-label__required">*</span></label>
                                        <input className="dense-input" value={health.emergencyPhone} onChange={e => setHealth(h => ({ ...h, emergencyPhone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                </div>
                                <div className="field-wrapper" style={{ marginTop: '8px' }}>
                                    <label className="field-label">Relationship</label>
                                    <select className="dense-input" value={health.emergencyRelation} onChange={e => setHealth(h => ({ ...h, emergencyRelation: e.target.value }))}>
                                        <option value="">Select</option>
                                        <option value="spouse">Spouse</option>
                                        <option value="parent">Parent</option>
                                        <option value="sibling">Sibling</option>
                                        <option value="friend">Friend</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="settings-section" style={{ '--section-accent': '#AF52DE' } as React.CSSProperties}>
                        <div className="settings-section__header">
                            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #AF52DE, #AF52DEcc)' }}>
                                <Palette size={20} />
                            </div>
                            <div className="settings-section__title-group">
                                <h2 className="settings-section__title">Appearance</h2>
                                <p className="settings-section__description">Choose your preferred theme and display settings</p>
                            </div>
                        </div>
                        <div className="settings-section__content">
                            <div className="form-group">
                                <div className="form-group__header">
                                    <Palette size={16} style={{ color: '#AF52DE' }} />
                                    <div className="form-group__title">Theme</div>
                                </div>
                                <div className="theme-selector">
                                    {[
                                        { key: 'dark', icon: Moon, label: 'Dark', desc: 'Easy on the eyes' },
                                        { key: 'light', icon: Sun, label: 'Light', desc: 'Classic bright look' },
                                        { key: 'system', icon: Monitor, label: 'System', desc: 'Match device theme' },
                                    ].map(t => (
                                        <button
                                            key={t.key}
                                            className={`theme-option ${themeMode === t.key ? 'theme-option--active' : ''}`}
                                            onClick={() => setThemeMode(t.key as any)}
                                        >
                                            <div className="theme-option__icon">
                                                <t.icon size={20} />
                                            </div>
                                            <div className="theme-option__label">{t.label}</div>
                                            <div className="theme-option__desc">{t.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="settings-section" style={{ '--section-accent': '#FF9500' } as React.CSSProperties}>
                        <div className="settings-section__header">
                            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #FF9500, #FF9500cc)' }}>
                                <Bell size={20} />
                            </div>
                            <div className="settings-section__title-group">
                                <h2 className="settings-section__title">Notifications</h2>
                                <p className="settings-section__description">Control which alerts and reminders you receive</p>
                            </div>
                            <div className="settings-section__actions">
                                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                        <div className="settings-section__content">
                            <div className="form-group">
                                <div className="form-group__header">
                                    <Bell size={16} style={{ color: '#FF9500' }} />
                                    <div className="form-group__title">Notification Preferences</div>
                                </div>
                                {[
                                    { key: 'classReminders', icon: Calendar, label: 'Class Reminders', desc: 'Reminders before your scheduled classes and sessions' },
                                    { key: 'bookingConfirmations', icon: Calendar, label: 'Booking Confirmations', desc: 'Confirmations when you book, cancel, or reschedule' },
                                    { key: 'trainerMessages', icon: MessageSquare, label: 'Trainer Messages', desc: 'Messages and updates from your trainer' },
                                    { key: 'progressUpdates', icon: TrendingUp, label: 'Progress Updates', desc: 'Weekly/monthly progress reports and milestones' },
                                    { key: 'goalMilestones', icon: Award, label: 'Goal Milestones', desc: 'Celebrations when you hit fitness milestones' },
                                    { key: 'membershipAlerts', icon: CreditCard, label: 'Membership Alerts', desc: 'Renewal reminders and plan updates' },
                                    { key: 'promotions', icon: Star, label: 'Offers & Promotions', desc: 'Special deals, new classes, and events' },
                                ].map(item => (
                                    <div className="policy-toggle-row" key={item.key}>
                                        <div className="policy-toggle-row__info">
                                            <div className="policy-toggle-row__icon"><item.icon size={16} /></div>
                                            <div className="policy-toggle-row__text">
                                                <span className="policy-toggle-row__label">{item.label}</span>
                                                <span className="policy-toggle-row__hint">{item.desc}</span>
                                            </div>
                                        </div>
                                        <button
                                            className={`policy-toggle ${(notifSettings as any)[item.key] ? 'policy-toggle--active' : ''}`}
                                            onClick={() => setNotifSettings(n => ({ ...n, [item.key]: !(n as any)[item.key] }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="settings-section" style={{ '--section-accent': '#FF3B30' } as React.CSSProperties}>
                        <div className="settings-section__header">
                            <div className="settings-section__icon" style={{ background: 'linear-gradient(135deg, #FF3B30, #FF3B30cc)' }}>
                                <Shield size={20} />
                            </div>
                            <div className="settings-section__title-group">
                                <h2 className="settings-section__title">Security</h2>
                                <p className="settings-section__description">Manage your password and account security</p>
                            </div>
                            <div className="settings-section__actions">
                                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                                    <Save size={14} /> {saving ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                        <div className="settings-section__content">
                            <div className="form-group">
                                <div className="form-group__header">
                                    <Shield size={16} style={{ color: '#FF3B30' }} />
                                    <div className="form-group__title">Change Password</div>
                                </div>
                                {[
                                    { key: 'current' as const, label: 'Current Password', placeholder: 'Enter current password' },
                                    { key: 'newPass' as const, label: 'New Password', placeholder: 'Enter new password' },
                                    { key: 'confirm' as const, label: 'Confirm New Password', placeholder: 'Confirm new password' },
                                ].map(field => (
                                    <div className="field-wrapper" key={field.key} style={{ marginTop: '8px' }}>
                                        <label className="field-label">{field.label} <span className="field-label__required">*</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                className="dense-input"
                                                type={showPasswords[field.key] ? 'text' : 'password'}
                                                value={passwords[field.key]}
                                                onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                style={{ paddingRight: '40px' }}
                                            />
                                            <button
                                                onClick={() => setShowPasswords(s => ({ ...s, [field.key]: !s[field.key] }))}
                                                style={{
                                                    position: 'absolute', right: '10px', top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    opacity: 0.5, color: 'inherit', padding: '4px',
                                                }}
                                            >
                                                {showPasswords[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {passwords.newPass && passwords.confirm && (
                                    <div style={{
                                        marginTop: '8px', fontSize: '12px',
                                        color: passwords.newPass === passwords.confirm ? '#34C759' : '#FF3B30',
                                    }}>
                                        {passwords.newPass === passwords.confirm ? 'Passwords match' : 'Passwords do not match'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-layout">
                <aside className="settings-sidebar">
                    <nav className="settings-nav">
                        {SECTIONS.map(category => {
                            const Icon = category.icon;
                            const isActive = activeSection === category.id;
                            return (
                                <button
                                    key={category.id}
                                    className={`settings-nav-item ${isActive ? 'settings-nav-item--active' : ''}`}
                                    onClick={() => setActiveSection(category.id)}
                                >
                                    <div
                                        className="settings-nav-item__icon"
                                        style={isActive ? {
                                            background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                                            color: '#fff',
                                            boxShadow: `0 3px 10px ${category.color}55`,
                                        } : {
                                            color: category.color,
                                            background: `${category.color}15`,
                                        }}
                                    >
                                        <Icon size={16} />
                                    </div>
                                    <div className="settings-nav-item__text">
                                        <div className="settings-nav-item__label">{category.label}</div>
                                        <div className="settings-nav-item__desc">{category.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main className="settings-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            {renderSection()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default MemberSettings;