import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Star, Award, Target, Mail, Phone,
    Users, CheckCircle2, Clock, Trophy
} from 'lucide-react';

interface Skill {
    name: string;
    category: string;
    level: string;
    isPrimary: boolean;
}

interface CertificationDTO {
    name: string;
    issuer?: string;
    year?: number;
}

interface AvailabilityDTO {
    day: string;
    startTime: string;
    endTime: string;
}

interface TrainerProfile {
    userId: number;
    name: string;
    email: string;
    phone: string;
    bio: string;
    specializations: string[];
    skills: Skill[];
    experienceYears: number;
    certifications?: CertificationDTO[];
    availability?: AvailabilityDTO[];
    stats: {
        rating: number;
        reviews: number;
        experience: string;
        activeMembers: number;
    };
    matchPercentage?: number;
}

interface TrainerDetailModalProps {
    trainer: TrainerProfile;
    isAssigned: boolean;
    requesting: boolean;
    onClose: () => void;
    onRequest: (id: number, name: string) => void;
    onUnassign: (id: number, name: string) => void;
}

const SKILL_CATEGORIES = [
    'Weight Loss', 'Muscle Gain', 'Strength Training',
    'Cardio & Endurance', 'Rehabilitation', 'Yoga / Mobility'
];

const TrainerDetailModal: React.FC<TrainerDetailModalProps> = ({
    trainer, isAssigned, requesting, onClose, onRequest, onUnassign
}) => {
    const tags = [...new Set([
        ...(trainer.specializations?.flatMap(s => s.split(',')).map(s => s.trim()) || []),
        ...(trainer.skills?.map(s => s.category.trim()) || [])
    ])].filter(cat => SKILL_CATEGORIES.includes(cat));

    return (
        <AnimatePresence>
            <motion.div
                className="tdm-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="tdm-panel"
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.97 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="tdm-header">
                        <div className="tdm-avatar">
                            {(trainer.name || 'T').charAt(0).toUpperCase()}
                        </div>
                        <div className="tdm-header__info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h2 className="tdm-header__name">{trainer.name}</h2>
                                {isAssigned && (
                                    <span className="tdm-badge tdm-badge--assigned">
                                        <CheckCircle2 size={10} /> Your Trainer
                                    </span>
                                )}
                            </div>
                            <div className="tdm-header__meta">
                                <span><Star size={13} fill="#FFCC00" color="#FFCC00" /> {trainer.stats?.rating}</span>
                                <span className="tdm-dot" />
                                <span>({trainer.stats?.reviews} reviews)</span>
                                <span className="tdm-dot" />
                                <span><Award size={13} /> {trainer.stats?.experience} Exp</span>
                                <span className="tdm-dot" />
                                <span><Users size={13} /> {trainer.stats?.activeMembers} members</span>
                            </div>
                        </div>
                        <button className="tdm-close" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="tdm-body">
                        {/* Bio */}
                        <div className="tdm-section">
                            <div className="tdm-section__label">About</div>
                            <p className="tdm-bio">{trainer.bio || 'Elite fitness professional dedicated to your goals.'}</p>
                        </div>

                        {/* Contact */}
                        <div className="tdm-section">
                            <div className="tdm-section__label">Contact</div>
                            <div className="tdm-contact-row">
                                <Mail size={14} />
                                <span>{trainer.email}</span>
                            </div>
                            {trainer.phone && (
                                <div className="tdm-contact-row">
                                    <Phone size={14} />
                                    <span>{trainer.phone}</span>
                                </div>
                            )}
                        </div>

                        {/* Specializations */}
                        {tags.length > 0 && (
                            <div className="tdm-section">
                                <div className="tdm-section__label">Specializations</div>
                                <div className="tdm-tags">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="tdm-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {trainer.skills && trainer.skills.length > 0 && (
                            <div className="tdm-section">
                                <div className="tdm-section__label">Skills</div>
                                <div className="tdm-skills-grid">
                                    {trainer.skills.map((skill, i) => (
                                        <div key={i} className="tdm-skill-item">
                                            <div className="tdm-skill-name">{skill.name}</div>
                                            <div className="tdm-skill-level">{skill.level}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {trainer.certifications && trainer.certifications.length > 0 && (
                            <div className="tdm-section">
                                <div className="tdm-section__label">Certifications</div>
                                {trainer.certifications.map((cert, i) => (
                                    <div key={i} className="tdm-cert-item">
                                        <Trophy size={14} style={{ color: '#FFCC00', flexShrink: 0 }} />
                                        <div>
                                            <div className="tdm-cert-name">{cert.name}</div>
                                            {cert.issuer && <div className="tdm-cert-issuer">{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Availability */}
                        {trainer.availability && trainer.availability.length > 0 && (
                            <div className="tdm-section">
                                <div className="tdm-section__label">Availability</div>
                                <div className="tdm-avail-grid">
                                    {trainer.availability.map((slot, i) => (
                                        <div key={i} className="tdm-avail-item">
                                            <Clock size={12} />
                                            <span className="tdm-avail-day">{slot.day}</span>
                                            <span className="tdm-avail-time">{slot.startTime} – {slot.endTime}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="tdm-footer">
                        <button className="macos-btn macos-btn--secondary tdm-footer__close" onClick={onClose}>
                            Close
                        </button>
                        {isAssigned ? (
                            <button
                                className="macos-btn tdm-footer__unassign"
                                onClick={() => onUnassign(trainer.userId, trainer.name)}
                            >
                                Remove from Team
                            </button>
                        ) : (
                            <button
                                className="macos-btn macos-btn--primary"
                                onClick={() => onRequest(trainer.userId, trainer.name)}
                                disabled={requesting}
                            >
                                {requesting ? 'Requesting…' : 'Add to My Team'}
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TrainerDetailModal;
