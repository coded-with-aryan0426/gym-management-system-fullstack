import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Calendar, Award, TrendingUp, Search, Dumbbell, Zap, Flame, Activity } from 'lucide-react';
import { memberProgressApi } from '../../../../services/api';
import '../PRHistoryStyles.css';

interface PersonalBest {
    id: number;
    exercise: string;
    weightValue: number;
    reps: number | null;
    unit: string;
    recordDate: string;
    category: string;
}

interface PRHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberId: number;
}

const PRHistoryModal: React.FC<PRHistoryModalProps> = ({ isOpen, onClose, memberId }) => {
    const [prHistory, setPrHistory] = useState<PersonalBest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    useEffect(() => {
        if (isOpen && memberId) {
            fetchPRHistory();
        }
    }, [isOpen, memberId]);

    const fetchPRHistory = async () => {
        try {
            setLoading(true);
            const data = await memberProgressApi.getPersonalBests(memberId);
            setPrHistory(data as unknown as PersonalBest[]);
        } catch (error) {
            console.error('Error fetching PR history:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['ALL', 'PUSH', 'PULL', 'LEGS', 'CORE', 'CARDIO'];

    const filteredPRs = prHistory.filter(pr => {
        const matchesSearch = pr.exercise.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || pr.category === filterCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());

    const getIcon = (cat: string) => {
        switch (cat?.toUpperCase()) {
            case 'PUSH':   return <Zap size={16} />;
            case 'PULL':   return <Flame size={16} />;
            case 'LEGS':   return <Dumbbell size={16} />;
            case 'CORE':   return <Activity size={16} />;
            case 'CARDIO': return <TrendingUp size={16} />;
            default:       return <Award size={16} />;
        }
    };

    return (
        <AnimatePresence>
        {isOpen && (
        <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div 
                className="modal-content modal-premium-form modal-lg"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header-premium">
                    <div className="header-badge">
                        <Trophy size={20} color="#FFD700" />
                    </div>
                    <div className="header-info">
                        <h2>Personal Records History</h2>
                        <p>Your complete journey of strength and performance</p>
                    </div>
                    <button className="close-btn-circle" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="pr-history-filters">
                    <div className="search-bar-mini">
                        <Search size={14} />
                        <input 
                            type="text" 
                            placeholder="Search exercise..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-pills">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                className={`filter-pill ${filterCategory === cat ? 'active' : ''}`}
                                onClick={() => setFilterCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modal-body-compact pr-history-list">
                    {loading ? (
                        <div className="loading-state-mini">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                <TrendingUp size={24} />
                            </motion.div>
                            <span>Fetching records...</span>
                        </div>
                    ) : filteredPRs.length > 0 ? (
                        <div className="pr-records-grid">
                            {filteredPRs.map((pr, idx) => (
                                <motion.div 
                                    key={`pr-${idx}-${pr.id ?? ''}`} 
                                    className="pr-history-card"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                    <div className={`pr-cat-icon ${pr.category?.toLowerCase() || 'push'}`}>
                                        {getIcon(pr.category)}
                                    </div>
                                    <div className="pr-main-info">
                                        <h4>{pr.exercise}</h4>
                                        <div className="pr-meta-row">
                                            <span className="pr-date">
                                                <Calendar size={10} />
                                                {new Date(pr.recordDate).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </span>
                                            <span className="pr-cat-tag">{pr.category}</span>
                                        </div>
                                    </div>
                                    <div className="pr-value-box">
                                        <span className="number">{pr.weightValue}</span>
                                        <span className="unit">{pr.unit}</span>
                                        {pr.reps && <span className="reps">× {pr.reps}</span>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-v2">
                            <Dumbbell size={40} opacity={0.2} />
                            <p>No records found matching your filters</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
        )}
        </AnimatePresence>
    );
};

export default PRHistoryModal;
