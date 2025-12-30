import React from 'react';
import { MessageSquare, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrainerData {
    id: number;
    fullName: string;
    specialization?: string;
    nextSession?: string;
}

const MemberTrainerCard: React.FC<{ trainer: TrainerData | null }> = ({ trainer }) => {
    const navigate = useNavigate();

    if (!trainer) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-zinc-500" size={32} />
                </div>
                <h3 className="font-medium text-white mb-2">No Trainer Assigned</h3>
                <p className="text-sm text-zinc-500 mb-4">Get personalized guidance by requesting a personal trainer.</p>
                <button
                    onClick={() => navigate('/member/trainer')}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Find a Trainer
                </button>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <User size={18} className="text-red-500" />
                    My Trainer
                </h3>
            </div>
            <div className="p-5 flex-1 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg shadow-red-900/20">
                    {trainer.fullName.charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-white">{trainer.fullName}</h4>
                <p className="text-sm text-zinc-400 mb-4">{trainer.specialization || 'Fitness Coach'}</p>

                {trainer.nextSession && (
                    <div className="w-full bg-zinc-800/50 rounded-lg p-3 mb-4 flex items-center justify-center gap-2 text-sm text-zinc-300">
                        <Clock size={14} className="text-red-400" />
                        <span>Next: {trainer.nextSession}</span>
                    </div>
                )}

                <div className="mt-auto grid grid-cols-2 gap-3 w-full">
                    <button className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <MessageSquare size={16} />
                        Message
                    </button>
                    <button
                        onClick={() => navigate('/member/trainer')}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberTrainerCard;
