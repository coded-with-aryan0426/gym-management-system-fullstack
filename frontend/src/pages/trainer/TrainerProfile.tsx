import React, { useState, useEffect } from 'react';
import {
    Camera, Save, User, Phone, Mail, MapPin, Award, Shield, Key,
    Star, Calendar, Users, Edit3, Clock, TrendingUp, Target,
    Briefcase, FileText, CheckCircle, AlertCircle, Upload,
    Instagram, Linkedin, Globe, Dumbbell, Heart,
    Activity, Zap, Medal, BadgeCheck, CreditCard, History,
    ChevronRight, Eye, Download, Lock, Smartphone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import trainerApi from '../../services/trainerApi';
import type { TrainerProfile as ITrainerProfile } from '../../services/trainerApi';
import './TrainerProfile.css';

const TrainerProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ITrainerProfile | null>(null);
    const [editedProfile, setEditedProfile] = useState<Partial<ITrainerProfile>>({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await trainerApi.getProfile();
                setProfile(data);
                setEditedProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div className="tp__loading">Loading profile...</div>;
    if (!profile) return <div className="tp__error">Profile not found</div>;

    const displayProfile = isEditing ? editedProfile : profile;

    return (
        <div className="tp">
            <div className="tp__header">
                <div className="tp__header-bg" />
                <div className="tp__header-content">
                    <div className="tp__profile-row">
                        <div className="tp__avatar">
                            <img src={`https://ui-avatars.com/api/?name=${profile.fullName}&background=DC2626&color=fff&size=96`} alt="" />
                            <button className="tp__avatar-btn"><Camera size={12} /></button>
                            <span className="tp__avatar-status" />
                        </div>
                        <div className="tp__profile-info">
                            <div className="tp__name-row">
                                {isEditing ? (
                                    <input 
                                        className="tp__name-input" 
                                        name="fullName" 
                                        value={editedProfile.fullName || ''} 
                                        onChange={handleInputChange} 
                                    />
                                ) : (
                                    <h1>{profile.fullName}</h1>
                                )}
                                <span className="tp__badge tp__badge--verified"><BadgeCheck size={12} /> Verified</span>
                            </div>
                            <p className="tp__role">{profile.role || 'Trainer'} • {profile.department || 'Fitness'}</p>
                            <div className="tp__meta">
                                <span><Mail size={12} /> {profile.email}</span>
                                <span><Phone size={12} /> {isEditing ? (
                                    <input 
                                        className="tp__inline-input" 
                                        name="phoneNumber" 
                                        value={editedProfile.phoneNumber || editedProfile.phone || ''} 
                                        onChange={handleInputChange} 
                                    />
                                ) : (profile.phoneNumber || profile.phone || 'No phone')}</span>
                                <span><MapPin size={12} /> Mumbai</span>
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
                                    <button className="tp__btn tp__btn--cancel" onClick={() => setIsEditing(false)}>Cancel</button>
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
                                        <div className="tp__info"><label>Employee ID</label><span>{trainer.employeeId}</span></div>
                                        <div className="tp__info"><label>Date of Birth</label><span>{trainer.dob}</span></div>
                                        <div className="tp__info"><label>Gender</label><span>{trainer.gender}</span></div>
                                        <div className="tp__info"><label>Blood Type</label><span><span className="tp__blood-badge">{trainer.bloodType}</span></span></div>
                                        <div className="tp__info"><label>Languages</label><span>{trainer.languages.join(', ')}</span></div>
                                        <div className="tp__info"><label>Alt. Phone</label><span>{trainer.altPhone}</span></div>
                                    </div>
                                    <div className="tp__info tp__info--full">
                                        <label>Address</label><span>{trainer.address}</span>
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <h3 className="tp__card-title"><Heart size={14} /> Emergency Contact</h3>
                                    <div className="tp__info-grid tp__info-grid--2">
                                        <div className="tp__info"><label>Contact</label><span>{trainer.emergencyName}</span></div>
                                        <div className="tp__info"><label>Phone</label><span>{trainer.emergencyPhone}</span></div>
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <h3 className="tp__card-title"><Dumbbell size={14} /> Specializations</h3>
                                    <div className="tp__tags">
                                        {trainer.specializations.map((s, i) => (
                                            <span key={i} className="tp__tag">{s}</span>
                                        ))}
                                    </div>
                                    <p className="tp__bio">{trainer.bio}</p>
                                    <div className="tp__social">
                                        <a href="#" className="tp__social-link"><Instagram size={14} /> {trainer.instagram}</a>
                                        <a href="#" className="tp__social-link"><Linkedin size={14} /> {trainer.linkedin}</a>
                                    </div>
                                </div>

                                <div className="tp__card">
                                    <div className="tp__card-header">
                                        <h3 className="tp__card-title"><Award size={14} /> Certifications</h3>
                                        <button className="tp__link-btn">Add <Upload size={12} /></button>
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
                                                    <span className="tp__cert-exp">Exp: {cert.expires}</span>
                                                </div>
                                                <button className="tp__icon-btn"><Eye size={12} /></button>
                                            </div>
                                        ))}
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
                                    <div className="tp__schedule-summary">
                                        <span>48 hrs/week</span>
                                        <span>29 sessions</span>
                                        <span>6 days</span>
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
                                    <div className="tp__info"><label>Employee ID</label><span>{trainer.employeeId}</span></div>
                                    <div className="tp__info"><label>Department</label><span>{trainer.department}</span></div>
                                    <div className="tp__info"><label>Designation</label><span>{trainer.role}</span></div>
                                    <div className="tp__info"><label>Joining Date</label><span>{trainer.joiningDate}</span></div>
                                    <div className="tp__info"><label>Reporting To</label><span>{trainer.reportingTo}</span></div>
                                    <div className="tp__info"><label>Work Shift</label><span>{trainer.shift}</span></div>
                                </div>
                            </div>

                            <div className="tp__card">
                                <h3 className="tp__card-title"><CreditCard size={14} /> Payment Details</h3>
                                <div className="tp__info-grid tp__info-grid--2">
                                    <div className="tp__info"><label>Bank</label><span>{trainer.bankName}</span></div>
                                    <div className="tp__info"><label>Account</label><span>{trainer.accountNo}</span></div>
                                    <div className="tp__info"><label>IFSC</label><span>{trainer.ifsc}</span></div>
                                    <div className="tp__info"><label>Monthly Earnings</label><span className="tp__value--highlight">{stats.earnings}</span></div>
                                </div>
                            </div>

                            <div className="tp__card tp__card--full">
                                <div className="tp__card-header">
                                    <h3 className="tp__card-title"><FileText size={14} /> Documents</h3>
                                    <button className="tp__link-btn">Upload <Upload size={12} /></button>
                                </div>
                                <div className="tp__docs">
                                    {documents.map((doc, i) => (
                                        <div key={i} className="tp__doc">
                                            <FileText size={14} className="tp__doc-icon" />
                                            <span className="tp__doc-name">{doc.name}</span>
                                            <span className="tp__badge tp__badge--green"><CheckCircle size={10} /> Verified</span>
                                            <button className="tp__icon-btn"><Download size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="tp__grid tp__grid--2col">
                            <div className="tp__card">
                                <h3 className="tp__card-title"><Target size={14} /> Performance Metrics</h3>
                                <div className="tp__metrics">
                                    {performance.map((p, i) => (
                                        <div key={i} className="tp__metric">
                                            <div className="tp__metric-header">
                                                <span className="tp__metric-label">{p.label}</span>
                                                <span className={`tp__metric-value ${p.value >= p.target ? 'tp__metric-value--good' : ''}`}>{p.value}%</span>
                                            </div>
                                            <div className="tp__metric-bar">
                                                <div className={`tp__metric-fill ${p.value >= p.target ? 'tp__metric-fill--good' : ''}`} style={{ width: `${p.value}%` }} />
                                                <div className="tp__metric-target" style={{ left: `${p.target}%` }} />
                                            </div>
                                            <span className="tp__metric-target-text">Target: {p.target}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="tp__card">
                                <h3 className="tp__card-title"><TrendingUp size={14} /> Monthly Summary</h3>
                                <div className="tp__summary-grid">
                                    <div className="tp__summary-item">
                                        <span className="tp__summary-value">86</span>
                                        <span className="tp__summary-label">Total Sessions</span>
                                    </div>
                                    <div className="tp__summary-item">
                                        <span className="tp__summary-value">{stats.earnings}</span>
                                        <span className="tp__summary-label">Earnings</span>
                                    </div>
                                    <div className="tp__summary-item">
                                        <span className="tp__summary-value">{stats.activeMembers}</span>
                                        <span className="tp__summary-label">Active Clients</span>
                                    </div>
                                    <div className="tp__summary-item">
                                        <span className="tp__summary-value">3</span>
                                        <span className="tp__summary-label">New Clients</span>
                                    </div>
                                    <div className="tp__summary-item">
                                        <span className="tp__summary-value">4.9</span>
                                        <span className="tp__summary-label">Avg Rating</span>
                                    </div>
                                    <div className="tp__summary-item">
                                        <span className="tp__summary-value">12</span>
                                        <span className="tp__summary-label">New Reviews</span>
                                    </div>
                                </div>
                            </div>

                            <div className="tp__card tp__card--full">
                                <h3 className="tp__card-title"><Medal size={14} /> All Achievements</h3>
                                <div className="tp__achievements-grid">
                                    {achievements.map((a, i) => (
                                        <div key={i} className="tp__achievement-card">
                                            <a.icon size={20} className="tp__achievement-card-icon" />
                                            <span className="tp__achievement-card-title">{a.title}</span>
                                            <span className="tp__achievement-card-desc">{a.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
