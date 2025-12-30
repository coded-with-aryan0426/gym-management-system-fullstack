import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import ContentCard from '../../components/shared/ContentCard';
import { User, Lock, Bell, Save, Activity, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './MemberProfile.css';

interface ProfileData {
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt?: string;
    avatarUrl?: string; // Future proofing
}

const MemberProfile: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
    });

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/member/profile?memberId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                    setFormData({
                        fullName: data.fullName || '',
                        phoneNumber: data.phoneNumber || '',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/member/profile?memberId=${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                setProfile(updatedProfile);
                const updatedUser = { ...user, fullName: formData.fullName };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => {
        toast.success("Avatar upload coming soon!");
    };

    if (loading) {
        return <div className="p-8 text-zinc-400">Loading profile...</div>;
    }

    const memberInitials = formData.fullName
        ? formData.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'M';

    return (
        <div className="space-y-6 fade-in">
            <PageHeader
                title="Account Settings"
                subtitle="Manage your personal information and membership preferences."
            />

            <div className="member-profile-layout">
                {/* Settings Sidebar */}
                <div className="profile-sidebar">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`profile-nav-item ${activeTab === 'profile' ? 'profile-nav-item--active' : ''}`}
                    >
                        <User size={18} />
                        Personal Info
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`profile-nav-item ${activeTab === 'security' ? 'profile-nav-item--active' : ''}`}
                    >
                        <Lock size={18} />
                        Security
                    </button>
                    <button
                        className="profile-nav-item profile-nav-item--disabled"
                        title="Coming soon"
                    >
                        <Activity size={18} />
                        Goal Settings
                    </button>
                </div>

                {/* Main Content */}
                <div className="profile-content">
                    {activeTab === 'profile' ? (
                        <ContentCard title="Personal Information" padded>
                            {/* Avatar Section */}
                            <div className="avatar-section">
                                <div className="avatar-preview">
                                    {memberInitials}
                                </div>
                                <div className="avatar-actions">
                                    <h4 className="avatar-title">Profile Photo</h4>
                                    <p className="avatar-subtitle">Update your profile picture.</p>
                                    <button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        className="avatar-btn"
                                    >
                                        Upload New Photo
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="form-input"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
                                            disabled
                                            className="form-input"
                                        />
                                        <p className="form-hint">Contact trainer to update email address.</p>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Member Since</label>
                                        <input
                                            type="text"
                                            value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                                            disabled
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary"
                                    >
                                        <Save size={18} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </ContentCard>
                    ) : (
                        <ContentCard title="Security Settings" padded>
                            <div className="space-y-6">
                                <div className="security-alert">
                                    <div className="flex items-center gap-2 security-alert__title">
                                        <AlertTriangle size={18} />
                                        <h3>Change Password</h3>
                                    </div>
                                    <p className="security-alert__text">
                                        To change your password, please contact your administrator or use the "Forgot Password" link on the login page.
                                        Self-service password change is coming soon.
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        value="**********"
                                        disabled
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </ContentCard>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberProfile;
