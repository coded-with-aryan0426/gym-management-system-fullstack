import React from 'react';
import { MessageSquare, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MemberComponents.css';

interface TrainerData {
    id: number;
    fullName: string;
    specialization?: string;
    nextSession?: string;
}

const MemberTrainerCard: React.FC<{ trainer: TrainerData | null }> = ({ trainer }) => {
    const navigate = useNavigate();

    if (!trainer) {
        return (
            <div className="trainer-card">
                <div className="trainer-card__header">
                    <h3 className="trainer-card__title">
                        <User size={18} style={{ color: '#dc2626' }} />
                        My Trainer
                    </h3>
                </div>
                <div className="trainer-card__body">
                    <div className="trainer-card__avatar trainer-card__avatar--empty">
                        <User size={32} />
                    </div>
                    <h4 className="trainer-card__name">No Trainer Assigned</h4>
                    <p className="trainer-card__role">Get personalized guidance by requesting a personal trainer.</p>
                    <button
                        onClick={() => navigate('/member/trainer')}
                        className="trainer-card__btn"
                        style={{ width: '100%' }}
                    >
                        Find a Trainer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="trainer-card">
            <div className="trainer-card__header">
                <h3 className="trainer-card__title">
                    <User size={18} style={{ color: '#dc2626' }} />
                    My Trainer
                </h3>
            </div>
            <div className="trainer-card__body">
                <div className="trainer-card__avatar">
                    {trainer.fullName.charAt(0)}
                </div>
                <h4 className="trainer-card__name">{trainer.fullName}</h4>
                <p className="trainer-card__role">{trainer.specialization || 'Fitness Coach'}</p>

                {trainer.nextSession && (
                    <div className="trainer-card__session">
                        <Clock size={14} style={{ color: '#dc2626' }} />
                        <span>Next: {trainer.nextSession}</span>
                    </div>
                )}

                <div className="trainer-card__actions">
                    <button className="trainer-card__btn">
                        <MessageSquare size={16} />
                        Message
                    </button>
                    <button
                        onClick={() => navigate('/member/trainer')}
                        className="trainer-card__btn"
                    >
                        Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberTrainerCard;
