import React from 'react';
import { Calendar, MapPin, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClassSession {
    id: number;
    title: string;
    time: string;
    date: string;
    location: string;
    trainerName: string;
    type: string; // 'Yoga', 'HIIT', etc.
}

interface UpcomingClassesListProps {
    classes: ClassSession[];
}

const UpcomingClassesList: React.FC<UpcomingClassesListProps> = ({ classes }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden mb-6">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold text-white">Upcoming Classes</h3>
                <button
                    onClick={() => navigate('/member/classes')}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    View All <ChevronRight size={14} />
                </button>
            </div>

            <div className="p-2">
                {classes.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="mx-auto text-zinc-600 mb-2" size={32} />
                        <p className="text-zinc-500 text-sm">No upcoming classes</p>
                        <button
                            onClick={() => navigate('/member/classes')}
                            className="mt-2 text-sm text-red-500 hover:text-red-400 font-medium"
                        >
                            Book a Class
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {classes.map((cls) => (
                            <div key={cls.id} className="p-3 hover:bg-zinc-800/50 rounded-lg transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-xl shadow-inner">
                                        {cls.type === 'Yoga' ? '🧘' :
                                            cls.type === 'HIIT' ? '🏃' :
                                                cls.type === 'Spin' ? '🚴' : '💪'}
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500 font-medium mb-0.5">{cls.date} • {cls.time}</div>
                                        <div className="font-semibold text-white">{cls.title}</div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} /> {cls.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={12} /> {cls.trainerName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors">
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingClassesList;
