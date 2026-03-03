import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search, Plus, Download, ChevronDown, Trash2, Edit2,
    Paperclip, X, Calendar, Clock, Target, TrendingUp,
    ChevronRight, Filter, Image, FileText, Video, MoreVertical,
    Star, Award, AlertTriangle, CheckCircle, Activity, Zap,
    User, BarChart2, Camera, MessageSquare, Tag, Loader,
    BookOpen, Flame, Leaf, Apple, Dumbbell, Heart
} from 'lucide-react';
import './ProgressNotes.css';
import { progressNoteApi, type ProgressNoteDTO } from '../../services/progressNoteApi';
import { trainerApi, type TrainerMember } from '../../services/trainerApi';
import { showToast } from '../../utils/toast';

/* ── Per-category palette ── */
const CAT_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.FC<any> }> = {
    all: { label: 'All', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.28)', icon: BookOpen },
    strength: { label: 'Strength', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.28)', icon: Dumbbell },
    cardio: { label: 'Cardio', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.28)', icon: Flame },
    flexibility: { label: 'Flexibility', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)', icon: Leaf },
    nutrition: { label: 'Nutrition', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)', icon: Apple },
    general: { label: 'General', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.28)', icon: FileText },
};

const MOOD_META: Record<string, { color: string; bg: string; icon: React.FC<any>; label: string }> = {
    excellent: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: Star, label: 'Excellent' },
    good: { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', icon: CheckCircle, label: 'Good' },
    average: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: Activity, label: 'Average' },
    struggling: { color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', icon: AlertTriangle, label: 'Struggling' },
};

