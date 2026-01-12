import React, { useState, useEffect, useRef } from 'react';
import {
    Camera, Save, User, Phone, Mail, MapPin, Award, Shield, Key,
    Star, Calendar, Users, Edit3, Clock, TrendingUp, Target,
    Briefcase, FileText, CheckCircle, AlertCircle, Upload,
    Instagram, Linkedin, Globe, Dumbbell, Heart,
    Activity, Zap, Medal, BadgeCheck, CreditCard, History,
    ChevronRight, Eye, Download, Lock, Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trainerApi } from '../../services/trainerApi';
import type { TrainerProfile as TrainerProfileType } from '../../services/trainerApi';
import './TrainerProfile.css';

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
        try {
            const updated = await trainerApi.updateProfile(formData);
            setProfile(updated);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update profile');
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
                toast.loading('Uploading...');
                const doc = await trainerApi.uploadDocument(file, uploadType);
                toast.dismiss();
                toast.success('Uploaded successfully');

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
                toast.dismiss();
                toast.error('Upload failed');
                console.error(error);
            }
        }
    };

    // Helper to render editable text input or static text
    const renderField = (field: keyof TrainerProfileType, label?: string, icon?: any) => {
        const val = formData[field] || profile[field] || '';
        return isEditing ? (
            <input
                className="tp__input"
                value={val as string}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={label}
            />
        ) : (
            <span>{val as string}</span>
        );
    };

    if (isLoading) return <div className="tp-loading">Loading Profile...</div>;

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
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'professional', label: 'Work', icon: Briefcase },
        { id: 'performance', label: 'Stats', icon: TrendingUp },
        { id: 'security', label: 'Security', icon: Shield },
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
                                <span><Phone size={12} /> {renderField('phone')}</span>
                                <span><MapPin size={12} /> {renderField('address') || 'Mumbai'}</span>
                            </div>
                        </div>

                        <div className="tp__header-stats">
                            <div className="tp__header-stat">
                                <Users size={14} className="tp__header-stat-icon tp__header-stat-icon--blue" />
                                <span className="tp__header-stat-value">{stats.activeMembers}<small>/{stats.totalMembers}</small></span>
                                <span className="tp__header-stat-label">Members</span>
                            </div>
                            <div className="tp__header-stat">
                                <Calendar size={14} className="tp__header-stat-icon tp__header-stat-icon--green" />
                                <span className="tp__header-stat-value">{stats.sessionsMonth}</span>
                                <span className="tp__header-stat-label">Sessions</span>
                            </div>
                            <div className="tp__header-stat">
                                <Activity size={14} className="tp__header-stat-icon tp__header-stat-icon--yellow" />
                                <span className="tp__header-stat-value">{stats.attendance}%</span>
                                <span className="tp__header-stat-label">Attendance</span>
                            </div>
                            <div className="tp__header-stat">
                                <Star size={14} className="tp__header-stat-icon tp__header-stat-icon--orange" fill="#F59E0B" />
                                <span className="tp__header-stat-value">{stats.rating}</span>
                                <span className="tp__header-stat-label">{stats.reviews} reviews</span>
                            </div>
                        </div>

                        <div className="tp__header-actions">
                            {!isEditing ? (
                                <button className="tp__btn tp__btn--edit" onClick={() => setIsEditing(true)}>
                                    <Edit3 size={14} /> Edit
                                </button>
                            ) : (
                                <>
                                    <button className="tp__btn tp__btn--cancel" onClick={() => { setIsEditing(false); setFormData(profile); }}>Cancel</button>
                                    <button className="tp__btn tp__btn--save" onClick={handleSave}><Save size={14} /> Save</button>
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
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="tp__content">
                    {activeTab === 'overview' && (
                        <div className="tp__grid tp__grid--overview">
                            <div className="tp__col tp__col--main">
                                <div className="tp__card">
                                    <h3 className="tp__card-title"><User size={14} /> Personal Details</h3>
                                    <div className="tp__info-grid tp__info-grid--3">
                                        <div className="tp__info"><label>Employee ID</label>{renderField('employeeId')}</div>
                                        <div className="tp__info"><label>Date of Birth</label>{renderField('dob')}</div>
                                        <div className="tp__info"><label>Gender</label>{renderField('gender')}</div>
                                        <div className="tp__info"><label>Blood Type</label>{renderField('bloodType')}</div>
                                        <div className="tp__info"><label>Alt. Phone</label>{renderField('altPhone')}</div>

                                        {/* Languages - simplified as comma sep for edit */}
                                        <div className="tp__info">
                                            <label>Languages</label>
                                            {isEditing ? (
                                                <input className="tp__input"
                                                    value={formData.languages?.join(', ') || ''}
                                                    onChange={e => setFormData({ ...formData, languages: e.target.value.split(',').map(s => s.trim()) })}
                                                />
                                            ) : (
                                                <span>{profile.languages?.join(', ')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="tp__info tp__info--full">
                                        <label>Address</label>{renderField('address')}
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <h3 className="tp__card-title"><Heart size={14} /> Emergency Contact</h3>
                                    <div className="tp__info-grid tp__info-grid--2">
                                        <div className="tp__info"><label>Contact</label>{renderField('emergencyName')}</div>
                                        <div className="tp__info"><label>Phone</label>{renderField('emergencyPhone')}</div>
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <h3 className="tp__card-title"><Dumbbell size={14} /> Specializations</h3>
                                    <div className="tp__tags">
                                        {isEditing ? (
                                            <input className="tp__input"
                                                value={formData.specializations?.join(', ') || ''}
                                                onChange={e => setFormData({ ...formData, specializations: e.target.value.split(',').map(s => s.trim()) })}
                                                placeholder="Comma separated"
                                            />
                                        ) : (
                                            profile.specializations?.map((s, i) => (
                                                <span key={i} className="tp__tag">{s}</span>
                                            ))
                                        )}
                                    </div>
                                    <p className="tp__bio">
                                        <label style={{ display: 'block', marginBottom: 4, fontSize: 10, opacity: 0.5 }}>Bio</label>
                                        {isEditing ? (
                                            <textarea className="tp__input tp__textarea" rows={3}
                                                value={formData.bio || ''}
                                                onChange={e => handleChange('bio', e.target.value)}
                                            />
                                        ) : profile.bio}
                                    </p>
                                    <div className="tp__social">
                                        <a href="#" className="tp__social-link"><Instagram size={14} /> {renderField('instagram')}</a>
                                        <a href="#" className="tp__social-link"><Linkedin size={14} /> {renderField('linkedin')}</a>
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <div className="tp__card-header">
                                        <h3 className="tp__card-title"><Award size={14} /> Certifications</h3>
                                        <button className="tp__link-btn" onClick={() => handleUploadClick('certification')}>Add <Upload size={12} /></button>
                                    </div>
                                    <div className="tp__certs">
                                        {certifications.map((cert, i) => (
                                            <div key={i} className="tp__cert">
                                                <div className="tp__cert-icon"><Award size={14} /></div>
                                                <div className="tp__cert-info">
                                                    <span className="tp__cert-name">{cert.name}</span>
                                                    <span className="tp__cert-meta">{cert.issuer} • {cert.year}</span>
                                                </div>
                                                <div className="tp__cert-status">
                                                    <span className={`tp__badge tp__badge--${cert.valid ? 'green' : 'red'}`}>
                                                        {cert.valid ? <><CheckCircle size={10} /> Valid</> : <><AlertCircle size={10} /> Expired</>}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {certifications.length === 0 && <div className="tp-empty">No certifications listed</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="tp__col tp__col--side">
                                <div className="tp__card tp__card--compact">
                                    <h3 className="tp__card-title"><Medal size={14} /> Achievements</h3>
                                    <div className="tp__achievements">
                                        {achievements.map((a, i) => (
                                            <div key={i} className="tp__achievement">
                                                <a.icon size={14} className="tp__achievement-icon" />
                                                <div>
                                                    <span className="tp__achievement-title">{a.title}</span>
                                                    <span className="tp__achievement-desc">{a.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="tp__card tp__card--compact">
                                    <h3 className="tp__card-title"><History size={14} /> Recent Activity</h3>
                                    <div className="tp__activities">
                                        {recentActivity.map((a, i) => (
                                            <div key={i} className="tp__activity">
                                                <span className={`tp__activity-dot tp__activity-dot--${a.type}`} />
                                                <div>
                                                    <span className="tp__activity-action">{a.action}</span>
                                                    <span className="tp__activity-with">{a.with}</span>
                                                </div>
                                                <span className="tp__activity-time">{a.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="tp__card tp__card--compact">
                                    <h3 className="tp__card-title"><Clock size={14} /> Weekly Schedule</h3>
                                    <div className="tp__schedule">
                                        {schedule.map((s, i) => (
                                            <div key={i} className={`tp__schedule-day ${s.sessions === 0 ? 'tp__schedule-day--off' : ''}`}>
                                                <span className="tp__schedule-name">{s.day}</span>
                                                <span className="tp__schedule-hours">{s.hours}</span>
                                                <span className="tp__schedule-sessions">{s.sessions > 0 ? `${s.sessions}s` : '-'}</span>
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
                                    <div className="tp__info"><label>Department</label>{renderField('department')}</div>
                                    <div className="tp__info"><label>Designation</label>{renderField('role')}</div>
                                    <div className="tp__info"><label>Joining Date</label>{renderField('joiningDate')}</div>
                                    <div className="tp__info"><label>Reporting To</label>{renderField('reportingTo')}</div>
                                    <div className="tp__info"><label>Work Shift</label>{renderField('shift')}</div>
                                </div>
                            </div>

                            <div className="tp__card">
                                <h3 className="tp__card-title"><CreditCard size={14} /> Payment Details</h3>
                                <div className="tp__info-grid tp__info-grid--2">
                                    <div className="tp__info"><label>Bank</label>{renderField('bankName')}</div>
                                    <div className="tp__info"><label>Account</label>{renderField('accountNo')}</div>
                                    <div className="tp__info"><label>IFSC</label>{renderField('ifsc')}</div>
                                    <div className="tp__info"><label>Monthly Earnings</label><span className="tp__value--highlight">₹{stats.earnings}</span></div>
                                </div>
                            </div>

                            <div className="tp__card">
                                <div className="tp__card-header">
                                    <h3 className="tp__card-title"><FileText size={14} /> Documents</h3>
                                    <button className="tp__link-btn" onClick={() => handleUploadClick('document')}>Upload <Upload size={12} /></button>
                                </div>
                                <div className="tp__certs">
                                    {(profile.documents || []).map((doc, i) => (
                                        <div key={i} className="tp__cert">
                                            <div className="tp__cert-icon"><FileText size={14} /></div>
                                            <div className="tp__cert-info">
                                                <span className="tp__cert-name">{doc.name}</span>
                                                <span className="tp__cert-meta">{doc.type.toUpperCase()} • {doc.verified ? 'Verified' : 'Pending'}</span>
                                            </div>
                                            <div className="tp__cert-status">
                                                <a href={doc.url} target="_blank" rel="noreferrer" className="tp__btn--icon"><Download size={14} /></a>
                                            </div>
                                        </div>
                                    ))}
                                    {(!profile.documents || profile.documents.length === 0) && <div className="tp-empty">No documents uploaded</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div style={{ padding: 20, textAlign: 'center' }}>
                            <h3>Performance Metrics</h3>
                            <p>Detailed performance charts coming soon.</p>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="tp__security">
                            <div className="tp__security-item">
                                <div className="tp__security-icon"><Key size={16} /></div>
                                <div className="tp__security-content">
                                    <h4>Password</h4>
                                    <p>Last changed 30 days ago</p>
                                </div>
                                <button className="tp__btn tp__btn--outline">Change</button>
                            </div>
                            <div className="tp__security-item tp__security-item--success">
                                <div className="tp__security-icon tp__security-icon--green"><Shield size={16} /></div>
                                <div className="tp__security-content">
                                    <h4>Two-Factor Authentication</h4>
                                    <p className="tp__text--green">Enabled via Authenticator App</p>
                                </div>
                                <button className="tp__btn tp__btn--outline">Manage</button>
                            </div>
                            <div className="tp__security-item">
                                <div className="tp__security-icon"><Smartphone size={16} /></div>
                                <div className="tp__security-content">
                                    <h4>Active Sessions</h4>
                                    <p>2 devices logged in</p>
                                </div>
                                <button className="tp__btn tp__btn--outline tp__btn--danger">Sign Out All</button>
                            </div>
                            <div className="tp__security-item">
                                <div className="tp__security-icon"><Activity size={16} /></div>
                                <div className="tp__security-content">
                                    <h4>Login Activity</h4>
                                    <p>Last login: Today at 6:15 AM from Mumbai</p>
                                </div>
                                <button className="tp__btn tp__btn--outline">View History</button>
                            </div>
                            <div className="tp__security-item">
                                <div className="tp__security-icon"><Lock size={16} /></div>
                                <div className="tp__security-content">
                                    <h4>Privacy Settings</h4>
                                    <p>Profile visible to gym management only</p>
                                </div>
                                <button className="tp__btn tp__btn--outline">Configure</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
