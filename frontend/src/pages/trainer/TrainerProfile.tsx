import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import ContentCard from '../../components/shared/ContentCard';
import { User, Lock, Bell, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TrainerProfile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
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
                const response = await fetch(`/api/trainer/profile?trainerId=${user.id}`);
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
            const response = await fetch(`/api/trainer/profile?trainerId=${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                setProfile(updatedProfile);

                // Update localStorage
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

    if (loading) {
        return <div className="p-8 text-zinc-400">Loading profile...</div>;
    }

    return (
        <div className="space-y-6 fade-in">
            <PageHeader
                title="Account Settings"
                subtitle="Manage your personal information and security preferences."
            />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-64 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile'
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        <User size={18} />
                        Personal Info
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'security'
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        <Lock size={18} />
                        Security
                    </button>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 opacity-50 cursor-not-allowed"
                        title="Coming soon"
                    >
                        <Bell size={18} />
                        Notifications
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'profile' ? (
                        <ContentCard title="Personal Information" padded>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
                                            disabled
                                            className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-4 py-2.5 text-zinc-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-zinc-500">Contact admin to update email address.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400">Joined Date</label>
                                        <input
                                            type="text"
                                            value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                                            disabled
                                            className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-lg px-4 py-2.5 text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-800 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                    <h3 className="text-yellow-500 font-medium mb-1">Change Password</h3>
                                    <p className="text-sm text-yellow-500/80">
                                        To change your password, please contact your administrator or use the "Forgot Password" link on the login page.
                                        Self-service password change is coming soon.
                                    </p>
                                </div>
                            </div>
                        </ContentCard>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
