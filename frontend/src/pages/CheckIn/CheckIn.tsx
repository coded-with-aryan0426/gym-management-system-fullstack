import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUserCheck, FiUserX, FiArrowLeft, FiClock, FiUsers } from 'react-icons/fi';
import { showToast } from '../../utils/showToast';
import { Avatar, Badge } from '../../components/ui';
import api from '../../services/api';
import './CheckIn.css';

interface MemberResult {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  membershipExpiry?: string;
  membershipStatus?: string;
  planName?: string;
}

const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemberResult[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Search for members
  useEffect(() => {
    const searchMembers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const members = await api.searchUsers('MEMBER', searchQuery);
        setSearchResults(members.slice(0, 5));
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle check-in
  const handleCheckIn = async (member: MemberResult) => {
    setCheckingIn(true);
    try {
      await api.checkInMember(member.userId);
      showToast(`Welcome, ${member.fullName}!`, 'success');
      setSelectedMember(null);
      setSearchQuery('');
      searchInputRef.current?.focus();
      
      // Add to recent check-ins
      setRecentCheckIns(prev => [{
        ...member,
        checkInTime: new Date()
      }, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error('Check-in failed:', err);
      showToast('Check-in failed. Please try again.', 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle member selection
  const handleSelectMember = (member: MemberResult) => {
    setSelectedMember(member);
    setSearchResults([]);
  };

  // Get status badge
  const getStatusBadge = (member: MemberResult) => {
    if (member.membershipStatus === 'Expired' || member.status === 'INACTIVE') {
      return <Badge variant="danger">Expired</Badge>;
    }
    if (member.membershipStatus === 'Expiring Soon') {
      return <Badge variant="warning">Expiring Soon</Badge>;
    }
    return <Badge variant="success">Active</Badge>;
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="check-in-page">
      {/* Header */}
      <div className="check-in-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <FiArrowLeft size={20} />
        </button>
        <div className="header-title">
          <h1>Check-in Kiosk</h1>
          <span className="gym-name">AthlonX Fitness</span>
        </div>
        <div className="header-time">
          <FiClock size={20} />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="check-in-content">
        {/* Search Section */}
        <div className="search-section">
          <div className="search-box">
            <FiSearch className="search-icon" size={24} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, phone, or member ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((member) => (
                <div
                  key={member.userId}
                  className="search-result-item"
                  onClick={() => handleSelectMember(member)}
                >
                  <Avatar name={member.fullName} size="md" />
                  <div className="result-info">
                    <span className="result-name">{member.fullName}</span>
                    <span className="result-details">
                      #{member.userId.toString().padStart(4, '0')} • {member.phone || member.email}
                    </span>
                  </div>
                  {getStatusBadge(member)}
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
            <div className="no-results">
              <FiUserX size={32} />
              <p>No members found</p>
            </div>
          )}
        </div>

        {/* Selected Member Action */}
        {selectedMember && (
          <div className="selected-member-card">
            <div className="member-card-header">
              <Avatar name={selectedMember.fullName} size="xl" />
              <div className="member-details">
                <h2>{selectedMember.fullName}</h2>
                <span className="member-id">#{selectedMember.userId.toString().padStart(4, '0')}</span>
                {getStatusBadge(selectedMember)}
              </div>
            </div>
            
            <div className="member-info-grid">
              <div className="info-item">
                <span className="label">Phone</span>
                <span className="value">{selectedMember.phone || '—'}</span>
              </div>
              <div className="info-item">
                <span className="label">Email</span>
                <span className="value">{selectedMember.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Plan</span>
                <span className="value">{selectedMember.planName || 'No Plan'}</span>
              </div>
              <div className="info-item">
                <span className="label">Expiry</span>
                <span className="value">
                  {selectedMember.membershipExpiry 
                    ? new Date(selectedMember.membershipExpiry).toLocaleDateString()
                    : '—'}
                </span>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn-check-in"
                onClick={() => handleCheckIn(selectedMember)}
                disabled={checkingIn}
              >
                <FiUserCheck size={24} />
                <span>{checkingIn ? 'Checking in...' : 'Check In'}</span>
              </button>
              <button 
                className="btn-cancel"
                onClick={() => {
                  setSelectedMember(null);
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Recent Check-ins */}
        {recentCheckIns.length > 0 && (
          <div className="recent-check-ins">
            <h3><FiUsers size={16} /> Recent Check-ins</h3>
            <div className="recent-list">
              {recentCheckIns.map((member, index) => (
                <div key={index} className="recent-item">
                  <Avatar name={member.fullName} size="sm" />
                  <span className="recent-name">{member.fullName}</span>
                  <span className="recent-time">{formatTime(member.checkInTime)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="check-in-footer">
        <p>Press <kbd>Esc</kbd> to clear • <kbd>Enter</kbd> to check in selected</p>
      </div>
    </div>
  );
};

export default CheckIn;
