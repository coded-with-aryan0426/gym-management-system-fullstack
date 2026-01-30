import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Star, Clock, Award, CheckCircle2,
    Zap, TrendingUp, Target, User, ChevronRight,
    ArrowUpDown, Info, Sparkles, MessageSquare, ArrowLeft,
    Users, Shield, Activity, Calendar, Trophy, Mail, Phone,
    Plus, UserPlus, X, Heart, Globe, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/macos-member.css';
import './MemberProfile.css';
import './MyTrainer.css';

interface Skill {
    name: string;
    category: string;
    level: string;
    isPrimary: boolean;
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
    stats: {
        rating: number;
        reviews: number;
        experience: string;
        activeMembers: number;
    };
    isBestMatch?: boolean;
    matchPercentage?: number;
}

const SKILL_CATEGORIES = [
    'All Skills',
    'Weight Loss',
    'Muscle Gain',
    'Strength Training',
    'Cardio & Endurance',
    'Rehabilitation',
    'Yoga / Mobility'
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, transition: { duration: 0.2 } }
};

const MyTrainer: React.FC = () => {
    const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
    const [assignedTrainers, setAssignedTrainers] = useState<TrainerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Skills');
    const [sortBy, setSortBy] = useState<'rating' | 'match' | 'experience'>('match');
    const [requesting, setRequesting] = useState<number | null>(null);
    const [showDiscovery, setShowDiscovery] = useState(false);

    const { user, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const assignedResponse = await api.get('/member/trainers/assigned');
            setAssignedTrainers(assignedResponse.data || []);

            const allResponse = await api.get('/member/trainers');
            setTrainers(allResponse.data || []);
        } catch (error) {
            console.error('Failed to fetch trainers:', error);
            toast.error('Failed to load trainer data');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestTrainer = async (trainerId: number, trainerName: string) => {
        setRequesting(trainerId);
        try {
            const response = await api.post(`/member/trainers/${trainerId}/request`);
            toast.success(response.data.message || `Trainer ${trainerName} has been assigned to you.`);
            
            // Refresh data
            const assignedResponse = await api.get('/member/trainers/assigned');
            setAssignedTrainers(assignedResponse.data || []);
            setShowDiscovery(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to request trainer');
        } finally {
            setRequesting(null);
        }
    };

    const filteredAndSortedTrainers = useMemo(() => {
        let result = trainers.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (t.skills && t.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                (t.specializations && t.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
            
            const matchesCategory = selectedCategory === 'All Skills' ||
                (t.skills && t.skills.some(s => s.category === selectedCategory)) ||
                (t.specializations && t.specializations.some(spec => spec.includes(selectedCategory)));
            
            return matchesSearch && matchesCategory;
        });

        result.sort((a, b) => {
            if (sortBy === 'rating') return (b.stats?.rating || 0) - (a.stats?.rating || 0);
            if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
            return (b.matchPercentage || 0) - (a.matchPercentage || 0);
        });

        return result;
    }, [trainers, searchQuery, selectedCategory, sortBy]);

    if (loading) {
        return (
            <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Zap size={32} color="var(--macos-accent)" />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="member-profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="profile-hero"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="profile-hero__bg" style={{ background: 'linear-gradient(135deg, #FF3B30 0%, #AF52DE 100%)' }} />
                <div className="profile-hero__pattern" />

                <div className="profile-hero__content">
                    <div className="profile-avatar">
                        <motion.div
                            className="profile-avatar__ring"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="profile-avatar__image">
                            {assignedTrainers.length > 0 ? (
                                <Briefcase size={32} />
                            ) : (
                                <Users size={32} />
                            )}
                        </div>
                    </div>

                    <div className="profile-hero__info">
                        <div className="profile-hero__name-row">
                            <h1 className="profile-hero__name">
                                {assignedTrainers.length > 0 ? `Your Training Team` : 'Expert Guidance'}
                            </h1>
                            {assignedTrainers.length > 0 && (
                                <span className="profile-badge" style={{ background: '#34C75915', color: '#34C759' }}>
                                    {assignedTrainers.length} Active {assignedTrainers.length === 1 ? 'Expert' : 'Experts'}
                                </span>
                            )}
                        </div>
                        <p className="profile-hero__email">
                            <Sparkles size={12} />
                            {assignedTrainers.length > 0 
                                ? 'Elite professionals dedicated to your fitness journey' 
                                : 'Connect with certified specialists to reach your peak performance'}
                        </p>
                        <p className="profile-hero__id">
                            Real-time coaching support & personalized programs
                        </p>
                    </div>

                    <div className="profile-stats-inline">
                        <div className="profile-stat-mini">
                            <div className="profile-stat-mini__header">
                                <span className="profile-stat-mini__value">{trainers.length}</span>
                                <Users size={12} className="profile-stat-mini__icon" />
                            </div>
                            <span className="profile-stat-mini__label">Professionals</span>
                        </div>
                        <div className="profile-stat-mini">
                            <div className="profile-stat-mini__header">
                                <span className="profile-stat-mini__value">98%</span>
                                <Heart size={12} className="profile-stat-mini__icon" />
                            </div>
                            <span className="profile-stat-mini__label">Member Sat</span>
                        </div>
                        <div className="profile-stat-mini">
                            <div className="profile-stat-mini__header">
                                <span className="profile-stat-mini__value">Elite</span>
                                <Trophy size={12} className="profile-stat-mini__icon" />
                            </div>
                            <span className="profile-stat-mini__label">Expertise</span>
                        </div>
                    </div>

                    <motion.button
                        className={`profile-hero__edit-btn ${showDiscovery ? 'profile-hero__edit-btn--active' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDiscovery(!showDiscovery)}
                    >
                        {showDiscovery ? <ArrowLeft size={16} /> : <Search size={16} />}
                        {showDiscovery ? 'Back to Team' : 'Discover Trainers'}
                    </motion.button>
                </div>
            </motion.div>

            <div className="profile-layout-grid">
                <div className="profile-main-content">
                    <AnimatePresence mode="wait">
                        {!showDiscovery ? (
                            <motion.div
                                key="assigned-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="section-header">
                                    <h3 className="section-title">
                                        <Shield size={16} color="var(--macos-accent)" />
                                        <span>My Coaching Team</span>
                                    </h3>
                                    <span className="section-subtitle">{assignedTrainers.length} Assigned</span>
                                </div>

                                {assignedTrainers.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                                        {assignedTrainers.map((trainer) => (
                                            <div key={trainer.userId} className="glass-card trainer-card--full" style={{ padding: 'var(--space-6)' }}>
                                                <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                    <div style={{ 
                                                        width: '100px', 
                                                        height: '100px', 
                                                        borderRadius: 'var(--radius-xl)', 
                                                        background: 'linear-gradient(135deg, #007AFF, #5856D6)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '36px',
                                                        fontWeight: 'bold',
                                                        color: 'white',
                                                        flexShrink: 0,
                                                        boxShadow: '0 8px 16px rgba(0,122,255,0.2)'
                                                    }}>
                                                        {trainer.name[0]}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: '280px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                                    <h2 className="macos-heading-md" style={{ margin: 0 }}>{trainer.name}</h2>
                                                                    <span className="profile-badge" style={{ background: '#007AFF15', color: '#007AFF', fontSize: '10px' }}>
                                                                        Certified Specialist
                                                                    </span>
                                                                </div>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', color: 'var(--macos-text-secondary)', fontSize: '14px' }}>
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Star size={14} fill="#FFCC00" color="#FFCC00" /> {trainer.stats.rating}
                                                                    </span>
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Award size={14} /> {trainer.stats.experience} Exp
                                                                    </span>
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <Target size={14} /> {trainer.specializations[0] || 'Elite Pro'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }} title="Send Message">
                                                                    <MessageSquare size={18} />
                                                                </button>
                                                                <button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }} title="Trainer Details">
                                                                    <Info size={18} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div style={{ 
                                                            display: 'grid', 
                                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                                            gap: '12px', 
                                                            margin: '16px 0',
                                                            padding: '12px',
                                                            background: 'rgba(255,255,255,0.02)',
                                                            borderRadius: 'var(--radius-lg)',
                                                            border: '1px solid var(--macos-border)'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                                <Mail size={14} className="macos-text-tertiary" />
                                                                <span className="macos-text-secondary">{trainer.email}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                                <Phone size={14} className="macos-text-tertiary" />
                                                                <span className="macos-text-secondary">{trainer.phone || 'Contact via Gym'}</span>
                                                            </div>
                                                        </div>

                                                        <p style={{ color: 'var(--macos-text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                                                            {trainer.bio || 'Experienced professional dedicated to your fitness goals.'}
                                                        </p>
                                                        
                                                        <div>
                                                            <div className="skill-section-label" style={{ marginBottom: '8px' }}>Active Specialties</div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                {trainer.specializations?.map((spec, i) => (
                                                                    <span key={i} className="skill-badge skill-badge--primary" style={{ padding: '4px 12px' }}>
                                                                        {spec}
                                                                    </span>
                                                                ))}
                                                                {trainer.skills?.map((skill, i) => (
                                                                    <span key={`skill-${i}`} className="skill-badge skill-badge--secondary">
                                                                        {skill.name} <span className="skill-level">{skill.level}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="glass-card" style={{ padding: 'var(--space-10)', textAlign: 'center', border: '1px dashed var(--macos-border)', background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="macos-empty-state">
                                            <div style={{ marginBottom: 'var(--space-4)', background: 'var(--macos-bg-tertiary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                                                <UserPlus size={32} style={{ opacity: 0.5 }} />
                                            </div>
                                            <h3 className="macos-heading-md" style={{ marginBottom: 'var(--space-2)' }}>Your Team is Empty</h3>
                                            <p className="macos-text-md" style={{ maxWidth: '500px', margin: '0 auto var(--space-6)', color: 'var(--macos-text-secondary)' }}>
                                                You don't have any trainers assigned yet. Start your journey by finding the perfect match for your goals.
                                            </p>
                                            <button 
                                                className="macos-btn macos-btn--primary" 
                                                onClick={() => setShowDiscovery(true)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                                            >
                                                <Sparkles size={16} />
                                                Browse Directory
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="section-header" style={{ marginTop: 'var(--space-10)' }}>
                                    <h3 className="section-title">
                                        <TrendingUp size={16} color="var(--macos-purple)" />
                                        <span>Recommended for You</span>
                                    </h3>
                                </div>
                                <div className="trainer-grid">
                                    {trainers.filter(t => !assignedTrainers.some(at => at.userId === t.userId)).slice(0, 3).map((trainer) => (
                                        <motion.div
                                            key={trainer.userId}
                                            variants={cardVariants}
                                            whileHover="hover"
                                            className="glass-card trainer-card"
                                            style={{ padding: 'var(--space-4)' }}
                                        >
                                            <div className="trainer-card__header" style={{ marginBottom: '12px' }}>
                                                <div className="trainer-card__avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                                                    {trainer.name[0]}
                                                </div>
                                                <div className="trainer-card__info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <h3 style={{ fontSize: '15px', margin: 0 }}>{trainer.name}</h3>
                                                        <span className="profile-badge" style={{ background: '#007AFF10', color: '#007AFF', fontSize: '9px', padding: '1px 6px' }}>
                                                            PT
                                                        </span>
                                                    </div>
                                                    <div className="trainer-card__rating" style={{ fontSize: '11px' }}>
                                                        <Star size={10} fill="#FFCC00" color="#FFCC00" />
                                                        <span>{trainer.stats.rating}</span>
                                                        <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span>
                                                        <span>{trainer.stats.experience} Exp</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                                                {trainer.specializations?.slice(0, 2).map((spec, i) => (
                                                    <span key={i} className="skill-badge skill-badge--secondary" style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>

                                            <p style={{ fontSize: '12px', color: 'var(--macos-text-tertiary)', margin: '0 0 16px', height: '36px', overflow: 'hidden', lineHeight: '1.4' }}>
                                                {trainer.bio}
                                            </p>
                                            
                                            <button 
                                                className="macos-btn macos-btn--primary" 
                                                style={{ width: '100%', padding: '8px', fontSize: '12px' }}
                                                onClick={() => handleRequestTrainer(trainer.userId, trainer.name)}
                                            >
                                                View Profile
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="discovery-view"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="section-header">
                                    <h3 className="section-title">
                                        <Globe size={16} color="var(--macos-accent)" />
                                        <span>Professional Directory</span>
                                    </h3>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div className="macos-select-wrapper" style={{ minWidth: '140px' }}>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as any)}
                                                className="macos-btn macos-btn--secondary"
                                                style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}
                                            >
                                                <option value="match">Sort: Match</option>
                                                <option value="rating">Sort: Rating</option>
                                                <option value="experience">Sort: Experience</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="trainer-discovery__controls" style={{ marginBottom: 'var(--space-6)' }}>
                                    <div className="trainer-search-wrapper">
                                        <Search size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by name, skill, or goal..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="glass-card trainer-discovery__filters macos-hide-scrollbar" style={{ overflowX: 'auto', marginBottom: 'var(--space-6)', padding: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {SKILL_CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                className={`trainer-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                                                onClick={() => setSelectedCategory(cat)}
                                                style={{ padding: '6px 14px', fontSize: '12px' }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="trainer-grid">
                                    {filteredAndSortedTrainers.map((trainer) => (
                                        <motion.div
                                            key={trainer.userId}
                                            layout
                                            variants={cardVariants}
                                            whileHover="hover"
                                            className={`glass-card trainer-card ${trainer.matchPercentage && trainer.matchPercentage > 90 ? 'trainer-card--best-match' : ''}`}
                                        >
                                            {trainer.matchPercentage && trainer.matchPercentage > 90 && (
                                                <div className="best-match-badge">
                                                    <Zap size={10} fill="currentColor" /> Match
                                                </div>
                                            )}

                                                <div className="trainer-card__header">
                                                    <div className="trainer-card__avatar">
                                                        {trainer.name[0]}
                                                    </div>
                                                    <div className="trainer-card__info">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <h3 style={{ margin: 0 }}>{trainer.name}</h3>
                                                            <span className="profile-badge" style={{ background: '#007AFF15', color: '#007AFF', fontSize: '10px' }}>PT</span>
                                                        </div>
                                                        <div className="trainer-card__rating">
                                                            <Star size={14} fill="#FFCC00" color="#FFCC00" />
                                                            <span>{trainer.stats?.rating || 0}</span>
                                                            <span className="macos-text-tertiary">({trainer.stats?.reviews || 0})</span>
                                                            <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span>
                                                            <span>{trainer.stats?.experience || '0 Yrs'} Exp</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="macos-text-sm" style={{ marginBottom: 'var(--space-4)', color: 'var(--macos-text-secondary)', height: '40px', overflow: 'hidden' }}>
                                                    {trainer.bio}
                                                </p>

                                                <div className="trainer-card__skills">
                                                    <div className="skill-tags">
                                                        {trainer.specializations?.slice(0, 2).map((spec, idx) => (
                                                            <div key={`spec-${idx}`} className="skill-badge skill-badge--primary">
                                                                {spec}
                                                            </div>
                                                        ))}
                                                        {trainer.skills?.slice(0, 2).map((skill, idx) => (
                                                            <div key={idx} className="skill-badge skill-badge--secondary">
                                                                {skill.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', display: 'flex', gap: '8px' }}>
                                                <button
                                                    className={`macos-btn ${assignedTrainers.some(at => at.userId === trainer.userId) ? 'macos-btn--secondary' : 'macos-btn--primary'}`}
                                                    style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                                                    onClick={() => handleRequestTrainer(trainer.userId, trainer.name)}
                                                    disabled={requesting === trainer.userId || assignedTrainers.some(at => at.userId === trainer.userId)}
                                                >
                                                    {requesting === trainer.userId ? 'Requesting...' : 
                                                     assignedTrainers.some(at => at.userId === trainer.userId) ? 'Your Trainer' : 'Request Trainer'}
                                                </button>
                                                <button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }}>
                                                    <Info size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="profile-sidebar">
                    <div className="sidebar-widget">
                        <h3 className="widget-title"><Shield size={14} /> Training Policy</h3>
                        <div style={{ padding: 'var(--space-4)', fontSize: '13px', color: 'var(--macos-text-secondary)' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <CheckCircle2 size={16} color="var(--macos-success)" />
                                <span>1-on-1 personalized sessions</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <CheckCircle2 size={16} color="var(--macos-success)" />
                                <span>Weekly progress reviews</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <CheckCircle2 size={16} color="var(--macos-success)" />
                                <span>Custom nutrition guidance</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-widget">
                        <h3 className="widget-title"><Activity size={14} /> Ecosystem Stats</h3>
                        <div className="body-stats-list" style={{ padding: '0 var(--space-4)' }}>
                            <div className="body-stat-item">
                                <span className="stat-label">Global Professionals</span>
                                <span className="stat-value">{trainers.length}</span>
                            </div>
                            <div className="body-stat-item">
                                <span className="stat-label">Assigned Experts</span>
                                <span className="stat-value">{assignedTrainers.length}</span>
                            </div>
                            <div className="body-stat-item">
                                <span className="stat-label">Support Status</span>
                                <span className="stat-value" style={{ color: 'var(--macos-success)' }}>24/7 Live</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-widget" style={{ background: 'linear-gradient(135deg, #FF3B3015, #AF52DE15)' }}>
                        <h3 className="widget-title"><Sparkles size={14} /> Need Help?</h3>
                        <div style={{ padding: 'var(--space-4)' }}>
                            <p style={{ fontSize: '12px', color: 'var(--macos-text-secondary)', marginBottom: '12px' }}>
                                Can't find the right trainer or need to change your team? Our concierge is here to help.
                            </p>
                            <button className="macos-btn macos-btn--secondary" style={{ width: '100%', fontSize: '12px' }}>
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MyTrainer;
