import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Download, ChevronDown, Trash2, Edit2,
    Paperclip, X, Calendar, Clock, Target, TrendingUp,
    ChevronRight, Filter, Image, FileText, Video, MoreVertical,
    Star, Award, AlertTriangle, CheckCircle, Activity, Zap,
    User, BarChart2, Camera, MessageSquare, Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import trainerApi from '../../services/trainerApi';
import type { ProgressNote as IProgressNote, TrainerMember } from '../../services/trainerApi';
import './ProgressNotes.css';

const ProgressNotes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterMember, setFilterMember] = useState('All Members');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterTime, setFilterTime] = useState('This Month');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
    const [showFilters, setShowFilters] = useState(false);

    const [notes, setNotes] = useState<IProgressNote[]>([]);
    const [membersList, setMembersList] = useState<TrainerMember[]>([]);
    const [loading, setLoading] = useState(true);

    const [newNote, setNewNote] = useState({
        memberId: '',
        note: '',
        category: 'general'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [notesData, membersData] = await Promise.all([
                    trainerApi.getAllNotes(),
                    trainerApi.getMyMembers()
                ]);
                setNotes(notesData);
                setMembersList(membersData);
            } catch (err) {
                console.error('Failed to fetch notes data:', err);
                toast.error('Failed to load notes');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddNote = async () => {
        if (!newNote.memberId || !newNote.note) {
            toast.error('Please select a member and enter a note');
            return;
        }

        try {
            const saved = await trainerApi.addMemberNote(Number(newNote.memberId), newNote.note);
            setNotes(prev => [saved, ...prev]);
            setIsModalOpen(false);
            setNewNote({ memberId: '', note: '', category: 'general' });
            toast.success('Note added successfully');
        } catch (err) {
            console.error('Failed to add note:', err);
            toast.error('Failed to add note');
        }
    };
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
            const memberName = membersList.find(m => m.userId === note.memberId)?.fullName || 'Unknown Member';
            const matchesMember = filterMember === 'All Members' || memberName === filterMember;
            const matchesCategory = filterCategory === 'all' || (note as any).category === filterCategory;
            const content = note.note || '';
            const matchesSearch = searchQuery === '' ||
                content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                memberName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesMember && matchesCategory && matchesSearch;
        });
    }, [notes, membersList, filterMember, filterCategory, searchQuery]);

    const stats = useMemo(() => ({
        totalNotes: notes.length,
        thisWeek: notes.filter(n => {
            const date = new Date(n.createdAt);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
        }).length,
        membersTracked: new Set(notes.map(n => n.memberId)).size,
        prsRecorded: 0
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
                                <option>All Members</option>
                                {membersList.map(m => <option key={m.userId} value={m.fullName}>{m.fullName}</option>)}
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
                            className={`progress-note ${note.private === true ? 'progress-note--private' : ''}`}
                            onClick={() => setSelectedNote(note)}
                        >
                            <div className="progress-note__indicator">
                                <div
                                    className="progress-note__dot"
                                    style={{ background: getCategoryColor(note.category || 'general') }}
                                />
                                <div className="progress-note__line" />
                            </div>

                            <div className="progress-note__card">
                                <div className="progress-note__header">
                                    <div className="progress-note__member">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${membersList.find(m => m.userId === note.memberId)?.fullName || 'U'}&background=DC2626&color=fff&size=40`}
                                            alt="member"
                                        />
                                        <div className="progress-note__member-info">
                                            <h3>{membersList.find(m => m.userId === note.memberId)?.fullName || 'Unknown Member'}</h3>
                                            <span className="progress-note__member-goal">Goal Tracking</span>
                                        </div>
                                    </div>
                                    <div className="progress-note__header-right">
                                        <div className="progress-note__mood">
                                            {getMoodIcon((note as any).mood || 'good')}
                                            <span>{(note as any).mood || 'good'}</span>
                                        </div>
                                        <div className="progress-note__date">
                                            <Calendar size={11} />
                                            {format(parseISO(note.createdAt), 'MMM d, yyyy')}
                                        </div>
                                        <button className="progress-note__menu-btn">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="progress-note__session">
                                    <span
                                        className="progress-note__category"
                                        style={{ background: `${getCategoryColor((note as any).category || 'general')}20`, color: getCategoryColor((note as any).category || 'general') }}
                                    >
                                        {(note as any).category || 'General'}
                                    </span>
                                    <span className="progress-note__session-type">{(note as any).sessionType || 'Training Session'}</span>
                                    <span className="progress-note__time">
                                        <Clock size={11} /> {format(parseISO(note.createdAt), 'h:mm a')}
                                    </span>
                                </div>

                                <p className="progress-note__text">{note.note}</p>

                                {(note as any).highlights && (note as any).highlights.length > 0 && (
                                    <div className="progress-note__highlights">
                                        <span className="progress-note__section-label">
                                            <Award size={11} /> Highlights
                                        </span>
                                        <ul>
                                            {(note as any).highlights.map((h: string, i: number) => (
                                                <li key={i}>{h}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {(note as any).concerns && (note as any).concerns.length > 0 && (
                                    <div className="progress-note__concerns">
                                        <span className="progress-note__section-label">
                                            <AlertTriangle size={11} /> Concerns
                                        </span>
                                        <ul>
                                            {(note as any).concerns.map((c: string, i: number) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {(note as any).stats && (note as any).stats.length > 0 && (
                                    <div className="progress-note__stats">
                                        {(note as any).stats.map((stat: any, i: number) => (
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
                                        {((note as any).tags || []).map((tag: string, i: number) => (
                                            <span key={i} className="progress-note__tag">
                                                <Tag size={9} /> {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {(note as any).attachments && (note as any).attachments.length > 0 && (
                                        <div className="progress-note__attachments">
                                            {(note as any).attachments.map((att: any, i: number) => (
                                                <button key={i} className="progress-note__attachment">
                                                    {getAttachmentIcon(att.type)}
                                                    {att.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {note.followUp && note.followUp.length > 0 && (
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
                                <select
                                    value={newNote.memberId}
                                    onChange={(e) => setNewNote(prev => ({ ...prev, memberId: e.target.value }))}
                                >
                                    <option value="">Search or select member...</option>
                                    {membersList.map(m => <option key={m.userId} value={m.userId}>{m.fullName}</option>)}
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
