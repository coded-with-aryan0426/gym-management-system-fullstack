import React, { useState } from 'react';
import { 
    Camera, Save, User, Phone, Mail, MapPin, Award, Shield, Key,
    Star, Calendar, Users, Edit3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './TrainerProfile.css';

const TrainerProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState('basic');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: 'John Smith',
        email: 'john.smith@athlonx.com',
        phone: '+91 98765 43210',
        dob: '1990-01-15',
        gender: 'Male',
        bloodType: 'O+',
        address: 'Mumbai, Maharashtra',
        employeeId: 'TR-00123',
        joiningDate: '2020-01-15',
        specialization: 'Strength Training, HIIT',
        certifications: 'ACE CPT, CrossFit Level 2',
        bio: 'Certified personal trainer with 8 years experience specializing in functional training and rehabilitation.'
    });

    const handleSave = () => {
        toast.success('Profile updated successfully');
        setIsEditing(false);
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'contact', label: 'Contact', icon: Phone },
        { id: 'professional', label: 'Professional', icon: Award },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    const stats = [
        { label: 'Assigned', value: '12', sub: 'Members' },
        { label: 'Classes', value: '156', sub: 'Total' },
        { label: 'Rating', value: '4.9', sub: '127 reviews' },
        { label: 'Experience', value: '8', sub: 'Years' },
    ];

    return (
        <div className="trainer-profile">
            {/* Profile Header with Gradient */}
            <div className="trainer-profile__header-banner">
                <div className="trainer-profile__header-content">
                    <div className="trainer-profile__avatar-section">
                        <div className="trainer-profile__avatar">
                            <img 
                                src="https://ui-avatars.com/api/?name=John+Smith&background=4F46E5&color=fff&size=128" 
                                alt="John Smith"
                            />
                            <button className="trainer-profile__avatar-edit">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="trainer-profile__info">
                            <h1>{formData.fullName}</h1>
                            <p className="trainer-profile__role">Certified Personal Trainer</p>
                            <div className="trainer-profile__rating">
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} size={14} fill="#FBBF24" color="#FBBF24" />
                                ))}
                                <span>4.9/5.0 (127 reviews)</span>
                            </div>
                        </div>
                    </div>

                    <div className="trainer-profile__header-actions">
                        {!isEditing ? (
                            <button 
                                className="trainer-profile__edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 size={14} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="trainer-profile__edit-actions">
                                <button 
                                    className="trainer-profile__cancel-btn"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="trainer-profile__save-btn"
                                    onClick={handleSave}
                                >
                                    <Save size={14} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="trainer-profile__stats-row">
                {stats.map((stat, idx) => (
                    <div key={idx} className="trainer-profile__stat">
                        <span className="trainer-profile__stat-value">{stat.value}</span>
                        <span className="trainer-profile__stat-label">{stat.label}</span>
                        <span className="trainer-profile__stat-sub">{stat.sub}</span>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="trainer-profile__content">
                {/* Tabs Navigation */}
                <div className="trainer-profile__tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`trainer-profile__tab ${activeTab === tab.id ? 'trainer-profile__tab--active' : ''}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="trainer-profile__tab-content">
                    {activeTab === 'basic' && (
                        <div className="trainer-profile__form">
                            <div className="trainer-profile__form-grid">
                                <div className="trainer-profile__field">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="trainer-profile__field">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="trainer-profile__field">
                                    <label>Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        disabled={!isEditing}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="trainer-profile__field">
                                    <label>Blood Type</label>
                                    <select
                                        value={formData.bloodType}
                                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                        disabled={!isEditing}
                                    >
                                        <option>O+</option>
                                        <option>A+</option>
                                        <option>B+</option>
                                        <option>AB+</option>
                                        <option>O-</option>
                                        <option>A-</option>
                                        <option>B-</option>
                                        <option>AB-</option>
                                    </select>
                                </div>
                                <div className="trainer-profile__field">
                                    <label>Employee ID</label>
                                    <input
                                        type="text"
                                        value={formData.employeeId}
                                        disabled
                                        className="trainer-profile__field--readonly"
                                    />
                                </div>
                                <div className="trainer-profile__field">
                                    <label>Joining Date</label>
                                    <input
                                        type="date"
                                        value={formData.joiningDate}
                                        disabled
                                        className="trainer-profile__field--readonly"
                                    />
                                </div>
                            </div>
                            <div className="trainer-profile__field trainer-profile__field--full">
                                <label>Bio / Description</label>
                                <textarea
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="trainer-profile__form">
                            <div className="trainer-profile__form-grid">
                                <div className="trainer-profile__field">
                                    <label><Mail size={14} /> Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="trainer-profile__field">
                                    <label><Phone size={14} /> Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="trainer-profile__field trainer-profile__field--full">
                                <label><MapPin size={14} /> Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'professional' && (
                        <div className="trainer-profile__form">
                            <div className="trainer-profile__field trainer-profile__field--full">
                                <label>Specializations</label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="trainer-profile__field trainer-profile__field--full">
                                <label>Certifications</label>
                                <input
                                    type="text"
                                    value={formData.certifications}
                                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="trainer-profile__badges">
                                <label>Verified Badges</label>
                                <div className="trainer-profile__badges-list">
                                    <span className="trainer-profile__badge trainer-profile__badge--primary">ACE Certified</span>
                                    <span className="trainer-profile__badge trainer-profile__badge--warning">CrossFit L2</span>
                                    <span className="trainer-profile__badge trainer-profile__badge--success">First Aid</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="trainer-profile__security">
                            <div className="trainer-profile__security-item">
                                <div className="trainer-profile__security-icon">
                                    <Key size={16} />
                                </div>
                                <div className="trainer-profile__security-info">
                                    <span className="trainer-profile__security-title">Password</span>
                                    <span className="trainer-profile__security-sub">Last changed 30 days ago</span>
                                </div>
                                <button className="trainer-profile__security-btn">Change</button>
                            </div>
                            <div className="trainer-profile__security-item">
                                <div className="trainer-profile__security-icon trainer-profile__security-icon--success">
                                    <Shield size={16} />
                                </div>
                                <div className="trainer-profile__security-info">
                                    <span className="trainer-profile__security-title">Two-Factor Authentication</span>
                                    <span className="trainer-profile__security-sub trainer-profile__security-sub--success">Enabled</span>
                                </div>
                                <button className="trainer-profile__security-btn">Manage</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
