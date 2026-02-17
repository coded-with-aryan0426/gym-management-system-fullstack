import React, { useState } from 'react';
import api from '../../services/api';
import '../../styles/Chat.css';

interface RequestItemProps {
    request: any;
    onRespond: () => void;
}

const RequestItem: React.FC<RequestItemProps> = ({ request, onRespond }) => {
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        setLoading(true);
        try {
            await api.chat.acceptRequest(request.requestId);
            onRespond();
        } catch (error) {
            console.error('Failed to accept request', error);
            alert('Failed to accept request');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this request?')) return;
        setLoading(true);
        try {
            await api.chat.rejectRequest(request.requestId);
            onRespond();
        } catch (error) {
            console.error('Failed to reject request', error);
            alert('Failed to reject request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="conversation-item request-item" style={{ cursor: 'default' }}>
            <div className="conversation-item__avatar">
                {request.senderAvatarId ? (
                    <div className="conversation-item__avatar-img">
                        <img src={`/api/avatars/${request.senderAvatarId}`} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    </div>
                ) : (
                    <div className="conversation-item__avatar-img">
                        {request.senderName?.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="conversation-item__content">
                <div className="conversation-item__header">
                    <span className="conversation-item__name">{request.senderName}</span>
                    <span className="conversation-item__time">{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="request-actions">
                    <button
                        className="btn-accept"
                        onClick={handleAccept}
                        disabled={loading}
                    >
                        {loading ? '...' : 'Accept'}
                    </button>
                    <button
                        className="btn-reject"
                        onClick={handleReject}
                        disabled={loading}
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestItem;
