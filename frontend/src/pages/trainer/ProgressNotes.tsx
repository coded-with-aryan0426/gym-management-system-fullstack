import React, { useState, useMemo } from 'react';
import { 
    Search, Plus, Download, ChevronDown, Trash2, Edit2, 
    Paperclip, X, Calendar, Clock, Target, TrendingUp, 
    ChevronRight, Filter, Image, FileText, Video, MoreVertical,
    Star, Award, AlertTriangle, CheckCircle, Activity, Zap,
    User, BarChart2, Camera, MessageSquare, Tag
} from 'lucide-react';
import './ProgressNotes.css';

interface ProgressNote {
    id: number;
    member: { 
        name: string; 
        avatar: string;
        goal: string;
        startDate: string;
    };
    date: string;
    time: string;
    sessionType: string;
    category: 'strength' | 'cardio' | 'flexibility' | 'nutrition' | 'general';
    mood: 'excellent' | 'good' | 'average' | 'struggling';
    content: string;
    highlights?: string[];
    concerns?: string[];
    goals?: string[];
    stats: { label: string; value: string; change?: string; trend?: 'up' | 'down' | 'neutral' }[];
    attachments: { type: 'photo' | 'video' | 'document'; name: string }[];
    tags: string[];
    followUp?: string;
    private: boolean;
}

