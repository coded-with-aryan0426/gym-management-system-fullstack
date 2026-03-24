import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, Save, User, Phone, Mail, MapPin, Award, Shield, Key,
    Star, Calendar, Users, Edit3, Clock, TrendingUp, Target,
    Briefcase, FileText, CheckCircle, Upload,
    Instagram, Linkedin, Globe, Dumbbell, Heart,
    Activity, Zap, Medal, BadgeCheck, CreditCard, History,
    Download, Lock, Smartphone, Droplet, Languages,
    Building2, ChevronRight, Banknote, AlertTriangle
} from 'lucide-react';
import { showToast } from '../../utils/showToast';
import { trainerApi } from '../../services/trainerApi';
import type { TrainerProfile as TrainerProfileType, TrainerSession, TrainerMember, WeeklyShift } from '../../services/trainerApi';
import './TrainerProfile.css';
import { format } from 'date-fns';

const TrainerProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [profile, setProfile] = useState<TrainerProfileType>({
        userId: 0,
        name: '',
        email: '',
        phone: '',
        role: 'Senior Personal Trainer',
        languages: [],
        specializations: [],
        certifications: [],
        stats: {
            activeMembers: 0,
            totalMembers: 0,
            sessionsMonth: 0,
            attendance: 0,
            rating: 0,
            reviews: 0,
            experience: '0 Yrs',
            earnings: 0
        }
    });

    const [formData, setFormData] = useState<Partial<TrainerProfileType>>({});
    const [sessions, setSessions] = useState<TrainerSession[]>([]);
    const [members, setMembers] = useState<TrainerMember[]>([]);
    const [weeklyShifts, setWeeklyShifts] = useState<WeeklyShift[]>([]);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await trainerApi.getProfile();
            setProfile(data);
            setFormData(data);
        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setIsLoading(false);
        }
        trainerApi.getSchedule().then(s => {
            const sorted = [...s].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
            setSessions(sorted.slice(0, 5));
        }).catch(() => {});
        trainerApi.getMyMembers().then(m => {
            setMembers(Array.isArray(m) ? m.slice(0, 5) : []);
        }).catch(() => {});
        trainerApi.getWeeklyShifts().then(shifts => {
            setWeeklyShifts(shifts);
        }).catch((err) => {
            console.error('Failed to load weekly shifts', err);
        });
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) { showToast('Name is required', 'error'); return; }
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) { showToast('Invalid phone number format', 'error'); return; }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { showToast('Invalid email format', 'error'); return; }
        try {
            showToast('Saving profile...', 'info');
            const updated = await trainerApi.updateProfile(formData);
            setProfile(updated);
            setIsEditing(false);
            showToast('Profile updated successfully', 'success');
        } catch (error) {
            showToast('Failed to update profile', 'error');
        }
    };

    const handleChangePassword = async () => {
        if (!passwordForm.newPass) { showToast('Enter a new password', 'error'); return; }
        if (passwordForm.newPass !== passwordForm.confirm) { showToast('Passwords do not match', 'error'); return; }
        if (passwordForm.newPass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
        try {
            showToast('Updating password...', 'info');
            await trainerApi.changePassword(passwordForm.current, passwordForm.newPass);
            setShowPasswordForm(false);
            setPasswordForm({ current: '', newPass: '', confirm: '' });
            showToast('Password updated successfully', 'success');
        } catch {
            showToast('Failed to update password. Check current password.', 'error');
        }
    };

    const handleChange = (field: keyof TrainerProfileType, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = useState<string>('document');

    const handleUploadClick = (type: string) => {
        setUploadType(type);
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                showToast('Uploading...', 'info');
                const doc = await trainerApi.uploadDocument(file, uploadType);
                showToast('Uploaded successfully', 'success');
                if (uploadType === 'certification') {
                    const newCert = { name: doc.name, issuer: 'Uploaded', year: new Date().getFullYear().toString(), valid: true, expires: 'N/A' };
                    const updatedCerts = [...(formData.certifications || profile.certifications || []), newCert];
                    setFormData(prev => ({ ...prev, certifications: updatedCerts }));
                    setProfile(prev => ({ ...prev, certifications: updatedCerts }));
                } else if (uploadType === 'avatar') {
                    setProfile(prev => ({ ...prev, avatarUrl: doc.url }));
                } else {
                    const updatedDocs = [...(formData.documents || profile.documents || []), doc];
                    setFormData(prev => ({ ...prev, documents: updatedDocs }));
                    setProfile(prev => ({ ...prev, documents: updatedDocs }));
                }
            } catch (error) {
                showToast('Upload failed', 'error');
            }
        }
    };

    const renderField = (field: keyof TrainerProfileType, label?: string, type: 'text' | 'date' | 'select' | 'tel' | 'email' = 'text', options?: string[]) => {
        const val = formData[field] || profile[field] || '';
        if (!isEditing) {
            let displayVal = val as string || '-';
            if (type === 'date' && val) {
                try { displayVal = format(new Date(val as string), 'MMM dd, yyyy'); } catch { displayVal = val as string; }
            }
            return <span>{displayVal}</span>;
        }
        if (type === 'select' && options) {
            return (
                <select className="tp__select" value={val as string} onChange={(e) => handleChange(field, e.target.value)}>
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        }
        return <input className="tp__input" type={type} value={val as string} onChange={(e) => handleChange(field, e.target.value)} placeholder={label} />;
    };

    const renderTagsInput = (field: 'languages' | 'specializations') => {
        const items = (isEditing ? formData[field] : profile[field]) || [];
        if (!isEditing) {
            return (
                <div className="tp__tags">
                    {items.length > 0 ? items.map((item, i) => (
                        <span key={i} className="tp__tag">{item}</span>
                    )) : <span className="tp__tag tp__tag--empty">-</span>}
                </div>
            );
        }
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (val && !items.includes(val)) {
                    setFormData(prev => ({ ...prev, [field]: [...items, val] }));
                    e.currentTarget.value = '';
                }
            }
        };
        const removeTag = (tag: string) => setFormData(prev => ({ ...prev, [field]: items.filter(t => t !== tag) }));
        return (
            <div className="tp__tags-input-wrapper">
                <div className="tp__tags">
                    {items.map((item, i) => (
                        <span key={i} className="tp__tag">
                            {item}
                            <button onClick={() => removeTag(item)} className="tp__tag-remove">×</button>
                        </span>
                    ))}
                </div>
                <input className="tp__input" placeholder="Type and press Enter to add..." onKeyDown={handleKeyDown} />
            </div>
        );
    };

    if (isLoading) return (
        <div className="tp-loading">
            <div className="tp-spinner"></div>
            <p>Loading Profile...</p>
        </div>
    );

    const stats = profile.stats || { activeMembers: 0, totalMembers: 0, sessionsMonth: 0, attendance: 0, rating: 0, reviews: 0, experience: '-', earnings: 0 };
    const certifications = profile.certifications || [];

    const getShiftHours = (shift?: string) => {
        if (!shift) return '6AM–2PM';
        if (shift.includes('Evening')) return '2PM–10PM';
        if (shift.includes('General')) return '9AM–5PM';
        return '6AM–2PM';
    };
    const shiftHours = getShiftHours(profile.shift);
    const schedule = [
        { day: 'Mon', short: 'M', hours: shiftHours, off: false },
        { day: 'Tue', short: 'T', hours: shiftHours, off: false },
        { day: 'Wed', short: 'W', hours: shiftHours, off: false },
        { day: 'Thu', short: 'T', hours: shiftHours, off: false },
        { day: 'Fri', short: 'F', hours: shiftHours, off: false },
        { day: 'Sat', short: 'S', hours: profile.shift?.includes('Evening') ? '2PM–8PM' : '8AM–12PM', off: false },
        { day: 'Sun', short: 'S', hours: 'Day Off', off: true },
    ];

    const achievements = (() => {
        const a: { icon: any; title: string; desc: string; color: string }[] = [];
        if (stats.rating >= 4.8) a.push({ icon: Star, title: `${stats.rating}★ Rating`, desc: `${stats.reviews} client reviews`, color: '#F59E0B' });
        if (stats.sessionsMonth >= 50) a.push({ icon: Zap, title: 'High Volume', desc: `${stats.sessionsMonth} sessions/month`, color: '#8B5CF6' });
        if (stats.activeMembers >= 15) a.push({ icon: Users, title: 'Client Champion', desc: `${stats.activeMembers} active clients`, color: '#3B82F6' });
        if (stats.attendance >= 90) a.push({ icon: CheckCircle, title: 'Top Attendance', desc: `${stats.attendance}% rate`, color: '#10B981' });
        if (stats.reviews >= 100) a.push({ icon: Medal, title: '100 Reviews', desc: 'Milestone reached', color: '#F59E0B' });
        if (a.length === 0) a.push({ icon: Target, title: 'Getting Started', desc: 'Keep up the great work!', color: '#64748b' });
        return a.slice(0, 4);
    })();

    const recentActivity = sessions.slice(0, 3).map(s => {
        const d = new Date(s.sessionDate);
        const now = new Date();
        const diffHours = (now.getTime() - d.getTime()) / 3600000;
        const timeLabel = diffHours < 1 ? 'Just now' : diffHours < 24 ? `${Math.round(diffHours)}h ago` : diffHours < 48 ? 'Yesterday' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return {
            action: s.status === 'COMPLETED' ? 'Completed PT session' : s.status === 'CANCELLED' ? 'Session cancelled' : 'Session scheduled',
            with: s.member?.fullName || 'Unknown member',
            time: timeLabel,
            type: s.status === 'COMPLETED' ? 'session' : s.status === 'CANCELLED' ? 'cancel' : 'new'
        };
    });

    const isVerified = (certifications.length > 0) || !!profile.employeeId;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'professional', label: 'Work', icon: Briefcase },
        { id: 'performance', label: 'Stats', icon: TrendingUp },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="tp">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />

            {/* ── HEADER ── */}
            <div className="tp__header">
                <div className="tp__header-bg" />
                <div className="tp__header-content">
                    <div className="tp__profile-row">
                        <div className="tp__avatar">
                            <img src={`https://ui-avatars.com/api/?name=${(profile.name || 'Trainer').replace(' ', '+')}&background=10B981&color=fff&size=96`} alt="" />
                            <button className="tp__avatar-btn" onClick={() => handleUploadClick('avatar')} title="Change photo">
                                <Camera size={12} />
                            </button>
                        </div>
                        <div className="tp__profile-info">
                            <div className="tp__name-row">
                                {isEditing ? (
                                    <input className="tp__input-title" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                                ) : (
                                    <h1>{profile.name}</h1>
                                )}
                                {isVerified && <span className="tp__badge tp__badge--verified"><BadgeCheck size={11} /> Verified</span>}
                            </div>
                            <p className="tp__role">{profile.role} · {profile.department || 'General'}</p>
                            <div className="tp__meta">
                                <span><Mail size={11} /> {profile.email}</span>
                                <span><Phone size={11} /> {renderField('phone', 'Phone', 'tel')}</span>
                                <span><MapPin size={11} /> {renderField('address', 'Location')}</span>
                            </div>
                        </div>
                        <div className="tp__header-stats">
                            <div className="tp__header-stat">
                                <span className="tp__header-stat-value">{stats.activeMembers}</span>
                                <span className="tp__header-stat-label">Clients</span>
                            </div>
                            <div className="tp__header-stat">
                                <span className="tp__header-stat-value">{stats.sessionsMonth}</span>
                                <span className="tp__header-stat-label">Sessions</span>
                            </div>
                            <div className="tp__header-stat">
                                <span className="tp__header-stat-value" style={{ color: '#F59E0B' }}>{stats.rating}<small>★</small></span>
                                <span className="tp__header-stat-label">Rating</span>
                            </div>
                        </div>
                        <div className="tp__header-actions">
                            {!isEditing ? (
                                <button className="tp__btn tp__btn--edit" onClick={() => setIsEditing(true)}><Edit3 size={13} /> Edit Profile</button>
                            ) : (
                                <>
                                    <button className="tp__btn tp__btn--cancel" onClick={() => { setIsEditing(false); setFormData(profile); }}>Cancel</button>
                                    <button className="tp__btn tp__btn--save" onClick={handleSave}><Save size={13} /> Save</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BODY ── */}
            <div className="tp__body">
                <div className="tp__tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} className={`tp__tab ${activeTab === tab.id ? 'tp__tab--active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="tp__content">

                    {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
                    {activeTab === 'overview' && (
                        <div className="tp__grid tp__grid--overview">
                            <div className="tp__col tp__col--main">

                                {/* ── Personal Details ── */}
                                <div className="tp__card tp__card--blue">
                                    <div className="tp__card-head">
                                        <div className="tp__card-head-icon tp__card-head-icon--blue"><User size={15} /></div>
                                        <div>
                                            <h3 className="tp__card-title">Personal Details</h3>
                                            <p className="tp__card-desc">Identity &amp; contact information</p>
                                        </div>
                                    </div>
                                    <div className="tp__fields-grid">
                                        {/* Employee ID – read only */}
                                        <div className="tp__field">
                                            <div className="tp__field-label"><Lock size={10} /> Employee ID</div>
                                            <div className="tp__field-val tp__field-val--mono tp__field-val--green">
                                                {profile.employeeId || 'Generating…'}
                                            </div>
                                        </div>
                                        <div className="tp__field">
                                            <div className="tp__field-label"><Calendar size={10} /> Date of Birth</div>
                                            <div className="tp__field-val">{renderField('dob', 'DOB', 'date')}</div>
                                        </div>
                                        <div className="tp__field">
                                            <div className="tp__field-label"><User size={10} /> Gender</div>
                                            <div className="tp__field-val">{renderField('gender', 'Gender', 'select', ['Male', 'Female', 'Other'])}</div>
                                        </div>
                                        <div className="tp__field">
                                            <div className="tp__field-label"><Droplet size={10} /> Blood Type</div>
                                            <div className="tp__field-val">{renderField('bloodType', 'Blood Type', 'select', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}</div>
                                        </div>
                                        <div className="tp__field">
                                            <div className="tp__field-label"><Phone size={10} /> Alt. Phone</div>
                                            <div className="tp__field-val">{renderField('altPhone', 'Alt Phone', 'tel')}</div>
                                        </div>
                                        <div className="tp__field tp__field--full">
                                            <div className="tp__field-label"><Languages size={10} /> Languages Spoken</div>
                                            <div className="tp__field-val">{renderTagsInput('languages')}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Emergency Contact ── */}
                                <div className="tp__card tp__card--red">
                                    <div className="tp__card-head">
                                        <div className="tp__card-head-icon tp__card-head-icon--red"><AlertTriangle size={15} /></div>
                                        <div>
                                            <h3 className="tp__card-title">Emergency Contact</h3>
                                            <p className="tp__card-desc">Person to contact in an emergency</p>
                                        </div>
                                    </div>
                                    <div className="tp__fields-grid tp__fields-grid--2">
                                        <div className="tp__field">
                                            <div className="tp__field-label"><User size={10} /> Contact Person</div>
                                            <div className="tp__field-val">{renderField('emergencyName')}</div>
                                        </div>
                                        <div className="tp__field">
                                            <div className="tp__field-label"><Phone size={10} /> Phone</div>
                                            <div className="tp__field-val">{renderField('emergencyPhone', 'Phone', 'tel')}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Expertise & Bio ── */}
                                <div className="tp__card tp__card--purple tp__expertise-card">
                                    <div className="tp__expertise-header">
                                        <div className="tp__expertise-header-icon"><Dumbbell size={16} /></div>
                                        <div>
                                            <h3 className="tp__expertise-title">Expertise &amp; Bio</h3>
                                            <p className="tp__expertise-subtitle">Skills, background &amp; social presence</p>
                                        </div>
                                    </div>
                                    <div className="tp__expertise-section">
                                        <div className="tp__expertise-section-label"><Target size={11} /> Specializations</div>
                                        {isEditing ? renderTagsInput('specializations') : (
                                            <div className="tp__spec-tags">
                                                {(profile.specializations || []).length > 0
                                                    ? (profile.specializations || []).map((s, i) => (
                                                        <span key={i} className="tp__spec-tag"><Zap size={10} />{s}</span>
                                                    ))
                                                    : <span className="tp__spec-tag tp__spec-tag--empty">No specializations listed</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="tp__expertise-divider" />
                                    <div className="tp__expertise-section">
                                        <div className="tp__expertise-section-label"><FileText size={11} /> Professional Bio</div>
                                        {isEditing ? (
                                            <textarea className="tp__input tp__textarea" rows={4} value={formData.bio || ''} onChange={e => handleChange('bio', e.target.value)} placeholder="Write a short professional bio..." />
                                        ) : (
                                            <div className="tp__bio-block">
                                                <p className="tp__bio-text">{profile.bio || 'No bio added yet.'}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="tp__expertise-divider" />
                                    <div className="tp__expertise-section">
                                        <div className="tp__expertise-section-label"><Globe size={11} /> Social Presence</div>
                                        {isEditing ? (
                                            <div className="tp__social-edit-row">
                                                <div className="tp__social-edit-field">
                                                    <span className="tp__social-edit-icon tp__social-edit-icon--ig"><Instagram size={12} /></span>
                                                    {renderField('instagram', '@username')}
                                                </div>
                                                <div className="tp__social-edit-field">
                                                    <span className="tp__social-edit-icon tp__social-edit-icon--li"><Linkedin size={12} /></span>
                                                    {renderField('linkedin', 'profile-url')}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="tp__social-pills">
                                                <a className={`tp__social-pill tp__social-pill--ig ${!profile.instagram ? 'tp__social-pill--empty' : ''}`}
                                                    href={profile.instagram ? `https://instagram.com/${profile.instagram.replace('@', '')}` : undefined} target="_blank" rel="noreferrer">
                                                    <Instagram size={13} /><span>{profile.instagram || 'Not linked'}</span>
                                                </a>
                                                <a className={`tp__social-pill tp__social-pill--li ${!profile.linkedin ? 'tp__social-pill--empty' : ''}`}
                                                    href={profile.linkedin ? `https://linkedin.com/in/${profile.linkedin}` : undefined} target="_blank" rel="noreferrer">
                                                    <Linkedin size={13} /><span>{profile.linkedin || 'Not linked'}</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ── Certifications ── */}
                                <div className="tp__card tp__card--green">
                                    <div className="tp__card-head">
                                        <div className="tp__card-head-icon tp__card-head-icon--green"><Award size={15} /></div>
                                        <div style={{ flex: 1 }}>
                                            <h3 className="tp__card-title">Certifications</h3>
                                            <p className="tp__card-desc">{certifications.length} credential{certifications.length !== 1 ? 's' : ''} on file</p>
                                        </div>
                                        <button className="tp__link-btn" onClick={() => handleUploadClick('certification')}>
                                            <Upload size={11} /> Add New
                                        </button>
                                    </div>
                                    <div className="tp__cert-list">
                                        {certifications.map((cert, i) => (
                                            <div key={i} className="tp__cert-item">
                                                <div className="tp__cert-icon">
                                                    <Award size={14} />
                                                </div>
                                                <div className="tp__cert-body">
                                                    <span className="tp__cert-name">{cert.name}</span>
                                                    <span className="tp__cert-issuer">{cert.issuer} · {cert.year}</span>
                                                </div>
                                                <span className={`tp__badge tp__badge--${cert.valid ? 'green' : 'red'}`}>
                                                    {cert.valid ? <><CheckCircle size={9} /> Valid</> : 'Expired'}
                                                </span>
                                            </div>
                                        ))}
                                        {certifications.length === 0 && (
                                            <div className="tp-empty">
                                                <Award size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                                                <p>No certifications listed</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ── SIDEBAR ── */}
                            <div className="tp__col tp__col--side">

                                {/* Achievements */}
                                <div className="tp__card tp__card--orange">
                                    <div className="tp__card-head">
                                        <div className="tp__card-head-icon tp__card-head-icon--gold"><Medal size={15} /></div>
                                        <div>
                                            <h3 className="tp__card-title">Achievements</h3>
                                            <p className="tp__card-desc">Earned milestones</p>
                                        </div>
                                    </div>
                                    <div className="tp__achieve-list">
                                        {achievements.map((a, i) => (
                                            <div key={i} className="tp__achieve-item">
                                                <div className="tp__achieve-icon" style={{ background: `${a.color}18`, color: a.color }}>
                                                    <a.icon size={14} />
                                                </div>
                                                <div className="tp__achieve-body">
                                                    <span className="tp__achieve-title">{a.title}</span>
                                                    <span className="tp__achieve-desc">{a.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="tp__card tp__card--blue">
                                    <div className="tp__card-head">
                                        <div className="tp__card-head-icon tp__card-head-icon--blue"><History size={15} /></div>
                                        <div>
                                            <h3 className="tp__card-title">Recent Activity</h3>
                                            <p className="tp__card-desc">Latest session updates</p>
                                        </div>
                                    </div>
                                    <div className="tp__activity-list">
                                        {recentActivity.length > 0 ? recentActivity.map((a, i) => (
                                            <div key={i} className="tp__activity-item">
                                                <div className={`tp__activity-dot tp__activity-dot--${a.type}`} />
                                                <div className="tp__activity-body">
                                                    <span className="tp__activity-action">{a.action}</span>
                                                    <span className="tp__activity-with">{a.with}</span>
                                                </div>
                                                <span className="tp__activity-time">{a.time}</span>
                                            </div>
                                        )) : <div className="tp-empty"><Activity size={20} style={{ opacity: 0.3, marginBottom: 6 }} /><p>No recent sessions</p></div>}
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="tp__card tp__card--green">
                                    <div className="tp__card-head">
                                        <div className="tp__card-head-icon tp__card-head-icon--green"><Clock size={15} /></div>
                                        <div>
                                            <h3 className="tp__card-title">Weekly Schedule</h3>
                                            <p className="tp__card-desc">
                                                {weeklyShifts.length > 0 
                                                    ? `${weeklyShifts.length} shift${weeklyShifts.length !== 1 ? 's' : ''} this week`
                                                    : 'No shifts assigned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="tp__sched-list">
                                        {schedule.map((s, i) => (
                                            <div key={i} className={`tp__sched-row ${s.off ? 'tp__sched-row--off' : ''}`}>
                                                <span className="tp__sched-day">{s.day}</span>
                                                <div className="tp__sched-bar">
                                                    {!s.off && (
                                                        <div 
                                                            className="tp__sched-bar-fill" 
                                                            style={{ 
                                                                width: s.duration ? `${Math.min(s.duration * 12.5, 100)}%` : '100%',
                                                                opacity: s.status === 'COMPLETED' ? 0.6 : 1
                                                            }}
                                                            title={s.status || 'Scheduled'}
                                                        />
                                                    )}
                                                </div>
                                                <span className="tp__sched-hours">{s.hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {weeklyShifts.length === 0 && (
                                        <p className="tp__card-hint">
                                            <AlertTriangle size={12} /> No shifts assigned by admin yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════ WORK TAB ══════════════════ */}
                    {activeTab === 'professional' && (
                        <div className="tp__grid tp__grid--2col">

                            {/* Employment */}
                            <div className="tp__card tp__card--purple">
                                <div className="tp__card-head">
                                    <div className="tp__card-head-icon tp__card-head-icon--purple"><Building2 size={15} /></div>
                                    <div>
                                        <h3 className="tp__card-title">Employment Details</h3>
                                        <p className="tp__card-desc">Role &amp; department info</p>
                                    </div>
                                </div>
                                <div className="tp__fields-grid">
                                    <div className="tp__field">
                                        <div className="tp__field-label"><Lock size={10} /> Employee ID</div>
                                        <div className="tp__field-val tp__field-val--mono tp__field-val--green">{profile.employeeId || 'Generating…'}</div>
                                    </div>
                                    <div className="tp__field">
                                        <div className="tp__field-label"><Briefcase size={10} /> Department</div>
                                        <div className="tp__field-val">{renderField('department', 'Dept', 'select', ['General', 'PT', 'Group Class', 'Management'])}</div>
                                    </div>
                                    <div className="tp__field">
                                        <div className="tp__field-label"><Award size={10} /> Designation</div>
                                        <div className="tp__field-val">{renderField('role')}</div>
                                    </div>
                                    <div className="tp__field">
                                        <div className="tp__field-label"><Calendar size={10} /> Joining Date</div>
                                        <div className="tp__field-val">{renderField('joiningDate', 'Date', 'date')}</div>
                                    </div>
                                    <div className="tp__field">
                                        <div className="tp__field-label"><User size={10} /> Reporting To</div>
                                        <div className="tp__field-val">{renderField('reportingTo')}</div>
                                    </div>
                                    <div className="tp__field">
                                        <div className="tp__field-label"><Clock size={10} /> Work Shift</div>
                                        <div className="tp__field-val">{renderField('shift', 'Shift', 'select', ['Morning (6am-2pm)', 'Evening (2pm-10pm)', 'General (9am-5pm)'])}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="tp__card tp__card--green">
                                <div className="tp__card-head">
                                    <div className="tp__card-head-icon tp__card-head-icon--green"><CreditCard size={15} /></div>
                                    <div>
                                        <h3 className="tp__card-title">Payment Details</h3>
                                        <p className="tp__card-desc">Banking &amp; salary info</p>
                                    </div>
                                </div>
                                <div className="tp__fields-grid tp__fields-grid--2">
                                    <div className="tp__field tp__field--full">
                                        <div className="tp__field-label"><Building2 size={10} /> Bank Name</div>
                                        <div className="tp__field-val">{renderField('bankName')}</div>
                                    </div>
                                    <div className="tp__field">
                                        <div className="tp__field-label"><CreditCard size={10} /> Account Number</div>
                                        <div className="tp__field-val">{renderField('accountNo')}</div>
                                    </div>
                                    <div className="tp__field">
                                        <div className="tp__field-label"><Briefcase size={10} /> IFSC Code</div>
                                        <div className="tp__field-val">{renderField('ifsc')}</div>
                                    </div>
                                </div>
                                <div className="tp__earnings-banner">
                                    <div className="tp__earnings-label"><Banknote size={13} /> Projected Monthly Earnings</div>
                                    <div className="tp__earnings-value">₹{stats.earnings.toLocaleString()}</div>
                                    <div className="tp__earnings-sub">
                                        {stats.sessionsMonth > 0 ? `₹${Math.round(stats.earnings / stats.sessionsMonth).toLocaleString()} avg per session` : 'No sessions this month'}
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="tp__card tp__card--full tp__card--blue">
                                <div className="tp__card-head">
                                    <div className="tp__card-head-icon tp__card-head-icon--blue"><FileText size={15} /></div>
                                    <div style={{ flex: 1 }}>
                                        <h3 className="tp__card-title">Documents</h3>
                                        <p className="tp__card-desc">{(profile.documents || []).length} file{(profile.documents || []).length !== 1 ? 's' : ''} uploaded</p>
                                    </div>
                                    <button className="tp__link-btn" onClick={() => handleUploadClick('document')}><Upload size={11} /> Upload New</button>
                                </div>
                                <div className="tp__docs-grid">
                                    {(profile.documents || []).map((doc, i) => (
                                        <div key={i} className="tp__doc-card">
                                            <div className="tp__doc-icon"><FileText size={18} /></div>
                                            <span className="tp__doc-name">{doc.name}</span>
                                            <a href={doc.url} target="_blank" rel="noreferrer" className="tp__doc-download"><Download size={13} /></a>
                                        </div>
                                    ))}
                                    {(!profile.documents || profile.documents.length === 0) && (
                                        <div className="tp-empty tp-empty--wide">
                                            <FileText size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                                            <p>No documents uploaded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════ STATS TAB ══════════════════ */}
                    {activeTab === 'performance' && (
                        <div className="tp__grid tp__grid--2col">

                            {/* KPI Overview */}
                            <div className="tp__card tp__card--full tp__card--orange">
                                <div className="tp__card-head">
                                    <div className="tp__card-head-icon tp__card-head-icon--gold"><TrendingUp size={15} /></div>
                                    <div>
                                        <h3 className="tp__card-title">Performance Overview</h3>
                                        <p className="tp__card-desc">Key metrics at a glance</p>
                                    </div>
                                </div>
                                <div className="tp__kpi-grid">
                                    {[
                                        { label: 'Active Clients', value: stats.activeMembers, icon: Users, color: '#3B82F6' },
                                        { label: 'Total Clients', value: stats.totalMembers, icon: Users, color: '#8B5CF6' },
                                        { label: 'Sessions / Mo', value: stats.sessionsMonth, icon: Activity, color: '#10B981' },
                                        { label: 'Attendance', value: `${stats.attendance}%`, icon: CheckCircle, color: stats.attendance >= 90 ? '#10B981' : '#F59E0B' },
                                        { label: `${stats.reviews} Reviews`, value: `${stats.rating}★`, icon: Star, color: '#F59E0B' },
                                        { label: 'Experience', value: stats.experience, icon: Award, color: '#F97316' },
                                    ].map((k, i) => (
                                        <div key={i} className="tp__kpi-card">
                                            <div className="tp__kpi-icon" style={{ background: `${k.color}18`, color: k.color }}><k.icon size={16} /></div>
                                            <div className="tp__kpi-value" style={{ color: k.color }}>{k.value}</div>
                                            <div className="tp__kpi-label">{k.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Monthly Earnings */}
                            <div className="tp__card tp__card--green">
                                <div className="tp__card-head">
                                    <div className="tp__card-head-icon tp__card-head-icon--green"><Banknote size={15} /></div>
                                    <div>
                                        <h3 className="tp__card-title">Monthly Earnings</h3>
                                        <p className="tp__card-desc">Projected this month</p>
                                    </div>
                                </div>
                                <div className="tp__earn-center">
                                    <div className="tp__earn-amount">₹{stats.earnings.toLocaleString()}</div>
                                    <div className="tp__earn-chip">
                                        <Banknote size={11} /> Avg ₹{stats.sessionsMonth > 0 ? Math.round(stats.earnings / stats.sessionsMonth).toLocaleString() : 0} / session
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Members */}
                            <div className="tp__card tp__card--blue">
                                <div className="tp__card-head">
                                    <div className="tp__card-head-icon tp__card-head-icon--blue"><Users size={15} /></div>
                                    <div>
                                        <h3 className="tp__card-title">Assigned Members</h3>
                                        <p className="tp__card-desc">{stats.activeMembers} active client{stats.activeMembers !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                {members.length > 0 ? (
                                    <div className="tp__member-list">
                                        {members.map((m, i) => (
                                            <div key={i} className="tp__member-row">
                                                <div className="tp__member-avatar">{(m.name || 'M').charAt(0).toUpperCase()}</div>
                                                <div className="tp__member-info">
                                                    <span className="tp__member-name">{m.name}</span>
                                                    <span className="tp__member-plan">{m.plan}</span>
                                                </div>
                                                <span className={`tp__badge tp__badge--${m.status === 'Active' ? 'green' : 'yellow'}`}>{m.status}</span>
                                            </div>
                                        ))}
                                        {stats.activeMembers > members.length && (
                                            <div className="tp__member-more">+{stats.activeMembers - members.length} more</div>
                                        )}
                                    </div>
                                ) : <div className="tp-empty"><Users size={22} style={{ opacity: 0.3, marginBottom: 6 }} /><p>No members assigned yet</p></div>}
                            </div>

                            {/* Recent Sessions */}
                            <div className="tp__card tp__card--purple">
                                <div className="tp__card-head">
                                    <div className="tp__card-head-icon tp__card-head-icon--purple"><Calendar size={15} /></div>
                                    <div>
                                        <h3 className="tp__card-title">Recent Sessions</h3>
                                        <p className="tp__card-desc">Last {sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                {sessions.length > 0 ? (
                                    <div className="tp__session-list">
                                        {sessions.map((s, i) => {
                                            const color = s.status === 'COMPLETED' ? '#10B981' : s.status === 'CANCELLED' ? '#EF4444' : '#F59E0B';
                                            return (
                                                <div key={i} className="tp__session-row">
                                                    <div className="tp__session-icon" style={{ background: `${color}18`, color }}><Activity size={13} /></div>
                                                    <div className="tp__session-info">
                                                        <span className="tp__session-name">{s.member?.fullName || 'Unknown'}</span>
                                                        <span className="tp__session-date">{new Date(s.sessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <span className={`tp__badge tp__badge--${s.status === 'COMPLETED' ? 'green' : s.status === 'CANCELLED' ? 'red' : 'yellow'}`}>{s.status}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : <div className="tp-empty"><Calendar size={22} style={{ opacity: 0.3, marginBottom: 6 }} /><p>No sessions yet</p></div>}
                            </div>
                        </div>
                    )}

                    {/* ══════════════════ SECURITY TAB ══════════════════ */}
                    {activeTab === 'security' && (
                        <div className="tp__security-wrap">
                            <div className="tp__security-header">
                                <Shield size={18} />
                                <div>
                                    <h2>Account Security</h2>
                                    <p>Manage your password and active sessions</p>
                                </div>
                            </div>

                            {/* Change Password */}
                            <div className="tp__sec-card">
                                <div className="tp__sec-card-icon tp__sec-card-icon--default"><Key size={18} /></div>
                                <div className="tp__sec-card-body">
                                    <h4>Password</h4>
                                    <p>Update your account password regularly for security</p>
                                </div>
                                <button className="tp__btn tp__btn--outline" onClick={() => setShowPasswordForm(true)}>
                                    Change Password
                                </button>
                            </div>

                            {/* 2FA */}
                            <div className="tp__sec-card">
                                <div className="tp__sec-card-icon tp__sec-card-icon--green"><Shield size={18} /></div>
                                <div className="tp__sec-card-body">
                                    <h4>Two-Factor Authentication</h4>
                                    <p className="tp__text--green">Enabled via Authenticator App</p>
                                </div>
                                <button className="tp__btn tp__btn--outline" onClick={() => showToast('2FA settings are managed by your administrator', 'info')}>Configure</button>
                            </div>

                            {/* Active Sessions */}
                            <div className="tp__sec-card">
                                <div className="tp__sec-card-icon tp__sec-card-icon--default"><Smartphone size={18} /></div>
                                <div className="tp__sec-card-body">
                                    <h4>Active Sessions</h4>
                                    <p>This browser session is currently active</p>
                                </div>
                                <button className="tp__btn tp__btn--outline tp__btn--danger" onClick={() => {
                                    if (window.confirm('Sign out from all devices? You will need to log in again.')) {
                                        showToast('Signing out all sessions...', 'info');
                                        setTimeout(() => { localStorage.clear(); window.location.href = '/login'; }, 1000);
                                    }
                                }}>Sign Out All</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordForm && (
                <div className="tp__modal-overlay" onClick={() => setShowPasswordForm(false)}>
                    <div className="tp__modal" onClick={(e) => e.stopPropagation()}>
                        <div className="tp__modal-header">
                            <Lock size={20} />
                            <h3>Change Password</h3>
                            <button className="tp__modal-close" onClick={() => setShowPasswordForm(false)}>×</button>
                        </div>
                        <div className="tp__modal-body">
                            <div className="tp__modal-field">
                                <label>Current Password</label>
                                <input 
                                    className="tp__input" 
                                    type="password" 
                                    placeholder="Enter current password" 
                                    value={passwordForm.current} 
                                    onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} 
                                />
                            </div>
                            <div className="tp__modal-field">
                                <label>New Password</label>
                                <input 
                                    className="tp__input" 
                                    type="password" 
                                    placeholder="Minimum 6 characters" 
                                    value={passwordForm.newPass} 
                                    onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} 
                                />
                            </div>
                            <div className="tp__modal-field">
                                <label>Confirm New Password</label>
                                <input 
                                    className="tp__input" 
                                    type="password" 
                                    placeholder="Re-enter new password" 
                                    value={passwordForm.confirm} 
                                    onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} 
                                />
                            </div>
                        </div>
                        <div className="tp__modal-footer">
                            <button className="tp__btn tp__btn--cancel" onClick={() => setShowPasswordForm(false)}>
                                Cancel
                            </button>
                            <button className="tp__btn tp__btn--save" onClick={handleChangePassword}>
                                <Lock size={14} /> Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerProfile;
