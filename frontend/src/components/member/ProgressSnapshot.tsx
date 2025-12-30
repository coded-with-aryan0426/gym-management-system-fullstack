import React from 'react';
import { Activity, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProgressSnapshot: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" />
                    Progress
                </h3>
                <button
                    onClick={() => navigate('/member/progress')}
                    className="text-xs text-zinc-400 hover:text-white"
                >
                    Full Report
                </button>
            </div>
            <div className="p-5 flex-1">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="text-sm text-zinc-400 mb-1">Current Weight</div>
                        <div className="text-2xl font-bold text-white">78.0 kg</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-zinc-500 mb-1">Start: 85kg</div>
                        <div className="text-sm font-medium text-green-500 flex items-center gap-1">
                            <TrendingDown size={14} /> 7.0 kg
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Goal: 75kg</span>
                        <span>70%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800">
                    <div>
                        <div className="text-xs text-zinc-500">Workouts</div>
                        <div className="text-lg font-semibold text-white">18</div>
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500">Kcal Burned</div>
                        <div className="text-lg font-semibold text-white">5,200</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressSnapshot;
