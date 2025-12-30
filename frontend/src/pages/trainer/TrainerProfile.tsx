import React, { useEffect, useState } from 'react';
import './Trainer.css';

const TrainerProfile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
    });

    const userStr = localStorage.getItem('user');
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

                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="trainer-dashboard">
                <h1 className="trainer-page-title">My Profile</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="trainer-dashboard">
            <h1 className="trainer-page-title">My Profile</h1>

            <form className="trainer-profile-form" onSubmit={handleSubmit}>
                <div className="trainer-form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                    />
                </div>

                <div className="trainer-form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                    <small style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Email cannot be changed. Contact admin if needed.
                    </small>
                </div>

                <div className="trainer-form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="Enter phone number"
                    />
                </div>

                <div className="trainer-form-group">
                    <label>Joined</label>
                    <input
                        type="text"
                        value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                </div>

                <div className="trainer-form-actions">
                    <button type="submit" className="trainer-btn trainer-btn--primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TrainerProfile;
