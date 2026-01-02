import React, { useState } from 'react';
import { 
    Search, Plus, Download, ChevronDown, Trash2, Edit2, 
    Paperclip, X, Calendar
} from 'lucide-react';
import './ProgressNotes.css';

const ProgressNotes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterMember, setFilterMember] = useState('All Members');
    const [filterTime, setFilterTime] = useState('This Month');

    const notes = [
        {
            id: 1,
            member: { name: 'Sarah Wilson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=4F46E5&color=fff' },
            date: 'March 25, 2024',
            time: '2:30 PM',
            sessionType: 'Upper Body Strength',
            content: 'Great progress on squats today! Increased weight from 135lbs to 155lbs with excellent form. Sarah is showing consistent improvement in leg strength. Next session: Focus on deadlift technique.',
            stats: [
                { label: 'Weight', value: '78 kg' },
                { label: 'Body Fat', value: '18%' },
                { label: 'Squat PR', value: '155 lbs' }
            ],
            attachments: ['Progress Photo', 'Workout Log']
        },
        {
            id: 2,
            member: { name: 'Mike Johnson', avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=4F46E5&color=fff' },
            date: 'March 22, 2024',
            time: '10:00 AM',
            sessionType: 'Cardio',
            content: 'Struggled with HIIT today. Adjusted rest periods to 90 seconds. Focus on steady state cardio twice this week to build base endurance.',
            stats: [
                { label: 'Avg HR', value: '145 bpm' },
                { label: 'Max HR', value: '178 bpm' }
            ],
            attachments: []
        },
        {
            id: 3,
            member: { name: 'Emma Davis', avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=4F46E5&color=fff' },
            date: 'March 20, 2024',
            time: '4:00 PM',
            sessionType: 'Full Body',
            content: 'Excellent session! Completed full circuit with no breaks. Emma is ready to move to advanced program.',
            stats: [
                { label: 'Reps', value: '120' },
                { label: 'Time', value: '45 min' }
            ],
            attachments: ['Video Recording']
        }
    ];

    return (
        <div className="progress-notes">
            {/* Header */}
            <div className="progress-notes__header">
                <div className="progress-notes__header-content">
                    <div className="progress-notes__title-section">
                        <h1>Progress Notes</h1>
                        <p>Track and document member progress</p>
                    </div>
                    <button 
                        className="progress-notes__add-btn"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={16} />
                        Add New Note
                    </button>
                </div>
            </div>

            <div className="progress-notes__content">
                {/* Filter Bar */}
                <div className="progress-notes__filter-bar">
                    <div className="progress-notes__search">
                        <Search size={16} />
                        <input type="text" placeholder="Search notes..." />
                    </div>
                    <div className="progress-notes__filter-dropdown">
                        <select value={filterMember} onChange={(e) => setFilterMember(e.target.value)}>
                            <option>All Members</option>
                            <option>Sarah Wilson</option>
                            <option>Mike Johnson</option>
                            <option>Emma Davis</option>
                        </select>
                        <ChevronDown size={14} />
                    </div>
                    <div className="progress-notes__filter-dropdown">
                        <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)}>
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>All Time</option>
                        </select>
                        <ChevronDown size={14} />
                    </div>
                    <button className="progress-notes__export-btn">
                        <Download size={14} />
                        Export
                    </button>
                </div>

                {/* Notes Timeline */}
                <div className="progress-notes__timeline">
                    {notes.map(note => (
                        <div key={note.id} className="progress-note">
                            <div className="progress-note__avatar">
                                <img src={note.member.avatar} alt={note.member.name} />
                            </div>
                            <div className="progress-note__content">
                                <div className="progress-note__header">
                                    <div className="progress-note__meta">
                                        <h3>{note.member.name}</h3>
                                        <span className="progress-note__date">
                                            {note.date} • {note.time}
                                        </span>
                                    </div>
                                    <div className="progress-note__actions">
                                        <button className="progress-note__action-btn">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="progress-note__action-btn progress-note__action-btn--danger">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="progress-note__body">
                                    <span className="progress-note__type">{note.sessionType}</span>
                                    <p className="progress-note__text">{note.content}</p>
                                </div>

                                {note.stats.length > 0 && (
                                    <div className="progress-note__stats">
                                        {note.stats.map((stat, i) => (
                                            <div key={i} className="progress-note__stat">
                                                <span className="progress-note__stat-label">{stat.label}</span>
                                                <span className="progress-note__stat-value">{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {note.attachments.length > 0 && (
                                    <div className="progress-note__attachments">
                                        {note.attachments.map((att, i) => (
                                            <button key={i} className="progress-note__attachment">
                                                <Paperclip size={12} />
                                                {att}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="progress-notes__load-more">
                    Load More Notes
                </button>
            </div>

            {/* Add Note Modal */}
            {isModalOpen && (
                <div className="progress-notes__modal-overlay">
                    <div className="progress-notes__modal">
                        <div className="progress-notes__modal-header">
                            <h2>Add Progress Note</h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="progress-notes__modal-body">
                            <div className="progress-notes__form-field">
                                <label>Select Member *</label>
                                <select>
                                    <option>Search or select member...</option>
                                    <option>Sarah Wilson</option>
                                    <option>Mike Johnson</option>
                                    <option>Emma Davis</option>
                                </select>
                            </div>
                            <div className="progress-notes__form-row">
                                <div className="progress-notes__form-field">
                                    <label>Session Type</label>
                                    <select>
                                        <option>Upper Body</option>
                                        <option>Lower Body</option>
                                        <option>Cardio</option>
                                        <option>Full Body</option>
                                    </select>
                                </div>
                                <div className="progress-notes__form-field">
                                    <label>Session Date *</label>
                                    <input type="date" />
                                </div>
                            </div>
                            <div className="progress-notes__form-field">
                                <label>Notes *</label>
                                <textarea rows={4} placeholder="Enter session details, observations, recommendations..." />
                            </div>
                            <div className="progress-notes__measurements">
                                <label>Measurements (Optional)</label>
                                <div className="progress-notes__measurements-grid">
                                    <input type="text" placeholder="Weight" />
                                    <input type="text" placeholder="Body Fat %" />
                                    <input type="text" placeholder="PR/Max" />
                                </div>
                            </div>
                        </div>
                        <div className="progress-notes__modal-footer">
                            <button 
                                className="progress-notes__modal-cancel"
                                onClick={() => setIsModalOpen(false)}
                            >
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
