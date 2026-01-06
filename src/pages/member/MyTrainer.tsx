import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare, Calendar, Star, Phone, Mail, Clock,
    Award, ChevronRight, Send, CheckCircle2, User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '../../styles/macos-member.css';
import './MyTrainer.css';

interface TrainerData {
    hasTrainer: boolean;
    userId?: number;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    avatarId?: string;
    specialization?: string;
    certifications?: string[];
    rating?: number;
    experience?: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const MyTrainer: React.FC = () => {
    const [trainer, setTrainer] = useState<TrainerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        // Set mock data for development
        const mockTrainer: TrainerData = {
            hasTrainer: true,
            userId: 1,
            fullName: 'John Smith',
            email: 'john.smith@fitnesszone.com',
            phoneNumber: '+1 (555) 234-5678',
            specialization: 'Weight Training & Nutrition',
            certifications: ['NASM Certified', 'Precision Nutrition Coach', 'FMS Certified'],
            rating: 4.9,
            experience: 8
        };
        setTrainer(mockTrainer);
        setLoading(false);
    }, [user?.id]);

    const handleSendMessage = () => {
        if (!message.trim()) return;
        toast.success('Message sent to trainer!');
        setMessage('');
    };

    // Mock upcoming sessions
    const upcomingSessions = [
        { id: 1, date: 'Fri, Jan 3', time: '10:00 AM', focus: 'Upper Body Strength', status: 'upcoming' },
        { id: 2, date: 'Mon, Jan 6', time: '10:00 AM', focus: 'Cardio & Core', status: 'scheduled' }
    ];

    // Mock past sessions
    const pastSessions = [
        { id: 3, date: 'Dec 22', focus: 'Lower Body Strength', completed: true },
        { id: 4, date: 'Dec 15', focus: 'Full Body Assessment', completed: true }
    ];

    // Fitness plan
    const fitnessPlan = {
        goal: 'Build Muscle & Lose Fat',
        duration: '12 weeks',
        currentWeek: 8,
        progress: 67
    };

    if (loading) {
        return (
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <User size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    if (!trainer?.hasTrainer) {
        return (
            <motion.div className="macos-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <header style={{ marginBottom: 'var(--space-6)' }}>
                    <h1 className="macos-heading-xl">My Trainer</h1>
                    <p className="macos-text-md">Personal training and fitness guidance</p>
                </header>
                <div className="glass-card glass-card--lg">
                    <div className="macos-empty-state">
                        <div className="macos-empty-state__icon"><User size={28} /></div>
                        <div className="macos-empty-state__title">No Trainer Assigned</div>
                        <div className="macos-empty-state__text">
                            You don't have a personal trainer yet. Contact the front desk to get one!
                        </div>
                        <button className="macos-btn macos-btn--primary" style={{ marginTop: 'var(--space-4)' }}>
                            Request Trainer
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const initials = trainer.fullName?.split(' ').map(n => n[0]).join('') || 'T';

    return (
        <motion.div
            className="macos-page trainer-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.header className="trainer__header" variants={itemVariants}>
                <h1 className="macos-heading-xl">My Trainer</h1>
                <p className="macos-text-md">Personal training and fitness guidance</p>
            </motion.header>

            {/* Trainer Profile Card */}
            <motion.div className="glass-card glass-card--lg trainer__profile-card" variants={itemVariants}>
                <div className="trainer__profile">
                    <div className="trainer__avatar">{initials}</div>
                    <div className="trainer__info">
                        <h2 className="macos-heading-lg">{trainer.fullName}</h2>
                        <p className="macos-text-md">{trainer.specialization}</p>
                        <div className="trainer__rating">
                            <Star size={16} fill="var(--macos-warning)" color="var(--macos-warning)" />
                            <span>{trainer.rating}/5.0</span>
                            <span className="macos-text-tertiary">• {trainer.experience} years exp</span>
                        </div>
                    </div>
                </div>

                <div className="trainer__details">
                    <div className="trainer__detail-item">
                        <Mail size={16} />
                        <span>{trainer.email}</span>
                    </div>
                    <div className="trainer__detail-item">
                        <Phone size={16} />
                        <span>{trainer.phoneNumber}</span>
                    </div>
                    <div className="trainer__detail-item">
                        <Clock size={16} />
                        <span>Available: Mon-Fri 8AM-6PM</span>
                    </div>
                </div>

                <div className="trainer__certifications">
                    <span className="macos-text-xs">Certifications</span>
                    <div className="trainer__cert-list">
                        {trainer.certifications?.map((cert, i) => (
                            <span key={i} className="macos-badge macos-badge--blue">
                                <Award size={12} /> {cert}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="trainer__actions">
                    <button className="macos-btn macos-btn--primary">
                        <MessageSquare size={16} /> Send Message
                    </button>
                    <button className="macos-btn macos-btn--secondary">
                        <Calendar size={16} /> Request Session
                    </button>
                    <button className="macos-btn macos-btn--ghost">
                        <Star size={16} /> Leave Review
                    </button>
                </div>
            </motion.div>

            {/* Two Column Grid */}
            <motion.div className="bento-grid bento-grid--2col" variants={itemVariants}>
                {/* Upcoming Sessions */}
                <div className="glass-card glass-card--lg">
                    <div className="macos-section-header" style={{ marginBottom: 'var(--space-4)' }}>
                        <h3 className="macos-heading-md">📅 Upcoming Sessions</h3>
                        <button className="macos-section-link">Schedule <ChevronRight size={14} /></button>
                    </div>
                    <div className="trainer__sessions-list">
                        {upcomingSessions.map((session) => (
                            <div key={session.id} className="trainer__session-item">
                                <div className="trainer__session-date">
                                    <span className="trainer__session-day">{session.date}</span>
                                    <span className="trainer__session-time">{session.time}</span>
                                </div>
                                <div className="trainer__session-focus">{session.focus}</div>
                                <span className="macos-badge macos-badge--blue">{session.status}</span>
                            </div>
                        ))}
                    </div>

                    <div className="trainer__sessions-used">
                        <span>Sessions Used: 2 of 4 this month</span>
                        <div className="macos-progress">
                            <div className="macos-progress__fill macos-progress__fill--blue" style={{ width: '50%' }} />
                        </div>
                    </div>
                </div>

                {/* Fitness Plan */}
                <div className="glass-card glass-card--lg">
                    <div className="macos-section-header" style={{ marginBottom: 'var(--space-4)' }}>
                        <h3 className="macos-heading-md">🎯 Your Fitness Plan</h3>
                        <button className="macos-section-link">View Full</button>
                    </div>

                    <div className="trainer__plan">
                        <div className="trainer__plan-goal">
                            <span className="macos-text-xs">Current Goal</span>
                            <span className="macos-heading-sm">{fitnessPlan.goal}</span>
                        </div>
                        <div className="trainer__plan-progress">
                            <div className="trainer__plan-info">
                                <span>Week {fitnessPlan.currentWeek} of {parseInt(fitnessPlan.duration)}</span>
                                <span>{fitnessPlan.progress}%</span>
                            </div>
                            <div className="macos-progress">
                                <div className="macos-progress__fill macos-progress__fill--green" style={{ width: `${fitnessPlan.progress}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="trainer__past-sessions">
                        <span className="macos-text-xs" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>Recent Sessions</span>
                        {pastSessions.map((session) => (
                            <div key={session.id} className="trainer__past-item">
                                <CheckCircle2 size={16} color="var(--macos-success)" />
                                <span>{session.focus}</span>
                                <span className="macos-text-tertiary">{session.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Quick Message */}
            <motion.section variants={itemVariants}>
                <div className="macos-section-header">
                    <h2 className="macos-section-title">Quick Message</h2>
                </div>
                <div className="glass-card glass-card--md trainer__message-box">
                    <input
                        type="text"
                        placeholder="Type a message to your trainer..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="trainer__message-input"
                    />
                    <button className="macos-btn macos-btn--primary" onClick={handleSendMessage}>
                        <Send size={16} />
                    </button>
                </div>
            </motion.section>
        </motion.div>
    );
};

export default MyTrainer;
