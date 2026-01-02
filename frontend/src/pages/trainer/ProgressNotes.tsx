import React, { useState } from 'react';
import { Search, Plus, Download, ChevronDown, Trash2, Edit2, MoreHorizontal, Paperclip, FileText, X } from 'lucide-react';

const ProgressNotes: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterMember, setFilterMember] = useState('All Members');
    const [filterTime, setFilterTime] = useState('This Month');

    // Mock Data
    const notes = [
        {
            id: 1,
            trainer: 'John Smith', // Assuming view is from trainer perspective, but notes are on members. Spec says "Select Member".
            member: { name: 'Sarah Wilson', avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=random' },
            date: 'March 25, 2024',
            time: '2:30 PM',
            sessionType: 'Upper Body Strength',
            content: 'Great progress on squats today! Increased weight from 135lbs to 155lbs with excellent form. Sarah is showing consistent improvement in leg strength.\nNext session: Focus on deadlift technique.',
            stats: [
                { label: 'Weight', value: '78 kg' },
                { label: 'Body Fat', value: '18%' },
                { label: 'Squat PR', value: '155 lbs' }
            ],
            attachments: [
                { name: 'Progress Photo', type: 'image' },
                { name: 'Workout Log', type: 'doc' }
            ]
        },
        {
            id: 2,
            member: { name: 'Mike Johnson', avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=random' },
            date: 'March 22, 2024',
            time: '10:00 AM',
            sessionType: 'Cardio & Endurance',
            content: 'Mike struggled a bit with the high intensity interval training today. We adjusted the rest periods to 90 seconds. Recommendation: Focus on steady state cardio twice this week to build base.',
            stats: [
                { label: 'Avg HR', value: '145 bpm' },
                { label: 'Max HR', value: '178 bpm' }
            ],
            attachments: []
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            {/* Page Header */}
            <div className="px-6 py-6 border-b border-gray-200 bg-white mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-[28px] font-bold text-gray-900 mb-1">Progress Notes</h1>
                    <p className="text-sm font-normal text-gray-500">Track and document member progress</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="h-10 px-5 bg-[#4F46E5] text-white rounded-lg text-sm font-semibold hover:bg-[#4338CA] transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Add New Note
                </button>
            </div>

            <div className="px-6 pb-8 max-w-[1400px] mx-auto w-full">
                {/* Filter & Search Bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-col lg:flex-row justify-between items-center gap-4 shadow-sm">
                    {/* Search */}
                    <div className="relative w-full lg:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            className="w-full h-[40px] pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                        <div className="relative min-w-[160px]">
                            <select
                                className="w-full h-[40px] pl-4 pr-8 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none appearance-none"
                                value={filterMember}
                                onChange={(e) => setFilterMember(e.target.value)}
                            >
                                <option>All Members</option>
                                <option>Sarah Wilson</option>
                                <option>Mike Johnson</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                        <div className="relative min-w-[140px]">
                            <select
                                className="w-full h-[40px] pl-4 pr-8 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none appearance-none"
                                value={filterTime}
                                onChange={(e) => setFilterTime(e.target.value)}
                            >
                                <option>This Month</option>
                                <option>Last Month</option>
                                <option>All Time</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                        <button className="h-[40px] px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Timeline Feed */}
                <div className="bg-white border border-gray-200 rounded-xl p-8 relative shadow-sm min-h-[400px]">
                    {/* Visual Connector Line */}
                    <div className="absolute left-[52px] top-8 bottom-8 w-[2px] bg-gray-200"></div>

                    <div className="space-y-0">
                        {notes.map(note => (
                            <div key={note.id} className="flex gap-5 py-8 first:pt-0 border-b border-gray-100 last:border-0 relative">
                                {/* Avatar */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full border-[3px] border-white shadow-[0_0_0_2px_#E5E7EB] overflow-hidden">
                                        <img src={note.member.avatar} alt={note.member.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 leading-tight">{note.member.name}</h3>
                                            <p className="text-[13px] text-gray-500 mt-1">{note.date} • {note.time}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 transition-colors">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Note Card */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-3">
                                        <span className="inline-block px-2.5 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-full text-xs font-bold mb-3">
                                            {note.sessionType}
                                        </span>
                                        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap font-normal">
                                            {note.content}
                                        </p>
                                    </div>

                                    {/* Measurements / Stats */}
                                    {note.stats.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mb-3">
                                            {note.stats.map((stat, i) => (
                                                <div key={i} className="px-3 py-2 bg-gray-100/50 border border-gray-100 rounded-md">
                                                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">{stat.label}</div>
                                                    <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Attachments */}
                                    {note.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {note.attachments.map((att, i) => (
                                                <button key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[13px] font-medium text-indigo-600 hover:bg-gray-50 transition-colors">
                                                    {att.type === 'image' ? <Paperclip size={14} /> : <FileText size={14} />}
                                                    {att.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full h-11 mt-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                        Load More Notes
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Add Progress Note</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Form fields skeleton as per spec */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Member *</label>
                                <select className="w-full h-[44px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500">
                                    <option>Select member...</option>
                                    <option>Sarah Wilson</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Type</label>
                                    <select className="w-full h-[44px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500">
                                        <option>Upper Body Strength</option>
                                        <option>Lower Body Strength</option>
                                        <option>Cardio</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                                    <input type="date" className="w-full h-[44px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes *</label>
                                <textarea className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 min-h-[120px]" placeholder="Enter session details..."></textarea>
                            </div>
                            {/* Stats Inputs Skeleton */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Measurements (Optional)</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="text" placeholder="Weight (kg)" className="h-9 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 text-sm" />
                                    <input type="text" placeholder="Body Fat (%)" className="h-9 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 text-sm" />
                                    <input type="text" placeholder="PRs" className="h-9 px-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                            <button className="px-5 py-2.5 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-[#4338CA] transition-colors shadow-sm">Save Note</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressNotes;