const ProgressNotes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterMember, setFilterMember] = useState('All Members');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterTime, setFilterTime] = useState('This Month');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<ProgressNote | null>(null);
    const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
    const [showFilters, setShowFilters] = useState(false);

    const notes: ProgressNote[] = [
        {
            id: 1,
            member: { 
                name: 'Sarah Wilson', 
                avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=DC2626&color=fff',
                goal: 'Build muscle & strength',
                startDate: 'Jan 15, 2024'
            },
            date: 'March 25, 2024',
            time: '2:30 PM',
            sessionType: 'Upper Body Strength',
            category: 'strength',
            mood: 'excellent',
            content: 'Great progress on squats today! Increased weight from 135lbs to 155lbs with excellent form. Sarah is showing consistent improvement in leg strength. Her dedication is really paying off.',
            highlights: ['Hit new squat PR at 155lbs', 'Perfect form maintained', 'Increased confidence'],
            goals: ['Progress to 165lbs by next month', 'Add hip mobility work'],
            stats: [
                { label: 'Weight', value: '78 kg', change: '-2kg', trend: 'down' },
                { label: 'Body Fat', value: '18%', change: '-1.5%', trend: 'down' },
                { label: 'Squat PR', value: '155 lbs', change: '+20lbs', trend: 'up' }
            ],
            attachments: [
                { type: 'photo', name: 'Form Check Photo' },
                { type: 'document', name: 'Workout Log' }
            ],
            tags: ['PR', 'strength', 'legs'],
            followUp: 'Check squat depth next session',
            private: false
        },
        {
            id: 2,
            member: { 
                name: 'Mike Johnson', 
                avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=3B82F6&color=fff',
                goal: 'Weight loss & endurance',
                startDate: 'Feb 1, 2024'
            },
            date: 'March 22, 2024',
            time: '10:00 AM',
            sessionType: 'Cardio HIIT',
            category: 'cardio',
            mood: 'struggling',
            content: 'Struggled with HIIT today. Mike mentioned work stress affecting sleep. Adjusted rest periods to 90 seconds instead of 60. Need to monitor energy levels.',
            concerns: ['Low energy today', 'Sleep issues reported', 'Work stress affecting performance'],
            goals: ['Focus on steady state cardio twice this week', 'Improve sleep hygiene'],
            stats: [
                { label: 'Avg HR', value: '145 bpm', trend: 'neutral' },
                { label: 'Max HR', value: '178 bpm', trend: 'neutral' },
                { label: 'Calories', value: '420', change: '-80', trend: 'down' }
            ],
            attachments: [],
            tags: ['cardio', 'adjustment', 'recovery'],
            followUp: 'Check in about sleep at next session',
            private: true
        },
        {
            id: 3,
            member: { 
                name: 'Emma Davis', 
                avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=10B981&color=fff',
                goal: 'Overall fitness & flexibility',
                startDate: 'Dec 5, 2023'
            },
            date: 'March 20, 2024',
            time: '4:00 PM',
            sessionType: 'Full Body Circuit',
            category: 'strength',
            mood: 'excellent',
            content: 'Excellent session! Completed full circuit with no breaks. Emma is ready to move to advanced program. Her consistency over the past 3 months has been impressive.',
            highlights: ['Completed full circuit without rest', 'Ready for advanced program', '3-month milestone achieved'],
            stats: [
                { label: 'Reps', value: '120', change: '+15', trend: 'up' },
                { label: 'Time', value: '45 min', change: '-5min', trend: 'up' },
                { label: 'Intensity', value: 'High', trend: 'up' }
            ],
            attachments: [
                { type: 'video', name: 'Circuit Recording' }
            ],
            tags: ['milestone', 'advancement', 'full-body'],
            private: false
        },
        {
            id: 4,
            member: { 
                name: 'James Wilson', 
                avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=F59E0B&color=fff',
                goal: 'Rehabilitation & mobility',
                startDate: 'Mar 1, 2024'
            },
            date: 'March 18, 2024',
            time: '11:30 AM',
            sessionType: 'Mobility & Rehab',
            category: 'flexibility',
            mood: 'good',
            content: 'Good progress on shoulder mobility. Range of motion improved by 15 degrees. James is following home exercises consistently. Continue current protocol.',
            highlights: ['15° improvement in shoulder ROM', 'Consistent with home exercises'],
            stats: [
                { label: 'Shoulder ROM', value: '135°', change: '+15°', trend: 'up' },
                { label: 'Pain Level', value: '3/10', change: '-2', trend: 'down' }
            ],
            attachments: [
                { type: 'photo', name: 'ROM Assessment' }
            ],
            tags: ['rehab', 'mobility', 'shoulder'],
            followUp: 'Re-assess in 2 weeks',
            private: false
        }
    ];

    const members = ['All Members', 'Sarah Wilson', 'Mike Johnson', 'Emma Davis', 'James Wilson'];
    const categories = [
        { value: 'all', label: 'All Categories', icon: Target },
        { value: 'strength', label: 'Strength', icon: Zap },
        { value: 'cardio', label: 'Cardio', icon: Activity },
        { value: 'flexibility', label: 'Flexibility', icon: Target },
        { value: 'nutrition', label: 'Nutrition', icon: Target },
        { value: 'general', label: 'General', icon: FileText }
    ];

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesMember = filterMember === 'All Members' || note.member.name === filterMember;
            const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
            const matchesSearch = searchQuery === '' || 
                note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesMember && matchesCategory && matchesSearch;
        });
    }, [notes, filterMember, filterCategory, searchQuery]);

    const stats = useMemo(() => ({
        totalNotes: notes.length,
        thisWeek: notes.filter(n => n.date.includes('March 2')).length,
        membersTracked: new Set(notes.map(n => n.member.name)).size,
        prsRecorded: notes.filter(n => n.tags.includes('PR')).length
    }), [notes]);

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case 'excellent': return <Star size={12} className="mood-icon mood-icon--excellent" />;
            case 'good': return <CheckCircle size={12} className="mood-icon mood-icon--good" />;
            case 'average': return <Activity size={12} className="mood-icon mood-icon--average" />;
            case 'struggling': return <AlertTriangle size={12} className="mood-icon mood-icon--struggling" />;
            default: return null;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'strength': return '#8B5CF6';
            case 'cardio': return '#EF4444';
            case 'flexibility': return '#10B981';
            case 'nutrition': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getAttachmentIcon = (type: string) => {
        switch (type) {
            case 'photo': return <Image size={12} />;
            case 'video': return <Video size={12} />;
            case 'document': return <FileText size={12} />;
            default: return <Paperclip size={12} />;
        }
    };

    return (
        <div className="progress-notes">
            <div className="progress-notes__header">
                <div className="progress-notes__header-content">
                    <div className="progress-notes__title-section">
                        <h1>Progress Notes</h1>
                        <span className="progress-notes__subtitle">Track and document member progress</span>
                    </div>

                    <div className="progress-notes__header-stats">
                        <div className="progress-notes__header-stat">
                            <span className="progress-notes__header-stat-value">{stats.totalNotes}</span>
                            <span className="progress-notes__header-stat-label">Total Notes</span>
                        </div>
                        <div className="progress-notes__header-stat">
                            <span className="progress-notes__header-stat-value">{stats.thisWeek}</span>
                            <span className="progress-notes__header-stat-label">This Week</span>
                        </div>
                        <div className="progress-notes__header-stat progress-notes__header-stat--highlight">
                            <span className="progress-notes__header-stat-value">{stats.membersTracked}</span>
                            <span className="progress-notes__header-stat-label">Members</span>
                        </div>
                        <div className="progress-notes__header-stat">
                            <span className="progress-notes__header-stat-value">{stats.prsRecorded}</span>
                            <span className="progress-notes__header-stat-label">PRs</span>
                        </div>
                    </div>

                    <button className="progress-notes__add-btn" onClick={() => setIsModalOpen(true)}>
                        <Plus size={14} />
                        New Note
                    </button>
                </div>
            </div>

            <div className="progress-notes__content">
                <div className="progress-notes__toolbar">
                    <div className="progress-notes__search">
                        <Search size={14} />
                        <input 
                            type="text" 
                            placeholder="Search notes, members, tags..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="progress-notes__quick-filters">
                        {categories.slice(0, 4).map(cat => (
                            <button
                                key={cat.value}
                                className={`progress-notes__quick-filter ${filterCategory === cat.value ? 'active' : ''}`}
                                onClick={() => setFilterCategory(cat.value)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="progress-notes__toolbar-actions">
                        <div className="progress-notes__filter-dropdown">
                            <User size={12} />
                            <select value={filterMember} onChange={(e) => setFilterMember(e.target.value)}>
                                {members.map(m => <option key={m}>{m}</option>)}
                            </select>
                            <ChevronDown size={12} />
                        </div>

                        <div className="progress-notes__filter-dropdown">
                            <Calendar size={12} />
                            <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)}>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>All Time</option>
                            </select>
                            <ChevronDown size={12} />
                        </div>

                        <button className="progress-notes__export-btn">
                            <Download size={12} />
                            Export
                        </button>
                    </div>
                </div>

                <div className="progress-notes__timeline">
                    {filteredNotes.map(note => (
                        <div 
                            key={note.id} 
                            className={`progress-note ${note.private ? 'progress-note--private' : ''}`}
                            onClick={() => setSelectedNote(note)}
                        >
                            <div className="progress-note__indicator">
                                <div 
                                    className="progress-note__dot" 
                                    style={{ background: getCategoryColor(note.category) }}
                                />
                                <div className="progress-note__line" />
                            </div>

                            <div className="progress-note__card">
                                <div className="progress-note__header">
                                    <div className="progress-note__member">
                                        <img src={note.member.avatar} alt={note.member.name} />
                                        <div className="progress-note__member-info">
                                            <h3>{note.member.name}</h3>
                                            <span className="progress-note__member-goal">{note.member.goal}</span>
                                        </div>
                                    </div>
                                    <div className="progress-note__header-right">
                                        <div className="progress-note__mood">
                                            {getMoodIcon(note.mood)}
                                            <span>{note.mood}</span>
                                        </div>
                                        <div className="progress-note__date">
                                            <Calendar size={11} />
                                            {note.date}
                                        </div>
                                        <button className="progress-note__menu-btn">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="progress-note__session">
                                    <span 
                                        className="progress-note__category"
                                        style={{ background: `${getCategoryColor(note.category)}20`, color: getCategoryColor(note.category) }}
                                    >
                                        {note.category}
                                    </span>
                                    <span className="progress-note__session-type">{note.sessionType}</span>
                                    <span className="progress-note__time">
                                        <Clock size={11} /> {note.time}
                                    </span>
                                </div>

                                <p className="progress-note__text">{note.content}</p>

                                {note.highlights && note.highlights.length > 0 && (
                                    <div className="progress-note__highlights">
                                        <span className="progress-note__section-label">
                                            <Award size={11} /> Highlights
                                        </span>
                                        <ul>
                                            {note.highlights.map((h, i) => (
                                                <li key={i}>{h}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {note.concerns && note.concerns.length > 0 && (
                                    <div className="progress-note__concerns">
                                        <span className="progress-note__section-label">
                                            <AlertTriangle size={11} /> Concerns
                                        </span>
                                        <ul>
                                            {note.concerns.map((c, i) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {note.stats.length > 0 && (
                                    <div className="progress-note__stats">
                                        {note.stats.map((stat, i) => (
                                            <div key={i} className="progress-note__stat">
                                                <span className="progress-note__stat-label">{stat.label}</span>
                                                <div className="progress-note__stat-row">
                                                    <span className="progress-note__stat-value">{stat.value}</span>
                                                    {stat.change && (
                                                        <span className={`progress-note__stat-change progress-note__stat-change--${stat.trend}`}>
                                                            {stat.trend === 'up' ? <TrendingUp size={10} /> : stat.trend === 'down' ? <TrendingUp size={10} style={{ transform: 'rotate(180deg)' }} /> : null}
                                                            {stat.change}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="progress-note__footer">
                                    <div className="progress-note__tags">
                                        {note.tags.map((tag, i) => (
                                            <span key={i} className="progress-note__tag">
                                                <Tag size={9} /> {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {note.attachments.length > 0 && (
                                        <div className="progress-note__attachments">
                                            {note.attachments.map((att, i) => (
                                                <button key={i} className="progress-note__attachment">
                                                    {getAttachmentIcon(att.type)}
                                                    {att.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {note.followUp && (
                                    <div className="progress-note__followup">
                                        <MessageSquare size={11} />
                                        <strong>Follow-up:</strong> {note.followUp}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredNotes.length === 0 && (
                        <div className="progress-notes__empty">
                            <FileText size={32} />
                            <h3>No notes found</h3>
                            <p>Try adjusting your filters or add a new note</p>
                        </div>
                    )}
                </div>

                <button className="progress-notes__load-more">
                    Load More Notes
                </button>
            </div>

            {isModalOpen && (
                <div className="progress-notes__modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="progress-notes__modal" onClick={e => e.stopPropagation()}>
                        <div className="progress-notes__modal-header">
                            <h2>Add Progress Note</h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="progress-notes__modal-body">
                            <div className="progress-notes__form-field">
                                <label>Select Member *</label>
                                <select>
                                    <option>Search or select member...</option>
                                    {members.slice(1).map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>

                            <div className="progress-notes__form-row">
                                <div className="progress-notes__form-field">
                                    <label>Category</label>
                                    <select>
                                        {categories.slice(1).map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="progress-notes__form-field">
                                    <label>Session Type</label>
                                    <input type="text" placeholder="e.g., Upper Body Strength" />
                                </div>
                            </div>

                            <div className="progress-notes__form-row">
                                <div className="progress-notes__form-field">
                                    <label>Session Date *</label>
                                    <input type="date" />
                                </div>
                                <div className="progress-notes__form-field">
                                    <label>Member Mood</label>
                                    <select>
                                        <option value="excellent">Excellent - High energy</option>
                                        <option value="good">Good - Normal</option>
                                        <option value="average">Average - Some fatigue</option>
                                        <option value="struggling">Struggling - Low energy</option>
                                    </select>
                                </div>
                            </div>

                            <div className="progress-notes__form-field">
                                <label>Session Notes *</label>
                                <textarea rows={4} placeholder="Describe the session, observations, progress made..." />
                            </div>

                            <div className="progress-notes__form-field">
                                <label>Highlights (one per line)</label>
                                <textarea rows={2} placeholder="Hit new PR&#10;Improved form&#10;Increased confidence" />
                            </div>

                            <div className="progress-notes__form-field">
                                <label>Concerns (one per line)</label>
                                <textarea rows={2} placeholder="Low energy&#10;Form needs work&#10;Missed sessions" />
                            </div>

                            <div className="progress-notes__measurements">
                                <label>Measurements (Optional)</label>
                                <div className="progress-notes__measurements-grid">
                                    <div className="progress-notes__measurement-input">
                                        <input type="text" placeholder="Value" />
                                        <span>Weight (kg)</span>
                                    </div>
                                    <div className="progress-notes__measurement-input">
                                        <input type="text" placeholder="Value" />
                                        <span>Body Fat %</span>
                                    </div>
                                    <div className="progress-notes__measurement-input">
                                        <input type="text" placeholder="Value" />
                                        <span>Custom PR</span>
                                    </div>
                                </div>
                            </div>

                            <div className="progress-notes__form-row">
                                <div className="progress-notes__form-field">
                                    <label>Tags (comma separated)</label>
                                    <input type="text" placeholder="PR, strength, legs" />
                                </div>
                                <div className="progress-notes__form-field">
                                    <label>Follow-up Reminder</label>
                                    <input type="text" placeholder="What to check next session" />
                                </div>
                            </div>

                            <div className="progress-notes__form-field">
                                <label>Attachments</label>
                                <div className="progress-notes__attachment-upload">
                                    <Camera size={16} />
                                    <span>Add photos, videos, or documents</span>
                                </div>
                            </div>

                            <div className="progress-notes__form-checkbox">
                                <input type="checkbox" id="private-note" />
                                <label htmlFor="private-note">Private note (only visible to you)</label>
                            </div>
                        </div>
                        <div className="progress-notes__modal-footer">
                            <button className="progress-notes__modal-cancel" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="progress-notes__modal-save">
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressNotes;
