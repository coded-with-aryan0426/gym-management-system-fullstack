import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Star, Clock, Award, CheckCircle2,
    Zap, TrendingUp, Target, User, ChevronRight,
    ArrowUpDown, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import '../../styles/macos-member.css';
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch assigned trainers
                const assignedResponse = await api.get('/api/member/trainers/assigned');
                setAssignedTrainers(assignedResponse.data || []);

                // Fetch all trainers for discovery
                const allResponse = await api.get('/api/member/trainers');
                let data = allResponse.data;

                // If data is empty, use enhanced mock data for demonstration
                if (!data || data.length === 0) {
                    data = getMockTrainers();
                }

                setTrainers(data);
            } catch (error) {
                console.error('Failed to fetch trainers:', error);
                setTrainers(getMockTrainers());
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRequestTrainer = async (trainerId: number, trainerName: string) => {
        setRequesting(trainerId);
        try {
            const response = await api.post(`/api/member/trainers/${trainerId}/request`);
            toast.success(response.data.message || `Request sent to ${trainerName}`);
            
            // Refresh assigned trainers
            const assignedResponse = await api.get('/api/member/trainers/assigned');
            setAssignedTrainers(assignedResponse.data || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to request trainer');
        } finally {
            setRequesting(null);
        }
    };

    const getMockTrainers = (): TrainerProfile[] => [
        {
            userId: 1,
            name: 'Alex Rivera',
            email: 'alex@fitness.com',
            phone: '+1 555-0101',
            bio: 'Specialist in high-intensity hypertrophy and strength training with 10+ years of experience.',
            specializations: ['Hypertrophy', 'Strength'],
            experienceYears: 10,
            skills: [
                { name: 'Muscle Gain', category: 'Muscle Gain', level: 'Expert', isPrimary: true },
                { name: 'Strength Training', category: 'Strength Training', level: 'Expert', isPrimary: true },
                { name: 'Powerlifting', category: 'Strength Training', level: 'Expert', isPrimary: false },
                { name: 'Nutrition', category: 'Weight Loss', level: 'Intermediate', isPrimary: false }
            ],
            stats: { rating: 4.9, reviews: 128, experience: '10 Yrs', activeMembers: 15 },
            isBestMatch: true,
            matchPercentage: 98
        },
        {
            userId: 2,
            name: 'Sarah Chen',
            email: 'sarah@fitness.com',
            phone: '+1 555-0102',
            bio: 'Expert yoga instructor focusing on mobility, flexibility, and post-injury rehabilitation.',
            specializations: ['Yoga', 'Rehab'],
            experienceYears: 7,
            skills: [
                { name: 'Yoga / Mobility', category: 'Yoga / Mobility', level: 'Expert', isPrimary: true },
                { name: 'Rehabilitation', category: 'Rehabilitation', level: 'Expert', isPrimary: true },
                { name: 'Pilates', category: 'Yoga / Mobility', level: 'Expert', isPrimary: false },
                { name: 'Mindfulness', category: 'Yoga / Mobility', level: 'Intermediate', isPrimary: false }
            ],
            stats: { rating: 4.8, reviews: 95, experience: '7 Yrs', activeMembers: 12 },
            matchPercentage: 85
        },
        {
            userId: 3,
            name: 'Marcus Thorne',
            email: 'marcus@fitness.com',
            phone: '+1 555-0103',
            bio: 'Dedicated weight loss coach helping clients achieve sustainable results through cardio and endurance.',
            specializations: ['Weight Loss', 'Endurance'],
            experienceYears: 5,
            skills: [
                { name: 'Weight Loss', category: 'Weight Loss', level: 'Expert', isPrimary: true },
                { name: 'Cardio & Endurance', category: 'Cardio & Endurance', level: 'Expert', isPrimary: true },
                { name: 'HIIT', category: 'Cardio & Endurance', level: 'Expert', isPrimary: false },
                { name: 'Kettlebells', category: 'Strength Training', level: 'Intermediate', isPrimary: false }
            ],
            stats: { rating: 4.7, reviews: 82, experience: '5 Yrs', activeMembers: 18 },
            matchPercentage: 92
        }
    ];

    const filteredAndSortedTrainers = useMemo(() => {
        let result = trainers.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'All Skills' ||
                t.skills.some(s => s.category === selectedCategory);
            
            return matchesSearch && matchesCategory;
        });

        result.sort((a, b) => {
            if (sortBy === 'rating') return b.stats.rating - a.stats.rating;
            if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
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
            className="macos-page trainer-macos"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="trainer__header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="macos-heading-xl">Your Training Program</h1>
                        <p className="macos-text-md">Personalized guidance to reach your goals</p>
                    </div>
                </div>
            </header>

            {/* Assigned Trainer Section */}
            <section style={{ marginBottom: 'var(--space-10)' }}>
                <h2 className="macos-heading-md" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={20} color="var(--macos-success)" />
                    Your Assigned Trainer
                </h2>
                
                {assignedTrainers.length > 0 ? (
                    <div className="trainer-grid">
                        {assignedTrainers.map(trainer => (
                            <motion.div
                                key={`assigned-${trainer.userId}`}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                className="glass-card trainer-card trainer-card--assigned"
                            >
                                <div className="trainer-card__header">
                                    <div className="trainer-card__avatar">
                                        {trainer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="trainer-card__info">
                                        <h3>{trainer.name}</h3>
                                        <div className="trainer-card__rating">
                                            <Star size={14} fill="var(--macos-warning)" color="var(--macos-warning)" />
                                            <span>{trainer.stats.rating}</span>
                                        </div>
                                    </div>
                                    <div className="macos-badge macos-badge--green" style={{ marginLeft: 'auto' }}>
                                        Current Trainer
                                    </div>
                                </div>
                                <div className="trainer-card__skills">
                                    <div className="skill-tags">
                                        {trainer.skills.slice(0, 3).map((skill, idx) => (
                                            <div key={idx} className="skill-badge skill-badge--primary">
                                                {skill.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="macos-btn macos-btn--primary" style={{ marginTop: 'var(--space-4)', width: '100%' }}>
                                    Message {trainer.name.split(' ')[0]}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: 'var(--space-8)', textAlign: 'center', border: '1px dashed var(--macos-border)' }}>
                        <div className="macos-empty-state">
                            <div className="macos-empty-state__icon" style={{ opacity: 0.5 }}><User size={32} /></div>
                            <h3 className="macos-heading-sm">No trainer is assigned to you yet</h3>
                            <p className="macos-text-sm" style={{ maxWidth: '400px', margin: '8px auto' }}>
                                Request trainer assignments at the front desk or browse trainers below to request one you like.
                            </p>
                        </div>
                    </div>
                )}
            </section>

            <div className="macos-divider" style={{ margin: 'var(--space-10) 0' }}></div>

            {/* Discovery Section */}
            <section id="discovery-section">
                <header className="trainer__header" style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h2 className="macos-heading-xl">Find Your Trainer</h2>
                            <p className="macos-text-md">Explore all professional trainers in our system</p>
                        </div>
                        <div className="macos-badge macos-badge--blue" style={{ marginBottom: '8px' }}>
                            <Target size={14} /> Personalized Matching Active
                        </div>
                    </div>
                </header>

                {/* Category Filters */}
                <div className="glass-card trainer-discovery__filters macos-hide-scrollbar" style={{ overflowX: 'auto' }}>
                    {SKILL_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`trainer-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="trainer-discovery__controls">
                    <div className="trainer-search-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or specific skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <div className="macos-select-wrapper" style={{ minWidth: '160px' }}>
                            <ArrowUpDown size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6 }} />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="macos-btn macos-btn--secondary"
                                style={{ paddingLeft: '34px', width: '100%', textAlign: 'left' }}
                            >
                                <option value="match">Sort by Match</option>
                                <option value="rating">Top Rated</option>
                                <option value="experience">Experience</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="macos-text-sm macos-text-tertiary">
                        Showing {filteredAndSortedTrainers.length} professional trainers
                    </span>
                </div>

                {/* Trainer Grid */}
                <div className="trainer-grid">
                    <AnimatePresence mode="popLayout">
                        {filteredAndSortedTrainers.map((trainer) => (
                            <motion.div
                                key={trainer.userId}
                                layout
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover="hover"
                                className={`glass-card trainer-card ${trainer.isBestMatch ? 'trainer-card--best-match' : ''}`}
                            >
                                {trainer.isBestMatch && (
                                    <div className="best-match-badge">
                                        <Zap size={12} fill="currentColor" /> Best Match
                                    </div>
                                )}

                                <div className="trainer-card__header">
                                    <div className="trainer-card__avatar">
                                        {trainer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="trainer-card__info">
                                        <h3>{trainer.name}</h3>
                                        <div className="trainer-card__rating">
                                            <Star size={14} fill="var(--macos-warning)" color="var(--macos-warning)" />
                                            <span>{trainer.stats.rating}</span>
                                            <span className="macos-text-tertiary">({trainer.stats.reviews})</span>
                                        </div>
                                        {trainer.matchPercentage && (
                                            <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--macos-accent)', fontWeight: 600 }}>
                                                {trainer.matchPercentage}% Match
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="macos-text-sm" style={{ marginBottom: 'var(--space-4)', color: 'var(--macos-text-secondary)', height: '40px', overflow: 'hidden' }}>
                                    {trainer.bio}
                                </p>

                                <div className="trainer-card__skills">
                                    <div className="skill-tags">
                                        {trainer.skills.map((skill, idx) => (
                                            <div
                                                key={idx}
                                                className={`skill-badge ${skill.isPrimary ? 'skill-badge--primary' : 'skill-badge--secondary'}`}
                                            >
                                                {skill.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: '8px' }}>
                                    <button
                                        className={`macos-btn ${assignedTrainers.some(at => at.userId === trainer.userId) ? 'macos-btn--secondary' : 'macos-btn--primary'}`}
                                        style={{ flex: 1 }}
                                        onClick={() => handleRequestTrainer(trainer.userId, trainer.name)}
                                        disabled={requesting === trainer.userId || assignedTrainers.some(at => at.userId === trainer.userId)}
                                    >
                                        {requesting === trainer.userId ? 'Requesting...' : 
                                         assignedTrainers.some(at => at.userId === trainer.userId) ? 'Assigned' : 'Request Trainer'}
                                    </button>
                                    <button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }}>
                                        <Info size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {filteredAndSortedTrainers.length === 0 && (
                <div className="glass-card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div className="macos-empty-state">
                        <div className="macos-empty-state__icon"><Filter size={32} /></div>
                        <h3 className="macos-heading-md">No trainers match your criteria</h3>
                        <p className="macos-text-md">Try adjusting your filters or search terms.</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MyTrainer;
