import React, { useEffect, useState } from 'react';
import './Trainer.css';

interface Member {
    userId: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    avatarId?: string;
}

const MyMembers: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchMembers = async () => {
            if (!user?.id) return;

            try {
                const response = await fetch(`/api/trainer/my-members?trainerId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setMembers(data);
                }
            } catch (error) {
                console.error('Failed to fetch members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [user?.id]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="trainer-dashboard">
                <h1 className="trainer-page-title">My Members</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="trainer-dashboard">
            <h1 className="trainer-page-title">My Members ({members.length})</h1>

            {members.length === 0 ? (
                <div className="trainer-empty-state">
                    <div className="trainer-empty-state__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                    </div>
                    <h3 className="trainer-empty-state__title">No Members Assigned</h3>
                    <p className="trainer-empty-state__text">
                        You don't have any members assigned yet. Contact your administrator.
                    </p>
                </div>
            ) : (
                <div className="trainer-members-list">
                    {members.map(member => (
                        <div key={member.userId} className="trainer-member-card">
                            <div className="trainer-member-card__avatar">
                                {getInitials(member.fullName)}
                            </div>
                            <div className="trainer-member-card__info">
                                <div className="trainer-member-card__name">{member.fullName}</div>
                                <div className="trainer-member-card__email">{member.email}</div>
                            </div>
                            {member.phoneNumber && (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    {member.phoneNumber}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMembers;
