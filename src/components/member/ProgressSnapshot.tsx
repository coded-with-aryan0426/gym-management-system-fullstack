import React from 'react';
import { Activity, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './MemberComponents.css';

const ProgressSnapshot: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="progress-snapshot">
            <div className="progress-snapshot__header">
                <h3 className="progress-snapshot__title">
                    <Activity size={18} style={{ color: '#3b82f6' }} />
                    Progress
                </h3>
                <button
                    onClick={() => navigate('/member/progress')}
                    className="progress-snapshot__link"
                >
                    Full Report
                </button>
            </div>
            <div className="progress-snapshot__body">
                <div className="progress-snapshot__weight">
                    <div>
                        <div className="progress-snapshot__current-label">Current Weight</div>
                        <div className="progress-snapshot__current-value">78.0 kg</div>
                    </div>
                    <div className="progress-snapshot__start">
                        <div className="progress-snapshot__start-label">Start: 85kg</div>
                        <div className="progress-snapshot__change">
                            <TrendingDown size={14} /> 7.0 kg
                        </div>
                    </div>
                </div>

                <div className="progress-snapshot__bar-container">
                    <div className="progress-snapshot__bar-labels">
                        <span>Goal: 75kg</span>
                        <span>70%</span>
                    </div>
                    <div className="progress-snapshot__bar">
                        <div className="progress-snapshot__bar-fill" style={{ width: '70%' }}></div>
                    </div>
                </div>

                <div className="progress-snapshot__stats">
                    <div>
                        <div className="progress-snapshot__stat-label">Workouts</div>
                        <div className="progress-snapshot__stat-value">18</div>
                    </div>
                    <div>
                        <div className="progress-snapshot__stat-label">Kcal Burned</div>
                        <div className="progress-snapshot__stat-value">5,200</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressSnapshot;
