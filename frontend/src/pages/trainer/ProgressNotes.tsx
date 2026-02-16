import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Download, ChevronDown, Trash2, Edit2,
    Paperclip, X, Calendar, Clock, Target, TrendingUp,
    ChevronRight, Filter, Image, FileText, Video, MoreVertical,
    Star, Award, AlertTriangle, CheckCircle, Activity, Zap,
    User, BarChart2, Camera, MessageSquare, Tag, Loader
} from 'lucide-react';
import './ProgressNotes.css';
import { progressNoteApi, type ProgressNoteDTO } from '../../services/progressNoteApi';
import { trainerApi, type TrainerMember } from '../../services/trainerApi';

const ProgressNotes: React.FC = () => {
    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Data State
    const [notes, setNotes] = useState<ProgressNoteDTO[]>([]);
    const [members, setMembers] = useState<TrainerMember[]>([]);

    // Filters
    const [filterMember, setFilterMember] = useState('All Members');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterTime, setFilterTime] = useState('All Time');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<ProgressNoteDTO | null>(null);

    // Form State
    const initialFormState: Partial<ProgressNoteDTO> = {
        member: { name: '', goal: '' },
        category: 'general',
        sessionType: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        mood: 'good',
        content: '',
        highlights: [],
        concerns: [],
        stats: [],
        tags: [],
        attachments: [],
        private: false,
        followUp: ''
    };
    const [formData, setFormData] = useState<Partial<ProgressNoteDTO>>(initialFormState);
    const [formHighlights, setFormHighlights] = useState('');
    const [formConcerns, setFormConcerns] = useState('');
    const [formTags, setFormTags] = useState('');
    const [selectedMemberName, setSelectedMemberName] = useState('');

    // Note Templates
    const noteTemplates = [
        { label: 'Select a template...', value: '' },
        {
            label: 'Strength Session',
            value: 'strength',
            data: { category: 'strength', sessionType: 'Strength Training', content: 'Completed strength training session.\n\nExercises performed:\n- \n- \n- \n\nForm observations: \nWeight progression: ', tags: 'strength', mood: 'good' as const }
        },
        {
            label: 'Cardio Session',
            value: 'cardio',
            data: { category: 'cardio', sessionType: 'Cardio Training', content: 'Completed cardio session.\n\nActivities:\n- \n\nDuration: \nAvg Heart Rate: \nRecovery: ', tags: 'cardio', mood: 'good' as const }
        },
        {
            label: 'Initial Assessment',
            value: 'assessment',
            data: { category: 'general', sessionType: 'Initial Assessment', content: 'Initial fitness assessment completed.\n\nGoals discussed:\n- \n\nCurrent fitness level: \nInjuries/Limitations: \nRecommended program: ', tags: 'assessment,new-member', mood: 'good' as const }
        },
        {
            label: 'Progress Check-in',
            value: 'checkin',
            data: { category: 'general', sessionType: 'Progress Review', content: 'Monthly progress check-in.\n\nGoal progress:\n- \n\nMeasurement changes:\n- Weight: \n- Body fat: \n\nAdjustments needed: ', tags: 'progress,review', mood: 'good' as const }
        },
        {
            label: 'Nutrition Review',
            value: 'nutrition',
            data: { category: 'nutrition', sessionType: 'Nutrition Consultation', content: 'Nutrition review session.\n\nCurrent diet observations:\n- \n\nRecommendations:\n- \n\nMeal plan adjustments: ', tags: 'nutrition', mood: 'good' as const }
        }
    ];

    const applyTemplate = (templateValue: string) => {
        const template = noteTemplates.find(t => t.value === templateValue);
        if (!template?.data) return;
        setFormData(prev => ({
            ...prev,
            category: template.data.category as any,
            sessionType: template.data.sessionType,
            content: template.data.content,
            mood: template.data.mood
        }));
        setFormTags(template.data.tags);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const [fetchedNotes, fetchedMembers] = await Promise.all([
                progressNoteApi.getAllNotes(),
                trainerApi.getMyMembers()
            ]);
            setNotes(fetchedNotes || []);
            setMembers(fetchedMembers || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
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
            const matchesMember = filterMember === 'All Members' || note.member?.name === filterMember;
            const matchesCategory = filterCategory === 'all' || note.category === filterCategory;

            // Basic Time Logic (can be improved)
            let matchesTime = true;
            if (filterTime === 'This Month') {
                const noteDate = new Date(note.date);
                const now = new Date();
                matchesTime = noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear();
            } else if (filterTime === 'This Week') {
                // Simplified week check
                const noteDate = new Date(note.date);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - noteDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                matchesTime = diffDays <= 7;
            }

            const matchesSearch = searchQuery === '' ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.member?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesMember && matchesCategory && matchesSearch && matchesTime;
        });
    }, [notes, filterMember, filterCategory, filterTime, searchQuery]);

    const stats = useMemo(() => ({
        totalNotes: notes.length,
        thisWeek: notes.filter(n => {
            const d = new Date(n.date);
            const now = new Date();
            return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7;
        }).length,
        membersTracked: new Set(notes.map(n => n.member?.name)).size,
        prsRecorded: notes.filter(n => n.tags.includes('PR')).length
    }), [notes]);

    const handleSaveNote = async () => {
        if (!selectedMemberName || !formData.content) {
            alert('Please select a member and enter content');
            return;
        }

        try {
            setIsSaving(true);
            const member = members.find(m => m.name === selectedMemberName);
            if (!member) {
                alert('Invalid member selected');
                return;
            }

            const payload: ProgressNoteDTO = {
                ...formData as ProgressNoteDTO,
                member: {
                    name: member.name,
                    avatar: `https://ui-avatars.com/api/?name=${member.name}`, // Construct avatar if missing
                    goal: member.goal || 'Fitness',
                    startDate: new Date().toLocaleDateString() // Placeholder
                },
                highlights: formHighlights.split('\n').filter(s => s.trim()),
                concerns: formConcerns.split('\n').filter(s => s.trim()),
                tags: formTags.split(',').map(s => s.trim()).filter(s => s),
                stats: [], // Implement stats UI if needed, empty for now
                attachments: [] // Implement upload later
            };

            await progressNoteApi.createNoteForMember(member.id, payload);

            // Refresh list
            await fetchInitialData();
            setIsModalOpen(false);
            setFormData(initialFormState);
            setSelectedMemberName('');
            setFormHighlights('');
            setFormConcerns('');
            setFormTags('');

        } catch (error) {
            console.error('Failed to save note:', error);
            alert('Failed to save note');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Helper Render Methods ---

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

    const getMemberAvatar = (member?: { name: string; avatar?: string }) => {
        if (member?.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('data:'))) {
            return member.avatar;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(member?.name || 'Member')}&background=random`;
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
                                {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
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

                {isLoading ? (
                    <div className="flex justify-center items-center h-64 text-gray-500">
                        <Loader className="animate-spin mr-2" size={20} /> Loading notes...
                    </div>
                ) : (
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
                                            <img src={getMemberAvatar(note.member)} alt={note.member?.name} />
                                            <div className="progress-note__member-info">
                                                <h3>{note.member?.name}</h3>
                                                <span className="progress-note__member-goal">{note.member?.goal}</span>
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

                                    {note.stats && note.stats.length > 0 && (
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
                                            {note.tags && note.tags.map((tag, i) => (
                                                <span key={i} className="progress-note__tag">
                                                    <Tag size={9} /> {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {note.attachments && note.attachments.length > 0 && (
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

                        {!isLoading && filteredNotes.length === 0 && (
                            <div className="progress-notes__empty">
                                <FileText size={32} />
                                <h3>No notes found</h3>
                                <p>Try adjusting your filters or add a new note</p>
                            </div>
                        )}
                    </div>
                )}

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
                                    value={selectedMemberName}
                                    onChange={(e) => setSelectedMemberName(e.target.value)}
                                >
                                    <option value="">Search or select member...</option>
                                    {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                            </div>

                            <div className="progress-notes__form-field">
                                <label>Quick Template</label>
                                <select
                                    className="progress-notes__template-select"
                                    onChange={(e) => applyTemplate(e.target.value)}
                                    defaultValue=""
                                >
                                    {noteTemplates.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="progress-notes__form-row">
                                <div className="progress-notes__form-field">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    >
                                        {categories.slice(1).map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="progress-notes__form-field">
                                    <label>Session Type</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Upper Body Strength"
                                        value={formData.sessionType}
                                        onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="progress-notes__form-row">
                                <div className="progress-notes__form-field">
                                    <label>Session Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="progress-notes__form-field">
                                    <label>Member Mood</label>
                                    <select
                                        value={formData.mood}
                                        onChange={(e) => setFormData({ ...formData, mood: e.target.value as any })}
                                    >
                                        <option value="excellent">Excellent - High energy</option>
                                        <option value="good">Good - Normal</option>
                                        <option value="average">Average - Some fatigue</option>
                                        <option value="struggling">Struggling - Low energy</option>
                                    </select>
                                </div>
                            </div>

                            <div className="progress-notes__form-field">
                                <label>Session Notes *</label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe the session, observations, progress made..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                            <div className="progress-notes__form-field">
                                <label>Highlights (one per line)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Hit new PR&#10;Improved form&#10;Increased confidence"
                                    value={formHighlights}
                                    onChange={(e) => setFormHighlights(e.target.value)}
                                />
                            </div>

                            <div className="progress-notes__form-field">
                                <label>Concerns (one per line)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Low energy&#10;Form needs work&#10;Missed sessions"
                                    value={formConcerns}
                                    onChange={(e) => setFormConcerns(e.target.value)}
                                />
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
                                    <input
                                        type="text"
                                        placeholder="PR, strength, legs"
                                        value={formTags}
                                        onChange={(e) => setFormTags(e.target.value)}
                                    />
                                </div>
                                <div className="progress-notes__form-field">
                                    <label>Follow-up Reminder</label>
                                    <input
                                        type="text"
                                        placeholder="What to check next session"
                                        value={formData.followUp}
                                        onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                                    />
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
                                <input
                                    type="checkbox"
                                    id="private-note"
                                    checked={formData.private}
                                    onChange={(e) => setFormData({ ...formData, private: e.target.checked })}
                                />
                                <label htmlFor="private-note">Private note (only visible to you)</label>
                            </div>
                        </div>
                        <div className="progress-notes__modal-footer">
                            <button className="progress-notes__modal-cancel" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className="progress-notes__modal-save"
                                onClick={handleSaveNote}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressNotes;
