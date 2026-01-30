import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Star, Clock, Award, CheckCircle2,
    Zap, TrendingUp, Target, User, ChevronRight,
    ArrowUpDown, Info, Sparkles, MessageSquare, ArrowLeft,
    Users, Shield, Activity, Calendar, Trophy, Mail, Phone,
    Plus, UserPlus, X
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
                (t.skills && t.skills.some(s => s.category === selectedCategory));
            
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
            className="member-profile" // Reusing profile class for similar layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="profile-hero"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="profile-hero__bg" style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }} />
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
                                assignedTrainers[0].name.split(' ').map(n => n[0]).join('')
                            ) : (
                                <Users size={32} />
                            )}
                        </div>
                    </div>

                    <div className="profile-hero__info">
                        <div className="profile-hero__name-row">
                            <h1 className="profile-hero__name">
                                {assignedTrainers.length > 0 ? assignedTrainers[0].name : 'No Trainer Assigned'}
                            </h1>
                            {assignedTrainers.length > 0 && (
                                <span className="profile-badge" style={{ background: '#34C75915', color: '#34C759' }}>
                                    Active Program
                                </span>
                            )}
                        </div>
                        <p className="profile-hero__email">
                            <Target size={12} />
                            {assignedTrainers.length > 0 ? 'Your Professional Guide' : 'Get a trainer to accelerate your results'}
                        </p>
                        <p className="profile-hero__id">
                            {assignedTrainers.length > 0 ? `Experience: ${assignedTrainers[0].stats.experience}` : 'Browse trainers below'}
                        </p>
                    </div>

                    <div className="profile-stats-inline">
                        <div className="profile-stat-mini">
                            <div className="profile-stat-mini__header">
                                <span className="profile-stat-mini__value">{trainers.length}</span>
                                <Users size={12} className="profile-stat-mini__icon" />
                            </div>
                            <span className="profile-stat-mini__label">Available</span>
                        </div>
                        <div className="profile-stat-mini">
                            <div className="profile-stat-mini__header">
                                <span className="profile-stat-mini__value">98%</span>
                                <Star size={12} className="profile-stat-mini__icon" />
                            </div>
                            <span className="profile-stat-mini__label">Success Rate</span>
                        </div>
                        <div className="profile-stat-mini">
                            <div className="profile-stat-mini__header">
                                <span className="profile-stat-mini__value">24/7</span>
                                <Clock size={12} className="profile-stat-mini__icon" />
                            </div>
                            <span className="profile-stat-mini__label">Support</span>
                        </div>
                    </div>

                    <motion.button
                        className={`profile-hero__edit-btn ${showDiscovery ? 'profile-hero__edit-btn--active' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDiscovery(!showDiscovery)}
                    >
                        {showDiscovery ? <X size={16} /> : <Search size={16} />}
                        {showDiscovery ? 'Close Search' : 'Find Your Trainer'}
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
                                        <Award size={16} />
                                        <span>Current Assignment</span>
                                    </h3>
                                </div>

                                {assignedTrainers.length > 0 ? (
                                    <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                                        <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
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
                                                color: 'white'
                                            }}>
                                                {assignedTrainers[0].name[0]}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h2 className="macos-heading-md" style={{ marginBottom: '4px' }}>{assignedTrainers[0].name}</h2>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--macos-text-secondary)', fontSize: '14px' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Star size={14} fill="#FFCC00" color="#FFCC00" /> {assignedTrainers[0].stats.rating}
                                                            </span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Award size={14} /> {assignedTrainers[0].stats.experience} Exp
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }}>
                                                            <MessageSquare size={18} />
                                                        </button>
                                                        <button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }}>
                                                            <Info size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p style={{ marginTop: '12px', color: 'var(--macos-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                                                    {assignedTrainers[0].bio}
                                                </p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                                                    {assignedTrainers[0].skills?.slice(0, 4).map((skill, i) => (
                                                        <span key={i} className="skill-badge skill-badge--primary">
                                                            {skill.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-card" style={{ padding: 'var(--space-10)', textAlign: 'center', border: '1px dashed var(--macos-border)', background: 'rgba(255,255,255,0.02)' }}>
                                        <div className="macos-empty-state">
                                            <div style={{ marginBottom: 'var(--space-4)', background: 'var(--macos-bg-tertiary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                                                <UserPlus size={32} style={{ opacity: 0.5 }} />
                                            </div>
                                            <h3 className="macos-heading-md" style={{ marginBottom: 'var(--space-2)' }}>No trainer is assigned to you</h3>
                                            <p className="macos-text-md" style={{ maxWidth: '500px', margin: '0 auto var(--space-6)', color: 'var(--macos-text-secondary)' }}>
                                                No trainer is assigned to you. Request trainer assignments to the front desk or request any trainer you like.
                                            </p>
                                            <button 
                                                className="macos-btn macos-btn--primary" 
                                                onClick={() => setShowDiscovery(true)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                                            >
                                                <Sparkles size={16} />
                                                Find Your Trainer
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="section-header" style={{ marginTop: 'var(--space-10)' }}>
                                    <h3 className="section-title">
                                        <TrendingUp size={16} />
                                        <span>Recommended Trainers</span>
                                    </h3>
                                </div>
                                <div className="trainer-grid">
                                    {trainers.slice(0, 2).map((trainer) => (
                                        <motion.div
                                            key={trainer.userId}
                                            variants={cardVariants}
                                            whileHover="hover"
                                            className="glass-card trainer-card"
                                            style={{ padding: 'var(--space-4)' }}
                                        >
                                            <div className="trainer-card__header">
                                                <div className="trainer-card__avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                                                    {trainer.name[0]}
                                                </div>
                                                <div className="trainer-card__info">
                                                    <h3 style={{ fontSize: '16px' }}>{trainer.name}</h3>
                                                    <div className="trainer-card__rating">
                                                        <Star size={12} fill="#FFCC00" color="#FFCC00" />
                                                        <span>{trainer.stats.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--macos-text-tertiary)', margin: '8px 0', height: '36px', overflow: 'hidden' }}>
                                                {trainer.bio}
                                            </p>
                                            <button 
                                                className="macos-btn macos-btn--primary" 
                                                style={{ width: '100%', padding: '6px', fontSize: '12px' }}
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
                                        <Search size={16} />
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
                                                    <h3>{trainer.name}</h3>
                                                    <div className="trainer-card__rating">
                                                        <Star size={14} fill="#FFCC00" color="#FFCC00" />
                                                        <span>{trainer.stats?.rating || 0}</span>
                                                        <span className="macos-text-tertiary">({trainer.stats?.reviews || 0})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="macos-text-sm" style={{ marginBottom: 'var(--space-4)', color: 'var(--macos-text-secondary)', height: '40px', overflow: 'hidden' }}>
                                                {trainer.bio}
                                            </p>

                                            <div className="trainer-card__skills">
                                                <div className="skill-tags">
                                                    {trainer.skills?.slice(0, 3).map((skill, idx) => (
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
                        <h3 className="widget-title"><Zap size={14} /> Quick Stats</h3>
                        <div className="body-stats-list" style={{ padding: '0 var(--space-4)' }}>
                            <div className="body-stat-item">
                                <span className="stat-label">Total Trainers</span>
                                <span className="stat-value">{trainers.length}</span>
                            </div>
                            <div className="body-stat-item">
                                <span className="stat-label">Top Rated</span>
                                <span className="stat-value">Alex R.</span>
                            </div>
                            <div className="body-stat-item">
                                <span className="stat-label">My Requests</span>
                                <span className="stat-value">{assignedTrainers.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-widget membership-widget">
                        <div className="widget-header">
                            <h3 className="widget-title"><Calendar size={14} /> Availability</h3>
                        </div>
                        <div className="membership-card" style={{ padding: '12px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--macos-text-secondary)' }}>
                                All trainers are currently accepting new members. Browse the directory to start your journey.
                            </div>
                        </div>
                        <button className="widget-action-btn primary" onClick={() => setShowDiscovery(true)}>
                            Explore All Trainers
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MyTrainer;
