import React, { useState } from 'react';
import { 
    Camera, Save, User, Phone, Mail, MapPin, Award, Shield, Key,
    Star, Calendar, Users, Edit3, Clock, TrendingUp, Target,
    Briefcase, FileText, CheckCircle, AlertCircle, Upload,
    Instagram, Linkedin, Twitter, Globe, X, Dumbbell, Heart,
    Activity, Zap, Medal, BadgeCheck, CreditCard, History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './TrainerProfile.css';

const TrainerProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: 'John Smith',
        email: 'john.smith@athlonx.com',
        phone: '+91 98765 43210',
        alternatePhone: '+91 98765 43211',
        dob: '1990-01-15',
        gender: 'Male',
        bloodType: 'O+',
        address: '123 Fitness Street, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400058',
        employeeId: 'TR-00123',
        joiningDate: '2020-01-15',
        department: 'Personal Training',
        reportingTo: 'Sarah Johnson (Head Trainer)',
        workShift: 'Morning (6 AM - 2 PM)',
        specializations: ['Strength Training', 'HIIT', 'Functional Fitness', 'Weight Loss'],
        certifications: [
            { name: 'ACE Certified Personal Trainer', issuer: 'ACE Fitness', date: '2018', valid: true },
            { name: 'CrossFit Level 2', issuer: 'CrossFit Inc.', date: '2019', valid: true },
            { name: 'First Aid & CPR', issuer: 'Red Cross', date: '2023', valid: true },
            { name: 'Sports Nutrition', issuer: 'ISSA', date: '2020', valid: true },
        ],
        bio: 'Certified personal trainer with 8 years experience specializing in functional training and rehabilitation. Passionate about helping clients achieve their fitness goals through personalized programs.',
        languages: ['English', 'Hindi', 'Marathi'],
        instagram: '@johnsmith_fitness',
        linkedin: 'johnsmith-trainer',
        emergencyContact: 'Jane Smith',
        emergencyPhone: '+91 98765 43299',
        emergencyRelation: 'Spouse',
        bankName: 'HDFC Bank',
        accountNumber: '****4567',
        ifscCode: 'HDFC0001234',
    });

    const handleSave = () => {
        toast.success('Profile updated successfully');
        setIsEditing(false);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'professional', label: 'Professional', icon: Briefcase },
        { id: 'certifications', label: 'Certifications', icon: Award },
        { id: 'schedule', label: 'Work Schedule', icon: Clock },
        { id: 'performance', label: 'Performance', icon: TrendingUp },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    const stats = [
        { label: 'Active Members', value: '24', icon: Users, color: '#3B82F6', trend: '+3 this month' },
        { label: 'Sessions This Month', value: '86', icon: Calendar, color: '#10B981', trend: '94% attendance' },
        { label: 'Avg. Rating', value: '4.9', icon: Star, color: '#F59E0B', trend: '127 reviews' },
        { label: 'Experience', value: '8 Yrs', icon: Briefcase, color: '#8B5CF6', trend: 'Since 2016' },
    ];

    const achievements = [
        { title: 'Top Trainer', description: 'Highest client retention rate', icon: Medal, date: 'Dec 2024' },
        { title: '100 Sessions', description: 'Completed 100 PT sessions', icon: Target, date: 'Nov 2024' },
        { title: 'Perfect Rating', description: '5-star streak for 30 days', icon: Star, date: 'Oct 2024' },
    ];

    const recentActivity = [
        { action: 'Completed PT session', client: 'Emma Davis', time: '2 hours ago', type: 'session' },
        { action: 'Added progress note', client: 'Mike Chen', time: '3 hours ago', type: 'note' },
        { action: 'New client assigned', client: 'Sarah Wilson', time: 'Yesterday', type: 'new' },
        { action: 'Certification renewed', client: 'First Aid & CPR', time: '2 days ago', type: 'cert' },
    ];

    const weeklySchedule = [
        { day: 'Monday', shift: '6:00 AM - 2:00 PM', sessions: 5, status: 'active' },
        { day: 'Tuesday', shift: '6:00 AM - 2:00 PM', sessions: 6, status: 'active' },
        { day: 'Wednesday', shift: '6:00 AM - 2:00 PM', sessions: 4, status: 'active' },
        { day: 'Thursday', shift: '6:00 AM - 2:00 PM', sessions: 5, status: 'active' },
        { day: 'Friday', shift: '6:00 AM - 2:00 PM', sessions: 6, status: 'active' },
        { day: 'Saturday', shift: '8:00 AM - 12:00 PM', sessions: 3, status: 'active' },
        { day: 'Sunday', shift: 'Off', sessions: 0, status: 'off' },
    ];

    const performanceMetrics = [
        { label: 'Client Retention', value: 96, target: 90, unit: '%' },
        { label: 'Session Completion', value: 98, target: 95, unit: '%' },
        { label: 'Client Satisfaction', value: 94, target: 90, unit: '%' },
        { label: 'Goal Achievement', value: 87, target: 80, unit: '%' },
    ];

    return (
        <div className="trainer-profile-v2">
            <div className="trainer-profile-v2__header">
                <div className="trainer-profile-v2__header-bg" />
                <div className="trainer-profile-v2__header-content">
                    <div className="trainer-profile-v2__avatar-section">
                        <div className="trainer-profile-v2__avatar">
                            <img 
                                src="https://ui-avatars.com/api/?name=John+Smith&background=DC2626&color=fff&size=128" 
                                alt="John Smith"
                            />
                            <button 
                                className="trainer-profile-v2__avatar-edit"
                                onClick={() => setShowAvatarModal(true)}
                            >
                                <Camera size={14} />
                            </button>
                            <div className="trainer-profile-v2__avatar-status" />
                        </div>
                        <div className="trainer-profile-v2__info">
                            <div className="trainer-profile-v2__name-row">
                                <h1>{formData.fullName}</h1>
                                <span className="trainer-profile-v2__verified">
                                    <BadgeCheck size={18} />
                                    Verified
                                </span>
                            </div>
                            <p className="trainer-profile-v2__role">Senior Personal Trainer</p>
                            <div className="trainer-profile-v2__meta">
                                <span><Briefcase size={14} /> {formData.department}</span>
                                <span><MapPin size={14} /> {formData.city}</span>
                                <span><Calendar size={14} /> Joined {new Date(formData.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="trainer-profile-v2__rating">
                                <div className="trainer-profile-v2__stars">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} size={16} fill="#FBBF24" color="#FBBF24" />
                                    ))}
                                </div>
                                <span className="trainer-profile-v2__rating-text">4.9/5.0</span>
                                <span className="trainer-profile-v2__rating-count">(127 reviews)</span>
                            </div>
                        </div>
                    </div>

                    <div className="trainer-profile-v2__header-actions">
                        {!isEditing ? (
                            <button 
                                className="trainer-profile-v2__edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 size={16} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="trainer-profile-v2__edit-actions">
                                <button 
                                    className="trainer-profile-v2__cancel-btn"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="trainer-profile-v2__save-btn"
                                    onClick={handleSave}
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="trainer-profile-v2__stats">
                {stats.map((stat, idx) => (
                    <div key={idx} className="trainer-profile-v2__stat-card">
                        <div className="trainer-profile-v2__stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={20} />
                        </div>
                        <div className="trainer-profile-v2__stat-content">
                            <span className="trainer-profile-v2__stat-value">{stat.value}</span>
                            <span className="trainer-profile-v2__stat-label">{stat.label}</span>
                            <span className="trainer-profile-v2__stat-trend">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="trainer-profile-v2__body">
                <div className="trainer-profile-v2__tabs-wrapper">
                    <div className="trainer-profile-v2__tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`trainer-profile-v2__tab ${activeTab === tab.id ? 'trainer-profile-v2__tab--active' : ''}`}
                            >
                                <tab.icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="trainer-profile-v2__content">
                    {activeTab === 'overview' && (
                        <div className="trainer-profile-v2__overview">
                            <div className="trainer-profile-v2__overview-main">
                                <div className="profile-card">
                                    <div className="profile-card__header">
                                        <h3><User size={18} /> Personal Information</h3>
                                    </div>
                                    <div className="profile-card__body">
                                        <div className="profile-info-grid">
                                            <div className="profile-info-item">
                                                <label>Full Name</label>
                                                <span>{formData.fullName}</span>
                                            </div>
                                            <div className="profile-info-item">
                                                <label>Employee ID</label>
                                                <span>{formData.employeeId}</span>
                                            </div>
                                            <div className="profile-info-item">
                                                <label>Date of Birth</label>
                                                <span>{new Date(formData.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="profile-info-item">
                                                <label>Gender</label>
                                                <span>{formData.gender}</span>
                                            </div>
                                            <div className="profile-info-item">
                                                <label>Blood Type</label>
                                                <span className="profile-info-item__badge">{formData.bloodType}</span>
                                            </div>
                                            <div className="profile-info-item">
                                                <label>Languages</label>
                                                <span>{formData.languages.join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-card">
                                    <div className="profile-card__header">
                                        <h3><Phone size={18} /> Contact Information</h3>
                                    </div>
                                    <div className="profile-card__body">
                                        <div className="profile-info-grid">
                                            <div className="profile-info-item">
                                                <label><Mail size={14} /> Email</label>
                                                <span>{formData.email}</span>
                                            </div>
                                            <div className="profile-info-item">
                                                <label><Phone size={14} /> Phone</label>
                                                <span>{formData.phone}</span>
                                            </div>
                                            <div className="profile-info-item profile-info-item--full">
                                                <label><MapPin size={14} /> Address</label>
                                                <span>{formData.address}, {formData.city}, {formData.state} - {formData.pincode}</span>
                                            </div>
                                        </div>
                                        <div className="profile-card__divider" />
                                        <h4 className="profile-card__subtitle">Emergency Contact</h4>
                                        <div className="profile-info-grid">
                                            <div className="profile-info-item">
                                                <label>Name</label>
                                                <span>{formData.emergencyContact} ({formData.emergencyRelation})</span>
                                            </div>
                                            <div className="profile-info-item">
                                                <label>Phone</label>
                                                <span>{formData.emergencyPhone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-card">
                                    <div className="profile-card__header">
                                        <h3><FileText size={18} /> Bio</h3>
                                    </div>
                                    <div className="profile-card__body">
                                        <p className="profile-bio">{formData.bio}</p>
                                        <div className="profile-specializations">
                                            <label>Specializations</label>
                                            <div className="profile-tags">
                                                {formData.specializations.map((spec, idx) => (
                                                    <span key={idx} className="profile-tag">{spec}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="profile-social">
                                            <label>Social Profiles</label>
                                            <div className="profile-social__links">
                                                {formData.instagram && (
                                                    <a href="#" className="profile-social__link">
                                                        <Instagram size={16} />
                                                        {formData.instagram}
                                                    </a>
                                                )}
                                                {formData.linkedin && (
                                                    <a href="#" className="profile-social__link">
                                                        <Linkedin size={16} />
                                                        {formData.linkedin}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="trainer-profile-v2__overview-sidebar">
                                <div className="profile-card profile-card--compact">
                                    <div className="profile-card__header">
                                        <h3><Medal size={18} /> Recent Achievements</h3>
                                    </div>
                                    <div className="profile-card__body">
                                        <div className="achievements-list">
                                            {achievements.map((achievement, idx) => (
                                                <div key={idx} className="achievement-item">
                                                    <div className="achievement-item__icon">
                                                        <achievement.icon size={16} />
                                                    </div>
                                                    <div className="achievement-item__content">
                                                        <span className="achievement-item__title">{achievement.title}</span>
                                                        <span className="achievement-item__desc">{achievement.description}</span>
                                                    </div>
                                                    <span className="achievement-item__date">{achievement.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-card profile-card--compact">
                                    <div className="profile-card__header">
                                        <h3><History size={18} /> Recent Activity</h3>
                                    </div>
                                    <div className="profile-card__body">
                                        <div className="activity-list">
                                            {recentActivity.map((item, idx) => (
                                                <div key={idx} className="activity-item">
                                                    <div className={`activity-item__dot activity-item__dot--${item.type}`} />
                                                    <div className="activity-item__content">
                                                        <span className="activity-item__action">{item.action}</span>
                                                        <span className="activity-item__client">{item.client}</span>
                                                    </div>
                                                    <span className="activity-item__time">{item.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-card profile-card--compact">
                                    <div className="profile-card__header">
                                        <h3><Award size={18} /> Top Certifications</h3>
                                    </div>
                                    <div className="profile-card__body">
                                        <div className="cert-preview-list">
                                            {formData.certifications.slice(0, 3).map((cert, idx) => (
                                                <div key={idx} className="cert-preview-item">
                                                    <CheckCircle size={14} className="cert-preview-item__icon" />
                                                    <span className="cert-preview-item__name">{cert.name}</span>
                                                </div>
                                            ))}
                                            <button className="cert-preview-more" onClick={() => setActiveTab('certifications')}>
                                                View all certifications
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'professional' && (
                        <div className="trainer-profile-v2__professional">
                            <div className="profile-card">
                                <div className="profile-card__header">
                                    <h3><Briefcase size={18} /> Employment Details</h3>
                                </div>
                                <div className="profile-card__body">
                                    <div className="profile-info-grid profile-info-grid--3col">
                                        <div className="profile-info-item">
                                            <label>Employee ID</label>
                                            <span>{formData.employeeId}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Department</label>
                                            <span>{formData.department}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Designation</label>
                                            <span>Senior Personal Trainer</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Joining Date</label>
                                            <span>{new Date(formData.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Reporting To</label>
                                            <span>{formData.reportingTo}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Work Shift</label>
                                            <span>{formData.workShift}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-card">
                                <div className="profile-card__header">
                                    <h3><Dumbbell size={18} /> Specializations & Skills</h3>
                                </div>
                                <div className="profile-card__body">
                                    <div className="specializations-grid">
                                        {formData.specializations.map((spec, idx) => (
                                            <div key={idx} className="specialization-card">
                                                <Zap size={16} />
                                                <span>{spec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="profile-card">
                                <div className="profile-card__header">
                                    <h3><CreditCard size={18} /> Payment Information</h3>
                                </div>
                                <div className="profile-card__body">
                                    <div className="profile-info-grid profile-info-grid--3col">
                                        <div className="profile-info-item">
                                            <label>Bank Name</label>
                                            <span>{formData.bankName}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>Account Number</label>
                                            <span>{formData.accountNumber}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <label>IFSC Code</label>
                                            <span>{formData.ifscCode}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'certifications' && (
                        <div className="trainer-profile-v2__certifications">
                            <div className="certifications-header">
                                <h3>My Certifications</h3>
                                <button className="certifications-add-btn">
                                    <Upload size={16} />
                                    Add Certificate
                                </button>
                            </div>
                            <div className="certifications-grid">
                                {formData.certifications.map((cert, idx) => (
                                    <div key={idx} className="certification-card">
                                        <div className="certification-card__header">
                                            <div className="certification-card__icon">
                                                <Award size={24} />
                                            </div>
                                            <div className={`certification-card__status ${cert.valid ? 'certification-card__status--valid' : 'certification-card__status--expired'}`}>
                                                {cert.valid ? (
                                                    <><CheckCircle size={12} /> Valid</>
                                                ) : (
                                                    <><AlertCircle size={12} /> Expired</>
                                                )}
                                            </div>
                                        </div>
                                        <div className="certification-card__body">
                                            <h4>{cert.name}</h4>
                                            <p className="certification-card__issuer">{cert.issuer}</p>
                                            <p className="certification-card__date">Issued: {cert.date}</p>
                                        </div>
                                        <div className="certification-card__actions">
                                            <button className="certification-card__btn">View</button>
                                            <button className="certification-card__btn">Download</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="trainer-profile-v2__schedule">
                            <div className="profile-card">
                                <div className="profile-card__header">
                                    <h3><Clock size={18} /> Weekly Schedule</h3>
                                </div>
                                <div className="profile-card__body">
                                    <div className="schedule-table">
                                        <div className="schedule-table__header">
                                            <span>Day</span>
                                            <span>Shift</span>
                                            <span>Sessions</span>
                                            <span>Status</span>
                                        </div>
                                        {weeklySchedule.map((day, idx) => (
                                            <div key={idx} className={`schedule-table__row ${day.status === 'off' ? 'schedule-table__row--off' : ''}`}>
                                                <span className="schedule-table__day">{day.day}</span>
                                                <span className="schedule-table__shift">{day.shift}</span>
                                                <span className="schedule-table__sessions">
                                                    {day.sessions > 0 ? `${day.sessions} sessions` : '-'}
                                                </span>
                                                <span className={`schedule-table__status schedule-table__status--${day.status}`}>
                                                    {day.status === 'active' ? 'Working' : 'Day Off'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="schedule-summary">
                                <div className="schedule-summary__item">
                                    <span className="schedule-summary__value">48</span>
                                    <span className="schedule-summary__label">Hours/Week</span>
                                </div>
                                <div className="schedule-summary__item">
                                    <span className="schedule-summary__value">29</span>
                                    <span className="schedule-summary__label">Sessions/Week</span>
                                </div>
                                <div className="schedule-summary__item">
                                    <span className="schedule-summary__value">6</span>
                                    <span className="schedule-summary__label">Working Days</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="trainer-profile-v2__performance">
                            <div className="performance-metrics-grid">
                                {performanceMetrics.map((metric, idx) => (
                                    <div key={idx} className="performance-metric-card">
                                        <div className="performance-metric-card__header">
                                            <span className="performance-metric-card__label">{metric.label}</span>
                                            <span className={`performance-metric-card__value ${metric.value >= metric.target ? 'performance-metric-card__value--good' : ''}`}>
                                                {metric.value}{metric.unit}
                                            </span>
                                        </div>
                                        <div className="performance-metric-card__bar">
                                            <div 
                                                className={`performance-metric-card__fill ${metric.value >= metric.target ? 'performance-metric-card__fill--good' : ''}`}
                                                style={{ width: `${Math.min(metric.value, 100)}%` }}
                                            />
                                            <div 
                                                className="performance-metric-card__target" 
                                                style={{ left: `${metric.target}%` }}
                                            />
                                        </div>
                                        <span className="performance-metric-card__target-label">Target: {metric.target}{metric.unit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="profile-card">
                                <div className="profile-card__header">
                                    <h3><TrendingUp size={18} /> Monthly Summary</h3>
                                </div>
                                <div className="profile-card__body">
                                    <div className="monthly-summary-grid">
                                        <div className="monthly-summary-item">
                                            <span className="monthly-summary-item__value">86</span>
                                            <span className="monthly-summary-item__label">Total Sessions</span>
                                        </div>
                                        <div className="monthly-summary-item">
                                            <span className="monthly-summary-item__value">₹48,500</span>
                                            <span className="monthly-summary-item__label">Earnings</span>
                                        </div>
                                        <div className="monthly-summary-item">
                                            <span className="monthly-summary-item__value">24</span>
                                            <span className="monthly-summary-item__label">Active Clients</span>
                                        </div>
                                        <div className="monthly-summary-item">
                                            <span className="monthly-summary-item__value">3</span>
                                            <span className="monthly-summary-item__label">New Clients</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="trainer-profile-v2__documents">
                            <div className="documents-grid">
                                <div className="document-card">
                                    <div className="document-card__icon document-card__icon--id">
                                        <User size={24} />
                                    </div>
                                    <div className="document-card__info">
                                        <h4>ID Proof</h4>
                                        <p>Aadhar Card</p>
                                    </div>
                                    <span className="document-card__status document-card__status--verified">
                                        <CheckCircle size={14} /> Verified
                                    </span>
                                </div>
                                <div className="document-card">
                                    <div className="document-card__icon document-card__icon--address">
                                        <MapPin size={24} />
                                    </div>
                                    <div className="document-card__info">
                                        <h4>Address Proof</h4>
                                        <p>Utility Bill</p>
                                    </div>
                                    <span className="document-card__status document-card__status--verified">
                                        <CheckCircle size={14} /> Verified
                                    </span>
                                </div>
                                <div className="document-card">
                                    <div className="document-card__icon document-card__icon--education">
                                        <Award size={24} />
                                    </div>
                                    <div className="document-card__info">
                                        <h4>Education Certificate</h4>
                                        <p>Sports Science Degree</p>
                                    </div>
                                    <span className="document-card__status document-card__status--verified">
                                        <CheckCircle size={14} /> Verified
                                    </span>
                                </div>
                                <div className="document-card document-card--upload">
                                    <Upload size={24} />
                                    <span>Upload Document</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="trainer-profile-v2__security">
                            <div className="security-item">
                                <div className="security-item__icon">
                                    <Key size={20} />
                                </div>
                                <div className="security-item__content">
                                    <h4>Password</h4>
                                    <p>Last changed 30 days ago</p>
                                </div>
                                <button className="security-item__btn">Change Password</button>
                            </div>

                            <div className="security-item">
                                <div className="security-item__icon security-item__icon--success">
                                    <Shield size={20} />
                                </div>
                                <div className="security-item__content">
                                    <h4>Two-Factor Authentication</h4>
                                    <p className="security-item__status--success">Enabled via Authenticator App</p>
                                </div>
                                <button className="security-item__btn">Manage</button>
                            </div>

                            <div className="security-item">
                                <div className="security-item__icon">
                                    <Activity size={20} />
                                </div>
                                <div className="security-item__content">
                                    <h4>Login Activity</h4>
                                    <p>Last login: Today at 6:15 AM from Mumbai</p>
                                </div>
                                <button className="security-item__btn">View History</button>
                            </div>

                            <div className="security-item">
                                <div className="security-item__icon">
                                    <Globe size={20} />
                                </div>
                                <div className="security-item__content">
                                    <h4>Active Sessions</h4>
                                    <p>2 devices currently logged in</p>
                                </div>
                                <button className="security-item__btn security-item__btn--danger">Sign Out All</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
