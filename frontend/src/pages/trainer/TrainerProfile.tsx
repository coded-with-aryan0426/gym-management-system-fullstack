import React, { useState } from 'react';
import { Camera, Save, X, User, Phone, Mail, MapPin, Award, Shield, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
        { label: 'Members', value: '12' },
        { label: 'Classes', value: '156' },
        { label: 'Rating', value: '4.9' },
        { label: 'Experience', value: '8y' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Compact Header with Profile Summary */}
            <div className="border-b border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                <div className="max-w-[1000px] mx-auto px-4 py-4">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--sidebar-hover)] border-2 border-[var(--sidebar-border)]">
                                <img 
                                    src="https://ui-avatars.com/api/?name=John+Smith&background=4F46E5&color=fff&size=128" 
                                    alt="John Smith" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#4F46E5] rounded-md flex items-center justify-center hover:bg-[#4338CA] transition-colors">
                                <Camera size={12} className="text-white" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                                    {formData.fullName}
                                </h1>
                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold rounded-full uppercase">
                                    Active
                                </span>
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)] mb-2">
                                {formData.specialization} • ID: {formData.employeeId}
                            </p>
                            <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <span key={i} className="text-amber-400 text-xs">★</span>
                                ))}
                                <span className="text-xs text-[var(--text-tertiary)] ml-1">4.9 (127 reviews)</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-[var(--bg-primary)] rounded-lg">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center px-3">
                                    <div className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</div>
                                    <div className="text-[10px] text-[var(--text-tertiary)] uppercase">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Edit Button */}
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="h-8 px-3 border border-[var(--sidebar-border)] rounded-md text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="h-8 px-3 border border-[var(--sidebar-border)] rounded-md text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="h-8 px-3 bg-[#4F46E5] rounded-md text-xs font-medium text-white hover:bg-[#4338CA] transition-colors flex items-center gap-1.5"
                                >
                                    <Save size={12} />
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1000px] mx-auto px-4 py-4">
                <div className="flex gap-4">
                    {/* Sidebar Tabs */}
                    <div className="w-[180px] flex-shrink-0 hidden md:block">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-[#4F46E5] text-white'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]'
                                    }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Mobile Tabs */}
                    <div className="md:hidden w-full mb-4">
                        <div className="flex gap-1 p-1 bg-[var(--sidebar-bg)] rounded-lg">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-[11px] font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-[#4F46E5] text-white'
                                            : 'text-[var(--text-secondary)]'
                                    }`}
                                >
                                    <tab.icon size={12} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg p-4">
                        {activeTab === 'basic' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Blood Type</label>
                                        <select
                                            value={formData.bloodType}
                                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
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
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Employee ID</label>
                                        <input
                                            type="text"
                                            value={formData.employeeId}
                                            disabled
                                            className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-tertiary)] cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Joining Date</label>
                                        <input
                                            type="date"
                                            value={formData.joiningDate}
                                            disabled
                                            className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-tertiary)] cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Bio</label>
                                    <textarea
                                        rows={3}
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">
                                            <Mail size={12} className="inline mr-1" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">
                                            <Phone size={12} className="inline mr-1" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">
                                        <MapPin size={12} className="inline mr-1" />
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'professional' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Specializations</label>
                                    <input
                                        type="text"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Certifications</label>
                                    <input
                                        type="text"
                                        value={formData.certifications}
                                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                        disabled={!isEditing}
                                        className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="p-3 bg-[var(--bg-primary)] rounded-lg">
                                    <div className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-2">Verified Badges</div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-[#4F46E5]/10 text-[#4F46E5] text-[10px] font-semibold rounded-full">ACE Certified</span>
                                        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-semibold rounded-full">CrossFit L2</span>
                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold rounded-full">First Aid</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--sidebar-border)]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-md bg-[#4F46E5]/10 flex items-center justify-center">
                                                <Key size={14} className="text-[#4F46E5]" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-[var(--text-primary)]">Password</div>
                                                <div className="text-[10px] text-[var(--text-tertiary)]">Last changed 30 days ago</div>
                                            </div>
                                        </div>
                                        <button className="h-7 px-2.5 text-[11px] font-medium text-[#4F46E5] border border-[#4F46E5]/30 rounded hover:bg-[#4F46E5]/10 transition-colors">
                                            Change
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--sidebar-border)]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                                <Shield size={14} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-[var(--text-primary)]">Two-Factor Authentication</div>
                                                <div className="text-[10px] text-emerald-500">Enabled</div>
                                            </div>
                                        </div>
                                        <button className="h-7 px-2.5 text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--sidebar-border)] rounded hover:bg-[var(--sidebar-hover)] transition-colors">
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