const ProgressNotes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notes, setNotes] = useState<ProgressNoteDTO[]>([]);
    const [members, setMembers] = useState<TrainerMember[]>([]);
    const [filterMember, setFilterMember] = useState('All Members');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterTime, setFilterTime] = useState('All Time');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<ProgressNoteDTO | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [linkedSessionId, setLinkedSessionId] = useState<number | ''>('');
    const [sessions, setSessions] = useState<any[]>([]);

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

    const noteTemplates = [
        { label: 'Select a template...', value: '' },
        { label: 'Strength Session', value: 'strength', data: { category: 'strength', sessionType: 'Strength Training', content: 'Completed strength training session.\n\nExercises performed:\n- \n- \n- \n\nForm observations: \nWeight progression: ', tags: 'strength', mood: 'good' as const } },
        { label: 'Cardio Session', value: 'cardio', data: { category: 'cardio', sessionType: 'Cardio Training', content: 'Completed cardio session.\n\nActivities:\n- \n\nDuration: \nAvg Heart Rate: \nRecovery: ', tags: 'cardio', mood: 'good' as const } },
        { label: 'Initial Assessment', value: 'assessment', data: { category: 'general', sessionType: 'Initial Assessment', content: 'Initial fitness assessment completed.\n\nGoals discussed:\n- \n\nCurrent fitness level: \nInjuries/Limitations: \nRecommended program: ', tags: 'assessment,new-member', mood: 'good' as const } },
        { label: 'Progress Check-in', value: 'checkin', data: { category: 'general', sessionType: 'Progress Review', content: 'Monthly progress check-in.\n\nGoal progress:\n- \n\nMeasurement changes:\n- Weight: \n- Body fat: \n\nAdjustments needed: ', tags: 'progress,review', mood: 'good' as const } },
        { label: 'Nutrition Review', value: 'nutrition', data: { category: 'nutrition', sessionType: 'Nutrition Consultation', content: 'Nutrition review session.\n\nCurrent diet observations:\n- \n\nRecommendations:\n- \n\nMeal plan adjustments: ', tags: 'nutrition', mood: 'good' as const } },
    ];

    const applyTemplate = (v: string) => {
        const t = noteTemplates.find(x => x.value === v);
        if (!t?.data) return;
        setFormData(p => ({ ...p, category: t.data.category as any, sessionType: t.data.sessionType, content: t.data.content, mood: t.data.mood }));
        setFormTags(t.data.tags);
    };

    useEffect(() => { fetchInitialData(); }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const today = new Date();
            const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 30);
            const [fn, fm, fs] = await Promise.all([
                progressNoteApi.getAllNotes(),
                trainerApi.getMyMembers(),
                trainerApi.getSchedule(
                    weekAgo.toISOString().split('T')[0],
                    today.toISOString().split('T')[0]
                ).catch(() => []),
            ]);
            setNotes(fn || []);
            setMembers(fm || []);
            setSessions(fs || []);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const categories = Object.entries(CAT_META).map(([value, m]) => ({ value, ...m }));

    const filteredNotes = useMemo(() => notes.filter(note => {
        const matchesMember = filterMember === 'All Members' || note.member?.name === filterMember;
        const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
        let matchesTime = true;
        if (filterTime === 'This Month') {
            const d = new Date(note.date), now = new Date();
            matchesTime = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else if (filterTime === 'This Week') {
            const diff = Math.ceil(Math.abs(Date.now() - new Date(note.date).getTime()) / 86400000);
            matchesTime = diff <= 7;
        }
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || note.content.toLowerCase().includes(q) || note.member?.name.toLowerCase().includes(q) || note.tags.some(t => t.toLowerCase().includes(q));
        return matchesMember && matchesCategory && matchesSearch && matchesTime;
    }), [notes, filterMember, filterCategory, filterTime, searchQuery]);

    const stats = useMemo(() => ({
        totalNotes: notes.length,
        thisWeek: notes.filter(n => (Date.now() - new Date(n.date).getTime()) / 86400000 <= 7).length,
        membersTracked: new Set(notes.map(n => n.member?.name)).size,
        prsRecorded: notes.filter(n => n.tags.includes('PR')).length,
    }), [notes]);

    const handleSaveNote = async () => {
        if (!selectedMemberName || !formData.content) { showToast.error('Please select a member and enter content'); return; }
        try {
            setIsSaving(true);
            const member = members.find(m => m.name === selectedMemberName);
            if (!member) { showToast.error('Invalid member selected'); return; }
            const payload: ProgressNoteDTO = {
                ...formData as ProgressNoteDTO,
                member: { name: member.name, avatar: `https://ui-avatars.com/api/?name=${member.name}`, goal: member.goal || 'Fitness', startDate: new Date().toLocaleDateString() },
                highlights: formHighlights.split('\n').filter(s => s.trim()),
                concerns: formConcerns.split('\n').filter(s => s.trim()),
                tags: formTags.split(',').map(s => s.trim()).filter(s => s),
                stats: [], attachments: [],
                ...(linkedSessionId !== '' ? { sessionId: linkedSessionId } : {}),
            };
            await progressNoteApi.createNoteForMember(member.id, payload);
            await fetchInitialData();
            setIsModalOpen(false);
            setFormData(initialFormState);
            setSelectedMemberName('');
            setFormHighlights('');
            setFormConcerns('');
            setFormTags('');
            setLinkedSessionId('');
        } catch (e) { console.error(e); showToast.error('Failed to save note'); }
        finally { setIsSaving(false); }
    };

    const getMemberAvatar = (member?: { name: string; avatar?: string }) => {
        if (member?.avatar && (member.avatar.startsWith('http') || member.avatar.startsWith('data:'))) return member.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(member?.name || 'Member')}&background=random`;
    };

    const getAttachmentIcon = (type: string) => {
        switch (type) { case 'photo': return <Image size={12} />; case 'video': return <Video size={12} />; case 'document': return <FileText size={12} />; default: return <Paperclip size={12} />; }
    };

    const catMeta = (cat: string) => CAT_META[cat] || CAT_META.general;
    const moodMeta = (mood: string) => MOOD_META[mood] || MOOD_META.good;

    /* active category gradient for filter chips */
    const activeCatColor = catMeta(filterCategory).color;

    return (
        <div className="pn">
            {/* ── HEADER ── */}
            <div className="pn__header">
                <div className="pn__header-glow pn__header-glow--1" />
                <div className="pn__header-glow pn__header-glow--2" />
                <div className="pn__header-inner">
                    <div className="pn__title-block">
                        <div className="pn__title-icon">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <h1 className="pn__title">Progress Notes</h1>
                            <p className="pn__subtitle">Track and document member progress</p>
                        </div>
                    </div>

                    <div className="pn__stat-pills">
                        <div className="pn__stat-pill pn__stat-pill--teal">
                            <span className="pn__stat-val">{stats.totalNotes}</span>
                            <span className="pn__stat-lbl">Total Notes</span>
                        </div>
                        <div className="pn__stat-pill pn__stat-pill--violet">
                            <span className="pn__stat-val">{stats.thisWeek}</span>
                            <span className="pn__stat-lbl">This Week</span>
                        </div>
                        <div className="pn__stat-pill pn__stat-pill--emerald">
                            <span className="pn__stat-val">{stats.membersTracked}</span>
                            <span className="pn__stat-lbl">Members</span>
                        </div>
                        <div className="pn__stat-pill pn__stat-pill--amber">
                            <span className="pn__stat-val">{stats.prsRecorded}</span>
                            <span className="pn__stat-lbl">PRs</span>
                        </div>
                    </div>

                    <button className="pn__add-btn" onClick={() => setIsModalOpen(true)}>
                        <Plus size={15} />
                        New Note
                    </button>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="pn__content">

                {/* ── TOOLBAR ── */}
                <div className="pn__toolbar">
                    <div className="pn__search">
                        <Search size={14} />
                        <input
                            type="text"
                            placeholder="Search notes, members, tags…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && <button className="pn__search-clear" onClick={() => setSearchQuery('')}><X size={12} /></button>}
                    </div>

                    {/* Category chips — all 6 */}
                    <div className="pn__cat-chips">
                        {categories.map(cat => {
                            const active = filterCategory === cat.value;
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.value}
                                    className={`pn__cat-chip ${active ? 'active' : ''}`}
                                    style={active ? { '--chip-color': cat.color, '--chip-bg': cat.bg, '--chip-border': cat.border } as any : {}}
                                    onClick={() => setFilterCategory(cat.value)}
                                >
                                    <Icon size={11} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="pn__toolbar-right">
                        <div className="pn__select-wrap">
                            <User size={12} />
                            <select value={filterMember} onChange={e => setFilterMember(e.target.value)}>
                                <option>All Members</option>
                                {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                            <ChevronDown size={11} />
                        </div>

                        <div className="pn__select-wrap">
                            <Calendar size={12} />
                            <select value={filterTime} onChange={e => setFilterTime(e.target.value)}>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>All Time</option>
                            </select>
                            <ChevronDown size={11} />
                        </div>

                        <button className="pn__export-btn">
                            <Download size={13} />
                            Export
                        </button>
                    </div>
                </div>

                {/* ── RESULTS META ── */}
                {!isLoading && (
                    <div className="pn__results-meta">
                        <span className="pn__results-count" style={{ color: activeCatColor }}>
                            {filteredNotes.length}
                        </span>
                        <span className="pn__results-label">
                            {filteredNotes.length === 1 ? 'note' : 'notes'} found
                        </span>
                        {(filterCategory !== 'all' || filterMember !== 'All Members' || filterTime !== 'All Time' || searchQuery) && (
                            <button className="pn__clear-filters" onClick={() => { setFilterCategory('all'); setFilterMember('All Members'); setFilterTime('All Time'); setSearchQuery(''); }}>
                                <X size={10} /> Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* ── TIMELINE ── */}
                {isLoading ? (
                    <div className="pn__loading">
                        <Loader size={22} className="pn__spinner" />
                        <span>Loading notes…</span>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="pn__empty">
                        <div className="pn__empty-icon"><BookOpen size={28} /></div>
                        <h3>No notes found</h3>
                        <p>Try adjusting your filters or add a new note</p>
                        <button className="pn__empty-btn" onClick={() => setIsModalOpen(true)}>
                            <Plus size={13} /> Add First Note
                        </button>
                    </div>
                ) : (
                    <div className="pn__timeline">
                        {filteredNotes.map(note => {
                            const cm = catMeta(note.category);
                            const mm = moodMeta(note.mood);
                            const MoodIcon = mm.icon;
                            const CatIcon = cm.icon;
                            return (
                                <div
                                    key={note.id}
                                    className={`pn-note ${note.private ? 'pn-note--private' : ''}`}
                                    onClick={() => setSelectedNote(note)}
                                >
                                    {/* Timeline dot + line */}
                                    <div className="pn-note__indicator">
                                        <div className="pn-note__dot" style={{ background: cm.color, boxShadow: `0 0 0 3px ${cm.bg}` }} />
                                        <div className="pn-note__line" />
                                    </div>

                                    {/* Card */}
                                    <div className="pn-note__card" style={{ '--note-accent': cm.color, '--note-accent-bg': cm.bg, '--note-accent-border': cm.border } as any}>
                                        <div className="pn-note__accent-bar" />

                                        {/* Card header */}
                                        <div className="pn-note__head">
                                            <img className="pn-note__avatar" src={getMemberAvatar(note.member)} alt={note.member?.name} />
                                            <div className="pn-note__member-info">
                                                <span className="pn-note__member-name">{note.member?.name}</span>
                                                <span className="pn-note__member-goal">{note.member?.goal}</span>
                                            </div>
                                            <div className="pn-note__head-right">
                                                {/* Mood badge */}
                                                <span className="pn-note__mood" style={{ color: mm.color, background: mm.bg }}>
                                                    <MoodIcon size={11} />
                                                    {mm.label}
                                                </span>
                                                {/* Date */}
                                                <span className="pn-note__date">
                                                    <Calendar size={11} /> {note.date}
                                                </span>
                                                {/* Menu */}
                                                <button
                                                    className="pn-note__menu-btn"
                                                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === (note.id ?? null) ? null : (note.id ?? null)); }}
                                                >
                                                    <MoreVertical size={14} />
                                                </button>
                                                {openMenuId === note.id && (
                                                    <div className="pn-note__menu-dropdown" onClick={e => e.stopPropagation()}>
                                                        <button><Edit2 size={12} /> Edit</button>
                                                        <button className="danger"><Trash2 size={12} /> Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Session row */}
                                        <div className="pn-note__session">
                                            <span className="pn-note__cat-badge" style={{ color: cm.color, background: cm.bg, border: `1px solid ${cm.border}` }}>
                                                <CatIcon size={10} /> {cm.label}
                                            </span>
                                            {note.sessionType && <span className="pn-note__session-type">{note.sessionType}</span>}
                                            <span className="pn-note__time"><Clock size={11} /> {note.time}</span>
                                            {note.private && <span className="pn-note__private-badge">Private</span>}
                                        </div>

                                        {/* Note content */}
                                        <p className="pn-note__text">{note.content}</p>

                                        {/* Highlights */}
                                        {(note.highlights?.length ?? 0) > 0 && (
                                            <div className="pn-note__highlights">
                                                <span className="pn-note__section-label" style={{ color: '#10b981' }}>
                                                    <Award size={11} /> Highlights
                                                </span>
                                                <ul>{(note.highlights ?? []).map((h, i) => <li key={i}>{h}</li>)}</ul>
                                            </div>
                                        )}

                                        {/* Concerns */}
                                        {(note.concerns?.length ?? 0) > 0 && (
                                            <div className="pn-note__concerns">
                                                <span className="pn-note__section-label" style={{ color: '#f43f5e' }}>
                                                    <AlertTriangle size={11} /> Concerns
                                                </span>
                                                <ul>{(note.concerns ?? []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        {note.stats?.length > 0 && (
                                            <div className="pn-note__stats">
                                                {note.stats.map((s, i) => (
                                                    <div key={i} className="pn-note__stat">
                                                        <span className="pn-note__stat-label">{s.label}</span>
                                                        <div className="pn-note__stat-row">
                                                            <span className="pn-note__stat-value">{s.value}</span>
                                                            {s.change && (
                                                                <span className={`pn-note__stat-change pn-note__stat-change--${s.trend}`}>
                                                                    {s.trend === 'up' ? <TrendingUp size={10} /> : s.trend === 'down' ? <TrendingUp size={10} style={{ transform: 'rotate(180deg)' }} /> : null}
                                                                    {s.change}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer: tags + attachments */}
                                        <div className="pn-note__footer">
                                            <div className="pn-note__tags">
                                                {note.tags?.map((tag, i) => (
                                                    <span key={i} className="pn-note__tag" style={{ color: cm.color, background: cm.bg, borderColor: cm.border }}>
                                                        <Tag size={9} /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            {note.attachments?.length > 0 && (
                                                <div className="pn-note__attachments">
                                                    {note.attachments.map((att, i) => (
                                                        <button key={i} className="pn-note__attachment">
                                                            {getAttachmentIcon(att.type)} {att.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Follow-up */}
                                        {note.followUp && (
                                            <div className="pn-note__followup">
                                                <MessageSquare size={11} />
                                                <strong>Follow-up:</strong> {note.followUp}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── ADD NOTE MODAL ── */}
            {isModalOpen && (
                <div className="pn__overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="pn__modal" onClick={e => e.stopPropagation()}>

                        {/* Modal header */}
                        <div className="pn__modal-header">
                            <div className="pn__modal-header-glow" />
                            <div className="pn__modal-title-row">
                                <div className="pn__modal-icon">
                                    <Plus size={16} />
                                </div>
                                <div>
                                    <h2 className="pn__modal-title">New Progress Note</h2>
                                    <p className="pn__modal-subtitle">Document session details and member progress</p>
                                </div>
                            </div>
                            <button className="pn__modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="pn__modal-body">

                            {/* Section: Member */}
                            <div className="pn__modal-section">
                                <div className="pn__modal-section-label pn__modal-section-label--teal">
                                    <User size={12} /> Member
                                </div>
                                <div className="pn__field">
                                    <select
                                        value={selectedMemberName}
                                        onChange={e => setSelectedMemberName(e.target.value)}
                                        className="pn__field-select"
                                    >
                                        <option value="">Search or select member…</option>
                                        {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                </div>
                                {selectedMemberName && (
                                    <div className="pn__selected-member">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMemberName)}&background=random`} alt="" />
                                        <span>{selectedMemberName}</span>
                                        <CheckCircle size={13} style={{ color: '#10b981', marginLeft: 'auto' }} />
                                    </div>
                                )}
                            </div>

                            {/* Section: Template */}
                            <div className="pn__modal-section">
                                <div className="pn__modal-section-label pn__modal-section-label--violet">
                                    <Zap size={12} /> Quick Template
                                </div>
                                <div className="pn__field">
                                    <select className="pn__field-select" onChange={e => applyTemplate(e.target.value)} defaultValue="">
                                        {noteTemplates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Section: Category */}
                            <div className="pn__modal-section">
                                <div className="pn__modal-section-label pn__modal-section-label--rose">
                                    <Tag size={12} /> Category
                                </div>
                                <div className="pn__cat-grid">
                                    {Object.entries(CAT_META).filter(([k]) => k !== 'all').map(([value, meta]) => {
                                        const active = formData.category === value;
                                        const Icon = meta.icon;
                                        return (
                                            <button
                                                key={value}
                                                className={`pn__cat-card ${active ? 'active' : ''}`}
                                                style={active ? { '--card-color': meta.color, '--card-bg': meta.bg, '--card-border': meta.border } as any : {}}
                                                onClick={() => setFormData(p => ({ ...p, category: value as any }))}
                                                type="button"
                                            >
                                                <div className="pn__cat-card-icon" style={active ? { background: meta.bg, color: meta.color } : {}}>
                                                    <Icon size={14} />
                                                </div>
                                                <span>{meta.label}</span>
                                                {active && <CheckCircle size={11} className="pn__cat-card-check" style={{ color: meta.color }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section: Session Details */}
                            <div className="pn__modal-section">
                                <div className="pn__modal-section-label pn__modal-section-label--amber">
                                    <Calendar size={12} /> Session Details
                                </div>
                                <div className="pn__field-row">
                                    <div className="pn__field">
                                        <label>Session Type</label>
                                        <input
                                            type="text"
                                            className="pn__field-input"
                                            placeholder="e.g., Upper Body Strength"
                                            value={formData.sessionType}
                                            onChange={e => setFormData(p => ({ ...p, sessionType: e.target.value }))}
                                        />
                                    </div>
                                    <div className="pn__field">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            className="pn__field-input"
                                            value={formData.date}
                                            onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Link to session */}
                                <div className="pn__field">
                                    <label className="pn__label--link">🔗 Link to Session (optional)</label>
                                    <select
                                        className="pn__field-select"
                                        value={linkedSessionId}
                                        onChange={e => setLinkedSessionId(e.target.value === '' ? '' : Number(e.target.value))}
                                    >
                                        <option value="">No session linked</option>
                                        {sessions.map((s: any) => (
                                            <option key={s.sessionId ?? s.id} value={s.sessionId ?? s.id}>
                                                {s.title || `Session #${s.sessionId ?? s.id}`}
                                                {s.sessionDate ? ` — ${new Date(s.sessionDate).toLocaleDateString()}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mood selector */}
                                <div className="pn__field pn__field--mood">
                                    <label>Member Mood</label>
                                    <div className="pn__mood-grid">
                                        {Object.entries(MOOD_META).map(([value, meta]) => {
                                            const active = formData.mood === value;
                                            const Icon = meta.icon;
                                            return (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    className={`pn__mood-btn ${active ? 'active' : ''}`}
                                                    style={active ? { color: meta.color, background: meta.bg, border: `1.5px solid ${meta.color}` } : {}}
                                                    onClick={() => setFormData(p => ({ ...p, mood: value as any }))}
                                                >
                                                    <Icon size={13} />
                                                    {meta.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Notes */}
                            <div className="pn__modal-section">
                                <div className="pn__modal-section-label pn__modal-section-label--cyan">
                                    <FileText size={12} /> Notes
                                </div>
                                <div className="pn__field">
                                    <label>Session Notes <span className="pn__required">*</span></label>
                                    <textarea
                                        className="pn__field-textarea"
                                        rows={4}
                                        placeholder="Describe the session, observations, progress made…"
                                        value={formData.content}
                                        onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                                    />
                                </div>
                                <div className="pn__field-row">
                                    <div className="pn__field">
                                        <label className="pn__label--green"><Award size={11} /> Highlights (one per line)</label>
                                        <textarea
                                            className="pn__field-textarea pn__field-textarea--green"
                                            rows={2}
                                            placeholder={"Hit new PR\nImproved form\nIncreased confidence"}
                                            value={formHighlights}
                                            onChange={e => setFormHighlights(e.target.value)}
                                        />
                                    </div>
                                    <div className="pn__field">
                                        <label className="pn__label--rose"><AlertTriangle size={11} /> Concerns (one per line)</label>
                                        <textarea
                                            className="pn__field-textarea pn__field-textarea--rose"
                                            rows={2}
                                            placeholder={"Low energy\nForm needs work\nMissed sessions"}
                                            value={formConcerns}
                                            onChange={e => setFormConcerns(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Measurements */}
                            <div className="pn__modal-section">
                                <div className="pn__modal-section-label pn__modal-section-label--emerald">
                                    <BarChart2 size={12} /> Measurements (Optional)
                                </div>
                                <div className="pn__measure-grid">
                                    {[{ label: 'Weight (kg)', ph: '75.0' }, { label: 'Body Fat %', ph: '18.5' }, { label: 'Custom PR', ph: '100kg bench' }].map(m => (
                                        <div key={m.label} className="pn__measure-item">
                                            <input type="text" className="pn__field-input" placeholder={m.ph} />
                                            <span>{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Meta */}
                            <div className="pn__modal-section">
                                <div className="pn__modal-section-label pn__modal-section-label--orange">
                                    <Tag size={12} /> Tags & Follow-up
                                </div>
                                <div className="pn__field-row">
                                    <div className="pn__field">
                                        <label>Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            className="pn__field-input"
                                            placeholder="PR, strength, legs"
                                            value={formTags}
                                            onChange={e => setFormTags(e.target.value)}
                                        />
                                    </div>
                                    <div className="pn__field">
                                        <label>Follow-up Reminder</label>
                                        <input
                                            type="text"
                                            className="pn__field-input"
                                            placeholder="Check form next session"
                                            value={formData.followUp}
                                            onChange={e => setFormData(p => ({ ...p, followUp: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div className="pn__field">
                                    <label>Attachments</label>
                                    <div
                                        className="pn__upload-zone"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <Camera size={18} />
                                        <span>Drop files or click to add photos, videos, or documents</span>
                                        {selectedFiles.length > 0 && (
                                            <span className="pn__upload-count">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</span>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,video/*,.pdf,.doc,.docx"
                                        style={{ display: 'none' }}
                                        onChange={e => setSelectedFiles(Array.from(e.target.files || []))}
                                    />
                                </div>

                                {/* Visibility toggle — premium pill */}
                                <div className="pn__visibility-row">
                                    <button
                                        type="button"
                                        className={`pn__visibility-toggle ${formData.private ? 'pn__visibility-toggle--private' : 'pn__visibility-toggle--visible'}`}
                                        onClick={() => setFormData(p => ({ ...p, private: !p.private }))}
                                    >
                                        <span className="pn__vis-track">
                                            <span className="pn__vis-thumb" />
                                        </span>
                                        <span className="pn__vis-label">
                                            {formData.private ? '🔒 Private — only visible to you' : '👁 Visible to member'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="pn__modal-footer">
                            <span className="pn__footer-preview">
                                {selectedMemberName || '—'} · {formData.category} · {formData.date}
                            </span>
                            <div className="pn__footer-actions">
                                <button className="pn__btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className="pn__btn-save" onClick={handleSaveNote} disabled={isSaving}>
                                    {isSaving ? <><Loader size={13} className="pn__spinner" /> Saving…</> : <><BookOpen size={13} /> Save Note</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressNotes;
