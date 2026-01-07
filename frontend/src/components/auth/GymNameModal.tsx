import { useState } from 'react';
import api from '../../services/api';
import './GymNameModal.css';

interface GymNameModalProps {
    userId: number;
    token: string;
    fullName: string;
    onComplete: (gymName: string) => void;
    onClose: () => void;
}

export default function GymNameModal({ userId, token, fullName, onComplete, onClose }: GymNameModalProps) {
    const [gymName, setGymName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (gymName.trim().length < 2) {
            setError('Please enter a valid gym name');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/setup-gym', {
                userId,
                gymName: gymName.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            onComplete(gymName.trim());
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create gym. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="gym-modal-overlay">
            <div className="gym-modal">
                <div className="gym-modal-header">
                    <h2>Welcome, {fullName || 'there'}! 🎉</h2>
                    <p>Let's set up your gym</p>
                </div>

                <form onSubmit={handleSubmit} className="gym-modal-form">
                    <div className="form-group">
                        <label htmlFor="gymName">What's your gym called?</label>
                        <input
                            id="gymName"
                            type="text"
                            value={gymName}
                            onChange={(e) => setGymName(e.target.value)}
                            placeholder="e.g., FitZone Gym, Iron Temple..."
                            autoFocus
                            maxLength={100}
                        />
                        <span className="hint">This will be your gym's display name</span>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || gymName.trim().length < 2}
                        className="submit-btn"
                    >
                        {isLoading ? 'Creating...' : 'Create My Gym'}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="skip-btn"
                    >
                        Skip for now
                    </button>
                </form>
            </div>
        </div>
    );
}
