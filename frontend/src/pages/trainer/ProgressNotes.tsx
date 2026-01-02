import React, { useState } from 'react';
import { Search, Plus, Download, ChevronDown, Trash2, Edit2, MoreHorizontal, Paperclip, FileText, X, Calendar, User } from 'lucide-react';

const ProgressNotes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterMember, setFilterMember] = useState('All Members');
    const [filterTime, setFilterTime] = useState('This Month');

    const notes = [
        {
            id: 1,
            member: { name: 'Sarah Wilson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=4F46E5&color=fff' },
            date: 'Mar 25, 2024',
            time: '2:30 PM',
            sessionType: 'Upper Body',
            content: 'Great progress on squats! Increased weight from 135lbs to 155lbs with excellent form. Next: Focus on deadlift technique.',
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
            date: 'Mar 22, 2024',
            time: '10:00 AM',
            sessionType: 'Cardio',
            content: 'Struggled with HIIT today. Adjusted rest periods to 90 seconds. Focus on steady state cardio twice this week.',
            stats: [
                { label: 'Avg HR', value: '145 bpm' },
                { label: 'Max HR', value: '178 bpm' }
            ],
            attachments: []
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Compact Header */}
            <div className="px-4 py-3 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]">
                <div className="flex items-center justify-between max-w-[1000px] mx-auto">
                    <div>
                        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Progress Notes</h1>
                        <p className="text-xs text-[var(--text-tertiary)]">Track and document member progress</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-8 px-3 bg-[#4F46E5] text-white rounded-md text-xs font-medium hover:bg-[#4338CA] transition-colors flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        Add Note
                    </button>
                </div>
            </div>

            <div className="p-4 max-w-[1000px] mx-auto">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={14} />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            className="w-[180px] h-8 pl-8 pr-3 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5]"
                        />
                    </div>
                    <div className="relative">
                        <select
                            className="h-8 pl-3 pr-7 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-xs text-[var(--text-secondary)] focus:outline-none appearance-none cursor-pointer"
                            value={filterMember}
                            onChange={(e) => setFilterMember(e.target.value)}
                        >
                            <option>All Members</option>
                            <option>Sarah Wilson</option>
                            <option>Mike Johnson</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" size={12} />
                    </div>
                    <div className="relative">
                        <select
                            className="h-8 pl-3 pr-7 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-md text-xs text-[var(--text-secondary)] focus:outline-none appearance-none cursor-pointer"
                            value={filterTime}
                            onChange={(e) => setFilterTime(e.target.value)}
                        >
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>All Time</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" size={12} />
                    </div>
                    <button className="ml-auto h-8 px-3 border border-[var(--sidebar-border)] rounded-md text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors flex items-center gap-1.5">
                        <Download size={14} />
                        Export
                    </button>
                </div>

                {/* Notes Timeline */}
                <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-lg">
                    <div className="divide-y divide-[var(--sidebar-border)]">
                        {notes.map(note => (
                            <div key={note.id} className="p-4 hover:bg-[var(--sidebar-hover)]/50 transition-colors">
                                {/* Header Row */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={note.member.avatar} alt={note.member.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-medium text-[var(--text-primary)]">{note.member.name}</span>
                                            <span className="px-1.5 py-0.5 bg-[#4F46E5]/10 text-[#4F46E5] text-[9px] font-semibold rounded">
                                                {note.sessionType}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-tertiary)]">
                                            {note.date} • {note.time}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-tertiary)] hover:text-[#4F46E5] transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--sidebar-hover)] text-[var(--text-tertiary)] hover:text-red-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="ml-12 space-y-3">
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                        {note.content}
                                    </p>

                                    {/* Stats */}
                                    {note.stats.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {note.stats.map((stat, i) => (
                                                <div key={i} className="px-2.5 py-1.5 bg-[var(--bg-primary)] rounded border border-[var(--sidebar-border)]">
                                                    <div className="text-[9px] text-[var(--text-tertiary)] uppercase">{stat.label}</div>
                                                    <div className="text-xs font-semibold text-[var(--text-primary)]">{stat.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Attachments */}
                                    {note.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {note.attachments.map((att, i) => (
                                                <button key={i} className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded text-[10px] font-medium text-[#4F46E5] hover:border-[#4F46E5]/30 transition-colors">
                                                    <Paperclip size={10} />
                                                    {att}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-t border-[var(--sidebar-border)]">
                        <button className="w-full h-8 border border-dashed border-[var(--sidebar-border)] rounded text-xs font-medium text-[var(--text-tertiary)] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-colors">
                            Load More Notes
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Note Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[var(--sidebar-bg)] rounded-xl w-full max-w-md border border-[var(--sidebar-border)] shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--sidebar-border)]">
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Add Progress Note</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Member</label>
                                <select className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5]">
                                    <option>Select member...</option>
                                    <option>Sarah Wilson</option>
                                    <option>Mike Johnson</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Session Type</label>
                                    <select className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5]">
                                        <option>Upper Body</option>
                                        <option>Lower Body</option>
                                        <option>Cardio</option>
                                        <option>Full Body</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Date</label>
                                    <input type="date" className="w-full h-9 px-3 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-1.5">Notes</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Enter session details..."
                                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--sidebar-border)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5] resize-none"
                                />
                            </div>
                            <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--sidebar-border)]">
                                <div className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase mb-2">Measurements (Optional)</div>
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="text" placeholder="Weight" className="h-8 px-2.5 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5]" />
                                    <input type="text" placeholder="Body Fat %" className="h-8 px-2.5 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5]" />
                                    <input type="text" placeholder="PR" className="h-8 px-2.5 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#4F46E5]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--sidebar-border)] bg-[var(--bg-primary)] rounded-b-xl">
                            <button onClick={() => setIsModalOpen(false)} className="h-8 px-4 border border-[var(--sidebar-border)] rounded-md text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors">
                                Cancel
                            </button>
                            <button className="h-8 px-4 bg-[#4F46E5] rounded-md text-xs font-medium text-white hover:bg-[#4338CA] transition-colors">
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
