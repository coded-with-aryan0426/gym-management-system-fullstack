import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, Save, User, Phone, Mail, MapPin, Award, Shield, Key,
    Star, Calendar, Users, Edit3, Clock, TrendingUp, Target,
    Briefcase, FileText, CheckCircle, AlertCircle, Upload,
    Instagram, Linkedin, Globe, Dumbbell, Heart,
    Activity, Zap, Medal, BadgeCheck, CreditCard, History,
    ChevronRight, Eye, Download, Lock, Smartphone
} from 'lucide-react';
import { showToast } from '../../utils/showToast';
import { trainerApi } from '../../services/trainerApi';
import type { TrainerProfile as TrainerProfileType } from '../../services/trainerApi';
import './TrainerProfile.css';

import { format } from 'date-fns';

const TrainerProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initial State Structure
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

    // Form State (for editing)
    const [formData, setFormData] = useState<Partial<TrainerProfileType>>({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await trainerApi.getProfile();
            setProfile(data);
            setFormData(data); // Initialize form data
        } catch (error) {
            console.error('Failed to load profile', error);
            // toast.error('Failed to load profile'); // Suppressed for smoother devux if backend off
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name?.trim()) {
            showToast('Name is required', 'error');
            return;
        }
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            showToast('Invalid phone number format', 'error');
            return;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            showToast('Invalid email format', 'error');
            return;
        }

        try {
            showToast('Saving profile...', 'info');
            const updated = await trainerApi.updateProfile(formData);
            setProfile(updated);
            setIsEditing(false);
            showToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Update failed', error);
            showToast('Failed to update profile', 'error');
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
                    const newCert = {
                        name: doc.name,
                        issuer: 'Uploaded',
                        year: new Date().getFullYear().toString(),
                        valid: true,
                        expires: 'N/A'
                    };
                    const updatedCerts = [...(formData.certifications || profile.certifications || []), newCert];
                    setFormData(prev => ({ ...prev, certifications: updatedCerts }));
                    setProfile(prev => ({ ...prev, certifications: updatedCerts }));
                } else {
                    const updatedDocs = [...(formData.documents || profile.documents || []), doc];
                    setFormData(prev => ({ ...prev, documents: updatedDocs }));
                    setProfile(prev => ({ ...prev, documents: updatedDocs }));
                }
            } catch (error) {
                showToast('Upload failed', 'error');
                console.error(error);
            }
        }
    };

    // Helper to render editable fields with types
    const renderField = (field: keyof TrainerProfileType, label?: string, type: 'text' | 'date' | 'select' | 'tel' | 'email' = 'text', options?: string[]) => {
        const val = formData[field] || profile[field] || '';
        
        if (!isEditing) {
            let displayVal = val as string || '-';
            if (type === 'date' && val) {
                try {
                    displayVal = format(new Date(val as string), 'MMM dd, yyyy');
                } catch (e) {
                    displayVal = val as string;
                }
            }
            return <span>{displayVal}</span>;
        }

        if (type === 'select' && options) {
            return (
                <select 
                    className="tp__select"
                    value={val as string}
                    onChange={(e) => handleChange(field, e.target.value)}
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }

        return (
            <input
                className="tp__input"
                type={type}
                value={val as string}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={label}
            />
        );
    };

    // Helper for Tags Input (Languages, Specializations)
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

        const removeTag = (tag: string) => {
            setFormData(prev => ({ ...prev, [field]: items.filter(t => t !== tag) }));
        };

        return (
            <div className="tp__tags-input-wrapper">
                <div className="tp__tags">
                    {items.map((item, i) => (
                        <span key={i} className="tp__tag">
                            {item}
                            <button onClick={() => removeTag(item)} style={{marginLeft: 4, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}>×</button>
                        </span>
                    ))}
                </div>
                <input 
                    className="tp__input" 
                    placeholder="Type and press Enter to add..." 
                    onKeyDown={handleKeyDown}
                />
            </div>
        );
    };

    if (isLoading) return (
        <div className="tp-loading">
            <div className="tp-spinner"></div>
            <p>Loading Profile...</p>
        </div>
    );

    // Derived Data for UI compatibility
    const stats = profile.stats || {
        activeMembers: 0,
        totalMembers: 0,
        sessionsMonth: 0,
        attendance: 0,
        rating: 0,
        reviews: 0,
        experience: '-',
        earnings: 0
    };

    const certifications = profile.certifications || [];

    // Static Mock Data for things not in DB yet (Schedule, Achievements, Activity)
    const schedule = [
        { day: 'Mon', hours: '6AM-2PM', sessions: 5 },
        { day: 'Tue', hours: '6AM-2PM', sessions: 6 },
        { day: 'Wed', hours: '6AM-2PM', sessions: 4 },
        { day: 'Thu', hours: '6AM-2PM', sessions: 5 },
        { day: 'Fri', hours: '6AM-2PM', sessions: 6 },
        { day: 'Sat', hours: '8AM-12PM', sessions: 3 },
        { day: 'Sun', hours: 'Off', sessions: 0 },
    ];

    const achievements = [
        { icon: Medal, title: 'Top Trainer Dec 2024', desc: 'Highest retention' },
        { icon: Target, title: '100 Sessions Milestone', desc: 'Nov 2024' },
        { icon: Star, title: '5-Star Streak', desc: '30 days perfect rating' },
        { icon: Heart, title: 'Client Favorite', desc: 'Most requested trainer' },
    ];

    const recentActivity = [
        { action: 'Completed PT session', with: 'Emma Davis', time: '2h ago', type: 'session' },
        { action: 'Progress note added', with: 'Mike Chen', time: '3h ago', type: 'note' },
        { action: 'New client assigned', with: 'Sarah Wilson', time: 'Yesterday', type: 'new' },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User, colorClass: 'tp__icon--blue' },
        { id: 'professional', label: 'Work', icon: Briefcase, colorClass: 'tp__icon--orange' },
        { id: 'performance', label: 'Stats', icon: TrendingUp, colorClass: 'tp__icon--gold' },
        { id: 'security', label: 'Security', icon: Shield, colorClass: 'tp__icon--success' },
    ];

    return (
        <div className="tp">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            <div className="tp__header">
                <div className="tp__header-bg" />
                <div className="tp__header-content">
                    <div className="tp__profile-row">
                        <div className="tp__avatar">
                            <img src={`https://ui-avatars.com/api/?name=${(profile.name || 'Trainer').replace(' ', '+')}&background=DC2626&color=fff&size=96`} alt="" />
                            <button className="tp__avatar-btn"><Camera size={12} /></button>
                        </div>
                        <div className="tp__profile-info">
                            <div className="tp__name-row">
                                {isEditing ? (
                                    <input
                                        className="tp__input-title"
                                        value={formData.name || ''}
                                        onChange={e => handleChange('name', e.target.value)}
                                    />
                                ) : (
                                    <h1>{profile.name}</h1>
                                )}
                                <span className="tp__badge tp__badge--verified"><BadgeCheck size={12} /> Verified</span>
                            </div>
                            <p className="tp__role">{profile.role} • {profile.department || 'General'}</p>
                            <div className="tp__meta">
                                <span><Mail size={12} /> {profile.email}</span>
                                <span><Phone size={12} /> {renderField('phone', 'Phone', 'tel')}</span>
                                <span><MapPin size={12} /> {renderField('address', 'Location')}</span>
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
                                <span className="tp__header-stat-value">{stats.rating}<small>★</small></span>
                                <span className="tp__header-stat-label">Rating</span>
                            </div>
                        </div>

                        <div className="tp__header-actions">
                            {!isEditing ? (
                                <button className="tp__btn tp__btn--edit" onClick={() => setIsEditing(true)}>
                                    <Edit3 size={14} /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button className="tp__btn tp__btn--cancel" onClick={() => { setIsEditing(false); setFormData(profile); }}>Cancel</button>
                                    <button className="tp__btn tp__btn--save" onClick={handleSave}><Save size={14} /> Save Changes</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="tp__body">
                <div className="tp__tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tp__tab ${activeTab === tab.id ? 'tp__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={14} className={tab.colorClass} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="tp__content">
                    {activeTab === 'overview' && (
                        <div className="tp__grid tp__grid--overview">
                            <div className="tp__col tp__col--main">
                                <div className="tp__card">
                                    <h3 className="tp__card-title"><User size={14} className="tp__icon--blue" /> Personal Details</h3>
                                    <div className="tp__info-grid tp__info-grid--3">
                                        <div className="tp__info"><label>Employee ID</label>{renderField('employeeId')}</div>
                                        <div className="tp__info"><label>Date of Birth</label>{renderField('dob', 'DOB', 'date')}</div>
                                        <div className="tp__info"><label>Gender</label>{renderField('gender', 'Gender', 'select', ['Male', 'Female', 'Other'])}</div>
                                        <div className="tp__info"><label>Blood Type</label>{renderField('bloodType', 'Blood Type', 'select', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}</div>
                                        <div className="tp__info"><label>Alt. Phone</label>{renderField('altPhone', 'Alt Phone', 'tel')}</div>
                                        
                                        <div className="tp__info tp__info--full">
                                            <label>Languages Spoken</label>
                                            {renderTagsInput('languages')}
                                        </div>
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <h3 className="tp__card-title"><Heart size={14} className="tp__icon--danger" /> Emergency Contact</h3>
                                    <div className="tp__info-grid tp__info-grid--2">
                                        <div className="tp__info"><label>Contact Person</label>{renderField('emergencyName')}</div>
                                        <div className="tp__info"><label>Emergency Phone</label>{renderField('emergencyPhone', 'Phone', 'tel')}</div>
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <h3 className="tp__card-title"><Dumbbell size={14} className="tp__icon--purple" /> Expertise & Bio</h3>
                                    <div className="tp__info">
                                        <label>Specializations</label>
                                        {renderTagsInput('specializations')}
                                    </div>
                                    <div className="tp__info" style={{marginTop: 12}}>
                                        <label>Professional Bio</label>
                                        {isEditing ? (
                                            <textarea className="tp__input tp__textarea" rows={4}
                                                value={formData.bio || ''}
                                                onChange={e => handleChange('bio', e.target.value)}
                                            />
                                        ) : <p className="tp__bio">{profile.bio}</p>}
                                    </div>
                                    <div className="tp__social" style={{marginTop: 16}}>
                                        <div className="tp__info" style={{flex: 1}}>
                                            <label><Instagram size={10} /> Instagram</label>
                                            {renderField('instagram', '@username')}
                                        </div>
                                        <div className="tp__info" style={{flex: 1}}>
                                            <label><Linkedin size={10} /> LinkedIn</label>
                                            {renderField('linkedin', 'profile-url')}
                                        </div>
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <div className="tp__card-header">
                                        <h3 className="tp__card-title"><Award size={14} /> Certifications</h3>
                                        <button className="tp__link-btn" onClick={() => handleUploadClick('certification')}>
                                            Add New <Upload size={12} />
                                        </button>
                                    </div>
                                    <div className="tp__certs">
                                        {certifications.map((cert, i) => (
                                            <div key={i} className="tp__list-item">
                                                <div className="tp__list-icon"><Award size={16} /></div>
                                                <div className="tp__list-content">
                                                    <span className="tp__list-title">{cert.name}</span>
                                                    <span className="tp__list-subtitle">{cert.issuer}</span>
                                                </div>
                                                <div className="tp__list-meta">
                                                    <span className={`tp__badge tp__badge--${cert.valid ? 'green' : 'red'}`}>
                                                        {cert.valid ? 'Valid' : 'Expired'}
                                                    </span>
                                                    <span style={{marginLeft: 8}}>{cert.year}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {certifications.length === 0 && <div className="tp-empty">No certifications listed</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="tp__col tp__col--side">
                                <div className="tp__card tp__card--compact">
                                    <h3 className="tp__card-title"><Medal size={14} className="tp__icon--gold" /> Achievements</h3>
                                    <div className="tp__achievements">
                                        {achievements.map((a, i) => (
                                            <div key={i} className="tp__list-item">
                                                <div className="tp__list-icon" style={{color: '#F59E0B'}}><a.icon size={16} /></div>
                                                <div className="tp__list-content">
                                                    <span className="tp__list-title" style={{fontSize: 12}}>{a.title}</span>
                                                    <span className="tp__list-subtitle">{a.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="tp__card tp__card--compact">
                                    <h3 className="tp__card-title"><History size={14} className="tp__icon--info" /> Recent Activity</h3>
                                    <div className="tp__activities">
                                        {recentActivity.map((a, i) => (
                                            <div key={i} className="tp__activity">
                                                <span className={`tp__activity-dot tp__activity-dot--${a.type}`} />
                                                <div style={{flex: 1}}>
                                                    <span className="tp__activity-action">{a.action}</span>
                                                    <span className="tp__activity-with">{a.with}</span>
                                                </div>
                                                <span className="tp__activity-time">{a.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="tp__card tp__card--compact">
                                    <h3 className="tp__card-title"><Clock size={14} className="tp__icon--success" /> Schedule</h3>
                                    <div className="tp__schedule">
                                        {schedule.map((s, i) => (
                                            <div key={i} className={`tp__schedule-day ${s.sessions === 0 ? 'tp__schedule-day--off' : ''}`}>
                                                <span className="tp__schedule-name">{s.day}</span>
                                                <span className="tp__schedule-hours">{s.hours}</span>
                                                <span className="tp__schedule-sessions">{s.sessions > 0 ? `${s.sessions}` : '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'professional' && (
                        <div className="tp__grid tp__grid--2col">
                            <div className="tp__card">
                                <h3 className="tp__card-title"><Briefcase size={14} /> Employment Details</h3>
                                <div className="tp__info-grid tp__info-grid--2">
                                    <div className="tp__info"><label>Employee ID</label>{renderField('employeeId')}</div>
                                    <div className="tp__info"><label>Department</label>{renderField('department', 'Dept', 'select', ['General', 'PT', 'Group Class', 'Management'])}</div>
                                    <div className="tp__info"><label>Designation</label>{renderField('role')}</div>
                                    <div className="tp__info"><label>Joining Date</label>{renderField('joiningDate', 'Date', 'date')}</div>
                                    <div className="tp__info"><label>Reporting To</label>{renderField('reportingTo')}</div>
                                    <div className="tp__info"><label>Work Shift</label>{renderField('shift', 'Shift', 'select', ['Morning (6am-2pm)', 'Evening (2pm-10pm)', 'General (9am-5pm)'])}</div>
                                </div>
                            </div>

                            <div className="tp__card">
                                <h3 className="tp__card-title"><CreditCard size={14} className="tp__icon--success" /> Payment Details</h3>
                                <div className="tp__info-grid tp__info-grid--2">
                                    <div className="tp__info tp__info--full"><label>Bank Name</label>{renderField('bankName')}</div>
                                    <div className="tp__info"><label>Account Number</label>{renderField('accountNo')}</div>
                                    <div className="tp__info"><label>IFSC Code</label>{renderField('ifsc')}</div>
                                    <div className="tp__info tp__info--full" style={{marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                                        <label>Projected Monthly Earnings</label>
                                        <span className="tp__value--highlight" style={{fontSize: 18}}>₹{stats.earnings.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="tp__card tp__card--full">
                                <div className="tp__card-header">
                                    <h3 className="tp__card-title"><FileText size={14} className="tp__icon--blue" /> Documents</h3>
                                    <button className="tp__link-btn" onClick={() => handleUploadClick('document')}>
                                        Upload New <Upload size={12} />
                                    </button>
                                </div>
                                <div className="tp__docs">
                                    {(profile.documents || []).map((doc, i) => (
                                        <div key={i} className="tp__doc">
                                            <div className="tp__doc-icon"><FileText size={20} /></div>
                                            <div className="tp__doc-name">{doc.name}</div>
                                            <a href={doc.url} target="_blank" rel="noreferrer" className="tp__icon-btn">
                                                <Download size={14} />
                                            </a>
                                        </div>
                                    ))}
                                    {(!profile.documents || profile.documents.length === 0) && <div className="tp-empty">No documents uploaded</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="tp__grid tp__grid--2col">
                            <div className="tp__card tp__card--full" style={{textAlign: 'center', padding: 40}}>
                                <TrendingUp size={48} style={{opacity: 0.2, marginBottom: 16}} />
                                <h3 style={{color: '#fff', marginBottom: 8}}>Performance Analytics</h3>
                                <p style={{color: '#64748b', fontSize: 13}}>Detailed performance charts and client retention metrics are being calculated.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="tp__security">
                            <div className="tp__security-item">
                                <div className="tp__security-icon"><Key size={18} /></div>
                                <div className="tp__security-content">
                                    <h4>Password</h4>
                                    <p>Last changed 30 days ago</p>
                                </div>
                                <button className="tp__btn tp__btn--outline">Change Password</button>
                            </div>
                            <div className="tp__security-item">
                                <div className="tp__security-icon tp__security-icon--green"><Shield size={18} /></div>
                                <div className="tp__security-content">
                                    <h4>Two-Factor Authentication</h4>
                                    <p className="tp__text--green">Enabled via Authenticator App</p>
                                </div>
                                <button className="tp__btn tp__btn--outline">Configure</button>
                            </div>
                            <div className="tp__security-item">
                                <div className="tp__security-icon"><Smartphone size={18} /></div>
                                <div className="tp__security-content">
                                    <h4>Active Sessions</h4>
                                    <p>2 devices logged in • Mumbai, India</p>
                                </div>
                                <button className="tp__btn tp__btn--outline tp__btn--danger">Sign Out All</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
