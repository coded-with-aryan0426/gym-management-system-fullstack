import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Star, Award, CheckCircle2,
    Zap, TrendingUp, Target, Info, Sparkles, MessageSquare, ArrowLeft,
    Users, Shield, Activity, Calendar, Trophy, Mail, Phone,
    UserPlus, Heart, Globe, Briefcase, X, UserMinus, Clock, Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/macos-member.css';
import './MyTrainer.css';
import TrainerDetailModal from './TrainerDetailModal';

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

interface MyTrainerRequest {
    id: number;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
    memberMessage?: string;
    trainerNote?: string;
    createdAt: string;
    resolvedAt?: string;
    trainer: {
        userId: number;
        name: string;
        email: string;
    };
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

// ── Send Request Modal ───────────────────────────────────────────────────────
interface SendRequestModalProps {
    trainer: TrainerProfile;
    sending: boolean;
    onSend: (message: string) => void;
    onClose: () => void;
}

const SendRequestModal: React.FC<SendRequestModalProps> = ({ trainer, sending, onSend, onClose }) => {
    const [message, setMessage] = useState('');
    const maxLen = 400;

    const GOAL_PROMPTS = [
        'I want to lose weight and get fit',
        'I am looking to build muscle mass',
        'I need help with rehab / injury recovery',
        'I want to train for a marathon / endurance',
        'I want a personalised strength program',
    ];

    return (
        <motion.div
            className="tdm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="srm-modal"
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32, scale: 0.96 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="srm-header">
                    <div className="srm-header__avatar">{(trainer.name || 'T').charAt(0).toUpperCase()}</div>
                    <div className="srm-header__info">
                        <h2 className="srm-header__name">Request {trainer.name}</h2>
                        <p className="srm-header__sub">
                            <Star size={11} fill="#FFCC00" color="#FFCC00" /> {trainer.stats?.rating}
                            &nbsp;&middot;&nbsp;
                            <Award size={11} /> {trainer.stats?.experience}
                        </p>
                    </div>
                    <button className="srm-close" onClick={onClose}><X size={16} /></button>
                </div>

                {/* Steps visual */}
                <div className="srm-steps">
                    <div className="srm-step srm-step--done"><span>1</span> Choose</div>
                    <div className="srm-step-line srm-step-line--done" />
                    <div className="srm-step srm-step--active"><span>2</span> Message</div>
                    <div className="srm-step-line" />
                    <div className="srm-step"><span>3</span> Awaiting</div>
                </div>

                <div className="srm-body">
                    <p className="srm-body__label">
                        Tell {trainer.name} why you want them as your trainer. This helps them decide if they're the right fit.
                    </p>

                    {/* Quick-fill prompts */}
                    <div className="srm-prompts">
                        {GOAL_PROMPTS.map((p, i) => (
                            <button
                                key={i}
                                className="srm-prompt-chip"
                                onClick={() => setMessage(prev => prev ? prev + '. ' + p : p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Message textarea */}
                    <div className="srm-textarea-wrap">
                        <textarea
                            className="srm-textarea"
                            placeholder="e.g. I want to lose 10kg before summer and need a structured plan..."
                            value={message}
                            onChange={e => setMessage(e.target.value.slice(0, maxLen))}
                            rows={4}
                            autoFocus
                        />
                        <span className={`srm-char-count ${message.length > maxLen * 0.9 ? 'warn' : ''}`}>
                            {message.length}/{maxLen}
                        </span>
                    </div>

                    <p className="srm-note">
                        <Clock size={11} /> Your request will be sent to {trainer.name}. They'll accept or decline — you'll be notified either way.
                    </p>
                </div>

                <div className="srm-footer">
                    <button className="macos-btn macos-btn--secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="macos-btn macos-btn--primary srm-footer__send"
                        disabled={sending}
                        onClick={() => onSend(message)}
                    >
                        {sending ? (
                            <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Zap size={14} /></motion.span> Sending…</>
                        ) : (
                            <><Send size={14} /> Send Request</>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const MyTrainer: React.FC = () => {
    const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
    const [assignedTrainers, setAssignedTrainers] = useState<TrainerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Skills');
    const [sortBy, setSortBy] = useState<'rating' | 'experience'>('rating');
    const [requesting, setRequesting] = useState<number | null>(null);
    const [unassigning, setUnassigning] = useState<number | null>(null);
    const [showDiscovery, setShowDiscovery] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
    const [confirmUnassign, setConfirmUnassign] = useState<{ id: number; name: string } | null>(null);
    // requestModal: when member clicks "Request Trainer", show a modal to enter a message first
    const [requestModal, setRequestModal] = useState<{ trainer: TrainerProfile } | null>(null);
    // pendingRequests: set of trainerIds that have a PENDING request
    const [pendingRequests, setPendingRequests] = useState<Set<number>>(new Set());
    const [myRequests, setMyRequests] = useState<MyTrainerRequest[]>([]);
    const [cancelling, setCancelling] = useState<number | null>(null);

    const { isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [assignedRes, allRes, pendingRes] = await Promise.all([
                api.get('/member/trainers/assigned'),
                api.get('/member/trainers'),
                api.get('/trainer-requests/my').catch(() => ({ data: [] }))
            ]);
            setAssignedTrainers(assignedRes.data || []);
            setTrainers(allRes.data || []);
            const requestsData = pendingRes.data || [];
            setMyRequests(requestsData);
            // Build set of trainerIds with PENDING requests
            const pendingIds = new Set<number>(
                requestsData
                    .filter((r: any) => r.status === 'PENDING')
                    .map((r: any) => r.trainer?.userId as number)
            );
            setPendingRequests(pendingIds);
        } catch (error) {
            console.error('Failed to fetch trainers:', error);
            toast.error('Failed to load trainer data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) fetchData();
    }, [authLoading, fetchData]);

    // Re-fetch whenever the member navigates back to this tab (e.g. after trainer accepts)
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible') fetchData();
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [fetchData]);

    const handleRequestTrainer = useCallback(async (trainerId: number, trainerName: string) => {
        setRequesting(trainerId);
        try {
            const response = await api.post('/trainer-requests', {
                trainerId,
                message: requestModal?.trainer?.userId === trainerId
                    ? '' // message is sent from modal directly
                    : ''
            });
            if (response.data.alreadyAssigned) {
                toast.success(`${trainerName} is already your trainer.`);
                setShowDiscovery(false);
            } else {
                toast.success(response.data.message || `Request sent to ${trainerName}!`);
                // Optimistically mark as pending
                setPendingRequests(prev => new Set([...prev, trainerId]));
            }
            setRequestModal(null);
            setSelectedTrainer(null);
            const assignedRes = await api.get('/member/trainers/assigned');
            setAssignedTrainers(assignedRes.data || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setRequesting(null);
        }
    }, [requestModal]);

    /** Full request flow with message — called from RequestSendModal */
    const handleSendRequestWithMessage = useCallback(async (trainerId: number, trainerName: string, message: string) => {
        setRequesting(trainerId);
        try {
            const response = await api.post('/trainer-requests', { trainerId, message });
            if (response.data.alreadyAssigned) {
                toast.success(`${trainerName} is already your trainer.`);
            } else {
                toast.success(response.data.message || `Request sent to ${trainerName}!`);
                setPendingRequests(prev => new Set([...prev, trainerId]));
            }
            setRequestModal(null);
            setSelectedTrainer(null);
            setShowDiscovery(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setRequesting(null);
        }
    }, []);

    const handleUnassignTrainer = useCallback(async (trainerId: number, trainerName: string) => {
        setUnassigning(trainerId);
        setConfirmUnassign(null);
        try {
            await api.delete(`/member/trainers/${trainerId}/unassign`);
            toast.success(`${trainerName} removed from your team`);
            // re-fetch data explicitly instead of just assigned since statuses might change
            fetchData();
            setSelectedTrainer(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove trainer');
        } finally {
            setUnassigning(null);
        }
    }, [fetchData]);

    const handleCancelRequest = useCallback(async (requestId: number) => {
        setCancelling(requestId);
        try {
            await api.delete(`/trainer-requests/${requestId}/cancel`);
            toast.success('Request cancelled');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel request');
        } finally {
            setCancelling(null);
        }
    }, [fetchData]);

    // Computed stats from real data
    const avgRating = trainers.length
        ? trainers.reduce((sum, t) => sum + (t.stats?.rating || 0), 0) / trainers.length
        : 0;
    const avgSatisfactionPct = Math.round((avgRating / 5) * 100);

    const filteredAndSortedTrainers = useMemo(() => {
        let result = trainers.filter(t => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = (t.name || '').toLowerCase().includes(q) ||
                (t.skills?.some(s => s.name.toLowerCase().includes(q))) ||
                (t.specializations?.some(s => s.toLowerCase().includes(q)));

            const matchesCategory = selectedCategory === 'All Skills' ||
                (t.skills?.some(s => s.category.trim() === selectedCategory)) ||
                (t.specializations?.flatMap(s => s.split(',')).some(spec => spec.trim() === selectedCategory));

            return matchesSearch && matchesCategory;
        });

        result.sort((a, b) => {
            if (sortBy === 'rating') return (b.stats?.rating || 0) - (a.stats?.rating || 0);
            return (b.experienceYears || 0) - (a.experienceYears || 0);
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
        <>
            <motion.div
                className="trainer-page"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hero Banner */}
                <motion.div
                    className="trainer-hero"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="trainer-hero__bg" />
                    <div className="trainer-hero__pattern" />

                    <div className="trainer-hero__content">
                        <div className="trainer-hero__avatar">
                            <motion.div
                                className="trainer-hero__avatar-ring"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            />
                            <div className="trainer-hero__avatar-image">
                                {assignedTrainers.length > 0 ? <Briefcase size={32} /> : <Users size={32} />}
                            </div>
                        </div>

                        <div className="trainer-hero__info">
                            <div className="trainer-hero__name-row">
                                <h1 className="trainer-hero__name">
                                    {assignedTrainers.length > 0 ? 'Your Training Team' : 'Expert Guidance'}
                                </h1>
                                {assignedTrainers.length > 0 && (
                                    <span className="trainer-hero__badge trainer-hero__badge--active">
                                        {assignedTrainers.length} Active {assignedTrainers.length === 1 ? 'Expert' : 'Experts'}
                                    </span>
                                )}
                            </div>
                            <p className="trainer-hero__subtitle">
                                <Sparkles size={12} />
                                {assignedTrainers.length > 0
                                    ? 'Elite professionals dedicated to your fitness journey'
                                    : 'Connect with certified specialists to reach your peak performance'}
                            </p>
                            <p className="trainer-hero__tagline">
                                Real-time coaching support &amp; personalized programs
                            </p>
                        </div>

                        <div className="trainer-hero__stats">
                            <div className="trainer-hero__stat">
                                <div className="trainer-hero__stat-header">
                                    <span className="trainer-hero__stat-value">{trainers.length}</span>
                                    <Users size={12} className="trainer-hero__stat-icon" />
                                </div>
                                <span className="trainer-hero__stat-label">Professionals</span>
                            </div>
                            <div className="trainer-hero__stat">
                                <div className="trainer-hero__stat-header">
                                    <span className="trainer-hero__stat-value">
                                        {avgSatisfactionPct > 0 ? `${avgSatisfactionPct}%` : '—'}
                                    </span>
                                    <Heart size={12} className="trainer-hero__stat-icon" />
                                </div>
                                <span className="trainer-hero__stat-label">Avg Rating</span>
                            </div>
                            <div className="trainer-hero__stat">
                                <div className="trainer-hero__stat-header">
                                    <span className="trainer-hero__stat-value">
                                        {assignedTrainers.length > 0 ? assignedTrainers.length : '0'}
                                    </span>
                                    <Trophy size={12} className="trainer-hero__stat-icon" />
                                </div>
                                <span className="trainer-hero__stat-label">Assigned</span>
                            </div>
                        </div>

                        <motion.button
                            className={`trainer-hero__action-btn ${showDiscovery ? 'trainer-hero__action-btn--active' : ''}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowDiscovery(!showDiscovery)}
                        >
                            {showDiscovery ? <ArrowLeft size={16} /> : <Search size={16} />}
                            {showDiscovery ? 'Back to Team' : 'Discover Trainers'}
                        </motion.button>
                    </div>
                </motion.div>

                <div style={{ gridTemplateColumns: '1fr' }} className="trainer-layout">
                    <div>
                        <AnimatePresence mode="wait">
                            {!showDiscovery ? (
                                /* ── TEAM VIEW ── */
                                <motion.div
                                    key="assigned-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="trainer-section-header">
                                        <h3 className="trainer-section-title">
                                            <Shield size={16} color="var(--macos-accent)" />
                                            <span>My Coaching Team</span>
                                        </h3>
                                        <span className="trainer-section-subtitle">{assignedTrainers.length} Assigned</span>
                                    </div>

                                    {assignedTrainers.length > 0 ? (
                                        <div className="trainer-assigned-grid">
                                            {assignedTrainers.map((trainer) => (
                                                <div key={trainer.userId} className="trainer-card--assigned-compact">
                                                    {/* Top row: avatar + name + actions */}
                                                    <div className="trainer-assigned-compact__top">
                                                        <div className="trainer-full-avatar">
                                                            {(trainer.name || 'T').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                                                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--macos-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trainer.name}</span>
                                                                <span className="trainer-hero__badge" style={{ background: '#007AFF15', color: '#007AFF', fontSize: '9px', flexShrink: 0 }}>PT</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--macos-text-secondary)' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                    <Star size={11} fill="#FFCC00" color="#FFCC00" /> {trainer.stats?.rating}
                                                                </span>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                    <Award size={11} /> {trainer.stats?.experience}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                            <button className="macos-btn macos-btn--secondary" style={{ padding: '5px' }} title="Message" onClick={() => navigate(`/member/messages?trainerId=${trainer.userId}`)}>
                                                                <MessageSquare size={14} />
                                                            </button>
                                                            <button className="macos-btn macos-btn--secondary" style={{ padding: '5px' }} title="Details" onClick={() => setSelectedTrainer(trainer)}>
                                                                <Info size={14} />
                                                            </button>
                                                            <button className="macos-btn trainer-unassign-btn" style={{ padding: '5px' }} title="Remove" disabled={unassigning === trainer.userId} onClick={() => setConfirmUnassign({ id: trainer.userId, name: trainer.name })}>
                                                                <UserMinus size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Bio — 2-line clamp */}
                                                    <p style={{ fontSize: '11px', color: 'var(--macos-text-tertiary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                                        {trainer.bio || 'Certified specialist dedicated to your fitness goals.'}
                                                    </p>

                                                    {/* Speciality tags */}
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {[...new Set([
                                                            ...(trainer.specializations?.flatMap(s => s.split(',')).map(s => s.trim()) || []),
                                                            ...(trainer.skills?.map(s => s.category.trim()) || [])
                                                        ])].filter(cat => SKILL_CATEGORIES.includes(cat) && cat !== 'All Skills').slice(0, 3).map((tag, i) => (
                                                            <span key={i} className="skill-badge skill-badge--primary" style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Contact row */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--macos-text-tertiary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                                        <Mail size={11} />
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trainer.email}</span>
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

                                    {/* Request Tracking */}
                                    {myRequests.length > 0 && (
                                        <div style={{ marginTop: '24px' }}>
                                            <div className="trainer-section-header">
                                                <h3 className="trainer-section-title">
                                                    <Send size={16} color="var(--macos-accent)" />
                                                    <span>Request Tracking</span>
                                                </h3>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {myRequests.map(req => {
                                                    let statusColor = 'var(--macos-text-tertiary)';
                                                    if (req.status === 'ACCEPTED') statusColor = '#34C759';
                                                    if (req.status === 'PENDING') statusColor = '#FF9500';
                                                    if (req.status === 'DECLINED') statusColor = '#FF3B30';

                                                    return (
                                                        <div key={req.id} className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                            <div style={{ background: `${statusColor}22`, color: statusColor, padding: '12px', borderRadius: '12px', flexShrink: 0 }}>
                                                                {req.status === 'ACCEPTED' ? <CheckCircle2 size={24} /> :
                                                                    req.status === 'PENDING' ? <Clock size={24} /> :
                                                                        req.status === 'DECLINED' ? <X size={24} /> : <Info size={24} />}
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                                    <div>
                                                                        <h4 style={{ margin: '0 0 4px', fontSize: '14px' }}>Request to {req.trainer.name}</h4>
                                                                        <span style={{ fontSize: '11px', color: 'var(--macos-text-tertiary)' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <span className="skill-badge" style={{ background: `${statusColor}22`, color: statusColor, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'center' }}>
                                                                        {req.status}
                                                                    </span>
                                                                </div>
                                                                {req.memberMessage && (
                                                                    <div style={{ fontSize: '12px', color: 'var(--macos-text-secondary)', marginBottom: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                                                                        <strong style={{ display: 'block', marginBottom: '4px', opacity: 0.8 }}>You wrote:</strong>
                                                                        {req.memberMessage}
                                                                    </div>
                                                                )}
                                                                {req.trainerNote && (
                                                                    <div style={{ fontSize: '12px', color: 'var(--macos-text-primary)', background: req.status === 'ACCEPTED' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)', padding: '8px 12px', borderRadius: '8px', borderLeft: `3px solid ${statusColor}` }}>
                                                                        <strong style={{ display: 'block', marginBottom: '4px', opacity: 0.8 }}>Response from {req.trainer.name}:</strong>
                                                                        {req.trainerNote}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {req.status === 'PENDING' && (
                                                                <button
                                                                    className="macos-btn macos-btn--secondary"
                                                                    style={{ alignSelf: 'center', flexShrink: 0, padding: '6px 12px', fontSize: '12px' }}
                                                                    onClick={() => handleCancelRequest(req.id)}
                                                                    disabled={cancelling === req.id}
                                                                >
                                                                    {cancelling === req.id ? 'Canceling...' : 'Cancel'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recommended */}
                                    <div className="trainer-section-header" style={{ marginTop: '16px' }}>
                                        <h3 className="trainer-section-title">
                                            <Activity size={16} color="var(--macos-purple)" />
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
                                                style={{ padding: '12px' }}
                                            >
                                                <div className="trainer-card__header" style={{ marginBottom: '8px', gap: '10px' }}>
                                                    <div className="trainer-card__avatar" style={{ width: '40px', height: '40px', fontSize: '16px', borderRadius: '10px', flexShrink: 0 }}>
                                                        {(trainer.name || 'T').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="trainer-card__info">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <h3 style={{ fontSize: '13px', margin: 0 }}>{trainer.name}</h3>
                                                            <span className="trainer-hero__badge" style={{ background: '#007AFF10', color: '#007AFF', fontSize: '9px', padding: '1px 5px' }}>PT</span>
                                                        </div>
                                                        <div className="trainer-card__rating" style={{ fontSize: '11px', marginTop: '2px' }}>
                                                            <Star size={10} fill="#FFCC00" color="#FFCC00" />
                                                            <span>{trainer.stats?.rating}</span>
                                                            <span style={{ opacity: 0.4 }}>•</span>
                                                            <span>{trainer.stats?.experience}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '8px' }}>
                                                    {[...new Set([
                                                        ...(trainer.specializations?.flatMap(s => s.split(',')).map(s => s.trim()) || []),
                                                        ...(trainer.skills?.map(s => s.category.trim()) || [])
                                                    ])].filter(cat => SKILL_CATEGORIES.includes(cat) && cat !== 'All Skills').slice(0, 2).map((tag, i) => (
                                                        <span key={i} className="skill-badge skill-badge--secondary" style={{ fontSize: '10px', padding: '2px 7px' }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <p style={{ fontSize: '11px', color: 'var(--macos-text-tertiary)', margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                                                    {trainer.bio}
                                                </p>

                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    {pendingRequests.has(trainer.userId) ? (
                                                        <button
                                                            className="macos-btn macos-btn--secondary"
                                                            style={{ flex: 1, padding: '6px', fontSize: '11px', color: '#FF9500', borderColor: '#FF950044' }}
                                                            disabled
                                                        >
                                                            <Clock size={11} /> Pending…
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="macos-btn macos-btn--primary"
                                                            style={{ flex: 1, padding: '6px', fontSize: '11px' }}
                                                            onClick={() => setRequestModal({ trainer })}
                                                            disabled={requesting === trainer.userId}
                                                        >
                                                            {requesting === trainer.userId ? 'Sending…' : 'Add to My Team'}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="macos-btn macos-btn--secondary"
                                                        style={{ padding: '6px' }}
                                                        title="View Details"
                                                        onClick={() => setSelectedTrainer(trainer)}
                                                    >
                                                        <Info size={13} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                /* ── DISCOVERY VIEW ── */
                                <motion.div
                                    key="discovery-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="trainer-section-header">
                                        <h3 className="trainer-section-title">
                                            <Globe size={16} color="var(--macos-accent)" />
                                            <span>Professional Directory</span>
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--macos-text-tertiary)' }}>
                                                Showing {filteredAndSortedTrainers.length} of {trainers.length}
                                            </span>
                                            <div className="macos-select-wrapper" style={{ minWidth: '140px' }}>
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value as any)}
                                                    className="macos-btn macos-btn--secondary"
                                                    style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}
                                                >
                                                    <option value="rating">Sort: Rating</option>
                                                    <option value="experience">Sort: Experience</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="trainer-discovery__controls" style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--macos-bg-glass)', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--macos-border)' }}>
                                        <div className="trainer-search-wrapper" style={{ flex: '0 0 320px', margin: 0 }}>
                                            <Search size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search by name, skill, or goal..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                style={{ background: 'rgba(255,255,255,0.05)' }}
                                            />
                                        </div>
                                        <div className="macos-hide-scrollbar" style={{ flex: 1, overflowX: 'auto', display: 'flex', gap: '8px', padding: '2px 0' }}>
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

                                    {filteredAndSortedTrainers.length === 0 ? (
                                        <div className="trainer-empty-state">
                                            <Search size={32} className="trainer-empty-state__icon" />
                                            <div className="trainer-empty-state__title">No trainers found</div>
                                            <p className="trainer-empty-state__body">Try a different search term or category.</p>
                                            <button
                                                className="macos-btn macos-btn--secondary"
                                                onClick={() => { setSearchQuery(''); setSelectedCategory('All Skills'); }}
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="trainer-grid">
                                            {filteredAndSortedTrainers.map((trainer) => {
                                                const isAssigned = assignedTrainers.some(at => at.userId === trainer.userId);
                                                return (
                                                    <motion.div
                                                        key={trainer.userId}
                                                        layout
                                                        variants={cardVariants}
                                                        whileHover="hover"
                                                        className={`glass-card trainer-card ${isAssigned ? 'trainer-card--assigned' : ''}`}
                                                    >
                                                        {isAssigned && (
                                                            <div className="trainer-assigned-badge">
                                                                <CheckCircle2 size={10} fill="currentColor" /> Your Trainer
                                                            </div>
                                                        )}

                                                        <div className="trainer-card__header">
                                                            <div className="trainer-card__avatar">
                                                                {(trainer.name || 'T').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="trainer-card__info">
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <h3 style={{ margin: 0 }}>{trainer.name}</h3>
                                                                    <span className="trainer-hero__badge" style={{ background: '#007AFF15', color: '#007AFF', fontSize: '10px' }}>PT</span>
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
                                                            <div className="skill-section-label" style={{ fontSize: '10px', color: 'var(--macos-text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                Core Expertise
                                                            </div>
                                                            <div className="skill-tags">
                                                                {[...new Set([
                                                                    ...(trainer.specializations?.flatMap(s => s.split(',')).map(s => s.trim()) || []),
                                                                    ...(trainer.skills?.map(s => s.category.trim()) || [])
                                                                ])].filter(cat => SKILL_CATEGORIES.includes(cat) && cat !== 'All Skills').map((tag, idx) => (
                                                                    <div key={idx} className="skill-badge skill-badge--secondary">{tag}</div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', display: 'flex', gap: '8px' }}>
                                                            {isAssigned ? (
                                                                <button className="macos-btn macos-btn--secondary" style={{ flex: 1, padding: '8px', fontSize: '13px' }} disabled>
                                                                    <CheckCircle2 size={13} /> Your Trainer
                                                                </button>
                                                            ) : pendingRequests.has(trainer.userId) ? (
                                                                <button className="macos-btn macos-btn--secondary" style={{ flex: 1, padding: '8px', fontSize: '13px', color: '#FF9500', borderColor: '#FF950044' }} disabled>
                                                                    <Clock size={13} /> Request Pending
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="macos-btn macos-btn--primary"
                                                                    style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                                                                    onClick={() => setRequestModal({ trainer })}
                                                                    disabled={requesting === trainer.userId}
                                                                >
                                                                    {requesting === trainer.userId ? 'Sending…' : 'Request Trainer'}
                                                                </button>
                                                            )}
                                                            <button
                                                                className="macos-btn macos-btn--secondary"
                                                                style={{ padding: '8px' }}
                                                                title="View Details"
                                                                onClick={() => setSelectedTrainer(trainer)}
                                                            >
                                                                <Info size={16} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Trainer Detail Modal */}
            {selectedTrainer && (
                <TrainerDetailModal
                    trainer={selectedTrainer}
                    isAssigned={assignedTrainers.some(at => at.userId === selectedTrainer.userId)}
                    requesting={requesting === selectedTrainer.userId}
                    onClose={() => setSelectedTrainer(null)}
                    onRequest={handleRequestTrainer}
                    onUnassign={(id, name) => setConfirmUnassign({ id, name })}
                />
            )}

            {/* Send Request Modal */}
            <AnimatePresence>
                {requestModal && (
                    <SendRequestModal
                        trainer={requestModal.trainer}
                        sending={requesting === requestModal.trainer.userId}
                        onSend={(msg) => handleSendRequestWithMessage(requestModal.trainer.userId, requestModal.trainer.name, msg)}
                        onClose={() => setRequestModal(null)}
                    />
                )}
            </AnimatePresence>

            {/* Confirm Unassign Dialog */}
            <AnimatePresence>
                {confirmUnassign && (
                    <motion.div
                        className="tdm-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmUnassign(null)}
                    >
                        <motion.div
                            className="tdm-confirm"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="tdm-confirm__icon">
                                <UserMinus size={24} color="#FF3B30" />
                            </div>
                            <h3 className="tdm-confirm__title">Remove Trainer?</h3>
                            <p className="tdm-confirm__body">
                                Remove <strong>{confirmUnassign.name}</strong> from your team? You can add them back anytime.
                            </p>
                            <div className="tdm-confirm__actions">
                                <button
                                    className="macos-btn macos-btn--secondary"
                                    onClick={() => setConfirmUnassign(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="macos-btn tdm-footer__unassign"
                                    disabled={unassigning === confirmUnassign.id}
                                    onClick={() => handleUnassignTrainer(confirmUnassign.id, confirmUnassign.name)}
                                >
                                    {unassigning === confirmUnassign.id ? 'Removing…' : 'Remove'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MyTrainer;
