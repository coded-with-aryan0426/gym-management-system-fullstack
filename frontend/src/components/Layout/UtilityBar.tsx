import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UtilityBar.css';

const UtilityBar: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to search results or filter current page
            console.log('Searching:', searchQuery);
        }
    };

    return (
        <header className="utility-bar">
            {/* Search */}
            <form className="utility-bar__search" onSubmit={handleSearch}>
                <svg className="utility-bar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                    type="text"
                    className="utility-bar__search-input"
                    placeholder="Search members, classes, or staff (Cmd+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <kbd className="utility-bar__shortcut">⌘K</kbd>
            </form>

            {/* Actions */}
            <div className="utility-bar__actions">
                {/* Create Button */}
                <button className="utility-bar__create-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create
                </button>

                {/* Notifications */}
                <button className="utility-bar__icon-btn" title="Notifications">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="utility-bar__badge">3</span>
                </button>

                {/* User Avatar */}
                <button className="utility-bar__avatar" title="Profile">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                        alt="User"
                    />
                </button>
            </div>
        </header>
    );
};

export default UtilityBar;
