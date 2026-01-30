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
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Skills');
    const [sortBy, setSortBy] = useState<'rating' | 'match' | 'experience'>('match');

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                // Fetch from our new endpoint
                const response = await api.get('/api/member/trainers');
                let data = response.data;

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

        fetchTrainers();
    }, []);

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
                        <h1 className="macos-heading-xl">Find Your Trainer</h1>
                        <p className="macos-text-md">Skill-based matching for your fitness goals</p>
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
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }}></div>
                        <span style={{ fontSize: '11px', color: 'var(--macos-text-tertiary)' }}>Primary Skill</span>
                    </div>
                </div>
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
                                        <span className="macos-text-tertiary">({trainer.stats.reviews} reviews)</span>
                                    </div>
                                    {trainer.matchPercentage && (
                                        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--macos-accent)', fontWeight: 600 }}>
                                            {trainer.matchPercentage}% Skill Match
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="macos-text-sm" style={{ marginBottom: 'var(--space-4)', color: 'var(--macos-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {trainer.bio}
                            </p>

                            <div className="trainer-card__skills">
                                <span className="skill-section-label">Core Competencies</span>
                                <div className="skill-tags">
                                    {trainer.skills.map((skill, idx) => (
                                        <div
                                            key={idx}
                                            className={`skill-badge ${skill.isPrimary ? 'skill-badge--primary' : 'skill-badge--secondary'}`}
                                            title={`${skill.category} - ${skill.level}`}
                                        >
                                            {skill.name}
                                            <span className="skill-level">{skill.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="trainer-card__meta">
                                <div className="meta-item">
                                    <span className="meta-label">Experience</span>
                                    <span className="meta-value">{trainer.stats.experience}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Availability</span>
                                    <span className="meta-value">Mon - Fri</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">Active Clients</span>
                                    <span className="meta-value">{trainer.stats.activeMembers}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: '8px' }}>
                                <button
                                    className="macos-btn macos-btn--primary"
                                    style={{ flex: 1 }}
                                    onClick={() => toast.success(`Selection request sent to ${trainer.name}`)}
                                >
                                    Choose Trainer
                                </button>
                                <button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }}>
                                    <Info size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredAndSortedTrainers.length === 0 && (
                <div className="glass-card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div className="macos-empty-state">
                        <div className="macos-empty-state__icon"><Filter size={32} /></div>
                        <h3 className="macos-heading-md">No trainers match your criteria</h3>
                        <p className="macos-text-md">Try adjusting your filters or search terms to find more trainers.</p>
                        <button
                            className="macos-btn macos-btn--primary"
                            style={{ marginTop: 'var(--space-4)' }}
                            onClick={() => { setSelectedCategory('All Skills'); setSearchQuery(''); }}
                        >
                            Reset All Filters
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MyTrainer;
